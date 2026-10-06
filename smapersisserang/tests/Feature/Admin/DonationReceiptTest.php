<?php

namespace Tests\Feature\Admin;

use App\Models\DonationTransaction;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationReceiptTest extends TestCase
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
            'donation_transactions',
            'donation_accounts',
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

    public function test_create_receipt_page_loads_for_admin(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.create-receipt'))
            ->assertOk()
            ->assertSee('Gunakan Kode Unik')
            ->assertSee('Metode Pembayaran');
    }

    public function test_manual_transaction_without_unique_code_can_be_created(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload())
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertSame(50000, (int) $transaction->amount);
        $this->assertStringContainsString('Kode Unik: Tidak digunakan', $transaction->note);
        $this->assertStringContainsString('Total Transfer: Rp50.000', $transaction->note);
    }

    public function test_total_transfer_equals_nominal_when_no_unique_code(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload())
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Total Transfer: Rp50.000', $transaction->note);
        $this->assertSame(50000, (int) $transaction->amount);
    }

    public function test_manual_transaction_with_unique_code_can_be_created(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'use_unique_code' => 'Ya',
                'unique_code' => '127',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Kode Unik: 127', $transaction->note);
    }

    public function test_total_transfer_is_nominal_plus_unique_code_when_used(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'use_unique_code' => 'Ya',
                'unique_code' => '127',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Total Transfer: Rp50.127', $transaction->note);
    }

    public function test_unique_code_is_required_when_use_option_is_yes(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'use_unique_code' => 'Ya',
                'unique_code' => '',
            ]))
            ->assertSessionHasErrors('unique_code');

        $this->assertSame(0, DonationTransaction::count());
    }

    public function test_stale_unique_code_is_ignored_when_use_option_is_no(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'use_unique_code' => 'Tidak',
                'unique_code' => '999',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Kode Unik: Tidak digunakan', $transaction->note);
        $this->assertStringContainsString('Total Transfer: Rp50.000', $transaction->note);
    }

    public function test_receipt_does_not_show_unique_code_row_when_unused(): void
    {
        $user = $this->user('admin');
        $transaction = $this->createTransactionWithNote(
            "Bersedia Dihubungi: Tidak\nNomor WhatsApp: -\nMetode Pembayaran: Transfer Bank\nKode Unik: Tidak digunakan\nTotal Transfer: Rp50.000"
        );

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.show', $transaction))
            ->assertOk()
            ->assertDontSee('Kode Unik');
    }

    public function test_legacy_transaction_with_unique_code_still_renders_code(): void
    {
        $user = $this->user('admin');
        $transaction = $this->createTransactionWithNote(
            "Bersedia Dihubungi: Tidak\nNomor WhatsApp: -\nMetode Pembayaran: QRIS\nKode Unik: 127\nTotal Transfer: Rp50.127"
        );

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.show', $transaction))
            ->assertOk()
            ->assertSee('Kode Unik')
            ->assertSee('127');
    }

    public function test_cash_transaction_without_unique_code_can_be_created(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'payment_method' => 'cash',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Metode Pembayaran: Tunai', $transaction->note);
        $this->assertStringContainsString('Kode Unik: Tidak digunakan', $transaction->note);

        $this->actingAs($user)
            ->get(route('admin.donasi-transactions.show', $transaction))
            ->assertOk()
            ->assertSee('Tunai')
            ->assertDontSee('Kode Unik');
    }

    public function test_static_qris_transaction_without_unique_code_can_be_created(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'payment_method' => 'qris',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertStringContainsString('Metode Pembayaran: QRIS', $transaction->note);
        $this->assertStringContainsString('Kode Unik: Tidak digunakan', $transaction->note);
        $this->assertStringContainsString('Total Transfer: Rp50.000', $transaction->note);
    }

    public function test_new_transaction_stores_internal_payment_method(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'payment_method' => 'bank_transfer',
            ]))
            ->assertRedirect();

        $transaction = DonationTransaction::first();
        $this->assertNotNull($transaction);
        $this->assertSame('bank_transfer', $transaction->payment_method);
    }

    public function test_store_receipt_sets_donation_account_by_payment_method(): void
    {
        $user = $this->user('admin');
        $tunai = \App\Models\DonationAccount::where('type', 'cash')->where('category', 'donation')->firstOrFail();
        $qris = \App\Models\DonationAccount::where('type', 'qris')->where('category', 'donation')->firstOrFail();
        $transfer = \App\Models\DonationAccount::where('type', 'bank_transfer')->where('category', 'donation')->firstOrFail();

        foreach ([
            ['method' => 'cash', 'account' => $tunai],
            ['method' => 'qris', 'account' => $qris],
            ['method' => 'bank_transfer', 'account' => $transfer],
        ] as $case) {
            $this->actingAs($user)
                ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                    'payment_method' => $case['method'],
                ]))
                ->assertRedirect();

            $transaction = DonationTransaction::where('payment_method', $case['method'])->latest('id')->first();
            $this->assertNotNull($transaction);
            $this->assertSame($case['account']->id, $transaction->donation_account_id);
            $this->assertNotNull($transaction->donation_account_id);
        }
    }

    public function test_receipt_without_payment_method_is_rejected(): void
    {
        $user = $this->user('admin');

        $this->actingAs($user)
            ->post(route('admin.donasi-transactions.store-receipt'), $this->receiptPayload([
                'payment_method' => '',
            ]))
            ->assertSessionHasErrors('payment_method');

        $this->assertSame(0, DonationTransaction::count());
    }

    private function user(string $roleName): User
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

        return $user;
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

    private function createTransactionWithNote(string $note): DonationTransaction
    {
        return DonationTransaction::create([
            'order_id' => 'REC-'.strtoupper(bin2hex(random_bytes(4))),
            'donor_name' => 'Budi',
            'donor_whatsapp' => '-',
            'support_type' => 'Donasi Pendidikan & Makan Santri',
            'amount' => 50000,
            'note' => $note,
            'payment_gateway' => 'manual-qris',
            'status' => 'paid',
            'paid_at' => now(),
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
            $table->text('note')->nullable();
            $table->string('payment_gateway')->default('midtrans');
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    private function seedDonationAccounts(): void
    {
        foreach ([
            ['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash'],
            ['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris'],
            ['name' => 'Transfer Donasi', 'category' => 'donation', 'type' => 'bank_transfer'],
        ] as $account) {
            \App\Models\DonationAccount::updateOrCreate(
                ['name' => $account['name'], 'category' => $account['category']],
                ['type' => $account['type']]
            );
        }
    }
}
