<?php

namespace Tests\Feature;

use App\Models\AdmissionProgram;
use App\Models\AdmissionYear;
use App\Models\NavigationMenu;
use App\Models\SchoolSetting;
use App\Models\SchoolValue;
use App\Models\WebsitePage;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefaultSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_setting_seed_has_complete_defaults(): void
    {
        $this->seed(DatabaseSeeder::class);

        $setting = SchoolSetting::first();

        $this->assertNotNull($setting);
        $this->assertSame('SMA Persis Serang', $setting->school_name);
        $this->assertSame('SMA Persis', $setting->short_name);
        $this->assertNotEmpty($setting->tagline);
        $this->assertNotEmpty($setting->description);
        $this->assertNotEmpty($setting->vision);
        $this->assertNotEmpty($setting->mission);
        $this->assertNotEmpty($setting->about_school);
        $this->assertNotEmpty($setting->about_boarding);
        $this->assertTrue($setting->is_active);
    }

    public function test_website_page_seed_creates_core_pages_with_content(): void
    {
        $this->seed(DatabaseSeeder::class);

        foreach (['home', 'profile', 'program', 'boarding', 'gallery', 'figures', 'teachers', 'contact'] as $key) {
            $page = WebsitePage::where('page_key', $key)->first();

            $this->assertNotNull($page, "Missing page: {$key}");
            $this->assertNotEmpty($page->title, "Missing title for page: {$key}");
            $this->assertNotEmpty($page->subtitle, "Missing subtitle for page: {$key}");
            $this->assertNotEmpty($page->content, "Missing content for page: {$key}");
        }
    }

    public function test_navigation_menu_seed_creates_ppdb_parent_and_children(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertNotNull(NavigationMenu::where('menu_key', 'ppdb')->where('label', 'SPMB')->first());
        $this->assertNotNull(NavigationMenu::where('menu_key', 'ppdb_register')->where('label', 'Daftar SPMB')->where('parent_key', 'ppdb')->first());
        $this->assertNotNull(NavigationMenu::where('menu_key', 'ppdb_status')->where('label', 'Cek Status')->where('parent_key', 'ppdb')->first());
        $this->assertNull(NavigationMenu::where('menu_key', 'faq')->where('location', 'public_header')->first());
    }

    public function test_school_values_seed_creates_default_values(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertGreaterThanOrEqual(4, SchoolValue::count());

        foreach (['Akhlak', 'Keilmuan', 'Teknologi', 'Kepemimpinan'] as $title) {
            $value = SchoolValue::where('title', $title)->first();

            $this->assertNotNull($value, "Missing school value: {$title}");
            $this->assertNotEmpty($value->description, "Missing description for: {$title}");
            $this->assertTrue($value->is_active, "Value {$title} should be active");
        }
    }

    public function test_admission_seed_creates_current_first_batch_and_free_program(): void
    {
        $this->seed(DatabaseSeeder::class);

        $year = AdmissionYear::where('is_current', true)->first();
        $program = AdmissionProgram::where('type', 'first_batch_free')->first();

        $this->assertNotNull($year);
        $this->assertSame('Angkatan Pertama', $year->name);
        $this->assertSame('2026/2027', $year->academic_year);
        $this->assertSame(36, $year->quota);
        $this->assertSame('open', $year->status);

        $this->assertNotNull($program);
        $this->assertSame($year->id, $program->admission_year_id);
        $this->assertSame('Program Gratis Angkatan Pertama', $program->name);
        $this->assertSame(36, $program->quota);
        $this->assertTrue($program->is_free_program);
        $this->assertSame('open', $program->status);
        $this->assertEquals(0, $program->tuition_fee);
        $this->assertEquals(0, $program->boarding_fee);
        $this->assertEquals(0, $program->meal_fee);
        $this->assertEquals(0, $program->registration_fee);
        $this->assertEquals(0, $program->other_fee);
    }
}
