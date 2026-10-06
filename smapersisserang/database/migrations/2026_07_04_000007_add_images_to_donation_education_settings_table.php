<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_education_settings', function (Blueprint $table) {
            $table->string('hero_image')->nullable()->after('hero_subtitle');
            $table->string('section_image')->nullable()->after('intro_text');
        });
    }

    public function down(): void
    {
        Schema::table('donation_education_settings', function (Blueprint $table) {
            $table->dropColumn(['hero_image', 'section_image']);
        });
    }
};
