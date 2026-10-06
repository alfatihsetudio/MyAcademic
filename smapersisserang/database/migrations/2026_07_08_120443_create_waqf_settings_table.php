<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waqf_settings', function (Blueprint $table) {
            $table->id();
            $table->string('hero_title')->nullable();
            $table->text('hero_subtitle')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('intro_title')->nullable();
            $table->longText('intro_text')->nullable();
            $table->longText('waqf_purpose_text')->nullable();
            $table->longText('ikrar_text')->nullable();
            $table->string('qris_image')->nullable();
            $table->text('qris_payload')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->text('whatsapp_message_template')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waqf_settings');
    }
};
