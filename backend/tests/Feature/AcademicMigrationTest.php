<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class AcademicMigrationTest extends TestCase
{
    public function test_login_page_is_accessible(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
        $response->assertSee('MyAcademic');
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = User::where('email', 'admin@gmail.com')->first();
        $this->assertNotNull($admin, 'Admin account should exist');

        $response = $this->actingAs($admin)->get('/dashboard/admin');
        $response->assertStatus(200);
        $response->assertSee('Dashboard Administrator');
    }

    public function test_guru_can_access_dashboard_and_modules(): void
    {
        $guru = User::where('email', 'guru@gmail.com')->first();
        $this->assertNotNull($guru, 'Guru account should exist');

        // Dashboard
        $response = $this->actingAs($guru)->get('/dashboard/guru');
        $response->assertStatus(200);
        $response->assertSee('Selamat Datang');

        // Subjects
        $response = $this->actingAs($guru)->get('/subjects');
        $response->assertStatus(200);

        // Assignments
        $response = $this->actingAs($guru)->get('/assignments');
        $response->assertStatus(200);

        // Materials
        $response = $this->actingAs($guru)->get('/materials');
        $response->assertStatus(200);

        // Attendance
        $response = $this->actingAs($guru)->get('/attendance/take');
        $response->assertStatus(200);

        // Offline Assessment
        $response = $this->actingAs($guru)->get('/penilaian-offline');
        $response->assertStatus(200);

        // Excel
        $response = $this->actingAs($guru)->get('/excel');
        $response->assertStatus(200);
    }

    public function test_murid_can_access_dashboard_and_space_belajar(): void
    {
        $murid = User::where('email', 'murid@gmail.com')->first();
        $this->assertNotNull($murid, 'Murid account should exist');

        // Dashboard
        $response = $this->actingAs($murid)->get('/dashboard/murid');
        $response->assertStatus(200);
        $response->assertSee('Halo,');

        // Space Belajar
        $response = $this->actingAs($murid)->get('/space-belajar');
        $response->assertStatus(200);

        // Progres
        $response = $this->actingAs($murid)->get('/space-belajar/progres');
        $response->assertStatus(200);

        // Calendar
        $response = $this->actingAs($murid)->get('/space-belajar/calendar');
        $response->assertStatus(200);
    }

    public function test_role_security_murid_cannot_access_admin_dashboard(): void
    {
        $murid = User::where('email', 'murid@gmail.com')->first();
        $response = $this->actingAs($murid)->get('/dashboard/admin');
        $response->assertStatus(403);
    }

    public function test_role_security_murid_cannot_create_classes(): void
    {
        $murid = User::where('email', 'murid@gmail.com')->first();
        $response = $this->actingAs($murid)->get('/classes/create');
        $response->assertStatus(403);
    }
}
