<?php

namespace Tests\Feature\Admin;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationAccountBackfillTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->createTables();
    }

    protected function tearDown(): void
    {
        foreach (['donation_transactions', 'donation_accounts'] as $table) {
            Schema::dropIfExists($table);
        }

        parent::tearDown();
    }

    public function test_backfill_maps_null_qris_to_qris_donation(): void
    {
        $qris = $this->createAccount('QRIS Donasi');
        $this->createTransaction(['order_id' => 't-qris', 'payment_method' => 'qris']);

        $this->runMigration();

        $this->assertSame($qris, $this->accountIdFor('t-qris'));
    }

    public function test_backfill_maps_null_cash_to_tunai_donation(): void
    {
        $tunai = $this->createAccount('Tunai Donasi');
        $this->createTransaction(['order_id' => 't-cash', 'payment_method' => 'cash']);

        $this->runMigration();

        $this->assertSame($tunai, $this->accountIdFor('t-cash'));
    }

    public function test_backfill_maps_null_bank_transfer_to_transfer_donation(): void
    {
        $transfer = $this->createAccount('Transfer Donasi');
        $this->createTransaction(['order_id' => 't-transfer', 'payment_method' => 'bank_transfer']);

        $this->runMigration();

        $this->assertSame($transfer, $this->accountIdFor('t-transfer'));
    }

    public function test_backfill_maps_null_other_and_null_to_tunai_donation(): void
    {
        $tunai = $this->createAccount('Tunai Donasi');
        $this->createTransaction(['order_id' => 't-other', 'payment_method' => 'other']);
        $this->createTransaction(['order_id' => 't-null', 'payment_method' => null]);

        $this->runMigration();

        $this->assertSame($tunai, $this->accountIdFor('t-other'));
        $this->assertSame($tunai, $this->accountIdFor('t-null'));
    }

    public function test_backfill_creates_missing_accounts(): void
    {
        $this->createTransaction(['order_id' => 't-1', 'payment_method' => 'qris']);
        $this->createTransaction(['order_id' => 't-2', 'payment_method' => 'cash']);

        $this->runMigration();

        $this->assertDatabaseHas('donation_accounts', ['name' => 'QRIS Donasi', 'category' => 'donation']);
        $this->assertDatabaseHas('donation_accounts', ['name' => 'Tunai Donasi', 'category' => 'donation']);
        $this->assertDatabaseHas('donation_accounts', ['name' => 'Transfer Donasi', 'category' => 'donation']);

        $this->assertNotNull($this->accountIdFor('t-1'));
        $this->assertNotNull($this->accountIdFor('t-2'));
    }

    public function test_backfill_does_not_overwrite_existing_classification(): void
    {
        $qris = $this->createAccount('QRIS Donasi');
        $tunai = $this->createAccount('Tunai Donasi');
        $this->createTransaction([
            'order_id' => 't-manual',
            'payment_method' => 'qris',
            'donation_account_id' => $tunai,
        ]);

        $this->runMigration();

        $this->assertSame($tunai, $this->accountIdFor('t-manual'));
        $this->assertNotSame($qris, $this->accountIdFor('t-manual'));
    }

    public function test_backfill_is_idempotent(): void
    {
        $qris = $this->createAccount('QRIS Donasi');
        $tunai = $this->createAccount('Tunai Donasi');
        $this->createTransaction(['order_id' => 't-qris', 'payment_method' => 'qris']);
        $this->createTransaction(['order_id' => 't-cash', 'payment_method' => 'cash']);
        $this->createTransaction(['order_id' => 't-other', 'payment_method' => 'other']);

        $this->runMigration();
        $first = [
            $this->accountIdFor('t-qris'),
            $this->accountIdFor('t-cash'),
            $this->accountIdFor('t-other'),
        ];

        $this->runMigration();
        $second = [
            $this->accountIdFor('t-qris'),
            $this->accountIdFor('t-cash'),
            $this->accountIdFor('t-other'),
        ];

        $this->assertSame([$qris, $tunai, $tunai], $first);
        $this->assertSame($first, $second);
    }

    private function runMigration(): void
    {
        $migration = require database_path('migrations/2026_08_11_000002_backfill_missing_donation_account_ids.php');
        $migration->up();
    }

    private function createAccount(string $name): int
    {
        return DB::table('donation_accounts')->insertGetId([
            'name' => $name,
            'category' => 'donation',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createTransaction(array $attributes = []): void
    {
        DB::table('donation_transactions')->insert(array_merge([
            'order_id' => 'ORD-'.strtoupper(uniqid()),
            'donor_name' => 'Test Donor',
            'donor_whatsapp' => '081234567890',
            'support_type' => 'general',
            'amount' => 100000,
            'payment_gateway' => 'manual',
            'status' => 'paid',
            'paid_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ], $attributes));
    }

    private function accountIdFor(string $orderId): ?int
    {
        $id = DB::table('donation_transactions')
            ->where('order_id', $orderId)
            ->value('donation_account_id');

        return $id === null ? null : (int) $id;
    }

    private function createTables(): void
    {
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
            $table->string('payment_gateway')->default('manual');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }
}
