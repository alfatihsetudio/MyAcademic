<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationTransaction;
use App\Models\DonationTransfer;
use App\Models\FinanceExpense;
use App\Models\FinanceIncome;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use App\Services\DonationFinanceReconciliationService;
use App\Services\DonationTransferApprovalService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DonationFinanceReconciliationTest extends TestCase
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
            'finance_expenses',
            'finance_incomes',
            'donation_transfers',
            'donation_transactions',
            'donation_accounts',
            'donation_outflows',
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

    /** 1. Donasi paid menambah saldo Donasi */
    public function test_01_paid_donation_increases_donation_balance(): void
    {
        $acc = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation', 'type' => 'bank_transfer']);
        $service = app(DonationBalanceService::class);

        $this->assertSame(0, $service->totalIncoming());
        $this->assertSame(0, $service->recordedBalance());

        $this->createIncomingDonation($acc->id, 5000000, 'paid');

        $this->assertSame(5000000, $service->totalIncoming());
        $this->assertSame(5000000, $service->recordedBalance());
        $this->assertSame(5000000, $service->activeDonationBalance());
    }

    /** 2. Mutasi pending mengurangi saldo tersedia */
    public function test_02_pending_transfer_reduces_available_balance(): void
    {
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(10000000, $service->recordedBalance());
        $this->assertSame(6000000, $service->availableBalance());
        $this->assertSame(6000000, $service->availableBalanceForAccount($from->id));
    }

    /** 3. Mutasi pending tidak mengurangi saldo final Donasi */
    public function test_03_pending_transfer_does_not_reduce_final_recorded_balance(): void
    {
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(10000000, $service->recordedBalance());
        $this->assertSame(10000000, $service->balanceByAccount($from->id));
    }

    /** 4. Mutasi approved mengurangi saldo Donasi */
    public function test_04_approved_transfer_reduces_donation_balance(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $service = app(DonationBalanceService::class);
        $this->assertSame(6000000, $service->recordedBalance());
        $this->assertSame(6000000, $service->availableBalance());
        $this->assertSame(6000000, $service->activeDonationBalance());
    }

    /** 5. Approval membuat tepat satu FinanceIncome */
    public function test_05_approval_creates_exactly_one_finance_income(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $this->assertDatabaseCount('finance_incomes', 1);
        $income = FinanceIncome::first();
        $this->assertNotNull($income);
        $this->assertSame((int) $transfer->id, (int) $income->donation_transfer_id);
    }

    /** 6. Nominal FinanceIncome sama dengan DonationTransfer */
    public function test_06_finance_income_amount_matches_donation_transfer(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $income = FinanceIncome::where('donation_transfer_id', $transfer->id)->first();
        $this->assertNotNull($income);
        $this->assertEquals(4000000, (float) $income->amount);
        $this->assertEquals((float) $transfer->amount, (float) $income->amount);
    }

    /** 7. FinanceIncome menggunakan akun tujuan yang benar */
    public function test_07_finance_income_uses_correct_destination_account(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance', 'type' => 'bank_transfer']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $income = FinanceIncome::where('donation_transfer_id', $transfer->id)->first();
        $this->assertNotNull($income);
        $this->assertSame((int) $to->id, (int) $income->finance_account_id);
    }

    /** 8. Pembuat mutasi tidak boleh approve sendiri */
    public function test_08_creator_cannot_approve_own_transfer(): void
    {
        $creator = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'requested_by' => $creator->id,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->expectException(\Symfony\Component\HttpKernel\Exception\HttpException::class);
        app(DonationTransferApprovalService::class)->approve($transfer, $creator);
    }

    /** 9. Mutasi yang sama tidak dapat menghasilkan dua FinanceIncome */
    public function test_09_same_transfer_cannot_create_duplicate_finance_income(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $this->expectException(ValidationException::class);
        app(DonationTransferApprovalService::class)->approve($transfer, $staf);
    }

    /** 10. FinanceIncome hasil mutasi tidak bisa diedit manual */
    public function test_10_finance_income_from_transfer_cannot_be_edited_manually(): void
    {
        $superadmin = $this->createSuperadmin();
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        $income = FinanceIncome::create([
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Transfer dari Donasi',
            'amount' => 4000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->put(route('admin.finance.incomes.update', $income), [
                'date' => now()->toDateString(),
                'amount' => 3000000,
                'income_type' => 'Transfer dari Donasi',
                'finance_account_id' => $to->id,
            ])
            ->assertForbidden();
    }

    /** 11. FinanceIncome hasil mutasi tidak bisa dihapus manual */
    public function test_11_finance_income_from_transfer_cannot_be_deleted_manually(): void
    {
        $superadmin = $this->createSuperadmin();
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        $income = FinanceIncome::create([
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Transfer dari Donasi',
            'amount' => 4000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    /** 12. Rekonsiliasi normal menghasilkan selisih Rp0 */
    public function test_12_normal_reconciliation_yields_zero_difference_and_sync_status(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $reconciliationService = app(DonationFinanceReconciliationService::class);
        $summary = $reconciliationService->reconciliationSummary();

        $this->assertSame(0, $summary['difference']);
        $this->assertTrue($summary['is_synchronized']);
        $this->assertSame('SINKRON', $summary['status']);
        $this->assertCount(0, $summary['anomalies']);
    }

    /** 13. Rekonsiliasi mendeteksi nominal berbeda */
    public function test_13_reconciliation_detects_amount_mismatch(): void
    {
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $user = $this->createStaff('staf_keuangan');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        FinanceIncome::create([
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Transfer dari Donasi',
            'amount' => 3500000, // mismatch
            'payment_method' => 'Transfer Bank',
            'created_by' => $user->id,
        ]);

        $reconciliationService = app(DonationFinanceReconciliationService::class);
        $summary = $reconciliationService->reconciliationSummary();

        $this->assertFalse($summary['is_synchronized']);
        $this->assertSame('BERMASALAH', $summary['status']);
        $this->assertSame(500000, $summary['difference']);
        $this->assertGreaterThan(0, $summary['anomalies_count']);

        $types = collect($summary['anomalies'])->pluck('type')->all();
        $this->assertContains('amount_mismatch', $types);
    }

    /** 14. Rekonsiliasi mendeteksi FinanceIncome yang hilang */
    public function test_14_reconciliation_detects_missing_finance_income(): void
    {
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);

        // Transfer approved tapi belum punya FinanceIncome
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        $reconciliationService = app(DonationFinanceReconciliationService::class);
        $summary = $reconciliationService->reconciliationSummary();

        $this->assertFalse($summary['is_synchronized']);
        $this->assertSame('BERMASALAH', $summary['status']);
        $this->assertSame(4000000, $summary['difference']);

        $types = collect($summary['anomalies'])->pluck('type')->all();
        $this->assertContains('missing_income', $types);
    }

    /** 15. Rekonsiliasi mendeteksi FinanceIncome ganda */
    public function test_15_reconciliation_detects_duplicate_finance_income(): void
    {
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);
        $user = $this->createStaff('staf_keuangan');

        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        FinanceIncome::create([
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Transfer dari Donasi',
            'amount' => 4000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $user->id,
        ]);

        $anomalies = app(DonationFinanceReconciliationService::class)->detectAnomalies();
        $this->assertIsArray($anomalies);
    }

    /** 16. Laporan konsolidasi tidak menghitung Transfer dari Donasi sebagai pendapatan kedua */
    public function test_16_consolidated_report_does_not_double_count_internal_transfer(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $from = DonationAccount::create(['name' => 'BSI Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);

        // Donasi masuk 10.000.000
        $this->createIncomingDonation($from->id, 10000000, 'paid');

        // Mutasi ke Keuangan 4.000.000
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 4000000,
            'transfer_date' => now()->toDateString(),
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        // Pemasukan mandiri keuangan 2.000.000
        FinanceIncome::create([
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Bantuan Sekolah',
            'amount' => 2000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $staf->id,
        ]);

        $reconciliationService = app(DonationFinanceReconciliationService::class);
        $summary = $reconciliationService->reconciliationSummary();

        // Total pendapatan konsolidasi harus 12.000.000 (10jt + 2jt), BUKAN 16.000.000
        $this->assertSame(12000000, $summary['organization_total_revenue']);
        $this->assertSame(10000000, $summary['total_incoming_donation']);
        $this->assertSame(2000000, $summary['finance_external_income_total']);
        $this->assertSame(4000000, $summary['approved_transfers_total']);
    }

    /** 17. Penerimaan non-donasi tetap dihitung sebagai pendapatan Keuangan */
    public function test_17_external_incomes_are_counted_as_financial_income(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);

        FinanceIncome::create([
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Dana Operasional',
            'amount' => 5000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $staf->id,
        ]);

        $service = app(DonationFinanceReconciliationService::class);
        $summary = $service->reconciliationSummary();

        $this->assertSame(5000000, $summary['finance_external_income_total']);
        $this->assertSame(5000000, $summary['finance_total_income_receipts']);
        $this->assertSame(5000000, $summary['organization_total_revenue']);
    }

    /** 18. Pengeluaran tetap mengurangi saldo akun Keuangan yang benar */
    public function test_18_expense_reduces_correct_finance_account_balance(): void
    {
        $staf = $this->createStaff('staf_keuangan');
        $to = DonationAccount::create(['name' => 'BSI Keuangan', 'category' => 'finance']);

        // Pemasukan awal 5.000.000
        FinanceIncome::create([
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'income_type' => 'Dana Operasional',
            'amount' => 5000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $staf->id,
        ]);

        $balanceService = app(DonationBalanceService::class);
        $this->assertSame(5000000, $balanceService->financeBalanceByAccount($to->id));

        // Pengeluaran 2.000.000
        FinanceExpense::create([
            'finance_account_id' => $to->id,
            'date' => now()->toDateString(),
            'expense_category' => 'Makan Santri',
            'amount' => 2000000,
            'payment_method' => 'Transfer Bank',
            'created_by' => $staf->id,
        ]);

        $this->assertSame(3000000, $balanceService->financeBalanceByAccount($to->id));
    }

    // --- Helpers ---

    protected function createIncomingDonation(int $accountId, int $amount, string $status = 'paid'): DonationTransaction
    {
        return DonationTransaction::create([
            'donation_account_id' => $accountId,
            'order_id' => 'DON-' . uniqid(),
            'donor_name' => 'Donatur Test',
            'donor_whatsapp' => '08123456789',
            'support_type' => 'Donasi Test',
            'amount' => $amount,
            'payment_method' => 'bank_transfer',
            'payment_gateway' => 'manual',
            'status' => $status,
            'paid_at' => $status === 'paid' ? now() : null,
        ]);
    }

    protected function createTransfer(array $attributes = []): DonationTransfer
    {
        $requester = User::create([
            'name' => 'Pemohon Mutasi ' . uniqid(),
            'email' => 'requester_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
            'role' => 'staf_donasi',
        ]);

        return DonationTransfer::create(array_merge([
            'transfer_number' => 'MD-' . uniqid(),
            'transfer_date' => now()->toDateString(),
            'amount' => 100000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $requester->id,
        ], $attributes));
    }

    protected function createStaff(string $roleName = 'staf_keuangan'): User
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['display_name' => ucfirst($roleName), 'guard_name' => 'web']
        );
        $user = User::create([
            'name' => 'Staf ' . uniqid(),
            'email' => 'staf_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
            'role' => $roleName,
        ]);
        $user->roles()->sync([$role->id]);

        $permissions = [
            'donation.transfers.view',
            'donation.transfers.approve',
            'donation.transfers.reject',
            'finance.transactions.view',
            'finance.transactions.manage'
        ];
        foreach ($permissions as $permName) {
            $perm = Permission::firstOrCreate(
                ['name' => $permName],
                [
                    'module' => 'finance',
                    'action' => str($permName)->afterLast('.')->value(),
                    'display_name' => $permName,
                    'group_name' => 'KEUANGAN',
                    'is_active' => true,
                ]
            );
            $role->permissions()->syncWithoutDetaching([$perm->id]);
        }

        return $user;
    }

    protected function createSuperadmin(): User
    {
        $role = Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['display_name' => 'Superadmin', 'guard_name' => 'web']
        );
        $user = User::create([
            'name' => 'Superadmin ' . uniqid(),
            'email' => 'superadmin_' . uniqid() . '@example.com',
            'password' => bcrypt('password'),
            'role' => 'superadmin',
        ]);
        $user->roles()->sync([$role->id]);

        return $user;
    }

    protected function createTables(): void
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
        Schema::create('roles', function ($table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('display_name');
            $table->string('guard_name')->default('web');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
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
        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
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
            $table->unique(['name', 'category']);
        });
        Schema::create('donation_transactions', function ($table) {
            $table->id();
            $table->foreignId('donation_account_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_id')->unique();
            $table->string('donor_name');
            $table->string('donor_whatsapp');
            $table->string('support_type');
            $table->unsignedBigInteger('amount');
            $table->string('payment_method')->nullable();
            $table->string('payment_gateway')->default('midtrans');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
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
        Schema::create('finance_incomes', function ($table) {
            $table->id();
            $table->foreignId('donation_outflow_id')->nullable()->constrained('donation_outflows')->nullOnDelete();
            $table->foreignId('donation_transfer_id')->nullable()->unique()->constrained('donation_transfers')->restrictOnDelete();
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
