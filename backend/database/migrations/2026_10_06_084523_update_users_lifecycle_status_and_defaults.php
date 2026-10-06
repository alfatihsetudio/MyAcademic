<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Ensure existing 'active_student' or null values transition smoothly to 'aktif'
        DB::statement("UPDATE users SET lifecycle_status = 'aktif' WHERE lifecycle_status = 'active_student' OR lifecycle_status IS NULL");

        // 2. Modify lifecycle_status column to enum/varchar supporting 'calon_murid', 'aktif', 'alumni', 'nonaktif' with default 'calon_murid'
        DB::statement("ALTER TABLE users MODIFY COLUMN lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'calon_murid'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN lifecycle_status VARCHAR(30) NOT NULL DEFAULT 'active_student'");
    }
};
