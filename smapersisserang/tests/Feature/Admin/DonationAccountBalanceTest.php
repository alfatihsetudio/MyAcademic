<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationTransaction;
use App\Models\User;
use App\Services\DonationBalanceService;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationAccountBalanceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
    }

    protected function tearDown(): void
    {
        foreach ([
            'donation_outflows',
            'donation_transactions',
            'donation_accounts',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_transaction_belongs_to_account(): void
    {
        $account = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $tx = $this->createTransaction(['donation_account_id' => $account->id, 'payment_method' => 'cash']);

        $this->assertInstanceOf(BelongsTo::class, $tx->account());
        $this->assertSame($account->id, $tx->account->id);
        $this->assertSame('Tunai Donasi', $tx->account->name);
    }

    public function test_account_balance_is_calculated_correctly(): void
    {
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $qris = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation']);
        $transfer = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);

        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 100000, 'status' => 'paid']);
        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 200000, 'status' => 'paid']);
        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 999999, 'status' => 'pending']);
        $this->createTransaction(['donation_account_id' => $qris->id, 'amount' => 300000, 'status' => 'settlement']);
        $this->createTransaction(['donation_account_id' => $transfer->id, 'amount' => 400000, 'status' => 'capture']);

        $service = app(DonationBalanceService::class);

        $this->assertSame(300000, $service->accountBalance($tunai->id));
        $this->assertSame(300000, $service->accountBalance($qris->id));
        $this->assertSame(400000, $service->accountBalance($transfer->id));
        $this->assertSame(0, $service->accountBalance(999));
    }

    public function test_incoming_per_account_groups_correctly(): void
    {
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $qris = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation']);

        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 100000]);
        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 50000]);
        $this->createTransaction(['donation_account_id' => $qris->id, 'amount' => 250000]);
        $this->createTransaction(['donation_account_id' => $qris->id, 'amount' => 900000, 'status' => 'pending']);

        $perAccount = app(DonationBalanceService::class)->incomingPerAccount();

        $this->assertSame(150000, $perAccount[$tunai->id]);
        $this->assertSame(250000, $perAccount[$qris->id]);
    }

    public function test_total_balance_remains_same_across_accounts(): void
    {
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $qris = DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation']);
        $transfer = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);

        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 100000]);
        $this->createTransaction(['donation_account_id' => $qris->id, 'amount' => 250000]);
        $this->createTransaction(['donation_account_id' => $transfer->id, 'amount' => 400000]);
        $this->createTransaction(['donation_account_id' => $tunai->id, 'amount' => 999999, 'status' => 'pending']);

        $service = app(DonationBalanceService::class);

        $sumPerAccount = array_sum($service->incomingPerAccount());

        $this->assertSame($service->totalIncoming(), $sumPerAccount);
        $this->assertSame($service->recordedBalance(), $sumPerAccount);
        $this->assertSame(750000, $sumPerAccount);
    }

    public function test_rows_without_account_group_under_zero_key(): void
    {
        $this->createTransaction(['donation_account_id' => null, 'amount' => 120000]);

        $perAccount = app(DonationBalanceService::class)->incomingPerAccount();

        $this->assertSame(120000, $perAccount[0] ?? 0);
        $this->assertSame(120000, app(DonationBalanceService::class)->totalIncoming());
    }

    private function createTransaction(array $overrides = []): DonationTransaction
    {
        return DonationTransaction::create(array_merge([
            'order_id' => 'DON-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'donor_name' => 'Donatur Uji',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan',
            'amount' => 100000,
            'payment_method' => 'bank_transfer',
            'payment_gateway' => 'manual',
            'status' => 'paid',
            'paid_at' => now(),
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
        Schema::create('donation_accounts', function ($table) {
            $table->id();
            $table->string('name');
            $table->string('category');
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
        Schema::create('donation_outflows', function ($table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->date('handover_date');
            $table->string('donation_source');
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('pending');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }
}
