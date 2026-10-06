<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\DonationOutflowStatusHistory;
use App\Models\DonationTransaction;
use App\Models\FinanceIncome;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class FinanceIncomeIntegratedManageTest extends TestCase
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

    // ============ TAMPILAN DAFTAR ============

    public function test_superadmin_sees_edit_button_on_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('>Edit<', false);
    }

    public function test_superadmin_sees_delete_button_on_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('>Hapus<', false);
    }

    public function test_admin_only_sees_lihat_donasi_keluar_on_integrated_income(): void
    {
        $user = $this->user('admin');
        $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Lihat Donasi Keluar')
            ->assertDontSee('>Edit<', false)
            ->assertDontSee('>Hapus<', false);
    }

    // ============ OTORISASI ============

    public function test_admin_gets_403_opening_integrated_edit(): void
    {
        $user = $this->user('admin');
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();
    }

    public function test_admin_gets_403_updating_integrated_income(): void
    {
        $user = $this->user('admin');
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload(['amount' => 150000]))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'amount' => 100000]);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'amount' => 100000]);
    }

    public function test_admin_gets_403_destroying_integrated_income(): void
    {
        $user = $this->user('admin');
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    // ============ EDIT / SINKRONISASI ============

    public function test_superadmin_can_edit_integrated_income_nominal(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload(['amount' => 250000]))
            ->assertRedirect(route('admin.finance.incomes.index'));

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'amount' => 250000]);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'amount' => 250000]);
    }

    public function test_income_and_outflow_amount_remain_synced_after_edit(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload(['amount' => 350000]))
            ->assertRedirect();

        $income->refresh();
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->assertSame((string) $income->amount, (string) $outflow->amount);
    }

    public function test_date_and_method_are_synced_after_edit(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'date' => '2026-08-15',
                'payment_method' => 'Tunai',
            ]))
            ->assertRedirect();

        $income->refresh();
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->assertSame('2026-08-15', $income->date->format('Y-m-d'));
        $this->assertSame('2026-08-15', $outflow->handover_date->format('Y-m-d'));
        $this->assertSame('Tunai', $income->payment_method);
        $this->assertSame('cash', $outflow->payment_method);
    }

    public function test_edit_that_exceeds_donation_balance_is_rejected(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(100000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload(['amount' => 150000]))
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'amount' => 100000]);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'amount' => 100000]);
    }

    public function test_failed_update_leaves_both_records_unchanged(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(100000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload(['amount' => 999999]))
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'amount' => 100000]);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'amount' => 100000]);
    }

    public function test_transfer_bank_syncs_to_transfer_method(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'payment_method' => 'Transfer Bank',
            ]))
            ->assertRedirect();

        $income->refresh();
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->assertSame('Transfer Bank', $income->payment_method);
        $this->assertSame('transfer', $outflow->handover_method);
    }

    public function test_tunai_syncs_to_cash_method(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'payment_method' => 'Tunai',
            ]))
            ->assertRedirect();

        $income->refresh();
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->assertSame('Tunai', $income->payment_method);
        $this->assertSame('cash', $outflow->payment_method);
    }

    public function test_qris_payment_rejected_for_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'payment_method' => 'QRIS',
            ]))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'payment_method' => 'Transfer Bank']);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'handover_method' => 'transfer']);
    }

    public function test_lainnya_payment_rejected_for_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'payment_method' => 'Lainnya',
            ]))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'payment_method' => 'Transfer Bank']);
        $this->assertDatabaseHas('donation_outflows', ['id' => $income->donation_outflow_id, 'handover_method' => 'transfer']);
    }

    public function test_description_synced_between_income_and_outflow_after_edit(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'description' => 'Keterangan terbaru diubah',
            ]))
            ->assertRedirect();

        $income->refresh();
        $outflow->refresh();

        $this->assertSame('Keterangan terbaru diubah', $outflow->description);
        $this->assertStringContainsString('Keterangan terbaru diubah', $income->description);
    }

    public function test_dk_number_preserved_in_income_description_after_edit(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);
        $outflow = DonationOutflow::findOrFail($income->donation_outflow_id);

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $income), $this->payload([
                'description' => 'Keterangan baru',
            ]))
            ->assertRedirect();

        $income->refresh();

        $this->assertStringContainsString($outflow->transaction_number, $income->description);
        $this->assertStringContainsString('Donasi Keluar:', $income->description);
    }

    // ============ HAPUS ============

    public function test_superadmin_can_delete_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect(route('admin.finance.incomes.index'));

        $this->assertDatabaseMissing('finance_incomes', ['id' => $income->id]);
    }

    public function test_related_donation_outflow_deleted_with_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertDatabaseMissing('donation_outflows', ['id' => $income->donation_outflow_id]);
    }

    public function test_status_history_deleted_with_integrated_income(): void
    {
        $user = $this->user('superadmin');
        $income = $this->createIntegratedIncome(100000);
        DonationOutflowStatusHistory::create([
            'donation_outflow_id' => $income->donation_outflow_id,
            'from_status' => 'pending',
            'to_status' => 'approved',
            'changed_by' => $user->id,
        ]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertSame(0, DonationOutflowStatusHistory::where('donation_outflow_id', $income->donation_outflow_id)->count());
    }

    public function test_donation_balance_restored_after_integrated_income_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(300000);
        $income = $this->createIntegratedIncome(100000);

        $this->assertSame(200000, app(DonationBalanceService::class)->recordedBalance());

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertSame(300000, app(DonationBalanceService::class)->recordedBalance());
    }

    public function test_income_report_reduced_after_integrated_income_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);
        $this->createManualIncome(200000);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertSame(200000, (int) FinanceIncome::sum('amount'));
    }

    // ============ FILE BUKTI ============

    public function test_proof_file_not_deleted_when_still_used_by_another_record(): void
    {
        Storage::fake('public');
        $path = 'finance/proofs/shared.pdf';
        Storage::disk('public')->put($path, 'proof-data');

        $income = $this->createIntegratedIncome(100000, $path);
        $this->createManualIncome(200000, $path);

        $user = $this->user('superadmin');
        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        Storage::disk('public')->assertExists($path);
    }

    // ============ PEMASUKAN MANUAL TIDAK RUSAK ============

    public function test_manual_income_crud_still_works(): void
    {
        $user = $this->user('superadmin');

        $created = $this->createManualIncome(150000);
        $this->actingAs($user)
            ->get(route('admin.finance.incomes.edit', $created))
            ->assertOk();

        $this->actingAs($user)
            ->put(route('admin.finance.incomes.update', $created), $this->manualPayload(['amount' => 175000]))
            ->assertRedirect(route('admin.finance.incomes.index'));
        $this->assertDatabaseHas('finance_incomes', ['id' => $created->id, 'amount' => 175000]);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $created))
            ->assertRedirect();
        $this->assertDatabaseMissing('finance_incomes', ['id' => $created->id]);
    }

    // ============ KEAMANAN ============

    public function test_incomes_update_and_destroy_routes_require_web_middleware(): void
    {
        foreach (['admin.finance.incomes.update', 'admin.finance.incomes.destroy'] as $name) {
            $route = Route::getRoutes()->getByName($name);
            $this->assertNotNull($route, "Route {$name} not found.");
            $this->assertContains('web', $route->gatherMiddleware(), "Route {$name} lacks web middleware.");
        }
    }

    public function test_no_orphan_records_after_integrated_income_deleted(): void
    {
        $user = $this->user('superadmin');
        $this->createDonationTransaction(1000000);
        $income = $this->createIntegratedIncome(100000);

        $this->actingAs($user)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertRedirect();

        $this->assertSame(0, FinanceIncome::where('donation_outflow_id', $income->donation_outflow_id)->count());
        $this->assertDatabaseMissing('donation_outflows', ['id' => $income->donation_outflow_id]);
    }

    // ============ HELPERS ============

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

    private function createDonationTransaction(int $amount): DonationTransaction
    {
        return DonationTransaction::create([
            'order_id' => 'DON-' . now()->format('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2))),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => $amount,
            'payment_gateway' => 'manual-qris',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    private function createIntegratedIncome(int $amount, ?string $proofFile = null): FinanceIncome
    {
        $creator = $this->creator();
        $outflow = DonationOutflow::create([
            'transaction_number' => 'DK-' . now()->format('Ymd') . '-' . strtoupper(bin2hex(random_bytes(2))),
            'handover_date' => now()->toDateString(),
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode pengujian',
            'amount' => $amount,
            'handover_method' => 'transfer',
            'destination_account' => 'BSI Operasional',
            'proof_file' => $proofFile,
            'status' => 'approved',
            'created_by' => $creator->id,
        ]);

        return FinanceIncome::create([
            'donation_outflow_id' => $outflow->id,
            'date' => now()->toDateString(),
            'income_type' => 'Transfer dari Donasi',
            'amount' => $amount,
            'payment_method' => 'Transfer Bank',
            'source_name' => 'Donasi Pendidikan',
            'description' => 'Donasi Keluar: ' . $outflow->transaction_number,
            'proof_file' => $proofFile,
            'created_by' => $creator->id,
        ]);
    }

    private function createManualIncome(int $amount, ?string $proofFile = null): FinanceIncome
    {
        $account = DonationAccount::create([
            'name' => 'Tunai Keuangan '.strtoupper(uniqid()),
            'category' => 'finance',
            'type' => 'cash',
            'is_active' => true,
        ]);

        return FinanceIncome::create([
            'date' => now()->toDateString(),
            'income_type' => 'Dana Operasional',
            'amount' => $amount,
            'finance_account_id' => $account->id,
            'payment_method' => $account->financePaymentMethodLabel(),
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan manual',
            'proof_file' => $proofFile,
            'created_by' => $this->creator()->id,
        ]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'date' => '2026-08-01',
            'amount' => 100000,
            'payment_method' => 'Transfer Bank',
            'source_name' => 'Donasi Pendidikan',
            'description' => 'Periode pengujian',
        ], $overrides);
    }

    private function manualPayload(array $overrides = []): array
    {
        return array_merge([
            'date' => '2026-08-01',
            'income_type' => 'Dana Operasional',
            'amount' => 100000,
            'finance_account_id' => DonationAccount::create([
                'name' => 'Tunai Keuangan '.strtoupper(uniqid()),
                'category' => 'finance',
                'type' => 'cash',
                'is_active' => true,
            ])->id,
            'source_name' => 'Kas Sekolah',
            'description' => 'Pemasukan manual',
        ], $overrides);
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
        Schema::create('donation_transactions', function ($table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('donor_name');
            $table->string('donor_whatsapp');
            $table->string('support_type');
            $table->unsignedBigInteger('amount');
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
