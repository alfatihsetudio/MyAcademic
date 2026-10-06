<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->string('donor_email')->nullable()->after('donor_whatsapp');
        });
    }

    public function down(): void
    {
        Schema::table('donation_transactions', function (Blueprint $table) {
            $table->dropColumn('donor_email');
        });
    }
};
