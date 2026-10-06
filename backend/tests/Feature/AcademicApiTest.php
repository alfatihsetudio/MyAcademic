<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AcademicApiTest extends TestCase
{
    public function test_api_login_returns_token_and_user_data(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'murid@gmail.com',
            'password' => 'admin123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'token',
            'user' => ['id', 'name', 'email', 'role'],
        ]);
    }

    public function test_api_dashboard_returns_journey_and_stats(): void
    {
        $user = User::where('role', 'murid')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'primary_class',
            'members',
            'workflow_stages',
            'knowledge_items',
            'stats',
        ]);
    }

    public function test_api_classes_and_subjects(): void
    {
        $user = User::where('role', 'murid')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        $resClasses = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/classes');
        $resClasses->assertStatus(200);

        $resSubjects = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/subjects');
        $resSubjects->assertStatus(200);
    }

    public function test_api_space_belajar_explorer_and_calendar(): void
    {
        $user = User::where('role', 'murid')->first();
        $token = $user->createToken('test-token')->plainTextToken;

        // Explorer
        $resExplorer = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/space-belajar/explorer');
        $resExplorer->assertStatus(200);
        $resExplorer->assertJsonStructure(['success', 'folders', 'files']);

        // Create folder
        $resFolder = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/space-belajar/folder', ['name' => 'Catatan Biologi']);
        $resFolder->assertStatus(200);

        // Calendar
        $resCalendar = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/space-belajar/calendar?year=2026');
        $resCalendar->assertStatus(200);
        $resCalendar->assertJsonStructure(['success', 'year', 'events']);
    }
}
