<?php

namespace Database\Seeders;

use App\Models\WebsitePage;
use Illuminate\Database\Seeder;

class WebsitePageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'page_key' => 'home',
                'title' => 'SMA Persis Serang',
                'subtitle' => 'Islamic Boarding School Berbasis Akhlak dan Teknologi',
                'content' => 'SMA Persis Serang menghadirkan pendidikan Islam berasrama yang menguatkan akhlak, ilmu, kemandirian, dan literasi teknologi dalam lingkungan yang aman dan terarah.',
                'button_primary_text' => 'Daftar SPMB',
                'button_primary_url' => '/spmb/daftar',
                'button_secondary_text' => 'Cek Status',
                'button_secondary_url' => '/spmb/cek-status',
                'meta_description' => 'SMA Persis Serang, Islamic Boarding School berbasis akhlak dan teknologi di Serang, Banten.',
                'is_active' => true,
            ],
            [
                'page_key' => 'profile',
                'title' => 'Profil Sekolah',
                'subtitle' => 'Mengenal lebih dekat SMA Persis Serang',
                'content' => 'SMA Persis Serang adalah sekolah Islam berasrama yang membina siswa agar berilmu, beradab, mandiri, dan siap menghadapi perkembangan zaman.',
                'meta_description' => 'Profil SMA Persis Serang sebagai sekolah Islam berasrama di Serang, Banten.',
                'is_active' => true,
            ],
            [
                'page_key' => 'program',
                'title' => 'Program Pendidikan',
                'subtitle' => 'Kurikulum dan pembinaan yang memadukan akhlak, keislaman, kemandirian, dan teknologi.',
                'content' => 'Program pendidikan SMA Persis Serang memadukan kurikulum formal, pembinaan diniyah, pembiasaan ibadah, penguatan karakter, dan pembelajaran modern.',
                'button_primary_text' => 'Daftar SPMB',
                'button_primary_url' => '/spmb/daftar',
                'meta_description' => 'Program pendidikan SMA Persis Serang dengan kurikulum terpadu dan pembinaan boarding school.',
                'is_active' => true,
            ],
            [
                'page_key' => 'boarding',
                'title' => 'Islamic Boarding School',
                'subtitle' => 'Lingkungan pendidikan berasrama untuk membentuk akhlak, kemandirian, ibadah, dan kedisiplinan siswa.',
                'content' => json_encode([
                    'section_label' => 'PROGRAM ASRAMA',
                    'section_heading' => 'Mengapa Boarding School?',
                    'section_subtitle' => 'Konsep pendidikan berasrama yang disiapkan untuk membentuk akhlak, kemandirian, ibadah, dan kedisiplinan siswa.',
                    'schedule_heading' => 'Rancangan Jadwal Harian',
                    'schedule_subtitle' => 'Rancangan pembiasaan harian yang dapat disesuaikan dengan kalender akademik dan kebutuhan pembinaan siswa.',
                    'schedule_note' => 'Jadwal bersifat rancangan dan dapat menyesuaikan kondisi sekolah serta kalender akademik.',
                    'focus_heading' => 'Fokus Pembinaan Asrama',
                    'focus_subtitle' => 'Aspek pembinaan yang disiapkan untuk membentuk karakter Islami, mandiri, dan siap menghadapi masa depan.',
                    'why_boarding_cards' => [
                        ['title' => 'Pembinaan Akhlak Harian', 'description' => 'Program asrama dirancang untuk membiasakan adab, ibadah, dan akhlak Islami dalam kehidupan sehari-hari.', 'color' => 'emerald', 'icon' => 'building'],
                        ['title' => 'Kemandirian dan Disiplin', 'description' => 'Siswa akan dibimbing untuk belajar mandiri, mengatur waktu, menjaga kebersihan, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt'],
                        ['title' => 'Lingkungan Belajar Terarah', 'description' => 'Suasana asrama disiapkan agar mendukung belajar, pembinaan karakter, dan pendampingan akademik.', 'color' => 'emerald', 'icon' => 'academic'],
                        ['title' => 'Pengawasan & Pendampingan', 'description' => 'Sistem pendampingan dirancang agar perkembangan siswa dapat dipantau secara lebih dekat.', 'color' => 'amber', 'icon' => 'users'],
                    ],
                    'daily_schedule' => [
                        ['time' => '03.00', 'title' => 'Subuh & Pembinaan Ibadah', 'description' => 'Pembiasaan shalat Subuh berjamaah, dzikir pagi, dan pembinaan ibadah harian.', 'color' => 'emerald'],
                        ['time' => '07.00', 'title' => 'Pembelajaran Sekolah', 'description' => 'Belajar di kelas sesuai kurikulum nasional dengan pendekatan integratif.', 'color' => 'amber'],
                        ['time' => '12.00', 'title' => 'Istirahat & Kegiatan Mandiri', 'description' => 'Shalat Dzuhur, istirahat, dan waktu untuk kegiatan mandiri siswa.', 'color' => 'emerald'],
                        ['time' => '15.30', 'title' => 'Kajian / Tahsin / Pembinaan', 'description' => 'Kajian Islam, tahsin Al-Qur\'an, dan pembinaan karakter.', 'color' => 'amber'],
                        ['time' => '19.00', 'title' => 'Belajar Mandiri / Muhasabah', 'description' => 'Waktu belajar mandiri dan muhasabah malam yang dibimbing oleh pembina asrama.', 'color' => 'emerald'],
                        ['time' => '21.00', 'title' => 'Istirahat', 'description' => 'Persiapan tidur dan istirahat malam untuk memulihkan energi.', 'color' => 'gray'],
                    ],
                    'focus_cards' => [
                        ['title' => 'Ibadah', 'description' => 'Pembiasaan shalat berjamaah, puasa sunnah, dan amalan ibadah harian.', 'color' => 'emerald', 'icon' => 'building'],
                        ['title' => 'Adab', 'description' => 'Pembentukan adab Islami terhadap Allah, sesama, dan lingkungan menjadi perhatian utama.', 'color' => 'amber', 'icon' => 'shield'],
                        ['title' => 'Al-Qur\'an', 'description' => 'Program tahsin dan tahfidz Al-Qur\'an akan disesuaikan dengan kemampuan masing-masing siswa.', 'color' => 'emerald', 'icon' => 'academic'],
                        ['title' => 'Kemandirian', 'description' => 'Siswa akan dilatih mengurus diri sendiri, mengatur waktu, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt'],
                        ['title' => 'Teknologi', 'description' => 'Literasi digital dan keterampilan teknologi disiapkan sebagai bekal masa depan.', 'color' => 'emerald', 'icon' => 'cog'],
                        ['title' => 'Kepemimpinan', 'description' => 'Jiwa kepemimpinan akan dikembangkan melalui organisasi dan kegiatan sosial.', 'color' => 'amber', 'icon' => 'users'],
                    ],
                ]),
                'button_primary_text' => 'Daftar SPMB',
                'button_primary_url' => '/spmb/daftar',
                'meta_description' => 'Boarding school SMA Persis Serang untuk pembinaan akhlak, ibadah, kemandirian, dan kedisiplinan.',
                'is_active' => true,
            ],
            [
                'page_key' => 'gallery',
                'title' => 'Galeri Sekolah',
                'subtitle' => 'Dokumentasi lingkungan, kegiatan, dan pembinaan siswa.',
                'content' => 'Lihat dokumentasi lingkungan sekolah, kegiatan pembelajaran, aktivitas asrama, dan pembinaan siswa SMA Persis Serang.',
                'meta_description' => 'Galeri kegiatan dan lingkungan SMA Persis Serang.',
                'is_active' => true,
            ],
            [
                'page_key' => 'figures',
                'title' => 'Tokoh & Pembina',
                'subtitle' => 'Orang-orang yang membersamai pembinaan dan pengembangan SMA Persis Serang.',
                'content' => 'Tokoh, pembina, dan pengelola sekolah berperan dalam menjaga arah pendidikan, pembinaan, dan budaya Islami di SMA Persis Serang.',
                'meta_description' => 'Tokoh dan pembina SMA Persis Serang.',
                'is_active' => true,
            ],
            [
                'page_key' => 'teachers',
                'title' => 'Profil Guru',
                'subtitle' => 'Tenaga pendidik profesional yang berdedikasi tinggi',
                'content' => 'Guru SMA Persis Serang mendampingi proses belajar siswa dengan pendekatan akademik, pembinaan karakter, dan keteladanan.',
                'meta_description' => 'Profil guru dan tenaga pendidik SMA Persis Serang.',
                'is_active' => true,
            ],
            [
                'page_key' => 'struktur-organisasi',
                'title' => 'Struktur Organisasi',
                'subtitle' => 'Bagan Organisasi SMA Persis Serang',
                'content' => 'Struktur organisasi SMA Persis Serang disusun untuk mendukung pengelolaan sekolah berbasis pendidikan, pembinaan akhlak, dan sistem boarding school. Melalui pembagian tugas yang jelas, setiap bidang dapat bekerja secara tertib, terarah, dan bertanggung jawab.',
                'meta_description' => 'Struktur organisasi SMA Persis Serang.',
                'is_active' => true,
            ],
            [
                'page_key' => 'contact',
                'title' => 'Kontak',
                'subtitle' => 'Hubungi kami untuk informasi lebih lanjut',
                'content' => 'Hubungi SMA Persis Serang untuk informasi SPMB, program boarding school, kunjungan sekolah, dan kerja sama.',
                'button_primary_text' => 'Daftar SPMB',
                'button_primary_url' => '/ppdb/daftar',
                'meta_description' => 'Kontak SMA Persis Serang untuk informasi sekolah dan SPMB.',
                'is_active' => true,
            ],
        ];

        foreach ($pages as $page) {
            $existing = WebsitePage::where('page_key', $page['page_key'])->first();

            if ($existing && $page['page_key'] === 'boarding') {
                if ($existing->content !== null && $existing->content !== '') {
                    unset($page['content']);
                }
            }

            WebsitePage::updateOrCreate(
                ['page_key' => $page['page_key']],
                $page
            );
        }
    }
}
