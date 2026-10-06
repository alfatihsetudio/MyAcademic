<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tabel Offline Tasks
        Schema::create('tabel_offline_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->unsignedBigInteger('owner_id')->index();
            $table->foreignId('class_id')->nullable()->index()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->index()->constrained('subjects')->cascadeOnDelete();
            $table->string('title');
            $table->string('nama_tugas')->nullable();
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->string('photo')->nullable();
            $table->string('video_url', 500)->nullable();
            $table->string('other_url', 500)->nullable();
            $table->date('tanggal')->nullable();
            $table->timestamps();
        });

        // 2. Tabel Offline Scores
        Schema::create('tabel_offline_scores', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('task_id')->index();
            $table->foreignId('student_id')->index()->constrained('users')->cascadeOnDelete();
            $table->decimal('score', 5, 2)->nullable();
            $table->decimal('nilai', 5, 2)->nullable();
            $table->text('note')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
            $table->unique(['task_id', 'student_id']);
        });

        // 3. Table Templates (Excel)
        Schema::create('table_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->unsignedBigInteger('owner_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('visibility', 20)->default('private');
            $table->longText('columns_json')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Table Documents (Excel)
        Schema::create('table_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->unsignedBigInteger('template_id')->nullable()->index();
            $table->unsignedBigInteger('owner_id')->index();
            $table->string('name');
            $table->text('description')->nullable();
            $table->longText('data_json')->nullable();
            $table->timestamps();
        });

        // 5. Assignment Files (pivot if needed)
        Schema::create('assignment_files', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('assignment_id')->index();
            $table->unsignedBigInteger('file_id')->index();
            $table->string('file_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assignment_files');
        Schema::dropIfExists('table_documents');
        Schema::dropIfExists('table_templates');
        Schema::dropIfExists('tabel_offline_scores');
        Schema::dropIfExists('tabel_offline_tasks');
    }
};
