<?php

namespace Tests\Feature;

use App\Models\AcademicClass;
use App\Models\Assignment;
use App\Models\Material;
use App\Models\Subject;
use App\Models\User;
use Tests\TestCase;

class TeacherSuiteApiTest extends TestCase
{
    protected function getTeacherUser(): User
    {
        $teacher = User::where('email', 'guru@gmail.com')->first();
        if (!$teacher) {
            $teacher = User::factory()->create([
                'name' => 'Budi Santoso, M.Pd',
                'email' => 'guru@gmail.com',
                'role' => 'guru',
            ]);
        }
        return $teacher;
    }

    public function test_teacher_can_fetch_dashboard(): void
    {
        $teacher = $this->getTeacherUser();
        $response = $this->actingAs($teacher)->getJson('/api/teacher/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_teacher_can_create_and_delete_material(): void
    {
        $teacher = $this->getTeacherUser();
        $subject = Subject::first();

        // Create
        $response = $this->actingAs($teacher)->postJson('/api/teacher/materials', [
            'title' => 'Modul Uji Coba API Guru',
            'meeting' => 'Pertemuan 08',
            'class_name' => 'X RPL 1',
            'format' => 'PDF',
            'description' => 'Materi uji integrasi sistem.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $materialId = $response->json('material.id');
        $this->assertNotNull($materialId);

        // Delete
        $delResponse = $this->actingAs($teacher)->deleteJson("/api/teacher/materials/{$materialId}");
        $delResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_teacher_can_create_and_delete_assignment(): void
    {
        $teacher = $this->getTeacherUser();

        // Create
        $response = $this->actingAs($teacher)->postJson('/api/teacher/assignments', [
            'title' => 'Tugas Uji Coba Integrasi Guru',
            'class_name' => 'X RPL 1',
            'deadline' => now()->addDays(5)->toDateTimeString(),
            'max_score' => 100,
            'instructions' => 'Selesaikan tugas tepat waktu.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $assignmentId = $response->json('assignment.id');
        $this->assertNotNull($assignmentId);

        // Delete
        $delResponse = $this->actingAs($teacher)->deleteJson("/api/teacher/assignments/{$assignmentId}");
        $delResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_teacher_can_record_journal(): void
    {
        $teacher = $this->getTeacherUser();

        $response = $this->actingAs($teacher)->postJson('/api/teacher/journal', [
            'topic' => 'Persamaan Kuadrat & Analisis Titik Puncak',
            'class_name' => 'X RPL 1',
            'meeting' => 'Pertemuan 08',
            'activities' => 'Pemaparan teori dan latihan studi kasus.',
            'notes' => 'KBM berjalan tertib dan tepat waktu.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['journal' => ['id', 'date', 'status']]);
    }

    public function test_teacher_can_save_assessment_weights(): void
    {
        $teacher = $this->getTeacherUser();

        $response = $this->actingAs($teacher)->postJson('/api/teacher/assessments', [
            'tugas' => 20,
            'quiz' => 15,
            'uh' => 20,
            'praktik' => 20,
            'pts' => 10,
            'pas' => 15,
            'kkm' => 75,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_teacher_can_send_forum_message(): void
    {
        $teacher = $this->getTeacherUser();

        $response = $this->actingAs($teacher)->postJson('/api/teacher/messages', [
            'channel_id' => 'c1',
            'message' => 'Pengingat KBM: Harap membawa laptop hari Rabu.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data' => ['id', 'text', 'sender']]);
    }

    public function test_teacher_ai_assistant_responds(): void
    {
        $teacher = $this->getTeacherUser();

        $response = $this->actingAs($teacher)->postJson('/api/teacher/ai-assistant', [
            'prompt' => 'Buatkan 3 indikator pencapaian kompetensi untuk fungsi kuadrat.',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['reply']);
    }
}
