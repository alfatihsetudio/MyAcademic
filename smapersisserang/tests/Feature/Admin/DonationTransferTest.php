<?php

namespace Tests\Feature\Admin;

use App\Models\DonationAccount;
use App\Models\DonationTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationTransferTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
    }

    protected function tearDown(): void
    {
        foreach ([
            'donation_transfers',
            'donation_accounts',
            'users',
        ] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_account_belongs_to_category(): void
    {
        $donation = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $finance = DonationAccount::create(['name' => 'Tunai Keuangan', 'category' => 'finance']);

        $this->assertTrue($donation->isDonation());
        $this->assertFalse($donation->isFinance());
        $this->assertSame('Donasi', $donation->category_label);

        $this->assertTrue($finance->isFinance());
        $this->assertFalse($finance->isDonation());
        $this->assertSame('Keuangan', $finance->category_label);
    }

    public function test_account_scopes_filter_by_category(): void
    {
        DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        DonationAccount::create(['name' => 'QRIS Donasi', 'category' => 'donation']);
        DonationAccount::create(['name' => 'Rekening Keuangan', 'category' => 'finance']);

        $this->assertSame(2, DonationAccount::donation()->count());
        $this->assertSame(1, DonationAccount::finance()->count());
    }

    public function test_account_unique_name_per_category(): void
    {
        DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);

        $this->expectExceptionMessageMatches('/unique/i');
        DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
    }

    public function test_transfer_relations_are_correct(): void
    {
        $from = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $requester = User::factory()->create(['role' => 'admin']);
        $approver = User::factory()->create(['role' => 'staf_keuangan']);

        $transfer = DonationTransfer::create([
            'transfer_number' => 'MD-20260806-0001',
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 500000,
            'status' => DonationTransfer::STATUS_APPROVED,
            'requested_by' => $requester->id,
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'note' => 'Mutasi tunai',
        ]);

        $this->assertInstanceOf(BelongsTo::class, $transfer->fromAccount());
        $this->assertSame($from->id, $transfer->fromAccount->id);
        $this->assertSame($to->id, $transfer->toAccount->id);
        $this->assertSame($requester->id, $transfer->requester->id);
        $this->assertSame($approver->id, $transfer->approver->id);
        $this->assertTrue($transfer->isApproved());
        $this->assertFalse($transfer->isPending());
        $this->assertFalse($transfer->isRejected());
    }

    public function test_account_transfer_relations_are_correct(): void
    {
        $from = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);
        $to = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $requester = User::factory()->create(['role' => 'admin']);

        $this->assertInstanceOf(HasMany::class, $from->outgoingTransfers());
        $this->assertInstanceOf(HasMany::class, $to->incomingTransfers());

        DonationTransfer::create([
            'transfer_number' => 'MD-20260806-0002',
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => 100000,
            'status' => DonationTransfer::STATUS_PENDING,
            'requested_by' => $requester->id,
        ]);

        $this->assertSame(1, $from->outgoingTransfers()->count());
        $this->assertSame(1, $to->incomingTransfers()->count());
    }

    public function test_account_balance_only_counts_approved_transfers(): void
    {
        $donasi = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $requester = User::factory()->create(['role' => 'admin']);

        $this->createTransfer($donasi, $tunai, 400000, DonationTransfer::STATUS_APPROVED, $requester);
        $this->createTransfer($donasi, $tunai, 100000, DonationTransfer::STATUS_PENDING, $requester);
        $this->createTransfer($tunai, $donasi, 50000, DonationTransfer::STATUS_REJECTED, $requester);

        $this->assertSame(0, $this->approvedBalance($donasi));
        $this->assertSame(400000, $this->approvedBalance($tunai));
        $this->assertSame(0, $this->pendingBalance($donasi));
        $this->assertSame(100000, $this->pendingBalance($tunai));
    }

    public function test_account_balance_is_net_incoming_minus_outgoing(): void
    {
        $donasi = DonationAccount::create(['name' => 'Transfer Donasi', 'category' => 'donation']);
        $tunai = DonationAccount::create(['name' => 'Tunai Donasi', 'category' => 'donation']);
        $requester = User::factory()->create(['role' => 'admin']);

        $this->createTransfer($donasi, $tunai, 400000, DonationTransfer::STATUS_APPROVED, $requester);
        $this->createTransfer($tunai, $donasi, 150000, DonationTransfer::STATUS_APPROVED, $requester);

        $this->assertSame(-250000, $this->netApprovedBalance($donasi));
        $this->assertSame(250000, $this->netApprovedBalance($tunai));
    }

    private function createTransfer(
        DonationAccount $from,
        DonationAccount $to,
        int $amount,
        string $status,
        User $requester
    ): DonationTransfer {
        return DonationTransfer::create([
            'transfer_number' => 'MD-'.now()->format('Ymd').'-'.strtoupper(uniqid()),
            'from_account_id' => $from->id,
            'to_account_id' => $to->id,
            'amount' => $amount,
            'status' => $status,
            'requested_by' => $requester->id,
        ]);
    }

    private function approvedBalance(DonationAccount $account): int
    {
        return $account->incomingTransfers()
            ->where('status', DonationTransfer::STATUS_APPROVED)
            ->sum('amount');
    }

    private function pendingBalance(DonationAccount $account): int
    {
        return $account->incomingTransfers()
            ->where('status', DonationTransfer::STATUS_PENDING)
            ->sum('amount');
    }

    private function netApprovedBalance(DonationAccount $account): int
    {
        return $this->approvedBalance($account)
            - $account->outgoingTransfers()
                ->where('status', DonationTransfer::STATUS_APPROVED)
                ->sum('amount');
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
