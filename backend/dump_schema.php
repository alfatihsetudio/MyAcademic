<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$tables = DB::select('SHOW TABLES');
$output = [];

foreach ($tables as $t) {
    $tName = array_values((array)$t)[0];
    if (DB::table($tName)->count() === 0) {
        $cols = DB::select("DESCRIBE `$tName`");
        $colDefs = [];
        foreach ($cols as $c) {
            $colDefs[] = $c->Field . ' (' . $c->Type . ')' . ($c->Null == 'NO' ? ' NOT NULL' : '') . ($c->Default !== null ? ' DEFAULT ' . $c->Default : '');
        }
        $output[$tName] = $colDefs;
    }
}

file_put_contents(__DIR__ . '/empty_tables_schema.json', json_encode($output, JSON_PRETTY_PRINT));
echo "Saved " . count($output) . " empty tables schema to empty_tables_schema.json\n";
