<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AiFaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Apa itu SMA Persis Serang?',
                'answer' => 'SMA Persis Serang adalah sekolah menengah atas berbasis Islamic Boarding School yang memadukan pendidikan agama, akhlak, teknologi, dan kemampuan berpikir kritis. Sekolah ini berkomitmen membentuk peserta didik yang beradab, berda\'wah, dan berpikir kritis.',
                'category' => 'Umum',
                'sort_order' => 1,
            ],
            [
                'question' => 'Di mana lokasi SMA Persis Serang?',
                'answer' => 'SMA Persis Serang berlokasi di Kota Serang, Banten. Untuk alamat lengkap, silakan hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'Umum',
                'sort_order' => 2,
            ],
            [
                'question' => 'Apa keunggulan SMA Persis Serang?',
                'answer' => 'Keunggulan SMA Persis Serang:
• Boarding school penuh (sistem asrama)
• Gratis biaya sekolah dan asrama untuk angkatan pertama
• Kurikulum perpaduan agama dan teknologi
• Pembelajaran kitab kuning dan Arab gundul
• Pembinaan akhlak dan dakwah secara intensif

Untuk informasi lebih lanjut, hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'Umum',
                'sort_order' => 3,
            ],
            [
                'question' => 'Apa jargon SMA Persis Serang?',
                'answer' => 'Jargon SMA Persis Serang adalah: Beradab - Berda\'wah - Berpikir Kritis.',
                'category' => 'Umum',
                'sort_order' => 4,
            ],
            [
                'question' => 'Apakah SMA Persis Serang berbasis boarding school?',
                'answer' => 'Ya, SMA Persis Serang adalah sekolah berasrama atau Islamic Boarding School. Seluruh siswa tinggal di asrama selama masa pendidikan, sehingga pembinaan karakter dan ibadah bisa berjalan maksimal.',
                'category' => 'Asrama',
                'sort_order' => 5,
            ],
            [
                'question' => 'Apa itu SPMB?',
                'answer' => 'SPMB adalah singkatan dari Sistem Penerimaan Murid Baru. Istilah ini digunakan di SMA Persis Serang untuk proses pendaftaran dan seleksi calon siswa baru.',
                'category' => 'SPMB',
                'sort_order' => 6,
            ],
            [
                'question' => 'Apakah pendaftaran siswa baru sudah dibuka?',
                'answer' => 'Untuk informasi status pendaftaran, silakan kunjungi website resmi kami di smapersisserang.sch.id atau hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'SPMB',
                'sort_order' => 7,
            ],
            [
                'question' => 'Bagaimana cara mendaftar ke SMA Persis Serang?',
                'answer' => 'Pendaftaran dapat dilakukan secara online melalui website smapersisserang.sch.id. Kunjungi menu SPMB, lalu klik tombol Daftar SPMB. Isi formulir pendaftaran dengan lengkap dan submit. Jika mengalami kendala, hubungi panitia SPMB di 089661234569.',
                'category' => 'SPMB',
                'sort_order' => 8,
            ],
            [
                'question' => 'Apakah biaya sekolah gratis?',
                'answer' => 'Untuk angkatan pertama, biaya sekolah GRATIS selama 3 tahun. Ini adalah program khusus dari SMA Persis Serang untuk memberikan kesempatan terbaik bagi calon siswa berprestasi. Untuk angkatan selanjutnya, silakan hubungi panitia SPMB untuk informasi biaya.',
                'category' => 'Biaya',
                'sort_order' => 9,
            ],
            [
                'question' => 'Apakah biaya asrama juga gratis?',
                'answer' => 'Ya, untuk angkatan pertama, biaya asrama juga GRATIS selama 3 tahun, tidak hanya biaya sekolah. Program gratis biaya sekolah dan asrama ini berlaku penuh untuk 36 siswa angkatan pertama.',
                'category' => 'Biaya',
                'sort_order' => 10,
            ],
            [
                'question' => 'Berapa kuota siswa angkatan pertama?',
                'answer' => 'Kuota untuk angkatan pertama SMA Persis Serang adalah 36 siswa. Mengingat kuota terbatas, kami sarankan segera mendaftar melalui website smapersisserang.sch.id.',
                'category' => 'SPMB',
                'sort_order' => 11,
            ],
            [
                'question' => 'Program gratis berlaku untuk siapa?',
                'answer' => 'Program gratis biaya sekolah dan asrama berlaku untuk seluruh siswa angkatan pertama, tanpa syarat khusus selain memenuhi persyaratan pendaftaran dan diterima sebagai siswa SMA Persis Serang.',
                'category' => 'Biaya',
                'sort_order' => 12,
            ],
            [
                'question' => 'Apa saja syarat pendaftaran?',
                'answer' => 'Syarat pendaftaran meliputi:
• Scan ijazah atau SKL / surat keterangan aktif kelas 9 SMP/MTs
• Scan akta kelahiran
• Scan kartu keluarga
• Screenshot NISN
• Nilai rapor semester 1–5
• Pas foto berwarna 3x4 dengan latar merah
• Dokumen tambahan jika ada: KIP, PKH, atau SKTM untuk jalur afirmasi

Untuk informasi lengkap dan terbaru, silakan hubungi panitia SPMB melalui WhatsApp 089661234569.',
                'category' => 'SPMB',
                'sort_order' => 13,
            ],
            [
                'question' => 'Apakah pendaftaran bisa dilakukan online?',
                'answer' => 'Ya, pendaftaran bisa dilakukan secara online melalui website smapersisserang.sch.id. Kunjungi menu SPMB dan klik tombol Daftar SPMB.',
                'category' => 'SPMB',
                'sort_order' => 14,
            ],
            [
                'question' => 'Apakah menerima siswa laki-laki dan perempuan?',
                'answer' => 'Untuk informasi lebih lanjut mengenai penerimaan siswa laki-laki dan perempuan, silakan hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'SPMB',
                'sort_order' => 15,
            ],
            [
                'question' => 'Apakah ada tes masuk?',
                'answer' => 'Ya, terdapat proses seleksi untuk calon siswa baru. Untuk informasi detail mengenai jenis tes, jadwal, dan materi seleksi, silakan hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'SPMB',
                'sort_order' => 16,
            ],
            [
                'question' => 'Apa saja program pembinaan di asrama?',
                'answer' => 'Program pembinaan di asrama meliputi:
• Pembinaan ibadah harian
• Tahsin dan tahfidz Al-Qur\'an
• Kajian kitab kuning dan Arab gundul
• Pelatihan dakwah
• Pengembangan soft skill
• Kegiatan olahraga dan seni

Untuk informasi lebih detail, silakan hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'Asrama',
                'sort_order' => 17,
            ],
            [
                'question' => 'Apakah ada pembelajaran kitab kuning atau Arab gundul?',
                'answer' => 'Ya, SMA Persis Serang memiliki program pembelajaran kitab kuning atau Arab gundul sebagai bagian dari kurikulum unggulan. Siswa akan dibimbing membaca, memahami, dan mengkaji kitab-kitab klasik sebagai bekal ilmu agama yang kokoh.',
                'category' => 'Program',
                'sort_order' => 18,
            ],
            [
                'question' => 'Apakah siswa belajar teknologi dan AI?',
                'answer' => 'Ya, SMA Persis Serang membekali siswa dengan kemampuan teknologi dan kecerdasan buatan (AI) sebagai bagian dari kurikulum modern. Kami meyakini penguasaan teknologi adalah kunci menghadapi tantangan zaman tanpa meninggalkan nilai-nilai keislaman.',
                'category' => 'Program',
                'sort_order' => 19,
            ],
            [
                'question' => 'Apa tujuan pendidikan SMA Persis Serang?',
                'answer' => 'Tujuan pendidikan SMA Persis Serang adalah mencetak generasi yang beradab dalam akhlak, mampu berda\'wah di masyarakat, dan memiliki kemampuan berpikir kritis. Kami ingin melahirkan pemimpin masa depan yang menguasai ilmu agama dan teknologi.',
                'category' => 'Umum',
                'sort_order' => 20,
            ],
            [
                'question' => 'Apakah cocok untuk anak yang ingin belajar agama dan teknologi?',
                'answer' => 'Sangat cocok. SMA Persis Serang dirancang khusus untuk siswa yang ingin mendalami ilmu agama sekaligus menguasai teknologi. Kurikulum kami memadukan kajian kitab kuning, dakwah, dan akhlak dengan pembelajaran teknologi dan AI.',
                'category' => 'Program',
                'sort_order' => 21,
            ],
            [
                'question' => 'Bagaimana kegiatan harian siswa di boarding school?',
                'answer' => 'Kegiatan harian siswa dimulai dari shalat Subuh berjamaah, kajian pagi, sekolah formal, kegiatan asrama, hingga pembinaan malam. Jadwal dirancang disiplin dan seimbang antara ibadah, belajar, dan pengembangan diri.',
                'category' => 'Asrama',
                'sort_order' => 22,
            ],
            [
                'question' => 'Apakah orang tua bisa menghubungi pihak sekolah?',
                'answer' => 'Tentu saja. Orang tua dapat menghubungi pihak sekolah melalui nomor WhatsApp panitia SPMB di 089661234569 untuk konsultasi dan informasi lebih lanjut.',
                'category' => 'Kontak',
                'sort_order' => 23,
            ],
            [
                'question' => 'Nomor WhatsApp panitia SPMB berapa?',
                'answer' => 'Nomor WhatsApp panitia SPMB SMA Persis Serang adalah 089661234569. Silakan hubungi untuk konsultasi pendaftaran, biaya, dan informasi lainnya.',
                'category' => 'Kontak',
                'sort_order' => 24,
            ],
            [
                'question' => 'Apa website resmi SMA Persis Serang?',
                'answer' => 'Website resmi SMA Persis Serang adalah smapersisserang.sch.id. Di website ini Anda bisa mendapatkan informasi lengkap tentang sekolah, SPMB, dan mendaftar secara online.',
                'category' => 'Kontak',
                'sort_order' => 25,
            ],
            [
                'question' => 'Apakah SMA Persis Serang punya guru pembimbing?',
                'answer' => 'Ya, SMA Persis Serang memiliki guru pembimbing dan ustadz/ustadzah yang kompeten di bidangnya. Para pembimbing siap mendampingi siswa dalam akademik, ibadah, dan pengembangan karakter selama di sekolah maupun asrama.',
                'category' => 'Umum',
                'sort_order' => 26,
            ],
            [
                'question' => 'Apakah sekolah ini berada di bawah Persis?',
                'answer' => 'Ya, SMA Persis Serang berada di bawah naungan Persatuan Islam (Persis), sebuah organisasi Islam yang telah memiliki lembaga pendidikan dari tingkat dasar hingga menengah. Hal ini memastikan kurikulum dan pembinaan sesuai dengan nilai-nilai Ahlussunnah wal Jama\'ah.',
                'category' => 'Umum',
                'sort_order' => 27,
            ],
            [
                'question' => 'Apakah tersedia fasilitas asrama?',
                'answer' => 'Ya, SMA Persis Serang menyediakan fasilitas asrama bagi seluruh siswa. Asrama dirancang untuk mendukung pembelajaran, ibadah, dan pembinaan karakter secara optimal. Untuk informasi lebih detail mengenai fasilitas, silakan hubungi panitia SPMB di 089661234569.',
                'category' => 'Asrama',
                'sort_order' => 28,
            ],
            [
                'question' => 'Apa yang membedakan SMA Persis Serang dengan sekolah biasa?',
                'answer' => 'Yang membedakan SMA Persis Serang dengan sekolah biasa:
• Sistem boarding school penuh (semua siswa tinggal di asrama)
• Kurikulum perpaduan agama dan teknologi
• Gratis biaya sekolah dan asrama untuk angkatan pertama
• Fokus pada akhlak, dakwah, dan berpikir kritis
• Pembinaan 24 jam oleh ustadz/ustadzah

Untuk informasi lebih lanjut, hubungi panitia SPMB di WhatsApp 089661234569.',
                'category' => 'Umum',
                'sort_order' => 29,
            ],
            [
                'question' => 'Bagaimana jika ingin bertanya lebih lanjut?',
                'answer' => 'Silakan hubungi panitia SPMB SMA Persis Serang melalui WhatsApp di 089661234569. Kami siap membantu menjawab pertanyaan Anda seputar pendaftaran, biaya, program sekolah, dan informasi lainnya.',
                'category' => 'Kontak',
                'sort_order' => 30,
            ],
            [
                'question' => 'Apa itu Persis?',
                'answer' => 'Persis adalah singkatan dari Persatuan Islam, yaitu organisasi Islam yang bergerak dalam bidang dakwah, pendidikan, dan pembinaan umat. SMA Persis Serang membawa nilai-nilai pendidikan Islam Persis dengan fokus pada ilmu, akhlak, dakwah, dan pembentukan generasi yang beradab serta berpikir kritis.',
                'category' => 'Umum',
                'sort_order' => 31,
            ],
            [
                'question' => 'Apakah SMA Persis Serang berada di bawah Persis?',
                'answer' => 'Ya, SMA Persis Serang merupakan sekolah yang membawa nilai pendidikan Persatuan Islam atau Persis. Pendidikan di SMA Persis Serang diarahkan untuk membentuk siswa yang berilmu, berakhlak, terbiasa berdakwah, dan mampu berpikir kritis.',
                'category' => 'Umum',
                'sort_order' => 32,
            ],
        ];

        $now = now();

        foreach ($faqs as $faq) {
            DB::table('ai_faqs')->updateOrInsert(
                ['question' => $faq['question']],
                [
                    'answer' => $faq['answer'],
                    'category' => $faq['category'],
                    'is_active' => true,
                    'sort_order' => $faq['sort_order'],
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        $this->command->info('AiFaqSeeder: ' . count($faqs) . ' FAQ berhasil diisi/diperbarui.');
    }
}
