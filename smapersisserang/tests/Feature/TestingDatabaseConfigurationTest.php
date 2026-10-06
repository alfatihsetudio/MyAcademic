<?php

namespace Tests\Feature;

use Tests\TestCase;

class TestingDatabaseConfigurationTest extends TestCase
{
    public function test_testing_database_uses_sqlite_memory(): void
    {
        fwrite(STDERR, PHP_EOL . 'Testing database.default=' . config('database.default') . PHP_EOL);
        fwrite(STDERR, 'Testing sqlite.database=' . config('database.connections.sqlite.database') . PHP_EOL);

        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
    }
}
