<?php

namespace Tests\Feature;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use App\Models\GalleryCategory;
use App\Models\NavigationMenu;
use App\Models\SchoolFigure;
use App\Models\SchoolImage;
use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicWebsiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_works_without_school_settings(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('SMA Persis Serang');
    }

    public function test_homepage_shows_school_name_from_settings(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMK Testing',
            'tagline' => 'Testing School',
        ]);

        $response = $this->get('/');
        $response->assertSee('SMK Testing');
        $response->assertSee('Testing School');
    }

    public function test_homepage_shows_school_description_from_settings(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'description' => 'This is a test school description.',
        ]);

        $response = $this->get('/');
        $response->assertSee('This is a test school description.');
    }

    public function test_homepage_shows_contact_from_settings(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'whatsapp_number' => '6281234567890',
            'email' => 'info@test.sch.id',
            'address' => 'Jl. Test No. 1',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
        ]);

        $response = $this->get('/');
        $response->assertSee('6281234567890');
        $response->assertSee('info@test.sch.id');
        $response->assertSee('Jakarta');
    }

    public function test_profile_page_is_accessible(): void
    {
        $response = $this->get(route('public.profile'));
        $response->assertStatus(200);
    }

    public function test_profile_page_shows_school_name(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMK Profile Test',
            'tagline' => 'Profile Tagline',
        ]);

        $response = $this->get(route('public.profile'));
        $response->assertSee('SMK Profile Test');
        $response->assertSee('Profile Tagline');
    }

    public function test_profile_page_shows_vision_mission_boarding(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'vision' => 'Our Vision Statement',
            'mission' => "Mission Point 1\nMission Point 2",
            'about_boarding' => 'Our boarding school program description.',
        ]);

        $response = $this->get(route('public.profile'));
        $response->assertSee('Our Vision Statement');
        $response->assertSee('Mission Point 1');
        $response->assertSee('Mission Point 2');
        $response->assertSee('Our boarding school program description.');
    }

    public function test_profile_page_shows_contact_and_cta_buttons(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'whatsapp_number' => '6281234567890',
            'email' => 'info@test.sch.id',
            'address' => 'Jl. Test',
        ]);

        $response = $this->get(route('public.profile'));

        $response->assertSee('6281234567890');
        $response->assertSee('info@test.sch.id');
        $response->assertSee('Lihat Program');
        $response->assertSee('Konsultasi SPMB');
    }

    public function test_profile_page_works_without_school_settings(): void
    {
        $response = $this->get(route('public.profile'));
        $response->assertStatus(200);
        $response->assertSee('SMA Persis Serang');
    }

    public function test_homepage_school_name_links_to_profile(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('/profil');
    }

    public function test_homepage_shows_fallback_when_no_hero_image(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Test',
            'short_name' => 'SMA Test',
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('SMA Test');
    }

    public function test_homepage_ignores_hero_image_path_when_no_school_images(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('hero.jpg', 800, 600);
        $path = $file->store('school/hero', 'public');

        SchoolSetting::create([
            'school_name' => 'SMA Hero',
            'short_name' => 'SMA',
            'hero_image_path' => $path,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertDontSee('storage/' . $path);
        $response->assertSee('SMA');
    }

    public function test_homepage_shows_hero_images_from_school_images(): void
    {
        Storage::fake('public');

        $heroCat = GalleryCategory::where('slug', 'hero')->first();

        $file1 = UploadedFile::fake()->image('slide1.jpg', 800, 600);
        $path1 = $file1->store('school/hero', 'public');

        $file2 = UploadedFile::fake()->image('slide2.jpg', 800, 600);
        $path2 = $file2->store('school/hero', 'public');

        $img1 = SchoolImage::create([
            'image_path' => $path1,
            'category' => 'hero',
            'sort_order' => 1,
            'is_active' => true,
        ]);
        $img1->categories()->attach($heroCat);

        $img2 = SchoolImage::create([
            'image_path' => $path2,
            'category' => 'hero',
            'sort_order' => 2,
            'is_active' => true,
        ]);
        $img2->categories()->attach($heroCat);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('x-data');
        $response->assertSee('images:');
    }

    public function test_homepage_falls_back_to_card_when_no_school_images(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('hero.jpg', 800, 600);
        $path = $file->store('school/hero', 'public');

        SchoolSetting::create([
            'school_name' => 'SMA Fallback',
            'short_name' => 'SMA FB',
            'hero_image_path' => $path,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertDontSee('storage/' . $path);
        $response->assertSee('SMA FB');
    }

    public function test_homepage_falls_back_to_fallback_card_when_no_images_at_all(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA No Images',
            'short_name' => 'SMA NI',
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('SMA NI');
    }

    public function test_program_page_is_accessible(): void
    {
        $response = $this->get(route('public.program'));
        $response->assertStatus(200);
    }

    public function test_program_page_shows_program_pendidikan_title(): void
    {
        $response = $this->get(route('public.program'));
        $response->assertSee('Program Pendidikan');
    }

    public function test_program_page_shows_school_name_from_settings(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Program Test',
            'tagline' => 'Program Tagline',
        ]);

        $response = $this->get(route('public.program'));
        $response->assertSee('SMA Program Test');
        $response->assertSee('Program Tagline');
    }

    public function test_program_page_shows_daftar_ppdb_button(): void
    {
        $response = $this->get(route('public.program'));
        $response->assertSee(route('spmb.create'));
    }

    public function test_program_page_works_without_school_settings(): void
    {
        $response = $this->get(route('public.program'));
        $response->assertStatus(200);
        $response->assertSee('SMA Persis Serang');
    }

    public function test_header_has_program_link(): void
    {
        NavigationMenu::create([
            'menu_key' => 'program',
            'label' => 'Program',
            'route_name' => 'public.program',
            'sort_order' => 3,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee(route('public.program'));
    }

    public function test_boarding_page_is_accessible(): void
    {
        $response = $this->get(route('public.boarding'));
        $response->assertStatus(200);
    }

    public function test_boarding_page_shows_islamic_boarding_school_title(): void
    {
        $response = $this->get(route('public.boarding'));
        $response->assertSee('Islamic Boarding School');
    }

    public function test_boarding_page_shows_about_boarding_from_settings(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Boarding Test',
            'about_boarding' => 'Boarding school program description for testing.',
        ]);

        $response = $this->get(route('public.boarding'));
        $response->assertSee('Boarding school program description for testing.');
    }

    public function test_boarding_page_works_without_school_settings(): void
    {
        $response = $this->get(route('public.boarding'));
        $response->assertStatus(200);
        $response->assertSee('SMA Persis Serang');
    }

    public function test_boarding_page_shows_daftar_ppdb_button(): void
    {
        $response = $this->get(route('public.boarding'));
        $response->assertSee(route('spmb.create'));
    }

    public function test_header_has_boarding_link(): void
    {
        NavigationMenu::create([
            'menu_key' => 'program',
            'label' => 'Program',
            'route_name' => null,
            'url' => null,
            'parent_key' => null,
            'sort_order' => 4,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        NavigationMenu::create([
            'menu_key' => 'boarding',
            'label' => 'Boarding',
            'route_name' => 'public.boarding',
            'url' => null,
            'parent_key' => 'program',
            'sort_order' => 2,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee(route('public.boarding'));
    }

    public function test_gallery_page_is_accessible(): void
    {
        $response = $this->get(route('public.gallery'));
        $response->assertStatus(200);
    }

    public function test_gallery_page_shows_active_images(): void
    {
        Storage::fake('public');

        $kegiatanCat = GalleryCategory::where('slug', 'kegiatan')->first();

        $file = UploadedFile::fake()->image('gallery.jpg', 800, 600);
        $path = $file->store('school/gallery', 'public');

        $img = SchoolImage::create([
            'title' => 'Foto Kegiatan',
            'image_path' => $path,
            'category' => 'kegiatan',
            'is_active' => true,
        ]);
        $img->categories()->attach($kegiatanCat);

        $response = $this->get(route('public.gallery'));
        $response->assertSee('Foto Kegiatan');
    }

    public function test_gallery_page_hides_inactive_images(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('hidden.jpg', 800, 600);
        $path = $file->store('school/gallery', 'public');

        SchoolImage::create([
            'title' => 'Gambar Nonaktif',
            'image_path' => $path,
            'category' => 'kegiatan',
            'is_active' => false,
        ]);

        $response = $this->get(route('public.gallery'));
        $response->assertDontSee('Gambar Nonaktif');
    }

    public function test_gallery_filter_by_category_works(): void
    {
        Storage::fake('public');

        $fasilitasCat = GalleryCategory::where('slug', 'fasilitas')->first();
        $kelasCat = GalleryCategory::where('slug', 'kelas')->first();

        $file1 = UploadedFile::fake()->image('fasilitas.jpg', 800, 600);
        $path1 = $file1->store('school/gallery', 'public');
        $img1 = SchoolImage::create([
            'title' => 'Foto Fasilitas',
            'image_path' => $path1,
            'category' => 'fasilitas',
            'is_active' => true,
        ]);
        $img1->categories()->attach($fasilitasCat);

        $file2 = UploadedFile::fake()->image('kelas.jpg', 800, 600);
        $path2 = $file2->store('school/gallery', 'public');
        $img2 = SchoolImage::create([
            'title' => 'Foto Kelas',
            'image_path' => $path2,
            'category' => 'kelas',
            'is_active' => true,
        ]);
        $img2->categories()->attach($kelasCat);

        $response = $this->get(route('public.gallery', ['category' => 'fasilitas']));
        $response->assertSee('Foto Fasilitas');
        $response->assertDontSee('Foto Kelas');
    }

    public function test_gallery_empty_state(): void
    {
        $response = $this->get(route('public.gallery'));
        $response->assertSee('Galeri belum tersedia.');
    }

    public function test_header_has_gallery_link(): void
    {
        NavigationMenu::create([
            'menu_key' => 'gallery',
            'label' => 'Galeri',
            'route_name' => 'public.gallery',
            'sort_order' => 5,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee(route('public.gallery'));
    }

    public function test_guest_cannot_upload_gallery_image(): void
    {
        $file = UploadedFile::fake()->image('gallery.jpg');

        $this->post(route('admin.website.gallery-images.store'), [
            'image' => $file,
            'category' => 'kegiatan',
        ])->assertRedirect(route('login'));
    }

    public function test_admin_can_upload_gallery_image(): void
    {
        Storage::fake('public');

        $kegiatanCat = GalleryCategory::where('slug', 'kegiatan')->first();

        $admin = User::factory()->create();
        $file = UploadedFile::fake()->image('gallery.jpg', 800, 600);

        $this->actingAs($admin)
            ->post(route('admin.website.gallery-images.store'), [
                'title' => 'Galeri Test',
                'category_ids' => [$kegiatanCat->id],
                'sort_order' => 1,
                'image' => $file,
            ]);

        $image = SchoolImage::whereHas('categories', fn($q) => $q->where('slug', 'kegiatan'))->first();
        $this->assertNotNull($image);
        $this->assertEquals('Galeri Test', $image->title);
        $this->assertTrue($image->is_active);
        $this->assertStringStartsWith('school/gallery/', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_admin_can_toggle_gallery_image(): void
    {
        $admin = User::factory()->create();
        $image = SchoolImage::create([
            'image_path' => 'school/gallery/test.jpg',
            'category' => 'kegiatan',
            'is_active' => true,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.website.gallery-images.toggle', $image));

        $image->refresh();
        $this->assertFalse($image->is_active);
    }

    public function test_admin_can_delete_gallery_image(): void
    {
        Storage::fake('public');

        $admin = User::factory()->create();
        $file = UploadedFile::fake()->image('gallery.jpg', 800, 600);
        $path = $file->store('school/gallery', 'public');

        $image = SchoolImage::create([
            'image_path' => $path,
            'category' => 'kegiatan',
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.website.gallery-images.destroy', $image));

        $this->assertDatabaseMissing('school_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_figures_page_is_accessible(): void
    {
        $response = $this->get(route('public.figures'));
        $response->assertStatus(200);
    }

    public function test_figures_page_shows_active_figures(): void
    {
        SchoolFigure::create([
            'name' => 'Ustadz Ahmad',
            'role' => 'Kepala Sekolah',
            'is_active' => true,
        ]);

        $response = $this->get(route('public.figures'));
        $response->assertSee('Ustadz Ahmad');
        $response->assertSee('Kepala Sekolah');
    }

    public function test_figures_page_hides_inactive_figures(): void
    {
        SchoolFigure::create([
            'name' => 'Ustadz Nonaktif',
            'role' => 'Pembina',
            'is_active' => false,
        ]);

        $response = $this->get(route('public.figures'));
        $response->assertDontSee('Ustadz Nonaktif');
    }

    public function test_figures_empty_state(): void
    {
        $response = $this->get(route('public.figures'));
        $response->assertSee('Data tokoh dan pembina belum tersedia.');
    }

    public function test_header_has_figures_link(): void
    {
        NavigationMenu::create([
            'menu_key' => 'figures',
            'label' => 'Tokoh',
            'route_name' => 'public.figures',
            'sort_order' => 6,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee(route('public.figures'));
    }

    public function test_header_hides_faq_link(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertDontSee(route('public.faq'));
    }

    public function test_header_has_teachers_link(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee(route('public.teachers'));
    }

    public function test_header_has_ppdb_dropdown_menu(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('SPMB');
    }

    public function test_header_shows_daftar_ppdb_link_in_dropdown(): void
    {
        NavigationMenu::create([
            'menu_key' => 'ppdb',
            'label' => 'SPMB',
            'url' => '#',
            'sort_order' => 8,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        NavigationMenu::create([
            'menu_key' => 'ppdb_register',
            'label' => 'Daftar SPMB',
            'route_name' => 'ppdb.create',
            'parent_key' => 'ppdb',
            'sort_order' => 2,
            'location' => 'public_header',
            'is_active' => true,
        ]);
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Daftar SPMB');
    }

    public function test_header_shows_cek_status_link_in_dropdown(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Cek Status');
    }

    public function test_header_no_big_daftar_ppdb_button_in_navbar(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertDontSee('text-sm font-medium bg-[#0F6B3A] text-white');
    }

    public function test_profile_shows_google_maps_iframe_when_embed_url_exists(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'google_maps_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!...',
        ]);

        $response = $this->get(route('public.profile'));
        $response->assertStatus(200);
        $response->assertSee('https://www.google.com/maps/embed?pb=!1m18!...');
        $response->assertSee('w-full h-72 rounded-3xl');
    }

    public function test_profile_shows_buka_di_google_maps_button_when_link_exists(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
            'google_maps_embed_url' => 'https://www.google.com/maps/embed?pb=...',
            'google_maps_link' => 'https://maps.app.goo.gl/abc123',
        ]);

        $response = $this->get(route('public.profile'));
        $response->assertStatus(200);
        $response->assertSee('Buka di Google Maps');
        $response->assertSee('https://maps.app.goo.gl/abc123');
    }

    public function test_profile_still_200_when_google_maps_empty(): void
    {
        SchoolSetting::create([
            'school_name' => 'SMA Persis',
        ]);

        $response = $this->get(route('public.profile'));
        $response->assertStatus(200);
        $response->assertDontSee('google_maps_embed');
        $response->assertDontSee('Buka di Google Maps');
    }
}
