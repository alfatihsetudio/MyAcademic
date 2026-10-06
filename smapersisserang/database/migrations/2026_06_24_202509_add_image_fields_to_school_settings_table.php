<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->string('hero_image_path')->nullable()->after('logo_path');
            $table->string('building_image_path')->nullable()->after('hero_image_path');
            $table->string('boarding_image_path')->nullable()->after('building_image_path');
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn(['hero_image_path', 'building_image_path', 'boarding_image_path']);
        });
    }
};
