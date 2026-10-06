<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->string('basmallah_image_path')->nullable()->after('default_letter_basmallah_text');
            $table->string('closing_dua_image_path')->nullable()->after('default_letter_closing_dua_text');
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn(['basmallah_image_path', 'closing_dua_image_path']);
        });
    }
};
