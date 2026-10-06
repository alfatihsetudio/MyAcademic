<?php

namespace App\Http\Middleware;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    protected ?\Illuminate\Support\Collection $validPermissionNames = null;

    protected bool $permissionLoadFailed = false;

    protected ?\Illuminate\Support\Collection $userPermissionsCache = null;

    protected ?int $userPermissionsCacheUserId = null;

    public function handle(
        Request $request,
        Closure $next,
        string $permissionName,
        string ...$fallbackRoles
    ): Response {
        if (empty($permissionName) || empty($fallbackRoles)) {
            throw new \InvalidArgumentException(
                'Middleware permission membutuhkan nama permission dan minimal satu fallback role. '
                . 'Contoh: permission:website.media.manage,superadmin,admin,staf_tata_usaha'
            );
        }

        $user = $request->user();

        if (!$user) {
            abort(403, 'Akses ditolak. Silakan login terlebih dahulu.');
        }

        if ($this->isSuperadmin($user)) {
            return $next($request);
        }

        $result = $this->checkUserPermission($user, $permissionName);

        if ($result === true) {
            return $next($request);
        }

        if ($result === false) {
            abort(403, 'Akses ditolak. Anda tidak memiliki permission yang diperlukan.');
        }

        if ($this->userHasFallbackRole($user, $fallbackRoles)) {
            return $next($request);
        }

        abort(403, 'Akses ditolak. Anda tidak memiliki akses ke halaman ini.');
    }

    protected function isSuperadmin(User $user): bool
    {
        if ($user->relationLoaded('roles') || $user->exists) {
            $user->loadMissing('roles');
            if ($user->roles->isNotEmpty()) {
                return $user->roles->contains(fn(Role $r) => $r->name === 'superadmin' && ($r->is_active ?? true));
            }
        }

        if ($user->role === 'superadmin') {
            return Role::where('name', 'superadmin')->where('is_active', true)->exists();
        }

        return false;
    }

    protected function userHasFallbackRole(User $user, array $fallbackRoles): bool
    {
        if ($user->relationLoaded('roles') || $user->exists) {
            $user->loadMissing('roles');
            if ($user->roles->isNotEmpty()) {
                return $user->roles->filter(fn(Role $r) => $r->is_active ?? true)->whereIn('name', $fallbackRoles)->isNotEmpty();
            }
        }

        if (in_array($user->role, $fallbackRoles)) {
            return Role::where('name', $user->role)->where('is_active', true)->exists();
        }

        return false;
    }

    protected function loadValidPermissionNames(): void
    {
        if ($this->validPermissionNames !== null || $this->permissionLoadFailed) {
            return;
        }

        try {
            $this->validPermissionNames = Permission::pluck('name');
        } catch (\Throwable $e) {
            Log::warning('Failed to load menu permissions; falling back to role-based visibility.', [
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);
            $this->permissionLoadFailed = true;
            $this->validPermissionNames = new \Illuminate\Support\Collection();
        }
    }

    protected function loadUserPermissions(User $user): void
    {
        if ($this->userPermissionsCache !== null && $this->userPermissionsCacheUserId === $user->id) {
            return;
        }

        $user->loadMissing('roles.permissions');
        $this->userPermissionsCache = $user->roles
            ->filter(fn(Role $role) => $role->is_active ?? true)
            ->flatMap(fn(Role $role) => $role->permissions)
            ->pluck('name')
            ->unique();
        $this->userPermissionsCacheUserId = $user->id;
    }

    protected function checkUserPermission(User $user, string $permissionName): ?bool
    {
        $this->loadValidPermissionNames();

        if (!$this->validPermissionNames->contains($permissionName)) {
            return null;
        }

        $this->loadUserPermissions($user);

        return $this->userPermissionsCache->contains($permissionName);
    }
}
