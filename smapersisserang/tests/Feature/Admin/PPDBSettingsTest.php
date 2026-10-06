<?php

namespace Tests\Feature\Admin;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class PPDBSettingsTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;
    private AdmissionYear $admissionYear;
    private AdmissionProgram $admissionProgram;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();

        $this->admissionYear = AdmissionYear::factory()->create([
            'status' => 'open',
        ]);

        $this->admissionProgram = AdmissionProgram::factory()->create([
            'admission_year_id' => $this->admissionYear->id,
            'status' => 'open',
        ]);
    }

    public function test_guest_cannot_access_settings_page(): void
    {
        $this->get(route('admin.ppdb.settings.edit'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_open_settings_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.ppdb.settings.edit'))
            ->assertOk()
            ->assertSee('Pengaturan SPMB')
            ->assertSee($this->admissionYear->name)
            ->assertSee($this->admissionProgram->name);
    }

    public function test_admin_can_update_settings(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.ppdb.settings.update'), [
                'name' => 'Angkatan Kedua',
                'academic_year' => '2027/2028',
                'quota' => 50,
                'status' => 'closed',
                'start_date' => '2027-01-01',
                'end_date' => '2027-06-30',
                'description' => 'Program angkatan kedua.',

                'program_name' => 'Program Reguler',
                'program_type' => 'regular_paid',
                'program_quota' => 50,
                'program_status' => 'closed',
                'tuition_fee' => 500000,
                'boarding_fee' => 1000000,
                'meal_fee' => 300000,
                'registration_fee' => 200000,
                'other_fee' => 100000,
                'is_free_program' => 0,
                'program_description' => 'Program reguler berbayar.',
            ])
            ->assertRedirect(route('admin.ppdb.settings.edit'))
            ->assertSessionHas('success');

        $this->admissionYear->refresh();
        $this->admissionProgram->refresh();

        $this->assertEquals('Angkatan Kedua', $this->admissionYear->name);
        $this->assertEquals('closed', $this->admissionYear->status);
        $this->assertEquals('closed', $this->admissionProgram->status);
        $this->assertEquals('Program Reguler', $this->admissionProgram->name);
    }

    public function test_update_validates_required_fields(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.ppdb.settings.update'), [
                'name' => '',
                'academic_year' => '',
                'quota' => '',
                'status' => '',
                'start_date' => '',
                'end_date' => '',
                'program_name' => '',
                'program_type' => '',
                'program_quota' => '',
                'program_status' => '',
                'tuition_fee' => '',
                'boarding_fee' => '',
                'meal_fee' => '',
                'registration_fee' => '',
                'other_fee' => '',
            ])
            ->assertSessionHasErrors([
                'name', 'academic_year', 'quota', 'status', 'start_date', 'end_date',
                'program_name', 'program_type', 'program_quota', 'program_status',
                'tuition_fee', 'boarding_fee', 'meal_fee', 'registration_fee', 'other_fee',
            ]);
    }

    // ─── Consultation button toggle ─────────────────────────────

    public function test_settings_page_shows_consultation_checkbox(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.ppdb.settings.edit'))
            ->assertOk()
            ->assertSee('Tampilkan Tombol Konsultasi SPMB')
            ->assertSee('show_consultation_button');
    }

    public function test_admin_can_disable_consultation_button(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.ppdb.settings.update'), $this->validPayload(['show_consultation_button' => 0]))
            ->assertRedirect(route('admin.ppdb.settings.edit'))
            ->assertSessionHas('success');

        $this->admissionYear->refresh();
        $this->assertFalse((bool) $this->admissionYear->show_consultation_button);
    }

    public function test_admin_can_enable_consultation_button(): void
    {
        $this->admissionYear->update(['show_consultation_button' => false]);

        $this->actingAs($this->admin)
            ->put(route('admin.ppdb.settings.update'), $this->validPayload(['show_consultation_button' => 1]))
            ->assertRedirect(route('admin.ppdb.settings.edit'))
            ->assertSessionHas('success');

        $this->admissionYear->refresh();
        $this->assertTrue((bool) $this->admissionYear->show_consultation_button);
    }

    public function test_consultation_button_defaults_to_true(): void
    {
        $this->admissionYear->refresh();
        $this->assertTrue((bool) $this->admissionYear->show_consultation_button);
    }

    public function test_consultation_button_not_sent_defaults_to_false(): void
    {
        $this->actingAs($this->admin)
            ->put(route('admin.ppdb.settings.update'), $this->validPayload())
            ->assertRedirect(route('admin.ppdb.settings.edit'));

        $this->admissionYear->refresh();
        $this->assertFalse((bool) $this->admissionYear->show_consultation_button);
    }

    public function test_unauthorized_user_cannot_toggle_consultation_button(): void
    {
        $user = \App\Models\User::factory()->create(['role' => 'guru']);
        $role = \App\Models\Role::firstOrCreate(
            ['name' => 'guru'],
            ['display_name' => 'Guru', 'is_active' => true, 'is_system' => true]
        );
        $user->roles()->attach($role->id);

        $this->actingAs($user)
            ->put(route('admin.ppdb.settings.update'), $this->validPayload(['show_consultation_button' => 0]))
            ->assertStatus(403);
    }

    // ─── Public page consultation button visibility ──────────────

    public function test_public_page_shows_consultation_button_when_enabled(): void
    {
        $this->admissionYear->update(['show_consultation_button' => true, 'status' => 'open']);

        $response = $this->get(route('spmb.info'));
        $response->assertOk();
        $response->assertSee('Konsultasi SPMB');
    }

    public function test_public_page_hides_consultation_button_when_disabled(): void
    {
        $this->admissionYear->update(['show_consultation_button' => false, 'status' => 'open']);

        $response = $this->get(route('spmb.info'));
        $response->assertOk();

        $content = $response->getContent();
        $widgetCount = substr_count($content, 'toggleAiChatPanel');
        $this->assertEquals(0, $widgetCount, 'The widget and all toggleAiChatPanel references should be absent when consultation buttons are disabled');
    }

    public function test_public_page_shows_consultation_button_when_enabled_count(): void
    {
        $this->admissionYear->update(['show_consultation_button' => true, 'status' => 'open']);

        $response = $this->get(route('spmb.info'));
        $response->assertOk();

        $content = $response->getContent();
        $widgetCount = substr_count($content, 'toggleAiChatPanel');
        $this->assertEquals(5, $widgetCount, 'Widget (3) + 2 inline consultation buttons should equal 5');
    }

    public function test_public_page_shows_consultation_button_by_default(): void
    {
        $this->admissionYear->update(['status' => 'open']);

        $response = $this->get(route('spmb.info'));
        $response->assertOk();
        $response->assertSee('Konsultasi SPMB');
    }

    // ─── Non-SPMB public page consultation button visibility ──────

    public function test_non_spmb_public_page_shows_consultation_when_enabled(): void
    {
        $this->admissionYear->update(['show_consultation_button' => true, 'status' => 'open']);

        $response = $this->get(route('public.program'));
        $response->assertOk();

        $content = $response->getContent();
        $widgetCount = substr_count($content, 'toggleAiChatPanel');
        $this->assertEquals(4, $widgetCount, 'Widget (3) + 1 inline button should equal 4');
    }

    public function test_non_spmb_public_page_hides_consultation_when_disabled(): void
    {
        $this->admissionYear->update(['show_consultation_button' => false, 'status' => 'open']);

        $response = $this->get(route('public.program'));
        $response->assertOk();

        $content = $response->getContent();
        $widgetCount = substr_count($content, 'toggleAiChatPanel');
        $this->assertEquals(0, $widgetCount, 'No toggleAiChatPanel references should exist when consultation buttons are disabled');
    }

    public function test_non_spmb_public_page_shows_consultation_by_default(): void
    {
        $this->admissionYear->update(['status' => 'open']);

        $response = $this->get(route('public.program'));
        $response->assertOk();
        $response->assertSee('Konsultasi SPMB');
    }

    private function validPayload(array $overrides = []): array
    {
        return array_replace([
            'name' => $this->admissionYear->name,
            'academic_year' => $this->admissionYear->academic_year,
            'quota' => $this->admissionYear->quota,
            'status' => $this->admissionYear->status,
            'start_date' => $this->admissionYear->start_date->format('Y-m-d'),
            'end_date' => $this->admissionYear->end_date->format('Y-m-d'),
            'description' => $this->admissionYear->description,

            'program_name' => $this->admissionProgram->name,
            'program_type' => $this->admissionProgram->type,
            'program_quota' => $this->admissionProgram->quota,
            'program_status' => $this->admissionProgram->status,
            'tuition_fee' => $this->admissionProgram->tuition_fee,
            'boarding_fee' => $this->admissionProgram->boarding_fee,
            'meal_fee' => $this->admissionProgram->meal_fee,
            'registration_fee' => $this->admissionProgram->registration_fee,
            'other_fee' => $this->admissionProgram->other_fee,
            'is_free_program' => $this->admissionProgram->is_free_program ? 1 : 0,
            'program_description' => $this->admissionProgram->description,
        ], $overrides);
    }
}
