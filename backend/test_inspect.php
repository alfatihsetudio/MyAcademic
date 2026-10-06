<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== CHECKING ALL TABLES IN DATABASE ===\n";
$tables = DB::select('SHOW TABLES');
$total = count($tables);
$emptyCount = 0;
$populatedCount = 0;
$emptyTables = [];

foreach ($tables as $t) {
    $tbl = array_values((array)$t)[0];
    $count = DB::table($tbl)->count();
    if ($count === 0) {
        $emptyCount++;
        $emptyTables[] = $tbl;
        echo "[EMPTY] $tbl : 0 rows\n";
    } else {
        $populatedCount++;
        echo "[OK] $tbl : $count rows\n";
    }
}

echo "\nSummary:\n";
echo "Total Tables: $total\n";
echo "Populated Tables: $populatedCount\n";
echo "Empty Tables: $emptyCount\n";
if ($emptyCount > 0) {
    echo "Empty tables list: " . implode(', ', $emptyTables) . "\n";
}
