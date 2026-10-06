<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardingCard extends Model
{
    protected $fillable = [
        'type',
        'title',
        'description',
        'icon',
        'color',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeWhyBoarding($query)
    {
        return $query->where('type', 'why_boarding')->orderBy('sort_order');
    }

    public function scopeFocus($query)
    {
        return $query->where('type', 'focus')->orderBy('sort_order');
    }

    public function scopeInfo($query)
    {
        return $query->where('type', 'info')->orderBy('sort_order');
    }
}
