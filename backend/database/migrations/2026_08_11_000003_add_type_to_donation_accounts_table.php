<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan kolom type pada donation_accounts secara backward-compatible.
     *
     * type memetakan akun ke metode pembayaran (cash/qris/bank_transfer/other)
     * agar mapping ke FinanceIncome.payment_method tidak bergantung pada nama
     * string akun. Kolom nullable sehingga akun lama tetap valid.
     */
    public function up(): void
    {
        Schema::table('donation_accounts', function (Blueprint $table) {
            $table->string('type')->nullable()->after('category')->index();
        });

        $types = [
            ['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash'],
            ['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris'],
            ['name' => 'Transfer Donasi', 'category' => 'donation', 'type' => 'bank_transfer'],
            ['name' => 'Tunai Keuangan', 'category' => 'finance', 'type' => 'cash'],
            ['name' => 'Rekening Keuangan', 'category' => 'finance', 'type' => 'bank_transfer'],
        ];

        foreach ($types as $account) {
            DB::table('donation_accounts')
                ->where('name', $account['name'])
                ->where('category', $account['category'])
                ->whereNull('type')
                ->update(['type' => $account['type']]);
        }
    }

    public function down(): void
    {
        Schema::table('donation_accounts', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn('type');
        });
    }
};
