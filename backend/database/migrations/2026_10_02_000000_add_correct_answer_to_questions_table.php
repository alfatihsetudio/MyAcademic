<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('correct_answer')->nullable();
            $table->decimal('points', 5, 2)->default(1);
        });
        Schema::table('exam_answers', function (Blueprint $table) {
            $table->boolean('is_correct')->nullable();
            $table->decimal('points_awarded', 5, 2)->nullable();
        });
        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('gradebook_id')->nullable()->constrained('gradebooks')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->dropColumn(['correct_answer', 'points']);
        });
        Schema::table('exam_answers', function (Blueprint $table) {
            $table->dropColumn(['is_correct', 'points_awarded']);
        });
        Schema::table('exams', function (Blueprint $table) {
            $table->dropColumn(['gradebook_id']);
        });
    }
};
