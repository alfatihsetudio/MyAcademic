<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PermissionFoundationTest extends TestCase
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

    public function test_config_has_82_permissions(): void
    {
        $manifest = config('permissions');
        $this->assertCount(82, $manifest);
    }

    public function test_database_has_82_permissions_after_seeding(): void
    {
        $this->assertEquals(82, Permission::count());
    }

    public function test_permission_names_are_unique(): void
    {
        $names = Permission::pluck('name')->toArray();
        $this->assertEquals(count($names), count(array_unique($names)));
    }

    public function test_no_orphan_permissions_in_db(): void
    {
        $manifest = config('permissions');
        $manifestNames = array_column($manifest, 'name');
        $dbNames = Permission::pluck('name')->toArray();
        $orphan = array_diff($dbNames, $manifestNames);
        $this->assertEmpty($orphan, 'Orphan permissions: ' . implode(', ', $orphan));
    }

    public function test_no_missing_permissions_from_config(): void
    {
        $manifest = config('permissions');
        $manifestNames = array_column($manifest, 'name');
        $dbNames = Permission::pluck('name')->toArray();
        $missing = array_diff($manifestNames, $dbNames);
        $this->assertEmpty($missing, 'Missing permissions: ' . implode(', ', $missing));
    }

    public function test_has_exactly_4_system_permissions(): void
    {
        $systemPerms = Permission::where('is_system', true)->get();
        $this->assertCount(4, $systemPerms);

        $expected = [
            'system.users.manage',
            'system.roles.manage',
            'system.permissions.manage',
            'system.menu.manage',
        ];
        foreach ($expected as $name) {
            $this->assertTrue(
                $systemPerms->contains('name', $name),
                "System permission '$name' not found"
            );
        }
    }

    public function test_admin_gets_all_non_system_permissions(): void
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
        $this->assertEmpty(
            $missing,
            'Admin missing non-system permissions: ' . implode(', ', $missing)
        );
        $this->assertCount(count($nonSystem), $adminPerms);

        foreach ($excluded as $name) {
            $this->assertNotContains($name, $adminPerms, "Admin must not hold '$name'");
        }
    }

    public function test_admin_gets_zero_system_permissions(): void
    {
        $admin = Role::where('name', 'admin')->first();
        $adminPerms = $admin->permissions->pluck('name')->toArray();
        $system = Permission::where('is_system', true)->pluck('name')->toArray();
        $intersection = array_intersect($system, $adminPerms);

        $this->assertEmpty(
            $intersection,
            'Admin should not have system permissions: ' . implode(', ', $intersection)
        );
    }

    public function test_seeder_is_idempotent(): void
    {
        $permCountBefore = Permission::count();
        $pivotCountBefore = DB::table('permission_role')->count();

        $this->seed(\Database\Seeders\PermissionSeeder::class);

        $this->assertEquals($permCountBefore, Permission::count());
        $this->assertEquals($pivotCountBefore, DB::table('permission_role')->count());
    }

    public function test_no_duplicate_permission_role_pairs(): void
    {
        $dupes = DB::table('permission_role')
            ->select('permission_id', 'role_id', DB::raw('COUNT(*) as cnt'))
            ->groupBy('permission_id', 'role_id')
            ->having('cnt', '>', 1)
            ->get();

        $this->assertCount(0, $dupes, 'Duplicate permission_role pairs exist');
    }

    public function test_all_route_names_in_manifest_are_valid(): void
    {
        $manifest = config('permissions');
        $invalidRoutes = [];
        foreach ($manifest as $perm) {
            foreach ($perm['routes'] ?? [] as $routeName) {
                if (!Route::has($routeName)) {
                    $invalidRoutes[] = $routeName;
                }
            }
        }
        $this->assertEmpty($invalidRoutes, 'Invalid routes: ' . implode(', ', $invalidRoutes));
    }

    public function test_all_admin_routes_mapped_to_permission(): void
    {
        $manifest = config('permissions');
        $mappedRoutes = [];
        foreach ($manifest as $perm) {
            foreach ($perm['routes'] ?? [] as $routeName) {
                $mappedRoutes[$routeName] = true;
            }
        }

        $unmapped = [];
        foreach (Route::getRoutes() as $route) {
            $name = $route->getName();
            if ($name !== null && str_starts_with($name, 'admin.')) {
                if (!isset($mappedRoutes[$name])) {
                    $unmapped[] = $name;
                }
            }
        }

        $this->assertEmpty($unmapped, 'Unmapped routes: ' . implode(', ', $unmapped));
    }

    public function test_middleware_parity_match(): void
    {
        $manifest = config('permissions');
        $routeToPerm = [];
        foreach ($manifest as $perm) {
            foreach ($perm['routes'] ?? [] as $r) {
                $routeToPerm[$r] = [
                    'default_roles' => $perm['default_roles'] ?? [],
                    'is_system' => $perm['is_system'] ?? false,
                ];
            }
        }

        $mismatches = [];
        foreach (Route::getRoutes() as $route) {
            $name = $route->getName();
            if ($name === null || !str_starts_with($name, 'admin.')) continue;
            if (!isset($routeToPerm[$name])) continue;

            $mapping = $routeToPerm[$name];
            $middleware = $route->middleware();
            if (is_string($middleware)) $middleware = [$middleware];

            $legacyRoles = [];
            foreach ($middleware as $mw) {
                if (str_starts_with($mw, 'role:')) {
                    $legacyRoles = array_merge($legacyRoles, array_map('trim', explode(',', substr($mw, 5))));
                }
                if (str_starts_with($mw, 'permission:')) {
                    $parts = explode(',', substr($mw, 11));
                    $legacyRoles = array_merge($legacyRoles, array_map('trim', array_slice($parts, 1)));
                }
                if ($mw === 'superadmin') $legacyRoles[] = 'superadmin';
            }
            $legacyRoles = array_values(array_unique($legacyRoles));
            $compareRoles = array_values(array_filter($legacyRoles, fn($r) => $r !== 'superadmin'));
            $defaultRoles = $mapping['default_roles'];

            if ($mapping['is_system'] && empty($compareRoles)) continue;

            sort($compareRoles);
            sort($defaultRoles);
            if ($compareRoles !== $defaultRoles) {
                $mismatches[] = "$name: legacy=[" . implode(',', $legacyRoles) . '] vs config=[' . implode(',', $mapping['default_roles']) . ']';
            }
        }

        $this->assertEmpty($mismatches, 'Parity mismatches: ' . PHP_EOL . implode(PHP_EOL, $mismatches));
    }

    public function test_staf_tata_usaha_has_website_menus_manage(): void
    {
        $tu = Role::where('name', 'staf_tata_usaha')->first();
        $this->assertNotNull($tu);
        $this->assertTrue(
            $tu->permissions->contains('name', 'website.menus.manage'),
            'staf_tata_usaha should have website.menus.manage'
        );
    }

    public function test_staf_tata_usaha_does_not_have_system_menu_manage(): void
    {
        $tu = Role::where('name', 'staf_tata_usaha')->first();
        $this->assertNotNull($tu);
        $this->assertFalse(
            $tu->permissions->contains('name', 'system.menu.manage'),
            'staf_tata_usaha should NOT have system.menu.manage'
        );
    }

    public function test_staf_tata_usaha_has_donation_transactions_permissions_by_default(): void
    {
        $tu = Role::where('name', 'staf_tata_usaha')->first();
        $this->assertNotNull($tu);
        $this->assertTrue(
            $tu->permissions->contains('name', 'donation.transactions.view'),
            'staf_tata_usaha should have donation.transactions.view by default'
        );
        $this->assertTrue(
            $tu->permissions->contains('name', 'donation.transactions.manage'),
            'staf_tata_usaha should have donation.transactions.manage by default'
        );
    }

    public function test_system_permissions_manage_is_reserved(): void
    {
        $perm = Permission::where('name', 'system.permissions.manage')->first();
        $this->assertNotNull($perm);
        $this->assertTrue($perm->is_system);

        $assignments = DB::table('permission_role')
            ->where('permission_id', $perm->id)
            ->count();
        $this->assertEquals(0, $assignments, 'system.permissions.manage should have 0 assignments');
    }

    public function test_all_menu_permission_keys_are_valid(): void
    {
        $menuConfig = config('admin-menu');
        $validNames = Permission::pluck('name')->toArray();

        $menuPerms = [];
        $walk = function($items) use (&$walk, &$menuPerms) {
            if (!is_array($items)) return;
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                if (isset($item['permission'])) $menuPerms[] = $item['permission'];
                if (isset($item['children'])) $walk($item['children']);
                if (isset($item['items'])) $walk($item['items']);
                if (array_is_list($item)) $walk($item);
            }
        };
        $walk($menuConfig['admin'] ?? $menuConfig);

        $invalid = array_diff(array_unique($menuPerms), $validNames);
        $this->assertEmpty($invalid, 'Invalid menu permissions: ' . implode(', ', $invalid));
    }

    public function test_admin_menu_structure_unchanged(): void
    {
        $menuConfig = config('admin-menu');
        $walk = function($items) use (&$walk) {
            if (!is_array($items)) return;
            foreach ($items as $item) {
                if (!is_array($item)) continue;
                if (isset($item['roles'])) {
                    $this->assertIsArray($item['roles'], 'roles should be array (use [] for all)');
                }
                if (isset($item['children'])) $walk($item['children']);
                if (isset($item['items'])) $walk($item['items']);
                if (array_is_list($item)) $walk($item);
            }
        };
        $walk($menuConfig['admin'] ?? $menuConfig);
    }

    public function test_custom_role_permissions_untouched(): void
    {
        $customRole = Role::create([
            'name' => 'custom_test_role_fase0',
            'display_name' => 'Custom Test Role',
            'guard_name' => 'web',
        ]);

        $perm = Permission::first();
        DB::table('permission_role')->insert([
            'permission_id' => $perm->id,
            'role_id' => $customRole->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $before = $customRole->permissions->pluck('id')->sort()->values()->toArray();

        $this->seed(\Database\Seeders\PermissionSeeder::class);

        $customRole->refresh();
        $after = $customRole->permissions->pluck('id')->sort()->values()->toArray();

        $this->assertEquals($before, $after, 'Custom role permissions changed after re-seed');

        DB::table('permission_role')->where('role_id', $customRole->id)->delete();
        $customRole->delete();
    }
}
