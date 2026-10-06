<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Announcements
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->string('title');
            $table->longText('content');
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->timestamps();
        });

        // 2. Teaching Schedule
        Schema::create('teaching_schedule', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('guru_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->index()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->string('hari', 20);
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->timestamps();
        });

        // 3. Teaching Logs
        Schema::create('teaching_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('guru_id')->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->index()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->date('tanggal');
            $table->text('materi');
            $table->text('catatan')->nullable();
            $table->timestamps();
        });

        // 4. Calendar Events
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->date('event_date')->index();
            $table->enum('type', ['holiday', 'special', 'warning'])->default('special');
            $table->string('title');
            $table->text('note')->nullable();
            $table->timestamps();
        });

        // 5. Study Folders
        Schema::create('study_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('parent_id')->nullable()->index();
            $table->string('name');
            $table->timestamps();
        });

        // 6. Study Files
        Schema::create('study_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('folder_id')->nullable()->index();
            $table->string('title');
            $table->string('original_name')->nullable();
            $table->string('stored_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->bigInteger('size_bytes')->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 7. Study Goals
        Schema::create('study_goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('target_date')->nullable();
            $table->enum('status', ['pending', 'ongoing', 'in_progress', 'completed'])->default('ongoing');
            $table->timestamps();
        });

        // 8. Study Goal Logs
        Schema::create('study_goal_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('goal_id')->index();
            $table->date('log_date');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('study_goal_logs');
        Schema::dropIfExists('study_goals');
        Schema::dropIfExists('study_files');
        Schema::dropIfExists('study_folders');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('teaching_logs');
        Schema::dropIfExists('teaching_schedule');
        Schema::dropIfExists('announcements');
    }
};
