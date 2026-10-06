<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SchoolSetting extends Model
{
    protected $fillable = [
        'school_name',
        'short_name',
        'tagline',
        'description',
        'logo_path',
        'hero_image_path',
        'building_image_path',
        'boarding_image_path',
        'meta_image',
        'whatsapp_number',
        'email',
        'address',
        'city',
        'province',
        'website_url',
        'instagram_url',
        'facebook_url',
        'youtube_url',
        'vision',
        'mission',
        'about_school',
        'about_boarding',
        'primary_color',
        'secondary_color',
        'is_active',
        'google_maps_embed_url',
        'google_maps_link',
        'letterhead_png',
        'public_dashboard_token',
        'default_letter_classification_code',
        'default_letter_school_code',
        'default_letter_show_basmallah',
        'default_letter_basmallah_text',
        'default_letter_show_closing_dua',
        'default_letter_closing_dua_text',
        'default_letter_pdf_font_size',
        'basmallah_image_path',
        'closing_dua_image_path',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'default_letter_show_basmallah' => 'boolean',
            'default_letter_show_closing_dua' => 'boolean',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public static function current(): ?self
    {
        return static::active()->first();
    }

    public function normalizedWhatsappNumber(): ?string
    {
        if (!$this->whatsapp_number) {
            return null;
        }

        $number = preg_replace('/[^0-9]/', '', $this->whatsapp_number);

        if (substr($number, 0, 1) === '0') {
            $number = '62' . substr($number, 1);
        }

        if (substr($number, 0, 2) !== '62') {
            $number = '62' . $number;
        }

        return $number;
    }

    public function whatsappLink(string $message = ''): ?string
    {
        $number = $this->normalizedWhatsappNumber();

        if (!$number) {
            return null;
        }

        $url = 'https://wa.me/' . $number;

        if ($message) {
            $url .= '?text=' . urlencode($message);
        }

        return $url;
    }
}
