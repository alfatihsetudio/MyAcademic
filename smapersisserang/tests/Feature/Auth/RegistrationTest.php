<?php

namespace Tests\Feature\Auth;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    // Public admin registration via /register is intentionally disabled.
    // Only administrator accounts can be created directly via database.
    // Student registration uses /ppdb/daftar instead.

    public function test_admin_register_route_returns_404(): void
    {
        $response = $this->get('/register');

        $response->assertNotFound();
    }

    public function test_admin_register_post_returns_404(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertNotFound();
    }

    public function test_public_ppdb_registration_page_is_accessible(): void
    {
        AdmissionYear::factory()->create();
        AdmissionProgram::factory()->create();

        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
    }

    public function test_registration_blocked_when_year_status_closed(): void
    {
        AdmissionYear::factory()->create(['status' => 'closed']);
        AdmissionProgram::factory()->create(['status' => 'open']);

        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
        $response->assertSee('Pendaftaran SPMB sudah ditutup');
        $response->assertDontSee('Daftar Sekarang');
    }

    public function test_registration_blocked_when_year_status_quota_full(): void
    {
        AdmissionYear::factory()->create(['status' => 'quota_full']);
        AdmissionProgram::factory()->create(['status' => 'open']);

        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
        $response->assertSee('Kuota pendaftaran SPMB sudah penuh');
        $response->assertDontSee('Daftar Sekarang');
    }

    public function test_registration_blocked_when_no_current_year(): void
    {
        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
        $response->assertSee('SPMB belum tersedia');
    }

    public function test_registration_blocked_when_program_not_open(): void
    {
        AdmissionYear::factory()->create(['status' => 'open']);
        AdmissionProgram::factory()->create(['status' => 'draft']);

        $response = $this->get(route('ppdb.create'));

        $response->assertOk();
        $response->assertSee('Program Belum Tersedia');
    }
}
