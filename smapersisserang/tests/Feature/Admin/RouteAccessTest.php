<?php

namespace Tests\Feature\Admin;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class RouteAccessTest extends TestCase
{
    private array $roles = [
        'superadmin', 'admin', 'kepala_sekolah', 'guru',
        'staf_tata_usaha', 'staf_keuangan', 'staf_kesiswaan', 'staf_sarpras',
    ];

    private array $routes = [];

    protected function setUp(): void
    {
        parent::setUp();

        $this->createTables();
        $this->seedRoles();
        $this->registerTestRoutes();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('users');
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

    private function registerTestRoutes(): void
    {
        Route::middleware('web')->group(function () {
            Route::middleware('auth')->group(function () {
                $groups = self::defineRouteGroups();

                foreach ($groups as $key => $group) {
                    $allowed = implode(',', $group['roles']);

                    foreach ($group['routes'] as $route) {
                        $method = $route[0];
                        $path = $route[1];
                        $routeName = 'test.' . $key . '.' . ($route[2] ?? str_replace('/', '.', trim($path, '/')));
                        $fullPath = '/_test/role/' . $key . $path;

                        $middleware = ['auth', 'role:' . $allowed];

                        Route::$method($fullPath, function () {
                            return 'OK';
                        })->middleware($middleware)->name($routeName);

                        $this->routes[$routeName] = [
                            'method' => $method,
                            'path' => $fullPath,
                            'roles' => $group['roles'],
                        ];
                    }
                }
            });
        });
    }

    private static function defineRouteGroups(): array
    {
        return [
            // ── PPDB ──
            'ppdb.dashboard' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
                'routes' => [['get', '']],
            ],
            'ppdb.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/{id}']],
            ],
            'ppdb.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan'],
                'routes' => [['get', '/export'], ['get', '/export-pdf'], ['get', '/{id}/print'], ['get', '/{id}/requirements/download'], ['patch', '/{id}/status'], ['patch', '/{id}/follow-up'], ['patch', '/{id}/mark-data-complete'], ['post', '/{id}/generate-update-link']],
            ],
            'ppdb.delete' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['delete', '/{id}']],
            ],
            'ppdb.settings' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['get', ''], ['put', '']],
            ],

            // ── Website Settings ──
            'website.settings' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['put', '']],
            ],
            'website.settings.token' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['post', '/generate-token']],
            ],

            // ── Website Boarding ──
            'website.boarding' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['put', '/settings'], ['post', '/cards'], ['put', '/cards/{id}'], ['delete', '/cards/{id}'], ['post', '/schedules'], ['put', '/schedules/{id}'], ['delete', '/schedules/{id}']],
            ],

            // ── Donation Settings ──
            'website.donasi-pendidikan' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', ''], ['put', '']],
            ],

            // ── Donation Transactions ──
            'donasi-transactions.read' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan', 'kepala_sekolah', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/{id}']],
            ],
            'donasi-transactions.write' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan', 'staf_tata_usaha'],
                'routes' => [['get', '/buat-bukti-penerimaan'], ['post', '/buat-bukti-penerimaan/parse'], ['post', '/buat-bukti-penerimaan'], ['patch', '/{id}/mark-paid'], ['patch', '/{id}/mark-cancelled']],
            ],

            // ── Infaq Barang ──
            'infaq-barang' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}']],
            ],

            // ── Infaq Barang WA ──
            'infaq-barang-wa' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', ''], ['get', '/create'], ['post', '/parse'], ['post', ''], ['get', '/{id}'], ['patch', '/{id}/status']],
            ],

            // ── Donasi Pendidikan Share Template ──
            'donasi-pendidikan.share-template' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', ''], ['put', '']],
            ],

            // ── Wakaf Settings ──
            'wakaf.settings' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', ''], ['put', '']],
            ],

            // ── Wakaf Transactions ──
            'wakaf.transactions.read' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/{id}']],
            ],
            'wakaf.transactions.write' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', '/buat-bukti-penerimaan'], ['post', '/buat-bukti-penerimaan/parse'], ['post', '/buat-bukti-penerimaan'], ['patch', '/{id}/mark-paid'], ['patch', '/{id}/mark-cancelled']],
            ],

            // ── Finance ──
            'finance.read' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/laporan']],
            ],
            'finance.write' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['get', '/pemasukan'], ['get', '/pemasukan/create'], ['post', '/pemasukan'], ['get', '/pemasukan/{id}/edit'], ['put', '/pemasukan/{id}'], ['get', '/pengeluaran'], ['get', '/pengeluaran/create'], ['post', '/pengeluaran'], ['get', '/pengeluaran/{id}/edit'], ['put', '/pengeluaran/{id}']],
            ],
            'finance.delete.pemasukan' => [
                'roles' => ['superadmin', 'admin', 'staf_keuangan'],
                'routes' => [['delete', '/pemasukan/{id}']],
            ],
            'finance.delete.pengeluaran' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['delete', '/pengeluaran/{id}']],
            ],

            // ── Letters Outgoing ──
            'letters.outgoings.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/{id}'], ['get', '/{id}/preview']],
            ],
            'letters.outgoings.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['get', '/{id}/print'], ['get', '/{id}/print-all'], ['get', '/{id}/print/{recipient}'], ['put', '/{id}'], ['get', '/{id}/issue'], ['post', '/{id}/issue'], ['put', '/{id}/attachment']],
            ],

            // ── Letters Incoming ──
            'letters.incomings.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/{id}']],
            ],
            'letters.incomings.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Letters Signers ──
            'letters.signers' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Letters Templates ──
            'letters.templates' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}'], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Letters Types ──
            'letters.types' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Letters Settings ──
            'letters.settings' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['put', '']],
            ],

            // ── Sarpras ──
            'sarpras.read' => [
                'roles' => ['superadmin', 'admin', 'staf_sarpras', 'kepala_sekolah'],
                'routes' => [['get', ''], ['get', '/laporan']],
            ],
            'sarpras.write' => [
                'roles' => ['superadmin', 'admin', 'staf_sarpras'],
                'routes' => [['get', '/aset'], ['get', '/aset/create'], ['post', '/aset'], ['get', '/aset/{id}'], ['get', '/aset/{id}/edit'], ['put', '/aset/{id}'], ['get', '/ruangan'], ['get', '/ruangan/create'], ['post', '/ruangan'], ['get', '/ruangan/{id}/edit'], ['put', '/ruangan/{id}'], ['get', '/kebutuhan'], ['get', '/kebutuhan/create'], ['post', '/kebutuhan'], ['get', '/kebutuhan/{id}/edit'], ['put', '/kebutuhan/{id}'], ['get', '/perbaikan'], ['get', '/perbaikan/create'], ['post', '/perbaikan'], ['get', '/perbaikan/{id}/edit'], ['put', '/perbaikan/{id}'], ['get', '/pengadaan'], ['get', '/pengadaan/create'], ['post', '/pengadaan'], ['get', '/pengadaan/{id}/edit'], ['put', '/pengadaan/{id}']],
            ],
            'sarpras.delete' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['delete', '/aset/{id}'], ['delete', '/ruangan/{id}'], ['delete', '/kebutuhan/{id}'], ['delete', '/perbaikan/{id}'], ['delete', '/pengadaan/{id}']],
            ],

            // ── Foster Students ──
            'orang-tua-asuh' => [
                'roles' => ['superadmin', 'admin', 'staf_kesiswaan'],
                'routes' => [['get', ''], ['get', '/{id}'], ['patch', '/{id}/status']],
            ],
            'orang-tua-asuh.delete' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['delete', '/{id}']],
            ],

            // ── Website Media ──
            'website.media' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['post', ''], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website Hero Images ──
            'website.hero-images' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['post', ''], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website Gallery Images ──
            'website.gallery-images' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['post', ''], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website Categories ──
            'website.kategori-galeri' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website Figures ──
            'website.figures' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website FAQ ──
            'website.faq' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Website Teachers ──
            'website.teachers' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}'], ['post', '/{id}/generate-token'], ['post', '/{id}/reset-token']],
            ],

            // ── Website Subjects ──
            'website.subjects' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Academic Calendar ──
            'akademik.kalender.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah', 'guru'],
                'routes' => [['get', '']],
            ],
            'akademik.kalender.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Academic Year ──
            'akademik.tahun-pelajaran.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
                'routes' => [['get', '']],
            ],
            'akademik.tahun-pelajaran.write' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/set-current'], ['delete', '/{id}']],
            ],

            // ── School Classes ──
            'akademik.kelas.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah', 'guru'],
                'routes' => [['get', '']],
            ],
            'akademik.kelas.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}']],
            ],
            'akademik.kelas.delete' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Lesson Schedule Settings ──
            'akademik.jam-pelajaran.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah', 'guru'],
                'routes' => [['get', '']],
            ],
            'akademik.jam-pelajaran.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}']],
            ],
            'akademik.jam-pelajaran.delete' => [
                'roles' => ['superadmin', 'admin'],
                'routes' => [['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── Lesson Schedule ──
            'akademik.jadwal-pelajaran.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah', 'guru'],
                'routes' => [['get', '']],
            ],
            'akademik.jadwal-pelajaran.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],

            // ── Website Pages ──
            'website.pages' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/{id}/edit'], ['put', '/{id}']],
            ],

            // ── Website Menus ──
            'website.menus' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle']],
            ],

            // ── Organization Structures ──
            'organization-structures' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['put', '/page'], ['delete', '/{id}']],
            ],

            // ── Website Values ──
            'website.values' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', ''], ['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['patch', '/{id}/toggle'], ['delete', '/{id}']],
            ],

            // ── AI FAQs ──
            'ai-faqs.read' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'guru'],
                'routes' => [['get', '']],
            ],
            'ai-faqs.write' => [
                'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                'routes' => [['get', '/create'], ['post', ''], ['get', '/{id}/edit'], ['put', '/{id}'], ['delete', '/{id}']],
            ],
        ];
    }

    public static function roleAccessDataProvider(): array
    {
        $roles = ['superadmin', 'admin', 'kepala_sekolah', 'guru', 'staf_tata_usaha', 'staf_keuangan', 'staf_kesiswaan', 'staf_sarpras'];

        $groups = self::defineRouteGroups();

        $cases = [];
        foreach ($groups as $key => $group) {
            foreach ($group['routes'] as $route) {
                $method = $route[0];
                $path = $route[1];
                $routeName = 'test.' . $key . '.' . ($route[2] ?? str_replace(['/', '{', '}'], ['_', '', ''], trim($path, '/')) ?: 'index');

                // Build actual URL (replace {id} with 1, {recipient} with 1)
                $url = '/_test/role/' . $key . $path;
                $url = preg_replace('/\{(\w+)\}/', '1', $url);

                foreach ($roles as $role) {
                    $shouldSucceed = in_array($role, $group['roles']);
                    $cases["$role can" . ($shouldSucceed ? '' : 'not') . " $method $url"] = [
                        'role' => $role,
                        'method' => $method,
                        'url' => $url,
                        'expectedStatus' => $shouldSucceed ? 200 : 403,
                    ];
                }
            }
        }

        return $cases;
    }

    public function test_guest_redirected_to_login(): void
    {
        $this->get('/_test/role/ppdb.dashboard')
            ->assertRedirectToRoute('login');
    }

    /**
     * @dataProvider roleAccessDataProvider
     */
    public function test_role_access(string $role, string $method, string $url, int $expectedStatus): void
    {
        $user = User::factory()->create(['role' => $role]);
        $roleModel = Role::where('name', $role)->first();
        $user->roles()->attach($roleModel->id);

        $response = $this->actingAs($user)->call($method, $url);

        $response->assertStatus($expectedStatus);
    }

    public function test_superadmin_bypasses_all_role_checks(): void
    {
        $user = User::factory()->create(['role' => 'superadmin']);
        $roleModel = Role::where('name', 'superadmin')->first();
        $user->roles()->attach($roleModel->id);

        $this->actingAs($user)
            ->delete('/_test/role/ppdb.delete/1')
            ->assertOk();

        $this->actingAs($user)
            ->delete('/_test/role/finance.delete.pemasukan/pemasukan/1')
            ->assertOk();

        $this->actingAs($user)
            ->delete('/_test/role/finance.delete.pengeluaran/pengeluaran/1')
            ->assertOk();
    }

    public function test_user_without_role_gets_403(): void
    {
        $user = User::factory()->create(['role' => '']);

        $this->actingAs($user)
            ->get('/_test/role/ppdb.dashboard')
            ->assertStatus(403);
    }

    public function test_legacy_column_role_still_works(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)
            ->get('/_test/role/ppdb.dashboard')
            ->assertOk();
    }

    public function test_multi_role_user_can_access_combined_permissions(): void
    {
        $user = User::factory()->create(['role' => 'guru']);
        $guru = Role::where('name', 'guru')->first();
        $keuangan = Role::where('name', 'staf_keuangan')->first();
        $user->roles()->attach([$guru->id, $keuangan->id]);

        $this->actingAs($user)
            ->get('/_test/role/akademik.kalender.read')
            ->assertOk();

        $this->actingAs($user)
            ->get('/_test/role/donasi-transactions.read')
            ->assertOk();

        $this->actingAs($user)
            ->get('/_test/role/ppdb.write/export')
            ->assertStatus(403);
    }
}
