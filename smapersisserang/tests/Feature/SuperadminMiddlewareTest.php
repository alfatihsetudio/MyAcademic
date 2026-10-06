<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuperadminMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_access_users_index()
    {
        $user = User::factory()->create(['role' => 'superadmin']);

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertOk();
    }

    public function test_admin_cannot_access_users_index()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get(route('admin.users.index'));

        $response->assertForbidden();
    }

    public function test_guest_cannot_access_users_index()
    {
        $response = $this->get(route('admin.users.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_superadmin_can_access_users_create()
    {
        $user = User::factory()->create(['role' => 'superadmin']);

        $response = $this->actingAs($user)->get(route('admin.users.create'));

        $response->assertOk();
    }

    public function test_admin_cannot_access_users_create()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get(route('admin.users.create'));

        $response->assertForbidden();
    }
}
