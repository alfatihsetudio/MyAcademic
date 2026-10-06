<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "CLASSES:\n";
print_r(DB::table('classes')->get()->toArray());

echo "SUBJECTS:\n";
print_r(DB::table('subjects')->get()->toArray());

echo "ATTENDANCE:\n";
print_r(DB::table('attendance')->get()->toArray());

echo "SUBMISSIONS:\n";
print_r(DB::table('submissions')->get()->toArray());


echo "STUDY FOLDERS:\n";
print_r(DB::table('study_folders')->get()->toArray());

