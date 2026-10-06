<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$controllers = [
    'Student' => App\Http\Controllers\Api\StudentSuiteApiController::class,
    'Teacher' => App\Http\Controllers\Api\TeacherSuiteApiController::class,
    'Homeroom' => App\Http\Controllers\Api\HomeroomSuiteApiController::class,
    'Bk' => App\Http\Controllers\Api\BkSuiteApiController::class,
    'Parent' => App\Http\Controllers\Api\ParentSuiteApiController::class,
    'TU' => App\Http\Controllers\Api\TuSuiteApiController::class,
    'SchoolAdmin' => App\Http\Controllers\Api\SchoolAdminSuiteApiController::class,
    'SuperAdmin' => App\Http\Controllers\Api\SuperAdminSuiteApiController::class,
];

foreach ($controllers as $name => $class) {
    echo "=== $name Controller Methods ===\n";
    $rc = new ReflectionClass($class);
    foreach ($rc->getMethods(ReflectionMethod::IS_PUBLIC) as $m) {
        if ($m->class === $class) {
            echo "  - " . $m->name . "\n";
        }
    }
}
