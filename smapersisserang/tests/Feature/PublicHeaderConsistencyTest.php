<?php

namespace Tests\Feature;

use App\Models\AdmissionProgram;
use App\Models\AdmissionYear;
use App\Models\StudentApplication;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicHeaderConsistencyTest extends TestCase
{
    use RefreshDatabase;

    public function test_homepage_uses_transparent_public_header_once(): void
    {
        $this->seed(DatabaseSeeder::class);

        $response = $this->get('/');

        $response->assertOk();
        $this->assertPublicHeader($response->getContent(), 'transparent');
    }

    public function test_public_pages_use_solid_public_header_once(): void
    {
        $this->seed(DatabaseSeeder::class);

        foreach ([
            '/profil',
            '/program',
            '/boarding-school',
            '/galeri',
            '/tokoh-pembina',
            '/guru',
            '/faq',
            '/ppdb/daftar',
            '/ppdb/cek-status',
        ] as $uri) {
            $response = $this->get($uri);

            $response->assertOk();
            $this->assertPublicHeader($response->getContent(), 'solid');
        }
    }

    public function test_ppdb_success_page_uses_solid_public_header_once(): void
    {
        $this->seed(DatabaseSeeder::class);

        $year = AdmissionYear::where('is_current', true)->firstOrFail();
        $program = AdmissionProgram::where('admission_year_id', $year->id)->firstOrFail();
        $application = StudentApplication::factory()->create([
            'admission_year_id' => $year->id,
            'admission_program_id' => $program->id,
        ]);

        $response = $this->get(route('ppdb.success', $application));

        $response->assertOk();
        $this->assertPublicHeader($response->getContent(), 'solid');
    }

    public function test_register_route_stays_disabled(): void
    {
        $this->get('/register')->assertNotFound();
    }

    private function assertPublicHeader(string $html, string $variant): void
    {
        $this->assertSame(1, substr_count($html, 'data-public-header'));
        $this->assertStringContainsString('data-header-variant="'.$variant.'"', $html);
        $this->assertStringContainsString('SMA Persis Serang', $html);
        $this->assertStringContainsString('SPMB', $html);
        $this->assertStringContainsString('Daftar SPMB', $html);
        $this->assertStringContainsString('Cek Status', $html);
        $this->assertStringNotContainsString('/register', $html);
    }
}
