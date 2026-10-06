<?php

namespace Database\Factories;

use App\Models\AdmissionProgram;
use App\Models\AdmissionYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionProgramFactory extends Factory
{
    protected $model = AdmissionProgram::class;

    public function definition(): array
    {
        return [
            'admission_year_id' => AdmissionYear::factory(),
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
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'description' => 'Program gratis angkatan pertama.',
            'sort_order' => 1,
        ];
    }
}
