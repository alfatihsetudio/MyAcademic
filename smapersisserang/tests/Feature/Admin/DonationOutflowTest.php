<?php

namespace Tests\Feature\Admin;

use App\Http\Controllers\Admin\FinanceController;
use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\DonationTransfer;
use App\Models\FinanceIncome;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use App\Services\DonationOutflowApprovalService;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DonationOutflowTest extends TestCase
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
            'donation_transfers',
            'donation_accounts',
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

    public function test_user_with_view_permission_can_see_index(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index'))
            ->assertOk()
            ->assertSee('Penyerahan Dana Donasi ke Keuangan');
    }

    public function test_user_without_view_permission_is_denied(): void
    {
        $user = $this->userWithPermissions([]);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index'))
            ->assertForbidden();
    }

    public function test_index_without_filter_shows_all_outflows(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $pending = $this->createOutflow(['status' => 'pending', 'handover_date' => '2026-07-31', 'transaction_number' => 'DK-20260731-PN01']);
        $approved = $this->createOutflow(['status' => 'approved', 'handover_date' => '2026-08-01', 'transaction_number' => 'DK-20260801-PN02']);
        $rejected = $this->createOutflow(['status' => 'rejected', 'handover_date' => '2026-08-02', 'transaction_number' => 'DK-20260802-PN03']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index'))
            ->assertOk()
            ->assertSee($pending->transaction_number)
            ->assertSee($approved->transaction_number)
            ->assertSee($rejected->transaction_number);
    }

    public function test_date_filter_shows_only_selected_date(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $selected = $this->createOutflow(['handover_date' => '2026-07-31', 'transaction_number' => 'DK-20260731-PN01']);
        $other = $this->createOutflow(['handover_date' => '2026-08-02', 'transaction_number' => 'DK-20260802-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => '2026-07-31', 'filter_type' => 'date']))
            ->assertOk()
            ->assertSee($selected->transaction_number)
            ->assertDontSee($other->transaction_number);
    }

    public function test_month_filter_shows_all_selected_month_transactions(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $first = $this->createOutflow(['handover_date' => '2026-08-02', 'transaction_number' => 'DK-20260802-PN01']);
        $second = $this->createOutflow(['handover_date' => '2026-08-15', 'transaction_number' => 'DK-20260815-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => '2026-08-02', 'filter_type' => 'month']))
            ->assertOk()
            ->assertSee($first->transaction_number)
            ->assertSee($second->transaction_number);
    }

    public function test_month_filter_excludes_transactions_from_other_months(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $inMonth = $this->createOutflow(['handover_date' => '2026-08-10', 'transaction_number' => 'DK-20260810-PN01']);
        $otherMonth = $this->createOutflow(['handover_date' => '2026-07-31', 'transaction_number' => 'DK-20260731-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => '2026-08-10', 'filter_type' => 'month']))
            ->assertOk()
            ->assertSee($inMonth->transaction_number)
            ->assertDontSee($otherMonth->transaction_number);
    }

    public function test_status_filter_pending_shows_only_pending(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $pending = $this->createOutflow(['status' => 'pending', 'transaction_number' => 'DK-20260731-PN01']);
        $approved = $this->createOutflow(['status' => 'approved', 'transaction_number' => 'DK-20260801-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['status' => 'pending']))
            ->assertOk()
            ->assertSee($pending->transaction_number)
            ->assertDontSee($approved->transaction_number);
    }

    public function test_status_filter_approved_shows_only_approved(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $approved = $this->createOutflow(['status' => 'approved', 'transaction_number' => 'DK-20260801-PN01']);
        $pending = $this->createOutflow(['status' => 'pending', 'transaction_number' => 'DK-20260731-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['status' => 'approved']))
            ->assertOk()
            ->assertSee($approved->transaction_number)
            ->assertDontSee($pending->transaction_number);
    }

    public function test_status_filter_rejected_shows_only_rejected(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $rejected = $this->createOutflow(['status' => 'rejected', 'transaction_number' => 'DK-20260802-PN01']);
        $pending = $this->createOutflow(['status' => 'pending', 'transaction_number' => 'DK-20260731-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['status' => 'rejected']))
            ->assertOk()
            ->assertSee($rejected->transaction_number)
            ->assertDontSee($pending->transaction_number);
    }

    public function test_source_method_filter_shows_only_selected_method(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $bank = $this->createOutflow(['source_payment_method' => 'bank_transfer', 'transaction_number' => 'DK-20260731-PN01']);
        $cash = $this->createOutflow(['source_payment_method' => 'cash', 'transaction_number' => 'DK-20260801-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['payment_method' => 'bank_transfer']))
            ->assertOk()
            ->assertSee($bank->transaction_number)
            ->assertDontSee($cash->transaction_number);
    }

    public function test_source_method_filter_unclassified_shows_null_only(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $null = $this->createOutflow(['source_payment_method' => null, 'transaction_number' => 'DK-20260731-PN01']);
        $cash = $this->createOutflow(['source_payment_method' => 'cash', 'transaction_number' => 'DK-20260801-PN02']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['payment_method' => 'unclassified']))
            ->assertOk()
            ->assertSee($null->transaction_number)
            ->assertDontSee($cash->transaction_number);
    }

    public function test_source_method_filter_rejects_invalid_value(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['payment_method' => 'transfer']))
            ->assertSessionHasErrors('payment_method');
    }

    public function test_outflow_store_requires_payment_method(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.create']);
        $this->createIncomingDonation(1500000);

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), [
                'handover_date' => '2026-07-31',
                'donation_source' => 'Donasi Pendidikan',
                'amount' => 1500000,
                'payment_method' => '',
                'destination_account' => 'BSI Operasional',
            ])
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('donation_outflows', 0);
    }

    public function test_month_and_status_filter_combined(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $pendingAug = $this->createOutflow(['status' => 'pending', 'handover_date' => '2026-08-05', 'transaction_number' => 'DK-20260805-PN01']);
        $pendingJul = $this->createOutflow(['status' => 'pending', 'handover_date' => '2026-07-31', 'transaction_number' => 'DK-20260731-PN02']);
        $approvedAug = $this->createOutflow(['status' => 'approved', 'handover_date' => '2026-08-06', 'transaction_number' => 'DK-20260806-PN03']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => '2026-08-05', 'filter_type' => 'month', 'status' => 'pending']))
            ->assertOk()
            ->assertSee($pendingAug->transaction_number)
            ->assertDontSee($pendingJul->transaction_number)
            ->assertDontSee($approvedAug->transaction_number);
    }

    public function test_search_by_transaction_number_works(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);
        $target = $this->createOutflow(['transaction_number' => 'DK-20260802-ABCD']);
        $other = $this->createOutflow(['transaction_number' => 'DK-20260803-WXYZ']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['search' => 'ABCD']))
            ->assertOk()
            ->assertSee($target->transaction_number)
            ->assertDontSee($other->transaction_number);
    }

    public function test_pagination_preserves_query_string(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        foreach (range(1, 25) as $i) {
            $this->createOutflow([
                'status' => 'pending',
                'handover_date' => '2026-08-'.str_pad((string) ($i % 28) + 1, 2, '0', STR_PAD_LEFT),
                'transaction_number' => 'DK-202608-P'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
            ]);
        }

        $response = $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['status' => 'pending']));

        $response->assertOk();
        $this->assertStringContainsString('page=2', $response->getContent());
        $this->assertStringContainsString('status=pending', $response->getContent());
    }

    public function test_date_filter_without_date_returns_validation_error(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['filter_type' => 'date']))
            ->assertSessionHasErrors('date');
    }

    public function test_invalid_date_returns_validation_error(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => 'not-a-date', 'filter_type' => 'date']))
            ->assertSessionHasErrors('date');
    }

    public function test_reset_link_points_to_clean_index(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index', ['date' => '2026-08-02', 'status' => 'pending']))
            ->assertOk()
            ->assertSee('href="'.route('admin.donation-outflows.index').'"', false);
    }

    public function test_transaction_is_created_pending_with_initial_history(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.create']);
        $this->createIncomingDonation(1500000);

        $response = $this->actingAs($user)->post(route('admin.donation-outflows.store'), [
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Juli 2026',
            'amount' => 1500000,
            'payment_method' => 'bank_transfer',
            'destination_account' => 'BSI Operasional',
            'proof_file' => UploadedFile::fake()->image('bukti.jpg'),
            'notes' => 'Diserahkan penuh',
        ]);

        $outflow = DonationOutflow::firstOrFail();

        $response->assertRedirect(route('admin.donation-outflows.show', $outflow));
        $this->assertMatchesRegularExpression('/^DK-\d{8}-[A-Z0-9]{4}$/', $outflow->transaction_number);
        $this->assertSame(DonationOutflow::STATUS_PENDING, $outflow->status);
        $this->assertDatabaseHas('donation_outflow_status_histories', [
            'donation_outflow_id' => $outflow->id,
            'from_status' => null,
            'to_status' => 'pending',
            'changed_by' => $user->id,
        ]);
        Storage::disk('public')->assertExists($outflow->proof_file);
    }

    public function test_create_form_shows_available_balance_for_each_single_payment_method(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.create']);
        $this->createIncomingDonation(1500000);

        $response = $this->actingAs($user)
            ->get(route('admin.donation-outflows.create'))
            ->assertOk()
            ->assertSee('Metode Pembayaran')
            ->assertSee('Tunai — Saldo tersedia:')
            ->assertSee('Transfer Bank — Saldo tersedia:')
            ->assertSee('QRIS — Saldo tersedia:')
            ->assertSee('Lainnya — Saldo tersedia:')
            ->assertDontSee('Sumber Dana yang Digunakan')
            ->assertDontSee('Metode Penyerahan');

        $this->assertStringNotContainsString('name="source_payment_method"', $response->getContent());
        $this->assertStringNotContainsString('name="handover_method"', $response->getContent());
    }

    public function test_superadmin_can_edit_pending_outflow_and_change_amount(): void
    {
        $superadmin = $this->userWithPermissions([], 'superadmin');
        $outflow = $this->createOutflow();
        $number = $outflow->transaction_number;
        $creatorId = $outflow->created_by;

        $this->actingAs($superadmin)
            ->put(route('admin.donation-outflows.update', $outflow), $this->editOutflowPayload([
                'donation_source' => 'Donasi Makan Santri',
                'amount' => 1000000,
                'description' => 'Periode Agustus 2026',
            ]))
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $outflow->refresh();
        $this->assertSame('Donasi Makan Santri', $outflow->donation_source);
        $this->assertSame('1000000.00', $outflow->amount);
        $this->assertSame($number, $outflow->transaction_number);
        $this->assertSame(DonationOutflow::STATUS_PENDING, $outflow->status);
        $this->assertSame($creatorId, $outflow->created_by);
    }

    public function test_admin_can_open_and_edit_outflow(): void
    {
        $admin = $this->userWithPermissions(['donation.outflows.create'], 'admin');
        $outflow = $this->createOutflow();
        $this->createIncomingDonation(1250000);
        DB::table('donation_transactions')->latest('id')->update(['payment_method' => 'cash']);

        $this->actingAs($admin)
            ->get(route('admin.donation-outflows.edit', $outflow))
            ->assertOk()
            ->assertSee('Edit Donasi Keluar');

        $this->actingAs($admin)
            ->put(route('admin.donation-outflows.update', $outflow), $this->editOutflowPayload([
                'payment_method' => 'cash',
            ]))
            ->assertRedirect();

        $this->assertSame('cash', $outflow->fresh()->payment_method);
    }

    public function test_user_without_manage_role_cannot_edit_outflow(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.view'], 'staf_keuangan');
        $outflow = $this->createOutflow();

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.edit', $outflow))
            ->assertForbidden();

        $this->actingAs($user)
            ->put(route('admin.donation-outflows.update', $outflow), $this->editOutflowPayload())
            ->assertForbidden();
    }

    public function test_editing_approved_source_method_moves_method_balance_without_changing_total_or_income(): void
    {
        $admin = $this->userWithPermissions([], 'admin');
        $outflow = $this->createOutflow([
            'status' => DonationOutflow::STATUS_APPROVED,
            'payment_method' => 'bank_transfer',
        ]);
        $income = $this->createIncome($outflow);
        DB::table('donation_transactions')->insert([
            'order_id' => 'DON-CASH-EDIT',
            'donor_name' => 'Donatur Tunai',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => 1500000,
            'payment_method' => 'cash',
            'payment_gateway' => 'manual',
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $service = app(DonationBalanceService::class);
        $totalBefore = $service->recordedBalance();

        $this->actingAs($admin)
            ->put(route('admin.donation-outflows.update', $outflow), $this->editOutflowPayload([
                'payment_method' => 'cash',
                'description' => 'Keterangan diperbaiki',
            ]))
            ->assertRedirect();

        $byMethod = $service->summaryByPaymentMethod();
        $this->assertSame($totalBefore, $service->recordedBalance());
        $this->assertSame(1250000, $byMethod['bank_transfer']['recorded_balance']);
        $this->assertSame(250000, $byMethod['cash']['recorded_balance']);
        $this->assertDatabaseCount('finance_incomes', 1);
        $this->assertDatabaseHas('finance_incomes', [
            'id' => $income->id,
            'donation_outflow_id' => $outflow->id,
            'amount' => 1250000,
        ]);
    }

    public function test_approved_outflow_amount_cannot_be_changed(): void
    {
        $superadmin = $this->userWithPermissions([], 'superadmin');
        $outflow = $this->createOutflow(['status' => DonationOutflow::STATUS_APPROVED]);
        $income = $this->createIncome($outflow);

        $this->actingAs($superadmin)
            ->put(route('admin.donation-outflows.update', $outflow), $this->editOutflowPayload([
                'amount' => 1000000,
            ]))
            ->assertSessionHasErrors('amount');

        $this->assertSame('1250000.00', $outflow->fresh()->amount);
        $this->assertSame('1250000.00', $income->fresh()->amount);
        $this->assertDatabaseCount('finance_incomes', 1);
    }

    public function test_approval_creates_one_correctly_mapped_finance_income(): void
    {
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $outflow = $this->createOutflow(['proof_file' => 'donation/outflow-proofs/bukti.pdf']);

        app(DonationOutflowApprovalService::class)->approve($outflow, $approver);

        $income = FinanceIncome::sole();
        $this->assertSame($outflow->id, $income->donation_outflow_id);
        $this->assertSame('2026-07-31', $income->date->format('Y-m-d'));
        $this->assertSame('Transfer dari Donasi', $income->income_type);
        $this->assertSame('1250000.00', $income->amount);
        $this->assertSame('Transfer Bank', $income->payment_method);
        $this->assertSame('Donasi Pendidikan', $income->source_name);
        $this->assertSame('donation/outflow-proofs/bukti.pdf', $income->proof_file);
        $this->assertSame($approver->id, $income->created_by);
        $this->assertStringContainsString($outflow->transaction_number, $income->description);
        $this->assertStringContainsString('Periode Juli 2026', $income->description);
        $this->assertStringContainsString('BSI Operasional', $income->description);
        $this->assertStringContainsString('Catatan pengujian', $income->description);
        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'approved',
            'approved_by' => $approver->id,
        ]);
        $this->assertDatabaseHas('donation_outflow_status_histories', [
            'donation_outflow_id' => $outflow->id,
            'from_status' => 'pending',
            'to_status' => 'approved',
        ]);
    }

    public function test_second_approval_does_not_create_duplicate_income(): void
    {
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $outflow = $this->createOutflow();
        $service = app(DonationOutflowApprovalService::class);
        $service->approve($outflow, $approver);

        try {
            $service->approve($outflow, $approver);
            $this->fail('Approval kedua seharusnya ditolak.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('finance_incomes', 1);
        }
    }

    public function test_rejection_requires_and_saves_reason_without_income(): void
    {
        $rejector = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow();

        $this->actingAs($rejector)
            ->post(route('admin.donation-outflows.reject', $outflow), [])
            ->assertSessionHasErrors('rejection_reason');

        $this->actingAs($rejector)
            ->post(route('admin.donation-outflows.reject', $outflow), [
                'rejection_reason' => 'Nominal belum sesuai bukti.',
            ])
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'rejected',
            'rejected_by' => $rejector->id,
            'rejection_reason' => 'Nominal belum sesuai bukti.',
        ]);
        $this->assertDatabaseHas('donation_outflow_status_histories', [
            'donation_outflow_id' => $outflow->id,
            'from_status' => 'pending',
            'to_status' => 'rejected',
            'reason' => 'Nominal belum sesuai bukti.',
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_approved_cannot_be_rejected_and_rejected_cannot_be_approved(): void
    {
        $user = $this->userWithPermissions([
            'donation.outflows.approve',
            'donation.outflows.reject',
        ]);
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');

        $approved = $this->createOutflow();
        app(DonationOutflowApprovalService::class)->approve($approved, $user);

        $this->actingAs($staf)
            ->post(route('admin.donation-outflows.reject', $approved), [
                'rejection_reason' => 'Tidak boleh diproses.',
            ])
            ->assertSessionHasErrors('status');

        $rejected = $this->createOutflow(['transaction_number' => 'DK-20260731-RJ01']);
        $this->actingAs($staf)->post(route('admin.donation-outflows.reject', $rejected), [
            'rejection_reason' => 'Ditolak.',
        ]);

        try {
            app(DonationOutflowApprovalService::class)->approve($rejected->fresh(), $user);
            $this->fail('Transaksi rejected seharusnya tidak dapat disetujui.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('finance_incomes', 1);
        }
    }

    public function test_integrated_finance_income_cannot_be_edited_or_deleted(): void
    {
        $admin = $this->userWithPermissions([], 'admin');
        $outflow = $this->createOutflow();
        $income = $this->createIncome($outflow);

        $this->actingAs($admin)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();

        $this->actingAs($admin)
            ->put(route('admin.finance.incomes.update', $income), $this->incomePayload())
            ->assertForbidden();

        $this->actingAs($admin)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id]);
    }

    public function test_dashboard_pending_notification_only_counts_pending_transactions(): void
    {
        $this->createTransfer();
        $this->createTransfer([
            'transfer_number' => 'MD-20260731-AP01',
            'status' => 'approved',
        ]);
        $this->createTransfer([
            'transfer_number' => 'MD-20260731-RJ01',
            'status' => 'rejected',
        ]);

        $view = app(FinanceController::class)->dashboard();

        $this->assertSame(1, $view->getData()['pendingTransferCount']);
        $this->assertEquals(100000, $view->getData()['pendingTransferTotal']);
    }

    public function test_report_only_reads_finance_income_created_from_approval(): void
    {
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $pending = $this->createOutflow();
        $this->createOutflow([
            'transaction_number' => 'DK-20260731-RJ01',
            'status' => 'rejected',
        ]);

        app(DonationOutflowApprovalService::class)->approve($pending, $approver);

        $request = Request::create('/admin/finance/laporan', 'GET', [
            'start_date' => '2026-07-01',
            'end_date' => '2026-07-31',
        ]);
        $view = app(FinanceController::class)->report($request);

        $this->assertCount(1, $view->getData()['incomes']);
        $this->assertEquals(1250000, $view->getData()['totalIncome']);
        $this->assertSame('Transfer dari Donasi', $view->getData()['incomes']->sole()->income_type);
    }

    public function test_staf_keuangan_can_open_index_and_detail(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow();

        $this->actingAs($staf)
            ->get(route('admin.donation-outflows.index'))
            ->assertOk()
            ->assertSee('Penyerahan Dana Donasi ke Keuangan');

        $this->actingAs($staf)
            ->get(route('admin.donation-outflows.show', $outflow))
            ->assertOk()
            ->assertSee($outflow->transaction_number);
    }

    public function test_staf_keuangan_can_approve(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow();

        $this->actingAs($staf)
            ->post(route('admin.donation-outflows.approve', $outflow))
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'approved',
            'approved_by' => $staf->id,
        ]);
        $this->assertDatabaseCount('finance_incomes', 1);
    }

    public function test_staf_keuangan_can_reject(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow();

        $this->actingAs($staf)
            ->post(route('admin.donation-outflows.reject', $outflow), [
                'rejection_reason' => 'Berkas belum lengkap.',
            ])
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'rejected',
            'rejected_by' => $staf->id,
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_staf_keuangan_cannot_create(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');

        $this->actingAs($staf)
            ->get(route('admin.donation-outflows.create'))
            ->assertForbidden();

        $this->actingAs($staf)
            ->post(route('admin.donation-outflows.store'), [
                'handover_date' => '2026-07-31',
                'donation_source' => 'Donasi Pendidikan',
                'amount' => 1000,
                'handover_method' => 'cash',
                'destination_account' => 'Kas Sekolah',
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('donation_outflows', 0);
    }

    public function test_user_without_permission_gets_403(): void
    {
        $user = $this->userWithPermissions([]);

        $this->actingAs($user)
            ->get(route('admin.donation-outflows.index'))
            ->assertForbidden();
    }

    public function test_dashboard_pending_card_links_to_transfers_index(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $transfer = $this->createTransfer();

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Mutasi Dana Menunggu Verifikasi')
            ->assertSee($transfer->transfer_number)
            ->assertSee(route('admin.donation-transfers.show', $transfer))
            ->assertSee(route('admin.donation-transfers.index'));
    }

    public function test_creator_can_open_own_detail_but_does_not_see_verify_buttons(): void
    {
        $creator = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow(['created_by' => $creator->id]);

        $this->actingAs($creator)
            ->get(route('admin.donation-outflows.show', $outflow))
            ->assertOk()
            ->assertSee($outflow->transaction_number)
            ->assertSee('Menunggu verifikasi dari bagian Keuangan.')
            ->assertDontSee('Tindakan Verifikasi')
            ->assertDontSee('Setujui / ACC')
            ->assertDontSee('Tolak');
    }

    public function test_creator_cannot_approve_own_transaction(): void
    {
        $creator = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow(['created_by' => $creator->id]);

        $this->actingAs($creator)
            ->post(route('admin.donation-outflows.approve', $outflow))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_creator_cannot_reject_own_transaction(): void
    {
        $creator = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $outflow = $this->createOutflow(['created_by' => $creator->id]);

        $this->actingAs($creator)
            ->post(route('admin.donation-outflows.reject', $outflow), [
                'rejection_reason' => 'Tidak bisa ditolak sendiri.',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'pending',
        ]);
    }

    public function test_non_finance_user_with_approve_permission_cannot_approve(): void
    {
        $user = $this->userWithPermissions(['donation.outflows.approve']);
        $outflow = $this->createOutflow();

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.approve', $outflow))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_superadmin_can_approve_transaction_not_created_by_self(): void
    {
        $superadmin = $this->userWithRoleOutflowDefaults('superadmin');
        $outflow = $this->createOutflow();

        $this->actingAs($superadmin)
            ->post(route('admin.donation-outflows.approve', $outflow))
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'approved',
            'approved_by' => $superadmin->id,
        ]);
        $this->assertDatabaseCount('finance_incomes', 1);
    }

    public function test_superadmin_cannot_approve_own_transaction(): void
    {
        $superadmin = $this->userWithRoleOutflowDefaults('superadmin');
        $outflow = $this->createOutflow(['created_by' => $superadmin->id]);

        $this->actingAs($superadmin)
            ->post(route('admin.donation-outflows.approve', $outflow))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_superadmin_can_reject_transaction_not_created_by_self(): void
    {
        $superadmin = $this->userWithRoleOutflowDefaults('superadmin');
        $outflow = $this->createOutflow();

        $this->actingAs($superadmin)
            ->post(route('admin.donation-outflows.reject', $outflow), [
                'rejection_reason' => 'Dana tidak sesuai bukti.',
            ])
            ->assertRedirect(route('admin.donation-outflows.show', $outflow));

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'rejected',
            'rejected_by' => $superadmin->id,
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_superadmin_cannot_reject_own_transaction(): void
    {
        $superadmin = $this->userWithRoleOutflowDefaults('superadmin');
        $outflow = $this->createOutflow(['created_by' => $superadmin->id]);

        $this->actingAs($superadmin)
            ->post(route('admin.donation-outflows.reject', $outflow), [
                'rejection_reason' => 'Tidak boleh ditolak sendiri.',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'status' => 'pending',
        ]);
    }

    public function test_verification_default_roles_exclude_admin_in_manifest(): void
    {
        $manifest = collect(config('permissions'))
            ->keyBy('name')
            ->only(['donation.outflows.approve', 'donation.outflows.reject']);

        $this->assertSame(
            ['donation.outflows.approve', 'donation.outflows.reject'],
            $manifest->keys()->all(),
            'Manifest harus memuat kedua permission verifikasi.'
        );

        foreach ($manifest as $permission) {
            $this->assertNotContains('admin', $permission['default_roles'] ?? [], "{$permission['name']} tidak boleh berdefault admin.");
            $this->assertContains('staf_keuangan', $permission['default_roles'] ?? [], "{$permission['name']} harus berdefault staf_keuangan.");
        }
    }

    public function test_admin_with_stale_approve_reject_permission_still_forbidden(): void
    {
        $admin = $this->userWithPermissions([
            'donation.outflows.approve',
            'donation.outflows.reject',
        ], 'admin');

        $pending = $this->createOutflow();
        $this->actingAs($admin)
            ->post(route('admin.donation-outflows.approve', $pending))
            ->assertForbidden();
        $this->assertDatabaseHas('donation_outflows', [
            'id' => $pending->id,
            'status' => 'pending',
        ]);

        $pendingReject = $this->createOutflow(['transaction_number' => 'DK-20260731-AR01']);
        $this->actingAs($admin)
            ->post(route('admin.donation-outflows.reject', $pendingReject), [
                'rejection_reason' => 'Admin tidak boleh memverifikasi.',
            ])
            ->assertForbidden();
        $this->assertDatabaseHas('donation_outflows', [
            'id' => $pendingReject->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_approve_reject_buttons_appear_per_permission_and_status(): void
    {
        $staf = $this->userWithRoleOutflowDefaults('staf_keuangan');

        $pending = $this->createOutflow();
        $this->actingAs($staf)
            ->get(route('admin.donation-outflows.show', $pending))
            ->assertOk()
            ->assertSee('Tindakan Verifikasi')
            ->assertSee('Setujui / ACC');

        $approved = $this->createOutflow([
            'transaction_number' => 'DK-20260731-AP2',
            'status' => 'approved',
        ]);
        $this->actingAs($staf)
            ->get(route('admin.donation-outflows.show', $approved))
            ->assertOk()
            ->assertDontSee('Tindakan Verifikasi')
            ->assertDontSee('Setujui / ACC');

        $viewOnly = $this->userWithPermissions(['donation.outflows.view']);
        $this->actingAs($viewOnly)
            ->get(route('admin.donation-outflows.show', $pending))
            ->assertOk()
            ->assertDontSee('Tindakan Verifikasi')
            ->assertDontSee('Setujui / ACC');
    }

    public function test_income_from_approval_shows_inputter_and_verifier(): void
    {
        $creator = User::factory()->create(['role' => 'admin', 'name' => 'Penginput Donasi']);
        $approver = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $approver->update(['name' => 'Verifikator Keuangan']);

        $outflow = $this->createOutflow(['created_by' => $creator->id]);
        app(DonationOutflowApprovalService::class)->approve($outflow, $approver);

        $this->actingAs($approver)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSeeInOrder(['Diinput oleh', 'Penginput Donasi', 'Diverifikasi oleh', 'Verifikator Keuangan']);
    }

    public function test_manual_income_still_shows_recorder(): void
    {
        $recorder = $this->userWithRoleOutflowDefaults('admin');
        $recorder->update(['name' => 'Pencatat Manual']);

        FinanceIncome::create([
            'date' => '2026-07-31',
            'income_type' => 'Bantuan Sekolah',
            'amount' => 750000,
            'payment_method' => 'Transfer Bank',
            'source_name' => 'Manual',
            'description' => 'Pemasukan manual',
            'created_by' => $recorder->id,
        ]);

        $this->actingAs($recorder)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Pencatat Manual');
    }

    public function test_income_from_approval_handles_missing_inputter_user(): void
    {
        $approver = $this->userWithRoleOutflowDefaults('staf_keuangan');
        $creator = User::factory()->create(['role' => 'admin', 'name' => 'Penginput Lama']);

        $outflow = $this->createOutflow(['created_by' => $creator->id]);
        app(DonationOutflowApprovalService::class)->approve($outflow, $approver);

        DB::statement('PRAGMA foreign_keys = OFF');
        DB::table('donation_outflows')->where('id', $outflow->id)->update(['created_by' => 999999]);
        DB::statement('PRAGMA foreign_keys = ON');

        $this->actingAs($approver)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Pengguna tidak tersedia');
    }

    private function userWithRoleOutflowDefaults(string $roleName): User
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
            if (str_starts_with($perm['name'], 'donation.outflows.')
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

    private function userWithPermissions(array $permissionNames, string $roleName = 'guru'): User
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

        foreach ([
            'donation.outflows.view',
            'donation.outflows.create',
            'donation.outflows.approve',
            'donation.outflows.reject',
        ] as $name) {
            $permission = Permission::firstOrCreate(
                ['name' => $name],
                [
                    'module' => 'donation',
                    'action' => str($name)->afterLast('.')->value(),
                    'display_name' => $name,
                    'group_name' => 'DONASI',
                    'is_active' => true,
                ]
            );

            if (in_array($name, $permissionNames, true)) {
                $role->permissions()->syncWithoutDetaching([$permission->id]);
            }
        }

        return $user;
    }

    private function createTransfer(array $overrides = []): DonationTransfer
    {
        $requester = User::factory()->create(['role' => 'admin']);

        $data = array_merge([
            'transfer_number' => 'MD-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'transfer_date' => now()->toDateString(),
            'amount' => 100000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $requester->id,
        ], $overrides);

        if (! isset($data['from_account_id'])) {
            $data['from_account_id'] = DonationAccount::create([
                'name' => 'Tunai Donasi',
                'category' => DonationAccount::CATEGORY_DONATION,
            ])->id;
        }

        if (! isset($data['to_account_id'])) {
            $data['to_account_id'] = DonationAccount::create([
                'name' => 'Kas Keuangan',
                'category' => DonationAccount::CATEGORY_FINANCE,
            ])->id;
        }

        return DonationTransfer::create($data);
    }

    private function createOutflow(array $overrides = []): DonationOutflow
    {
        $creator = User::factory()->create(['role' => 'admin']);

        $data = array_merge([
            'transaction_number' => 'DK-20260731-PN01',
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Juli 2026',
            'amount' => 1250000,
            'payment_method' => 'bank_transfer',
            'destination_account' => 'BSI Operasional',
            'notes' => 'Catatan pengujian',
            'status' => 'pending',
            'created_by' => $creator->id,
        ], $overrides);

        // Pastikan terdapat dana masuk yang cukup agar approval/store valid.
        $this->createIncomingDonation((int) round((float) $data['amount']));

        return DonationOutflow::create($data);
    }

    private function createIncomingDonation(int $amount): void
    {
        DB::table('donation_transactions')->insert([
            'order_id' => 'DON-'.now()->format('Ymd').'-'.strtoupper(bin2hex(random_bytes(2))),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => $amount,
            'payment_method' => 'bank_transfer',
            'payment_gateway' => 'midtrans',
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createIncome(DonationOutflow $outflow): FinanceIncome
    {
        $creator = User::factory()->create(['role' => 'admin']);

        return FinanceIncome::create(array_merge($this->incomePayload(), [
            'donation_outflow_id' => $outflow->id,
            'created_by' => $creator->id,
        ]));
    }

    private function incomePayload(): array
    {
        return [
            'date' => '2026-07-31',
            'income_type' => 'Transfer dari Donasi',
            'amount' => 1250000,
            'payment_method' => 'Transfer Bank',
            'source_name' => 'Donasi Pendidikan',
            'description' => 'Pemasukan terintegrasi',
        ];
    }

    private function editOutflowPayload(array $overrides = []): array
    {
        return array_merge([
            'handover_date' => '2026-08-03',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Agustus 2026',
            'amount' => 1250000,
            'payment_method' => 'bank_transfer',
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
        Schema::create('finance_incomes', function ($table) {
            $table->id();
            $table->foreignId('donation_outflow_id')->nullable()->unique()->constrained()->restrictOnDelete();
            $table->unsignedBigInteger('finance_account_id')->nullable();
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
