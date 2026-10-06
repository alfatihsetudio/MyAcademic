<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class StudentPortalMenusTest extends TestCase
{
    protected $student;
    protected $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::where('role', 'murid')->first();
        if (!$this->student) {
            $this->student = User::factory()->create([
                'name' => 'Test Murid',
                'email' => 'murid_test@gmail.com',
                'password' => Hash::make('password123'),
                'role' => 'murid',
            ]);
        }

        $this->teacher = User::where('role', 'guru')->first();
    }

    public function test_student_dashboard_renders_quick_action_tiles(): void
    {
        $response = $this->actingAs($this->student)->get(route('murid.dashboard'));

        $response->assertStatus(200);
        $response->assertSee('Daftar Kelas');
        $response->assertSee('Daftar Mapel');
        $response->assertSee('Rekap Nilai');
        $response->assertSee('Riwayat Absensi');
        $response->assertSee('Pengaturan Akun');
    }

    public function test_student_can_view_my_classes_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('classes.my-classes'));

        $response->assertStatus(200);
        $response->assertSee('Daftar Kelas Saya');
    }

    public function test_student_can_view_subjects_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('subjects.index'));

        $response->assertStatus(200);
        $response->assertSee('Mata Pelajaran');
    }

    public function test_student_can_view_rekap_nilai_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('grades.my-rekap'));

        $response->assertStatus(200);
        $response->assertSee('Rekap Nilai Siswa');
    }

    public function test_student_can_view_riwayat_absensi_page(): void
    {
        $response = $this->actingAs($this->student)->get(route('attendance.my-history'));

        $response->assertStatus(200);
        $response->assertSee('Riwayat Absensi');
    }

    public function test_user_can_view_and_update_account_settings(): void
    {
        $response = $this->actingAs($this->student)->get(route('account.settings'));
        $response->assertStatus(200);
        $response->assertSee('Pengaturan Akun');

        // Test update without changing password
        $updateResp = $this->actingAs($this->student)->post(route('account.update'), [
            'name' => 'Murid Updated Name',
            'email' => $this->student->email,
        ]);
        $updateResp->assertRedirect(route('account.settings'));
        $updateResp->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $this->student->id,
            'name' => 'Murid Updated Name',
        ]);
    }
}
