<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Hubungkan FinanceIncome hasil Mutasi Dana Donasi ke DonationTransfer.
     *
     * Kolom nullable + unique: satu transfer hanya menghasilkan satu Pemasukan.
     * donation_outflow_id (legacy Donasi Keluar) tidak diubah.
     */
    public function up(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->foreignId('donation_transfer_id')
                ->nullable()
                ->unique()
                ->after('donation_outflow_id')
                ->constrained('donation_transfers')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('donation_transfer_id');
        });
    }
};
