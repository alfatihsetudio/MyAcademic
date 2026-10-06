<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class SchoolSubject extends Model
{
    public const CATEGORIES = [
        'nasional' => 'Mata Pelajaran Nasional',
        'keislaman' => 'Keislaman & Al-Qur’an',
        'teknologi' => 'Teknologi & Keterampilan',
        'boarding' => 'Boarding & Pembinaan Karakter',
    ];

    protected $fillable = [
        'name',
        'category',
        'description',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = ['category_label'];

    public function getCategoryLabelAttribute(): string
    {
        return self::CATEGORIES[$this->category] ?? $this->category;
    }

    public function teachers(): BelongsToMany
    {
        return $this->belongsToMany(Teacher::class, 'teacher_subject')->withTimestamps();
    }
}
