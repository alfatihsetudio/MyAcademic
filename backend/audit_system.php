<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "=== 1. DATABASE TABLES & RECORD COUNTS ===\n";
$tables = DB::select('SHOW TABLES');
$tableNames = array_map(function($t) { return array_values((array)$t)[0]; }, $tables);
sort($tableNames);

$nonEmpty = [];
$empty = [];
foreach ($tableNames as $t) {
    $count = DB::table($t)->count();
    if ($count > 0) {
        $nonEmpty[] = "$t ($count)";
    } else {
        $empty[] = $t;
    }
}

echo "NON-EMPTY TABLES (" . count($nonEmpty) . "):\n";
echo implode(", ", $nonEmpty) . "\n\n";

echo "EMPTY TABLES (" . count($empty) . "):\n";
echo implode(", ", $empty) . "\n\n";

echo "=== 2. USERS IN DB ===\n";
$users = DB::table('users')->get();
foreach ($users as $u) {
    echo "- ID: {$u->id} | Name: {$u->name} | Email: {$u->email} | Role: {$u->role}\n";
}
echo "\n";

echo "=== 3. CONTROLLERS IN APP/HTTP/CONTROLLERS/API ===\n";
$controllerFiles = glob(__DIR__ . '/app/Http/Controllers/Api/*.php');
foreach ($controllerFiles as $file) {
    $content = file_get_contents($file);
    $base = basename($file);
    $lineCount = count(file($file));
    echo "Controller: $base ($lineCount lines)\n";
}

echo "\n=== 4. MODELS IN APP/MODELS ===\n";
$modelFiles = glob(__DIR__ . '/app/Models/*.php');
$models = array_map(function($f) { return basename($f, '.php'); }, $modelFiles);
sort($models);
echo "Total models: " . count($models) . "\n";
echo implode(", ", $models) . "\n";
