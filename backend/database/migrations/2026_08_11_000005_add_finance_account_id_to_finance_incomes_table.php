<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambahkan finance_account_id pada finance_incomes.
     *
     * Menandai akun Keuangan (donation_accounts.category = finance) tempat uang
     * diterima. Nullable agar data lama tetap valid; akun yang pernah dipakai
     * tidak boleh dihapus (restrictOnDelete) — cukup dinonaktifkan via
     * is_active = false.
     */
    public function up(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $column = $table->foreignId('finance_account_id')
                ->nullable()
                ->constrained('donation_accounts')
                ->restrictOnDelete();
            if (Schema::hasColumn('finance_incomes', 'donation_transfer_id')) {
                $column->after('donation_transfer_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('finance_account_id');
        });
    }
};
