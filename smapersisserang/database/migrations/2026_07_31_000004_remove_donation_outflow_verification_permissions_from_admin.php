<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * SoD: verifier Donasi Keluar hanya staf_keuangan (dan superadmin via bypass).
     * Hapus pivot approval lama yang tersisa pada role admin.
     */
    public function up(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $permissionIds = Permission::whereIn('name', [
            'donation.outflows.approve',
            'donation.outflows.reject',
        ])->pluck('id');

        if ($admin && $permissionIds->isNotEmpty()) {
            $admin->permissions()->detach($permissionIds);
        }
    }

    public function down(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $permissionIds = Permission::whereIn('name', [
            'donation.outflows.approve',
            'donation.outflows.reject',
        ])->pluck('id');

        if ($admin && $permissionIds->isNotEmpty()) {
            $admin->permissions()->syncWithoutDetaching($permissionIds);
        }
    }
};
