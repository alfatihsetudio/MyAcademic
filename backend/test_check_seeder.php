<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$seederContent = file_get_contents(__DIR__ . '/database/seeders/ComprehensiveSchoolSeeder.php') . file_get_contents(__DIR__ . '/database/seeders/DatabaseSeeder.php');

$tables = DB::select('SHOW TABLES');
foreach ($tables as $t) {
    $tbl = array_values((array)$t)[0];
    if (in_array($tbl, ['migrations', 'cache', 'cache_locks', 'jobs', 'job_batches', 'failed_jobs', 'sessions', 'password_reset_tokens', 'personal_access_tokens'])) {
        continue;
    }
    // Check if table name appears in seeder
    if (!preg_match("/(['\"])" . preg_quote($tbl, '/') . "\\1/", $seederContent)) {
        echo "NOT SEEDED EXPLICITLY IN SEEDER: $tbl\n";
    }
}
