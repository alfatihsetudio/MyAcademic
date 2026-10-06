'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Lock,
  Eye,
  FileText,
  UserCheck,
  UserX,
  History,
  ShieldCheck,
  Megaphone,
  Bell,
  Radio,
  FileCheck,
  Award,
  ChevronRight,
  ChevronDown,
  Sparkles,
  School as SchoolIcon,
  HelpCircle,
  BarChart3,
  TrendingUp,
  FolderArchive,
  ArrowRightLeft,
  X,
  Check,
  ExternalLink,
  Edit,
  Trash2,
  Building2,
  Inbox,
  Send,
  FileSignature,
  Printer,
  QrCode,
  AlertCircle,
  Briefcase,
  Target,
  Zap,
  Sun,
  Moon,
  Globe,
  MoreVertical,
  ArrowRight,
  Flame,
  User as UserIcon,
  Copy,
  CheckSquare,
  Square,
  Play,
  Menu,
  FileCode,
  Share2
} from 'lucide-react';
import { User } from '@/lib/types';
import { fetchTuDashboard, getStoredUser, setStoredUser, DEFAULT_USER } from '@/lib/api';
import AccountSettingsModal from '@/components/Modals/AccountSettingsModal';
import TuHubView, { TuMenuKey } from '@/components/Views/TuHubView';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { toast } from 'react-hot-toast';

interface TuGlassDashboardProps {
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

export const TU_NAV_GROUPS: NavGroup[] = [
  {
    id: 'utama',
    label: 'UTAMA & OPERASIONAL',
    items: [
      {
        id: 'dashboard',
        number: 1,
        label: 'Dashboard Tata Usaha',
        icon: LayoutDashboard,
        badge: 'Home',
        desc: 'Ringkasan operasional TU, administrasi hari ini, task queue, dan metrik sekolah',
        keywords: ['home', 'beranda', 'utama', 'aktivitas', 'sapaan', 'overview', 'ringkasan', 'hari ini', 'kegiatan', 'pantau', 'tu']
      },
      {
        id: 'agenda-kalender',
        number: 2,
        label: 'Kalender & Agenda Sekolah',
        icon: Calendar,
        badge: 'Agenda',
        desc: 'Jadwal kegiatan akademik, rapat dinas, agenda kepala sekolah & hari libur',
        keywords: ['kalender', 'agenda', 'jadwal', 'rapat', 'dinas', 'kegiatan', 'libur', 'waktu']
      },
      {
        id: 'notifikasi',
        number: 3,
        label: 'Pengumuman & Warta Resmi',
        icon: Bell,
        badge: 'Warta',
        desc: 'Warta dinas, surat edaran penting, notifikasi disposisi baru & peringatan sistem',
        keywords: ['pemberitahuan', 'pesan sekolah', 'info penting', 'edaran', 'surat', 'peringatan', 'lonceng', 'warta']
      },
    ]
  },
  {
    id: 'kesiswaan',
    label: 'KESISWAAN ADMINISTRATIF',
    items: [
      {
        id: 'siswa-data',
        number: 4,
        label: 'Buku Induk & Data Siswa',
        icon: GraduationCap,
        desc: 'Administrasi buku induk, rombel siswa, NISN, NIK, dan biodata Dapodik',
        keywords: ['buku induk', 'siswa', 'rombel', 'nisn', 'nik', 'dapodik', 'kelas', 'biodata']
      },
      {
        id: 'siswa-ortu',
        number: 5,
        label: 'Data Orang Tua & Wali',
        icon: Users,
        desc: 'Kontak wali murid, pekerjaan, alamat domisili, dan nomor darurat keluarga',
        keywords: ['orang tua', 'wali', 'ayah', 'ibu', 'kontak', 'telepon', 'darurat', 'keluarga']
      },
      {
        id: 'siswa-mutasi',
        number: 6,
        label: 'Mutasi Siswa (Masuk/Keluar)',
        icon: ArrowRightLeft,
        badge: 'Mutasi',
        desc: 'Buku mutasi siswa masuk, keluar pindah sekolah, dan surat rekomendasi',
        keywords: ['mutasi', 'pindah', 'masuk', 'keluar', 'surat pindah', 'rekomendasi']
      },
      {
        id: 'siswa-kelulusan',
        number: 7,
        label: 'Administrasi Kelulusan & SKL',
        icon: Award,
        desc: 'Penetapan kelulusan, nomor seri ijazah, cetak SKL sementara, & transkrip',
        keywords: ['lulus', 'skl', 'ijazah', 'kelulusan', 'nomor ijazah', 'transkrip']
      },
      {
        id: 'siswa-alumni',
        number: 8,
        label: 'Buku Induk & Alumni',
        icon: BookOpen,
        desc: 'Database penelusuran tamatan (tracer study) dan riwayat angkatan alumni',
        keywords: ['alumni', 'tracer', 'tamatan', 'angkatan', 'kuliah', 'kerja']
      },
      {
        id: 'siswa-dokumen',
        number: 9,
        label: 'Berkas Dokumen Siswa',
        icon: FolderArchive,
        badge: 'Arsip',
        desc: 'Pusat scan berkas Akta Lahir, KK, KTP ortu, Ijazah SMP, & NISN',
        keywords: ['berkas', 'akta', 'kk', 'ijazah smp', 'dokumen siswa', 'scan']
      },
    ]
  },
  {
    id: 'kepegawaian',
    label: 'KEPEGAWAIAN GURU & TENDIK',
    items: [
      {
        id: 'pegawai-guru',
        number: 10,
        label: 'Administrasi Guru (Pendidik)',
        icon: Users,
        desc: 'Data PTK guru, NUPTK, sertifikasi, beban jam mengajar (JJG), & SK pembagian tugas',
        keywords: ['guru', 'ptk', 'nuptk', 'sertifikasi', 'sk mengajar', 'pendidik', 'jam']
      },
      {
        id: 'pegawai-tendik',
        number: 11,
        label: 'Tenaga Kependidikan (Tendik)',
        icon: Briefcase,
        desc: 'Data staf tata usaha, pustakawan, laboran, teknisi IT, & tenaga kebersihan',
        keywords: ['tendik', 'staf', 'laboran', 'pustakawan', 'kebersihan', 'satpam', 'teknisi']
      },
      {
        id: 'pegawai-dokumen',
        number: 12,
        label: 'Dokumen Pegawai & SK Dinas',
        icon: FileCheck,
        desc: 'Arsip SK Pengangkatan, SK Berkala, PAK, ijazah terakhir, & sertifikat pelatihan',
        keywords: ['sk', 'sk dinas', 'pak', 'ijazah guru', 'kenaikan pangkat', 'berkas pegawai']
      },
      {
        id: 'pegawai-status',
        number: 13,
        label: 'Status & Riwayat Jabatan',
        icon: UserCheck,
        desc: 'Status kepegawaian ASN/PNS, PPPK, Honorer Sekolah, & riwayat penempatan',
        keywords: ['status', 'asn', 'pns', 'pppk', 'honorer', 'golongan', 'pangkat']
      },
      {
        id: 'pegawai-cuti',
        number: 14,
        label: 'Administrasi Cuti & Izin',
        icon: Clock,
        badge: 'Cuti',
        desc: 'Formulir cuti tahunan, cuti melahirkan, cuti sakit, & surat izin dinas luar',
        keywords: ['cuti', 'izin', 'sakit', 'dinas luar', 'surat tugas', 'dispensasi pegawai']
      },
    ]
  },
  {
    id: 'persuratan',
    label: 'PERSURATAN & DISPOSISI',
    items: [
      {
        id: 'surat-masuk',
        number: 15,
        label: 'Buku Agenda Surat Masuk',
        icon: Inbox,
        badge: 'Masuk',
        desc: 'Pencatatan surat masuk dari Dinas Pendidikan, instansi luar, & orang tua',
        keywords: ['surat masuk', 'agenda masuk', 'dinas pendidikan', 'surat dinas', 'registrasi']
      },
      {
        id: 'surat-keluar',
        number: 16,
        label: 'Buku Agenda Surat Keluar',
        icon: Send,
        badge: 'Keluar',
        desc: 'Pencatatan surat keluar, penomoran resmi, arsip surat edaran & undangan',
        keywords: ['surat keluar', 'agenda keluar', 'kirim surat', 'undangan', 'edaran']
      },
      {
        id: 'surat-buat',
        number: 17,
        label: 'Buat Surat & No Otomatis',
        icon: Plus,
        badge: 'Auto No',
        desc: 'Generator surat dinas otomatis, surat keterangan aktif, & nomor surat resmi',
        keywords: ['buat surat', 'generator', 'nomor surat', 'keterangan aktif', 'cetak']
      },
      {
        id: 'surat-template',
        number: 18,
        label: 'Koleksi Template Surat',
        icon: FileText,
        desc: 'Kumpulan format baku surat dinas, nota dinas, surat tugas, & surat peringatan',
        keywords: ['template', 'format surat', 'kop surat', 'baku', 'nota dinas', 'surat tugas']
      },
      {
        id: 'surat-disposisi',
        number: 19,
        label: 'Lembar Disposisi Kepsek',
        icon: FileSignature,
        badge: 'Paraf',
        desc: 'Alur disposisi surat pimpinan ke Waka Kurikulum, Kesiswaan, Sarpras, atau TU',
        keywords: ['disposisi', 'lembar disposisi', 'kepsek', 'waka', 'paraf', 'instruksi']
      },
      {
        id: 'surat-arsip',
        number: 20,
        label: 'Arsip Digital Persuratan',
        icon: FolderArchive,
        desc: 'Pencarian cepat arsip digital surat masuk & keluar berbasis tahun & kategori',
        keywords: ['arsip surat', 'arsip digital', 'cari surat', 'file pdf', 'buku agenda']
      },
    ]
  },
  {
    id: 'layanan',
    label: 'LAYANAN & SARPRAS',
    items: [
      {
        id: 'layanan-pengajuan',
        number: 21,
        label: 'Loket Permohonan Surat',
        icon: Inbox,
        badge: 'Loket',
        desc: 'Antrean permohonan surat keterangan dari murid, orang tua, & alumni',
        keywords: ['loket', 'permohonan', 'layanan siswa', 'surat aktif', 'antrean', 'tiket']
      },
      {
        id: 'layanan-legalisir',
        number: 22,
        label: 'Loket Legalisir Ijazah',
        icon: ShieldCheck,
        badge: 'SLA <24h',
        desc: 'Pelayanan pengesahan & legalisir ijazah, rapor, serta sertifikat digital QR',
        keywords: ['legalisir', 'ijazah', 'rapor', 'cap basah', 'stempel', 'pengesahan']
      },
      {
        id: 'inventaris-barang',
        number: 23,
        label: 'Inventaris Sarpras & Aset',
        icon: Building2,
        desc: 'Buku induk barang inventaris (KIR), kondisi sarana, & jadwal perawatan ruang',
        keywords: ['inventaris', 'sarpras', 'aset', 'kir', 'barang', 'komputer', 'meja', 'ruang']
      },
      {
        id: 'presensi-siswa',
        number: 24,
        label: 'Rekap Presensi Siswa',
        icon: UserCheck,
        badge: '96.3%',
        desc: 'Rekapitulasi absensi siswa harian, izin sakit, alfa, & dispensasi KBM',
        keywords: ['presensi siswa', 'absen', 'kehadiran', 'sakit', 'izin', 'rekap siswa']
      },
      {
        id: 'presensi-guru',
        number: 25,
        label: 'Rekap Presensi Guru & Tendik',
        icon: UserCheck,
        badge: '94.7%',
        desc: 'Rekapitulasi kehadiran pegawai sekolah, finger scan/RFID, dinas luar, & cuti',
        keywords: ['presensi guru', 'kehadiran ptk', 'fingerprint', 'rfid', 'rekap pegawai']
      },
    ]
  },
  {
    id: 'akselerasi',
    label: 'MAJOR MODES (/goal, /learn, /boost)',
    items: [
      {
        id: 'goal',
        number: 26,
        label: 'Target & KPI Administrasi (/goal)',
        icon: Target,
        badge: 'Goals',
        desc: 'Sasaran kerja pegawai, target SLA 99%, target buku induk 100% & akreditasi A',
        keywords: ['goal', 'target', 'kpi', 'skp', 'akreditasi', 'sla', 'tujuan', 'capaian']
      },
      {
        id: 'learn',
        number: 27,
        label: 'Studio SOP & Juknis (/learn)',
        icon: BookOpen,
        badge: 'SOP Hub',
        desc: 'Panduan tata kelola persuratan dinas, juknis BOS/BOSP, & regulasi Kemdikbud',
        keywords: ['learn', 'sop', 'juknis', 'bos', 'bosp', 'kemendikbud', 'panduan', 'aturan']
      },
      {
        id: 'boost',
        number: 28,
        label: 'Booster SLA & Performa TU (/boost)',
        icon: Zap,
        badge: 'AI Boost',
        desc: 'Akselerator pelayanan loket, auto penomoran kilat, & AI Dapodik anomaly detector',
        keywords: ['boost', 'booster', 'akselerator', 'kilat', 'sla', 'auto nomor', 'ai validator']
      },
    ]
  },
  {
    id: 'laporan',
    label: 'LAPORAN & AUDIT DATA',
    items: [
      {
        id: 'laporan-siswa',
        number: 29,
        label: 'Pusat Laporan & Statistik TU',
        icon: BarChart3,
        desc: 'Rekapitulasi data sekolah untuk pengawas, dinas pendidikan, & rapat dinas',
        keywords: ['laporan', 'statistik', 'rekapitulasi', 'dinas', 'grafik', 'eksekutif']
      },
      {
        id: 'dq-incomplete',
        number: 30,
        label: 'Audit Kelengkapan Data Pokok',
        icon: AlertTriangle,
        badge: 'Audit',
        desc: 'Deteksi siswa tanpa NIK/NISN, data ortu belum lengkap, & data invalid Dapodik',
        keywords: ['data quality', 'incomplete', 'belum lengkap', 'nik kosong', 'dapodik error']
      },
      {
        id: 'dq-verifikasi',
        number: 31,
        label: 'Pusat Verifikasi Dokumen',
        icon: ShieldCheck,
        desc: 'Validasi keabsahan dokumen ijazah, akta lahir, & sertifikat ber-QR Code',
        keywords: ['verifikasi', 'keabsahan', 'validasi', 'qr code', 'cek dokumen']
      },
      {
        id: 'io-import',
        number: 32,
        label: 'Import & Export Data Master',
        icon: FileSpreadsheet,
        desc: 'Sinkronisasi data Excel, CSV Dapodik, cetak kartu pelajar & ekspor dokumen',
        keywords: ['import', 'export', 'excel', 'csv', 'dapodik sync', 'unduh data']
      },
    ]
  },
  {
    id: 'pengaturan',
    label: 'PENGATURAN & BANTUAN',
    items: [
      {
        id: 'profil',
        number: 33,
        label: 'Profil Staf TU & Keamanan',
        icon: Settings,
        desc: 'Pengaturan akun staf, kata sandi, 2FA, sesi login, & preferensi antarmuka',
        keywords: ['profil', 'keamanan', 'password', '2fa', 'akun tu', 'pengaturan']
      },
      {
        id: 'bantuan',
        number: 34,
        label: 'Panduan Operasional & Bantuan',
        icon: HelpCircle,
        desc: 'Petunjuk penggunaan sistem tata usaha, hotline dinas, & kontak teknisi',
        keywords: ['bantuan', 'panduan', 'faq', 'sop', 'hotline', 'kontak teknisi']
      },
    ]
  }
];

export default function TuGlassDashboard({
  currentUser,
  onSwitchRole,
  onOpenSettings,
  defaultFeature = 'dashboard'
}: TuGlassDashboardProps) {
  const { theme, setTheme, language, setLanguage, t, dir } = useAppPreferences();
  const isDarkTheme = theme === 'glass' || theme === 'midnight';
  const [internalSettingsOpen, setInternalSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Dynamic Dashboard Data State
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetchTuDashboard().then((data) => {
      if (data && data.success) {
        setDashboardData(data.data);
      }
    }).catch(() => {
      // Fallback
    });
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant Widget State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Task Queue checklist state
  const [taskQueue, setTaskQueue] = useState([
    { id: 't1', title: 'Verifikasi 10 berkas legalisir ijazah alumni angkatan 2024', done: true, priority: 'Tinggi', time: '10:00 WIB' },
    { id: 't2', title: 'Cetak surat keterangan aktif belajar untuk siswa beasiswa', done: false, priority: 'Tinggi', time: '11:30 WIB' },
    { id: 't3', title: 'Disposisi surat edaran Dinas Pendidikan No. 421/1042/Disdik', done: true, priority: 'Sedang', time: '13:00 WIB' },
    { id: 't4', title: 'Rekonsiliasi berkas mutasi masuk siswa kelas XI MIPA', done: false, priority: 'Sedang', time: '14:30 WIB' },
    { id: 't5', title: 'Backup mingguan arsip digital Dapodikdasmen semester ganjil', done: false, priority: 'Rendah', time: '16:00 WIB' }
  ]);

  const toggleTask = (id: string) => {
    setTaskQueue((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
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

  // Click outside listener for dropdowns
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

  // Flat list of consolidated modules for quick search indexing
  const allModulesList = useMemo(() => {
    return TU_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => ({
        ...item,
        groupTitle: group.label,
        groupId: group.id
      }))
    );
  }, []);

  // Search filter
  const searchResults = useMemo(() => {
    const raw = searchQuery.trim().toLowerCase();
    if (!raw) return [];
    const searchTokens = raw.split(/\s+/).filter(Boolean);

    const scored = allModulesList.map((m) => {
      let score = 0;
      const labelLower = m.label.toLowerCase();
      const descLower = m.desc.toLowerCase();
      const groupLower = m.groupTitle.toLowerCase();
      const badgeLower = m.badge?.toLowerCase() || '';
      const keywords = m.keywords || [];

      if (m.number.toString() === raw || `#${m.number}` === raw) score += 100;
      if (labelLower.includes(raw)) score += 50;

      for (const token of searchTokens) {
        if (keywords.some((kw) => kw.includes(token) || token.includes(kw))) score += 30;
        if (labelLower.includes(token)) score += 20;
        if (descLower.includes(token)) score += 10;
        if (groupLower.includes(token)) score += 5;
        if (badgeLower.includes(token)) score += 5;
      }

      return { ...m, score };
    });

    return scored.filter((m) => m.score > 0).sort((a, b) => b.score - a.score);
  }, [searchQuery, allModulesList]);

  const handleSelectModule = (moduleId: string) => {
    setActiveTab(moduleId);
    setIsSearchFocused(false);
    setIsMobileMenuOpen(false);
    setSearchQuery('');
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAskAi = (promptText?: string) => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      const q = query.toLowerCase();
      if (q.includes('surat') || q.includes('nomor') || q.includes('klasifikasi')) {
        setAiResponse(
          '📜 Format Kode Klasifikasi Surat Dinas Resmi (Permendikbudristek No. 48/2022):\n• 421.3 / [No.Urut] / [NamaSekolah] / [BulanRomawi] / [Tahun]\n• Contoh Surat Keterangan Aktif Belajar: 421.3/084/SMAN1/TU/X/2026.\nPastikan nomor urut tercatat pada Buku Agenda Surat Keluar sebelum dicap dan ditandatangani Kepala Sekolah.'
        );
      } else if (q.includes('dapodik') || q.includes('mutasi') || q.includes('tarik')) {
        setAiResponse(
          '🔄 Alur Mutasi Siswa di Dapodikdasmen:\n1. Sekolah asal menerbitkan Surat Keterangan Pindah & melakukan "Mutasi Keluar" di web sp.datadik.kemdikbud.go.id.\n2. Sekolah tujuan melakukan proses "Tarik Peserta Didik" menggunakan Nomor Induk Kependudukan (NIK) & NISN.\n3. Lakukan Sinkronisasi Aplikasi Dapodik lokal agar siswa masuk rombel resmi.'
        );
      } else if (q.includes('bos') || q.includes('bosp') || q.includes('spj')) {
        setAiResponse(
          '💼 Ketentuan Administrasi SPJ Dana BOSP Kemendikbud:\n• Setiap pengeluaran di atas Rp 2.000.000 wajib dilampiri Bukti Pungut PPh 22 & PPN 11% (jika non-PKP atau via SIPLah ber-NPWP).\n• Kuitansi harus ditandatangani Penerima Pembayaran, Bendahara BOS, dan diverifikasi Kepala Sekolah.'
        );
      } else {
        setAiResponse(
          `✨ Panduan Cepat Tata Usaha untuk "${query}":\nLakukan verifikasi berkas fisik terlebih dahulu, cocokkan data identitas siswa/pegawai dengan Buku Induk & database Dapodik, lalu simpan arsip digital PDF resolusi 300 DPI untuk kepatuhan akreditasi standar sarana & kearsipan.`
        );
      }
      setIsAiLoading(false);
    }, 500);
  };

  // Booster SLA Quick Tools state
  const [boostLetterType, setBoostLetterType] = useState('keterangan');
  const [generatedBoostNo, setGeneratedBoostNo] = useState('421.3/142/SMAN1/TU/X/2026');
  const [boostBatchDone, setBoostBatchDone] = useState(false);
  const [boostScanProgress, setBoostScanProgress] = useState(false);
  const [boostScanResults, setBoostScanResults] = useState<{ checked: number; errors: number; fixed: number } | null>(null);

  // Fast Document Generator Modal State in /boost
  const [fastDocModalOpen, setFastDocModalOpen] = useState(false);
  const [fastDocType, setFastDocType] = useState('aktif');
  const [fastDocStudentName, setFastDocStudentName] = useState('Ahmad Fauzi (NISN: 0081234567)');
  const [fastDocClass, setFastDocClass] = useState('X-MIPA 1');

  const handleGenerateBoostLetter = () => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const curMonth = months[new Date().getMonth()];
    const no = `421.3/${randomSeq}/SMAN1/TU/${curMonth}/${new Date().getFullYear()}`;
    setGeneratedBoostNo(no);
    toast.success(`Nomor surat baru dibuat: ${no}`);
  };

  const handleRunBatchVerify = () => {
    setBoostBatchDone(false);
    toast.loading('Memproses verifikasi batch 10 dokumen legalisir...', { id: 'batch-toast' });
    setTimeout(() => {
      setBoostBatchDone(true);
      toast.success('10 Dokumen legalisir berhasil diverifikasi & diberi barcode digital!', { id: 'batch-toast' });
    }, 800);
  };

  const handleRunDapodikScan = () => {
    setBoostScanProgress(true);
    setBoostScanResults(null);
    toast.loading('Memindai integritas 540 data siswa di database...', { id: 'scan-toast' });
    setTimeout(() => {
      setBoostScanProgress(false);
      setBoostScanResults({ checked: 540, errors: 7, fixed: 7 });
      toast.success('Audit tuntas! 7 data anomali berhasil direkonsiliasi otomatis.', { id: 'scan-toast' });
    }, 900);
  };

  // Goal Milestones Checklist State
  const [milestones, setMilestones] = useState([
    { id: 'm1', label: 'Verifikasi kelengkapan buku induk kelas X (98.7% tercapai)', completed: true, category: 'siswa' },
    { id: 'm2', label: 'Tuntaskan rekapitulasi mutasi semester ganjil sebelum 20 Oktober', completed: true, category: 'siswa' },
    { id: 'm3', label: 'Capai SLA legalisir ijazah rata-rata di bawah 4 jam kerja (3.2 jam tercapai)', completed: true, category: 'layanan' },
    { id: 'm4', label: 'Digitalisasi 500 arsip SK dan surat dinas 3 tahun terakhir (468/500)', completed: false, category: 'arsip' },
    { id: 'm5', label: 'Sinkronisasi final Dapodik semester ganjil 0-error & 0-invalid', completed: true, category: 'dapodik' },
    { id: 'm6', label: 'Pelabelan QR Code aset sarana inventaris laboratorium & perpustakaan', completed: false, category: 'sarpras' },
  ]);

  const [newMilestoneText, setNewMilestoneText] = useState('');
  const [goalFilter, setGoalFilter] = useState<'all' | 'siswa' | 'layanan' | 'arsip' | 'dapodik' | 'sarpras'>('all');

  const filteredMilestones = useMemo(() => {
    if (goalFilter === 'all') return milestones;
    return milestones.filter((m) => m.category === goalFilter);
  }, [milestones, goalFilter]);

  const toggleMilestone = (id: string) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, completed: !m.completed } : m))
    );
  };

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return;
    const item = {
      id: `m-${Date.now()}`,
      label: newMilestoneText.trim(),
      completed: false,
      category: goalFilter === 'all' ? 'layanan' : goalFilter
    };
    setMilestones((prev) => [...prev, item]);
    setNewMilestoneText('');
    toast.success('Target baru berhasil ditambahkan!');
  };

  const completedMilestoneCount = milestones.filter((m) => m.completed).length;
  const milestoneProgressPct = Math.round((completedMilestoneCount / milestones.length) * 100);

  // SOP Knowledge List for /learn
  const [sopSearch, setSopSearch] = useState('');
  const [sopFilterCat, setSopFilterCat] = useState<'all' | 'persuratan' | 'layanan' | 'kesiswaan' | 'keuangan' | 'sarpras' | 'dapodik'>('all');
  const [selectedSop, setSelectedSop] = useState<any>(null);
  const [sopInteractiveStep, setSopInteractiveStep] = useState<number>(0);
  const [sopCheckedSteps, setSopCheckedSteps] = useState<{ [key: number]: boolean }>({});

  const sopList = [
    {
      id: 'sop-surat',
      title: 'SOP Pengelolaan Persuratan Dinas & Kearsipan Resmi',
      code: 'SOP-TU-01/2026',
      tag: 'Persuratan',
      cat: 'persuratan',
      steps: [
        'Penerimaan surat fisik/digital dari kurir, pos, atau email dinas.',
        'Pencatatan nomor surat, pengirim, dan perihal ke Buku Agenda Surat Masuk.',
        'Penerusan lembar disposisi kepada Kepala Sekolah untuk instruksi tindak lanjut.',
        'Pendistribusian instruksi ke waka/unit kerja terkait sesuai paraf pimpinan.',
        'Pemberkasan dan scan arsip digital berformat PDF 300 DPI.'
      ]
    },
    {
      id: 'sop-legalisir',
      title: 'SOP Pelayanan Legalisir Ijazah & Raport Siswa',
      code: 'SOP-TU-02/2026',
      tag: 'Layanan',
      cat: 'layanan',
      steps: [
        'Pemohon menyerahkan fotokopi dokumen beserta ijazah/raport asli.',
        'Petugas TU memverifikasi nomor seri ijazah terhadap Buku Induk Siswa.',
        'Pemberian stempel legalisir basah dan nomor verifikasi arsip.',
        'Penandatanganan oleh Kepala Sekolah atau pejabat yang didelegasikan.',
        'Penyerahan dokumen terlegalisir maksimal 1x24 jam kerja.'
      ]
    },
    {
      id: 'sop-mutasi',
      title: 'SOP Prosedur Mutasi Siswa Masuk & Keluar',
      code: 'SOP-TU-03/2026',
      tag: 'Kesiswaan',
      cat: 'kesiswaan',
      steps: [
        'Pengecekan kuota rombel dan kesesuaian kurikulum sekolah asal.',
        'Penerbitan surat rekomendasi kesediaan menerima oleh Kepala Sekolah.',
        'Penyerahan surat mutasi keluar dan Buku Laporan Pendidikan dari sekolah asal.',
        'Proses tarik peserta didik pada server Dapodikdasmen Pusat.',
        'Pencatatan NISN, NIK, dan nomor induk baru pada Buku Induk Sekolah.'
      ]
    },
    {
      id: 'sop-bosp',
      title: 'SOP Penatausahaan & Pelaporan SPJ Dana BOSP',
      code: 'SOP-TU-04/2026',
      tag: 'Keuangan',
      cat: 'keuangan',
      steps: [
        'Pencairan dana BOS sesuai Rencana Kegiatan dan Anggaran Sekolah (RKAS).',
        'Pembelanjaan sarana/kebutuhan sekolah via e-Katalog SIPLah atau rekanan resmi.',
        'Pengumpulan nota faktur, bukti bayar kuitansi, dan bukti pungut pajak PPh/PPN.',
        'Input transaksi realisasi belanja pada aplikasi ARKAS Kemdikbudristek.',
        'Pengarsipan SPJ fisik per triwulan untuk pemeriksaan inspektorat / BPK.'
      ]
    },
    {
      id: 'sop-sarpras',
      title: 'SOP Tata Kelola Inventaris & Kartu Inventaris Ruangan (KIR)',
      code: 'SOP-TU-05/2026',
      tag: 'Sarpras',
      cat: 'sarpras',
      steps: [
        'Penerimaan barang hasil pengadaan baru atau hibah dinas.',
        'Pemeriksaan spesifikasi dan pengujian fungsi kelayakan barang.',
        'Pemberian label kode inventaris dan penempelan stiker barcode resmi.',
        'Pencatatan pada Buku Induk Barang Inventaris dan Buku Golongan Barang.',
        'Pemasangan KIR di dinding ruangan dan rekonsiliasi semesteran.'
      ]
    },
    {
      id: 'sop-dapodik',
      title: 'SOP Validasi & Sinkronisasi Data Pokok Pendidikan (Dapodik)',
      code: 'SOP-TU-06/2026',
      tag: 'Dapodik',
      cat: 'dapodik',
      steps: [
        'Pengumpulan formulir F-Peserta Didik dan F-PTK yang telah diisi lengkap.',
        'Input dan pembaruan data semester berjalan pada Aplikasi Dapodik versi terbaru.',
        'Menjalankan fitur "Validasi Lokal" untuk memastikan 0 data invalid.',
        'Meminta persetujuan Kepala Sekolah untuk melakukan proses Sinkronisasi.',
        'Mencetak profil sekolah dan surat pertanggungjawaban mutlak (SPTJM).'
      ]
    }
  ];

  const filteredSops = useMemo(() => {
    let list = sopList;
    if (sopFilterCat !== 'all') {
      list = list.filter((s) => s.cat === sopFilterCat);
    }
    if (!sopSearch.trim()) return list;
    const q = sopSearch.toLowerCase();
    return list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q)
    );
  }, [sopSearch, sopFilterCat]);

  return (
    <div dir={dir} className="h-screen w-full bg-transparent font-sans relative antialiased selection:bg-amber-200 selection:text-amber-900 overflow-hidden flex flex-col">
      {/* 1. Ambient Blurred Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {theme === 'formal' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[680px] h-[680px] rounded-full bg-amber-200/40 blur-[140px]" />
            <div className="absolute top-[8%] left-[-10%] w-[580px] h-[580px] rounded-full bg-sky-200/35 blur-[130px]" />
            <div className="absolute top-[45%] right-[5%] w-[540px] h-[540px] rounded-full bg-orange-200/30 blur-[140px]" />
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
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-amber-900/30 blur-[160px]" />
            <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-900/25 blur-[160px]" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-[1720px] w-full mx-auto p-3 sm:p-5 lg:p-6 flex gap-5 lg:gap-6 h-full flex-1 overflow-hidden">
        {/* ========================================================================= */}
        {/* 2. FLOATING FROSTED GLASS SIDEBAR WITH ALL TU MODULES                      */}
        {/* ========================================================================= */}
        <aside
          className={`hidden lg:flex flex-col w-[290px] shrink-0 rounded-3xl p-3.5 justify-between h-full overflow-hidden transition-all ${
            isDarkTheme
              ? 'bg-slate-900/80 border border-white/10 shadow-2xl shadow-black/40 backdrop-blur-2xl text-white'
              : 'theme-glass-container shadow-[0_12px_35px_-5px_rgba(15,23,42,0.06),0_4px_12px_-2px_rgba(15,23,42,0.03)]'
          }`}
        >
          <div className="flex flex-col overflow-hidden h-full">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0 font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-base tracking-tight truncate ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    MyAcademic
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    TU
                  </span>
                </div>
                <div className={`flex items-center gap-1 text-[11px] font-medium ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                  <span>Portal Tata Usaha</span>
                  <span>•</span>
                  <span className="text-amber-500 font-semibold">Staf Sekolah</span>
                </div>
              </div>
            </div>

            {/* Quick Filter Status Indicator inside Sidebar */}
            {searchQuery && (
              <div
                className={`mx-1 mb-2 px-3 py-1.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDarkTheme
                    ? 'bg-amber-500/20 border-amber-500/30 text-amber-200'
                    : 'bg-amber-50 border-amber-200/80 text-amber-900'
                }`}
              >
                <span className="font-medium text-[11px] truncate">
                  Pencarian: <b className="font-semibold">"{searchQuery}"</b> ({searchResults.length})
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-0.5 rounded hover:bg-black/10 cursor-pointer"
                  title="Reset Filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Navigation Menus with Consolidated Modules Grouped */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
              {TU_NAV_GROUPS.map((group) => {
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
                      className={`w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isDarkTheme ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <span className="truncate">
                        {group.label} ({filteredItems.length})
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isDarkTheme ? 'text-white/40' : 'text-slate-400'
                        } ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
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
                                  ? isDarkTheme
                                    ? 'bg-amber-500/25 text-amber-200 border border-amber-400/40 font-semibold shadow-xs'
                                    : 'bg-amber-50 text-amber-950 shadow-xs border border-amber-300/80 font-semibold'
                                  : isDarkTheme
                                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <Icon
                                  className={`w-4 h-4 shrink-0 transition-colors ${
                                    isActive
                                      ? isDarkTheme ? 'text-amber-400' : 'text-amber-600'
                                      : isDarkTheme ? 'text-white/40 group-hover:text-white/80' : 'text-slate-400 group-hover:text-slate-600'
                                  }`}
                                />
                                <span className="truncate text-left">{item.label}</span>
                              </div>

                              {item.badge && (
                                <span
                                  className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ml-1.5 ${
                                    isActive
                                      ? isDarkTheme ? 'bg-amber-400/30 text-amber-100 font-bold' : 'bg-amber-200/90 text-amber-950 font-bold'
                                      : isDarkTheme ? 'bg-white/10 text-white/60 group-hover:bg-white/15' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
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
          <div className={`pt-2.5 border-t mt-2 ${isDarkTheme ? 'border-white/10' : 'border-slate-200'}`}>
            <div
              className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                isDarkTheme
                  ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                  : 'bg-slate-50/90 hover:bg-slate-100 border-slate-200/80 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-amber-500/30">
                    TU
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs font-semibold truncate ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                    {currentUser?.name || 'Hendra Pratama'}
                  </h4>
                  <p className={`text-[10px] truncate ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>Staf Tata Usaha</p>
                </div>
              </div>
              <button
                onClick={() => handleSelectModule('profil')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  isDarkTheme ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-white'
                }`}
                title="Buka Profil Saya"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* MOBILE DRAWER / SIDEBAR MODAL (< lg)                                      */}
        {/* ========================================================================= */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div
              className={`relative w-80 max-w-[85vw] h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200 ${
                isDarkTheme ? 'bg-slate-900 text-white border-r border-white/10' : 'bg-white text-slate-900 border-r border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                    TU
                  </div>
                  <span className="font-bold text-sm">Modul Tata Usaha</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-thin">
                {TU_NAV_GROUPS.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                      {group.label}
                    </div>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSelectModule(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-white font-bold shadow-xs'
                              : isDarkTheme ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/10">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MAIN WORKSPACE CANVAS                                                  */}
        {/* ========================================================================= */}
        <main className="flex-1 min-w-0 flex flex-col h-full overflow-hidden gap-4">
          {/* Top Bar Header (Pill Search + Shortcuts + Theme & Lang Controls) */}
          <header
            className={`shrink-0 relative flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 rounded-2xl sm:rounded-3xl p-3 sm:px-5 sm:py-3 z-30 transition-all ${
              isDarkTheme
                ? 'bg-slate-900/80 border border-white/10 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl'
                : 'theme-glass-container'
            }`}
          >
            {/* Pill Search Input with Active Search Dropdown */}
            <div className="relative flex-1 max-w-lg flex items-center gap-2">
              {/* Mobile Hamburger Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 rounded-2xl border transition-all cursor-pointer ${
                  isDarkTheme
                    ? 'bg-white/10 border-white/15 text-white hover:bg-white/20'
                    : 'bg-black/5 hover:bg-black/10 border-white/10 text-slate-700'
                }`}
                title="Buka Menu Modul TU"
              >
                <Menu className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDarkTheme ? 'text-amber-400' : 'text-amber-600'}`} />
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
                  placeholder="Cari menu tata usaha, surat, siswa, mutasi, SOP... (Ctrl+K)"
                  className={`w-full rounded-2xl pl-9 pr-14 py-2 text-xs font-medium transition-all outline-none border ${
                    isDarkTheme
                      ? 'bg-white/10 hover:bg-white/15 focus:bg-white/20 border-white/15 text-white placeholder-white/40 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30'
                      : 'bg-slate-50/90 hover:bg-white focus:bg-white border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/20 text-slate-800 placeholder-slate-400'
                  }`}
                />
                {searchQuery ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={`absolute right-3 top-2.5 p-0.5 rounded-full cursor-pointer ${
                      isDarkTheme ? 'hover:bg-white/20 text-white/60' : 'hover:bg-slate-200 text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span
                    className={`absolute right-3 top-2 px-1.5 py-0.5 rounded text-[10px] font-semibold font-mono pointer-events-none ${
                      isDarkTheme ? 'bg-white/10 text-white/50' : 'bg-slate-200/60 text-slate-400'
                    }`}
                  >
                    ⌘K
                  </span>
                )}
              </div>

              {/* ACTIVE INSTANT SEARCH RESULTS DROPDOWN PALETTE */}
              {isSearchFocused && searchQuery.trim().length > 0 && (
                <div
                  className={`absolute left-0 right-0 top-12 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto scrollbar-thin border backdrop-blur-2xl ${
                    isDarkTheme
                      ? 'bg-slate-900/95 border-white/20 text-white shadow-black/80'
                      : 'bg-white/95 border-slate-200/90 text-slate-800'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between px-2.5 py-1.5 border-b text-[11px] font-semibold ${
                      isDarkTheme ? 'border-white/10 text-white/60' : 'border-slate-100 text-slate-500'
                    }`}
                  >
                    <span>
                      Hasil Pencarian: <b className="text-amber-500 font-bold">{searchResults.length}</b> modul
                    </span>
                    <span className={`text-[10px] ${isDarkTheme ? 'text-white/40' : 'text-slate-400'}`}>Tekan Enter untuk buka</span>
                  </div>

                  {searchResults.length === 0 ? (
                    <div className={`py-6 text-center text-xs ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                      Tidak ada menu cocok dengan "<b>{searchQuery}</b>".
                      <br />
                      <span className={`text-[11px] mt-1 inline-block ${isDarkTheme ? 'text-white/40' : 'text-slate-400'}`}>
                        Coba kata kunci: surat, siswa, mutasi, legalisir, presensi, goal, learn, boost
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
                            className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                              isDarkTheme
                                ? 'hover:bg-white/10 border-transparent hover:border-amber-400/30 text-white'
                                : 'hover:bg-amber-50/80 border-transparent hover:border-amber-200/60 text-slate-900'
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-xs">
                                <ModIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold text-xs truncate">
                                    {mod.label}
                                  </h5>
                                  <span
                                    className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                                      isDarkTheme ? 'bg-white/10 text-white/70' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {mod.groupTitle}
                                  </span>
                                </div>
                                <p className={`text-[11px] line-clamp-1 mt-0.5 ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>
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
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-transform rtl:rotate-180" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Header Right Actions: Major Mode Buttons + Theme + Multi-Lang + Notif + Setting + Akun */}
            <div className="flex items-center gap-2 flex-wrap justify-end shrink-0">
              {/* Quick Major Mode Buttons: /goal, /learn, /boost */}
              <div
                className={`hidden md:flex items-center gap-1 p-1 rounded-2xl border ${
                  isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-black/5 border-white/10'
                }`}
              >
                <button
                  onClick={() => handleSelectModule('goal')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'goal'
                      ? 'bg-amber-500 text-white shadow-xs font-bold'
                      : isDarkTheme ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Target Kinerja & Sasaran Administrasi Sekolah (/goal)"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Goals</span>
                </button>
                <button
                  onClick={() => handleSelectModule('learn')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'learn'
                      ? 'bg-sky-600 text-white shadow-xs font-bold'
                      : isDarkTheme ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Studio SOP & Juknis Administrasi (/learn)"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn</span>
                </button>
                <button
                  onClick={() => handleSelectModule('boost')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'boost'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs font-bold'
                      : isDarkTheme ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Booster SLA & Akselerator Pelayanan TU (/boost)"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Boost</span>
                </button>
              </div>

              {/* Quick Theme Switcher Pill (Formal, Glass, Midnight) */}
              <div
                className={`flex items-center gap-1 p-1 rounded-2xl border ${
                  isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-black/5 border-white/10'
                }`}
                title="Ganti Tema Tampilan"
              >
                <button
                  onClick={() => setTheme('formal')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'formal' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tema Formal"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('glass')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'glass' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tema Bento Frosted Glass"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('midnight')}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                    theme === 'midnight' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Tema Midnight Dark"
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Language Dropdown (ID, EN, ZH, JA, AR) */}
              <div className="relative" ref={langDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowLangDropdown((prev) => !prev)}
                  className={`px-2.5 py-1.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isDarkTheme
                      ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                      : 'bg-black/5 hover:bg-black/10 border-white/10 text-slate-800'
                  } ${showLangDropdown ? 'ring-2 ring-amber-500/30' : ''}`}
                  title={`Bahasa: ${language.toUpperCase()}`}
                >
                  <Globe className="w-3.5 h-3.5 text-amber-500" />
                  <span className="uppercase text-[11px] font-bold">{language}</span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showLangDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-52 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/80'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                    }`}
                  >
                    <div className={`px-2.5 py-1 border-b mb-1 flex items-center justify-between ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                      <span className={`text-[10px] font-bold uppercase ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`}>Pilih Bahasa</span>
                      <span className="text-[10px] font-mono font-bold px-1 py-0.5 rounded bg-amber-50 text-amber-700 uppercase">{language}</span>
                    </div>
                    <div className="space-y-0.5">
                      {[
                        { code: 'id', name: 'Bahasa Indonesia' },
                        { code: 'en', name: 'English' },
                        { code: 'zh', name: '中文 (简体)' },
                        { code: 'ja', name: '日本語' },
                        { code: 'ar', name: 'العربية (RTL)' },
                      ].map((item) => (
                        <button
                          key={item.code}
                          onClick={() => {
                            setLanguage(item.code as any);
                            setShowLangDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-xl text-xs flex items-center justify-between cursor-pointer ${
                            language === item.code
                              ? isDarkTheme ? 'bg-amber-500/25 text-amber-200 font-bold' : 'bg-amber-50 text-amber-900 font-bold'
                              : isDarkTheme ? 'hover:bg-white/10 text-white/80' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span>{item.name}</span>
                          {language === item.code && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Button */}
              <button
                onClick={() => handleSelectModule('notifikasi')}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer relative shadow-xs ${
                  isDarkTheme ? 'bg-white/10 border-white/15 text-white hover:bg-white/15' : 'bg-black/5 hover:bg-black/10 border-white/10 text-slate-600'
                }`}
                title="Warta & Notifikasi TU"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              </button>

              {/* Settings Button */}
              <button
                onClick={() => {
                  if (onOpenSettings) onOpenSettings();
                  else setInternalSettingsOpen(true);
                }}
                className={`p-2 sm:p-2.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                  isDarkTheme ? 'bg-white/10 border-white/15 text-white hover:bg-white/15' : 'bg-black/5 hover:bg-black/10 border-white/10 text-slate-600'
                }`}
                title="Pengaturan Akun"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Account Dropdown with Role Switcher */}
              <div className="relative" ref={roleDropdownRef}>
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                    isDarkTheme
                      ? 'bg-white/10 border-white/15 text-white hover:bg-white/15'
                      : 'bg-black/5 hover:bg-black/10 border-white/10 text-slate-800'
                  }`}
                  title="Menu Akun & Peran"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-[10px]">
                    TU
                  </div>
                  <span className="truncate max-w-[120px] hidden sm:inline">{currentUser?.name || 'Hendra Pratama'}</span>
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    Staf TU
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Account Menu Dropdown */}
                {showRoleDropdown && (
                  <div
                    className={`absolute right-0 top-11 w-64 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl border ${
                      isDarkTheme
                        ? 'bg-slate-900/95 border-white/20 text-white shadow-black/80'
                        : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                    }`}
                  >
                    <div className={`px-3 py-2 border-b mb-1.5 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`}>
                        Akun Aktif
                      </p>
                      <p className="text-xs font-bold truncate">
                        {currentUser?.name || 'Hendra Pratama (Staff TU)'}
                      </p>
                      <p className={`text-[10px] ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>Staf Tata Usaha • NIP. 198503142010011002</p>
                    </div>

                    <div className={`space-y-1 mb-2 pb-2 border-b ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          handleSelectModule('profil');
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 font-medium transition-all cursor-pointer ${
                          isDarkTheme
                            ? 'hover:bg-white/10 text-white/80 hover:text-white'
                            : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>Buka Profil TU</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowRoleDropdown(false);
                          if (onOpenSettings) onOpenSettings();
                          else setInternalSettingsOpen(true);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 font-medium transition-all cursor-pointer ${
                          isDarkTheme
                            ? 'hover:bg-white/10 text-white/80 hover:text-white'
                            : 'text-slate-700 hover:bg-amber-50 hover:text-amber-900'
                        }`}
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>Pengaturan Akun</span>
                      </button>
                    </div>

                    {/* Role Switcher */}
                    {onSwitchRole && (
                      <div>
                        <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/60' : 'text-slate-400'}`}>
                          Ganti Peran Akses
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
                          {[
                            { id: 'tu', label: '💼 Tata Usaha (TU)', desc: 'Administrasi Sekolah' },
                            { id: 'murid', label: '🎓 Siswa / Murid', desc: 'Dashboard Siswa' },
                            { id: 'guru', label: '👨‍🏫 Guru Pengampu', desc: 'Portal KBM Guru' },
                            { id: 'walikelas', label: '🏫 Wali Kelas', desc: '42 Fitur Asuhan' },
                            { id: 'bk', label: '🧠 Konselor BK', desc: 'Bimbingan Konseling' },
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
                                r.id === 'tu'
                                  ? isDarkTheme
                                    ? 'bg-amber-500/25 text-amber-200 font-semibold border border-amber-400/30'
                                    : 'bg-amber-50 text-amber-950 font-semibold border border-amber-200/70'
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

          {/* SCROLLABLE WORKSPACE CONTENT (Header & Sidebar stay pinned) */}
          <div className="flex-1 overflow-y-auto pr-1 sm:pr-1.5 pb-8 scrollbar-thin">
            {/* VIEW 1: MAJOR MODE: /goal */}
            {activeTab === 'goal' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white shadow-lg relative overflow-hidden border border-amber-400/30">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase border border-white/20">
                          🎯 MAJOR MODE /goal
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/40 text-amber-100 font-semibold text-[10px]">
                          Semester Ganjil 2026/2027
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>Target Administrasi & KPI Sekolah</span>
                        <Target className="w-6 h-6 text-amber-200" />
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
                        Pelacak Sasaran Kinerja Pegawai (SKP), pemenuhan 8 Standar Nasional Pendidikan (Akreditasi A), dan target SLA penyelesaian pelayanan loket tata usaha.
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[170px]">
                      <span className="text-xs text-amber-200 font-medium block">Capaian KPI Rata-rata</span>
                      <span className="text-3xl font-black text-white my-0.5 block">{milestoneProgressPct}%</span>
                      <span className="text-[10px] text-amber-100 font-semibold">{completedMilestoneCount} dari {milestones.length} Target Tuntas</span>
                    </div>
                  </div>
                </div>

                {/* 5 KPI Metric Progress Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                  {[
                    { title: 'Validasi Buku Induk', current: '98.7%', target: '100%', progress: 98.7, color: 'from-amber-500 to-orange-600', note: '533/540 Siswa Lengkap' },
                    { title: 'SLA Legalisir <24 Jam', current: '97.9%', target: '99.0%', progress: 97.9, color: 'from-blue-600 to-indigo-600', note: 'Rata-rata 3.2 Jam' },
                    { title: 'Dapodik 0-Invalid', current: '100%', target: '100%', progress: 100, color: 'from-emerald-500 to-teal-600', note: '0 Error, 7 Warning' },
                    { title: 'Digitalisasi Arsip SK', current: '93.6%', target: '95.0%', progress: 93.6, color: 'from-violet-600 to-purple-600', note: '468/500 Dokumen' },
                    { title: 'Standar Sarpras & KIR', current: '94.2%', target: '95.0%', progress: 94.2, color: 'from-sky-500 to-cyan-600', note: '1.250 Aset Berlabel' },
                  ].map((kpi, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-3xl border shadow-sm flex flex-col justify-between backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-white/10 text-white'
                          : 'bg-white/90 border-slate-200/90 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className={`flex items-center justify-between text-[11px] font-bold ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                          <span>{kpi.title}</span>
                          <span className={`font-black ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>{kpi.current}</span>
                        </div>
                        <div className={`w-full rounded-full h-2 my-2 overflow-hidden ${isDarkTheme ? 'bg-white/10' : 'bg-slate-100'}`}>
                          <div className={`h-full rounded-full bg-gradient-to-r ${kpi.color}`} style={{ width: `${kpi.progress}%` }} />
                        </div>
                      </div>
                      <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                        <span>Target: {kpi.target}</span>
                        <span className={`font-semibold ${isDarkTheme ? 'text-white/80' : 'text-slate-700'}`}>{kpi.note}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 8 Standar Nasional Pendidikan (Akreditasi A) Tracker */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl shadow-sm space-y-4 ${
                    isDarkTheme
                      ? 'bg-slate-900/70 border-white/10 text-white'
                      : 'bg-white/90 border-slate-200/90 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Kepatuhan 8 Standar Nasional Pendidikan (Akreditasi Sekolah Unggul)</span>
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                        Audit berkala dokumen fisik & instrumen akreditasi Badan Akreditasi Nasional (BAN-PDM).
                      </p>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Skor Akreditasi: 96.4 (A - Unggul)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { std: 'Standar Isi', score: 98, status: 'Memenuhi', color: 'text-emerald-500' },
                      { std: 'Standar Proses KBM', score: 95, status: 'Memenuhi', color: 'text-emerald-500' },
                      { std: 'Standar Kelulusan', score: 97, status: 'Memenuhi', color: 'text-emerald-500' },
                      { std: 'Standar PTK (Guru/Tendik)', score: 94, status: 'Memenuhi', color: 'text-emerald-500' },
                      { std: 'Standar Sarana Prasarana', score: 93, status: 'Perlu Cek Lab', color: 'text-amber-500' },
                      { std: 'Standar Pengelolaan TU', score: 99, status: 'Sangat Baik', color: 'text-emerald-500' },
                      { std: 'Standar Pembiayaan BOS', score: 96, status: 'SPJ Lengkap', color: 'text-emerald-500' },
                      { std: 'Standar Penilaian Rapor', score: 97, status: 'Memenuhi', color: 'text-emerald-500' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border ${
                          isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-slate-50/70 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{item.std}</span>
                          <span className={item.color}>{item.score}%</span>
                        </div>
                        <span className={`text-[10px] block mt-1 ${isDarkTheme ? 'text-white/50' : 'text-slate-400'}`}>
                          Status: {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Milestones & Action Checklist */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl shadow-sm space-y-4 ${
                    isDarkTheme
                      ? 'bg-slate-900/70 border-white/10 text-white'
                      : 'bg-white/90 border-slate-200/90 text-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                        <CheckSquare className="w-4 h-4 text-amber-500" />
                        <span>Daftar Target & Milestone Operasional Tata Usaha</span>
                      </h3>
                      <p className={`text-xs ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                        Klik checklist untuk memperbarui status capaian target kerja.
                      </p>
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { id: 'all', label: 'Semua' },
                        { id: 'siswa', label: 'Kesiswaan' },
                        { id: 'layanan', label: 'Layanan Loket' },
                        { id: 'arsip', label: 'Kearsipan' },
                        { id: 'dapodik', label: 'Dapodik' },
                        { id: 'sarpras', label: 'Sarpras' }
                      ].map((chip) => (
                        <button
                          key={chip.id}
                          onClick={() => setGoalFilter(chip.id as any)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            goalFilter === chip.id
                              ? 'bg-amber-600 text-white shadow-xs font-bold'
                              : isDarkTheme
                              ? 'bg-white/10 text-white/70 hover:bg-white/15'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    {filteredMilestones.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleMilestone(item.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          item.completed
                            ? isDarkTheme
                              ? 'bg-amber-500/10 border-amber-500/30 text-white/60'
                              : 'bg-amber-50/50 border-amber-200 text-slate-700'
                            : isDarkTheme
                            ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                            : 'bg-slate-50/80 hover:bg-white border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <button
                            type="button"
                            className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                              item.completed ? 'bg-amber-500 text-white' : 'border-2 border-slate-300'
                            }`}
                          >
                            {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </button>
                          <span className={`text-xs font-medium truncate ${item.completed ? 'line-through opacity-50' : ''}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                          item.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.completed ? 'Tercapai' : 'Proses'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Add New Milestone Input */}
                  <div className={`flex gap-2 pt-2 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                    <input
                      type="text"
                      value={newMilestoneText}
                      onChange={(e) => setNewMilestoneText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMilestone()}
                      placeholder="Tambah target / sasaran kerja baru..."
                      className={`flex-1 px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                        isDarkTheme
                          ? 'bg-white/10 border-white/15 text-white placeholder-white/40'
                          : 'bg-slate-50 border-slate-200 focus:bg-white'
                      }`}
                    />
                    <button
                      onClick={handleAddMilestone}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Target</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: MAJOR MODE: /learn */}
            {activeTab === 'learn' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 text-white shadow-lg relative overflow-hidden border border-sky-400/30">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase border border-white/20">
                          📖 MAJOR MODE /learn
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-500/40 text-sky-100 font-semibold text-[10px]">
                          Knowledge Base & Juknis Resmi
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>Studio SOP & Juknis Administrasi Sekolah</span>
                        <BookOpen className="w-6 h-6 text-sky-200" />
                      </h2>
                      <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
                        Pusat referensi Prosedur Operasional Standar (SOP), Juknis BOS/BOSP, regulasi kearsipan dinas Kemendikbudristek, dan tutorial pengelolaan data Dapodikdasmen.
                      </p>
                    </div>

                    <div className="relative min-w-[240px]">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-sky-300" />
                      <input
                        type="text"
                        value={sopSearch}
                        onChange={(e) => setSopSearch(e.target.value)}
                        placeholder="Cari SOP / Juknis..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-white/15 border border-white/30 text-white placeholder-sky-200 focus:bg-white/25 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* SOP Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: 'Semua SOP' },
                    { id: 'persuratan', label: 'Persuratan & Disposisi' },
                    { id: 'layanan', label: 'Layanan Legalisir' },
                    { id: 'kesiswaan', label: 'Kesiswaan & Mutasi' },
                    { id: 'keuangan', label: 'SPJ Dana BOSP' },
                    { id: 'sarpras', label: 'Sarpras & Inventaris' },
                    { id: 'dapodik', label: 'Dapodikdasmen' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSopFilterCat(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        sopFilterCat === cat.id
                          ? 'bg-sky-600 text-white shadow-xs'
                          : isDarkTheme
                          ? 'bg-white/10 text-white/70 hover:bg-white/15'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* SOP Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSops.map((sop) => (
                    <div
                      key={sop.id}
                      onClick={() => {
                        setSelectedSop(sop);
                        setSopInteractiveStep(0);
                        setSopCheckedSteps({});
                      }}
                      className={`border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-white/10 hover:border-sky-400/40 text-white'
                          : 'bg-white/90 border-slate-200/90 hover:border-sky-300 text-slate-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                            {sop.tag}
                          </span>
                          <span className={`text-[11px] font-mono font-semibold ${isDarkTheme ? 'text-white/40' : 'text-slate-400'}`}>
                            {sop.code}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm group-hover:text-sky-500 transition-colors line-clamp-2 mb-2">
                          {sop.title}
                        </h4>
                        <div className="space-y-1.5 my-3">
                          {sop.steps.slice(0, 3).map((st, i) => (
                            <div key={i} className={`flex items-start gap-2 text-xs ${isDarkTheme ? 'text-white/70' : 'text-slate-600'}`}>
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                isDarkTheme ? 'bg-white/10 text-white/80' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {i + 1}
                              </span>
                              <span className="line-clamp-1">{st}</span>
                            </div>
                          ))}
                          {sop.steps.length > 3 && (
                            <span className="text-[11px] text-sky-500 font-semibold pl-6 block">
                              +{sop.steps.length - 3} tahapan alur kerja lainnya...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className={`pt-3 border-t flex items-center justify-between text-xs font-semibold text-sky-500 group-hover:text-sky-400 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <span>Buka Detail SOP & Panduan Interaktif</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kemendikbudristek Official Regulations Repository */}
                <div
                  className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-xl shadow-sm space-y-3.5 ${
                    isDarkTheme
                      ? 'bg-slate-900/70 border-white/10 text-white'
                      : 'bg-white/90 border-slate-200/90 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-sky-500" />
                        <span>Dokumen Regulasi & Juknis Kemendikbudristek Terkini (2026)</span>
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                        Arsip regulasi resmi untuk kepatuhan hukum dan tata laksana administrasi sekolah.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { title: 'Permendikbudristek No. 48/2022', desc: 'Tata Naskah Dinas & Kode Klasifikasi Surat', badge: 'Wajib' },
                      { title: 'Juknis Pengelolaan BOSP 2026', desc: 'Pedoman Belanja & SPJ Dana BOS Nasional', badge: 'Keuangan' },
                      { title: 'Panduan Penatausahaan Dapodik', desc: 'SOP Tarik-Mutasi & Validasi Data Peserta Didik', badge: 'Dapodik' },
                    ].map((reg, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                          isDarkTheme ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                            {reg.badge}
                          </span>
                          <h5 className="font-bold text-xs mt-1 truncate">{reg.title}</h5>
                          <p className={`text-[10px] truncate ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>{reg.desc}</p>
                        </div>
                        <button
                          onClick={() => toast.success(`Mengunduh ${reg.title} (PDF)...`)}
                          className="p-2 rounded-xl bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white transition-all cursor-pointer shrink-0"
                          title="Unduh PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOP Detail & Interactive Walkthrough Modal */}
                {selectedSop && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                      className={`rounded-3xl p-6 max-w-lg w-full shadow-2xl border space-y-4 ${
                        isDarkTheme ? 'bg-slate-900 border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className={`flex items-start justify-between border-b pb-3 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
                            {selectedSop.tag} • {selectedSop.code}
                          </span>
                          <h3 className="font-black text-base mt-1">
                            {selectedSop.title}
                          </h3>
                        </div>
                        <button
                          onClick={() => setSelectedSop(null)}
                          className={`p-1 rounded-lg ${isDarkTheme ? 'text-white/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-bold uppercase ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>
                            Panduan Alur Langkah Demi Langkah:
                          </h4>
                          <span className="text-[11px] text-sky-500 font-semibold">
                            {Object.values(sopCheckedSteps).filter(Boolean).length} / {selectedSop.steps.length} Selesai
                          </span>
                        </div>

                        <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-thin pr-1">
                          {selectedSop.steps.map((st: string, idx: number) => {
                            const isChecked = !!sopCheckedSteps[idx];
                            return (
                              <div
                                key={idx}
                                onClick={() => setSopCheckedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                  isChecked
                                    ? isDarkTheme ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                    : isDarkTheme ? 'bg-white/5 border-white/10 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-700'
                                }`}
                              >
                                <button
                                  type="button"
                                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                    isChecked ? 'bg-emerald-600 text-white' : isDarkTheme ? 'border border-white/20' : 'border border-slate-300'
                                  }`}
                                >
                                  {isChecked ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="text-[10px]">{idx + 1}</span>}
                                </button>
                                <span className={`leading-relaxed ${isChecked ? 'line-through opacity-70' : ''}`}>{st}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className={`flex items-center justify-between pt-3 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <span className={`text-[11px] font-mono ${isDarkTheme ? 'text-white/40' : 'text-slate-400'}`}>Kemendikbudristek RI</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedSop(null);
                              toast.success('Template format SOP berhasil diunduh (PDF)!');
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                              isDarkTheme ? 'bg-white/10 hover:bg-white/15 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh SOP</span>
                          </button>
                          <button
                            onClick={() => setSelectedSop(null)}
                            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
                          >
                            Tutup
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: MAJOR MODE: /boost */}
            {activeTab === 'boost' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hero Header */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white shadow-lg relative overflow-hidden border border-amber-400/30">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400/15 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-white/20 text-white font-bold text-[10px] tracking-wider uppercase border border-white/20">
                          ⚡ MAJOR MODE /boost
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/40 text-amber-100 font-semibold text-[10px]">
                          Performance & Service Booster
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>Akselerator SLA & Performa Tata Usaha</span>
                        <Zap className="w-6 h-6 text-amber-200" />
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
                        Otomasi penomoran surat dinas instan, validator batch berkas legalisir, dan AI pendeteksi anomali data Dapodik untuk memangkas waktu kerja administrasi hingga 60%.
                      </p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[170px]">
                      <span className="text-xs text-amber-200 font-medium block">Efisiensi Rata-rata</span>
                      <span className="text-3xl font-black text-white my-0.5 block">+64.8%</span>
                      <span className="text-[10px] text-amber-100 font-semibold">SLA Pelayanan &lt;24 Jam</span>
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Booster Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* BOOSTER 1: Generator Penomoran Surat Kilat */}
                  <div
                    className={`border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 text-white'
                        : 'bg-white/90 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                            <Plus className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">Penomoran Surat Kilat</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">1-Klik</span>
                      </div>
                      <p className={`text-xs mb-3 ${isDarkTheme ? 'text-white/60' : 'text-slate-600'}`}>
                        Buat nomor surat dinas resmi otomatis sesuai format kode klasifikasi Kemendikbudristek.
                      </p>

                      <div className="space-y-2">
                        <label className={`text-[11px] font-bold block ${isDarkTheme ? 'text-white/80' : 'text-slate-700'}`}>Kategori Surat:</label>
                        <select
                          value={boostLetterType}
                          onChange={(e) => setBoostLetterType(e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                            isDarkTheme
                              ? 'bg-white/10 border-white/15 text-white'
                              : 'bg-slate-50 border-slate-200 focus:bg-white text-slate-800'
                          }`}
                        >
                          <option value="keterangan" className="text-slate-900">Surat Keterangan Aktif (421.3)</option>
                          <option value="tugas" className="text-slate-900">Surat Perintah Tugas (094)</option>
                          <option value="undangan" className="text-slate-900">Surat Undangan Dinas (005)</option>
                          <option value="mutasi" className="text-slate-900">Surat Keterangan Pindah (421.2)</option>
                        </select>

                        <div className={`p-3 rounded-2xl border mt-3 ${
                          isDarkTheme ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50/80 border-amber-200/80'
                        }`}>
                          <span className="text-[10px] text-amber-500 font-bold uppercase block mb-1">Nomor Surat Ter-generate:</span>
                          <div className="flex items-center justify-between font-mono font-bold text-xs">
                            <span className="truncate">{generatedBoostNo}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(generatedBoostNo);
                                toast.success('Nomor surat disalin ke clipboard!');
                              }}
                              className="p-1 text-amber-500 hover:text-amber-400 cursor-pointer"
                              title="Salin Nomor"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateBoostLetter}
                      className="w-full py-2.5 px-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Generate Nomor Baru</span>
                    </button>
                  </div>

                  {/* BOOSTER 2: Validator Legalisir Batch */}
                  <div
                    className={`border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 text-white'
                        : 'bg-white/90 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">Batch Validator Legalisir</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">Auto QR</span>
                      </div>
                      <p className={`text-xs mb-3 ${isDarkTheme ? 'text-white/60' : 'text-slate-600'}`}>
                        Otomasi verifikasi keabsahan dan penerbitan cap digital QR untuk berkas legalisir pending.
                      </p>

                      <div className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                        isDarkTheme ? 'bg-sky-500/10 border-sky-500/30' : 'bg-sky-50/80 border-sky-200/80'
                      }`}>
                        <div className="flex justify-between">
                          <span>Antrean Permohonan:</span>
                          <span className="font-bold">10 Berkas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Status Pemeriksaan:</span>
                          <span className={`font-bold ${boostBatchDone ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {boostBatchDone ? 'Semua Terverifikasi' : 'Siap Diproses'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Target SLA:</span>
                          <span className="font-bold text-sky-500">&lt; 4 Jam Kerja</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleRunBatchVerify}
                      className="w-full py-2.5 px-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Proses Verifikasi 10 Berkas</span>
                    </button>
                  </div>

                  {/* BOOSTER 3: AI Dapodik Anomaly Detector */}
                  <div
                    className={`border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 text-white'
                        : 'bg-white/90 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">AI Anomaly Detector</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">Auto-Fix</span>
                      </div>
                      <p className={`text-xs mb-3 ${isDarkTheme ? 'text-white/60' : 'text-slate-600'}`}>
                        Pindai 540 siswa secara instan untuk mendeteksi NISN kosong, NIK ganda, & data invalid.
                      </p>

                      {boostScanResults ? (
                        <div className={`p-3 rounded-2xl border text-xs space-y-1 ${
                          isDarkTheme ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200/80 text-emerald-900'
                        }`}>
                          <div className="flex justify-between font-bold">
                            <span>Siswa Dipindai:</span>
                            <span>{boostScanResults.checked} Data</span>
                          </div>
                          <div className="flex justify-between text-emerald-500">
                            <span>Anomali Terdeteksi:</span>
                            <span>{boostScanResults.errors} Item</span>
                          </div>
                          <div className="flex justify-between font-bold pt-1 border-t border-emerald-500/30">
                            <span>Terekonsiliasi:</span>
                            <span>{boostScanResults.fixed} Berhasil Diperbaiki</span>
                          </div>
                        </div>
                      ) : (
                        <div className={`p-3 rounded-2xl border text-xs text-center py-4 ${
                          isDarkTheme ? 'bg-white/5 border-white/10 text-white/50' : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}>
                          Database siap dipindai untuk sinkronisasi Dapodik.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleRunDapodikScan}
                      disabled={boostScanProgress}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 mt-4"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${boostScanProgress ? 'animate-spin' : ''}`} />
                      <span>{boostScanProgress ? 'Memindai Database...' : 'Pindai & Bersihkan Anomali'}</span>
                    </button>
                  </div>

                  {/* BOOSTER 4: Fast Official Document Generator */}
                  <div
                    className={`border rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 text-white'
                        : 'bg-white/90 border-slate-200/90 text-slate-900'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                            <FileSignature className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">Cetak Surat Kilat</h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">Instant</span>
                      </div>
                      <p className={`text-xs mb-3 ${isDarkTheme ? 'text-white/60' : 'text-slate-600'}`}>
                        Penerbitan surat keterangan aktif atau surat rekomendasi resmi siap cetak dalam 30 detik.
                      </p>

                      <div className={`p-3 rounded-2xl border space-y-1.5 text-xs ${
                        isDarkTheme ? 'bg-purple-500/10 border-purple-500/30' : 'bg-purple-50/80 border-purple-200/80'
                      }`}>
                        <div className="flex justify-between">
                          <span>Template Siap:</span>
                          <span className="font-bold">4 Format Baku</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format Output:</span>
                          <span className="font-bold text-purple-500">PDF Kop Resmi & QR</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Waktu Buat:</span>
                          <span className="font-bold">&lt; 30 Detik</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setFastDocModalOpen(true)}
                      className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all mt-4"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Buka Form Cetak Kilat</span>
                    </button>
                  </div>
                </div>

                {/* Fast Doc Modal */}
                {fastDocModalOpen && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
                    <div
                      className={`rounded-3xl p-6 max-w-md w-full shadow-2xl border space-y-4 ${
                        isDarkTheme ? 'bg-slate-900 border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-3 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <FileSignature className="w-4 h-4 text-purple-500" />
                          <span>Penerbitan Surat Cepat (Fast Generator)</span>
                        </h3>
                        <button onClick={() => setFastDocModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold mb-1">Jenis Surat</label>
                          <select
                            value={fastDocType}
                            onChange={(e) => setFastDocType(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border ${
                              isDarkTheme ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          >
                            <option value="aktif" className="text-slate-900">Surat Keterangan Aktif Belajar (421.3)</option>
                            <option value="kelakuan" className="text-slate-900">Surat Keterangan Berkelakuan Baik (421.5)</option>
                            <option value="mutasi" className="text-slate-900">Surat Rekomendasi Pindah / Mutasi (421.2)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Nama Siswa / Penerima</label>
                          <input
                            type="text"
                            value={fastDocStudentName}
                            onChange={(e) => setFastDocStudentName(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border ${
                              isDarkTheme ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="block font-bold mb-1">Kelas / Rombel</label>
                          <input
                            type="text"
                            value={fastDocClass}
                            onChange={(e) => setFastDocClass(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border ${
                              isDarkTheme ? 'bg-white/10 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                          />
                        </div>
                      </div>

                      <div className={`flex items-center justify-end gap-2 pt-3 border-t ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <button
                          onClick={() => setFastDocModalOpen(false)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                            isDarkTheme ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => {
                            setFastDocModalOpen(false);
                            toast.success(`Surat resmi berhasil digenerate & siap diunduh!`);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Generate & Cetak PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: DEFAULT DASHBOARD OPERASIONAL (Bento Frosted Glass) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* 1. Dashboard Title & Quick Description */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>
                      Dashboard Tata Usaha & Operasional Sekolah
                    </h1>
                    <p className={`text-xs sm:text-sm font-normal mt-0.5 ${isDarkTheme ? 'text-white/60' : 'text-slate-500'}`}>
                      Pusat kontrol administrasi persuratan dinas, kesiswaan, kepegawaian, arsip & akuntabilitas sekolah.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                      Staf TU Aktif: {currentUser?.name || 'Hendra Pratama'} (NIP. 198503142010011002)
                    </span>
                  </div>
                </div>

                {/* 2. FEATURED HERO BANNER: Portal Tata Usaha Resmi */}
                <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white shadow-lg relative overflow-hidden border border-amber-500/20">
                  <div className="absolute -right-8 -top-8 w-52 h-52 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-semibold text-[10px] tracking-wider uppercase">
                          ✨ SISTEM ADMINISTRASI TERPADU
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium text-[10px] border border-white/10">
                          SMAN 1 UNGGULAN
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>Pusat Layanan Administrasi & Persuratan Resmi Sekolah</span>
                        <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
                        Mendukung pengelolaan 34 alur kerja administrasi sekolah dari buku induk siswa, agenda surat masuk/keluar, kepegawaian PTK, inventaris, hingga pelaporan berkala.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                      <button
                        onClick={() => handleSelectModule('surat-buat')}
                        className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-xs shadow-md shadow-amber-500/30 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Buat Surat Resmi</span>
                      </button>
                      <button
                        onClick={() => handleSelectModule('layanan-pengajuan')}
                        className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Inbox className="w-4 h-4 text-amber-300" />
                        <span>Loket Pelayanan</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. ROW 1: TOP 5 BENTO METRIC CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  {/* Card 1: Siswa */}
                  <div
                    onClick={() => handleSelectModule('siswa-data')}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-white'
                        : 'bg-white/90 border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>Total Siswa</span>
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black">{dashboardData?.summary?.total_siswa || 540}</div>
                      <div className="text-[11px] text-emerald-500 font-semibold mt-0.5">18 Rombel Aktif</div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                      <span>Buku Induk:</span>
                      <span className={`font-semibold ${isDarkTheme ? 'text-white/80' : 'text-slate-800'}`}>98.7% Lengkap</span>
                    </div>
                  </div>

                  {/* Card 2: Guru */}
                  <div
                    onClick={() => handleSelectModule('pegawai-guru')}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-white'
                        : 'bg-white/90 border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>Guru (Pendidik)</span>
                      <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black">{dashboardData?.summary?.total_guru || 45}</div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>PNS, PPPK & Honorer</div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                      <span>Kehadiran:</span>
                      <span className="font-semibold text-emerald-500">94.7% Hadir</span>
                    </div>
                  </div>

                  {/* Card 3: Tendik */}
                  <div
                    onClick={() => handleSelectModule('pegawai-tendik')}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-white'
                        : 'bg-white/90 border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>Tenaga Kependidikan</span>
                      <Briefcase className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black">{dashboardData?.summary?.total_tendik || 12}</div>
                      <div className={`text-[11px] font-semibold mt-0.5 ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>TU, Lab, Perpus, Ops</div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                      <span>Status Tim:</span>
                      <span className={`font-semibold ${isDarkTheme ? 'text-white/80' : 'text-slate-800'}`}>Siap Melayani</span>
                    </div>
                  </div>

                  {/* Card 4: Surat Masuk */}
                  <div
                    onClick={() => handleSelectModule('surat-masuk')}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-white'
                        : 'bg-white/90 border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>Surat Masuk</span>
                      <Inbox className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black">{dashboardData?.summary?.surat_masuk || 84}</div>
                      <div className="text-[11px] text-blue-500 font-semibold mt-0.5">{dashboardData?.administrasi_hari_ini?.surat_masuk_baru || 3} Perlu Disposisi</div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                      <span>Buku Agenda:</span>
                      <span className="font-semibold text-blue-500">Terekam Lengkap</span>
                    </div>
                  </div>

                  {/* Card 5: Surat Keluar */}
                  <div
                    onClick={() => handleSelectModule('surat-keluar')}
                    className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between cursor-pointer backdrop-blur-xl ${
                      isDarkTheme
                        ? 'bg-slate-900/70 border-white/10 hover:border-amber-500/40 text-white'
                        : 'bg-white/90 border-slate-200/90 hover:border-slate-300 text-slate-900 shadow-xs hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDarkTheme ? 'text-white/70' : 'text-slate-700'}`}>Surat Keluar</span>
                      <Send className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="my-2">
                      <div className="text-2xl font-black">{dashboardData?.summary?.surat_keluar || 156}</div>
                      <div className="text-[11px] text-amber-500 font-semibold mt-0.5">{dashboardData?.administrasi_hari_ini?.surat_keluar_perlu_proses || 4} Menunggu TTD</div>
                    </div>
                    <div className={`pt-2 border-t flex items-center justify-between text-[10px] ${isDarkTheme ? 'border-white/10 text-white/50' : 'border-slate-100 text-slate-500'}`}>
                      <span>SLA Proses:</span>
                      <span className="font-semibold text-emerald-500">&lt; 24 Jam</span>
                    </div>
                  </div>
                </div>

                {/* 4. ROW 2: 2-COLUMN BENTO GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT COLUMN (2 COLS): Task Queue & Matriks Aksi Cepat */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Urgent Task Queue Administrasi */}
                    <div
                      className={`border rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5 backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-white/10 text-white'
                          : 'bg-white/90 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <div className={`flex items-center justify-between border-b pb-3 ${isDarkTheme ? 'border-white/10' : 'border-slate-100'}`}>
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-amber-500" />
                          <h3 className="font-extrabold text-sm">Task Queue & Administrasi Hari Ini</h3>
                        </div>
                        <span className="text-[11px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
                          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <div className="space-y-2">
                        {taskQueue.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => toggleTask(item.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              item.done
                                ? isDarkTheme
                                  ? 'bg-white/5 border-white/5 text-white/40'
                                  : 'bg-slate-50/60 border-slate-100 text-slate-400'
                                : isDarkTheme
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                                : 'bg-white hover:bg-amber-50/30 border-slate-200/80 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                type="button"
                                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                                  item.done ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 hover:bg-slate-100'
                                }`}
                              >
                                {item.done && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </button>
                              <div className="min-w-0">
                                <span className={`text-xs font-semibold block truncate ${item.done ? 'line-through opacity-50' : ''}`}>
                                  {item.title}
                                </span>
                                <span className={`text-[10px] ${isDarkTheme ? 'text-white/40' : 'text-slate-400'}`}>
                                  Batas waktu: {item.time}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md shrink-0 ${
                              item.priority === 'Tinggi' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Matriks Aksi Cepat Administrasi (8 Tiles) */}
                    <div
                      className={`border rounded-3xl p-5 sm:p-6 shadow-sm backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-white/10 text-white'
                          : 'bg-white/90 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <h3 className="text-xs font-black uppercase tracking-wider mb-3.5">
                        Aksi Cepat Administrasi Sekolah
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Buat Surat Resmi', icon: Plus, tab: 'surat-buat', color: 'hover:border-amber-500 hover:bg-amber-50/20' },
                          { label: 'Loket Legalisir', icon: ShieldCheck, tab: 'layanan-legalisir', color: 'hover:border-blue-500 hover:bg-blue-50/20' },
                          { label: 'Mutasi Siswa', icon: ArrowRightLeft, tab: 'siswa-mutasi', color: 'hover:border-sky-500 hover:bg-sky-50/20' },
                          { label: 'Cek Buku Induk', icon: GraduationCap, tab: 'siswa-data', color: 'hover:border-indigo-500 hover:bg-indigo-50/20' },
                          { label: 'Rekap Presensi', icon: UserCheck, tab: 'presensi-siswa', color: 'hover:border-emerald-500 hover:bg-emerald-50/20' },
                          { label: 'Buku Inventaris', icon: Building2, tab: 'inventaris-barang', color: 'hover:border-teal-500 hover:bg-teal-50/20' },
                          { label: 'Import Dapodik', icon: FileSpreadsheet, tab: 'io-import', color: 'hover:border-violet-500 hover:bg-violet-50/20' },
                          { label: 'Laporan SLA', icon: TrendingUp, tab: 'laporan-layanan', color: 'hover:border-orange-500 hover:bg-orange-50/20' },
                        ].map((act, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectModule(act.tab)}
                            className={`p-3.5 rounded-2xl border flex flex-col gap-2 transition-all cursor-pointer text-left ${act.color} ${
                              isDarkTheme
                                ? 'bg-white/5 border-white/10 text-white'
                                : 'bg-slate-50/50 border-slate-200/80 text-slate-800'
                            }`}
                          >
                            <act.icon className="w-5 h-5 text-amber-500" />
                            <span className="text-xs font-bold">{act.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN (1 COL): AI Assistant + Donut Gauge */}
                  <div className="space-y-6">
                    {/* AI Administration Assistant Widget */}
                    <div
                      className={`border rounded-3xl p-5 relative overflow-hidden backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-amber-500/30 text-white shadow-black/40'
                          : 'bg-white/90 border-amber-300/80 text-slate-900 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.12),0_2px_8px_-2px_rgba(15,23,42,0.03)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">
                            AI Administration Assistant
                          </h4>
                        </div>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Beta
                        </span>
                      </div>

                      <p className={`text-xs mb-3 leading-relaxed font-normal ${isDarkTheme ? 'text-white/60' : 'text-slate-600'}`}>
                        Tanyakan format penomoran surat dinas, alur mutasi Dapodik, juknis BOS, atau regulasi kepegawaian.
                      </p>

                      <div className="space-y-2">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Contoh: Bagaimana format penomoran surat keterangan aktif belajar resmi?"
                          rows={2}
                          className={`w-full rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/25 transition-all resize-none shadow-xs border ${
                            isDarkTheme
                              ? 'bg-white/10 border-white/15 text-white placeholder-white/40 focus:border-amber-400'
                              : 'bg-slate-50/90 hover:bg-white focus:bg-white border-amber-200 focus:border-amber-500 text-slate-800 placeholder-slate-400'
                          }`}
                        />

                        <button
                          onClick={() => handleAskAi()}
                          disabled={isAiLoading}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 disabled:opacity-60"
                        >
                          {isAiLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Menganalisis Regulasi...</span>
                            </>
                          ) : (
                            <>
                              <span>Tanya AI Tata Usaha ✨</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* AI Response Display */}
                      {aiResponse && (
                        <div
                          className={`mt-3 p-3 rounded-xl border text-xs shadow-xs animate-in fade-in duration-200 whitespace-pre-line ${
                            isDarkTheme
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                              : 'bg-amber-50/80 border-amber-200 text-slate-800'
                          }`}
                        >
                          <p className="leading-relaxed">{aiResponse}</p>
                        </div>
                      )}

                      {/* Suggested Prompt Chips */}
                      <div className={`mt-3 pt-3 border-t space-y-1.5 ${isDarkTheme ? 'border-white/10' : 'border-amber-100'}`}>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 block">
                          Rekomendasi Pertanyaan:
                        </span>
                        {[
                          'Format penomoran surat dinas resmi',
                          'Alur mutasi tarik siswa di Dapodik',
                          'Aturan bukti kuitansi SPJ dana BOS'
                        ].map((prompt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setAiPrompt(prompt);
                              handleAskAi(prompt);
                            }}
                            className={`w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer font-medium ${
                              isDarkTheme
                                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                                : 'bg-amber-50/60 hover:bg-amber-100/80 border-amber-200/60 text-slate-700'
                            }`}
                          >
                            <span className="truncate">⚡ {prompt}</span>
                            <ChevronRight className="w-3 h-3 text-amber-500 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Donut Gauge: Kesiapan Administrasi Sekolah */}
                    <div
                      className={`border rounded-3xl p-5 shadow-sm backdrop-blur-xl ${
                        isDarkTheme
                          ? 'bg-slate-900/70 border-white/10 text-white'
                          : 'bg-white/90 border-slate-200/90 text-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold">Indeks Kesiapan Tata Usaha</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Kategori A
                        </span>
                      </div>

                      <div className="flex items-center justify-center my-3">
                        <div className="relative w-36 h-36 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="38" stroke={isDarkTheme ? '#1e293b' : '#f1f5f9'} strokeWidth="11" fill="transparent" />
                            <circle cx="50" cy="50" r="38" stroke="#f59e0b" strokeWidth="11" strokeDasharray="238.7" strokeDashoffset="24" fill="transparent" strokeLinecap="round" />
                          </svg>
                          <div className="absolute text-center">
                            <span className="text-2xl font-black tracking-tight block">96.8%</span>
                            <span className={`text-[9px] font-semibold uppercase tracking-wider block ${isDarkTheme ? 'text-white/50' : 'text-slate-500'}`}>
                              Kepatuhan
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`pt-2 border-t text-[11px] space-y-1.5 ${isDarkTheme ? 'border-white/10' : 'border-slate-200/80'}`}>
                        <div className={`flex items-center justify-between ${isDarkTheme ? 'text-white/70' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Kelengkapan Buku Induk
                          </span>
                          <span className="font-semibold">98.7%</span>
                        </div>
                        <div className={`flex items-center justify-between ${isDarkTheme ? 'text-white/70' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Presensi Siswa & PTK
                          </span>
                          <span className="font-semibold">95.5%</span>
                        </div>
                        <div className={`flex items-center justify-between ${isDarkTheme ? 'text-white/70' : 'text-slate-600'}`}>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ketepatan SLA Layanan
                          </span>
                          <span className="font-semibold">97.9%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 5: ALL OTHER 34+ SUB-MODULES RENDER VIA TuHubView */}
            {activeTab !== 'dashboard' && activeTab !== 'goal' && activeTab !== 'learn' && activeTab !== 'boost' && (
              <div className="animate-in fade-in duration-200">
                <TuHubView
                  currentUser={currentUser}
                  hideSidebar={true}
                  hideHeader={true}
                  externalActiveMenu={activeTab as TuMenuKey}
                  onMenuChange={(m) => handleSelectModule(m)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Bento Settings Modal */}
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
