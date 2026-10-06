<?php

namespace Database\Migrations;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 3. student_applications table
        Schema::create('student_applications', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number', 20)->unique(); // "PPDB-2026-0001"
            $table->foreignId('admission_year_id')->constrained();
            $table->foreignId('admission_program_id')->constrained();
            $table->enum('status', ['baru_daftar', 'menunggu_verifikasi', 'data_kurang', 'terverifikasi', 'wawancara', 'lulus', 'cadangan', 'tidak_lulus', 'diterima', 'mengundurkan_diri'])
                ->default('baru_daftar');
            $table->string('student_name');
            $table->enum('gender', ['laki_laki', 'perempuan']);
            $table->string('birth_place');
            $table->date('birth_date');
            $table->string('previous_school');
            $table->text('address');
            $table->string('father_name');
            $table->string('mother_name');
            $table->string('parent_whatsapp');
            $table->string('parent_job')->nullable();
            $table->boolean('boarding_ready');
            $table->enum('quran_reading_ability', ['belum_bisa', 'terbata_bata', 'lancar', 'baik'])->nullable();
            $table->text('health_notes')->nullable();
            $table->text('motivation');
            $table->text('admin_notes')->nullable();
            $table->foreignId('verified_by')->nullable()->constrained('users');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_applications');
    }
};