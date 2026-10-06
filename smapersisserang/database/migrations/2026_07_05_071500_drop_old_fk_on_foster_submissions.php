<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = DB::connection()->getDriverName();

        if (!in_array($driver, ['mysql', 'mariadb'])) {
            return;
        }

        $constraintName = 'foster_parent_submissions_foster_student_id_foreign';

        $exists = DB::selectOne("
            SELECT CONSTRAINT_NAME
            FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'foster_parent_submissions'
            AND CONSTRAINT_NAME = ?
        ", [$constraintName]);

        if ($exists) {
            Schema::table('foster_parent_submissions', function ($table) use ($constraintName) {
                $table->dropForeign($constraintName);
            });
        }
    }

    public function down(): void
    {
        //
    }
};
