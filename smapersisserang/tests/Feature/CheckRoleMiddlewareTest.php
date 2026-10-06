<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CheckRoleMiddlewareTest extends TestCase
{
    private string $testRoute = '/_test/check-role';

    protected function setUp(): void
    {
        parent::setUp();

        $this->createUsersTable();
        $this->createRolesTable();
        $this->createRoleUserTable();
        $this->seedDefaultRoles();

        Route::middleware('web')->group(function () {
            Route::middleware('auth')->get($this->testRoute, function () {
                return 'OK';
            })->name('test.check-role');

            Route::middleware(['auth', 'role:admin,guru'])->get($this->testRoute . '/admin-guru', function () {
                return 'OK';
            })->name('test.check-role.admin-guru');

            Route::middleware(['auth', 'role:superadmin'])->get($this->testRoute . '/superadmin-only', function () {
                return 'OK';
            })->name('test.check-role.superadmin');
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
        parent::tearDown();
    }

    private function createUsersTable(): void
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
    }

    private function createRolesTable(): void
    {
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
    }

    private function createRoleUserTable(): void
    {
        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });
    }

    private function seedDefaultRoles(): void
    {
        $systemRoles = [
            'superadmin' => ['display_name' => 'Superadmin', 'sort_order' => 1],
            'admin' => ['display_name' => 'Admin', 'sort_order' => 2],
            'guru' => ['display_name' => 'Guru', 'sort_order' => 4],
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

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get($this->testRoute . '/admin-guru')
            ->assertRedirectToRoute('login');
    }

    public function test_user_without_any_role_gets_403(): void
    {
        $user = User::factory()->create(['role' => '']);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertStatus(403);
    }

    public function test_user_with_allowed_role_can_access(): void
    {
        $user = User::factory()->create(['role' => 'guru']);
        $guruRole = Role::where('name', 'guru')->first();
        $user->roles()->attach($guruRole->id);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertOk()
            ->assertSee('OK');
    }

    public function test_user_with_one_of_multiple_allowed_roles_can_access(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $adminRole = Role::where('name', 'admin')->first();
        $user->roles()->attach($adminRole->id);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertOk()
            ->assertSee('OK');
    }

    public function test_superadmin_can_access_any_role_protected_route(): void
    {
        $user = User::factory()->create(['role' => 'superadmin']);
        $superadminRole = Role::where('name', 'superadmin')->first();
        $user->roles()->attach($superadminRole->id);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertOk()
            ->assertSee('OK');
    }

    public function test_superadmin_can_access_superadmin_only_route(): void
    {
        $user = User::factory()->create(['role' => 'superadmin']);
        $superadminRole = Role::where('name', 'superadmin')->first();
        $user->roles()->attach($superadminRole->id);

        $this->actingAs($user)
            ->get($this->testRoute . '/superadmin-only')
            ->assertOk()
            ->assertSee('OK');
    }

    public function test_non_superadmin_cannot_access_superadmin_only_route(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $adminRole = Role::where('name', 'admin')->first();
        $user->roles()->attach($adminRole->id);

        $this->actingAs($user)
            ->get($this->testRoute . '/superadmin-only')
            ->assertStatus(403);
    }

    public function test_legacy_user_with_column_role_still_works(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertOk()
            ->assertSee('OK');
    }

    public function test_legacy_user_without_pivot_gets_403_if_wrong_role(): void
    {
        $user = User::factory()->create(['role' => 'guru']);

        $this->actingAs($user)
            ->get($this->testRoute . '/superadmin-only')
            ->assertStatus(403);
    }

    public function test_multiple_role_user_can_access(): void
    {
        $user = User::factory()->create(['role' => 'guru']);
        $guruRole = Role::where('name', 'guru')->first();
        $adminRole = Role::where('name', 'admin')->first();
        $user->roles()->attach([$guruRole->id, $adminRole->id]);

        $this->actingAs($user)
            ->get($this->testRoute . '/admin-guru')
            ->assertOk()
            ->assertSee('OK');
    }
}
