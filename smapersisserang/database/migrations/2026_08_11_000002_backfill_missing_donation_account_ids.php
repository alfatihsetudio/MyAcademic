<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Perbaiki data hubungan donation_transactions -> donation_accounts.
     *
     * Backfill lama (2026_08_06_000004) berjalan saat tabel donation_accounts
     * masih kosong, sehingga seluruh donation_transactions.donation_account_id
     * tetap NULL. Migration ini:
     *  - memastikan tiga akun Donasi ada (mandiri dari seeder),
     *  - hanya mengisi baris yang donation_account_id IS NULL,
     *  - idempotent: database yang sudah benar tidak akan berubah apa pun.
     */
    public function up(): void
    {
        $accounts = $this->ensureDonationAccounts();

        $map = [
            'cash' => $accounts['Tunai Donasi'],
            'qris' => $accounts['QRIS Donasi'],
            'bank_transfer' => $accounts['Transfer Donasi'],
        ];

        foreach ($map as $method => $accountId) {
            DB::table('donation_transactions')
                ->where('payment_method', $method)
                ->whereNull('donation_account_id')
                ->update(['donation_account_id' => $accountId]);
        }

        $fallback = $accounts['Tunai Donasi'];
        DB::table('donation_transactions')
            ->where(function ($query) {
                $query->whereNull('payment_method')
                    ->orWhere('payment_method', 'other');
            })
            ->whereNull('donation_account_id')
            ->update(['donation_account_id' => $fallback]);
    }

    /**
     * Pastikan tiga akun Donasi tersedia; kembalikan peta nama => id.
     *
     * ID dicari berdasarkan nama + category (bukan hardcode 1/2/3). Akun
     * Keuangan tidak pernah dibuat di sini.
     */
    private function ensureDonationAccounts(): array
    {
        $names = ['Tunai Donasi', 'QRIS Donasi', 'Transfer Donasi'];
        $accounts = [];

        foreach ($names as $name) {
            $id = DB::table('donation_accounts')
                ->where('name', $name)
                ->where('category', 'donation')
                ->value('id');

            if ($id === null) {
                $id = DB::table('donation_accounts')->insertGetId([
                    'name' => $name,
                    'category' => 'donation',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $accounts[$name] = (int) $id;
        }

        return $accounts;
    }

    public function down(): void
    {
        // No-op: backfill data tidak dibalik untuk menjaga integritas histori.
        // Klasifikasi manual yang dibuat setelah migration ini tidak boleh dihapus.
    }
};
