<?php

namespace Tests\Feature;

use App\Models\AcademicClass;
use App\Models\Assignment;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Tests\TestCase;

class AcademicExtendedFlowTest extends TestCase
{
    public function test_admin_can_create_and_delete_class(): void
    {
        $admin = User::where('email', 'admin@gmail.com')->first();
        $guru = User::where('email', 'guru@gmail.com')->first();

        // Create class
        $response = $this->actingAs($admin)->post('/classes', [
            'jenjang' => '11',
            'jurusan' => 'TKJ',
            'guru_id' => $guru->id,
            'walimurid' => 'Bapak Ahmad',
            'no_telpon_wali' => '0812345678',
            'nama_km' => 'KM Fatih',
            'no_telpon_km' => '0812345679',
            'deskripsi' => 'Kelas XI TKJ Baru',
        ]);

        $response->assertRedirect('/classes');
        $this->assertDatabaseHas('classes', [
            'nama_kelas' => '11 TKJ',
            'level' => '11',
            'jurusan' => 'TKJ',
        ]);

        $newClass = AcademicClass::where('nama_kelas', '11 TKJ')->first();

        // Delete class
        $delResponse = $this->actingAs($admin)->delete("/classes/{$newClass->id}");
        $delResponse->assertRedirect('/classes');
        $this->assertDatabaseMissing('classes', ['id' => $newClass->id]);
    }

    public function test_guru_and_murid_assignment_flow(): void
    {
        $guru = User::where('email', 'guru@gmail.com')->first();
        $murid = User::where('email', 'murid@gmail.com')->first();
        $subject = Subject::first();
        $class = AcademicClass::first();

        // 1. Guru creates assignment
        $response = $this->actingAs($guru)->post('/assignments', [
            'subject_id' => $subject->id,
            'target_class_id' => $class->id,
            'judul' => 'Tugas Uji Otomatis Laravel',
            'deskripsi' => 'Kerjakan soal latihan 1-5 dengan baik.',
            'deadline' => now()->addDays(7)->format('Y-m-d H:i:s'),
        ]);

        $response->assertRedirect('/assignments');
        $assignment = Assignment::where('judul', 'Tugas Uji Otomatis Laravel')->first();
        $this->assertNotNull($assignment);

        // 2. Murid submits assignment
        $subResponse = $this->actingAs($murid)->post("/assignments/{$assignment->id}/submit", [
            'catatan' => 'Jawaban sudah saya kerjakan dengan lengkap.',
            'link_drive' => 'https://drive.google.com/sample',
        ]);

        $subResponse->assertSessionHas('success');
        $submission = Submission::where('assignment_id', $assignment->id)->where('student_id', $murid->id)->first();
        $this->assertNotNull($submission);

        // 3. Guru grades submission
        $gradeResponse = $this->actingAs($guru)->post("/submissions/{$submission->id}/grade", [
            'nilai' => 95,
            'feedback' => 'Bagus sekali, teruskan prestasi belajarmu!',
        ]);

        $gradeResponse->assertSessionHas('success');
        $submission->refresh();
        $this->assertEquals(95, $submission->nilai);
        $this->assertEquals('Bagus sekali, teruskan prestasi belajarmu!', $submission->feedback);

        // Cleanup
        $assignment->delete();
    }

    public function test_teacher_can_record_attendance(): void
    {
        $guru = User::where('email', 'guru@gmail.com')->first();
        $subject = Subject::first();
        $murid = User::where('email', 'murid@gmail.com')->first();

        $response = $this->actingAs($guru)->post('/attendance/store', [
            'subject_id' => $subject->id,
            'date' => date('Y-m-d'),
            'materi' => 'Pertemuan 1 Pengenalan Kaidah',
            'status' => [
                $murid->id => 'H',
            ],
            'note' => [
                $murid->id => 'Hadir tepat waktu dan aktif',
            ],
            'nilai' => [
                $murid->id => 90,
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('attendance', [
            'student_id' => $murid->id,
            'subject_id' => $subject->id,
            'status' => 'H',
            'daily_score' => 90,
        ]);
    }

    public function test_murid_space_belajar_goal_and_log(): void
    {
        $murid = User::where('email', 'murid@gmail.com')->first();

        // Add goal
        $response = $this->actingAs($murid)->post('/space-belajar/add-goal', [
            'title' => 'Khatam Kitab Nahwu',
            'description' => 'Target selesai dalam 1 semester',
            'target_date' => now()->addMonths(3)->format('Y-m-d'),
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('study_goals', [
            'user_id' => $murid->id,
            'title' => 'Khatam Kitab Nahwu',
        ]);
    }
}
