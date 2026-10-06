<?php

namespace Database\Seeders;

use App\Models\DonationAccount;
use Illuminate\Database\Seeder;

class DonationAccountSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['name' => 'Tunai Donasi', 'category' => 'donation', 'type' => 'cash', 'description' => 'Kas tunai dari donasi.'],
            ['name' => 'QRIS Donasi', 'category' => 'donation', 'type' => 'qris', 'description' => 'Penerimaan donasi via QRIS.'],
            ['name' => 'Transfer Donasi', 'category' => 'donation', 'type' => 'bank_transfer', 'description' => 'Penerimaan donasi via transfer bank.'],
            ['name' => 'Tunai Keuangan', 'category' => 'finance', 'type' => 'cash', 'description' => 'Kas tunai bagian keuangan.'],
            ['name' => 'Rekening Keuangan', 'category' => 'finance', 'type' => 'bank_transfer', 'description' => 'Rekening bank bagian keuangan.'],
        ];

        foreach ($accounts as $account) {
            DonationAccount::updateOrCreate(
                ['name' => $account['name'], 'category' => $account['category']],
                ['type' => $account['type'], 'description' => $account['description']]
            );
        }
    }
}
