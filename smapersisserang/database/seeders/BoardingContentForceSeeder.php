<?php

namespace Database\Seeders;

use App\Models\BoardingCard;
use App\Models\BoardingPageSetting;
use App\Models\BoardingSchedule;
use Illuminate\Database\Seeder;

class BoardingContentForceSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // BoardingPageSetting — force update
        // ==========================================
        BoardingPageSetting::updateOrCreate(['id' => 1], [
            'section_label' => 'PROGRAM ASRAMA',
            'section_heading' => 'Mengapa Boarding School?',
            'section_subtitle' => 'Konsep pendidikan berasrama yang disiapkan untuk membentuk akhlak, kemandirian, ibadah, dan kedisiplinan siswa.',
            'schedule_heading' => 'Rancangan Jadwal Harian',
            'schedule_subtitle' => 'Rancangan pembiasaan harian yang dapat disesuaikan dengan kalender akademik dan kebutuhan pembinaan siswa.',
            'schedule_note' => 'Jadwal bersifat rancangan dan dapat menyesuaikan kondisi sekolah serta kalender akademik.',
            'focus_heading' => 'Fokus Pembinaan Asrama',
            'focus_subtitle' => 'Aspek pembinaan yang disiapkan untuk membentuk karakter Islami, mandiri, dan siap menghadapi masa depan.',
            'why_heading' => 'Mengapa Boarding School?',
            'why_subtitle' => 'Konsep pendidikan berasrama yang disiapkan untuk membentuk akhlak, kemandirian, ibadah, dan kedisiplinan siswa.',
            'is_active' => true,
        ]);

        $this->command->info('BoardingPageSetting upserted.');

        // ==========================================
        // BoardingCard — delete all, re-insert
        // ==========================================
        BoardingCard::query()->delete();

        $cards = [
            // why_boarding
            ['type' => 'why_boarding', 'title' => 'Pembinaan Akhlak Harian', 'description' => 'Program asrama dirancang untuk membiasakan adab, ibadah, dan akhlak Islami dalam kehidupan sehari-hari.', 'color' => 'emerald', 'icon' => 'building', 'sort_order' => 1, 'is_active' => true],
            ['type' => 'why_boarding', 'title' => 'Kemandirian dan Disiplin', 'description' => 'Siswa akan dibimbing untuk belajar mandiri, mengatur waktu, menjaga kebersihan, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt', 'sort_order' => 2, 'is_active' => true],
            ['type' => 'why_boarding', 'title' => 'Lingkungan Belajar Terarah', 'description' => 'Suasana asrama disiapkan agar mendukung belajar, pembinaan karakter, dan pendampingan akademik.', 'color' => 'emerald', 'icon' => 'academic', 'sort_order' => 3, 'is_active' => true],
            ['type' => 'why_boarding', 'title' => 'Pengawasan & Pendampingan', 'description' => 'Sistem pendampingan dirancang agar perkembangan siswa dapat dipantau secara lebih dekat.', 'color' => 'amber', 'icon' => 'users', 'sort_order' => 4, 'is_active' => true],
            // focus
            ['type' => 'focus', 'title' => 'Ibadah', 'description' => 'Pembiasaan shalat berjamaah, puasa sunnah, dan amalan ibadah harian.', 'color' => 'emerald', 'icon' => 'building', 'sort_order' => 1, 'is_active' => true],
            ['type' => 'focus', 'title' => 'Adab', 'description' => 'Pembentukan adab Islami terhadap Allah, sesama, dan lingkungan menjadi perhatian utama.', 'color' => 'amber', 'icon' => 'shield', 'sort_order' => 2, 'is_active' => true],
            ['type' => 'focus', 'title' => "Al-Qur'an", 'description' => "Program tahsin dan tahfidz Al-Qur'an akan disesuaikan dengan kemampuan masing-masing siswa.", 'color' => 'emerald', 'icon' => 'academic', 'sort_order' => 3, 'is_active' => true],
            ['type' => 'focus', 'title' => 'Kemandirian', 'description' => 'Siswa akan dilatih mengurus diri sendiri, mengatur waktu, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt', 'sort_order' => 4, 'is_active' => true],
            ['type' => 'focus', 'title' => 'Teknologi', 'description' => 'Literasi digital dan keterampilan teknologi disiapkan sebagai bekal masa depan.', 'color' => 'emerald', 'icon' => 'cog', 'sort_order' => 5, 'is_active' => true],
            ['type' => 'focus', 'title' => 'Kepemimpinan', 'description' => 'Jiwa kepemimpinan akan dikembangkan melalui organisasi dan kegiatan sosial.', 'color' => 'amber', 'icon' => 'users', 'sort_order' => 6, 'is_active' => true],
            // info
            ['type' => 'info', 'title' => 'Kunjungan Orang Tua', 'description' => 'Jadwal kunjungan orang tua/wali santri dilaksanakan sebanyak 2 kali dalam satu bulan sesuai jadwal yang ditetapkan oleh pengelola asrama.', 'color' => 'emerald', 'icon' => 'users', 'sort_order' => 1, 'is_active' => true],
            ['type' => 'info', 'title' => 'Rihlah Santri', 'description' => 'Kegiatan rihlah santri dilaksanakan setelah UTS atau sekitar 3 bulan sekali sebagai bagian dari pembinaan, penyegaran, dan penguatan kebersamaan santri.', 'color' => 'amber', 'icon' => 'map', 'sort_order' => 2, 'is_active' => true],
            ['type' => 'info', 'title' => 'Catatan Pembinaan Boarding', 'description' => 'Seluruh kegiatan boarding diarahkan untuk membentuk santri yang disiplin, mandiri, berakhlak baik, terbiasa ibadah berjamaah, serta mampu mengatur waktu antara belajar, ibadah, kebersihan, istirahat, dan pengembangan diri.', 'color' => 'emerald', 'icon' => 'heart', 'sort_order' => 3, 'is_active' => true],
        ];

        foreach ($cards as $card) {
            BoardingCard::create($card);
        }

        $this->command->info(count($cards) . ' boarding cards inserted (why_boarding: 4, focus: 6, info: 3).');

        // ==========================================
        // BoardingSchedule — delete all, re-insert
        // ==========================================
        BoardingSchedule::query()->delete();

        $schedules = [
            // daily
            ['schedule_type' => 'daily', 'time' => '04.00 – 04.15', 'title' => 'Bangun & Tahfidz Pagi', 'description' => 'Santri bangun, persiapan diri, dan mengikuti tahfidz pagi dengan bimbingan murobi/murobiah. Bagi santri yang ingin melaksanakan qiyamul lail dapat dilakukan sebelum pukul 04.15.', 'color' => 'emerald', 'sort_order' => 1, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '05.00', 'title' => 'Salat Subuh Berjamaah', 'description' => 'Seluruh santri melaksanakan salat Subuh berjamaah. Waktu sebelum salat Subuh bersifat fleksibel menyesuaikan kondisi santri.', 'color' => 'emerald', 'sort_order' => 2, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '05.00 – 07.15', 'title' => 'Kepondokan, Makan & Mandi', 'description' => 'Kegiatan kepondokan pagi, makan pagi, mandi, dan persiapan mengikuti pembelajaran di kelas.', 'color' => 'emerald', 'sort_order' => 3, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '07.15 – 15.00', 'title' => 'KBM / Pembelajaran di Kelas', 'description' => 'Santri mengikuti kegiatan belajar mengajar di kelas sesuai jadwal sekolah.', 'color' => 'amber', 'sort_order' => 4, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '15.00 – 16.00', 'title' => 'Salat Ashar & Bersih-bersih', 'description' => 'Salat Ashar berjamaah, dilanjutkan bersih-bersih dan pembinaan kerapihan lingkungan.', 'color' => 'emerald', 'sort_order' => 5, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '16.00 – 18.00', 'title' => 'Ekskul Pesantren & Mandi', 'description' => 'Kegiatan ekstrakurikuler pesantren, aktivitas sore, dan persiapan mandi sebelum kegiatan malam.', 'color' => 'amber', 'sort_order' => 6, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '18.00 – 18.50', 'title' => 'Salat Magrib, Makan & Istirahat', 'description' => 'Salat Magrib berjamaah, makan malam, dan istirahat singkat.', 'color' => 'emerald', 'sort_order' => 7, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => 'Sebelum Isya', 'title' => 'Persiapan Salat Isya', 'description' => 'Santri sudah siap melaksanakan salat Isya minimal 10 menit sebelum waktu salat.', 'color' => 'emerald', 'sort_order' => 8, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '19.30 – 21.15', 'title' => 'Pembelajaran Terarah & Konseling', 'description' => 'Pembelajaran terarah dengan pendampingan murobi dan guru bergilir, termasuk bimbingan belajar dan konseling santri.', 'color' => 'amber', 'sort_order' => 9, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '21.15 – 22.00', 'title' => 'Evaluasi Santri', 'description' => 'Evaluasi harian santri, muhasabah, dan persiapan istirahat malam.', 'color' => 'emerald', 'sort_order' => 10, 'is_active' => true],
            ['schedule_type' => 'daily', 'time' => '22.00', 'title' => 'Waktu Tidur', 'description' => 'Seluruh santri wajib tidur dan beristirahat malam.', 'color' => 'gray', 'sort_order' => 11, 'is_active' => true],
            // holiday
            ['schedule_type' => 'holiday', 'time' => '04.00 – 06.00', 'title' => 'Jadwal Pagi Seperti Biasa', 'description' => 'Jadwal pagi tetap berjalan seperti biasa, meliputi bangun tidur, tahfidz, salat Subuh berjamaah, dan pembinaan pagi.', 'color' => 'emerald', 'sort_order' => 1, 'is_active' => true],
            ['schedule_type' => 'holiday', 'time' => '06.00 – 07.30', 'title' => 'Olahraga & Makan Pagi', 'description' => 'Santri mengikuti olahraga keluar area sekolah dengan pendampingan, kemudian dilanjutkan makan pagi.', 'color' => 'amber', 'sort_order' => 2, 'is_active' => true],
            ['schedule_type' => 'holiday', 'time' => '08.00', 'title' => 'Piket Akbar', 'description' => 'Santri melaksanakan piket akbar atau bersih-bersih lingkungan asrama dan sekolah.', 'color' => 'emerald', 'sort_order' => 3, 'is_active' => true],
            ['schedule_type' => 'holiday', 'time' => 'Setelah Piket', 'title' => 'Kegiatan Bebas Terarah', 'description' => 'Setelah piket akbar, santri mengikuti kegiatan bebas terarah. Santri boleh keluar dengan ketentuan dan izin tertentu dari pengelola asrama.', 'color' => 'amber', 'sort_order' => 4, 'is_active' => true],
            ['schedule_type' => 'holiday', 'time' => '16.00', 'title' => 'Kembali ke Asrama', 'description' => 'Seluruh santri wajib sudah kembali berada di lingkungan sekolah/asrama.', 'color' => 'emerald', 'sort_order' => 5, 'is_active' => true],
            ['schedule_type' => 'holiday', 'time' => '18.00', 'title' => 'Salat Magrib & Makan Malam', 'description' => 'Santri melaksanakan salat Magrib berjamaah, makan malam, dan melanjutkan kegiatan malam seperti biasa.', 'color' => 'emerald', 'sort_order' => 6, 'is_active' => true],
        ];

        foreach ($schedules as $s) {
            BoardingSchedule::create($s);
        }

        $this->command->info('17 boarding schedules inserted (daily: 11, holiday: 6).');
    }
}
