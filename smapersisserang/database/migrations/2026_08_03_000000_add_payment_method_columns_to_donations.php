<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('amount');
            $table->index('payment_method');
        });

        Schema::table('donation_outflows', function (Blueprint $table) {
            $table->string('source_payment_method')->nullable()->after('handover_method');
            $table->index('source_payment_method');
        });
    }

    public function down(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->dropIndex(['payment_method']);
            $table->dropColumn('payment_method');
        });

        Schema::table('donation_outflows', function (Blueprint $table) {
            $table->dropIndex(['source_payment_method']);
            $table->dropColumn('source_payment_method');
        });
    }
};
