'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Layers,
  GraduationCap,
  BookOpen,
  Calendar,
  Users,
  Award,
  ShieldAlert,
  FileSpreadsheet,
  Settings,
  HeartPulse,
  Brain,
  MessageSquare,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  FileText,
  Activity,
  Check,
  Building,
  Lock,
  Download,
  Upload,
  BarChart,
  Bot,
  Smartphone,
  ShieldCheck,
  Briefcase,
  FolderOpen
} from 'lucide-react';
import { isTabAllowed, ROLE_CONFIGS, RoleType } from '@/lib/rbac';

export interface ModuleItem {
  num: number;
  title: string;
  category: string;
  description: string;
  targetTab?: string;
  badge?: string;
  features: string[];
  details?: {
    specs: string[];
    roleAccess: string[];
    apiEndpoint: string;
    sampleData: string;
  };
}

interface ModuleCatalogViewProps {
  currentUserRole?: string;
  onNavigateTab: (tabId: string) => void;
}

export default function ModuleCatalogView({ currentUserRole = 'murid', onNavigateTab }: ModuleCatalogViewProps) {
  const normRole = (currentUserRole || 'murid').toLowerCase() as RoleType;
  const currentRoleConfig = ROLE_CONFIGS[normRole] || ROLE_CONFIGS.murid;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('all');
  const [activeInspectModule, setActiveInspectModule] = useState<ModuleItem | null>(null);

  // Complete List of All 58 Modules as requested by User
  const allModulesList: ModuleItem[] = [
    // 1 - 10: Master Core & KBM
    {
      num: 1,
      title: 'School Management & Pendaftaran',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Registrasi sekolah, NPSN resmi, jenjang, status akreditasi, kop surat, identitas kepala sekolah, dan konfigurasi profil sekolah.',
      targetTab: 'school-tu',
      features: ['Registrasi NPSN', 'Setup Jenjang & Akreditasi', 'Branding & Kop Surat', 'Multi-Tenancy Workspace'],
      details: {
        specs: ['Registrasi sekolah baru (NPSN, nama, jenjang)', 'Setup tahun ajaran & semester', 'Konfigurasi branding & logo', 'Timezone & format tanggal'],
        roleAccess: ['Super Admin', 'Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/schools',
        sampleData: 'SMAN 1 Teladan Jakarta • NPSN: 20108391 • Akreditasi A Unggul'
      }
    },
    {
      num: 2,
      title: 'Pengguna & Hak Akses (RBAC)',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Manajemen akun 9 peran (Admin, Kepsek, Guru, Walikelas, BK, TU, Siswa, Ortu) dengan kontrol izin Spatie dan multi-device login.',
      targetTab: 'school-tu',
      features: ['9 Peran Spatie RBAC', 'Aktivasi & Reset Password', 'Matriks Permission Fitur', 'Device & Session Audit'],
      details: {
        specs: ['Role admin, kepsek, guru, walikelas, bk, tu, siswa, orang tua', 'Permission per menu & aksi CRUD', 'Manajemen status aktif/suspend', 'Audit token login'],
        roleAccess: ['Super Admin', 'Tata Usaha'],
        apiEndpoint: '/api/v1/users',
        sampleData: 'Total 542 Pengguna Terverifikasi • 9 Roles Aktif'
      }
    },
    {
      num: 3,
      title: 'Siswa / Student Management',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Buku induk siswa, NISN, NIK, biodata lengkap, kartu pelajar digital, riwayat kelas, data wali murid, dan histori mutasi.',
      targetTab: 'school-tu',
      features: ['Buku Induk & NISN', 'Data Orang Tua / Wali', 'Histori Kelas & Pindah', 'Kartu Pelajar Digital'],
      details: {
        specs: ['Data pokok siswa & kontak keluarga', 'Riwayat rombel per semester', 'Status aktif, mutasi, cuti, lulus', 'Cetak kartu siswa barcode'],
        roleAccess: ['Tata Usaha', 'Wali Kelas', 'Guru'],
        apiEndpoint: '/api/v1/students',
        sampleData: '480 Siswa Aktif • 12 Rombel'
      }
    },
    {
      num: 4,
      title: 'Guru / Teacher Management',
      category: 'SDM Guru & Presensi',
      description: 'Database GTK, NUPTK, NIP, gelar akademik, kualifikasi mengajar, sertifikasi pendidik, dan perhitungan beban jam kerja.',
      targetTab: 'school-tu',
      features: ['NUPTK & NIP Resmi', 'Status Kepegawaian', 'Beban Jam Mengajar', 'Riwayat Pendidikan'],
      details: {
        specs: ['Master GTK & sertifikasi', 'Plotting kualifikasi mapel', 'Rekap jam linier Tatap Muka', 'Berkas SK Pengangkatan'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/teachers',
        sampleData: '42 Guru Pengampu • 100% Bersertifikasi'
      }
    },
    {
      num: 5,
      title: 'Kelas & Rombel Management',
      category: 'Akademik & Kurikulum',
      description: 'Pengelolaan rombongan belajar, tingkat kelas (X, XI, XII), kapasitas ruangan, plotting siswa, dan penetapan wali kelas.',
      targetTab: 'classes',
      features: ['Daftar Rombel & Tingkat', 'Kapasitas & Kuota', 'Penetapan Wali Kelas', 'Mutasi Antar-Kelas'],
      details: {
        specs: ['Pemisahan jurusan IPA / IPS / Vokasi', 'Validasi kapasitas maksimal 36 siswa', 'Plotting siswa otomatis & manual', 'Ranking rerata kelas'],
        roleAccess: ['Tata Usaha', 'Wali Kelas', 'Guru'],
        apiEndpoint: '/api/v1/classes',
        sampleData: '12 Kelas Aktif • Rerata 36 Siswa/Kelas'
      }
    },
    {
      num: 6,
      title: 'Tahun Ajaran & Semester',
      category: 'Akademik & Kurikulum',
      description: 'Penetapan tahun pelajaran aktif, semester ganjil/genap, tanggal periode KBM, alur kenaikan kelas, dan arsip kelulusan.',
      targetTab: 'school-tu',
      features: ['Tahun Ajaran Aktif', 'Tutup Buku Semester', 'Promosi Kenaikan Kelas', 'Arsip Historis'],
      details: {
        specs: ['Switching semester ganjil/genap', 'Kunci nilai akhir semester', 'Proses kenaikan kelas berjenjang', 'Snapshot rekap capaian tahunan'],
        roleAccess: ['Super Admin', 'Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/academic-years',
        sampleData: 'Tahun Ajaran 2026/2027 • Semester Ganjil (Aktif)'
      }
    },
    {
      num: 7,
      title: 'Mata Pelajaran (Subject Master)',
      category: 'Akademik & Kurikulum',
      description: 'Master mata pelajaran, kelompok wajib/pilihan/muatan lokal, penetapan batas KKM/KKTP, dan bobot komponen nilai.',
      targetTab: 'subjects',
      features: ['Kode & Kelompok Mapel', 'Standar KKM 75.0', 'Guru Pengampu Utama', 'Silabus & Capaian Ajar'],
      details: {
        specs: ['Pengelompokan Kurikulum Merdeka / K13', 'Penetapan KKM per jenjang', 'Alokasi jam mingguan', 'Deskripsi capaian pembelajaran'],
        roleAccess: ['Tata Usaha', 'Guru', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/subjects',
        sampleData: '18 Mapel Terdaftar • Standar KKM 75'
      }
    },
    {
      num: 8,
      title: 'Penugasan Guru / Pengampu',
      category: 'Akademik & Kurikulum',
      description: 'Distribusi plotting guru mengajar ke setiap rombel dan mata pelajaran beserta monitoring beban jam tatap muka mingguan.',
      targetTab: 'schedule',
      features: ['Plot Guru - Mapel - Kelas', 'Beban Jam Mengajar', 'Team Teaching', 'Histori Penugasan'],
      details: {
        specs: ['Validasi beban mengajar 24 jam', 'Dukungan guru pendamping/team teaching', 'Riwayat penugasan semester', 'Surat tugas mengajar'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/teaching-assignments',
        sampleData: '42 Guru Terplot • 0 Jam Konflik'
      }
    },
    {
      num: 9,
      title: 'Jadwal Pelajaran & Anti-Bentrok',
      category: 'Akademik & Kurikulum',
      description: 'Matriks penyusunan jadwal mingguan dengan algoritma cerdas pendeteksi bentrok jadwal guru dan bentrok ruangan secara instan.',
      targetTab: 'schedule',
      features: ['Matriks Jadwal Mingguan', 'Deteksi Guru Bentrok', 'Deteksi Ruang Bentrok', 'Filter Jadwal Siswa/Guru'],
      details: {
        specs: ['Algoritma validasi overlap jam KBM', 'Jadwal per hari Senin - Sabtu', 'Filter tampilan per guru / per rombel', 'Cetak jadwal kelas & guru'],
        roleAccess: ['Tata Usaha', 'Guru', 'Siswa'],
        apiEndpoint: '/api/v1/timetables',
        sampleData: 'Senin - Sabtu • 48 Sesi Mingguan Aktif'
      }
    },
    {
      num: 10,
      title: 'Sesi Pertemuan / Jurnal KBM',
      category: 'Akademik & Kurikulum',
      description: 'Jurnal mengajar harian guru, pencatatan materi tatap muka, kendala kelas, jam pengganti, dan status verifikasi sesi.',
      targetTab: 'schedule',
      features: ['Jurnal Mengajar Harian', 'Pencatatan Materi Sesi', 'Sesi Normal & Pengganti', 'Log KBM Real-time'],
      details: {
        specs: ['Input topik ajar per pertemuan', 'Catatan dinamika siswa di kelas', 'Validasi jam mulai dan jam selesai', 'Laporan supervisi KBM harian'],
        roleAccess: ['Guru', 'Kepala Sekolah', 'Wali Kelas'],
        apiEndpoint: '/api/v1/teaching-sessions',
        sampleData: 'Pertemuan ke-8 Selesai • Topik: Termodinamika'
      }
    },

    // 11 - 20: Presensi, Materi, Tugas, Ujian, Penilaian
    {
      num: 11,
      title: 'Presensi Guru Datang & Pulang',
      category: 'SDM Guru & Presensi',
      description: 'Pencatatan presensi kehadiran guru harian, dispensasi tugas dinas luar, surat izin, dan rekap persentase kedisiplinan bulanan.',
      targetTab: 'attendance',
      features: ['Check-in / Check-out Guru', 'Surat Tugas Dinas Luar', 'Rekap Kehadiran Bulanan', 'Monitoring Kedisiplinan'],
      details: {
        specs: ['Waktu presensi otomatis', 'Keterangan Hadir, Izin, Sakit, Dinas', 'Rekapitulasi tunjangan kinerja', 'Ekspor rekap presensi guru'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah', 'Guru'],
        apiEndpoint: '/api/v1/teacher-attendance',
        sampleData: 'Tingkat Kehadiran Guru: 98.2% Bulan Ini'
      }
    },
    {
      num: 12,
      title: 'Presensi Siswa Harian & Mapel',
      category: 'SDM Guru & Presensi',
      description: 'Absensi siswa per tatap muka dan harian, verifikasi surat izin/sakit, audit koreksi kehadiran, dan notifikasi otomatis ke ortu.',
      targetTab: 'attendance',
      features: ['Presensi Harian & Mapel', 'Upload Bukti Surat Izin', 'Rekap Hadir, Sakit, Alfa', 'Audit Koreksi Absensi'],
      details: {
        specs: ['Status H, S, I, A dengan warna visual', 'Lampiran file surat sakit dokter', 'Rekap persentase kehadiran untuk syarat ujian', 'Alert absensi rendah'],
        roleAccess: ['Guru', 'Wali Kelas', 'Tata Usaha'],
        apiEndpoint: '/api/v1/student-attendance',
        sampleData: 'Rata-rata Kehadiran Siswa: 94.6%'
      }
    },
    {
      num: 13,
      title: 'Materi Pembelajaran / E-Modul',
      category: 'Akademik & Kurikulum',
      description: 'Repositori materi ajar multi-format (PDF, Video, Presentasi PPT, Tautan), terorganisir per bab topik dan per pertemuan.',
      targetTab: 'journey',
      features: ['Upload Multi-format Materi', 'Pustaka Materi Mapel', 'Modul per Pertemuan', 'Preview Dokumen Online'],
      details: {
        specs: ['Mendukung PDF, PPT, MP4, Link Eksternal', 'Akses instan bagi siswa terdaftar', 'Statistik unduh materi', 'Arsip materi lintas semester'],
        roleAccess: ['Guru', 'Siswa'],
        apiEndpoint: '/api/v1/materials',
        sampleData: '24 E-Modul Terbit • 4 Format Didukung'
      }
    },
    {
      num: 14,
      title: 'Tugas Siswa & Pengumpulan',
      category: 'Pembelajaran & Asesmen',
      description: 'Manajemen tugas mandiri/kelompok, batas tenggat waktu (deadline), pengumpulan berkas online, dan feedback penilaian guru.',
      targetTab: 'assignments',
      features: ['Batas Waktu Deadline', 'Pengumpulan Tugas Online', 'Koreksi & Nilai Guru', 'Status Terlambat Otomatis'],
      details: {
        specs: ['Form upload file & link tugas siswa', 'Deteksi status tepat waktu vs terlambat', 'Input nilai angka dan catatan koreksi', 'Statistik pengumpulan kelas'],
        roleAccess: ['Guru', 'Siswa'],
        apiEndpoint: '/api/v1/assignments',
        sampleData: '14 Tugas Aktif • 92% Terkumpul Tepat Waktu'
      }
    },
    {
      num: 15,
      title: 'Kuis Siswa & Bank Soal',
      category: 'Pembelajaran & Asesmen',
      description: 'Engine kuis interaktif dengan acak soal, timer pengerjaan, skor instan, dan evaluasi pemahaman materi per topik bahasan.',
      targetTab: 'cbt',
      features: ['Timer Pengerjaan Kuis', 'Pengacakan Soal & Pilihan', 'Koreksi Skor Instan', 'Analisis Tingkat Kesulitan'],
      details: {
        specs: ['Bank soal pilihan ganda & uraian', 'Timer hitung mundur per kuis', 'Kunci jawaban dan pembahasan', 'Histori percobaan kuis siswa'],
        roleAccess: ['Guru', 'Siswa'],
        apiEndpoint: '/api/v1/quizzes',
        sampleData: 'Bank Soal: 150 Butir Soal Terverifikasi'
      }
    },
    {
      num: 16,
      title: 'Ujian Sekolah CBT (Anti-Cheat)',
      category: 'Pembelajaran & Asesmen',
      description: 'Sistem asesmen CBT resmi untuk PTS, PAS, dan Ujian Sekolah dengan token akses, deteksi perpindahan tab anti-curang, dan autosave.',
      targetTab: 'cbt',
      features: ['Token Akses Ujian', 'Deteksi Tab Switch / Cheat', 'Autosave Lembar Jawaban', 'Simulator CBT Responsif'],
      details: {
        specs: ['Mode layar penuh & anti copy-paste', 'Peringatan otomatis saat siswa buka tab baru', 'Palet navigasi nomor 1-40 dengan status ragu-ragu', 'Kalkulasi nilai otomatis'],
        roleAccess: ['Guru', 'Siswa', 'Tata Usaha'],
        apiEndpoint: '/api/v1/exams',
        sampleData: 'PTS Ganjil 2026 Aktif • Token: PAS-992'
      }
    },
    {
      num: 17,
      title: 'Penilaian (Assessment Engine)',
      category: 'Pembelajaran & Asesmen',
      description: 'Komponen penilaian berkala meliputi Tugas, Kuis, Praktik, UTS, dan UAS dengan pembobotan persentase fleksibel.',
      targetTab: 'gradebook',
      features: ['Skema Bobot Nilai Adaptif', 'Penilaian Praktik & Sikap', 'Riwayat Revisi Nilai', 'Standarisasi Skala 100'],
      details: {
        specs: ['Rumus: Tugas (30%) + Kuis (20%) + UTS (25%) + UAS (25%)', 'Validasi nilai minimum 0 dan maksimum 100', 'Konversi angka ke predikat huruf', 'Sinkronisasi ke rapor'],
        roleAccess: ['Guru', 'Wali Kelas'],
        apiEndpoint: '/api/v1/assessments',
        sampleData: 'Bobot Default: 30% TGS • 20% KUIS • 25% UTS • 25% UAS'
      }
    },
    {
      num: 18,
      title: 'Buku Nilai (Central Gradebook)',
      category: 'Pembelajaran & Asesmen',
      description: 'Pusat buku nilai sekolah terlengkap: pengecekan tuntas KKM 75, fitur kunci/lock nilai oleh guru, dan ranking siswa sekelas.',
      targetTab: 'gradebook',
      features: ['Sentralisasi Buku Nilai', 'Validasi Batas KKM 75', 'Fitur Lock / Kunci Nilai', 'Kalkulasi Ranking Kelas'],
      details: {
        specs: ['Pemberian tanda Tuntas / Belum Tuntas', 'Proteksi penguncian nilai sebelum rapat pleno', 'Distribusi sebaran nilai visual', 'Ekspor ke format Excel kemdikbud'],
        roleAccess: ['Guru', 'Wali Kelas', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/gradebooks',
        sampleData: 'KKM: 75.0 • 92% Siswa Tuntas KKM'
      }
    },
    {
      num: 19,
      title: 'Rapor Siswa / E-Rapor Digital',
      category: 'Pembelajaran & Asesmen',
      description: 'Penerbitan dokumen rapor digital resmi berstandar nasional, rekap nilai seluruh mapel, catatan wali kelas & kepsek, serta siap cetak PDF.',
      targetTab: 'gradebook',
      features: ['Preview E-Rapor Siswa', 'Cetak Dokumen Resmi PDF', 'Deskripsi Capaian Kompetensi', 'Tanda Tangan & Pengesahan'],
      details: {
        specs: ['Template layout resmi standar Kurikulum', 'Rekap absensi H, S, I, A di halaman rapor', 'Catatan pembinaan karakter oleh wali kelas', 'Ekspor PDF siap cetak kertas A4'],
        roleAccess: ['Wali Kelas', 'Kepala Sekolah', 'Siswa', 'Orang Tua'],
        apiEndpoint: '/api/v1/report-cards',
        sampleData: 'Status: 100% Siap Cetak & Terverifikasi'
      }
    },
    {
      num: 20,
      title: 'Wali Kelas / Portal Monitoring',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Dasbor khusus wali kelas untuk memantau kehadiran rombel, dinamika capaian akademik siswa, koordinasi orang tua, dan pembinaan.',
      targetTab: 'walikelas-bk',
      features: ['Dasbor Kendali Rombel', 'Monitoring Presensi Kelas', 'Catatan Pembinaan Siswa', 'Peringatan Siswa Bermasalah'],
      details: {
        specs: ['Rekapitulasi ranking dan rata-rata kelas', 'Identifikasi siswa yang membutuhkan remedial', 'Pencatatan komunikasi dengan wali murid', 'Validasi kelayakan rapor'],
        roleAccess: ['Wali Kelas'],
        apiEndpoint: '/api/v1/homeroom',
        sampleData: 'Rombel: 12-IPA 1 • 36 Siswa Terpantau'
      }
    },

    // 21 - 30: BK, Prestasi, Pelanggaran, Ortu, Komunikasi, Ekskul
    {
      num: 21,
      title: 'Bimbingan Konseling (BK Private)',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Pencatatan kasus bimbingan konseling privat terlindungi PIN enkripsi, tingkat prioritas kasus, jadwal temu, dan tindak lanjut rujukan.',
      targetTab: 'walikelas-bk',
      features: ['Enkripsi Kasus BK Rahasia', 'Prioritas Kasus (Tinggi/Sedang)', 'Jadwal Temu Konseling', 'Rekomendasi Tindak Lanjut'],
      details: {
        specs: ['Hak akses eksklusif guru BK bersertifikat', 'Fitur Lock/Unlock dengan sensor data rahasia', 'Klasifikasi kasus belajar, pribadi, sosial, karir', 'Laporan tindak lanjut'],
        roleAccess: ['Konselor BK', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/counseling',
        sampleData: '3 Kasus Aktif • Proteksi Enkripsi Aktif'
      }
    },
    {
      num: 22,
      title: 'Prestasi Siswa (Student Achievement)',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Pencatatan prestasi lomba sains, olahraga, seni dari tingkat sekolah, kab/kota, provinsi, hingga internasional beserta sertifikat.',
      targetTab: 'walikelas-bk',
      features: ['Kategori Prestasi & Lomba', 'Tingkat Kab / Prov / Nasional', 'Arsip Bukti Sertifikat', 'Portofolio Nilai Tambah'],
      details: {
        specs: ['Verifikasi bukti sertifikat dan foto penyerahan', 'Perhitungan poin reward prestasi', 'Tercatat otomatis di lampiran e-rapor', 'Statistik kejuaraan sekolah'],
        roleAccess: ['Wali Kelas', 'Kesiswaan', 'Guru'],
        apiEndpoint: '/api/v1/achievements',
        sampleData: '14 Prestasi Terkini (Juara 1 OSN Fisika, dll)'
      }
    },
    {
      num: 23,
      title: 'Pelanggaran & Poin Tata Tertib',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Sistem akumulasi poin pelanggaran kedisiplinan siswa berjenjang, kronologi kejadian, penerbitan surat peringatan (SP1/SP2/SP3).',
      targetTab: 'walikelas-bk',
      features: ['Katalog Poin Pelanggaran', 'Kronologi Kasus & Bukti', 'Threshold Peringatan SP1-SP3', 'Riwayat Pemulihan Sikap'],
      details: {
        specs: ['Pemberian bobot poin pelanggaran ringan hingga berat', 'Automasi status peringatan SP saat melampaui batas', 'Sanksi edukatif dan jadwal pembinaan', 'Riwayat pelanggaran lengkap'],
        roleAccess: ['Kesiswaan', 'Wali Kelas', 'Guru BK'],
        apiEndpoint: '/api/v1/violations',
        sampleData: 'Katalog: 25 Aturan Disiplin • Poin Berjenjang'
      }
    },
    {
      num: 24,
      title: 'Portal Orang Tua / Wali Siswa',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Akses mobile-ready bagi orang tua untuk memantau status check-in gerbang sekolah, progres tugas, nilai ujian, dan chat wali kelas.',
      targetTab: 'parent',
      features: ['Pemantauan Multi-Anak', 'Kehadiran Gerbang Real-time', 'Grafik Nilai & Tugas Aktif', 'Hubungi Wali Kelas Cepat'],
      details: {
        specs: ['Dukungan ganti anak jika punya lebih dari 1 siswa', 'Status kehadiran datang & jam masuk kelas', 'Notifikasi jika ada tugas yang hampir jatuh tempo', 'Saluran telepon/chat wali'],
        roleAccess: ['Orang Tua / Wali Siswa'],
        apiEndpoint: '/api/v1/parent/portal',
        sampleData: 'Anak 1: Ahmad Siswa (12-IPA 1) • Kehadiran 96%'
      }
    },
    {
      num: 25,
      title: 'Pengumuman Sekolah (Announcements)',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Pusat publikasi surat edaran dan warta resmi sekolah dengan filter target audiens spesifik (seluruh guru, kelas tertentu, atau ortu).',
      targetTab: 'school-tu',
      features: ['Target Audiens Spesifik', 'Lampiran Surat Edaran PDF', 'Pin Pengumuman Penting', 'Jadwal Publikasi Otomatis'],
      details: {
        specs: ['Penetapan kategori pengumuman darurat / umum', 'Filter penerima rombel atau peran', 'Badge belum dibaca oleh pengguna', 'Arsip surat edaran resmi'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/announcements',
        sampleData: 'Edaran PTS Ganjil & Libur Nasional Terbit'
      }
    },
    {
      num: 26,
      title: 'Pesan & Komunikasi Internal',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Saluran pengiriman pesan terpadu antar guru, siswa, wali kelas, dan pimpinan untuk konsultasi belajar dan koordinasi tugas.',
      targetTab: 'school-tu',
      features: ['Pesan Langsung Guru - Siswa', 'Grup Diskusi Rombel', 'Pesan Koordinasi Staf', 'Pemberitahuan Instan'],
      details: {
        specs: ['Pemberitahuan terkirim dan dibaca', 'Lampiran berkas konsultasi tugas', 'Arsip percakapan terjaga etika akademik', 'Mode do-not-disturb luar jam sekolah'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/messages',
        sampleData: '12 Percakapan Aktif • Enkripsi Pesan Internal'
      }
    },
    {
      num: 27,
      title: 'Notifikasi Sistem & Pengingat',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Pusat notifikasi multi-channel (in-app alert, badge lonceng) untuk pengingat batas pengumpulan tugas, jadwal ujian, dan presensi.',
      targetTab: 'journey',
      features: ['Lonceng Notifikasi Real-time', 'Alert Tenggat Waktu Tugas', 'Pemberitahuan Nilai Masuk', 'Audit Notifikasi Masuk'],
      details: {
        specs: ['Trigger otomatis saat nilai di-input guru', 'Pengingat H-1 sebelum deadline tugas', 'Notifikasi kehadiran anak ke akun ortu', 'Status tanda sudah dibaca'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/notifications',
        sampleData: '4 Notifikasi Belum Dibaca'
      }
    },
    {
      num: 28,
      title: 'Kalender Akademik Terpadu',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Kalender resmi sekolah mencatat penanggalan hari efektif belajar (HEB), masa jeda tengah semester, ujian, rapat, dan libur nasional.',
      targetTab: 'school-tu',
      features: ['Hitungan Hari Efektif (HEB)', 'Agenda Libur Nasional', 'Penetapan Pekan Ujian', 'Sinkronisasi Jadwal KBM'],
      details: {
        specs: ['Perhitungan otomatis jumlah minggu efektif', 'Pewarnaan kategori acara sekolah', 'Sinkronisasi dengan jadwal pelajaran mingguan', 'Cetak kalender pendidikan tahunan'],
        roleAccess: ['Tata Usaha', 'Semua Pengguna'],
        apiEndpoint: '/api/v1/academic-calendar',
        sampleData: '108 Hari Efektif Belajar • 14 Hari Libur Terdata'
      }
    },
    {
      num: 29,
      title: 'Kegiatan & Acara Sekolah (Events)',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Manajemen acara khusus seperti upacara bendera, study tour, pentas seni, rapat pleno dewan guru, dan workshop peningkatan mutu.',
      targetTab: 'school-tu',
      features: ['Manajemen Acara & Lokasi', 'Peserta & Panitia Kegiatan', 'Lampiran Rundown Acara', 'Dokumentasi & Laporan'],
      details: {
        specs: ['Penetapan PJ dan panitia kegiatan', 'Alokasi anggaran dan ruangan serbaguna', 'Daftar hadir peserta kegiatan', 'Laporan pertanggungjawaban acara'],
        roleAccess: ['Tata Usaha', 'Kesiswaan'],
        apiEndpoint: '/api/v1/school-events',
        sampleData: 'Agenda: Rapat Pleno Kelulusan • 15 Okt 2026'
      }
    },
    {
      num: 30,
      title: 'Ekstrakurikuler & Pembinaan',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Pengelolaan kegiatan pengembangan diri (Pramuka, PMR, Paskibra, Robotik), pelatih/pembina, presensi latihan, dan nilai rapor ekskul.',
      targetTab: 'school-tu',
      features: ['Daftar Klub Ekstrakurikuler', 'Data Pembina & Pelatih', 'Presensi Latihan Mingguan', 'Penilaian Rapor Ekskul'],
      details: {
        specs: ['Registrasi anggota ekskul per semester', 'Jadwal latihan rutin di luar jam KBM', 'Penetapan nilai predikat A, B, C untuk rapor', 'Portofolio kejuaraan ekskul'],
        roleAccess: ['Pembina Ekskul', 'Wali Kelas', 'Siswa'],
        apiEndpoint: '/api/v1/extracurriculars',
        sampleData: '8 Ekstrakurikuler Aktif • Pramuka Wajib'
      }
    },

    // 31 - 40: Dokumen, Import/Export, Laporan, Pengaturan, Analitik
    {
      num: 31,
      title: 'Dokumen & Arsip Administrasi',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Penyimpanan terpusat dokumen resmi sekolah, surat masuk/keluar, SK Kepala Sekolah, kurikulum operasional, dan ijazah terlindungi.',
      targetTab: 'school-tu',
      features: ['Arsip Surat Masuk / Keluar', 'SK Pembagian Tugas Guru', 'Kategori Berkas Digital', 'Riwayat Versi Dokumen'],
      details: {
        specs: ['Pemberian nomor agenda surat otomatis', 'Upload scan surat stempel basah', 'Klasifikasi dokumen publik vs rahasia', 'Pencarian cepat nomor surat'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/documents',
        sampleData: '128 Dokumen Terarsip • Enkripsi Berkas Digital'
      }
    },
    {
      num: 32,
      title: 'Import & Export Data Massal',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Pusat import massal data siswa, guru, kelas, mapel dari file Excel/CSV lengkap dengan template resmi dan validasi anti-duplikasi.',
      targetTab: 'school-tu',
      features: ['Template Excel Resmi', 'Validasi Anti Duplikasi Data', 'Import Massal Siswa & Guru', 'Ekspor Lengkap Dapodik'],
      details: {
        specs: ['Parser otomatis file XLSX / CSV', 'Validasi format NISN 10 digit & email unik', 'Preview data sebelum disimpan permanen', 'Log baris data yang gagal import'],
        roleAccess: ['Tata Usaha', 'Super Admin'],
        apiEndpoint: '/api/v1/import-export',
        sampleData: 'Template: Siswa.xlsx, Guru.xlsx, Nilai.xlsx Siap Unduh'
      }
    },
    {
      num: 33,
      title: 'Laporan Akademik & Kurikulum',
      category: 'Akademik & Kurikulum',
      description: 'Rekapitulasi komprehensif ketuntasan kurikulum, perbandingan rata-rata nilai antar kelas, statistik remedial, dan daya serap materi.',
      targetTab: 'ai-analytics',
      features: ['Daya Serap Kurikulum', 'Perbandingan Rata-rata Kelas', 'Rekap Remedial & Pengayaan', 'Statistik Capaian Capaian'],
      details: {
        specs: ['Grafik persentase ketuntasan per KD/Bab', 'Tabel evaluasi mata pelajaran tersulit', 'Rekapitulasi tindak lanjut guru pengampu', 'Laporan bulanan kurikulum'],
        roleAccess: ['Kepala Sekolah', 'Wakasek Kurikulum'],
        apiEndpoint: '/api/v1/reports/academic',
        sampleData: 'Rerata Capaian Sekolah: 84.2% • Kategori Unggul'
      }
    },
    {
      num: 34,
      title: 'Principal Strategic Dashboard',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Dasbor eksekutif Kepala Sekolah menyajikan ringkasan makro performa KBM harian, tingkat disiplin GTK, dan persentase kelulusan KKM.',
      targetTab: 'ai-analytics',
      features: ['Dasbor Makro Kepala Sekolah', 'Monitoring KBM Hari Ini', 'Distribusi Capaian Kurikulum', 'Approval Nilai Resmi'],
      details: {
        specs: ['Statistik real-time kehadiran guru & siswa hari ini', 'Grafik perbandingan capaian antar angkatan', 'Tombol pengesahan (approval) rapor digital', 'Ringkasan peringatan resiko sekolah'],
        roleAccess: ['Kepala Sekolah'],
        apiEndpoint: '/api/v1/principal/dashboard',
        sampleData: 'Tingkat Disiplin Sekolah 95.8% • Approval Siap'
      }
    },
    {
      num: 35,
      title: 'Audit Log & Traceability Jejak',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Perekaman jejak digital mutlak setiap perubahan nilai, koreksi presensi, perubahan status user, alamat IP, dan waktu eksekusi.',
      targetTab: 'school-tu',
      features: ['Jejak Modifikasi Data', 'Perbandingan Data Lama vs Baru', 'Pencatatan Alamat IP & User', 'Pencegahan Manipulasi Nilai'],
      details: {
        specs: ['Immutable audit trail table', 'Mencatat payload old_values vs new_values', 'Pencarian jejak berdasarkan user atau entitas', 'Kepatuhan standar audit ISO akademik'],
        roleAccess: ['Super Admin', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/audit-logs',
        sampleData: 'Live Log: Nilai Ahmad diperbarui oleh Budi Santoso'
      }
    },
    {
      num: 36,
      title: 'Pengaturan Sekolah (School Settings)',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Konfigurasi teknis branding, favicon, warna tema sistem, format penomoran surat, zona waktu (WIB/WITA/WIT), dan notifikasi.',
      targetTab: 'school-tu',
      features: ['Branding & Skema Warna', 'Format Penomoran Surat', 'Zona Waktu & Tanggal', 'Konfigurasi Email SMTP'],
      details: {
        specs: ['Kustomisasi logo header dan favicon web', 'Pengaturan template format nomor surat resmi', 'Batas maksimal ukuran file upload (MB)', 'Pengaturan kredensial pengiriman email'],
        roleAccess: ['Super Admin', 'Tata Usaha'],
        apiEndpoint: '/api/v1/settings',
        sampleData: 'Timezone: Asia/Jakarta • Kuota File: 25 MB/berkas'
      }
    },
    {
      num: 37,
      title: 'Kelulusan & Penelusuran Alumni',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Sidang pleno penentuan kelulusan siswa tingkat akhir (XII), pencetakan SKL sementara, dan pelacakan jejak studi lanjut / kerja alumni.',
      targetTab: 'school-tu',
      features: ['Penetapan Status Lulus', 'Penerbitan SKL & Nomor Ijazah', 'Tracer Study Alumni', 'Buku Kenangan Digital'],
      details: {
        specs: ['Verifikasi seluruh nilai semester 1-6', 'Generasi Surat Keterangan Lulus (SKL) ber-barcode', 'Kuisioner penelusuran perguruan tinggi alumni', 'Database kontak ikatan alumni'],
        roleAccess: ['Tata Usaha', 'Wali Kelas', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/alumni',
        sampleData: 'Angkatan 2026: 100% Lulus • 78% Diterima PTN'
      }
    },
    {
      num: 38,
      title: 'Mutasi Siswa (Pindah Masuk/Keluar)',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Alur administrasi mutasi siswa masuk dan pindah keluar sekolah, penerbitan surat keterangan pindah, dan transfer nilai rapor.',
      targetTab: 'school-tu',
      features: ['Permohonan Mutasi Masuk/Keluar', 'Surat Keterangan Pindah Resmi', 'Transfer Riwayat Nilai', 'Validasi Kuota Rombel'],
      details: {
        specs: ['Pengecekan ketersediaan bangku kosong di rombel', 'Konversi transkrip nilai dari sekolah asal', 'Penerbitan surat mutasi berstempel resmi', 'Pembaruan data buku induk'],
        roleAccess: ['Tata Usaha', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/student-mutations',
        sampleData: '0 Siswa Pending Mutasi • Kuota Rombel Terjaga'
      }
    },
    {
      num: 39,
      title: 'Peringatan Dini Siswa (Early Warning)',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Sistem pintar mendeteksi siswa berisiko (absensi alfa > 3 hari, nilai di bawah KKM 75, atau penurunan drastis) dengan lampu merah/kuning.',
      targetTab: 'walikelas-bk',
      features: ['Lampu Merah / Kuning EWS', 'Pendeteksi Alfa > 3 Hari', 'Pendeteksi Nilai < KKM 75', 'Rekomendasi Tindakan AI'],
      details: {
        specs: ['Kalkulasi otomatis skor risiko siswa (Risk Index)', 'Pengelompokan siswa kategori Siaga dan Bahaya', 'Notifikasi instan ke Wali Kelas dan Guru BK', 'Pemberian paket tindakan remedial'],
        roleAccess: ['Wali Kelas', 'Guru BK', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/ews/students',
        sampleData: '1 Siswa Terdeteksi Butuh Pendampingan Remedial'
      }
    },
    {
      num: 40,
      title: 'Analitik Pembelajaran & Tren KBM',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Visualisasi grafik data performa mata pelajaran, sebaran kurva nilai bell curve, korelasi tingkat kehadiran terhadap nilai, dan prediksi kelulusan.',
      targetTab: 'ai-analytics',
      features: ['Kurva Sebaran Nilai', 'Analisis Korelasi Presensi', 'Tren Peningkatan Semester', 'Prediksi Kelulusan Siswa'],
      details: {
        specs: ['Grafik interaktif distribusi nilai per mapel', 'Analisis dampak ketidakhadiran terhadap capaian', 'Peringkat rombel berdasarkan rata-rata murni', 'Ekspor grafik ke format PDF laporan'],
        roleAccess: ['Kepala Sekolah', 'Guru', 'Wali Kelas'],
        apiEndpoint: '/api/v1/analytics/trends',
        sampleData: 'Korelasi Presensi-Nilai: r = 0.82 (Sangat Kuat)'
      }
    },

    // 41 - 50: Bank Soal, Remedial, Portofolio, Multi-Sekolah, Keamanan
    {
      num: 41,
      title: 'Bank Soal Sentral Terpadu',
      category: 'Pembelajaran & Asesmen',
      description: 'Gudang bank soal terstandarisasi seluruh mata pelajaran, tagging tingkat kesulitan (Mudah/Sedang/HOTS), dan opsi acak butir soal.',
      targetTab: 'cbt',
      features: ['Klasifikasi Soal HOTS / LOTS', 'Mendukung Formula & Gambar', 'Pengacakan Soal Ujian', 'Riwayat Penggunaan Soal'],
      details: {
        specs: ['Editor soal kaya fitur (LaTeX math, formula, gambar)', 'Kategori tingkat kognitif C1-C6 Taksonomi Bloom', 'Validasi kunci jawaban sebelum diterbitkan', 'Statistik daya pembeda soal'],
        roleAccess: ['Guru', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/question-bank',
        sampleData: '150 Soal Siap Pakai • 45 Soal Kategori HOTS'
      }
    },
    {
      num: 42,
      title: 'Remedial & Program Pengayaan',
      category: 'Pembelajaran & Asesmen',
      description: 'Pengelolaan kegiatan perbaikan nilai bagi siswa belum tuntas KKM dan pemberian materi pendalaman/pengayaan bagi siswa berprestasi.',
      targetTab: 'gradebook',
      features: ['Daftar Siswa Remedial Otomatis', 'Batas Maksimal Nilai Remedial', 'Materi Pengayaan Khusus', 'Audit Nilai Perbaikan'],
      details: {
        specs: ['Pemberitahuan otomatis bagi siswa ber-nilai < 75', 'Pengaturan batas nilai tuntas remedial (max = KKM)', 'Histori nilai sebelum vs sesudah remedial', 'Bukti pengerjaan remedial'],
        roleAccess: ['Guru', 'Siswa'],
        apiEndpoint: '/api/v1/remedials',
        sampleData: '2 Siswa Terjadwal Remedial Fisika Bab 2'
      }
    },
    {
      num: 43,
      title: 'Umpan Balik Guru & Catatan Ajar',
      category: 'Pembelajaran & Asesmen',
      description: 'Catatan kualitatif guru terhadap perkembangan belajar siswa, pemberian apresiasi apresiatif, serta rekomendasi gaya belajar personal.',
      targetTab: 'assignments',
      features: ['Catatan Kualitatif Per Tugas', 'Apresiasi & Badge Motivasi', 'Rekomendasi Gaya Belajar', 'Riwayat Kemajuan Siswa'],
      details: {
        specs: ['Komentar guru langsung pada lembar tugas', 'Pemberian bintang apresiasi bagi tugas terbaik', 'Catatan private terlihat hanya oleh siswa bersangkutan', 'Sinkronisasi ke deskripsi sikap rapor'],
        roleAccess: ['Guru', 'Siswa'],
        apiEndpoint: '/api/v1/teacher-feedback',
        sampleData: '32 Feedback Diberikan Pekan Ini'
      }
    },
    {
      num: 44,
      title: 'Portofolio Digital Siswa',
      category: 'Kesiswaan, BK & Karakter',
      description: 'Kumpulan karya terbaik siswa, sertifikat penghargaan, hasil proyek P5, laporan karya ilmiah, dan rekam jejak talenta terverifikasi.',
      targetTab: 'space-belajar',
      features: ['Galeri Hasil Karya & Proyek P5', 'Sertifikat Prestasi Digital', 'Rekam Jejak Minat & Bakat', 'Showcase Portofolio Publik'],
      details: {
        specs: ['Penyimpanan file karya desain, laporan, video', 'Verifikasi orisinalitas karya oleh guru pembimbing', 'Tautan portofolio publik untuk syarat beasiswa', 'Koleksi per semester'],
        roleAccess: ['Siswa', 'Guru', 'Orang Tua'],
        apiEndpoint: '/api/v1/student-portfolios',
        sampleData: 'Showcase Proyek Fisika & Robotika Siswa'
      }
    },
    {
      num: 45,
      title: 'Multi-Sekolah & Tenant Isolation',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Pemisahan data mutlak antar sekolah dalam satu sistem terpusat; tiap sekolah memiliki tenant ID unik dan tidak saling melihat data.',
      targetTab: 'school-tu',
      features: ['Isolasi Database Virtual', 'Tenant ID Global Scoping', 'Workspace Spesifik Sekolah', 'Pencegahan Kebocoran Data'],
      details: {
        specs: ['Eloquent HasTenant trait membatasi query per school_id', 'Simulasi perpindahan sekolah di header', 'Konfigurasi mandiri untuk setiap tenant', 'Arsitektur skala enterprise'],
        roleAccess: ['Super Admin'],
        apiEndpoint: '/api/v1/tenants',
        sampleData: 'Tenant Aktif: SMA 1 (ID:1), SMK 2 (ID:2), SMP 3 (ID:3)'
      }
    },
    {
      num: 46,
      title: 'Dashboard Utama & Ringkasan Cepat',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Tampilan utama adaptif sesuai peran pengguna: jadwal hari ini, tugas yang harus dikerjakan, pintasan modul, dan statistik kehadiran.',
      targetTab: 'journey',
      features: ['Widget Alur KBM Harian', 'Statistik Kehadiran & Tugas', 'Pintasan Cepat Seluruh Modul', 'Profil Pengguna Aktif'],
      details: {
        specs: ['Penyajian informasi dinamis per peran login', 'Tabel pengingat kegiatan akademik terdekat', 'Diagram alokasi, identifikasi, dan resolusi KBM', 'Responsif untuk semua layar'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/dashboard',
        sampleData: 'Alur KBM Berjalan Normal • Semester Ganjil'
      }
    },
    {
      num: 47,
      title: 'Profil Pengguna & Keamanan Akun',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Pengelolaan data diri pengguna, penggantian kata sandi dengan verifikasi, pembaruan foto profil avatar, dan email kontak.',
      targetTab: 'school-tu',
      features: ['Update Nama & Biodata', 'Ganti Password Mandiri', 'Pilihan Avatar & Foto', 'Status Verifikasi Kontak'],
      details: {
        specs: ['Modal pengaturan akun instan di pojok kanan atas', 'Validasi kecocokan password lama dan baru', 'Penyimpanan sesi aman berbasis Bearer token', 'Histori perubahan profil'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/profile',
        sampleData: 'Profil Terverifikasi • Akun Terlindungi Token'
      }
    },
    {
      num: 48,
      title: 'Keamanan, Sesi & Token Device',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Perlindungan keamanan sesi login dengan Laravel Sanctum, pencegahan CSRF, pemutusan sesi jarak jauh, dan proteksi brute-force.',
      targetTab: 'school-tu',
      features: ['Autentikasi Bearer Sanctum', 'Proteksi Serangan Brute-Force', 'Manajemen Sesi Perangkat Aktif', 'Logout Otomatis Sesi Kadaluarsa'],
      details: {
        specs: ['Token hashing SHA-256 tersimpan aman', 'Header Authorization Bearer di setiap request Axios', 'Pemisahan token perangkat per login', 'Fitur logout dari semua perangkat'],
        roleAccess: ['Super Admin', 'Semua Pengguna'],
        apiEndpoint: '/api/v1/auth/security',
        sampleData: 'Status Keamanan: Hijau / Aman • 0 Insiden Terdeteksi'
      }
    },
    {
      num: 49,
      title: 'Helpdesk, Panduan & Bantuan',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Pusat panduan penggunaan aplikasi untuk seluruh peran, dokumentasi langkah kerja KBM, FAQ kendala teknis, dan tiket bantuan ke operator.',
      targetTab: 'school-tu',
      features: ['Panduan Interaktif Pengguna', 'FAQ Kendala Teknis KBM', 'Tiket Bantuan ke Operator TU', 'Video Walkthrough Fitur'],
      details: {
        specs: ['Daftar tutorial per peran (Siswa, Guru, Ortu)', 'Pencarian kata kunci solusi masalah sistem', 'Kirim pesan kendala langsung ke tim IT sekolah', 'Log penanganan tiket selesai'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/helpdesk',
        sampleData: '18 Panduan Tersedia • Layanan IT Siap 24/7'
      }
    },
    {
      num: 50,
      title: 'Backup & Restore Database Terjadwal',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Alat pencadangan database sekolah otomatis dan pemulihan data instan untuk menjamin keamanan arsip akademik dari kegagalan sistem.',
      targetTab: 'school-tu',
      features: ['Backup Database Otomatis Harian', 'Unduh Berkas Cadangan SQL', 'Fitur Restore Data Aman', 'Log Riwayat Pencadangan'],
      details: {
        specs: ['Dukungan kompresi file dump database (.sql.gz)', 'Penyimpanan terisolasi per tenant sekolah', 'Pengujian integritas data hasil cadangan', 'Satu klik untuk mengunduh backup terbaru'],
        roleAccess: ['Super Admin'],
        apiEndpoint: '/api/v1/system/backup',
        sampleData: 'Backup Terakhir: Hari Ini 03:00 WIB (Berhasil)'
      }
    },

    // 51 - 58: API, Pustaka, Workspace, Supervisi, AI, Mobile, Monitoring
    {
      num: 51,
      title: 'API & Integrasi Dapodik / Eksternal',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Antarmuka RESTful API berstandar OpenAPI/Swagger untuk integrasi data ke sistem Dapodik Kemdikbud, absensi mesin sidik jari, dan LMS luar.',
      targetTab: 'school-tu',
      features: ['RESTful API v1 Terstruktur', 'API Key & Token Pengembang', 'Integrasi Mesin Fingerprint', 'Sinkronisasi Format Dapodik'],
      details: {
        specs: ['Dokumentasi endpoint JSON terstandar', 'Rate limiting request untuk mencegah DDoS', 'Format sinkronisasi Dapodik kemdikbud', 'Webhook notifikasi event sistem'],
        roleAccess: ['Super Admin', 'Pengembang'],
        apiEndpoint: '/api/v1/docs',
        sampleData: '58 RESTful Endpoints Siap Pakai di /api/v1/'
      }
    },
    {
      num: 52,
      title: 'Pustaka Digital & Buku Elektronik',
      category: 'Akademik & Kurikulum',
      description: 'Katalog buku pelajaran elektronik (BSE), literasi umum, novel edukatif, dan referensi penelitian yang dapat dibaca daring oleh siswa & guru.',
      targetTab: 'space-belajar',
      features: ['Katalog Buku Digital BSE', 'Peminjaman Online Buku Fisik', 'Viewer Pembaca Dokumen', 'Pencarian Berdasarkan ISBN/Mapel'],
      details: {
        specs: ['Buku paket Kurikulum Merdeka resmi', 'Koleksi e-book literasi bebas hak cipta', 'Pencatatan riwayat membaca siswa', 'Review dan rating buku oleh siswa'],
        roleAccess: ['Siswa', 'Guru', 'Pustakawan'],
        apiEndpoint: '/api/v1/library',
        sampleData: '85 Buku Pelajaran Elektronik Siap Baca'
      }
    },
    {
      num: 53,
      title: 'Workspace Siswa (Space Belajar)',
      category: 'Akademik & Kurikulum',
      description: 'Ruang kerja digital mandiri siswa untuk mengatur folder penyimpanan catatan materi, target belajar harian, dan kalender ujian mandiri.',
      targetTab: 'space-belajar',
      features: ['Explorer File & Folder Mandiri', 'Catatan Belajar Rich-Text', 'Target Belajar Harian (To-Do)', 'Kalender Jadwal Pribadi'],
      details: {
        specs: ['Penyimpanan awan terisolasi per akun siswa', 'Editor catatan cepat untuk ringkasan materi', 'Pengecekan daftar to-do list tugas selesai', 'Sinkronisasi dengan tugas sekolah'],
        roleAccess: ['Siswa'],
        apiEndpoint: '/api/v1/space-belajar',
        sampleData: '4 Folder Belajar • 8 Catatan Ringkasan Materi'
      }
    },
    {
      num: 54,
      title: 'Workspace Guru (Perangkat Ajar)',
      category: 'SDM Guru & Presensi',
      description: 'Ruang persiapan mengajar guru untuk menyusun RPP / Modul Ajar, ATP, kriteria ketercapaian (KKTP), dan bank materi sebelum dipublikasikan.',
      targetTab: 'schedule',
      features: ['Penyusunan RPP & Modul Ajar', 'Alur Tujuan Pembelajaran (ATP)', 'Bank Draf Materi Guru', 'Template Perangkat Ajar Kurikulum'],
      details: {
        specs: ['Penyusunan modul ajar berbasis standar kemdikbud', 'Arsip perangkat ajar per semester', 'Kolaborasi antar guru mapel sejenis (MGMP)', 'Ekspor siap cetak supervisi kepsek'],
        roleAccess: ['Guru', 'Kepala Sekolah'],
        apiEndpoint: '/api/v1/teacher/workspace',
        sampleData: '18 Modul Ajar Siap Pakai • Standar MGMP'
      }
    },
    {
      num: 55,
      title: 'Evaluasi Guru & Supervisi Kelas',
      category: 'SDM Guru & Presensi',
      description: 'Instrumen supervisi akademik kepala sekolah dan pengawas terhadap proses pembelajaran guru di kelas, umpan balik pedagogik, dan skor PKG.',
      targetTab: 'ai-analytics',
      features: ['Rubrik Penilaian Supervisi KBM', 'Skor Penilaian Kinerja Guru (PKG)', 'Catatan Umpan Balik Kepsek', 'Rencana Pengembangan Keprofesian'],
      details: {
        specs: ['Indikator pedagogik, kepribadian, sosial, profesional', 'Jadwal supervisi kelas terstruktur', 'Grafik radar kompetensi guru', 'Dokumen laporan tindak lanjut supervisi'],
        roleAccess: ['Kepala Sekolah', 'Guru'],
        apiEndpoint: '/api/v1/supervision',
        sampleData: 'Skor PKG Rerata Guru: 88.5 (Amat Baik)'
      }
    },
    {
      num: 56,
      title: 'School AI Assistant & Otomasi',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Asisten cerdas berbasis AI untuk analisis bahasa alami data KBM, deteksi siswa butuh perhatian, dan generator otomatis butir soal HOTS.',
      targetTab: 'ai-analytics',
      features: ['Tanya Jawab Data KBM Natural', 'Pembuat Soal Ujian HOTS Cepat', 'Ringkasan Rapor Naratif Otomatis', 'Rekomendasi Strategis AI'],
      details: {
        specs: ['Chatbot pintar memahami data nilai dan presensi', 'Pembuat butir soal baru fisika/matematika instan', 'Penyusunan narasi deskripsi nilai rapor otomatis', 'Konsultasi penanganan masalah siswa'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/ai/assistant',
        sampleData: 'School AI Online • Model Pintar Terkoneksi'
      }
    },
    {
      num: 57,
      title: 'Mobile Web Experience (PWA)',
      category: 'Portal Peran, Komunikasi & AI',
      description: 'Antarmuka responsif ramah layar ponsel (smartphone/tablet), navigasi sentuh ergonomis, dan akses cepat tanpa harus memasang aplikasi berat.',
      targetTab: 'parent',
      features: ['Tampilan Mobile Ergonomis', 'Navigasi Bottom Sheet Cepat', 'Mode Sentuh & Gesture Responsif', 'Optimasi Bandwidth Rendah'],
      details: {
        specs: ['Desain adaptif dari ukuran 360px hingga layar 4K', 'PWA siap simpan ke layar utama ponsel (Add to Home)', 'Akses presensi dan nilai dalam hitungan detik', 'Hemat kuota data internet'],
        roleAccess: ['Semua Pengguna'],
        apiEndpoint: '/api/v1/mobile',
        sampleData: 'Optimasi Responsif 100% • Touch Enabled'
      }
    },
    {
      num: 58,
      title: 'Monitoring Sistem & Kebugaran Server',
      category: 'Tata Usaha & Multi-Tenancy',
      description: 'Dasbor pemantauan kesehatan server Laravel dan Next.js, utilisasi memori, latensi API, latensi koneksi database MySQL, dan status uptime.',
      targetTab: 'school-tu',
      features: ['Status Server Laravel & Next.js', 'Latensi Respons API Real-time', 'Koneksi MySQL Multi-Tenant', 'Status Uptime 99.9%'],
      details: {
        specs: ['Pemeriksaan berkala health check /api/v1/health', 'Monitoring penggunaan memori PHP dan Node.js', 'Deteksi query lambat database', 'Pemberitahuan darurat jika server down'],
        roleAccess: ['Super Admin'],
        apiEndpoint: '/api/v1/system/health',
        sampleData: 'Port 8000 & 3000 Running • Database Connected • Latency: 12ms'
      }
    }
  ];

  const pillars = [
    { id: 'all', name: 'Semua Pilar (58 Modul)' },
    { id: 'Akademik & Kurikulum', name: '1. Akademik & Kurikulum' },
    { id: 'Pembelajaran & Asesmen', name: '2. Pembelajaran & Asesmen' },
    { id: 'Kesiswaan, BK & Karakter', name: '3. Kesiswaan, BK & Karakter' },
    { id: 'SDM Guru & Presensi', name: '4. SDM Guru & Presensi' },
    { id: 'Tata Usaha & Multi-Tenancy', name: '5. Tata Usaha & Multi-Tenancy' },
    { id: 'Portal Peran, Komunikasi & AI', name: '6. Portal Peran, Komunikasi & AI' },
  ];

  const filteredModules = allModulesList.filter((m) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      m.num.toString() === query ||
      m.title.toLowerCase().includes(query) ||
      m.description.toLowerCase().includes(query) ||
      m.features.some((f) => f.toLowerCase().includes(query));

    if (selectedPillar === 'all') return matchesSearch;
    return matchesSearch && m.category === selectedPillar;
  });

  const handleOpenModule = (mod: ModuleItem) => {
    if (mod.targetTab) {
      onNavigateTab(mod.targetTab);
    } else {
      setActiveInspectModule(mod);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Suite Architecture: 58 Terintegrasi Lengkap</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Katalog 58 Modul School Operating System
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Seluruh 58 fitur School OS kini telah diimplementasikan lengkap mulai dari Master Akademik, Asesmen CBT Anti-Curang, Buku Nilai Sentral, E-Rapor, Konseling BK Terenkripsi, Jadwal Anti-Bentrok, Tata Usaha, Portal Orang Tua, hingga AI School Assistant.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-emerald-400">58 / 58</div>
              <div className="text-[11px] text-slate-300 font-medium">Modul Aktif</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-cyan-400">9 Role</div>
              <div className="text-[11px] text-slate-300 font-medium">Hak Akses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-center min-w-[100px]">
              <div className="text-2xl font-black text-indigo-400">100%</div>
              <div className="text-[11px] text-slate-300 font-medium">Multi-Tenancy</div>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 1.5 Master Suites Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Portal Guru Spotlight */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex items-center justify-between border border-indigo-700/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">👨🏫 Portal Guru Pengajar</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  38 Fitur Lengkap
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-sm">
                Fokus KBM: Sesi tatap muka, jurnal mengajar, presensi siswa, tugas, kuis & CBT, bank soal, gradebook, dan analitik.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('teacher-hub')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Buka Portal →
          </button>
        </div>

        {/* Portal Siswa Spotlight */}
        <div className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl p-5 text-white shadow-md flex items-center justify-between border border-purple-700/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-cyan-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base">🎓 Portal Siswa Master</h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                  36 Fitur Lengkap
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 max-w-sm">
                Ruang belajar mandiri: jadwal harian, materi, pengumpulan tugas, kuis, CBT, presensi RFID, dan asisten AI siswa.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('student-hub')}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Buka Portal →
          </button>
        </div>
      </div>

      {/* 2. Filter & Search Controls */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor modul (1-58) atau nama fitur (CBT, Rapor, BK, Ortu)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-100 border-none focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {pillars.map((pil) => (
            <button
              key={pil.id}
              onClick={() => setSelectedPillar(pil.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedPillar === pil.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {pil.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Grid of All 58 Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const hasRoleAccess = mod.targetTab
            ? isTabAllowed(currentUserRole, mod.targetTab)
            : true;
          return (
            <div
              key={mod.num}
              className={`group bg-white rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                hasRoleAccess
                  ? 'border-slate-100 shadow-xs hover:shadow-xl hover:border-slate-200'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
                    Modul #{mod.num}
                  </span>
                  {hasRoleAccess ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      Akses Terbuka
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-500" />
                      Terkunci ({currentRoleConfig.label})
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {mod.description}
                </p>

                {/* Feature Tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {mod.features.map((feat, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-medium bg-slate-50 border border-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"
                    >
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveInspectModule(mod)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline underline-offset-2 cursor-pointer"
                >
                  Detail Spesifikasi
                </button>

                {hasRoleAccess ? (
                  <button
                    onClick={() => handleOpenModule(mod)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-xs hover:shadow-md"
                  >
                    <span>Buka Modul</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveInspectModule(mod)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-semibold transition-all cursor-pointer"
                    title={`Fitur ini khusus untuk peran yang berwenang`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Peran Khusus</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">Modul tidak ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci lain atau pilih &apos;Semua Pilar&apos;.</p>
        </div>
      )}

      {/* 4. Deep-Dive Module Inspector Modal */}
      {activeInspectModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-black text-xs">
                    Modul #{activeInspectModule.num}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {activeInspectModule.category}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900">
                  {activeInspectModule.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveInspectModule(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex flex-col gap-4 text-xs text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Deskripsi Sistem:</h4>
                <p className="leading-relaxed text-slate-600">{activeInspectModule.description}</p>
              </div>

              {activeInspectModule.details && (
                <>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Item Spesifikasi Yang Diimplementasikan:</span>
                    </h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-600">
                      {activeInspectModule.details.specs.map((spec, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{spec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Hak Akses Peran:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {activeInspectModule.details.roleAccess.map((r, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 font-semibold text-[11px]">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Backend REST API:
                      </span>
                      <code className="text-[11px] font-mono text-indigo-600 font-bold">
                        GET {activeInspectModule.details.apiEndpoint}
                      </code>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Live Status: </span>
                      <span className="text-emerald-700">{activeInspectModule.details.sampleData}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setActiveInspectModule(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const target = activeInspectModule.targetTab || 'school-tu';
                  setActiveInspectModule(null);
                  onNavigateTab(target);
                }}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Buka Interface Modul Ini →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
