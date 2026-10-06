<?php

namespace Tests\Feature\Admin;

use App\Models\DonationTransaction;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationTransactionAccessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedRoles();
        $this->seed(\Database\Seeders\PermissionSeeder::class);
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

    // ========================================================================
    // DEFAULT ACCESS (staf_tata_usaha view + manage)
    // ========================================================================

    public function test_staf_tata_usaha_can_view_donasi_masuk_list_and_detail(): void
    {
        $tx = $this->createTransaction();
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.show', $tx))
            ->assertOk();
    }

    public function test_staf_tata_usaha_can_open_create_receipt_page(): void
    {
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.create-receipt'))
            ->assertOk();
    }

    public function test_staf_tata_usaha_can_store_receipt(): void
    {
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload())
            ->assertRedirect();

        $this->assertSame(1, DonationTransaction::count());
    }

    public function test_staf_tata_usaha_can_mark_paid(): void
    {
        $tx = $this->createTransaction(['status' => 'pending']);
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.mark-paid', $tx))
            ->assertRedirect();

        $this->assertSame('paid', $tx->fresh()->status);
    }

    // ========================================================================
    // READ-ONLY MODE (baca_saja: view granted, manage revoked)
    // ========================================================================

    public function test_read_only_staf_tata_usaha_cannot_create_receipt(): void
    {
        $this->makeStafTuReadOnly();
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.create-receipt'))
            ->assertForbidden();

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload())
            ->assertForbidden();

        $this->assertSame(0, DonationTransaction::count());
    }

    public function test_read_only_staf_tata_usaha_still_can_view_list_and_detail(): void
    {
        $this->makeStafTuReadOnly();
        $tx = $this->createTransaction();
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertOk();

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.show', $tx))
            ->assertOk();
    }

    public function test_read_only_staf_tata_usaha_does_not_see_create_button(): void
    {
        $this->makeStafTuReadOnly();
        $this->createTransaction();
        $user = $this->createUser('staf_tata_usaha');

        $html = $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->getContent();

        $this->assertStringNotContainsString('Buat Bukti Penerimaan', $html);
    }

    // ========================================================================
    // NEGATIVE CASES
    // ========================================================================

    public function test_role_without_donation_permission_cannot_access_index(): void
    {
        $this->createTransaction();
        $user = $this->createUser('guru');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->assertForbidden();
    }

    public function test_staf_tata_usaha_cannot_access_superadmin_only_routes(): void
    {
        $tx = $this->createTransaction();
        $user = $this->createUser('staf_tata_usaha');

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $tx), ['payment_method' => 'qris'])
            ->assertForbidden();

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.edit', $tx))
            ->assertForbidden();

        $this->actingAs($user)
            ->delete(route('admin.donasi-transactions.destroy', $tx))
            ->assertForbidden();

        $this->assertDatabaseHas('donation_transactions', ['id' => $tx->id]);
    }

    public function test_staf_tata_usaha_with_manage_sees_create_button(): void
    {
        $this->createTransaction();
        $user = $this->createUser('staf_tata_usaha');

        $html = $this->actingAs($user)
            ->get(route('admin.donasi-transactions.index'))
            ->getContent();

        $this->assertStringContainsString('Buat Bukti Penerimaan', $html);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function makeStafTuReadOnly(): void
    {
        $manage = Permission::where('name', 'donation.transactions.manage')->firstOrFail();
        $role = Role::where('name', 'staf_tata_usaha')->firstOrFail();

        DB::table('permission_role')
            ->where('permission_id', $manage->id)
            ->where('role_id', $role->id)
            ->delete();
    }

    private function createUser(string $roleName): User
    {
        $user = User::factory()->create(['role' => $roleName]);
        $user->roles()->attach(Role::where('name', $roleName)->firstOrFail()->id);

        return $user;
    }

    private function createTransaction(array $overrides = []): DonationTransaction
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

    private function receiptPayload(array $overrides = []): array
    {
        return array_merge([
            'confirmation_message' => '',
            'donor_name' => 'Budi',
            'allow_future_donation_contact' => 'Tidak',
            'donor_whatsapp' => '-',
            'nominal_amount' => 'Rp50.000',
            'admin_fee' => 'Rp0',
            'use_unique_code' => 'Tidak',
            'unique_code' => '',
            'payment_method' => 'bank_transfer',
            'transfer_date' => '01/08/2026',
            'note' => '-',
        ], $overrides);
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

        Schema::create('permissions', function ($table) {
            $table->id();
            $table->string('name', 150)->unique();
            $table->string('module', 100);
            $table->string('action', 50);
            $table->string('display_name', 200);
            $table->text('description')->nullable();
            $table->string('group_name', 100);
            $table->string('guard_name', 30)->default('web');
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('permission_role', function ($table) {
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
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
