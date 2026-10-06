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
  Building2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Menu,
  Lock,
  Unlock,
  Eye,
  Megaphone,
  Radio,
  FileCheck,
  FolderArchive,
  HardDrive,
  CreditCard,
  Edit,
  Trash2,
  Filter,
  History,
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchSchoolAdminDashboard,
  fetchSchoolAdminProfile,
  fetchSchoolAdminSettings,
  fetchSchoolAdminUsers,
  fetchSchoolAdminStudents,
  fetchSchoolAdminTeachers,
  fetchSchoolAdminAttendance,
  fetchSchoolAdminLearningMonitoring,
  fetchSchoolAdminDataQuality,
  getStoredUser,
  setStoredUser,
  DEFAULT_USER,
} from '@/lib/api';
import AccountSettingsModal from '@/components/Modals/AccountSettingsModal';
import SchoolAdminHubView, { AdminMenuKey } from '@/components/Views/SchoolAdminHubView';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { toast } from 'react-hot-toast';

interface SchoolAdminGlassDashboardProps {
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
// 52 MASTER SCHOOL ADMIN MODULES (Grouped neatly into functional categories)
// =========================================================================
export const SCHOOL_ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    id: 'admin_utama',
    label: 'UTAMA & PUSAT KONTROL',
    items: [
      {
        id: 'dashboard',
        number: 1,
        label: 'Dashboard Admin',
        icon: LayoutDashboard,
        badge: 'Home',
        desc: 'Ringkasan operasional sekolah, statistik KBM, kehadiran & data Dapodik',
        keywords: ['home', 'beranda', 'utama', 'aktivitas', 'overview', 'ringkasan', 'hari ini', 'kegiatan', 'admin'],
      },
      {
        id: 'profile',
        number: 2,
        label: 'Profil Sekolah & NPSN',
        icon: Building2,
        desc: 'Identitas lembaga, NPSN, akreditasi, kepala sekolah & alamat resmi',
        keywords: ['profil', 'npsn', 'akreditasi', 'lembaga', 'alamat', 'sekolah', 'identitas'],
      },
      {
        id: 'settings',
        number: 3,
        label: 'Pengaturan Sistem',
        icon: Settings,
        desc: 'Konfigurasi portal, logo, semester aktif, dan preferensi operasional',
        keywords: ['pengaturan', 'konfigurasi', 'setting', 'logo', 'portal', 'sistem'],
      },
      {
        id: 'system-health',
        number: 4,
        label: 'System Health & Kuota',
        icon: HardDrive,
        desc: 'Status server, kuota penyimpanan awan, database & lisensi platform',
        keywords: ['server', 'health', 'storage', 'kuota', 'database', 'kapasitas'],
      },
    ],
  },
  {
    id: 'admin_modes',
    label: 'SASARAN MUTU & AKSELERASI (/goal /learn /boost)',
    items: [
      {
        id: 'goal',
        number: 5,
        label: 'Sasaran Mutu & Target (/goal)',
        icon: Target,
        badge: 'Goals',
        desc: 'Pelacak target akreditasi, target kelulusan 100%, standar KKM & milestone semester',
        keywords: ['goal', 'target', 'kkm', 'sasaran mutu', 'akreditasi', 'kelulusan', 'milestone'],
      },
      {
        id: 'learn',
        number: 6,
        label: 'Monitoring Kurikulum & KBM (/learn)',
        icon: BookOpen,
        badge: 'Learn',
        desc: 'Studio monitoring KBM live, verifikasi RPP Merdeka, repositori kurikulum & jam efektif',
        keywords: ['learn', 'belajar', 'kurikulum', 'kbm', 'rpp', 'silabus', 'studio'],
      },
      {
        id: 'boost',
        number: 7,
        label: 'Akselerator Operasional (/boost)',
        icon: Zap,
        badge: 'AI Boost',
        desc: 'Akselerator efisiensi sekolah, optimasi Dapodik, penyeimbang beban guru & ANBK',
        keywords: ['boost', 'booster', 'akselerator', 'efisiensi', 'dapodik', 'anbk', 'remedial'],
      },
    ],
  },
  {
    id: 'admin_lembaga',
    label: 'LEMBAGA & KALENDER',
    items: [
      {
        id: 'sekolah-kalender',
        number: 8,
        label: 'Kalender Akademik',
        icon: Calendar,
        badge: 'Agenda',
        desc: 'Agenda tahun ajaran, jadwal PTS/PAS, libur nasional & kegiatan sekolah',
        keywords: ['kalender', 'jadwal', 'libur', 'agenda', 'ujian', 'semester'],
      },
      {
        id: 'sekolah-tahun-ajaran',
        number: 9,
        label: 'Tahun Ajaran & Semester',
        icon: Clock,
        desc: 'Manajemen periode aktif TA 2026/2027 Ganjil/Genap & transisi semester',
        keywords: ['tahun ajaran', 'periode', 'semester', 'ganjil', 'genap'],
      },
      {
        id: 'sekolah-pengaturan',
        number: 10,
        label: 'Kebijakan & Aturan Sekolah',
        icon: ShieldCheck,
        desc: 'Standar KKM 75, toleransi keterlambatan, dan ambang batas presensi',
        keywords: ['kkm', 'aturan', 'kebijakan', 'toleransi', 'tata tertib'],
      },
    ],
  },
  {
    id: 'admin_pengguna',
    label: 'MANAJEMEN PENGGUNA',
    items: [
      {
        id: 'pengguna-siswa',
        number: 11,
        label: 'Manajemen Data Siswa',
        icon: Users,
        badge: '480 Siswa',
        desc: 'Direktori peserta didik, NISN, status aktif, kelas & verifikasi berkas',
        keywords: ['siswa', 'murid', 'nisn', 'peserta didik', 'daftar siswa'],
      },
      {
        id: 'pengguna-guru',
        number: 12,
        label: 'Manajemen Data Guru (PTK)',
        icon: GraduationCap,
        badge: '36 Guru',
        desc: 'Direktori pendidik, NIP/NUPTK, sertifikasi, beban jam ajar & status kepegawaian',
        keywords: ['guru', 'ptk', 'nip', 'pendidik', 'pengajar', 'sertifikasi'],
      },
      {
        id: 'pengguna-ortu',
        number: 13,
        label: 'Akun Orang Tua / Wali',
        icon: HeartPulse,
        desc: 'Pemetaan wali murid, kontak WhatsApp darurat & akses portal orang tua',
        keywords: ['orang tua', 'wali', 'wali murid', 'kontak', 'keluarga'],
      },
      {
        id: 'pengguna-staff',
        number: 14,
        label: 'Tenaga Kependidikan (TU)',
        icon: UserCheck,
        desc: 'Data staf Tata Usaha, petugas lab, perpustakaan & operator dapodik',
        keywords: ['tu', 'staff', 'tata usaha', 'pegawai', 'operator'],
      },
      {
        id: 'pengguna-roles',
        number: 15,
        label: 'Hak Akses & Roles',
        icon: Lock,
        desc: 'Matriks izin akses modul, proteksi data pribadi & peran administratif',
        keywords: ['roles', 'rbac', 'hak akses', 'izin', 'keamanan'],
      },
    ],
  },
  {
    id: 'admin_akademik',
    label: 'AKADEMIK & STRUKTUR KELAS',
    items: [
      {
        id: 'akademik-rombel',
        number: 16,
        label: 'Rombongan Belajar (Rombel)',
        icon: Layers,
        badge: '18 Rombel',
        desc: 'Daftar rombel jenjang X, XI, XII, alokasi ruang & wali kelas penetapan',
        keywords: ['rombel', 'kelas', 'ruang', 'wali kelas', 'tingkat'],
      },
      {
        id: 'akademik-mapel',
        number: 17,
        label: 'Mata Pelajaran & Silabus',
        icon: BookOpen,
        desc: 'Kurikulum Merdeka/K13, mata pelajaran wajib, peminatan & muatan lokal',
        keywords: ['mapel', 'mata pelajaran', 'kurikulum', 'silabus', 'kkm'],
      },
      {
        id: 'akademik-teaching-assignment',
        number: 18,
        label: 'Plotting Guru Mengajar',
        icon: Compass,
        desc: 'Distribusi penugasan guru pengampu mapel per rombel & beban JP',
        keywords: ['plotting', 'penugasan', 'guru mengajar', 'beban ajar', 'sk'],
      },
      {
        id: 'akademik-enrollment',
        number: 19,
        label: 'Penempatan & Mutasi Kelas',
        icon: UserCheck,
        desc: 'Distribusi siswa ke rombel baru, split kelas & mutasi internal',
        keywords: ['enrollment', 'penempatan', 'pembagian kelas', 'pindah kelas'],
      },
      {
        id: 'akademik-kenaikan-kelas',
        number: 20,
        label: 'Kenaikan Kelas & Kelulusan',
        icon: Award,
        desc: 'Sidang pleno kelulusan, penetapan naik kelas otomatis & arsip kelulusan',
        keywords: ['kenaikan', 'kelulusan', 'pleno', 'alumni', 'lulus'],
      },
    ],
  },
  {
    id: 'admin_jadwal',
    label: 'JADWAL & PRESENSI OPERASIONAL',
    items: [
      {
        id: 'jadwal-pelajaran',
        number: 21,
        label: 'Jadwal Pelajaran Sekolah',
        icon: CalendarDays,
        badge: 'Mingguan',
        desc: 'Master timetable KBM mingguan, deteksi bentrok jam guru & ruangan',
        keywords: ['jadwal', 'roster', 'timetable', 'bentrok', 'jam belajar'],
      },
      {
        id: 'presensi-siswa',
        number: 22,
        label: 'Monitoring Presensi Siswa',
        icon: UserCheck,
        badge: 'Live',
        desc: 'Rekap kehadiran RFID gate, persentase hadir harian, sakit, izin & alpa',
        keywords: ['presensi', 'absensi', 'kehadiran', 'rfid', 'rekap hadir'],
      },
      {
        id: 'presensi-guru',
        number: 23,
        label: 'Presensi Guru & Staff',
        icon: Clock,
        desc: 'Presensi kehadiran pendidik, jam datang/pulang & surat izin dinas luar',
        keywords: ['absen guru', 'kehadiran ptk', 'jam datang', 'izin dinas'],
      },
      {
        id: 'presensi-koreksi',
        number: 24,
        label: 'Koreksi Absensi & Dispensasi',
        icon: Edit,
        badge: 'Koreksi',
        desc: 'Validasi permohonan koreksi status absensi, surat dokter & dispensasi resmi',
        keywords: ['koreksi', 'dispensasi', 'izin resmi', 'surat sakit'],
      },
    ],
  },
  {
    id: 'admin_kbm_monitoring',
    label: 'KBM, NILAI & RAPOR',
    items: [
      {
        id: 'kbm-jurnal',
        number: 25,
        label: 'Jurnal Mengajar Guru',
        icon: FileText,
        badge: 'Harian',
        desc: 'Monitoring keterisian agenda KBM harian, materi tersampaikan & kendala',
        keywords: ['jurnal', 'agenda kbm', 'materi ajar', 'pantau guru'],
      },
      {
        id: 'monitoring-nilai',
        number: 26,
        label: 'Ledger Nilai & KKM',
        icon: FileSpreadsheet,
        desc: 'Rekap ledger nilai tugas, UH, PTS, PAS seluruh mapel & pemantauan KKM',
        keywords: ['ledger', 'nilai', 'rekap nilai', 'kkm', 'uh', 'pts', 'pas'],
      },
      {
        id: 'monitoring-gradebook',
        number: 27,
        label: 'Kunci / Buka Ledger Nilai',
        icon: Lock,
        desc: 'Penguncian administratif ledger sebelum pencetakan rapor semester',
        keywords: ['kunci nilai', 'lock gradebook', 'deadline nilai', 'tutup input'],
      },
      {
        id: 'monitoring-rapor',
        number: 28,
        label: 'Verifikasi & Cetak Rapor',
        icon: Award,
        badge: 'E-Rapor',
        desc: 'Generate salinan digital e-rapor, tanda tangan kepala sekolah & cetak massal',
        keywords: ['rapor', 'e-rapor', 'cetak rapor', 'tanda tangan', 'legalisir'],
      },
    ],
  },
  {
    id: 'admin_layanan_data',
    label: 'LAYANAN, DATA & INTEGRASI',
    items: [
      {
        id: 'data-quality',
        number: 29,
        label: 'Validasi & Data Quality Dapodik',
        icon: ShieldAlert,
        badge: 'Audit',
        desc: 'Pemeriksaan anomali data, kelengkapan NIK/NISN & integritas data induk',
        keywords: ['data quality', 'dapodik', 'validasi', 'anomali', 'duplikasi'],
      },
      {
        id: 'io-import',
        number: 30,
        label: 'Impor & Ekspor Data Excel',
        icon: Download,
        desc: 'Sinkronisasi massal spreadsheet siswa, guru, jadwal KBM & nilai',
        keywords: ['import', 'export', 'excel', 'csv', 'sinkronisasi', 'dapodik'],
      },
      {
        id: 'setup-wizard',
        number: 31,
        label: 'Setup Wizard Awal Tahun',
        icon: Sparkles,
        badge: 'Wizard',
        desc: 'Panduan langkah demi langkah inisialisasi semester baru & kenaikan kelas',
        keywords: ['wizard', 'setup', 'awal tahun', 'inisialisasi', 'migrasi'],
      },
      {
        id: 'audit-log',
        number: 32,
        label: 'Audit Log & Rekam Jejak',
        icon: History,
        desc: 'Histori aktivitas pengguna, perubahan nilai, penghapusan data & login',
        keywords: ['audit', 'log', 'histori', 'aktivitas', 'keamanan', 'jejak'],
      },
    ],
  },
];

export default function SchoolAdminGlassDashboard({
  currentUser,
  onSwitchRole,
  onOpenSettings,
  defaultFeature = 'dashboard',
}: SchoolAdminGlassDashboardProps) {
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
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [dataQualityData, setDataQualityData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchSchoolAdminDashboard(),
      fetchSchoolAdminProfile(),
      fetchSchoolAdminDataQuality(),
    ])
      .then(([dash, prof, dq]) => {
        if (dash) setDashboardData(dash);
        if (prof?.profile) setProfileData(prof.profile);
        if (dq) setDataQualityData(dq);
      })
      .catch(() => {
        toast.error('Gagal memuat ringkasan admin sekolah.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Dropdown click outside listeners
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

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Flat list of modules for search indexing
  const allModulesList = useMemo(() => {
    return SCHOOL_ADMIN_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.label,
        groupId: group.id,
      }))
    );
  }, []);

  // Semantic & Fuzzy Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const scored = allModulesList.map((mod) => {
      let score = 0;
      if (mod.label.toLowerCase() === q) score += 100;
      else if (mod.label.toLowerCase().includes(q)) score += 50;
      if (mod.id.toLowerCase().includes(q)) score += 40;
      if (mod.desc.toLowerCase().includes(q)) score += 20;
      if (mod.keywords?.some((k) => k.toLowerCase().includes(q))) score += 30;
      return { ...mod, score };
    });
    return scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  }, [searchQuery, allModulesList]);

  // Mobile Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Interactive Goal (/goal) State
  const [goalCategoryFilter, setGoalCategoryFilter] = useState<'all' | 'akreditasi' | 'kkm' | 'kehadiran' | 'lulusan' | 'dapodik'>('all');
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState<boolean>(false);
  const [newGoalForm, setNewGoalForm] = useState({
    title: '',
    target: '100%',
    category: 'akreditasi',
    targetDate: '2026-12-15',
  });
  const [institutionalGoals, setInstitutionalGoals] = useState([
    { id: 'goal-1', title: 'Sinkronisasi Dapodik Semester Ganjil 100%', target: '100%', actual: '100%', pct: 100, status: 'Tercapai', category: 'dapodik', icon: '📡', completed: true },
    { id: 'goal-2', title: 'Verifikasi Modul Ajar Kurikulum Merdeka Guru', target: '95%', actual: '92%', pct: 92, status: 'On-Track', category: 'akreditasi', icon: '📖', completed: false },
    { id: 'goal-3', title: 'Pelaksanaan Tryout CBT & Asesmen Nasional ANBK', target: '100%', actual: '98%', pct: 98, status: 'On-Track', category: 'kkm', icon: '💻', completed: false },
    { id: 'goal-4', title: 'Ketuntasan Nilai KKM Rapor Siswa Seluruh Rombel', target: '90%', actual: '84.6%', pct: 85, status: 'Sedang Proses', category: 'kkm', icon: '📊', completed: false },
    { id: 'goal-5', title: 'Penerbitan & Legalisir E-Rapor Digital Tepat Waktu', target: '18 Des', actual: 'Persiapan', pct: 75, status: 'Sesuai Jadwal', category: 'lulusan', icon: '🎓', completed: false },
    { id: 'goal-6', title: 'Target Kehadiran RFID Siswa & Guru Minimal 96%', target: '96%', actual: '96.2%', pct: 96, status: 'Tercapai', category: 'kehadiran', icon: '✅', completed: true },
  ]);

  const toggleGoalCompletion = (id: string) => {
    setInstitutionalGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          const nextCompleted = !g.completed;
          return {
            ...g,
            completed: nextCompleted,
            pct: nextCompleted ? 100 : Math.max(50, g.pct - 15),
            status: nextCompleted ? 'Tercapai' : 'On-Track',
          };
        }
        return g;
      })
    );
    toast.success('Status sasaran mutu berhasil diperbarui!');
  };

  const handleCreateNewGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalForm.title.trim()) {
      toast.error('Judul sasaran mutu tidak boleh kosong.');
      return;
    }
    const newEntry = {
      id: `goal-${Date.now()}`,
      title: newGoalForm.title.trim(),
      target: newGoalForm.target,
      actual: '0%',
      pct: 15,
      status: 'On-Track',
      category: newGoalForm.category,
      icon: '🎯',
      completed: false,
    };
    setInstitutionalGoals((prev) => [newEntry, ...prev]);
    setIsAddGoalModalOpen(false);
    setNewGoalForm({ title: '', target: '100%', category: 'akreditasi', targetDate: '2026-12-15' });
    toast.success('Sasaran mutu baru berhasil ditambahkan!');
  };

  // Interactive Learn (/learn) State
  const [learnRombelFilter, setLearnRombelFilter] = useState<'all' | 'X' | 'XI' | 'XII'>('all');
  const [isRppModalOpen, setIsRppModalOpen] = useState<boolean>(false);
  const [selectedRpp, setSelectedRpp] = useState<any>(null);
  const [rppList, setRppList] = useState([
    { id: 'rpp-1', mapel: 'Matematika Tingkat Lanjut', guru: 'Siti Rahma, M.Pd', rombel: 'XI-IPA 1', status: 'Terverifikasi', cp: 'CP Fase F Aljabar & Fungsi', file: 'Modul_Ajar_MTK_XI_2026.pdf' },
    { id: 'rpp-2', mapel: 'Fisika Termodinamika', guru: 'Dr. Budi Santoso', rombel: 'X-MIPA 2', status: 'Menunggu Review', cp: 'CP Fase E Pengukuran & Energi', file: 'RPP_Fisika_FaseE.pdf' },
    { id: 'rpp-3', mapel: 'Kimia Larutan Penyangga', guru: 'Dra. Endang S.', rombel: 'XI-IPA 2', status: 'Terverifikasi', cp: 'CP Fase F Stoikiometri Reaksi', file: 'Modul_Kimia_Organik.pdf' },
    { id: 'rpp-4', mapel: 'Biologi Sintesis Protein', guru: 'Ratna Dewi, M.Si', rombel: 'XII-MIPA 1', status: 'Menunggu Review', cp: 'CP Fase F Genetika Molekuler', file: 'RPP_Biologi_Genetika.pdf' },
  ]);

  const handleVerifyRpp = (id: string, newStatus: string) => {
    setRppList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    toast.success(`RPP berhasil ditandai sebagai: ${newStatus}`);
    setIsRppModalOpen(false);
  };

  // Interactive Boost (/boost) State
  const [isAuditRunning, setIsAuditRunning] = useState<boolean>(false);
  const [auditStep, setAuditStep] = useState<number>(0);
  const [auditProgress, setAuditProgress] = useState<number>(0);
  const [auditCompleted, setAuditCompleted] = useState<boolean>(false);
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState<boolean>(false);
  const [isCbtTestRunning, setIsCbtTestRunning] = useState<boolean>(false);
  const [cbtTestResult, setCbtTestResult] = useState<any>(null);

  const handleRunAutoAudit = () => {
    setIsAuditRunning(true);
    setAuditCompleted(false);
    setAuditProgress(10);
    setAuditStep(1);

    setTimeout(() => {
      setAuditProgress(40);
      setAuditStep(2);
    }, 500);

    setTimeout(() => {
      setAuditProgress(75);
      setAuditStep(3);
    }, 1000);

    setTimeout(() => {
      setAuditProgress(100);
      setAuditStep(4);
      setIsAuditRunning(false);
      setAuditCompleted(true);
      toast.success('Auto-Audit Integritas Data & AI Booster Sekolah Berhasil Selesai!');
    }, 1500);
  };

  const handleRunCbtSim = () => {
    setIsCbtTestRunning(true);
    setTimeout(() => {
      setIsCbtTestRunning(false);
      setCbtTestResult({
        latency: '3.8 ms',
        bandwidth: '198.4 Mbps',
        clientStatus: '120/120 Client Siap',
        serverLoad: '12% CPU / 4.2 GB RAM',
        status: 'Optimal (Siap 100%)',
      });
      toast.success('Simulasi Kesiapan Server CBT & ANBK Berhasil!');
    }, 800);
  };

  const handleSelectModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSearchFocused(false);
    setSearchQuery('');
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      if (moduleId === 'goal') window.history.pushState(null, '', '/goal');
      else if (moduleId === 'learn') window.history.pushState(null, '', '/learn');
      else if (moduleId === 'boost') window.history.pushState(null, '', '/boost');
      else if (moduleId === 'dashboard') window.history.pushState(null, '', '/admin');
    }
  };

  // Supported languages list
  const LANGUAGES = [
    { code: 'id', name: 'Bahasa Indonesia' },
    { code: 'en', name: 'English (US)' },
    { code: 'zh', name: '中文 (简体)' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
  ];

  return (
    <div
      dir={dir}
      className="h-screen w-full bg-transparent font-sans relative antialiased selection:bg-indigo-200 selection:text-indigo-900 overflow-hidden flex flex-col"
    >
      {/* 1. Ambient Blurred Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'formal' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[680px] h-[680px] rounded-full bg-indigo-200/40 blur-[140px]" />
            <div className="absolute top-[8%] left-[-10%] w-[580px] h-[580px] rounded-full bg-blue-200/35 blur-[130px]" />
            <div className="absolute top-[45%] right-[5%] w-[540px] h-[540px] rounded-full bg-slate-200/30 blur-[140px]" />
          </>
        )}
        {theme === 'glass' && (
          <>
            <div className="absolute top-[-15%] left-[15%] w-[800px] h-[650px] rounded-full bg-indigo-500/20 blur-[130px]" />
            <div className="absolute top-[5%] right-[-5%] w-[700px] h-[700px] rounded-full bg-sky-400/22 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[5%] w-[750px] h-[750px] rounded-full bg-blue-600/20 blur-[140px]" />
            <div className="absolute top-[35%] right-[20%] w-[600px] h-[600px] rounded-full bg-amber-400/15 blur-[130px]" />
          </>
        )}
        {theme === 'midnight' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-950/40 blur-[160px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-slate-900/30 blur-[160px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex gap-5 lg:gap-6 h-full flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* 2. FLOATING FROSTED GLASS SIDEBAR                                         */}
        {/* ========================================================================= */}
        <aside className="hidden lg:flex flex-col w-[295px] shrink-0 theme-glass-container rounded-3xl shadow-[0_12px_35px_-5px_rgba(15,23,42,0.06),0_4px_12px_-2px_rgba(15,23,42,0.03)] p-3.5 justify-between h-full overflow-hidden">
          <div className="flex flex-col overflow-hidden h-full">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 via-blue-600 to-sky-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/25 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white truncate">
                    MyAcademic
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                    ADMIN
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <span>Portal Kelola</span>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                    {profileData?.nama_sekolah || 'Admin Sekolah'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Filter Status Indicator inside Sidebar */}
            {searchQuery && (
              <div className="mx-1 mb-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-between text-xs text-indigo-800 dark:text-indigo-300">
                <span className="font-medium text-[11px] truncate">
                  Pencarian: <b className="font-semibold">"{searchQuery}"</b> ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-500 hover:text-indigo-700 text-xs ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Scrollable Navigation Groups */}
            <nav className="flex-1 overflow-y-auto pr-1 space-y-3.5 text-xs scrollbar-thin">
              {SCHOOL_ADMIN_NAV_GROUPS.map((group) => {
                const isCollapsed = collapsedGroups[group.id];
                const activeItemInGroup = group.items.find((i) => i.id === activeTab);

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Category Title & Toggle */}
                    <div
                      onClick={() => toggleGroupCollapse(group.id)}
                      className="flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{group.label}</span>
                        {activeItemInGroup && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-200 shrink-0 ${
                          isCollapsed ? '-rotate-90' : ''
                        }`}
                      />
                    </div>

                    {/* Nav Items */}
                    {!isCollapsed && (
                      <div className="space-y-0.5">
                        {group.items.map((item) => {
                          const IconComp = item.icon;
                          const isActive = activeTab === item.id;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelectModule(item.id)}
                              className={`w-full text-left px-2.5 py-2 rounded-2xl flex items-center justify-between group transition-all duration-150 cursor-pointer ${
                                isActive
                                  ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/25'
                                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium'
                              }`}
                              title={item.desc}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <IconComp
                                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                                    isActive
                                      ? 'text-white'
                                      : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                                  }`}
                                />
                                <span className="truncate text-xs">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wide ${
                                    isActive
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
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
            </nav>

            {/* Sidebar Footer: School Operational Badge */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 mt-1">
              <div className="px-2.5 py-2 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                    NPSN: {profileData?.npsn || '20109988'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate block">
                    Akreditasi {profileData?.akreditasi || 'A (Unggul)'}
                  </span>
                </div>
                <button
                  onClick={() => handleSelectModule('setup-wizard')}
                  className="p-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all cursor-pointer shadow-xs"
                  title="Buka Setup Wizard"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 3. MAIN WORKSPACE CANVAS                                                  */}
        {/* ========================================================================= */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* TOP FROSTED GLASS HEADER BAR */}
          <header className="theme-glass-container rounded-3xl p-3 sm:p-4 mb-4 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.04)] flex items-center justify-between gap-3 shrink-0">
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-white/10 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shrink-0"
              title="Buka Menu Modul Admin"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Header Left: Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Cari modul admin sekolah... (Tekan Ctrl + K)"
                  className="w-full pl-9 pr-14 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-400 bg-white/40 dark:bg-white/10 rounded border border-white/20 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  Ctrl K
                </kbd>
              </div>

              {/* Instant Search Results Dropdown */}
              {isSearchFocused && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 z-50 max-h-80 overflow-y-auto space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Hasil Pencarian ({searchResults.length})
                  </div>
                  {searchResults.slice(0, 8).map((mod) => (
                    <button
                      key={mod.id}
                      onClick={() => handleSelectModule(mod.id)}
                      className="w-full text-left p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-white/5 flex items-center justify-between group transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <mod.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {mod.label}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {mod.groupTitle} • {mod.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Header Right: Quick Major Mode Buttons + Theme + Lang + Notifications + Account */}
            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              {/* Quick Major Mode Buttons (/goal /learn /boost) */}
              <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10">
                <button
                  onClick={() => handleSelectModule('goal')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'goal'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Target & Sasaran Mutu Sekolah (/goal)"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Goals</span>
                </button>
                <button
                  onClick={() => handleSelectModule('learn')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'learn'
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Monitoring Kurikulum & Pembelajaran (/learn)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn</span>
                </button>
                <button
                  onClick={() => handleSelectModule('boost')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'boost'
                      ? 'bg-purple-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Akselerator Operasional & Mutu (/boost)"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Boost</span>
                </button>
              </div>

              {/* Theme Switcher Pill (Formal, Glass, Midnight) */}
              <div className="flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10" title="Tema Tampilan">
                <button
                  onClick={() => setTheme('formal')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'formal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Formal White"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('glass')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'glass' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Executive Glass"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('midnight')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'midnight' ? 'bg-indigo-900 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title="Midnight Dark"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Multi-Language Dropdown */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLangDropdown((prev) => !prev)}
                  className="px-2.5 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-white/10 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs text-slate-700 dark:text-slate-200"
                  title={`Bahasa: ${language.toUpperCase()}`}
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="uppercase text-[11px] font-bold">{language}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showLangDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-52 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-white/10 mb-1">
                      Pilih Bahasa
                    </div>
                    {LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLanguage(item.code as any);
                          setShowLangDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          language === item.code
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-300'
                            : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <span>{item.name}</span>
                        {language === item.code && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Quality Alert Indicator */}
              <button
                onClick={() => handleSelectModule('data-quality')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all cursor-pointer shadow-xs"
                title="Pemeriksaan Integritas Data Dapodik"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline text-[11px] font-bold">
                  {dataQualityData?.total_issues || 5} Isu
                </span>
              </button>

              {/* Setting Button */}
              <button
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  else setInternalSettingsOpen(true);
                }}
                className="p-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-white/10 transition-all cursor-pointer shadow-xs text-slate-700 dark:text-slate-200"
                title="Pengaturan Akun & Sekolah"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* User Profile & Role Switcher Dropdown */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-white/10 font-semibold text-xs transition-all cursor-pointer shadow-xs text-slate-800 dark:text-white"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-indigo-500/30 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="truncate max-w-[120px] hidden sm:inline">
                    {currentUser?.name || 'Hendra Pratama'}
                  </span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                    Admin
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-64 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/70'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Admin Sekolah Aktif
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {currentUser?.name || 'Hendra Pratama, S.Kom'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {profileData?.nama_sekolah || 'SMA Negeri Unggulan 1 Jakarta'}
                      </p>
                    </div>

                    <div className="space-y-1 mb-2 pb-2 border-b border-slate-100 dark:border-white/10">
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          handleSelectModule('profile');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center gap-2.5 font-medium hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Profil Lembaga</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          if (onOpenSettings) onOpenSettings();
                          else setInternalSettingsOpen(true);
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center gap-2.5 font-medium hover:bg-slate-50 dark:hover:bg-white/10 cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pengaturan Akun</span>
                      </button>
                    </div>

                    {/* Role Switcher */}
                    {onSwitchRole && (
                      <div>
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Beralih Peran (Multi-Role)
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                          {[
                            { id: 'murid', label: '🎓 Siswa / Murid', desc: 'Portal Siswa' },
                            { id: 'guru', label: '👨‍🏫 Guru Pengampu', desc: 'Portal KBM Guru' },
                            { id: 'walikelas', label: '🏫 Wali Kelas', desc: 'Asuhan Kelas' },
                            { id: 'bk', label: '🧠 Konselor BK', desc: 'Bimbingan Konseling' },
                            { id: 'tu', label: '💼 Tata Usaha (TU)', desc: 'Administrasi TU' },
                            { id: 'kepsek', label: '👑 Kepala Sekolah', desc: 'Portal Eksekutif' },
                            { id: 'admin', label: '🛡️ Admin Sekolah', desc: 'Pusat Kontrol' },
                            { id: 'parent', label: '👨‍👩‍👦 Orang Tua / Wali', desc: 'Portal Wali' },
                            { id: 'superadmin', label: '⚡ Super Admin', desc: 'Platform Owner' },
                          ].map((r) => (
                            <button
                              key={r.id}
                              onClick={() => {
                                setShowRoleDropdown(false);
                                onSwitchRole(r.id);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                                r.id === 'admin'
                                  ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-300'
                                  : 'hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="font-medium truncate">{r.label}</span>
                              <span className="text-[10px] text-slate-400 ml-2 shrink-0">{r.desc}</span>
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

          {/* SCROLLABLE WORKSPACE CONTENT CANVAS */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 pb-8 scrollbar-thin">
            {/* ========================================================================= */}
            {/* VIEW 1: BENTO FROSTED GLASS DASHBOARD ADMIN SEKOLAH                       */}
            {/* ========================================================================= */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 1. School Operational Authority Hero Banner */}
                <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-xl border border-indigo-500/20 relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 font-semibold text-[10px] tracking-wider uppercase">
                          PORTAL RESMI ADMIN SEKOLAH
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-semibold text-[10px]">
                          Akreditasi {profileData?.akreditasi || 'A (Unggul)'}
                        </span>
                      </div>
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                        <span>{profileData?.nama_sekolah || 'SMA Negeri Unggulan 1 Jakarta'}</span>
                        <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                      </h1>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Pusat kendali operasional KBM, integrasi data Dapodik, penjadwalan terpadu, presensi RFID harian, dan penerbitan e-rapor resmi Kurikulum Merdeka.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
                      <button
                        onClick={() => handleSelectModule('goal')}
                        className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Sasaran Mutu (/goal)</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('setup-wizard')}
                        className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Setup Wizard</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Top 4 Executive Bento Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Siswa & Presensi Harian */}
                  <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Peserta Didik Aktif
                      </span>
                      <button
                        onClick={() => handleSelectModule('pengguna-siswa')}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Kelola
                      </button>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {dashboardData?.stats?.total_siswa || 480}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> 96.2% Presensi KBM
                        </span>
                        <span className="text-[11px] text-slate-400">• 18 Rombel</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[96.2%]" />
                    </div>
                  </div>

                  {/* Card 2: Pendidik & Tenaga Kependidikan */}
                  <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Pendidik & PTK
                      </span>
                      <button
                        onClick={() => handleSelectModule('pengguna-guru')}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Direktori
                      </button>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {dashboardData?.stats?.total_guru || 36}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                          32 Guru Sertifikasi
                        </span>
                        <span className="text-[11px] text-slate-400">• 100% Terplot</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full w-[92%]" />
                    </div>
                  </div>

                  {/* Card 3: KBM & Silabus Berjalan */}
                  <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Monitoring KBM Live
                      </span>
                      <button
                        onClick={() => handleSelectModule('learn')}
                        className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      >
                        Pantau
                      </button>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        18 Sesi
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          100% Kelas Aktif
                        </span>
                        <span className="text-[11px] text-slate-400">• 94% Jurnal Terisi</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full w-[94%]" />
                    </div>
                  </div>

                  {/* Card 4: Integritas Dapodik & Audit */}
                  <div className="bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md transition-all flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Integritas Dapodik
                      </span>
                      <button
                        onClick={() => handleSelectModule('data-quality')}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Audit
                      </button>
                    </div>
                    <div>
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        99.2%
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          0 Duplikasi NIK/NISN
                        </span>
                        <span className="text-[11px] text-slate-400">• Sinkron</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[99.2%]" />
                    </div>
                  </div>
                </div>

                {/* 3. Quick Action Operations Bar */}
                <div className="p-4 sm:p-5 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Aksi Cepat Operasional:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleSelectModule('pengguna-siswa')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Tambah Siswa / Guru</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('presensi-koreksi')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Koreksi Absensi</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('monitoring-gradebook')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        <span>Kunci Ledger Nilai</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('io-import')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Import / Ekspor</span>
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectModule('boost')}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Jalankan AI Booster (/boost)</span>
                  </button>
                </div>

                {/* 4. Two Column Operational Grid: KBM Radar + Kalender & Audit */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): Monitoring Rombel & KBM Status */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Status Pembelajaran & KBM Rombel Hari Ini
                          </h3>
                        </div>
                        <button
                          onClick={() => handleSelectModule('learn')}
                          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                        >
                          Lihat Studio KBM →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { rombel: 'X-MIPA 1', mapel: 'Matematika Wajib', guru: 'Siti Rahma, M.Pd', status: 'Sesi Berlangsung', kehadiran: '97.2%', progress: 85 },
                          { rombel: 'X-MIPA 2', mapel: 'Fisika Dasar', guru: 'Dr. Budi Santoso', status: 'Sesi Berlangsung', kehadiran: '94.4%', progress: 78 },
                          { rombel: 'XI-IPA 1', mapel: 'Kimia Organik', guru: 'Dra. Endang S.', status: 'Jurnal Terverifikasi', kehadiran: '98.1%', progress: 92 },
                          { rombel: 'XI-IPS 1', mapel: 'Sosiologi', guru: 'Ahmad Fauzi, S.Pd', status: 'Sesi Selesai', kehadiran: '95.0%', progress: 90 },
                          { rombel: 'XII-MIPA 1', mapel: 'Biologi Genetika', guru: 'Ratna Dewi, M.Si', status: 'Sesi Berlangsung', kehadiran: '100.0%', progress: 95 },
                        ].map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {item.rombel}
                                </span>
                                <span className="text-slate-400">•</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold truncate">
                                  {item.mapel}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                Guru: {item.guru} • Kehadiran: <b className="text-emerald-600 dark:text-emerald-400">{item.kehadiran}</b>
                              </p>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0">
                              {item.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column (5 cols): Milestone Kalender & Notifikasi */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-amber-500" />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            Agenda & Milestone Terdekat
                          </h3>
                        </div>
                        <button
                          onClick={() => handleSelectModule('sekolah-kalender')}
                          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          Kalender →
                        </button>
                      </div>

                      <div className="space-y-3">
                        {[
                          { date: '12 Okt 2026', title: 'Sinkronisasi Akhir Dapodik Cut-Off', tag: 'Dapodik', color: 'bg-indigo-500' },
                          { date: '19 Okt 2026', title: 'Pelaksanaan PTS Ganjil TA 2026/2027', tag: 'Ujian CBT', color: 'bg-amber-500' },
                          { date: '26 Okt 2026', title: 'Batas Akhir Input Nilai Tengah Semester', tag: 'Ledger', color: 'bg-rose-500' },
                          { date: '10 Nov 2026', title: 'Simulasi Tryout ANBK Bersama', tag: 'Asesmen', color: 'bg-emerald-500' },
                        ].map((evt, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-start gap-3 text-xs"
                          >
                            <span className={`w-2 h-2 rounded-full ${evt.color} mt-1.5 shrink-0`} />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white text-xs">
                                {evt.title}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                <span>{evt.date}</span>
                                <span>•</span>
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{evt.tag}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: 🎯 SASARAN MUTU & TARGET OPERASIONAL SEKOLAH (/goal)             */}
            {/* ========================================================================= */}
            {activeTab === 'goal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Banner Goal */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          {t('admin_goal.badge') || 'SASARAN MUTU INSTITUSI (/goal)'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          Status: On-Track (94.2%)
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>{t('admin_goal.title') || 'Pusat Target & Sasaran Kinerja Institusi Sekolah'}</span>
                        <Target className="w-6 h-6 text-amber-400 shrink-0" />
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {t('admin_goal.desc') || 'Pelacak target akreditasi sekolah A Unggul, target kelulusan 100%, standar ketuntasan KKM seluruh rombel, rasio kehadiran, dan milestone kalender semester.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                      <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                        <span className="text-[10px] text-slate-300 block uppercase font-bold">{t('admin_goal.target_accreditation') || 'Target Akreditasi'}</span>
                        <span className="text-xl font-black text-amber-300">96.5 / 100</span>
                      </div>
                      <button
                        onClick={() => setIsAddGoalModalOpen(true)}
                        className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>{t('admin_goal.add_btn') || '+ Tambah Sasaran'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Bento Target Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t('admin_goal.target_grad') || 'Target Kelulusan'}</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">100.0%</div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-full" />
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Prediksi kelulusan 100% siswa kelas XII</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t('admin_goal.target_kkm') || 'Ketuntasan KKM Sekolah'}</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">84.6%</div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full w-[84.6%]" />
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block">Standar KKM 75.0 (+9.6% vs semester lalu)</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t('admin_goal.target_attendance') || 'Rasio Kehadiran Sekolah'}</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">96.2%</div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full w-[96.2%]" />
                    </div>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold block">Target kehadiran minimum 95.0% terpenuhi</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{t('admin_goal.target_career') || 'Serapan PTN & Karir'}</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">88.5%</div>
                    <div className="w-full bg-slate-100 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full w-[88.5%]" />
                    </div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block">SNBP, SNBT & Kemitraan Industri</span>
                  </div>
                </div>

                {/* Milestone Targets Detailed List with Category Filter */}
                <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Milestone Sasaran Mutu Operasional ({institutionalGoals.filter((g) => goalCategoryFilter === 'all' || g.category === goalCategoryFilter).length} Sasaran)
                      </h3>
                    </div>
                    {/* Goal Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/70 dark:border-white/10">
                      {[
                        { id: 'all', label: 'Semua' },
                        { id: 'akreditasi', label: 'Akreditasi' },
                        { id: 'kkm', label: 'KKM & Asesmen' },
                        { id: 'kehadiran', label: 'Kehadiran' },
                        { id: 'lulusan', label: 'Kelulusan' },
                        { id: 'dapodik', label: 'Dapodik' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setGoalCategoryFilter(cat.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                            goalCategoryFilter === cat.id
                              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {institutionalGoals
                      .filter((item) => goalCategoryFilter === 'all' || item.category === goalCategoryFilter)
                      .map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2 hover:border-amber-400/50 transition-all"
                        >
                          <div className="flex items-center justify-between font-bold text-xs">
                            <div className="flex items-center gap-2.5">
                              <button
                                onClick={() => toggleGoalCompletion(item.id)}
                                className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                                  item.completed
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-slate-300 dark:border-white/20 hover:border-amber-500'
                                }`}
                                title="Klik untuk tandai selesai / on-track"
                              >
                                {item.completed && <Check className="w-3.5 h-3.5" />}
                              </button>
                              <span className={`text-slate-900 dark:text-white flex items-center gap-2 ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}`}>
                                <span>{item.icon}</span>
                                <span>{item.title}</span>
                              </span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.completed
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                            }`}>
                              {item.status} ({item.pct}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${item.completed ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                              style={{ width: `${item.pct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                            <span>Target: {item.target}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Realisasi: {item.actual}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Rombel KKM Breakdown Grid & Institutional Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Rombel KKM Ledger Card */}
                  <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                        Ketuntasan KKM per Rombongan Belajar
                      </h4>
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        Standar KKM: 75.0
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {[
                        { rombel: 'X-MIPA 1', avg: 88.2, status: 'Tuntas', pct: 95, color: 'text-emerald-600' },
                        { rombel: 'X-MIPA 2', avg: 76.4, status: 'Tuntas', pct: 82, color: 'text-emerald-600' },
                        { rombel: 'XI-IPA 1', avg: 89.5, status: 'Tuntas', pct: 98, color: 'text-emerald-600' },
                        { rombel: 'XI-IPS 1', avg: 81.0, status: 'Tuntas', pct: 88, color: 'text-emerald-600' },
                        { rombel: 'XII-MIPA 1', avg: 91.4, status: 'Unggul', pct: 100, color: 'text-emerald-600' },
                      ].map((item, idx) => (
                        <div key={idx} className="p-3 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{item.rombel}</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">Rata-rata Nilai: <b className="text-slate-800 dark:text-slate-200">{item.avg}</b></p>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                            {item.status} ({item.pct}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Institutional Strategic Insights */}
                  <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        Analisis Mutu & Rekomendasi Sasaran
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                        AI Mutu
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-500/20 text-xs">
                        <h5 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Kekuatan Sasaran Institusi
                        </h5>
                        <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-1">
                          Rasio presensi KBM mencapai 96.2% dan 0 anomali duplikasi NIK pada sinkronisasi Dapodik terakhir.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-500/20 text-xs">
                        <h5 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Area Intervensi Utama
                        </h5>
                        <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-1">
                          12 peserta didik teridentifikasi membutuhkan bimbingan remedial KKM Fisika dan Matematika sebelum pelaksanaan PTS.
                        </p>
                      </div>

                      <button
                        onClick={() => handleSelectModule('boost')}
                        className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
                      >
                        <Zap className="w-4 h-4" />
                        <span>Akselerasi Solusi Mutu di AI Booster (/boost)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: 📖 MONITORING KURIKULUM & KBM SEKOLAH (/learn)                    */}
            {/* ========================================================================= */}
            {activeTab === 'learn' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Banner Learn */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-sky-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 border border-sky-400/30">
                          {t('admin_learn.badge') || 'MONITORING KURIKULUM & KBM (/learn)'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">
                          48 Mata Pelajaran Terdata
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>{t('admin_learn.title') || 'Studio Monitoring Pembelajaran & Kurikulum Sekolah'}</span>
                        <BookOpen className="w-6 h-6 text-sky-400 shrink-0" />
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {t('admin_learn.desc') || 'Pusat verifikasi modul ajar RPP Kurikulum Merdeka, monitoring status KBM live seluruh ruang kelas, repositori perangkat kurikulum, dan evaluasi ketercapaian jam efektif.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                      <button
                        onClick={() => setIsRppModalOpen(true)}
                        className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Verifikasi RPP (4)</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('akademik-mapel')}
                        className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center gap-2"
                      >
                        <span>Mapel & Silabus</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Hub Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => setIsRppModalOpen(true)}
                    className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-sky-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                      {t('admin_learn.verify_rpp') || 'Verifikasi RPP Merdeka'}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      42 dari 46 modul ajar guru telah diverifikasi & sesuai Capaian Pembelajaran (CP).
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      setLearnRombelFilter('all');
                      toast.success('Menampilkan seluruh KBM 18 rombel kelas aktif.');
                    }}
                    className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {t('admin_learn.live_kbm') || 'Monitoring KBM Live'}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Pantau jalannya sesi tatap muka di 18 ruang kelas & laboratorium secara real-time.
                    </p>
                  </div>

                  <div
                    onClick={() => handleSelectModule('kbm-jurnal')}
                    className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      {t('admin_learn.teacher_journal') || 'Jurnal Mengajar Guru'}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      Evaluasi ketercapaian silabus harian, catatan refleksi pendidik & kendala KBM.
                    </p>
                  </div>

                  <div
                    onClick={() => handleSelectModule('kbm-ujian')}
                    className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {t('admin_learn.cbt_bank') || 'Bank Soal & CBT Ujian'}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      1.250 butir soal terverifikasi siap pakai untuk pelaksanaan PTS & PAS semester ini.
                    </p>
                  </div>
                </div>

                {/* Live Classrooms Radar with Filter */}
                <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-sky-600" />
                        Radar KBM Ruang Kelas & Laboratorium
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Status KBM aktif tatap muka sesi berjalan TA 2026/2027 Ganjil
                      </p>
                    </div>

                    {/* Level Filter Tabs */}
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200/70 dark:border-white/10">
                      {[
                        { id: 'all', label: 'Semua (18 Rombel)' },
                        { id: 'X', label: 'Jenjang X' },
                        { id: 'XI', label: 'Jenjang XI' },
                        { id: 'XII', label: 'Jenjang XII' },
                      ].map((lvl) => (
                        <button
                          key={lvl.id}
                          onClick={() => setLearnRombelFilter(lvl.id as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            learnRombelFilter === lvl.id
                              ? 'bg-sky-600 text-white font-bold shadow-xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {[
                      { rombel: 'X-MIPA 1', jenjang: 'X', mapel: 'Matematika Wajib', guru: 'Siti Rahma, M.Pd', ruang: 'R. 101', jam: '07:30 - 09:00', hadir: '35/36', status: 'Sesi Berlangsung', statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' },
                      { rombel: 'X-MIPA 2', jenjang: 'X', mapel: 'Fisika Dasar', guru: 'Dr. Budi Santoso', ruang: 'Lab Fisika', jam: '07:30 - 09:00', hadir: '34/36', status: 'Sesi Berlangsung', statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' },
                      { rombel: 'XI-IPA 1', jenjang: 'XI', mapel: 'Kimia Organik', guru: 'Dra. Endang S.', ruang: 'Lab Kimia', jam: '07:30 - 09:00', hadir: '36/36', status: 'Jurnal Terverifikasi', statusColor: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300' },
                      { rombel: 'XI-IPS 1', jenjang: 'XI', mapel: 'Sosiologi', guru: 'Ahmad Fauzi, S.Pd', ruang: 'R. 204', jam: '07:30 - 09:00', hadir: '35/35', status: 'Sesi Berlangsung', statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' },
                      { rombel: 'XII-MIPA 1', jenjang: 'XII', mapel: 'Biologi Genetika', guru: 'Ratna Dewi, M.Si', ruang: 'R. 301', jam: '07:30 - 09:00', hadir: '36/36', status: 'Sesi Berlangsung', statusColor: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' },
                      { rombel: 'XII-IPS 1', jenjang: 'XII', mapel: 'Geografi Wilayah', guru: 'Joko Susilo, M.Pd', ruang: 'R. 302', jam: '07:30 - 09:00', hadir: '34/34', status: 'Jurnal Terverifikasi', statusColor: 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300' },
                    ]
                      .filter((c) => learnRombelFilter === 'all' || c.jenjang === learnRombelFilter)
                      .map((cls, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span className="text-slate-900 dark:text-white">{cls.rombel}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${cls.statusColor}`}>{cls.status}</span>
                          </div>
                          <p className="font-semibold text-xs text-sky-600 dark:text-sky-400">{cls.mapel}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-white/10">
                            <span>{cls.guru}</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{cls.ruang} • {cls.hadir}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Curriculum Verification Progress Table */}
                <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Status Ketercapaian Kurikulum per Rumpun Mapel
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Progres jam tatap muka efektif & verifikasi RPP Kurikulum Merdeka
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                      Tahun Ajaran 2026/2027 Ganjil
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { rumpun: 'MIPA & Informatika', mapel: 'Matematika, Fisika, Kimia, Biologi, Informatika', progress: 92, guru: 14, rombel: 18, color: 'bg-blue-600' },
                      { rumpun: 'Bahasa & Literasi', mapel: 'Bahasa Indonesia, Bahasa Inggris, Bahasa Asing', progress: 88, guru: 10, rombel: 18, color: 'bg-indigo-600' },
                      { rumpun: 'Sosial & Humaniora', mapel: 'Sejarah, Geografi, Ekonomi, Sosiologi, PPKn', progress: 95, guru: 12, rombel: 18, color: 'bg-emerald-600' },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{r.rumpun}</span>
                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{r.progress}% On-Track</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{r.mapel}</p>
                        <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                          <div className={`${r.color} h-full rounded-full`} style={{ width: `${r.progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>{r.guru} Guru Pengampu</span>
                          <span>{r.rombel} Rombel Terlayani</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: ⚡ AKSELERATOR OPERASIONAL & MUTU SEKOLAH (/boost)                */}
            {/* ========================================================================= */}
            {activeTab === 'boost' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Banner Boost */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-purple-500/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30">
                          {t('admin_boost.badge') || 'AI AKSELERATOR OPERASIONAL (/boost)'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          Efisiensi +38%
                        </span>
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
                        <span>{t('admin_boost.title') || 'Akselerator Kinerja Operasional & Diagnostic Booster'}</span>
                        <Zap className="w-6 h-6 text-purple-300 shrink-0" />
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        {t('admin_boost.desc') || 'Optimasi otomatisasi data Dapodik, deteksi dini siswa butuh remedial, penyeimbangan beban mengajar guru, dan simulator kesiapan Asesmen Nasional (ANBK).'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                      <button
                        onClick={handleRunAutoAudit}
                        disabled={isAuditRunning}
                        className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2"
                      >
                        <Zap className={`w-4 h-4 ${isAuditRunning ? 'animate-spin' : ''}`} />
                        <span>{isAuditRunning ? `Menganalisis... (${auditProgress}%)` : (t('admin_boost.run_audit') || 'Jalankan Auto-Audit Sekarang')}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Live Auto-Audit Simulator Progress State */}
                {isAuditRunning && (
                  <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 backdrop-blur-xl animate-in fade-in duration-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                      <span>Proses Multi-Step AI Booster Sekolah...</span>
                      <span>{auditProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${auditProgress}%` }} />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {auditStep === 1 && 'Memeriksa validitas NIK, NISN, dan nomor rombel Dapodik...'}
                      {auditStep === 2 && 'Menganalisis disparitas beban mengajar guru (ambang 24–40 JTM)...'}
                      {auditStep === 3 && 'Menguji kapasitas throughput server CBT 200 Mbps & 120 client PC...'}
                      {auditStep === 4 && 'Menyelesaikan rekomendasi optimalisasi mutu sekolah...'}
                    </p>
                  </div>
                )}

                {auditCompleted && (
                  <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Auto-Audit AI Berhasil: 4 pilar operasional sekolah telah teroptimasi dengan integritas 99.8%.</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium">Baru saja selesai</span>
                  </div>
                )}

                {/* 3 Diagnostic Booster Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="p-5 rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xl space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">
                      DIAGNOSTIK AKADEMIK 1
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {t('admin_boost.remedial_title') || 'Deteksi Siswa Butuh Remedial KKM'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      12 siswa teridentifikasi berada di bawah KKM 75 pada mapel Fisika & Matematika. Butuh penugasan remedial sebelum PTS.
                    </p>
                    <button
                      onClick={() => setIsRemedialModalOpen(true)}
                      className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Buka Daftar Remedial Siswa (12)</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-3xl border border-sky-300/80 dark:border-sky-500/30 bg-sky-50/70 dark:bg-sky-950/30 backdrop-blur-xl space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400 block">
                      OPTIMASI BEBAN 2
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {t('admin_boost.workload_title') || 'Workload Balancer Jam Mengajar Guru'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Seluruh 36 pendidik telah memenuhi standar 24–40 Jam Tatap Muka (JTM) per minggu untuk kelayakan tunjangan profesi.
                    </p>
                    <button
                      onClick={() => handleSelectModule('akademik-teaching-assignment')}
                      className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Periksa Alokasi Jam Mengajar</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-3xl border border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 backdrop-blur-xl space-y-3 shadow-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
                      KESIAPAN ASESMEN 3
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {t('admin_boost.anbk_title') || 'Simulator Kesiapan ANBK / CBT Sekolah'}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {cbtTestResult
                        ? `Latency: ${cbtTestResult.latency} • Bandwidth: ${cbtTestResult.bandwidth} • ${cbtTestResult.clientStatus}`
                        : 'Kapasitas server CBT, bandwidth 200 Mbps & 120 client PC laboratorium siap 100% untuk simulasi Asesmen Nasional.'}
                    </p>
                    <button
                      onClick={handleRunCbtSim}
                      disabled={isCbtTestRunning}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <HardDrive className={`w-3.5 h-3.5 ${isCbtTestRunning ? 'animate-spin' : ''}`} />
                      <span>{isCbtTestRunning ? 'Menguji Server...' : 'Uji Kesiapan Infrastruktur CBT'}</span>
                    </button>
                  </div>
                </div>

                {/* Operational Projection & Performance Matrix */}
                <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-white/10 shadow-xs backdrop-blur-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        Matriks Proyeksi Kinerja & Efisiensi Operasional Sekolah
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Hasil analisis prediktif terhadap mutu lulusan, ketuntasan kurikulum, dan akurasi pelaporan Dapodik
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Prediksi Rata-rata Ujian</span>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">86.2</div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +2.8 poin vs target
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Kecepatan Terbit Rapor</span>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100% On-Time</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Estimasi 18 Des 2026</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Integritas Data Dapodik</span>
                      <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">99.8%</div>
                      <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">Siap Audit Pengawas</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Indeks Kepuasan Layanan</span>
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">4.8 / 5.0</div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Kategori Sangat Memuaskan</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: ALL 49 SPECIFIC ADMINISTRATIVE MODULES DELEGATION                */}
            {/* ========================================================================= */}
            {activeTab !== 'dashboard' && activeTab !== 'goal' && activeTab !== 'learn' && activeTab !== 'boost' && (
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-3 sm:p-5 border border-slate-200/90 dark:border-white/10 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)]">
                <SchoolAdminHubView
                  currentUser={currentUser}
                  hideSidebar={true}
                  hideHeader={true}
                  externalActiveMenu={activeTab as AdminMenuKey}
                  onMenuChange={(menu) => handleSelectModule(menu)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* 1. Modal: Tambah Sasaran Mutu Baru */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Tambah Sasaran Mutu Baru</h3>
              </div>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewGoal} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Sasaran / Target KPI
                </label>
                <input
                  type="text"
                  value={newGoalForm.title}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, title: e.target.value })}
                  placeholder="Contoh: Digitalisasi Arsip E-Rapor 100%"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Sasaran
                  </label>
                  <select
                    value={newGoalForm.category}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none font-medium"
                  >
                    <option value="akreditasi">Akreditasi & Mutu</option>
                    <option value="kkm">KKM & Asesmen</option>
                    <option value="kehadiran">Presensi Kehadiran</option>
                    <option value="lulusan">Kelulusan & Karir</option>
                    <option value="dapodik">Integritas Dapodik</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target Angka / Capaian
                  </label>
                  <input
                    type="text"
                    value={newGoalForm.target}
                    onChange={(e) => setNewGoalForm({ ...newGoalForm, target: e.target.value })}
                    placeholder="Contoh: 100% atau 95.0"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Tanggal Capaian
                </label>
                <input
                  type="date"
                  value={newGoalForm.targetDate}
                  onChange={(e) => setNewGoalForm({ ...newGoalForm, targetDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md cursor-pointer"
                >
                  Simpan Sasaran Mutu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Verifikasi RPP Kurikulum Merdeka */}
      {isRppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-sky-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Verifikasi RPP / Modul Ajar Guru</h3>
              </div>
              <button
                onClick={() => setIsRppModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Periksa kesesuaian Capaian Pembelajaran (CP) dan Alur Tujuan Pembelajaran (ATP) modul ajar Kurikulum Merdeka pendidik.
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-thin">
              {rppList.map((rpp) => (
                <div
                  key={rpp.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{rpp.mapel} ({rpp.rombel})</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      rpp.status === 'Terverifikasi'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}>
                      {rpp.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Pendidik: {rpp.guru}</span>
                    <span className="font-mono">{rpp.file}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/10">
                    <span className="text-[10px] text-slate-400">{rpp.cp}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleVerifyRpp(rpp.id, 'Terverifikasi')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] cursor-pointer"
                      >
                        Setujui RPP
                      </button>
                      <button
                        onClick={() => handleVerifyRpp(rpp.id, 'Perlu Revisi')}
                        className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold text-[10px] cursor-pointer"
                      >
                        Catatan Revisi
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={() => setIsRppModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal: Daftar Siswa Remedial KKM */}
      {isRemedialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Daftar Siswa Butuh Remedial KKM</h3>
              </div>
              <button
                onClick={() => setIsRemedialModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Daftar peserta didik dengan nilai di bawah ambang batas KKM 75.0 yang memerlukan intervensi tugas remedial sebelum PTS.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
              {[
                { name: 'Bagas Satria Wijaya', nisn: '008129381', rombel: 'X-MIPA 2', mapel: 'Fisika Dasar', nilai: 70.8, guru: 'Dr. Budi Santoso' },
                { name: 'Siti Nadia Nurhaliza', nisn: '008129385', rombel: 'X-MIPA 1', mapel: 'Matematika Wajib', nilai: 72.0, guru: 'Siti Rahma, M.Pd' },
                { name: 'Rian Hidayat', nisn: '007482910', rombel: 'XI-IPA 2', mapel: 'Kimia Organik', nilai: 73.2, guru: 'Dra. Endang S.' },
                { name: 'Farhan Maulana', nisn: '007482914', rombel: 'XI-IPS 1', mapel: 'Sosiologi', nilai: 74.0, guru: 'Ahmad Fauzi, S.Pd' },
                { name: 'Anisa Putri Maharani', nisn: '008129399', rombel: 'X-MIPA 2', mapel: 'Fisika Dasar', nilai: 71.5, guru: 'Dr. Budi Santoso' },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white">{s.name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      NISN: {s.nisn} • {s.rombel} • Mapel: <b className="text-amber-600 dark:text-amber-400">{s.mapel}</b>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">{s.nilai}</span>
                    <span className="block text-[9px] text-slate-400">KKM 75</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/10">
              <span className="text-xs text-slate-500">Total: 12 Siswa Terdata</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRemedialModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    toast.success('Pemberitahuan remedial berhasil dikirimkan ke guru pengampu & siswa!');
                    setIsRemedialModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md cursor-pointer"
                >
                  Kirim Notifikasi Remedial Massal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Modal: Responsive Slide-Over Frosted Glass Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative flex flex-col w-full max-w-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl h-full shadow-2xl p-4 z-10 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">MyAcademic Admin</h4>
                  <p className="text-[10px] text-slate-400">Pusat Navigasi Modul</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Modes in Mobile Drawer */}
            <div className="grid grid-cols-3 gap-1.5 my-3">
              <button
                onClick={() => handleSelectModule('goal')}
                className={`py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'goal' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Goals</span>
              </button>
              <button
                onClick={() => handleSelectModule('learn')}
                className={`py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'learn' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learn</span>
              </button>
              <button
                onClick={() => handleSelectModule('boost')}
                className={`py-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  activeTab === 'boost' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Boost</span>
              </button>
            </div>

            {/* Scrollable Grouped Modules */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-xs">
              {SCHOOL_ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.id} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const IconComp = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectModule(item.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white font-bold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <IconComp className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-black/10 dark:bg-white/10 shrink-0">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account & School Profile Modal */}
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
