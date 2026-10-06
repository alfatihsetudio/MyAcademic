<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationTransaction;
use App\Models\DonationTransfer;
use App\Models\User;
use App\Services\DonationBalanceService;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationAccountFundBalanceTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
        $this->requester = User::factory()->create(['role' => 'admin']);
    }

    protected function tearDown(): void
    {
        foreach ([
            'donation_transfers',
            'donation_transactions',
            'donation_accounts',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_incoming_donation_adds_to_account_balance(): void
    {
        $a = $this->account('Tunai Donasi');
        $this->transaction($a, 100000);

        $service = app(DonationBalanceService::class);

        $this->assertSame(100000, $service->balanceByAccount($a->id));
        $this->assertSame([$a->id => 100000], $service->balancesByAccount());
    }

    public function test_pending_transfer_does_not_change_balance(): void
    {
        $a = $this->account('Tunai Donasi');
        $b = $this->account('QRIS Donasi');
        $this->transaction($a, 100000);
        $this->transfer($a, $b, 40000, DonationTransfer::STATUS_PENDING);

        $service = app(DonationBalanceService::class);

        $this->assertSame(100000, $service->balanceByAccount($a->id));
        $this->assertSame(0, $service->balanceByAccount($b->id));
    }

    public function test_approved_transfer_reduces_source_account(): void
    {
        $a = $this->account('Tunai Donasi');
        $b = $this->account('QRIS Donasi');
        $this->transaction($a, 100000);
        $this->transfer($a, $b, 40000, DonationTransfer::STATUS_APPROVED);

        $this->assertSame(60000, app(DonationBalanceService::class)->balanceByAccount($a->id));
    }

    public function test_approved_transfer_increases_destination_account(): void
    {
        $a = $this->account('Tunai Donasi');
        $b = $this->account('QRIS Donasi');
        $this->transaction($a, 100000);
        $this->transfer($a, $b, 40000, DonationTransfer::STATUS_APPROVED);

        $this->assertSame(40000, app(DonationBalanceService::class)->balanceByAccount($b->id));
    }

    public function test_total_balance_across_accounts_stays_same_after_transfer(): void
    {
        $a = $this->account('Tunai Donasi');
        $b = $this->account('QRIS Donasi');
        $this->transaction($a, 100000);
        $this->transaction($b, 200000);

        $service = app(DonationBalanceService::class);
        $before = array_sum($service->balancesByAccount());

        $this->transfer($a, $b, 50000, DonationTransfer::STATUS_APPROVED);

        $after = array_sum($service->balancesByAccount());

        $this->assertSame(300000, $before);
        $this->assertSame($before, $after);
        $this->assertSame(50000, $service->balanceByAccount($a->id));
        $this->assertSame(250000, $service->balanceByAccount($b->id));
    }

    public function test_rejected_transfer_does_not_change_balance(): void
    {
        $a = $this->account('Tunai Donasi');
        $b = $this->account('QRIS Donasi');
        $this->transaction($a, 100000);
        $this->transfer($a, $b, 40000, DonationTransfer::STATUS_REJECTED);

        $service = app(DonationBalanceService::class);

        $this->assertSame(100000, $service->balanceByAccount($a->id));
        $this->assertSame(0, $service->balanceByAccount($b->id));
    }

    private function account(string $name): DonationAccount
    {
        return DonationAccount::create(['name' => $name, 'category' => 'donation']);
    }

    private function transaction(DonationAccount $account, int $amount): DonationTransaction
    {
        return DonationTransaction::create([
            'donation_account_id' => $account->id,
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

    private function transfer(
        DonationAccount $from,
        DonationAccount $to,
        int $amount,
        string $status
    ): DonationTransfer {
        return DonationTransfer::create([
            'transfer_number' => 'MD-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => $amount,
            'status' => $status,
            'requested_by' => $this->requester->id,
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
        Schema::create('donation_transfers', function ($table) {
            $table->id();
            $table->string('transfer_number')->unique();
            $table->foreignId('from_account_id')->constrained('donation_accounts')->restrictOnDelete();
            $table->foreignId('to_account_id')->constrained('donation_accounts')->restrictOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('status')->default('pending');
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('proof_file')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }
}
