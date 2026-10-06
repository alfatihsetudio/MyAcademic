<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SarprasNeed extends Model
{
    protected $fillable = [
        'title',
        'category',
        'quantity_needed',
        'unit',
        'estimated_cost',
        'priority',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'quantity_needed' => 'integer',
            'estimated_cost' => 'decimal:2',
        ];
    }
}
