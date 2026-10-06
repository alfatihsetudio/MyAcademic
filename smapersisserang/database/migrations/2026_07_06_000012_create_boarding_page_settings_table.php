<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('boarding_page_settings', function (Blueprint $table) {
            $table->id();
            $table->string('section_label')->nullable();
            $table->string('section_heading')->nullable();
            $table->text('section_subtitle')->nullable();
            $table->string('schedule_heading')->nullable();
            $table->text('schedule_subtitle')->nullable();
            $table->text('schedule_note')->nullable();
            $table->string('focus_heading')->nullable();
            $table->text('focus_subtitle')->nullable();
            $table->string('why_heading')->nullable();
            $table->text('why_subtitle')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('boarding_page_settings');
    }
};
