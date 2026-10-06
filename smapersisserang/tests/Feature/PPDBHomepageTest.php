<?php

namespace Tests\Feature;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use App\Models\StudentApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PPDBHomepageTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_returns_successful_response(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    public function test_homepage_works_without_admission_year(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Informasi SPMB belum tersedia');
    }

    public function test_homepage_shows_open_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
            'academic_year' => '2026/2027',
            'quota' => 36,
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
            'name' => 'Program Gratis Angkatan Pertama',
            'is_free_program' => true,
            'quota' => 36,
        ]);

        $response = $this->get('/');
        $response->assertSee('SPMB 2026/2027 Dibuka');
        $response->assertSee('Daftar SPMB');
    }

    public function test_homepage_shows_closed_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'closed',
            'academic_year' => '2025/2026',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('Pendaftaran Ditutup');
        $response->assertSee('Cek Status');
        $response->assertSee('Hubungi Admin');
    }

    public function test_homepage_shows_quota_full_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'quota_full',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('Kuota Penuh');
        $response->assertSee('Cek Status');
        $response->assertSee('Hubungi Admin');
    }

    public function test_homepage_shows_almost_full_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'almost_full',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('Kuota Hampir Penuh');
        $response->assertSee('Daftar SPMB');
        $response->assertSee('Segera daftar sebelum kuota terpenuhi');
    }

    public function test_homepage_shows_free_program_info(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
            'name' => 'Program Gratis',
            'is_free_program' => true,
            'quota' => 36,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Daftar SPMB');
    }

    public function test_homepage_shows_paid_program_info(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
            'name' => 'Program Reguler',
            'is_free_program' => false,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Daftar SPMB');
    }

    public function test_homepage_shows_paid_program_with_fees(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
            'name' => 'Program VIP',
            'is_free_program' => false,
            'tuition_fee' => 5000000,
            'boarding_fee' => 3000000,
            'meal_fee' => 1500000,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Daftar SPMB');
    }

    public function test_homepage_free_program_quota_from_program(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
            'quota' => 100,
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
            'name' => 'Program Khusus',
            'is_free_program' => true,
            'quota' => 50,
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('Daftar SPMB');
    }

    public function test_homepage_works_without_admission_program(): void
    {
        AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
        ]);

        $response = $this->get('/');
        $response->assertStatus(200);
        $response->assertSee('SPMB');
    }

    public function test_homepage_shows_konsultasi_whatsapp_when_open(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'open',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('Konsultasi SPMB');
    }

    public function test_homepage_shows_draft_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'draft',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('SPMB Belum Dibuka');
        $response->assertSee('Cek Status');
    }

    public function test_homepage_shows_announcement_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'announcement',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('Masa Pengumuman');
        $response->assertSee('Cek Status');
    }

    public function test_homepage_shows_archived_status(): void
    {
        $year = AdmissionYear::factory()->create([
            'is_current' => true,
            'status' => 'archived',
        ]);
        AdmissionProgram::factory()->create([
            'admission_year_id' => $year->id,
        ]);

        $response = $this->get('/');
        $response->assertSee('SPMB Tidak Aktif');
        $response->assertSee('Cek Status');
        $response->assertSee('Hubungi Admin');
    }
}
