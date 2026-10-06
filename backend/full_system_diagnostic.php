<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Route;

echo "=======================================================\n";
echo "           MYACADEMIC FULL SYSTEM DIAGNOSTIC           \n";
echo "=======================================================\n\n";

// 1. Database Connection & Table Overview
echo "[1] MEMERIKSA KONEKSI DATABASE & STRUKTUR TABEL\n";
$tables = DB::select('SHOW TABLES');
$tableNames = array_map(function($t) { return array_values((array)$t)[0]; }, $tables);
sort($tableNames);

echo "Total Tabel di MySQL 'myacademic': " . count($tableNames) . "\n";

$tableDetails = [];
$emptyTables = [];
$filledTables = [];

foreach ($tableNames as $tbl) {
    $count = DB::table($tbl)->count();
    $cols = Schema::getColumnListing($tbl);
    if ($count == 0) {
        $emptyTables[$tbl] = count($cols);
    } else {
        $filledTables[$tbl] = ['rows' => $count, 'cols' => count($cols)];
    }
}

echo "Tabel yang berisi data (" . count($filledTables) . "):\n";
foreach ($filledTables as $tbl => $info) {
    echo "  - $tbl: {$info['rows']} rows, {$info['cols']} columns\n";
}

echo "\nTabel yang KOSONG / 0 rows (" . count($emptyTables) . "):\n";
foreach ($emptyTables as $tbl => $colCount) {
    echo "  - $tbl ($colCount columns)\n";
}

echo "\n-------------------------------------------------------\n";

// 2. Analisis User & Role
echo "[2] DATA USER & PERAN (ROLES)\n";
$users = DB::table('users')->get(['id', 'name', 'email', 'role']);
foreach ($users as $u) {
    echo sprintf("  User ID: %-2d | %-12s | %-24s | %s\n", $u->id, $u->role, $u->email, $u->name);
}

echo "\n-------------------------------------------------------\n";

// 3. Analisis Hubungan Akademik Inti
echo "[3] HUBUNGAN DATA AKADEMIK DASAR\n";
$schools = DB::table('schools')->get();
echo "Sekolah: " . count($schools) . " data\n";
foreach ($schools as $s) {
    echo "  - ID: {$s->id}, Nama: {$s->name}\n";
}

$classes = DB::table('classes')->get();
echo "Kelas: " . count($classes) . " data\n";
foreach ($classes as $c) {
    echo "  - ID: {$c->id}, Nama: {$c->nama_kelas}, Tingkat: " . ($c->level ?? '-') . ", Wali: " . ($c->wali_kelas_id ?? 'null') . "\n";
}

$subjects = DB::table('subjects')->get();
echo "Mata Pelajaran: " . count($subjects) . " data\n";
foreach ($subjects as $sb) {
    echo "  - ID: {$sb->id}, Nama: {$sb->nama_mapel}, Guru: " . ($sb->guru_id ?? 'null') . "\n";
}

$academicYears = DB::table('academic_years')->get();
echo "Tahun Ajaran: " . count($academicYears) . " data\n";

$timetables = DB::table('teaching_schedule')->get();
echo "Jadwal Mengajar (teaching_schedule): " . count($timetables) . " data\n";

echo "\n-------------------------------------------------------\n";

// 4. Analisis Controller Suite & Implementasi Database vs Mock
echo "[4] ANALISIS SUITE CONTROLLER (REAL DATABASE VS DUMMY/MOCK)\n";

$suiteFiles = [
    'Student' => __DIR__ . '/app/Http/Controllers/Api/StudentSuiteApiController.php',
    'Teacher' => __DIR__ . '/app/Http/Controllers/Api/TeacherSuiteApiController.php',
    'Homeroom' => __DIR__ . '/app/Http/Controllers/Api/HomeroomSuiteApiController.php',
    'BK' => __DIR__ . '/app/Http/Controllers/Api/BkSuiteApiController.php',
    'Parent' => __DIR__ . '/app/Http/Controllers/Api/ParentSuiteApiController.php',
    'School Admin' => __DIR__ . '/app/Http/Controllers/Api/SchoolAdminSuiteApiController.php',
    'Principal' => __DIR__ . '/app/Http/Controllers/Api/PrincipalSuiteApiController.php',
    'TU' => __DIR__ . '/app/Http/Controllers/Api/TuSuiteApiController.php',
    'Super Admin' => __DIR__ . '/app/Http/Controllers/Api/SuperAdminSuiteApiController.php',
];

foreach ($suiteFiles as $suiteName => $filePath) {
    if (!file_exists($filePath)) continue;
    $code = file_get_contents($filePath);
    preg_match_all('/public function\s+(\w+)\s*\(/', $code, $fnMatches);
    $methods = $fnMatches[1];
    
    // Check methods that return hardcoded array without any DB query
    $dbPattern = '/(DB::|\bUser::|\bAcademicClass::|\bSubject::|\bAttendance::|\bAssignment::|\bMaterial::|\bExam::|\bGrade::|\bSubmission::|\bCounselingCase::|\bExtracurricular::|\bAnnouncement::|\bSchool::|\bStudentIdentity::|\bTeacherAttendance::|\bTeachingSchedule::|\bTeachingJournal::|\bReportCard::)/';
    
    $realDbMethods = [];
    $mockMethods = [];
    
    foreach ($methods as $method) {
        // extract method body
        $pos = strpos($code, "function $method");
        if ($pos !== false) {
            $slice = substr($code, $pos, 2000); // sample chunk
            if (preg_match($dbPattern, $slice)) {
                $realDbMethods[] = $method;
            } else {
                $mockMethods[] = $method;
            }
        }
    }
    
    echo sprintf("\n[%s Suite] Total Fitur/Method: %d\n", $suiteName, count($methods));
    echo "  - Menggunakan Database Nyata: " . count($realDbMethods) . " (" . implode(', ', array_slice($realDbMethods, 0, 5)) . (count($realDbMethods) > 5 ? '...' : '') . ")\n";
    echo "  - MOCK/DUMMY (Hardcoded JSON): " . count($mockMethods) . " (" . implode(', ', array_slice($mockMethods, 0, 5)) . (count($mockMethods) > 5 ? '...' : '') . ")\n";
}

echo "\n=======================================================\n";
