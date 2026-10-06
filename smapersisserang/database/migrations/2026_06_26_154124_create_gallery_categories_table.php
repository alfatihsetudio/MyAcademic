<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $categories = [
            ['name' => 'Hero Slider', 'slug' => 'hero', 'sort_order' => 1],
            ['name' => 'Fasilitas', 'slug' => 'fasilitas', 'sort_order' => 2],
            ['name' => 'Kegiatan', 'slug' => 'kegiatan', 'sort_order' => 3],
            ['name' => 'Kelas', 'slug' => 'kelas', 'sort_order' => 4],
            ['name' => 'Santri', 'slug' => 'santri', 'sort_order' => 5],
            ['name' => 'Kajian', 'slug' => 'kajian', 'sort_order' => 6],
            ['name' => 'Teknologi', 'slug' => 'teknologi', 'sort_order' => 7],
        ];

        foreach ($categories as $cat) {
            DB::table('gallery_categories')->insert($cat + ['created_at' => now(), 'updated_at' => now()]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_categories');
    }
};
