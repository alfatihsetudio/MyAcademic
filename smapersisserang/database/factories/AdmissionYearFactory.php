<?php

namespace Database\Factories;

use App\Models\AdmissionYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class AdmissionYearFactory extends Factory
{
    protected $model = AdmissionYear::class;

    public function definition(): array
    {
        $currentYear = now()->year;
        $nextYear = $currentYear + 1;

        return [
            'name' => 'Angkatan Pertama',
            'academic_year' => "{$currentYear}/{$nextYear}",
            'quota' => 36,
            'status' => 'open',
            'start_date' => now(),
            'end_date' => now()->addYear(),
            'is_current' => true,
            'description' => 'Program khusus angkatan pertama.',
        ];
    }
}
