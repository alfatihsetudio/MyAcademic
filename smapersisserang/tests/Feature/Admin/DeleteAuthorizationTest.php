<?php

namespace Tests\Feature\Admin;

use App\Models\DonationOutflow;
use App\Models\DonationOutflowStatusHistory;
use App\Models\DonationTransaction;
use App\Models\FinanceExpense;
use App\Models\FinanceIncome;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DeleteAuthorizationTest extends TestCase
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
            'finance_expenses',
            'donation_outflows',
            'donation_transactions',
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

    // ===================== DONASI MASUK =====================

    public function test_superadmin_sees_delete_button_on_donasi_masuk_index(): void
    {
        $user = $this->user('superadmin');
        $this->createTransaction(50000);

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertSee('Hapus');
    }

    public function test_admin_does_not_see_delete_button_on_donasi_masuk_index(): void
    {
        $user = $this->user('admin');
        $this->createTransaction(50000);

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertDontSee('Hapus');
    }

    public function test_superadmin_can_delete_donasi_masuk(): void
    {
        $user = $this->user('superadmin');
        $tx = $this->createTransaction(50000);

        $this->actingAs($user)
            ->delete(route('admin.donasi-transactions.destroy', $tx))
            ->assertRedirect();

        $this->assertDatabaseMissing('donation_transactions', ['id' => $tx->id]);
    }

    public function test_admin_gets_403_deleting_donasi_masuk(): void
    {
        $user = $this->user('admin');
        $tx = $this->createTransaction(50000);

        $this->actingAs($user)
            ->delete(route('admin.donasi-transactions.destroy', $tx))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transactions', ['id' => $tx->id]);
    }

    public function test_donation_balance_changes_after_donasi_masuk_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createTransaction(50000);

        $service = app(DonationBalanceService::class);
        $this->assertSame(50000, $service->totalIncoming());

        $tx = DonationTransaction::where('amount', 50000)->firstOrFail();
        $this->actingAs($user)
            ->delete(route('admin.donasi-transactions.destroy', $tx))
            ->assertRedirect();

        $this->assertSame(0, app(DonationBalanceService::class)->totalIncoming());
    }

    // ===================== DONASI KELUAR =====================

    public function test_superadmin_can_delete_pending_outflow(): void
    {
        $user = $this->user('superadmin');
        $outflow = $this->createOutflow('pending', 100000);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertDatabaseMissing('donation_outflows', ['id' => $outflow->id]);
    }

    public function test_available_balance_restored_after_pending_outflow_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createTransaction(200000);
        $this->createOutflow('pending', 50000);

        $service = app(DonationBalanceService::class);
        $this->assertSame(150000, $service->availableBalance());

        $outflow = DonationOutflow::where('status', 'pending')->firstOrFail();
        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertSame(200000, app(DonationBalanceService::class)->availableBalance());
    }

    public function test_superadmin_can_delete_rejected_outflow(): void
    {
        $user = $this->user('superadmin');
        $outflow = $this->createOutflow('rejected', 100000);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertDatabaseMissing('donation_outflows', ['id' => $outflow->id]);
    }

    public function test_approved_outflow_and_linked_income_deleted_atomically(): void
    {
        $user = $this->user('superadmin');
        $outflow = $this->createOutflow('approved', 100000);
        $this->createIncome(['donation_outflow_id' => $outflow->id, 'amount' => 100000]);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertDatabaseMissing('donation_outflows', ['id' => $outflow->id]);
        $this->assertSame(0, FinanceIncome::where('donation_outflow_id', $outflow->id)->count());
    }

    public function test_donation_balance_restored_after_approved_outflow_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createTransaction(300000);
        $outflow = $this->createOutflow('approved', 100000);
        $this->createIncome(['donation_outflow_id' => $outflow->id, 'amount' => 100000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(200000, $service->recordedBalance());

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertSame(300000, app(DonationBalanceService::class)->recordedBalance());
    }

    public function test_admin_gets_403_deleting_outflow(): void
    {
        $user = $this->user('admin');
        $outflow = $this->createOutflow('pending', 100000);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', ['id' => $outflow->id]);
    }

    public function test_status_history_deleted_with_outflow(): void
    {
        $user = $this->user('superadmin');
        $outflow = $this->createOutflow('pending', 100000);
        $outflow->statusHistories()->create([
            'from_status' => null,
            'to_status' => 'pending',
            'changed_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $outflow))
            ->assertRedirect();

        $this->assertSame(0, DonationOutflowStatusHistory::where('donation_outflow_id', $outflow->id)->count());
    }

    // ===================== PEMASUKAN =====================

    public function test_superadmin_can_delete_manual_income(): void
    {
        $user = $this->user('superadmin');
        $income = $this->createIncome([]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertDatabaseMissing('finance_incomes', ['id' => $income->id]);
    }

    public function test_admin_cannot_delete_income(): void
    {
        $user = $this->user('admin');
        $income = $this->createIncome([]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    public function test_integrated_income_can_be_deleted_by_superadmin_with_outflow(): void
    {
        $user = $this->user('superadmin');
        $outflow = $this->createOutflow('approved', 100000);
        $income = $this->createIncome(['donation_outflow_id' => $outflow->id, 'amount' => 100000]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertDatabaseMissing('finance_incomes', ['id' => $income->id]);
        $this->assertDatabaseMissing('donation_outflows', ['id' => $outflow->id]);
    }

    public function test_report_changes_after_manual_income_deleted(): void
    {
        $user = $this->user('superadmin');
        $keep = $this->createIncome(['amount' => 300000]);
        $this->createIncome(['amount' => 500000]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $keep))
            ->assertRedirect();

        $this->assertSame(500000, (int) FinanceIncome::sum('amount'));
    }

    // ===================== PENGELUARAN =====================

    public function test_superadmin_can_delete_expense(): void
    {
        $user = $this->user('superadmin');
        $expense = $this->createExpense(200000);

        $this->actingAs($user)
            ->delete(route('admin.finance.expenses.destroy', $expense))
            ->assertRedirect();

        $this->assertDatabaseMissing('finance_expenses', ['id' => $expense->id]);
    }

    public function test_admin_gets_403_deleting_expense(): void
    {
        $user = $this->user('admin');
        $expense = $this->createExpense(200000);

        $this->actingAs($user)
            ->delete(route('admin.finance.expenses.destroy', $expense))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_expenses', ['id' => $expense->id]);
    }

    public function test_report_and_balance_change_after_expense_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createIncome(['amount' => 1000000]);
        $this->createExpense(200000);
        $this->createExpense(150000);

        $target = FinanceExpense::orderByDesc('id')->firstOrFail();
        $this->actingAs($user)
            ->delete(route('admin.finance.expenses.destroy', $target))
            ->assertRedirect();

        $this->assertSame(200000, (int) FinanceExpense::sum('amount'));
        $this->assertSame(800000, (int) (FinanceIncome::sum('amount') - FinanceExpense::sum('amount')));
    }

    // ===================== KEAMANAN =====================

    public function test_destroy_uses_delete_http_method_and_superadmin_middleware(): void
    {
        foreach ([
            'admin.donasi-transactions.destroy',
            'admin.donation-outflows.destroy',
            'admin.finance.incomes.destroy',
            'admin.finance.expenses.destroy',
        ] as $name) {
            $route = Route::getRoutes()->getByName($name);
            $this->assertNotNull($route, "Route {$name} not found.");
            $this->assertContains('DELETE', $route->methods(), "Route {$name} is not DELETE.");
            $this->assertContains('superadmin', $route->gatherMiddleware(), "Route {$name} lacks superadmin middleware.");
        }
    }

    public function test_destroy_requires_web_middleware_with_csrf(): void
    {
        $route = Route::getRoutes()->getByName('admin.finance.expenses.destroy');
        $this->assertContains('web', $route->gatherMiddleware());
    }

    public function test_proof_file_not_deleted_when_still_used_by_another_record(): void
    {
        Storage::fake('public');
        $path = 'donation/outflow-proofs/shared.pdf';
        Storage::disk('public')->put($path, 'proof-data');

        $user = $this->user('superadmin');
        $approved = $this->createOutflow('approved', 100000, $path);
        $this->createOutflow('pending', 50000, $path);
        $this->createIncome(['donation_outflow_id' => $approved->id, 'amount' => 100000, 'proof_file' => $path]);

        $this->actingAs($user)
            ->delete(route('admin.donation-outflows.destroy', $approved))
            ->assertRedirect();

        Storage::disk('public')->assertExists($path);
    }

    // ===================== HELPERS =====================

    private function user(string $roleName): User
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

        return $user;
    }

    private function creator(): User
    {
        return User::factory()->create(['role' => 'admin']);
    }

    private function createTransaction(int $amount): DonationTransaction
    {
        return DonationTransaction::create([
            'order_id' => 'DON-'.now()->format('Ymd').'-'.strtoupper(bin2hex(random_bytes(2))),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => $amount,
            'payment_gateway' => 'manual-qris',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    private function createOutflow(string $status, int $amount, ?string $proofFile = null): DonationOutflow
    {
        return DonationOutflow::create([
            'transaction_number' => 'DK-'.now()->format('Ymd').'-'.strtoupper(bin2hex(random_bytes(2))),
            'handover_date' => now()->toDateString(),
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode pengujian',
            'amount' => $amount,
            'handover_method' => 'transfer',
            'destination_account' => 'BSI Operasional',
            'proof_file' => $proofFile,
            'notes' => null,
            'status' => $status,
            'created_by' => $this->creator()->id,
        ]);
    }

    private function createIncome(array $overrides = []): FinanceIncome
    {
        return FinanceIncome::create(array_merge([
            'date' => now()->toDateString(),
            'income_type' => 'Dana Operasional',
            'amount' => 500000,
            'payment_method' => 'Tunai',
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan pengujian',
            'created_by' => $this->creator()->id,
        ], $overrides));
    }

    private function createExpense(int $amount): FinanceExpense
    {
        return FinanceExpense::create([
            'date' => now()->toDateString(),
            'expense_category' => 'ATK Sekolah',
            'amount' => $amount,
            'paid_to' => 'Toko ATK',
            'payment_method' => 'Tunai',
            'description' => 'Pengeluaran pengujian',
            'created_by' => $this->creator()->id,
        ]);
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
        Schema::create('donation_transactions', function ($table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('donor_name');
            $table->string('donor_whatsapp');
            $table->string('support_type');
            $table->unsignedBigInteger('amount');
            $table->string('payment_method')->nullable();
            $table->text('note')->nullable();
            $table->string('payment_gateway')->default('midtrans');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
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
            $table->string('source_payment_method')->nullable();
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
            $table->unsignedBigInteger('finance_account_id')->nullable();
            $table->string('payment_method');
            $table->text('description')->nullable();
            $table->string('proof_file')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
}
