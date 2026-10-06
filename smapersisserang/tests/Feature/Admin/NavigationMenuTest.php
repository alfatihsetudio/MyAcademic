<?php

namespace Tests\Feature\Admin;

use App\Models\NavigationMenu;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class NavigationMenuTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    public function test_guest_cannot_access_admin_menus_index(): void
    {
        $this->get(route('admin.website.menus.index'))
            ->assertRedirect(route('login'));
    }

    public function test_guest_cannot_access_admin_menus_edit(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
        ]);

        $this->get(route('admin.website.menus.edit', $menu))
            ->assertRedirect(route('login'));
    }

    public function test_guest_cannot_update_menu(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
        ]);

        $this->put(route('admin.website.menus.update', $menu), [
            'label' => 'Changed',
        ])->assertRedirect(route('login'));
    }

    public function test_admin_can_view_index_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.menus.index'))
            ->assertStatus(200);
    }

    public function test_admin_can_view_edit_page(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.website.menus.edit', $menu))
            ->assertStatus(200)
            ->assertSee('Test Menu')
            ->assertSee('Label')
            ->assertSee('Parent Menu')
            ->assertSee('Urutan')
            ->assertSee('Lokasi')
            ->assertSee('Aktif')
            ->assertSee('Tipe Link')
            ->assertSee('Route Internal');
    }

    public function test_admin_can_update_label(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Label Lama',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Label Baru',
                'location' => 'public_header',
                'is_active' => true,
            ])
            ->assertRedirect(route('admin.website.menus.index'))
            ->assertSessionHas('success');

        $this->assertEquals('Label Baru', $menu->fresh()->label);
    }

    public function test_admin_can_update_sort_order(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'sort_order' => 1,
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Test Menu',
                'sort_order' => 5,
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertEquals(5, $menu->fresh()->sort_order);
    }

    public function test_admin_can_toggle_is_active(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'is_active' => false,
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Test Menu',
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertTrue($menu->fresh()->is_active);
    }

    public function test_update_does_not_change_route_name(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'route_name' => 'public.profile',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Label Baru',
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertEquals('public.profile', $menu->fresh()->route_name);
    }

    public function test_update_does_not_change_url(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'url' => '/custom-url',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Label Baru',
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertEquals('/custom-url', $menu->fresh()->url);
    }

    public function test_admin_can_update_parent_key(): void
    {
        $parent = NavigationMenu::create([
            'menu_key' => 'parent',
            'label' => 'Parent Menu',
            'location' => 'public_header',
        ]);

        $child = NavigationMenu::create([
            'menu_key' => 'child',
            'label' => 'Child Menu',
            'parent_key' => 'parent',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $child), [
                'label' => 'Child Baru',
                'parent_key' => null,
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertNull($child->fresh()->parent_key);
    }

    public function test_admin_can_update_location(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Label Baru',
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertEquals('public_header', $menu->fresh()->location);
    }

    public function test_admin_can_update_is_external(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
            'is_external' => false,
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Test Menu',
                'location' => 'public_header',
                'is_external' => true,
                'is_active' => true,
            ]);

        $this->assertTrue($menu->fresh()->is_external);
    }

    public function test_update_does_not_change_menu_key(): void
    {
        $menu = NavigationMenu::create([
            'menu_key' => 'test',
            'label' => 'Test Menu',
            'location' => 'public_header',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.menus.update', $menu), [
                'label' => 'Label Baru',
                'location' => 'public_header',
                'is_active' => true,
            ]);

        $this->assertEquals('test', $menu->fresh()->menu_key);
    }
}
