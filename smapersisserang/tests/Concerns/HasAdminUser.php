<?php

namespace Tests\Concerns;

use App\Models\Role;
use App\Models\User;

trait HasAdminUser
{
    protected function createAdminUser(array $overrides = []): User
    {
        $user = User::factory()->create($overrides);

        $this->assignRole($user, 'admin');

        return $user;
    }

    protected function createNonAdminUser(array $overrides = []): User
    {
        return User::factory()->create($overrides);
    }

    protected function assignRole(User $user, string $roleName): void
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            [
                'display_name' => ucfirst(str_replace('_', ' ', $roleName)),
                'guard_name' => 'web',
                'is_active' => true,
                'is_system' => true,
                'sort_order' => 1,
            ]
        );

        $user->roles()->syncWithoutDetaching([$role->id]);
    }
}
