'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  User as UserIcon,
  BookOpen,
  Users,
  Calendar,
  Play,
  FileText,
  UserCheck,
  BarChart3,
  Upload,
  FolderOpen,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  Award,
  Database,
  TrendingUp,
  Target,
  Send,
  MessageSquare,
  CalendarDays,
  Bell,
  FileSignature,
  FileDown,
  FileUp,
  FolderArchive,
  Lock,
  LifeBuoy,
  Bot,
  Plus,
  Trash2,
  Edit3,
  Clock,
  Sparkles,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Check,
  X,
  Star,
  Flame,
  Shield,
  Search,
  Filter,
  ExternalLink,
  Download,
  Paperclip,
  MessageCircle,
  AlertCircle,
  Eye,
  HardDrive,
  Share2,
  Printer,
  Copy,
  CheckCheck,
  KeyRound,
  Smartphone,
  Zap,
  ArrowRight,
  GraduationCap,
  Layers
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  finishTeacherSessionApi,
  startTeacherSessionApi,
  saveTeacherAttendanceApi,
  gradeSubmissionApi,
  chatTeacherAiAssistantApi,
  fetchTeacherDashboard,
  fetchTeacherAttendance,
  fetchTeacherMaterials,
  createTeacherMaterialApi,
  deleteTeacherMaterialApi,
  fetchTeacherAssignments,
  createTeacherAssignmentApi,
  deleteTeacherAssignmentApi,
  fetchTeacherGradebook,
  saveTeacherGradebookApi,
  fetchTeacherAnnouncements,
  createTeacherAnnouncementApi,
  fetchTeacherMessages,
  sendTeacherMessageApi,
  fetchTeacherJournals,
  storeTeacherJournalApi,
  fetchTeacherQuizzes,
  createTeacherQuizApi,
  fetchTeacherQuestionBank,
  createTeacherQuestionApi,
  saveTeacherAssessmentsApi,
  fetchTeacherTeachingNotes,
  createTeacherTeachingNoteApi,
  importTeacherGradesApi,
  exportTeacherDataApi,
  updateTeacherSecurityPasswordApi,
  updateTeacherProfileApi
} from '@/lib/api';
import { useAppPreferences } from '@/context/AppPreferencesContext';

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

interface StudentAcademicItem {
  id: number;
  name: string;
  nis: string;
  status: string;
  note: string;
}

interface AnnouncementItem {
  id: number;
  title: string;
  class: string;
  content: string;
  date: string;
}

interface TeacherHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  externalActiveMenu?: TeacherMenuId;
  onMenuChange?: (menu: TeacherMenuId) => void;
  hideSidebar?: boolean;
  hideHeader?: boolean;
}

export type TeacherMenuId =
  | 'dashboard'
  | 'goal'
  | 'learn'
  | 'boost'
  | 'subjects'
  | 'classes'
  | 'schedule'
  | 'teaching-session'
  | 'teaching-journal'
  | 'materials'
  | 'material-create'
  | 'teacher-files'
  | 'assignments'
  | 'assignment-create'
  | 'submissions'
  | 'quiz'
  | 'exams'
  | 'question-bank'
  | 'assessments'
  | 'gradebook'
  | 'grade-analysis'
  | 'remedial'
  | 'enrichment'
  | 'attendance'
  | 'attendance-recap'
  | 'announcements'
  | 'messages'
  | 'calendar'
  | 'reports'
  | 'notifications'
  | 'profile'
  | 'help'
  | 'teaching-progress'
  | 'curriculum'
  | 'teaching-notes'
  | 'class-performance'
  | 'import-export'
  | 'archive'
  | 'security'
  | 'ai-assistant'
  | 'digital-library';

export interface TeacherFeatureItem {
  id: TeacherMenuId;
  number: number;
  title: string;
  category: string;
  icon: any;
  badge?: string;
  description: string;
}

export const TEACHER_FEATURES: TeacherFeatureItem[] = [
  { id: 'dashboard', number: 1, title: 'Dashboard Guru', category: 'Utama', icon: LayoutDashboard, badge: 'Home', description: 'Ringkasan aktivitas hari ini, jadwal KBM mengajar, tugas pending & statistik kilat' },
  { id: 'profile', number: 2, title: 'Profil & Identitas Guru', category: 'Utama', icon: UserIcon, description: 'Biodata diri pengajar, NIP, pangkat/golongan, mata pelajaran diampu & sertifikasi' },
  { id: 'schedule', number: 3, title: 'Jadwal Mengajar & Kalender', category: 'Utama', icon: Calendar, badge: 'Hari Ini', description: 'Jadwal tatap muka mingguan, alokasi ruang kelas/lab, jam KBM & kalender akademik' },
  { id: 'announcements', number: 4, title: 'Pengumuman & Broadcast Kelas', category: 'Utama', icon: Bell, badge: 'Warta', description: 'Warta resmi guru ke rombel binaan, edaran materi, tugas baru & peringatan KBM' },
  { id: 'notifications', number: 5, title: 'Notifikasi & Peringatan', category: 'Utama', icon: Bell, description: 'Pemberitahuan tugas masuk siswa, pengingat batas input nilai rapor & sistem sekolah' },
  { id: 'teaching-session', number: 6, title: 'Sesi Pertemuan KBM Live', category: 'Pengajaran & KBM', icon: Play, badge: 'Live', description: 'Mulai KBM tatap muka, monitoring kehadiran live, topik materi hari ini & timer KBM' },
  { id: 'teaching-journal', number: 7, title: 'Jurnal Mengajar Harian', category: 'Pengajaran & KBM', icon: FileSignature, description: 'Catatan agenda KBM harian, ketercapaian materi, kendala kelas & refleksi pembelajaran' },
  { id: 'subjects', number: 8, title: 'Mata Pelajaran & Silabus', category: 'Pengajaran & KBM', icon: BookOpen, description: 'Mata pelajaran diampu semester ini, silabus bab, Capaian Pembelajaran CP & ATP' },
  { id: 'classes', number: 9, title: 'Kelas & Rombel Binaan', category: 'Pengajaran & KBM', icon: Users, description: 'Daftar rombel binaan X RPL 1, X RPL 2, XI RPL 1, XI RPL 2 & direktori siswa' },
  { id: 'teaching-progress', number: 10, title: 'Kemajuan Silabus & Target', category: 'Pengajaran & KBM', icon: TrendingUp, description: 'Tracking persentase ketuntasan silabus, jam efektif KBM & target pertemuan semester' },
  { id: 'curriculum', number: 11, title: 'Struktur Kurikulum Merdeka', category: 'Pengajaran & KBM', icon: BookOpen, description: 'Standar capaian CP, fase F, alur tujuan pembelajaran & modul ajar sekolah' },
  { id: 'materials', number: 12, title: 'Modul & Bahan Ajar', category: 'Materi & Sumber Ajar', icon: FolderOpen, badge: 'Modul', description: 'Daftar materi per pertemuan KBM, dokumen PDF, slide PPT, video & bahan tayang' },
  { id: 'material-create', number: 13, title: 'Upload Bahan Ajar Baru', category: 'Materi & Sumber Ajar', icon: Upload, description: 'Form unggah berkas modul, silabus bab materi, target rombel, deskripsi & lampiran' },
  { id: 'teacher-files', number: 14, title: 'File & Drive Pengajar', category: 'Materi & Sumber Ajar', icon: Database, description: 'Penyimpanan awan bank berkas guru, lembar kerja siswa LKS & draf perangkat ajar' },
  { id: 'digital-library', number: 15, title: 'Perpustakaan & Buku Referensi', category: 'Materi & Sumber Ajar', icon: BookOpen, description: 'Katalog buku guru Kurikulum Merdeka, e-book referensi sains & jurnal pendidikan' },
  { id: 'assignments', number: 16, title: 'Daftar Tugas & Penugasan', category: 'Tugas & Penilaian', icon: FileText, badge: 'Aktif', description: 'Daftar penugasan mandiri & kelompok, batas waktu deadline & rekap pengumpulan' },
  { id: 'assignment-create', number: 17, title: 'Buat Tugas Baru', category: 'Tugas & Penilaian', icon: Plus, description: 'Form pembuatan tugas, instruksi pengerjaan, bobot penilaian, lampiran soal & deadline' },
  { id: 'submissions', number: 18, title: 'Koreksi & Nilai Tugas', category: 'Tugas & Penilaian', icon: CheckCircle2, badge: 'Koreksi', description: 'Review lembar jawaban PDF siswa, input nilai 0-100 & catatan feedback korektif' },
  { id: 'quiz', number: 19, title: 'Quiz Builder & CBT Online', category: 'Ujian & Evaluasi', icon: HelpCircle, badge: 'Kuis', description: 'Pembuat kuis kilat, pertanyaan pilihan ganda, essay reflektif & kunci jawaban instan' },
  { id: 'exams', number: 20, title: 'Ujian Sekolah & Monitor CBT', category: 'Ujian & Evaluasi', icon: Award, badge: 'CBT', description: 'Jadwal PTS/PAS/US, generate token acak harian & monitoring pengerjaan live siswa' },
  { id: 'question-bank', number: 21, title: 'Bank Soal Guru', category: 'Ujian & Evaluasi', icon: Database, description: 'Koleksi butir soal terkurasi, klasifikasi tingkat kesulitan (Mudah/Sedang/HOTS)' },
  { id: 'assessments', number: 22, title: 'Pengaturan Asesmen & Bobot', category: 'Ujian & Evaluasi', icon: Target, description: 'Penetapan bobot nilai rapor: Tugas, Kuis, UH, Praktik, PTS, PAS & standar KKM 75' },
  { id: 'gradebook', number: 23, title: 'Gradebook (Buku Nilai)', category: 'Nilai & Rapor', icon: FileSpreadsheet, badge: 'Live', description: 'Buku nilai lengkap per rombel, hitung nilai akhir otomatis & sinkronisasi rapor' },
  { id: 'grade-analysis', number: 24, title: 'Analisis Nilai & Ketuntasan', category: 'Nilai & Rapor', icon: BarChart3, description: 'Statistik kurva nilai, rata-rata kelas, standar deviasi, nilai tertinggi & daya serap' },
  { id: 'remedial', number: 25, title: 'Remedial & Pengayaan', category: 'Nilai & Rapor', icon: Flame, badge: 'Perbaikan', description: 'Daftar siswa di bawah KKM <75 butuh remedial, penugasan perbaikan & program pengayaan' },
  { id: 'enrichment', number: 26, title: 'Program Pengayaan & Prestasi', category: 'Nilai & Rapor', icon: Star, description: 'Modul bimbingan khusus siswa berprestasi & persiapan lomba olimpiade sains' },
  { id: 'class-performance', number: 27, title: 'Komparasi Antar Rombel', category: 'Nilai & Rapor', icon: Users, description: 'Perbandingan performa nilai & ketuntasan belajar antar kelas X RPL 1 vs X RPL 2' },
  { id: 'reports', number: 28, title: 'Laporan KBM & Cetak Rapor', category: 'Nilai & Rapor', icon: BarChart3, description: 'Generate laporan kemajuan akademik KBM, berita acara ujian & cetak format rapor' },
  { id: 'attendance', number: 29, title: 'Presensi Harian Siswa', category: 'Presensi & Kehadiran', icon: UserCheck, badge: 'Hari Ini', description: 'Input presensi KBM: Hadir, Terlambat, Sakit, Izin, Alfa dengan one-click Hadir Semua' },
  { id: 'attendance-recap', number: 30, title: 'Rekap Presensi Rombel', category: 'Presensi & Kehadiran', icon: BarChart3, description: 'Persentase kehadiran bulanan rombel, rekap siswa sering terlambat & peringatan presensi' },
  { id: 'messages', number: 31, title: 'Pesan & Tanya Jawab Siswa', category: 'Komunikasi & Pendampingan', icon: MessageSquare, description: 'Tanya jawab materi pelajaran, ruang konsultasi interaktif & bimbingan belajar siswa' },
  { id: 'teaching-notes', number: 32, title: 'Catatan Pribadi Guru', category: 'Komunikasi & Pendampingan', icon: Lock, badge: 'Privat', description: 'Catatan rahasia pengajar mengenai observasi karakter belajar & atensi khusus siswa' },
  { id: 'goal', number: 33, title: 'Target Akademik Guru (/goal)', category: 'Ruang Mandiri & AI', icon: Target, badge: 'Goals', description: 'Pelacak target ketuntasan KKM kelas, target pertemuan semester & milestones mengajar' },
  { id: 'learn', number: 34, title: 'Studio Ajar & RPP AI (/learn)', category: 'Ruang Mandiri & AI', icon: BookOpen, badge: 'Studio', description: 'Studio pembuatan perangkat ajar cerdas, RPP Kurikulum Merdeka, Arsip Belajar AI & materi visual' },
  { id: 'boost', number: 35, title: 'Booster Kinerja Guru (/boost)', category: 'Ruang Mandiri & AI', icon: Zap, badge: 'Booster', description: 'Booster produktivitas guru, automasi koreksi tugas, generator soal kilat & analisis butir soal' },
  { id: 'ai-assistant', number: 36, title: 'AI Teacher Assistant', category: 'Ruang Mandiri & AI', icon: Bot, badge: 'Cerdas', description: 'Asisten cerdas untuk membuat modul ajar, draf soal HOTS, rubrik asesmen & analisis kelas' },
  { id: 'import-export', number: 37, title: 'Impor & Ekspor Nilai', category: 'Pengaturan & Sistem', icon: FileUp, description: 'Import nilai dari spreadsheet Excel/CSV, ekspor template rapor & sinkronisasi data' },
  { id: 'archive', number: 38, title: 'Arsip Semester Lampau', category: 'Pengaturan & Sistem', icon: FolderArchive, description: 'Data riwayat KBM semester lalu, arsip soal ujian & histori nilai alumni kelas' },
  { id: 'security', number: 39, title: 'Keamanan Akun & Sandi', category: 'Pengaturan & Sistem', icon: Shield, description: 'Ganti kata sandi guru, 2FA autentikasi, tema visual & riwayat sesi login pengajar' },
  { id: 'help', number: 40, title: 'Pusat Bantuan & Panduan Guru', category: 'Pengaturan & Sistem', icon: LifeBuoy, description: 'Panduan portal pengajar, formulir bantuan teknis, kontak admin sekolah & FAQ' },
];

export default function TeacherHubView({
  currentUser,
  onNavigateTab,
  externalActiveMenu,
  onMenuChange,
  hideSidebar = false,
  hideHeader = false,
}: TeacherHubViewProps) {
  const { theme, language, t, dir } = useAppPreferences();
  const [internalMenu, setInternalMenu] = useState<TeacherMenuId>('dashboard');
  const activeMenu = externalActiveMenu || internalMenu;
  const setActiveMenu = (menu: TeacherMenuId) => {
    setInternalMenu(menu);
    if (onMenuChange) onMenuChange(menu);
  };

  const activeFeature = useMemo(() => {
    const raw = TEACHER_FEATURES.find((f) => f.id === activeMenu) || TEACHER_FEATURES[0];
    const modKey = `mod.${raw.id.replace(/-/g, '_')}`;
    const teacherModKey = `mod.teacher_${raw.id.replace(/-/g, '_')}`;
    const descKey = `mod_desc.${raw.id.replace(/-/g, '_')}`;
    const teacherDescKey = `mod_desc.teacher_${raw.id.replace(/-/g, '_')}`;
    const badgeKey = `badge.${raw.id.replace(/-/g, '_')}`;
    const teacherBadgeKey = `badge.teacher_${raw.id.replace(/-/g, '_')}`;

    let localizedTitle = raw.title;
    if (t(teacherModKey) !== teacherModKey) localizedTitle = t(teacherModKey);
    else if (t(modKey) !== modKey) localizedTitle = t(modKey);

    let localizedDesc = raw.description;
    if (t(teacherDescKey) !== teacherDescKey) localizedDesc = t(teacherDescKey);
    else if (t(descKey) !== descKey) localizedDesc = t(descKey);

    let localizedBadge = raw.badge;
    if (raw.badge) {
      if (t(teacherBadgeKey) !== teacherBadgeKey) localizedBadge = t(teacherBadgeKey);
      else if (t(badgeKey) !== badgeKey) localizedBadge = t(badgeKey);
    }

    const categoryKeyMap: Record<string, string> = {
      'Utama': 'cat.main',
      'Pengajaran & KBM': 'group.teacher_kbm',
      'Materi & Sumber Ajar': 'group.teacher_materi',
      'Tugas & Penilaian': 'group.teacher_tugas',
      'Ujian & Evaluasi': 'group.teacher_ujian',
      'Nilai & Rapor': 'group.teacher_nilai',
      'Presensi & Kehadiran': 'group.teacher_presensi',
      'Komunikasi & Pendampingan': 'group.teacher_komunikasi',
      'Ruang Mandiri & AI': 'group.teacher_mandiri',
      'Pengaturan & Sistem': 'group.teacher_pengaturan',
    };
    const catKey = categoryKeyMap[raw.category] || '';
    const localizedCategory = catKey && t(catKey) !== catKey ? t(catKey) : raw.category;

    return {
      ...raw,
      title: localizedTitle,
      category: localizedCategory,
      description: localizedDesc,
      badge: localizedBadge,
    };
  }, [activeMenu, t]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pengajaran: true,
    materi: true,
    tugas: true,
    assessment: true,
    nilai: true,
    presensi: true,
    komunikasi: true,
  });

  // Master Data States with robust defaults & live hydration
  const [selectedClass, setSelectedClass] = useState<string>('X RPL 1');
  const [sessionActive, setSessionActive] = useState<boolean>(true);
  const [sessionMeeting, setSessionMeeting] = useState<number>(8);
  const [sessionTopic, setSessionTopic] = useState<string>('Persamaan & Fungsi Kuadrat dalam Algoritma Grafis');

  // Attendance state (Exact 8-student roster aligned with backend)
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

  // Live Dynamic Attendance Statistics
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

  // Gradebook state
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([
    { id: 201, name: 'Ahmad Fatih Pratama', nis: '240101', tugas: 90, quiz: 88, uh: 85, praktik: 92, pts: 88, pas: 90 },
    { id: 202, name: 'Annisa Rahmawati', nis: '240102', tugas: 95, quiz: 94, uh: 92, praktik: 96, pts: 92, pas: 94 },
    { id: 203, name: 'Bagas Satria Wijaya', nis: '240103', tugas: 70, quiz: 72, uh: 68, praktik: 76, pts: 70, pas: 72 },
    { id: 204, name: 'Cantika Ayu Lestari', nis: '240104', tugas: 85, quiz: 80, uh: 82, praktik: 88, pts: 84, pas: 86 },
    { id: 205, name: 'Dimas Arya Nugraha', nis: '240105', tugas: 78, quiz: 74, uh: 72, praktik: 80, pts: 76, pas: 78 },
  ]);

  // Live Dynamic Gradebook Calculations (Weights: Tugas 20%, Quiz 15%, UH 20%, Praktik 20%, PTS 10%, PAS 15% = 100%)
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

  // Submissions state
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([
    { id: 501, name: 'Ahmad Fatih Pratama', nis: '240101', time: '04 Okt, 14:20', isLate: false, file: 'ahmad_tugas04_parabola.pdf', status: 'Sudah Dinilai', score: 92, feedback: 'Kalkulasi diskriminan dan grafiknya sangat rapi!' },
    { id: 502, name: 'Annisa Rahmawati', nis: '240102', time: '04 Okt, 15:10', isLate: false, file: 'annisa_parabola.pdf', status: 'Sudah Dinilai', score: 95, feedback: 'Sempurna dan menjawab soal bonus.' },
    { id: 503, name: 'Bagas Satria Wijaya', nis: '240103', time: '05 Okt, 08:30', isLate: false, file: 'bagas_jawaban.pdf', status: 'Belum Dinilai', score: null, feedback: '' },
    { id: 504, name: 'Cantika Ayu Lestari', nis: '240104', time: '05 Okt, 10:15', isLate: false, file: 'cantika_tugas.pdf', status: 'Belum Dinilai', score: null, feedback: '' },
    { id: 505, name: 'Dimas Arya Nugraha', nis: '240105', time: '06 Okt, 01:20', isLate: true, file: 'dimas_parabola.pdf', status: 'Belum Dinilai (Terlambat)', score: null, feedback: '' },
  ]);

  // Selected student for academic view modal
  const [selectedStudentAcademic, setSelectedStudentAcademic] = useState<StudentAcademicItem | null>(null);

  // Grading modal state
  const [gradingModalItem, setGradingModalItem] = useState<SubmissionItem | null>(null);
  const [gradingScore, setGradingScore] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState<string>('');

  // AI Chat Assistant
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo Bapak/Ibu Guru! Saya asisten AI pengajar Anda. Saya dapat membantu membuat modul ajar/RPP, menghasilkan butir soal pilihan ganda & essay, menganalisis kesalahan umum ujian, atau menyusun draf jurnal mengajar.',
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
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    { id: 1, title: 'Praktikum Komputasi di Lab RPL 1 Hari Rabu Pagi', class: 'X RPL 1', content: 'Pertemuan KBM hari Rabu akan diselenggarakan di Lab Komputer RPL 1. Mohon membawa laptop masing-masing atau menggunakan PC lab.', date: '02 Okt 2026' },
    { id: 2, title: 'Jadwal Remedial Ulangan Bab 2: Matriks', class: 'X RPL 1 & 2', content: 'Sesi pendalaman remedial hari Kamis pukul 14:00 di Ruang 204.', date: '30 Sep 2026' },
  ]);
  const [newAnnounceTitle, setNewAnnounceTitle] = useState('');
  const [newAnnounceContent, setNewAnnounceContent] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Materials state
  const [materialsList, setMaterialsList] = useState<Array<{ id: number; meeting: string; title: string; format: string; size: string; downloads: number; date: string }>>([
    { id: 1, meeting: 'Pertemuan 01', title: 'Fondasi Logika & Operasi Aljabar', format: 'PDF', size: '2.4 MB', downloads: 64, date: '15 Agu' },
    { id: 2, meeting: 'Pertemuan 02', title: 'Slide Interaktif Matriks Grafika 2D', format: 'PPTX', size: '8.1 MB', downloads: 59, date: '22 Agu' },
    { id: 3, meeting: 'Pertemuan 03', title: 'Determinan dan Invers Matriks Ordo 3x3', format: 'PDF', size: '3.0 MB', downloads: 55, date: '29 Agu' },
    { id: 4, meeting: 'Pertemuan 04', title: 'Penerapan SPLDV pada Masalah Nyata', format: 'DOCX', size: '1.5 MB', downloads: 52, date: '05 Sep' },
    { id: 5, meeting: 'Pertemuan 05', title: 'Fungsi Linier & Gradien Garis Singgung', format: 'PDF', size: '2.8 MB', downloads: 48, date: '12 Sep' },
    { id: 6, meeting: 'Pertemuan 06', title: 'Fungsi Kuadrat: Parabola dan Diskriminan', format: 'PDF', size: '3.4 MB', downloads: 51, date: '19 Sep' },
    { id: 7, meeting: 'Pertemuan 07', title: 'Aplikasi Fungsi Kuadrat pada Gerak Fisika', format: 'PPTX', size: '6.2 MB', downloads: 44, date: '26 Sep' },
    { id: 8, meeting: 'Pertemuan 08', title: 'Review & Latihan Pra-PTS Matematika', format: 'PDF', size: '1.9 MB', downloads: 60, date: '02 Okt' },
  ]);
  const [newMaterialForm, setNewMaterialForm] = useState({
    title: '',
    meeting: 'Pertemuan 08',
    className: 'X RPL 1, X RPL 2',
    format: 'PDF',
    description: '',
  });

  // Assignments state
  const [assignmentsList, setAssignmentsList] = useState<Array<{ id: number; title: string; className: string; subject: string; deadline: string; maxScore: number; status: string; submittedCount: number; totalStudents: number; gradedCount: number; lateCount: number }>>([
    { id: 1, title: 'Tugas 04: Perhitungan Titik Puncak Parabola Canvas', className: 'X RPL 1', subject: 'Matematika Terapan', deadline: '2026-10-05 23:59', maxScore: 100, status: 'Published', submittedCount: 28, totalStudents: 34, gradedCount: 18, lateCount: 2 },
    { id: 2, title: 'Tugas 03: Lembar Kerja Matriks Transformasi 3D', className: 'X RPL 2', subject: 'Matematika Terapan', deadline: '2026-09-28 23:59', maxScore: 100, status: 'Closed', submittedCount: 32, totalStudents: 32, gradedCount: 32, lateCount: 1 },
    { id: 3, title: 'Tugas 02: Aplikasi Sistem Persamaan Linier pada Rangkaian', className: 'X RPL 1', subject: 'Matematika Terapan', deadline: '2026-09-20 23:59', maxScore: 100, status: 'Closed', submittedCount: 34, totalStudents: 34, gradedCount: 34, lateCount: 0 },
  ]);
  const [newAssignmentForm, setNewAssignmentForm] = useState({
    title: '',
    className: 'X RPL 1',
    deadline: '2026-10-14T23:59',
    maxScore: 100,
    format: 'PDF / File Dokumen',
    instructions: '',
  });

  // Quiz state
  const [quizzesList, setQuizzesList] = useState<Array<{ id: number; title: string; questions: number; duration: string; attempts: number; status: string; avg: number }>>([
    { id: 1, title: 'Kuis Kilat 01: Matriks Ordo 2x2', questions: 10, duration: '30 Menit', attempts: 2, status: 'Selesai', avg: 84.2 },
    { id: 2, title: 'Kuis 02: Diskriminan & Titik Balik Parabola', questions: 15, duration: '45 Menit', attempts: 1, status: 'Aktif', avg: 79.5 },
  ]);
  const [isNewQuizModalOpen, setIsNewQuizModalOpen] = useState(false);
  const [newQuizForm, setNewQuizForm] = useState({
    title: '',
    className: 'X RPL 1',
    duration: 30,
    questions: 10,
    randomize: true,
  });

  // Question Bank state
  const [questionsList, setQuestionsList] = useState<Array<{ id: number; subject: string; topic: string; difficulty: string; type: string; weight: number; question: string; answerKey: string }>>([
    { id: 1, subject: 'Matematika Terapan', topic: 'Fungsi Kuadrat', difficulty: 'Sedang', type: 'Pilihan Ganda', weight: 2, question: 'Jika parabola f(x) = ax² + bx + c memiliki a > 0 dan D = 0, maka grafik fungsi tersebut...', answerKey: 'B. Terbuka ke atas dan menyinggung sumbu X di satu titik' },
    { id: 2, subject: 'Matematika Terapan', topic: 'Matriks', difficulty: 'Sulit', type: 'Essay', weight: 5, question: 'Jelaskan bagaimana perkalian matriks rotasi 2D digunakan dalam rendering orientasi sprite canvas!', answerKey: 'Transformasi posisi koordinat pixel [x, y] dengan matriks trigonometri.' },
    { id: 3, subject: 'Statistika Lanjutan', topic: 'Uji Hipotesis', difficulty: 'Mudah', type: 'True/False', weight: 1, question: 'Tingkat signifikansi alpha (α) = 0.05 berarti ada toleransi kesalahan tipe I sebesar 5%.', answerKey: 'True' },
  ]);
  const [isNewQuestionModalOpen, setIsNewQuestionModalOpen] = useState(false);
  const [newQuestionForm, setNewQuestionForm] = useState({
    topic: '',
    difficulty: 'Sedang',
    type: 'Pilihan Ganda',
    weight: 2,
    question: '',
    answerKey: '',
  });

  // Assessment bobot state
  const [assessmentWeights, setAssessmentWeights] = useState({
    tugas: 20,
    quiz: 15,
    uh: 20,
    praktik: 20,
    pts: 10,
    pas: 15,
    kkm: 75,
  });

  // Drive state
  const [selectedDriveFolder, setSelectedDriveFolder] = useState('Materi & Modul');
  const [driveFiles, setDriveFiles] = useState([
    { id: 1, name: 'Modul_Fungsi_Kuadrat_V2.pdf', folder: 'Materi & Modul', size: '3.2 MB', updated: '01 Okt 2026', type: 'pdf' },
    { id: 2, name: 'Slide_Transformasi_Matriks_2D.pptx', folder: 'Materi & Modul', size: '8.1 MB', updated: '28 Sep 2026', type: 'pptx' },
    { id: 3, name: 'Kisi_Kisi_PTS_Matematika_2026.docx', folder: 'Bank Soal & Kisi-Kisi', size: '420 KB', updated: '29 Sep 2026', type: 'docx' },
    { id: 4, name: 'Kunci_Jawaban_Simulasi_PTS.pdf', folder: 'Bank Soal & Kisi-Kisi', size: '1.1 MB', updated: '30 Sep 2026', type: 'pdf' },
    { id: 5, name: 'LKPD_Praktik_Canvas_Parabola.pdf', folder: 'Lembar Kerja Tugas (LKS)', size: '850 KB', updated: '25 Sep 2026', type: 'pdf' },
    { id: 6, name: 'EBook_Matematika_Terapan_Kejuruan.pdf', folder: 'Referensi & E-Book', size: '24.5 MB', updated: '15 Agu 2026', type: 'pdf' },
  ]);
  const [isNewDriveFileModalOpen, setIsNewDriveFileModalOpen] = useState(false);
  const [newDriveFileName, setNewDriveFileName] = useState('');

  // Class forum & chat channels
  const [activeChatChannel, setActiveChatChannel] = useState<'c1' | 'c2' | 's1' | 's2'>('c1');
  const [chatMessages, setChatMessages] = useState<Record<string, Array<{ id: number; sender: string; role: 'guru' | 'siswa'; text: string; time: string }>>>({
    c1: [
      { id: 1, sender: 'Budi Santoso, M.Pd (Guru)', role: 'guru', text: 'Selamat pagi anak-anak X RPL 1. Mohon cek modul pertemuan 08 untuk persiapan PTS minggu depan ya.', time: '07:15' },
      { id: 2, sender: 'Ahmad Fatih (KM)', role: 'siswa', text: 'Siap Pak! Apakah materi matriks ordo 3x3 masuk ke soal pilihan ganda?', time: '07:22' },
      { id: 3, sender: 'Budi Santoso, M.Pd (Guru)', role: 'guru', text: 'Hanya determinan dan invers sederhana yang masuk ya Fatih.', time: '07:25' },
      { id: 4, sender: 'Bagas Satria Wijaya', role: 'siswa', text: 'Pak, untuk soal nomor 4 tugas kemarin apakah menggunakan diskriminan?', time: '07:40' },
    ],
    c2: [
      { id: 5, sender: 'Budi Santoso, M.Pd (Guru)', role: 'guru', text: 'Pengingat untuk kelas X RPL 2: Pengumpulan Tugas 03 ditutup malam ini pukul 23:59.', time: '08:00' },
      { id: 6, sender: 'Farah Nabilah', role: 'siswa', text: 'Baik Pak, kelompok kami sedang finalisasi grafik 3D nya.', time: '08:15' },
    ],
    s1: [
      { id: 7, sender: 'Ahmad Fatih (KM)', role: 'siswa', text: 'Pak Budi, proyektor Lab RPL 1 kabel HDMI-nya sudah diganti baru oleh Pak Hendra lab.', time: '06:55' },
      { id: 8, sender: 'Budi Santoso, M.Pd (Guru)', role: 'guru', text: 'Terima kasih informasinya Fatih, bagus sekali.', time: '07:05' },
    ],
    s2: [
      { id: 9, sender: 'Bagas Satria', role: 'siswa', text: 'Pak, saya sudah upload lembar remedial modul 2 di sistem. Mohon dicek ya Pak.', time: 'Kemarin' },
      { id: 10, sender: 'Budi Santoso, M.Pd (Guru)', role: 'guru', text: 'Baik Bagas, siang ini Bapak review nilainya.', time: 'Kemarin' },
    ],
  });
  const [chatInput, setChatInput] = useState('');

  // CBT Exam token
  const [cbtToken, setCbtToken] = useState('MTK-PTS-2026');

  // Security form state
  const [securityForm, setSecurityForm] = useState({ currentPass: '', newPass: '', confirmPass: '' });
  const [twoFactorActive, setTwoFactorActive] = useState(false);

  // FAQ accordion state
  const [faqExpanded, setFaqExpanded] = useState<Record<number, boolean>>({ 1: true });

  // Import Excel state
  const [importFileName, setImportFileName] = useState<string | null>(null);

  // Journals state
  const [journalsList, setJournalsList] = useState<Array<{
    id: number;
    date: string;
    class: string;
    meeting: string;
    topic: string;
    objective: string;
    activity: string;
    notes: string;
    status: string;
  }>>([
    {
      id: 1,
      date: '01 Okt 2026',
      class: 'X RPL 1',
      meeting: 'Pertemuan 07',
      topic: 'Persamaan & Fungsi Kuadrat dalam Algoritma Grafis',
      objective: 'Siswa mampu merumuskan titik puncak dan diskriminan untuk kalkulasi lintasan objek game.',
      activity: 'Pemaparan teori, studi kasus gerak parabola pada game, dan latihan mandiri 5 soal.',
      notes: 'Siswa antusias menghubungkan rumus matematika dengan kode canvas web.',
      status: 'Terverifikasi',
    },
    {
      id: 2,
      date: '28 Sep 2026',
      class: 'X RPL 2',
      meeting: 'Pertemuan 07',
      topic: 'Persamaan & Fungsi Kuadrat: Rumus ABC',
      objective: 'Menghitung akar persamaan kuadrat menggunakan rumus ABC.',
      activity: 'Latihan bersama di papan tulis dan quiz kilat 10 menit.',
      notes: 'Koneksi proyektor lab sempat mati 5 menit, KBM dilanjutkan lancar.',
      status: 'Terverifikasi',
    },
  ]);
  const [isNewJournalModalOpen, setIsNewJournalModalOpen] = useState(false);
  const [newJournalForm, setNewJournalForm] = useState({
    className: 'X RPL 1',
    meeting: 'Pertemuan 08',
    topic: '',
    objective: '',
    activity: '',
    notes: '',
  });

  // Hydration effect from backend
  useEffect(() => {
    async function hydrate() {
      try {
        const [dash, mat, ass, jnl, qz, qb, nt, anc] = await Promise.allSettled([
          fetchTeacherDashboard(),
          fetchTeacherMaterials(),
          fetchTeacherAssignments(),
          fetchTeacherJournals(),
          fetchTeacherQuizzes(),
          fetchTeacherQuestionBank(),
          fetchTeacherTeachingNotes(),
          fetchTeacherAnnouncements(),
        ]);
        if (mat.status === 'fulfilled' && mat.value && (mat.value as any).materials) {
          const m = (mat.value as any).materials;
          if (Array.isArray(m) && m.length > 0) {
            setMaterialsList((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = m.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                meeting: x.meeting || 'Pertemuan 08',
                title: x.title || x.judul,
                format: x.format || 'PDF',
                size: x.file_size || '2.0 MB',
                downloads: x.downloads || 0,
                date: x.updated_at || 'Hari ini',
              }));
              return [...newItems, ...prev];
            });
          }
        }
        if (ass.status === 'fulfilled' && ass.value) {
          const val = ass.value as any;
          if (Array.isArray(val.assignments) && val.assignments.length > 0) {
            setAssignmentsList((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = val.assignments.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                title: x.title || x.judul,
                className: x.class_name || 'X RPL 1',
                subject: x.subject || 'Matematika Terapan',
                deadline: x.deadline || '2026-10-14 23:59',
                maxScore: x.max_score || 100,
                status: x.status || 'Published',
                submittedCount: x.submitted_count || 0,
                totalStudents: x.total_students || 34,
                gradedCount: x.graded_count || 0,
                lateCount: x.late_count || 0,
              }));
              return [...newItems, ...prev];
            });
          }
          if (Array.isArray(val.submissions) && val.submissions.length > 0) {
            setSubmissions(val.submissions.map((s: any) => ({
              id: s.id,
              name: s.name,
              nis: s.nis || '240101',
              time: s.time || 'Hari ini',
              isLate: Boolean(s.isLate),
              file: s.file || 'jawaban_tugas.pdf',
              status: s.status || 'Menunggu Koreksi',
              score: s.score !== null && s.score !== undefined ? Number(s.score) : null,
              feedback: s.feedback || '',
            })));
          }
        }
        if (jnl.status === 'fulfilled' && jnl.value && (jnl.value as any).journals) {
          const j = (jnl.value as any).journals;
          if (Array.isArray(j) && j.length > 0) {
            setJournalsList((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = j.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                date: x.date || 'Hari ini',
                class: x.class || x.class_name || 'X RPL 1',
                meeting: x.meeting || 'Pertemuan 08',
                topic: x.topic || '',
                objective: x.objective || '',
                activity: x.activity || x.activities || '',
                notes: x.notes || '',
                status: x.status || 'Terverifikasi',
              }));
              return [...newItems, ...prev];
            });
          }
        }
        if (qz.status === 'fulfilled' && qz.value && (qz.value as any).quizzes) {
          const q = (qz.value as any).quizzes;
          if (Array.isArray(q) && q.length > 0) {
            setQuizzesList((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = q.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                title: x.title,
                questions: x.questions || 10,
                duration: x.duration || '30 Menit',
                attempts: x.attempts || 1,
                status: x.status || 'Aktif',
                avg: x.avg || 0,
              }));
              return [...newItems, ...prev];
            });
          }
        }
        if (qb.status === 'fulfilled' && qb.value && (qb.value as any).questions) {
          const questions = (qb.value as any).questions;
          if (Array.isArray(questions) && questions.length > 0) {
            setQuestionsList((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = questions.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                subject: x.subject || 'Matematika Terapan',
                topic: x.topic || 'Umum',
                difficulty: x.difficulty || 'Sedang',
                type: x.type || 'Pilihan Ganda',
                weight: x.weight || 2,
                question: x.question || '',
                answerKey: x.answerKey || x.answer_key || 'Kunci Jawaban',
              }));
              return [...newItems, ...prev];
            });
          }
        }
        if (nt.status === 'fulfilled' && nt.value && (nt.value as any).notes) {
          const notes = (nt.value as any).notes;
          if (Array.isArray(notes) && notes.length > 0) {
            setTeachingNotes((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = notes.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                date: x.date || new Date().toISOString().split('T')[0],
                class: x.class || 'X RPL 1',
                content: x.content || '',
                pinned: Boolean(x.pinned),
              }));
              return [...newItems, ...prev];
            });
          }
        }
        if (anc.status === 'fulfilled' && anc.value && (anc.value as any).announcements) {
          const a = (anc.value as any).announcements;
          if (Array.isArray(a) && a.length > 0) {
            setAnnouncements((prev) => {
              const ids = new Set(prev.map((x) => x.id));
              const newItems = a.filter((x: any) => !ids.has(x.id)).map((x: any) => ({
                id: x.id,
                title: x.title,
                class: x.class || x.target_class || 'Semua Kelas',
                content: x.content,
                date: x.date || 'Hari ini',
              }));
              return [...newItems, ...prev];
            });
          }
        }
      } catch (e) {
        console.error('Error hydrating teacher hub:', e);
      }
    }
    hydrate();
  }, []);

  // Live Attendance & Gradebook Sync for Selected Class
  useEffect(() => {
    async function loadClassData() {
      try {
        const [attRes, gbRes] = await Promise.allSettled([
          fetchTeacherAttendance({ class: selectedClass }),
          fetchTeacherGradebook({ class: selectedClass }),
        ]);

        if (attRes.status === 'fulfilled' && attRes.value && (attRes.value as any).data) {
          const list = (attRes.value as any).data;
          if (Array.isArray(list) && list.length > 0) {
            setAttendanceList(list.map((s: any) => ({
              id: s.id,
              name: s.name,
              nis: s.nis || `2401${String(s.id).padStart(2, '0')}`,
              status: s.status || 'Hadir',
              note: s.note || '',
            })));
          }
        }

        if (gbRes.status === 'fulfilled' && gbRes.value && (gbRes.value as any).rows) {
          const rows = (gbRes.value as any).rows;
          if (Array.isArray(rows) && rows.length > 0) {
            setGradeRows(rows.map((r: any) => ({
              id: r.id,
              name: r.name,
              nis: r.nis || `2401${String(r.id).padStart(2, '0')}`,
              tugas: Number(r.tugas ?? 0),
              quiz: Number(r.quiz ?? 0),
              uh: Number(r.uh ?? 0),
              praktik: Number(r.praktik ?? 0),
              pts: Number(r.pts ?? 0),
              pas: Number(r.pas ?? 0),
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load class attendance/gradebook:', err);
      }
    }
    loadClassData();
  }, [selectedClass]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBulkAttendanceHadir = () => {
    setAttendanceList((prev) => prev.map((s) => ({ ...s, status: 'Hadir' })));
    showToast('Seluruh siswa ditandai Hadir.', 'info');
  };

  const handleAttendanceChange = (id: number, status: string) => {
    setAttendanceList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const handleSaveAttendance = async () => {
    await saveTeacherAttendanceApi({ class: selectedClass, students: attendanceList });
    showToast('✅ Presensi berhasil disimpan dan disinkronkan ke rekap KBM sekolah!', 'success');
  };

  const handleSaveGradebook = async () => {
    await saveTeacherGradebookApi({ class: selectedClass, rows: gradeRows });
    showToast('✅ Nilai Gradebook berhasil disimpan permanen ke rapor & wali kelas!', 'success');
  };

  const handleGradeCellChange = (id: number, field: string, val: string) => {
    const raw = parseFloat(val) || 0;
    const num = Math.min(100, Math.max(0, raw));
    setGradeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: num } : row))
    );
  };

  const handleOpenGrading = (sub: SubmissionItem) => {
    setGradingModalItem(sub);
    setGradingScore(sub.score || 85);
    setGradingFeedback(sub.feedback || 'Kerja bagus, pertahankan ketelitian!');
  };

  const handleSaveGrading = async () => {
    if (!gradingModalItem) return;
    await gradeSubmissionApi(gradingModalItem.id, gradingScore, gradingFeedback);
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === gradingModalItem.id
          ? { ...s, score: gradingScore, feedback: gradingFeedback, status: 'Sudah Dinilai' }
          : s
      )
    );
    setGradingModalItem(null);
    showToast(`Nilai ${gradingScore} dan masukan berhasil dikirimkan ke siswa!`, 'success');
  };

  const handleCreateMaterial = async () => {
    if (!newMaterialForm.title.trim()) {
      showToast('Judul materi wajib diisi!', 'error');
      return;
    }
    await createTeacherMaterialApi({
      title: newMaterialForm.title,
      meeting: newMaterialForm.meeting,
      class_name: newMaterialForm.className,
      format: newMaterialForm.format,
      description: newMaterialForm.description,
    });
    setMaterialsList((prev) => [
      {
        id: Date.now(),
        meeting: newMaterialForm.meeting,
        title: newMaterialForm.title,
        format: newMaterialForm.format,
        size: '2.5 MB',
        downloads: 0,
        date: 'Hari ini',
      },
      ...prev,
    ]);
    setNewMaterialForm({
      title: '',
      meeting: 'Pertemuan 08',
      className: 'X RPL 1, X RPL 2',
      format: 'PDF',
      description: '',
    });
    showToast('📖 Materi berhasil diunggah dan dibagikan ke siswa!', 'success');
    setActiveMenu('materials');
  };

  const handleDeleteMaterial = async (id: number) => {
    await deleteTeacherMaterialApi(id);
    setMaterialsList((prev) => prev.filter((m) => m.id !== id));
    showToast('Materi berhasil dihapus.', 'info');
  };

  const handleCreateAssignment = async () => {
    if (!newAssignmentForm.title.trim()) {
      showToast('Judul tugas wajib diisi!', 'error');
      return;
    }
    await createTeacherAssignmentApi({
      title: newAssignmentForm.title,
      class_name: newAssignmentForm.className,
      deadline: newAssignmentForm.deadline,
      max_score: newAssignmentForm.maxScore,
      instructions: newAssignmentForm.instructions,
    });
    setAssignmentsList((prev) => [
      {
        id: Date.now(),
        title: newAssignmentForm.title,
        className: newAssignmentForm.className,
        subject: 'Matematika Terapan',
        deadline: newAssignmentForm.deadline.replace('T', ' '),
        maxScore: newAssignmentForm.maxScore,
        status: 'Published',
        submittedCount: 0,
        totalStudents: 34,
        gradedCount: 0,
        lateCount: 0,
      },
      ...prev,
    ]);
    setNewAssignmentForm({
      title: '',
      className: 'X RPL 1',
      deadline: '2026-10-14T23:59',
      maxScore: 100,
      format: 'PDF / File Dokumen',
      instructions: '',
    });
    showToast('📝 Tugas baru berhasil diterbitkan untuk siswa!', 'success');
    setActiveMenu('assignments');
  };

  const handleDeleteAssignment = async (id: number) => {
    await deleteTeacherAssignmentApi(id);
    setAssignmentsList((prev) => prev.filter((a) => a.id !== id));
    showToast('Tugas berhasil dihapus.', 'info');
  };

  const handleCreateQuiz = async () => {
    if (!newQuizForm.title.trim()) {
      showToast('Judul kuis wajib diisi!', 'error');
      return;
    }
    await createTeacherQuizApi(newQuizForm);
    setQuizzesList((prev) => [
      {
        id: Date.now(),
        title: newQuizForm.title,
        questions: newQuizForm.questions,
        duration: `${newQuizForm.duration} Menit`,
        attempts: 1,
        status: 'Aktif',
        avg: 0,
      },
      ...prev,
    ]);
    setIsNewQuizModalOpen(false);
    setNewQuizForm({
      title: '',
      className: 'X RPL 1',
      duration: 30,
      questions: 10,
      randomize: true,
    });
    showToast('🧪 Kuis baru berhasil dibuat dan dijadwalkan!', 'success');
  };

  const handleCreateQuestion = async () => {
    if (!newQuestionForm.question.trim() || !newQuestionForm.topic.trim()) {
      showToast('Soal dan topik wajib diisi!', 'error');
      return;
    }
    await createTeacherQuestionApi(newQuestionForm);
    setQuestionsList((prev) => [
      {
        id: Date.now(),
        subject: 'Matematika Terapan',
        topic: newQuestionForm.topic,
        difficulty: newQuestionForm.difficulty,
        type: newQuestionForm.type,
        weight: newQuestionForm.weight,
        question: newQuestionForm.question,
        answerKey: newQuestionForm.answerKey || 'Kunci Jawaban',
      },
      ...prev,
    ]);
    setIsNewQuestionModalOpen(false);
    setNewQuestionForm({
      topic: '',
      difficulty: 'Sedang',
      type: 'Pilihan Ganda',
      weight: 2,
      question: '',
      answerKey: '',
    });
    showToast('✅ Soal baru berhasil disimpan ke Bank Soal pribadi Anda!', 'success');
  };

  const handleSaveAssessmentWeights = async () => {
    const total =
      assessmentWeights.tugas +
      assessmentWeights.quiz +
      assessmentWeights.uh +
      assessmentWeights.praktik +
      assessmentWeights.pts +
      assessmentWeights.pas;
    if (total !== 100) {
      showToast(`Total bobot harus tepat 100% (saat ini ${total}%)`, 'error');
      return;
    }
    await saveTeacherAssessmentsApi(assessmentWeights);
    showToast('Pengaturan bobot nilai & KKM tersimpan aktif!', 'success');
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    const newMsg = {
      id: Date.now(),
      sender: 'Budi Santoso, M.Pd (Guru)',
      role: 'guru' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => ({
      ...prev,
      [activeChatChannel]: [...(prev[activeChatChannel] || []), newMsg],
    }));
    await sendTeacherMessageApi({ channel_id: activeChatChannel, message: text });
    showToast('Pesan terkirim ke ruang diskusi kelas.', 'info');
  };

  const handleCreateJournal = async () => {
    if (!newJournalForm.topic.trim()) {
      showToast('Materi/Topik jurnal wajib diisi!', 'error');
      return;
    }
    await storeTeacherJournalApi({
      topic: newJournalForm.topic,
      class_name: newJournalForm.className,
      meeting: newJournalForm.meeting,
      objective: newJournalForm.objective,
      activities: newJournalForm.activity,
      notes: newJournalForm.notes,
    });
    setJournalsList((prev) => [
      {
        id: Date.now(),
        date: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        class: newJournalForm.className,
        meeting: newJournalForm.meeting,
        topic: newJournalForm.topic,
        objective: newJournalForm.objective || 'Tercapainya capaian pembelajaran modul.',
        activity: newJournalForm.activity || 'Pembelajaran tatap muka dan diskusi kelas.',
        notes: newJournalForm.notes || 'KBM terlaksana dengan baik.',
        status: 'Terverifikasi',
      },
      ...prev,
    ]);
    setIsNewJournalModalOpen(false);
    setNewJournalForm({
      className: 'X RPL 1',
      meeting: 'Pertemuan 08',
      topic: '',
      objective: '',
      activity: '',
      notes: '',
    });
    showToast('📝 Jurnal KBM berhasil dicatat dan disinkronkan!', 'success');
  };

  const handleRegenerateToken = () => {
    const newToken = 'MTK-PTS-' + Math.floor(1000 + Math.random() * 9000);
    setCbtToken(newToken);
    showToast(`Token CBT diperbarui: ${newToken}`, 'success');
  };

  const handleUpdatePassword = async () => {
    if (!securityForm.newPass || securityForm.newPass !== securityForm.confirmPass) {
      showToast('Konfirmasi kata sandi baru tidak cocok!', 'error');
      return;
    }
    await updateTeacherSecurityPasswordApi({ new_password: securityForm.newPass });
    setSecurityForm({ currentPass: '', newPass: '', confirmPass: '' });
    showToast('Kata sandi berhasil diperbarui dengan aman!', 'success');
  };

  const handleProcessImport = async () => {
    await importTeacherGradesApi({ class: selectedClass });
    setImportFileName(null);
    showToast('34 record nilai Excel berhasil diimpor ke Gradebook!', 'success');
  };

  const handleAddDriveFile = () => {
    if (!newDriveFileName.trim()) return;
    setDriveFiles((prev) => [
      {
        id: Date.now(),
        name: newDriveFileName.endsWith('.pdf') ? newDriveFileName : `${newDriveFileName}.pdf`,
        folder: selectedDriveFolder,
        size: '1.4 MB',
        updated: 'Hari ini',
        type: 'pdf',
      },
      ...prev,
    ]);
    setNewDriveFileName('');
    setIsNewDriveFileModalOpen(false);
    showToast('File berhasil diunggah ke Drive Guru!', 'success');
  };

  const handleDeleteDriveFile = (id: number) => {
    setDriveFiles((prev) => prev.filter((f) => f.id !== id));
    showToast('File berhasil dihapus dari Drive.', 'info');
  };

  const handleSendAiPrompt = async (textToSend?: string) => {
    const prompt = (textToSend || aiPrompt).trim();
    if (!prompt) return;

    const userMsg = { sender: 'user' as const, text: prompt, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setAiMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setAiPrompt('');
    setIsAiLoading(true);

    const res = await chatTeacherAiAssistantApi(prompt);
    setIsAiLoading(false);

    const aiMsg = {
      sender: 'ai' as const,
      text: res.reply || 'Respon AI telah digenerate.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setAiMessages((prev) => [...prev, aiMsg]);
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    try {
      await createTeacherTeachingNoteApi({ content: newNoteText.trim(), class_name: selectedClass });
    } catch (e) {
      console.error('Failed to persist teaching note:', e);
    }
    setTeachingNotes((prev) => [
      {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        class: selectedClass,
        content: newNoteText,
        pinned: false,
      },
      ...prev,
    ]);
    setNewNoteText('');
    showToast('Catatan pribadi guru tersimpan.', 'success');
  };

  const handleAddAnnouncement = async () => {
    if (!newAnnounceTitle.trim() || !newAnnounceContent.trim()) {
      showToast('Judul dan isi pengumuman wajib diisi!', 'error');
      return;
    }
    await createTeacherAnnouncementApi({
      title: newAnnounceTitle,
      content: newAnnounceContent,
      target_class: selectedClass,
    });
    setAnnouncements((prev) => [
      {
        id: Date.now(),
        title: newAnnounceTitle,
        class: selectedClass,
        content: newAnnounceContent,
        date: 'Hari ini',
      },
      ...prev,
    ]);
    setNewAnnounceTitle('');
    setNewAnnounceContent('');
    showToast('📢 Pengumuman berhasil disiarkan ke siswa & wali kelas!', 'success');
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-800 animate-in fade-in duration-150">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-white animate-in slide-in-from-top duration-200">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
            }`}
          />
          <span className="text-xs font-bold text-slate-800">{toast.message}</span>
        </div>
      )}



      {/* 2. Main Workspace Layout: Sidebar Nav + Dynamic Content Panel */}
      <div className={hideSidebar ? "w-full" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
        {!hideSidebar && (
          /* ======================================================== */
          /* LEFT SIDEBAR: STRUKTUR MENU GURU PENGAJAR               */
          /* ======================================================== */
          <div className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-100 shadow-xs flex flex-col gap-1.5 select-none sticky top-20 max-h-[85vh] overflow-y-auto">
            {/* 1. Dashboard */}
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                activeMenu === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>🏠 Dashboard Guru</span>
            </button>

          {/* 2. Pengajaran Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('pengajaran')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                📚 Pengajaran
              </span>
              {openSections.pengajaran ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.pengajaran && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'subjects', label: 'Mata Pelajaran Saya', icon: BookOpen },
                  { id: 'classes', label: 'Kelas Saya', icon: Users },
                  { id: 'schedule', label: 'Jadwal Mengajar', icon: Calendar },
                  { id: 'teaching-session', label: 'Mulai Pertemuan', icon: Play, badge: 'Live' },
                  { id: 'teaching-journal', label: 'Jurnal Mengajar', icon: FileSignature },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5 opacity-70" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white font-bold rounded-md animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Materi Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('materi')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                📖 Materi
              </span>
              {openSections.materi ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.materi && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'materials', label: 'Semua Materi (Per Pertemuan)', icon: FolderOpen },
                  { id: 'material-create', label: 'Upload Materi Baru', icon: Upload },
                  { id: 'teacher-files', label: 'File & Drive Saya', icon: Database },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 4. Tugas Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('tugas')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                📝 Tugas
              </span>
              {openSections.tugas ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.tugas && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'assignments', label: 'Semua Tugas', icon: FileText },
                  { id: 'assignment-create', label: 'Buat Tugas', icon: Plus },
                  {
                    id: 'submissions',
                    label: 'Submission & Penilaian',
                    icon: CheckCircle2,
                    badge: submissions.filter((s) => s.score === null).length > 0 ? String(submissions.filter((s) => s.score === null).length) : undefined
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5 opacity-70" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.2 bg-amber-500 text-white font-bold rounded-md">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 5. Assessment Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('assessment')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                🧪 Assessment
              </span>
              {openSections.assessment ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.assessment && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'quiz', label: 'Quiz Builder', icon: HelpCircle },
                  { id: 'exams', label: 'Ujian & CBT Monitor', icon: Award },
                  { id: 'question-bank', label: 'Question Bank (Bank Soal)', icon: Database },
                  { id: 'assessments', label: 'Pengaturan Asesmen & Bobot', icon: Target },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 6. Nilai Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('nilai')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                📊 Nilai
              </span>
              {openSections.nilai ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.nilai && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'gradebook', label: 'Gradebook (Buku Nilai)', icon: FileSpreadsheet },
                  { id: 'grade-analysis', label: 'Analisis Nilai Kelas', icon: BarChart3 },
                  { id: 'remedial', label: 'Remedial & Pengayaan', icon: Flame },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 7. Presensi Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('presensi')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5" />
                🕐 Presensi
              </span>
              {openSections.presensi ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.presensi && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'attendance', label: 'Presensi Siswa', icon: UserCheck },
                  { id: 'attendance-recap', label: 'Rekap Presensi Kelas', icon: BarChart3 },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 8. Komunikasi Group */}
          <div className="mt-2">
            <button
              onClick={() => toggleSection('komunikasi')}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700"
            >
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                📢 Komunikasi
              </span>
              {openSections.komunikasi ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {openSections.komunikasi && (
              <div className="flex flex-col gap-0.5 pl-2 mt-1 border-l-2 border-slate-100">
                {[
                  { id: 'announcements', label: 'Pengumuman Kelas', icon: Bell },
                  { id: 'messages', label: 'Pesan & Tanya Jawab', icon: MessageSquare },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeMenu === item.id
                        ? 'bg-sky-50 text-sky-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-3.5 h-3.5 opacity-70" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 9. Standalone Utilities */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-0.5">
            {[
              { id: 'calendar', label: '📅 Kalender Guru', icon: CalendarDays },
              { id: 'reports', label: '📊 Laporan KBM', icon: BarChart3 },
              { id: 'teaching-progress', label: '📈 Teaching Progress', icon: TrendingUp },
              { id: 'curriculum', label: '📚 Kurikulum & Target', icon: Target },
              { id: 'teaching-notes', label: '📋 Catatan Pribadi Guru', icon: Lock },
              { id: 'class-performance', label: '👥 Komparasi Kelas', icon: Users },
              { id: 'import-export', label: '📥 Import / Export Data', icon: FileUp },
              { id: 'archive', label: '🗃️ Arsip Semester', icon: FolderArchive },
              { id: 'notifications', label: '🔔 Notifikasi', icon: Bell },
              { id: 'ai-assistant', label: '🤖 AI Teacher Assistant', icon: Bot, special: true },
              { id: 'profile', label: '👤 Profil Guru', icon: UserIcon },
              { id: 'digital-library', label: '📖 Perpustakaan Guru', icon: BookOpen },
              { id: 'security', label: '🔐 Akun & Keamanan', icon: Shield },
              { id: 'help', label: '❓ Bantuan & FAQ', icon: LifeBuoy },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as TeacherMenuId)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  activeMenu === item.id
                    ? item.special ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold shadow-sm' : 'bg-slate-900 text-white font-bold'
                    : item.special ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </span>
                {item.special && <Sparkles className="w-3 h-3 text-amber-300" />}
              </button>
            ))}
          </div>
        </div>
        )}

        {/* ======================================================== */}
        {/* RIGHT CONTENT WORKSPACE: ACTIVE FEATURE VIEW            */}
        {/* ======================================================== */}
        <div className={hideSidebar ? "w-full flex flex-col gap-6" : "lg:col-span-9 flex flex-col gap-6"}>
          {/* ACTIVE FEATURE DETAIL VIEW WORKSPACE */}
          <div className="theme-glass-card bg-white/90 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] border border-slate-200/90 min-h-[500px]">
            {/* Workspace Feature Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/90">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
                  <activeFeature.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200/60">
                      {activeFeature.category}
                    </span>
                    {activeFeature.badge && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                        {activeFeature.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl lg:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    {activeFeature.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {activeFeature.description}
                </span>
              </div>
            </div>

            {/* Feature Sub-View Renderers */}
            <div className="pt-6">
              {/* Quick Class Selector Bar (Persistent across teaching modules) */}
              <div className="mb-6 bg-slate-50/90 rounded-2xl p-3 px-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Kelas Aktif:</span>
                  <div className="flex items-center gap-1.5">
                    {['X RPL 1', 'X RPL 2', 'XI RPL 1', 'XI RPL 2'].map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedClass === cls
                            ? 'bg-sky-600 text-white shadow-xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
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
                </div>
              </div>

          {/* VIEW 1: 🏠 DASHBOARD GURU */}
          {activeMenu === 'dashboard' && (
            <div className="flex flex-col gap-6">
              {/* Today's Schedule Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-sky-600" />
                      Jadwal Mengajar Hari Ini (Senin)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">3 Sesi Tatap Muka Terjadwal</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('teaching-session')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Buka Sesi KBM
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
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
                      <button onClick={() => setActiveMenu('attendance')} className="underline hover:text-emerald-950">Isi Presensi →</button>
                    </div>
                  </div>

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
                      <button onClick={() => setActiveMenu('materials')} className="underline hover:text-slate-900">Lihat Modul →</button>
                    </div>
                  </div>

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
                      <button onClick={() => setActiveMenu('teaching-journal')} className="underline hover:text-slate-900">Draf Jurnal →</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {[
                  { label: 'Kelas Diajar', value: '4 Rombel', desc: '128 Siswa Total', icon: Users, color: 'text-blue-600 bg-blue-50' },
                  { label: 'Tugas Aktif', value: '3 Tugas', desc: '14 Belum Dinilai', icon: FileText, color: 'text-amber-600 bg-amber-50' },
                  { label: 'Presensi Hari Ini', value: '1 Pending', desc: 'Sesi Siang Belum Diisi', icon: UserCheck, color: 'text-rose-600 bg-rose-50' },
                  { label: 'Ujian Terdekat', value: 'PTS MTK', desc: '3 Hari Lagi (14 Okt)', icon: Award, color: 'text-blue-600 bg-blue-50' },
                ].map((st, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">{st.label}</span>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${st.color}`}>
                        <st.icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="text-xl font-black text-slate-900">{st.value}</div>
                    <div className="text-[11px] text-slate-500">{st.desc}</div>
                  </div>
                ))}
              </div>

              {/* Quick Action Matrix */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-3.5">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Aksi Cepat Mengajar</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Mulai Pertemuan', icon: Play, tab: 'teaching-session', color: 'hover:border-emerald-500 hover:bg-emerald-50/50' },
                    { label: 'Isi Presensi', icon: UserCheck, tab: 'attendance', color: 'hover:border-blue-500 hover:bg-blue-50/50' },
                    { label: 'Upload Materi', icon: Upload, tab: 'material-create', color: 'hover:border-blue-500 hover:bg-blue-50/50' },
                    { label: 'Buat Tugas', icon: FileText, tab: 'assignment-create', color: 'hover:border-sky-500 hover:bg-sky-50/50' },
                    { label: 'Buat Kuis', icon: HelpCircle, tab: 'quiz', color: 'hover:border-amber-500 hover:bg-amber-50/50' },
                    { label: 'Buat Ujian CBT', icon: Award, tab: 'exams', color: 'hover:border-rose-500 hover:bg-rose-50/50' },
                    { label: 'Input Nilai', icon: FileSpreadsheet, tab: 'gradebook', color: 'hover:border-teal-500 hover:bg-teal-50/50' },
                    { label: 'Siarkan Pengumuman', icon: Bell, tab: 'announcements', color: 'hover:border-sky-500 hover:bg-sky-50/50' },
                  ].map((act, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveMenu(act.tab as TeacherMenuId)}
                      className={`p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2.5 transition-all cursor-pointer text-left ${act.color}`}
                    >
                      <act.icon className="w-4 h-4 text-slate-700" />
                      <span className="text-xs font-bold text-slate-800">{act.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 6: 🧑🏫 TEACHING SESSION / MULAI PERTEMUAN */}
          {activeMenu === 'teaching-session' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-1 ${
                    sessionActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                    {sessionActive ? 'Sesi Tatap Muka KBM Aktif' : 'Tidak Ada Sesi Aktif'}
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Pertemuan Ke-{sessionMeeting}: {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Ruang Lab RPL 1</p>
                </div>

                <div className="flex items-center gap-2">
                  {sessionActive ? (
                    <button
                      onClick={async () => {
                        await finishTeacherSessionApi(101);
                        setSessionActive(false);
                        showToast('Sesi pertemuan ditandai selesai dan jurnal tersimpan.', 'success');
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Tandai Selesai
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        await startTeacherSessionApi({ class_name: selectedClass, meeting: sessionMeeting, topic: sessionTopic });
                        setSessionActive(true);
                        showToast(`Sesi Pertemuan Ke-${sessionMeeting} (${selectedClass}) berhasil dimulai!`, 'success');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                    >
                      Mulai Sesi Baru
                    </button>
                  )}
                  <button
                    onClick={() => setActiveMenu('teaching-journal')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Lengkapi Jurnal
                  </button>
                </div>
              </div>

              {/* Session Control Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-slate-600 uppercase">Materi Pokok Hari Ini:</label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />

                  <label className="text-xs font-bold text-slate-600 uppercase mt-2">Aktivitas & Metode Pembelajaran:</label>
                  <textarea
                    rows={3}
                    defaultValue="Eksplorasi koordinat puncak parabola pada canvas 2D, kalkulasi diskriminan, dan diskusi studi kasus gerak proyektil."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Checklist KBM Sesi Ini:</h4>
                    <div className="flex flex-col gap-2 text-xs text-slate-600">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Konfirmasi kehadiran siswa (Presensi terisi)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Membagikan materi slide & modul ke siswa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-sky-600" />
                        <span>Pemberian instruksi Tugas 04 Parabola Canvas</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded text-sky-600" />
                        <span>Tanya jawab & refleksi pemahaman konsep</span>
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Status Kehadiran:</span>
                    <button
                      onClick={() => setActiveMenu('attendance')}
                      className="px-3 py-1 bg-white border border-slate-200 text-sky-700 font-bold rounded-lg hover:bg-sky-50"
                    >
                      Buka Lembar Presensi ({attendanceStats.attendingCount}/{attendanceStats.total} Hadir • {attendanceStats.percent}%)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 8: 🧑🎓 PRESENSI SISWA */}
          {activeMenu === 'attendance' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Presensi Siswa — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Pertemuan Ke-{sessionMeeting} • {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkAttendanceHadir}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Set Semua Hadir
                  </button>
                  <button
                    onClick={handleSaveAttendance}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Presensi
                  </button>
                </div>
              </div>

              {/* Dynamic Live Attendance Summary Tally */}
              <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl">
                <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg text-xs">
                  Total: {attendanceStats.total} Siswa
                </span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold rounded-lg text-xs">
                  Hadir: {attendanceStats.hadir}
                </span>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-lg text-xs">
                  Terlambat: {attendanceStats.terlambat}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs">
                  Sakit: {attendanceStats.sakit}
                </span>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg text-xs">
                  Izin: {attendanceStats.izin}
                </span>
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 font-bold rounded-lg text-xs">
                  Alfa: {attendanceStats.alfa}
                </span>
                <span className="px-3 py-1 bg-emerald-600 text-white font-black rounded-lg text-xs shadow-xs ml-auto">
                  Tingkat Kehadiran: {attendanceStats.percent}%
                </span>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">No</th>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-3 text-center">Status Kehadiran</th>
                      <th className="py-3 px-4">Catatan Guru</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceList.map((stu, idx) => (
                      <tr key={stu.id} className="hover:bg-slate-50/60">
                        <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-mono font-medium text-slate-600">{stu.nis}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{stu.name}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-center gap-1">
                            {['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alfa'].map((st) => (
                              <button
                                key={st}
                                onClick={() => handleAttendanceChange(stu.id, st)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  stu.status === st
                                    ? st === 'Hadir' ? 'bg-emerald-600 text-white' :
                                      st === 'Terlambat' ? 'bg-amber-500 text-white' :
                                      st === 'Izin' ? 'bg-blue-600 text-white' :
                                      st === 'Sakit' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Catatan..."
                            value={stu.note}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttendanceList((prev) =>
                                prev.map((s) => (s.id === stu.id ? { ...s, note: val } : s))
                              );
                            }}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none"
                          />
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedStudentAcademic(stu)}
                            className="text-sky-600 font-bold hover:underline"
                          >
                            Profil Akademik
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 19: 📈 GRADEBOOK (BUKU NILAI) */}
          {activeMenu === 'gradebook' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Gradebook Sentral — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Standar KKM: {gradeCalculations.kkm}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenu('grade-analysis')}
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    Analisis Nilai
                  </button>
                  <button
                    onClick={() => setActiveMenu('import-export')}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Export Excel
                  </button>
                  <button
                    onClick={handleSaveGradebook}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Nilai
                  </button>
                </div>
              </div>

              {/* Dynamic Live Gradebook Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata Kelas</div>
                  <div className="text-xl font-black text-sky-700">{gradeCalculations.avg}</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Nilai Tertinggi</div>
                  <div className="text-xl font-black text-emerald-700">{gradeCalculations.highest}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Nilai Terendah</div>
                  <div className="text-xl font-black text-slate-700">{gradeCalculations.lowest}</div>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Siswa Tuntas</div>
                  <div className="text-xl font-black text-emerald-600">{gradeCalculations.passed} <span className="text-xs font-semibold">Siswa</span></div>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Perlu Remedial</div>
                  <div className="text-xl font-black text-rose-600">{gradeCalculations.failed} <span className="text-xs font-semibold">Siswa</span></div>
                </div>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Ketuntasan (KKM {gradeCalculations.kkm})</div>
                  <div className="text-xl font-black text-blue-700">{gradeCalculations.passRate}%</div>
                </div>
              </div>

              {/* Gradebook Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-2 text-center">Tugas (20%)</th>
                      <th className="py-3 px-2 text-center">Quiz (15%)</th>
                      <th className="py-3 px-2 text-center">UH (20%)</th>
                      <th className="py-3 px-2 text-center">Praktik (20%)</th>
                      <th className="py-3 px-2 text-center">PTS (10%)</th>
                      <th className="py-3 px-2 text-center">PAS (15%)</th>
                      <th className="py-3 px-3 text-center bg-sky-50/50 text-sky-900">Nilai Akhir</th>
                      <th className="py-3 px-3 text-center">Ketuntasan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradeCalculations.rows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500">{r.nis}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900">{r.name}</td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.tugas}
                            onChange={(e) => handleGradeCellChange(r.id, 'tugas', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.quiz}
                            onChange={(e) => handleGradeCellChange(r.id, 'quiz', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.uh}
                            onChange={(e) => handleGradeCellChange(r.id, 'uh', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.praktik}
                            onChange={(e) => handleGradeCellChange(r.id, 'praktik', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.pts}
                            onChange={(e) => handleGradeCellChange(r.id, 'pts', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={r.pas}
                            onChange={(e) => handleGradeCellChange(r.id, 'pas', e.target.value)}
                            className="w-12 text-center py-1 border border-slate-200 rounded-md font-mono"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold font-mono text-sky-700 bg-sky-50/30">
                          {r.finalScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.isPassed
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {r.isPassed ? 'Tuntas' : 'Remedial'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 20: 📊 ANALISIS NILAI KELAS */}
          {activeMenu === 'grade-analysis' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Analisis Nilai Kelas — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Standar KKM: {gradeCalculations.kkm}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenu('gradebook')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    Buka Gradebook
                  </button>
                  <button
                    onClick={() => setActiveMenu('remedial')}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Rancang Remedial
                  </button>
                </div>
              </div>

              {/* Analytics Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Rata-Rata Kelas</span>
                  <span className="text-2xl font-black text-sky-700">{gradeCalculations.avg}</span>
                  <span className="text-[11px] text-slate-500">Dari {gradeCalculations.rows.length} siswa dinilai</span>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nilai Tertinggi</span>
                  <span className="text-2xl font-black text-emerald-700">{gradeCalculations.highest}</span>
                  <span className="text-[11px] text-emerald-600 font-medium">Predikat A</span>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nilai Terendah</span>
                  <span className="text-2xl font-black text-slate-700">{gradeCalculations.lowest}</span>
                  <span className="text-[11px] text-rose-600 font-medium">Perlu Remedial</span>
                </div>
                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ketuntasan KKM</span>
                  <span className="text-2xl font-black text-blue-700">{gradeCalculations.passRate}%</span>
                  <span className="text-[11px] text-slate-500">{gradeCalculations.passed} Tuntas • {gradeCalculations.failed} Remedial</span>
                </div>
              </div>

              {/* Distribution & Diagnostics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribution Breakdown */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-sky-600" />
                    Distribusi Nilai Siswa
                  </h3>

                  <div className="flex flex-col gap-2.5 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>90.0 - 100 (Sangat Baik / A)</span>
                        <span className="font-mono text-slate-600">
                          {gradeCalculations.rows.filter(r => r.finalScore >= 90).length} Siswa (
                          {((gradeCalculations.rows.filter(r => r.finalScore >= 90).length / gradeCalculations.rows.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${(gradeCalculations.rows.filter(r => r.finalScore >= 90).length / gradeCalculations.rows.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>80.0 - 89.9 (Baik / B)</span>
                        <span className="font-mono text-slate-600">
                          {gradeCalculations.rows.filter(r => r.finalScore >= 80 && r.finalScore < 90).length} Siswa (
                          {((gradeCalculations.rows.filter(r => r.finalScore >= 80 && r.finalScore < 90).length / gradeCalculations.rows.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500"
                          style={{ width: `${(gradeCalculations.rows.filter(r => r.finalScore >= 80 && r.finalScore < 90).length / gradeCalculations.rows.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span>75.0 - 79.9 (Cukup / C - Tuntas KKM)</span>
                        <span className="font-mono text-slate-600">
                          {gradeCalculations.rows.filter(r => r.finalScore >= 75 && r.finalScore < 80).length} Siswa (
                          {((gradeCalculations.rows.filter(r => r.finalScore >= 75 && r.finalScore < 80).length / gradeCalculations.rows.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(gradeCalculations.rows.filter(r => r.finalScore >= 75 && r.finalScore < 80).length / gradeCalculations.rows.length) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1 text-rose-700">
                        <span>&lt; 75.0 (Kurang / D - Perlu Remedial)</span>
                        <span className="font-mono">
                          {gradeCalculations.rows.filter(r => r.finalScore < 75).length} Siswa (
                          {((gradeCalculations.rows.filter(r => r.finalScore < 75).length / gradeCalculations.rows.length) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500"
                          style={{ width: `${(gradeCalculations.rows.filter(r => r.finalScore < 75).length / gradeCalculations.rows.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Below KKM Gap Diagnostics */}
                <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/30 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-rose-900 flex items-center gap-2 mb-2">
                      <Flame className="w-4 h-4 text-rose-600" />
                      Diagnostik Siswa di Bawah KKM ({gradeCalculations.failed} Siswa)
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">
                      Siswa dengan skor di bawah 75.0 memerlukan intervensi remedial khusus sebelum penutupan nilai rapor semester.
                    </p>

                    <div className="flex flex-col gap-2">
                      {gradeCalculations.rows
                        .filter((r) => !r.isPassed)
                        .map((s) => {
                          const gap = +(s.finalScore - gradeCalculations.kkm).toFixed(1);
                          return (
                            <div key={s.id} className="p-3 bg-white rounded-xl border border-rose-200 flex items-center justify-between text-xs">
                              <div>
                                <div className="font-bold text-slate-900">{s.name}</div>
                                <div className="text-[11px] text-slate-500">NIS: {s.nis} • Titik Lemah: UH ({s.uh}) & Tugas ({s.tugas})</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold font-mono text-rose-700">{s.finalScore}</div>
                                <div className="text-[10px] font-bold text-rose-500">Gap: {gap} Poin</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-rose-200/60 flex justify-end">
                    <button
                      onClick={() => setActiveMenu('remedial')}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      Buka Modul Remedial Siswa →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 9: 📊 REKAP PRESENSI KELAS */}
          {activeMenu === 'attendance-recap' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Rekapitulasi Presensi KBM Seluruh Rombel</h2>
                  <p className="text-xs text-slate-500">Akumulasi Kehadiran Siswa Semester Ganjil 2026/2027 • Mata Pelajaran: Matematika Terapan</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenu('import-export')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Unduh Excel
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Cetak Laporan
                  </button>
                </div>
              </div>

              {/* Master Class Attendance Recap Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">Kelas</th>
                      <th className="py-3 px-3 text-center">Pertemuan</th>
                      <th className="py-3 px-3 text-center">Siswa</th>
                      <th className="py-3 px-3 text-center">Total Sesi</th>
                      <th className="py-3 px-3 text-center text-emerald-700">Hadir</th>
                      <th className="py-3 px-3 text-center text-amber-700">Terlambat</th>
                      <th className="py-3 px-3 text-center text-blue-700">Sakit</th>
                      <th className="py-3 px-3 text-center text-blue-700">Izin</th>
                      <th className="py-3 px-3 text-center text-rose-700">Alfa</th>
                      <th className="py-3 px-4 text-center bg-sky-50/50 text-sky-900 font-black">Tingkat Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">X RPL 1</td>
                      <td className="py-3 px-3 text-center font-mono">8</td>
                      <td className="py-3 px-3 text-center font-mono">34</td>
                      <td className="py-3 px-3 text-center font-mono">272</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">256</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700">4</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">6</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">4</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-700">2</td>
                      <td className="py-3 px-4 text-center font-black font-mono text-sky-700 bg-sky-50/30">95.6%</td>
                    </tr>
                    <tr className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900">X RPL 2</td>
                      <td className="py-3 px-3 text-center font-mono">8</td>
                      <td className="py-3 px-3 text-center font-mono">32</td>
                      <td className="py-3 px-3 text-center font-mono">256</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">240</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700">2</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">8</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">3</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-700">3</td>
                      <td className="py-3 px-4 text-center font-black font-mono text-sky-700 bg-sky-50/30">94.5%</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-black text-slate-900 border-t border-slate-300">
                      <td className="py-3 px-4">TOTAL KELAS GURU</td>
                      <td className="py-3 px-3 text-center font-mono">16</td>
                      <td className="py-3 px-3 text-center font-mono">66</td>
                      <td className="py-3 px-3 text-center font-mono">528</td>
                      <td className="py-3 px-3 text-center font-mono text-emerald-700">496</td>
                      <td className="py-3 px-3 text-center font-mono text-amber-700">6</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">14</td>
                      <td className="py-3 px-3 text-center font-mono text-blue-700">7</td>
                      <td className="py-3 px-3 text-center font-mono text-rose-700">5</td>
                      <td className="py-3 px-4 text-center font-mono text-sky-800 bg-sky-100/50">95.1%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 13 & 14: 📥 SUBMISSIONS & PENILAIAN TUGAS */}
          {activeMenu === 'submissions' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengumpulan Tugas 04: Parabola Canvas</h2>
                  <p className="text-xs text-slate-500">{selectedClass} • Deadline: 05 Okt 2026, 23:59 WIB</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200">
                    {submissions.filter((s) => s.score === null).length} Belum Dinilai
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 font-bold uppercase">
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">Waktu Submit</th>
                      <th className="py-3 px-3">Lampiran Berkas</th>
                      <th className="py-3 px-2 text-center">Skor</th>
                      <th className="py-3 px-3">Feedback</th>
                      <th className="py-3 px-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {sub.name}
                          {sub.isLate && <span className="ml-2 text-[10px] text-rose-600 font-bold">(Terlambat)</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-500">{sub.time}</td>
                        <td className="py-3 px-3">
                          <span className="text-sky-600 font-semibold hover:underline cursor-pointer flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            {sub.file}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-bold font-mono">
                          {sub.score !== null ? (
                            <span className="text-emerald-700 font-black text-sm">{sub.score}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 italic">
                          {sub.feedback || <span className="text-slate-400">Belum ada feedback</span>}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => handleOpenGrading(sub)}
                            className="px-3 py-1.5 bg-sky-50 text-sky-700 font-bold rounded-xl hover:bg-sky-100 cursor-pointer"
                          >
                            {sub.score !== null ? 'Edit Nilai' : 'Beri Nilai'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 16: 📝 EXAMS & CBT REALTIME MONITOR */}
          {activeMenu === 'exams' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Live Monitor Ujian CBT: Simulasi Pra-PTS</h2>
                  <p className="text-xs text-slate-500">Ruang Server CBT • Token Aktif: <strong className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md">{cbtToken}</strong></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerateToken}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate Token
                  </button>
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    31 Siswa Sedang Mengerjakan
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-2xl font-black text-emerald-600">12</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Selesai / Sudah Submit</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-2xl font-black text-sky-600">19</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Sedang Mengerjakan</div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-2xl font-black text-rose-500">3</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">Belum Mulai / Terputus</div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { name: 'Ahmad Fatih Pratama', progress: '35/35 Soal (Selesai)', time: '52 mnt', status: 'Submit', score: 88 },
                  { name: 'Annisa Rahmawati', progress: '35/35 Soal (Selesai)', time: '48 mnt', status: 'Submit', score: 94 },
                  { name: 'Bagas Satria Wijaya', progress: '28/35 Soal', time: '65 mnt', status: 'Mengerjakan', score: '-' },
                  { name: 'Dimas Arya Nugraha', progress: '20/35 Soal', time: '62 mnt', status: 'Mengerjakan', score: '-' },
                  { name: 'Farhan Alamsyah', progress: '0/35 Soal', time: '-', status: 'Belum Mulai', score: '-' },
                ].map((s, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{s.name}</div>
                      <div className="text-slate-500 text-[11px]">{s.progress} • Waktu: {s.time}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                        s.status === 'Submit' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'Mengerjakan' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {s.status}
                      </span>
                      <span className="font-mono font-bold text-slate-800 w-12 text-right">
                        {s.score !== '-' ? `Skor: ${s.score}` : '-'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 17: 📚 QUESTION BANK */}
          {activeMenu === 'question-bank' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Question Bank (Bank Soal Pribadi Guru)</h2>
                  <p className="text-xs text-slate-500">142 Butir Soal Terstandar untuk Ulangan, Kuis & PTS</p>
                </div>
                <button
                  onClick={() => setIsNewQuestionModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Soal Baru
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    id: 1,
                    topic: 'Fungsi Kuadrat',
                    type: 'Pilihan Ganda',
                    difficulty: 'Sedang',
                    question: 'Jika parabola f(x) = ax² + bx + c memiliki a > 0 dan D = 0, maka grafik fungsi tersebut...',
                    answer: 'B. Terbuka ke atas dan menyinggung sumbu X di satu titik',
                  },
                  {
                    id: 2,
                    topic: 'Matriks Transformasi',
                    type: 'Essay',
                    difficulty: 'Sulit',
                    question: 'Jelaskan bagaimana matriks rotasi 2D digunakan dalam rendering orientasi sprite game!',
                    answer: 'Mengalikan matriks rotasi [[cos θ, -sin θ], [sin θ, cos θ]] dengan vektor koordinat objek.',
                  },
                ].map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold text-[10px] rounded-md">{q.topic}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-md">{q.type}</span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 font-bold text-[10px] rounded-md">{q.difficulty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-slate-400 hover:text-sky-600"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button className="text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-slate-900 mt-1">{q.question}</div>
                    <div className="text-xs text-emerald-800 font-medium bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
                      Kunci / Rubrik: {q.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 21: 🎯 REMEDIAL & PENGAYAAN */}
          {(activeMenu === 'remedial' || activeMenu === 'enrichment') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Remedial & Pengayaan KBM — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Penanganan Siswa Belum Tuntas (&lt; KKM {gradeCalculations.kkm}) & Program Akselerasi</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Board Remedial */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-rose-600" />
                      Program Remedial ({gradeCalculations.rows.filter((r) => !r.isPassed).length} Siswa)
                    </h3>
                  </div>

                  {gradeCalculations.rows.filter((r) => !r.isPassed).length === 0 ? (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-xs text-emerald-800 font-semibold">
                      🎉 Seluruh siswa telah mencapai standar KKM ({gradeCalculations.kkm}). Tidak ada yang membutuhkan remedial saat ini!
                    </div>
                  ) : (
                    gradeCalculations.rows
                      .filter((r) => !r.isPassed)
                      .map((r) => (
                        <div key={r.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/40 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{r.name}</span>
                            <span className="px-2 py-0.5 bg-rose-200 text-rose-800 font-bold text-[10px] rounded-md font-mono">
                              Nilai Akhir: {r.finalScore}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Topik Perbaikan: Faktorisasi Fungsi Kuadrat & Matriks (Standar KKM: {gradeCalculations.kkm}).
                          </p>
                          <div className="text-[11px] font-semibold text-emerald-700 bg-white p-2 rounded-lg border border-slate-200">
                            Tugas Remedial: 5 Soal Mandiri + Ujian Ulang (Skor Akhir Disesuaikan KKM {gradeCalculations.kkm})
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* Board Pengayaan */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-sky-800 flex items-center gap-2">
                      <Star className="w-4 h-4 text-sky-600" />
                      Program Pengayaan ({gradeCalculations.rows.filter((r) => r.finalScore >= 85).length} Siswa)
                    </h3>
                  </div>

                  {gradeCalculations.rows.filter((r) => r.finalScore >= 85).length === 0 ? (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs text-slate-500">
                      Belum ada siswa dengan nilai istimewa (&ge; 85) untuk program pengayaan.
                    </div>
                  ) : (
                    gradeCalculations.rows
                      .filter((r) => r.finalScore >= 85)
                      .map((en) => (
                        <div key={en.id} className="p-4 rounded-2xl border border-sky-200 bg-sky-50/40 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{en.name}</span>
                            <span className="px-2 py-0.5 bg-sky-200 text-sky-800 font-bold text-[10px] rounded-md font-mono">
                              Nilai: {en.finalScore}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Proyek Tambahan: Riset Mandiri & Algoritma Tingkat Lanjut (Predikat {en.predicate})
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 29: 📋 TEACHING NOTES (PRIVATE TEACHER NOTES) */}
          {activeMenu === 'teaching-notes' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-1">
                    <Lock className="w-3.5 h-3.5" />
                    Catatan Rahasia Guru (Tidak Terlihat Siswa)
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Catatan Refleksi & Kendala KBM</h2>
                </div>
              </div>

              {/* Add Note Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tulis catatan kendala kelas atau siswa yang perlu bimbingan khusus..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>

              {/* Notes List */}
              <div className="flex flex-col gap-3">
                {teachingNotes.map((nt) => (
                  <div key={nt.id} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                      <span>{nt.class} • {nt.date}</span>
                      {nt.pinned && <span className="font-bold">📌 Disematkan</span>}
                    </div>
                    <div className="text-xs text-slate-800 font-medium leading-relaxed">{nt.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 38: 🤖 AI TEACHER ASSISTANT */}
          {activeMenu === 'ai-assistant' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Teaching Assistant
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Asisten Cerdas Guru Pengajar</h2>
                  <p className="text-xs text-slate-500">Pembuat Modul Ajar, Soal CBT Otomatis & Analitik Hasil Ujian</p>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {[
                  'Buatkan 2 butir soal pilihan ganda fungsi kuadrat beserta kunci jawaban',
                  'Susunkan outline modul ajar 2 JP tentang matriks transformasi',
                  'Analisis topik apa yang paling banyak salah dari ujian simulasi PTS',
                ].map((pre, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendAiPrompt(pre)}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold transition-all cursor-pointer border border-blue-200/60"
                  >
                    💡 {pre}
                  </button>
                ))}
              </div>

              {/* Chat Thread */}
              <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                {aiMessages.map((m, i) => (
                  <div
                    key={i}
                    className={`flex flex-col max-w-[85%] ${
                      m.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        m.sender === 'user'
                          ? 'bg-slate-900 text-white font-medium rounded-br-xs'
                          : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
                      }`}
                    >
                      <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="self-start p-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>AI sedang menyusun materi dan analisis...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik permintaan pembuatan soal, RPP, atau analisis nilai..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendAiPrompt()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={() => handleSendAiPrompt()}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-bold text-xs rounded-xl shadow-md hover:opacity-90 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Kirim
                </button>
              </div>
            </div>
          )}

          {/* VIEW 23: 📢 PENGUMUMAN KELAS */}
          {activeMenu === 'announcements' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengumuman Kelas — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Siarkan instruksi KBM dan jadwal penting ke siswa</p>
                </div>
              </div>

              {/* Create Announcement */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="text-xs font-bold text-slate-700 uppercase">Buat Pengumuman Baru:</div>
                <input
                  type="text"
                  placeholder="Judul Pengumuman (misal: Praktikum di Lab Komputer)..."
                  value={newAnnounceTitle}
                  onChange={(e) => setNewAnnounceTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
                <textarea
                  rows={2}
                  placeholder="Isi pengumuman lengkap..."
                  value={newAnnounceContent}
                  onChange={(e) => setNewAnnounceContent(e.target.value)}
                  className="p-3 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleAddAnnouncement}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Siarkan Pengumuman
                  </button>
                </div>
              </div>

              {/* Announcement List */}
              <div className="flex flex-col gap-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                      <span className="text-[11px] font-semibold text-slate-400">{ann.date}</span>
                    </div>
                    <div className="text-xs text-slate-600 leading-relaxed">{ann.content}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: 📚 MATA PELAJARAN YANG DIAJAR */}
          {activeMenu === 'subjects' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Mata Pelajaran yang Diampu</h2>
                  <p className="text-xs text-slate-500">Tahun Ajaran 2026/2027 Ganjil • SK Beban Mengajar Terverifikasi</p>
                </div>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  2 Mata Pelajaran Aktif (24 JTM)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 1,
                    code: 'MTK-X',
                    name: 'Matematika Terapan',
                    category: 'Muatan Kejuruan Umum',
                    classes: ['X RPL 1 (34 Siswa)', 'X RPL 2 (32 Siswa)'],
                    totalStudents: 66,
                    materials: 12,
                    tasks: 6,
                    quizzes: 3,
                    exams: 1,
                    attendance: '95.1%',
                    completion: '88.5%',
                  },
                  {
                    id: 2,
                    code: 'STAT-XI',
                    name: 'Statistika Lanjutan',
                    category: 'Peminatan Algoritma Data',
                    classes: ['XI RPL 1 (30 Siswa)', 'XI RPL 2 (32 Siswa)'],
                    totalStudents: 62,
                    materials: 9,
                    tasks: 4,
                    quizzes: 2,
                    exams: 1,
                    attendance: '94.8%',
                    completion: '82.0%',
                  },
                ].map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-sky-100 text-sky-700 font-mono font-bold text-xs rounded-lg">{s.code}</span>
                      <span className="text-[11px] font-semibold text-slate-500">{s.category}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">{s.name}</h3>
                      <p className="text-xs text-slate-600 mt-1 font-medium">Kelas: {s.classes.join(', ')} • {s.totalStudents} Siswa Total</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Materi</div>
                        <div className="text-sm font-black text-slate-800">{s.materials} Modul</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Asesmen</div>
                        <div className="text-sm font-black text-slate-800">{s.tasks + s.quizzes + s.exams} Item</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Kehadiran</div>
                        <div className="text-sm font-black text-emerald-600">{s.attendance}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button onClick={() => setActiveMenu('materials')} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100">Materi</button>
                      <button onClick={() => setActiveMenu('gradebook')} className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700">Gradebook</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 4: 🏫 KELAS YANG DIAJAR */}
          {activeMenu === 'classes' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Kelas yang Anda Ajar</h2>
                  <p className="text-xs text-slate-500">Guru hanya melihat kelas yang diberikan secara resmi dalam KBM</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'X RPL 1', homeroom: 'Siti Aminah, M.Pd', count: 34, avg: 83.0, attendance: '95.6%', room: 'Lab Komputer RPL 1' },
                  { name: 'X RPL 2', homeroom: 'Hendra Gunawan, M.T', count: 32, avg: 81.8, attendance: '94.5%', room: 'Lab Komputer RPL 2' },
                  { name: 'XI RPL 1', homeroom: 'Drs. Bambang Sudiro', count: 30, avg: 84.5, attendance: '94.8%', room: 'R. Teori 204' },
                  { name: 'XI RPL 2', homeroom: 'Ratna Dewi, S.Pd', count: 32, avg: 82.2, attendance: '95.0%', room: 'R. Teori 205' },
                ].map((c, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900">{c.name}</h3>
                        <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 font-bold text-xs rounded-full">{c.count} Siswa</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Wali Kelas: <span className="font-semibold text-slate-700">{c.homeroom}</span></div>
                      <div className="text-xs text-slate-500">Ruangan KBM: <span className="font-semibold text-slate-700">{c.room}</span></div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center pt-2 border-t border-slate-200/80">
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Rata-rata Nilai</div>
                        <div className="text-base font-black text-sky-600">{c.avg}</div>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Kehadiran KBM</div>
                        <div className="text-base font-black text-emerald-600">{c.attendance}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <button
                        onClick={() => { setSelectedClass(c.name); setActiveMenu('attendance'); }}
                        className="text-xs font-bold text-sky-600 hover:underline"
                      >
                        Buka Presensi →
                      </button>
                      <button
                        onClick={() => { setSelectedClass(c.name); setActiveMenu('gradebook'); }}
                        className="text-xs font-bold text-slate-700 hover:underline"
                      >
                        Buka Gradebook →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 5: 📅 JADWAL MENGAJAR */}
          {activeMenu === 'schedule' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Jadwal Mengajar Mingguan</h2>
                  <p className="text-xs text-slate-500">Jadwal resmi terintegrasi dengan kalender akademik sekolah</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
                  <Check className="w-3.5 h-3.5" />
                  0 Bentrok Waktu / Ruang
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                {[
                  { day: 'Senin', items: [{ time: '07:30 - 09:00', class: 'X RPL 1', subject: 'Matematika Terapan', room: 'Lab RPL 1' }, { time: '09:15 - 10:45', class: 'X RPL 2', subject: 'Matematika Terapan', room: 'Lab RPL 2' }, { time: '11:00 - 12:30', class: 'XI RPL 1', subject: 'Statistika Lanjutan', room: 'R. 204' }] },
                  { day: 'Selasa', items: [{ time: '08:00 - 09:30', class: 'XI RPL 2', subject: 'Statistika Lanjutan', room: 'R. 205' }] },
                  { day: 'Rabu', items: [{ time: '07:30 - 09:00', class: 'X RPL 1', subject: 'Praktik Komputasi', room: 'Lab Komputer A' }, { time: '09:15 - 10:45', class: 'X RPL 2', subject: 'Praktik Komputasi', room: 'Lab Komputer B' }] },
                  { day: 'Kamis', items: [{ time: '10:00 - 11:30', class: 'XI RPL 1', subject: 'Statistika Lanjutan', room: 'R. 204' }] },
                  { day: 'Jumat', items: [{ time: '07:30 - 09:00', class: 'XI RPL 2', subject: 'Statistika Lanjutan', room: 'R. 205' }] },
                ].map((d, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2">
                    <div className="font-black text-slate-900 pb-1.5 border-b border-slate-200">{d.day}</div>
                    <div className="flex flex-col gap-2">
                      {d.items.map((it, idx) => (
                        <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/70 flex flex-col gap-1 shadow-2xs">
                          <span className="font-mono text-[10px] text-sky-700 font-bold">{it.time}</span>
                          <span className="font-black text-slate-900">{it.class}</span>
                          <span className="text-[11px] text-slate-600">{it.subject}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">{it.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 7: 📝 TEACHING JOURNAL / JURNAL MENGAJAR */}
          {activeMenu === 'teaching-journal' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Jurnal Mengajar KBM</h2>
                  <p className="text-xs text-slate-500">Rekam jejak aktivitas, materi pembelajaran, dan refleksi KBM per pertemuan</p>
                </div>
                <button
                  onClick={() => setIsNewJournalModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Isi Jurnal KBM
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {journalsList.map((j) => (
                  <div key={j.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{j.date}</span>
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold rounded-md">{j.class}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-md">{j.meeting}</span>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">
                        ✓ {j.status}
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm mt-1">{j.topic}</div>
                    <div className="text-slate-600 leading-relaxed"><strong>Tujuan:</strong> {j.objective}</div>
                    <div className="text-slate-600 leading-relaxed"><strong>Aktivitas:</strong> {j.activity}</div>
                    <div className="text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                      <strong>Catatan & Refleksi:</strong> {j.notes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 10 & 11: 📖 MATERI PEMBELAJARAN PER PERTEMUAN */}
          {activeMenu === 'materials' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Materi Pembelajaran Per Pertemuan</h2>
                  <p className="text-xs text-slate-500">Tersusun rapi dari Pertemuan 01 s/d Pertemuan 08 • {selectedClass}</p>
                </div>
                <button
                  onClick={() => setActiveMenu('material-create')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload Materi Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materialsList.map((m) => (
                  <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold rounded-md text-[10px]">{m.meeting}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{m.date}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-sm mt-1.5">{m.title}</div>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 pt-2 border-t border-slate-200/80">
                      <span>{m.format} • {m.size}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => showToast(`Mengunduh berkas: ${m.title}`, 'info')}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Unduh
                        </button>
                        <button
                          onClick={() => handleDeleteMaterial(m.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus Materi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 15: 🧪 QUIZ BUILDER */}
          {activeMenu === 'quiz' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Quiz Builder & Kuis Harian</h2>
                  <p className="text-xs text-slate-500">Pilihan Ganda, Essay, True/False dengan pengacakan soal otomatis</p>
                </div>
                <button
                  onClick={() => setIsNewQuizModalOpen(true)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Kuis Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzesList.map((q) => (
                  <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${q.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>{q.status}</span>
                        <span className="font-mono text-slate-500">{q.duration}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm">{q.title}</h3>
                      <p className="text-slate-500 mt-1">{q.questions} Soal • Maks {q.attempts} Kali Percobaan</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-600">Rata-rata Nilai Siswa:</span>
                      <span className="font-mono font-black text-sky-600 text-base">{q.avg || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 18: 📊 ASSESSMENT MANAGEMENT & SETUP BOBOT */}
          {activeMenu === 'assessments' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengaturan Asesmen & Bobot Nilai</h2>
                  <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Total Bobot Wajib 100%</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 font-bold text-xs rounded-xl border ${
                    (assessmentWeights.tugas + assessmentWeights.quiz + assessmentWeights.uh + assessmentWeights.praktik + assessmentWeights.pts + assessmentWeights.pas) === 100
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    Total: {assessmentWeights.tugas + assessmentWeights.quiz + assessmentWeights.uh + assessmentWeights.praktik + assessmentWeights.pts + assessmentWeights.pas}%
                    {(assessmentWeights.tugas + assessmentWeights.quiz + assessmentWeights.uh + assessmentWeights.praktik + assessmentWeights.pts + assessmentWeights.pas) === 100 ? ' (Valid)' : ' (Harus 100%)'}
                  </span>
                  <button
                    onClick={handleSaveAssessmentWeights}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Simpan Bobot
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'tugas', label: 'Tugas Mandiri & Terstruktur', desc: 'Latihan mandiri & tugas LMS', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                  { key: 'quiz', label: 'Kuis Harian / Kilat', desc: 'Pemahaman materi per bab', color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
                  { key: 'uh', label: 'Ulangan Harian (Formatif)', desc: 'Evaluasi akhir capaian bab', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                  { key: 'praktik', label: 'Ujian Praktik / Unjuk Kerja', desc: 'Praktikum lab & pembuatan proyek', color: 'border-teal-200 bg-teal-50/40 text-teal-700' },
                  { key: 'pts', label: 'Penilaian Tengah Semester (PTS)', desc: 'Asesmen tengah semester terkoordinasi', color: 'border-sky-200 bg-sky-50/40 text-sky-700' },
                  { key: 'pas', label: 'Penilaian Akhir Semester (PAS)', desc: 'Asesmen sumatif akhir semester', color: 'border-rose-200 bg-rose-50/40 text-rose-700' },
                ].map((as) => (
                  <div key={as.key} className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${as.color}`}>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider">{as.label}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{as.desc}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                      <span className="text-xs font-semibold text-slate-600">Bobot Persentase:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={assessmentWeights[as.key as keyof typeof assessmentWeights]}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setAssessmentWeights((prev) => ({ ...prev, [as.key]: val }));
                          }}
                          className="w-16 px-2 py-1 bg-white rounded-lg border border-slate-200 text-sm font-black font-mono text-right focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <span className="font-bold text-slate-700 text-xs">%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Kriteria Ketercapaian Tujuan Pembelajaran (KKM / KKTP)</div>
                  <div className="text-slate-500 text-[11px]">Batas ambang kelulusan minimum mata pelajaran Matematika Terapan</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600">KKM Minimum:</span>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={assessmentWeights.kkm}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 75;
                      setAssessmentWeights((prev) => ({ ...prev, kkm: val }));
                    }}
                    className="w-16 px-2 py-1 bg-white rounded-lg border border-slate-200 text-sm font-black font-mono text-center focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-xs text-slate-400">Poin</span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 27: 📈 TEACHING PROGRESS */}
          {activeMenu === 'teaching-progress' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Teaching Progress — {selectedClass}</h2>
                  <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Capaian Target KBM Semester Ganjil</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Capaian Keseluruhan:</div>
                  <div className="text-2xl font-black text-sky-600">60.4%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                {[
                  { label: 'Tatap Muka / Pertemuan', done: 8, total: 16, pct: 50.0, color: 'bg-blue-600' },
                  { label: 'Materi / Modul Selesai', done: 7, total: 12, pct: 58.3, color: 'bg-emerald-600' },
                  { label: 'Asesmen & Ulangan', done: 4, total: 6, pct: 66.7, color: 'bg-blue-600' },
                  { label: 'Tugas Terlaksana', done: 4, total: 6, pct: 66.7, color: 'bg-amber-600' },
                ].map((p, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{p.label}</span>
                      <span className="font-mono">{p.pct}%</span>
                    </div>
                    <div className="text-[11px] text-slate-500">{p.done} dari {p.total} tuntas</div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div className={`h-full ${p.color}`} style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 30: 👥 KOMPARASI KELAS */}
          {activeMenu === 'class-performance' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Komparasi Kinerja Belajar Antar Kelas</h2>
                  <p className="text-xs text-slate-500">Perbandingan objektif capaian akademik dan presensi kelas yang diajar</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { class: 'X RPL 1', avg: 83.0, attendance: '95.6%', mastery: '80.0%', submissions: '94.0%', readiness: 'Tinggi' },
                  { class: 'X RPL 2', avg: 81.8, attendance: '94.5%', mastery: '76.0%', submissions: '91.5%', readiness: 'Sedang - Siap' },
                ].map((cp, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-black text-slate-900">{cp.class}</h3>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-full text-[10px]">Kesiapan PTS: {cp.readiness}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Rata-rata Nilai</div>
                        <div className="text-xl font-black text-sky-600">{cp.avg}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Kehadiran KBM</div>
                        <div className="text-xl font-black text-emerald-600">{cp.attendance}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Ketuntasan KKM</div>
                        <div className="text-xl font-black text-blue-600">{cp.mastery}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Pengumpulan Tugas</div>
                        <div className="text-xl font-black text-amber-600">{cp.submissions}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 25: 📅 KALENDER GURU */}
          {activeMenu === 'calendar' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Kalender Akademik Guru</h2>
                  <p className="text-xs text-slate-500">Agenda KBM, batas akhir tugas, jadwal kuis, dan ujian CBT</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { date: '05 Okt 2026', title: 'Deadline Tugas 04: Parabola Canvas (X RPL 1)', type: 'Deadline Tugas', color: 'bg-amber-100 text-amber-800' },
                  { date: '07 Okt 2026', title: 'Praktikum Komputasi di Lab RPL 1 (07:30 - 09:00)', type: 'KBM Lab', color: 'bg-blue-100 text-blue-800' },
                  { date: '08 Okt 2026', title: 'Sesi Pembahasan Remedial Matriks (Ruang 204)', type: 'Remedial', color: 'bg-rose-100 text-rose-800' },
                  { date: '14 Okt 2026', title: 'PTS Semester Ganjil Matematika Terapan (CBT Server)', type: 'Ujian CBT', color: 'bg-blue-100 text-blue-800' },
                  { date: '20 Okt 2026', title: 'Rapat Evaluasi KBM Dewan Guru', type: 'Rapat Sekolah', color: 'bg-slate-200 text-slate-800' },
                ].map((ev, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-slate-900 w-24">{ev.date}</span>
                      <span className="font-semibold text-slate-800">{ev.title}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${ev.color}`}>{ev.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2: 👤 PROFIL GURU */}
          {activeMenu === 'profile' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Profil & Data Mengajar Guru</h2>
                  <p className="text-xs text-slate-500">Data resmi pendidik terverifikasi sekolah</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  Status: Pendidik Aktif (PNS)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <h3 className="font-black text-slate-900 text-sm">Data Pribadi Pendidik</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nama Lengkap:</span>
                      <span className="font-bold text-slate-800">{currentUser?.name || 'Budi Santoso, M.Pd'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NIP:</span>
                      <span className="font-mono font-bold text-slate-800">198503152010011012</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">NUPTK:</span>
                      <span className="font-mono font-bold text-slate-800">4539763665200003</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pendidikan:</span>
                      <span className="font-semibold text-slate-800">S2 Pendidikan Matematika - UNJ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status Kepegawaian:</span>
                      <span className="font-semibold text-slate-800">PNS Pembina Tk. I (Gol. IV/a)</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                  <h3 className="font-black text-slate-900 text-sm">Tugas Mengajar</h3>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Mata Pelajaran:</span>
                      <span className="font-bold text-sky-700">Matematika Terapan & Statistika</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beban Mengajar:</span>
                      <span className="font-bold text-slate-800">24 Jam Tatap Muka (JTM)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Kelas yang Diampu:</span>
                      <span className="font-semibold text-slate-800">X RPL 1, X RPL 2, XI RPL 1, XI RPL 2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tahun Ajaran:</span>
                      <span className="font-semibold text-slate-800">2026/2027 (Semester Ganjil)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RBAC notice */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <Shield className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Hak Akses Guru Pengajar:</strong> Anda memiliki kewenangan penuh pada kelas dan mata pelajaran yang diampu. Data pribadi guru yang terkunci (NIP, NUPTK, beban mengajar resmi) dikelola langsung oleh Staf Tata Usaha & Administrator Sekolah.
                </span>
              </div>
            </div>
          )}

          {/* VIEW: 📤 UPLOAD MATERI BARU (material-create) */}
          {activeMenu === 'material-create' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Upload & Terbitkan Materi Pembelajaran</h2>
                  <p className="text-xs text-slate-500">Materi yang diunggah akan langsung tersedia di akun seluruh siswa di kelas target</p>
                </div>
                <button
                  onClick={() => setActiveMenu('materials')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar Materi
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Judul Materi Pembelajaran *</label>
                    <input
                      type="text"
                      value={newMaterialForm.title}
                      onChange={(e) => setNewMaterialForm({ ...newMaterialForm, title: e.target.value })}
                      placeholder="Contoh: Modul 08: Review & Pembahasan Latihan Pra-PTS"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Pertemuan Ke- *</label>
                      <select
                        value={newMaterialForm.meeting}
                        onChange={(e) => setNewMaterialForm({ ...newMaterialForm, meeting: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        {Array.from({ length: 16 }).map((_, i) => (
                          <option key={i} value={`Pertemuan ${String(i + 1).padStart(2, '0')}`}>
                            Pertemuan {String(i + 1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Target Kelas *</label>
                      <select
                        value={newMaterialForm.className}
                        onChange={(e) => setNewMaterialForm({ ...newMaterialForm, className: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        <option value="X RPL 1">X RPL 1</option>
                        <option value="X RPL 2">X RPL 2</option>
                        <option value="X RPL 1, X RPL 2">Semua Kelas Binaan (X RPL 1 & 2)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Format Berkas</label>
                      <select
                        value={newMaterialForm.format}
                        onChange={(e) => setNewMaterialForm({ ...newMaterialForm, format: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        <option value="PDF">Dokumen PDF (.pdf)</option>
                        <option value="PPTX">Slide Presentasi (.pptx)</option>
                        <option value="DOCX">Dokumen Word (.docx)</option>
                        <option value="VIDEO">Video Materi / Link Streaming</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Visibilitas Materi</label>
                      <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-600 flex items-center justify-between">
                        <span>Publikasikan Langsung ke Siswa</span>
                        <Check className="w-4 h-4 text-emerald-600 font-bold" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Deskripsi & Petunjuk Pembelajaran Siswa</label>
                    <textarea
                      rows={3}
                      value={newMaterialForm.description}
                      onChange={(e) => setNewMaterialForm({ ...newMaterialForm, description: e.target.value })}
                      placeholder="Tuliskan petunjuk belajar atau rangkuman singkat mengenai materi ini..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/40 text-center flex flex-col items-center justify-center gap-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-xs">Pilih atau Seret Berkas Materi ke Sini</span>
                    <p className="text-[11px] text-slate-500">Mendukung PDF, PPTX, DOCX, ZIP hingga 50 MB</p>
                    <button
                      onClick={() => showToast('Berkas terpilih: Modul_Pembelajaran_Terbaru.pdf', 'info')}
                      className="mt-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Pilih Berkas Lokal
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex flex-col gap-2">
                    <span className="font-bold text-slate-900">Tips Pengunggahan:</span>
                    <ul className="list-disc list-inside text-[11px] flex flex-col gap-1 text-slate-500">
                      <li>Pastikan dokumen mudah dibaca di layar HP siswa.</li>
                      <li>Sertakan contoh soal latihan terapan di halaman akhir.</li>
                      <li>Gunakan nama file yang deskriptif dan mencantumkan pertemuan.</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveMenu('materials')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateMaterial}
                      className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Terbitkan Materi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 📁 FILE & DRIVE GURU (teacher-files) */}
          {activeMenu === 'teacher-files' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Drive Cloud & File Pendidik</h2>
                  <p className="text-xs text-slate-500">Penyimpanan terpusat dokumen modul, kisi-kisi, LKPD, dan administrasi mengajar</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsNewDriveFileModalOpen(true)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Unggah File Baru
                  </button>
                </div>
              </div>

              {/* Storage Quota Card */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">Kapasitas Penyimpanan Drive Guru</div>
                    <div className="text-[11px] text-slate-500">14.8 GB terpakai dari kuota 50.0 GB resmi sekolah (29.6%)</div>
                  </div>
                </div>
                <div className="w-full sm:w-48 bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-sky-600 h-full rounded-full" style={{ width: '29.6%' }} />
                </div>
              </div>

              {/* Folder Selector Tabs */}
              <div className="flex flex-wrap gap-2">
                {['Materi & Modul', 'Bank Soal & Kisi-Kisi', 'Lembar Kerja Tugas (LKS)', 'Referensi & E-Book'].map((folder) => (
                  <button
                    key={folder}
                    onClick={() => setSelectedDriveFolder(folder)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      selectedDriveFolder === folder
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    {folder}
                  </button>
                ))}
              </div>

              {/* File Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {driveFiles
                  .filter((f) => f.folder === selectedDriveFolder)
                  .map((file) => (
                    <div key={file.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs hover:border-sky-300 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 truncate" title={file.name}>{file.name}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{file.size} • Diperbarui {file.updated}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md text-[10px] font-semibold">{file.folder}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => showToast(`Mengunduh: ${file.name}`, 'info')}
                            className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg cursor-pointer"
                            title="Unduh File"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriveFile(file.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Hapus File"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW: 📝 SEMUA TUGAS (assignments) */}
          {activeMenu === 'assignments' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Manajemen Tugas & Proyek Kelas</h2>
                  <p className="text-xs text-slate-500">Pantau pengumpulan, deadline, dan status penilaian tugas siswa • {selectedClass}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenu('submissions')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Buka Penilaian ({submissions.filter((s) => s.status.includes('Belum')).length} Perlu Dinilai)
                  </button>
                  <button
                    onClick={() => setActiveMenu('assignment-create')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Buat Tugas Baru
                  </button>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Total Tugas</span>
                  <span className="text-2xl font-black text-blue-700">{assignmentsList.length}</span>
                  <span className="text-[10px] text-slate-400">Aktif & Selesai</span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Tingkat Pengumpulan</span>
                  <span className="text-2xl font-black text-emerald-700">92.4%</span>
                  <span className="text-[10px] text-slate-400">Rata-rata kelas</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Belum Dikoreksi</span>
                  <span className="text-2xl font-black text-amber-700">3 Siswa</span>
                  <span className="text-[10px] text-slate-400">Menunggu penilaian</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Rata-rata Nilai</span>
                  <span className="text-2xl font-black text-blue-700">86.8</span>
                  <span className="text-[10px] text-slate-400">Di atas KKM (75)</span>
                </div>
              </div>

              {/* Assignment List */}
              <div className="flex flex-col gap-3">
                {assignmentsList.map((a) => (
                  <div key={a.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col gap-3 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-sky-100 text-sky-700 font-bold rounded-md text-[10px]">{a.className}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${a.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                          {a.status === 'Published' ? 'Aktif' : 'Ditutup'}
                        </span>
                        <span className="text-slate-400 font-mono text-[11px]">Batas Waktu: {a.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveMenu('submissions')}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Periksa Hasil
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(a.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-black text-slate-900 text-sm">{a.title}</h3>
                      <p className="text-slate-500 mt-0.5">Mata Pelajaran: {a.subject} • Bobot Maks: {a.maxScore} Poin</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-slate-600">
                      <div className="flex items-center gap-4">
                        <span>📥 Mengumpulkan: <strong>{a.submittedCount} / {a.totalStudents} Siswa</strong></span>
                        <span>✓ Sudah Dinilai: <strong>{a.gradedCount} Siswa</strong></span>
                        {a.lateCount > 0 && <span className="text-amber-700 font-bold">⚠️ Terlambat: {a.lateCount} Siswa</span>}
                      </div>
                      <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.round((a.submittedCount / a.totalStudents) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 📝 BUAT TUGAS BARU (assignment-create) */}
          {activeMenu === 'assignment-create' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Buat & Terbitkan Tugas Baru</h2>
                  <p className="text-xs text-slate-500">Tentukan instruksi pengerjaan, batas waktu penyerahan, dan rubrik penilaian tugas</p>
                </div>
                <button
                  onClick={() => setActiveMenu('assignments')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Kembali ke Daftar Tugas
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Judul Tugas / Proyek *</label>
                    <input
                      type="text"
                      value={newAssignmentForm.title}
                      onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, title: e.target.value })}
                      placeholder="Contoh: Tugas 05: Simulasi Pergerakan Proyektil Berbasis Algoritma Kuadrat"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Target Kelas *</label>
                      <select
                        value={newAssignmentForm.className}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, className: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        <option value="X RPL 1">X RPL 1</option>
                        <option value="X RPL 2">X RPL 2</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Batas Waktu Pengumpulan *</label>
                      <input
                        type="datetime-local"
                        value={newAssignmentForm.deadline}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, deadline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Nilai Maksimal</label>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={newAssignmentForm.maxScore}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, maxScore: parseInt(e.target.value) || 100 })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase">Format Berkas Pengumpulan</label>
                      <select
                        value={newAssignmentForm.format}
                        onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, format: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                      >
                        <option value="PDF / File Dokumen">PDF / Berkas Dokumen</option>
                        <option value="ZIP / Source Code">ZIP / Arsip Project Source Code</option>
                        <option value="Gambar / Foto Lembar Kerja">Foto Lembar Kerja Fisik</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Petunjuk Pengerjaan & Rubrik Penilaian</label>
                    <textarea
                      rows={4}
                      value={newAssignmentForm.instructions}
                      onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, instructions: e.target.value })}
                      placeholder="Tuliskan instruksi langkah demi langkah yang harus dipenuhi siswa..."
                      className="w-full p-3.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-3 text-xs">
                    <span className="font-black text-sky-950">Ringkasan Tugas:</span>
                    <div className="flex justify-between text-slate-600">
                      <span>Mata Pelajaran:</span>
                      <strong className="text-slate-900">Matematika Terapan</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Target Kelas:</span>
                      <strong className="text-sky-700">{newAssignmentForm.className}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Bobot Maksimal:</span>
                      <strong className="text-slate-900">{newAssignmentForm.maxScore} Poin</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Sinkronisasi Otomatis:</span>
                      <strong className="text-emerald-700">Terhubung ke Gradebook</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setActiveMenu('assignments')}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer text-center"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateAssignment}
                      className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Terbitkan Tugas
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ⭐ PROGRAM PENGAYAAN (enrichment) */}
          {activeMenu === 'enrichment' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Program Pengayaan Akademik Siswa</h2>
                  <p className="text-xs text-slate-500">Pendalaman materi tingkat lanjut bagi siswa dengan capaian di atas KKM (KKM: 75)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveMenu('remedial')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    Buka Sesi Remedial
                  </button>
                  <button
                    onClick={() => showToast('Modul pengayaan lanjut berhasil ditugaskan ke siswa!', 'success')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tugaskan Materi Pengayaan Baru
                  </button>
                </div>
              </div>

              {/* Enrichment stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Siswa Memenuhi Kriteria</span>
                  <span className="text-2xl font-black text-emerald-700">6 Siswa</span>
                  <span className="text-[10px] text-slate-400">Nilai Akhir ≥ 90</span>
                </div>
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Modul Pengayaan Aktif</span>
                  <span className="text-2xl font-black text-sky-700">2 Modul</span>
                  <span className="text-[10px] text-slate-400">Algoritma Matriks Grafika & Bezier Curve</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Rekomendasi Lomba / Olimpiade</span>
                  <span className="text-2xl font-black text-amber-700">2 Siswa</span>
                  <span className="text-[10px] text-slate-400">Kandidat O2SN & LKS Komputasi</span>
                </div>
              </div>

              {/* Students table */}
              <div className="flex flex-col gap-3">
                <h3 className="font-black text-slate-900 text-sm">Daftar Siswa Peserta Program Pengayaan ({selectedClass})</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3">NIS</th>
                        <th className="px-4 py-3">Nilai Rata-Rata</th>
                        <th className="px-4 py-3">Modul Pengayaan yang Diberikan</th>
                        <th className="px-4 py-3">Status Pengerjaan</th>
                        <th className="px-4 py-3 text-right">Aksi Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Annisa Rahmawati', nis: '240102', score: 96.0, module: 'Komputasi Grafika Lanjut & Geometri Bezier', status: 'Sedang Dikerjakan' },
                        { name: 'Ahmad Fatih Pratama', nis: '240101', score: 94.5, module: 'Optimasi Algoritma Matriks Sparse', status: 'Selesai & Dinilai (100)' },
                        { name: 'Gita Gutawa', nis: '240107', score: 91.0, module: 'Kalkulus Diferensial untuk Analisis Kecepatan', status: 'Sedang Dikerjakan' },
                      ].map((st, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 font-bold text-slate-900">{st.name}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{st.nis}</td>
                          <td className="px-4 py-3 font-mono font-bold text-emerald-700">{st.score}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{st.module}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${st.status.includes('Selesai') ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                              {st.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => showToast(`Catatan apresiasi diberikan kepada ${st.name}!`, 'success')}
                              className="px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-lg cursor-pointer"
                            >
                              Beri Feedback
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 💬 PESAN & FORUM KELAS (messages) */}
          {activeMenu === 'messages' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pesan & Forum Tanya Jawab Kelas</h2>
                  <p className="text-xs text-slate-500">Komunikasi akademik dua arah antara pengajar dan peserta didik</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  Online • Siap Menjawab
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Channel List */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kanal Diskusi & Konsultasi</span>
                  {[
                    { id: 'c1' as const, title: 'Forum KBM: X RPL 1', subtitle: '34 Siswa • Aktif', isGroup: true },
                    { id: 'c2' as const, title: 'Forum KBM: X RPL 2', subtitle: '32 Siswa • Aktif', isGroup: true },
                    { id: 's1' as const, title: 'Ahmad Fatih Pratama', subtitle: 'Ketua Kelas X RPL 1', isGroup: false },
                    { id: 's2' as const, title: 'Bagas Satria Wijaya', subtitle: 'Konsultasi Tugas Remedial', isGroup: false },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChatChannel(ch.id)}
                      className={`p-3.5 rounded-2xl text-left transition-all flex items-center gap-3 cursor-pointer ${
                        activeChatChannel === ch.id
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/60'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeChatChannel === ch.id ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700'}`}>
                        {ch.isGroup ? <Users className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs truncate">{ch.title}</div>
                        <div className={`text-[10px] truncate ${activeChatChannel === ch.id ? 'text-white/80' : 'text-slate-400'}`}>{ch.subtitle}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Message Feed */}
                <div className="md:col-span-2 flex flex-col justify-between border border-slate-200 rounded-2xl bg-slate-50/30 overflow-hidden h-[460px]">
                  <div className="p-3.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {activeChatChannel === 'c1' && '📢 Forum KBM Kelas X RPL 1'}
                      {activeChatChannel === 'c2' && '📢 Forum KBM Kelas X RPL 2'}
                      {activeChatChannel === 's1' && '💬 Pesan Pribadi: Ahmad Fatih (KM)'}
                      {activeChatChannel === 's2' && '💬 Pesan Pribadi: Bagas Satria'}
                    </span>
                    <span className="text-[10px] text-slate-400">Sinkronisasi Realtime</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                    {(chatMessages[activeChatChannel] || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[80%] ${msg.role === 'guru' ? 'self-end items-end' : 'self-start items-start'}`}
                      >
                        <div className="text-[10px] text-slate-400 font-semibold mb-1">
                          {msg.sender} • {msg.time}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'guru'
                              ? 'bg-sky-600 text-white rounded-br-none shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Tulis pesan atau instruksi untuk siswa..."
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Kirim
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 📄 LAPORAN KBM (reports) */}
          {activeMenu === 'reports' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Laporan Akademik & Administrasi KBM</h2>
                  <p className="text-xs text-slate-500">Cetak dan unduh laporan resmi untuk supervisi kepala sekolah dan arsip pengajar</p>
                </div>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded-xl border border-sky-200">
                  Semester Ganjil 2026/2027
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Laporan Jurnal Mengajar Semester', desc: 'Rekapitulasi materi, pertemuan 01 - 08, dan catatan refleksi KBM', format: 'PDF Dokumen', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                  { title: 'Buku Nilai & Ketercapaian TP (Gradebook)', desc: 'Daftar nilai tugas, kuis, ulangan harian, PTS, dan predikat siswa', format: 'Excel (XLSX)', color: 'border-emerald-200 bg-emerald-50/40 text-emerald-700' },
                  { title: 'Rekapitulasi Presensi Siswa', desc: 'Persentase kehadiran per siswa, sakit, izin, dan alpa untuk wali kelas', format: 'Excel (XLSX)', color: 'border-blue-200 bg-blue-50/40 text-blue-700' },
                  { title: 'Laporan Evaluasi Remedial & Pengayaan', desc: 'Dokumentasi tindak lanjut bagi siswa di bawah dan di atas KKM', format: 'PDF Dokumen', color: 'border-amber-200 bg-amber-50/40 text-amber-700' },
                ].map((rep, i) => (
                  <div key={i} className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${rep.color}`}>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-white font-bold text-[10px] shadow-2xs">{rep.format}</span>
                        <span className="text-[11px] font-mono opacity-70">Terverifikasi</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm">{rep.title}</h3>
                      <p className="text-slate-600 text-xs mt-1">{rep.desc}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                      <span className="text-[11px] text-slate-500 font-mono">Kelas: {selectedClass}</span>
                      <button
                        onClick={async () => {
                          await exportTeacherDataApi('grades');
                          showToast(`Mengunduh ${rep.title}...`, 'success');
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Unduh Laporan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 🎯 KURIKULUM & TARGET (curriculum) */}
          {activeMenu === 'curriculum' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Alur Tujuan Pembelajaran (ATP) & Target Capaian</h2>
                  <p className="text-xs text-slate-500">Struktur Kurikulum Merdeka Fase E • Mata Pelajaran: Matematika Terapan</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500">Capaian Target Semester:</span>
                  <div className="text-xl font-black text-emerald-600">65% Tuntas</div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { code: 'CP-01', title: 'Bilangan & Aljabar Terapan', targetJtm: 12, completedJtm: 12, pct: 100, desc: 'Menerapkan konsep persamaan dan pertidaksamaan linier serta sistem persamaan linier dua variabel dalam pemecahan masalah algoritma komputasi.', status: 'Selesai' },
                  { code: 'CP-02', title: 'Aljabar Matriks & Transformasi 2D', targetJtm: 16, completedJtm: 14, pct: 87.5, desc: 'Menyelesaikan permasalahan menggunakan operasi matriks, determinan, dan invers matriks serta penerapannya dalam representasi koordinat grafis komputer.', status: 'Sedang Berjalan' },
                  { code: 'CP-03', title: 'Fungsi Kuadrat & Pemodelan Parabola', targetJtm: 16, completedJtm: 10, pct: 62.5, desc: 'Menganalisis karakteristik grafik fungsi kuadrat, sumbu simetri, dan diskriminan untuk simulasi gerak parabola pada antarmuka canvas web.', status: 'Sedang Berjalan' },
                  { code: 'CP-04', title: 'Trigonometri & Analisis Vektor Ruang', targetJtm: 12, completedJtm: 0, pct: 0, desc: 'Menerapkan perbandingan trigonometri untuk menentukan besar sudut dan jarak pada koordinat bidang kartesius.', status: 'Belum Dimulai' },
                ].map((cp, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-sky-600 text-white font-mono font-bold rounded-md text-[10px]">{cp.code}</span>
                        <h3 className="font-black text-slate-900 text-sm">{cp.title}</h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                        cp.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' :
                        cp.status === 'Sedang Berjalan' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {cp.status}
                      </span>
                    </div>

                    <p className="text-slate-600 leading-relaxed">{cp.desc}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-slate-500">
                      <span>Beban Jam Tatap Muka: <strong>{cp.completedJtm} / {cp.targetJtm} JTM</strong></span>
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-sky-600 h-full rounded-full" style={{ width: `${cp.pct}%` }} />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{cp.pct}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 📥 IMPORT / EXPORT DATA (import-export) */}
          {activeMenu === 'import-export' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Integrasi Import & Export Data Akademik</h2>
                  <p className="text-xs text-slate-500">Impor nilai secara massal melalui file Excel atau ekspor data ke sistem sekolah</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  Format Resmi Dapodik / Kurikulum Merdeka
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Import Section */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <FileUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Impor Nilai Siswa dari Excel</h3>
                      <p className="text-slate-500 text-[11px]">Unggah berkas rekap spreadsheet nilai tugas, PTS, dan PAS</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 bg-white text-center flex flex-col items-center justify-center gap-2">
                    <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                    <span className="font-bold text-slate-700 text-xs">
                      {importFileName || 'Pilih Berkas Spreadsheet (.xlsx, .csv)'}
                    </span>
                    <button
                      onClick={() => {
                        setImportFileName('Template_Nilai_Matematika_X_RPL_1.xlsx');
                        showToast('File dipilih: Template_Nilai_Matematika_X_RPL_1.xlsx', 'info');
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                    >
                      Pilih File dari Komputer
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => showToast('Mengunduh template resmi Excel...', 'info')}
                      className="text-sky-600 hover:underline font-bold text-xs cursor-pointer flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Template Excel Kosong
                    </button>
                    <button
                      onClick={handleProcessImport}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                    >
                      Proses Impor ke Gradebook
                    </button>
                  </div>
                </div>

                {/* Export Section */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <FileDown className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm">Ekspor Rekapitulasi Data KBM</h3>
                      <p className="text-slate-500 text-[11px]">Unduh data terformat siap serah ke Bagian Kurikulum</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {[
                      { name: 'Export Buku Nilai Lengkap (XLSX)', action: () => exportTeacherDataApi('grades') },
                      { name: 'Export Rekapitulasi Presensi Semester (XLSX)', action: () => exportTeacherDataApi('attendance') },
                      { name: 'Export Jurnal Mengajar Harian (PDF)', action: () => exportTeacherDataApi('journal') },
                    ].map((exp, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{exp.name}</span>
                        <button
                          onClick={async () => {
                            await exp.action();
                            showToast(`Mengunduh berkas ${exp.name}...`, 'success');
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Unduh
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 🗄️ ARSIP SEMESTER (archive) */}
          {activeMenu === 'archive' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Arsip Pembelajaran & Semester Terdahulu</h2>
                  <p className="text-xs text-slate-500">Riwayat berkas KBM, nilai rapor, dan silabus dari tahun ajaran lampau</p>
                </div>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                  Penyimpanan Permanen Aman
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { year: '2025/2026', semester: 'Genap', subjects: 'Matematika Terapan (X RPL 1 & 2)', students: 66, avgScore: 88.4, status: 'Diarsipkan' },
                  { year: '2025/2026', semester: 'Ganjil', subjects: 'Matematika Dasar & Logika (X RPL 1 & 2)', students: 66, avgScore: 86.2, status: 'Diarsipkan' },
                  { year: '2024/2025', semester: 'Genap', subjects: 'Pemrograman Web Dinamis (XI RPL 1)', students: 34, avgScore: 89.1, status: 'Diarsipkan' },
                ].map((arc, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-mono font-bold rounded-md text-[10px]">{arc.year}</span>
                        <span className="font-bold text-sky-700">{arc.semester}</span>
                      </div>
                      <h3 className="font-black text-slate-900 text-sm">{arc.subjects}</h3>
                      <p className="text-slate-500 mt-1">{arc.students} Siswa • Rata-rata Nilai: <strong>{arc.avgScore}</strong></p>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                      <span className="text-[10px] text-emerald-700 font-bold">✓ Tersimpan Lengkap</span>
                      <button
                        onClick={() => showToast(`Membuka data arsip ${arc.year} (${arc.semester})...`, 'info')}
                        className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer"
                      >
                        Buka Arsip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 🔔 NOTIFIKASI GURU (notifications) */}
          {activeMenu === 'notifications' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pusat Notifikasi & Aktivitas KBM</h2>
                  <p className="text-xs text-slate-500">Pemberitahuan real-time terkait pengumpulan tugas, kuis, dan jadwal akademik</p>
                </div>
                <button
                  onClick={() => showToast('Semua notifikasi ditandai telah dibaca.', 'info')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Tandai Semua Dibaca
                </button>
              </div>

              <div className="flex flex-col gap-2.5">
                {[
                  { title: 'Tugas Diserahkan', desc: 'Dimas Arya Nugraha mengunggah Tugas 04: Parabola Canvas', time: '10 menit yang lalu', icon: FileText, color: 'bg-blue-100 text-blue-700', action: () => setActiveMenu('submissions') },
                  { title: 'Jadwal Tatap Muka', desc: 'Pertemuan Ke-08 di Lab RPL 1 sedang berlangsung aktif', time: '1 jam yang lalu', icon: Play, color: 'bg-emerald-100 text-emerald-700', action: () => setActiveMenu('teaching-session') },
                  { title: 'Hasil Kuis Tersedia', desc: 'Kuis Kilat 01 telah diselesaikan oleh 34/34 siswa X RPL 1', time: 'Kemarin', icon: Award, color: 'bg-blue-100 text-blue-700', action: () => setActiveMenu('quiz') },
                  { title: 'Pengumuman Kurikulum', desc: 'Batas akhir penginputan nilai PTS dijadwalkan tanggal 18 Oktober 2026', time: '2 hari lalu', icon: Bell, color: 'bg-amber-100 text-amber-700', action: () => setActiveMenu('gradebook') },
                ].map((notif, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${notif.color}`}>
                        <notif.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono">• {notif.time}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{notif.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={notif.action}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer shrink-0"
                    >
                      Buka
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 🔒 KEAMANAN AKUN (security) */}
          {activeMenu === 'security' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengaturan Keamanan & Kata Sandi</h2>
                  <p className="text-xs text-slate-500">Kelola kredensial akun pengajar dan proteksi autentikasi berlapis</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  Tingkat Keamanan: Tinggi
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Password form */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-4">
                  <h3 className="font-black text-slate-900 text-sm">Perbarui Kata Sandi</h3>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[11px]">Kata Sandi Saat Ini</label>
                    <input
                      type="password"
                      value={securityForm.currentPass}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPass: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[11px]">Kata Sandi Baru</label>
                    <input
                      type="password"
                      value={securityForm.newPass}
                      onChange={(e) => setSecurityForm({ ...securityForm, newPass: e.target.value })}
                      placeholder="Minimal 8 karakter campuran"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-slate-700 uppercase text-[11px]">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      value={securityForm.confirmPass}
                      onChange={(e) => setSecurityForm({ ...securityForm, confirmPass: e.target.value })}
                      placeholder="Ketik ulang kata sandi baru"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600 bg-white"
                    />
                  </div>

                  <button
                    onClick={handleUpdatePassword}
                    className="mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-xs"
                  >
                    Simpan Perubahan Kata Sandi
                  </button>
                </div>

                {/* 2FA and Sessions */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-slate-900 text-sm">Autentikasi Dua Faktor (2FA)</h3>
                      <button
                        onClick={() => {
                          const nextState = !twoFactorActive;
                          setTwoFactorActive(nextState);
                          showToast(nextState ? '2FA telah diaktifkan!' : '2FA dinonaktifkan.', 'info');
                        }}
                        className={`px-3 py-1 rounded-full font-bold text-xs cursor-pointer ${
                          twoFactorActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {twoFactorActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                    <p className="text-slate-500 text-[11px]">
                      Meminta kode verifikasi tambahan setiap kali masuk dari peramban atau perangkat baru untuk menjaga keamanan buku nilai.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                    <h3 className="font-black text-slate-900 text-sm">Riwayat Sesi Masuk Aktif</h3>
                    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                      <div>
                        <div className="font-bold text-slate-900">Chrome di Windows 11</div>
                        <div className="text-[10px] text-slate-400">IP: 192.168.1.42 • Sesi Ini (Aktif)</div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded-md text-[10px]">Perangkat Utama</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ❓ BANTUAN & FAQ (help) */}
          {activeMenu === 'help' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pusat Bantuan & Panduan Guru (FAQ)</h2>
                  <p className="text-xs text-slate-500">Panduan lengkap operasional portal guru dan layanan dukungan teknis sekolah</p>
                </div>
                <button
                  onClick={() => showToast('Pesan bantuan terkirim ke Tim IT Sekolah!', 'success')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Hubungi Helpdesk IT
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    id: 1,
                    q: 'Bagaimana cara mengisi presensi siswa saat sesi tatap muka KBM berlangsung?',
                    a: 'Buka menu "Mulai Pertemuan Live" atau "Presensi Siswa". Anda dapat menggunakan tombol "Tandai Semua Hadir" untuk kecepatan, lalu ubah status siswa yang sakit, izin, atau alpa secara spesifik. Klik tombol "Simpan Presensi" untuk mensinkronkan ke wali kelas.',
                  },
                  {
                    id: 2,
                    q: 'Apakah nilai di Gradebook langsung tersinkron ke Rapor Siswa & Wali Kelas?',
                    a: 'Ya. Setiap kali Anda menekan tombol "Simpan Nilai", nilai tugas, kuis, ulangan harian, PTS, dan PAS akan otomatis dihitung berdasarkan persentase bobot yang Anda tetapkan pada menu "Pengaturan Asesmen & Bobot" dan langsung terlihat oleh wali kelas terkait.',
                  },
                  {
                    id: 3,
                    q: 'Bagaimana cara membuat ujian CBT dan membagikan token ujian?',
                    a: 'Masuk ke menu "Ujian & CBT Monitor". Anda dapat mengatur durasi, tanggal mulai, dan meregenerasi token ujian harian (misal MTK-PTS-2026). Bagikan token tersebut kepada siswa di kelas hanya saat ujian dimulai.',
                  },
                  {
                    id: 4,
                    q: 'Bagaimana jika saya ingin mengimpor nilai dari lembar kerja Excel yang sudah ada?',
                    a: 'Buka menu "Import / Export Data", unduh terlebih dahulu format template resmi Excel, masukkan nilai-nilai siswa sesuai kolom NIS, lalu unggah kembali berkas tersebut dan klik "Proses Impor ke Gradebook".',
                  },
                  {
                    id: 5,
                    q: 'Apa perbedaan menu Remedial dan Pengayaan?',
                    a: 'Menu Remedial ditujukan untuk pendampingan dan perbaikan nilai siswa yang belum mencapai batas KKM (75). Sedangkan menu Pengayaan dirancang untuk siswa unggul yang melampaui KKM guna memberikan tantangan materi tingkat lanjut atau persiapan olimpiade.',
                  },
                ].map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2 text-xs">
                    <button
                      onClick={() => setFaqExpanded((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className="flex items-center justify-between text-left font-bold text-slate-900 cursor-pointer w-full"
                    >
                      <span>{item.q}</span>
                      <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${faqExpanded[item.id] ? 'rotate-180' : ''}`} />
                    </button>
                    {faqExpanded[item.id] && (
                      <p className="text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                        {item.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 📚 PERPUSTAKAAN & BUKU REFERENSI GURU (digital-library) */}
          {activeMenu === 'digital-library' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Perpustakaan & Buku Referensi Guru</h2>
                  <p className="text-xs text-slate-500">Katalog buku pegangan Kurikulum Merdeka, e-book sains & jurnal pendidikan terakreditasi</p>
                </div>
                <button
                  onClick={() => showToast('Katalog buku guru telah diperbarui!', 'info')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Cari E-Book
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Buku Guru: Matematika Tingkat Lanjut Fase F', author: 'Kemendikbudristek 2024', category: 'Kurikulum Merdeka', pages: 312, file: 'buku_guru_matematika_fase_f.pdf', size: '14.2 MB' },
                  { title: 'Statistika Terapan untuk Sains Data & Algoritma', author: 'Dr. Hendra Pratama, M.Sc', category: 'Referensi Kejuruan', pages: 248, file: 'statistika_sains_data.pdf', size: '9.8 MB' },
                  { title: 'Panduan Asesmen & Pembelajaran Kurikulum Merdeka', author: 'BSKAP Kemendikbud', category: 'Pedoman Resmi', pages: 180, file: 'panduan_asesmen_bskap.pdf', size: '5.4 MB' },
                  { title: 'Pedoman Praktikum Algoritma Pemrograman Grafis', author: 'Tim MGMP Komputasi', category: 'Modul Praktik', pages: 160, file: 'modul_praktik_komputasi.pdf', size: '7.1 MB' },
                  { title: 'Jurnal Inovasi Pembelajaran STEM Berbasis PBL', author: 'Pusat Riset Pendidikan', category: 'Jurnal Ilmiah', pages: 94, file: 'jurnal_stem_pbl_2026.pdf', size: '3.2 MB' },
                  { title: 'Bank Soal Olimpiade Matematika Sains Terapan', author: 'MGMP Provinsi', category: 'Pengayaan', pages: 210, file: 'soal_olimpiade_terapan.pdf', size: '8.6 MB' },
                ].map((book, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 bg-sky-100 text-sky-700 font-bold rounded-md text-[10px]">{book.category}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{book.pages} Halaman</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2">{book.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{book.author}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">{book.size}</span>
                      <button
                        onClick={() => showToast(`Mengunduh berkas: ${book.file}`, 'success')}
                        className="px-2.5 py-1 bg-white hover:bg-sky-50 border border-slate-200 text-sky-600 font-bold text-[11px] rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        Unduh PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: 🎯 TARGET AKADEMIK GURU & KKM TRACKER (/goal) */}
          {activeMenu === 'goal' && (
            <div className="space-y-6">
              {/* Goal Hero Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {t('goal.hero_tag') || 'TARGET AKADEMIK PENGAJAR'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Semester Ganjil 2026/2027
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>Target Ketuntasan KKM & Capaian KBM Kelas</span>
                      <Target className="w-5 h-5 text-amber-300 animate-pulse" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Pantau target ketuntasan belajar minimal (KKM 75.0), ketercapaian silabus pertemuan semester, dan milestones pengajaran untuk rombel binaan {selectedClass}.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMenu('gradebook')}
                      className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
                    >
                      <span>Buka Gradebook Kelas</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4 Academic Goals Summary Bento Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl border border-slate-200/90 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Standar KKM Mapel</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Tercapai</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">75.0</div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Realisasi Rata-rata:</span>
                    <span className="font-bold text-emerald-600">82.4 (+7.4)</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200/90 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Pertemuan Selesai</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">50% KBM</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">8 / 16 Sesi</div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-[50%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Target Semester:</span>
                    <span className="font-bold text-slate-700">16 Pertemuan</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200/90 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Ketuntasan Siswa</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">94.1%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">32 / 34 Siswa</div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[94%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Remedial Diperlukan:</span>
                    <span className="font-bold text-amber-700">2 Siswa</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl border border-slate-200/90 bg-slate-50/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Tingkat Kehadiran</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">96.8%</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">96.8%</div>
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full w-[96.8%]" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Target Minimum:</span>
                    <span className="font-bold text-purple-700">90.0%</span>
                  </div>
                </div>
              </div>

              {/* Milestones & Goals Tracking Table */}
              <div className="p-6 rounded-3xl border border-slate-200/90 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      Milestone Ketuntasan Bab Kurikulum ({selectedClass})
                    </h4>
                    <p className="text-xs text-slate-500">Target penyelesaian Capaian Pembelajaran (CP) dan asesmen sumatif semester ini.</p>
                  </div>
                  <button
                    onClick={() => showToast('Target akademik guru berhasil disinkronkan ke kalender!', 'success')}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer shadow-xs"
                  >
                    + Tambah Target Milestone
                  </button>
                </div>

                <div className="space-y-3">
                  {[
                    { bab: 'Bab 1: Eksponen & Bentuk Akar', target: '31 Agu 2026', status: 'Tuntas (100%)', passRate: '100% Tuntas', color: 'bg-emerald-500' },
                    { bab: 'Bab 2: Persamaan & Fungsi Kuadrat', target: '30 Sep 2026', status: 'Tuntas (100%)', passRate: '94% Tuntas', color: 'bg-emerald-500' },
                    { bab: 'Bab 3: Matriks & Sistem Persamaan Linier', target: '20 Okt 2026', status: 'Sedang Berjalan (65%)', passRate: 'Proses Evaluasi', color: 'bg-sky-500' },
                    { bab: 'Bab 4: Transformasi Geometri Komputasi', target: '15 Nov 2026', status: 'Terjadwal', passRate: 'Persiapan Modul', color: 'bg-slate-300' },
                    { bab: 'Bab 5: Statistika Deskriptif & Inferensial', target: '10 Des 2026', status: 'Terjadwal', passRate: 'Persiapan PAS', color: 'bg-slate-300' },
                  ].map((m, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${m.color}`} />
                        <div>
                          <h5 className="font-bold text-xs text-slate-900">{m.bab}</h5>
                          <span className="text-[11px] text-slate-500">Target Selesai: {m.target} • {m.passRate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        <span className="text-xs font-bold text-slate-700">{m.status}</span>
                        <button
                          onClick={() => setActiveMenu('teaching-journal')}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Cek Jurnal →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 📖 STUDIO AJAR & RPP AI KURIKULUM MERDEKA (/learn) */}
          {activeMenu === 'learn' && (
            <div className="space-y-6">
              {/* Learn Hero Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white shadow-xl border border-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {t('learn.hero_tag') || 'STUDIO AJAR & RPP AI'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">
                        Kurikulum Merdeka Ready
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>Studio Pembuatan Modul Ajar & RPP Berdiferensiasi</span>
                      <Sparkles className="w-5 h-5 text-cyan-300 animate-spin" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Rancang modul ajar cerdas, buat lembar LKPD interaktif berbasis studi kasus riil, generate rubrik asesmen formatif, dan publikasikan materi ke siswa dalam hitungan detik.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('material-create')}
                    className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
                  >
                    <span>Upload Bahan Ajar</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* 4 Interactive Study Quick Hub Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setAiPrompt('Buatkan RPP Kurikulum Merdeka 1 lembar topik Matriks Terapan untuk kelas X RPL dengan model Problem-Based Learning');
                    setActiveMenu('ai-assistant');
                  }}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md hover:border-cyan-500/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-cyan-600 transition-colors">Generator RPP AI</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">Susun modul ajar diferensiasi konten & proses otomatis dengan alur Merdeka Mengajar.</p>
                </div>

                <div
                  onClick={() => setActiveMenu('materials')}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">Bank Modul & Slide</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">Kelola berkas modul tayang PDF, slide presentasi PPT, dan video pembelajaran KBM.</p>
                </div>

                <div
                  onClick={() => setActiveMenu('digital-library')}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-purple-600 transition-colors">Buku Guru & Referensi</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">E-Book panduan pendidik Kurikulum Merdeka Fase E/F dan pedoman asesmen resmi.</p>
                </div>

                <div
                  onClick={() => setActiveMenu('ai-assistant')}
                  className="p-5 rounded-3xl border border-slate-200/90 bg-white/90 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 group-hover:text-emerald-600 transition-colors">Konsultasi Pedagogi AI</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">Diskusikan strategi penanganan siswa pasif, asesmen diagnostik awal, dan ice breaking.</p>
                </div>
              </div>

              {/* Interactive Module Studio Generator Preview */}
              <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-600" />
                      Studio Cepat: Draf Modul Ajar Terpilih
                    </h4>
                    <p className="text-xs text-slate-500">Preview struktur modul ajar pertemuan selanjutnya untuk kelas {selectedClass}.</p>
                  </div>
                  <button
                    onClick={() => showToast('Draf Modul Ajar berhasil diekspor ke format DOCX!', 'success')}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Unduh Perangkat Ajar
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-900 text-sm">Modul Pertemuan 09: Matriks Transformasi 2D & Game Development</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">Siap Ajar</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">1. Tujuan Pembelajaran (TP)</span>
                      <p className="text-slate-700 leading-relaxed">Peserta didik mampu memodelkan rotasi koordinat objek 2D menggunakan perkalian matriks secara tepat.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">2. Pertanyaan Pemantik</span>
                      <p className="text-slate-700 leading-relaxed">Bagaimana karakter game seperti Mario bergerak berputar di layar tanpa merusak bentuk grafisnya?</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">3. Asesmen Formatif</span>
                      <p className="text-slate-700 leading-relaxed">Lembar kerja komputasi rotasi titik segitiga P(2,3) sejauh 90° berlawanan arah jarum jam.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ⚡ BOOSTER KINERJA GURU & EFISIENSI KBM (/boost) */}
          {activeMenu === 'boost' && (
            <div className="space-y-6">
              {/* Boost Hero Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-purple-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                        {t('boost.hero_tag') || 'BOOSTER EFISIENSI PENGAJAR'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        Otomasi Menghemat ~4.8 Jam/Minggu
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>Booster Penilaian, Soal HOTS & Analisis Butir Soal</span>
                      <Zap className="w-5 h-5 text-purple-300 animate-bounce" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      Percepat koreksi tugas siswa dengan rekomendasi rubrik otomatis, generate paket soal HOTS berdaya pembeda tinggi, dan deteksi siswa yang butuh penanganan remedial instan.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('submissions')}
                    className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
                  >
                    <span>Koreksi Tugas Cepat</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* 3 Productivity Boost Tool Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-3xl border border-purple-200 bg-purple-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Booster 1</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-200 text-purple-900">AI Soal HOTS</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Generator Soal Level C4-C6</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Generate butir soal analisis dan evaluasi berbasis stimulus kontekstual kejuruan lengkap dengan kisi-kisi dan rubrik penskoran.
                  </p>
                  <button
                    onClick={() => {
                      setAiPrompt('Buatkan 3 butir soal HOTS pilihan ganda topik Fungsi Kuadrat kelas X dengan stimulus industri teknologi beserta kunci jawaban & pembahasannya');
                      setActiveMenu('ai-assistant');
                    }}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Generate Soal HOTS Sekarang
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-sky-200 bg-sky-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800">Booster 2</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-200 text-sky-900">One-Click Grader</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Automasi Penilaian Jawaban</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Beri feedback personal dan nilai instan pada jawaban esai siswa berdasarkan kata kunci dan ketelitian langkah pengerjaan.
                  </p>
                  <button
                    onClick={() => setActiveMenu('submissions')}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Buka Workspace Koreksi
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Booster 3</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-200 text-emerald-900">Remedial Helper</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Deteksi Otomatis Remedial</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Identifikasi otomatis 2 siswa di bawah KKM 75 dan buat lembar penugasan perbaikan terarah sesuai topik kelemahan siswa.
                  </p>
                  <button
                    onClick={() => setActiveMenu('remedial')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    Kelola Kelas Remedial
                  </button>
                </div>
              </div>

              {/* Efficiency Analytics Metric Cards */}
              <div className="p-6 rounded-3xl border border-slate-200/90 bg-white shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      Statistik Efisiensi Kerja KBM Guru Bulan Ini
                    </h4>
                    <p className="text-xs text-slate-500">Kalkulasi penghematan jam kerja administrasi berkat fitur cerdas myAcademic.</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Produktivitas +42%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Waktu Koreksi Dihemat</span>
                    <div className="text-2xl font-black text-slate-900">4.8 Jam</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tersimpan minggu ini</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Soal Bank Tersusun</span>
                    <div className="text-2xl font-black text-purple-600">45 Butir</div>
                    <span className="text-[10px] text-slate-500">Termasuk 18 soal HOTS C4-C6</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <span className="text-[11px] text-slate-500 block">Tugas Terkoreksi Tuntas</span>
                    <div className="text-2xl font-black text-emerald-600">100%</div>
                    <span className="text-[10px] text-emerald-600 font-semibold">0 Antrean Menumpuk</span>
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MODAL: STUDENT ACADEMIC PROFILE (RESTRICTED TO TEACHER'S SUBJECT) */}
      {selectedStudentAcademic && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">{selectedStudentAcademic.name}</h3>
                <p className="text-xs text-slate-500">NIS: {selectedStudentAcademic.nis} • {selectedClass}</p>
              </div>
              <button
                onClick={() => setSelectedStudentAcademic(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100 flex flex-col gap-1 text-xs">
              <span className="font-bold text-sky-900">Performa Mata Pelajaran (Matematika Terapan):</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-white p-2 rounded-xl border border-sky-100">
                  <div className="text-[10px] text-slate-400 font-bold">Rata-rata Nilai</div>
                  <div className="text-lg font-black text-sky-600">89.2</div>
                </div>
                <div className="bg-white p-2 rounded-xl border border-sky-100">
                  <div className="text-[10px] text-slate-400 font-bold">Kehadiran Kelas</div>
                  <div className="text-lg font-black text-emerald-600">96.2%</div>
                </div>
              </div>
            </div>

            {/* Privacy boundary disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
              <Shield className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                <strong>Akses Terlindungi:</strong> Sebagai Guru Pengajar, Anda hanya memiliki visibilitas atas perkembangan akademik di mata pelajaran yang Anda ampu. Catatan konseling BK dan administrasi umum bersifat rahasia.
              </span>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStudentAcademic(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: GRADING SUBMISSION */}
      {gradingModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Penilaian Tugas Siswa</h3>
                <p className="text-xs text-slate-500">{gradingModalItem.name} • {gradingModalItem.file}</p>
              </div>
              <button
                onClick={() => setGradingModalItem(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-slate-700 uppercase">Nilai Angka (0 - 100):</label>
              <input
                type="number"
                min={0}
                max={100}
                value={gradingScore}
                onChange={(e) => setGradingScore(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
              />

              <label className="text-xs font-bold text-slate-700 uppercase mt-1">Feedback & Catatan Guru:</label>
              <textarea
                rows={3}
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                placeholder="Tulis masukan untuk perbaikan atau apresiasi hasil kerja siswa..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setGradingModalItem(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGrading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Simpan & Kembalikan Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: CREATE NEW QUIZ */}
      {isNewQuizModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Buat Kuis Harian Baru</h3>
                <p className="text-xs text-slate-500">Kuis otomatis dengan pengacakan butir soal</p>
              </div>
              <button
                onClick={() => setIsNewQuizModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Judul Kuis *</label>
                <input
                  type="text"
                  value={newQuizForm.title}
                  onChange={(e) => setNewQuizForm({ ...newQuizForm, title: e.target.value })}
                  placeholder="Contoh: Kuis 03: Determinan Matriks Ordo 3x3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Durasi (Menit)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={newQuizForm.duration}
                    onChange={(e) => setNewQuizForm({ ...newQuizForm, duration: parseInt(e.target.value) || 30 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Jumlah Soal</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={newQuizForm.questions}
                    onChange={(e) => setNewQuizForm({ ...newQuizForm, questions: parseInt(e.target.value) || 10 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Target Kelas</label>
                <select
                  value={newQuizForm.className}
                  onChange={(e) => setNewQuizForm({ ...newQuizForm, className: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  <option value="X RPL 1">X RPL 1</option>
                  <option value="X RPL 2">X RPL 2</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewQuizModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateQuiz}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Terbitkan Kuis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CREATE QUESTION BANK ITEM */}
      {isNewQuestionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Tambah Butir Soal Baru</h3>
                <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan</p>
              </div>
              <button
                onClick={() => setIsNewQuestionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Topik / Pokok Bahasan *</label>
                  <input
                    type="text"
                    value={newQuestionForm.topic}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                    placeholder="Contoh: Diskriminan Parabola"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Tingkat Kesulitan</label>
                  <select
                    value={newQuestionForm.difficulty}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="Mudah">Mudah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Sulit">Sulit (HOTS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Tipe Soal</label>
                  <select
                    value={newQuestionForm.type}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, type: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="Pilihan Ganda">Pilihan Ganda</option>
                    <option value="Essay">Essay</option>
                    <option value="True/False">True / False</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Bobot Poin</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={newQuestionForm.weight}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, weight: parseInt(e.target.value) || 2 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold font-mono focus:outline-none focus:ring-2 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Naskah Soal *</label>
                <textarea
                  rows={3}
                  value={newQuestionForm.question}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question: e.target.value })}
                  placeholder="Ketikkan teks butir soal..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Kunci Jawaban / Pembahasan Singkat</label>
                <input
                  type="text"
                  value={newQuestionForm.answerKey}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, answerKey: e.target.value })}
                  placeholder="Contoh: A. Titik puncak (2, -4)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewQuestionModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateQuestion}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Simpan ke Bank Soal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: UPLOAD DRIVE FILE */}
      {isNewDriveFileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Unggah Berkas ke Drive Guru</h3>
                <p className="text-xs text-slate-500">Folder: {selectedDriveFolder}</p>
              </div>
              <button
                onClick={() => setIsNewDriveFileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Nama Dokumen / File *</label>
                <input
                  type="text"
                  value={newDriveFileName}
                  onChange={(e) => setNewDriveFileName(e.target.value)}
                  placeholder="Contoh: Modul_Ajar_Bab_3_Fungsi_Kuadrat.pdf"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Folder Penyimpanan</label>
                <select
                  value={selectedDriveFolder}
                  onChange={(e) => setSelectedDriveFolder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                >
                  <option value="Materi & Modul">Materi & Modul</option>
                  <option value="Bank Soal & Kisi-Kisi">Bank Soal & Kisi-Kisi</option>
                  <option value="Lembar Kerja Tugas (LKS)">Lembar Kerja Tugas (LKS)</option>
                  <option value="Referensi & E-Book">Referensi & E-Book</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewDriveFileModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleAddDriveFile}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Unggah File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MODAL: FILL TEACHING JOURNAL */}
      {isNewJournalModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-slate-900 text-base">Isi Jurnal Mengajar KBM</h3>
                <p className="text-xs text-slate-500">Mata Pelajaran: Matematika Terapan • Tanggal: Hari Ini</p>
              </div>
              <button
                onClick={() => setIsNewJournalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Kelas</label>
                  <select
                    value={newJournalForm.className}
                    onChange={(e) => setNewJournalForm({ ...newJournalForm, className: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  >
                    <option value="X RPL 1">X RPL 1</option>
                    <option value="X RPL 2">X RPL 2</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-slate-700 uppercase text-[11px]">Pertemuan Ke-</label>
                  <select
                    value={newJournalForm.meeting}
                    onChange={(e) => setNewJournalForm({ ...newJournalForm, meeting: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                  >
                    {Array.from({ length: 16 }).map((_, i) => (
                      <option key={i} value={`Pertemuan ${String(i + 1).padStart(2, '0')}`}>
                        Pertemuan {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Materi Pokok / Topik Pembelajaran *</label>
                <input
                  type="text"
                  value={newJournalForm.topic}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, topic: e.target.value })}
                  placeholder="Contoh: Persamaan & Titik Puncak Parabola"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Tujuan Pembelajaran</label>
                <textarea
                  rows={2}
                  value={newJournalForm.objective}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, objective: e.target.value })}
                  placeholder="Siswa mampu menghitung koordinat titik puncak..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Aktivitas KBM & Metode</label>
                <textarea
                  rows={2}
                  value={newJournalForm.activity}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, activity: e.target.value })}
                  placeholder="Pemaparan materi, praktik komputasi di lab, dan latihan kelompok..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-slate-700 uppercase text-[11px]">Catatan Refleksi & Kendala</label>
                <textarea
                  rows={2}
                  value={newJournalForm.notes}
                  onChange={(e) => setNewJournalForm({ ...newJournalForm, notes: e.target.value })}
                  placeholder="KBM berlangsung kondusif, siswa antusias..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewJournalModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateJournal}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Simpan & Sinkron Jurnal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
