<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardingSchedule extends Model
{
    protected $fillable = [
        'schedule_type',
        'time',
        'title',
        'description',
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
}
