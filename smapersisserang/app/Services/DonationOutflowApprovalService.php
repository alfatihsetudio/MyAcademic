<?php

namespace App\Services;

use App\Models\DonationOutflow;
use App\Models\FinanceIncome;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DonationOutflowApprovalService
{
    public function approve(DonationOutflow $outflow, User $approver): DonationOutflow
    {
        return DB::transaction(function () use ($outflow, $approver) {
            $lockedOutflow = DonationOutflow::query()
                ->lockForUpdate()
                ->findOrFail($outflow->getKey());

            if ((int) $lockedOutflow->created_by === (int) $approver->id) {
                abort(403, 'Pembuat transaksi tidak dapat memverifikasi transaksi sendiri.');
            }

            if ($lockedOutflow->status !== DonationOutflow::STATUS_PENDING) {
                throw ValidationException::withMessages([
                    'status' => 'Transaksi ini sudah diproses dan tidak dapat disetujui kembali.',
                ]);
            }

            if (FinanceIncome::where('donation_outflow_id', $lockedOutflow->id)->exists()) {
                throw ValidationException::withMessages([
                    'status' => 'Pemasukan untuk transaksi ini sudah tercatat.',
                ]);
            }

            if (! $lockedOutflow->hasPaymentMethod()) {
                throw ValidationException::withMessages([
                    'status' => 'Sumber dana belum ditentukan. Perbaiki sumber dana sebelum menyetujui.',
                ]);
            }

            $balanceService = app(DonationBalanceService::class);
            $method = $lockedOutflow->payment_method;
            $recordedForMethod = $balanceService->recordedBalanceForMethod($method);

            if ((float) $recordedForMethod < (float) $lockedOutflow->amount) {
                throw ValidationException::withMessages([
                    'status' => 'Saldo dana donasi pada metode '
                        . $lockedOutflow->payment_method_label
                        . ' tidak mencukupi untuk menyetujui penyerahan dana ini.',
                ]);
            }

            FinanceIncome::create([
                'donation_outflow_id' => $lockedOutflow->id,
                'date' => $lockedOutflow->handover_date->format('Y-m-d'),
                'income_type' => 'Transfer dari Donasi',
                'amount' => $lockedOutflow->amount,
                'payment_method' => $lockedOutflow->payment_method_label,
                'source_name' => $lockedOutflow->donation_source,
                'description' => $this->buildDescription($lockedOutflow),
                'proof_file' => $lockedOutflow->proof_file,
                'created_by' => $approver->id,
            ]);

            $lockedOutflow->update([
                'status' => DonationOutflow::STATUS_APPROVED,
                'approved_by' => $approver->id,
                'approved_at' => now(),
                'rejected_by' => null,
                'rejected_at' => null,
                'rejection_reason' => null,
            ]);

            $lockedOutflow->statusHistories()->create([
                'from_status' => DonationOutflow::STATUS_PENDING,
                'to_status' => DonationOutflow::STATUS_APPROVED,
                'changed_by' => $approver->id,
            ]);

            return $lockedOutflow->fresh(['financeIncome', 'statusHistories']);
        });
    }

    private function buildDescription(DonationOutflow $outflow): string
    {
        $lines = [
            'Donasi Keluar: '.$outflow->transaction_number,
            'Keterangan/Periode: '.($outflow->description ?: '-'),
            'Kas/Rekening Tujuan: '.$outflow->destination_account,
        ];

        if ($outflow->notes) {
            $lines[] = 'Catatan: '.$outflow->notes;
        }

        return implode("\n", $lines);
    }
}
