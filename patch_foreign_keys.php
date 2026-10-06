<?php
$migrationsDir = __DIR__ . '/backend/database/migrations';
$files = glob($migrationsDir . '/*.php');

$foreignMap = [
    'school_id' => 'schools',
    'guru_id' => 'users',
    'user_id' => 'users',
    'class_id' => 'classes',
    'subject_id' => 'subjects',
    'academic_year_id' => 'academic_years',
    'semester_id' => 'semesters',
    'teaching_assignment_id' => 'teaching_assignments',
    'exam_id' => 'exams',
    'question_id' => 'questions',
    'student_id' => 'users',
    'exam_attempt_id' => 'exam_attempts',
    'gradebook_id' => 'gradebooks',
    'extracurricular_id' => 'extracurriculars'
];

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // First, let's replace things like: $table->unsignedBigInteger('school_id')->nullable()->index();
    // with $table->foreignId('school_id')->nullable()->constrained('schools')->cascadeOnDelete();
    
    foreach ($foreignMap as $col => $tableRef) {
        // Pattern 1: $table->unsignedBigInteger('col_id')->nullable()->index();
        $content = preg_replace(
            '/\$table->unsignedBigInteger\(\'' . $col . '\'\)(.*?);/', 
            '$table->foreignId(\'' . $col . '\')$1->constrained(\'' . $tableRef . '\')->cascadeOnDelete();', 
            $content
        );
    }
    
    // Rename the academic_periods migration to run before 999999
    if (strpos($file, 'create_academic_periods_tables') !== false) {
        $newName = str_replace('2026_10_03_055143_', '2026_10_01_000001_a_', $file);
        if ($file !== $newName) {
            rename($file, $newName);
            $file = $newName;
        }
    }
    
    file_put_contents($file, $content);
}
echo "Done patching foreign keys.\n";
