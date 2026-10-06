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
use App\Services\DonationTransferApprovalService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class DonationTransferModuleTest extends TestCase
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

    public function test_staf_keuangan_with_view_permission_can_open_index_and_detail(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $transfer = $this->createTransfer();

        $this->actingAs($staf)
            ->get(route('admin.donation-transfers.index'))
            ->assertOk()
            ->assertSee('Mutasi Dana Donasi');

        $this->actingAs($staf)
            ->get(route('admin.donation-transfers.show', $transfer))
            ->assertOk()
            ->assertSee($transfer->transfer_number);
    }

    public function test_user_without_view_permission_is_denied(): void
    {
        $user = $this->userWithPermissions([]);

        $this->actingAs($user)
            ->get(route('admin.donation-transfers.index'))
            ->assertForbidden();
    }

    public function test_index_without_filter_shows_all_transfers(): void
    {
        $user = $this->userWithPermissions(['donation.transfers.view']);
        $pending = $this->createTransfer(['status' => DonationTransfer::STATUS_PENDING]);
        $approved = $this->createTransfer(['status' => DonationTransfer::STATUS_APPROVED]);
        $rejected = $this->createTransfer(['status' => DonationTransfer::STATUS_REJECTED]);

        $this->actingAs($user)
            ->get(route('admin.donation-transfers.index'))
            ->assertOk()
            ->assertSee($pending->transfer_number)
            ->assertSee($approved->transfer_number)
            ->assertSee($rejected->transfer_number);
    }

    public function test_status_filter_shows_only_selected_status(): void
    {
        $user = $this->userWithPermissions(['donation.transfers.view']);
        $pending = $this->createTransfer(['status' => DonationTransfer::STATUS_PENDING]);
        $approved = $this->createTransfer(['status' => DonationTransfer::STATUS_APPROVED]);

        $this->actingAs($user)
            ->get(route('admin.donation-transfers.index', ['status' => 'approved']))
            ->assertOk()
            ->assertSee($approved->transfer_number)
            ->assertDontSee($pending->transfer_number);
    }

    public function test_search_by_transfer_number_works(): void
    {
        $user = $this->userWithPermissions(['donation.transfers.view']);
        $first = $this->createTransfer();
        $second = $this->createTransfer();

        $this->actingAs($user)
            ->get(route('admin.donation-transfers.index', ['search' => $first->transfer_number]))
            ->assertOk()
            ->assertSee($first->transfer_number)
            ->assertDontSee($second->transfer_number);
    }

    public function test_admin_can_open_create_page_and_sees_account_options_with_balance(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $finance = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($tunai->id, 100000);

        $this->actingAs($admin)
            ->get(route('admin.donation-transfers.create'))
            ->assertOk()
            ->assertSee('Tunai Donasi')
            ->assertSee('Saldo tersedia')
            ->assertSee('Kas Sekolah');
    }

    public function test_transfer_is_created_pending_with_generated_number_and_requested_by(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $to->id, 50000))
            ->assertRedirect(route('admin.donation-transfers.show', DonationTransfer::sole()));

        $this->assertDatabaseHas('donation_transfers', [
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $admin->id,
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
        ]);
        $this->assertStringStartsWith('MD-', DonationTransfer::sole()->transfer_number);
    }

    public function test_store_stores_proof_file_and_note(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), array_merge(
                $this->transferPayload($from->id, $to->id, 50000, ['note' => 'Mutasi tunai harian']),
                ['proof_file' => UploadedFile::fake()->image('bukti.jpg')]
            ))
            ->assertRedirect();

        $transfer = DonationTransfer::sole();
        $this->assertSame('Mutasi tunai harian', $transfer->note);
        $this->assertStringContainsString('donation/transfer-proofs/', $transfer->proof_file);
        Storage::disk('public')->assertExists($transfer->proof_file);
    }

    public function test_store_rejects_when_source_account_is_not_donation(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $financeFrom = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $financeTo = DonationAccount::create(['name' => 'Rekening BSI', 'category' => 'finance']);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($financeFrom->id, $financeTo->id, 50000))
            ->assertSessionHasErrors('from_account_id');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    public function test_store_rejects_when_destination_account_is_not_finance(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation']);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $to->id, 50000))
            ->assertSessionHasErrors('to_account_id');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    public function test_store_rejects_amount_exceeding_available_balance(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $to->id, 150000))
            ->assertSessionHasErrors('amount');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    public function test_store_rejects_when_source_equals_destination(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $from->id, 50000))
            ->assertSessionHasErrors('to_account_id');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    public function test_available_balance_excludes_pending_outgoing_transfers(): void
    {
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 30000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);

        $this->assertSame(100000, $service->balanceByAccount($from->id));
        $this->assertSame(30000, $service->pendingTransferAmountForAccount($from->id));
        $this->assertSame(70000, $service->availableBalanceForAccount($from->id));
    }

    public function test_approval_sets_approver_and_updates_account_balances(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_APPROVED,
            'approved_by' => $approver->id,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(60000, $service->balanceByAccount($from->id));
        $this->assertSame(40000, $service->balanceByAccount($to->id));
    }

    public function test_approval_rejects_when_source_balance_insufficient(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 10000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        try {
            app(DonationTransferApprovalService::class)->approve($transfer, $approver);
            $this->fail('Approval seharusnya ditolak karena saldo tidak mencukupi.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('status', $e->errors());
            $this->assertDatabaseHas('donation_transfers', [
                'id' => $transfer->id,
                'status' => DonationTransfer::STATUS_PENDING,
            ]);
        }
    }

    public function test_approval_is_not_blocked_by_own_pending_reservation(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 70000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 30000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(30000, $service->balanceByAccount($from->id));
        $this->assertSame(70000, $service->balanceByAccount($to->id));
    }

    public function test_approval_still_blocks_over_allocation_from_other_pending(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 70000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        try {
            app(DonationTransferApprovalService::class)->approve($transfer, $approver);
            $this->fail('Approval seharusnya ditolak karena total pending melebihi saldo akun.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('status', $e->errors());
            $this->assertDatabaseHas('donation_transfers', [
                'id' => $transfer->id,
                'status' => DonationTransfer::STATUS_PENDING,
            ]);
        }
    }

    public function test_approval_with_same_nominal_pendings_excludes_only_self(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 50000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $sameAmount = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 50000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(50000, $service->availableBalanceForApproval($from->id, $transfer->id));
        $this->assertSame(50000, $service->availableBalanceForApproval($from->id, $sameAmount->id));

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);
        $this->assertSame(50000, $service->balanceByAccount($from->id));
        $this->assertSame(50000, $service->balanceByAccount($to->id));
    }

    public function test_approval_over_allocation_with_same_nominal_still_rejected(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(20000, $service->availableBalanceForApproval($from->id, $transfer->id));

        try {
            app(DonationTransferApprovalService::class)->approve($transfer, $approver);
            $this->fail('Approval seharusnya ditolak karena total pending melebihi saldo akun.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('status', $e->errors());
            $this->assertDatabaseHas('donation_transfers', [
                'id' => $transfer->id,
                'status' => DonationTransfer::STATUS_PENDING,
            ]);
        }
    }

    public function test_approved_transfer_cannot_be_approved_twice(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $service = app(DonationTransferApprovalService::class);
        $service->approve($transfer, $approver);

        try {
            $service->approve($transfer->fresh(), $approver);
            $this->fail('Approval kedua seharusnya ditolak.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('donation_transfers', 1);
        }
    }

    public function test_creator_cannot_approve_own_transfer(): void
    {
        $creator = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $creator->id,
        ]);

        $this->actingAs($creator)
            ->post(route('admin.donation-transfers.approve', $transfer))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
    }

    public function test_non_finance_user_with_approve_permission_cannot_approve(): void
    {
        $user = $this->userWithPermissions(['donation.transfers.approve']);
        $transfer = $this->createTransfer();

        $this->actingAs($user)
            ->post(route('admin.donation-transfers.approve', $transfer))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
    }

    public function test_user_with_create_permission_but_without_approve_cannot_approve(): void
    {
        $user = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->actingAs($user)
            ->post(route('admin.donation-transfers.approve', $transfer))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
    }

    public function test_staf_keuangan_can_approve_via_route(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->actingAs($staf)
            ->post(route('admin.donation-transfers.approve', $transfer))
            ->assertRedirect(route('admin.donation-transfers.show', $transfer));

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_APPROVED,
            'approved_by' => $staf->id,
        ]);
    }

    public function test_superadmin_cannot_approve_own_transfer(): void
    {
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        $role = Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['display_name' => 'Superadmin', 'guard_name' => 'web', 'is_active' => true]
        );
        $superadmin->roles()->attach($role->id);

        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $superadmin->id,
        ]);

        $this->actingAs($superadmin)
            ->post(route('admin.donation-transfers.approve', $transfer))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
    }

    public function test_rejection_requires_and_saves_reason(): void
    {
        $rejector = $this->userWithRoleTransferDefaults('staf_keuangan');
        $transfer = $this->createTransfer();

        $this->actingAs($rejector)
            ->post(route('admin.donation-transfers.reject', $transfer), [])
            ->assertSessionHasErrors('rejection_reason');

        $this->actingAs($rejector)
            ->post(route('admin.donation-transfers.reject', $transfer), [
                'rejection_reason' => 'Nominal belum sesuai bukti.',
            ])
            ->assertRedirect(route('admin.donation-transfers.show', $transfer));

        $this->assertDatabaseHas('donation_transfers', [
            'id' => $transfer->id,
            'status' => DonationTransfer::STATUS_REJECTED,
            'rejected_by' => $rejector->id,
            'rejection_reason' => 'Nominal belum sesuai bukti.',
        ]);
    }

    public function test_rejected_transfer_cannot_be_approved(): void
    {
        $rejector = $this->userWithRoleTransferDefaults('staf_keuangan');
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->actingAs($rejector)
            ->post(route('admin.donation-transfers.reject', $transfer), [
                'rejection_reason' => 'Ditolak.',
            ]);

        try {
            app(DonationTransferApprovalService::class)->approve($transfer->fresh(), $approver);
            $this->fail('Transaksi rejected seharusnya tidak dapat disetujui.');
        } catch (ValidationException) {
            $this->assertDatabaseHas('donation_transfers', [
                'id' => $transfer->id,
                'status' => DonationTransfer::STATUS_REJECTED,
            ]);
        }
    }

    public function test_rejection_does_not_change_account_balances(): void
    {
        $rejector = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->actingAs($rejector)
            ->post(route('admin.donation-transfers.reject', $transfer), [
                'rejection_reason' => 'Nominal tidak sesuai bukti.',
            ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(100000, $service->balanceByAccount($from->id));
        $this->assertSame(0, $service->balanceByAccount($to->id));
        $this->assertSame(100000, $service->availableBalanceForAccount($from->id));
    }

    public function test_approval_creates_one_finance_income_with_correct_fields(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash']);
        $to = DonationAccount::create(['name' => 'Rekening Keuangan', 'category' => 'finance', 'type' => 'bank_transfer']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'transfer_date' => '2026-08-10',
            'note' => 'Mutasi operasional',
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseCount('finance_incomes', 1);
        $this->assertDatabaseHas('finance_incomes', [
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'income_type' => 'Transfer dari Donasi',
            'amount' => 40000,
            'date' => '2026-08-10',
            'payment_method' => 'Transfer Bank',
            'source_name' => 'Tunai Donasi',
            'created_by' => $approver->id,
        ]);

        $income = FinanceIncome::where('donation_transfer_id', $transfer->id)->first();
        $this->assertStringContainsString($transfer->transfer_number, $income->description);
        $this->assertStringContainsString('Tunai Donasi', $income->description);
        $this->assertStringContainsString('Rekening Keuangan', $income->description);
        $this->assertStringContainsString('Mutasi operasional', $income->description);
    }

    public function test_approval_sets_finance_account_id_from_destination_account(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris']);
        $to = DonationAccount::create(['name' => 'Rekening Keuangan', 'category' => 'finance', 'type' => 'bank_transfer']);
        $this->createIncomingDonation($from->id, 500000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 500000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseHas('finance_incomes', [
            'donation_transfer_id' => $transfer->id,
            'finance_account_id' => $to->id,
            'payment_method' => 'Transfer Bank',
            'amount' => 500000,
            'income_type' => 'Transfer dari Donasi',
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(500000, $service->financeBalanceByAccount($to->id));
        $this->assertSame([$to->id => 500000], $service->financeAccountBalances());
    }

    public function test_expense_after_approval_can_use_finance_balance(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris']);
        $to = DonationAccount::create(['name' => 'Rekening Keuangan', 'category' => 'finance', 'type' => 'bank_transfer']);
        $this->createIncomingDonation($from->id, 500000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 500000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertSame(500000, app(DonationBalanceService::class)->financeBalanceByAccount($to->id));

        FinanceExpense::create([
            'date' => '2026-08-10',
            'expense_category' => 'Listrik',
            'amount' => 300000,
            'paid_to' => 'PLN',
            'finance_account_id' => $to->id,
            'payment_method' => $to->financePaymentMethodLabel(),
            'description' => 'Pakai dana hasil mutasi',
            'created_by' => $approver->id,
        ]);

        $this->assertSame(200000, app(DonationBalanceService::class)->financeBalanceByAccount($to->id));
        $this->assertSame(200000, (int) (FinanceIncome::sum('amount') - FinanceExpense::sum('amount')));
    }

    public function test_approval_maps_tunai_finance_account_to_tunai_payment_method(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash']);
        $to = DonationAccount::create(['name' => 'Tunai Keuangan', 'category' => 'finance', 'type' => 'cash']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 30000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertDatabaseHas('finance_incomes', [
            'donation_transfer_id' => $transfer->id,
            'payment_method' => 'Tunai',
        ]);
    }

    public function test_approval_twice_creates_only_one_finance_income(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        $service = app(DonationTransferApprovalService::class);
        $service->approve($transfer, $approver);

        try {
            $service->approve($transfer->fresh(), $approver);
            $this->fail('Approval kedua seharusnya ditolak.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('finance_incomes', 1);
        }
    }

    public function test_rejection_creates_no_finance_income(): void
    {
        $rejector = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $this->actingAs($rejector)
            ->post(route('admin.donation-transfers.reject', $transfer), [
                'rejection_reason' => 'Nominal tidak sesuai bukti.',
            ]);

        $this->assertDatabaseCount('finance_incomes', 0);
    }

    public function test_approval_with_insufficient_balance_creates_no_finance_income(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 50000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 60000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        try {
            app(DonationTransferApprovalService::class)->approve($transfer, $approver);
            $this->fail('Approval dengan saldo kurang seharusnya ditolak.');
        } catch (ValidationException) {
            $this->assertDatabaseCount('finance_incomes', 0);
            $this->assertDatabaseHas('donation_transfers', [
                'id' => $transfer->id,
                'status' => DonationTransfer::STATUS_PENDING,
            ]);
        }
    }

    public function test_approval_increases_finance_balance_and_decreases_donation_active_balance(): void
    {
        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Rekening Keuangan', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);

        $service = app(DonationBalanceService::class);
        $this->assertSame(0, (int) FinanceIncome::sum('amount'));
        $this->assertSame(100000, $service->activeDonationBalance());
        $this->assertSame(100000, $service->recordedBalance());

        app(DonationTransferApprovalService::class)->approve($transfer, $approver);

        $this->assertSame(1, FinanceIncome::count());
        $this->assertSame(40000, (int) FinanceIncome::sum('amount'));
        $this->assertSame(0, (int) FinanceExpense::sum('amount'));
        $this->assertSame(40000, $service->balanceByAccount($to->id));
        $this->assertSame(60000, $service->balanceByAccount($from->id));
        $this->assertSame(60000, $service->activeDonationBalance());
        $this->assertSame(60000, $service->recordedBalance());
        $this->assertSame(40000, (int) FinanceIncome::sum('amount') - (int) FinanceExpense::sum('amount'));
    }

    public function test_transfer_integrated_income_is_read_only_in_finance_module(): void
    {
        $superadmin = User::factory()->create(['role' => 'superadmin']);
        $role = Role::firstOrCreate(
            ['name' => 'superadmin'],
            ['display_name' => 'Superadmin', 'guard_name' => 'web', 'is_active' => true]
        );
        $superadmin->roles()->attach($role->id);

        $approver = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        app(DonationTransferApprovalService::class)->approve($transfer, $approver);
        $income = FinanceIncome::where('donation_transfer_id', $transfer->id)->firstOrFail();

        $this->actingAs($superadmin)
            ->get(route('admin.finance.incomes.edit', $income))
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->put(route('admin.finance.incomes.update', $income), [
                'date' => '2026-08-01',
                'amount' => 999999,
                'payment_method' => 'Tunai',
                'source_name' => 'Diubah',
                'description' => 'Diubah',
            ])
            ->assertForbidden();

        $this->actingAs($superadmin)
            ->delete(route('admin.finance.incomes.destroy', $income))
            ->assertForbidden();

        $this->assertDatabaseHas('finance_incomes', ['id' => $income->id, 'amount' => 40000]);
        $this->assertDatabaseHas('donation_transfers', ['id' => $transfer->id, 'status' => DonationTransfer::STATUS_APPROVED]);
    }

    public function test_incomes_index_shows_mutasi_donasi_badge_and_transfer_reference(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 100000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 40000,
            'status' => DonationTransfer::STATUS_PENDING,
        ]);
        app(DonationTransferApprovalService::class)->approve($transfer, $staf);

        $this->actingAs($staf)
            ->get(route('admin.finance.incomes.index'))
            ->assertOk()
            ->assertSee('Mutasi Donasi')
            ->assertSee($transfer->transfer_number);
    }

    public function test_finance_dashboard_lists_pending_transfers(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Mutasi Dana Menunggu Verifikasi')
            ->assertSee($transfer->transfer_number);
    }

    public function test_finance_dashboard_does_not_list_approved_or_rejected_transfers(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $approved = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
            'status' => DonationTransfer::STATUS_APPROVED,
        ]);
        $rejected = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 50000,
            'status' => DonationTransfer::STATUS_REJECTED,
        ]);

        $response = $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk();

        $this->assertStringNotContainsString($approved->transfer_number, $response->getContent());
        $this->assertStringNotContainsString($rejected->transfer_number, $response->getContent());
    }

    public function test_finance_dashboard_shows_source_and_destination_accounts(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Tunai Donasi')
            ->assertSee('Kas Sekolah');
    }

    public function test_finance_dashboard_shows_requester(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $requester = User::factory()->create(['role' => 'admin', 'name' => 'Bendahara Pengaju']);
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
            'requested_by' => $requester->id,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Bendahara Pengaju');
    }

    public function test_finance_dashboard_detail_link_points_to_transfer_show(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee(route('admin.donation-transfers.show', $transfer))
            ->assertSee(route('admin.donation-transfers.index'));
    }

    public function test_staf_keuangan_can_see_pending_queue_on_finance_dashboard(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);

        $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee('Mutasi Dana Menunggu Verifikasi');
    }

    public function test_finance_dashboard_shows_no_approval_action_without_permission(): void
    {
        $admin = $this->userWithRoleTransferDefaults('admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $transfer = $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.finance.dashboard'))
            ->assertOk()
            ->assertSee($transfer->transfer_number)
            ->assertDontSee('Setujui / ACC')
            ->assertDontSee('Tolak');
    }

    public function test_finance_dashboard_main_balance_unchanged_by_pending_transfer(): void
    {
        $staf = $this->userWithRoleTransferDefaults('staf_keuangan');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);
        $this->createTransfer([
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
        ]);
        FinanceIncome::create([
            'date' => now()->toDateString(),
            'income_type' => 'Dana Operasional',
            'amount' => 150000,
            'payment_method' => 'Transfer Bank',
            'finance_account_id' => $to->id,
            'created_by' => $staf->id,
        ]);

        $response = $this->actingAs($staf)
            ->get(route('admin.finance.dashboard'))
            ->assertOk();

        $this->assertStringContainsString('150.000', $response->getContent());
        $this->assertStringNotContainsString('Rp 250.000', $response->getContent());
    }

    public function test_store_rejects_when_source_account_is_inactive(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation', 'is_active' => false]);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance']);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $to->id, 50000))
            ->assertSessionHasErrors('from_account_id');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    public function test_store_rejects_when_destination_account_is_inactive(): void
    {
        $admin = $this->userWithPermissions(['donation.transfers.create'], 'admin');
        $from = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Kas Sekolah', 'category' => 'finance', 'is_active' => false]);
        $this->createIncomingDonation($from->id, 200000);

        $this->actingAs($admin)
            ->post(route('admin.donation-transfers.store'), $this->transferPayload($from->id, $to->id, 50000))
            ->assertSessionHasErrors('to_account_id');

        $this->assertDatabaseCount('donation_transfers', 0);
    }

    private function userWithRoleTransferDefaults(string $roleName): User
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
            if (str_starts_with($perm['name'], 'donation.transfers.')
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
            'donation.transfers.view',
            'donation.transfers.create',
            'donation.transfers.approve',
            'donation.transfers.reject',
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
        $data = array_merge([
            'transfer_number' => 'MD-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'transfer_date' => now()->toDateString(),
            'amount' => 100000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => User::factory()->create(['role' => 'admin'])->id,
        ], $overrides);

        if (! isset($data['from_account_id'])) {
            $data['from_account_id'] = DonationAccount::create([
                'name' => 'Tunai Donasi '.strtoupper(uniqid()),
                'category' => 'donation',
            ])->id;
        }

        if (! isset($data['to_account_id'])) {
            $data['to_account_id'] = DonationAccount::create([
                'name' => 'Kas Sekolah '.strtoupper(uniqid()),
                'category' => 'finance',
            ])->id;
        }

        return DonationTransfer::create($data);
    }

    private function createIncomingDonation(int $accountId, int $amount): DonationTransaction
    {
        return DonationTransaction::create([
            'donation_account_id' => $accountId,
            'order_id' => 'DON-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan',
            'amount' => $amount,
            'payment_method' => 'bank_transfer',
            'payment_gateway' => 'manual',
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    private function transferPayload(int $fromId, int $toId, float $amount, array $overrides = []): array
    {
        return array_merge([
            'transfer_date' => now()->toDateString(),
            'from_account_id' => $fromId,
            'to_account_id' => $toId,
            'amount' => $amount,
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
