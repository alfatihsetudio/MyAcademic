<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\FinanceExpense;
use App\Models\FinanceIncome;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FinanceExpenseManageTest extends TestCase
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
            'finance_expenses',
            'finance_incomes',
            'donation_outflows',
            'donation_transfers',
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
            ->get(route('admin.finance.expenses.create'))
            ->assertOk()
            ->assertSee('Tunai Keuangan')
            ->assertSee('Rekening Keuangan')
            ->assertSee('Keluar dari Akun Keuangan')
            ->assertDontSee('Tunai Donasi')
            ->assertDontSee('Kas Nonaktif');
    }

    public function test_store_requires_finance_account_id(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload(['finance_account_id' => null]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_expenses', 0);
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
            ->post(route('admin.finance.expenses.store'), $this->expensePayload(['finance_account_id' => $donation->id]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_expenses', 0);
    }

    public function test_store_rejects_inactive_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $inactive = $this->financeAccount(['is_active' => false]);

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload(['finance_account_id' => $inactive->id]))
            ->assertSessionHasErrors('finance_account_id');

        $this->assertDatabaseCount('finance_expenses', 0);
    }

    public function test_store_saves_expense_to_selected_finance_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($account->id, 500000);

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 300000,
            ]))
            ->assertRedirect(route('admin.finance.expenses.index'));

        $this->assertDatabaseHas('finance_expenses', [
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
            $this->createIncome($account->id, 100000);

            $this->actingAs($staf)
                ->post(route('admin.finance.expenses.store'), $this->expensePayload([
                    'finance_account_id' => $account->id,
                    'amount' => 50000,
                    'payment_method' => 'Nilai Ilegal',
                ]))
                ->assertRedirect();

            $this->assertDatabaseHas('finance_expenses', [
                'finance_account_id' => $account->id,
                'payment_method' => $expectedLabel,
            ]);
        }
    }

    public function test_expense_reduces_finance_balance_by_account(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount();
        $this->createIncome($account->id, 500000);

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 200000,
            ]))
            ->assertRedirect();

        $this->assertSame(300000, app(DonationBalanceService::class)->financeBalanceByAccount($account->id));
    }

    public function test_store_rejects_expense_exceeding_account_balance(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($account->id, 500000);

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 600000,
            ]))
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseCount('finance_expenses', 0);
        $this->assertSame(500000, app(DonationBalanceService::class)->financeBalanceByAccount($account->id));
    }

    public function test_expense_from_account_a_does_not_reduce_account_b(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $accountA = $this->financeAccount(['name' => 'Tunai Keuangan', 'type' => 'cash']);
        $accountB = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($accountA->id, 500000);
        $this->createIncome($accountB->id, 400000);

        $this->actingAs($staf)
            ->post(route('admin.finance.expenses.store'), $this->expensePayload([
                'finance_account_id' => $accountA->id,
                'amount' => 200000,
            ]))
            ->assertRedirect();

        $service = app(DonationBalanceService::class);
        $this->assertSame(300000, $service->financeBalanceByAccount($accountA->id));
        $this->assertSame(400000, $service->financeBalanceByAccount($accountB->id));

        $balances = $service->financeAccountBalances();
        $this->assertSame(300000, $balances[$accountA->id]);
        $this->assertSame(400000, $balances[$accountB->id]);
        $this->assertSame(2, count($balances));
    }

    public function test_edit_expense_can_move_to_another_account_and_checks_target_balance(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $accountA = $this->financeAccount(['name' => 'Tunai Keuangan', 'type' => 'cash']);
        $accountB = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($accountA->id, 500000);
        $this->createIncome($accountB->id, 300000);
        $expense = $this->createExpense($accountA->id, 300000, $staf->id);

        $this->actingAs($staf)
            ->put(route('admin.finance.expenses.update', $expense), $this->expensePayload([
                'finance_account_id' => $accountB->id,
                'amount' => 400000,
            ]))
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseHas('finance_expenses', [
            'id' => $expense->id,
            'finance_account_id' => $accountA->id,
            'amount' => 300000,
        ]);

        $this->actingAs($staf)
            ->put(route('admin.finance.expenses.update', $expense), $this->expensePayload([
                'finance_account_id' => $accountB->id,
                'amount' => 300000,
            ]))
            ->assertRedirect(route('admin.finance.expenses.index'));

        $this->assertDatabaseHas('finance_expenses', [
            'id' => $expense->id,
            'finance_account_id' => $accountB->id,
            'payment_method' => 'Transfer Bank',
            'amount' => 300000,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(500000, $service->financeBalanceByAccount($accountA->id));
        $this->assertSame(0, $service->financeBalanceByAccount($accountB->id));
    }

    public function test_edit_current_expense_is_not_double_counted(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Tunai Keuangan', 'type' => 'cash']);
        $this->createIncome($account->id, 500000);
        $expense = $this->createExpense($account->id, 300000, $staf->id);

        $this->assertSame(200000, app(DonationBalanceService::class)->financeBalanceByAccount($account->id));

        $this->actingAs($staf)
            ->put(route('admin.finance.expenses.update', $expense), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 500001,
            ]))
            ->assertSessionHasErrors('amount');

        $this->actingAs($staf)
            ->put(route('admin.finance.expenses.update', $expense), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 500000,
            ]))
            ->assertRedirect(route('admin.finance.expenses.index'));

        $this->assertDatabaseHas('finance_expenses', [
            'id' => $expense->id,
            'finance_account_id' => $account->id,
            'amount' => 500000,
        ]);

        $this->assertSame(0, app(DonationBalanceService::class)->financeBalanceByAccount($account->id));
    }

    public function test_legacy_expense_with_null_finance_account_is_still_readable_and_editable(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $legacy = FinanceExpense::create([
            'date' => '2026-07-01',
            'expense_category' => 'Listrik',
            'amount' => 250000,
            'paid_to' => 'PLN',
            'payment_method' => 'Tunai',
            'description' => 'Pengeluaran lama tanpa akun',
            'created_by' => $staf->id,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.expenses.index'))
            ->assertOk()
            ->assertSee('Akun Keuangan')
            ->assertSee('Tunai')
            ->assertSee('PLN');

        $this->actingAs($staf)
            ->get(route('admin.finance.expenses.edit', $legacy))
            ->assertOk();

        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($account->id, 500000);

        $this->actingAs($staf)
            ->put(route('admin.finance.expenses.update', $legacy), $this->expensePayload([
                'finance_account_id' => $account->id,
                'amount' => 200000,
            ]))
            ->assertRedirect(route('admin.finance.expenses.index'));

        $this->assertDatabaseHas('finance_expenses', [
            'id' => $legacy->id,
            'finance_account_id' => $account->id,
            'payment_method' => 'Transfer Bank',
            'amount' => 200000,
        ]);
    }

    public function test_index_shows_account_name_column(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($account->id, 500000);
        $this->createExpense($account->id, 200000, $staf->id);

        $this->actingAs($staf)
            ->get(route('admin.finance.expenses.index'))
            ->assertOk()
            ->assertSee('Akun Keuangan')
            ->assertSee('Rekening Keuangan');
    }

    public function test_dashboard_lists_per_account_summary(): void
    {
        $staf = $this->userWithRoleFinanceDefaults('staf_keuangan');
        $account = $this->financeAccount(['name' => 'Rekening Keuangan', 'type' => 'bank_transfer']);
        $this->createIncome($account->id, 500000);
        $this->createExpense($account->id, 200000, $staf->id);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Saldo per Akun Keuangan')
            ->assertSee('Rekening Keuangan')
            ->assertSee('300.000');
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

    private function createIncome(int $accountId, int $amount): FinanceIncome
    {
        $creator = User::factory()->create(['role' => 'admin']);

        return FinanceIncome::create([
            'date' => '2026-07-31',
            'income_type' => 'Dana Operasional',
            'amount' => $amount,
            'finance_account_id' => $accountId,
            'payment_method' => 'Tunai',
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan manual',
            'created_by' => $creator->id,
        ]);
    }

    private function createExpense(int $accountId, int $amount, int $createdBy): FinanceExpense
    {
        $account = DonationAccount::findOrFail($accountId);

        return FinanceExpense::create([
            'date' => '2026-07-31',
            'expense_category' => 'Listrik',
            'amount' => $amount,
            'paid_to' => 'PLN',
            'finance_account_id' => $accountId,
            'payment_method' => $account->financePaymentMethodLabel(),
            'description' => 'Pengeluaran',
            'created_by' => $createdBy,
        ]);
    }

    private function expensePayload(array $overrides = []): array
    {
        $defaults = [
            'date' => '2026-07-31',
            'expense_category' => 'Listrik',
            'amount' => 100000,
            'paid_to' => 'PLN',
            'description' => 'Pengeluaran',
        ];

        if (! array_key_exists('finance_account_id', $overrides)) {
            $defaults['finance_account_id'] = $this->financeAccount()->id;
        }

        return array_merge($defaults, $overrides);
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
        Schema::create('donation_transfers', function ($table) {
            $table->id();
            $table->string('transfer_number')->unique();
            $table->date('transfer_date')->nullable();
            $table->foreignId('from_account_id')->constrained('donation_accounts')->restrictOnDelete();
            $table->foreignId('to_account_id')->constrained('donation_accounts')->restrictOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->string('proof_file')->nullable();
            $table->text('note')->nullable();
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
        Schema::create('finance_expenses', function ($table) {
            $table->id();
            $table->date('date');
            $table->string('expense_category');
            $table->decimal('amount', 15, 2);
            $table->string('paid_to')->nullable();
            $table->foreignId('finance_account_id')->nullable()->constrained('donation_accounts')->restrictOnDelete();
            $table->string('payment_method');
            $table->text('description')->nullable();
            $table->string('proof_file')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
}
