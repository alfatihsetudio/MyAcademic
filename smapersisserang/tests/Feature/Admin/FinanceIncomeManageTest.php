<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\FinanceIncome;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FinanceIncomeManageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        Storage::fake('public');
    }

    protected function tearDown(): void
    {
        foreach ([
            'donation_outflow_status_histories',
            'finance_incomes',
            'donation_outflows',
            'donation_accounts',
            'permission_role',
            'permissions',
            'role_user',
            'roles',
            'school_settings',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_staf_keuangan_can_open_edit_manual_income(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $income = $this->createManualIncome();

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertOk();
    }

    public function test_staf_keuangan_can_update_manual_income(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $income = $this->createManualIncome();

        $this->actingAs($staf)
            ->put(route('admin.finance.incomes.update', $income), $this->incomePayload(['amount' => 900000]))
            ->assertRedirect(route('admin.finance.incomes.index'));

        $this->assertDatabaseHas('finance_incomes', [
            'id' => $income->id,
            'amount' => 900000,
        ]);
    }

    public function test_staf_keuangan_cannot_delete_manual_income(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $income = $this->createManualIncome();

        $this->actingAs($staf)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    public function test_superadmin_can_edit_update_and_delete_manual_income(): void
    {
        $superadmin = $this->userWithRoleFinanceDefaults('superadmin');
        $editTarget = $this->createManualIncome();
        $updateTarget = $this->createManualIncome();
        $deleteTarget = $this->createManualIncome();

        $this->actingAs($superadmin)
            ->get(route('admin.finance.incomes.edit', $editTarget))
            ->assertOk();

        $this->actingAs($superadmin)
            ->put(route('admin.finance.incomes.update', $updateTarget), $this->incomePayload(['amount' => 800000]))
            ->assertRedirect(route('admin.finance.incomes.index'));
        $this->assertDatabaseHas('finance_incomes', ['id' => $updateTarget->id, 'amount' => 800000]);

        $this->actingAs($superadmin)
            ->delete(route('admin.finance.incomes.destroy', $deleteTarget))
            ->assertRedirect(route('admin.finance.incomes.index'));
        $this->assertDatabaseMissing('finance_incomes', ['id' => $deleteTarget->id]);
    }

    public function test_user_without_access_gets_403(): void
    {
        $guru = $this->userWithRoleFinanceDefaults('guru');
        $income = $this->createManualIncome();

        $this->actingAs($guru)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();

        $this->actingAs($guru)
            ->put(route('admin.finance.incomes.update', $income), $this->incomePayload())
            ->assertForbidden();

        $this->actingAs($guru)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    public function test_integrated_income_cannot_be_edited_or_deleted_via_manual_rule(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $income = $this->createIntegratedIncome();

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();

        $this->actingAs($staf)
            ->put(route('admin.finance.incomes.update', $income), $this->incomePayload())
            ->assertForbidden();

        $this->actingAs($staf)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    public function test_staf_keuangan_sees_edit_but_not_delete_on_manual_income(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $this->createManualIncome();

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Edit')
            ->assertDontSee('>Hapus<', false);
    }

    public function test_superadmin_sees_delete_button_on_manual_income(): void
    {
        $superadmin = $this->userWithRoleFinanceDefaults('superadmin');
        $this->createManualIncome();

        $this->actingAs($superadmin)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('>Hapus<', false);
    }

    public function test_integrated_income_shows_link_and_no_delete_button(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $this->createIntegratedIncome();

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Lihat Donasi Keluar')
            ->assertDontSee('>Edit<', false)
            ->assertDontSee('>Hapus<', false);
    }

    // ============ AKUN KEUANGAN (finance_account_id) ============

    public function test_create_page_only_lists_active_finance_accounts(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $this->financeAccount(['name' => 'Tunai Keuangan', 'type' => 'cash']);
        $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        DonationAccount::create([
            'name' => 'Tunai Donasi',
            'category' => 'donation',
            'type' => 'cash',
            'is_active' => true,
        ]);
        $this->financeAccount(['name' => 'Kas Nonaktif', 'is_active' => false]);

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.create'))
            ->assertOk()
            ->assertSee('Tunai Keuangan')
            ->assertSee('Rekening Keuangan')
            ->assertSee('Masuk ke Akun Keuangan')
            ->assertDontSee('Tunai Donasi')
            ->assertDontSee('Kas Nonaktif');
    }

    public function test_store_requires_finance_account_id(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');

        $this->actingAs($staf)
            ->post(route('admin.finance.incomes.store'), $this->incomePayload(['finance_account_id' => null]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_store_rejects_donation_account_as_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $donation = DonationAccount::create([
            'name' => 'Tunai Donasi',
            'category' => 'donation',
            'type' => 'cash',
            'is_active' => true,
        ]);

        $this->actingAs($staf)
            ->post(route('admin.finance.incomes.store'), $this->incomePayload(['finance_account_id' => $donation->id]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_store_rejects_inactive_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $inactive = $this->financeAccount(['is_active' => false]);

        $this->actingAs($staf)
            ->post(route('admin.finance.incomes.store'), $this->incomePayload(['finance_account_id' => $inactive->id]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_store_saves_income_to_selected_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);

        $this->actingAs($staf)
            ->post(route('admin.finance.incomes.store'), $this->incomePayload([
                'finance_account_id' => $account->id,
                'amount' => 300000,
            ]))
            ->assertRedirect(route('admin.finance.incomes.index'));

        $this->assertDatabaseHas('finance_incomes', [
            'finance_account_id' => $account->id,
            'payment_method' => 'Transfer Bank',
            'amount' => 300000,
            'created_by' => $staf->id,
        ]);
    }

    public function test_payment_method_is_derived_from_account_type(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');

        $cases = [
            'cash' => 'Tunai',
            'bank_transfer' => 'Transfer Bank',
            'qris' => 'QRIS',
            'other' => 'Lainnya',
        ];

        foreach ($cases as $type => $expectedLabel) {
            $account = $this->financeAccount(['type' => $type]);

            $this->actingAs($staf)
                ->post(route('admin.finance.incomes.store'), $this->incomePayload([
                    'finance_account_id' => $account->id,
                    'payment_method' => 'Nilai Ilegal',
                ]))
                ->assertRedirect();

            $this->assertDatabaseHas('finance_incomes', [
                'finance_account_id' => $account->id,
                'payment_method' => $expectedLabel,
            ]);
        }
    }

    public function test_manual_income_update_can_change_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $cash = $this->financeAccount(['name' => 'Tunai Keuangan', 'type' => 'cash']);
        $income = FinanceIncome::create([
            'date' => '2026-07-31',
            'income_type' => 'Dana Operasional',
            'amount' => 500000,
            'finance_account_id' => $cash->id,
            'payment_method' => 'Tunai',
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan manual',
            'created_by' => $staf->id,
        ]);
        $rekening = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);

        $this->actingAs($staf)
            ->put(route('admin.finance.incomes.update', $income), $this->incomePayload([
                'finance_account_id' => $rekening->id,
                'amount' => 600000,
            ]))
            ->assertRedirect(route('admin.finance.incomes.index'));

        $this->assertDatabaseHas('finance_incomes', [
            'id' => $income->id,
            'finance_account_id' => $rekening->id,
            'payment_method' => 'Transfer Bank',
            'amount' => 600000,
        ]);
    }

    public function test_legacy_income_with_null_finance_account_is_still_readable(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        FinanceIncome::create([
            'date' => '2026-07-01',
            'income_type' => 'Bantuan Sekolah',
            'amount' => 250000,
            'payment_method' => 'Tunai',
            'source_name' => 'Data lama',
            'description' => 'Pemasukan lama tanpa akun',
            'created_by' => $staf->id,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Tunai')
            ->assertSee('Data lama');
    }

    private function userWithRoleFinanceDefaults(string $roleName): User
    {
        $role = Role::firstOrCreate([
            'name' => $roleName,
        ], [
            'display_name' => ucfirst($roleName),
            'guard_name' => 'web',
            'is_active' => true,
        ]);
        $user = User::factory()->create(['role' => $roleName]);
        $user->roles()->attach($role);

        $permissionIds = [];
        foreach (config('permissions') as $perm) {
            if (str_starts_with($perm['name'], 'finance.')
                && in_array($roleName, $perm['default_roles'] ?? [], true)) {
                $permissionIds[] = Permission::firstOrCreate(
                    ['name' => $perm['name']],
                    [
                        'module' => $perm['module'],
                        'action' => $perm['action'],
                        'display_name' => $perm['display_name'],
                        'group_name' => $perm['group_name'],
                        'is_active' => true,
                    ]
                )->id;
            }
        }

        $role->permissions()->syncWithoutDetaching($permissionIds);

        return $user;
    }

    private function createManualIncome(): FinanceIncome
    {
        $creator = User::factory()->create(['role' => 'admin']);
        $account = $this->financeAccount();

        return FinanceIncome::create(array_merge($this->incomePayload(['finance_account_id' => $account->id]), [
            'payment_method' => $account->financePaymentMethodLabel(),
            'created_by' => $creator->id,
        ]));
    }

    private function createIntegratedIncome(): FinanceIncome
    {
        $creator = User::factory()->create(['role' => 'admin']);
        $outflow = DonationOutflow::create([
            'transaction_number' => 'DK-20260731-PN01',
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Juli 2026',
            'amount' => 1250000,
            'handover_method' => 'transfer',
            'destination_account' => 'BSI Operasional',
            'status' => 'approved',
            'created_by' => $creator->id,
        ]);

        return FinanceIncome::create(array_merge($this->incomePayload(), [
            'donation_outflow_id' => $outflow->id,
            'finance_account_id' => null,
            'payment_method' => 'Transfer Bank',
            'created_by' => $creator->id,
        ]));
    }

    private function incomePayload(array $overrides = []): array
    {
        return array_merge([
            'date' => '2026-07-31',
            'income_type' => 'Dana Operasional',
            'amount' => 500000,
            'finance_account_id' => $this->financeAccount()->id,
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan manual',
        ], $overrides);
    }

    private function financeAccount(array $overrides = []): DonationAccount
    {
        return DonationAccount::create(array_merge([
            'name' => 'Tunai Keuangan '.strtoupper(uniqid()),
            'category' => 'finance',
            'type' => 'cash',
            'is_active' => true,
        ], $overrides));
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
            $table->string('role', 50)->nullable();
            $table->timestamps();
        });
        Schema::create('school_settings', function ($table) {
            $table->id();
            $table->string('school_name')->nullable();
            $table->string('tagline')->nullable();
            $table->string('logo_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('roles', function ($table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->string('guard_name')->default('web');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });
        Schema::create('permissions', function ($table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('module');
            $table->string('action');
            $table->string('display_name');
            $table->text('description')->nullable();
            $table->string('group_name');
            $table->string('guard_name')->default('web');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
        Schema::create('permission_role', function ($table) {
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('granted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['permission_id', 'role_id']);
        });
        Schema::create('donation_accounts', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('category');
            $table->string('type')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('donation_outflows', function ($table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->date('handover_date');
            $table->string('donation_source');
            $table->text('description')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('payment_method')->nullable();
            $table->string('handover_method')->nullable();
            $table->string('destination_account');
            $table->string('proof_file')->nullable();
            $table->text('notes')->nullable();
            $table->string('status')->default('pending');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
        Schema::create('donation_outflow_status_histories', function ($table) {
            $table->id();
            $table->foreignId('donation_outflow_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('finance_incomes', function ($table) {
            $table->id();
            $table->foreignId('donation_outflow_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->foreignId('finance_account_id')->nullable()->constrained('donation_accounts')->restrictOnDelete();
            $table->date('date');
            $table->string('income_type');
            $table->decimal('amount', 15, 2);
            $table->string('payment_method');
            $table->string('source_name')->nullable();
            $table->text('description')->nullable();
            $table->string('proof_file')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
}
