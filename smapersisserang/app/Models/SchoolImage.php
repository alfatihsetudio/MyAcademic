<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolImage extends Model
{
    protected $fillable = [
        'title',
        'image_path',
        'category',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function categories()
    {
        return $this->belongsToMany(GalleryCategory::class, 'gallery_image_category');
    }

    public function scopeWhereCategory($query, string $slug)
    {
        return $query->whereHas('categories', fn($q) => $q->where('slug', $slug));
    }
}
