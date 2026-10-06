<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_expenses', function (Blueprint $table) {
            $table->foreignId('finance_account_id')
                ->nullable()
                ->after('payment_method')
                ->constrained('donation_accounts')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('finance_expenses', function (Blueprint $table) {
            $table->dropConstrainedForeignId('finance_account_id');
        });
    }
};
