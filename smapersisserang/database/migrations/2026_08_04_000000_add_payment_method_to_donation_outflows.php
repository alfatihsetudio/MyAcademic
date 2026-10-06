<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_outflows', function (Blueprint $table) {
            $table->string('payment_method')->nullable()->after('amount');
            $table->index('payment_method');
            $table->string('handover_method')->nullable()->change();
        });

        DB::table('donation_outflows')->update([
            'payment_method' => DB::raw("COALESCE(source_payment_method, CASE WHEN handover_method = 'cash' THEN 'cash' WHEN handover_method = 'transfer' THEN 'bank_transfer' ELSE NULL END)"),
        ]);
    }

    public function down(): void
    {
        DB::table('donation_outflows')->whereNull('source_payment_method')->update([
            'source_payment_method' => DB::raw('payment_method'),
        ]);
        DB::table('donation_outflows')->whereNull('handover_method')->update([
            'handover_method' => DB::raw("CASE WHEN payment_method = 'cash' THEN 'cash' ELSE 'transfer' END"),
        ]);

        Schema::table('donation_outflows', function (Blueprint $table) {
            $table->dropIndex(['payment_method']);
            $table->dropColumn('payment_method');
            $table->string('handover_method')->nullable(false)->change();
        });
    }
};
