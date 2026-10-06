<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BoardingPageSetting extends Model
{
    protected $fillable = [
        'section_label',
        'section_heading',
        'section_subtitle',
        'schedule_heading',
        'schedule_subtitle',
        'schedule_note',
        'focus_heading',
        'focus_subtitle',
        'why_heading',
        'why_subtitle',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
