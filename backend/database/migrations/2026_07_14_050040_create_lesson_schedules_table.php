<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lesson_schedules')) {
            Schema::create('lesson_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->restrictOnDelete();
            $table->enum('semester', ['ganjil', 'genap']);
            $table->foreignId('school_class_id')->constrained()->restrictOnDelete();
            $table->enum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']);
            $table->foreignId('lesson_schedule_setting_id')->constrained()->restrictOnDelete();
            $table->foreignId('school_subject_id')->constrained()->restrictOnDelete();
            $table->foreignId('teacher_id')->constrained()->restrictOnDelete();
            $table->string('room')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['academic_year_id', 'semester', 'school_class_id', 'day', 'lesson_schedule_setting_id'], 'lesson_schedule_unique_slot');
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_schedules');
    }
};
