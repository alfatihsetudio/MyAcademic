<?php

namespace Database\Seeders;

use App\Models\SchoolSubject;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class SchoolSubjectSeeder extends Seeder
{
    public function run(): void
    {
        SchoolSubject::where('category', 'kepersisan')->update(['category' => 'keislaman']);
        SchoolSubject::where('name', 'Kepersisan')->update([
            'name' => 'Keislaman dan Kejam’iyyahan',
            'category' => 'keislaman',
            'description' => 'Pengenalan nilai-nilai keislaman, adab berorganisasi, dan semangat berjamaah dalam kebaikan.',
        ]);
        SchoolSubject::where('name', "Ulumul Qur'an")->update([
            'name' => 'Ulumul Qur’an',
            'description' => 'Pengenalan ilmu-ilmu Al-Qur’an sebagai dasar pemahaman keislaman.',
        ]);

        $teachers = [
            'Kepala Sekolah' => ['name' => 'Dr. H. Ahmad Fauzi, M.Pd.', 'position' => 'Kepala Sekolah', 'teacher_quote' => 'Pendidikan adalah investasi terbaik untuk masa depan yang berakar pada iman dan akhlak.'],
            'Safitri, S.Pd.' => ['name' => 'Safitri, S.Pd.', 'teacher_quote' => 'Menanamkan cinta tanah air dan bangsa adalah bagian dari iman.'],
            'Iqbal Fuadi, M.Pd.' => ['name' => 'Iqbal Fuadi, M.Pd.', 'subject' => 'Bahasa Indonesia', 'teacher_quote' => 'Bahasa adalah jiwa bangsa; rawatlah dengan membaca dan menulis.'],
            'Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.' => ['name' => 'Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.', 'subject' => 'Matematika', 'teacher_quote' => 'Logika yang tertib melahirkan pemikiran yang jernih dan beradab.'],
            'Widda Taslimah, S.Pd.' => ['name' => 'Widda Taslimah, S.Pd.', 'subject' => 'Fisika', 'teacher_quote' => 'Alam semesta adalah ayat Allah yang terbentang; pelajarilah maka kau akan takjub.'],
            'Fina Sabrina' => ['name' => 'Fina Sabrina', 'subject' => 'Kimia', 'teacher_quote' => 'Ilmu adalah reaksi terbaik yang mengubah potensi menjadi prestasi.'],
            'Diana Nurazis, S.Pd.' => ['name' => 'Diana Nurazis, S.Pd.', 'subject' => 'Biologi', 'teacher_quote' => 'Setiap makhluk hidup adalah tanda kebesaran-Nya; jagalah dan pelajarilah.'],
            'Dr. Juarial, M.Pd.' => ['name' => 'Dr. Juarial, M.Pd.', 'subject' => 'Sejarah', 'teacher_quote' => 'Masa lalu bukan untuk diratapi, melainkan untuk diambil pelajaran bagi masa depan.'],
            'Hayatuddin Fikri, S.E.' => ['name' => 'Hayatuddin Fikri, S.E.', 'subject' => 'Ekonomi', 'teacher_quote' => 'Rezeki yang berkah lahir dari kerja keras, kejujuran, dan ilmu yang bermanfaat.'],
            'Evalia Nourmeisari' => ['name' => 'Evalia Nourmeisari', 'subject' => 'Sosiologi', 'teacher_quote' => 'Kebersamaan dalam keberagaman adalah kekuatan yang sesungguhnya.'],
            'Rizdki Elang Gumelar, M.Pd.' => ['name' => 'Rizdki Elang Gumelar, M.Pd.', 'subject' => 'Bahasa Inggris', 'teacher_quote' => 'Kuasai bahasa dunia sebarkan nilai-nilai kebaikan dari negeri sendiri.'],
            'Aip Saipul Mikdar' => ['name' => 'Aip Saipul Mikdar', 'subject' => 'PJOK', 'teacher_quote' => 'Sehat itu amanah; jaga tubuhmu agar bisa beribadah dan berkarya.'],
            'Sayuti, S.Kom' => ['name' => 'Sayuti, S.Kom', 'subject' => 'Informatika', 'teacher_quote' => 'Teknologi adalah alat, akhlak adalah tujuan. Gunakan keduanya secara seimbang.'],
            'Mahfudin, S.Sn.' => ['name' => 'Mahfudin, S.Sn.', 'subject' => 'Seni dan Budaya', 'teacher_quote' => 'Seni adalah bahasa universal yang menyatukan hati tanpa kata.'],
            'Wiwin Wihdatul' => ['name' => 'Wiwin Wihdatul', 'subject' => 'BK', 'teacher_quote' => 'Kenali dirimu, maka kau akan menemukan jalan terbaik untuk masa depanmu.'],
            'Rizky Jurnaliska, S.Sos., M.Si.' => ['name' => 'Rizky Jurnaliska, S.Sos., M.Si.', 'subject' => 'Maharotul Qiroah', 'teacher_quote' => 'Membaca Al-Qur\'an adalah cahaya hati yang menerangi setiap langkah kehidupan.'],
            'TB. Mujahidullah, SH' => ['name' => 'TB. Mujahidullah, SH', 'subject' => 'Ulumul Qur\'an', 'teacher_quote' => 'Al-Qur\'an bukan sekadar bacaan, tetapi petunjuk hidup yang harus dipahami dan diamalkan.'],
            'Ust. Rahmat Jaelani' => ['name' => 'Ust. Rahmat Jaelani', 'subject' => 'Ulumul Hadits', 'teacher_quote' => 'Meneladani Rasulullah adalah akhlak paling mulia yang bisa kita usahakan setiap hari.'],
            'Dr. Atang Soeryana, M.Pd.' => ['name' => 'Dr. Atang Soeryana, M.Pd.', 'subject' => 'Aqidah Akhlaq', 'teacher_quote' => 'Iman yang kokoh melahirkan akhlak yang indah dan kehidupan yang bermakna.'],
            'Dr. Dadi Cahyadi, ST., MT.' => ['name' => 'Dr. Dadi Cahyadi, ST., MT.', 'subject' => 'Keislaman dan Kejam\'iyyahan', 'teacher_quote' => 'Berjamaah dalam kebaikan adalah kekuatan yang tidak akan pernah pudar.'],
        ];

        $teacherModels = [];
        foreach ($teachers as $key => $data) {
            $teacherModels[$key] = Teacher::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }

        $subjects = [
            ['name' => 'Pendidikan Pancasila', 'category' => 'nasional', 'description' => 'Pembinaan wawasan kebangsaan, tanggung jawab, dan karakter warga negara.', 'sort_order' => 1, 'teachers' => ['Safitri, S.Pd.']],
            ['name' => 'Bahasa Indonesia', 'category' => 'nasional', 'description' => 'Pembelajaran bahasa, literasi, komunikasi, dan kemampuan menulis.', 'sort_order' => 2, 'teachers' => ['Iqbal Fuadi, M.Pd.']],
            ['name' => 'Matematika', 'category' => 'nasional', 'description' => 'Melatih logika, pemecahan masalah, dan cara berpikir sistematis.', 'sort_order' => 3, 'teachers' => ['Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.']],
            ['name' => 'Fisika', 'category' => 'nasional', 'description' => 'Memahami konsep alam, energi, gerak, dan penerapannya.', 'sort_order' => 4, 'teachers' => ['Widda Taslimah, S.Pd.']],
            ['name' => 'Kimia', 'category' => 'nasional', 'description' => 'Memahami materi, zat, reaksi, dan penerapannya dalam kehidupan.', 'sort_order' => 5, 'teachers' => ['Fina Sabrina']],
            ['name' => 'Biologi', 'category' => 'nasional', 'description' => 'Memahami makhluk hidup, lingkungan, dan kehidupan secara ilmiah.', 'sort_order' => 6, 'teachers' => ['Diana Nurazis, S.Pd.']],
            ['name' => 'Sejarah', 'category' => 'nasional', 'description' => 'Memahami perjalanan bangsa dan mengambil pelajaran dari sejarah.', 'sort_order' => 7, 'teachers' => ['Dr. Juarial, M.Pd.']],
            ['name' => 'Ekonomi', 'category' => 'nasional', 'description' => 'Memahami dasar ekonomi, pengelolaan sumber daya, dan kehidupan sosial.', 'sort_order' => 8, 'teachers' => ['Hayatuddin Fikri, S.E.']],
            ['name' => 'Sosiologi', 'category' => 'nasional', 'description' => 'Memahami masyarakat, interaksi sosial, dan kehidupan bermasyarakat.', 'sort_order' => 9, 'teachers' => ['Evalia Nourmeisari']],
            ['name' => 'Bahasa Inggris', 'category' => 'nasional', 'description' => 'Penguatan komunikasi dasar dalam bahasa internasional.', 'sort_order' => 10, 'teachers' => ['Rizdki Elang Gumelar, M.Pd.']],
            ['name' => 'PJOK', 'category' => 'nasional', 'description' => 'Menjaga kesehatan, kebugaran, dan sportivitas siswa.', 'sort_order' => 11, 'teachers' => ['Aip Saipul Mikdar']],
            ['name' => 'Informatika', 'category' => 'teknologi', 'description' => 'Pembelajaran teknologi informasi, literasi digital, logika, dan komputasi.', 'sort_order' => 1, 'teachers' => ['Sayuti, S.Kom']],
            ['name' => 'Seni dan Budaya', 'category' => 'nasional', 'description' => 'Mengembangkan kreativitas, apresiasi seni, dan budaya.', 'sort_order' => 12, 'teachers' => ['Mahfudin, S.Sn.']],
            ['name' => 'BK', 'category' => 'boarding', 'description' => 'Pendampingan perkembangan pribadi, belajar, sosial, dan karier siswa.', 'sort_order' => 1, 'teachers' => ['Wiwin Wihdatul']],
            ['name' => 'Maharotul Qiroah', 'category' => 'keislaman', 'description' => 'Pembinaan kemampuan membaca dan memahami teks keislaman.', 'sort_order' => 1, 'teachers' => ['Rizky Jurnaliska, S.Sos., M.Si.']],
            ['name' => 'Ulumul Qur’an', 'category' => 'keislaman', 'description' => 'Pengenalan ilmu-ilmu Al-Qur’an sebagai dasar pemahaman keislaman.', 'sort_order' => 2, 'teachers' => ['TB. Mujahidullah, SH']],
            ['name' => 'Ulumul Hadits', 'category' => 'keislaman', 'description' => 'Pengenalan ilmu hadits dan kedudukannya dalam ajaran Islam.', 'sort_order' => 3, 'teachers' => ['Ust. Rahmat Jaelani']],
            ['name' => 'Aqidah Akhlaq', 'category' => 'keislaman', 'description' => 'Penguatan aqidah dan pembiasaan akhlak Islami.', 'sort_order' => 4, 'teachers' => ['Dr. Atang Soeryana, M.Pd.']],
            ['name' => 'Keislaman dan Kejam’iyyahan', 'category' => 'keislaman', 'description' => 'Pengenalan nilai-nilai keislaman, adab berorganisasi, dan semangat berjamaah dalam kebaikan.', 'sort_order' => 5, 'teachers' => ['Dr. Dadi Cahyadi, ST., MT.']],
        ];

        foreach ($subjects as $data) {
            $teacherNames = $data['teachers'];
            unset($data['teachers']);

            $subject = SchoolSubject::updateOrCreate(
                ['name' => $data['name']],
                $data
            );

            $teacherIds = [];
            foreach ($teacherNames as $name) {
                if (isset($teacherModels[$name])) {
                    $teacherIds[] = $teacherModels[$name]->id;
                }
            }

            if (!empty($teacherIds)) {
                $subject->teachers()->syncWithoutDetaching($teacherIds);
            }
        }
    }
}
