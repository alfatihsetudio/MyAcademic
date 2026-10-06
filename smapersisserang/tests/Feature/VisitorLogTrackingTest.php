<?php

namespace Tests\Feature;

use App\Models\SchoolSetting;
use App\Models\VisitorLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class VisitorLogTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        SchoolSetting::create([
            'school_name' => 'SMA Persis Serang',
            'is_active' => true,
            'public_dashboard_token' => null,
        ]);
    }

    public function test_progress_page_does_not_create_visitor_log(): void
    {
        $token = Str::random(48);
        SchoolSetting::current()->update(['public_dashboard_token' => $token]);

        $this->get(route('public.progress', $token));

        $this->assertEquals(0, VisitorLog::count());
    }

    public function test_public_page_creates_visitor_log(): void
    {
        $this->get('/');
        $this->assertEquals(1, VisitorLog::count());
        $this->assertEquals('/', VisitorLog::first()->path);
    }

    public function test_spmb_page_creates_visitor_log(): void
    {
        $this->get('/spmb');
        $this->assertEquals(1, VisitorLog::count());
        $this->assertEquals('/spmb', VisitorLog::first()->path);
    }

    public function test_dashboard_page_does_not_create_visitor_log(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/dashboard');

        $this->assertEquals(0, VisitorLog::count());
    }

    public function test_admin_page_does_not_create_visitor_log(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/admin/ppdb');

        $this->assertEquals(0, VisitorLog::count());
    }

    public function test_login_page_does_not_create_visitor_log(): void
    {
        $this->get('/login');
        $this->assertEquals(0, VisitorLog::count());
    }

    public function test_top_referrers_excludes_progress_paths(): void
    {
        VisitorLog::create([
            'url' => 'http://localhost/spmb',
            'path' => '/spmb',
            'referrer' => 'http://localhost/progress/abc123',
            'user_agent' => 'test',
            'ip_hash' => 'test',
            'device' => 'desktop',
            'visited_at' => now(),
        ]);

        VisitorLog::create([
            'url' => 'http://localhost/spmb',
            'path' => '/spmb',
            'referrer' => 'http://google.com',
            'user_agent' => 'test',
            'ip_hash' => 'test2',
            'device' => 'mobile',
            'visited_at' => now(),
        ]);

        $topReferrers = VisitorLog::selectRaw('referrer, count(*) as total')
            ->where(function ($q) {
                $q->whereNull('referrer')
                  ->orWhere('referrer', '')
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('referrer')
                          ->where('referrer', '!=', '')
                          ->where('referrer', 'NOT LIKE', '%/progress/%')
                          ->where('referrer', 'NOT LIKE', '%/dashboard%')
                          ->where('referrer', 'NOT LIKE', '%/admin%');
                  });
            })
            ->groupBy('referrer')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($item) {
                if (empty($item->referrer)) {
                    $item->referrer = 'Langsung / WhatsApp';
                }
                return $item;
            })
            ->sortByDesc('total')
            ->values();

        $referrers = $topReferrers->pluck('referrer')->toArray();
        $this->assertContains('http://google.com', $referrers);
        $this->assertNotContains('http://localhost/progress/abc123', $referrers);
    }

    public function test_top_pages_excludes_progress_admin_dashboard(): void
    {
        VisitorLog::create([
            'url' => 'http://localhost/progress/abc',
            'path' => '/progress/abc',
            'referrer' => null,
            'user_agent' => 'test',
            'ip_hash' => 'test',
            'device' => 'desktop',
            'visited_at' => now(),
        ]);

        VisitorLog::create([
            'url' => 'http://localhost/spmb',
            'path' => '/spmb',
            'referrer' => null,
            'user_agent' => 'test',
            'ip_hash' => 'test2',
            'device' => 'desktop',
            'visited_at' => now(),
        ]);

        $topPages = VisitorLog::selectRaw('path, count(*) as total')
            ->where('path', 'NOT LIKE', '/progress%')
            ->where('path', 'NOT LIKE', '%dashboard%')
            ->where('path', 'NOT LIKE', '/admin%')
            ->groupBy('path')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        $paths = $topPages->pluck('path')->toArray();
        $this->assertContains('/spmb', $paths);
        $this->assertNotContains('/progress/abc', $paths);
    }

    public function test_referrer_nullified_in_cleanup(): void
    {
        VisitorLog::create([
            'url' => 'http://localhost/spmb',
            'path' => '/spmb',
            'referrer' => 'http://localhost/progress/sometoken',
            'user_agent' => 'test',
            'ip_hash' => 'test',
            'device' => 'desktop',
            'visited_at' => now(),
        ]);

        \Illuminate\Support\Facades\DB::table('visitor_logs')
            ->where('referrer', 'like', '%/progress/%')
            ->update(['referrer' => null]);

        $this->assertNull(VisitorLog::first()->referrer);
    }
}
