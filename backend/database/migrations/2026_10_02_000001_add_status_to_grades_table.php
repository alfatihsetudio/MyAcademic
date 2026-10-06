<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->boolean('is_locked')->default(false);
            $table->string('type')->nullable(); // e.g., 'exam', 'assignment'
            $table->unsignedBigInteger('related_id')->nullable(); // ID of the exam or assignment
        });
    }

    public function down(): void
    {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn(['is_locked', 'type', 'related_id']);
        });
    }
};
