<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonationItemReceiptTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_manual_item_receipt_create_redirects_to_whatsapp_data(): void
    {
        $admin = User::create([
            'name' => 'Admin Test',
            'email' => 'admin@example.test',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $role = \App\Models\Role::firstOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Admin', 'guard_name' => 'web', 'is_active' => true, 'is_system' => true]
        );
        $admin->roles()->syncWithoutDetaching([$role->id]);

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang.create'))
            ->assertRedirect(route('admin.infaq-barang-wa.index'))
            ->assertSessionHas('success', 'Penerimaan Infaq Barang harus dibuat dari Data WA Infaq Barang.');

        $this->actingAs($admin)->post(route('admin.infaq-barang.store'), [
            'received_date' => '2026-07-09',
            'donor_name' => 'Bapak Ahmad',
            'donor_phone' => '081234567890',
            'item_type' => 'Beras',
            'item_name' => 'Beras premium',
            'quantity' => '25',
            'unit' => 'kg',
            'item_condition' => 'Baik',
            'delivery_method' => 'Diantar ke sekolah',
            'received_by' => 'Admin Test',
        ])
            ->assertRedirect(route('admin.infaq-barang-wa.index'))
            ->assertSessionHas('success', 'Penerimaan Infaq Barang harus dibuat dari Data WA Infaq Barang.');

        $this->assertDatabaseCount('donation_item_receipts', 0);
    }
}
