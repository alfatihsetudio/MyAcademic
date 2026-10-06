<?php

namespace Tests\Feature;

use App\Models\Permission;
use App\Models\Role;
use Database\Seeders\PermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PermissionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_does_not_give_admin_outflow_verification_permissions(): void
    {
        $this->seedRoles();

        $this->seed(PermissionSeeder::class);

        $admin = $this->adminRole();

        $this->assertTrue($this->roleHasPermission($admin, 'donation.outflows.view'));
        $this->assertTrue($this->roleHasPermission($admin, 'donation.outflows.create'));
        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.approve'));
        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.reject'));
    }

    public function test_seeder_removes_stale_admin_verification_pivots(): void
    {
        $this->seedRoles();
        $admin = $this->adminRole();

        $this->makePermission('donation.outflows.approve', 'approve');
        $this->makePermission('donation.outflows.reject', 'reject');
        $admin->permissions()->syncWithoutDetaching([
            Permission::where('name', 'donation.outflows.approve')->value('id'),
            Permission::where('name', 'donation.outflows.reject')->value('id'),
        ]);
        $this->assertTrue($this->roleHasPermission($admin, 'donation.outflows.approve'));
        $this->assertTrue($this->roleHasPermission($admin, 'donation.outflows.reject'));

        $this->seed(PermissionSeeder::class);

        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.approve'));
        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.reject'));
    }

    public function test_seeder_is_idempotent_when_run_twice(): void
    {
        $this->seedRoles();

        $this->seed(PermissionSeeder::class);
        $first = $this->adminOutflowPivotState();

        $this->seed(PermissionSeeder::class);
        $second = $this->adminOutflowPivotState();

        $this->assertSame($first, $second);
        $this->assertFalse($second['approve']);
        $this->assertFalse($second['reject']);
        $this->assertTrue($second['view']);
        $this->assertTrue($second['create']);
    }

    public function test_seeder_does_not_remove_other_admin_permissions(): void
    {
        $this->seedRoles();
        $admin = $this->adminRole();

        $this->makePermission('donation.outflows.view', 'view');
        $admin->permissions()->syncWithoutDetaching([
            Permission::where('name', 'donation.outflows.view')->value('id'),
        ]);

        $this->seed(PermissionSeeder::class);

        $this->assertTrue($this->roleHasPermission($admin, 'donation.outflows.view'));
        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.approve'));
        $this->assertFalse($this->roleHasPermission($admin, 'donation.outflows.reject'));
    }

    public function test_seeder_grants_staf_keuangan_view_approve_reject_without_create(): void
    {
        $this->seedRoles();

        $this->seed(PermissionSeeder::class);

        $staf = Role::where('name', 'staf_keuangan')->firstOrFail();

        $this->assertTrue($this->roleHasPermission($staf, 'donation.outflows.view'));
        $this->assertTrue($this->roleHasPermission($staf, 'donation.outflows.approve'));
        $this->assertTrue($this->roleHasPermission($staf, 'donation.outflows.reject'));
        $this->assertFalse($this->roleHasPermission($staf, 'donation.outflows.create'));
    }

    private function seedRoles(): void
    {
        Role::firstOrCreate(['name' => 'admin'], [
            'display_name' => 'Admin',
            'guard_name' => 'web',
            'is_active' => true,
        ]);
        Role::firstOrCreate(['name' => 'staf_keuangan'], [
            'display_name' => 'Staf Keuangan',
            'guard_name' => 'web',
            'is_active' => true,
        ]);
    }

    private function adminRole(): Role
    {
        return Role::where('name', 'admin')->firstOrFail();
    }

    private function roleHasPermission(Role $role, string $permissionName): bool
    {
        return $role->permissions()->where('name', $permissionName)->exists();
    }

    private function adminOutflowPivotState(): array
    {
        $admin = $this->adminRole();

        return [
            'view' => $this->roleHasPermission($admin, 'donation.outflows.view'),
            'create' => $this->roleHasPermission($admin, 'donation.outflows.create'),
            'approve' => $this->roleHasPermission($admin, 'donation.outflows.approve'),
            'reject' => $this->roleHasPermission($admin, 'donation.outflows.reject'),
        ];
    }

    private function makePermission(string $name, string $action): Permission
    {
        return Permission::firstOrCreate(
            ['name' => $name],
            [
                'module' => 'donation',
                'action' => $action,
                'display_name' => $name,
                'group_name' => 'DONASI',
                'is_active' => true,
            ]
        );
    }
}
