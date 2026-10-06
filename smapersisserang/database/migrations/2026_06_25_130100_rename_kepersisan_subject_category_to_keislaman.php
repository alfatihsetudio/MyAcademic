<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('school_subjects')
            ->where('category', 'kepersisan')
            ->update(['category' => 'keislaman']);

        DB::table('school_subjects')
            ->where('name', 'Kepersisan')
            ->update([
                'name' => 'Keislaman dan Kejam’iyyahan',
                'description' => 'Pengenalan nilai-nilai keislaman, adab berorganisasi, dan semangat berjamaah dalam kebaikan.',
            ]);

        DB::table('school_subjects')
            ->where('name', "Ulumul Qur'an")
            ->update([
                'name' => 'Ulumul Qur’an',
                'description' => 'Pengenalan ilmu-ilmu Al-Qur’an sebagai dasar pemahaman keislaman.',
            ]);
    }

    public function down(): void
    {
        // Intentionally left blank. The final public category is keislaman.
    }
};
