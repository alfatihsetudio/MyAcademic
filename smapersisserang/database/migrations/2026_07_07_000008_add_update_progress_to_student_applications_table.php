<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_applications', function (Blueprint $table) {
            $table->unsignedTinyInteger('current_step')->default(1)->after('updated_by_parent_at');
            $table->timestamp('student_data_completed_at')->nullable()->after('current_step');
            $table->timestamp('parent_data_completed_at')->nullable()->after('student_data_completed_at');
            $table->timestamp('guardian_boarding_completed_at')->nullable()->after('parent_data_completed_at');
            $table->timestamp('documents_completed_at')->nullable()->after('guardian_boarding_completed_at');
            $table->timestamp('final_submitted_at')->nullable()->after('documents_completed_at');
            $table->boolean('is_final_submitted')->default(false)->after('final_submitted_at');
            $table->timestamp('last_saved_at')->nullable()->after('is_final_submitted');
        });
    }

    public function down(): void
    {
        Schema::table('student_applications', function (Blueprint $table) {
            $table->dropColumn([
                'current_step',
                'student_data_completed_at',
                'parent_data_completed_at',
                'guardian_boarding_completed_at',
                'documents_completed_at',
                'final_submitted_at',
                'is_final_submitted',
                'last_saved_at',
            ]);
        });
    }
};
