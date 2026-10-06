<?php

namespace App\Services;

use App\Enums\DonationPaymentMethod;
use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\DonationTransaction;
use App\Models\DonationTransfer;
use App\Models\FinanceExpense;
use App\Models\FinanceIncome;
use Illuminate\Support\Facades\Schema;

class DonationBalanceService
{
    /**
     * Status donation_transactions yang dianggap sebagai dana masuk yang valid/lunas.
     *
     * Midtrans menggunakan 'settlement' (dan kadang 'capture') untuk pembayaran
     * berhasil, sedangkan penerimaan manual memakai 'paid'. Status lain seperti
     * pending/cancelled/expired/failed tidak dihitung.
     */
    public const INCOME_STATUSES = ['paid', 'settlement', 'capture'];

    public const UNCLASSIFIED = 'unclassified';

    public function totalIncoming(?string $from = null, ?string $to = null): int
    {
        return (int) DonationTransaction::query()
            ->whereIn('status', self::INCOME_STATUSES)
            ->when($from, fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->sum('amount');
    }

    public function totalApprovedOutflow(): int
    {
        return (int) DonationOutflow::query()
            ->where('status', DonationOutflow::STATUS_APPROVED)
            ->sum('amount');
    }

    public function totalPendingOutflow(): int
    {
        return (int) DonationOutflow::query()
            ->where('status', DonationOutflow::STATUS_PENDING)
            ->sum('amount');
    }

    public function pendingCount(): int
    {
        return DonationOutflow::query()
            ->where('status', DonationOutflow::STATUS_PENDING)
            ->count();
    }

    /**
     * Total Mutasi Dana approved dari akun kategori Donasi ke akun kategori
     * Keuangan. Dana ini sudah lepas dari pengelolaan bagian Donasi sehingga
     * dikurangkan dari saldo donasi global.
     */
    public function approvedDonationToFinanceTransferAmount(): int
    {
        return $this->donationToFinanceTransferAmount(DonationTransfer::STATUS_APPROVED);
    }

    /**
     * Total Mutasi Dana pending dari akun kategori Donasi ke akun kategori
     * Keuangan. Nominal ini mereservasi saldo donasi yang belum disetujui.
     */
    public function pendingDonationToFinanceTransferAmount(): int
    {
        return $this->donationToFinanceTransferAmount(DonationTransfer::STATUS_PENDING);
    }

    private function donationToFinanceTransferAmount(string $status): int
    {
        if (! Schema::hasTable('donation_transfers')) {
            return 0;
        }

        return (int) DonationTransfer::query()
            ->join('donation_accounts as from_acc', 'from_acc.id', '=', 'donation_transfers.from_account_id')
            ->join('donation_accounts as to_acc', 'to_acc.id', '=', 'donation_transfers.to_account_id')
            ->where('donation_transfers.status', $status)
            ->where('from_acc.category', DonationAccount::CATEGORY_DONATION)
            ->where('to_acc.category', DonationAccount::CATEGORY_FINANCE)
            ->sum('donation_transfers.amount');
    }

    /**
     * Saldo Donasi Aktif: donasi masuk valid dikurangi approved Donasi Keluar
     * (legacy) dan approved Mutasi Dana Donasi -> Keuangan.
     */
    public function recordedBalance(): int
    {
        return $this->totalIncoming()
            - $this->totalApprovedOutflow()
            - $this->approvedDonationToFinanceTransferAmount();
    }

    public function availableBalance(): int
    {
        return $this->recordedBalance()
            - $this->totalPendingOutflow()
            - $this->pendingDonationToFinanceTransferAmount();
    }

    /**
     * Saldo dana masuk (valid) per akun donasi.
     *
     * Kunci = donation_account_id, nilai = total dana masuk valid.
     * Baris tanpa akun dikelompokkan ke kunci 0.
     */
    public function incomingPerAccount(): array
    {
        $rows = DonationTransaction::query()
            ->selectRaw('COALESCE(donation_account_id, 0) as account_id, SUM(amount) as total')
            ->whereIn('status', self::INCOME_STATUSES)
            ->groupBy('account_id')
            ->get();

        $result = [];

        foreach ($rows as $row) {
            $result[(int) $row->account_id] = (int) $row->total;
        }

        return $result;
    }

    /**
     * Saldo tercatat satu akun donasi (dari dana masuk valid).
     */
    public function accountBalance(int $accountId): int
    {
        return (int) DonationTransaction::query()
            ->where('donation_account_id', $accountId)
            ->whereIn('status', self::INCOME_STATUSES)
            ->sum('amount');
    }

    /**
     * Saldo bersih per akun dana (konsep akun dana).
     *
     * Saldo akun =
     *   Donasi Masuk valid (donation_transactions)
     *   + Mutasi Dana masuk approved (to_account_id)
     *   - Mutasi Dana keluar approved (from_account_id)
     *
     * Kunci = donation_account_id, nilai = saldo bersih. Baris tanpa akun
     * dikelompokkan ke kunci 0. Mutasi pending/rejected tidak dihitung.
     */
    public function balancesByAccount(): array
    {
        $result = $this->incomingPerAccount();

        $incoming = DonationTransfer::query()
            ->selectRaw('to_account_id as account_id, SUM(amount) as total')
            ->where('status', DonationTransfer::STATUS_APPROVED)
            ->groupBy('to_account_id')
            ->get();

        $outgoing = DonationTransfer::query()
            ->selectRaw('from_account_id as account_id, SUM(amount) as total')
            ->where('status', DonationTransfer::STATUS_APPROVED)
            ->groupBy('from_account_id')
            ->get();

        foreach ($incoming as $row) {
            $result[$row->account_id] = ($result[$row->account_id] ?? 0) + (int) $row->total;
        }

        foreach ($outgoing as $row) {
            $result[$row->account_id] = ($result[$row->account_id] ?? 0) - (int) $row->total;
        }

        return $result;
    }

    /**
     * Saldo bersih satu akun dana (konsep akun dana).
     */
    public function balanceByAccount(int $accountId): int
    {
        return $this->balancesByAccount()[$accountId] ?? 0;
    }

    /**
     * Saldo Donasi Aktif berdasarkan akun kategori Donasi.
     *
     * = sum saldo seluruh akun category=donation (incoming + transfer masuk -
     * transfer keluar). Akun category=finance tidak dihitung karena dana pada
     * akun itu sudah menjadi tanggung jawab bagian Keuangan.
     */
    public function activeDonationBalance(): int
    {
        $balances = $this->balancesByAccount();
        $accountIds = DonationAccount::donation()->pluck('id')->all();

        $sum = 0;

        foreach ($accountIds as $accountId) {
            $sum += $balances[$accountId] ?? 0;
        }

        return $sum;
    }

    /**
     * Saldo per akun Keuangan:
     * = FinanceIncome pada finance_account_id - FinanceExpense pada finance_account_id.
     */
    public function financeBalanceByAccount(int $accountId): int
    {
        $income = (int) FinanceIncome::where('finance_account_id', $accountId)->sum('amount');
        $expense = (int) FinanceExpense::where('finance_account_id', $accountId)->sum('amount');

        return $income - $expense;
    }

    /**
     * Saldo tersedia akun Keuangan untuk sebuah Pengeluaran (nilai baru).
     *
     * Menggunakan konsep exclude current expense berdasarkan ID: pengeluaran
     * yang sedang diedit (dan sudah tercatat pada akun tersebut) dikeluarkan
     * dari sisi pengeluaran agar tidak double-count saat menghitung ulang.
     */
    public function financeBalanceByAccountExcludingExpense(int $accountId, int $expenseId): int
    {
        $income = (int) FinanceIncome::where('finance_account_id', $accountId)->sum('amount');
        $expense = (int) FinanceExpense::where('finance_account_id', $accountId)
            ->where('id', '!=', $expenseId)
            ->sum('amount');

        return $income - $expense;
    }

    /**
     * Ringkasan saldo seluruh akun Keuangan (donation_accounts.category=finance).
     */
    public function financeAccountBalances(): array
    {
        $balances = [];

        foreach (DonationAccount::finance()->get() as $account) {
            $balances[$account->id] = $this->financeBalanceByAccount((int) $account->id);
        }

        return $balances;
    }

    /**
     * Total mutasi dana keluar (dari satu akun) yang masih berstatus pending.
     *
     * Digunakan untuk menghitung saldo tersedia sebuah akun sebelum membuat
     * mutasi baru, agar pending tidak bisa digunakan dua kali.
     */
    public function pendingTransferAmountForAccount(int $accountId): int
    {
        return (int) DonationTransfer::query()
            ->where('from_account_id', $accountId)
            ->where('status', DonationTransfer::STATUS_PENDING)
            ->sum('amount');
    }

    /**
     * Saldo tersedia satu akun dana untuk mutasi keluar.
     *
     * Saldo tersedia = saldo bersih akun - total mutasi keluar yang masih pending.
     */
    public function availableBalanceForAccount(int $accountId): int
    {
        return $this->balanceByAccount($accountId) - $this->pendingTransferAmountForAccount($accountId);
    }

    /**
     * Saldo tersedia untuk menyetujui sebuah mutasi pending tertentu.
     *
     * availableBalanceForAccount() menyertakan seluruh pending outgoing —
     * termasuk transaksi yang sedang diapprove — sehingga transaksi yang valid
     * bisa ditolak oleh reservasi nominalnya sendiri. Metode ini mengecualikan
     * transaksi yang sedang diproses berdasarkan ID (bukan nominal) dari
     * reservasi pending, sementara pending lain tetap dihitung agar
     * over-allocation tetap dicegah. Aman jika ada beberapa pending dengan
     * nominal yang sama.
     */
    public function availableBalanceForApproval(int $accountId, int $transferId): int
    {
        $pendingOthers = (int) DonationTransfer::query()
            ->where('from_account_id', $accountId)
            ->where('status', DonationTransfer::STATUS_PENDING)
            ->where('id', '!=', $transferId)
            ->sum('amount');

        return $this->balanceByAccount($accountId) - $pendingOthers;
    }

    /**
     * Data ringkasan untuk kartu saldo pada halaman Donasi.
     */
    public function summary(?string $from = null, ?string $to = null): array
    {
        return [
            'recorded_balance' => $this->recordedBalance(),
            'available_balance' => $this->availableBalance(),
            'total_incoming' => $this->totalIncoming($from, $to),
            'total_approved_outflow' => $this->totalApprovedOutflow(),
            'total_pending_outflow' => $this->totalPendingOutflow(),
            'pending_count' => $this->pendingCount(),
            'by_payment_method' => $this->summaryByPaymentMethod(),
        ];
    }

    /**
     * Ringkasan saldo per metode pembayaran (Donasi Masuk vs Donasi Keluar).
     *
     * - record_balance = incoming valid - approved outflow (per metode)
     * - available_balance = recorded_balance - pending outflow (per metode)
     *
     * Transaksi dengan payment_method NULL dikelompokkan
     * ke dalam 'unclassified' (label tampilan 'Belum Ditentukan').
     */
    public function summaryByPaymentMethod(?string $from = null, ?string $to = null): array
    {
        $methods = DonationPaymentMethod::values();

        $incoming = $this->incomingPerMethod($methods, $from, $to);
        $approved = $this->outflowPerMethod($methods, DonationOutflow::STATUS_APPROVED);
        $pending = $this->outflowPerMethod($methods, DonationOutflow::STATUS_PENDING);
        $approvedTransfer = $this->transferOutPerMethod($methods, DonationTransfer::STATUS_APPROVED);
        $pendingTransfer = $this->transferOutPerMethod($methods, DonationTransfer::STATUS_PENDING);

        $result = [];

        foreach ($methods as $method) {
            $recorded = $incoming[$method] - $approved[$method] - $approvedTransfer[$method];
            $result[$method] = [
                'key' => $method,
                'label' => DonationPaymentMethod::labelOf($method),
                'incoming' => $incoming[$method],
                'approved_outflow' => $approved[$method],
                'pending_outflow' => $pending[$method],
                'approved_transfer_out' => $approvedTransfer[$method],
                'pending_transfer_out' => $pendingTransfer[$method],
                'recorded_balance' => $recorded,
                'available_balance' => $recorded - $pending[$method] - $pendingTransfer[$method],
            ];
        }

        $result[self::UNCLASSIFIED] = [
            'key' => self::UNCLASSIFIED,
            'label' => 'Belum Ditentukan',
            'incoming' => $incoming[self::UNCLASSIFIED],
            'approved_outflow' => $approved[self::UNCLASSIFIED],
            'pending_outflow' => $pending[self::UNCLASSIFIED],
            'approved_transfer_out' => $approvedTransfer[self::UNCLASSIFIED],
            'pending_transfer_out' => $pendingTransfer[self::UNCLASSIFIED],
            'recorded_balance' => $incoming[self::UNCLASSIFIED] - $approved[self::UNCLASSIFIED] - $approvedTransfer[self::UNCLASSIFIED],
            'available_balance' => $incoming[self::UNCLASSIFIED]
                - $approved[self::UNCLASSIFIED]
                - $approvedTransfer[self::UNCLASSIFIED]
                - $pending[self::UNCLASSIFIED]
                - $pendingTransfer[self::UNCLASSIFIED],
        ];

        return $result;
    }

    /**
     * Saldo tersedia (available) untuk satu metode tertentu.
     */
    public function availableBalanceForMethod(string $method): int
    {
        $summary = $this->summaryByPaymentMethod();

        return $summary[$method]['available_balance'] ?? 0;
    }

    /**
     * Saldo tercatat (recorded) untuk satu metode tertentu.
     */
    public function recordedBalanceForMethod(string $method): int
    {
        $summary = $this->summaryByPaymentMethod();

        return $summary[$method]['recorded_balance'] ?? 0;
    }

    /**
     * Jumlah donasi masuk valid per metode, termasuk kelompok 'unclassified'.
     */
    private function incomingPerMethod(array $methods, ?string $from, ?string $to): array
    {
        $totals = array_fill_keys([...$methods, self::UNCLASSIFIED], 0);

        $rows = DonationTransaction::query()
            ->selectRaw('COALESCE(payment_method, ?) as method, SUM(amount) as total', [self::UNCLASSIFIED])
            ->whereIn('status', self::INCOME_STATUSES)
            ->when($from, fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to, fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->groupBy('method')
            ->get();

        foreach ($rows as $row) {
            $key = in_array($row->method, $methods, true) ? $row->method : self::UNCLASSIFIED;
            $totals[$key] += (int) $row->total;
        }

        return $totals;
    }

    /**
     * Jumlah donasi keluar per metode (approved/pending), termasuk 'unclassified'.
     */
    private function outflowPerMethod(array $methods, string $status): array
    {
        $totals = array_fill_keys([...$methods, self::UNCLASSIFIED], 0);

        $rows = DonationOutflow::query()
            ->selectRaw('COALESCE(payment_method, ?) as method, SUM(amount) as total', [self::UNCLASSIFIED])
            ->where('status', $status)
            ->groupBy('method')
            ->get();

        foreach ($rows as $row) {
            $key = in_array($row->method, $methods, true) ? $row->method : self::UNCLASSIFIED;
            $totals[$key] += (int) $row->total;
        }

        return $totals;
    }

    /**
     * Jumlah Mutasi Dana per metode (approved/pending) dari akun Donasi ke
     * akun Keuangan. Metode diambil dari kolom type akun sumber (cash/qris/
     * bank_transfer/other); akun tanpa type masuk ke 'unclassified'.
     */
    private function transferOutPerMethod(array $methods, string $status): array
    {
        $totals = array_fill_keys([...$methods, self::UNCLASSIFIED], 0);

        if (! Schema::hasTable('donation_transfers')) {
            return $totals;
        }

        $rows = DonationTransfer::query()
            ->join('donation_accounts as from_acc', 'from_acc.id', '=', 'donation_transfers.from_account_id')
            ->join('donation_accounts as to_acc', 'to_acc.id', '=', 'donation_transfers.to_account_id')
            ->selectRaw('COALESCE(from_acc.type, ?) as method, SUM(donation_transfers.amount) as total', [self::UNCLASSIFIED])
            ->where('donation_transfers.status', $status)
            ->where('from_acc.category', DonationAccount::CATEGORY_DONATION)
            ->where('to_acc.category', DonationAccount::CATEGORY_FINANCE)
            ->groupBy('method')
            ->get();

        foreach ($rows as $row) {
            $key = in_array($row->method, $methods, true) ? $row->method : self::UNCLASSIFIED;
            $totals[$key] += (int) $row->total;
        }

        return $totals;
    }
}
