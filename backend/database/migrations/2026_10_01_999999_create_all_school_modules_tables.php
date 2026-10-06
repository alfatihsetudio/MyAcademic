<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. school_settings
        if (!Schema::hasTable('school_settings')) {
            Schema::create('school_settings', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('setting_key');
                $table->text('setting_value')->nullable();
                $table->timestamps();
            });
        }

        // 2. student_families
        if (!Schema::hasTable('student_families')) {
            Schema::create('student_families', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->string('father_name')->nullable();
                $table->string('mother_name')->nullable();
                $table->string('guardian_name')->nullable();
                $table->timestamps();
            });
        }

        // 3. student_histories
        if (!Schema::hasTable('student_histories')) {
            Schema::create('student_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->text('history_details');
                $table->timestamps();
            });
        }

        // 4. teacher_histories
        if (!Schema::hasTable('teacher_histories')) {
            Schema::create('teacher_histories', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
                $table->text('history_details');
                $table->timestamps();
            });
        }

        // 5. teaching_assignments
        if (!Schema::hasTable('teaching_assignments')) {
            Schema::create('teaching_assignments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
                $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
                $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
                $table->foreignId('semester_id')->constrained('semesters')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        // 6. teaching_journals
        if (!Schema::hasTable('teaching_journals')) {
            Schema::create('teaching_journals', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('teaching_assignment_id')->constrained('teaching_assignments')->cascadeOnDelete();
                $table->date('date');
                $table->text('content');
                $table->timestamps();
            });
        }

        // 7. teacher_attendances
        if (!Schema::hasTable('teacher_attendances')) {
            Schema::create('teacher_attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
                $table->date('date');
                $table->string('status');
                $table->timestamps();
            });
        }

        // 8. attendance_rules
        if (!Schema::hasTable('attendance_rules')) {
            Schema::create('attendance_rules', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->time('check_in_time');
                $table->time('check_out_time');
                $table->timestamps();
            });
        }

        // 9. learning_materials
        if (!Schema::hasTable('learning_materials')) {
            Schema::create('learning_materials', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('teaching_assignment_id')->constrained('teaching_assignments')->cascadeOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('file_path')->nullable();
                $table->timestamps();
            });
        }

        // 10. exams
        if (!Schema::hasTable('exams')) {
            Schema::create('exams', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('title');
                $table->timestamps();
            });
        }

        // 11. questions
        if (!Schema::hasTable('questions')) {
            Schema::create('questions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->text('question_text');
                $table->timestamps();
            });
        }

        // 12. exam_attempts
        if (!Schema::hasTable('exam_attempts')) {
            Schema::create('exam_attempts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('exam_id')->constrained('exams')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        // 13. exam_answers
        if (!Schema::hasTable('exam_answers')) {
            Schema::create('exam_answers', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('exam_attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
                $table->foreignId('question_id')->constrained('questions')->cascadeOnDelete();
                $table->text('answer_text');
                $table->timestamps();
            });
        }

        // 14. gradebooks
        if (!Schema::hasTable('gradebooks')) {
            Schema::create('gradebooks', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('name');
                $table->timestamps();
            });
        }

        // 15. grades
        if (!Schema::hasTable('grades')) {
            Schema::create('grades', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('gradebook_id')->constrained('gradebooks')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->decimal('score', 5, 2);
                $table->timestamps();
            });
        }

        // 16. report_cards
        if (!Schema::hasTable('report_cards')) {
            Schema::create('report_cards', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->text('comments')->nullable();
                $table->timestamps();
            });
        }

        // 17. counseling_cases
        if (!Schema::hasTable('counseling_cases')) {
            Schema::create('counseling_cases', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->text('details');
                $table->timestamps();
            });
        }

        // 18. student_achievements
        if (!Schema::hasTable('student_achievements')) {
            Schema::create('student_achievements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->string('title');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 19. student_violations
        if (!Schema::hasTable('student_violations')) {
            Schema::create('student_violations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->string('violation_type');
                $table->timestamps();
            });
        }

        // 20. announcements
        if (!Schema::hasTable('announcements')) {
            Schema::create('announcements', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('title');
                $table->text('content');
                $table->timestamps();
            });
        }

        // 21. extracurriculars
        if (!Schema::hasTable('extracurriculars')) {
            Schema::create('extracurriculars', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('name');
                $table->timestamps();
            });
        }

        // 22. extracurricular_members
        if (!Schema::hasTable('extracurricular_members')) {
            Schema::create('extracurricular_members', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->foreignId('extracurricular_id')->constrained('extracurriculars')->cascadeOnDelete();
                $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        // 23. school_events
        if (!Schema::hasTable('school_events')) {
            Schema::create('school_events', function (Blueprint $table) {
                $table->id();
                $table->foreignId('school_id')->constrained('schools')->cascadeOnDelete();
                $table->string('title');
                $table->dateTime('event_date');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('school_events');
        Schema::dropIfExists('extracurricular_members');
        Schema::dropIfExists('extracurriculars');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('student_violations');
        Schema::dropIfExists('student_achievements');
        Schema::dropIfExists('counseling_cases');
        Schema::dropIfExists('report_cards');
        Schema::dropIfExists('grades');
        Schema::dropIfExists('gradebooks');
        Schema::dropIfExists('exam_answers');
        Schema::dropIfExists('exam_attempts');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('attendance_rules');
        Schema::dropIfExists('teacher_attendances');
        Schema::dropIfExists('teaching_journals');
        Schema::dropIfExists('teaching_assignments');
        Schema::dropIfExists('teacher_histories');
        Schema::dropIfExists('student_histories');
        Schema::dropIfExists('student_families');
        Schema::dropIfExists('school_settings');
    }
};
