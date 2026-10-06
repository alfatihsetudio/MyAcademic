<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizationStructure extends Model
{
    protected $fillable = [
        'structure_key',
        'label',
        'person_name',
        'person_id',
        'description',
        'members',
        'parent_key',
        'sort_order',
        'level',
        'card_type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'members' => 'array',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
            'level' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function person(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'person_id');
    }
}
