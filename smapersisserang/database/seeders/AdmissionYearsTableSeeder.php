<?php

namespace Database\Seeders;

use App\Models\AdmissionYear;
use Illuminate\Database\Seeder;

class AdmissionYearsTableSeeder extends Seeder
{
    public function run(): void
    {
        AdmissionYear::where('id', '!=', 1)->update(['is_current' => false]);

        AdmissionYear::updateOrCreate(
            ['id' => 1],
            [
            'name' => 'Angkatan Pertama',
            'academic_year' => '2026/2027',
            'quota' => 36,
            'status' => 'open',
            'start_date' => '2026-06-24',
            'end_date' => '2027-06-24',
            'is_current' => true,
            'description' => 'Program khusus angkatan pertama SMA Persis Serang. Program Gratis Pendidikan, Asrama, dan Makan untuk 36 siswa angkatan pertama.',
            ]
        );
    }
}
