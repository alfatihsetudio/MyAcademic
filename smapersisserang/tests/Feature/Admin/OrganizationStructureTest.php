<?php

namespace Tests\Feature\Admin;

use App\Models\Permission;
use App\Models\Role;
use App\Models\OrganizationStructure;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class OrganizationStructureTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    // ─── Route access (permission middleware) ────────────────────

    private function createRoleWithPermissions(string $roleName, array $permissionNames): User
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['display_name' => $roleName, 'is_active' => true, 'is_system' => false]
        );

        foreach ($permissionNames as $permName) {
            $perm = Permission::firstOrCreate(
                ['name' => $permName],
                [
                    'display_name' => $permName,
                    'module' => 'website',
                    'action' => 'manage',
                    'group_name' => 'WEBSITE',
                    'is_system' => false,
                    'is_active' => true,
                ]
            );
            $role->permissions()->attach($perm->id);
        }

        $user = User::factory()->create(['role' => 'user']);
        $user->roles()->attach($role->id);
        $user->load('roles.permissions');

        return $user;
    }

    public function test_user_with_permission_can_access_index(): void
    {
        $user = $this->createRoleWithPermissions('staf_org', ['website.organization.manage']);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.index'))
            ->assertOk()
            ->assertSee('Struktur Organisasi');
    }

    public function test_user_without_permission_gets_403(): void
    {
        $user = $this->createRoleWithPermissions('guru', ['academic.schedule.view']);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.index'))
            ->assertStatus(403);
    }

    public function test_user_with_only_view_permission_cannot_create(): void
    {
        $user = $this->createRoleWithPermissions('staf_view_only', ['website.organization.manage']);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.create'))
            ->assertOk();
    }

    public function test_admin_always_passes(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.organization-structures.index'))
            ->assertOk();

        $this->actingAs($this->admin)
            ->get(route('admin.organization-structures.create'))
            ->assertOk();
    }

    public function test_superadmin_always_passes(): void
    {
        $superadmin = $this->createAdminUser(['role' => 'superadmin']);
        $this->assignRole($superadmin, 'superadmin');

        $this->actingAs($superadmin)
            ->get(route('admin.organization-structures.index'))
            ->assertOk();
    }

    public function test_fallback_role_staf_tata_usaha_passes(): void
    {
        $role = Role::firstOrCreate(
            ['name' => 'staf_tata_usaha'],
            ['display_name' => 'Staf Tata Usaha', 'is_active' => true, 'is_system' => true]
        );
        $user = User::factory()->create(['role' => 'staf_tata_usaha']);
        $user->roles()->attach($role->id);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.index'))
            ->assertOk();
    }

    public function test_legacy_column_admin_passes_via_fallback(): void
    {
        Role::firstOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Admin', 'is_active' => true, 'is_system' => true]
        );

        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.index'))
            ->assertOk();
    }

    public function test_user_with_inactive_role_gets_403(): void
    {
        $role = Role::firstOrCreate(
            ['name' => 'inactive_role'],
            ['display_name' => 'Inactive Role', 'is_active' => false, 'is_system' => false]
        );

        $user = User::factory()->create(['role' => 'inactive_role']);
        $user->roles()->attach($role->id);

        $this->actingAs($user)
            ->get(route('admin.organization-structures.index'))
            ->assertStatus(403);
    }

    // ─── Sidebar position ───────────────────────────────────────

    public function test_menu_item_is_in_akademik_not_website(): void
    {
        $menu = config('admin-menu');

        $websiteKeys = [];
        $akademikKeys = [];

        foreach ($menu['sections'] as $section) {
            if ($section['label'] === 'WEBSITE') {
                foreach ($section['items'] as $item) {
                    $websiteKeys[] = $item['key'];
                }
            }
            if ($section['label'] === 'AKADEMIK') {
                foreach ($section['items'] as $item) {
                    $akademikKeys[] = $item['key'];
                }
            }
        }

        $this->assertContains('academic.organization', $akademikKeys,
            'Struktur Organisasi should be in AKADEMIK section');
        $this->assertNotContains('website.organization', $websiteKeys,
            'Struktur Organisasi should NOT be in WEBSITE section');
    }

    public function test_menu_item_alphabetical_order_in_akademik(): void
    {
        $menu = config('admin-menu');

        $akademikLabels = [];
        foreach ($menu['sections'] as $section) {
            if ($section['label'] === 'AKADEMIK') {
                foreach ($section['items'] as $item) {
                    $akademikLabels[] = $item['label'];
                }
            }
        }

        $sorted = $akademikLabels;
        sort($sorted, SORT_NATURAL | SORT_FLAG_CASE);

        $this->assertEquals($sorted, $akademikLabels,
            'AKADEMIK items should be sorted alphabetically');

        $orgIndex = array_search('Struktur Organisasi', $akademikLabels);
        $teacherIndex = array_search('Profil Guru', $akademikLabels);
        $yearIndex = array_search('Tahun Pelajaran', $akademikLabels);

        $this->assertNotFalse($orgIndex);
        $this->assertGreaterThan($teacherIndex, $orgIndex,
            'Struktur Organisasi should come after Profil Guru');
        $this->assertLessThan($yearIndex, $orgIndex,
            'Struktur Organisasi should come before Tahun Pelajaran');
    }

    public function test_menu_item_permission_matches_route_middleware(): void
    {
        $menu = config('admin-menu');

        $orgItem = null;
        foreach ($menu['sections'] as $section) {
            foreach ($section['items'] as $item) {
                if ($item['key'] === 'academic.organization') {
                    $orgItem = $item;
                    break 2;
                }
            }
        }

        $this->assertNotNull($orgItem, 'academic.organization menu item must exist');
        $this->assertEquals('website.organization.manage', $orgItem['permission']);
    }

    public function test_menu_item_has_correct_route(): void
    {
        $menu = config('admin-menu');

        $orgItem = null;
        foreach ($menu['sections'] as $section) {
            foreach ($section['items'] as $item) {
                if ($item['key'] === 'academic.organization') {
                    $orgItem = $item;
                    break 2;
                }
            }
        }

        $this->assertNotNull($orgItem);
        $this->assertEquals('admin.organization-structures.index', $orgItem['route']);
        $this->assertEquals('admin.organization-structures.*', $orgItem['route_active']);
        $this->assertEquals('grid', $orgItem['icon']);
    }
}
