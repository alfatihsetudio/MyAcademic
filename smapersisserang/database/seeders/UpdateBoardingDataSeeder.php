<?php

namespace Database\Seeders;

use App\Models\BoardingCard;
use App\Models\BoardingSchedule;
use Illuminate\Database\Seeder;

class UpdateBoardingDataSeeder extends Seeder
{
    public function run(): void
    {
        // ==========================================
        // A. Replace all daily schedules
        // ==========================================
        BoardingSchedule::where('schedule_type', 'daily')->delete();

        $dailySchedules = [
            ['time' => '04.00 – 04.15', 'title' => 'Bangun & Tahfidz Pagi', 'description' => 'Santri bangun, persiapan diri, dan mengikuti tahfidz pagi dengan bimbingan murobi/murobiah. Bagi santri yang ingin melaksanakan qiyamul lail dapat dilakukan sebelum pukul 04.15.', 'color' => 'emerald', 'sort_order' => 1],
            ['time' => '05.00', 'title' => 'Salat Subuh Berjamaah', 'description' => 'Seluruh santri melaksanakan salat Subuh berjamaah. Waktu sebelum salat Subuh bersifat fleksibel menyesuaikan kondisi santri.', 'color' => 'emerald', 'sort_order' => 2],
            ['time' => '05.00 – 07.15', 'title' => 'Kepondokan, Makan & Mandi', 'description' => 'Kegiatan kepondokan pagi, makan pagi, mandi, dan persiapan mengikuti pembelajaran di kelas.', 'color' => 'amber', 'sort_order' => 3],
            ['time' => '07.15 – 15.00', 'title' => 'KBM / Pembelajaran di Kelas', 'description' => 'Santri mengikuti kegiatan belajar mengajar di kelas sesuai jadwal sekolah.', 'color' => 'emerald', 'sort_order' => 4],
            ['time' => '15.00 – 16.00', 'title' => 'Salat Ashar & Bersih-bersih', 'description' => 'Salat Ashar berjamaah, dilanjutkan bersih-bersih dan pembinaan kerapihan lingkungan.', 'color' => 'amber', 'sort_order' => 5],
            ['time' => '16.00 – 18.00', 'title' => 'Ekskul Pesantren & Mandi', 'description' => 'Kegiatan ekstrakurikuler pesantren, aktivitas sore, dan persiapan mandi sebelum kegiatan malam.', 'color' => 'emerald', 'sort_order' => 6],
            ['time' => '18.00 – 18.50', 'title' => 'Salat Magrib, Makan & Istirahat', 'description' => 'Salat Magrib berjamaah, makan malam, dan istirahat singkat.', 'color' => 'emerald', 'sort_order' => 7],
            ['time' => 'Sebelum Isya', 'title' => 'Persiapan Salat Isya', 'description' => 'Santri sudah siap melaksanakan salat Isya minimal 10 menit sebelum waktu salat.', 'color' => 'amber', 'sort_order' => 8],
            ['time' => '19.30 – 21.15', 'title' => 'Pembelajaran Terarah & Konseling', 'description' => 'Pembelajaran terarah dengan pendampingan murobi dan guru bergilir, termasuk bimbingan belajar dan konseling santri.', 'color' => 'emerald', 'sort_order' => 9],
            ['time' => '21.15 – 22.00', 'title' => 'Evaluasi Santri', 'description' => 'Evaluasi harian santri, muhasabah, dan persiapan istirahat malam.', 'color' => 'amber', 'sort_order' => 10],
            ['time' => '22.00', 'title' => 'Waktu Tidur', 'description' => 'Seluruh santri wajib tidur dan beristirahat malam.', 'color' => 'gray', 'sort_order' => 11],
        ];

        foreach ($dailySchedules as $s) {
            BoardingSchedule::create(array_merge($s, ['schedule_type' => 'daily', 'is_active' => true]));
        }

        $this->command->info('11 daily schedules inserted.');

        // ==========================================
        // B. Replace all holiday schedules
        // ==========================================
        BoardingSchedule::where('schedule_type', 'holiday')->delete();

        $holidaySchedules = [
            ['time' => '04.00 – 06.00', 'title' => 'Jadwal Pagi Seperti Biasa', 'description' => 'Jadwal pagi tetap berjalan seperti biasa, meliputi bangun tidur, tahfidz, salat Subuh berjamaah, dan pembinaan pagi.', 'color' => 'emerald', 'sort_order' => 1],
            ['time' => '06.00 – 07.30', 'title' => 'Olahraga & Makan Pagi', 'description' => 'Santri mengikuti olahraga keluar area sekolah dengan pendampingan, kemudian dilanjutkan makan pagi.', 'color' => 'amber', 'sort_order' => 2],
            ['time' => '08.00', 'title' => 'Piket Akbar', 'description' => 'Santri melaksanakan piket akbar atau bersih-bersih lingkungan asrama dan sekolah.', 'color' => 'emerald', 'sort_order' => 3],
            ['time' => 'Setelah Piket', 'title' => 'Kegiatan Bebas Terarah', 'description' => 'Setelah piket akbar, santri mengikuti kegiatan bebas terarah. Santri boleh keluar dengan ketentuan dan izin tertentu dari pengelola asrama.', 'color' => 'amber', 'sort_order' => 4],
            ['time' => '16.00', 'title' => 'Kembali ke Asrama', 'description' => 'Seluruh santri wajib sudah kembali berada di lingkungan sekolah/asrama.', 'color' => 'emerald', 'sort_order' => 5],
            ['time' => '18.00', 'title' => 'Salat Magrib & Makan Malam', 'description' => 'Santri melaksanakan salat Magrib berjamaah, makan malam, dan melanjutkan kegiatan malam seperti biasa.', 'color' => 'emerald', 'sort_order' => 6],
        ];

        foreach ($holidaySchedules as $s) {
            BoardingSchedule::create(array_merge($s, ['schedule_type' => 'holiday', 'is_active' => true]));
        }

        $this->command->info('6 holiday schedules inserted.');

        // ==========================================
        // C. Update info cards
        // ==========================================
        $infoCards = [
            [
                'title_match' => 'Kunjungan Orang Tua',
                'title' => 'Kunjungan Orang Tua',
                'description' => 'Jadwal kunjungan orang tua/wali santri dilaksanakan sebanyak 2 kali dalam satu bulan sesuai jadwal yang ditetapkan oleh pengelola asrama.',
                'icon' => 'users',
                'color' => 'emerald',
                'sort_order' => 1,
            ],
            [
                'title_match' => 'Rihlah Santri',
                'title' => 'Rihlah Santri',
                'description' => 'Kegiatan rihlah santri dilaksanakan setelah UTS atau sekitar 3 bulan sekali sebagai bagian dari pembinaan, penyegaran, dan penguatan kebersamaan santri.',
                'icon' => 'map',
                'color' => 'amber',
                'sort_order' => 2,
            ],
            [
                'title_match' => 'Catatan Pembinaan',
                'title' => 'Catatan Pembinaan Boarding',
                'description' => 'Seluruh kegiatan boarding diarahkan untuk membentuk santri yang disiplin, mandiri, berakhlak baik, terbiasa ibadah berjamaah, serta mampu mengatur waktu antara belajar, ibadah, kebersihan, istirahat, dan pengembangan diri.',
                'icon' => 'heart',
                'color' => 'emerald',
                'sort_order' => 3,
            ],
        ];

        foreach ($infoCards as $card) {
            $existing = BoardingCard::where('type', 'info')
                ->where('title', $card['title_match'])
                ->first();

            if ($existing) {
                $existing->update([
                    'title' => $card['title'],
                    'description' => $card['description'],
                    'icon' => $card['icon'],
                    'color' => $card['color'],
                    'sort_order' => $card['sort_order'],
                    'is_active' => true,
                ]);
                $this->command->info("Updated info card: {$card['title']}");
            } else {
                BoardingCard::create([
                    'type' => 'info',
                    'title' => $card['title'],
                    'description' => $card['description'],
                    'icon' => $card['icon'],
                    'color' => $card['color'],
                    'sort_order' => $card['sort_order'],
                    'is_active' => true,
                ]);
                $this->command->info("Created info card: {$card['title']}");
            }
        }
    }
}
