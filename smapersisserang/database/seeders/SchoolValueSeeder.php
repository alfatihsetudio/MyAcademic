<?php

namespace Database\Seeders;

use App\Models\SchoolValue;
use Illuminate\Database\Seeder;

class SchoolValueSeeder extends Seeder
{
    public function run(): void
    {
        $values = [
            [
                'title' => 'Akhlak',
                'description' => 'Berakhlakul karimah dalam setiap sikap dan tindakan.',
                'icon' => 'book-open',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Keilmuan',
                'description' => 'Berilmu luas, kritis, dan terus bertumbuh.',
                'icon' => 'academic-cap',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Teknologi',
                'description' => 'Melek teknologi untuk masa depan yang lebih baik.',
                'icon' => 'computer-desktop',
                'sort_order' => 3,
                'is_active' => true,
            ],
            [
                'title' => 'Kepemimpinan',
                'description' => 'Mandiri, percaya diri, dan siap memberi manfaat.',
                'icon' => 'users',
                'sort_order' => 4,
                'is_active' => true,
            ],
        ];

        foreach ($values as $value) {
            SchoolValue::updateOrCreate(
                ['title' => $value['title']],
                $value
            );
        }
    }
}
