<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicDashboardTokenTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();

        SchoolSetting::create([
            'school_name' => 'SMA Persis Serang',
            'is_active' => true,
            'public_dashboard_token' => null,
        ]);
    }

    public function test_settings_page_shows_generate_button_when_token_empty(): void
    {
        $response = $this->actingAs($this->admin)->get(route('admin.website.settings.edit'));

        $response->assertStatus(200);
        $response->assertSee('Generate Token Baru');
        $response->assertSee('Token belum dibuat');
    }

    public function test_generate_token_creates_token_and_shows_link(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.website.settings.public-dashboard-token.generate'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $setting = SchoolSetting::current();
        $this->assertNotNull($setting->public_dashboard_token);
        $this->assertEquals(48, strlen($setting->public_dashboard_token));

        $response = $this->actingAs($this->admin)->get(route('admin.website.settings.edit'));
        $response->assertSee('Link Dashboard Progress Publik');
        $response->assertSee(url('/progress/' . $setting->public_dashboard_token));
        $response->assertDontSee('Token belum dibuat');
        $response->assertSee('id="copy-public-progress-url"', false);
    }

    public function test_public_progress_page_returns_200_with_valid_token(): void
    {
        $token = Str::random(48);

        SchoolSetting::current()->update(['public_dashboard_token' => $token]);

        $response = $this->get(route('public.progress', $token));
        $response->assertStatus(200);
        $response->assertSee('Progress SPMB');
    }

    public function test_public_progress_page_returns_404_with_invalid_token(): void
    {
        $token = Str::random(48);

        SchoolSetting::current()->update(['public_dashboard_token' => $token]);

        $response = $this->get(route('public.progress', 'wrong-token'));
        $response->assertStatus(404);
    }

    public function test_reset_token_changes_token_and_old_link_404(): void
    {
        $oldToken = Str::random(48);

        SchoolSetting::current()->update(['public_dashboard_token' => $oldToken]);

        $response = $this->actingAs($this->admin)->post(route('admin.website.settings.public-dashboard-token.generate'));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $setting = SchoolSetting::current();
        $newToken = $setting->public_dashboard_token;

        $this->assertNotEquals($oldToken, $newToken);
        $this->get(route('public.progress', $oldToken))->assertStatus(404);
        $this->get(route('public.progress', $newToken))->assertStatus(200);
    }

    public function test_guest_cannot_generate_token(): void
    {
        $response = $this->post(route('admin.website.settings.public-dashboard-token.generate'));
        $response->assertRedirect(route('login'));
    }

    public function test_main_settings_form_still_works(): void
    {
        SchoolSetting::current()->update(['public_dashboard_token' => Str::random(48)]);

        $response = $this->actingAs($this->admin)->put(route('admin.website.settings.update'), [
            'school_name' => 'SMA Persis Serang Updated',
            'short_name' => 'SPS',
            'tagline' => 'Tagline Updated',
            'description' => 'Description',
            'whatsapp_number' => '6281234567890',
            'email' => 'test@example.com',
            'address' => 'Alamat Baru',
            'city' => 'Serang',
            'province' => 'Banten',
            'website_url' => 'https://smapersisserang.sch.id',
            'instagram_url' => '',
            'facebook_url' => '',
            'youtube_url' => '',
            'vision' => 'Visi Baru',
            'mission' => 'Misi Baru',
            'about_school' => '',
            'about_boarding' => '',
            'primary_color' => '#0F6B3A',
            'secondary_color' => '#D4A017',
            'google_maps_embed_url' => '',
            'google_maps_link' => '',
        ]);

        $response->assertRedirect(route('admin.website.settings.edit'));
        $response->assertSessionHas('success');

        $setting = SchoolSetting::current();
        $this->assertEquals('SMA Persis Serang Updated', $setting->school_name);
        $this->assertEquals('Tagline Updated', $setting->tagline);
        $this->assertNotNull($setting->public_dashboard_token);
    }

    public function test_copy_script_is_present(): void
    {
        $token = Str::random(48);
        SchoolSetting::current()->update(['public_dashboard_token' => $token]);

        $response = $this->actingAs($this->admin)->get(route('admin.website.settings.edit'));

        $response->assertSee('id="public-progress-url"', false);
        $response->assertSee('id="copy-public-progress-url"', false);
        $response->assertSee('execCommand', false);
        $response->assertSee('Tersalin!', false);
    }
}
