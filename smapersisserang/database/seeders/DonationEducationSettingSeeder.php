<?php

namespace Database\Seeders;

use App\Models\DonationEducationSetting;
use Illuminate\Database\Seeder;

class DonationEducationSettingSeeder extends Seeder
{
    public function run(): void
    {
        DonationEducationSetting::firstOrCreate(
            ['id' => 1],
            [
                'hero_title' => 'Donasi Pendidikan & Makan Santri',
                'hero_subtitle' => 'Bersama mendukung pendidikan gratis dan kebutuhan makan santri SMA Persis Serang.',
                'hero_image' => null,
                'hadith_text' => 'Barangsiapa menempuh jalan untuk mencari ilmu, Allah akan mudahkan baginya jalan menuju surga.',
                'hadith_source' => 'HR. Muslim',
                'intro_title' => 'Menopang Pendidikan dan Kebutuhan Harian Santri',
                'intro_text' => 'SMA Persis Serang berikhtiar menghadirkan pendidikan yang terjangkau, bahkan menggratiskan biaya pendidikan dan biaya makan asrama bagi anak-anak yang membutuhkan. Program ini menjadi kesempatan bagi kaum muslimin untuk ikut menyuburkan ladang pahala melalui sedekah dan infak pendidikan.',
                'section_image' => null,
                'donation_items' => [
                    'Beras',
                    'Telur',
                    'Sayuran',
                    'Lauk pauk',
                    'Sembako',
                    'Donasi uang',
                    'Kebutuhan dapur/asrama lainnya',
                ],
                'invitation_text' => 'Yang memiliki beras, bisa menitipkan berasnya. Yang memiliki telur, bisa menitipkan telurnya. Yang memiliki sayuran, bisa menitipkan sayurannya. Apabila diperlukan, insyaAllah kami siap menjemput donasi ke tempat Bapak/Ibu/Saudara/i.',
                'whatsapp_number' => '6289661234569',
                'whatsapp_button_text' => 'Hubungi WA SMA Persis Serang',
                'whatsapp_message' => 'Assalamu\'alaikum, saya ingin berdonasi untuk program pendidikan dan makan santri SMA Persis Serang',
                'share_button_text' => 'Sebarkan Informasi Kebaikan Ini',
                'share_message' => 'Assalamu’alaikum. Mari ikut mendukung program pendidikan gratis dan makan santri SMA Persis Serang. Donasi bisa berupa beras, telur, sayur, sembako, atau uang. Hubungi WA 6289661234569.',
                'is_active' => true,
            ]
        );
    }
}
