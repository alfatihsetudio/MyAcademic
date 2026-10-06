<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            if (!Schema::hasColumn('classes', 'academic_year_id')) {
                $table->foreignId('academic_year_id')->nullable()->after('school_id')->constrained('academic_years')->nullOnDelete();
            }
            if (!Schema::hasColumn('classes', 'capacity')) {
                $table->integer('capacity')->default(36)->after('jurusan');
            }
            if (!Schema::hasColumn('classes', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('capacity');
            }
        });
    }

    public function down(): void
    {
        //
    }
};
