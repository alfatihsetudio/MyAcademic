<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationShareTemplate extends Model
{
    protected $fillable = [
        'title',
        'message_template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function activeTemplate(): ?self
    {
        return static::where('is_active', true)->latest()->first();
    }
}
