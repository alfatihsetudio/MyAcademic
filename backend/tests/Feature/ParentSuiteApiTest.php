<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParentSuiteApiTest extends TestCase
{
    public function test_parent_dashboard_returns_active_child_and_alerts(): void
    {
        $response = $this->getJson('/api/parent/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'success',
                'active_child' => ['id', 'name', 'class_name', 'attendance_summary', 'academic_summary'],
                'children_list',
                'alerts',
                'today_agenda',
                'school_announcements',
            ]);
    }

    public function test_parent_can_switch_child_profile(): void
    {
        $response = $this->postJson('/api/parent/switch-child', ['child_id' => 2]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('active_child.id', 2)
            ->assertJsonPath('active_child.name', 'Aisyah Putri Trianto');
    }

    public function test_parent_attendance_and_leave_requests(): void
    {
        $response = $this->getJson('/api/parent/attendance');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'summary',
                'today_realtime',
                'monthly_recap',
                'semester_recap',
                'recent_history',
            ]);

        $submitResponse = $this->postJson('/api/parent/submit-leave', [
            'child_id' => 1,
            'leave_type' => 'Sakit',
            'start_date' => '2026-10-05',
            'end_date' => '2026-10-05',
            'reason' => 'Demam dan flu',
        ]);

        $submitResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_parent_academic_and_grades_read_only(): void
    {
        $response = $this->getJson('/api/parent/academic');
        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'overall_gpa',
                'total_subjects',
                'subjects',
                'chart_data',
            ]);

        $gradesResponse = $this->getJson('/api/parent/grades');
        $gradesResponse->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_parent_ai_assistant(): void
    {
        $response = $this->postJson('/api/parent/ai-chat', [
            'prompt' => 'Apakah anak saya hadir hari ini?',
            'child_id' => 1,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['reply']);
    }
}
