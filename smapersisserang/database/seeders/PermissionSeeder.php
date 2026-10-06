<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $manifest = config('permissions', []);

        if (empty($manifest)) {
            $this->command->warn('config/permissions.php is empty or not found.');

            return;
        }

        // Report orphaned permissions (not removed automatically)
        $manifestNames = array_column($manifest, 'name');
        $orphanNames = Permission::whereNotIn('name', $manifestNames)->pluck('name');
        if ($orphanNames->isNotEmpty()) {
            $this->command->warn('⚠️  Orphan/stale permission(s) in DB not in manifest: '.$orphanNames->implode(', '));
        }

        $adminRole = Role::where('name', 'admin')->first();
        $adminNonSystemPermissionIds = [];
        // SoD: permission verifikasi Donasi Keluar tidak otomatis diberikan ke role admin.
        $adminExcludedPermissions = [
            'donation.outflows.approve',
            'donation.outflows.reject',
            'donation.transfers.approve',
            'donation.transfers.reject',
        ];

        DB::transaction(function () use ($manifest, $adminRole, &$adminNonSystemPermissionIds, $adminExcludedPermissions) {
            foreach ($manifest as $data) {
                $defaultRoles = $data['default_roles'] ?? [];
                $dbData = $data;
                unset($dbData['default_roles'], $dbData['routes'], $dbData['menu_key']);

                $perm = Permission::firstOrCreate(
                    ['name' => $data['name']],
                    $dbData
                );

                if (! $perm->wasRecentlyCreated) {
                    $perm->update($dbData);
                }

                // Attach default roles without detaching existing ones
                if (! empty($defaultRoles)) {
                    $roleIds = Role::whereIn('name', $defaultRoles)->pluck('id')->toArray();
                    if (! empty($roleIds)) {
                        $existing = DB::table('permission_role')
                            ->where('permission_id', $perm->id)
                            ->whereIn('role_id', $roleIds)
                            ->pluck('role_id')
                            ->toArray();

                        $newRoles = array_diff($roleIds, $existing);
                        foreach ($newRoles as $roleId) {
                            DB::table('permission_role')->insert([
                                'permission_id' => $perm->id,
                                'role_id' => $roleId,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }

                // Collect non-system permission IDs for admin
                if ($adminRole
                    && ! ($data['is_system'] ?? false)
                    && ! in_array($data['name'], $adminExcludedPermissions, true)) {
                    $adminNonSystemPermissionIds[] = $perm->id;
                }
            }

            // Admin gets all non-system permissions
            if ($adminRole && ! empty($adminNonSystemPermissionIds)) {
                $existingAdmin = DB::table('permission_role')
                    ->where('role_id', $adminRole->id)
                    ->whereIn('permission_id', $adminNonSystemPermissionIds)
                    ->pluck('permission_id')
                    ->toArray();

                $newAdminPerms = array_diff($adminNonSystemPermissionIds, $existingAdmin);
                foreach ($newAdminPerms as $permId) {
                    DB::table('permission_role')->insert([
                        'permission_id' => $permId,
                        'role_id' => $adminRole->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // SoD: cabut pivot verifikasi Donasi Keluar/Mutasi Dana pada role admin (idempotent).
            if ($adminRole) {
                $verificationIds = Permission::whereIn('name', $adminExcludedPermissions)->pluck('id');
                if ($verificationIds->isNotEmpty()) {
                    $adminRole->permissions()->detach($verificationIds);
                }
            }
        });
    }
}
