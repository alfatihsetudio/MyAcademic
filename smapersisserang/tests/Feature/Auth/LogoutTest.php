<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class LogoutTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
        parent::tearDown();
    }

    private function createTables(): void
    {
        if (!Schema::hasTable('users')) {
            Schema::create('users', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('email')->unique();
                $table->timestamp('email_verified_at')->nullable();
                $table->string('password');
                $table->rememberToken();
                $table->string('role', 50)->default('admin');
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('password_reset_tokens')) {
            Schema::create('password_reset_tokens', function ($table) {
                $table->string('email')->primary();
                $table->string('token');
                $table->timestamp('created_at')->nullable();
            });
        }

        if (!Schema::hasTable('sessions')) {
            Schema::create('sessions', function ($table) {
                $table->string('id')->primary();
                $table->foreignId('user_id')->nullable()->index();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->longText('payload');
                $table->integer('last_activity')->index();
            });
        }
    }

    private function createUser(array $overrides = []): User
    {
        $data = array_merge([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ], $overrides);

        $id = DB::table('users')->insertGetId($data);

        return User::find($id);
    }

    public function test_post_logout_removes_auth_and_redirects_to_home(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_get_logout_does_not_return_419(): void
    {
        $user = $this->createUser();

        $response = $this->actingAs($user)->get('/logout');

        $response->assertStatus(302);
        $this->assertGuest();
    }

    public function test_get_logout_removes_authentication(): void
    {
        $user = $this->createUser();

        $this->actingAs($user);
        $this->assertAuthenticated();

        $this->get('/logout');

        $this->assertGuest();
    }

    public function test_guest_opening_logout_is_redirected_to_home(): void
    {
        $response = $this->get('/logout');

        $response->assertStatus(302);
        $response->assertRedirect('/');
    }

    public function test_dashboard_inaccessible_after_logout(): void
    {
        $user = $this->createUser();

        $this->actingAs($user);
        $this->assertAuthenticated();

        $this->post('/logout');

        $this->assertGuest();
        $this->assertNull($this->app['auth']->guard('web')->user());
    }
}
