<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_education_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->text('hadith_text')->nullable();
            $table->string('hadith_source')->nullable();
            $table->string('intro_title')->nullable();
            $table->longText('intro_text')->nullable();
            $table->json('donation_items')->nullable();
            $table->longText('invitation_text')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('whatsapp_button_text')->nullable();
            $table->text('whatsapp_message')->nullable();
            $table->string('share_button_text')->nullable();
            $table->text('share_message')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_education_settings');
    }
};
