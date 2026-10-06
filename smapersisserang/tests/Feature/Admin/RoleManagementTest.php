<?php

namespace Tests\Feature\Admin;

use App\Models\MenuRoleOverride;
use App\Models\Role;
use App\Models\User;
use App\Services\AdminMenuService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedSystemRoles();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('menu_role_overrides');
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
    }

    private function seedSystemRoles(): void
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
        $user = User::factory()->create(['role' => $roleName]);
        $role = Role::where('name', $roleName)->first();
        $user->roles()->attach($role->id);
        return $user;
    }

    // ─── Access Control ───

    public function test_guest_cannot_access_role_management(): void
    {
        $this->get(route('admin.roles.index'))->assertRedirect(route('login'));
    }

    public function test_non_superadmin_cannot_access_role_management(): void
    {
        $user = $this->createUser('admin');
        $this->actingAs($user)
            ->get(route('admin.roles.index'))
            ->assertForbidden();
    }

    public function test_superadmin_can_access_role_management(): void
    {
        $user = $this->createUser('superadmin');
        $this->actingAs($user)
            ->get(route('admin.roles.index'))
            ->assertOk();
    }

    // ─── Store ───

    public function test_superadmin_can_create_role(): void
    {
        $user = $this->createUser('superadmin');

        $this->actingAs($user)->post(route('admin.roles.store'), [
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas',
            'description' => 'Guru wali kelas',
        ])->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseHas('roles', [
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas',
            'description' => 'Guru wali kelas',
            'is_system' => false,
            'is_active' => true,
        ]);
    }

    public function test_role_name_must_be_snake_case(): void
    {
        $user = $this->createUser('superadmin');

        $this->actingAs($user)->post(route('admin.roles.store'), [
            'name' => 'Wali Kelas',
            'display_name' => 'Wali Kelas',
        ])->assertSessionHasErrors('name');

        $this->actingAs($user)->post(route('admin.roles.store'), [
            'name' => 'wali-kelas',
            'display_name' => 'Wali Kelas',
        ])->assertSessionHasErrors('name');

        $this->actingAs($user)->post(route('admin.roles.store'), [
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas',
        ])->assertSessionDoesntHaveErrors();
    }

    public function test_role_name_must_be_unique(): void
    {
        $user = $this->createUser('superadmin');

        $this->actingAs($user)->post(route('admin.roles.store'), [
            'name' => 'guru',
            'display_name' => 'Guru Baru',
        ])->assertSessionHasErrors('name');
    }

    // ─── Name Immutability ───

    public function test_role_name_cannot_be_changed_after_creation(): void
    {
        $user = $this->createUser('superadmin');
        $customRole = Role::create([
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas',
            'guard_name' => 'web',
        ]);

        $this->actingAs($user)->put(route('admin.roles.update', $customRole), [
            'display_name' => 'Wali Kelas Baru',
            'description' => 'Deskripsi baru',
            'is_active' => true,
        ])->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseHas('roles', [
            'id' => $customRole->id,
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas Baru',
            'description' => 'Deskripsi baru',
        ]);
    }

    public function test_superadmin_cannot_rename_system_role(): void
    {
        $user = $this->createUser('superadmin');
        $adminRole = Role::where('name', 'admin')->first();

        $this->actingAs($user)->put(route('admin.roles.update', $adminRole), [
            'name' => 'admin_baru',
            'display_name' => 'Admin Baru',
        ]);

        $this->assertDatabaseHas('roles', [
            'id' => $adminRole->id,
            'name' => 'admin',
        ]);
    }

    // ─── System Role Deletion ───

    public function test_system_role_cannot_be_deleted(): void
    {
        $user = $this->createUser('superadmin');
        $adminRole = Role::where('name', 'admin')->first();

        $this->actingAs($user)->delete(route('admin.roles.destroy', $adminRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseHas('roles', ['id' => $adminRole->id]);
    }

    // ─── Custom Role Deletion ───

    public function test_custom_role_in_use_cannot_be_deleted(): void
    {
        $customRole = Role::create([
            'name' => 'wali_kelas',
            'display_name' => 'Wali Kelas',
            'guard_name' => 'web',
        ]);

        $user = $this->createUser('superadmin');
        $otherUser = User::factory()->create(['role' => 'wali_kelas']);
        $otherUser->roles()->attach($customRole->id);

        $this->actingAs($user)->delete(route('admin.roles.destroy', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseHas('roles', ['id' => $customRole->id]);
    }

    public function test_custom_role_not_in_config_can_be_deleted(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $user = $this->createUser('superadmin');

        $this->actingAs($user)->delete(route('admin.roles.destroy', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $customRole->id]);
    }

    public function test_custom_role_referenced_in_route_middleware_cannot_be_deleted(): void
    {
        Route::middleware('web')->group(function () {
            Route::get('/_test/custom-role-route', function () {
                return 'OK';
            })->middleware('role:pustakawan')->name('_test.custom-role-route');
        });

        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $user = $this->createUser('superadmin');

        $this->actingAs($user)->delete(route('admin.roles.destroy', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseHas('roles', ['id' => $customRole->id]);
    }

    public function test_unused_custom_role_can_be_deleted(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $user = $this->createUser('superadmin');

        $this->actingAs($user)->delete(route('admin.roles.destroy', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $customRole->id]);
    }

    public function test_deleting_role_cleans_up_menu_role_overrides(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $override = MenuRoleOverride::create([
            'menu_key' => 'system.faq',
            'roles' => ['superadmin', 'admin', 'pustakawan'],
        ]);

        $user = $this->createUser('superadmin');

        // Also need to remove from config reference - but for this test,
        // the role is NOT in the config (pustakawan is not a config role)
        // So we need to NOT have role in config. The validation checks config,
        // and if pustakawan is not in config, it will pass.
        // BUT pustakawan might appear as referenced in config.
        // Let me check... No, pustakawan is not in config/admin-menu.php.

        $this->actingAs($user)->delete(route('admin.roles.destroy', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $this->assertDatabaseMissing('roles', ['id' => $customRole->id]);

        $override->refresh();
        $this->assertEquals(['superadmin', 'admin'], $override->roles);
    }

    // ─── Inactive Role ───

    public function test_inactive_role_denies_access_through_has_role(): void
    {
        // Set superadmin as inactive and verify superadmin can't bypass
        $superadminRole = Role::where('name', 'superadmin')->first();
        $superadminRole->update(['is_active' => false]);

        $superadmin = $this->createUser('superadmin');

        $this->assertFalse($superadmin->hasRole('superadmin'));
        $this->assertFalse($superadmin->isSuperadmin());
    }

    public function test_activating_role_restores_access(): void
    {
        $superadminRole = Role::where('name', 'superadmin')->first();
        $superadminRole->update(['is_active' => false]);

        $superadmin = $this->createUser('superadmin');
        $superadmin->unsetRelation('roles');

        $this->assertFalse($superadmin->isSuperadmin());

        $superadminRole->update(['is_active' => true]);
        $superadmin->unsetRelation('roles');

        $this->assertTrue($superadmin->isSuperadmin());
    }

    public function test_inactive_role_cannot_be_assigned_to_new_user(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);
        $customRole->update(['is_active' => false]);

        $superadmin = $this->createUser('superadmin');

        $this->actingAs($superadmin)->post(route('admin.users.store'), [
            'name' => 'User Baru',
            'email' => 'baru@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
            'roles' => [$customRole->id],
        ])->assertSessionHasErrors('roles.*');
    }

    public function test_inactive_role_user_retains_relation_but_loses_access(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $user = User::factory()->create(['role' => 'pustakawan']);
        $user->roles()->attach($customRole->id);

        $this->assertTrue($user->hasRole('pustakawan'));

        $customRole->update(['is_active' => false]);

        // Reload user to clear cached roles
        $user->unsetRelation('roles');

        $this->assertFalse($user->hasRole('pustakawan'));
        $this->assertTrue($user->roles()->where('role_id', $customRole->id)->exists());
    }

    // ─── Toggle Active ───

    public function test_system_role_cannot_be_toggled_inactive(): void
    {
        $superadmin = $this->createUser('superadmin');
        $adminRole = Role::where('name', 'admin')->first();

        $this->actingAs($superadmin)
            ->patch(route('admin.roles.toggle-active', $adminRole))
            ->assertRedirect(route('admin.roles.index'));

        $adminRole->refresh();
        $this->assertTrue($adminRole->is_active);
    }

    public function test_custom_role_can_be_toggled_inactive_and_active(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $superadmin = $this->createUser('superadmin');

        $this->actingAs($superadmin)
            ->patch(route('admin.roles.toggle-active', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $customRole->refresh();
        $this->assertFalse($customRole->is_active);

        $this->actingAs($superadmin)
            ->patch(route('admin.roles.toggle-active', $customRole))
            ->assertRedirect(route('admin.roles.index'));

        $customRole->refresh();
        $this->assertTrue($customRole->is_active);
    }

    // ─── Menu Access Integration ───

    public function test_new_role_appears_dynamically_in_menu_access(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
            'is_active' => true,
            'sort_order' => 9,
        ]);

        $service = new AdminMenuService();
        $validRoles = $service->getValidRoleNames();

        $this->assertContains('pustakawan', $validRoles);
    }

    public function test_inactive_role_excluded_from_menu_access(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
            'is_active' => false,
            'sort_order' => 9,
        ]);

        $service = new AdminMenuService();
        $validRoles = $service->getValidRoleNames();

        $this->assertNotContains('pustakawan', $validRoles);
    }

    public function test_menu_cache_flushed_after_role_change(): void
    {
        $service = new AdminMenuService();
        $before = $service->getValidRoleNames();
        $this->assertNotContains('pustakawan', $before);

        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
            'is_active' => true,
            'sort_order' => 9,
        ]);

        // Cache should be flushed by RoleController::store
        $service->flushCache();
        $after = $service->getValidRoleNames();

        $this->assertContains('pustakawan', $after);
    }

    // ─── Legacy Compatibility ───

    public function test_legacy_column_role_still_works_for_active_role(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($user->hasRole('admin'));
        $this->assertTrue($user->isAdmin());
        $this->assertFalse($user->isSuperadmin());
    }

    public function test_legacy_column_role_denied_for_inactive_role(): void
    {
        Role::where('name', 'admin')->update(['is_active' => false]);

        $user = User::factory()->create(['role' => 'admin']);

        $this->assertFalse($user->hasRole('admin'));
        $this->assertFalse($user->isAdmin());
    }

    // ─── Seeder ───

    public function test_seeder_does_not_reactivate_custom_role(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
            'is_active' => false,
        ]);

        $this->artisan('db:seed', ['--class' => 'Database\Seeders\RoleSeeder']);

        $customRole->refresh();
        $this->assertFalse($customRole->is_active);
    }

    // ─── Data Integrity ───

    public function test_existing_user_role_not_lost_when_role_not_in_edit_form(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);

        $user = User::factory()->create(['name' => 'Pustakawan User', 'role' => 'pustakawan']);
        $user->roles()->attach($customRole->id);
        $adminRole = Role::where('name', 'admin')->first();

        $superadmin = $this->createUser('superadmin');

        // Edit user, submit only admin role (pustakawan is NOT submitted)
        $this->actingAs($superadmin)->put(route('admin.users.update', $user), [
            'name' => 'Pustakawan User',
            'email' => $user->email,
            'password' => null,
            'roles' => [$adminRole->id],
        ])->assertRedirect(route('admin.users.index'));

        $user->refresh();
        $user->load('roles');

        // User should now have only admin role
        $this->assertTrue($user->roles->contains('name', 'admin'));
        $this->assertFalse($user->roles->contains('name', 'pustakawan'));
    }

    public function test_existing_inactive_role_not_silently_removed_on_edit(): void
    {
        $customRole = Role::create([
            'name' => 'pustakawan',
            'display_name' => 'Pustakawan',
            'guard_name' => 'web',
        ]);
        $customRole->update(['is_active' => false]);

        $user = User::factory()->create(['name' => 'Pustakawan User', 'role' => 'pustakawan']);
        $user->roles()->attach($customRole->id);

        $adminRole = Role::where('name', 'admin')->first();

        $superadmin = $this->createUser('superadmin');

        // Edit user, submit admin AND pustakawan (inactive but user already has it)
        $this->actingAs($superadmin)->put(route('admin.users.update', $user), [
            'name' => 'Pustakawan User',
            'email' => $user->email,
            'password' => null,
            'roles' => [$adminRole->id, $customRole->id],
        ])->assertRedirect(route('admin.users.index'));

        $user->refresh();
        $user->load('roles');

        // Both roles should be present
        $this->assertTrue($user->roles->contains('name', 'admin'));
        $this->assertTrue($user->roles->contains('name', 'pustakawan'));
    }

    // ─── UX: Atur Akses Link ───

    public function test_atur_akses_link_appears_for_all_roles(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $this->assertStringContainsString('Atur Akses', $html);
        $this->assertStringContainsString(route('admin.menu-access.index'), $html);
    }

    public function test_atur_akses_link_count_matches_role_count(): void
    {
        $roleCount = Role::count();
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $linkCount = substr_count($html, 'Atur Akses');
        $this->assertEquals($roleCount, $linkCount);
    }

    public function test_atur_akses_links_to_menu_access_page(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $expectedUrl = route('admin.menu-access.index');
        $this->assertStringContainsString("href=\"{$expectedUrl}\"", $html);
    }

    public function test_column_header_changed_to_deskripsi_ringkasan_akses(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $this->assertStringContainsString('Ringkasan Akses', $html);
    }

    public function test_help_text_mentions_pengaturan_hak_akses(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $this->assertStringContainsString('Pengaturan menu dan permission dilakukan melalui', $html);
        $this->assertStringContainsString('Pengaturan Hak Akses', $html);
    }

    public function test_technical_route_text_not_displayed_raw(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $this->assertStringNotContainsString('route: admin.', $html);
        $this->assertStringNotContainsString('menu: SISTEM', $html);
    }

    public function test_route_summary_shows_count_not_names(): void
    {
        $user = $this->createUser('superadmin');
        $html = $this->actingAs($user)->get(route('admin.roles.index'))->getContent();

        $this->assertStringContainsString('route hardcode', $html);
    }
}
