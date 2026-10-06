<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lesson_schedules', function (Blueprint $table) {
            $table->enum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'])->change();
            $table->unsignedBigInteger('teacher_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::table('lesson_schedules')->where('day', 'Sabtu')->doesntExist()) {
            Schema::table('lesson_schedules', function (Blueprint $table) {
                $table->enum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'])->change();
            });
        }

        if (DB::table('lesson_schedules')->whereNull('teacher_id')->doesntExist()) {
            Schema::table('lesson_schedules', function (Blueprint $table) {
                $table->unsignedBigInteger('teacher_id')->nullable(false)->change();
            });
        }
    }
};
