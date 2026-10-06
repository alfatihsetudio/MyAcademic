<?php

namespace Tests\Feature;

use App\Models\DonationItemCommitment;
use App\Models\DonationItemReceipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonationItemCommitmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_admin_can_parse_and_store_whatsapp_item_commitment(): void
    {
        $admin = $this->adminUser();
        $message = "Assalamu'alaikum, saya ingin berinfaq barang untuk SMA Persis Serang.\n\n"
            . "Nama Donatur: Ibu Siti\n"
            . "Nomor WhatsApp: 081234567890\n"
            . "Jenis Barang: Beras\n"
            . "Jumlah / Perkiraan: 10 kg\n"
            . "Cara Penyerahan: Diantar ke sekolah\n"
            . "Catatan: Untuk makan santri";

        $this->actingAs($admin)
            ->post(route('admin.infaq-barang-wa.parse'), [
                'raw_whatsapp_message' => $message,
            ])
            ->assertRedirect(route('admin.infaq-barang-wa.create'))
            ->assertSessionHas('parsed_item_commitment.donor_name', 'Ibu Siti')
            ->assertSessionHas('parsed_item_commitment.quantity_estimate', '10 kg');

        $this->actingAs($admin)
            ->post(route('admin.infaq-barang-wa.store'), [
                'received_at' => '2026-07-09T09:30',
                'donor_name' => 'Ibu Siti',
                'donor_phone' => '081234567890',
                'item_type' => 'Beras',
                'quantity_estimate' => '10 kg',
                'delivery_method' => 'Diantar ke sekolah',
                'note' => 'Untuk makan santri',
                'raw_whatsapp_message' => $message,
                'status' => 'pending',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('donation_item_commitments', [
            'reference_number' => 'WIB-2026-0001',
            'donor_name' => 'Ibu Siti',
            'status' => 'pending',
        ]);

        $commitment = DonationItemCommitment::first();

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang-wa.show', $commitment))
            ->assertOk()
            ->assertSee('WIB-2026-0001')
            ->assertSee('Terbitkan Bukti Penerimaan');
    }

    public function test_receipt_from_whatsapp_commitment_updates_commitment_status(): void
    {
        $admin = $this->adminUser();
        $commitment = DonationItemCommitment::create([
            'reference_number' => 'WIB-2026-0001',
            'received_at' => '2026-07-09 09:30:00',
            'donor_name' => 'Ibu Siti',
            'donor_phone' => '081234567890',
            'item_type' => 'Beras',
            'quantity_estimate' => '10 kg',
            'delivery_method' => 'Diantar ke sekolah',
            'note' => 'Untuk makan santri',
            'status' => 'confirmed',
            'created_by' => $admin->id,
        ]);

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang.create', ['source_wa' => $commitment->id]))
            ->assertOk()
            ->assertSee('WIB-2026-0001')
            ->assertSee('value="Ibu Siti"', false)
            ->assertSee('value="10 kg"', false);

        $this->actingAs($admin)
            ->post(route('admin.infaq-barang.store'), [
                'source_wa_id' => $commitment->id,
                'received_date' => '2026-07-09',
                'donor_name' => 'Ibu Siti',
                'donor_phone' => '081234567890',
                'item_type' => 'Beras',
                'quantity' => '10 kg',
                'delivery_method' => 'Diantar ke sekolah',
                'received_by' => 'Admin Test',
            ])
            ->assertRedirect();

        $receipt = DonationItemReceipt::first();
        $commitment->refresh();

        $this->assertSame('received', $commitment->status);
        $this->assertSame($receipt->id, $commitment->received_receipt_id);

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang-wa.show', $commitment))
            ->assertOk()
            ->assertSee('Lihat Bukti Penerimaan')
            ->assertDontSee('Terbitkan Bukti Penerimaan');

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang.show', $receipt))
            ->assertOk()
            ->assertSee('BUKTI PENERIMAAN INFAQ BARANG')
            ->assertSee('Data WA Infaq Barang');

        $this->actingAs($admin)
            ->get(route('admin.infaq-barang.create', ['source_wa' => $commitment->id]))
            ->assertRedirect(route('admin.infaq-barang-wa.show', $commitment))
            ->assertSessionHas('success', 'Data WA ini sudah memiliki bukti penerimaan.');
    }

    private function adminUser(): User
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@example.test'],
            [
                'name' => 'Admin Test',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        $role = \App\Models\Role::firstOrCreate(
            ['name' => 'admin'],
            ['display_name' => 'Admin', 'guard_name' => 'web', 'is_active' => true, 'is_system' => true]
        );
        $user->roles()->syncWithoutDetaching([$role->id]);

        return $user;
    }
}
