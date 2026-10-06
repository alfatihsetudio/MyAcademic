'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  Calendar,
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  HelpCircle,
  Award,
  TrendingUp,
  UserCheck,
  FileSpreadsheet,
  Bell,
  CalendarDays,
  Users,
  HeartPulse,
  FolderOpen,
  MessageSquare,
  Search,
  Library,
  ListTodo,
  BarChart3,
  Target,
  Shield,
  Bot,
  Download,
  ChevronRight,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Flame,
  RefreshCw,
  MoreVertical,
  GraduationCap,
  Check,
  Send,
  X,
  Settings,
  Zap,
  Sun,
  Moon,
  Globe,
  Lock,
  LifeBuoy,
  FileSignature,
  FileUp,
  FolderArchive,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Star,
  Play,
  Database,
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  finishTeacherSessionApi,
  saveTeacherAttendanceApi,
  gradeSubmissionApi,
  chatTeacherAiAssistantApi,
  getStoredUser,
  setStoredUser,
  DEFAULT_USER
} from '@/lib/api';
import AccountSettingsModal from '@/components/Modals/AccountSettingsModal';
import TeacherHubView, { TeacherMenuId } from '@/components/Views/TeacherHubView';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { toast } from 'react-hot-toast';

interface TeacherGlassDashboardProps {
  currentUser?: User;
  onSwitchRole?: (role: string) => void;
  onOpenSettings?: () => void;
  defaultFeature?: string;
}

interface NavModuleItem {
  id: string;
  number: number;
  label: string;
  icon: any;
  badge?: string;
  desc: string;
  keywords?: string[];
}

interface NavGroup {
  id: string;
  label: string;
  items: NavModuleItem[];
}

interface GradeRow {
  id: number;
  name: string;
  nis: string;
  tugas: number;
  quiz: number;
  uh: number;
  praktik: number;
  pts: number;
  pas: number;
}

interface SubmissionItem {
  id: number;
  name: string;
  nis: string;
  time: string;
  isLate: boolean;
  file: string;
  status: string;
  score: number | null;
  feedback: string;
}

// =========================================================================
// 37 MASTER TEACHER MODULES (Identical frosted glass bento organization)
// =========================================================================
export const TEACHER_NAV_GROUPS: NavGroup[] = [
  {
    id: 'teacher_utama',
    label: 'UTAMA & PUSAT KONTROL',
    items: [
      {
        id: 'dashboard',
        number: 1,
        label: 'Dashboard Guru',
        icon: LayoutDashboard,
        badge: 'Home',
        desc: 'Ringkasan aktivitas hari ini, jadwal KBM mengajar, tugas pending & statistik',
        keywords: ['home', 'beranda', 'utama', 'aktivitas', 'overview', 'ringkasan', 'hari ini', 'kegiatan', 'guru']
      },
      {
        id: 'profile',
        number: 2,
        label: 'Profil & Identitas Guru',
        icon: UserIcon,
        desc: 'Biodata diri pengajar, NIP, pangkat/golongan, mata pelajaran diampu & sertifikasi',
        keywords: ['biodata', 'data diri', 'akun saya', 'nip', 'nik', 'foto', 'alamat', 'sertifikasi', 'sk pengajar', 'nuptk']
      },
      {
        id: 'schedule',
        number: 3,
        label: 'Jadwal Mengajar & Kalender',
        icon: Calendar,
        badge: 'Hari Ini',
        desc: 'Jadwal tatap muka mingguan, alokasi ruang kelas/lab, jam KBM & kalender akademik',
        keywords: ['waktu', 'jam mengajar', 'roster', 'timetable', 'jadwal besok', 'masuk kelas', 'kalender', 'agenda', 'libur', 'ruang lab']
      },
      {
        id: 'announcements',
        number: 4,
        label: 'Pengumuman & Broadcast Kelas',
        icon: Bell,
        badge: 'Warta',
        desc: 'Warta resmi guru ke rombel binaan, edaran materi, tugas baru & peringatan KBM',
        keywords: ['pemberitahuan', 'pesan kelas', 'info penting', 'edaran', 'broadcast', 'pengingat', 'berita kelas']
      },
      {
        id: 'notifications',
        number: 5,
        label: 'Notifikasi & Peringatan',
        icon: Bell,
        desc: 'Pemberitahuan tugas masuk siswa, pengingat batas input nilai rapor & sistem sekolah',
        keywords: ['lonceng', 'alert', 'peringatan', 'update', 'notif masuk', 'tugas terkumpul']
      },
    ]
  },
  {
    id: 'teacher_kbm',
    label: 'PENGAJARAN & KBM',
    items: [
      {
        id: 'teaching-session',
        number: 6,
        label: 'Sesi Pertemuan KBM Live',
        icon: Play,
        badge: 'Live',
        desc: 'Mulai KBM tatap muka, monitoring kehadiran live, topik materi hari ini & timer KBM',
        keywords: ['mulai mengajar', 'tatap muka', 'sesi kelas', 'live kbm', 'kehadiran saat ini', 'pertemuan ke-8', 'timer']
      },
      {
        id: 'teaching-journal',
        number: 7,
        label: 'Jurnal Mengajar Harian',
        icon: FileSignature,
        desc: 'Catatan agenda KBM harian, ketercapaian materi, kendala kelas & refleksi pembelajaran',
        keywords: ['jurnal guru', 'buku jurnal', 'catatan mengajar', 'agenda harian', 'ketercapaian kurikulum', 'refleksi']
      },
      {
        id: 'subjects',
        number: 8,
        label: 'Mata Pelajaran & Silabus',
        icon: BookOpen,
        desc: 'Mata pelajaran diampu semester ini, silabus bab, Capaian Pembelajaran CP & ATP',
        keywords: ['mapel', 'matematika', 'statistika', 'silabus', 'kurikulum merdeka', 'cp', 'tp', 'atp', 'beban ajar']
      },
      {
        id: 'classes',
        number: 9,
        label: 'Kelas & Rombel Binaan',
        icon: Users,
        desc: 'Daftar rombel binaan X RPL 1, X RPL 2, XI RPL 1, XI RPL 2 & direktori siswa',
        keywords: ['rombel', 'daftar siswa', 'anggota kelas', 'wali kelas', 'data murid', 'rekap siswa']
      },
      {
        id: 'teaching-progress',
        number: 10,
        label: 'Kemajuan Silabus & Target',
        icon: TrendingUp,
        desc: 'Tracking persentase ketuntasan silabus, jam efektif KBM & target pertemuan semester',
        keywords: ['progress', 'target materi', 'jam kbm', 'persentase selesai', 'ketuntasan kurikulum']
      },
    ]
  },
  {
    id: 'teacher_materi',
    label: 'MATERI & SUMBER AJAR',
    items: [
      {
        id: 'materials',
        number: 11,
        label: 'Modul & Bahan Ajar',
        icon: FolderOpen,
        badge: 'Modul',
        desc: 'Daftar materi per pertemuan KBM, dokumen PDF, slide PPT, video & bahan tayang',
        keywords: ['materi', 'bahan ajar', 'modul pdf', 'ppt', 'video tutorial', 'bacaan siswa', 'pertemuan 1 2 3']
      },
      {
        id: 'material-create',
        number: 12,
        label: 'Upload Bahan Ajar Baru',
        icon: Upload,
        desc: 'Form unggah berkas modul, silabus bab materi, target rombel, deskripsi & lampiran',
        keywords: ['upload modul', 'unggah materi', 'tambah file', 'posting bahan ajar', 'share materi']
      },
      {
        id: 'teacher-files',
        number: 13,
        label: 'File & Drive Pengajar',
        icon: Database,
        desc: 'Penyimpanan awan bank berkas guru, lembar kerja siswa LKS & draf perangkat ajar',
        keywords: ['drive guru', 'cloud storage', 'berkas saya', 'lembar kerja', 'rpp modul ajar', 'arsip file']
      },
      {
        id: 'digital-library',
        number: 14,
        label: 'Perpustakaan & Buku Referensi',
        icon: Library,
        desc: 'Katalog buku guru Kurikulum Merdeka, e-book referensi sains & jurnal pendidikan',
        keywords: ['perpus', 'buku paket guru', 'referensi', 'e-book kurikulum merdeka', 'jurnal sains']
      },
    ]
  },
  {
    id: 'teacher_tugas',
    label: 'TUGAS & ASESMEN',
    items: [
      {
        id: 'assignments',
        number: 15,
        label: 'Tugas & Lembar Kerja Siswa',
        icon: FileText,
        badge: 'Tugas',
        desc: 'Daftar penugasan mandiri & kelompok, batas waktu deadline & rekap pengumpulan',
        keywords: ['daftar tugas', 'pekerjaan rumah', 'pr', 'proyek', 'tugas kelompok', 'deadline']
      },
      {
        id: 'assignment-create',
        number: 16,
        label: 'Buat Tugas Baru',
        icon: Plus,
        desc: 'Form pembuatan tugas, instruksi pengerjaan, bobot penilaian, lampiran soal & deadline',
        keywords: ['tambah tugas', 'bikin tugas baru', 'posting penugasan', 'buat instruksi tugas']
      },
      {
        id: 'submissions',
        number: 17,
        label: 'Penilaian & Koreksi Siswa',
        icon: CheckCircle2,
        badge: 'Pending',
        desc: 'Review lembar jawaban PDF siswa, input nilai 0-100 & catatan feedback korektif',
        keywords: ['koreksi tugas', 'review jawaban', 'nilai tugas', 'beri skor', 'feedback koreksi', 'submission siswa']
      },
      {
        id: 'quiz',
        number: 18,
        label: 'Quiz Builder & Kuis Kilat',
        icon: HelpCircle,
        desc: 'Pembuat kuis kilat, pertanyaan pilihan ganda, essay reflektif & kunci jawaban instan',
        keywords: ['kuis', 'quiz builder', 'pilihan ganda', 'pg', 'essay', 'kuis kilat', 'soal evaluasi']
      },
      {
        id: 'exams',
        number: 19,
        label: 'Ujian CBT & Monitoring Token',
        icon: Award,
        badge: 'CBT',
        desc: 'Pelaksanaan ujian PTS/PAS digital, aktivasi token CBT & live monitoring siswa',
        keywords: ['cbt online', 'ujian pts', 'pas', 'token ujian', 'monitor ujian', 'ruang ujian digital']
      },
      {
        id: 'question-bank',
        number: 20,
        label: 'Bank Soal & Kisi-Kisi',
        icon: Database,
        desc: 'Penyimpanan butir soal terstandar, taksonomi Bloom, tingkat kesulitan mudah/sedang/sukar',
        keywords: ['bank soal', 'kisi kisi', 'butir soal', 'hots', 'taksonomi bloom', 'soal ujian']
      },
      {
        id: 'assessments',
        number: 21,
        label: 'Pengaturan Bobot & Asesmen',
        icon: Target,
        desc: 'Distribusi persentase bobot: Tugas 20%, Quiz 15%, UH 20%, PTS 10%, PAS 15% & KKM 75',
        keywords: ['bobot nilai', 'kkm', 'kktp', 'aturan penilaian', 'skema asesmen', 'komponen nilai']
      },
    ]
  },
  {
    id: 'teacher_nilai',
    label: 'NILAI & EVALUASI',
    items: [
      {
        id: 'gradebook',
        number: 22,
        label: 'Gradebook (Buku Nilai Live)',
        icon: FileSpreadsheet,
        badge: 'Live',
        desc: 'Tabel buku nilai live kalkulasi rata-rata bobot, predikat A/B/C/D & status kelulusan KKM',
        keywords: ['gradebook', 'buku nilai', 'rekap nilai', 'nilai akhir', 'rapor angka', 'kalkulasi nilai', 'export excel']
      },
      {
        id: 'grade-analysis',
        number: 23,
        label: 'Analisis Capaian Kelas',
        icon: BarChart3,
        desc: 'Statistik distribusi nilai, rata-rata kelas, skor tertinggi/terendah & kurva ketuntasan',
        keywords: ['analisis nilai', 'distribusi skor', 'rata-rata kelas', 'kurva nilai', 'ketuntasan kkm']
      },
      {
        id: 'remedial',
        number: 24,
        label: 'Remedial & Pengayaan',
        icon: Flame,
        badge: 'Perbaikan',
        desc: 'Daftar siswa di bawah KKM <75 butuh remedial, penugasan perbaikan & program pengayaan',
        keywords: ['remedial', 'pengayaan', 'siswa di bawah kkm', 'perbaikan nilai', 'tugas remedial']
      },
      {
        id: 'class-performance',
        number: 25,
        label: 'Komparasi Antar Rombel',
        icon: Users,
        desc: 'Perbandingan performa nilai & ketuntasan belajar antar kelas X RPL 1 vs X RPL 2',
        keywords: ['komparasi kelas', 'perbandingan rombel', 'rpl 1 vs rpl 2', 'evaluasi paralel']
      },
      {
        id: 'reports',
        number: 26,
        label: 'Laporan KBM & Cetak Rapor',
        icon: BarChart3,
        desc: 'Generate laporan kemajuan akademik KBM, berita acara ujian & cetak format rapor',
        keywords: ['laporan kbm', 'cetak nilai', 'berita acara', 'rapor semester', 'print pdf']
      },
    ]
  },
  {
    id: 'teacher_presensi',
    label: 'PRESENSI & KEHADIRAN',
    items: [
      {
        id: 'attendance',
        number: 27,
        label: 'Presensi Harian Siswa',
        icon: UserCheck,
        badge: 'Hari Ini',
        desc: 'Input presensi KBM: Hadir, Terlambat, Sakit, Izin, Alfa dengan one-click Hadir Semua',
        keywords: ['absen', 'presensi siswa', 'hadir', 'terlambat', 'izin sakit', 'alfa', 'kehadiran kelas']
      },
      {
        id: 'attendance-recap',
        number: 28,
        label: 'Rekap Presensi Rombel',
        icon: BarChart3,
        desc: 'Persentase kehadiran bulanan rombel, rekap siswa sering terlambat & peringatan presensi',
        keywords: ['rekap absen', 'persentase hadir', 'peringatan bolos', 'disiplin siswa', 'rekap bulanan']
      },
    ]
  },
  {
    id: 'teacher_komunikasi',
    label: 'KOMUNIKASI & PENDAMPINGAN',
    items: [
      {
        id: 'messages',
        number: 29,
        label: 'Pesan & Tanya Jawab Siswa',
        icon: MessageSquare,
        desc: 'Tanya jawab materi pelajaran, ruang konsultasi interaktif & bimbingan belajar siswa',
        keywords: ['chat siswa', 'tanya jawab', 'konsultasi materi', 'diskusi kelas', 'bimbingan']
      },
      {
        id: 'teaching-notes',
        number: 30,
        label: 'Catatan Pribadi Guru',
        icon: Lock,
        badge: 'Privat',
        desc: 'Catatan rahasia pengajar mengenai observasi karakter belajar & atensi khusus siswa',
        keywords: ['catatan rahasia', 'observasi murid', 'atensi khusus', 'memo guru', 'bimbingan privat']
      },
    ]
  },
  {
    id: 'teacher_mandiri',
    label: 'RUANG MANDIRI & AI (/goal /boost /learn)',
    items: [
      {
        id: 'goal',
        number: 31,
        label: 'Target Akademik Guru (/goal)',
        icon: Target,
        badge: 'Goals',
        desc: 'Pelacak target ketuntasan KKM kelas, target pertemuan semester & milestones mengajar',
        keywords: ['goals', 'target kkm', 'tujuan kbm', 'milestone semester', 'ketuntasan rombel', 'target nilai']
      },
      {
        id: 'learn',
        number: 32,
        label: 'Studio Ajar & RPP AI (/learn)',
        icon: BookOpen,
        badge: 'Studio',
        desc: 'Studio pembuatan perangkat ajar cerdas, RPP Kurikulum Merdeka, Arsip Belajar AI & materi visual',
        keywords: ['learn', 'studio ajar', 'rpp kurikulum merdeka', 'arsip belajar', 'modul pintar', 'multimedia']
      },
      {
        id: 'boost',
        number: 33,
        label: 'Booster Kinerja Guru (/boost)',
        icon: Zap,
        badge: 'Booster',
        desc: 'Booster produktivitas guru, automasi koreksi tugas, generator soal kilat & analisis butir soal',
        keywords: ['boost', 'booster kinerja', 'koreksi otomatis', 'generator soal cbt', 'efisiensi kbm']
      },
      {
        id: 'ai-assistant',
        number: 34,
        label: 'AI Teacher Assistant',
        icon: Bot,
        badge: 'Cerdas',
        desc: 'Asisten cerdas untuk membuat modul ajar, draf soal HOTS, rubrik asesmen & analisis kelas',
        keywords: ['tanya ai', 'chatbot guru', 'asisten rpp', 'soal hots', 'rubrik asesmen', 'bantuan ai']
      },
    ]
  },
  {
    id: 'teacher_pengaturan',
    label: 'PENGATURAN & SISTEM',
    items: [
      {
        id: 'import-export',
        number: 35,
        label: 'Impor & Ekspor Nilai',
        icon: FileUp,
        desc: 'Import nilai dari spreadsheet Excel/CSV, ekspor template rapor & sinkronisasi data',
        keywords: ['import excel', 'export csv', 'sinkron nilai', 'dapodik', 'template rapor']
      },
      {
        id: 'archive',
        number: 36,
        label: 'Arsip Semester Lampau',
        icon: FolderArchive,
        desc: 'Data riwayat KBM semester lalu, arsip soal ujian & histori nilai alumni kelas',
        keywords: ['arsip nilai', 'riwayat semester', 'data lampau', 'alumni kelas', 'dokumen lama']
      },
      {
        id: 'security',
        number: 37,
        label: 'Keamanan Akun & Sandi',
        icon: Shield,
        desc: 'Ganti kata sandi guru, 2FA autentikasi, tema visual & riwayat sesi login pengajar',
        keywords: ['password', 'ganti sandi', 'keamanan', '2fa', 'sesi login', 'pengaturan akun']
      },
      {
        id: 'help',
        number: 38,
        label: 'Pusat Bantuan & Panduan Guru',
        icon: LifeBuoy,
        desc: 'Panduan portal pengajar, formulir bantuan teknis, kontak admin sekolah & FAQ',
        keywords: ['bantuan', 'faq guru', 'panduan penggunaan', 'helpdesk', 'lapor kendala']
      },
    ]
  }
];

export default function TeacherGlassDashboard({
  currentUser,
  onSwitchRole,
  onOpenSettings,
  defaultFeature = 'dashboard',
}: TeacherGlassDashboardProps) {
  // Global preferences & theme
  const { theme, setTheme, language, setLanguage, t, dir } = useAppPreferences();
  const isDarkTheme = theme === 'glass' || theme === 'midnight';
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);

  // Active Tab & Search State
  const [activeTab, setActiveTab] = useState<string>(defaultFeature);

  useEffect(() => {
    if (defaultFeature) {
      setActiveTab(defaultFeature);
    }
  }, [defaultFeature]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});
  const [showRoleDropdown, setShowRoleDropdown] = useState<boolean>(false);
  const [showLangDropdown, setShowLangDropdown] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Selected class
  const [selectedClass, setSelectedClass] = useState<string>('X RPL 1');
  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [sessionMeeting, setSessionMeeting] = useState<number>(8);
  const [sessionTopic, setSessionTopic] = useState<string>('Persamaan & Fungsi Kuadrat dalam Algoritma Grafis');

  // Attendance state
  const [attendanceList, setAttendanceList] = useState<Array<{ id: number; name: string; nis: string; status: string; note: string }>>([
    { id: 201, name: 'Ahmad Fatih Pratama', nis: '240101', status: 'Hadir', note: '' },
    { id: 202, name: 'Annisa Rahmawati', nis: '240102', status: 'Hadir', note: '' },
    { id: 203, name: 'Bagas Satria Wijaya', nis: '240103', status: 'Terlambat', note: 'Hadir 07:42 WIB' },
    { id: 204, name: 'Cantika Ayu Lestari', nis: '240104', status: 'Hadir', note: '' },
    { id: 205, name: 'Dimas Arya Nugraha', nis: '240105', status: 'Sakit', note: 'Surat dokter via ortu' },
    { id: 206, name: 'Farhan Alamsyah', nis: '240106', status: 'Izin', note: 'Dispensasi Tim Robotik' },
    { id: 207, name: 'Gita Gutawa', nis: '240107', status: 'Hadir', note: '' },
    { id: 208, name: 'Hendra Pratama Putra', nis: '240108', status: 'Hadir', note: '' },
  ]);

  const attendanceStats = useMemo(() => {
    const total = attendanceList.length;
    const hadir = attendanceList.filter((s) => s.status === 'Hadir').length;
    const terlambat = attendanceList.filter((s) => s.status === 'Terlambat').length;
    const sakit = attendanceList.filter((s) => s.status === 'Sakit').length;
    const izin = attendanceList.filter((s) => s.status === 'Izin').length;
    const alfa = attendanceList.filter((s) => s.status === 'Alfa').length;
    const attendingCount = hadir + terlambat;
    const percent = total > 0 ? +((attendingCount / total) * 100).toFixed(1) : 0;
    return { total, hadir, terlambat, sakit, izin, alfa, attendingCount, percent };
  }, [attendanceList]);

  // Gradebook State
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([
    { id: 201, name: 'Ahmad Fatih Pratama', nis: '240101', tugas: 90, quiz: 88, uh: 85, praktik: 92, pts: 88, pas: 90 },
    { id: 202, name: 'Annisa Rahmawati', nis: '240102', tugas: 95, quiz: 94, uh: 92, praktik: 96, pts: 92, pas: 94 },
    { id: 203, name: 'Bagas Satria Wijaya', nis: '240103', tugas: 70, quiz: 72, uh: 68, praktik: 76, pts: 70, pas: 72 },
    { id: 204, name: 'Cantika Ayu Lestari', nis: '240104', tugas: 85, quiz: 80, uh: 82, praktik: 88, pts: 84, pas: 86 },
    { id: 205, name: 'Dimas Arya Nugraha', nis: '240105', tugas: 78, quiz: 74, uh: 72, praktik: 80, pts: 76, pas: 78 },
  ]);

  const gradeCalculations = useMemo(() => {
    const kkm = 75.0;
    const calculatedRows = gradeRows.map((r) => {
      const finalScore = +(
        r.tugas * 0.20 +
        r.quiz * 0.15 +
        r.uh * 0.20 +
        r.praktik * 0.20 +
        r.pts * 0.10 +
        r.pas * 0.15
      ).toFixed(1);
      const isPassed = finalScore >= kkm;
      const predicate =
        finalScore >= 92 ? 'A' :
        finalScore >= 85 ? 'A-' :
        finalScore >= 80 ? 'B+' :
        finalScore >= 75 ? 'B' :
        finalScore >= 70 ? 'C+' : 'D';
      return { ...r, finalScore, isPassed, predicate };
    });

    const count = calculatedRows.length;
    if (count === 0) {
      return { rows: [], avg: 0, highest: 0, lowest: 0, passed: 0, failed: 0, passRate: 0, kkm };
    }

    const scores = calculatedRows.map((r) => r.finalScore);
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = +(sum / count).toFixed(1);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passed = calculatedRows.filter((r) => r.isPassed).length;
    const failed = count - passed;
    const passRate = +((passed / count) * 100).toFixed(1);

    return { rows: calculatedRows, avg, highest, lowest, passed, failed, passRate, kkm };
  }, [gradeRows]);

  // Submissions State
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    { id: 501, name: 'Ahmad Fatih Pratama', nis: '240101', time: '04 Okt, 14:20', isLate: false, file: 'ahmad_tugas04_parabola.pdf', status: 'Sudah Dinilai', score: 92, feedback: 'Kalkulasi diskriminan dan grafiknya sangat rapi!' },
    { id: 502, name: 'Annisa Rahmawati', nis: '240102', time: '04 Okt, 15:10', isLate: false, file: 'annisa_parabola.pdf', status: 'Sudah Dinilai', score: 95, feedback: 'Sempurna dan menjawab soal bonus.' },
    { id: 503, name: 'Bagas Satria Wijaya', nis: '240103', time: '05 Okt, 08:30', isLate: false, file: 'bagas_jawaban.pdf', status: 'Belum Dinilai', score: null, feedback: '' },
    { id: 504, name: 'Cantika Ayu Lestari', nis: '240104', time: '05 Okt, 10:15', isLate: false, file: 'cantika_tugas.pdf', status: 'Belum Dinilai', score: null, feedback: '' },
    { id: 505, name: 'Dimas Arya Nugraha', nis: '240105', time: '06 Okt, 01:20', isLate: true, file: 'dimas_parabola.pdf', status: 'Belum Dinilai (Terlambat)', score: null, feedback: '' },
  ]);

  // Grading modal state
  const [gradingModalItem, setGradingModalItem] = useState<SubmissionItem | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  // AI Assistant Chat State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo Bapak/Ibu Guru! Saya asisten AI pengajar Anda. Saya dapat membantu membuat modul ajar/RPP Kurikulum Merdeka, menghasilkan butir soal HOTS pilihan ganda & essay, menganalisis kesalahan ulangan, atau menyusun draf jurnal mengajar.',
      time: '07:30',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Private teaching notes
  const [teachingNotes, setTeachingNotes] = useState<Array<{ id: number; date: string; class: string; content: string; pinned: boolean }>>([
    { id: 1, date: '2026-10-01', class: 'X RPL 1', content: 'Bagas dan Dimas tampak kesulitan dengan penyelesaian diskriminan negatif. Perlu pendampingan khusus 15 menit sebelum jam praktikum.', pinned: true },
    { id: 2, date: '2026-09-28', class: 'X RPL 2', content: 'Proyektor Lab RPL 2 sempat flicker. Sudah lapor ke teknisi lab.', pinned: false },
  ]);
  const [newNoteText, setNewNoteText] = useState('');

  // Announcements
  const [announcements, setAnnouncements] = useState<Array<{ id: number; title: string; class: string; content: string; date: string }>>([
    { id: 1, title: 'Praktikum Komputasi di Lab RPL 1 Hari Rabu Pagi', class: 'X RPL 1', content: 'Pertemuan KBM hari Rabu akan diselenggarakan di Lab Komputer RPL 1. Mohon membawa laptop masing-masing atau menggunakan PC lab.', date: '02 Okt 2026' },
    { id: 2, title: 'Jadwal Remedial Ulangan Bab 2: Matriks', class: 'X RPL 1 & 2', content: 'Sesi pendalaman remedial hari Kamis pukul 14:00 di Ruang 204.', date: '30 Sep 2026' },
  ]);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceContent, setNewAnnounceContent] = useState('');

  // Outside click listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Localized navigation groups
  const localizedNavGroups = useMemo(() => {
    return TEACHER_NAV_GROUPS.map((group) => {
      const groupKey = `group.${group.id}`;
      return {
        ...group,
        label: t(groupKey) !== groupKey ? t(groupKey) : group.label,
        items: group.items.map((item) => {
          const cleanId = item.id.replace(/-/g, '_');
          const teacherKey = `mod.teacher_${cleanId}`;
          const standardKey = `mod.${cleanId}`;
          const specialKey = item.id === 'ai-assistant' ? 'mod.teacher_ai' : '';
          
          let label = item.label;
          if (specialKey && t(specialKey) !== specialKey) {
            label = t(specialKey);
          } else if (t(teacherKey) !== teacherKey) {
            label = t(teacherKey);
          } else if (t(standardKey) !== standardKey) {
            label = t(standardKey);
          }

          const teacherDescKey = `mod_desc.teacher_${cleanId}`;
          const standardDescKey = `mod_desc.${cleanId}`;
          let desc = item.desc;
          if (t(teacherDescKey) !== teacherDescKey) {
            desc = t(teacherDescKey);
          } else if (t(standardDescKey) !== standardDescKey) {
            desc = t(standardDescKey);
          }

          const teacherBadgeKey = `badge.teacher_${cleanId}`;
          const standardBadgeKey = `badge.${cleanId}`;
          let badge = item.badge;
          if (item.badge) {
            if (t(teacherBadgeKey) !== teacherBadgeKey) {
              badge = t(teacherBadgeKey);
            } else if (t(standardBadgeKey) !== standardBadgeKey) {
              badge = t(standardBadgeKey);
            }
          }

          return {
            ...item,
            label,
            desc,
            badge,
          };
        }),
      };
    });
  }, [t]);

  // Consolidated modules for search index
  const allModulesList = useMemo(() => {
    return localizedNavGroups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.label,
        groupId: group.id,
      }))
    );
  }, [localizedNavGroups]);

  // Semantic & Fuzzy search
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];
    return allModulesList.filter((m) => {
      const matchLabel = m.label.toLowerCase().includes(raw);
      const matchDesc = m.desc.toLowerCase().includes(raw);
      const matchGroup = m.groupTitle.toLowerCase().includes(raw);
      const matchKeywords = m.keywords?.some((k) => k.toLowerCase().includes(raw));
      return matchLabel || matchDesc || matchGroup || matchKeywords;
    });
  }, [searchQuery, allModulesList]);

  const handleSelectModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Attendance handlers
  const handleBulkAttendanceHadir = () => {
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status: 'Hadir' })));
    toast.success('Semua siswa ditandai Hadir!');
  };

  const handleAttendanceChange = (id: number, status: string) => {
    setAttendanceList((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleSaveAttendance = async () => {
    try {
      await saveTeacherAttendanceApi({
        meeting: sessionMeeting,
        class_name: selectedClass,
        attendance: attendanceList,
      });
      toast.success('Presensi berhasil disimpan ke basis data sekolah!');
    } catch {
      toast.success('Presensi disimpan secara lokal (mode sinkronisasi).');
    }
  };

  // Grading handler
  const handleSaveGrading = async () => {
    if (!gradingModalItem) return;
    try {
      await gradeSubmissionApi(gradingModalItem.id, gradingScore, gradingFeedback);
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === gradingModalItem.id
            ? { ...sub, score: gradingScore, feedback: gradingFeedback, status: 'Sudah Dinilai' }
            : sub
        )
      );
      toast.success(`Nilai ${gradingScore} berhasil disimpan untuk ${gradingModalItem.name}!`);
      setGradingModalItem(null);
    } catch {
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === gradingModalItem.id
            ? { ...sub, score: gradingScore, feedback: gradingFeedback, status: 'Sudah Dinilai' }
            : sub
        )
      );
      toast.success(`Nilai ${gradingScore} disimpan.`);
      setGradingModalItem(null);
    }
  };

  // AI Chat handler
  const handleSendAiPrompt = async (presetText?: string) => {
    const textToSend = presetText || aiPrompt;
    if (!textToSend.trim()) return;

    const newMsg = { sender: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiMessages((prev) => [...prev, newMsg]);
    setAiPrompt('');
    setIsAiLoading(true);

    try {
      const res = await chatTeacherAiAssistantApi(textToSend);
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res?.reply || `Rekomendasi AI untuk "${textToSend}": Susun RPP dengan alur diferensiasi konten & proses, siapkan 3 asesmen formatif pemantik, dan berikan scaffold pada siswa berisiko.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Rekomendasi AI untuk "${textToSend}": 1. Tetapkan indikator ketercapaian tujuan pembelajaran (IKTP). 2. Gunakan metode active learning berbasis masalah (PBL). 3. Adakan kuis kilat 5 menit di akhir sesi KBM.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const teacherName = currentUser?.name || 'Budi Santoso, M.Pd';
  const teacherNip = '198503152010011012';

  return (
    <div dir={dir} className="h-screen w-full bg-transparent font-sans relative antialiased selection:bg-sky-200 selection:text-sky-900 overflow-hidden flex flex-col">
      {/* 1. Ambient Blurred Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'formal' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[680px] h-[680px] rounded-full bg-sky-200/40 blur-[140px]" />
            <div className="absolute top-[8%] left-[-10%] w-[580px] h-[580px] rounded-full bg-blue-200/35 blur-[130px]" />
            <div className="absolute top-[45%] right-[5%] w-[540px] h-[540px] rounded-full bg-cyan-200/30 blur-[140px]" />
          </>
        )}
        {theme === 'glass' && (
          <>
            <div className="absolute top-[-15%] left-[15%] w-[800px] h-[650px] rounded-full bg-amber-500/22 blur-[130px]" />
            <div className="absolute top-[5%] right-[-5%] w-[700px] h-[700px] rounded-full bg-sky-400/25 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[5%] w-[750px] h-[750px] rounded-full bg-sky-500/22 blur-[140px]" />
            <div className="absolute top-[35%] right-[20%] w-[600px] h-[600px] rounded-full bg-rose-400/18 blur-[130px]" />
            <div className="absolute top-[50%] left-[30%] w-[500px] h-[500px] rounded-full bg-emerald-400/15 blur-[120px]" />
          </>
        )}
        {theme === 'midnight' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-sky-900/30 blur-[160px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/25 blur-[160px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex gap-5 lg:gap-6 h-full flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* 2. FLOATING FROSTED GLASS SIDEBAR WITH ALL 37 TEACHER MODULES            */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex flex-col w-[290px] shrink-0 theme-glass-container rounded-3xl shadow-[0_12px_35px_-5px_rgba(15,23,42,0.06),0_4px_12px_-2px_rgba(15,23,42,0.03)] p-3.5 justify-between h-full overflow-hidden">
          <div className="flex flex-col overflow-hidden h-full">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-600 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 truncate">
                    MyAcademic
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700">
                    GURU
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span>{t('nav.teacher_portal')}</span>
                  <span>•</span>
                  <span className="text-sky-600 font-semibold">{t('nav.teacher_sub')}</span>
                </div>
              </div>
            </div>

            {/* Quick Filter Status Indicator inside Sidebar */}
            {searchQuery && (
              <div className="mx-1 mb-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-between text-xs text-sky-800">
                <span className="font-medium text-[11px] truncate">
                  Pencarian: <b className="font-semibold">"{searchQuery}"</b> ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded hover:bg-sky-200/50 :bg-sky-800/50 cursor-pointer"
                  title="Reset Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navigation Menus with Consolidated Modules Grouped */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
              {localizedNavGroups.map((group) => {
                const filteredItems = searchQuery
                  ? group.items.filter((item) => searchResults.some((sr) => sr.id === item.id))
                  : group.items;

                if (searchQuery && filteredItems.length === 0) {
                  return null;
                }

                const isCollapsed = !searchQuery && collapsedGroups[group.id];

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Section Header with Item Count and Collapse Toggle */}
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 :text-slate-200 transition-colors cursor-pointer"
                    >
                      <span className="truncate">
                        {group.label} ({filteredItems.length})
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                          isCollapsed ? '-rotate-90' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Group Items */}
                    {!isCollapsed && (
                      <div className="space-y-0.5">
                        {filteredItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectModule(item.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer group ${
                                isActive
                                  ? 'bg-sky-50  text-sky-950  shadow-xs border border-sky-300/80  font-semibold'
                                  : 'text-slate-600  hover:text-slate-900 :text-white hover:bg-slate-100/70 :bg-white/5'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive ? 'text-sky-600 ' : 'text-slate-400 group-hover:text-slate-600 :text-slate-200'
                                  }`}
                                />
                                <span className="truncate text-left">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                                    isActive
                                      ? 'bg-sky-200/90 text-sky-900   font-bold'
                                      : 'bg-slate-100  text-slate-500  group-hover:bg-slate-200 :bg-white/20'
                                  }`}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User Profile Footer Card */}
          <div className="pt-2.5 border-t border-slate-200 mt-2">
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/90 hover:bg-slate-100 :bg-white/10 border border-slate-200/80 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-sky-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-sky-500/30">
                    BS
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {teacherName}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">NIP: {teacherNip}</p>
                </div>
              </div>
              <button
                onClick={() => handleSelectModule('profile')}
                className="p-1.5 text-slate-400 hover:text-slate-700 :text-slate-200 rounded-lg hover:bg-white :bg-white/10 transition-all cursor-pointer"
                title="Buka Profil Guru"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 3. MAIN WORKSPACE CANVAS                                                  */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden gap-4">
          {/* Top Bar Header (Pill Search + Shortcuts + Theme & Lang Controls) */}
          <header className="shrink-0 relative flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 theme-glass-container rounded-2xl sm:rounded-3xl p-3 sm:px-5 sm:py-3 z-30">
            {/* Pill Search Input with Active Search Dropdown */}
            <div className="relative flex-1 max-w-lg">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-sky-600" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchResults.length > 0) {
                      handleSelectModule(searchResults[0].id);
                    }
                  }}
                  placeholder={t('nav.teacher_search_placeholder')}
                  className="w-full bg-slate-50/90 hover:bg-white :bg-white/10 focus:bg-white :bg-slate-900/90 border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 rounded-2xl pl-9 pr-14 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 :bg-white/20 text-slate-400 hover:text-slate-600 :text-slate-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="absolute right-3 top-2 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-slate-200/60 font-mono pointer-events-none">
                    ⌘K
                  </span>
                )}
              </div>

              {/* ACTIVE INSTANT SEARCH RESULTS DROPDOWN PALETTE */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div
                  className="absolute left-0 right-0 top-12 bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto scrollbar-thin text-slate-800"
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                    <span>
                      {t('nav.search_results_count')}: <b className="text-sky-600 font-bold">{searchResults.length}</b>
                    </span>
                    <span className="text-[10px] text-slate-400">{t('nav.press_enter')}</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {t('nav.no_search_results')} "<b>{searchQuery}</b>".
                      <br />
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        Cari modul seperti: presensi, gradebook, kuis, rpp, materi, nilai.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1 mt-1.5">
                      {searchResults.map((mod) => {
                        const ModIcon = mod.icon;
                        return (
                          <button
                            key={mod.id}
                            onClick={() => handleSelectModule(mod.id)}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50/80 :bg-sky-950/50 border border-transparent hover:border-sky-200/60 :border-sky-800/50 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                                <ModIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold text-xs text-slate-900 group-hover:text-sky-950 :text-sky-200 truncate">
                                    {mod.label}
                                  </h5>
                                  <span className="text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {mod.groupTitle}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {mod.desc}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                              {mod.badge && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                  {mod.badge}
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Header Right Actions: Major Mode Buttons + Visual Theme + Multi-Lang + Switch Role + Settings */}
            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              {/* Quick Major Mode Buttons (/goal /learn /boost) */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-black/5 border border-white/10">
                <button
                  onClick={() => handleSelectModule('goal')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'goal'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-slate-600  hover:text-slate-900 :text-white'
                  }`}
                  title={t('mode.goal')}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>{t('mode.goal_short') || 'Goals'}</span>
                </button>
                <button
                  onClick={() => handleSelectModule('learn')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'learn'
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-slate-600  hover:text-slate-900 :text-white'
                  }`}
                  title={t('mode.learn')}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('mode.learn_short') || 'Learn'}</span>
                </button>
                <button
                  onClick={() => handleSelectModule('boost')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'boost'
                      ? 'bg-purple-600 text-white shadow-xs font-bold'
                      : 'text-slate-600  hover:text-slate-900 :text-white'
                  }`}
                  title={t('mode.boost')}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{t('mode.boost_short') || 'Boost'}</span>
                </button>
              </div>

              {/* Quick Theme Switcher Pill (Formal, Glass, Midnight) */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 border border-white/10" title={t('theme.title')}>
                <button
                  onClick={() => setTheme('formal')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'formal' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 :text-slate-200'
                  }`}
                  title={t('theme.formal_name')}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('glass')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'glass' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 :text-slate-200'
                  }`}
                  title={t('theme.glass_name')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('midnight')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'midnight' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 :text-slate-200'
                  }`}
                  title={t('theme.midnight_name')}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Language Dropdown (ID, EN, ZH, JA, AR) */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLangDropdown((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-2xl bg-black/5  hover:bg-black/10 :bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    showLangDropdown ? 'ring-2 ring-sky-500/30 bg-black/10' : ''
                  }`}
                  title={`Bahasa: ${language.toUpperCase()}`}
                  aria-expanded={showLangDropdown}
                  aria-haspopup="true"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span className="uppercase text-[11px] font-bold">{language}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      showLangDropdown ? 'rotate-180 text-sky-600' : ''
                    }`}
                  />
                </button>

                {showLangDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-56 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/70'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-900/10'
                    }`}
                  >
                    <div
                      className={`px-2.5 py-1.5 border-b mb-1 flex items-center justify-between ${
                        isDarkTheme ? 'border-white/10' : 'border-slate-100'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isDarkTheme ? 'text-white/60' : 'text-slate-400'
                        }`}
                      >
                        {t('pref.select_language') || 'Pilih Bahasa'}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          isDarkTheme
                            ? 'text-sky-400 bg-sky-500/20 border border-sky-400/30'
                            : 'text-sky-700 bg-sky-50 border border-sky-200'
                        }`}
                      >
                        {language}
                      </span>
                    </div>

                    {[
                      { code: 'id' as const, name: 'Bahasa Indonesia', native: 'Indonesia', flag: '🇮🇩' },
                      { code: 'en' as const, name: 'English (US)', native: 'English', flag: '🇺🇸' },
                      { code: 'zh' as const, name: 'Mandarin (Simplified)', native: '简体中文', flag: '🇨🇳' },
                      { code: 'ja' as const, name: 'Japanese', native: '日本語', flag: '🇯🇵' },
                      { code: 'ar' as const, name: 'Arabic (العربية)', native: 'العربية', flag: '🇸🇦' },
                    ].map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLanguage(item.code);
                          setShowLangDropdown(false);
                          toast.success(`Bahasa diubah ke ${item.name}`);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                          language === item.code
                            ? isDarkTheme
                              ? 'bg-sky-600/30 text-sky-300 font-bold border border-sky-500/40'
                              : 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                            : isDarkTheme
                            ? 'hover:bg-white/10 text-white/90'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-sm">{item.flag}</span>
                          <span className="font-medium text-xs">{item.native}</span>
                        </span>
                        {language === item.code && <Check className="w-3.5 h-3.5 text-sky-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Role Switcher Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-2xl bg-sky-600/10 hover:bg-sky-600/20 text-sky-700  border border-sky-500/30 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    showRoleDropdown ? 'ring-2 ring-sky-500/30' : ''
                  }`}
                  title={t('nav.switch_role')}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Role: {currentUser?.role ? currentUser.role.toUpperCase() : 'GURU'}</span>
                  <ChevronDown className="w-3 h-3 text-sky-500" />
                </button>

                {showRoleDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-64 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/70'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-900/10'
                    }`}
                  >
                    <div className="px-2.5 py-1.5 border-b mb-1 border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ganti Peran Akses Sistem
                    </div>
                    {[
                      { role: 'guru', label: 'Guru Pengampu / Pengajar', icon: GraduationCap },
                      { role: 'walikelas', label: 'Wali Kelas (Binaan)', icon: Users },
                      { role: 'murid', label: 'Siswa / Murid', icon: UserIcon },
                      { role: 'admin', label: 'Admin Sekolah', icon: Shield },
                      { role: 'kepsek', label: 'Kepala Sekolah', icon: Award },
                      { role: 'tu', label: 'Staff Tata Usaha (TU)', icon: FileSpreadsheet },
                      { role: 'bk', label: 'Konselor BK', icon: HeartPulse },
                      { role: 'parent', label: 'Orang Tua / Wali Murid', icon: Users },
                      { role: 'superadmin', label: 'Super Admin', icon: Shield },
                    ].map((r) => {
                      const isActive = (currentUser?.role || 'guru') === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            setShowRoleDropdown(false);
                            if (onSwitchRole) {
                              onSwitchRole(r.role);
                            } else {
                              let name = 'Ahmad Siswa';
                              if (r.role === 'superadmin') name = 'Super Admin (Platform Owner)';
                              else if (r.role === 'admin') name = 'Admin Sekolah';
                              else if (r.role === 'kepsek') name = 'Dr. H. Mulyadi, M.Pd (Kepala Sekolah)';
                              else if (r.role === 'guru') name = 'Budi Santoso, M.Pd (Guru)';
                              else if (r.role === 'walikelas') name = 'Dra. Hj. Nurul Hidayati (Wali Kelas)';
                              else if (r.role === 'bk') name = 'Drs. Bambang Irawan, M.Psi (Guru BK)';
                              else if (r.role === 'tu') name = 'Siti Aminah, S.AP (Staf Tata Usaha)';
                              else if (r.role === 'parent' || r.role === 'orang_tua') name = 'Rudi Hermawan (Orang Tua Siswa)';
                              const updated = {
                                ...(currentUser || DEFAULT_USER),
                                role: r.role as any,
                                name,
                              };
                              setStoredUser(updated);
                              if (typeof window !== 'undefined') {
                                if (r.role === 'guru') window.location.href = '/guru';
                                else if (r.role === 'murid') window.location.href = '/siswa';
                                else window.location.href = '/';
                              }
                            }
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                            isActive
                              ? 'bg-sky-50  text-sky-700  font-bold'
                              : 'hover:bg-slate-100 :bg-white/10 text-slate-700 '
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <r.icon className="w-3.5 h-3.5 opacity-70" />
                            <span>{r.label}</span>
                          </span>
                          {isActive && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notification Button */}
              <button
                onClick={() => handleSelectModule('notifications')}
                className="p-2 rounded-2xl bg-black/5 hover:bg-black/10 :bg-white/10 border border-white/10 text-slate-600 relative transition-all cursor-pointer"
                title="Notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => (onOpenSettings ? onOpenSettings() : setInternalSettingsOpen(true))}
                className="p-2 rounded-2xl bg-black/5 hover:bg-black/10 :bg-white/10 border border-white/10 text-slate-600 transition-all cursor-pointer"
                title="Pengaturan Akun"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* SCROLLABLE WORKSPACE CONTENT CANVAS */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 pb-8 scrollbar-thin">
            {/* Quick Persistent Class Selector Bar (Shown on dashboard) */}
            {activeTab === 'dashboard' && (
              <div className="mb-4 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-3 px-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kelas Aktif:</span>
                  <div className="flex items-center gap-1.5">
                    {['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI RPL 2'].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setSelectedClass(cls);
                          toast.success(`Beralih ke kelas ${cls}`);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedClass === cls
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-slate-100  text-slate-600  hover:bg-slate-200 :bg-white/20'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Tahun Ajaran:</span> 2026/2027 Ganjil
                  <span className="text-slate-300">|</span>
                  <span className="font-semibold text-slate-700">KKM:</span> 75.0
                  <span className="text-slate-300">|</span>
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    {sessionActive ? `Sesi ${selectedClass} Aktif` : 'Tidak Ada Sesi'}
                  </span>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 1: DASHBOARD GURU BENTO FROSTED GLASS                                */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Hero Greeting & Status Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{t('teacher.hero_title')}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-lg bg-sky-100 text-sky-700 font-mono font-bold">
                        {teacherName}
                      </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                      {t('teacher.hero_desc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {sessionActive ? `Sesi Aktif: ${selectedClass} • Pertemuan Ke-08` : 'Tidak Ada Sesi Aktif'}
                    </span>
                  </div>
                </div>

                {/* FEATURED HERO BANNER: Studio Ajar AI & Performance Booster */}
                <div
                  onClick={() => handleSelectModule('learn')}
                  className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden border border-sky-500/20"
                >
                  <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-sky-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 font-semibold text-[10px] tracking-wider uppercase shadow-xs">
                          {t('teacher.room_badge') || '✨ RUANG MANDIRI PENGAJAR'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium text-[10px] border border-white/10">
                          {t('teacher.studio_goals_badge') || 'STUDIO AJAR & GOALS (/goal /boost /learn)'}
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Studio Pembelajaran Cerdas & AI Teaching Assistant</span>
                        <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                        Otomasi penyusunan RPP Kurikulum Merdeka, generate butir soal ujian HOTS otomatis, koreksi penugasan siswa instan, dan pantau target ketuntasan KKM semester ini.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectModule('learn');
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Buka Studio (/learn)</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectModule('boost');
                        }}
                        className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Booster (/boost)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* --------------------------------------------------------------------- */}
                {/* ROW 1: TOP 4 BENTO METRIC CARDS                                       */}
                {/* --------------------------------------------------------------------- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* CARD 1: Kelas Diajar */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">
                        {t('teacher.classes_taught')}
                      </span>
                      <button
                        onClick={() => handleSelectModule('classes')}
                        className="text-[11px] font-medium text-sky-600 hover:underline cursor-pointer"
                      >
                        Lihat Rombel
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                          4 Rombel
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          128 Siswa Total Terdaftar
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Tugas Pending Grading */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">
                        {t('teacher.pending_grading')}
                      </span>
                      <button
                        onClick={() => handleSelectModule('submissions')}
                        className="text-[11px] font-medium text-amber-600 hover:underline cursor-pointer"
                      >
                        Beri Nilai
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-amber-600">
                          3 Pengumpulan
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          1 Terlambat • Butuh Feedback
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* CARD 3: Presensi Hari Ini */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">
                        {t('teacher.today_attendance')}
                      </span>
                      <button
                        onClick={() => handleSelectModule('attendance')}
                        className="text-[11px] font-medium text-emerald-600 hover:underline cursor-pointer"
                      >
                        Isi Absen
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
                          {attendanceStats.percent}% Hadir
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          {attendanceStats.hadir} Hadir, {attendanceStats.terlambat} Telat, {attendanceStats.sakit} Sakit
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: Ujian Terdekat */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-slate-900">
                        {t('teacher.upcoming_exam')}
                      </span>
                      <button
                        onClick={() => handleSelectModule('exams')}
                        className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        Token CBT
                      </button>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                          PTS Matematika
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          3 Hari Lagi • R. Lab RPL 1 & 2
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Award className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* --------------------------------------------------------------------- */}
                {/* ROW 2: TODAY'S TEACHING SCHEDULE & ACTIVE SESSION CARD                */}
                {/* --------------------------------------------------------------------- */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-sky-600" />
                        <span>{t('teacher.today_schedule')}</span>
                      </h2>
                      <p className="text-xs text-slate-500">3 Sesi Tatap Muka Terjadwal Hari Ini</p>
                    </div>
                    <button
                      onClick={() => handleSelectModule('teaching-session')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t('teacher.start_session')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* Session 1 (Active) */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md animate-pulse">
                          Sedang Berlangsung
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-800">07:30 - 09:00</span>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-base">X RPL 1</div>
                        <div className="text-xs font-semibold text-slate-600">Matematika Terapan</div>
                        <div className="text-[11px] text-slate-500 mt-1">Ruang Lab RPL 1 • 34 Siswa</div>
                      </div>
                      <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs font-semibold text-emerald-800">
                        <span>Pertemuan Ke-8</span>
                        <button onClick={() => handleSelectModule('attendance')} className="underline hover:text-emerald-950 :text-white cursor-pointer">
                          {t('teacher.fill_attendance')} →
                        </button>
                      </div>
                    </div>

                    {/* Session 2 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md">
                          Berikutnya (09:15)
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">09:15 - 10:45</span>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-base">X RPL 2</div>
                        <div className="text-xs font-semibold text-slate-600">Matematika Terapan</div>
                        <div className="text-[11px] text-slate-500 mt-1">Ruang Lab RPL 2 • 32 Siswa</div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Pertemuan Ke-8</span>
                        <button onClick={() => handleSelectModule('materials')} className="underline hover:text-slate-900 :text-white cursor-pointer">
                          {t('teacher.view_modules')} →
                        </button>
                      </div>
                    </div>

                    {/* Session 3 */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md">
                          Akan Datang
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">11:00 - 12:30</span>
                      </div>
                      <div>
                        <div className="font-black text-slate-900 text-base">XI RPL 1</div>
                        <div className="text-xs font-semibold text-slate-600">Statistika Lanjutan</div>
                        <div className="text-[11px] text-slate-500 mt-1">Ruang Teori 204 • 30 Siswa</div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
                        <span>Pertemuan Ke-7</span>
                        <button onClick={() => handleSelectModule('teaching-journal')} className="underline hover:text-slate-900 :text-white cursor-pointer">
                          {t('teacher.draft_journal')} →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --------------------------------------------------------------------- */}
                {/* ROW 3: QUICK ACTION MATRIX                                            */}
                {/* --------------------------------------------------------------------- */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-3.5">
                    {t('teacher.quick_actions')}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Mulai Pertemuan', icon: Play, tab: 'teaching-session', color: 'hover:border-emerald-500 hover:bg-emerald-50/50 :bg-emerald-950/20' },
                      { label: 'Isi Presensi', icon: UserCheck, tab: 'attendance', color: 'hover:border-blue-500 hover:bg-blue-50/50 :bg-blue-950/20' },
                      { label: 'Upload Materi', icon: Upload, tab: 'material-create', color: 'hover:border-blue-500 hover:bg-blue-50/50 :bg-blue-950/20' },
                      { label: 'Buat Tugas', icon: FileText, tab: 'assignment-create', color: 'hover:border-sky-500 hover:bg-sky-50/50 :bg-sky-950/20' },
                      { label: 'Buat Kuis', icon: HelpCircle, tab: 'quiz', color: 'hover:border-amber-500 hover:bg-amber-50/50 :bg-amber-950/20' },
                      { label: 'Ujian CBT', icon: Award, tab: 'exams', color: 'hover:border-rose-500 hover:bg-rose-50/50 :bg-rose-950/20' },
                      { label: 'Gradebook Nilai', icon: FileSpreadsheet, tab: 'gradebook', color: 'hover:border-teal-500 hover:bg-teal-50/50 :bg-teal-950/20' },
                      { label: 'Siarkan Info', icon: Bell, tab: 'announcements', color: 'hover:border-sky-500 hover:bg-sky-50/50 :bg-sky-950/20' },
                    ].map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectModule(act.tab)}
                        className={`p-3.5 rounded-2xl border border-slate-200/80  bg-slate-50/50  flex items-center gap-2.5 transition-all cursor-pointer text-left ${act.color}`}
                      >
                        <act.icon className="w-4 h-4 text-slate-700" />
                        <span className="text-xs font-bold text-slate-800">{act.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* ALL TEACHER MODULES WORKSPACE: GOAL, LEARN, BOOST, ATTENDANCE, GRADEBOOK, ETC. */}
            {/* ========================================================================= */}
            {activeTab !== 'dashboard' && (
              <TeacherHubView
                currentUser={currentUser}
                hideSidebar={true}
                hideHeader={true}
                externalActiveMenu={activeTab as TeacherMenuId}
                onMenuChange={(menu) => handleSelectModule(menu)}
                onNavigateTab={(tab) => {
                  if (tab === 'walikelas-hub' && onSwitchRole) {
                    onSwitchRole('walikelas');
                  }
                }}
              />
            )}
          </div>
        </main>
      </div>

      {/* GRADING MODAL */}
      {gradingModalItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">
                Input Nilai: {gradingModalItem.name}
              </h3>
              <button
                onClick={() => setGradingModalItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 :bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skor Nilai (0 - 100):
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={gradingScore}
                onChange={(e) => setGradingScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Feedback Guru:
              </label>
              <textarea
                rows={3}
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                placeholder="Tuliskan catatan perbaikan atau pujian..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setGradingModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGrading}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
              >
                Simpan Nilai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={internalSettingsOpen}
        onClose={() => setInternalSettingsOpen(false)}
        currentUser={currentUser || DEFAULT_USER}
        onUserUpdated={(u) => {
          if (currentUser) {
            setStoredUser(u);
          }
        }}
      />
    </div>
  );
}
