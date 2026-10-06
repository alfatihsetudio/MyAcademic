<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('boarding_schedules', function (Blueprint $table) {
            $table->string('schedule_type')->default('daily')->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('boarding_schedules', function (Blueprint $table) {
            $table->dropColumn('schedule_type');
        });
    }
};
