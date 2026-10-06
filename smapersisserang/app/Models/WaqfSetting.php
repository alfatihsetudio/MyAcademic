<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaqfSetting extends Model
{
    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'intro_title',
        'intro_text',
        'waqf_purpose_text',
        'ikrar_text',
        'qris_image',
        'qris_payload',
        'whatsapp_number',
        'whatsapp_message_template',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public static function activeSetting(): ?self
    {
        return static::where('is_active', true)->latest()->first();
    }
}
