<?php
$lines = file('database/seeders/ComprehensiveSchoolSeeder.php');
foreach ($lines as $i => $line) {
    if (strpos($line, 'attendance') !== false) {
        echo ($i+1) . ': ' . trim($line) . PHP_EOL;
    }
}
