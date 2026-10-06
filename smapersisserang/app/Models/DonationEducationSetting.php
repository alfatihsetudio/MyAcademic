<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationEducationSetting extends Model
{
    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_image',
        'hadith_text',
        'hadith_source',
        'intro_title',
        'intro_text',
        'section_image',
        'donation_items',
        'invitation_text',
        'whatsapp_number',
        'whatsapp_button_text',
        'whatsapp_message',
        'share_button_text',
        'share_message',
        'donation_qris_image',
        'donation_qris_payload',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'donation_items' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public static function activeSetting(): ?self
    {
        return static::where('is_active', true)->latest()->first();
    }
}
