<?php

namespace Tests\Feature;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use App\Models\StudentApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PPDBStatusCheckTest extends TestCase
{
    use RefreshDatabase;

    private StudentApplication $application;

    protected function setUp(): void
    {
        parent::setUp();

        $admissionYear = AdmissionYear::factory()->create();
        $admissionProgram = AdmissionProgram::factory()->create([
            'admission_year_id' => $admissionYear->id,
        ]);

        $this->application = StudentApplication::factory()->create([
            'admission_year_id' => $admissionYear->id,
            'admission_program_id' => $admissionProgram->id,
            'registration_number' => 'SPMB-2026-0001',
            'parent_whatsapp' => '081234567890',
            'status' => 'baru_daftar',
        ]);
    }

    public function test_status_form_page_can_be_rendered(): void
    {
        $response = $this->get(route('ppdb.status.form'));

        $response->assertOk();
        $response->assertSee('Cek Status Pendaftaran');
    }

    public function test_can_check_status_with_valid_registration_number(): void
    {
        $response = $this->post(route('ppdb.status.check'), [
            'registration_number' => 'SPMB-2026-0001',
        ]);

        $response->assertOk();
        $response->assertSee('SPMB-2026-0001');
        $response->assertSee($this->application->student_name);
        $response->assertSee('Pendaftaran Berhasil Diterima');
    }

    public function test_can_check_status_with_valid_parent_whatsapp(): void
    {
        $response = $this->post(route('ppdb.status.check'), [
            'parent_whatsapp' => '081234567890',
        ]);

        $response->assertOk();
        $response->assertSee($this->application->student_name);
        $response->assertSee('SPMB-2026-0001');
    }

    public function test_can_check_status_with_whatsapp_containing_extra_chars(): void
    {
        $response = $this->post(route('ppdb.status.check'), [
            'parent_whatsapp' => '0812-3456-7890',
        ]);

        $response->assertOk();
        $response->assertSee($this->application->student_name);
    }

    public function test_prioritizes_registration_number_when_both_given(): void
    {
        $admissionYear = AdmissionYear::factory()->create();
        $admissionProgram = AdmissionProgram::factory()->create([
            'admission_year_id' => $admissionYear->id,
        ]);

        $other = StudentApplication::factory()->create([
            'admission_year_id' => $admissionYear->id,
            'admission_program_id' => $admissionProgram->id,
            'registration_number' => 'SPMB-2026-0002',
            'parent_whatsapp' => '081234567890',
        ]);

        $response = $this->post(route('ppdb.status.check'), [
            'registration_number' => 'SPMB-2026-0001',
            'parent_whatsapp' => '081234567890',
        ]);

        $response->assertOk();
        $response->assertSee('SPMB-2026-0001');
        $response->assertSee($this->application->student_name);
    }

    public function test_shows_error_when_data_not_found(): void
    {
        $response = $this->post(route('ppdb.status.check'), [
            'registration_number' => 'SPMB-2026-9999',
        ]);

        $response->assertSessionHasErrors('search');
        $response->assertSessionHas('errors');
    }

    public function test_validation_fails_when_both_fields_empty(): void
    {
        $response = $this->post(route('ppdb.status.check'), []);

        $response->assertSessionHasErrors('search');
    }

    public function test_does_not_display_sensitive_data(): void
    {
        $response = $this->post(route('ppdb.status.check'), [
            'registration_number' => 'SPMB-2026-0001',
        ]);

        $response->assertOk();
        $response->assertDontSee($this->application->admin_notes ?? 'NON_EXISTENT_ADMIN_NOTE');
        $response->assertDontSee($this->application->health_notes ?? 'NON_EXISTENT_HEALTH_NOTE');
        $response->assertDontSee($this->application->father_name);
        $response->assertDontSee($this->application->mother_name);
        $response->assertDontSee($this->application->address);
    }

    public function test_register_route_returns_404(): void
    {
        $response = $this->get('/register');

        $response->assertNotFound();
    }

    public function test_ppdb_daftar_route_is_accessible(): void
    {
        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
    }
}
