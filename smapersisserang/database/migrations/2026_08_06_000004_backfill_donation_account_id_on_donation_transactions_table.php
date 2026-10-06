<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Hubungkan donation_transactions yang sudah ada ke donation_accounts
     * berdasarkan payment_method. Data lama tidak dihapus/diubah selain
     * menambahkan referensi akun. Baris tanpa akun (mis. akun belum di-seed)
     * dibiarkan null.
     */
    public function up(): void
    {
        $accounts = DB::table('donation_accounts')->pluck('id', 'name');

        $map = [
            'cash' => $accounts['Tunai Donasi'] ?? null,
            'qris' => $accounts['QRIS Donasi'] ?? null,
            'bank_transfer' => $accounts['Transfer Donasi'] ?? null,
        ];

        foreach ($map as $method => $accountId) {
            if ($accountId !== null) {
                DB::table('donation_transactions')
                    ->where('payment_method', $method)
                    ->update(['donation_account_id' => $accountId]);
            }
        }

        $fallback = $accounts['Tunai Donasi'] ?? null;
        if ($fallback !== null) {
            DB::table('donation_transactions')
                ->where(function ($query) {
                    $query->whereNull('payment_method')
                        ->orWhere('payment_method', 'other');
                })
                ->update(['donation_account_id' => $fallback]);
        }
    }

    public function down(): void
    {
        DB::table('donation_transactions')->update(['donation_account_id' => null]);
    }
};
