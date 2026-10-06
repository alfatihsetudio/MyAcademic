<?php

namespace Database\Seeders;

use App\Models\WaqfSetting;
use Illuminate\Database\Seeder;

class WaqfSettingSeeder extends Seeder
{
    public function run(): void
    {
        WaqfSetting::firstOrCreate(
            ['id' => 1],
            [
                'hero_title' => 'Wakaf Uang',
                'hero_subtitle' => 'Salurkan harta terbaik Anda untuk kemaslahatan ummat melalui wakaf uang di SMA Persis Serang.',
                'hero_image' => null,
                'intro_title' => 'Apa itu Wakaf Uang?',
                'intro_text' => 'Wakaf uang adalah wakaf dalam bentuk uang tunai yang dikelola secara produktif untuk kepentingan pendidikan dan dakwah. Nilainya tetap, pahalanya terus mengalir.',
                'waqf_purpose_text' => 'Hasil wakaf uang dikelola untuk mendukung operasional pendidikan, beasiswa santri, pemeliharaan fasilitas sekolah, dan program dakwah SMA Persis Serang.',
                'ikrar_text' => 'Saya mewakafkan uang saya sebesar nominal tersebut di atas untuk dikelola oleh SMA Persis Serang sebagai wakaf uang. Semoga Allah menerima dan menjadikannya amal jariyah yang terus mengalir pahalanya.',
                'qris_image' => null,
                'qris_payload' => null,
                'whatsapp_number' => '6289661234569',
                'whatsapp_message_template' => "Assalamu'alaikum.\n\n"
                    . "Saya {nama} ingin berwakaf uang sebesar Rp{nominal} melalui SMA Persis Serang.\n\n"
                    . "Mohon informasi lebih lanjut.\n\n"
                    . "Wassalamu'alaikum.",
                'is_active' => true,
            ]
        );
    }
}
