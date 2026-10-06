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
            $table->foreignId('finance_account_id')
                ->nullable()
                ->after('donation_transfer_id')
                ->constrained('donation_accounts')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('finance_account_id');
        });
    }
};
