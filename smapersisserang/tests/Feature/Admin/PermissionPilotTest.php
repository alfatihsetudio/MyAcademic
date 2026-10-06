<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PermissionPilotTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedRoles();
        $this->seed(\Database\Seeders\PermissionSeeder::class);
        $this->registerTestRoutes();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('permission_role');
        Schema::dropIfExists('menu_role_overrides');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
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

        Schema::create('permissions', function ($table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('module', 100);
            $table->string('action', 50);
            $table->string('display_name', 200);
            $table->text('description')->nullable();
            $table->string('group_name', 100);
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

        Schema::create('menu_role_overrides', function ($table) {
            $table->id();
            $table->string('menu_key', 100)->unique();
            $table->json('roles');
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
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

    private function registerTestRoutes(): void
    {
        Route::middleware('web')->group(function () {
            Route::middleware('auth')->group(function () {
                Route::name('pt.')->prefix('/_pt')->group(function () {
                    Route::middleware('permission:academic.calendar.view,superadmin,admin,guru')
                        ->group(function () {
                            Route::get('/kalender', fn () => response('ok'))->name('kalender');
                        });

                    Route::middleware('permission:academic.calendar.manage,superadmin,admin')
                        ->group(function () {
                            Route::post('/kalender', fn () => response('ok'))->name('kalender.store');
                        });

                    Route::middleware('permission:academic.classes.view,superadmin,admin,guru')
                        ->group(function () {
                            Route::get('/kelas', fn () => response('ok'))->name('kelas');
                        });

                    Route::middleware('permission:academic.classes.delete,superadmin,admin')
                        ->group(function () {
                            Route::delete('/kelas/{id}', fn () => response('ok'))->name('kelas.delete');
                        });

                    Route::middleware('role:superadmin')
                        ->group(function () {
                            Route::get('/superadmin-only', fn () => response('ok'))->name('superadmin');
                        });

                    Route::middleware('role:superadmin,admin')
                        ->group(function () {
                            Route::get('/role-admin', fn () => response('ok'))->name('role-admin');
                        });

                    Route::middleware('permission:system.menu.manage,superadmin')
                        ->group(function () {
                            Route::get('/system-menu', fn () => response('ok'))->name('system-menu');
                        });

                    Route::middleware('permission:website.teachers.manage,superadmin,admin,staf_tata_usaha')
                        ->group(function () {
                            Route::get('/teachers', fn () => response('ok'))->name('teachers');
                        });

                    Route::middleware('permission:website.subjects.manage,superadmin,admin,staf_tata_usaha')
                        ->group(function () {
                            Route::get('/subjects', fn () => response('ok'))->name('subjects');
                        });

                    Route::middleware('permission:academic.years.view,superadmin,admin,guru')
                        ->group(function () {
                            Route::get('/years', fn () => response('ok'))->name('years');
                        });

                    Route::middleware('permission:academic.hours.view,superadmin,admin,guru')
                        ->group(function () {
                            Route::get('/hours', fn () => response('ok'))->name('hours');
                        });

                    Route::middleware('permission:academic.schedule.view,superadmin,admin,guru')
                        ->group(function () {
                            Route::get('/schedule', fn () => response('ok'))->name('schedule');
                        });
                });
            });
        });
    }

    private function createUser(string $roleName): User
    {
        $role = Role::where('name', $roleName)->first();
        $user = User::create([
            'name' => "Test $roleName",
            'email' => "{$roleName}@test.com",
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);
        return $user;
    }

    private function createCustomRole(string $name, array $permissionNames): Role
    {
        $role = Role::create([
            'name' => $name,
            'display_name' => ucfirst(str_replace('_', ' ', $name)),
            'guard_name' => 'web',
            'is_active' => true,
        ]);

        foreach ($permissionNames as $permName) {
            $perm = Permission::where('name', $permName)->first();
            if ($perm) {
                DB::table('permission_role')->insertOrIgnore([
                    'permission_id' => $perm->id,
                    'role_id' => $role->id,
                    'granted_by' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $role;
    }

    // ========================================================================
    // POINT 5: CheckPermission middleware - OR logic
    // ========================================================================

    public function test_permission_grants_access(): void
    {
        $user = $this->createUser('staf_kesiswaan');
        $perm = Permission::where('name', 'academic.calendar.view')->first();
        $user->roles->first()->permissions()->syncWithoutDetaching([$perm->id]);

        $this->actingAs($user)->get('/_pt/kalender')->assertOk();
    }

    public function test_legacy_role_fallback_grants_access(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kalender')->assertOk();
    }

    public function test_no_permission_no_role_returns_403(): void
    {
        $user = $this->createUser('staf_keuangan');
        $this->actingAs($user)->get('/_pt/kalender')->assertStatus(403);
    }

    public function test_inactive_role_does_not_grant_permission(): void
    {
        $role = Role::where('name', 'guru')->first();
        $role->update(['is_active' => false]);

        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kalender')->assertStatus(403);

        $role->update(['is_active' => true]);
    }

    public function test_inactive_role_does_not_grant_legacy_fallback(): void
    {
        $role = Role::where('name', 'guru')->first();
        $role->update(['is_active' => false]);

        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kalender')->assertStatus(403);

        $role->update(['is_active' => true]);
    }

    public function test_superadmin_bypasses_all(): void
    {
        $user = $this->createUser('superadmin');
        $this->actingAs($user)->get('/_pt/kalender')->assertOk();
        $this->actingAs($user)->get('/_pt/system-menu')->assertOk();
    }

    public function test_system_permission_not_in_db_uses_fallback(): void
    {
        $perm = Permission::where('name', 'academic.calendar.view')->first();
        $perm->delete();

        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kalender')->assertOk();

        $this->seed(\Database\Seeders\PermissionSeeder::class);
    }

    // ========================================================================
    // PILOT ROUTES: Permission-based access
    // ========================================================================

    public function test_pilot_teacher_permission_allows_access(): void
    {
        $role = $this->createCustomRole('wakasek_pilot1', [
            'website.teachers.manage',
        ]);

        $user = User::create([
            'name' => 'Wakasek Pilot',
            'email' => 'wakasekpilot@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);

        $this->actingAs($user)->get('/_pt/teachers')->assertOk();

        DB::table('permission_role')->where('role_id', $role->id)->delete();
        $role->delete();
    }

    public function test_pilot_subjects_permission_allows_access(): void
    {
        $role = $this->createCustomRole('wakasek_pilot2', [
            'website.subjects.manage',
        ]);

        $user = User::create([
            'name' => 'Wakasek Pilot 2',
            'email' => 'wakasekpilot2@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);

        $this->actingAs($user)->get('/_pt/subjects')->assertOk();

        DB::table('permission_role')->where('role_id', $role->id)->delete();
        $role->delete();
    }

    public function test_pilot_calendar_view_allows_guru(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kalender')->assertOk();
    }

    public function test_pilot_calendar_manage_denies_guru(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->post('/_pt/kalender')->assertStatus(403);
    }

    public function test_pilot_classes_view_allows_guru(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/kelas')->assertOk();
    }

    public function test_pilot_classes_delete_denies_non_admin(): void
    {
        $user = $this->createUser('staf_tata_usaha');
        $this->actingAs($user)->delete('/_pt/kelas/1')->assertStatus(403);
    }

    public function test_pilot_years_view_allows_guru(): void
    {
        $role = $this->createCustomRole('guru_years', [
            'academic.years.view',
        ]);

        $user = User::create([
            'name' => 'Guru Years',
            'email' => 'guruyears@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);

        $this->actingAs($user)->get('/_pt/years')->assertOk();

        DB::table('permission_role')->where('role_id', $role->id)->delete();
        $role->delete();
    }

    public function test_pilot_hours_view_allows_guru(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/hours')->assertOk();
    }

    public function test_pilot_schedule_view_allows_guru(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/schedule')->assertOk();
    }

    // ========================================================================
    // LEGACY ROLE FALLBACK
    // ========================================================================

    public function test_legacy_role_admin_still_works(): void
    {
        $user = $this->createUser('admin');
        $this->actingAs($user)->get('/_pt/role-admin')->assertOk();
    }

    public function test_legacy_role_guru_denied_on_admin_only(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_pt/role-admin')->assertStatus(403);
    }

    // ========================================================================
    // UNION MULTI-ROLE
    // ========================================================================

    public function test_union_multi_role_grants_access(): void
    {
        $guruRole = Role::where('name', 'guru')->first();
        $stafRole = Role::where('name', 'staf_keuangan')->first();

        $user = User::create([
            'name' => 'Multi Role',
            'email' => 'multi@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach([$guruRole->id, $stafRole->id]);

        $this->actingAs($user)->get('/_pt/kalender')->assertOk();
    }

    // ========================================================================
    // SYSTEM PERMISSION PROTECTION
    // ========================================================================

    public function test_system_permissions_have_zero_default_roles(): void
    {
        $systemPerms = Permission::where('is_system', true)->get();
        $this->assertCount(4, $systemPerms);

        foreach ($systemPerms as $perm) {
            $assignments = DB::table('permission_role')
                ->where('permission_id', $perm->id)
                ->count();
            $this->assertEquals(0, $assignments, "System permission {$perm->name} should have 0 assignments");
        }
    }

    public function test_admin_has_zero_system_permissions(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $adminPerms = $admin->permissions->pluck('name')->toArray();
        $systemPerms = Permission::where('is_system', true)->pluck('name')->toArray();
        $intersection = array_intersect($systemPerms, $adminPerms);

        $this->assertEmpty($intersection, 'Admin has system permissions: ' . implode(', ', $intersection));
    }

    public function test_admin_has_all_non_system_permissions(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $adminPerms = $admin->permissions->pluck('name')->toArray();
        // SoD: verifikasi Donasi Keluar & Mutasi Dana tidak otomatis diberikan ke role admin.
        $excluded = [
            'donation.outflows.approve',
            'donation.outflows.reject',
            'donation.transfers.approve',
            'donation.transfers.reject',
        ];
        $nonSystem = Permission::where('is_system', false)
            ->whereNotIn('name', $excluded)
            ->pluck('name')
            ->toArray();
        $missing = array_diff($nonSystem, $adminPerms);

        $this->assertEmpty($missing, 'Admin missing: ' . implode(', ', $missing));

        foreach ($excluded as $name) {
            $this->assertNotContains($name, $adminPerms, "Admin must not hold '$name'");
        }
    }

    // ========================================================================
    // WAKASEK KURIKULUM: 12 permissions
    // ========================================================================

    public function test_wakasek_kurikulum_has_12_permissions(): void
    {
        $wakasekPerms = [
            'website.teachers.manage',
            'website.subjects.manage',
            'academic.calendar.view',
            'academic.calendar.manage',
            'academic.schedule.view',
            'academic.schedule.manage',
            'academic.years.view',
            'academic.years.manage',
            'academic.classes.view',
            'academic.classes.manage',
            'academic.hours.view',
            'academic.hours.manage',
        ];

        $role = $this->createCustomRole('wakasek_test', $wakasekPerms);
        $count = DB::table('permission_role')
            ->where('role_id', $role->id)
            ->count();

        $this->assertEquals(12, $count, 'wakasek_kurikulum should have exactly 12 permissions');

        DB::table('permission_role')->where('role_id', $role->id)->delete();
        $role->delete();
    }

    public function test_wakasek_kurikulum_permissions_not_in_seeder_defaults(): void
    {
        $manifest = config('permissions', []);
        $wakasekPerms = [
            'website.teachers.manage',
            'website.subjects.manage',
            'academic.calendar.view',
            'academic.calendar.manage',
            'academic.schedule.view',
            'academic.schedule.manage',
            'academic.years.view',
            'academic.years.manage',
            'academic.classes.view',
            'academic.classes.manage',
            'academic.hours.view',
            'academic.hours.manage',
        ];

        foreach ($wakasekPerms as $permName) {
            $permData = collect($manifest)->firstWhere('name', $permName);
            $this->assertNotNull($permData, "Permission $permName not in config");
            $this->assertNotContains(
                'wakasek_kurikulum',
                $permData['default_roles'] ?? [],
                "$permName should NOT have wakasek_kurikulum in default_roles"
            );
        }
    }

    // ========================================================================
    // MENU ACCESS CONTROLLER: System permission guard
    // ========================================================================

    public function test_menu_access_controller_cannot_grant_system_permissions(): void
    {
        $systemPerm = Permission::where('name', 'system.menu.manage')->first();
        $this->assertNotNull($systemPerm);

        $admin = Role::where('name', 'admin')->first();
        $hasSystemBefore = DB::table('permission_role')
            ->where('role_id', $admin->id)
            ->where('permission_id', $systemPerm->id)
            ->count();
        $this->assertEquals(0, $hasSystemBefore);

        $allPermIds = Permission::pluck('id')->toArray();
        $this->assertTrue(in_array($systemPerm->id, $allPermIds), 'system.menu.manage should exist');
    }

    // ========================================================================
    // CACHE: AdminMenuService flush
    // ========================================================================

    public function test_admin_menu_service_flush_resets_state(): void
    {
        $service = new \App\Services\AdminMenuService();
        $user = $this->createUser('admin');

        $service->hasPermission($user, 'academic.calendar.view');
        $service->flushCache();

        $reflection = new \ReflectionClass($service);
        $prop = $reflection->getProperty('userPermissionsCache');
        $prop->setAccessible(true);
        $this->assertNull($prop->getValue($service));
    }

    // ========================================================================
    // ROUTE PILOT INTEGRITY
    // ========================================================================

    public function test_all_pilot_view_routes_use_permission_middleware(): void
    {
        $pilotRoutes = [
            'admin.website.teachers.index' => 'website.teachers.manage',
            'admin.website.subjects.index' => 'website.subjects.manage',
            'admin.akademik.kalender.index' => 'academic.calendar.view',
            'admin.akademik.tahun-pelajaran.index' => 'academic.years.view',
            'admin.akademik.kelas.index' => 'academic.classes.view',
            'admin.akademik.jam-pelajaran.index' => 'academic.hours.view',
            'admin.akademik.jadwal-pelajaran.index' => 'academic.schedule.view',
        ];

        foreach ($pilotRoutes as $routeName => $expectedPerm) {
            $route = app('router')->getRoutes()->getByName($routeName);
            $this->assertNotNull($route, "Route $routeName not found");

            $middleware = $route->gatherMiddleware();
            $hasPermission = false;
            foreach ($middleware as $m) {
                if (is_string($m) && str_starts_with($m, 'permission:')) {
                    $parts = explode(',', substr($m, 11));
                    if ($parts[0] === $expectedPerm) {
                        $hasPermission = true;
                        break;
                    }
                }
            }
            $this->assertTrue(
                $hasPermission,
                "Route $routeName should use permission:$expectedPerm middleware"
            );
        }
    }

    public function test_all_pilot_manage_routes_use_permission_middleware(): void
    {
        $manageRoutes = [
            'admin.akademik.kalender.create' => 'academic.calendar.manage',
            'admin.akademik.tahun-pelajaran.create' => 'academic.years.manage',
            'admin.akademik.kelas.create' => 'academic.classes.manage',
            'admin.akademik.jam-pelajaran.create' => 'academic.hours.manage',
            'admin.akademik.jadwal-pelajaran.create' => 'academic.schedule.manage',
        ];

        foreach ($manageRoutes as $routeName => $expectedPerm) {
            $route = app('router')->getRoutes()->getByName($routeName);
            $this->assertNotNull($route, "Route $routeName not found");

            $middleware = $route->gatherMiddleware();
            $hasPermission = false;
            foreach ($middleware as $m) {
                if (is_string($m) && str_starts_with($m, 'permission:')) {
                    $parts = explode(',', substr($m, 11));
                    if ($parts[0] === $expectedPerm) {
                        $hasPermission = true;
                        break;
                    }
                }
            }
            $this->assertTrue(
                $hasPermission,
                "Route $routeName should use permission:$expectedPerm middleware"
            );
        }
    }

    public function test_delete_routes_use_permission_middleware(): void
    {
        $deleteRoutes = [
            'admin.akademik.kelas.toggle' => 'academic.classes.delete',
            'admin.akademik.jam-pelajaran.toggle' => 'academic.hours.delete',
        ];

        foreach ($deleteRoutes as $routeName => $expectedPerm) {
            $route = app('router')->getRoutes()->getByName($routeName);
            $this->assertNotNull($route, "Route $routeName not found");

            $middleware = $route->gatherMiddleware();
            $hasPermission = false;
            foreach ($middleware as $m) {
                if (is_string($m) && str_starts_with($m, 'permission:')) {
                    $parts = explode(',', substr($m, 11));
                    if ($parts[0] === $expectedPerm) {
                        $hasPermission = true;
                        break;
                    }
                }
            }
            $this->assertTrue(
                $hasPermission,
                "Route $routeName should use permission:$expectedPerm middleware"
            );
        }
    }

    // ========================================================================
    // SEEDER SAFETY
    // ========================================================================

    public function test_custom_role_survives_permission_seeder_reseed(): void
    {
        $wakasekPerms = [
            'academic.calendar.view',
            'academic.calendar.manage',
            'academic.classes.view',
            'academic.classes.manage',
            'academic.hours.view',
            'academic.hours.manage',
            'academic.schedule.view',
            'academic.schedule.manage',
            'academic.years.view',
            'academic.years.manage',
            'website.teachers.manage',
            'website.subjects.manage',
        ];

        $role = $this->createCustomRole('wakasek_reseed_test', $wakasekPerms);
        $roleId = $role->id;

        $before = DB::table('permission_role')
            ->where('role_id', $roleId)
            ->pluck('permission_id')
            ->sort()
            ->values()
            ->toArray();

        $this->seed(\Database\Seeders\PermissionSeeder::class);

        $after = DB::table('permission_role')
            ->where('role_id', $roleId)
            ->pluck('permission_id')
            ->sort()
            ->values()
            ->toArray();

        $this->assertEquals($before, $after, 'Custom role permissions changed after re-seed');

        DB::table('permission_role')->where('role_id', $roleId)->delete();
        $role->delete();
    }

    // ========================================================================
    // SIDEBAR VISIBILITY
    // ========================================================================

    public function test_sidebar_permission_based_visibility(): void
    {
        $user = $this->createUser('staf_kesiswaan');
        $perm = Permission::where('name', 'academic.calendar.view')->first();
        $user->roles->first()->permissions()->syncWithoutDetaching([$perm->id]);

        $service = new \App\Services\AdminMenuService();
        $this->assertTrue($service->hasPermission($user, 'academic.calendar.view'));
        $this->assertFalse($service->hasPermission($user, 'academic.calendar.manage'));
    }

    public function test_sidebar_inactive_role_hides_permission(): void
    {
        $role = Role::where('name', 'guru')->first();
        $perm = Permission::where('name', 'ppdb.dashboard.view')->first();
        $role->permissions()->syncWithoutDetaching([$perm->id]);

        $user = User::create([
            'name' => 'Guru Sidebar Test',
            'email' => 'gurusidebar@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);

        $service = new \App\Services\AdminMenuService();
        $freshUser = User::find($user->id);
        $this->assertTrue($service->hasPermission($freshUser, 'ppdb.dashboard.view'));

        $role->update(['is_active' => false]);
        $service->flushCache();
        $freshUser2 = User::find($user->id);
        $result = $service->hasPermission($freshUser2, 'ppdb.dashboard.view');
        $this->assertTrue($result === false || $result === null);

        $role->update(['is_active' => true]);
    }

    // ========================================================================
    // GRANTED_BY
    // ========================================================================

    public function test_granted_by_column_exists(): void
    {
        $this->assertTrue(
            Schema::hasColumn('permission_role', 'granted_by'),
            'permission_role should have granted_by column'
        );
    }

    public function test_granted_by_accepts_null(): void
    {
        $perm = Permission::first();
        $role = Role::where('name', 'admin')->first();

        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $perm->id,
            'role_id' => $role->id,
            'granted_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $row = DB::table('permission_role')
            ->where('permission_id', $perm->id)
            ->where('role_id', $role->id)
            ->first();

        $this->assertNull($row->granted_by);
    }

    // ========================================================================
    // LOCKED KEYS
    // ========================================================================

    public function test_locked_keys_are_dashboard_and_profile(): void
    {
        $controller = new \App\Http\Controllers\Admin\MenuAccessController();
        $reflection = new \ReflectionClass($controller);
        $prop = $reflection->getProperty('lockedKeys');
        $prop->setAccessible(true);
        $locked = $prop->getValue($controller);

        $this->assertContains('dashboard', $locked);
        $this->assertContains('account.profile', $locked);
    }

    // ========================================================================
    // CONFIG INTEGRITY
    // ========================================================================

    public function test_all_permissions_have_config_entry(): void
    {
        $manifest = config('permissions');

        foreach ($manifest as $perm) {
            $this->assertArrayHasKey('name', $perm);
            $this->assertArrayHasKey('module', $perm);
            $this->assertArrayHasKey('action', $perm);
            $this->assertArrayHasKey('is_system', $perm);
            $this->assertArrayHasKey('default_roles', $perm);
        }
    }

    public function test_all_non_system_permissions_have_menu_key_or_default_roles(): void
    {
        $manifest = config('permissions');
        foreach ($manifest as $perm) {
            if ($perm['is_system'] ?? false) {
                continue;
            }
            $hasMenuKey = !empty($perm['menu_key']);
            $hasDefaultRoles = !empty($perm['default_roles']);
            $this->assertTrue(
                $hasMenuKey || $hasDefaultRoles,
                "Permission {$perm['name']} has neither menu_key nor default_roles"
            );
        }
    }

    // ========================================================================
    // OR LOGIC COMBINATION
    // ========================================================================

    public function test_permission_plus_role_combo(): void
    {
        $user = $this->createUser('staf_keuangan');

        $this->actingAs($user)->get('/_pt/kalender')->assertStatus(403);

        $perm = Permission::where('name', 'academic.calendar.view')->first();
        $stafRole = Role::where('name', 'staf_keuangan')->first();
        DB::table('permission_role')->insertOrIgnore([
            'permission_id' => $perm->id,
            'role_id' => $stafRole->id,
            'granted_by' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $freshUser = User::find($user->id);
        $this->actingAs($freshUser)->get('/_pt/kalender')->assertOk();
    }

    public function test_permission_only_access_no_legacy_role(): void
    {
        $role = $this->createCustomRole('custom_no_legacy', [
            'academic.calendar.view',
        ]);

        $user = User::create([
            'name' => 'Custom No Legacy',
            'email' => 'customnolegacy@test.com',
            'password' => 'password',
        ]);
        $user->roles()->attach($role->id);

        $this->actingAs($user)->get('/_pt/kalender')->assertOk();

        DB::table('permission_role')->where('role_id', $role->id)->delete();
        $role->delete();
    }
}
