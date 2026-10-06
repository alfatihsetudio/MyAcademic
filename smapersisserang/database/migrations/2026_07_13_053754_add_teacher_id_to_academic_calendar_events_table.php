<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('academic_calendar_events') && !Schema::hasColumn('academic_calendar_events', 'teacher_id')) {
            Schema::table('academic_calendar_events', function (Blueprint $table) {
                $table->foreignId('teacher_id')
                    ->nullable()
                    ->after('targets')
                    ->constrained('teachers')
                    ->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('academic_calendar_events') && Schema::hasColumn('academic_calendar_events', 'teacher_id')) {
            Schema::table('academic_calendar_events', function (Blueprint $table) {
                $table->dropConstrainedForeignId('teacher_id');
            });
        }
    }
};
