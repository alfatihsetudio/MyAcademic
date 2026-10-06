<?php

namespace Database\Seeders;

use App\Models\BoardingCard;
use App\Models\BoardingPageSetting;
use App\Models\BoardingSchedule;
use Illuminate\Database\Seeder;

class BoardingContentSeeder extends Seeder
{
    public function run(): void
    {
        if (!BoardingPageSetting::exists()) {
            BoardingPageSetting::create([
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
        }

        if (!BoardingCard::where('type', 'why_boarding')->exists()) {
            $whyCards = [
                ['title' => 'Pembinaan Akhlak Harian', 'description' => 'Program asrama dirancang untuk membiasakan adab, ibadah, dan akhlak Islami dalam kehidupan sehari-hari.', 'color' => 'emerald', 'icon' => 'building', 'sort_order' => 1],
                ['title' => 'Kemandirian dan Disiplin', 'description' => 'Siswa akan dibimbing untuk belajar mandiri, mengatur waktu, menjaga kebersihan, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt', 'sort_order' => 2],
                ['title' => 'Lingkungan Belajar Terarah', 'description' => 'Suasana asrama disiapkan agar mendukung belajar, pembinaan karakter, dan pendampingan akademik.', 'color' => 'emerald', 'icon' => 'academic', 'sort_order' => 3],
                ['title' => 'Pengawasan & Pendampingan', 'description' => 'Sistem pendampingan dirancang agar perkembangan siswa dapat dipantau secara lebih dekat.', 'color' => 'amber', 'icon' => 'users', 'sort_order' => 4],
            ];
            foreach ($whyCards as $card) {
                BoardingCard::create(array_merge($card, ['type' => 'why_boarding', 'is_active' => true]));
            }
        }

        if (!BoardingCard::where('type', 'focus')->exists()) {
            $focusCards = [
                ['title' => 'Ibadah', 'description' => 'Pembiasaan shalat berjamaah, puasa sunnah, dan amalan ibadah harian.', 'color' => 'emerald', 'icon' => 'building', 'sort_order' => 1],
                ['title' => 'Adab', 'description' => 'Pembentukan adab Islami terhadap Allah, sesama, dan lingkungan menjadi perhatian utama.', 'color' => 'amber', 'icon' => 'shield', 'sort_order' => 2],
                ['title' => 'Al-Qur\'an', 'description' => 'Program tahsin dan tahfidz Al-Qur\'an akan disesuaikan dengan kemampuan masing-masing siswa.', 'color' => 'emerald', 'icon' => 'academic', 'sort_order' => 3],
                ['title' => 'Kemandirian', 'description' => 'Siswa akan dilatih mengurus diri sendiri, mengatur waktu, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt', 'sort_order' => 4],
                ['title' => 'Teknologi', 'description' => 'Literasi digital dan keterampilan teknologi disiapkan sebagai bekal masa depan.', 'color' => 'emerald', 'icon' => 'cog', 'sort_order' => 5],
                ['title' => 'Kepemimpinan', 'description' => 'Jiwa kepemimpinan akan dikembangkan melalui organisasi dan kegiatan sosial.', 'color' => 'amber', 'icon' => 'users', 'sort_order' => 6],
            ];
            foreach ($focusCards as $card) {
                BoardingCard::create(array_merge($card, ['type' => 'focus', 'is_active' => true]));
            }
        }

        if (!BoardingCard::where('type', 'info')->exists()) {
            $infoCards = [
                ['title' => 'Kunjungan Orang Tua', 'description' => 'Jadwal kunjungan orang tua/wali santri dilaksanakan sebanyak 2 kali dalam satu bulan sesuai jadwal yang ditetapkan oleh pengelola asrama.', 'color' => 'emerald', 'icon' => 'users', 'sort_order' => 1],
                ['title' => 'Rihlah Santri', 'description' => 'Kegiatan rihlah santri dilaksanakan setelah UTS atau sekitar 3 bulan sekali sebagai bagian dari pembinaan, penyegaran, dan penguatan kebersamaan santri.', 'color' => 'amber', 'icon' => 'map', 'sort_order' => 2],
                ['title' => 'Catatan Pembinaan', 'description' => 'Seluruh kegiatan boarding diarahkan untuk membentuk santri yang disiplin, mandiri, berakhlak baik, terbiasa ibadah berjamaah, serta mampu mengatur waktu antara belajar, ibadah, kebersihan, istirahat, dan pengembangan diri.', 'color' => 'emerald', 'icon' => 'heart', 'sort_order' => 3],
            ];
            foreach ($infoCards as $card) {
                BoardingCard::create(array_merge($card, ['type' => 'info', 'is_active' => true]));
            }
        }

        if (!BoardingSchedule::exists()) {
            $schedules = [
                ['time' => '03.00', 'title' => 'Subuh & Pembinaan Ibadah', 'description' => 'Pembiasaan shalat Subuh berjamaah, dzikir pagi, dan pembinaan ibadah harian.', 'color' => 'emerald', 'sort_order' => 1],
                ['time' => '07.00', 'title' => 'Pembelajaran Sekolah', 'description' => 'Belajar di kelas sesuai kurikulum nasional dengan pendekatan integratif.', 'color' => 'amber', 'sort_order' => 2],
                ['time' => '12.00', 'title' => 'Istirahat & Kegiatan Mandiri', 'description' => 'Shalat Dzuhur, istirahat, dan waktu untuk kegiatan mandiri siswa.', 'color' => 'emerald', 'sort_order' => 3],
                ['time' => '15.30', 'title' => 'Kajian / Tahsin / Pembinaan', 'description' => 'Kajian Islam, tahsin Al-Qur\'an, dan pembinaan karakter.', 'color' => 'amber', 'sort_order' => 4],
                ['time' => '19.00', 'title' => 'Belajar Mandiri / Muhasabah', 'description' => 'Waktu belajar mandiri dan muhasabah malam yang dibimbing oleh pembina asrama.', 'color' => 'emerald', 'sort_order' => 5],
                ['time' => '21.00', 'title' => 'Istirahat', 'description' => 'Persiapan tidur dan istirahat malam untuk memulihkan energi.', 'color' => 'gray', 'sort_order' => 6],
            ];
            foreach ($schedules as $schedule) {
                BoardingSchedule::create(array_merge($schedule, ['is_active' => true]));
            }
        }
    }
}
