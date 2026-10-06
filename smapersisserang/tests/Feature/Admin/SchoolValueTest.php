<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolValue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolValueTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_guest_cannot_access_admin_values_index(): void
    {
        $this->get(route('admin.website.values.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_values_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.values.index'))
            ->assertStatus(200);
    }

    public function test_admin_can_create_value(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.values.store'), [
                'title' => 'Kejujuran',
                'description' => 'Deskripsi kejujuran.',
                'sort_order' => 1,
            ]);

        $this->assertDatabaseHas('school_values', [
            'title' => 'Kejujuran',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_edit_value(): void
    {
        $value = SchoolValue::create([
            'title' => 'Nilai Lama',
            'description' => 'Deskripsi lama',
            'sort_order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.values.update', $value), [
                'title' => 'Nilai Baru',
                'description' => 'Deskripsi baru',
                'sort_order' => 2,
                'is_active' => true,
            ]);

        $updated = $value->fresh();
        $this->assertEquals('Nilai Baru', $updated->title);
        $this->assertEquals('Deskripsi baru', $updated->description);
        $this->assertEquals(2, $updated->sort_order);
    }

    public function test_admin_can_toggle_value(): void
    {
        $value = SchoolValue::create([
            'title' => 'Nilai Test',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.values.toggle', $value));

        $this->assertTrue($value->fresh()->is_active);
    }

    public function test_admin_can_delete_value(): void
    {
        $value = SchoolValue::create([
            'title' => 'Nilai Hapus',
            'sort_order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.values.destroy', $value));

        $this->assertDatabaseMissing('school_values', ['id' => $value->id]);
    }

    public function test_homepage_shows_active_values(): void
    {
        SchoolValue::create([
            'title' => 'Nilai Aktif',
            'description' => 'Tampil di homepage',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $this->get('/')
            ->assertStatus(200)
            ->assertSee('Nilai Aktif')
            ->assertSee('Tampil di homepage');
    }

    public function test_homepage_hides_inactive_values(): void
    {
        SchoolValue::create([
            'title' => 'Nilai Nonaktif',
            'description' => 'Jangan tampil',
            'sort_order' => 1,
            'is_active' => false,
        ]);

        $this->get('/')
            ->assertStatus(200)
            ->assertDontSee('Nilai Nonaktif');
    }

    public function test_seeder_creates_default_values(): void
    {
        $this->seed(\Database\Seeders\SchoolValueSeeder::class);

        $this->assertDatabaseHas('school_values', ['title' => 'Akhlak']);
        $this->assertDatabaseHas('school_values', ['title' => 'Keilmuan']);
        $this->assertDatabaseHas('school_values', ['title' => 'Teknologi']);
        $this->assertDatabaseHas('school_values', ['title' => 'Kepemimpinan']);
    }
}
