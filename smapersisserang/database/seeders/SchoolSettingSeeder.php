<?php

namespace Database\Seeders;

use App\Models\SchoolSetting;
use Illuminate\Database\Seeder;

class SchoolSettingSeeder extends Seeder
{
    public function run(): void
    {
        SchoolSetting::updateOrCreate(
            ['id' => 1],
            [
            'school_name' => 'SMA Persis Serang',
            'short_name' => 'SMA Persis',
            'tagline' => 'Islamic Boarding School Berbasis Akhlak dan Teknologi',
            'description' => 'SMA Persis Serang adalah sekolah Islam berasrama yang memadukan pendidikan formal, pembinaan akhlak, keislaman, kemandirian, dan teknologi. Melalui lingkungan boarding school yang terarah, siswa dibina agar menjadi generasi berilmu, beradab, mandiri, dan siap menghadapi perkembangan zaman.',
            'email' => 'info@smapersisserang.sch.id',
            'address' => 'Serang, Banten',
            'city' => 'Serang',
            'province' => 'Banten',
            'website_url' => 'https://smapersisserang.sch.id',
            'vision' => 'Menjadi sekolah Islam berasrama yang unggul dalam akhlak, ilmu, kemandirian, dan teknologi.',
            'mission' => "Membina siswa agar memiliki akhlak dan adab Islami dalam kehidupan sehari-hari.\n\nMenguatkan pemahaman keislaman, ibadah, dan kecintaan terhadap Al-Qur'an.\n\nMembangun kemandirian, kedisiplinan, dan tanggung jawab melalui sistem boarding school.\n\nMengembangkan kemampuan akademik, literasi digital, dan keterampilan teknologi.\n\nMenciptakan lingkungan pendidikan yang aman, terarah, dan mendukung tumbuhnya karakter siswa.",
            'about_school' => 'SMA Persis Serang hadir sebagai sekolah Islam berasrama yang berfokus pada pembinaan akhlak, keilmuan, kemandirian, dan teknologi. Sekolah ini dirancang untuk menjadi tempat belajar yang nyaman, terarah, dan membentuk siswa agar memiliki karakter Islami serta kemampuan yang relevan dengan kebutuhan masa depan.',
            'about_boarding' => 'Sistem boarding school di SMA Persis Serang dirancang untuk membentuk kebiasaan baik siswa melalui pembinaan harian, kedisiplinan, ibadah, adab, belajar mandiri, dan kehidupan sosial yang terarah. Dengan tinggal di lingkungan asrama, siswa dibimbing agar tumbuh menjadi pribadi yang mandiri, bertanggung jawab, dan berakhlak.',
            'primary_color' => '#0F6B3A',
            'secondary_color' => '#D4A017',
            'is_active' => true,
            ]
        );
    }
}
