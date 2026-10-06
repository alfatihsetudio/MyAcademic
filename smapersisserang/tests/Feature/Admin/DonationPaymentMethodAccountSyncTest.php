<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationTransaction;
use App\Models\Role;
use App\Models\User;
use App\Services\DonationAccountResolver;
use App\Services\DonationBalanceService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Sinkronisasi payment_method <-> donation_account_id pada seluruh jalur tulis
 * DonationTransaction, plus data-fix migration untuk baris mismatch.
 */
class DonationPaymentMethodAccountSyncTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->seedDonationAccounts();
    }

    protected function tearDown(): void
    {
        foreach ([
            'donation_transaction_histories',
            'donation_transfers',
            'donation_outflows',
            'donation_transactions',
            'donation_accounts',
            'role_user',
            'roles',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    // ========================================================================
    // RESOLVER
    // ========================================================================

    public function test_resolver_maps_payment_method_to_donation_account_by_type(): void
    {
        $resolver = app(DonationAccountResolver::class);
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();
        $transfer = DonationAccount::where('type', 'bank_transfer')->where('category', 'donation')->firstOrFail();

        $this->assertSame($tunai->id, $resolver->resolveDonationAccountId('cash'));
        $this->assertSame($qris->id, $resolver->resolveDonationAccountId('qris'));
        $this->assertSame($transfer->id, $resolver->resolveDonationAccountId('bank_transfer'));
    }

    public function test_resolver_returns_null_for_other_and_null_when_no_other_account(): void
    {
        $resolver = app(DonationAccountResolver::class);

        $this->assertNull($resolver->resolveDonationAccountId('other'));
        $this->assertNull($resolver->resolveDonationAccountId(null));
    }

    public function test_resolver_maps_other_and_null_to_other_account_when_available(): void
    {
        $other = DonationAccount::create([
            'name' => 'Lainnya Donasi',
            'category' => 'donation',
            'type' => 'other',
        ]);

        $resolver = app(DonationAccountResolver::class);

        $this->assertSame($other->id, $resolver->resolveDonationAccountId('other'));
        $this->assertSame($other->id, $resolver->resolveDonationAccountId(null));
    }

    // ========================================================================
    // STORE RECEIPT
    // ========================================================================

    public function test_store_receipt_never_leaves_donation_account_null(): void
    {
        $user = $this->superadmin();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();

        foreach (['cash', 'qris', 'bank_transfer'] as $method) {
            $this->actingAs($user)
                ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                    'payment_method' => $method,
                ]))
                ->assertRedirect();

            $transaction = DonationTransaction::where('payment_method', $method)->latest('id')->first();
            $this->assertNotNull($transaction);
            $this->assertNotNull($transaction->donation_account_id, "storeReceipt $method harus mengisi donation_account_id");
        }

        $this->assertSame($qris->id, DonationTransaction::where('payment_method', 'qris')->latest('id')->first()->donation_account_id);
    }

    // ========================================================================
    // EDIT (update) -> payment_method berubah, akun ikut berpindah
    // ========================================================================

    public function test_edit_changing_payment_method_moves_donation_account(): void
    {
        $user = $this->superadmin();
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();

        $transaction = $this->createTransaction([
            'payment_method' => 'cash',
            'donation_account_id' => $tunai->id,
            'amount' => 500000,
            'status' => 'paid',
        ]);

        $this->actingAs($user)
            ->put(route('admin.donasi-transactions.update', $transaction), [
                'donor_name' => 'Donatur Uji',
                'donor_phone' => '081234567890',
                'donor_email' => 'donatur@example.com',
                'amount' => 750000,
                'donation_date' => '2026-08-03',
                'payment_method' => 'qris',
                'note' => 'pindah ke qris',
            ])
            ->assertRedirect();

        $transaction->refresh();
        $this->assertSame('qris', $transaction->payment_method);
        $this->assertSame($qris->id, $transaction->donation_account_id);
        $this->assertNotSame($tunai->id, $transaction->donation_account_id);
    }

    // ========================================================================
    // updatePaymentMethod -> akun ikut berpindah dalam transaction yang sama
    // ========================================================================

    public function test_update_payment_method_moves_donation_account(): void
    {
        $user = $this->superadmin();
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();

        $transaction = $this->createTransaction([
            'payment_method' => 'qris',
            'donation_account_id' => $qris->id,
            'amount' => 500000,
            'status' => 'settlement',
        ]);

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $transaction), ['payment_method' => 'cash'])
            ->assertRedirect()
            ->assertSessionHas('success');

        $transaction->refresh();
        $this->assertSame('cash', $transaction->payment_method);
        $this->assertSame($tunai->id, $transaction->donation_account_id);
        $this->assertNotSame($qris->id, $transaction->donation_account_id);

        $history = $transaction->histories()->sole();
        $this->assertSame('payment_method_updated', $history->action);
        $this->assertSame('qris', $history->old_values['payment_method']);
        $this->assertSame($qris->id, $history->old_values['donation_account_id']);
        $this->assertSame('cash', $history->new_values['payment_method']);
        $this->assertSame($tunai->id, $history->new_values['donation_account_id']);
    }

    public function test_update_payment_method_reset_to_null_clears_donation_account(): void
    {
        $user = $this->superadmin();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();

        $transaction = $this->createTransaction([
            'payment_method' => 'qris',
            'donation_account_id' => $qris->id,
        ]);

        $this->actingAs($user)
            ->patch(route('admin.donasi-transactions.payment-method', $transaction), ['payment_method' => ''])
            ->assertRedirect();

        $transaction->refresh();
        $this->assertNull($transaction->payment_method);
        $this->assertNull($transaction->donation_account_id);
    }

    // ========================================================================
    // REKONSILIASI: incoming per payment_method == incoming per donation_account
    // ========================================================================

    public function test_incoming_by_payment_method_matches_incoming_by_account(): void
    {
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();
        $transfer = DonationAccount::where('type', 'bank_transfer')->where('category', 'donation')->firstOrFail();

        $this->createTransaction(['payment_method' => 'cash', 'donation_account_id' => $tunai->id, 'amount' => 100000, 'status' => 'paid']);
        $this->createTransaction(['payment_method' => 'cash', 'donation_account_id' => $tunai->id, 'amount' => 25000, 'status' => 'settlement']);
        $this->createTransaction(['payment_method' => 'qris', 'donation_account_id' => $qris->id, 'amount' => 300000, 'status' => 'paid']);
        $this->createTransaction(['payment_method' => 'qris', 'donation_account_id' => $qris->id, 'amount' => 900000, 'status' => 'pending']);
        $this->createTransaction(['payment_method' => 'bank_transfer', 'donation_account_id' => $transfer->id, 'amount' => 400000, 'status' => 'capture']);

        $service = app(DonationBalanceService::class);

        $this->assertSame(125000, $service->summaryByPaymentMethod()['cash']['incoming']);
        $this->assertSame(300000, $service->summaryByPaymentMethod()['qris']['incoming']);
        $this->assertSame(400000, $service->summaryByPaymentMethod()['bank_transfer']['incoming']);

        $perAccount = $service->incomingPerAccount();
        $this->assertSame(125000, $perAccount[$tunai->id]);
        $this->assertSame(300000, $perAccount[$qris->id]);
        $this->assertSame(400000, $perAccount[$transfer->id]);

        $this->assertSame($service->totalIncoming(), array_sum($perAccount));
        $this->assertSame(
            $service->totalIncoming(),
            collect($service->summaryByPaymentMethod())->sum('incoming')
        );
    }

    // ========================================================================
    // DATA-FIX MIGRATION
    // ========================================================================

    public function test_migration_fixes_mismatched_rows_to_correct_account(): void
    {
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();
        $transfer = DonationAccount::where('type', 'bank_transfer')->where('category', 'donation')->firstOrFail();

        $this->createTransaction(['order_id' => 'fix-qris-wrong', 'payment_method' => 'qris', 'donation_account_id' => $tunai->id]);
        $this->createTransaction(['order_id' => 'fix-cash-null', 'payment_method' => 'cash', 'donation_account_id' => null]);
        $this->createTransaction(['order_id' => 'fix-transfer-wrong', 'payment_method' => 'bank_transfer', 'donation_account_id' => $qris->id]);
        $this->createTransaction(['order_id' => 'fix-correct', 'payment_method' => 'cash', 'donation_account_id' => $tunai->id]);

        $this->runMigration();

        $this->assertSame($qris->id, $this->accountIdFor('fix-qris-wrong'));
        $this->assertSame($tunai->id, $this->accountIdFor('fix-cash-null'));
        $this->assertSame($transfer->id, $this->accountIdFor('fix-transfer-wrong'));
        $this->assertSame($tunai->id, $this->accountIdFor('fix-correct'));
    }

    public function test_migration_does_not_put_null_or_other_into_tunai(): void
    {
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();

        $this->createTransaction(['order_id' => 'fix-null-fallback', 'payment_method' => null, 'donation_account_id' => $tunai->id]);
        $this->createTransaction(['order_id' => 'fix-other-fallback', 'payment_method' => 'other', 'donation_account_id' => $tunai->id]);

        $this->runMigration();

        $this->assertNull($this->accountIdFor('fix-null-fallback'));
        $this->assertNull($this->accountIdFor('fix-other-fallback'));
    }

    public function test_migration_maps_null_and_other_to_other_account_when_available(): void
    {
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $other = DonationAccount::create([
            'name' => 'Lainnya Donasi',
            'category' => 'donation',
            'type' => 'other',
        ]);

        $this->createTransaction(['order_id' => 'fix-null-to-other', 'payment_method' => null, 'donation_account_id' => $tunai->id]);
        $this->createTransaction(['order_id' => 'fix-other-to-other', 'payment_method' => 'other', 'donation_account_id' => $tunai->id]);

        $this->runMigration();

        $this->assertSame($other->id, $this->accountIdFor('fix-null-to-other'));
        $this->assertSame($other->id, $this->accountIdFor('fix-other-to-other'));
    }

    public function test_migration_is_idempotent(): void
    {
        $tunai = DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();

        $this->createTransaction(['order_id' => 'idem-qris', 'payment_method' => 'qris', 'donation_account_id' => $tunai->id]);
        $this->createTransaction(['order_id' => 'idem-cash', 'payment_method' => 'cash', 'donation_account_id' => $tunai->id]);

        $this->runMigration();
        $first = [$this->accountIdFor('idem-qris'), $this->accountIdFor('idem-cash')];

        $this->runMigration();
        $second = [$this->accountIdFor('idem-qris'), $this->accountIdFor('idem-cash')];

        $this->assertSame([$qris->id, $tunai->id], $first);
        $this->assertSame($first, $second);
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    private function runMigration(): void
    {
        $migration = require database_path('migrations/2026_08_11_000007_sync_donation_account_id_with_payment_method.php');
        $migration->up();
    }

    private function accountIdFor(string $orderId): ?int
    {
        $id = DB::table('donation_transactions')
            ->where('order_id', $orderId)
            ->value('donation_account_id');

        return $id === null ? null : (int) $id;
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
            'payment_gateway' => 'manual-qris',
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

    private function superadmin(): User
    {
        $role = Role::firstOrCreate([
            'name' => 'superadmin',
        ], [
            'display_name' => 'Superadmin',
            'guard_name' => 'web',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['role' => 'superadmin']);
        $user->roles()->attach($role);

        return $user;
    }

    private function seedDonationAccounts(): void
    {
        foreach ([
            ['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash'],
            ['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris'],
            ['name' => 'Transfer Donasi', 'category' => 'donation', 'type' => 'bank_transfer'],
        ] as $account) {
            DonationAccount::updateOrCreate(
                ['name' => $account['name'], 'category' => $account['category']],
                ['type' => $account['type']]
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
        Schema::create('role_user', function ($table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
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
            $table->string('donor_email')->nullable();
            $table->string('support_type');
            $table->unsignedBigInteger('amount');
            $table->string('payment_method')->nullable();
            $table->text('note')->nullable();
            $table->string('payment_gateway')->default('midtrans');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
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
            $table->string('destination_account');
            $table->string('status')->default('pending');
            $table->foreignId('created_by')->constrained('users');
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
            $table->timestamps();
        });
    }
}
