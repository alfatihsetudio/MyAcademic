<?php

namespace App\Services;

use App\Models\DonationTransfer;
use App\Models\FinanceIncome;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DonationTransferApprovalService
{
    public function approve(DonationTransfer $transfer, User $approver): DonationTransfer
    {
        return DB::transaction(function () use ($transfer, $approver) {
            $locked = DonationTransfer::query()
                ->lockForUpdate()
                ->with(['fromAccount', 'toAccount'])
                ->findOrFail($transfer->getKey());

            if ((int) $locked->requested_by === (int) $approver->id) {
                abort(403, 'Pembuat transaksi tidak dapat memverifikasi transaksi sendiri.');
            }

            if (! $locked->isPending()) {
                throw ValidationException::withMessages([
                    'status' => 'Transaksi ini sudah diproses dan tidak dapat disetujui kembali.',
                ]);
            }

            if (FinanceIncome::where('donation_transfer_id', $locked->id)->exists()) {
                throw ValidationException::withMessages([
                    'status' => 'Pemasukan untuk transaksi ini sudah tercatat.',
                ]);
            }

            $from = $locked->fromAccount;
            $balanceService = app(DonationBalanceService::class);
            $available = $balanceService->availableBalanceForApproval((int) $from->id, (int) $locked->getKey());

            if ((float) $available < (float) $locked->amount) {
                throw ValidationException::withMessages([
                    'status' => 'Saldo akun '.$from->name
                        .' tidak mencukupi untuk menyetujui mutasi ini (saldo tersedia Rp'
                        .number_format($available, 0, ',', '.').').',
                ]);
            }

            FinanceIncome::create([
                'donation_transfer_id' => $locked->id,
                'finance_account_id' => $locked->to_account_id,
                'date' => $locked->transfer_date->format('Y-m-d'),
                'income_type' => 'Transfer dari Donasi',
                'amount' => $locked->amount,
                'payment_method' => $locked->toAccount->financePaymentMethodLabel(),
                'source_name' => $from->name,
                'description' => $this->buildDescription($locked),
                'proof_file' => $locked->proof_file,
                'created_by' => $approver->id,
            ]);

            $locked->update([
                'status' => DonationTransfer::STATUS_APPROVED,
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'rejected_by' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            return $locked->fresh(['fromAccount', 'toAccount', 'approver', 'rejector', 'financeIncome']);
        });
    }

    private function buildDescription(DonationTransfer $transfer): string
    {
        $lines = [
            'Mutasi Dana: '.$transfer->transfer_number,
            'Dari akun: '.$transfer->fromAccount?->name ?? '-',
            'Ke akun: '.$transfer->toAccount?->name ?? '-',
        ];

        if ($transfer->note) {
            $lines[] = 'Catatan: '.$transfer->note;
        }

        return implode("\n", $lines);
    }
}
