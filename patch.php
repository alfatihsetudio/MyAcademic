<?php
// patch migrations
$dir = __DIR__ . '/backend/database/migrations';
$files = glob($dir . '/*.php');
foreach ($files as $file) {
    $content = file_get_contents($file);
    // Add foreign key constraints to *_id columns
    $content = preg_replace('/\$table->(unsignedBigInteger|bigInteger)\(\'([a-z_]+_id)\'\)(.*?);/', '$table->$1(\'$2\')$3;', $content);
    file_put_contents($file, $content);
}
echo "Done";
