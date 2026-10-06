<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    protected array $systemRoles = [
        'superadmin' => ['display_name' => 'Superadmin', 'sort_order' => 1],
        'admin' => ['display_name' => 'Admin', 'sort_order' => 2],
        'kepala_sekolah' => ['display_name' => 'Kepala Sekolah', 'sort_order' => 3],
        'guru' => ['display_name' => 'Guru', 'sort_order' => 4],
        'staf_tata_usaha' => ['display_name' => 'Staf Tata Usaha', 'sort_order' => 5],
        'staf_keuangan' => ['display_name' => 'Staf Keuangan', 'sort_order' => 6],
        'staf_kesiswaan' => ['display_name' => 'Staf Kesiswaan', 'sort_order' => 7],
        'staf_sarpras' => ['display_name' => 'Staf Sarpras', 'sort_order' => 8],
    ];

    public function run(): void
    {
        $inserted = [];
        foreach ($this->systemRoles as $name => $config) {
            $role = Role::where('name', $name)->first();

            if ($role) {
                $role->update([
                    'display_name' => $config['display_name'],
                    'guard_name' => 'web',
                    'is_system' => true,
                    'is_active' => true,
                    'sort_order' => $config['sort_order'],
                ]);
            } else {
                $role = Role::create([
                    'name' => $name,
                    'display_name' => $config['display_name'],
                    'guard_name' => 'web',
                    'is_system' => true,
                    'is_active' => true,
                    'sort_order' => $config['sort_order'],
                ]);
            }

            $inserted[$name] = $role->id;
        }

        User::query()
            ->whereNotNull('role')
            ->where('role', '!=', '')
            ->chunkById(100, function ($users) use ($inserted) {
                foreach ($users as $user) {
                    $roleName = $user->role;
                    if (isset($inserted[$roleName])) {
                        $user->roles()->syncWithoutDetaching([$inserted[$roleName]]);
                    }
                }
            });
    }
}
