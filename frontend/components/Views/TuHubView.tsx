'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
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
  FileCode,
  Tag,
  Paperclip,
  CheckSquare,
  Square,
  Compass,
  Key,
  Shield,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchTuDashboard,
  fetchTuStudents,
  fetchTuStaff,
  fetchTuLetters,
  generateTuLetterNumber,
  fetchTuServiceRequests,
  fetchTuMutations,
  fetchTuGraduationAlumni,
  fetchTuAttendance,
  fetchTuLeaves,
  fetchTuInventory,
  fetchTuMeetings,
  fetchTuDataQuality,
  fetchTuAuditLog
} from '@/lib/api';

export type TuMenuKey =
  | 'dashboard'
  // 👨🎓 Siswa
  | 'siswa-data'
  | 'siswa-ortu'
  | 'siswa-mutasi'
  | 'siswa-kelulusan'
  | 'siswa-alumni'
  | 'siswa-dokumen'
  // 👨🏫 Kepegawaian
  | 'pegawai-guru'
  | 'pegawai-tendik'
  | 'pegawai-dokumen'
  | 'pegawai-status'
  | 'pegawai-cuti'
  // 📄 Surat-Menyurat
  | 'surat-masuk'
  | 'surat-keluar'
  | 'surat-buat'
  | 'surat-template'
  | 'surat-disposisi'
  | 'surat-arsip'
  // 📁 Dokumen & Arsip
  | 'arsip-siswa'
  | 'arsip-pegawai'
  | 'arsip-sekolah'
  | 'arsip-sentral'
  | 'arsip-verifikasi'
  // 📝 Layanan Administrasi
  | 'layanan-pengajuan'
  | 'layanan-dokumen'
  | 'layanan-legalisir'
  | 'layanan-siswa'
  | 'layanan-ortu'
  // 📅 Agenda
  | 'agenda-kalender'
  | 'agenda-rapat'
  | 'agenda-sekolah'
  | 'agenda-notulen'
  // 🏫 Inventaris
  | 'inventaris-barang'
  | 'inventaris-lokasi'
  | 'inventaris-kondisi'
  | 'inventaris-mutasi'
  | 'inventaris-riwayat'
  // 📊 Presensi
  | 'presensi-siswa'
  | 'presensi-guru'
  | 'presensi-tendik'
  | 'presensi-koreksi'
  // 📥 Import / Export
  | 'io-import'
  | 'io-export'
  // 📈 Laporan
  | 'laporan-siswa'
  | 'laporan-pegawai'
  | 'laporan-surat'
  | 'laporan-dokumen'
  | 'laporan-layanan'
  // 🔍 Data Quality
  | 'dq-incomplete'
  | 'dq-verifikasi'
  | 'dq-bermasalah'
  // 🔔 Notifikasi, Search, Profil, Bantuan
  | 'notifikasi'
  | 'global-search'
  | 'profil'
  | 'bantuan';

interface TuHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  externalActiveMenu?: TuMenuKey;
  hideSidebar?: boolean;
  hideHeader?: boolean;
  onMenuChange?: (menu: TuMenuKey) => void;
}

export default function TuHubView({
  currentUser,
  onNavigateTab,
  externalActiveMenu,
  hideSidebar = false,
  hideHeader = false,
  onMenuChange
}: TuHubViewProps) {
  const [activeMenu, setActiveMenu] = useState<TuMenuKey>(externalActiveMenu || 'dashboard');

  useEffect(() => {
    if (externalActiveMenu) {
      setActiveMenu(externalActiveMenu);
    }
  }, [externalActiveMenu]);

  const handleMenuChange = (m: TuMenuKey) => {
    setActiveMenu(m);
    onMenuChange?.(m);
  };

  const [menuSearch, setMenuSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Loading & Data States
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<{ guru: any[]; tendik: any[] }>({ guru: [], tendik: [] });
  const [lettersData, setLettersData] = useState<{ masuk: any[]; keluar: any[] }>({ masuk: [], keluar: [] });
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [mutationsData, setMutationsData] = useState<{ masuk: any[]; keluar: any[] }>({ masuk: [], keluar: [] });
  const [gradAlumniData, setGradAlumniData] = useState<{ lulusan: any[]; alumni: any[] }>({ lulusan: [], alumni: [] });
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [leavesData, setLeavesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [meetingsData, setMeetingsData] = useState<any[]>([]);
  const [dataQualityData, setDataQualityData] = useState<any>(null);
  const [auditLogData, setAuditLogData] = useState<any[]>([]);

  // Interactive Form & Modal States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewLetterModalOpen, setIsNewLetterModalOpen] = useState(false);
  const [isDispositionModalOpen, setIsDispositionModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Letter Generator State
  const [letterType, setLetterType] = useState('keterangan');
  const [letterDate, setLetterDate] = useState('2026-10-02');
  const [generatedLetterNo, setGeneratedLetterNo] = useState('');
  const [letterRecipient, setLetterRecipient] = useState('Ahmad Fauzi');
  const [letterSubject, setLetterSubject] = useState('Surat Keterangan Aktif Belajar');
  const [letterContent, setLetterContent] = useState('Menerangkan bahwa siswa tersebut di atas adalah benar-benar siswa aktif kelas X-IPA 1 pada SMA Negeri Unggulan 1 tahun pelajaran 2026/2027.');

  // Import Wizard State
  const [importStep, setImportStep] = useState(1);
  const [importCategory, setImportCategory] = useState('siswa');

  // Search Filter in Main Tables
  const [filterQuery, setFilterQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleGroup = (grp: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [grp]: !prev[grp] }));
  };

  // Initial Data Fetching
  useEffect(() => {
    loadAllTuData();
  }, []);

  async function loadAllTuData() {
    setLoading(true);
    try {
      const [
        dash,
        students,
        staff,
        letters,
        reqs,
        mut,
        grad,
        att,
        leaves,
        inv,
        meet,
        dq,
        audit
      ] = await Promise.all([
        fetchTuDashboard(),
        fetchTuStudents(),
        fetchTuStaff(),
        fetchTuLetters(),
        fetchTuServiceRequests(),
        fetchTuMutations(),
        fetchTuGraduationAlumni(),
        fetchTuAttendance(),
        fetchTuLeaves(),
        fetchTuInventory(),
        fetchTuMeetings(),
        fetchTuDataQuality(),
        fetchTuAuditLog()
      ]);

      if (dash) setDashboardData(dash);
      if (students?.data) setStudentsData(students.data);
      if (staff) setStaffData({ guru: staff.guru || [], tendik: staff.tendik || [] });
      if (letters) setLettersData({ masuk: letters.surat_masuk || [], keluar: letters.surat_keluar || [] });
      if (reqs?.data) setServiceRequests(reqs.data);
      if (mut) setMutationsData({ masuk: mut.siswa_masuk || [], keluar: mut.siswa_keluar || [] });
      if (grad) setGradAlumniData({ lulusan: grad.calon_lulusan || [], alumni: grad.alumni || [] });
      if (att) setAttendanceData(att);
      if (leaves?.data) setLeavesData(leaves.data);
      if (inv?.data) setInventoryData(inv.data);
      if (meet?.data) setMeetingsData(meet.data);
      if (dq) setDataQualityData(dq);
      if (audit?.data) setAuditLogData(audit.data);
    } catch (e: any) {
      console.error(e);
      toast.error('Gagal memuat data Tata Usaha. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNumber = async (cat?: string, dateStr?: string) => {
    const selectedCat = cat || letterType;
    const selectedDate = dateStr || letterDate;
    const res = await generateTuLetterNumber(selectedCat, selectedDate);
    if (res && res.nomor_surat) {
      setGeneratedLetterNo(res.nomor_surat);
      showToast(`Nomor surat baru dibuat: ${res.nomor_surat}`);
    }
  };

  // ==========================================
  // REKONSILIASI PERHITUNGAN & AKUNTANSI TATA USAHA
  // ==========================================
  const totalStudents = dashboardData?.summary?.total_siswa || 540;

  // Rekonsiliasi Presensi Siswa: Total = Hadir (termasuk Terlambat) + Sakit + Izin + Alfa
  const attTotalSiswa = attendanceData?.rekap_siswa?.total_siswa || 540;
  const attSakitSiswa = attendanceData?.rekap_siswa?.sakit || 12;
  const attIzinSiswa = attendanceData?.rekap_siswa?.izin || 6;
  const attAlfaSiswa = attendanceData?.rekap_siswa?.alfa || 2;
  const attTerlambatSiswa = attendanceData?.rekap_siswa?.terlambat || 5;
  const attAbsenSiswa = attSakitSiswa + attIzinSiswa + attAlfaSiswa; // 20 siswa tidak hadir
  const attHadirSiswa = attTotalSiswa - attAbsenSiswa; // 520 siswa hadir fisik
  const attHadirPersenSiswa = Number(((attHadirSiswa / attTotalSiswa) * 100).toFixed(1)); // 96.3%

  // Rekonsiliasi Presensi Pegawai: Total = Hadir Fisik + Tugas Dinas Luar + Sakit + Cuti
  const attTotalPegawai = attendanceData?.rekap_pegawai?.total_guru_tendik || 57;
  const attHadirPegawai = attendanceData?.rekap_pegawai?.hadir || 54;
  const attDinasLuar = attendanceData?.rekap_pegawai?.dinas_luar || 2;
  const attSakitPegawai = attendanceData?.rekap_pegawai?.sakit || 1;
  const attCutiPegawai = attendanceData?.rekap_pegawai?.cuti || 0;
  const attTerlambatPegawai = attendanceData?.rekap_pegawai?.terlambat || 1;
  const attHadirPersenPegawai = Number(((attHadirPegawai / attTotalPegawai) * 100).toFixed(1)); // 94.7%

  // Rekonsiliasi Inventaris: Total Unit = Kondisi Baik + Perlu Maintenance
  const totalInventoryUnits = inventoryData.reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  const goodConditionUnits = inventoryData.filter(i => i.kondisi === 'Baik').reduce((acc, curr) => acc + (Number(curr.jumlah) || 0), 0);
  const maintenanceUnits = totalInventoryUnits - goodConditionUnits;

  // Rekonsiliasi SLA Layanan (Akuntansi Layanan TU Triwulan Berjalan)
  const periodicTotalTickets = 94;
  const periodicCompletedTickets = 92;
  const periodicTicketRate = Number(((periodicCompletedTickets / periodicTotalTickets) * 100).toFixed(1)); // 97.9%

  // Rekonsiliasi Kelengkapan Buku Induk (533 dari 540 siswa lengkap)
  const incompleteStudentFiles = 7;
  const completedStudentFiles = totalStudents - incompleteStudentFiles;
  const studentDataCompletenessRate = Number(((completedStudentFiles / totalStudents) * 100).toFixed(1)); // 98.7%

  // Group Definitions Matching Requested Sidebar Structure
  const menuGroups = [
    {
      id: 'dashboard',
      title: '🏠 DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard TU & To-Do', icon: LayoutDashboard, badge: dashboardData?.administrasi_hari_ini?.surat_masuk_baru ? `${dashboardData.administrasi_hari_ini.surat_masuk_baru} Baru` : undefined },
      ],
    },
    {
      id: 'siswa',
      title: '👨🎓 SISWA',
      items: [
        { id: 'siswa-data', label: 'Data Siswa Administratif', icon: GraduationCap },
        { id: 'siswa-ortu', label: 'Data Orang Tua & Wali', icon: Users },
        { id: 'siswa-mutasi', label: 'Mutasi Siswa (Masuk/Keluar)', icon: ArrowRightLeft, badge: mutationsData.masuk.length + mutationsData.keluar.length > 0 ? `${mutationsData.masuk.length + mutationsData.keluar.length}` : undefined },
        { id: 'siswa-kelulusan', label: 'Administrasi Kelulusan', icon: Award },
        { id: 'siswa-alumni', label: 'Administrasi Alumni', icon: BookOpen },
        { id: 'siswa-dokumen', label: 'Dokumen Siswa (KK/Akta/NISN)', icon: FolderArchive },
      ],
    },
    {
      id: 'pegawai',
      title: '👨🏫 KEPEGAWAIAN',
      items: [
        { id: 'pegawai-guru', label: 'Administrasi Guru', icon: Users },
        { id: 'pegawai-tendik', label: 'Tenaga Kependidikan (Tendik)', icon: Briefcase },
        { id: 'pegawai-dokumen', label: 'Dokumen Pegawai & SK', icon: FileCheck },
        { id: 'pegawai-status', label: 'Status & Riwayat Jabatan', icon: UserCheck },
        { id: 'pegawai-cuti', label: 'Administrasi Izin & Cuti', icon: Calendar, badge: leavesData.length ? `${leavesData.length}` : undefined },
      ],
    },
    {
      id: 'surat',
      title: '📄 SURAT-MENYURAT',
      items: [
        { id: 'surat-masuk', label: 'Surat Masuk', icon: Inbox, badge: lettersData.masuk.length ? `${lettersData.masuk.length}` : undefined },
        { id: 'surat-keluar', label: 'Surat Keluar', icon: Send, badge: lettersData.keluar.length ? `${lettersData.keluar.length}` : undefined },
        { id: 'surat-buat', label: 'Buat Surat & No. Otomatis', icon: FileSignature },
        { id: 'surat-template', label: 'Template Surat Resmi', icon: FileCode },
        { id: 'surat-disposisi', label: 'Disposisi Surat', icon: FileText },
        { id: 'surat-arsip', label: 'Arsip Surat Masuk/Keluar', icon: FolderArchive },
      ],
    },
    {
      id: 'arsip',
      title: '📁 DOKUMEN & ARSIP',
      items: [
        { id: 'arsip-siswa', label: 'Arsip Dokumen Siswa', icon: FolderArchive },
        { id: 'arsip-pegawai', label: 'Arsip Dokumen Pegawai', icon: FolderArchive },
        { id: 'arsip-sekolah', label: 'Dokumen Legalitas Sekolah', icon: Building2 },
        { id: 'arsip-sentral', label: 'Pusat Arsip Digital', icon: Layers },
        { id: 'arsip-verifikasi', label: 'Verifikasi Dokumen', icon: ShieldCheck, badge: '4 Pending' },
      ],
    },
    {
      id: 'layanan',
      title: '📝 LAYANAN ADMINISTRASI',
      items: [
        { id: 'layanan-pengajuan', label: 'Permintaan Surat Siswa', icon: FileText, badge: serviceRequests.filter(s => s.status !== 'Selesai').length ? `${serviceRequests.filter(s => s.status !== 'Selesai').length}` : undefined },
        { id: 'layanan-dokumen', label: 'Permintaan Dokumen', icon: Paperclip },
        { id: 'layanan-legalisir', label: 'Legalisir Rapor & Ijazah', icon: Award },
        { id: 'layanan-siswa', label: 'Layanan Siswa Terpadu', icon: GraduationCap },
        { id: 'layanan-ortu', label: 'Layanan Orang Tua Murid', icon: Users },
      ],
    },
    {
      id: 'agenda',
      title: '📅 AGENDA & RAPAT',
      items: [
        { id: 'agenda-kalender', label: 'Kalender Administratif', icon: Calendar },
        { id: 'agenda-rapat', label: 'Administrasi Rapat Dinas', icon: Clock },
        { id: 'agenda-sekolah', label: 'Agenda Kepala Sekolah & TU', icon: Calendar },
        { id: 'agenda-notulen', label: 'Notulen Rapat (MoM)', icon: FileText },
      ],
    },
    {
      id: 'inventaris',
      title: '🏫 INVENTARIS',
      items: [
        { id: 'inventaris-barang', label: 'Data Sarana Barang', icon: Building2 },
        { id: 'inventaris-lokasi', label: 'Lokasi & Ruangan', icon: MapPin },
        { id: 'inventaris-kondisi', label: 'Kondisi & Pemeliharaan', icon: AlertTriangle },
        { id: 'inventaris-mutasi', label: 'Mutasi & Perpindahan Barang', icon: ArrowRightLeft },
        { id: 'inventaris-riwayat', label: 'Riwayat & Penghapusan', icon: History },
      ],
    },
    {
      id: 'presensi',
      title: '📊 PRESENSI ADMINISTRATIF',
      items: [
        { id: 'presensi-siswa', label: 'Rekap Presensi Siswa', icon: UserCheck },
        { id: 'presensi-guru', label: 'Rekap Presensi Guru', icon: UserCheck },
        { id: 'presensi-tendik', label: 'Rekap Presensi Tendik', icon: UserCheck },
        { id: 'presensi-koreksi', label: 'Koreksi Administratif Presensi', icon: Edit },
      ],
    },
    {
      id: 'io',
      title: '📥 IMPORT / EXPORT',
      items: [
        { id: 'io-import', label: 'Import Excel Terpadu', icon: Upload },
        { id: 'io-export', label: 'Export Data (Excel/PDF)', icon: Download },
      ],
    },
    {
      id: 'laporan',
      title: '📈 LAPORAN TATA USAHA',
      items: [
        { id: 'laporan-siswa', label: 'Laporan Rekap Siswa', icon: BarChart3 },
        { id: 'laporan-pegawai', label: 'Laporan Kepegawaian', icon: BarChart3 },
        { id: 'laporan-surat', label: 'Laporan Surat & Disposisi', icon: BarChart3 },
        { id: 'laporan-dokumen', label: 'Laporan Kelengkapan Dokumen', icon: BarChart3 },
        { id: 'laporan-layanan', label: 'Laporan Kinerja Layanan (SLA)', icon: TrendingUp },
      ],
    },
    {
      id: 'dq',
      title: '🔍 DATA QUALITY',
      items: [
        { id: 'dq-incomplete', label: 'Data Belum Lengkap', icon: AlertTriangle, badge: '7 Item' },
        { id: 'dq-verifikasi', label: 'Pusat Verifikasi Identitas', icon: ShieldCheck },
        { id: 'dq-bermasalah', label: 'Anomali Data & Koreksi', icon: AlertCircle },
      ],
    },
    {
      id: 'other',
      title: '⚙️ LAINNYA',
      items: [
        { id: 'notifikasi', label: 'Notification Center', icon: Bell, badge: '5' },
        { id: 'global-search', label: 'Global Search TU', icon: Search },
        { id: 'profil', label: 'Profil & Keamanan TU', icon: Shield },
        { id: 'bantuan', label: 'Bantuan & SOP Tata Usaha', icon: HelpCircle },
      ],
    },
  ];

  return (
    <div className={`w-full flex flex-col ${!hideSidebar ? 'lg:flex-row' : ''} gap-6 min-h-[850px] animate-in fade-in duration-200`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LEFT: MASTER TU SIDEBAR (Categorized, searchable, elegant) */}
      {!hideSidebar && (
        <aside className="w-full lg:w-72 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col shrink-0 select-none">
        {/* Sidebar Header */}
        <div className="flex items-center gap-3 px-2 py-2 mb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md font-bold text-sm">
            TU
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Portal Tata Usaha</h3>
            <p className="text-[11px] text-slate-500 font-medium">34 Fitur Administrasi Sekolah</p>
          </div>
        </div>

        {/* Menu Search */}
        <div className="relative mb-3 px-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={menuSearch}
            onChange={(e) => setMenuSearch(e.target.value)}
            placeholder="Cari menu administrasi..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[calc(100vh-280px)] scrollbar-thin scrollbar-thumb-slate-200">
          {menuGroups.map((grp) => {
            const filteredItems = grp.items.filter((item) =>
              item.label.toLowerCase().includes(menuSearch.toLowerCase())
            );
            if (filteredItems.length === 0) return null;

            const isCollapsed = collapsedGroups[grp.id];

            return (
              <div key={grp.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(grp.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-extrabold tracking-wider text-slate-400 hover:text-slate-700 uppercase"
                >
                  <span>{grp.title}</span>
                  {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {filteredItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveMenu(item.id as TuMenuKey)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-500 text-white shadow-sm'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${
                                isActive ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
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

        {/* TU Role Identity Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 px-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700">Status TU: Siap Melayani</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">v2.4</span>
        </div>
      </aside>
      )}

      {/* RIGHT: MAIN WORKSPACE DISPLAY */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {/* TOP STATUS BANNER (Dynamic breadcrumb & Quick Actions) */}
        {!hideHeader && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <span>Tata Usaha (TU)</span>
                <span>/</span>
                <span className="text-amber-600 capitalize font-bold">{activeMenu.replace('-', ' ')}</span>
              </div>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                {activeMenu === 'dashboard' && 'Dashboard Operasional Tata Usaha'}
                {activeMenu === 'siswa-data' && 'Buku Induk & Data Siswa Administratif'}
                {activeMenu === 'siswa-ortu' && 'Data Orang Tua & Wali Murid'}
                {activeMenu === 'siswa-mutasi' && 'Buku Mutasi Siswa (Masuk & Keluar)'}
                {activeMenu === 'siswa-kelulusan' && 'Administrasi Kelulusan Siswa (SKL & Ijazah)'}
                {activeMenu === 'siswa-alumni' && 'Buku Induk & Penelusuran Alumni'}
                {activeMenu === 'siswa-dokumen' && 'Pusat Berkas Dokumen Siswa (KK/Akta/NISN)'}
                {activeMenu === 'pegawai-guru' && 'Administrasi Guru & Tenaga Pengajar'}
                {activeMenu === 'pegawai-tendik' && 'Tenaga Kependidikan (Staff TU, Lab, Perpus, Ops)'}
                {activeMenu === 'pegawai-dokumen' && 'Pusat Berkas Dokumen Kepegawaian & SK'}
                {activeMenu === 'pegawai-status' && 'Status Kepegawaian & Riwayat Penempatan'}
                {activeMenu === 'pegawai-cuti' && 'Pengelolaan Administrasi Cuti & Izin Pegawai'}
                {activeMenu === 'surat-masuk' && 'Buku Agenda Surat Masuk'}
                {activeMenu === 'surat-keluar' && 'Buku Agenda Surat Keluar'}
                {activeMenu === 'surat-buat' && 'Pembuat Surat Resmi & Penomoran Otomatis'}
                {activeMenu === 'surat-template' && 'Koleksi Template Surat Resmi Sekolah'}
                {activeMenu === 'surat-disposisi' && 'Alur & Lembar Disposisi Kepala Sekolah'}
                {activeMenu === 'surat-arsip' && 'Arsip Digital Surat Masuk & Keluar'}
                {activeMenu === 'arsip-siswa' && 'Arsip Berkas Digital Siswa'}
                {activeMenu === 'arsip-pegawai' && 'Arsip Berkas Digital Guru & Tendik'}
                {activeMenu === 'arsip-sekolah' && 'Arsip Dokumen Legalitas & SK Sekolah'}
                {activeMenu === 'arsip-sentral' && 'Pusat Arsip Sekolah Terpadu'}
                {activeMenu === 'arsip-verifikasi' && 'Verifikasi Keabsahan Dokumen Berkas'}
                {activeMenu === 'layanan-pengajuan' && 'Permohonan Surat dari Siswa & Orang Tua'}
                {activeMenu === 'layanan-dokumen' && 'Permohonan Pengambilan & Ralat Dokumen'}
                {activeMenu === 'layanan-legalisir' && 'Pelayanan Legalisir Ijazah & Rapor'}
                {activeMenu === 'layanan-siswa' && 'Loket Layanan Mandiri Siswa'}
                {activeMenu === 'layanan-ortu' && 'Loket Layanan Orang Tua & Masyarakat'}
                {activeMenu === 'agenda-kalender' && 'Kalender Akademik & Agenda Kegiatan'}
                {activeMenu === 'agenda-rapat' && 'Administrasi Rapat & Undangan'}
                {activeMenu === 'agenda-sekolah' && 'Buku Agenda Kepala Sekolah & TU'}
                {activeMenu === 'agenda-notulen' && 'Notulen Rapat (Minutes of Meeting)'}
                {activeMenu === 'inventaris-barang' && 'Buku Inventaris Sarana Administrasi'}
                {activeMenu === 'inventaris-lokasi' && 'Distribusi Barang per Ruangan'}
                {activeMenu === 'inventaris-kondisi' && 'Kondisi Sarana & Jadwal Pemeliharaan'}
                {activeMenu === 'inventaris-mutasi' && 'Mutasi Barang & Pemindahan Ruang'}
                {activeMenu === 'inventaris-riwayat' && 'Riwayat Pengadaan & Penghapusan Barang'}
                {activeMenu === 'presensi-siswa' && 'Rekap Kehadiran Siswa (Administratif)'}
                {activeMenu === 'presensi-guru' && 'Rekap Kehadiran Guru (Administratif)'}
                {activeMenu === 'presensi-tendik' && 'Rekap Kehadiran Tenaga Kependidikan'}
                {activeMenu === 'presensi-koreksi' && 'Koreksi Administratif Presensi (Surat Izin/Dokter)'}
                {activeMenu === 'io-import' && 'Pusat Import Data Master (Excel/CSV)'}
                {activeMenu === 'io-export' && 'Pusat Export Data & Cetak Laporan'}
                {activeMenu === 'laporan-siswa' && 'Laporan Statistik & Rekapitulasi Siswa'}
                {activeMenu === 'laporan-pegawai' && 'Laporan Ketenagaan Guru & Tendik'}
                {activeMenu === 'laporan-surat' && 'Laporan Frekuensi Surat & Disposisi'}
                {activeMenu === 'laporan-dokumen' && 'Laporan Kelengkapan Arsip Sekolah'}
                {activeMenu === 'laporan-layanan' && 'Laporan Kinerja Layanan Loket (SLA)'}
                {activeMenu === 'dq-incomplete' && 'Pusat Deteksi Kelengkapan Data Pokok'}
                {activeMenu === 'dq-verifikasi' && 'Validasi & Verifikasi Kesesuaian Dokumen'}
                {activeMenu === 'dq-bermasalah' && 'Anomali Data, Duplikasi & Perbaikan'}
                {activeMenu === 'notifikasi' && 'Pusat Notifikasi & Agenda Penting'}
                {activeMenu === 'global-search' && 'Pencarian Cepat Data Administrasi'}
                {activeMenu === 'profil' && 'Profil Staf TU & Keamanan Akun'}
                {activeMenu === 'bantuan' && 'Petunjuk Operasional & SOP Tata Usaha'}
              </h1>
            </div>

            {/* Action Hub Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  handleGenerateNumber('keterangan');
                  setActiveMenu('surat-buat');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Surat Resmi</span>
              </button>
              <button
                onClick={() => setActiveMenu('layanan-pengajuan')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                <Inbox className="w-3.5 h-3.5 text-amber-400" />
                <span>Loket Pelayanan ({serviceRequests.filter(s => s.status !== 'Selesai').length})</span>
              </button>
              <button
                onClick={loadAllTuData}
                disabled={loading}
                className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                title="Muat ulang data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 1: 🏠 DASHBOARD TU (Ringkasan, Administrasi Hari Ini, Tasks/To-Do)
           ========================================================================= */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            {/* 1. Stat Cards Ringkasan */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Siswa</span>
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-slate-900">{dashboardData?.summary?.total_siswa || 540}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">18 Rombel Aktif</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Guru</span>
                  <Users className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-slate-900">{dashboardData?.summary?.total_guru || 45}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">PNS, PPPK & Honorer</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Tenaga Kependidikan</span>
                  <Briefcase className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-slate-900">{dashboardData?.summary?.total_tendik || 12}</div>
                  <div className="text-[11px] text-slate-500 font-semibold mt-0.5">TU, Lab, Perpus, Ops</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Surat Masuk</span>
                  <Inbox className="w-4 h-4 text-blue-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-slate-900">{dashboardData?.summary?.surat_masuk || 84}</div>
                  <div className="text-[11px] text-blue-600 font-semibold mt-0.5">{dashboardData?.administrasi_hari_ini?.surat_masuk_baru || 3} Perlu Disposisi</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Surat Keluar</span>
                  <Send className="w-4 h-4 text-violet-500" />
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-black text-slate-900">{dashboardData?.summary?.surat_keluar || 156}</div>
                  <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{dashboardData?.administrasi_hari_ini?.surat_keluar_perlu_proses || 4} Menunggu TTD</div>
                </div>
              </div>
            </div>

            {/* 2. Grid Administrasi Hari Ini & Task To-Do */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri: Administrasi Hari Ini */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-sm text-slate-900">Administrasi Hari Ini</h3>
                  </div>
                  <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div
                    onClick={() => setActiveMenu('surat-masuk')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        <Inbox className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Surat Masuk Baru</div>
                        <div className="text-[10px] text-slate-500">Perlu diagendakan & disposisi</div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-blue-500 text-white">
                      {dashboardData?.administrasi_hari_ini?.surat_masuk_baru || 3}
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveMenu('surat-keluar')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                        <Send className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Surat Keluar Perlu Diproses</div>
                        <div className="text-[10px] text-slate-500">Penomoran & tanda tangan</div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-amber-500 text-white">
                      {dashboardData?.administrasi_hari_ini?.surat_keluar_perlu_proses || 4}
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveMenu('layanan-pengajuan')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Permintaan Surat & Layanan</div>
                        <div className="text-[10px] text-slate-500">Surat aktif, legalisir & dokumen</div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-indigo-500 text-white">
                      {dashboardData?.administrasi_hari_ini?.pengajuan_siswa || 5}
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveMenu('dq-incomplete')}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Dokumen Perlu Dilengkapi</div>
                        <div className="text-[10px] text-slate-500">KK, Akta & NIK belum valid</div>
                      </div>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-rose-500 text-white">
                      {dashboardData?.administrasi_hari_ini?.dokumen_perlu_dilengkapi || 7}
                    </span>
                  </div>
                </div>

                {/* Info Tahun Ajaran & Semester */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/70 mt-auto">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>SMA Negeri Unggulan 1 (NPSN: 20219842)</span>
                  </div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    Tahun Ajaran: <span className="font-bold">2026/2027</span> • Semester: <span className="font-bold">Ganjil (Aktif)</span>
                  </div>
                </div>
              </div>

              {/* Kolom Tengah & Kanan: Tasks / To-Do List TU */}
              <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <h3 className="font-extrabold text-sm text-slate-900">Antrean Kerja & Tugas TU (To-Do List)</h3>
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      {dashboardData?.tasks_todo?.length || 5} Tugas Menunggu
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(dashboardData?.tasks_todo || [
                      { id: 1, title: '5 surat masuk belum diproses disposisi', category: 'Surat Masuk', priority: 'Tinggi', due: 'Hari ini 15:00', status: 'Pending' },
                      { id: 2, title: '3 permintaan surat keterangan aktif siswa', category: 'Layanan Siswa', priority: 'Sedang', due: 'Hari ini 16:00', status: 'Proses' },
                      { id: 3, title: '7 berkas Kartu Keluarga siswa baru belum diunggah', category: 'Kelengkapan Data', priority: 'Sedang', due: 'Besok 12:00', status: 'Pending' },
                      { id: 4, title: '2 mutasi siswa masuk perlu verifikasi dokumen NISN', category: 'Mutasi Siswa', priority: 'Tinggi', due: 'Hari ini 17:00', status: 'Review' },
                      { id: 5, title: '1 draf SK Kepsek menunggu tanda tangan digital', category: 'Surat Keputusan', priority: 'Tinggi', due: 'Hari ini 14:00', status: 'Menunggu TTD' },
                    ]).map((t: any) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-lg border-2 border-slate-300 flex items-center justify-center cursor-pointer hover:border-amber-500">
                            <Check className="w-3 h-3 text-transparent hover:text-amber-500" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{t.title}</div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-md">
                                {t.category}
                              </span>
                              <span>• Batas: {t.due}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              t.priority === 'Tinggi'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <button
                            onClick={() => {
                              showToast(`Tugas "${t.title}" dibuka.`);
                              if (t.category === 'Surat Masuk') setActiveMenu('surat-masuk');
                              else if (t.category === 'Layanan Siswa') setActiveMenu('layanan-pengajuan');
                              else if (t.category === 'Kelengkapan Data') setActiveMenu('dq-incomplete');
                              else if (t.category === 'Mutasi Siswa') setActiveMenu('siswa-mutasi');
                              else setActiveMenu('surat-keluar');
                            }}
                            className="px-3 py-1 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            Proses
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Log Aktivitas Terakhir */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                    Aktivitas Terakhir Tata Usaha
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {(dashboardData?.recent_activity || [
                      { time: '10:15 WIB', action: 'Cetak Surat Keterangan Aktif', user: 'Hendra Pratama (TU)', target: 'Ahmad Fauzi' },
                      { time: '09:40 WIB', action: 'Verifikasi Dokumen Ijazah', user: 'Hendra Pratama (TU)', target: 'Nadia Az-Zahra' },
                      { time: '08:50 WIB', action: 'Agenda Surat Masuk No. 042', user: 'Rina Staff TU', target: 'Disdik Jabar' },
                    ]).map((act: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                        <div className="text-slate-400 font-mono text-[10px]">{act.time}</div>
                        <div className="font-bold text-slate-800 truncate">{act.action}</div>
                        <div className="text-slate-500 truncate">{act.target}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 2: 👨🎓 ADMINISTRASI DATA SISWA (Data Dasar, Keluarga, Administratif)
           ========================================================================= */}
        {activeMenu === 'siswa-data' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Buku Induk & Administrasi Siswa</h2>
                <p className="text-xs text-slate-500">Kelola data dasar, data keluarga, NIS/NISN, nomor KK, dan status administratif siswa.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsStudentModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Data Siswa</span>
                </button>
                <button
                  onClick={() => setActiveMenu('io-import')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Excel</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Cari NIS, NISN, NIK, Nama Siswa atau Kelas..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <select className="px-3 py-2 text-xs font-bold rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                <option value="">Semua Status (Aktif, Pindah, Lulus)</option>
                <option value="Aktif">Aktif</option>
                <option value="Pindah">Pindah</option>
                <option value="Lulus">Lulus</option>
              </select>
            </div>

            {/* Table Siswa */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Siswa</th>
                    <th className="py-3 px-3">NIS / NISN</th>
                    <th className="py-3 px-3">NIK & No. KK</th>
                    <th className="py-3 px-3">Kelas</th>
                    <th className="py-3 px-3">Orang Tua / Wali</th>
                    <th className="py-3 px-3">Dokumen</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Aksi TU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {studentsData
                    .filter(
                      (s) =>
                        s.nama.toLowerCase().includes(filterQuery.toLowerCase()) ||
                        s.nis.includes(filterQuery) ||
                        s.nisn.includes(filterQuery)
                    )
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.nama}</div>
                          <div className="text-[10px] text-slate-500">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • {s.tmp_lahir}, {s.tgl_lahir}</div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <div className="font-semibold text-slate-800">{s.nis}</div>
                          <div className="text-[10px] text-slate-400">NISN: {s.nisn}</div>
                        </td>
                        <td className="py-3 px-3 font-mono">
                          <div className="text-slate-700">{s.nik}</div>
                          <div className="text-[10px] text-slate-400">KK: {s.no_kk || <span className="text-rose-500 font-bold">Belum ada</span>}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700">
                            {s.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800">{s.nama_ayah} / {s.nama_ibu}</div>
                          <div className="text-[10px] text-slate-500">{s.kontak_ortu}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              s.dokumen_status === 'Lengkap'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.dokumen_status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              s.status === 'Aktif'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : s.status === 'Pindah'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedItem(s);
                                showToast(`Membuka profil administratif ${s.nama}`);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                              title="Lihat Detail Siswa"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setLetterRecipient(s.nama);
                                setActiveMenu('surat-buat');
                              }}
                              className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-all cursor-pointer"
                              title="Terbitkan Surat untuk Siswa"
                            >
                              <FileSignature className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 3: 👨🏫 ADMINISTRASI GURU & TENAGA KEPENDIDIKAN
           ========================================================================= */}
        {(activeMenu === 'pegawai-guru' || activeMenu === 'pegawai-tendik') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {activeMenu === 'pegawai-guru' ? 'Administrasi Guru & Tenaga Pengajar' : 'Administrasi Tenaga Kependidikan (Tendik)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Pengelolaan berkas administratif kepegawaian (SK, NIP/NUPTK, KTP, Ijazah), bukan aktivitas KBM/mengajar.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Form Tambah Pegawai Dibuka')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Pegawai</span>
                </button>
              </div>
            </div>

            {/* Sub-Tabs: Guru vs Tendik */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setActiveMenu('pegawai-guru')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeMenu === 'pegawai-guru'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Guru Pengajar ({staffData.guru.length})
              </button>
              <button
                onClick={() => setActiveMenu('pegawai-tendik')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeMenu === 'pegawai-tendik'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tenaga Kependidikan ({staffData.tendik.length})
              </button>
            </div>

            {/* Table Pegawai */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-3 px-3">Nama Pegawai</th>
                    <th className="py-3 px-3">NIP / NUPTK</th>
                    <th className="py-3 px-3">Jabatan & Tugas</th>
                    <th className="py-3 px-3">Status Kepegawaian</th>
                    <th className="py-3 px-3">Pendidikan</th>
                    <th className="py-3 px-3">Dokumen Berkas</th>
                    <th className="py-3 px-3 text-right">Aksi TU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(activeMenu === 'pegawai-guru' ? staffData.guru : staffData.tendik).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{p.nama}</div>
                        <div className="text-[10px] text-slate-500">{p.email} • {p.telepon}</div>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <div className="font-semibold text-slate-800">{p.nip || '-'}</div>
                        <div className="text-[10px] text-slate-400">NUPTK: {p.nuptk || '-'}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{p.jabatan || p.role_tugas}</div>
                        {p.mapel && <div className="text-[10px] text-indigo-600">Mapel: {p.mapel}</div>}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {p.status_pegawai}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{p.pendidikan}</td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          SK & Ijazah Terverifikasi
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => showToast(`Cetak biodata kepegawaian ${p.nama}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                            title="Cetak Biodata Kepegawaian"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setLetterRecipient(p.nama);
                              setLetterSubject('Surat Tugas Mengikuti Pelatihan');
                              setActiveMenu('surat-buat');
                            }}
                            className="p-1.5 rounded-lg text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-all cursor-pointer"
                            title="Buat Surat Tugas Pegawai"
                          >
                            <FileSignature className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 4 & 5 & 6: 📄 SURAT-MENYURAT (Surat Masuk, Keluar, Generator No Otomatis)
           ========================================================================= */}
        {activeMenu === 'surat-masuk' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Buku Agenda Surat Masuk</h2>
                <p className="text-xs text-slate-500">Registrasi surat masuk dari dinas, instansi luar, maupun komite, beserta alur disposisi.</p>
              </div>

              <button
                onClick={() => setIsNewLetterModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Surat Masuk</span>
              </button>
            </div>

            {/* List Surat Masuk */}
            <div className="space-y-3">
              {lettersData.masuk.map((sm) => (
                <div key={sm.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">{sm.nomor_surat}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {sm.kategori}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">{sm.perihal}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Pengirim: <span className="font-semibold text-slate-700">{sm.pengirim}</span> • Tgl Surat: {sm.tanggal_surat} • Diterima: {sm.tanggal_diterima}
                      </div>
                      {sm.catatan && (
                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl mt-2 border border-slate-100">
                          Catatan: {sm.catatan}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      sm.status_disposisi === 'Sudah Didisposisi'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sm.status_disposisi}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedItem(sm);
                        setIsDispositionModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Disposisi
                    </button>
                    <button
                      onClick={() => showToast(`Mengunduh file arsip surat ${sm.nomor_surat}`)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Download Scan PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'surat-keluar' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Buku Agenda Surat Keluar</h2>
                <p className="text-xs text-slate-500">Pencatatan surat keluar resmi sekolah, status verifikasi tanda tangan digital, dan pengarsipan.</p>
              </div>

              <button
                onClick={() => setActiveMenu('surat-buat')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Surat Keluar</span>
              </button>
            </div>

            {/* List Surat Keluar */}
            <div className="space-y-3">
              {lettersData.keluar.map((sk) => (
                <div key={sk.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900">{sk.nomor_surat}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {sk.kategori}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">{sk.perihal}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Tujuan: <span className="font-semibold text-slate-700">{sk.tujuan}</span> • Tanggal: {sk.tanggal_surat}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                        <QrCode className="w-3 h-3" />
                        <span>{sk.ttd_status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => showToast(`Cetak surat resmi ${sk.nomor_surat}`)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak</span>
                    </button>
                    <button
                      onClick={() => showToast(`Verifikasi sertifikat digital QR ${sk.nomor_surat}`)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                      title="Verifikasi QR Code"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pembuat Surat & Generator Nomor Otomatis */}
        {activeMenu === 'surat-buat' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Pembuat Surat Resmi & Generator Nomor Otomatis</h2>
              <p className="text-xs text-slate-500">
                Generate format nomor surat otomatis resmi tanpa mengetik manual, integrasi data siswa/sekolah, dan draf siap cetak.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Konfigurasi Surat */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Surat</label>
                  <select
                    value={letterType}
                    onChange={(e) => {
                      setLetterType(e.target.value);
                      handleGenerateNumber(e.target.value, letterDate);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  >
                    <option value="keterangan">Surat Keterangan Siswa (421.3)</option>
                    <option value="tugas">Surat Tugas Guru / Tendik (421.5)</option>
                    <option value="undangan">Surat Undangan Dinas / Rapat (005)</option>
                    <option value="mutasi">Surat Keterangan Mutasi / Pindah (421.3)</option>
                    <option value="pemberitahuan">Surat Pemberitahuan Resmi (421.7)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Surat</label>
                  <input
                    type="date"
                    value={letterDate}
                    onChange={(e) => {
                      setLetterDate(e.target.value);
                      handleGenerateNumber(letterType, e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Nomor Surat Otomatis</label>
                    <button
                      type="button"
                      onClick={() => handleGenerateNumber(letterType)}
                      className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                  <input
                    type="text"
                    value={generatedLetterNo || '421.3/087/SMAN-01/X/2026'}
                    onChange={(e) => setGeneratedLetterNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-2xl bg-amber-50 text-amber-900 border border-amber-200"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Format: [Klasifikasi]/[No. Urut]/[Kode Sekolah]/[Bulan Romawi]/[Tahun]</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ditujukan Kepada / Pemohon</label>
                  <input
                    type="text"
                    value={letterRecipient}
                    onChange={(e) => setLetterRecipient(e.target.value)}
                    placeholder="Nama siswa, guru, atau instansi tujuan..."
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Perihal Surat</label>
                  <input
                    type="text"
                    value={letterSubject}
                    onChange={(e) => setLetterSubject(e.target.value)}
                    placeholder="Perihal surat..."
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Isi Surat Keterangan / Diktum</label>
                  <textarea
                    rows={4}
                    value={letterContent}
                    onChange={(e) => setLetterContent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => showToast(`Draf Surat ${generatedLetterNo || '421.3/087/SMAN-01/X/2026'} Berhasil Disimpan & Diteruskan ke Kepsek`)}
                  className="w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Simpan & Ajukan Tanda Tangan Kepsek
                </button>
              </div>

              {/* Pratinjau Lembar Surat Resmi (Kop Surat & Format Standar Dinas) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner flex flex-col justify-between font-serif text-slate-900 min-h-[460px]">
                {/* Kop Surat */}
                <div>
                  <div className="text-center border-b-2 border-double border-slate-800 pb-3 mb-4">
                    <div className="text-xs uppercase font-extrabold tracking-widest text-slate-600 font-sans">
                      PEMERINTAH PROVINSI JAWA BARAT • DINAS PENDIDIKAN
                    </div>
                    <div className="text-base font-black text-slate-900 font-sans tracking-tight">
                      SMA NEGERI UNGGULAN 1 KOTA BANDUNG
                    </div>
                    <div className="text-[10px] text-slate-600 font-sans">
                      Jl. Ir. H. Juanda No. 120, Kota Bandung, Jawa Barat • Telp: (022) 2501234 • NPSN: 20219842
                    </div>
                  </div>

                  {/* Judul & Nomor Surat */}
                  <div className="text-center my-4 font-sans">
                    <div className="text-sm font-black underline uppercase tracking-wide">
                      {letterSubject.toUpperCase()}
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-700 mt-0.5">
                      Nomor: {generatedLetterNo || '421.3/087/SMAN-01/X/2026'}
                    </div>
                  </div>

                  {/* Body Surat */}
                  <div className="text-xs leading-relaxed space-y-3 font-sans text-slate-800">
                    <p>
                      Yang bertanda tangan di bawah ini, Kepala SMA Negeri Unggulan 1 Kota Bandung menerangkan bahwa:
                    </p>
                    <div className="pl-6 space-y-1">
                      <div>Nama Siswa : <span className="font-bold">{letterRecipient}</span></div>
                      <div>Nomor Induk Siswa : <span className="font-mono">20261001</span></div>
                      <div>NISN : <span className="font-mono">0089123451</span></div>
                      <div>Kelas : <span>X-IPA 1</span></div>
                    </div>
                    <p className="mt-2 text-justify">
                      {letterContent}
                    </p>
                    <p>
                      Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.
                    </p>
                  </div>
                </div>

                {/* Tanda Tangan & QR Verification */}
                <div className="flex items-end justify-between pt-6 font-sans">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 text-[10px]">
                    <QrCode className="w-8 h-8 text-slate-700" />
                    <div>
                      <div className="font-bold text-slate-900">Verifikasi Digital BSrE</div>
                      <div className="text-slate-500 font-mono">ID: SEC-202610-884</div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div>Bandung, {new Date(letterDate || '2026-10-02').toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    <div className="text-[11px] font-bold text-slate-600 mt-0.5">Kepala Sekolah,</div>
                    <div className="h-12 flex items-center justify-end">
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        [Menunggu Tanda Tangan Kepsek]
                      </span>
                    </div>
                    <div className="font-bold underline text-slate-900">Dr. H. Sulaiman, M.Si</div>
                    <div className="text-[10px] font-mono text-slate-600">NIP. 19680712 199403 1 004</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 7 & 8: 📁 DOKUMEN & ARSIP RESMI SEKOLAH
           ========================================================================= */}
        {(activeMenu.startsWith('arsip-') || activeMenu === 'surat-arsip') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Pusat Arsip Digital Sekolah</h2>
                <p className="text-xs text-slate-500">Pengelolaan berkas digital terorganisasi per folder, retensi arsip, dan pencarian cepat.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Form Unggah Arsip Dibuka')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Berkas Baru</span>
                </button>
              </div>
            </div>

            {/* Folder Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: 'Arsip Siswa', count: '540 Berkas', icon: GraduationCap },
                { name: 'Arsip Guru & Tendik', count: '57 Berkas', icon: Users },
                { name: 'Arsip Surat Dinas', count: '240 Surat', icon: Inbox },
                { name: 'SK & Legalitas', count: '38 Dokumen', icon: Building2 },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 hover:bg-white transition-all cursor-pointer">
                    <Icon className="w-5 h-5 text-amber-500 mb-2" />
                    <div className="text-xs font-bold text-slate-900">{f.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{f.count}</div>
                  </div>
                );
              })}
            </div>

            {/* File List Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3">Nama Berkas</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Ukuran / Format</th>
                    <th className="py-3 px-3">Tanggal Unggah</th>
                    <th className="py-3 px-3">Petugas TU</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {[
                    { name: 'SK_Operasional_Sekolah_Kemendikbud_2026.pdf', cat: 'Legalitas', size: '2.4 MB • PDF', date: '2026-08-01', user: 'Hendra Pratama' },
                    { name: 'Buku_Induk_Siswa_Angkatan_2026.xlsx', cat: 'Buku Induk', size: '1.8 MB • Excel', date: '2026-09-15', user: 'Rian Hidayat' },
                    { name: 'Surat_Edaran_ATS_Ganjil_No_084.pdf', cat: 'Surat Keluar', size: '450 KB • PDF', date: '2026-10-01', user: 'Hendra Pratama' },
                    { name: 'Berkas_Akreditasi_A_Unggul_2025_2030.pdf', cat: 'Akreditasi', size: '5.2 MB • PDF', date: '2025-11-20', user: 'Hendra Pratama' },
                  ].map((doc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="font-bold text-slate-900">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]">
                          {doc.cat}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{doc.size}</td>
                      <td className="py-3 px-3 text-slate-500">{doc.date}</td>
                      <td className="py-3 px-3 text-slate-700">{doc.user}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showToast(`Mengunduh berkas ${doc.name}`)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 9 & 10: 📝 LAYANAN ADMINISTRASI & TIKET SISWA/ORTU
           ========================================================================= */}
        {activeMenu.startsWith('layanan-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Loket Layanan Administrasi Terpadu</h2>
                <p className="text-xs text-slate-500">
                  Pemrosesan tiket permohonan surat keterangan aktif, ralat biodata, legalisir ijazah, dan rekomendasi siswa/ortu.
                </p>
              </div>

              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Tiket Layanan</span>
              </button>
            </div>

            {/* List Tiket Layanan */}
            <div className="space-y-3">
              {serviceRequests.map((req) => (
                <div key={req.id} className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 transition-all bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 font-mono text-xs">
                      {req.id}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{req.no_tiket}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                          {req.jenis_layanan}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 mt-1">Pemohon: {req.pemohon}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Keperluan: <span className="text-slate-700">{req.keperluan}</span> • Diajukan: {req.tanggal_pengajuan}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Petugas TU: <span className="font-semibold text-slate-700">{req.petugas}</span> • Batas Waktu: {req.deadline}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                      req.status === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Diproses'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {req.status}
                    </span>

                    {req.status !== 'Selesai' ? (
                      <button
                        onClick={() => {
                          showToast(`Tiket ${req.no_tiket} diproses & diselesaikan`);
                          setServiceRequests(prev => prev.map(p => p.id === req.id ? { ...p, status: 'Selesai' } : p));
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Selesaikan Tiket
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Cetak bukti pelayanan tiket ${req.no_tiket}`)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak Bukti</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 11: 🔄 MUTASI SISWA (Masuk & Keluar)
           ========================================================================= */}
        {activeMenu === 'siswa-mutasi' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Buku Mutasi Siswa</h2>
              <p className="text-xs text-slate-500">Pencatatan administrasi siswa mutasi masuk dan mutasi keluar beserta surat rekomendasi dinas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Siswa Masuk */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-xs font-black text-emerald-800 uppercase flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Siswa Masuk (Pindahan Masuk)</span>
                  </div>
                  <button
                    onClick={() => showToast('Form Mutasi Masuk Dibuka')}
                    className="text-[11px] font-bold text-emerald-600 hover:underline cursor-pointer"
                  >
                    + Tambah Siswa Masuk
                  </button>
                </div>

                {mutationsData.masuk.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{m.nama} (NISN: {m.nisn})</div>
                    <div className="text-slate-500 text-[11px]">Asal: {m.sekolah_asal} (NPSN: {m.npsn_asal})</div>
                    <div className="text-slate-600 text-[11px]">Kelas Tujuan: <span className="font-bold">{m.kelas_tujuan}</span> • Tgl Masuk: {m.tanggal_masuk}</div>
                    <div className="text-emerald-700 font-bold text-[10px] mt-1">Status: {m.status_verifikasi}</div>
                  </div>
                ))}
              </div>

              {/* Siswa Keluar */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="text-xs font-black text-rose-800 uppercase flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>Siswa Keluar (Pindahan Keluar)</span>
                  </div>
                  <button
                    onClick={() => showToast('Form Mutasi Keluar Dibuka')}
                    className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    + Buat Surat Pindah
                  </button>
                </div>

                {mutationsData.keluar.map((m) => (
                  <div key={m.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="font-bold text-slate-900">{m.nama} (NIS: {m.nis})</div>
                    <div className="text-slate-500 text-[11px]">Tujuan: {m.sekolah_tujuan} (NPSN: {m.npsn_tujuan})</div>
                    <div className="text-slate-600 text-[11px]">Alasan: {m.alasan} • Tgl Keluar: {m.tanggal_keluar}</div>
                    <div className="text-amber-700 font-bold text-[10px] mt-1">Status: {m.status_administrasi}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 12 & 13: 🎓 KELULUSAN & ALUMNI
           ========================================================================= */}
        {(activeMenu === 'siswa-kelulusan' || activeMenu === 'siswa-alumni') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {activeMenu === 'siswa-kelulusan' ? 'Administrasi Kelulusan (SKL & Ijazah)' : 'Buku Induk & Penelusuran Alumni'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeMenu === 'siswa-kelulusan'
                    ? 'Verifikasi identitas calon lulusan, nomor seri ijazah, dan penerbitan Surat Keterangan Lulus (SKL).'
                    : 'Basis data lulusan, pelacakan kampus/karir lanjutan, serta riwayat permohonan legalisir.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => showToast('Cetak Buku Lulusan / Alumni Resmi')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Buku Alumni</span>
                </button>
              </div>
            </div>

            {/* Table Kelulusan / Alumni */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3">Nama</th>
                    <th className="py-3 px-3">{activeMenu === 'siswa-kelulusan' ? 'NIS / Kelas' : 'Tahun Kelulusan'}</th>
                    <th className="py-3 px-3">{activeMenu === 'siswa-kelulusan' ? 'Verifikasi Identitas' : 'Kampus / Lanjutan'}</th>
                    <th className="py-3 px-3">{activeMenu === 'siswa-kelulusan' ? 'No. Seri Ijazah' : 'Kontak'}</th>
                    <th className="py-3 px-3 text-right">Aksi TU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {(activeMenu === 'siswa-kelulusan' ? gradAlumniData.lulusan : gradAlumniData.alumni).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{item.nama}</div>
                      </td>
                      <td className="py-3 px-3">
                        {activeMenu === 'siswa-kelulusan' ? (
                          <div>{item.nis} • {item.kelas}</div>
                        ) : (
                          <div className="font-bold text-indigo-700">{item.tahun_lulus} (Kelas {item.kelas_terakhir})</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {activeMenu === 'siswa-kelulusan' ? (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.status_verifikasi_identitas === 'Valid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status_verifikasi_identitas}
                          </span>
                        ) : (
                          <div className="text-slate-800">{item.lanjutan}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {activeMenu === 'siswa-kelulusan' ? item.no_seri_ijazah : item.kontak}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => showToast(`Cetak ${activeMenu === 'siswa-kelulusan' ? 'SKL' : 'Transkrip'} ${item.nama}`)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-all cursor-pointer"
                        >
                          {activeMenu === 'siswa-kelulusan' ? 'Cetak SKL' : 'Legalisir'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 14: 📊 PRESENSI ADMINISTRATIF & KOREKSI PRESENSI
           ========================================================================= */}
        {activeMenu.startsWith('presensi-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Rekap Presensi Administratif & Koreksi</h2>
                <p className="text-xs text-slate-500">
                  Pemantauan rekapitulasi kehadiran siswa dan pendidik, serta pencatatan koreksi administratif resmi (surat dokter/izin dinas).
                </p>
              </div>

              <button
                onClick={() => setIsCorrectionModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Input Koreksi Presensi</span>
              </button>
            </div>

            {/* Rekap Kehadiran Siswa & Guru dengan Rekonsiliasi Akuntansi Lengkap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rekapitulasi Kehadiran Siswa</div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">Total Terdaftar: {attTotalSiswa} Siswa</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Hadir Fisik ({attHadirPersenSiswa}%)</div>
                    <div className="font-black text-emerald-600 text-sm">{attHadirSiswa} Siswa</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{attTerlambatSiswa} terlambat</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Sakit</div>
                    <div className="font-black text-amber-600 text-sm">{attSakitSiswa} Siswa</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attSakitSiswa / attTotalSiswa) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Izin</div>
                    <div className="font-black text-blue-600 text-sm">{attIzinSiswa} Siswa</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attIzinSiswa / attTotalSiswa) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Alfa</div>
                    <div className="font-black text-rose-600 text-sm">{attAlfaSiswa} Siswa</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attAlfaSiswa / attTotalSiswa) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>Balance: {attHadirSiswa} + {attSakitSiswa} + {attIzinSiswa} + {attAlfaSiswa} = {attTotalSiswa} Siswa</span>
                  <span className="font-bold text-emerald-600">Rekonsiliasi 100% Valid</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rekapitulasi Kehadiran Pegawai</div>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">Total Terdaftar: {attTotalPegawai} Orang</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Hadir Fisik ({attHadirPersenPegawai}%)</div>
                    <div className="font-black text-emerald-600 text-sm">{attHadirPegawai} Orang</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{attTerlambatPegawai} terlambat</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Dinas Luar</div>
                    <div className="font-black text-blue-600 text-sm">{attDinasLuar} Orang</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attDinasLuar / attTotalPegawai) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Sakit</div>
                    <div className="font-black text-amber-600 text-sm">{attSakitPegawai} Orang</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attSakitPegawai / attTotalPegawai) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <div className="text-slate-400 text-[10px]">Cuti</div>
                    <div className="font-black text-slate-600 text-sm">{attCutiPegawai} Orang</div>
                    <div className="text-[9px] text-slate-400 mt-0.5">{((attCutiPegawai / attTotalPegawai) * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex justify-between font-mono">
                  <span>Balance: {attHadirPegawai} + {attDinasLuar} + {attSakitPegawai} + {attCutiPegawai} = {attTotalPegawai} Orang</span>
                  <span className="font-bold text-emerald-600">Rekonsiliasi 100% Valid</span>
                </div>
              </div>
            </div>

            {/* Riwayat Koreksi Administratif */}
            <div>
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2">Riwayat Koreksi Administratif Presensi</h3>
              <div className="space-y-2">
                {(attendanceData?.koreksi_presensi_terbaru || []).map((k: any) => (
                  <div key={k.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{k.nama} ({k.tipe}) • Tanggal: {k.tanggal}</div>
                      <div className="text-slate-500 text-[11px]">
                        Perubahan: <span className="text-rose-600 font-bold">{k.semula}</span> ➔ <span className="text-emerald-600 font-bold">{k.menjadi}</span> (Alasan: {k.alasan})
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Oleh: {k.petugas}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 15: 🏖️ ADMINISTRASI CUTI & IZIN PEGAWAI
           ========================================================================= */}
        {activeMenu === 'pegawai-cuti' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Administrasi Cuti & Izin Guru / Staff</h2>
                <p className="text-xs text-slate-500">Pencatatan pengajuan cuti tahunan, cuti melahirkan, izin dinas luar, dan penerbitan SK Cuti.</p>
              </div>

              <button
                onClick={() => showToast('Form Input Pengajuan Cuti Baru Dibuka')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Pengajuan Cuti</span>
              </button>
            </div>

            <div className="space-y-3">
              {leavesData.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{l.nama}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {l.jenis_izin}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Jabatan: {l.jabatan} • Periode: {l.mulai} s/d {l.selesai} ({l.durasi})
                    </div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Lampiran: <span className="font-semibold">{l.lampiran}</span>
                    </div>
                    {l.arsip_sk !== '-' && (
                      <div className="text-[10px] font-mono text-emerald-700 font-bold mt-1">
                        {l.arsip_sk}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {l.status}
                    </span>
                    <button
                      onClick={() => showToast(`Cetak SK Izin/Cuti ${l.nama}`)}
                      className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Cetak SK
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 16, 17, 18, 19: 📅 AGENDA, KALENDER & NOTULEN RAPAT (MoM)
           ========================================================================= */}
        {activeMenu.startsWith('agenda-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Agenda, Rapat Dinas & Notulen (Minutes of Meeting)</h2>
                <p className="text-xs text-slate-500">Pencatatan agenda dinas sekolah, undangan rapat, notulen (MoM), keputusan, dan PIC tindak lanjut.</p>
              </div>

              <button
                onClick={() => setIsMeetingModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Buat Agenda Rapat</span>
              </button>
            </div>

            <div className="space-y-4">
              {meetingsData.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{m.judul}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Waktu: <span className="font-semibold text-slate-800">{m.tanggal}</span> • Tempat: {m.tempat}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Peserta: {m.peserta}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {m.status}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <div className="font-extrabold text-slate-700 text-[10px] uppercase">Agenda & Pembahasan:</div>
                    <p className="text-slate-600 text-[11px]">{m.agenda}</p>
                    <div className="font-extrabold text-slate-700 text-[10px] uppercase mt-2">Keputusan Rapat & Notulen:</div>
                    <p className="text-slate-800 text-[11px] font-medium">{m.notulen_mom}</p>
                    <div className="text-[10px] text-indigo-700 font-bold mt-1">PIC Tindak Lanjut: {m.pic}</div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => showToast(`Cetak Undangan Rapat: ${m.judul}`)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
                    >
                      Cetak Undangan
                    </button>
                    <button
                      onClick={() => showToast(`Cetak Notulen Resmi (MoM): ${m.judul}`)}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-all cursor-pointer"
                    >
                      Cetak Notulen (MoM)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 20: 🏫 INVENTARIS ADMINISTRATIF SEKOLAH
           ========================================================================= */}
        {activeMenu.startsWith('inventaris-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">Buku Inventaris Sarana Administratif</h2>
                <p className="text-xs text-slate-500">Pencatatan barang kantor, laptop, mesin fotocopy, lemari arsip, kondisi, dan penanggung jawab.</p>
              </div>

              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Barang Inventaris</span>
              </button>
            </div>

            {/* Inventory Metric Reconciliation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Unit Sarana</span>
                <div className="font-black text-slate-900 text-base mt-0.5">{totalInventoryUnits} Unit</div>
                <div className="text-[10px] text-slate-500">{inventoryData.length} Jenis Aset Terdaftar</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Kondisi Baik</span>
                <div className="font-black text-emerald-600 text-base mt-0.5">{goodConditionUnits} Unit</div>
                <div className="text-[10px] text-slate-500">{totalInventoryUnits > 0 ? ((goodConditionUnits / totalInventoryUnits) * 100).toFixed(1) : 0}% Layak Operasional</div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Perlu Pemeliharaan</span>
                <div className="font-black text-amber-600 text-base mt-0.5">{maintenanceUnits} Unit</div>
                <div className="text-[10px] text-slate-500">{totalInventoryUnits > 0 ? ((maintenanceUnits / totalInventoryUnits) * 100).toFixed(1) : 0}% Perlu Servis/Perbaikan</div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                    <th className="py-3 px-3">Kode & Barang</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Lokasi Ruang</th>
                    <th className="py-3 px-3">Kondisi</th>
                    <th className="py-3 px-3">Jumlah</th>
                    <th className="py-3 px-3">Tahun & Sumber</th>
                    <th className="py-3 px-3">Penanggung Jawab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {inventoryData.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{inv.nama_barang}</div>
                        <div className="text-[10px] font-mono text-slate-400">{inv.kode_barang}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{inv.kategori}</td>
                      <td className="py-3 px-3 text-slate-800 font-semibold">{inv.lokasi}</td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          inv.kondisi === 'Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.kondisi}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">{inv.jumlah} Unit</td>
                      <td className="py-3 px-3 text-slate-600">{inv.tahun_beli} ({inv.sumber_dana})</td>
                      <td className="py-3 px-3 text-slate-700">{inv.pj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 21 & 22: 📢 PENGUMUMAN & PENGAJUAN INTERNAL
           ========================================================================= */}
        {activeMenu === 'agenda-sekolah' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-black text-slate-900">Agenda Kegiatan Sekolah & Pelayanan TU</h2>
            <div className="space-y-3">
              {[
                { date: '05 Okt 2026', title: 'Batas Akhir Pelengkapan Berkas Buku Induk Siswa Baru', loc: 'Loket TU', pic: 'Staff TU' },
                { date: '12 Okt 2026', title: 'Pelaksanaan Asesmen Tengah Semester (ATS) Ganjil', loc: 'Seluruh Rombel', pic: 'Panitia Ujian & TU' },
                { date: '20 Okt 2026', title: 'Sinkronisasi Cut-Off Dapodik Semester Ganjil', loc: 'Ruang Operator', pic: 'Operator Sekolah' },
              ].map((ev, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono text-amber-700 font-bold text-[11px]">{ev.date}</div>
                    <div className="font-bold text-slate-900 mt-0.5">{ev.title}</div>
                    <div className="text-slate-500 text-[11px]">Lokasi: {ev.loc} • PIC: {ev.pic}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-bold">
                    Agenda Resmi
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 23 & 24: 📥 IMPORT & EXPORT EXCEL
           ========================================================================= */}
        {(activeMenu === 'io-import' || activeMenu === 'io-export') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {activeMenu === 'io-import' ? 'Pusat Import Data Master Siswa, Pegawai & Alumni' : 'Pusat Export Data & Pelaporan Resmi'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeMenu === 'io-import'
                  ? 'Wizard 4 tahap: Upload file -> Mapping kolom -> Validasi error -> Eksekusi import.'
                  : 'Unduh rekap data administrasi sekolah dalam format Excel (.xlsx), CSV, atau cetak dokumen PDF.'}
              </p>
            </div>

            {activeMenu === 'io-import' ? (
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">1</span>
                    <span className="text-xs font-bold text-slate-900">Pilih Kategori Data</span>
                  </div>
                  <select
                    value={importCategory}
                    onChange={(e) => setImportCategory(e.target.value)}
                    className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200"
                  >
                    <option value="siswa">Data Siswa & Orang Tua</option>
                    <option value="guru">Data Guru & Mapel</option>
                    <option value="tendik">Data Tenaga Kependidikan</option>
                    <option value="alumni">Data Alumni & Kelulusan</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 text-center bg-white space-y-3">
                  <Upload className="w-8 h-8 text-amber-500 mx-auto" />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Seret file Excel (.xlsx / .csv) ke sini</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Maksimal 10 MB per file</div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => showToast('Mengunduh template template_import_siswa.xlsx')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    >
                      Download Template Excel
                    </button>
                    <button
                      onClick={() => showToast('Simulasi upload & validasi file Excel berhasil: 24 baris siap')}
                      className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                    >
                      Pilih File dari Komputer
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">Validasi Format Otomatis:</span>
                    <span className="text-slate-500 ml-2">NISN 10 digit numerik, NIK 16 digit terverifikasi, Tidak ada duplikasi data.</span>
                  </div>
                  <button
                    onClick={() => showToast('Import data berhasil disimpan ke basis data!')}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold cursor-pointer"
                  >
                    Eksekusi Import
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Export Buku Induk Siswa', desc: 'Seluruh data pokok siswa aktif, kelas, dan orang tua', format: 'Excel & PDF' },
                  { title: 'Export Rekap Kepegawaian', desc: 'Data NIP, pangkat/golongan, dan riwayat guru/tendik', format: 'Excel' },
                  { title: 'Export Agenda Surat Masuk/Keluar', desc: 'Rekapitulasi nomor surat dinas tahun 2026', format: 'Excel & PDF' },
                  { title: 'Export Mutasi & Alumni', desc: 'Daftar riwayat mutasi masuk, keluar, dan alumni', format: 'Excel' },
                  { title: 'Export Rekap Presensi Bulanan', desc: 'Kehadiran, sakit, izin, dan alfa siswa/guru', format: 'Excel & CSV' },
                  { title: 'Export Buku Inventaris Sarpras', desc: 'Kode barang, kondisi, dan ruangan penempatan', format: 'Excel & PDF' },
                ].map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{exp.title}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{exp.desc}</div>
                      <div className="text-[10px] text-amber-700 font-bold mt-2">Format: {exp.format}</div>
                    </div>
                    <button
                      onClick={() => showToast(`Mengunduh file ${exp.title}.xlsx`)}
                      className="mt-4 w-full py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download File</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 25: 📈 LAPORAN TATA USAHA
           ========================================================================= */}
        {activeMenu.startsWith('laporan-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Laporan Statistik & Kinerja Tata Usaha</h2>
              <p className="text-xs text-slate-500">Laporan administratif berkala untuk Dinas Pendidikan, Kepala Sekolah, dan Evaluasi Layanan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Rata-rata Respon Layanan</div>
                <div className="text-2xl font-black text-slate-900 mt-1">2.4 Jam</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Sesuai Standar Pelayanan Minimal</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Tingkat Penyelesaian Tiket</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{periodicTicketRate}%</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">{periodicCompletedTickets} dari {periodicTotalTickets} tiket selesai</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Kelengkapan Buku Induk</div>
                <div className="text-2xl font-black text-slate-900 mt-1">{studentDataCompletenessRate}%</div>
                <div className="text-[11px] text-amber-600 font-semibold mt-0.5">{incompleteStudentFiles} berkas perlu dilengkapi ({completedStudentFiles} dari {totalStudents} lengkap)</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Frekuensi Surat Keluar</div>
                <div className="text-2xl font-black text-slate-900 mt-1">156</div>
                <div className="text-[11px] text-blue-600 font-semibold mt-0.5">Tahun Berjalan 2026</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Laporan Akuntabilitas Kinerja Tata Usaha Triwulan III 2026</div>
                <div className="text-[11px] text-slate-500">Siap dicetak dan ditandatangani untuk arsip dinas</div>
              </div>
              <button
                onClick={() => showToast('Mencetak Laporan Akuntabilitas Kinerja TU Triwulan III 2026')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan Lengkap</span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 26 & 27: 🔍 DATA QUALITY & VERIFIKASI KELENGKAPAN BERKAS
            ========================================================================= */}
        {activeMenu.startsWith('dq-') && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">Pusat Validasi Data Quality & Kelengkapan Berkas</h2>
              <p className="text-xs text-slate-500">
                Deteksi otomatis data siswa dan pegawai yang belum lengkap (tanpa NIK, berkas KK hilang, ijazah belum diunggah).
              </p>
            </div>

            <div className="space-y-3">
              {(dataQualityData?.issues || [
                { id: 1, kategori: 'Data Siswa', judul: '3 Siswa Kelas X belum melengkapi Nomor KK', rincian: 'Rian Pratama (X-IPA 2), Bagas Danu (X-IPS 1), Salsa Bila (X-IPA 3)', dampak: 'Sinkronisasi NISN dan Dapodik tertahan', aksi: 'Kirim Notifikasi ke Wali Murid' },
                { id: 2, kategori: 'Dokumen Siswa', judul: '4 Siswa Baru belum mengunggah Akta Kelahiran Digital', rincian: 'Diperlukan untuk verifikasi nomor registrasi akta sipil Kemendikbud (Total 3 KK + 4 Akta = 7 berkas pending)', dampak: 'Validasi buku induk belum 100%', aksi: 'Buka Form Pelengkapan Berkas' },
                { id: 3, kategori: 'Data Guru/Tendik', judul: '1 Guru belum memperbarui SK Kenaikan Pangkat Terakhir', rincian: 'Dra. Endang Sulastri (Pangkat Pembina IV/a)', dampak: 'Pelaporan berkala ke BKD/Disdik', aksi: 'Hubungi Guru Bersangkutan' },
              ]).map((issue: any) => (
                <div key={issue.id} className="p-4 rounded-2xl border border-rose-200 bg-rose-50/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{issue.judul}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          {issue.kategori}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">{issue.rincian}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dampak: {issue.dampak}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => showToast(`Tindakan diambil: ${issue.aksi}`)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer whitespace-nowrap self-end md:self-center"
                  >
                    {issue.aksi}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 30: 🔎 GLOBAL SEARCH TATA USAHA
           ========================================================================= */}
        {activeMenu === 'global-search' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div>
              <h2 className="text-lg font-black text-slate-900">Pencarian Global Terpadu Tata Usaha</h2>
              <p className="text-xs text-slate-500">Cari data apapun: nama siswa, NIS/NISN, nama guru, NIP, nomor surat masuk/keluar, nomor tiket, atau barang inventaris.</p>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Ketik kata kunci pencarian (contoh: Ahmad, 20261001, Disdik, 421.3, ThinkPad)..."
                className="w-full pl-12 pr-4 py-3 text-sm rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hasil Pencarian Cepat</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-amber-700 font-bold uppercase">Siswa</div>
                <div className="font-bold text-slate-900 mt-0.5">Ahmad Fauzi (NIS: 20261001)</div>
                <div className="text-[11px] text-slate-500">Kelas X-IPA 1 • Status Aktif • Dokumen Lengkap</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-blue-700 font-bold uppercase">Surat Keluar</div>
                <div className="font-bold text-slate-900 mt-0.5">421.3/086/SMAN-01/X/2026</div>
                <div className="text-[11px] text-slate-500">Surat Keterangan Aktif Belajar (Ahmad Fauzi)</div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 31: 🔔 NOTIFICATION CENTER
           ========================================================================= */}
        {activeMenu === 'notifikasi' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Pusat Notifikasi & Agenda Tata Usaha</h2>
                <p className="text-xs text-slate-500">Pemberitahuan surat masuk baru, tiket pengajuan siswa, dan tenggat waktu verifikasi.</p>
              </div>
              <button
                onClick={() => showToast('Semua notifikasi ditandai telah dibaca')}
                className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Tandai Sudah Dibaca
              </button>
            </div>

            <div className="space-y-3">
              {[
                { time: '10 menit yang lalu', title: 'Permintaan Surat Baru', desc: 'Ahmad Fauzi mengajukan permohonan Surat Keterangan Aktif Belajar', cat: 'Tiket Layanan' },
                { time: '1 jam yang lalu', title: 'Surat Masuk Dinas Diterima', desc: 'No. 042/DISDIK-JBR/IX/2026 dari Dinas Pendidikan Jawa Barat', cat: 'Surat Masuk' },
                { time: '3 jam yang lalu', title: 'Peringatan Kelengkapan Data', desc: '3 siswa belum mengisi Nomor Kartu Keluarga di sistem', cat: 'Data Quality' },
              ].map((n, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-900">{n.title}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{n.time}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{n.desc}</div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {n.cat}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 32: 📜 AUDIT LOG TATA USAHA
           ========================================================================= */}
        {activeMenu === 'profil' && (
          <div className="space-y-6">
            {/* Profil TU & Keamanan */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center font-bold text-xl shadow-md">
                  HP
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Hendra Pratama, A.Md</h2>
                  <p className="text-xs text-slate-500">Kepala Urusan Tata Usaha / Staff Administrasi Sekolah</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-700">NIP: 19881104 201403 1 002</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">PNS (Pengatur III/a)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Email Dinas</div>
                  <div className="text-xs font-semibold text-slate-800">hendra.tu@sekolah.sch.id</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">No. Handphone / WA</div>
                  <div className="text-xs font-semibold text-slate-800">0812-3456-7899</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Status Autentikasi 2FA</div>
                  <div className="text-xs font-bold text-emerald-600">Aktif & Terlindungi</div>
                </div>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Jejak Audit Aktivitas Staf TU (Digital Audit Trail)</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                      <th className="py-2.5 px-3">Waktu</th>
                      <th className="py-2.5 px-3">Petugas</th>
                      <th className="py-2.5 px-3">Aksi</th>
                      <th className="py-2.5 px-3">Objek / Dokumen</th>
                      <th className="py-2.5 px-3 font-mono">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {auditLogData.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{log.waktu}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-800">{log.pengguna}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px]">
                            {log.aksi}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{log.objek}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 34: ❓ HELP & SUPPORT / PANDUAN SOP TATA USAHA
           ========================================================================= */}
        {activeMenu === 'bantuan' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Buku Panduan & Standar Operasional Prosedur (SOP) Tata Usaha</h2>
              <p className="text-xs text-slate-500">Panduan tata naskah dinas, klasifikasi nomor surat dinas pendidikan, dan alur pelayanan administrasi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>SOP Tata Naskah Dinas & Penomoran Surat</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Format penomoran surat berpedoman pada Permendikbudristek: [Kode Klasifikasi]/[Nomor Urut]/[Kode Sekolah]/[Bulan Romawi]/[Tahun]. Penomoran direset otomatis setiap awal tahun pelajaran/kalender.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>Standar Waktu Layanan (SLA Tiket)</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Surat Keterangan Aktif Belajar: maksimal 1 x 24 jam. Legalisir Ijazah: maksimal 2 jam. Surat Mutasi Masuk/Keluar: maksimal 2 x 24 jam setelah verifikasi dokumen lengkap.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-amber-900">Butuh Bantuan Teknis atau Panduan Tambahan?</div>
                <div className="text-[11px] text-amber-700">Hubungi Helpdesk Tim IT & Operator Dapodik Sekolah</div>
              </div>
              <button
                onClick={() => showToast('Menghubungi Helpdesk IT Support via WhatsApp')}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Kontak Helpdesk IT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MODALS INTERAKTIF
         ========================================================================= */}

      {/* Modal Input Surat Masuk */}
      {isNewLetterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Registrasi Surat Masuk Baru</h3>
              <button onClick={() => setIsNewLetterModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nomor Surat Masuk</label>
                <input type="text" placeholder="Contoh: 045/DISDIK/X/2026" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Surat</label>
                  <input type="date" defaultValue="2026-10-02" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <option>Undangan Dinas</option>
                    <option>Pemberitahuan</option>
                    <option>Permohonan</option>
                    <option>Edaran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pengirim / Instansi</label>
                <input type="text" placeholder="Dinas Pendidikan / Instansi terkait" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Perihal</label>
                <input type="text" placeholder="Perihal isi surat..." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewLetterModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsNewLetterModalOpen(false);
                  showToast('Surat masuk berhasil dicatat ke Buku Agenda!');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
              >
                Simpan Surat Masuk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Disposisi Surat */}
      {isDispositionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Lembar Disposisi Kepala Sekolah</h3>
                <p className="text-[11px] text-slate-500">{selectedItem?.nomor_surat || 'Surat Masuk'}</p>
              </div>
              <button onClick={() => setIsDispositionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diteruskan Kepada (Disposisi)</label>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <label className="flex items-center gap-1.5"><input type="checkbox" defaultChecked /> Waka Kurikulum</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" /> Waka Kesiswaan</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" /> Waka Sarpras & Humas</label>
                  <label className="flex items-center gap-1.5"><input type="checkbox" /> Pembina OSIS / BK</label>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Instruksi Kepala Sekolah</label>
                <textarea rows={3} defaultValue="Harap ditindaklanjuti dan dikoordinasikan dengan tim terkait paling lambat hari Jumat." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsDispositionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setIsDispositionModalOpen(false);
                  showToast('Disposisi berhasil diteruskan dan disimpan!');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                Kirim Disposisi & Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Koreksi Presensi */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Form Koreksi Administratif Presensi</h3>
              <button onClick={() => setIsCorrectionModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Siswa / Guru</label>
                <input type="text" placeholder="Nama lengkap..." defaultValue="Rian Pratama" className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semula</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <option>Alfa</option>
                    <option>Terlambat</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Diubah Menjadi</label>
                  <select className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                    <option>Sakit (Surat Dokter)</option>
                    <option>Izin Resmi</option>
                    <option>Hadir</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Koreksi & Bukti</label>
                <textarea rows={2} placeholder="Surat dokter diserahkan ortu..." defaultValue="Surat dokter dari RS Hasan Sadikin diserahkan orang tua ke loket TU." className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsCorrectionModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setIsCorrectionModalOpen(false);
                  showToast('Koreksi presensi berhasil dicatat!');
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white"
              >
                Simpan Koreksi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
