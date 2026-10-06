<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->foreignId('donation_account_id')
                ->nullable()
                ->after('id')
                ->constrained('donation_accounts')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->dropConstrainedForeignId('donation_account_id');
        });
    }
};
