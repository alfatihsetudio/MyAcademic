<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_settings', function (Blueprint $table) {
            $table->id();
            $table->string('school_name', 255)->default('SMA Persis Serang');
            $table->string('short_name', 100)->nullable()->default('SMA Persis');
            $table->string('tagline', 255)->nullable();
            $table->text('description')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('whatsapp_number', 30)->nullable();
            $table->string('email', 255)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('website_url', 255)->nullable();
            $table->string('instagram_url', 255)->nullable();
            $table->string('facebook_url', 255)->nullable();
            $table->string('youtube_url', 255)->nullable();
            $table->text('vision')->nullable();
            $table->text('mission')->nullable();
            $table->text('about_school')->nullable();
            $table->text('about_boarding')->nullable();
            $table->string('primary_color', 20)->nullable()->default('#0F6B3A');
            $table->string('secondary_color', 20)->nullable()->default('#D4A017');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_settings');
    }
};
