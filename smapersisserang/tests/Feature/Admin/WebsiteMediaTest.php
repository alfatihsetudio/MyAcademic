<?php

namespace Tests\Feature\Admin;

use App\Models\GalleryCategory;
use App\Models\SchoolImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class WebsiteMediaTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    public function test_guest_cannot_access_media_page(): void
    {
        $this->get(route('admin.website.media.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_media_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.media.index'))
            ->assertStatus(200)
            ->assertSee('Media Website');
    }

    public function test_admin_can_upload_hero_image_from_media(): void
    {
        Storage::fake('public');

        $heroCat = GalleryCategory::where('slug', 'hero')->first();

        $file = UploadedFile::fake()->image('hero.jpg', 800, 600);

        $this->actingAs($this->admin)
            ->post(route('admin.website.media.store'), [
                'title' => 'Hero Baru',
                'category_ids' => [$heroCat->id],
                'sort_order' => 1,
                'image' => $file,
            ]);

        $image = SchoolImage::whereHas('categories', fn($q) => $q->where('slug', 'hero'))->first();
        $this->assertNotNull($image);
        $this->assertEquals('Hero Baru', $image->title);
        $this->assertTrue($image->is_active);
        $this->assertStringStartsWith('school/hero/', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_admin_can_upload_gallery_image_from_media(): void
    {
        Storage::fake('public');

        $fasilitasCat = GalleryCategory::where('slug', 'fasilitas')->first();

        $file = UploadedFile::fake()->image('fasilitas.jpg', 800, 600);

        $this->actingAs($this->admin)
            ->post(route('admin.website.media.store'), [
                'title' => 'Foto Fasilitas',
                'category_ids' => [$fasilitasCat->id],
                'sort_order' => 1,
                'image' => $file,
            ]);

        $image = SchoolImage::whereHas('categories', fn($q) => $q->where('slug', 'fasilitas'))->first();
        $this->assertNotNull($image);
        $this->assertEquals('Foto Fasilitas', $image->title);
        $this->assertTrue($image->is_active);
        $this->assertStringStartsWith('school/gallery/', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_admin_can_upload_kegiatan_image_from_media(): void
    {
        Storage::fake('public');

        $kegiatanCat = GalleryCategory::where('slug', 'kegiatan')->first();

        $file = UploadedFile::fake()->image('kegiatan.jpg', 800, 600);

        $this->actingAs($this->admin)
            ->post(route('admin.website.media.store'), [
                'category_ids' => [$kegiatanCat->id],
                'image' => $file,
            ]);

        $image = SchoolImage::whereHas('categories', fn($q) => $q->where('slug', 'kegiatan'))->first();
        $this->assertNotNull($image);
        $this->assertStringStartsWith('school/gallery/', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_media_page_shows_all_images(): void
    {
        $heroCat = GalleryCategory::where('slug', 'hero')->first();
        $fasilitasCat = GalleryCategory::where('slug', 'fasilitas')->first();

        $img1 = SchoolImage::create([
            'title' => 'Hero Image',
            'image_path' => 'school/hero/hero.jpg',
            'category' => 'hero',
        ]);
        $img1->categories()->attach($heroCat);

        $img2 = SchoolImage::create([
            'title' => 'Fasilitas Image',
            'image_path' => 'school/gallery/fasilitas.jpg',
            'category' => 'fasilitas',
        ]);
        $img2->categories()->attach($fasilitasCat);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.media.index'));

        $response->assertSee('Hero Image');
        $response->assertSee('Fasilitas Image');
    }

    public function test_media_filter_by_category_works(): void
    {
        $heroCat = GalleryCategory::where('slug', 'hero')->first();
        $kegiatanCat = GalleryCategory::where('slug', 'kegiatan')->first();

        $img1 = SchoolImage::create([
            'title' => 'Hero Only',
            'image_path' => 'school/hero/hero.jpg',
            'category' => 'hero',
        ]);
        $img1->categories()->attach($heroCat);

        $img2 = SchoolImage::create([
            'title' => 'Kegiatan Only',
            'image_path' => 'school/gallery/kegiatan.jpg',
            'category' => 'kegiatan',
        ]);
        $img2->categories()->attach($kegiatanCat);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.media.index', ['category' => 'hero']));

        $response->assertSee('Hero Only');
        $response->assertDontSee('Kegiatan Only');
    }

    public function test_admin_can_toggle_media(): void
    {
        $image = SchoolImage::create([
            'image_path' => 'school/hero/test.jpg',
            'category' => 'hero',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.media.toggle', $image));

        $image->refresh();
        $this->assertFalse($image->is_active);
    }

    public function test_admin_can_delete_media(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('test.jpg', 800, 600);
        $path = $file->store('school/hero', 'public');

        $image = SchoolImage::create([
            'image_path' => $path,
            'category' => 'hero',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.media.destroy', $image));

        $this->assertDatabaseMissing('school_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_hero_images_show_on_homepage(): void
    {
        Storage::fake('public');

        $heroCat = GalleryCategory::where('slug', 'hero')->first();

        $file = UploadedFile::fake()->image('hero.jpg', 800, 600);
        $path = $file->store('school/hero', 'public');

        $img = SchoolImage::create([
            'title' => 'Homepage Hero',
            'image_path' => $path,
            'category' => 'hero',
            'is_active' => true,
        ]);
        $img->categories()->attach($heroCat);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('images');
    }

    public function test_gallery_images_show_on_gallery_page(): void
    {
        Storage::fake('public');

        $kegiatanCat = GalleryCategory::where('slug', 'kegiatan')->first();

        $file = UploadedFile::fake()->image('galeri.jpg', 800, 600);
        $path = $file->store('school/gallery', 'public');

        $img = SchoolImage::create([
            'title' => 'Gallery Test',
            'image_path' => $path,
            'category' => 'kegiatan',
            'is_active' => true,
        ]);
        $img->categories()->attach($kegiatanCat);

        $response = $this->get(route('public.gallery'));
        $response->assertStatus(200);
        $response->assertSee('Gallery Test');
    }

    public function test_settings_page_no_longer_shows_hero_section(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.settings.edit'));

        $response->assertStatus(200);
        $response->assertDontSee('Gambar Hero Berjalan');
        $response->assertDontSee('Galeri Foto');
    }
}
