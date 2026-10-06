<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\CounselingCase;
use App\Models\Exam;
use App\Models\Extracurricular;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\LearningMaterial;
use App\Models\Notification;
use App\Models\ReportCard;
use App\Models\School;
use App\Models\SchoolEvent;
use App\Models\SchoolSetting;
use App\Models\Semester;
use App\Models\StudentAchievement;
use App\Models\StudentViolation;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\TeacherAttendance;
use App\Models\TeachingAssignment;
use App\Models\TeachingJournal;
use App\Models\Timetable;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PrincipalSuiteApiController extends Controller
{
    protected function getSchoolId(Request $request)
    {
        $user = $request->user();
        if ($user && $user->school_id) {
            return $user->school_id;
        }
        $school = School::first();
        return $school ? $school->id : 1;
    }

    /**
     * 1. Executive Dashboard
     */
    public function dashboard(Request $request)
    {
        $schoolId = $this->getSchoolId($request);
        $school = School::find($schoolId) ?: School::first();

        $totalSiswa = User::whereIn('role', ['murid', 'siswa'])->count() ?: 540;
        $totalGuru = User::where('role', 'guru')->count() ?: 45;
        $totalTendik = User::whereIn('role', ['tu', 'staff', 'bk', 'operator'])->count() ?: 14;
        $totalKelas = AcademicClass::count() ?: 18;
        $totalMapel = Subject::count() ?: 22;

        $siswaHadir = intval(round($totalSiswa * 0.958));
        $siswaTidakHadir = max(0, $totalSiswa - $siswaHadir);
        $siswaSakit = intval(round($siswaTidakHadir * 0.52));
        $siswaIzin = intval(round($siswaTidakHadir * 0.35));
        $siswaAlfa = max(0, $siswaTidakHadir - $siswaSakit - $siswaIzin);

        return response()->json([
            'success' => true,
            'summary' => [
                'total_siswa' => $totalSiswa,
                'total_guru' => $totalGuru,
                'total_tendik' => $totalTendik,
                'total_kelas' => $totalKelas,
                'total_mapel' => $totalMapel,
                'tahun_ajaran' => '2026/2027',
                'semester' => 'Ganjil',
            ],
            'kondisi_hari_ini' => [
                'kehadiran_siswa_pct' => 95.8,
                'siswa_hadir' => $siswaHadir,
                'siswa_sakit' => $siswaSakit,
                'siswa_izin' => $siswaIzin,
                'siswa_alfa' => $siswaAlfa,
                'kehadiran_guru_pct' => 97.7,
                'guru_hadir' => 44,
                'guru_tidak_hadir' => 1,
                'guru_izin_detail' => [
                    ['nama' => 'Dra. Endang Sulastri', 'mapel' => 'Geografi', 'alasan' => 'Dinas Luar (MGMP Wilayah)']
                ],
                'kelas_berlangsung' => 17,
                'ujian_hari_ini' => [
                    ['nama' => 'Penilaian Harian Bersama Matematika Peminatan', 'kelas' => 'XII MIPA', 'sesi' => '08:00 - 09:30 WIB'],
                    ['nama' => 'Kuis Formatik Fisika Gelombang', 'kelas' => 'XI MIPA 1', 'sesi' => '10:15 - 11:45 WIB']
                ],
                'agenda_hari_ini' => [
                    ['waktu' => '07:00 - 07:30', 'judul' => 'Apel Pagi & Pembinaan Karakter Disiplin', 'lokasi' => 'Lapangan Utama'],
                    ['waktu' => '10:00 - 11:30', 'judul' => 'Supervisi Klinis KBM Guru Matematika', 'lokasi' => 'Ruang Kelas XI MIPA 2'],
                    ['waktu' => '13:30 - 15:00', 'judul' => 'Rapat Koordinasi Persiapan ANBK & PAS', 'lokasi' => 'Ruang Sidang Pimpinan']
                ]
            ],
            'academic_overview' => [
                'rata_rata_sekolah' => 84.6,
                'persentase_ketuntasan' => 89.4,
                'distribusi_nilai' => [
                    ['kategori' => 'Sangat Baik (A: 90-100)', 'persen' => 35.0, 'siswa' => 189],
                    ['kategori' => 'Baik (B: 80-89)', 'persen' => 43.0, 'siswa' => 232],
                    ['kategori' => 'Cukup (C: 75-79)', 'persen' => 11.4, 'siswa' => 62],
                    ['kategori' => 'Perlu Bimbingan (<75)', 'persen' => 10.6, 'siswa' => 57],
                ],
                'siswa_peningkatan_prestasi' => 42,
                'siswa_penurunan_prestasi' => 14,
                'mapel_performa_rendah' => [
                    ['mapel' => 'Fisika Peminatan', 'rerata' => 76.2, 'ketuntasan' => 73.5, 'status' => 'Perlu Pengayaan'],
                    ['mapel' => 'Bahasa Inggris Lanjutan', 'rerata' => 78.1, 'ketuntasan' => 79.0, 'status' => 'Observasi']
                ],
                'kelas_highlight' => [
                    ['kelas' => 'XII MIPA 1', 'rerata' => 88.7, 'tipe' => 'Tertinggi'],
                    ['kelas' => 'X-4', 'rerata' => 79.3, 'tipe' => 'Perlu Perhatian']
                ]
            ],
            'student_overview' => [
                'siswa_aktif' => $totalSiswa,
                'siswa_berisiko_akademik' => 18,
                'siswa_absensi_tinggi' => 7,
                'siswa_pelanggaran_aktif' => 5,
                'siswa_berprestasi' => 34,
                'butuh_perhatian_khusus' => 9
            ],
            'teacher_overview' => [
                'kehadiran_guru_bulan_ini' => 98.4,
                'rata_rata_beban_mengajar' => '27.4 Jam/Minggu',
                'kelengkapan_jurnal' => 94.2,
                'kelengkapan_input_nilai' => 88.5,
                'kelengkapan_presensi' => 97.1,
                'performa_kbm_sekolah' => 'Sangat Baik (A)'
            ],
            'alert_center' => [
                ['id' => 'a1', 'severity' => 'critical', 'kategori' => 'Approval', 'title' => 'Persetujuan Finalisasi E-Rapor Semester Ganjil', 'desc' => '14 rombel telah lengkap & siap disahkan oleh Kepala Sekolah (2 telah disahkan, 2 rombel masih pending input nilai guru).', 'action_tab' => 'approval-center'],
                ['id' => 'a2', 'severity' => 'warning', 'kategori' => 'Akademik', 'title' => 'Ketuntasan Mapel Fisika Kelas X-4 di bawah target (62.8%)', 'desc' => 'Dibutuhkan koordinasi dengan guru mata pelajaran untuk program pendampingan.', 'action_tab' => 'akademik-mapel'],
                ['id' => 'a3', 'severity' => 'warning', 'kategori' => 'Kesiswaan', 'title' => '3 Siswa memiliki akumulasi ketidakhadiran alfa > 4 hari', 'desc' => 'Wali kelas dan guru BK telah melayangkan surat pemberitahuan ke orang tua.', 'action_tab' => 'monitoring-siswa'],
                ['id' => 'a4', 'severity' => 'info', 'kategori' => 'Administrasi Guru', 'title' => '2 Guru belum melengkapi penilaian sumatif tengah semester', 'desc' => 'Tenggat penginputan tersisa 2 hari kerja.', 'action_tab' => 'monitoring-guru']
            ]
        ]);
    }

    /**
     * 2. Profil Sekolah (Read-Only / Review)
     */
    public function schoolProfile(Request $request)
    {
        $schoolId = $this->getSchoolId($request);
        $school = School::find($schoolId) ?: School::first();

        return response()->json([
            'success' => true,
            'profile' => [
                'nama_sekolah' => $school ? $school->name : 'SMA Negeri Unggulan 1 Jakarta',
                'npsn' => $school ? $school->npsn : '20108392',
                'bentuk_pendidikan' => 'Sekolah Menengah Atas (SMA)',
                'status_sekolah' => 'Negeri',
                'akreditasi' => 'A (Unggul) - Skor 97 (BAN-S/M 2024)',
                'sk_akreditasi' => '1347/BAN-SM/SK/2024',
                'tahun_berdiri' => '1982',
                'kepala_sekolah' => 'Dr. H. Sulaiman, M.Si',
                'nip_kepala_sekolah' => '197103141995121002',
                'alamat' => 'Jl. Boulevard Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan',
                'telepon' => '(021) 720-4491 / 720-4492',
                'email' => 'kepsek@sman1unggul.sch.id',
                'website' => 'https://sman1unggul.sch.id',
                'visi' => 'Terwujudnya insan cendekia yang berkarakter Pancasila, unggul dalam sains teknologi, berwawasan global, dan peduli lingkungan hidup.',
                'misi' => [
                    'Menyelenggarakan pendidikan holistik yang mengintegrasikan kecerdasan intelektual, emosional, dan spiritual.',
                    'Mengembangkan kurikulum inovatif berbasis riset, literasi digital, dan penalaran kritis tingkat tinggi.',
                    'Membina bakat kepemimpinan, sportivitas, dan kewirausahaan siswa melalui ekstrakurikuler terpadu.',
                    'Mewujudkan tata kelola kelembagaan sekolah yang transparan, akuntabel, dan berbasis teknologi informasi modern.'
                ],
                'fasilitas' => [
                    ['nama' => 'Laboratorium Sains Terpadu (Fisika, Kimia, Biologi)', 'kondisi' => 'Sangat Baik (Terakreditasi)'],
                    ['nama' => 'Laboratorium Komputer & CBT Center (120 Unit PC)', 'kondisi' => 'Sangat Baik & Full AC'],
                    ['nama' => 'Perpustakaan Digital & Corner Literasi Modern', 'kondisi' => 'Sangat Baik (Akreditasi A Perpusnas)'],
                    ['nama' => 'Auditorium Serbaguna Kapasitas 800 Kursi', 'kondisi' => 'Baik'],
                    ['nama' => 'Lapangan Olahraga Multifungsi (Basket, Futsal, Voli)', 'kondisi' => 'Sangat Baik'],
                    ['nama' => 'Masjid Sekolah & Ruang Pembinaan Rohani', 'kondisi' => 'Sangat Baik']
                ],
                'struktur_organisasi' => [
                    ['jabatan' => 'Kepala Sekolah', 'nama' => 'Dr. H. Sulaiman, M.Si'],
                    ['jabatan' => 'Wakasek Bidang Kurikulum', 'nama' => 'Drs. H. Mulyadi, M.Pd'],
                    ['jabatan' => 'Wakasek Bidang Kesiswaan', 'nama' => 'Bambang Trianto, S.Pd'],
                    ['jabatan' => 'Wakasek Sarana & Prasarana', 'nama' => 'Ir. Dewi Sartika, M.T'],
                    ['jabatan' => 'Wakasek Humas & Kemitraan', 'nama' => 'Dra. Hj. Nurjanah, M.M'],
                    ['jabatan' => 'Koordinator Bimbingan Konseling', 'nama' => 'Nurul Hidayah, S.Psi, M.Pd'],
                    ['jabatan' => 'Kepala Tata Usaha', 'nama' => 'Hendra Pratama, S.AP']
                ]
            ]
        ]);
    }

    /**
     * 3. Monitoring Siswa & Student Risk (EWS)
     */
    public function studentMonitoring(Request $request)
    {
        $students = [
            [
                'id' => 1, 'nisn' => '0068192301', 'nama' => 'Ahmad Fauzi Rahman', 'kelas' => 'XII MIPA 1', 'tingkat' => 'XII', 'gender' => 'L',
                'status' => 'Aktif', 'rerata_nilai' => 89.4, 'kehadiran_pct' => 98.2, 'pelanggaran_poin' => 0, 'prestasi_count' => 3, 'risk_status' => 'Normal',
                'riwayat_akademik' => ['Sem 1: 86.2', 'Sem 2: 87.5', 'Sem 3: 88.9', 'Sem 4: 89.4'],
                'riwayat_mutasi' => 'Siswa Reguler Penerimaan Jalur Prestasi 2024'
            ],
            [
                'id' => 2, 'nisn' => '0071293812', 'nama' => 'Nadia Az-Zahra', 'kelas' => 'XII MIPA 1', 'tingkat' => 'XII', 'gender' => 'P',
                'status' => 'Aktif', 'rerata_nilai' => 93.8, 'kehadiran_pct' => 99.1, 'pelanggaran_poin' => 0, 'prestasi_count' => 5, 'risk_status' => 'Berprestasi',
                'riwayat_akademik' => ['Sem 1: 91.0', 'Sem 2: 92.4', 'Sem 3: 93.1', 'Sem 4: 93.8'],
                'riwayat_mutasi' => 'Siswa Reguler Jalur Zonasi'
            ],
            [
                'id' => 3, 'nisn' => '0082910293', 'nama' => 'Dimas Arya Pratama', 'kelas' => 'XI MIPA 2', 'tingkat' => 'XI', 'gender' => 'L',
                'status' => 'Aktif', 'rerata_nilai' => 71.5, 'kehadiran_pct' => 86.4, 'pelanggaran_poin' => 25, 'prestasi_count' => 0, 'risk_status' => 'High Risk',
                'riwayat_akademik' => ['Sem 1: 78.0', 'Sem 2: 74.2', 'Sem 3: 71.5 (Menurun)'],
                'riwayat_mutasi' => 'Pindahan dari SMAN 3 Bandung (Semester 2)'
            ],
            [
                'id' => 4, 'nisn' => '0089201923', 'nama' => 'Farhan Rizky Maulana', 'kelas' => 'X-2', 'tingkat' => 'X', 'gender' => 'L',
                'status' => 'Aktif', 'rerata_nilai' => 74.0, 'kehadiran_pct' => 88.0, 'pelanggaran_poin' => 15, 'prestasi_count' => 0, 'risk_status' => 'Medium Risk',
                'riwayat_akademik' => ['Sem 1: 74.0 (Di bawah KKM Mapel Fisika)'],
                'riwayat_mutasi' => 'Reguler PPDB 2026'
            ],
            [
                'id' => 5, 'nisn' => '0078192039', 'nama' => 'Siti Aisyah Wardani', 'kelas' => 'XI IPS 1', 'tingkat' => 'XI', 'gender' => 'P',
                'status' => 'Aktif', 'rerata_nilai' => 87.2, 'kehadiran_pct' => 96.5, 'pelanggaran_poin' => 0, 'prestasi_count' => 2, 'risk_status' => 'Normal',
                'riwayat_akademik' => ['Sem 1: 85.1', 'Sem 2: 86.4', 'Sem 3: 87.2'],
                'riwayat_mutasi' => 'Reguler PPDB'
            ],
            [
                'id' => 6, 'nisn' => '0069123841', 'nama' => 'Reza Kurniawan', 'kelas' => 'XII IPS 2', 'tingkat' => 'XII', 'gender' => 'L',
                'status' => 'Aktif', 'rerata_nilai' => 73.1, 'kehadiran_pct' => 83.5, 'pelanggaran_poin' => 35, 'prestasi_count' => 0, 'risk_status' => 'High Risk',
                'riwayat_akademik' => ['Sem 1: 79.0', 'Sem 2: 76.5', 'Sem 3: 73.1'],
                'riwayat_mutasi' => 'Reguler'
            ]
        ];

        return response()->json([
            'success' => true,
            'students' => $students,
            'risk_summary' => [
                'critical_count' => 6,
                'warning_count' => 12,
                'normal_count' => 522,
                'indikator' => [
                    'Nilai di bawah standar KKM (75.0)',
                    'Persentase kehadiran < 90%',
                    'Pelanggaran tata tertib > 20 poin',
                    'Tren akademik menurun 2 semester beruntun'
                ]
            ]
        ]);
    }

    /**
     * 4. Monitoring Guru & Kinerja Pembelajaran
     */
    public function teacherMonitoring(Request $request)
    {
        $teachers = [
            [
                'id' => 1, 'nip' => '198004122005011003', 'nama' => 'Budi Santoso, M.Pd', 'mapel' => 'Matematika Peminatan', 'kelas_ajar' => 'XII MIPA 1, XII MIPA 2, XI MIPA 1',
                'beban_mengajar' => '28 Jam', 'status' => 'PNS / Sertifikasi', 'kehadiran_pct' => 98.8, 'jurnal_selesai' => 32, 'jurnal_target' => 32,
                'materi_count' => 14, 'tugas_count' => 8, 'asesmen_count' => 4, 'input_nilai_pct' => 100, 'silabus_progress_pct' => 96
            ],
            [
                'id' => 2, 'nip' => '198402152009022004', 'nama' => 'Siti Aminah, M.Pd', 'mapel' => 'Bahasa Indonesia', 'kelas_ajar' => 'X-1, X-2, X-3, XI IPS 1',
                'beban_mengajar' => '24 Jam', 'status' => 'PNS / Sertifikasi', 'kehadiran_pct' => 97.5, 'jurnal_selesai' => 28, 'jurnal_target' => 30,
                'materi_count' => 12, 'tugas_count' => 6, 'asesmen_count' => 3, 'input_nilai_pct' => 92, 'silabus_progress_pct' => 90
            ],
            [
                'id' => 3, 'nip' => '198811092014032001', 'nama' => 'Dewi Lestari, S.Pd, M.Si', 'mapel' => 'Fisika', 'kelas_ajar' => 'X-3, X-4, XI MIPA 1, XI MIPA 2',
                'beban_mengajar' => '26 Jam', 'status' => 'PNS / Sertifikasi', 'kehadiran_pct' => 96.0, 'jurnal_selesai' => 24, 'jurnal_target' => 28,
                'materi_count' => 10, 'tugas_count' => 5, 'asesmen_count' => 3, 'input_nilai_pct' => 80, 'silabus_progress_pct' => 82
            ],
            [
                'id' => 4, 'nip' => '199205182019031005', 'nama' => 'Ahmad Rifa\'i, S.Kom', 'mapel' => 'Informatika & TIK', 'kelas_ajar' => 'X-1 s/d X-6',
                'beban_mengajar' => '24 Jam', 'status' => 'PPPK / Terdaftar', 'kehadiran_pct' => 100, 'jurnal_selesai' => 30, 'jurnal_target' => 30,
                'materi_count' => 16, 'tugas_count' => 9, 'asesmen_count' => 5, 'input_nilai_pct' => 100, 'silabus_progress_pct' => 98
            ],
            [
                'id' => 5, 'nip' => '197906232008012011', 'nama' => 'Dra. Endang Sulastri', 'mapel' => 'Geografi & Sosiologi', 'kelas_ajar' => 'XI IPS 1, XI IPS 2, XII IPS 1',
                'beban_mengajar' => '26 Jam', 'status' => 'PNS / Sertifikasi', 'kehadiran_pct' => 95.0, 'jurnal_selesai' => 26, 'jurnal_target' => 28,
                'materi_count' => 11, 'tugas_count' => 5, 'asesmen_count' => 3, 'input_nilai_pct' => 88, 'silabus_progress_pct' => 88
            ]
        ];

        return response()->json([
            'success' => true,
            'teachers' => $teachers,
            'aggregate' => [
                'rata_kehadiran_guru' => 97.5,
                'rata_kelengkapan_jurnal' => 94.0,
                'rata_kelengkapan_nilai' => 92.0,
                'total_guru_sertifikasi' => 38,
                'total_guru_non_sertifikasi' => 7
            ]
        ]);
    }

    /**
     * 5. Monitoring Kelas / Rombel & Class Comparison
     */
    public function classMonitoring(Request $request)
    {
        $classes = [
            [
                'id' => 1, 'nama' => 'XII MIPA 1', 'tingkat' => 'XII', 'jurusan' => 'MIPA', 'wali_kelas' => 'Budi Santoso, M.Pd',
                'jumlah_siswa' => 36, 'kehadiran_pct' => 98.4, 'rerata_nilai' => 88.7, 'ketuntasan_pct' => 97.2, 'siswa_berisiko' => 0,
                'siswa_berprestasi' => 8, 'pelanggaran_count' => 0, 'prestasi_count' => 12, 'progress_kbm' => 96
            ],
            [
                'id' => 2, 'nama' => 'XII MIPA 2', 'tingkat' => 'XII', 'jurusan' => 'MIPA', 'wali_kelas' => 'Ir. Dewi Sartika, M.T',
                'jumlah_siswa' => 35, 'kehadiran_pct' => 96.8, 'rerata_nilai' => 86.4, 'ketuntasan_pct' => 94.2, 'siswa_berisiko' => 1,
                'siswa_berprestasi' => 5, 'pelanggaran_count' => 1, 'prestasi_count' => 8, 'progress_kbm' => 94
            ],
            [
                'id' => 3, 'nama' => 'XI MIPA 1', 'tingkat' => 'XI', 'jurusan' => 'MIPA', 'wali_kelas' => 'Drs. H. Mulyadi, M.Pd',
                'jumlah_siswa' => 36, 'kehadiran_pct' => 95.5, 'rerata_nilai' => 85.1, 'ketuntasan_pct' => 91.6, 'siswa_berisiko' => 1,
                'siswa_berprestasi' => 4, 'pelanggaran_count' => 2, 'prestasi_count' => 6, 'progress_kbm' => 92
            ],
            [
                'id' => 4, 'nama' => 'XI MIPA 2', 'tingkat' => 'XI', 'jurusan' => 'MIPA', 'wali_kelas' => 'Dewi Lestari, S.Pd',
                'jumlah_siswa' => 34, 'kehadiran_pct' => 92.4, 'rerata_nilai' => 81.3, 'ketuntasan_pct' => 82.3, 'siswa_berisiko' => 3,
                'siswa_berprestasi' => 2, 'pelanggaran_count' => 4, 'prestasi_count' => 3, 'progress_kbm' => 88
            ],
            [
                'id' => 5, 'nama' => 'X-1', 'tingkat' => 'X', 'jurusan' => 'Umum', 'wali_kelas' => 'Siti Aminah, M.Pd',
                'jumlah_siswa' => 36, 'kehadiran_pct' => 96.1, 'rerata_nilai' => 83.5, 'ketuntasan_pct' => 88.8, 'siswa_berisiko' => 1,
                'siswa_berprestasi' => 3, 'pelanggaran_count' => 1, 'prestasi_count' => 4, 'progress_kbm' => 90
            ],
            [
                'id' => 6, 'nama' => 'X-4', 'tingkat' => 'X', 'jurusan' => 'Umum', 'wali_kelas' => 'Ahmad Rifa\'i, S.Kom',
                'jumlah_siswa' => 35, 'kehadiran_pct' => 91.2, 'rerata_nilai' => 79.3, 'ketuntasan_pct' => 77.1, 'siswa_berisiko' => 4,
                'siswa_berprestasi' => 1, 'pelanggaran_count' => 6, 'prestasi_count' => 1, 'progress_kbm' => 84
            ]
        ];

        return response()->json([
            'success' => true,
            'classes' => $classes,
            'comparison' => [
                'tingkat_x' => ['rerata_nilai' => 81.4, 'kehadiran' => 94.2, 'ketuntasan' => 83.0],
                'tingkat_xi' => ['rerata_nilai' => 84.2, 'kehadiran' => 95.1, 'ketuntasan' => 88.5],
                'tingkat_xii' => ['rerata_nilai' => 87.8, 'kehadiran' => 97.6, 'ketuntasan' => 95.8]
            ]
        ]);
    }

    /**
     * 6. Monitoring Akademik & Academic Trend
     */
    public function academicMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'academic_performance' => [
                'rerata_sekolah' => 84.6,
                'ketuntasan_sekolah_pct' => 89.4,
                'nilai_tertinggi' => 98.5,
                'nilai_terendah' => 64.0,
                'distribusi' => [
                    ['rentang' => '90 - 100 (A)', 'jumlah' => 189, 'persentase' => 35.0],
                    ['rentang' => '80 - 89 (B)', 'jumlah' => 232, 'persentase' => 43.0],
                    ['rentang' => '75 - 79 (C)', 'jumlah' => 62, 'persentase' => 11.4],
                    ['rentang' => '< 75 (D/Remedial)', 'jumlah' => 57, 'persentase' => 10.6],
                ],
                'rerata_per_tingkat' => [
                    ['tingkat' => 'Kelas X', 'rerata' => 81.4, 'ketuntasan' => 83.0],
                    ['tingkat' => 'Kelas XI', 'rerata' => 84.2, 'ketuntasan' => 88.5],
                    ['tingkat' => 'Kelas XII', 'rerata' => 87.8, 'ketuntasan' => 95.8]
                ]
            ],
            'academic_trend' => [
                'perbandingan_semester' => [
                    ['periode' => 'Semester Lalu (Genap 2025/2026)', 'rerata' => 82.9, 'ketuntasan' => 86.1, 'absensi_pct' => 94.5, 'at_risk' => 24],
                    ['periode' => 'Semester Berjalan (Ganjil 2026/2027)', 'rerata' => 84.6, 'ketuntasan' => 89.4, 'absensi_pct' => 95.8, 'at_risk' => 18]
                ],
                'analisis_pertumbuhan' => [
                    'delta_rerata' => '+1.7 poin (Meningkat)',
                    'delta_ketuntasan' => '+3.3% (Meningkat Signifikan)',
                    'delta_kehadiran' => '+1.3% (Membaik)',
                    'pengurangan_at_risk' => '-6 siswa (Intervensi Berhasil)'
                ]
            ]
        ]);
    }

    /**
     * 7. Monitoring Mata Pelajaran
     */
    public function subjectMonitoring(Request $request)
    {
        $subjects = [
            [
                'id' => 1, 'kode' => 'MAT-P', 'nama' => 'Matematika Peminatan', 'kategori' => 'Eksakta / MIPA', 'kkm' => 75,
                'guru_pengajar' => ['Budi Santoso, M.Pd', 'Dra. Sri Wahyuni'], 'total_siswa' => 215, 'rerata_nilai' => 86.4,
                'ketuntasan_pct' => 91.2, 'kehadiran_pct' => 96.8, 'progress_silabus' => 95, 'total_asesmen' => 6, 'siswa_kesulitan' => 19,
                'breakdown_kelas' => [
                    ['kelas' => 'XII MIPA 1', 'ketuntasan_pct' => 97.2, 'rerata' => 89.1],
                    ['kelas' => 'XII MIPA 2', 'ketuntasan_pct' => 94.2, 'rerata' => 87.0],
                    ['kelas' => 'XI MIPA 1', 'ketuntasan_pct' => 88.8, 'rerata' => 84.2],
                    ['kelas' => 'XI MIPA 2', 'ketuntasan_pct' => 84.5, 'rerata' => 81.3]
                ]
            ],
            [
                'id' => 2, 'kode' => 'FIS', 'nama' => 'Fisika', 'kategori' => 'Eksakta / MIPA', 'kkm' => 75,
                'guru_pengajar' => ['Dewi Lestari, S.Pd', 'Dr. Hendra'], 'total_siswa' => 215, 'rerata_nilai' => 76.2,
                'ketuntasan_pct' => 73.5, 'kehadiran_pct' => 93.4, 'progress_silabus' => 82, 'total_asesmen' => 4, 'siswa_kesulitan' => 57,
                'breakdown_kelas' => [
                    ['kelas' => 'XII MIPA 1', 'ketuntasan_pct' => 86.1, 'rerata' => 81.2],
                    ['kelas' => 'XI MIPA 1', 'ketuntasan_pct' => 77.7, 'rerata' => 76.4],
                    ['kelas' => 'XI MIPA 2', 'ketuntasan_pct' => 67.6, 'rerata' => 72.8],
                    ['kelas' => 'X-4', 'ketuntasan_pct' => 62.8, 'rerata' => 70.5]
                ]
            ],
            [
                'id' => 3, 'kode' => 'BIN', 'nama' => 'Bahasa Indonesia', 'kategori' => 'Umum / Wajib', 'kkm' => 75,
                'guru_pengajar' => ['Siti Aminah, M.Pd', 'Nur Hayati, S.Pd'], 'total_siswa' => 540, 'rerata_nilai' => 87.8,
                'ketuntasan_pct' => 96.5, 'kehadiran_pct' => 97.2, 'progress_silabus' => 92, 'total_asesmen' => 5, 'siswa_kesulitan' => 19,
                'breakdown_kelas' => [
                    ['kelas' => 'XII MIPA 1', 'ketuntasan_pct' => 100, 'rerata' => 90.4],
                    ['kelas' => 'XI IPS 1', 'ketuntasan_pct' => 97.2, 'rerata' => 88.0],
                    ['kelas' => 'X-1', 'ketuntasan_pct' => 94.4, 'rerata' => 85.6],
                    ['kelas' => 'X-4', 'ketuntasan_pct' => 91.4, 'rerata' => 84.1]
                ]
            ],
            [
                'id' => 4, 'kode' => 'ING', 'nama' => 'Bahasa Inggris', 'kategori' => 'Umum / Wajib', 'kkm' => 75,
                'guru_pengajar' => ['Robert Davis, M.Ed', 'Maya Anggraeni, S.Pd'], 'total_siswa' => 540, 'rerata_nilai' => 84.1,
                'ketuntasan_pct' => 88.0, 'kehadiran_pct' => 96.0, 'progress_silabus' => 89, 'total_asesmen' => 5, 'siswa_kesulitan' => 65,
                'breakdown_kelas' => [
                    ['kelas' => 'XII MIPA 1', 'ketuntasan_pct' => 94.4, 'rerata' => 88.5],
                    ['kelas' => 'XI MIPA 1', 'ketuntasan_pct' => 88.8, 'rerata' => 84.0],
                    ['kelas' => 'X-1', 'ketuntasan_pct' => 86.1, 'rerata' => 82.3],
                    ['kelas' => 'X-4', 'ketuntasan_pct' => 82.8, 'rerata' => 80.5]
                ]
            ],
            [
                'id' => 5, 'kode' => 'INF', 'nama' => 'Informatika & Komputasi', 'kategori' => 'Teknologi & Vokasi', 'kkm' => 75,
                'guru_pengajar' => ['Ahmad Rifa\'i, S.Kom'], 'total_siswa' => 360, 'rerata_nilai' => 89.6,
                'ketuntasan_pct' => 98.1, 'kehadiran_pct' => 98.5, 'progress_silabus' => 98, 'total_asesmen' => 7, 'siswa_kesulitan' => 7,
                'breakdown_kelas' => [
                    ['kelas' => 'X-1', 'ketuntasan_pct' => 100, 'rerata' => 91.2],
                    ['kelas' => 'X-2', 'ketuntasan_pct' => 97.2, 'rerata' => 89.5],
                    ['kelas' => 'X-3', 'ketuntasan_pct' => 97.2, 'rerata' => 88.8],
                    ['kelas' => 'X-4', 'ketuntasan_pct' => 97.1, 'rerata' => 88.2]
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'subjects' => $subjects
        ]);
    }

    /**
     * 8. Monitoring Presensi & Analytics
     */
    public function attendanceMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'presensi_siswa' => [
                'hari_ini' => [
                    'hadir' => 517, 'sakit' => 12, 'izin' => 8, 'alfa' => 3, 'terlambat' => 6, 'persen_hadir' => 95.8
                ],
                'rekap_mingguan' => [
                    ['hari' => 'Senin', 'hadir_pct' => 97.2, 'sakit' => 8, 'izin' => 5, 'alfa' => 2],
                    ['hari' => 'Selasa', 'hadir_pct' => 96.5, 'sakit' => 11, 'izin' => 6, 'alfa' => 2],
                    ['hari' => 'Rabu', 'hadir_pct' => 95.8, 'sakit' => 12, 'izin' => 8, 'alfa' => 3],
                    ['hari' => 'Kamis', 'hadir_pct' => 96.1, 'sakit' => 10, 'izin' => 7, 'alfa' => 4],
                    ['hari' => 'Jumat', 'hadir_pct' => 94.8, 'sakit' => 14, 'izin' => 10, 'alfa' => 4]
                ],
                'rekap_semester' => [
                    'total_hadir_pct' => 95.8,
                    'total_sakit_pct' => 2.4,
                    'total_izin_pct' => 1.3,
                    'total_alfa_pct' => 0.5
                ]
            ],
            'presensi_guru' => [
                'hari_ini' => [
                    'hadir' => 44, 'tidak_hadir' => 1, 'terlambat' => 1, 'persen_hadir' => 97.7,
                    'detail_absen' => [
                        ['nama' => 'Dra. Endang Sulastri', 'status' => 'Izin Dinas Luar', 'waktu' => 'Full Day']
                    ]
                ],
                'rekap_bulanan' => [
                    'kehadiran_rata' => 98.4,
                    'keterlambatan_rata' => '1.2%',
                    'ketidakhadiran_dinas' => 6,
                    'ketidakhadiran_sakit' => 3
                ]
            ],
            'analytics' => [
                'kelas_kehadiran_terendah' => [
                    ['kelas' => 'X-4', 'hadir_pct' => 91.2, 'alfa_total' => 14],
                    ['kelas' => 'XI MIPA 2', 'hadir_pct' => 92.4, 'alfa_total' => 11]
                ],
                'siswa_absensi_tinggi' => [
                    ['nama' => 'Dimas Arya Pratama', 'kelas' => 'XI MIPA 2', 'alfa' => 6, 'izin' => 4, 'sakit' => 5],
                    ['nama' => 'Reza Kurniawan', 'kelas' => 'XII IPS 2', 'alfa' => 5, 'izin' => 6, 'sakit' => 4],
                    ['nama' => 'Bayu Wicaksono', 'kelas' => 'X-4', 'alfa' => 4, 'izin' => 3, 'sakit' => 2]
                ],
                'guru_absensi_catatan' => [
                    ['nama' => 'Dra. Endang Sulastri', 'hadir_pct' => 95.0, 'izin_dinas' => 3, 'sakit' => 1]
                ]
            ]
        ]);
    }

    /**
     * 9. Monitoring KBM & Teaching Progress
     */
    public function learningMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'teaching_activity_today' => [
                'total_jadwal_hari_ini' => 34,
                'berlangsung_saat_ini' => 17,
                'selesai' => 12,
                'belum_mulai' => 5,
                'jurnal_mengajar_terisi' => 28,
                'jurnal_mengajar_pending' => 1,
                'sesi_aktif' => [
                    ['guru' => 'Budi Santoso, M.Pd', 'mapel' => 'Matematika Peminatan', 'kelas' => 'XII MIPA 1', 'topik' => 'Aplikasi Turunan Fungsi Trigonometri', 'ruang' => 'R-301', 'status' => 'Berlangsung'],
                    ['guru' => 'Siti Aminah, M.Pd', 'mapel' => 'Bahasa Indonesia', 'kelas' => 'X-1', 'topik' => 'Struktur Teks Laporan Hasil Observasi', 'ruang' => 'R-102', 'status' => 'Berlangsung'],
                    ['guru' => 'Ahmad Rifa\'i, S.Kom', 'mapel' => 'Informatika', 'kelas' => 'X-4', 'topik' => 'Algoritma Percabangan Python', 'ruang' => 'Lab Komputer 2', 'status' => 'Berlangsung'],
                    ['guru' => 'Dewi Lestari, S.Pd', 'mapel' => 'Fisika', 'kelas' => 'XI MIPA 2', 'topik' => 'Praktikum Dinamika Rotasi', 'ruang' => 'Lab Fisika', 'status' => 'Berlangsung']
                ]
            ],
            'teaching_progress' => [
                ['mapel' => 'Matematika Peminatan', 'target_pertemuan' => 36, 'terlaksana' => 32, 'progress_pct' => 88.8, 'materi_selesai' => 7, 'materi_total' => 8],
                ['mapel' => 'Bahasa Indonesia', 'target_pertemuan' => 36, 'terlaksana' => 30, 'progress_pct' => 83.3, 'materi_selesai' => 5, 'materi_total' => 6],
                ['mapel' => 'Fisika', 'target_pertemuan' => 36, 'terlaksana' => 28, 'progress_pct' => 77.7, 'materi_selesai' => 4, 'materi_total' => 6],
                ['mapel' => 'Informatika', 'target_pertemuan' => 32, 'terlaksana' => 30, 'progress_pct' => 93.7, 'materi_selesai' => 6, 'materi_total' => 6],
                ['mapel' => 'Kimia', 'target_pertemuan' => 36, 'terlaksana' => 31, 'progress_pct' => 86.1, 'materi_selesai' => 5, 'materi_total' => 6],
                ['mapel' => 'Biologi', 'target_pertemuan' => 36, 'terlaksana' => 33, 'progress_pct' => 91.6, 'materi_selesai' => 6, 'materi_total' => 6]
            ]
        ]);
    }

    /**
     * 10. Monitoring Tugas & Assessment
     */
    public function assessmentsMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'total_tugas' => 84,
                'total_kuis' => 46,
                'total_ujian_cbt' => 18,
                'assessment_berjalan' => 4,
                'assessment_selesai' => 144,
                'tingkat_pengumpulan_pct' => 93.8,
                'rata_rata_nilai' => 83.7,
                'ketuntasan_pct' => 88.2
            ],
            'recent_assessments' => [
                ['judul' => 'Penilaian Harian 3 Matriks & Vektor', 'mapel' => 'Matematika Peminatan', 'tipe' => 'Ujian CBT', 'peserta' => 71, 'selesai' => 71, 'submission_rate' => 100, 'rerata' => 86.5, 'ketuntasan_pct' => 94.3],
                ['judul' => 'Tugas Esai Analisis Puisi Kontemporer', 'mapel' => 'Bahasa Indonesia', 'tipe' => 'Tugas Mandiri', 'peserta' => 144, 'selesai' => 138, 'submission_rate' => 95.8, 'rerata' => 85.0, 'ketuntasan_pct' => 96.5],
                ['judul' => 'Proyek Mini Coding Game Python', 'mapel' => 'Informatika', 'tipe' => 'Proyek Praktik', 'peserta' => 142, 'selesai' => 140, 'submission_rate' => 98.5, 'rerata' => 90.2, 'ketuntasan_pct' => 100],
                ['judul' => 'Kuis Termodinamika & Gas Ideal', 'mapel' => 'Fisika', 'tipe' => 'Kuis Online', 'peserta' => 70, 'selesai' => 64, 'submission_rate' => 91.4, 'rerata' => 74.8, 'ketuntasan_pct' => 71.4]
            ]
        ]);
    }

    /**
     * 11. Monitoring Nilai & Grade Completeness
     */
    public function gradesMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'grade_overview' => [
                'rerata_sekolah' => 84.6,
                'nilai_tertinggi' => 98.5,
                'nilai_terendah' => 64.0,
                'ketuntasan_pct' => 89.4
            ],
            'grade_completeness' => [
                'status_keseluruhan' => '88.5% Lengkap',
                'guru_belum_lengkap' => [
                    ['guru' => 'Dewi Lestari, S.Pd', 'mapel' => 'Fisika', 'kelas' => 'X-4, XI MIPA 2', 'status' => 'Pending Nilai Tugas 4 & PH 2', 'deadline' => '3 Okt 2026'],
                    ['guru' => 'Dra. Endang Sulastri', 'mapel' => 'Geografi', 'kelas' => 'XII IPS 1', 'status' => 'Pending Nilai Kuis 3', 'deadline' => '4 Okt 2026']
                ],
                'kelas_belum_lengkap' => [
                    ['kelas' => 'X-4', 'mapel_belum_lengkap' => 'Fisika, Sosiologi', 'persen_lengkap' => 76.5],
                    ['kelas' => 'XI MIPA 2', 'mapel_belum_lengkap' => 'Fisika', 'persen_lengkap' => 88.0]
                ]
            ]
        ]);
    }

    /**
     * 12. Rapor & Evaluasi Akademik
     */
    public function reportCards(Request $request)
    {
        $classes = [
            ['id' => 1, 'nama' => 'XII MIPA 1', 'wali_kelas' => 'Budi Santoso, M.Pd', 'siswa_count' => 36, 'lengkap' => 36, 'rerata' => 88.7, 'status' => 'Menunggu Approval Kepala Sekolah'],
            ['id' => 2, 'nama' => 'XII MIPA 2', 'wali_kelas' => 'Ir. Dewi Sartika, M.T', 'siswa_count' => 35, 'lengkap' => 35, 'rerata' => 86.4, 'status' => 'Menunggu Approval Kepala Sekolah'],
            ['id' => 3, 'nama' => 'XI MIPA 1', 'wali_kelas' => 'Drs. H. Mulyadi, M.Pd', 'siswa_count' => 36, 'lengkap' => 36, 'rerata' => 85.1, 'status' => 'Menunggu Approval Kepala Sekolah'],
            ['id' => 4, 'nama' => 'XI MIPA 2', 'wali_kelas' => 'Dewi Lestari, S.Pd', 'siswa_count' => 34, 'lengkap' => 32, 'rerata' => 81.3, 'status' => 'Belum Lengkap (2 Nilai Pending)'],
            ['id' => 5, 'nama' => 'X-1', 'wali_kelas' => 'Siti Aminah, M.Pd', 'siswa_count' => 36, 'lengkap' => 36, 'rerata' => 83.5, 'status' => 'Disetujui / Final'],
            ['id' => 6, 'nama' => 'X-4', 'wali_kelas' => 'Ahmad Rifa\'i, S.Kom', 'siswa_count' => 35, 'lengkap' => 33, 'rerata' => 79.3, 'status' => 'Belum Lengkap']
        ];

        return response()->json([
            'success' => true,
            'classes' => $classes,
            'summary' => [
                'total_rombel' => 18,
                'rombel_siap_approve' => 14,
                'rombel_approved' => 2,
                'rombel_pending_guru' => 2,
                'persentase_kelengkapan' => 96.2
            ]
        ]);
    }

    /**
     * 13. Persetujuan / Approval Center
     */
    public function approvalCenter(Request $request)
    {
        $approvals = [
            [
                'id' => 'APP-001',
                'tipe' => 'Finalisasi E-Rapor',
                'judul' => 'Pengesahan E-Rapor Semester Ganjil TA 2026/2027 (14 Rombel)',
                'pengaju' => 'Drs. H. Mulyadi, M.Pd (Wakasek Kurikulum)',
                'tanggal' => '2 Okt 2026, 09:30 WIB',
                'urgensi' => 'Tinggi',
                'status' => 'Menunggu Keputusan',
                'deskripsi' => 'Pengajuan validasi dan penerbitan rapor siswa secara serentak untuk rombel Kelas X, XI, dan XII yang telah 100% tuntas verifikasi nilai.',
                'lampiran' => 'Rekapitulasi_Nilai_dan_Ketuntasan_Ganjil_2026.pdf',
                'history' => [
                    ['waktu' => '1 Okt 2026, 17:00', 'aktor' => 'Wali Kelas', 'catatan' => 'Verifikasi nilai seluruh rombel selesai'],
                    ['waktu' => '2 Okt 2026, 09:30', 'aktor' => 'Wakasek Kurikulum', 'catatan' => 'Diajukan ke Kepala Sekolah untuk pengesahan']
                ]
            ],
            [
                'id' => 'APP-002',
                'tipe' => 'Pengajuan Kegiatan Sekolah',
                'judul' => 'Penyelenggaraan Latihan Kepemimpinan Siswa (LDKS) & Kemah Pramuka 2026',
                'pengaju' => 'Bambang Trianto, S.Pd (Wakasek Kesiswaan)',
                'tanggal' => '2 Okt 2026, 08:15 WIB',
                'urgensi' => 'Sedang',
                'status' => 'Menunggu Keputusan',
                'deskripsi' => 'Rencana kegiatan pembinaan karakter dan kepemimpinan untuk 180 siswa kelas X di Bumi Perkemahan Cibubur pada 24-26 Oktober 2026.',
                'lampiran' => 'Proposal_LDKS_Anggaran_dan_Mitigasi_2026.pdf',
                'history' => [
                    ['waktu' => '2 Okt 2026, 08:15', 'aktor' => 'Wakasek Kesiswaan', 'catatan' => 'Proposal selesai disusun bersama Pembina OSIS']
                ]
            ],
            [
                'id' => 'APP-003',
                'tipe' => 'Mutasi Siswa',
                'judul' => 'Permohonan Rekomendasi Pindah Masuk: Muhammad Rayhan (Kelas XI MIPA)',
                'pengaju' => 'Hendra Pratama, S.AP (Kepala TU)',
                'tanggal' => '1 Okt 2026, 14:00 WIB',
                'urgensi' => 'Sedang',
                'status' => 'Menunggu Keputusan',
                'deskripsi' => 'Siswa pindahan dari SMAN 5 Surabaya karena kepindahan dinas orang tua. Berkas administrasi, rapor asal, dan validasi Dapodik dinyatakan valid.',
                'lampiran' => 'Berkas_Mutasi_Rayhan_Dapodik.pdf',
                'history' => [
                    ['waktu' => '1 Okt 2026, 14:00', 'aktor' => 'Kepala TU', 'catatan' => 'Berkas dinyatakan lengkap oleh Bagian Kesiswaan TU']
                ]
            ],
            [
                'id' => 'APP-004',
                'tipe' => 'Dokumen Resmi',
                'judul' => 'Penerbitan Surat Keputusan (SK) Panitia ANBK & Asesmen Sumatif 2026',
                'pengaju' => 'Drs. H. Mulyadi, M.Pd (Wakasek Kurikulum)',
                'tanggal' => '30 Sep 2026, 16:30 WIB',
                'urgensi' => 'Tinggi',
                'status' => 'Menunggu Keputusan',
                'deskripsi' => 'Draf SK Kepala Sekolah tentang penetapan proktor, teknisi, dan pengawas ANBK berbasis komputer.',
                'lampiran' => 'Draf_SK_Panitia_ANBK_2026.docx',
                'history' => [
                    ['waktu' => '30 Sep 2026, 16:30', 'aktor' => 'Wakasek Kurikulum', 'catatan' => 'Draf disiapkan untuk ditandatangani Kepala Sekolah']
                ]
            ],
            [
                'id' => 'APP-005',
                'tipe' => 'Pengumuman Penting',
                'judul' => 'Pengumuman Resmi: Kebijakan Pembelajaran Hybrid Saat Renovasi Lab Sains',
                'pengaju' => 'Ir. Dewi Sartika, M.T (Wakasek Sarpras)',
                'tanggal' => '29 Sep 2026, 11:20 WIB',
                'urgensi' => 'Sedang',
                'status' => 'Disetujui',
                'deskripsi' => 'Edaran resmi kepala sekolah untuk orang tua dan siswa terkait pengalihan ruang praktik sains sementara waktu.',
                'lampiran' => 'Surat_Edaran_Renovasi_Lab.pdf',
                'history' => [
                    ['waktu' => '29 Sep 2026, 11:20', 'aktor' => 'Wakasek Sarpras', 'catatan' => 'Diajukan ke pimpinan'],
                    ['waktu' => '29 Sep 2026, 13:00', 'aktor' => 'Kepala Sekolah', 'catatan' => 'Disetujui & Dipublikasikan ke sistem']
                ]
            ]
        ];

        return response()->json([
            'success' => true,
            'approvals' => $approvals,
            'pending_count' => 4,
            'approved_count' => 1
        ]);
    }

    /**
     * Action: Approve / Reject / Request Revision
     */
    public function processApproval(Request $request)
    {
        $id = $request->input('id');
        $action = $request->input('action'); // approve, reject, revision
        $notes = $request->input('notes', '');

        $label = $action === 'approve' ? 'disetujui' : ($action === 'reject' ? 'ditolak' : 'dikembalikan untuk revisi');

        return response()->json([
            'success' => true,
            'message' => "Pengajuan {$id} telah berhasil {$label} oleh Kepala Sekolah.",
            'item' => [
                'id' => $id,
                'status' => $action === 'approve' ? 'Disetujui' : ($action === 'reject' ? 'Ditolak' : 'Revisi'),
                'notes' => $notes,
                'decided_at' => now()->format('Y-m-d H:i:s'),
                'decided_by' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)'
            ]
        ]);
    }

    /**
     * 14. Kenaikan Kelas (Monitoring & Approval)
     */
    public function classPromotion(Request $request)
    {
        $classes = [
            [
                'id' => 1, 'kelas' => 'X-1', 'tingkat_asal' => 'X', 'tingkat_tujuan' => 'XI', 'wali_kelas' => 'Siti Aminah, M.Pd',
                'total_siswa' => 36, 'layak_naik' => 36, 'bersyarat' => 0, 'tidak_naik' => 0, 'status' => 'Siap Direview Kepala Sekolah'
            ],
            [
                'id' => 2, 'kelas' => 'X-4', 'tingkat_asal' => 'X', 'tingkat_tujuan' => 'XI', 'wali_kelas' => 'Ahmad Rifa\'i, S.Kom',
                'total_siswa' => 35, 'layak_naik' => 33, 'bersyarat' => 2, 'tidak_naik' => 0, 'status' => 'Ada Catatan Bersyarat (Remedial & Absensi)'
            ],
            [
                'id' => 3, 'kelas' => 'XI MIPA 1', 'tingkat_asal' => 'XI', 'tingkat_tujuan' => 'XII', 'wali_kelas' => 'Drs. H. Mulyadi, M.Pd',
                'total_siswa' => 36, 'layak_naik' => 36, 'bersyarat' => 0, 'tidak_naik' => 0, 'status' => 'Siap Direview Kepala Sekolah'
            ],
            [
                'id' => 4, 'kelas' => 'XI MIPA 2', 'tingkat_asal' => 'XI', 'tingkat_tujuan' => 'XII', 'wali_kelas' => 'Dewi Lestari, S.Pd',
                'total_siswa' => 34, 'layak_naik' => 33, 'bersyarat' => 1, 'tidak_naik' => 0, 'status' => 'Ada Catatan Bersyarat (Fisika)'
            ]
        ];

        return response()->json([
            'success' => true,
            'classes' => $classes,
            'kriteria_kenaikan' => [
                'Menyelesaikan seluruh program pembelajaran dalam dua semester pada tahun ajaran yang diikuti.',
                'Predikat sikap dan perilaku minimal BAIK (B).',
                'Tidak memiliki lebih dari 3 (tiga) mata pelajaran yang nilainya di bawah Kriteria Ketuntasan Minimal (KKM).',
                'Kehadiran kumulatif tatap muka minimal 85% dari total hari efektif.'
            ]
        ]);
    }

    /**
     * 15. Kelulusan (Monitoring & Final Approval)
     */
    public function graduation(Request $request)
    {
        $calonLulus = [
            ['rombel' => 'XII MIPA 1', 'calon' => 36, 'nilai_lengkap' => 36, 'kehadiran_memenuhi' => 36, 'status_kelayakan' => '100% Memenuhi Syarat'],
            ['rombel' => 'XII MIPA 2', 'calon' => 35, 'nilai_lengkap' => 35, 'kehadiran_memenuhi' => 35, 'status_kelayakan' => '100% Memenuhi Syarat'],
            ['rombel' => 'XII IPS 1', 'calon' => 36, 'nilai_lengkap' => 36, 'kehadiran_memenuhi' => 36, 'status_kelayakan' => '100% Memenuhi Syarat'],
            ['rombel' => 'XII IPS 2', 'calon' => 35, 'nilai_lengkap' => 35, 'kehadiran_memenuhi' => 34, 'status_kelayakan' => '1 Siswa Perlu Verifikasi Dewan Guru']
        ];

        return response()->json([
            'success' => true,
            'total_calon_lulusan' => 142,
            'memenuhi_syarat' => 141,
            'perlu_sidang_pleno' => 1,
            'status_approval_kepsek' => 'Draft Siap Di-SK-kan',
            'rombel_list' => $calonLulus
        ]);
    }

    /**
     * 16. Monitoring BK (Agregat & Privasi Terkontrol)
     */
    public function counselingMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'access_notice' => 'Catatan sesi konseling privat dan psikologis bersifat konfidensial dan dilindungi kode etik BK. Kepala Sekolah mengakses data agregat, statistik, dan status penanganan tindak lanjut.',
            'summary' => [
                'total_siswa_terlayani' => 48,
                'total_kasus_aktif' => 6,
                'kasus_selesai' => 42,
                'persentase_penyelesaian' => 87.5
            ],
            'kategori_kasus' => [
                ['kategori' => 'Bimbingan Belajar & Kesulitan Akademik', 'jumlah' => 22, 'persen' => 45.8, 'status' => 'Dalam Pendampingan Belajar'],
                ['kategori' => 'Bimbingan Karier & Minat Perguruan Tinggi', 'jumlah' => 15, 'persen' => 31.2, 'status' => 'Konsultasi SNBP/SNBT'],
                ['kategori' => 'Penyesuaian Sosial & Hubungan Sebaya', 'jumlah' => 7, 'persen' => 14.6, 'status' => 'Mediasi Sukses'],
                ['kategori' => 'Kedisiplinan & Absensi', 'jumlah' => 4, 'persen' => 8.4, 'status' => 'Home Visit & Komitmen']
            ],
            'siswa_perhatian_khusus' => [
                ['inisial' => 'D.A.P', 'kelas' => 'XI MIPA 2', 'isu_agregat' => 'Absensi & Penurunan Nilai Eksakta', 'status_penanganan' => 'Home Visit ke-2, Orang Tua Kooperatif'],
                ['inisial' => 'R.K', 'kelas' => 'XII IPS 2', 'isu_agregat' => 'Motivasi Belajar Menjelang Ujian Akhir', 'status_penanganan' => 'Konseling Rutin Mingguan, Menunjukkan Progres Positif']
            ]
        ]);
    }

    /**
     * 17. Monitoring Disiplin & Tata Tertib
     */
    public function disciplineMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'total_pelanggaran_bulan_ini' => 14,
                'perubahan_vs_bulan_lalu' => '-18.5% (Disiplin Meningkat)',
                'kasus_selesai' => 12,
                'kasus_dalam_pembinaan' => 2
            ],
            'jenis_pelanggaran' => [
                ['jenis' => 'Keterlambatan Masuk Sekolah (>07:00)', 'kategori' => 'Ringan', 'jumlah' => 8, 'tindakan' => 'Pencatatan & Pembinaan Piket'],
                ['jenis' => 'Kelengkapan Seragam & Atribut', 'kategori' => 'Ringan', 'jumlah' => 3, 'tindakan' => 'Teguran Lisan'],
                ['jenis' => 'Meninggalkan Kelas Tanpa Izin (Membolos Jam Ke-5)', 'kategori' => 'Sedang', 'jumlah' => 2, 'tindakan' => 'Surat Peringatan I & Konseling BK'],
                ['jenis' => 'Membawa/Merokok di Luar Lingkungan Sekolah', 'kategori' => 'Berat', 'jumlah' => 1, 'tindakan' => 'Pemanggilan Orang Tua & SP II']
            ],
            'distribusi_kelas' => [
                ['kelas' => 'X-4', 'jumlah' => 6],
                ['kelas' => 'XI MIPA 2', 'jumlah' => 4],
                ['kelas' => 'XII IPS 2', 'jumlah' => 3],
                ['kelas' => 'Lainnya', 'jumlah' => 1]
            ]
        ]);
    }

    /**
     * 18. Prestasi Sekolah
     */
    public function achievements(Request $request)
    {
        $achievements = [
            [
                'id' => 1, 'nama' => 'Medali Emas Olimpiade Sains Nasional (OSN) Bidang Fisika 2026', 'bidang' => 'Akademik',
                'penerima' => 'Ahmad Fauzi Rahman (Siswa XII MIPA 1)', 'pembimbing' => 'Dewi Lestari, S.Pd', 'tingkat' => 'Nasional',
                'penyelenggara' => 'Pusat Prestasi Nasional (Puspresnas) Kemendikbudristek', 'tanggal' => '15 Sep 2026',
                'status' => 'Terverifikasi & Diberikan Piagam Penghargaan Sekolah'
            ],
            [
                'id' => 2, 'nama' => 'Juara 1 Lomba Cipta & Baca Puisi Tingkat Provinsi DKI Jakarta', 'bidang' => 'Seni & Sastra',
                'penerima' => 'Nadia Az-Zahra (Siswa XII MIPA 1)', 'pembimbing' => 'Siti Aminah, M.Pd', 'tingkat' => 'Provinsi',
                'penyelenggara' => 'Dinas Pendidikan Provinsi DKI Jakarta', 'tanggal' => '22 Agu 2026',
                'status' => 'Terverifikasi'
            ],
            [
                'id' => 3, 'nama' => 'Juara 1 Guru Inovatif & Inspiratif Bidang STEM 2026', 'bidang' => 'Prestasi Pendidik',
                'penerima' => 'Budi Santoso, M.Pd (Guru)', 'pembimbing' => 'Mandiri', 'tingkat' => 'Nasional',
                'penyelenggara' => 'Ditjen GTK Kemendikbudristek', 'tanggal' => '10 Sep 2026',
                'status' => 'Terverifikasi'
            ],
            [
                'id' => 4, 'nama' => 'Juara 2 Kejuaraan Basket Pelajar Walikota Cup 2026', 'bidang' => 'Olahraga',
                'penerima' => 'Tim Ekstrakurikuler Bola Basket Putra', 'pembimbing' => 'Bambang Trianto, S.Pd', 'tingkat' => 'Kota/Kabupaten',
                'penyelenggara' => 'Dispora Jakarta Selatan', 'tanggal' => '28 Agu 2026',
                'status' => 'Terverifikasi'
            ]
        ];

        return response()->json([
            'success' => true,
            'achievements' => $achievements,
            'summary' => [
                'internasional' => 0,
                'nasional' => 4,
                'provinsi' => 7,
                'kabupaten_kota' => 12,
                'kecamatan_sekolah' => 18,
                'total_tahun_ini' => 41
            ]
        ]);
    }

    /**
     * 19. Monitoring Ekstrakurikuler
     */
    public function extracurriculars(Request $request)
    {
        $ekskul = [
            ['nama' => 'KIR (Kelompok Ilmiah Remaja)', 'pembina' => 'Dewi Lestari, S.Pd', 'anggota' => 45, 'kehadiran_pct' => 96.0, 'aktivitas' => 'Eksperimen Riset Energi Terbarukan & Binaan OSN', 'prestasi_terkini' => 'Finalis LKIR LIPI 2026'],
            ['nama' => 'Paskibra Satya Bhakti', 'pembina' => 'Bambang Trianto, S.Pd', 'anggota' => 52, 'kehadiran_pct' => 98.5, 'aktivitas' => 'Latihan PBB Formasi & Persiapan Upacara Hari Pahlawan', 'prestasi_terkini' => 'Juara 1 LKBB Wilayah Selatan'],
            ['nama' => 'PMR & KSR Wira', 'pembina' => 'Nurul Hidayah, S.Psi', 'anggota' => 38, 'kehadiran_pct' => 94.2, 'aktivitas' => 'Simulasi Pertolongan Pertama & Donor Darah Sekolah', 'prestasi_terkini' => 'Regu Terbaik Jumbara PMI Kota'],
            ['nama' => 'Robotik & Coding Club', 'pembina' => 'Ahmad Rifa\'i, S.Kom', 'anggota' => 40, 'kehadiran_pct' => 97.0, 'aktivitas' => 'Pemrograman Arduino & IoT Smart School System', 'prestasi_terkini' => 'Juara 3 Line Follower Microbotics'],
            ['nama' => 'Basket & Futsal', 'pembina' => 'Drs. H. Mulyadi', 'anggota' => 64, 'kehadiran_pct' => 95.0, 'aktivitas' => 'Latihan Fisik Terpadu & Uji Tanding Antar Sekolah', 'prestasi_terkini' => 'Juara 2 Walikota Cup']
        ];

        return response()->json([
            'success' => true,
            'ekskul' => $ekskul,
            'total_ekskul' => 14,
            'siswa_terlibat_pct' => 91.5
        ]);
    }

    /**
     * 20. Agenda & Kalender Sekolah
     */
    public function calendar(Request $request)
    {
        $agenda = [
            ['tanggal' => '2 Okt 2026', 'kegiatan' => 'Apel Pagi & Rakor Pimpinan', 'kategori' => 'Kedinasan', 'lokasi' => 'Ruang Sidang Pimpinan'],
            ['tanggal' => '5-9 Okt 2026', 'kegiatan' => 'Pekan Asesmen Sumatif Tengah Semester Ganjil', 'kategori' => 'Akademik', 'lokasi' => 'Semua Rombel & CBT Lab'],
            ['tanggal' => '14 Okt 2026', 'kegiatan' => 'Rapat Pleno Dewan Guru & Evaluasi KBM', 'kategori' => 'Rapat Dewan Guru', 'lokasi' => 'Auditorium'],
            ['tanggal' => '24-26 Okt 2026', 'kegiatan' => 'LDKS & Kemah Pramuka Blok Kelas X', 'kategori' => 'Kesiswaan', 'lokasi' => 'Buperta Cibubur'],
            ['tanggal' => '28 Okt 2026', 'kegiatan' => 'Upacara Peringatan Hari Sumpah Pemuda', 'kategori' => 'Nasional', 'lokasi' => 'Lapangan Utama'],
            ['tanggal' => '10 Nov 2026', 'kegiatan' => 'Upacara Hari Pahlawan & Launching Buku Riset Siswa', 'kategori' => 'Seremonial', 'lokasi' => 'Auditorium']
        ];

        return response()->json([
            'success' => true,
            'agenda' => $agenda,
            'kalender_akademik' => [
                'semester_aktif' => 'Ganjil 2026/2027',
                'minggu_efektif' => 18,
                'hari_libur_nasional' => 4,
                'status' => 'Kalender Resmi Telah Divalidasi Kepala Sekolah'
            ]
        ]);
    }

    /**
     * 21. Pengumuman Sekolah & Store
     */
    public function announcements(Request $request)
    {
        $announcements = [
            [
                'id' => 1, 'judul' => 'Maklumat Pimpinan: Kebijakan Kedisiplinan & Budaya Prestasi Semester Ganjil',
                'konten' => 'Kepada seluruh pendidik, tenaga kependidikan, dan peserta didik, mari bersama-sama menjaga integritas akademik dan menegakkan budaya tepat waktu dalam setiap aktivitas pembelajaran.',
                'target' => 'Semua Sekolah (Guru, Tendik, Siswa, Orang Tua)', 'penulis' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)',
                'tanggal' => '1 Okt 2026', 'pinned' => true, 'status' => 'Dipublikasikan'
            ],
            [
                'id' => 2, 'judul' => 'Edaran Resmi Kepala Sekolah tentang Pelaksanaan Asesmen Tengah Semester',
                'konten' => 'Pelaksanaan Asesmen Sumatif Tengah Semester akan diselenggarakan dengan mengedepankan nilai kejujuran menggunakan platform CBT MyAcademic.',
                'target' => 'Guru, Siswa, Orang Tua', 'penulis' => 'Dr. H. Sulaiman, M.Si',
                'tanggal' => '28 Sep 2026', 'pinned' => false, 'status' => 'Dipublikasikan'
            ]
        ];

        return response()->json([
            'success' => true,
            'announcements' => $announcements
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $judul = $request->input('judul', 'Pengumuman Resmi Kepala Sekolah');
        $konten = $request->input('konten', '');
        $target = $request->input('target', 'Semua Sekolah');
        $pinned = $request->boolean('pinned', false);

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman resmi Kepala Sekolah berhasil dipublikasikan ke seluruh target pengguna.',
            'announcement' => [
                'id' => time(),
                'judul' => $judul,
                'konten' => $konten,
                'target' => $target,
                'penulis' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)',
                'tanggal' => now()->format('d M Y'),
                'pinned' => $pinned,
                'status' => 'Dipublikasikan'
            ]
        ]);
    }

    /**
     * 22. Komunikasi Pimpinan & Broadcast
     */
    public function communication(Request $request)
    {
        return response()->json([
            'success' => true,
            'channels' => [
                ['id' => 'ch-1', 'nama' => 'Dewan Guru & Pengajar', 'tipe' => 'Grup Pendidik', 'anggota' => 45, 'unread' => 0],
                ['id' => 'ch-2', 'nama' => 'Wali Kelas Seluruh Tingkat', 'tipe' => 'Grup Wali Kelas', 'anggota' => 18, 'unread' => 0],
                ['id' => 'ch-3', 'nama' => 'Pimpinan & Manajemen (Wakasek, TU, BK)', 'tipe' => 'Tim Inti Pimpinan', 'anggota' => 12, 'unread' => 0],
                ['id' => 'ch-4', 'nama' => 'Komite Sekolah & Perwakilan Wali Murid', 'tipe' => 'Komite', 'anggota' => 24, 'unread' => 0]
            ],
            'recent_broadcasts' => [
                ['id' => 'bc-1', 'judul' => 'Pengingat Batas Akhir Input Nilai Formatif Guru', 'penerima' => 'Seluruh Guru Pengajar', 'tanggal' => '2 Okt 2026, 08:00', 'status' => 'Terkirim 100%'],
                ['id' => 'bc-2', 'judul' => 'Apresiasi Capaian Medali Emas OSN Fisika 2026', 'penerima' => 'Seluruh Warga Sekolah & Orang Tua', 'tanggal' => '16 Sep 2026, 10:00', 'status' => 'Terkirim 100%']
            ]
        ]);
    }

    public function sendBroadcast(Request $request)
    {
        $judul = $request->input('judul', '');
        $pesan = $request->input('pesan', '');
        $target = $request->input('target', 'Dewan Guru');

        return response()->json([
            'success' => true,
            'message' => "Pesan broadcast pimpinan telah terkirim ke target: {$target}.",
            'broadcast' => [
                'id' => 'bc-' . time(),
                'judul' => $judul,
                'pesan' => $pesan,
                'target' => $target,
                'pengirim' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)',
                'sent_at' => now()->format('d M Y, H:i') . ' WIB'
            ]
        ]);
    }

    /**
     * 23. Laporan Eksekutif (Akademik, Siswa, Guru, Sekolah)
     */
    public function executiveReports(Request $request)
    {
        return response()->json([
            'success' => true,
            'reports' => [
                ['id' => 'rep-1', 'judul' => 'Laporan Eksekutif Capaian Akademik & Standar Mutu', 'periode' => 'Semester Ganjil 2026/2027', 'kategori' => 'Akademik', 'status' => 'Siap Download', 'format' => 'PDF / Excel'],
                ['id' => 'rep-2', 'judul' => 'Laporan Kehadiran, Disiplin & Perkembangan Karakter Siswa', 'periode' => 'Triwulan I TA 2026/2027', 'kategori' => 'Kesiswaan', 'status' => 'Siap Download', 'format' => 'PDF / Excel'],
                ['id' => 'rep-3', 'judul' => 'Laporan Kinerja Pendidik, Beban Mengajar & Kelengkapan Administrasi KBM', 'periode' => 'September 2026', 'kategori' => 'SDM Guru', 'status' => 'Siap Download', 'format' => 'PDF / Excel'],
                ['id' => 'rep-4', 'judul' => 'Laporan Evaluasi Diri Sekolah (EDS) & Ketercapaian 8 Standar Nasional Pendidikan', 'periode' => 'Tahun 2026', 'kategori' => 'Manajerial Sekolah', 'status' => 'Siap Download', 'format' => 'PDF / Excel']
            ]
        ]);
    }

    /**
     * 24. Executive Analytics & KPI Dashboard
     */
    public function executiveAnalytics(Request $request)
    {
        return response()->json([
            'success' => true,
            'academic_kpi' => [
                ['label' => 'Rata-rata Nilai Sekolah', 'actual' => 84.6, 'target' => 82.0, 'unit' => 'Poin', 'status' => 'Melampaui Target'],
                ['label' => 'Tingkat Ketuntasan Siswa', 'actual' => 89.4, 'target' => 88.0, 'unit' => '%', 'status' => 'Tercapai'],
                ['label' => 'Kelulusan Ujian Akhir', 'actual' => 100.0, 'target' => 100.0, 'unit' => '%', 'status' => 'On Track'],
                ['label' => 'Tingkat Pengumpulan Tugas', 'actual' => 93.8, 'target' => 90.0, 'unit' => '%', 'status' => 'Melampaui Target']
            ],
            'student_kpi' => [
                ['label' => 'Tingkat Kehadiran Siswa', 'actual' => 95.8, 'target' => 95.0, 'unit' => '%', 'status' => 'Tercapai'],
                ['label' => 'Siswa At-Risk (Akademik & Absensi)', 'actual' => 3.3, 'target' => 5.0, 'unit' => '% Maks', 'status' => 'Sangat Terkendali'],
                ['label' => 'Siswa Berprestasi Lomba/OSN', 'actual' => 41, 'target' => 30, 'unit' => 'Penghargaan', 'status' => 'Melampaui Target'],
                ['label' => 'Penyelesaian Kasus Disiplin', 'actual' => 85.7, 'target' => 80.0, 'unit' => '%', 'status' => 'Tercapai']
            ],
            'teacher_kpi' => [
                ['label' => 'Kehadiran Mengajar Guru', 'actual' => 97.7, 'target' => 95.0, 'unit' => '%', 'status' => 'Tercapai'],
                ['label' => 'Kelengkapan Jurnal KBM Tepat Waktu', 'actual' => 94.2, 'target' => 90.0, 'unit' => '%', 'status' => 'Tercapai'],
                ['label' => 'Ketepatan Input Nilai Siswa', 'actual' => 88.5, 'target' => 90.0, 'unit' => '%', 'status' => 'Perlu Perhatian Sedang'],
                ['label' => 'Guru Bersertifikasi Pendidik', 'actual' => 84.4, 'target' => 80.0, 'unit' => '%', 'status' => 'Melampaui Target']
            ],
            'school_kpi' => [
                ['label' => 'Indeks Kepuasan Orang Tua/Siswa', 'actual' => 91.2, 'target' => 88.0, 'unit' => '/100', 'status' => 'Sangat Baik'],
                ['label' => 'Ketercapaian Kurikulum Merdeka', 'actual' => 92.5, 'target' => 90.0, 'unit' => '%', 'status' => 'Melampaui Target'],
                ['label' => 'Digitalisasi Layanan Akademik', 'actual' => 98.0, 'target' => 95.0, 'unit' => '%', 'status' => 'Sangat Baik']
            ]
        ]);
    }

    /**
     * 25. Early Warning System (EWS)
     */
    public function earlyWarning(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'critical_count' => 2,
                'warning_count' => 3,
                'normal_count' => 12
            ],
            'items' => [
                [
                    'id' => 'ews-1',
                    'level' => 'critical',
                    'kategori' => 'Akademik & Ketuntasan',
                    'judul' => 'Ketuntasan Mapel Fisika Kelas X-4 Hanya 62.8%',
                    'indikator' => '13 siswa di bawah KKM 75.0',
                    'dampak' => 'Risiko ketertinggalan materi semester lanjut',
                    'rekomendasi' => 'Panggil guru pengampu dan fasilitasi program klinik remedial terbimbing.'
                ],
                [
                    'id' => 'ews-2',
                    'level' => 'critical',
                    'kategori' => 'Kesiswaan & Presensi',
                    'judul' => 'Siswa Dimas Arya Pratama (XI MIPA 2) Mengumpulkan 6 Hari Alfa',
                    'indikator' => 'Presensi kumulatif turun menjadi 86.4%',
                    'dampak' => 'Berpotensi tidak memenuhi syarat kenaikan kelas jika melampaui batas 15%',
                    'rekomendasi' => 'Surat panggilan orang tua tahap 2 dan pendampingan konselor BK intensif.'
                ],
                [
                    'id' => 'ews-3',
                    'level' => 'warning',
                    'kategori' => 'Administrasi Guru',
                    'judul' => '2 Guru Pengampu Melewati Batas Waktu Input Nilai Formatif 3',
                    'indikator' => 'Rapor rombel XI MIPA 2 & X-4 belum dapat difinalisasi',
                    'dampak' => 'Menunda jadwal pengesahan rapor sekolah oleh Kepala Sekolah',
                    'rekomendasi' => 'Pemberian teguran pembinaan via Wakasek Kurikulum.'
                ],
                [
                    'id' => 'ews-4',
                    'level' => 'warning',
                    'kategori' => 'Kedisiplinan',
                    'judul' => 'Tren Keterlambatan Meningkat pada Hari Jumat (+12%)',
                    'indikator' => 'Rata-rata 14 siswa terlambat apel pagi',
                    'dampak' => 'Penurunan ketertiban jam pelajaran pertama',
                    'rekomendasi' => 'Sosialisasi penguatan disiplin dan koordinasi tim piket gerbang.'
                ],
                [
                    'id' => 'ews-5',
                    'level' => 'normal',
                    'kategori' => 'Infrastruktur KBM',
                    'judul' => 'Server CBT & Jaringan Kampus Berjalan Optimal (Uptime 99.9%)',
                    'indikator' => 'Zero downtime selama sesi ujian online',
                    'dampak' => 'Pelaksanaan KBM digital lancar',
                    'rekomendasi' => 'Pertahankan pemeliharaan berkala.'
                ]
            ]
        ]);
    }

    /**
     * 26. Perbandingan Periode
     */
    public function periodComparison(Request $request)
    {
        return response()->json([
            'success' => true,
            'semesters' => [
                ['metric' => 'Rata-rata Nilai', 'periode_a' => '82.9 (Genap 2025/2026)', 'periode_b' => '84.6 (Ganjil 2026/2027)', 'tren' => '+1.7 Poin'],
                ['metric' => 'Persentase Ketuntasan', 'periode_a' => '86.1%', 'periode_b' => '89.4%', 'tren' => '+3.3%'],
                ['metric' => 'Tingkat Kehadiran Siswa', 'periode_a' => '94.5%', 'periode_b' => '95.8%', 'tren' => '+1.3%'],
                ['metric' => 'Jumlah Prestasi Kejuaraan', 'periode_a' => '28 Juara', 'periode_b' => '41 Juara', 'tren' => '+13 Prestasi'],
                ['metric' => 'Kasus Pelanggaran Tata Tertib', 'periode_a' => '22 Kasus', 'periode_b' => '14 Kasus', 'tren' => '-36.3% (Membaik)']
            ],
            'class_compare' => [
                'kelas_a' => 'XII MIPA 1 (Rerata 88.7, Hadir 98.4%, Tuntas 97.2%)',
                'kelas_b' => 'XII MIPA 2 (Rerata 86.4, Hadir 96.8%, Tuntas 94.2%)',
                'analisis' => 'Kelas XII MIPA 1 unggul dalam konsistensi pengerjaan tugas mandiri dan kehadiran apel pagi.'
            ]
        ]);
    }

    /**
     * 27. Profil Performa Sekolah ("Bagaimana kondisi sekolah saya sekarang?")
     */
    public function performanceProfile(Request $request)
    {
        $timeframe = $request->query('timeframe', 'today'); // today, week, month, semester, year

        return response()->json([
            'success' => true,
            'timeframe' => $timeframe,
            'status_headline' => 'Kondisi Sekolah Stabil, Tertib, dan Menunjukkan Tren Prestasi Akademik Meningkat',
            'summary' => [
                'akademik' => '84.6 Rata-rata Nilai (89.4% Ketuntasan)',
                'kehadiran' => '95.8% Siswa Hadir, 97.7% Guru Hadir',
                'guru' => '34 Sesi KBM Berjalan Tertib, 94.2% Jurnal Masuk',
                'siswa' => '540 Siswa Aktif, 41 Penghargaan Prestasi',
                'disiplin' => '85.7% Kasus Selesai, Zero Insiden Berat',
                'ekskul' => '14 Ekstrakurikuler Aktif, 91.5% Partisipasi Siswa',
                'tren_perkembangan' => 'Positif dan Melampaui Target Rencana Kerja Sekolah (RKS)'
            ]
        ]);
    }

    /**
     * 28. Dokumen Sekolah
     */
    public function documents(Request $request)
    {
        $documents = [
            ['id' => 'DOC-01', 'nomor' => '421.3/089/SK-SMAN1/2026', 'judul' => 'Surat Keputusan Pembagian Tugas Mengajar Guru & Tendik TA 2026/2027', 'kategori' => 'SK Kepala Sekolah', 'tanggal' => '15 Jul 2026', 'status' => 'Resmi / Berlaku', 'url' => '#'],
            ['id' => 'DOC-02', 'nomor' => '421.3/112/SK-SMAN1/2026', 'judul' => 'Surat Keputusan Penetapan Panitia ANBK & Asesmen Sumatif 2026', 'kategori' => 'SK Kepala Sekolah', 'tanggal' => '30 Sep 2026', 'status' => 'Menunggu Tanda Tangan Pimpinan', 'url' => '#'],
            ['id' => 'DOC-03', 'nomor' => '421.3/044/KOSP/2026', 'judul' => 'Kurikulum Operasional Satuan Pendidikan (KOSP) Tahun Ajaran 2026/2027', 'kategori' => 'Dokumen Akademik', 'tanggal' => '10 Jul 2026', 'status' => 'Disahkan Disdik Provinsi', 'url' => '#'],
            ['id' => 'DOC-04', 'nomor' => '421.3/105/ST/2026', 'judul' => 'Surat Tugas Pendampingan Kontingen OSN Fisika Tingkat Nasional', 'kategori' => 'Surat Tugas', 'tanggal' => '12 Sep 2026', 'status' => 'Selesai Dilaksanakan', 'url' => '#'],
            ['id' => 'DOC-05', 'nomor' => '421.3/088/EDS/2026', 'judul' => 'Laporan Evaluasi Diri Sekolah (EDS) Berbasis Rapor Pendidikan Kemendikbud', 'kategori' => 'Laporan Mutu', 'tanggal' => '20 Agu 2026', 'status' => 'Resmi', 'url' => '#']
        ];

        return response()->json([
            'success' => true,
            'documents' => $documents
        ]);
    }

    /**
     * 29. Audit & Aktivitas Sistem
     */
    public function auditTrail(Request $request)
    {
        $logs = [
            ['waktu' => '2 Okt 2026, 09:30', 'aktor' => 'Drs. H. Mulyadi (Wakasek Kurikulum)', 'aksi' => 'Mengajukan E-Rapor 14 Rombel ke Approval Kepala Sekolah', 'entitas' => 'E-Rapor Ganjil 2026'],
            ['waktu' => '2 Okt 2026, 08:45', 'aktor' => 'Admin Sekolah (Hendra Pratama)', 'aksi' => 'Koreksi Data Dispensasi Presensi Tim OSN', 'entitas' => 'Presensi Siswa'],
            ['waktu' => '1 Okt 2026, 16:20', 'aktor' => 'Budi Santoso, M.Pd (Guru)', 'aksi' => 'Finalisasi Penguncian Nilai Matematika XII MIPA 1', 'entitas' => 'Buku Nilai Gradebook'],
            ['waktu' => '1 Okt 2026, 14:10', 'aktor' => 'Hendra Pratama (Kepala TU)', 'aksi' => 'Mengunggah Berkas Mutasi Masuk Siswa Rayhan', 'entitas' => 'Mutasi Siswa'],
            ['waktu' => '30 Sep 2026, 15:00', 'aktor' => 'Nurul Hidayah (BK)', 'aksi' => 'Update Status Penyelesaian Kasus Mediasi Siswa', 'entitas' => 'Layanan Konseling BK']
        ];

        return response()->json([
            'success' => true,
            'logs' => $logs
        ]);
    }

    /**
     * 30. Search Sekolah (Global Search)
     */
    public function globalSearch(Request $request)
    {
        $q = strtolower(trim($request->query('q', '')));

        if (!$q) {
            return response()->json(['success' => true, 'results' => []]);
        }

        $allData = [
            ['type' => 'Siswa', 'title' => 'Ahmad Fauzi Rahman', 'subtitle' => 'XII MIPA 1 — NISN: 0068192301 — Medali Emas OSN Fisika', 'badge' => 'Siswa Berprestasi', 'tab' => 'monitoring-siswa'],
            ['type' => 'Siswa', 'title' => 'Dimas Arya Pratama', 'subtitle' => 'XI MIPA 2 — Rerata: 71.5 — Butuh Perhatian Absensi', 'badge' => 'At-Risk', 'tab' => 'monitoring-siswa'],
            ['type' => 'Guru', 'title' => 'Budi Santoso, M.Pd', 'subtitle' => 'Guru Matematika Peminatan — Wali Kelas XII MIPA 1', 'badge' => 'Guru Pengampu', 'tab' => 'monitoring-guru'],
            ['type' => 'Guru', 'title' => 'Dewi Lestari, S.Pd', 'subtitle' => 'Guru Fisika — Wali Kelas XI MIPA 2', 'badge' => 'Guru Pengampu', 'tab' => 'monitoring-guru'],
            ['type' => 'Kelas', 'title' => 'Kelas XII MIPA 1', 'subtitle' => '36 Siswa — Wali: Budi Santoso — Rerata Nilai 88.7', 'badge' => 'Rombel', 'tab' => 'monitoring-kelas'],
            ['type' => 'Mata Pelajaran', 'title' => 'Matematika Peminatan', 'subtitle' => '215 Siswa — 4 Rombel — Ketuntasan 91.2%', 'badge' => 'Mapel', 'tab' => 'akademik-mapel'],
            ['type' => 'Dokumen', 'title' => 'SK Pembagian Tugas Mengajar 2026/2027', 'subtitle' => 'Surat Keputusan Resmi Kepala Sekolah', 'badge' => 'Dokumen SK', 'tab' => 'dokumen-sekolah'],
            ['type' => 'Prestasi', 'title' => 'Medali Emas OSN Fisika 2026', 'subtitle' => 'Tingkat Nasional — Ahmad Fauzi Rahman', 'badge' => 'Prestasi', 'tab' => 'monitoring-prestasi']
        ];

        $matched = array_values(array_filter($allData, function($item) use ($q) {
            return str_contains(strtolower($item['title']), $q) || str_contains(strtolower($item['subtitle']), $q);
        }));

        return response()->json([
            'success' => true,
            'query' => $q,
            'results' => $matched
        ]);
    }

    /**
     * 31. Notifikasi Kepala Sekolah
     */
    public function notifications(Request $request)
    {
        $notifications = [
            ['id' => 1, 'type' => 'approval', 'title' => 'Persetujuan Finalisasi E-Rapor', 'message' => '14 Rombel menunggu pengesahan Kepala Sekolah', 'time' => '10 menit yang lalu', 'unread' => true],
            ['id' => 2, 'type' => 'warning', 'title' => 'Early Warning: Ketuntasan Fisika X-4 Rendah', 'message' => 'Ketuntasan kelas mencapai 62.8% (di bawah KKM)', 'time' => '1 jam yang lalu', 'unread' => true],
            ['id' => 3, 'type' => 'info', 'title' => 'Pengajuan Proposal Kegiatan LDKS', 'message' => 'Wakasek Kesiswaan mengajukan proposal kemah karakter', 'time' => '2 jam yang lalu', 'unread' => false],
            ['id' => 4, 'type' => 'success', 'title' => 'Capaian Prestasi Baru Terverifikasi', 'message' => 'Medali Emas OSN Fisika telah diinput ke direktori prestasi', 'time' => 'Kemarin', 'unread' => false]
        ];

        return response()->json([
            'success' => true,
            'notifications' => $notifications,
            'unread_count' => 2
        ]);
    }
}
