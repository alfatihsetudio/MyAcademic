<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => 'admin',
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function withRole(string $roleName): static
    {
        return $this->afterCreating(function (User $user) use ($roleName) {
            $role = \App\Models\Role::firstOrCreate(
                ['name' => $roleName],
                ['display_name' => ucfirst($roleName), 'guard_name' => 'web']
            );
            $user->roles()->syncWithoutDetaching([$role->id]);
            $user->updateQuietly(['role' => $roleName]);
        });
    }

    public function asSuperadmin(): static
    {
        return $this->withRole('superadmin');
    }

    public function asAdmin(): static
    {
        return $this->withRole('admin');
    }
}
