<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolFigure extends Model
{
    protected $fillable = [
        'name',
        'role',
        'description',
        'photo_path',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}