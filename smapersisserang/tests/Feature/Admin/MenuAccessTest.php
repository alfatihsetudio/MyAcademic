<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\AdminMenuService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MenuAccessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedRoles();
        $this->seed(\Database\Seeders\PermissionSeeder::class);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('menu_role_overrides');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('school_settings');
        parent::tearDown();
    }

    private function createTables(): void
    {
        Schema::create('users', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->string('role', 50)->default('admin');
            $table->timestamps();
        });

        Schema::create('roles', function ($table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->string('guard_name', 30)->default('web');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });

        Schema::create('school_settings', function ($table) {
            $table->id();
            $table->string('school_name')->nullable();
            $table->string('tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('menu_role_overrides', function ($table) {
            $table->id();
            $table->string('menu_key', 100)->unique();
            $table->json('roles');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });

        Schema::create('permissions', function ($table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('module', 100)->default('');
            $table->string('action', 50)->default('');
            $table->string('display_name', 200)->default('');
            $table->text('description')->nullable();
            $table->string('group_name', 100)->default('');
            $table->string('guard_name', 30)->default('web');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('permission_role', function ($table) {
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->unsignedBigInteger('granted_by')->nullable();
            $table->timestamps();
            $table->unique(['permission_id', 'role_id']);
        });
    }

    private function seedRoles(): void
    {
        $systemRoles = [
            'superadmin' => ['display_name' => 'Superadmin', 'sort_order' => 1],
            'admin' => ['display_name' => 'Admin', 'sort_order' => 2],
            'kepala_sekolah' => ['display_name' => 'Kepala Sekolah', 'sort_order' => 3],
            'guru' => ['display_name' => 'Guru', 'sort_order' => 4],
            'staf_tata_usaha' => ['display_name' => 'Staf Tata Usaha', 'sort_order' => 5],
            'staf_keuangan' => ['display_name' => 'Staf Keuangan', 'sort_order' => 6],
            'staf_kesiswaan' => ['display_name' => 'Staf Kesiswaan', 'sort_order' => 7],
            'staf_sarpras' => ['display_name' => 'Staf Sarpras', 'sort_order' => 8],
        ];

        foreach ($systemRoles as $name => $config) {
            Role::firstOrCreate(
                ['name' => $name],
                [
                    'display_name' => $config['display_name'],
                    'guard_name' => 'web',
                    'is_system' => true,
                    'is_active' => true,
                    'sort_order' => $config['sort_order'],
                ]
            );
        }
    }

    private function createUser(string $roleName): User
    {
        $role = Role::where('name', $roleName)->first();
        $user = User::create([
            'name' => "Test {$roleName}",
            'email' => "{$roleName}_" . uniqid() . '@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);
        return $user;
    }

    private function makeSuperadmin(): User
    {
        return $this->createUser('superadmin');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACCESS CONTROL
    // ═══════════════════════════════════════════════════════════════════════

    public function test_guest_redirected_to_login(): void
    {
        $this->get(route('admin.menu-access.index'))->assertRedirect();
    }

    public function test_non_superadmin_gets_403(): void
    {
        foreach (['admin', 'guru', 'staf_tata_usaha', 'kepala_sekolah'] as $roleName) {
            $user = $this->createUser($roleName);
            $this->actingAs($user)->get(route('admin.menu-access.index'))->assertForbidden();
        }
    }

    public function test_superadmin_can_access_page(): void
    {
        $user = $this->makeSuperadmin();
        $this->actingAs($user)->get(route('admin.menu-access.index'))->assertOk();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    public function test_page_shows_hak_ases_title(): void
    {
        $user = $this->makeSuperadmin();
        $response = $this->actingAs($user)->get(route('admin.menu-access.index'));
        $response->assertSee('Pengaturan Hak Akses');
        $response->assertDontSee('Pengaturan Menu Akses');
    }

    public function test_all_active_roles_displayed(): void
    {
        $user = $this->makeSuperadmin();
        $html = $this->actingAs($user)->get(route('admin.menu-access.index'))->getContent();

        $this->assertStringContainsString('Admin', $html);
        $this->assertStringContainsString('Guru', $html);
        $this->assertStringContainsString('Staf Tata Usaha', $html);
        $this->assertStringContainsString('Pengaturan Hak Akses', $html);
    }

    public function test_inactive_role_not_displayed(): void
    {
        Role::where('name', 'guru')->first()->update(['is_active' => false]);

        $user = $this->makeSuperadmin();
        $html = $this->actingAs($user)->get(route('admin.menu-access.index'))->getContent();
        $this->assertStringNotContainsString('>Guru<', $html);

        Role::where('name', 'guru')->first()->update(['is_active' => true]);
    }

    public function test_operational_perm_shown_in_blade(): void
    {
        $user = $this->makeSuperadmin();
        $html = $this->actingAs($user)->get(route('admin.menu-access.index'))->getContent();
        $this->assertStringContainsString('ppdb.dashboard.view', $html);
        $this->assertStringContainsString('academic.calendar.view', $html);
    }

    public function test_sticky_header_sticks_to_page_scroll_without_inner_scroll_wrapper(): void
    {
        $user = $this->makeSuperadmin();
        $html = $this->actingAs($user)->get(route('admin.menu-access.index'))->getContent();

        $this->assertStringContainsString('.menu-access-table thead th', $html);
        $this->assertStringContainsString('position: sticky', $html);
        $this->assertStringNotContainsString('overflow-x-auto', $html);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LOCKED KEYS
    // ═══════════════════════════════════════════════════════════════════════

    public function test_dashboard_locked_key_skipped(): void
    {
        $user = $this->makeSuperadmin();

        $this->actingAs($user)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'dashboard', 'mode' => 'kosongkan', 'roles' => []],
            ],
        ])->assertRedirect();
    }

    public function test_profile_locked_key_skipped(): void
    {
        $user = $this->makeSuperadmin();

        $this->actingAs($user)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'account.profile', 'mode' => 'kosongkan', 'roles' => []],
            ],
        ])->assertRedirect();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODE: AKSES PENUH
    // ═══════════════════════════════════════════════════════════════════════

    public function test_full_access_grants_all_module_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();

        $viewPerm = Permission::where('name', 'academic.calendar.view')->first();
        $managePerm = Permission::where('name', 'academic.calendar.manage')->first();
        DB::table('permission_role')->where('role_id', $guru->id)
            ->whereIn('permission_id', [$viewPerm->id, $managePerm->id])->delete();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'akses_penuh', 'roles' => ['guru']],
            ],
        ])->assertRedirect();

        $this->assertDatabaseHas('permission_role', ['permission_id' => $viewPerm->id, 'role_id' => $guru->id]);
        $this->assertDatabaseHas('permission_role', ['permission_id' => $managePerm->id, 'role_id' => $guru->id]);
    }

    public function test_full_access_unchecked_roles_lose_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $stafTu = Role::where('name', 'staf_tata_usaha')->first();
        $calendarView = Permission::where('name', 'academic.calendar.view')->first();

        $this->assertDatabaseHas('permission_role', ['permission_id' => $calendarView->id, 'role_id' => $stafTu->id]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'akses_penuh', 'roles' => ['guru']],
            ],
        ]);

        $this->assertDatabaseMissing('permission_role', ['permission_id' => $calendarView->id, 'role_id' => $stafTu->id]);
    }

    public function test_granted_by_recorded(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();
        $perm = Permission::where('name', 'academic.calendar.view')->first();

        DB::table('permission_role')->where('role_id', $guru->id)
            ->where('permission_id', $perm->id)->delete();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'akses_penuh', 'roles' => ['guru']],
            ],
        ]);

        $row = DB::table('permission_role')
            ->where('permission_id', $perm->id)
            ->where('role_id', $guru->id)
            ->first();

        $this->assertNotNull($row);
        $this->assertEquals($superadmin->id, $row->granted_by);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODE: BACA SAJA
    // ═══════════════════════════════════════════════════════════════════════

    public function test_read_only_grants_only_view_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();

        DB::table('permission_role')->where('role_id', $guru->id)->delete();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'baca_saja', 'roles' => ['guru']],
            ],
        ]);

        $viewPerm = Permission::where('name', 'academic.calendar.view')->first();
        $managePerm = Permission::where('name', 'academic.calendar.manage')->first();

        $this->assertDatabaseHas('permission_role', ['permission_id' => $viewPerm->id, 'role_id' => $guru->id]);
        $this->assertDatabaseMissing('permission_role', ['permission_id' => $managePerm->id, 'role_id' => $guru->id]);
    }

    public function test_read_only_revokes_manage_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();
        $managePerm = Permission::where('name', 'academic.calendar.manage')->first();

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $managePerm->id,
            'role_id' => $guru->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'baca_saja', 'roles' => ['guru']],
            ],
        ]);

        $this->assertDatabaseMissing('permission_role', ['permission_id' => $managePerm->id, 'role_id' => $guru->id]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MODE: KOSONGKAN
    // ═══════════════════════════════════════════════════════════════════════

    public function test_empty_mode_removes_module_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();
        $viewPerm = Permission::where('name', 'academic.calendar.view')->first();

        $this->assertDatabaseHas('permission_role', ['permission_id' => $viewPerm->id, 'role_id' => $guru->id]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'kosongkan', 'roles' => []],
            ],
        ]);

        $this->assertDatabaseMissing('permission_role', ['permission_id' => $viewPerm->id, 'role_id' => $guru->id]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESET
    // ═══════════════════════════════════════════════════════════════════════

    public function test_reset_restores_default_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $admin = Role::where('name', 'admin')->first();
        $perm = Permission::where('name', 'academic.calendar.view')->first();

        DB::table('permission_role')->where('role_id', $admin->id)
            ->where('permission_id', $perm->id)->delete();
        $this->assertDatabaseMissing('permission_role', ['permission_id' => $perm->id, 'role_id' => $admin->id]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), ['reset' => '1']);

        $this->assertDatabaseHas('permission_role', ['permission_id' => $perm->id, 'role_id' => $admin->id]);
    }

    public function test_reset_preserves_custom_role_assignments(): void
    {
        $superadmin = $this->makeSuperadmin();

        $customRole = Role::create([
            'name' => 'wakasek_test_reset',
            'display_name' => 'Wakasek Test Reset',
            'guard_name' => 'web',
            'is_active' => true,
        ]);

        $perm = Permission::where('name', 'academic.calendar.view')->first();
        DB::table('permission_role')->insert([
            'permission_id' => $perm->id,
            'role_id' => $customRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), ['reset' => '1']);

        $this->assertDatabaseHas('permission_role', ['permission_id' => $perm->id, 'role_id' => $customRole->id]);

        DB::table('permission_role')->where('role_id', $customRole->id)->delete();
        $customRole->delete();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDATION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_invalid_menu_key_ignored(): void
    {
        $superadmin = $this->makeSuperadmin();
        $countBefore = DB::table('permission_role')->count();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'nonexistent.menu.key', 'mode' => 'akses_penuh', 'roles' => ['admin']],
            ],
        ]);

        $this->assertEquals($countBefore, DB::table('permission_role')->count());
    }

    public function test_invalid_role_names_filtered(): void
    {
        $superadmin = $this->makeSuperadmin();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'akses_penuh', 'roles' => ['admin', 'nonexistent_role_xyz']],
            ],
        ])->assertRedirect();

        $this->assertNull(Role::where('name', 'nonexistent_role_xyz')->first());
    }

    public function test_inactive_role_not_granted_permissions(): void
    {
        $superadmin = $this->makeSuperadmin();
        $inactive = Role::where('name', 'staf_keuangan')->first();
        $inactive->update(['is_active' => false]);

        $perm = Permission::where('name', 'academic.calendar.view')->first();
        DB::table('permission_role')->where('role_id', $inactive->id)
            ->where('permission_id', $perm->id)->delete();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'academic.calendar', 'mode' => 'akses_penuh', 'roles' => ['staf_keuangan']],
            ],
        ]);

        $this->assertDatabaseMissing('permission_role', ['permission_id' => $perm->id, 'role_id' => $inactive->id]);
        $inactive->update(['is_active' => true]);
    }

    public function test_other_role_assignments_unchanged(): void
    {
        $superadmin = $this->makeSuperadmin();
        $guru = Role::where('name', 'guru')->first();
        $classesView = Permission::where('name', 'academic.classes.view')->first();

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $classesView->id,
            'role_id' => $guru->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'ppdb.dashboard', 'mode' => 'akses_penuh', 'roles' => ['admin']],
            ],
        ]);

        $this->assertDatabaseHas('permission_role', ['permission_id' => $classesView->id, 'role_id' => $guru->id]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SYSTEM PERMISSION PROTECTION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_system_permissions_not_affected_by_update(): void
    {
        $superadmin = $this->makeSuperadmin();
        $systemPerm = Permission::where('name', 'system.menu.manage')->first();

        $countBefore = DB::table('permission_role')
            ->where('permission_id', $systemPerm->id)->count();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'system.menu-access', 'mode' => 'akses_penuh', 'roles' => ['admin']],
            ],
        ]);

        $this->assertEquals($countBefore, DB::table('permission_role')
            ->where('permission_id', $systemPerm->id)->count());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SIDEBAR INTEGRATION
    // ═══════════════════════════════════════════════════════════════════════

    public function test_permission_grant_shows_menu_in_sidebar(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        $perm = Permission::where('name', 'ppdb.dashboard.view')->first();

        DB::table('permission_role')->where('role_id', $guruRole->id)
            ->where('permission_id', $perm->id)->delete();

        $user = $this->createUser('guru');
        $service = new AdminMenuService();

        $fresh = User::find($user->id);
        $this->assertFalse($service->isVisibleToUser([
            'key' => 'ppdb.dashboard', 'permission' => 'ppdb.dashboard.view',
        ], $fresh));

        $superadmin = $this->makeSuperadmin();
        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'ppdb.dashboard', 'mode' => 'akses_penuh', 'roles' => ['guru']],
            ],
        ]);

        $service->flushCache();
        $fresh2 = User::find($user->id);
        $this->assertTrue($service->isVisibleToUser([
            'key' => 'ppdb.dashboard', 'permission' => 'ppdb.dashboard.view',
        ], $fresh2));
    }

    public function test_permission_revocation_hides_menu_in_sidebar(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        $perm = Permission::where('name', 'ppdb.dashboard.view')->first();

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $perm->id,
            'role_id' => $guruRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = $this->createUser('guru');
        $service = new AdminMenuService();

        $fresh = User::find($user->id);
        $this->assertTrue($service->isVisibleToUser([
            'key' => 'ppdb.dashboard', 'permission' => 'ppdb.dashboard.view',
        ], $fresh));

        $superadmin = $this->makeSuperadmin();
        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'items' => [
                ['key' => 'ppdb.dashboard', 'mode' => 'kosongkan', 'roles' => []],
            ],
        ]);

        $service->flushCache();
        $fresh2 = User::find($user->id);
        $this->assertFalse($service->isVisibleToUser([
            'key' => 'ppdb.dashboard', 'permission' => 'ppdb.dashboard.view',
        ], $fresh2));
    }

    public function test_parent_follows_child_visibility(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        $calendarView = Permission::where('name', 'academic.calendar.view')->first();
        $scheduleView = Permission::where('name', 'academic.schedule.view')->first();

        DB::table('permission_role')->where('role_id', $guruRole->id)
            ->whereIn('permission_id', [$calendarView->id, $scheduleView->id])->delete();

        $user = $this->createUser('guru');
        $service = new AdminMenuService();

        $fresh = User::find($user->id);
        $parentItem = collect(config('admin-menu.sections'))
            ->firstWhere('label', 'AKADEMIK')['items'][2];
        $this->assertFalse($service->isVisibleToUser($parentItem, $fresh));

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $calendarView->id,
            'role_id' => $guruRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $service->flushCache();
        $fresh2 = User::find($user->id);
        $this->assertTrue($service->isVisibleToUser($parentItem, $fresh2));
    }

    public function test_inactive_role_hides_menu_in_sidebar(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        $perm = Permission::where('name', 'academic.calendar.view')->first();

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $perm->id,
            'role_id' => $guruRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $user = $this->createUser('guru');
        $service = new AdminMenuService();

        $fresh = User::find($user->id);
        $this->assertTrue($service->hasPermission($fresh, 'academic.calendar.view'));

        $guruRole->update(['is_active' => false]);
        $service->flushCache();

        $fresh2 = User::find($user->id);
        $result = $service->hasPermission($fresh2, 'academic.calendar.view');
        $this->assertTrue($result === false || $result === null);

        $guruRole->update(['is_active' => true]);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FORM FORMAT
    // ═══════════════════════════════════════════════════════════════════════

    public function test_update_rejects_old_overrides_format(): void
    {
        $superadmin = $this->makeSuperadmin();

        $this->actingAs($superadmin)->put(route('admin.menu-access.update'), [
            'overrides' => [
                ['key' => 'ppdb.dashboard', 'roles' => ['admin']],
            ],
        ])->assertSessionHasErrors('items');
    }
}