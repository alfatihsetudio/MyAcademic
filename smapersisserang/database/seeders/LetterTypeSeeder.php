<?php

namespace Database\Seeders;

use App\Models\LetterType;
use Illuminate\Database\Seeder;

class LetterTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['code' => 'UND', 'name' => 'Undangan'],
            ['code' => 'EDR', 'name' => 'Edaran'],
            ['code' => 'ST', 'name' => 'Surat Tugas'],
            ['code' => 'SK', 'name' => 'Surat Keputusan'],
            ['code' => 'KET', 'name' => 'Surat Keterangan'],
            ['code' => 'PMH', 'name' => 'Permohonan'],
            ['code' => 'PNG', 'name' => 'Pengantar'],
            ['code' => 'BA', 'name' => 'Berita Acara'],
            ['code' => 'MOU', 'name' => 'MoU / Perjanjian'],
            ['code' => 'ADM', 'name' => 'Administrasi Umum'],
        ];

        foreach ($types as $index => $type) {
            LetterType::query()->updateOrCreate(
                ['code' => $type['code']],
                [
                    'name' => $type['name'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]
            );
        }
    }
}
