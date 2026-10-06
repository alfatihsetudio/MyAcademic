<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MigrateSqliteCompatibilityTest extends TestCase
{
    public function test_foster_fk_migration_runs_on_sqlite_without_error(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        $exitCode = Artisan::call('migrate', ['--force' => true]);

        $this->assertSame(0, $exitCode, 'Migration failed: ' . Artisan::output());
    }

    public function test_roles_table_exists_after_migration_on_sqlite(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        Artisan::call('migrate', ['--force' => true]);

        $this->assertTrue(
            DB::getSchemaBuilder()->hasTable('roles'),
            'roles table should exist after migration on SQLite'
        );
    }

    public function test_permissions_table_exists_after_migration_on_sqlite(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        Artisan::call('migrate', ['--force' => true]);

        $this->assertTrue(
            DB::getSchemaBuilder()->hasTable('permissions'),
            'permissions table should exist after migration on SQLite'
        );
    }

    public function test_letter_types_table_exists_after_migration_on_sqlite(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        Artisan::call('migrate', ['--force' => true]);

        $this->assertTrue(
            DB::getSchemaBuilder()->hasTable('letter_types'),
            'letter_types table should exist after migration on SQLite'
        );
    }

    public function test_foster_parent_submissions_table_exists_after_migration_on_sqlite(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        Artisan::call('migrate', ['--force' => true]);

        $this->assertTrue(
            DB::getSchemaBuilder()->hasTable('foster_parent_submissions'),
            'foster_parent_submissions table should exist after migration on SQLite'
        );
    }

    public function test_foster_fk_migration_is_skipped_on_sqlite_without_error(): void
    {
        if (DB::connection()->getDriverName() !== 'sqlite') {
            $this->markTestSkipped('This test only runs on SQLite.');
        }

        $output = Artisan::call('migrate', ['--force' => true]);

        $this->assertSame(0, $output);
        $this->assertStringNotContainsString(
            'information_schema',
            Artisan::output(),
            'Migration should not query information_schema on SQLite'
        );
    }
}
