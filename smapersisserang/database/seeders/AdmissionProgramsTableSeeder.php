<?php

namespace Database\Seeders;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use Illuminate\Database\Seeder;

class AdmissionProgramsTableSeeder extends Seeder
{
    public function run(): void
    {
        $admissionYear = AdmissionYear::where('academic_year', '2026/2027')->first()
            ?? AdmissionYear::where('is_current', true)->first();
        
        if ($admissionYear) {
            AdmissionProgram::updateOrCreate(
                [
                    'admission_year_id' => $admissionYear->id,
                    'type' => 'first_batch_free',
                ],
                [
                'admission_year_id' => $admissionYear->id,
                'name' => 'Program Gratis Angkatan Pertama',
                'type' => 'first_batch_free',
                'quota' => 36,
                'tuition_fee' => 0,
                'boarding_fee' => 0,
                'meal_fee' => 0,
                'registration_fee' => 0,
                'other_fee' => 0,
                'is_free_program' => true,
                'status' => 'open',
                'start_date' => $admissionYear->start_date,
                'end_date' => $admissionYear->end_date,
                'description' => 'Program khusus angkatan pertama gratis total (pendidikan, asrama, makan) untuk 36 siswa. Program ini hanya tersedia untuk angkatan pertama dan tidak akan diulang di angkatan berikutnya.',
                'sort_order' => 1,
                ]
            );
        }
    }
}
