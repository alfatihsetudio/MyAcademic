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
  Compass,
  HeartPulse,
  AlertTriangle,
  FolderOpen,
  MessageSquare,
  Search,
  Library,
  Bookmark,
  StickyNote,
  ListTodo,
  BarChart3,
  Target,
  Shield,
  Smartphone,
  Bot,
  Download,
  ChevronRight,
  ChevronDown,
  Sparkles,
  QrCode,
  ArrowRight,
  Flame,
  RefreshCw,
  MoreVertical,
  Layers,
  GraduationCap,
  Check,
  Send,
  X,
  Settings,
  Zap,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { User } from '@/lib/types';
import { fetchStudentDashboard } from '@/lib/api';
import StudentHubView from '@/components/Views/StudentHubView';
import ArsipBelajarStudio from '@/components/ArsipBelajar/ArsipBelajarStudio';
import StudentSettingsModal from '@/components/Modals/StudentSettingsModal';
import { useAppPreferences } from '@/context/AppPreferencesContext';

interface StudentGlassDashboardProps {
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

// =========================================================================
// 36 MASTER STUDENT MODULES (Grouped neatly into 6 functional categories)
// =========================================================================
export const STUDENT_NAV_GROUPS: NavGroup[] = [
  {
    id: 'utama',
    label: 'UTAMA & PUSAT KONTROL',
    items: [
      {
        id: 'dashboard',
        number: 1,
        label: 'Dashboard Siswa',
        icon: LayoutDashboard,
        badge: 'Home',
        desc: 'Ringkasan aktivitas hari ini, jadwal KBM, dan pengumuman kilat',
        keywords: ['home', 'beranda', 'utama', 'aktivitas', 'sapaan', 'overview', 'ringkasan', 'hari ini', 'kegiatan', 'pantau']
      },
      {
        id: 'profile',
        number: 2,
        label: 'Profil & Identitas Diri',
        icon: UserIcon,
        desc: 'Biodata diri, NISN, rombel kelas, kontak ortu, dan dokumen siswa',
        keywords: ['biodata', 'data diri', 'akun saya', 'nisn', 'nik', 'orang tua', 'wali', 'kartu pelajar', 'foto', 'alamat', 'ijazah', 'identitas', 'dapodik']
      },
      {
        id: 'schedule',
        number: 3,
        label: 'Jadwal Pelajaran & Kalender',
        icon: Calendar,
        badge: 'Hari Ini',
        desc: 'Jadwal KBM mingguan, ruang kelas, guru pengampu, agenda PTS/PAS & libur',
        keywords: ['waktu', 'jam belajar', 'roster', 'timetable', 'pelajaran besok', 'masuk sekolah', 'kalender', 'agenda', 'libur', 'cuti', 'ruang', 'ujian tanggal']
      },
      {
        id: 'announcements',
        number: 4,
        label: 'Pengumuman & Notifikasi',
        icon: Bell,
        badge: 'Warta',
        desc: 'Warta resmi sekolah, surat edaran, notifikasi tugas baru & nilai masuk',
        keywords: ['pemberitahuan', 'pesan sekolah', 'info penting', 'edaran', 'surat', 'peringatan', 'update', 'berita', 'kabar', 'lonceng', 'warta', 'broadcast', 'pengingat']
      },
    ]
  },
  {
    id: 'kbm',
    label: 'KBM & PEMBELAJARAN',
    items: [
      {
        id: 'arsip-belajar',
        number: 5,
        label: 'Arsip Belajar AI Studio',
        icon: Sparkles,
        badge: 'AI Studio',
        desc: 'Foto catatan papan tulis, rekaman suara guru, flashcards 3D, Mind Map, & CBT',
        keywords: ['catatan pintar', 'papan tulis', 'rekam audio', 'suara guru', 'flashcard', 'mindmap', 'peta konsep', 'ai', 'ringkasan materi', 'cerdas', 'second brain', 'studio']
      },
      {
        id: 'my-subjects',
        number: 6,
        label: 'Mata Pelajaran & Silabus',
        icon: BookOpen,
        desc: 'Daftar mapel aktif semester ini, kurikulum, silabus, dan kompetensi dasar',
        keywords: ['mapel', 'kurikulum', 'pelajaran', 'matematika', 'fisika', 'kimia', 'biologi', 'bahasa', 'guru pengajar', 'silabus', 'kkm', 'kktp', 'topik']
      },
      {
        id: 'materials',
        number: 7,
        label: 'Materi & Modul Pembelajaran',
        icon: FileText,
        desc: 'Koleksi modul e-book, slide presentasi guru, video pembelajaran, & link bacaan',
        keywords: ['buku', 'modul', 'pdf', 'slide', 'powerpoint', 'ppt', 'video kbm', 'bahan ajar', 'bacaan', 'dokumen materi', 'unduh berkas', 'download modul', 'teori']
      },
      {
        id: 'assignments',
        number: 8,
        label: 'Tugas & Pengumpulan',
        icon: Upload,
        badge: '2 Aktif',
        desc: 'Daftar PR/tugas mandiri, deadline pengerjaan, upload jawaban, & feedback guru',
        keywords: ['pr', 'pekerjaan rumah', 'deadline', 'kumpul tugas', 'upload jawaban', 'tenggat waktu', 'submission', 'berkas tugas', 'soal tugas', 'kirim dokumen', 'nilai tugas']
      },
      {
        id: 'my-class',
        number: 9,
        label: 'Kelas & Direktori Guru',
        icon: Users,
        desc: 'Data rekan sekelas X-MIPA 1, pengurus kelas, kontak wali kelas, & guru pengajar',
        keywords: ['teman sekelas', 'wali kelas', 'guru mapel', 'rekan', 'kontak guru', 'rombel', 'ruang kelas', 'daftar guru', 'nomor wa guru', 'konsultasi', 'km', 'ketua kelas']
      },
      {
        id: 'learn',
        number: 21,
        label: 'Studio Belajar & KBM (/learn)',
        icon: BookOpen,
        badge: 'Learn',
        desc: 'Studio pembelajaran interaktif, materi modul KBM, flashcard 3D & catatan cerdas',
        keywords: ['learn', 'belajar', 'materi', 'silabus', 'studio', 'modul', 'kbm']
      },
    ]
  },
  {
    id: 'ujian',
    label: 'UJIAN & EVALUASI',
    items: [
      {
        id: 'quiz',
        number: 10,
        label: 'Quiz & Ujian CBT Online',
        icon: HelpCircle,
        badge: 'Siap',
        desc: 'Latihan kuis interaktif, Computer Based Test resmi (PTS, PAS, US), & skor instan',
        keywords: ['ulangan', 'pts', 'pas', 'pat', 'ujian akhir', 'soal ujian', 'tes online', 'timer', 'latihan soal', 'cbt', 'tryout', 'penilaian harian', 'asesmen']
      },
      {
        id: 'grades',
        number: 11,
        label: 'Nilai, Progress & Rapor',
        icon: FileSpreadsheet,
        desc: 'Rekap nilai harian, radar kompetensi, grafik perkembangan, dan salinan rapor digital',
        keywords: ['hasil belajar', 'skor', 'nilai harian', 'rapor', 'e-rapor', 'kkm', 'tuntas', 'remedial', 'grafik nilai', 'prestasi belajar', 'rangking', 'indeks prestasi', 'ipk']
      },
      {
        id: 'boost',
        number: 22,
        label: 'Performa & Nilai Booster (/boost)',
        icon: Zap,
        badge: 'AI Boost',
        desc: 'Booster nilai rapor, diagnostik materi, drill soal intensif & simulator CBT',
        keywords: ['boost', 'booster', 'drill', 'skor', 'nilai naik', 'cbt simulator', 'remedial']
      },
    ]
  },
  {
    id: 'kesiswaan',
    label: 'KESISWAAN & LAYANAN',
    items: [
      {
        id: 'attendance',
        number: 12,
        label: 'Presensi & Pengajuan Izin',
        icon: UserCheck,
        badge: '95.7%',
        desc: 'Riwayat absensi gerbang RFID/kelas & formulir pengajuan izin/sakit daring',
        keywords: ['absen', 'kehadiran', 'bolos', 'sakit', 'izin', 'dispensasi', 'surat dokter', 'alfa', 'terlambat', 'tap gerbang', 'rekap hadir', 'pengajuan sakit', 'tidak masuk']
      },
      {
        id: 'achievements',
        number: 13,
        label: 'Prestasi & Ekstrakurikuler',
        icon: Award,
        desc: 'Portofolio piagam lomba, keikutsertaan ekskul, jadwal latihan, & pembina',
        keywords: ['juara', 'lomba', 'sertifikat', 'piagam', 'ekskul', 'klub', 'futsal', 'pramuka', 'paskibra', 'osis', 'bakat', 'minat', 'latihan']
      },
      {
        id: 'counseling-bk',
        number: 14,
        label: 'BK Konseling & Kedisiplinan',
        icon: HeartPulse,
        badge: 'Privat',
        desc: 'Konsultasi privat bimbingan karir/jurusan, janji temu BK, dan poin tata tertib',
        keywords: ['bimbingan konseling', 'curhat', 'masalah', 'jurusan kuliah', 'karir', 'tata tertib', 'poin pelanggaran', 'kedisiplinan', 'konselor', 'rahasia', 'psikolog']
      },
      {
        id: 'my-documents',
        number: 15,
        label: 'Dokumen, Kartu Pelajar & Event',
        icon: FolderOpen,
        badge: 'Digital ID',
        desc: 'Kartu Pelajar digital QR/Barcode, surat keterangan aktif, dan tiket event sekolah',
        keywords: ['kartu siswa', 'digital id', 'qr code', 'barcode', 'surat aktif sekolah', 'surat keterangan', 'event', 'classmeeting', 'seminar', 'tiket', 'kegiatan sekolah']
      },
    ]
  },
  {
    id: 'mandiri',
    label: 'RUANG MANDIRI & PRODUKTIVITAS',
    items: [
      {
        id: 'ai-assistant',
        number: 16,
        label: 'AI Study Assistant',
        icon: Bot,
        badge: 'Cerdas',
        desc: 'Asisten pintar untuk tanya rumus, penjelasan konsep pelajaran, & rangkuman',
        keywords: ['tanya ai', 'chatbot', 'bot pintar', 'bantuan belajar', 'tutor virtual', 'rumus matematika', 'penjelasan', 'tanya materi', 'pembahas soal']
      },
      {
        id: 'digital-library',
        number: 17,
        label: 'Perpustakaan & Koleksi Favorit',
        icon: Library,
        desc: 'Katalog e-book Kurikulum Merdeka, buku referensi, dan bookmark materi disimpan',
        keywords: ['perpus', 'buku paket', 'peminjaman', 'baca e-book', 'bookmark', 'favorit', 'simpan materi', 'koleksi modul', 'referensi bacaan']
      },
      {
        id: 'personal-todos',
        number: 18,
        label: 'Catatan & Target Mandiri',
        icon: ListTodo,
        desc: 'Buku catatan digital bertag mapel, checklist to-do mandiri, dan target nilai rapor',
        keywords: ['catatan belajar', 'notes', 'to do list', 'tugas pribadi', 'checklist', 'target nilai', 'goal akademik', 'rencana belajar', 'jadwal mandiri']
      },
      {
        id: 'goal',
        number: 23,
        label: 'Target Akademik & Goals (/goal)',
        icon: Target,
        badge: 'Goals',
        desc: 'Pelacak target nilai KKM, target kehadiran, habit belajar & milestones semester',
        keywords: ['goal', 'target', 'kkm', 'target nilai', 'tujuan', 'capaian', 'milestone']
      },
    ]
  },
  {
    id: 'bantuan',
    label: 'BANTUAN & PENGATURAN',
    items: [
      {
        id: 'security-account',
        number: 19,
        label: 'Pengaturan Sistem & Keamanan Akun',
        icon: Settings,
        desc: 'Ganti kata sandi, preferensi KBM, sesi login, 2FA, tema antarmuka & PWA Mobile',
        keywords: ['password', 'kata sandi', 'ganti sandi', 'keamanan', '2fa', 'sesi login', 'hp', 'aplikasi mobile', 'pwa', 'install app', 'notifikasi push', 'pengaturan', 'setting', 'preferensi', 'tema', 'dark mode']
      },
      {
        id: 'help-support',
        number: 20,
        label: 'Pusat Bantuan & FAQ Siswa',
        icon: HelpCircle,
        desc: 'Panduan portal siswa, pencarian FAQ resmi, formulir tiket pengaduan & kontak admin TU',
        keywords: ['faq', 'tanya jawab', 'bantuan', 'cs', 'lapor kendala', 'error', 'cara pakai', 'tutorial', 'customer support', 'panduan', 'helpdesk', 'tiket']
      },
    ]
  }
];

export default function StudentGlassDashboard({
  currentUser,
  onSwitchRole,
  onOpenSettings,
  defaultFeature = 'dashboard',
}: StudentGlassDashboardProps) {
  // Global preferences
  const { theme, setTheme, language, setLanguage, t, dir } = useAppPreferences();
  const isDarkTheme = theme === 'glass' || theme === 'midnight';
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);

  // Navigation State
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [selectedSemester, setSelectedSemester] = useState<string>('Semester Ganjil 2026/2027');
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  
  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchStudentDashboard().then(data => {
      if (data) setDashboardData(data);
    });
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant Widget State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Agenda Reminder Toggles
  const [agendaReminders, setAgendaReminders] = useState<{ [key: string]: boolean }>({
    pts_fisika: true,
    tugas_kimia: true,
    apel_pagi: false,
    tryout_cbt: true
  });

  const toggleReminder = (id: string) => {
    setAgendaReminders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

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

  // Localized navigation groups according to active language
  const localizedNavGroups = useMemo(() => {
    return STUDENT_NAV_GROUPS.map((group) => {
      const groupKey = `group.${group.id}`;
      return {
        ...group,
        label: t(groupKey) !== groupKey ? t(groupKey) : group.label,
        items: group.items.map((item) => {
          const modKey = `mod.${item.id.replace(/-/g, '_')}`;
          const descKey = `mod_desc.${item.id.replace(/-/g, '_')}`;
          const badgeKey = `badge.${item.id.replace(/-/g, '_')}`;
          return {
            ...item,
            label: t(modKey) !== modKey ? t(modKey) : item.label,
            desc: t(descKey) !== descKey ? t(descKey) : item.desc,
            badge: (item.badge && t(badgeKey) !== badgeKey) ? t(badgeKey) : item.badge,
          };
        }),
      };
    });
  }, [t]);

  // Flat list of consolidated modules for quick search indexing
  const allModulesList = useMemo(() => {
    return localizedNavGroups.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.label,
        groupId: group.id
      }))
    );
  }, [localizedNavGroups]);

  // Semantic & Fuzzy Google-like Search Engine
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];

    // Split search input into tokens for multi-term query matching
    const searchTokens = raw.split(/\s+/).filter(Boolean);

    // Compute relevance score for each module
    const scored = allModulesList.map((m) => {
      let score = 0;
      const labelLower = m.label.toLowerCase();
      const descLower = m.desc.toLowerCase();
      const groupLower = m.groupTitle.toLowerCase();
      const badgeLower = m.badge?.toLowerCase() || '';
      const keywords = m.keywords || [];

      // 1. Direct number match
      if (m.number.toString() === raw || `#${m.number}` === raw) {
        score += 100;
      }

      // 2. Exact match in title
      if (labelLower.includes(raw)) {
        score += 50;
      }

      // 3. Match across tokens (like a search engine)
      for (const token of searchTokens) {
        // Keyword match (high relevance semantic intent)
        const matchedKw = keywords.some((kw) => kw.includes(token) || token.includes(kw));
        if (matchedKw) score += 30;

        // Title token match
        if (labelLower.includes(token)) score += 20;

        // Description token match
        if (descLower.includes(token)) score += 10;

        // Group / Category token match
        if (groupLower.includes(token)) score += 5;

        // Badge match
        if (badgeLower.includes(token)) score += 5;
      }

      return { ...m, score };
    });

    // Return modules with positive score, sorted by relevance descending
    return scored
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [searchQuery, allModulesList]);

  const handleSelectModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSearchFocused(false);
    setSearchQuery('');
  };

  const handleAskAi = (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      if (query.toLowerCase().includes('matriks') || query.toLowerCase().includes('determinan')) {
        setAiResponse(
          '💡 Solusi Cepat Determinan 3x3 (Metode Sarrus): Tambahkan 2 kolom pertama di sebelah kanan matriks, jumlahkan hasil kali 3 diagonal utama, lalu kurangi dengan jumlah hasil kali 3 diagonal sekunder. Rumus: det(A) = (aei + bfg + cdh) - (ceg + afh + bdi).'
        );
      } else if (query.toLowerCase().includes('fisika') || query.toLowerCase().includes('newton')) {
        setAiResponse(
          '💡 Konsep Inti Hukum Newton II: Percepatan sebanding dengan gaya total dan berbanding terbalik dengan massa (ΣF = m · a). Jangan lupa: arah percepatan selalu searah dengan resultan gaya total.'
        );
      } else if (query.toLowerCase().includes('kimia') || query.toLowerCase().includes('stoikiometri')) {
        setAiResponse(
          '💡 Trik Stoikiometri: Selalu konversikan semua data ke satuan Mol terlebih dahulu! Mol = Massa / Mr atau Mol = Volume (STP) / 22.4 Liter. Gunakan perbandingan koefisien reaksi untuk menentukan mol zat target.'
        );
      } else {
        setAiResponse(
          `✨ Ringkasan AI untuk "${query}": Fokus pada pemahaman definisi kunci, hubungkan rumus utama dengan contoh soal harian guru, dan pastikan mengulang latihan soal 15 menit sebelum tidur untuk retensi memori jangka panjang.`
        );
      }
      setIsAiLoading(false);
    }, 600);
  };

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
            <div className="absolute bottom-[-10%] left-[5%] w-[750px] h-[750px] rounded-full bg-indigo-500/22 blur-[140px]" />
            <div className="absolute top-[35%] right-[20%] w-[600px] h-[600px] rounded-full bg-rose-400/18 blur-[130px]" />
            <div className="absolute top-[50%] left-[30%] w-[500px] h-[500px] rounded-full bg-emerald-400/15 blur-[120px]" />
          </>
        )}
        {theme === 'midnight' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-900/30 blur-[160px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/25 blur-[160px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex gap-5 lg:gap-6 h-full flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* 2. FLOATING FROSTED GLASS SIDEBAR WITH ALL 36 MODULES                     */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex flex-col w-[290px] shrink-0 theme-glass-container rounded-3xl shadow-[0_12px_35px_-5px_rgba(15,23,42,0.06),0_4px_12px_-2px_rgba(15,23,42,0.03)] p-3.5 justify-between h-full overflow-hidden">
          <div className="flex flex-col overflow-hidden h-full">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-blue-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 truncate">
                    MyAcademic
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700">
                    AI
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span>{t('nav.portal')}</span>
                  <span>•</span>
                  <span className="text-sky-700 font-semibold">{t('nav.brand_sub')}</span>
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
                  className="p-0.5 rounded hover:bg-sky-200/50 cursor-pointer"
                  title="Reset Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navigation Menus with Consolidated Modules Grouped */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
              {localizedNavGroups.map((group) => {
                // If user is searching, filter the items in this group using searchResults IDs
                const filteredItems = searchQuery
                  ? group.items.filter((item) => searchResults.some((sr) => sr.id === item.id))
                  : group.items;

                // Hide empty groups during search
                if (searchQuery && filteredItems.length === 0) {
                  return null;
                }

                const isCollapsed = !searchQuery && collapsedGroups[group.id];

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Section Header with Item Count and Collapse Toggle */}
                    <button
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                                  ? 'bg-sky-50 text-sky-950 shadow-xs border border-sky-300/80 font-semibold'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                                  }`}
                                />
                                <span className="truncate text-left">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                                    isActive
                                      ? 'bg-sky-200/90 text-sky-900 font-bold'
                                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
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
            <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/90 hover:bg-slate-100 border border-slate-200/80 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={dashboardData?.student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={dashboardData?.student?.name || currentUser?.name || 'Siswa'}
                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-sky-500/30"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-slate-900 truncate">
                    {dashboardData?.student?.name || currentUser?.name || 'Siswa'}
                  </h4>
                  <p className="text-[10px] text-slate-500 truncate">Kelas {dashboardData?.student?.class_name || 'Belum ada kelas'}</p>
                </div>
              </div>
              <button
                onClick={() => handleSelectModule('profile')}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-all cursor-pointer"
                title="Buka Profil Saya"
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
                  placeholder={t('nav.search_placeholder')}
                  className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-400/20 rounded-2xl pl-9 pr-14 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                      {t('nav.search_results_count')}: <b className="text-sky-700 font-bold">{searchResults.length}</b>
                    </span>
                    <span className="text-[10px] text-slate-400">{t('nav.press_enter')}</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {t('nav.no_search_results')} "<b>{searchQuery}</b>".
                      <br />
                      <span className="text-[11px] text-slate-400 mt-1 inline-block">
                        {t('nav.suggest_search')}
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
                            className="w-full text-left p-2.5 rounded-xl hover:bg-sky-50/80 border border-transparent hover:border-sky-200/60 transition-all cursor-pointer flex items-center justify-between group"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                                <ModIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold text-xs text-slate-900 group-hover:text-sky-950 truncate">
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

            {/* Header Right Actions: Shortcuts + Visual Theme + Multi-Lang + Notif + Setting + Akun */}
            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              {/* Quick Major Mode Buttons */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-black/5 border border-white/10">
                <button
                  onClick={() => handleSelectModule('goal')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'goal'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
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
                      : 'text-slate-600 hover:text-slate-900'
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
                      : 'text-slate-600 hover:text-slate-900'
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
                    theme === 'formal' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title={t('theme.formal_name')}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('glass')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'glass' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title={t('theme.glass_name')}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('midnight')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'midnight' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
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
                  className={`px-2.5 py-1.5 rounded-2xl bg-black/5 hover:bg-black/10 border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
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

                    <div className="space-y-0.5">
                      {[
                        { code: 'id', name: 'Bahasa Indonesia' },
                        { code: 'en', name: 'English' },
                        { code: 'zh', name: '中文 (简体)' },
                        { code: 'ja', name: '日本語' },
                        { code: 'ar', name: 'العربية (RTL)' },
                      ].map((item) => {
                        const isSelected = language === item.code;
                        return (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => {
                              setLanguage(item.code as any);
                              setShowLangDropdown(false);
                            }}
                            className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? isDarkTheme
                                  ? 'bg-sky-500/25 border border-sky-400/40 text-sky-200 font-bold shadow-xs'
                                  : 'bg-sky-50 border border-sky-200 text-sky-900 font-bold shadow-xs'
                                : isDarkTheme
                                ? 'text-white/85 hover:bg-white/10 hover:text-white border border-transparent font-medium'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent font-medium'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-5 rounded flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                                  isSelected
                                    ? isDarkTheme
                                      ? 'bg-sky-400/30 text-sky-200 border border-sky-300/30'
                                      : 'bg-sky-200 text-sky-900'
                                    : isDarkTheme
                                    ? 'bg-white/10 text-white/70 border border-white/10'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {item.code.toUpperCase()}
                              </span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            {isSelected && (
                              <Check
                                className={`w-3.5 h-3.5 shrink-0 ml-1.5 ${
                                  isDarkTheme ? 'text-sky-300' : 'text-sky-600'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 1. NOTIFIKASI */}
              <button
                onClick={() => handleSelectModule('announcements')}
                className="p-2 sm:p-2.5 rounded-2xl bg-black/5 hover:bg-black/10 border border-white/10 transition-all cursor-pointer relative shadow-xs"
                title={t('mod.announcements')}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {/* 2. SETTING */}
              <button
                onClick={() => {
                  if (onOpenSettings) {
                     onOpenSettings();
                  } else {
                    setInternalSettingsOpen(true);
                  }
                }}
                className="p-2 sm:p-2.5 rounded-2xl bg-black/5 hover:bg-black/10 border border-white/10 transition-all cursor-pointer shadow-xs"
                title={t('nav.settings')}
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* 3. AKUN */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-black/5 hover:bg-black/10 border border-white/10 font-semibold text-xs transition-all cursor-pointer shadow-xs"
                  title={t('nav.open_profile')}
                >
                  <div className="relative shrink-0">
                    <img
                      src={dashboardData?.student?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                      alt={dashboardData?.student?.name || currentUser?.name || 'Siswa'}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-sky-500/30"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-white rounded-full" />
                  </div>
                  <span className="truncate max-w-[120px] hidden sm:inline">{dashboardData?.student?.name || currentUser?.name || 'Siswa'}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                    {t('nav.active_badge')}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account Menu Dropdown */}
                {showRoleDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-64 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/70'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-900/10'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b mb-1.5 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`}>
                        {t('nav.active_student')}
                      </p>
                      <p className={`text-xs font-bold truncate ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.name || 'Fatih (Siswa)'}
                      </p>
                      <p className={`text-[10px] ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>Kelas X-MIPA 1 • NISN: 20241001</p>
                    </div>

                    <div className={`space-y-1 mb-2 pb-2 border-b ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          handleSelectModule('profile');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 font-medium transition-all cursor-pointer ${
                          isDarkTheme
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                        }`}
                      >
                        <UserIcon className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`} />
                        <span>{t('nav.open_profile')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          if (onOpenSettings) onOpenSettings();
                          else handleSelectModule('security-account');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 font-medium transition-all cursor-pointer ${
                          isDarkTheme
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                        }`}
                      >
                        <Settings className={`w-3.5 h-3.5 ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`} />
                        <span>{t('nav.account_settings')}</span>
                      </button>
                    </div>

                    {/* Role Switcher for Testing */}
                    {onSwitchRole && (
                      <div>
                        <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`}>
                          {t('nav.multi_role_test')}
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                          {[
                            { id: 'murid', label: '🎓 Siswa / Murid', desc: 'Dashboard Siswa' },
                            { id: 'guru', label: '👨‍🏫 Guru Pengampu', desc: 'Portal KBM Guru' },
                            { id: 'walikelas', label: '🏫 Wali Kelas', desc: '42 Fitur Asuhan' },
                            { id: 'bk', label: '🧠 Konselor BK', desc: 'Bimbingan Konseling' },
                            { id: 'tu', label: '💼 Tata Usaha (TU)', desc: 'Administrasi Sekolah' },
                            { id: 'kepsek', label: '👑 Kepala Sekolah', desc: 'Portal Eksekutif' },
                            { id: 'admin', label: '🛡️ Admin Sekolah', desc: 'Manajemen Sistem' },
                            { id: 'parent', label: '👨‍👩‍👦 Orang Tua / Wali', desc: 'Monitoring Siswa' },
                            { id: 'superadmin', label: '⚡ Super Admin', desc: 'Platform Owner' }
                          ].map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setShowRoleDropdown(false);
                                onSwitchRole(r.id);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                r.id === 'murid'
                                  ? isDarkTheme
                                    ? 'bg-sky-500/25 text-sky-200 font-semibold border border-sky-400/30'
                                    : 'bg-sky-50 text-sky-950 font-semibold border border-sky-200/70'
                                  : isDarkTheme
                                  ? 'hover:bg-white/10 text-white/80 hover:text-white'
                                  : 'hover:bg-slate-50 text-slate-700 font-medium'
                              }`}
                            >
                              <span className="font-medium truncate">{r.label}</span>
                              <span className={`text-[10px] ml-2 shrink-0 ${isDarkTheme ? 'text-white/50' : 'text-slate-400'}`}>
                                {r.desc}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* SCROLLABLE WORKSPACE CONTENT (Header & Sidebar stay completely pinned) */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 pb-8 scrollbar-thin">
            {/* Conditional Rendering: Jika 'arsip-belajar', render ArsipBelajarStudio */}
            {activeTab === 'arsip-belajar' ? (
              <div className="p-1 sm:p-2">
                <ArsipBelajarStudio onBackToHub={() => handleSelectModule('dashboard')} />
              </div>
            ) : activeTab !== 'dashboard' ? (
              <StudentHubView currentUser={currentUser} initialFeatureId={activeTab} />
            ) : (
            /* ========================================================================= */
            /* 4. MAIN BENTO GRID DASHBOARD (Executive Glass Theme)                     */
            /* ========================================================================= */
            <div className="space-y-6">
              {/* Dashboard Title & Quick Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {t('dash.hero_title')}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                    {t('dash.hero_desc')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
                    {t('dash.active_student_badge') || 'Siswa Aktif'}: {dashboardData?.student?.name || currentUser?.name || 'Siswa'} ({dashboardData?.student?.class_name || 'Belum ada kelas'})
                  </span>
                </div>
              </div>

              {/* FEATURED HERO BANNER: Arsip Belajar AI Studio */}
              <div
                onClick={() => handleSelectModule('arsip-belajar')}
                className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden border border-sky-500/20"
              >
                <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-sky-400/15 blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 font-semibold text-[10px] tracking-wider uppercase shadow-xs">
                        {t('dash.featured_badge') || '✨ FITUR AKADEMIK'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium text-[10px] border border-white/10">
                        {t('dash.featured_sub') || 'STUDIO BELAJAR AI'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{t('dash.featured_title') || 'Arsip Belajar AI (Smart Study Archive)'}</span>
                      <Sparkles className="w-5 h-5 text-sky-300 animate-pulse" />
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                      {t('dash.featured_desc')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectModule('arsip-belajar');
                    }}
                    className="self-start md:self-auto px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center gap-2 cursor-pointer flex-shrink-0 group-hover:translate-x-0.5"
                  >
                    <span>{t('learn.open_archive_btn') || 'Buka Studio Arsip Belajar'}</span>
                    <ArrowRight className="w-4 h-4 text-sky-100" />
                  </button>
                </div>
              </div>

              {/* --------------------------------------------------------------------- */}
              {/* ROW 1: TOP 4 BENTO METRIC CARDS                                       */}
              {/* --------------------------------------------------------------------- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* CARD 1: Distribusi Presensi Siswa */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-900 tracking-tight">
                      Distribusi Presensi
                    </span>
                    <button
                      onClick={() => handleSelectModule('attendance')}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-1 row-span-2 rounded-2xl bg-gradient-to-br from-sky-600 to-blue-700 text-white p-3.5 flex flex-col justify-between shadow-sm">
                      <UserCheck className="w-5 h-5 text-sky-100" />
                      <div>
                        <span className="text-[10px] font-medium text-sky-100 block uppercase">
                          Hadir KBM
                        </span>
                        <span className="text-xl font-bold tracking-tight">95.7%</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-sky-500 text-white p-2.5 flex items-center justify-between shadow-xs">
                      <div>
                        <span className="text-[9px] font-medium text-sky-100 block uppercase">
                          Izin Sakit
                        </span>
                        <span className="text-xs font-bold">2.8%</span>
                      </div>
                      <Send className="w-3.5 h-3.5 text-sky-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="rounded-xl bg-emerald-600 text-white p-2 flex flex-col justify-center shadow-xs">
                        <span className="text-[8px] font-medium uppercase text-emerald-100">Dispen</span>
                        <span className="text-[11px] font-bold">1.5%</span>
                      </div>
                      <div className="rounded-xl bg-slate-500 text-white p-2 flex flex-col justify-center shadow-xs">
                        <span className="text-[8px] font-medium uppercase text-slate-200">Alfa</span>
                        <span className="text-[11px] font-bold">0.0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Tugas Terkumpul & Pending */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Tugas Terkumpul</span>
                    <button
                      onClick={() => handleSelectModule('assignments')}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Buka
                    </button>
                  </div>
                  <div className="flex items-end justify-between my-2">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        18
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        ↑ 18.2% <span className="text-slate-400 font-normal">vs bln lalu</span>
                      </span>
                    </div>
                    <div className="flex items-end gap-1 h-9 pb-1">
                      {[35, 50, 40, 70, 60, 90, 80, 100].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1.5 rounded-full ${
                            i === 7 ? 'bg-sky-600' : 'bg-sky-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Tepat Waktu</span>
                      <span className="font-semibold text-slate-900">16</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Perlu Tindak Lanjut</span>
                      <span className="font-semibold text-amber-600">2</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: Capaian Nilai & KKM */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Indeks Nilai Rata-rata</span>
                    <button
                      onClick={() => handleSelectModule('grades')}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Rapor
                    </button>
                  </div>
                  <div className="flex items-end justify-between my-2">
                    <div>
                      <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        88.5
                      </div>
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        ↑ 3.4 Poin <span className="text-slate-400 font-normal">KKM 75</span>
                      </span>
                    </div>
                    <div className="flex items-end gap-1 h-9 pb-1">
                      {[40, 60, 55, 80, 75, 85, 95].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`w-1.5 rounded-full ${
                            i === 6 ? 'bg-emerald-600' : 'bg-emerald-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>Nilai Tertinggi</span>
                      <span className="font-semibold text-slate-900">96 (Fisika)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Mapel Tuntas KKM</span>
                      <span className="font-semibold text-emerald-600">12 / 12 Mapel</span>
                    </div>
                  </div>
                </div>

                {/* CARD 4: Data Sources & Mapel Aktif */}
                <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-[0_8px_25px_-5px_rgba(15,23,42,0.08)] hover:border-slate-300 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">Mata Pelajaran Aktif</span>
                    <button
                      onClick={() => handleSelectModule('my-subjects')}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                    >
                      Silabus
                    </button>
                  </div>
                  <div className="my-1">
                    <div className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      12
                    </div>
                    <span className="text-[11px] text-slate-500">Mapel Kurikulum Merdeka</span>
                  </div>
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px]" title="Matematika">
                      MTK
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-blue-100 border border-blue-200 text-blue-800 flex items-center justify-center font-bold text-[10px]" title="Fisika">
                      FIS
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[10px]" title="Biologi">
                      BIO
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px]" title="Kimia">
                      KIM
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 border border-cyan-200 text-cyan-800 flex items-center justify-center font-bold text-[10px]" title="B. Indonesia">
                      BIN
                    </div>
                    <span className="text-[10px] font-medium text-slate-500 ml-1">+7</span>
                  </div>
                  <div className="mt-2 text-center py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    ✓ Semua Materi Guru Tersinkron
                  </div>
                </div>
              </div>

              {/* --------------------------------------------------------------------- */}
              {/* ROW 2: MAIN BENTO SECTION (Main 2 Cols + Right Rail 1 Col)            */}
              {/* --------------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT & CENTER: 2 COLUMNS */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Schedule Library */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">
                          Jadwal Pelajaran Hari Ini (Senin)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Sesi KBM aktif di Ruang Kelas & Laboratorium
                        </p>
                      </div>

                      {/* Filter Tabs */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/70">
                        <button
                          onClick={() => setScheduleFilter('all')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            scheduleFilter === 'all'
                              ? 'bg-white text-sky-950 font-semibold shadow-xs border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Semua Sesi
                        </button>
                        <button
                          onClick={() => setScheduleFilter('ongoing')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            scheduleFilter === 'ongoing'
                              ? 'bg-white text-sky-950 font-semibold shadow-xs border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Sedang Berlangsung
                        </button>
                        <button
                          onClick={() => setScheduleFilter('upcoming')}
                          className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                            scheduleFilter === 'upcoming'
                              ? 'bg-white text-sky-950 font-semibold shadow-xs border border-slate-200/60'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Akan Datang
                        </button>
                      </div>
                    </div>

                    {/* Course Card Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                      {/* Course 1: Sedang Berlangsung */}
                      {(scheduleFilter === 'all' || scheduleFilter === 'ongoing') && (
                        <div className="p-4 rounded-2xl bg-sky-50/70 border-2 border-sky-500 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-bl-xl uppercase tracking-wider shadow-xs">
                            Live Now
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-sky-500/25">
                              MTK
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-semibold text-sky-700 block uppercase">
                                07:30 - 09:00 WIB • Jam 1-2
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 truncate">
                                Matematika Wajib
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                Drs. Bambang Sudiro • R. 204 Gedung B
                              </p>
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-sky-200/80">
                                <button
                                  onClick={() => handleSelectModule('materials')}
                                  className="text-[10px] font-medium px-2 py-1 rounded-lg bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 transition-all cursor-pointer shadow-xs"
                                >
                                  📄 Buka Modul
                                </button>
                                <button
                                  onClick={() => handleSelectModule('assignments')}
                                  className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-all cursor-pointer shadow-xs"
                                >
                                  ✍️ Kuis Latihan
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course 2: Akan Datang */}
                      {(scheduleFilter === 'all' || scheduleFilter === 'upcoming') && (
                        <div className="p-4 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-blue-500/20">
                              BIN
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-medium text-slate-500 block uppercase">
                                09:15 - 10:45 WIB • Jam 3-4
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 truncate">
                                Bahasa Indonesia
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                Nurul Hidayati, S.Pd • R. 204 Gedung B
                              </p>
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/70">
                                <span className="text-[10px] font-medium text-slate-500">
                                  Materi: Teks Eksplanasi Ilmiah
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course 3: Praktikum Lab */}
                      {(scheduleFilter === 'all' || scheduleFilter === 'upcoming') && (
                        <div className="p-4 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-sky-600/20">
                              FIS
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-medium text-slate-500 block uppercase">
                                11:00 - 12:30 WIB • Jam 5-6
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 truncate">
                                Fisika Dasar (Praktikum)
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                Ir. Hendra Gunawan • Lab Fisika Lt. 1
                              </p>
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/70">
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200/60">
                                  Bawa Jas Praktikum
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Course 4: Kimia */}
                      {(scheduleFilter === 'all' || scheduleFilter === 'upcoming') && (
                        <div className="p-4 rounded-2xl bg-slate-50/90 hover:bg-white border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-md transition-all group">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-teal-500/20">
                              KIM
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-medium text-slate-500 block uppercase">
                                13:15 - 14:45 WIB • Jam 7-8
                              </span>
                              <h4 className="font-bold text-sm text-slate-900 truncate">
                                Kimia Organik
                              </h4>
                              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                                Dra. Endang Sulistyowati • Lab Kimia
                              </p>
                              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/70">
                                <span className="text-[10px] font-medium text-emerald-700">
                                  ✓ Tugas Minggu Lalu Sudah Dinilai (88)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heatmap & Recent Submissions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Activity Heatmap Grid */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            Matriks Keaktifan Belajar
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Log aktivitas portal per bulan
                          </p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          Tahun 2026
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-1 text-[9px] font-semibold text-slate-400 text-center">
                          {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'].map(
                            (m) => (
                              <div key={m}>{m}</div>
                            )
                          )}
                        </div>
                        {[
                          ['Presensi', [4, 4, 3, 4, 4, 2, 4, 4, 4, 4, 3, 4]],
                          ['Tugas', [3, 4, 4, 3, 4, 1, 3, 4, 4, 3, 2, 3]],
                          ['Kuis AI', [2, 3, 4, 4, 3, 1, 2, 4, 4, 4, 3, 4]],
                          ['Modul', [3, 3, 3, 4, 4, 2, 4, 4, 3, 4, 4, 4]]
                        ].map(([label, scores]: any, rowIdx) => (
                          <div key={rowIdx} className="grid grid-cols-12 gap-1">
                            {scores.map((val: number, colIdx: number) => {
                              const colors = [
                                'bg-slate-100',
                                'bg-sky-100',
                                'bg-sky-200',
                                'bg-sky-400',
                                'bg-sky-600'
                              ];
                              return (
                                <div
                                  key={colIdx}
                                  title={`${label} bulan ke-${colIdx + 1}: Level ${val}`}
                                  className={`h-5 rounded-md ${colors[val]} transition-transform hover:scale-105 cursor-pointer`}
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200/80 text-[10px] text-slate-500 font-medium">
                        <span>Jarang</span>
                        <div className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded bg-sky-100" />
                          <span className="w-2.5 h-2.5 rounded bg-sky-200" />
                          <span className="w-2.5 h-2.5 rounded bg-sky-400" />
                          <span className="w-2.5 h-2.5 rounded bg-sky-600" />
                        </div>
                        <span>Sangat Aktif</span>
                      </div>
                    </div>

                    {/* Recent Assignment Submissions */}
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">
                            Pengumpulan Tugas Terkini
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Berkas terkirim & status nilai
                          </p>
                        </div>
                        <button
                          onClick={() => handleSelectModule('submissions')}
                          className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                        >
                          Semua
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {[
                          {
                            title: 'Laporan Fisika: Termodinamika',
                            ext: 'PDF',
                            color: 'bg-rose-100 text-rose-700',
                            time: '2 jam lalu',
                            score: '92.0 (Tuntas)',
                          },
                          {
                            title: 'Analisis Puisi Modern Bab 2',
                            ext: 'DOCX',
                            color: 'bg-sky-100 text-sky-700',
                            time: 'Kemarin',
                            score: '88.5 (Tuntas)',
                          },
                          {
                            title: 'Slide Presentasi Reaksi Redoks',
                            ext: 'PPTX',
                            color: 'bg-amber-100 text-amber-800',
                            time: '3 hari lalu',
                            score: 'Menunggu Guru',
                          },
                          {
                            title: 'Source Code Web Portofolio',
                            ext: 'ZIP',
                            color: 'bg-emerald-100 text-emerald-700',
                            time: '5 hari lalu',
                            score: '95.0 (Tuntas)',
                          }
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-slate-300 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${item.color}`}
                              >
                                {item.ext}
                              </span>
                              <div className="min-w-0">
                                <h5 className="font-semibold text-slate-900 truncate">
                                  {item.title}
                                </h5>
                                <span className="text-[10px] text-slate-500">
                                  {item.time} • <span className="font-medium text-slate-700">{item.score}</span>
                                </span>
                              </div>
                            </div>
                            <Download className="w-3.5 h-3.5 text-slate-400 hover:text-sky-700 shrink-0 cursor-pointer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN (1 COL): AI Assistant + Agenda + Donut Gauge */}
                <div className="space-y-6">
                  {/* AI Study Assistant Widget */}
                  <div className="bg-white/90 backdrop-blur-xl border border-sky-300/80 rounded-3xl p-5 shadow-[0_8px_30px_-5px_rgba(2,132,199,0.12),0_2px_8px_-2px_rgba(15,23,42,0.03)] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          AI Study Assistant
                        </h4>
                      </div>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        Beta
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mb-3 leading-relaxed font-normal">
                      Tanyakan konsep rumus, rangkum materi sulit, atau cari tips belajar cerdas secara instan.
                    </p>

                    <div className="space-y-2">
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Contoh: Bagaimana cara menghitung determinan matriks 3x3 sarrus?"
                        rows={2}
                        className="w-full bg-slate-50/90 hover:bg-white focus:bg-white border border-sky-200 focus:border-sky-500 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/25 transition-all resize-none shadow-xs"
                      />

                      <button
                        onClick={() => handleAskAi()}
                        disabled={isAiLoading}
                        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-60"
                      >
                        {isAiLoading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Menganalisis Materi...</span>
                          </>
                        ) : (
                          <>
                            <span>Tanya AI Siswa ✨</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* AI Response Display */}
                    {aiResponse && (
                      <div className="mt-3 p-3 rounded-xl bg-sky-50/80 border border-sky-200 text-xs text-slate-800 shadow-xs animate-in fade-in duration-200">
                        <p className="leading-relaxed">{aiResponse}</p>
                      </div>
                    )}

                    {/* Suggested Prompt Chips */}
                    <div className="mt-3 pt-3 border-t border-sky-100 space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-800 block">
                        Rekomendasi Pertanyaan:
                      </span>
                      {[
                        'Rumus cepat Hukum Newton II',
                        'Cara menghitung determinan matriks',
                        'Trik konversi mol Stoikiometri'
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setAiPrompt(prompt);
                            handleAskAi(prompt);
                          }}
                          className="w-full text-left text-[11px] text-slate-700 hover:text-sky-950 bg-sky-50/60 hover:bg-sky-100/80 px-2.5 py-1.5 rounded-lg border border-sky-200/60 flex items-center justify-between transition-all cursor-pointer font-medium"
                        >
                          <span className="truncate">⚡ {prompt}</span>
                          <ChevronRight className="w-3 h-3 text-sky-500 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Agenda Terdekat & Reminder */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          Agenda & Ujian Terjadwal
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Pengingat otomatis kalender siswa
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectModule('calendar')}
                        className="text-[11px] font-medium text-sky-600 hover:text-sky-800 cursor-pointer"
                      >
                        Kalender
                      </button>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          id: 'pts_fisika',
                          title: 'PTS Ganjil Fisika Dasar',
                          time: '12 Okt 2026 • 08:00 WIB',
                          tag: 'CBT Lab',
                          tagColor: 'bg-sky-50 text-sky-800 border border-sky-200/60'
                        },
                        {
                          id: 'tugas_kimia',
                          title: 'Deadline Laporan Praktikum Kimia',
                          time: '14 Okt 2026 • 23:59 WIB',
                          tag: 'Upload',
                          tagColor: 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        },
                        {
                          id: 'tryout_cbt',
                          title: 'Tryout Mandiri Soal Matematika',
                          time: '16 Okt 2026 • 15:00 WIB',
                          tag: 'Mandiri',
                          tagColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                        },
                        {
                          id: 'apel_pagi',
                          title: 'Upacara Hari Pahlawan & Karakter',
                          time: '10 Nov 2026 • 07:00 WIB',
                          tag: 'Lapangan',
                          tagColor: 'bg-slate-100 text-slate-700 border border-slate-200'
                        }
                      ].map((agenda) => (
                        <div
                          key={agenda.id}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-xs transition-all text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <h5 className="font-semibold text-slate-900 truncate">
                              {agenda.title}
                            </h5>
                            <span className="text-[10px] text-slate-500 block mt-0.5">
                              {agenda.time}
                            </span>
                            <span
                              className={`inline-block mt-1 text-[9px] font-semibold px-1.5 py-0.2 rounded ${agenda.tagColor}`}
                            >
                              {agenda.tag}
                            </span>
                          </div>

                          <button
                            onClick={() => toggleReminder(agenda.id)}
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                              agendaReminders[agenda.id] ? 'bg-sky-600' : 'bg-slate-300'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                                agendaReminders[agenda.id] ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Distribusi Capaian Belajar */}
                  <div className="bg-white/90 backdrop-blur-xl border border-slate-200/90 rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">
                          Distribusi Capaian Belajar
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Komposisi evaluasi kompetensi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center my-3">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#e2e8f0"
                            strokeWidth="11"
                            fill="transparent"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#0284c7"
                            strokeWidth="11"
                            strokeDasharray="238.7"
                            strokeDashoffset="75"
                            fill="transparent"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#06b6d4"
                            strokeWidth="11"
                            strokeDasharray="238.7"
                            strokeDashoffset="145"
                            fill="transparent"
                            strokeLinecap="round"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="38"
                            stroke="#10b981"
                            strokeWidth="11"
                            strokeDasharray="238.7"
                            strokeDashoffset="200"
                            fill="transparent"
                            strokeLinecap="round"
                          />
                        </svg>

                        <div className="absolute text-center">
                          <span className="text-2xl font-bold text-slate-900 tracking-tight block">
                            88.5
                          </span>
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Indeks Rapor
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Presensi KBM
                        </span>
                        <span className="font-semibold text-slate-900">95.7%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" /> Tugas & Kuis
                        </span>
                        <span className="font-semibold text-slate-900">88.0%</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ujian Semester
                        </span>
                        <span className="font-semibold text-slate-900">89.5%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Global Bento Grid Settings Modal */}
      <StudentSettingsModal
        isOpen={internalSettingsOpen}
        onClose={() => setInternalSettingsOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
