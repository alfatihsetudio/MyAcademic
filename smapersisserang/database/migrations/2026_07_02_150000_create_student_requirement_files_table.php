<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_requirement_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_application_id')->constrained()->cascadeOnDelete();
            $table->string('requirement_key', 60);
            $table->string('requirement_label', 200);
            $table->string('file_path');
            $table->string('original_filename', 255);
            $table->string('mime_type', 100)->nullable();
            $table->integer('file_size_original')->nullable();
            $table->integer('file_size_compressed')->nullable();
            $table->string('compression_status', 30)->nullable();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();

            $table->unique(['student_application_id', 'requirement_key'], 'student_req_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_requirement_files');
    }
};
