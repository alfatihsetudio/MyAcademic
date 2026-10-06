<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MenuVisibilityTest extends TestCase
{
    private array $roles = [
        'superadmin', 'admin', 'kepala_sekolah', 'guru',
        'staf_tata_usaha', 'staf_keuangan', 'staf_kesiswaan', 'staf_sarpras',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedRoles();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('menu_role_overrides');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('school_settings');
        parent::tearDown();
    }

    private function createTables(): void
    {
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

        Schema::create('roles', function ($table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->text('description')->nullable();
            $table->string('guard_name', 30)->default('web');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });

        Schema::create('school_settings', function ($table) {
            $table->id();
            $table->string('school_name')->nullable();
            $table->string('tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('menu_role_overrides', function ($table) {
            $table->id();
            $table->string('menu_key', 100)->unique();
            $table->json('roles');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
        });
    }

    private function seedRoles(): void
    {
        $systemRoles = [
            'superadmin' => ['display_name' => 'Superadmin', 'sort_order' => 1],
            'admin' => ['display_name' => 'Admin', 'sort_order' => 2],
            'kepala_sekolah' => ['display_name' => 'Kepala Sekolah', 'sort_order' => 3],
            'guru' => ['display_name' => 'Guru', 'sort_order' => 4],
            'staf_tata_usaha' => ['display_name' => 'Staf Tata Usaha', 'sort_order' => 5],
            'staf_keuangan' => ['display_name' => 'Staf Keuangan', 'sort_order' => 6],
            'staf_kesiswaan' => ['display_name' => 'Staf Kesiswaan', 'sort_order' => 7],
            'staf_sarpras' => ['display_name' => 'Staf Sarpras', 'sort_order' => 8],
        ];

        foreach ($systemRoles as $name => $config) {
            Role::firstOrCreate(
                ['name' => $name],
                [
                    'display_name' => $config['display_name'],
                    'guard_name' => 'web',
                    'is_system' => true,
                    'is_active' => true,
                    'sort_order' => $config['sort_order'],
                ]
            );
        }
    }

    private function flattenMenuItems(): array
    {
        $menu = config('admin-menu');
        $items = [];

        $items[] = $menu['dashboard'] + ['type' => 'dashboard'];

        foreach ($menu['sections'] as $section) {
            foreach ($section['items'] as $item) {
                if (isset($item['children'])) {
                    $items[] = [
                        'label' => $item['label'],
                        'roles' => $item['roles'] ?? [],
                        'type' => 'parent',
                    ];
                    foreach ($item['children'] as $child) {
                        $items[] = [
                            'label' => $child['label'],
                            'roles' => $child['roles'] ?? [],
                            'type' => 'child',
                        ];
                    }
                } else {
                    $items[] = [
                        'label' => $item['label'],
                        'roles' => $item['roles'] ?? [],
                        'type' => 'item',
                    ];
                }
            }
        }

        foreach ($menu['account']['items'] as $item) {
            $items[] = $item + ['type' => 'account'];
        }

        return $items;
    }

    public function test_dashboard_visible_to_all(): void
    {
        $items = $this->flattenMenuItems();
        $dashboard = collect($items)->firstWhere('label', 'Dashboard');
        $this->assertNotNull($dashboard);
        $this->assertEmpty($dashboard['roles']);
    }

    public function test_profile_visible_to_all(): void
    {
        $items = $this->flattenMenuItems();
        $profile = collect($items)->firstWhere('label', 'Profil');
        $this->assertNotNull($profile);
        $this->assertEmpty($profile['roles']);
    }

    public function test_only_superadmin_can_see_kelola_user(): void
    {
        $items = $this->flattenMenuItems();
        $kelolaUser = collect($items)->firstWhere('label', 'Kelola User');
        $this->assertNotNull($kelolaUser);
        $this->assertEquals(['superadmin'], $kelolaUser['roles']);
    }

    public function test_every_role_has_roles_array(): void
    {
        $menu = config('admin-menu');

        foreach ($menu['sections'] as $section) {
            foreach ($section['items'] as $item) {
                $this->assertArrayHasKey('roles', $item, "Item '{$item['label']}' missing 'roles' key");
                $this->assertIsArray($item['roles'], "Item '{$item['label']}' roles is not an array");

                if (isset($item['children'])) {
                    foreach ($item['children'] as $child) {
                        $this->assertArrayHasKey('roles', $child, "Child '{$child['label']}' missing 'roles' key");
                        $this->assertIsArray($child['roles'], "Child '{$child['label']}' roles is not an array");
                    }
                }
            }
        }

        foreach ($menu['account']['items'] as $item) {
            $this->assertArrayHasKey('roles', $item, "Account item '{$item['label']}' missing 'roles' key");
            $this->assertIsArray($item['roles'], "Account item '{$item['label']}' roles is not an array");
        }
    }

    public function test_all_roles_are_valid(): void
    {
        $validRoles = ['superadmin', 'admin', 'kepala_sekolah', 'guru', 'staf_tata_usaha', 'staf_keuangan', 'staf_kesiswaan', 'staf_sarpras'];
        $menu = config('admin-menu');

        foreach ($menu['sections'] as $section) {
            foreach ($section['items'] as $item) {
                foreach ($item['roles'] as $role) {
                    $this->assertContains($role, $validRoles, "Invalid role '{$role}' in item '{$item['label']}'");
                }
                if (isset($item['children'])) {
                    foreach ($item['children'] as $child) {
                        foreach ($child['roles'] as $role) {
                            $this->assertContains($role, $validRoles, "Invalid role '{$role}' in child '{$child['label']}'");
                        }
                    }
                }
            }
        }

        foreach ($menu['account']['items'] as $item) {
            foreach ($item['roles'] as $role) {
                $this->assertContains($role, $validRoles, "Invalid role '{$role}' in account item '{$item['label']}'");
            }
        }
    }

    /**
     * @dataProvider menuVisibilityDataProvider
     */
    public function test_menu_visibility_for_role(string $role, array $expectedVisible, array $expectedHidden): void
    {
        $user = User::factory()->create(['role' => $role]);
        $roleModel = Role::where('name', $role)->first();
        $user->roles()->attach($roleModel->id);

        $items = $this->flattenMenuItems();

        foreach ($items as $item) {
            $visible = $this->canSee($item['roles'], $user);
            $label = $item['label'];

            if (in_array($label, $expectedVisible)) {
                $this->assertTrue($visible, "Role '{$role}' should see menu item '{$label}'.");
            } elseif (in_array($label, $expectedHidden)) {
                $this->assertFalse($visible, "Role '{$role}' should NOT see menu item '{$label}'.");
            } else {
                $this->fail("Item '{$label}' not listed in expectedVisible or expectedHidden for role '{$role}'.");
            }
        }
    }

    private function canSee(array $roles, User $user): bool
    {
        if (empty($roles)) {
            return true;
        }
        return $user->hasAnyRole($roles);
    }

    public static function menuVisibilityDataProvider(): array
    {
        $always = ['Dashboard', 'Profil'];

        return [
            'superadmin' => [
                'superadmin',
                array_merge($always, [
                    'Dashboard SPMB', 'Data Pendaftaran', 'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran', 'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI', 'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ]),
                [],
            ],
            'admin' => [
                'admin',
                array_merge($always, [
                    'Dashboard SPMB', 'Data Pendaftaran', 'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran', 'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI',
                ]),
                ['Kelola User', 'Pengaturan Role', 'Pengaturan Menu'],
            ],
            'kepala_sekolah' => [
                'kepala_sekolah',
                array_merge($always, [
                    'Dashboard SPMB', 'Data Pendaftaran',
                    'Dashboard Keuangan', 'Laporan',
                    'Surat Keluar', 'Surat Masuk',
                    'Donasi Masuk',
                    'Wakaf Masuk',
                    'Dashboard Sarpras', 'Laporan Sarpras',
                    'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                ]),
                [
                    'Pengaturan SPMB',
                    'Pemasukan', 'Pengeluaran',
                    'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Buat Bukti Penerimaan',
                    'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran',
                    'FAQ AI', 'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
            'guru' => [
                'guru',
                array_merge($always, [
                    'Kalender Pendidikan', 'Jadwal Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI',
                ]),
                [
                    'Dashboard SPMB', 'Data Pendaftaran', 'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran', 'Tahun Pelajaran',
                    'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
            'staf_tata_usaha' => [
                'staf_tata_usaha',
                array_merge($always, [
                    'Dashboard SPMB', 'Data Pendaftaran',
                    'Donasi Masuk',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran', 'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI',
                ]),
                [
                    'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Dashboard Donasi', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
            'staf_keuangan' => [
                'staf_keuangan',
                array_merge($always, [
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                ]),
                [
                    'Dashboard SPMB', 'Data Pendaftaran', 'Pengaturan SPMB',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Pengajuan OTA',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran',
                    'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI', 'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
            'staf_kesiswaan' => [
                'staf_kesiswaan',
                array_merge($always, [
                    'Dashboard SPMB', 'Data Pendaftaran',
                    'Pengajuan OTA',
                    'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                ]),
                [
                    'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran',
                    'FAQ AI', 'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
            'staf_sarpras' => [
                'staf_sarpras',
                array_merge($always, [
                    'Dashboard Sarpras', 'Data Aset', 'Data Ruangan', 'Kebutuhan Sarpras', 'Perbaikan', 'Pengadaan Barang', 'Laporan Sarpras',
                ]),
                [
                    'Dashboard SPMB', 'Data Pendaftaran', 'Pengaturan SPMB',
                    'Dashboard Keuangan', 'Pemasukan', 'Pengeluaran', 'Laporan',
                    'Surat Keluar', 'Surat Masuk', 'Template Surat', 'Penandatangan', 'Jenis Surat', 'Pengaturan Surat',
                    'Dashboard Donasi', 'Donasi Masuk', 'Mutasi Dana', 'Pengingat Donasi', 'Donasi Barang', 'Pengaturan Halaman Donasi', 'Template Share WA',
                    'Pengajuan OTA',
                    'Pengaturan Wakaf', 'Wakaf Masuk', 'Buat Bukti Penerimaan',
                    'Pengaturan Website', 'Konten Boarding', 'Galeri Sekolah', 'Kategori Galeri', 'Konten Halaman', 'Menu Navigasi', 'Struktur Organisasi', 'Nilai Utama', 'Tokoh & Pembina',
                    'Profil Guru', 'Mata Pelajaran',
                    'Kalender Pendidikan', 'Jadwal Pelajaran', 'Tahun Pelajaran', 'Kelas / Rombel', 'Jam Pelajaran',
                    'FAQ AI', 'Kelola User', 'Pengaturan Role', 'Pengaturan Menu',
                ],
            ],
        ];
    }

    public function test_html_sidebar_for_staf_tata_usaha(): void
    {
        $user = User::factory()->create(['name' => 'TU User', 'role' => 'staf_tata_usaha']);
        $roleModel = Role::where('name', 'staf_tata_usaha')->first();
        $user->roles()->attach($roleModel->id);

        Route::middleware('web')->group(function () {
            Route::get('/_test/menu-tu', function () {
                return view('components.admin-layout', ['slot' => '']);
            })->middleware('auth')->name('_test.menu-tu');
        });

        $response = $this->actingAs($user)->get('/_test/menu-tu');
        $html = $response->getContent();

        $this->assertStringContainsString('Surat Keluar', $html);
        $this->assertStringContainsString('Surat Masuk', $html);
        $this->assertStringContainsString('Dashboard SPMB', $html);
        $this->assertStringContainsString('Data Pendaftaran', $html);
        $this->assertStringContainsString('FAQ AI', $html);
        $this->assertStringContainsString('Dashboard', $html);
        $this->assertStringContainsString('Profil', $html);
        $this->assertStringContainsString('TU User', $html);

        $this->assertStringNotContainsString('Kelola User', $html);
        $this->assertStringNotContainsString('Pemasukan', $html);
        $this->assertStringNotContainsString('Dashboard Keuangan', $html);
        $this->assertStringContainsString('Donasi Masuk', $html);
        $this->assertStringNotContainsString('Dashboard Sarpras', $html);
        $this->assertStringNotContainsString('Data Aset', $html);
    }

    public function test_html_sidebar_for_guru(): void
    {
        $user = User::factory()->create(['name' => 'Guru User', 'role' => 'guru']);
        $roleModel = Role::where('name', 'guru')->first();
        $user->roles()->attach($roleModel->id);

        Route::middleware('web')->group(function () {
            Route::get('/_test/menu-guru', function () {
                return view('components.admin-layout', ['slot' => '']);
            })->middleware('auth')->name('_test.menu-guru');
        });

        $response = $this->actingAs($user)->get('/_test/menu-guru');
        $html = $response->getContent();

        $this->assertStringContainsString('Dashboard', $html);
        $this->assertStringContainsString('Profil', $html);
        $this->assertStringContainsString('Kalender Pendidikan', $html);
        $this->assertStringContainsString('Jadwal Pelajaran', $html);
        $this->assertStringContainsString('Kelas / Rombel', $html);
        $this->assertStringContainsString('Jam Pelajaran', $html);
        $this->assertStringContainsString('FAQ AI', $html);
        $this->assertStringContainsString('Guru User', $html);

        $this->assertStringNotContainsString('Kelola User', $html);
        $this->assertStringNotContainsString('Dashboard SPMB', $html);
        $this->assertStringNotContainsString('Surat Keluar', $html);
        $this->assertStringNotContainsString('Laporan Sarpras', $html);
        $this->assertStringNotContainsString('Tahun Pelajaran', $html);
    }

    public function test_html_sidebar_hides_empty_section(): void
    {
        $user = User::factory()->create(['name' => 'Staf Sarpras', 'role' => 'staf_sarpras']);
        $roleModel = Role::where('name', 'staf_sarpras')->first();
        $user->roles()->attach($roleModel->id);

        Route::middleware('web')->group(function () {
            Route::get('/_test/menu-sarpras', function () {
                return view('components.admin-layout', ['slot' => '']);
            })->middleware('auth')->name('_test.menu-sarpras');
        });

        $response = $this->actingAs($user)->get('/_test/menu-sarpras');
        $html = $response->getContent();

        $this->assertStringContainsString('SARPRAS', $html);
        $this->assertStringContainsString('Dashboard Sarpras', $html);
        $this->assertStringContainsString('Data Aset', $html);

        $this->assertStringNotContainsString('SPMB', $html);
        $this->assertStringNotContainsString('Dashboard SPMB', $html);
        $this->assertStringNotContainsString('KEUANGAN', $html);
        $this->assertStringNotContainsString('SURAT MENYURAT', $html);
        $this->assertStringNotContainsString('DONASI', $html);
        $this->assertStringNotContainsString('ORANG TUA ASUH', $html);
        $this->assertStringNotContainsString('WAKAF', $html);
        $this->assertStringNotContainsString('WEBSITE', $html);
        $this->assertStringNotContainsString('AKADEMIK', $html);
        $this->assertStringNotContainsString('SISTEM', $html);
    }
}
