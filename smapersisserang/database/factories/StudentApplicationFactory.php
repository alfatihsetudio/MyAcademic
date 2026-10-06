<?php

namespace Database\Factories;

use App\Models\StudentApplication;
use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentApplicationFactory extends Factory
{
    protected $model = StudentApplication::class;

    private static array $usedNumbers = [];

    public function definition(): array
    {
        $yearPrefix = now()->year;

        do {
            $number = str_pad((string) mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (in_array($number, self::$usedNumbers));

        self::$usedNumbers[] = $number;

        return [
            'registration_number' => 'SPMB-' . $yearPrefix . '-' . $number,
            'admission_year_id' => AdmissionYear::factory(),
            'admission_program_id' => AdmissionProgram::factory(),
            'status' => 'baru_daftar',
            'student_name' => fake()->name(),
            'gender' => fake()->randomElement(['laki_laki', 'perempuan']),
            'birth_place' => fake()->city(),
            'birth_date' => fake()->date('Y-m-d', '2010-01-01'),
            'previous_school' => fake()->company() . ' School',
            'address' => fake()->address(),
            'father_name' => fake()->name('male'),
            'mother_name' => fake()->name('female'),
            'parent_whatsapp' => fake()->phoneNumber(),
            'parent_job' => fake()->randomElement(['PNS', 'Swasta', 'Wiraswasta', 'Petani']),
            'boarding_ready' => fake()->boolean(),
            'quran_reading_ability' => fake()->randomElement(['belum_bisa', 'terbata_bata', 'lancar', 'baik']),
            'health_notes' => fake()->optional()->sentence(),
            'motivation' => fake()->paragraph(),
            'submitted_at' => now(),
        ];
    }

    public function withRegistrationNumber(): static
    {
        return $this->afterCreating(function (StudentApplication $application) {
            $year = $application->admissionYear->academic_year;
            $yearPrefix = explode('/', $year)[0];
            $count = StudentApplication::where('admission_year_id', $application->admission_year_id)->count();
            $application->registration_number = 'SPMB-' . $yearPrefix . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            $application->save();
        });
    }
}
