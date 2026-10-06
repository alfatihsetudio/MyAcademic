<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_education_settings', function (Blueprint $table) {
            $table->string('donation_qris_image')->nullable()->after('share_message');
        });
    }

    public function down(): void
    {
        Schema::table('donation_education_settings', function (Blueprint $table) {
            $table->dropColumn('donation_qris_image');
        });
    }
};
