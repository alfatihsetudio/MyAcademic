<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. File Uploads
        Schema::create('file_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('original_name');
            $table->string('stored_name');
            $table->string('file_path', 500);
            $table->string('mime_type');
            $table->bigInteger('file_size')->default(0);
            $table->bigInteger('size')->default(0);
            $table->unsignedBigInteger('uploader_id')->nullable()->index();
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
        });

        // 2. Materials
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->string('judul');
            $table->longText('konten')->nullable();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->string('file_path', 500)->nullable();
            $table->string('video_link', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->timestamps();
        });

        // 3. Assignments
        Schema::create('assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->unsignedBigInteger('target_class_id')->nullable()->index();
            $table->string('judul');
            $table->longText('deskripsi')->nullable();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->dateTime('deadline')->nullable()->index();
            $table->string('session_info', 500)->nullable();
            $table->string('video_link', 500)->nullable();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->timestamps();
        });

        // 4. Submissions
        Schema::create('submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_id')->index();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('file_id')->nullable()->index();
            $table->string('link_drive', 500)->nullable();
            $table->text('catatan')->nullable();
            $table->decimal('nilai', 5, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->timestamp('submitted_at')->useCurrent();
            $table->dateTime('graded_at')->nullable();
            $table->unsignedBigInteger('graded_by')->nullable()->index();
            $table->timestamps();
        });

        // 5. Attendance
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->index()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->date('date')->index();
            $table->date('tanggal')->nullable()->index();
            $table->string('status', 10)->default('H');
            $table->text('materi')->nullable();
            $table->text('note')->nullable();
            $table->text('keterangan')->nullable();
            $table->decimal('daily_score', 5, 2)->nullable();
            $table->unsignedBigInteger('recorded_by')->nullable()->index();
            $table->unsignedBigInteger('created_by')->nullable()->index();
            $table->timestamps();
        });

        // 6. Notifications
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('sender_id')->nullable()->index();
            $table->unsignedBigInteger('assignment_id')->nullable()->index();
            $table->string('title');
            $table->text('message');
            $table->string('link', 500)->nullable();
            $table->boolean('is_read')->default(false)->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('submissions');
        Schema::dropIfExists('assignments');
        Schema::dropIfExists('materials');
        Schema::dropIfExists('file_uploads');
    }
};
