<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolImage;
use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebsiteSettingsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_guest_cannot_access_website_settings(): void
    {
        $this->get(route('admin.website.settings.edit'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_open_website_settings(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.settings.edit'));

        $response->assertStatus(200);
        $response->assertSee('Pengaturan Website');
        $response->assertSee('Identitas Sekolah');
        $response->assertSee('Kontak');
        $response->assertSeeText('Lokasi & Google Maps', false);
        $response->assertSee('Sosial Media');
        $response->assertSee('Profil');
        $response->assertSee('Boarding School');
        $response->assertSee('Warna Tema');
        $response->assertSee('Logo');
        $response->assertDontSee('Gambar Hero Berjalan');
        $response->assertDontSee('Galeri Foto');
        $response->assertSee('Foto Gedung');
    }

    public function test_admin_can_update_school_name_and_tagline(): void
    {
        $response = $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Negeri 1 Testing',
                'tagline' => 'Testing School Tagline',
                'short_name' => 'SMAN 1 Testing',
            ]);

        $response->assertRedirect(route('admin.website.settings.edit'));
        $response->assertSessionHas('success');

        $setting = SchoolSetting::current();
        $this->assertEquals('SMA Negeri 1 Testing', $setting->school_name);
        $this->assertEquals('Testing School Tagline', $setting->tagline);
        $this->assertEquals('SMAN 1 Testing', $setting->short_name);
    }

    public function test_admin_can_update_whatsapp_number(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis Serang',
                'whatsapp_number' => '6281234567890',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('6281234567890', $setting->whatsapp_number);
        $this->assertEquals('https://wa.me/6281234567890', $setting->whatsappLink());
    }

    public function test_admin_can_update_all_contact_fields(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'email' => 'test@school.com',
                'address' => 'Jl. Testing No. 1',
                'city' => 'Jakarta',
                'province' => 'DKI Jakarta',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('test@school.com', $setting->email);
        $this->assertEquals('Jl. Testing No. 1', $setting->address);
        $this->assertEquals('Jakarta', $setting->city);
        $this->assertEquals('DKI Jakarta', $setting->province);
    }

    public function test_admin_can_update_vision_mission_and_about(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'vision' => 'Vision Test',
                'mission' => "Mission 1\nMission 2",
                'about_school' => 'About the school',
                'about_boarding' => 'About boarding',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('Vision Test', $setting->vision);
        $this->assertEquals("Mission 1\nMission 2", $setting->mission);
        $this->assertEquals('About the school', $setting->about_school);
        $this->assertEquals('About boarding', $setting->about_boarding);
    }

    public function test_validation_requires_school_name(): void
    {
        $response = $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => '',
            ]);

        $response->assertSessionHasErrors('school_name');
    }

    public function test_whatsapp_number_can_be_empty(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'whatsapp_number' => '',
            ]);

        $this->assertNull(SchoolSetting::current()->whatsapp_number);
    }

    public function test_admin_can_update_social_media_urls(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'website_url' => 'https://smapersis.sch.id',
                'instagram_url' => 'https://instagram.com/smapersis',
                'facebook_url' => 'https://facebook.com/smapersis',
                'youtube_url' => 'https://youtube.com/@smapersis',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('https://smapersis.sch.id', $setting->website_url);
        $this->assertEquals('https://instagram.com/smapersis', $setting->instagram_url);
        $this->assertEquals('https://facebook.com/smapersis', $setting->facebook_url);
        $this->assertEquals('https://youtube.com/@smapersis', $setting->youtube_url);
    }

    public function test_admin_can_upload_logo(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('logo.png', 200, 200);

        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'logo' => $file,
            ]);

        $setting = SchoolSetting::current();
        $this->assertNotNull($setting->logo_path);
        $this->assertStringStartsWith('school/logos/', $setting->logo_path);
        Storage::disk('public')->assertExists($setting->logo_path);
    }

    public function test_admin_can_upload_building_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('gedung.jpg', 800, 600);

        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'building_image' => $file,
            ]);

        $setting = SchoolSetting::current();
        $this->assertNotNull($setting->building_image_path);
        $this->assertStringStartsWith('school/buildings/', $setting->building_image_path);
        Storage::disk('public')->assertExists($setting->building_image_path);
    }

    public function test_settings_persist_across_requests(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'Persistent School Name',
                'tagline' => 'Persistent Tagline',
            ]);

        $this->actingAs($this->admin)
            ->get(route('admin.website.settings.edit'))
            ->assertSee('Persistent School Name')
            ->assertSee('Persistent Tagline');
    }

    public function test_normalized_whatsapp_handles_zero_prefix(): void
    {
        $setting = SchoolSetting::create([
            'school_name' => 'Test',
            'whatsapp_number' => '081234567890',
        ]);

        $this->assertEquals('6281234567890', $setting->normalizedWhatsappNumber());
    }

    public function test_normalized_whatsapp_handles_no_prefix(): void
    {
        $setting = SchoolSetting::create([
            'school_name' => 'Test',
            'whatsapp_number' => '1234567890',
        ]);

        $this->assertEquals('621234567890', $setting->normalizedWhatsappNumber());
    }

    public function test_whatsapp_link_returns_null_when_empty(): void
    {
        $setting = SchoolSetting::create([
            'school_name' => 'Test',
        ]);

        $this->assertNull($setting->whatsappLink());
    }

    public function test_admin_can_update_google_maps_embed_url(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'google_maps_embed_url' => 'https://www.google.com/maps/embed?pb=!1m18!...',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('https://www.google.com/maps/embed?pb=!1m18!...', $setting->google_maps_embed_url);
    }

    public function test_admin_can_update_google_maps_link(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.website.settings.update'), [
                'school_name' => 'SMA Persis',
                'google_maps_link' => 'https://maps.app.goo.gl/abc123',
            ]);

        $setting = SchoolSetting::current();
        $this->assertEquals('https://maps.app.goo.gl/abc123', $setting->google_maps_link);
    }

    public function test_guest_cannot_upload_hero_image(): void
    {
        $file = UploadedFile::fake()->image('hero.jpg');

        $this->post(route('admin.website.hero-images.store'), [
            'image' => $file,
        ])->assertRedirect(route('login'));
    }

    public function test_guest_cannot_toggle_hero_image(): void
    {
        $image = SchoolImage::create([
            'image_path' => 'school/hero/test.jpg',
            'category' => 'hero',
        ]);

        $this->patch(route('admin.website.hero-images.toggle', $image))
            ->assertRedirect(route('login'));
    }

    public function test_guest_cannot_delete_hero_image(): void
    {
        $image = SchoolImage::create([
            'image_path' => 'school/hero/test.jpg',
            'category' => 'hero',
        ]);

        $this->delete(route('admin.website.hero-images.destroy', $image))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_upload_carousel_hero_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('hero-carousel.jpg', 800, 600);

        $this->actingAs($this->admin)
            ->post(route('admin.website.hero-images.store'), [
                'title' => 'Hero Slide 1',
                'sort_order' => 1,
                'image' => $file,
            ]);

        $image = SchoolImage::where('category', 'hero')->first();
        $this->assertNotNull($image);
        $this->assertEquals('Hero Slide 1', $image->title);
        $this->assertEquals(1, $image->sort_order);
        $this->assertTrue($image->is_active);
        $this->assertStringStartsWith('school/hero/', $image->image_path);
        Storage::disk('public')->assertExists($image->image_path);
    }

    public function test_admin_can_toggle_hero_image(): void
    {
        $image = SchoolImage::create([
            'image_path' => 'school/hero/test.jpg',
            'category' => 'hero',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.hero-images.toggle', $image));

        $image->refresh();
        $this->assertFalse($image->is_active);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.hero-images.toggle', $image));

        $image->refresh();
        $this->assertTrue($image->is_active);
    }

    public function test_admin_can_delete_hero_image(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('hero.jpg', 800, 600);
        $path = $file->store('school/hero', 'public');

        $image = SchoolImage::create([
            'image_path' => $path,
            'category' => 'hero',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.hero-images.destroy', $image));

        $this->assertDatabaseMissing('school_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }
}
