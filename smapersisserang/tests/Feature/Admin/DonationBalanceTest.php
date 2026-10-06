<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationOutflow;
use App\Models\DonationTransaction;
use App\Models\DonationTransfer;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationBalanceService;
use App\Services\DonationOutflowApprovalService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DonationBalanceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
    }

    protected function tearDown(): void
    {
        foreach ([
            'finance_expenses',
            'finance_incomes',
            'donation_item_commitments',
            'donation_item_receipts',
            'donation_transaction_histories',
            'donation_outflow_status_histories',
            'donation_transfers',
            'donation_accounts',
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

    public function test_valid_money_transaction_adds_to_total_incoming(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 500000]);
        $this->createDonationTransaction(['status' => 'settlement', 'amount' => 300000]);
        $this->createDonationTransaction(['status' => 'capture', 'amount' => 200000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->totalIncoming());
        $this->assertSame(1000000, $service->recordedBalance());
    }

    public function test_pending_transaction_does_not_add_to_total_incoming(): void
    {
        $this->createDonationTransaction(['status' => 'pending', 'amount' => 500000]);

        $this->assertSame(0, app(DonationBalanceService::class)->totalIncoming());
    }

    public function test_cancelled_and_failed_transactions_do_not_add(): void
    {
        $this->createDonationTransaction(['status' => 'cancelled', 'amount' => 500000]);
        $this->createDonationTransaction(['status' => 'expired', 'amount' => 300000]);
        $this->createDonationTransaction(['status' => 'failure', 'amount' => 200000]);

        $this->assertSame(0, app(DonationBalanceService::class)->totalIncoming());
    }

    public function test_pending_outflow_does_not_reduce_recorded_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'pending', 'amount' => 400000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->recordedBalance());
    }

    public function test_pending_outflow_reduces_available_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'pending', 'amount' => 400000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->recordedBalance());
        $this->assertSame(600000, $service->availableBalance());
    }

    public function test_approved_outflow_reduces_recorded_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'approved', 'amount' => 400000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(600000, $service->recordedBalance());
        $this->assertSame(600000, $service->availableBalance());
    }

    public function test_rejected_outflow_does_not_reduce_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'rejected', 'amount' => 400000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->recordedBalance());
        $this->assertSame(1000000, $service->availableBalance());
    }

    public function test_item_donation_is_not_counted(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $creator = User::factory()->create(['role' => 'admin']);
        DB::table('donation_item_receipts')->insert([
            'receipt_number' => 'BK-0001',
            'received_date' => '2026-07-31',
            'donor_name' => 'Pak Barang',
            'item_type' => 'Peralatan',
            'status' => 'received',
            'user_id' => $creator->id,
        ]);
        DB::table('donation_item_commitments')->insert([
            'reference_number' => 'CM-0001',
            'received_at' => now(),
            'donor_name' => 'Pak Komitmen',
            'item_type' => 'Sembako',
            'status' => 'confirmed',
            'created_by' => $creator->id,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->totalIncoming());
        $this->assertSame(1000000, $service->recordedBalance());
    }

    public function test_user_cannot_create_outflow_exceeding_available_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'pending', 'amount' => 400000]);
        $user = $this->userWithPermissions(['donation.outflows.create']);

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), $this->outflowPayload(['amount' => 700000]))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('donation_outflows', 1);
    }

    public function test_rejection_returns_amount_to_available_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $outflow = $this->createOutflow(['status' => 'pending', 'amount' => 400000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(600000, $service->availableBalance());

        $outflow->update([
            'status' => DonationOutflow::STATUS_REJECTED,
            'rejected_by' => User::factory()->create(['role' => 'admin'])->id,
            'rejected_at' => now(),
        ]);

        $this->assertSame(1000000, $service->availableBalance());
    }

    public function test_approval_cannot_make_balance_negative(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $first = $this->createOutflow(['status' => 'pending', 'amount' => 1000000]);

        app(DonationOutflowApprovalService::class)->approve($first, $approver);

        $this->assertSame(0, app(DonationBalanceService::class)->recordedBalance());

        $second = $this->createOutflow(['status' => 'pending', 'amount' => 1000000]);
        try {
            app(DonationOutflowApprovalService::class)->approve($second, $approver);
            $this->fail('Approval seharusnya gagal karena saldo tidak mencukupi.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('status', $e->errors());
            $this->assertDatabaseCount('finance_incomes', 1);
        }
    }

    public function test_concurrent_requests_cannot_use_same_available_balance(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $user = $this->userWithPermissions(['donation.outflows.create']);

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), $this->outflowPayload(['amount' => 1000000]))
            ->assertRedirect();

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), $this->outflowPayload(['amount' => 1000000]))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('donation_outflows', 1);
    }

    public function test_summary_reports_correct_values(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 20000000]);
        $this->createDonationTransaction(['status' => 'pending', 'amount' => 5000000]);
        $this->createOutflow(['status' => 'approved', 'amount' => 7500000]);
        $this->createOutflow(['status' => 'pending', 'amount' => 1250000]);
        $this->createOutflow(['status' => 'rejected', 'amount' => 999000]);

        $summary = app(DonationBalanceService::class)->summary();

        $this->assertSame(20000000, $summary['total_incoming']);
        $this->assertSame(7500000, $summary['total_approved_outflow']);
        $this->assertSame(12500000, $summary['recorded_balance']);
        $this->assertSame(11250000, $summary['available_balance']);
        $this->assertSame(1, $summary['pending_count']);
    }

    public function test_finance_income_from_approval_is_not_recounted_as_incoming(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1000000]);
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $outflow = $this->createOutflow(['status' => 'pending', 'amount' => 400000]);

        app(DonationOutflowApprovalService::class)->approve($outflow, $approver);

        $this->assertDatabaseCount('finance_incomes', 1);
        $service = app(DonationBalanceService::class);
        $this->assertSame(1000000, $service->totalIncoming());
        $this->assertSame(600000, $service->recordedBalance());
    }

    public function test_user_without_balance_permission_cannot_access_dashboard(): void
    {
        $viewOnly = $this->userWithPermissions(['donation.outflows.view']);

        $this->actingAs($viewOnly)
            ->get(route('admin.donation.dashboard'))
            ->assertForbidden();
    }

    public function test_user_with_balance_permission_can_see_dashboard(): void
    {
        $user = $this->userWithPermissions([
            'donation.outflows.view',
            'donation.balance.view',
        ]);

        $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk()
            ->assertSee('Dashboard Donasi')
            ->assertSee('Saldo Donasi');
    }

    public function test_dashboard_lists_pending_transfers(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $from = $this->donationAccount('Tunai Donasi', DonationAccount::CATEGORY_DONATION);
        $to = $this->donationAccount('Kas Keuangan', DonationAccount::CATEGORY_FINANCE);
        $transfer = $this->createTransfer($from->id, $to->id, 500000);

        $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk()
            ->assertSee('Mutasi Dana Menunggu Verifikasi')
            ->assertSee($transfer->transfer_number)
            ->assertSee('Tunai Donasi')
            ->assertSee('Kas Keuangan')
            ->assertSee(route('admin.donation-transfers.show', $transfer))
            ->assertSee(route('admin.donation-transfers.index'));
    }

    public function test_dashboard_does_not_list_approved_or_rejected_transfers(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $from = $this->donationAccount('Tunai Donasi', DonationAccount::CATEGORY_DONATION);
        $to = $this->donationAccount('Kas Keuangan', DonationAccount::CATEGORY_FINANCE);
        $approved = $this->createTransfer($from->id, $to->id, 500000, ['status' => DonationTransfer::STATUS_APPROVED]);
        $rejected = $this->createTransfer($from->id, $to->id, 250000, ['status' => DonationTransfer::STATUS_REJECTED]);

        $response = $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk();

        $this->assertStringNotContainsString($approved->transfer_number, $response->getContent());
        $this->assertStringNotContainsString($rejected->transfer_number, $response->getContent());
    }

    public function test_dashboard_pending_widget_ignores_legacy_donation_outflows(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $legacy = $this->createOutflow(['status' => 'pending', 'amount' => 900000]);

        $response = $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk()
            ->assertSee('Mutasi Dana Menunggu Verifikasi');

        $this->assertStringNotContainsString($legacy->transaction_number, $response->getContent());
        $this->assertStringContainsString('0 transaksi pending', $response->getContent());
    }

    public function test_dashboard_pending_count_and_total_match_pending_transfers(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $from = $this->donationAccount('Tunai Donasi', DonationAccount::CATEGORY_DONATION);
        $to = $this->donationAccount('Kas Keuangan', DonationAccount::CATEGORY_FINANCE);
        $this->createTransfer($from->id, $to->id, 500000);
        $this->createTransfer($from->id, $to->id, 750000);

        $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk()
            ->assertSee('2 transaksi pending')
            ->assertSee('Rp1.250.000');
    }

    public function test_dashboard_does_not_execute_per_row_queries_for_pending_transfers(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $from = $this->donationAccount('Tunai Donasi', DonationAccount::CATEGORY_DONATION);
        $to = $this->donationAccount('Kas Keuangan', DonationAccount::CATEGORY_FINANCE);

        DB::enableQueryLog();
        $this->actingAs($user)->get(route('admin.donation.dashboard'))->assertOk();
        $baseline = count(DB::getQueryLog());
        DB::flushQueryLog();

        foreach (range(1, 5) as $i) {
            $this->createTransfer($from->id, $to->id, 100000);
        }

        DB::flushQueryLog();
        $this->actingAs($user)->get(route('admin.donation.dashboard'))->assertOk();
        $withRows = count(DB::getQueryLog());

        $this->assertLessThanOrEqual($baseline + 10, $withRows, 'Dashboard menjalankan query per-baris (N+1).');
    }

    public function test_dashboard_lists_latest_valid_income(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $paid = $this->createDonationTransaction(['status' => 'paid', 'amount' => 500000, 'donor_name' => 'Donatur Masuk']);
        $this->createDonationTransaction(['status' => 'pending', 'amount' => 300000, 'donor_name' => 'Donatur Pending']);

        $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk()
            ->assertSee('Donasi Masuk Terbaru')
            ->assertSee('Donatur Masuk')
            ->assertDontSee('Donatur Pending');
    }

    public function test_dashboard_limits_lists_to_five_rows(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);

        $transactions = [];
        foreach (range(1, 7) as $i) {
            $tx = $this->createDonationTransaction([
                'status' => 'paid',
                'amount' => 100000,
                'donor_name' => 'Donatur ke-'.$i,
            ]);
            $tx->forceFill(['created_at' => now()->addMinutes($i)])->save();
            $transactions[] = $tx;
        }

        $response = $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk();

        foreach ($transactions as $index => $transaction) {
            $included = $index >= 2;
            $this->assertSame($included, str_contains($response->getContent(), $transaction->order_id));
        }
    }

    // ========================================================================
    // PER-METHOD BALANCE
    // ========================================================================

    public function test_summary_by_payment_method_separates_methods(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 100000]);
        $this->createDonationTransaction(['payment_method' => 'bank_transfer', 'amount' => 200000]);
        $this->createDonationTransaction(['payment_method' => 'qris', 'amount' => 300000]);
        $this->createOutflow(['status' => 'approved', 'source_payment_method' => 'cash', 'amount' => 40000]);
        $this->createOutflow(['status' => 'approved', 'source_payment_method' => 'bank_transfer', 'amount' => 50000]);

        $byMethod = app(DonationBalanceService::class)->summaryByPaymentMethod();

        $this->assertSame(100000, $byMethod['cash']['incoming']);
        $this->assertSame(40000, $byMethod['cash']['approved_outflow']);
        $this->assertSame(60000, $byMethod['cash']['recorded_balance']);

        $this->assertSame(200000, $byMethod['bank_transfer']['incoming']);
        $this->assertSame(50000, $byMethod['bank_transfer']['approved_outflow']);
        $this->assertSame(150000, $byMethod['bank_transfer']['recorded_balance']);

        $this->assertSame(300000, $byMethod['qris']['incoming']);
        $this->assertSame(0, $byMethod['qris']['approved_outflow']);
        $this->assertSame(300000, $byMethod['qris']['recorded_balance']);
    }

    public function test_null_methods_grouped_into_unclassified(): void
    {
        $this->createDonationTransaction(['payment_method' => null, 'amount' => 500000]);
        $this->createOutflow(['status' => 'approved', 'source_payment_method' => null, 'amount' => 100000]);

        $byMethod = app(DonationBalanceService::class)->summaryByPaymentMethod();

        $this->assertSame(500000, $byMethod['unclassified']['incoming']);
        $this->assertSame(100000, $byMethod['unclassified']['approved_outflow']);
        $this->assertSame(400000, $byMethod['unclassified']['recorded_balance']);
    }

    public function test_sum_of_method_groups_equals_total_balance(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 300000]);
        $this->createDonationTransaction(['payment_method' => null, 'amount' => 200000]);
        $this->createDonationTransaction(['status' => 'pending', 'payment_method' => 'cash', 'amount' => 999999]);
        $this->createOutflow(['status' => 'approved', 'source_payment_method' => 'cash', 'amount' => 100000]);
        $this->createOutflow(['status' => 'pending', 'source_payment_method' => 'bank_transfer', 'amount' => 25000]);

        $service = app(DonationBalanceService::class);
        $byMethod = $service->summaryByPaymentMethod();

        $sumRecorded = array_sum(array_map(fn ($m) => $m['recorded_balance'], $byMethod));
        $sumAvailable = array_sum(array_map(fn ($m) => $m['available_balance'], $byMethod));

        $this->assertSame($service->recordedBalance(), $sumRecorded);
        $this->assertSame($service->availableBalance(), $sumAvailable);
        $this->assertSame(400000, $service->recordedBalance());
    }

    public function test_pending_outflow_of_one_method_does_not_reduce_other_method_available(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 1000000]);
        $this->createOutflow(['status' => 'pending', 'source_payment_method' => 'cash', 'amount' => 600000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(400000, $service->availableBalanceForMethod('cash'));
        $this->assertSame(0, $service->availableBalanceForMethod('bank_transfer'));
    }

    // ========================================================================
    // EDIT DONASI MASUK
    // ========================================================================

    public function test_superadmin_can_edit_incoming_donation_and_audit_is_recorded(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction([
            'payment_method' => 'cash',
            'amount' => 500000,
            'status' => 'settlement',
            'payment_gateway' => 'midtrans',
            'midtrans_payment_type' => 'bank_transfer',
        ]);
        $reference = $tx->order_id;

        $this->actingAs($user)
            ->put(route('admin.donasi-transactions.update', $tx), $this->editDonationPayload([
                'donor_name' => 'Donatur Diperbarui',
                'donor_phone' => '08123456789',
                'donor_email' => 'donatur@example.com',
                'amount' => 750000,
                'payment_method' => 'qris',
                'note' => 'Catatan baru',
                'transaction_reference' => 'REFERENSI-BARU',
                'status' => 'cancelled',
                'payment_gateway' => 'manual',
                'midtrans_payment_type' => 'qris',
            ]))
            ->assertRedirect(route('admin.donasi-transactions.show', $tx));

        $tx->refresh();
        $this->assertSame('Donatur Diperbarui', $tx->donor_name);
        $this->assertSame('08123456789', $tx->donor_whatsapp);
        $this->assertSame('donatur@example.com', $tx->donor_email);
        $this->assertSame(750000, $tx->amount);
        $this->assertSame('qris', $tx->payment_method);
        $this->assertSame($reference, $tx->order_id);
        $this->assertSame('settlement', $tx->status);
        $this->assertSame('midtrans', $tx->payment_gateway);
        $this->assertSame('bank_transfer', $tx->midtrans_payment_type);

        $history = $tx->histories()->sole();
        $this->assertSame($user->id, $history->user_id);
        $this->assertSame('updated', $history->action);
        $this->assertSame(500000, $history->old_values['amount']);
        $this->assertSame(750000, $history->new_values['amount']);
    }

    public function test_admin_cannot_open_or_update_incoming_donation(): void
    {
        $user = $this->userWithPermissions([], 'admin');
        $tx = $this->createDonationTransaction(['amount' => 500000]);

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.edit', $tx))
            ->assertForbidden();

        $this->actingAs($user)
            ->put(route('admin.donasi-transactions.update', $tx), $this->editDonationPayload(['amount' => 900000]))
            ->assertForbidden();

        $this->assertSame(500000, $tx->fresh()->amount);
        $this->assertDatabaseCount('donation_transaction_histories', 0);
    }

    public function test_editing_amount_and_method_updates_aggregate_balances(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 500000]);

        $this->actingAs($user)
            ->put(route('admin.donasi-transactions.update', $tx), $this->editDonationPayload([
                'amount' => 800000,
                'payment_method' => 'qris',
            ]))
            ->assertRedirect();

        $service = app(DonationBalanceService::class);
        $byMethod = $service->summaryByPaymentMethod();
        $this->assertSame(800000, $service->recordedBalance());
        $this->assertSame(0, $byMethod['cash']['incoming']);
        $this->assertSame(800000, $byMethod['qris']['incoming']);
        $this->assertDatabaseCount('donation_transactions', 1);
    }

    public function test_edit_button_is_only_visible_to_superadmin(): void
    {
        $this->createDonationTransaction();

        $superadmin = $this->userWithPermissions([], 'superadmin');
        $this->actingAs($superadmin)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertSee('Edit Donasi Masuk');

        $admin = $this->userWithPermissions([], 'admin');
        $this->actingAs($admin)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertDontSee('Edit Donasi Masuk');
    }

    // ========================================================================
    // EDIT METODE PEMBAYARAN (SUPERADMIN ONLY)
    // ========================================================================

    public function test_superadmin_can_update_payment_method(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction(['payment_method' => 'cash']);

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $tx), ['payment_method' => 'qris'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertSame('qris', $tx->fresh()->payment_method);

        $history = $tx->histories()->sole();
        $this->assertSame($user->id, $history->user_id);
        $this->assertSame('payment_method_updated', $history->action);
        $this->assertSame('cash', $history->old_values['payment_method']);
        $this->assertSame('qris', $history->new_values['payment_method']);
    }

    public function test_admin_cannot_update_payment_method(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash']);
        $tx = $this->createDonationTransaction(['payment_method' => 'bank_transfer']);

        foreach (['admin', 'staf_keuangan', 'kepala_sekolah'] as $role) {
            $user = $this->userWithPermissions([], $role);

            $this->actingAs($user)
                ->patch(route('admin.donasi-transactions.payment-method', $tx), ['payment_method' => 'qris'])
                ->assertForbidden();
        }

        $this->assertSame('bank_transfer', $tx->fresh()->payment_method);
        $this->assertDatabaseCount('donation_transaction_histories', 0);
    }

    public function test_updating_payment_method_only_changes_payment_method(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction([
            'payment_method' => 'cash',
            'amount' => 500000,
            'status' => 'settlement',
            'donor_name' => 'Donatur Asli',
            'donor_whatsapp' => '081234567890',
            'note' => 'Catatan asli',
        ]);
        $reference = $tx->order_id;

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $tx), [
                'payment_method' => 'qris',
                'amount' => 999999,
                'status' => 'cancelled',
                'donor_name' => 'Disusupi',
                'note' => 'Catatan disusupi',
            ])
            ->assertRedirect()
            ->assertSessionHas('success');

        $tx->refresh();
        $this->assertSame('qris', $tx->payment_method);
        $this->assertSame(500000, $tx->amount);
        $this->assertSame('settlement', $tx->status);
        $this->assertSame('Donatur Asli', $tx->donor_name);
        $this->assertSame('081234567890', $tx->donor_whatsapp);
        $this->assertSame('Catatan asli', $tx->note);
        $this->assertSame($reference, $tx->order_id);
    }

    public function test_superadmin_can_reset_payment_method_to_unclassified(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction(['payment_method' => 'cash']);

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $tx), ['payment_method' => ''])
            ->assertRedirect()
            ->assertSessionHas('success');

        $this->assertNull($tx->fresh()->payment_method);
    }

    public function test_changing_payment_method_moves_balance_per_method_but_total_stays(): void
    {
        $user = $this->userWithPermissions([], 'superadmin');
        $tx = $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 500000]);
        $this->createDonationTransaction(['payment_method' => 'bank_transfer', 'amount' => 300000]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(800000, $service->recordedBalance());
        $this->assertSame(500000, $service->recordedBalanceForMethod('cash'));
        $this->assertSame(0, $service->recordedBalanceForMethod('qris'));

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $tx), ['payment_method' => 'qris'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $byMethod = $service->summaryByPaymentMethod();
        $this->assertSame(0, $byMethod['cash']['incoming']);
        $this->assertSame(500000, $byMethod['qris']['incoming']);
        $this->assertSame(300000, $byMethod['bank_transfer']['incoming']);
        $this->assertSame(800000, $service->recordedBalance());
        $this->assertSame(800000, $service->totalIncoming());
    }

    public function test_edit_method_button_is_only_visible_to_superadmin(): void
    {
        $this->createDonationTransaction();

        $superadmin = $this->userWithPermissions([], 'superadmin');
        $this->actingAs($superadmin)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertSee('Edit Metode');

        foreach (['admin', 'staf_keuangan', 'kepala_sekolah'] as $role) {
            $user = $this->userWithPermissions([], $role);
            $this->actingAs($user)
                ->get(route('admin.donasi-transactions.index'))
                ->assertOk()
                ->assertDontSee('Edit Metode');
        }
    }

    // ========================================================================
    // DONASI KELUAR: SOURCE METHOD
    // ========================================================================

    public function test_outflow_store_requires_payment_method(): void
    {
        $this->createDonationTransaction(['amount' => 1000000]);
        $user = $this->userWithPermissions(['donation.outflows.create']);

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), $this->outflowPayload(['payment_method' => '']))
            ->assertSessionHasErrors('payment_method');
    }

    public function test_outflow_store_checks_chosen_method_balance(): void
    {
        $this->createDonationTransaction(['payment_method' => 'bank_transfer', 'amount' => 1000000]);
        $user = $this->userWithPermissions(['donation.outflows.create']);

        $this->actingAs($user)
            ->post(route('admin.donation-outflows.store'), $this->outflowPayload([
                'amount' => 2000000,
                'payment_method' => 'bank_transfer',
            ]))
            ->assertSessionHasErrors('payment_method');

        $this->assertDatabaseCount('donation_outflows', 0);
    }

    public function test_approval_rejects_outflow_without_source_method(): void
    {
        $this->createDonationTransaction(['amount' => 1000000]);
        $approver = $this->userWithPermissions(['donation.outflows.approve']);
        $outflow = $this->createOutflow(['payment_method' => null, 'amount' => 100000]);

        try {
            app(DonationOutflowApprovalService::class)->approve($outflow, $approver);
            $this->fail('Approval tanpa sumber dana seharusnya ditolak.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('status', $e->errors());
        }
    }

    public function test_update_source_method_moves_balance_without_changing_total(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 500000]);
        $this->createDonationTransaction(['payment_method' => 'bank_transfer', 'amount' => 500000]);

        $creator = User::factory()->create(['role' => 'admin', 'name' => 'Pembuat']);
        $outflow = DonationOutflow::create([
            'transaction_number' => 'DK-20260731-SM01',
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'amount' => 200000,
            'payment_method' => 'cash',
            'destination_account' => 'BSI Operasional',
            'status' => DonationOutflow::STATUS_APPROVED,
            'created_by' => $creator->id,
        ]);

        $admin = $this->userWithPermissions([], 'admin');
        $this->actingAs($admin)
            ->put(route('admin.donation-outflows.update', $outflow), [
                'handover_date' => '2026-07-31',
                'donation_source' => 'Donasi Pendidikan',
                'amount' => 200000,
                'payment_method' => 'bank_transfer',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('donation_outflows', [
            'id' => $outflow->id,
            'payment_method' => 'bank_transfer',
            'amount' => 200000,
            'status' => 'approved',
        ]);

        $byMethod = app(DonationBalanceService::class)->summaryByPaymentMethod();
        $this->assertSame(500000, $byMethod['cash']['recorded_balance']);
        $this->assertSame(300000, $byMethod['bank_transfer']['recorded_balance']);
        $this->assertSame(800000, app(DonationBalanceService::class)->recordedBalance());
    }

    public function test_non_admin_cannot_edit_outflow_source_method(): void
    {
        $this->createDonationTransaction(['amount' => 1000000]);
        $creator = User::factory()->create(['role' => 'admin']);
        $outflow = DonationOutflow::create([
            'transaction_number' => 'DK-20260731-SA01',
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'amount' => 100000,
            'payment_method' => 'bank_transfer',
            'destination_account' => 'BSI Operasional',
            'status' => DonationOutflow::STATUS_PENDING,
            'created_by' => $creator->id,
        ]);

        $staf = $this->userWithPermissions([], 'guru');
        $this->actingAs($staf)
            ->put(route('admin.donation-outflows.update', $outflow), [
                'handover_date' => '2026-07-31',
                'donation_source' => 'Donasi Pendidikan',
                'amount' => 100000,
                'payment_method' => 'cash',
            ])
            ->assertForbidden();
    }

    public function test_donasi_masuk_index_and_dashboard_show_same_valid_total(): void
    {
        $this->createDonationTransaction(['status' => 'paid', 'amount' => 1250000, 'payment_method' => 'cash']);
        $this->createDonationTransaction(['status' => 'pending', 'amount' => 999999, 'payment_method' => 'cash']);

        $user = $this->userWithPermissions(['donation.balance.view']);
        $format = number_format(1250000, 0, ',', '.');

        $index = $this->actingAs($user)->get(route('admin.donasi-transactions.index'))->assertOk();
        $this->assertStringContainsString('Rp'.$format, $index->getContent());

        $dashboard = $this->actingAs($user)->get(route('admin.donation.dashboard'))->assertOk();
        $this->assertStringContainsString('Rp'.$format, $dashboard->getContent());
    }

    public function test_user_with_incoming_donation_access_can_see_payment_method_summary_without_balance_permission(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'amount' => 250000]);
        $user = $this->userWithPermissions([], 'kepala_sekolah');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertSee('Metode Pembayaran')
            ->assertSee('Tunai')
            ->assertSee('Rp250.000');
    }

    public function test_incoming_donation_summary_only_contains_valid_incoming_and_no_outflow_data(): void
    {
        $this->createDonationTransaction(['payment_method' => 'cash', 'status' => 'paid', 'amount' => 300000]);
        $this->createDonationTransaction(['payment_method' => 'cash', 'status' => 'pending', 'amount' => 900000]);
        $this->createOutflow([
            'source_payment_method' => 'cash',
            'status' => 'approved',
            'amount' => 125000,
        ]);
        $user = $this->userWithPermissions([], 'admin');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk()
            ->assertViewHas('incomingSummary', function (array $summary) {
                $row = collect($summary['by_payment_method'])->firstWhere('key', 'cash');

                return $summary['total_incoming'] === 300000
                    && $row['incoming'] === 300000
                    && ! array_key_exists('approved_outflow', $row)
                    && ! array_key_exists('recorded_balance', $row);
            })
            ->assertDontSee('Donasi Keluar')
            ->assertDontSee('Saldo Donasi');
    }

    public function test_transactions_index_filters_unclassified(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $null = $this->createDonationTransaction(['payment_method' => null, 'donor_name' => 'Donatur Null']);
        $qris = $this->createDonationTransaction(['payment_method' => 'qris', 'donor_name' => 'Donatur Qris']);

        $response = $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index', ['payment_method' => 'unclassified']))
            ->assertOk();

        $this->assertStringContainsString($null->donor_name, $response->getContent());
        $this->assertStringNotContainsString($qris->donor_name, $response->getContent());
    }

    public function test_transactions_index_summary_follows_date_filter(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $filtered = $this->createDonationTransaction(['amount' => 500000, 'payment_method' => 'cash']);
        $outsideFilter = $this->createDonationTransaction(['amount' => 700000, 'payment_method' => 'cash']);

        $filtered->forceFill(['created_at' => '2026-09-06 10:00:00'])->save();
        $outsideFilter->forceFill(['created_at' => '2026-09-05 10:00:00'])->save();

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index', [
                'date' => '2026-09-06',
                'filter_type' => 'date',
            ]))
            ->assertOk()
            ->assertViewHas('incomingSummary', function (array $summary) {
                $row = collect($summary['by_payment_method'])->firstWhere('key', 'cash');

                return $summary['total_incoming'] === 500000
                    && $row['incoming'] === 500000;
            });
    }

    public function test_transactions_index_summary_follows_payment_method_filter(): void
    {
        $user = $this->userWithPermissions(['donation.balance.view']);
        $this->createDonationTransaction(['amount' => 500000, 'payment_method' => 'cash']);
        $this->createDonationTransaction(['amount' => 700000, 'payment_method' => 'qris']);

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index', ['payment_method' => 'qris']))
            ->assertOk()
            ->assertViewHas('incomingSummary', function (array $summary) {
                $rows = collect($summary['by_payment_method']);

                return $summary['total_incoming'] === 700000
                    && $rows->count() === 1
                    && $rows->first()['key'] === 'qris'
                    && $rows->first()['incoming'] === 700000;
            });
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function createDonationTransaction(array $overrides = []): DonationTransaction
    {
        return DonationTransaction::create(array_merge([
            'order_id' => 'DON-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => 100000,
            'payment_method' => 'bank_transfer',
            'payment_gateway' => 'midtrans',
            'status' => 'paid',
            'paid_at' => now(),
        ], $overrides));
    }

    private function donationAccount(string $name, string $category): DonationAccount
    {
        return DonationAccount::create([
            'name' => $name,
            'category' => $category,
        ]);
    }

    private function createTransfer(int $fromAccountId, int $toAccountId, int $amount, array $overrides = []): DonationTransfer
    {
        return DonationTransfer::create(array_merge([
            'transfer_number' => 'MD-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'transfer_date' => now()->toDateString(),
            'from_account_id' => $fromAccountId,
            'to_account_id' => $toAccountId,
            'amount' => $amount,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => User::factory()->create(['role' => 'admin'])->id,
        ], $overrides));
    }

    private function createOutflow(array $overrides = []): DonationOutflow
    {
        $creator = User::factory()->create(['role' => 'admin']);

        return DonationOutflow::create(array_merge([
            'transaction_number' => 'DK-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Juli 2026',
            'amount' => 1250000,
            'payment_method' => 'bank_transfer',
            'destination_account' => 'BSI Operasional',
            'status' => 'pending',
            'created_by' => $creator->id,
        ], $overrides));
    }

    private function outflowPayload(array $overrides = []): array
    {
        return array_merge([
            'handover_date' => '2026-07-31',
            'donation_source' => 'Donasi Pendidikan',
            'description' => 'Periode Juli 2026',
            'amount' => 1250000,
            'payment_method' => 'bank_transfer',
            'destination_account' => 'BSI Operasional',
        ], $overrides);
    }

    private function editDonationPayload(array $overrides = []): array
    {
        return array_merge([
            'donor_name' => 'Donatur Uji',
            'donor_phone' => '081234567890',
            'donor_email' => 'donatur@example.com',
            'amount' => 100000,
            'donation_date' => '2026-08-03',
            'payment_method' => 'bank_transfer',
            'note' => 'Catatan edit',
        ], $overrides);
    }

    private function userWithPermissions(array $permissionNames, string $roleName = 'staf_keuangan'): User
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
            'donation.balance.view',
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
            $table->foreignId('donation_account_id')->nullable()->constrained('donation_accounts')->nullOnDelete();
            $table->string('order_id')->unique();
            $table->string('donor_name');
            $table->string('donor_whatsapp');
            $table->string('donor_email')->nullable();
            $table->string('support_type');
            $table->unsignedBigInteger('amount');
            $table->string('payment_method')->nullable();
            $table->text('note')->nullable();
            $table->string('payment_gateway')->default('midtrans');
            $table->text('snap_token')->nullable();
            $table->text('snap_redirect_url')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->string('midtrans_payment_type')->nullable();
            $table->string('midtrans_fraud_status')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->json('raw_notification')->nullable();
            $table->timestamps();
        });
        Schema::create('donation_transaction_histories', function ($table) {
            $table->id();
            $table->foreignId('donation_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->json('old_values');
            $table->json('new_values');
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
        Schema::create('donation_item_receipts', function ($table) {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->date('received_date');
            $table->string('donor_name')->nullable();
            $table->string('item_type');
            $table->string('status')->default('received');
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('donation_item_commitments', function ($table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->dateTime('received_at');
            $table->string('donor_name')->nullable();
            $table->string('item_type');
            $table->string('status')->default('pending');
            $table->foreignId('received_receipt_id')->nullable()->constrained('donation_item_receipts')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
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
