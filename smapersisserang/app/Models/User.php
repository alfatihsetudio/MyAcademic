<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'nama',
        'email',
        'password',
        'role',
        'lifecycle_status',
        'nisn',
        'school_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasRole(string $role): bool
    {
        if ($this->relationLoaded('roles') || $this->exists) {
            $this->loadMissing('roles');
            if ($this->roles->isNotEmpty()) {
                return $this->roles->contains(fn(Role $r) => $r->name === $role && ($r->is_active ?? true));
            }
        }

        if ($this->role === $role) {
            return Role::where('name', $role)->where('is_active', true)->exists();
        }

        return false;
    }

    public function hasAnyRole(array $roles): bool
    {
        if ($this->relationLoaded('roles') || $this->exists) {
            $this->loadMissing('roles');
            if ($this->roles->isNotEmpty()) {
                return $this->roles->filter(fn(Role $r) => $r->is_active ?? true)->whereIn('name', $roles)->isNotEmpty();
            }
        }

        if (in_array($this->role, $roles)) {
            return Role::where('name', $this->role)->where('is_active', true)->exists();
        }

        return false;
    }

    public function isSuperadmin(): bool
    {
        if ($this->relationLoaded('roles') || $this->exists) {
            $this->loadMissing('roles');
            if ($this->roles->isNotEmpty()) {
                return $this->roles->contains(fn(Role $r) => $r->name === 'superadmin' && ($r->is_active ?? true));
            }
        }

        if ($this->role === 'superadmin') {
            return Role::where('name', 'superadmin')->where('is_active', true)->exists();
        }

        return false;
    }

    public function isAdmin(): bool
    {
        if ($this->relationLoaded('roles') || $this->exists) {
            $this->loadMissing('roles');
            if ($this->roles->isNotEmpty()) {
                return $this->roles->filter(fn(Role $r) => $r->is_active ?? true)->whereIn('name', ['superadmin', 'admin'])->isNotEmpty();
            }
        }

        if (in_array($this->role, ['admin', 'superadmin'])) {
            return Role::where('name', $this->role)->where('is_active', true)->exists();
        }

        return false;
    }

    public function isFinanceOfficer(): bool
    {
        if ($this->isSuperadmin()) {
            return true;
        }

        return $this->hasRole('staf_keuangan');
    }

    public function hasPermissionTo(string $permissionName): bool
    {
        if ($this->isSuperadmin()) {
            return true;
        }

        $this->loadMissing('roles.permissions');

        return $this->roles
            ->filter(fn(Role $role) => $role->is_active ?? true)
            ->flatMap(fn(Role $role) => $role->permissions)
            ->pluck('name')
            ->unique()
            ->contains($permissionName);
    }

    public function syncRoles(array $roleIds): void
    {
        $this->roles()->sync($roleIds);
    }
}
