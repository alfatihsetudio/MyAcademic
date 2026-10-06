<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Berapa kuota penerimaan siswa baru tahun ini?',
                'answer' => 'Kuota penerimaan siswa baru setiap tahunnya disesuaikan dengan daya tampung kelas dan fasilitas yang tersedia. Informasi kuota terkini dapat dilihat di halaman utama SPMB atau hubungi panitia SPMB secara langsung.',
                'category' => 'spmb',
                'sort_order' => 1,
            ],
            [
                'question' => 'Apakah ada biaya pendaftaran?',
                'answer' => 'Pendaftaran SPMB di SMA Persis Serang tidak dipungut biaya (gratis). Calon siswa hanya perlu mengisi formulir pendaftaran secara online dan melengkapi dokumen yang diperlukan.',
                'category' => 'spmb',
                'sort_order' => 2,
            ],
            [
                'question' => 'Apakah SMA Persis Serang menyediakan asrama?',
                'answer' => 'Ya, SMA Persis Serang adalah Islamic Boarding School yang mewajibkan seluruh siswa untuk tinggal di asrama. Program boarding ini bertujuan membentuk karakter islami yang kuat dan memudahkan pembinaan secara intensif.',
                'category' => 'boarding',
                'sort_order' => 3,
            ],
            [
                'question' => 'Bagaimana cara mendaftar SPMB?',
                'answer' => 'Pendaftaran dilakukan secara online melalui website resmi SMA Persis Serang. Calon siswa dapat mengisi formulir pendaftaran di menu SPMB, mengunggah dokumen yang diperlukan, dan menunggu verifikasi dari panitia.',
                'category' => 'spmb',
                'sort_order' => 4,
            ],
            [
                'question' => 'Bagaimana cara cek status pendaftaran?',
                'answer' => 'Status pendaftaran dapat dicek melalui menu "Cek Status" di website ini. Masukkan nomor pendaftaran yang didapat setelah mendaftar untuk melihat perkembangan status pendaftaran.',
                'category' => 'spmb',
                'sort_order' => 5,
            ],
            [
                'question' => 'Apakah ada tes atau wawancara dalam seleksi?',
                'answer' => 'Ya, proses seleksi meliputi tes akademik dasar dan wawancara dengan calon siswa serta orang tua. Jadwal tes dan wawancara akan diinformasikan oleh panitia setelah pendaftaran diverifikasi.',
                'category' => 'spmb',
                'sort_order' => 6,
            ],
            [
                'question' => 'Dokumen apa saja yang perlu disiapkan?',
                'answer' => 'Dokumen yang perlu disiapkan antara lain: fotokopi rapor, fotokopi kartu keluarga, pas foto terbaru, surat keterangan sehat, dan dokumen pendukung lainnya. Detail lengkap dapat dilihat di halaman pendaftaran.',
                'category' => 'spmb',
                'sort_order' => 7,
            ],
            [
                'question' => 'Apakah ada beasiswa untuk siswa berprestasi?',
                'answer' => 'SMA Persis Serang menyediakan program beasiswa bagi siswa berprestasi di bidang akademik maupun non-akademik. Informasi lebih lanjut mengenai jenis dan persyaratan beasiswa dapat menghubungi panitia SPMB.',
                'category' => 'spmb',
                'sort_order' => 8,
            ],
            [
                'question' => 'Kapan pendaftaran SPMB dibuka?',
                'answer' => 'Pendaftaran SPMB dibuka setiap tahun mengikuti jadwal yang ditetapkan oleh dinas pendidikan. Informasi jadwal pendaftaran akan diumumkan melalui website dan media sosial resmi SMA Persis Serang.',
                'category' => 'spmb',
                'sort_order' => 9,
            ],
            [
                'question' => 'Bagaimana cara menghubungi panitia SPMB?',
                'answer' => 'Panitia SPMB dapat dihubungi melalui WhatsApp, telepon ke nomor sekolah, atau datang langsung ke kampus SMA Persis Serang pada jam kerja. Informasi kontak lengkap tersedia di bagian kontak website ini.',
                'category' => 'spmb',
                'sort_order' => 10,
            ],
        ];

        foreach ($faqs as $faq) {
            Faq::updateOrCreate(
                ['question' => $faq['question']],
                $faq + ['is_active' => true]
            );
        }
    }
}
