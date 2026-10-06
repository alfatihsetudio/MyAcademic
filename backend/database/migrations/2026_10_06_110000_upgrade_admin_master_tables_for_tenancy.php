<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. academic_years: add school_id, semester, dates
        Schema::table('academic_years', function (Blueprint $table) {
            if (!Schema::hasColumn('academic_years', 'school_id')) {
                $table->foreignId('school_id')->nullable()->after('id')->constrained('schools')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('academic_years', 'semester')) {
                $table->string('semester', 20)->default('Ganjil')->after('name');
            }
            if (!Schema::hasColumn('academic_years', 'start_date')) {
                $table->date('start_date')->nullable()->after('semester');
            }
            if (!Schema::hasColumn('academic_years', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
            if (!Schema::hasColumn('academic_years', 'description')) {
                $table->text('description')->nullable()->after('end_date');
            }
        });

        // 2. semesters: add school_id, academic_year_id, dates
        Schema::table('semesters', function (Blueprint $table) {
            if (!Schema::hasColumn('semesters', 'school_id')) {
                $table->foreignId('school_id')->nullable()->after('id')->constrained('schools')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('semesters', 'academic_year_id')) {
                $table->foreignId('academic_year_id')->nullable()->after('school_id')->constrained('academic_years')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('semesters', 'start_date')) {
                $table->date('start_date')->nullable()->after('name');
            }
            if (!Schema::hasColumn('semesters', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });

        // 3. school_classes: add school_id, academic_year_id, homeroom_teacher_id, capacity, code
        Schema::table('school_classes', function (Blueprint $table) {
            if (!Schema::hasColumn('school_classes', 'school_id')) {
                $table->foreignId('school_id')->nullable()->after('id')->constrained('schools')->cascadeOnDelete();
            }
            if (!Schema::hasColumn('school_classes', 'academic_year_id')) {
                $table->foreignId('academic_year_id')->nullable()->after('school_id')->constrained('academic_years')->nullOnDelete();
            }
            if (!Schema::hasColumn('school_classes', 'homeroom_teacher_id')) {
                $table->foreignId('homeroom_teacher_id')->nullable()->after('academic_year_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('school_classes', 'capacity')) {
                $table->integer('capacity')->default(36)->after('group');
            }
            if (!Schema::hasColumn('school_classes', 'code')) {
                $table->string('code', 50)->nullable()->after('name');
            }
            if (!Schema::hasColumn('school_classes', 'room_name')) {
                $table->string('room_name', 100)->nullable()->after('code');
            }
        });

        // 4. subjects: add code, category, is_active, sort_order
        Schema::table('subjects', function (Blueprint $table) {
            if (!Schema::hasColumn('subjects', 'code')) {
                $table->string('code', 50)->nullable()->after('nama_mapel');
            }
            if (!Schema::hasColumn('subjects', 'category')) {
                $table->string('category', 50)->default('Wajib')->after('code');
            }
            if (!Schema::hasColumn('subjects', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('deskripsi');
            }
            if (!Schema::hasColumn('subjects', 'sort_order')) {
                $table->integer('sort_order')->default(0)->after('is_active');
            }
        });
    }

    public function down(): void
    {
        // down logic
    }
};
