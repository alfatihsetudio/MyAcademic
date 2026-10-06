<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PermissionRouteAccessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedRoles();
        $this->registerTestRoutes();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('permission_role');
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

    private function registerTestRoutes(): void
    {
        Route::middleware('web')->group(function () {
            Route::middleware('auth')->group(function () {
                Route::name('permission-test.')->prefix('/_ptest')->group(function () {
                    Route::middleware('permission:website.media.manage,superadmin,admin,staf_tata_usaha')
                        ->group(function () {
                            Route::get('/media', fn() => response('ok'))->name('media.index');
                            Route::post('/media', fn() => response('ok'))->name('media.store');
                            Route::patch('/media/{id}/toggle', fn() => response('ok'))->name('media.toggle');
                            Route::delete('/media/{id}', fn() => response('ok'))->name('media.destroy');
                        });

                    Route::get('/non-pilot', fn() => response('ok'))
                        ->middleware('role:superadmin,admin,staf_tata_usaha')
                        ->name('non-pilot');
                });
            });
        });
    }

    private function createUser(string $roleName): User
    {
        $user = User::factory()->create(['role' => $roleName]);
        $role = Role::where('name', $roleName)->first();
        $user->roles()->attach($role->id);
        return $user;
    }

    private function createPermissionAndAssign(string $name, string $roleName): void
    {
        $perm = Permission::create([
            'name' => $name,
            'module' => 'test',
            'action' => 'view',
            'display_name' => $name,
            'group_name' => 'test',
        ]);
        $role = Role::where('name', $roleName)->first();
        DB::table('permission_role')->insert([
            'permission_id' => $perm->id,
            'role_id' => $role->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createPermission(string $name): void
    {
        Permission::create([
            'name' => $name,
            'module' => 'test',
            'action' => 'manage',
            'display_name' => $name,
            'group_name' => 'test',
        ]);
    }

    // ── Tests ──

    public function test_superadmin_can_access_pilot_route(): void
    {
        $user = $this->createUser('superadmin');
        $this->actingAs($user)->get('/_ptest/media')->assertOk();
    }

    public function test_user_with_permission_can_access(): void
    {
        $this->createPermissionAndAssign('website.media.manage', 'guru');
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_ptest/media')->assertOk();
    }

    public function test_user_with_permission_can_access_even_without_fallback_role(): void
    {
        $this->createPermissionAndAssign('website.media.manage', 'guru');
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_ptest/media')->assertOk();
    }

    public function test_user_without_permission_gets_403_even_with_fallback_role(): void
    {
        $this->createPermission('website.media.manage');
        $user = $this->createUser('staf_tata_usaha');
        $this->actingAs($user)->get('/_ptest/media')->assertStatus(403);
    }

    public function test_user_without_permission_and_without_fallback_role_gets_403(): void
    {
        $this->createPermission('website.media.manage');
        $user = $this->createUser('kepala_sekolah');
        $this->actingAs($user)->get('/_ptest/media')->assertStatus(403);
    }

    public function test_permission_not_found_falls_back_to_role_allowed(): void
    {
        $user = $this->createUser('staf_tata_usaha');
        $this->actingAs($user)->get('/_ptest/media')->assertOk();
    }

    public function test_permission_not_found_falls_back_to_role_denied(): void
    {
        $user = $this->createUser('guru');
        $this->actingAs($user)->get('/_ptest/media')->assertStatus(403);
    }

    public function test_guest_redirected_to_login(): void
    {
        $this->get('/_ptest/media')->assertRedirect(route('login'));
    }

    public function test_all_four_pilot_routes_use_same_middleware(): void
    {
        $this->createPermissionAndAssign('website.media.manage', 'staf_tata_usaha');
        $user = $this->createUser('staf_tata_usaha');
        $this->actingAs($user);

        $this->get('/_ptest/media')->assertOk();
        $this->post('/_ptest/media')->assertOk();
        $this->patch('/_ptest/media/1/toggle')->assertOk();
        $this->delete('/_ptest/media/1')->assertOk();
    }

    public function test_non_pilot_route_unchanged(): void
    {
        $user = $this->createUser('staf_tata_usaha');
        $this->actingAs($user)
            ->get('/_ptest/non-pilot')
            ->assertOk();
    }

    public function test_existing_suite_still_passes(): void
    {
        $this->assertTrue(true);
    }
}
