<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolFigure;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SchoolFigureTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_guest_cannot_access_admin_figures(): void
    {
        $this->get(route('admin.website.figures.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_figures_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.figures.index'))
            ->assertStatus(200);
    }

    public function test_admin_can_create_figure(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.figures.store'), [
                'name' => 'Ustadz Baru',
                'role' => 'Pembina Asrama',
                'description' => 'Deskripsi singkat.',
                'sort_order' => 1,
            ]);

        $this->assertDatabaseHas('school_figures', [
            'name' => 'Ustadz Baru',
            'role' => 'Pembina Asrama',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_figure(): void
    {
        $figure = SchoolFigure::create([
            'name' => 'Nama Lama',
            'role' => 'Jabatan Lama',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.figures.update', $figure), [
                'name' => 'Nama Baru',
                'role' => 'Jabatan Baru',
                'sort_order' => 2,
            ]);

        $figure->refresh();
        $this->assertEquals('Nama Baru', $figure->name);
        $this->assertEquals('Jabatan Baru', $figure->role);
        $this->assertEquals(2, $figure->sort_order);
    }

    public function test_admin_can_toggle_figure(): void
    {
        $figure = SchoolFigure::create([
            'name' => 'Ustadz Toggle',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.figures.toggle', $figure));

        $figure->refresh();
        $this->assertFalse($figure->is_active);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.figures.toggle', $figure));

        $figure->refresh();
        $this->assertTrue($figure->is_active);
    }

    public function test_admin_can_delete_figure(): void
    {
        $figure = SchoolFigure::create([
            'name' => 'Ustadz Hapus',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.figures.destroy', $figure));

        $this->assertDatabaseMissing('school_figures', ['id' => $figure->id]);
    }

    public function test_admin_can_upload_figure_photo(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('figure.jpg', 400, 400);

        $this->actingAs($this->admin)
            ->post(route('admin.website.figures.store'), [
                'name' => 'Ustadz Foto',
                'role' => 'Pembina',
                'photo' => $file,
            ]);

        $figure = SchoolFigure::where('name', 'Ustadz Foto')->first();
        $this->assertNotNull($figure);
        $this->assertNotNull($figure->photo_path);
        $this->assertStringStartsWith('school/figures/', $figure->photo_path);
        Storage::disk('public')->assertExists($figure->photo_path);
    }

    public function test_admin_can_update_figure_photo(): void
    {
        Storage::fake('public');

        $oldFile = UploadedFile::fake()->image('old.jpg', 400, 400);
        $oldPath = $oldFile->store('school/figures', 'public');

        $figure = SchoolFigure::create([
            'name' => 'Ustadz Ganti Foto',
            'photo_path' => $oldPath,
        ]);

        $newFile = UploadedFile::fake()->image('new.jpg', 400, 400);

        $this->actingAs($this->admin)
            ->put(route('admin.website.figures.update', $figure), [
                'name' => 'Ustadz Ganti Foto',
                'photo' => $newFile,
            ]);

        $figure->refresh();
        $this->assertNotNull($figure->photo_path);
        $this->assertStringStartsWith('school/figures/', $figure->photo_path);
        Storage::disk('public')->assertExists($figure->photo_path);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_create_validates_required_name(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.figures.store'), [
                'name' => '',
            ])
            ->assertSessionHasErrors('name');
    }
}