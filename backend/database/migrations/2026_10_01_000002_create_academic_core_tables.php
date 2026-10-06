<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Classes
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->string('nama_kelas');
            $table->string('level')->nullable();
            $table->string('jurusan')->nullable();
            $table->text('deskripsi')->nullable();
            $table->foreignId('guru_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->string('walimurid')->nullable();
            $table->string('no_telpon_wali')->nullable();
            $table->string('nama_km')->nullable();
            $table->string('no_telpon_km')->nullable();
            $table->timestamps();
        });

        // 2. Class User (pivot)
        Schema::create('class_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->index()->constrained('classes')->cascadeOnDelete();
            $table->foreignId('user_id')->index()->constrained('users')->cascadeOnDelete();
            $table->timestamp('enrolled_at')->useCurrent();
            $table->unique(['class_id', 'user_id']);
        });

        // 3. Subjects
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->foreignId('class_id')->nullable()->index()->constrained('classes')->cascadeOnDelete();
            $table->string('nama_mapel');
            $table->foreignId('guru_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->string('class_level')->nullable();
            $table->string('jurusan')->nullable();
            $table->text('deskripsi')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('class_user');
        Schema::dropIfExists('classes');
    }
};
