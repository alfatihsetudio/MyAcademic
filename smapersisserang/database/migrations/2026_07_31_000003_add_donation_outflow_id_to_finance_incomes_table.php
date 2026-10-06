<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->foreignId('donation_outflow_id')
                ->nullable()
                ->unique()
                ->after('id')
                ->constrained('donation_outflows')
                ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('finance_incomes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('donation_outflow_id');
        });
    }
};
