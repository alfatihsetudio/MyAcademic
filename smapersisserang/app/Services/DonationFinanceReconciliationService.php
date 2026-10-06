<?php

namespace App\Services;

use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\DonationTransaction;
use App\Models\DonationTransfer;
use App\Models\FinanceExpense;
use App\Models\FinanceIncome;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DonationFinanceReconciliationService
{
    public function __construct(
        protected DonationBalanceService $donationBalanceService
    ) {
    }

    /**
     * Ringkasan rekonsiliasi komprehensif antara Modul Donasi dan Modul Keuangan.
     *
     * @return array<string, mixed>
     */
    public function reconciliationSummary(?string $from = null, ?string $to = null): array
    {
        $hasDonationTx = Schema::hasTable('donation_transactions');
        $hasTransfers = Schema::hasTable('donation_transfers');
        $hasOutflows = Schema::hasTable('donation_outflows');
        $hasIncomes = Schema::hasTable('finance_incomes');
        $hasTransferCol = $hasIncomes && Schema::hasColumn('finance_incomes', 'donation_transfer_id');
        $hasOutflowCol = $hasIncomes && Schema::hasColumn('finance_incomes', 'donation_outflow_id');
        $hasExpenses = Schema::hasTable('finance_expenses');

        // 1. Data Donasi
        $totalIncomingDonation = $hasDonationTx ? $this->donationBalanceService->totalIncoming($from, $to) : 0;
        $donationRecordedBalance = $hasDonationTx ? $this->donationBalanceService->recordedBalance() : 0;
        $donationAvailableBalance = $hasDonationTx ? $this->donationBalanceService->availableBalance() : 0;

        // 2. Data Mutasi Donasi
        $pendingTransfersCount = $hasTransfers ? DonationTransfer::where('status', DonationTransfer::STATUS_PENDING)->count() : 0;
        $pendingTransfersTotal = $hasTransfers ? (int) DonationTransfer::where('status', DonationTransfer::STATUS_PENDING)
            ->when($from, fn ($q) => $q->whereDate('transfer_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('transfer_date', '<=', $to))
            ->sum('amount') : 0;

        $approvedTransfersTotal = $hasTransfers ? (int) DonationTransfer::where('status', DonationTransfer::STATUS_APPROVED)
            ->when($from, fn ($q) => $q->whereDate('transfer_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('transfer_date', '<=', $to))
            ->sum('amount') : 0;

        // Legacy Approved Outflows
        $approvedLegacyOutflowsTotal = $hasOutflows ? (int) DonationOutflow::where('status', DonationOutflow::STATUS_APPROVED)
            ->when($from, fn ($q) => $q->whereDate('handover_date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('handover_date', '<=', $to))
            ->sum('amount') : 0;

        $totalApprovedDonationOut = $approvedTransfersTotal + $approvedLegacyOutflowsTotal;

        // 3. Data Penerimaan Keuangan
        $financeDonationTransferIncome = $hasTransferCol ? (int) FinanceIncome::whereNotNull('donation_transfer_id')
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->sum('amount') : 0;

        $financeLegacyOutflowIncome = $hasOutflowCol ? (int) FinanceIncome::whereNotNull('donation_outflow_id')
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->sum('amount') : 0;

        $financeTotalDonationIncome = $financeDonationTransferIncome + $financeLegacyOutflowIncome;

        // Pemasukan Keuangan Murni (Eksternal / Non-Donasi)
        $financeExternalIncome = $hasIncomes ? (int) FinanceIncome::query()
            ->when($hasTransferCol, fn ($q) => $q->whereNull('donation_transfer_id'))
            ->when($hasOutflowCol, fn ($q) => $q->whereNull('donation_outflow_id'))
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->sum('amount') : 0;

        // Total Kas Masuk ke Rekening Keuangan (Eksternal + Transfer Internal)
        $financeTotalIncomeReceipts = $financeExternalIncome + $financeTotalDonationIncome;

        // 4. Data Pengeluaran Keuangan
        $financeTotalExpense = $hasExpenses ? (int) FinanceExpense::query()
            ->when($from, fn ($q) => $q->whereDate('date', '>=', $from))
            ->when($to, fn ($q) => $q->whereDate('date', '<=', $to))
            ->sum('amount') : 0;

        // Saldo Kas/Bank Keuangan
        $financeBalance = $financeTotalIncomeReceipts - $financeTotalExpense;

        // 5. Total Pendapatan Konsolidasi Organisasi (Murni Non-Double-Count)
        // = Donasi Masuk Valid + Pemasukan Eksternal Keuangan
        $organizationTotalRevenue = $totalIncomingDonation + $financeExternalIncome;

        // 6. Selisih Rekonsiliasi & Deteksi Anomali
        $difference = $totalApprovedDonationOut - $financeTotalDonationIncome;
        $anomalies = $this->detectAnomalies();
        $isSynchronized = ($difference === 0) && (count($anomalies) === 0);

        return [
            'status' => $isSynchronized ? 'SINKRON' : 'BERMASALAH',
            'is_synchronized' => $isSynchronized,
            'difference' => $difference,
            'total_incoming_donation' => $totalIncomingDonation,
            'donation_recorded_balance' => $donationRecordedBalance,
            'donation_available_balance' => $donationAvailableBalance,
            'pending_transfers_count' => $pendingTransfersCount,
            'pending_transfers_total' => $pendingTransfersTotal,
            'approved_transfers_total' => $approvedTransfersTotal,
            'approved_legacy_outflows_total' => $approvedLegacyOutflowsTotal,
            'total_approved_donation_out' => $totalApprovedDonationOut,
            'finance_donation_income_total' => $financeTotalDonationIncome,
            'finance_donation_transfer_income' => $financeDonationTransferIncome,
            'finance_legacy_outflow_income' => $financeLegacyOutflowIncome,
            'finance_total_donation_income' => $financeTotalDonationIncome,
            'finance_external_income_total' => $financeExternalIncome,
            'finance_total_income_receipts' => $financeTotalIncomeReceipts,
            'finance_total_expense' => $financeTotalExpense,
            'finance_balance' => $financeBalance,
            'organization_total_revenue' => $organizationTotalRevenue,
            'internal_transfer_total' => $totalApprovedDonationOut,
            'anomalies' => $anomalies,
            'anomalies_count' => count($anomalies),
        ];
    }

    /**
     * Deteksi anomali pada tingkat transaksi individual (DonationTransfer vs FinanceIncome).
     *
     * @return array<int, array{type: string, description: string, transfer_id: ?int, income_id: ?int, details: array}>
     */
    public function detectAnomalies(): array
    {
        if (! Schema::hasTable('donation_transfers') || ! Schema::hasTable('finance_incomes') || ! Schema::hasColumn('finance_incomes', 'donation_transfer_id')) {
            return [];
        }

        $anomalies = [];

        // 1. Approved DonationTransfer tanpa FinanceIncome
        $approvedTransfers = DonationTransfer::with(['financeIncome', 'fromAccount', 'toAccount'])
            ->where('status', DonationTransfer::STATUS_APPROVED)
            ->get();

        foreach ($approvedTransfers as $transfer) {
            if (! $transfer->financeIncome) {
                $anomalies[] = [
                    'type' => 'missing_income',
                    'severity' => 'error',
                    'transfer_id' => $transfer->id,
                    'income_id' => null,
                    'transfer_number' => $transfer->transfer_number,
                    'amount' => (float) $transfer->amount,
                    'description' => "Mutasi disetujui senilai Rp " . number_format($transfer->amount, 0, ',', '.') . " belum memiliki catatan Penerimaan Keuangan terkait.",
                    'details' => [
                        'transfer_number' => $transfer->transfer_number,
                        'transfer_date' => $transfer->transfer_date?->format('Y-m-d'),
                        'from_account' => $transfer->fromAccount?->name,
                        'to_account' => $transfer->toAccount?->name,
                    ],
                ];
                continue;
            }

            // 2. Mismatch nominal antara Transfer dan Income
            if ((float) $transfer->amount !== (float) $transfer->financeIncome->amount) {
                $anomalies[] = [
                    'type' => 'amount_mismatch',
                    'severity' => 'error',
                    'transfer_id' => $transfer->id,
                    'income_id' => $transfer->financeIncome->id,
                    'transfer_number' => $transfer->transfer_number,
                    'amount' => (float) $transfer->amount,
                    'description' => "Nominal Mutasi disetujui (Rp " . number_format($transfer->amount, 0, ',', '.') . ") berbeda dengan nominal Penerimaan Keuangan ID #{$transfer->financeIncome->id} (Rp " . number_format($transfer->financeIncome->amount, 0, ',', '.') . ").",
                    'details' => [
                        'transfer_number' => $transfer->transfer_number,
                        'transfer_amount' => (float) $transfer->amount,
                        'income_amount' => (float) $transfer->financeIncome->amount,
                    ],
                ];
            }

            // 3. Mismatch Akun Tujuan
            if ($transfer->to_account_id !== null && $transfer->financeIncome->finance_account_id !== null && (int) $transfer->to_account_id !== (int) $transfer->financeIncome->finance_account_id) {
                $anomalies[] = [
                    'type' => 'account_mismatch',
                    'severity' => 'warning',
                    'transfer_id' => $transfer->id,
                    'income_id' => $transfer->financeIncome->id,
                    'transfer_number' => $transfer->transfer_number,
                    'amount' => (float) $transfer->amount,
                    'description' => "Akun tujuan pada Mutasi ({$transfer->toAccount?->name}) tidak cocok dengan akun penerimaan Keuangan ID #{$transfer->financeIncome->id} ({$transfer->financeIncome->financeAccount?->name}).",
                    'details' => [
                        'transfer_number' => $transfer->transfer_number,
                        'transfer_to_account_id' => $transfer->to_account_id,
                        'income_finance_account_id' => $transfer->financeIncome->finance_account_id,
                    ],
                ];
            }
        }

        // 4. FinanceIncome dengan donation_transfer_id yang tidak berstatus approved
        $transferIncomes = FinanceIncome::with('donationTransfer')
            ->whereNotNull('donation_transfer_id')
            ->get();

        foreach ($transferIncomes as $income) {
            if (! $income->donationTransfer) {
                $anomalies[] = [
                    'type' => 'orphan_income',
                    'severity' => 'error',
                    'transfer_id' => $income->donation_transfer_id,
                    'income_id' => $income->id,
                    'transfer_number' => null,
                    'amount' => (float) $income->amount,
                    'description' => "Penerimaan Keuangan ID #{$income->id} (Rp " . number_format($income->amount, 0, ',', '.') . ") memiliki referensi mutasi ID {$income->donation_transfer_id} yang tidak ditemukan.",
                    'details' => [],
                ];
            } elseif ($income->donationTransfer->status !== DonationTransfer::STATUS_APPROVED) {
                $anomalies[] = [
                    'type' => 'invalid_transfer_status',
                    'severity' => 'error',
                    'transfer_id' => $income->donationTransfer->id,
                    'income_id' => $income->id,
                    'transfer_number' => $income->donationTransfer->transfer_number,
                    'amount' => (float) $income->amount,
                    'description' => "Penerimaan Keuangan ID #{$income->id} terhubung ke mutasi dengan status bukan disetujui ({$income->donationTransfer->status}).",
                    'details' => [
                        'transfer_number' => $income->donationTransfer->transfer_number,
                        'current_status' => $income->donationTransfer->status,
                    ],
                ];
            }
        }

        // 5. Duplikasi FinanceIncome per donation_transfer_id
        $duplicateTransfers = FinanceIncome::select('donation_transfer_id', DB::raw('COUNT(*) as total_count'))
            ->whereNotNull('donation_transfer_id')
            ->groupBy('donation_transfer_id')
            ->having('total_count', '>', 1)
            ->get();

        foreach ($duplicateTransfers as $dup) {
            $anomalies[] = [
                'type' => 'duplicate_income',
                'severity' => 'error',
                'transfer_id' => $dup->donation_transfer_id,
                'income_id' => null,
                'transfer_number' => null,
                'amount' => null,
                'description' => "Ditemukan {$dup->total_count} catatan Penerimaan Keuangan untuk 1 transaksi mutasi yang sama.",
                'details' => [
                    'count' => $dup->total_count,
                ],
            ];
        }

        return $anomalies;
    }

    /**
     * Laporan Konsolidasi Organisasi (Donasi & Keuangan Sekolah) untuk rentang periode.
     *
     * @return array<string, mixed>
     */
    public function consolidatedReport(string $startDate, string $endDate): array
    {
        $hasDonationTx = Schema::hasTable('donation_transactions');
        $hasTransfers = Schema::hasTable('donation_transfers');
        $hasIncomes = Schema::hasTable('finance_incomes');
        $hasExpenses = Schema::hasTable('finance_expenses');

        // Donasi Masuk Valid dalam periode
        $donations = $hasDonationTx ? DonationTransaction::whereIn('status', DonationBalanceService::INCOME_STATUSES)
            ->whereBetween('created_at', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->get() : collect();
        $totalDonation = (int) $donations->sum('amount');

        // Pemasukan Keuangan Murni (Eksternal) dalam periode
        $externalIncomes = $hasIncomes ? FinanceIncome::whereNull('donation_transfer_id')
            ->whereNull('donation_outflow_id')
            ->whereBetween('date', [$startDate, $endDate])
            ->get() : collect();
        $totalExternalIncome = (int) $externalIncomes->sum('amount');

        // Total Pendapatan Eksternal Organisasi (Murni)
        $totalOrganizationRevenue = $totalDonation + $totalExternalIncome;

        // Mutasi Internal (Donasi -> Keuangan) dalam periode
        $internalTransfers = $hasTransfers ? DonationTransfer::with(['fromAccount', 'toAccount'])
            ->where('status', DonationTransfer::STATUS_APPROVED)
            ->whereBetween('transfer_date', [$startDate, $endDate])
            ->get() : collect();
        $totalInternalTransfer = (int) $internalTransfers->sum('amount');

        // Pengeluaran Keuangan dalam periode
        $expenses = $hasExpenses ? FinanceExpense::whereBetween('date', [$startDate, $endDate])->get() : collect();
        $totalExpense = (int) $expenses->sum('amount');

        // Surplus / Defisit Bersih Organisasi (Pendapatan Murni - Pengeluaran)
        $netOperatingBalance = $totalOrganizationRevenue - $totalExpense;

        return [
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_donation' => $totalDonation,
            'donations_count' => $donations->count(),
            'total_external_income' => $totalExternalIncome,
            'external_incomes_count' => $externalIncomes->count(),
            'total_organization_revenue' => $totalOrganizationRevenue,
            'total_internal_transfer' => $totalInternalTransfer,
            'internal_transfers_count' => $internalTransfers->count(),
            'total_expense' => $totalExpense,
            'expenses_count' => $expenses->count(),
            'net_operating_balance' => $netOperatingBalance,
        ];
    }
}
