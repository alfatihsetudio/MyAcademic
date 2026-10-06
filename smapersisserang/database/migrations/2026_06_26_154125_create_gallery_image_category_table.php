<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gallery_image_category', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_image_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gallery_category_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['school_image_id', 'gallery_category_id'], 'img_cat_unique');
        });

        $categoryMap = [
            'hero' => DB::table('gallery_categories')->where('slug', 'hero')->value('id'),
            'fasilitas' => DB::table('gallery_categories')->where('slug', 'fasilitas')->value('id'),
            'kegiatan' => DB::table('gallery_categories')->where('slug', 'kegiatan')->value('id'),
            'kelas' => DB::table('gallery_categories')->where('slug', 'kelas')->value('id'),
            'santri' => DB::table('gallery_categories')->where('slug', 'santri')->value('id'),
            'kajian' => DB::table('gallery_categories')->where('slug', 'kajian')->value('id'),
            'teknologi' => DB::table('gallery_categories')->where('slug', 'teknologi')->value('id'),
        ];

        $images = DB::table('school_images')->select('id', 'category')->get();
        foreach ($images as $image) {
            $catId = $categoryMap[$image->category] ?? null;
            if ($catId) {
                DB::table('gallery_image_category')->insert([
                    'school_image_id' => $image->id,
                    'gallery_category_id' => $catId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('gallery_image_category');
    }
};
