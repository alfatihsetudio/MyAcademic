'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Building2,
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
  RefreshCw,
  Download,
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
  Printer,
  Compass,
  AlertOctagon,
  Shield,
  Activity,
  UserCheck2,
  MessageSquare,
  Lock,
  Send,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchPrincipalDashboard,
  fetchPrincipalProfile,
  fetchPrincipalStudents,
  fetchPrincipalTeachers,
  fetchPrincipalClasses,
  fetchPrincipalAcademic,
  fetchPrincipalSubjects,
  fetchPrincipalAttendance,
  fetchPrincipalLearning,
  fetchPrincipalAssessments,
  fetchPrincipalGrades,
  fetchPrincipalReportCards,
  fetchPrincipalApprovalCenter,
  processPrincipalApproval,
  fetchPrincipalClassPromotion,
  fetchPrincipalGraduation,
  fetchPrincipalCounseling,
  fetchPrincipalDiscipline,
  fetchPrincipalAchievements,
  fetchPrincipalExtracurriculars,
  fetchPrincipalCalendar,
  fetchPrincipalAnnouncements,
  storePrincipalAnnouncement,
  fetchPrincipalCommunication,
  sendPrincipalBroadcast,
  fetchPrincipalReports,
  fetchPrincipalAnalytics,
  fetchPrincipalEarlyWarning,
  fetchPrincipalPeriodComparison,
  fetchPrincipalPerformanceProfile,
  fetchPrincipalDocuments,
  fetchPrincipalAuditTrail,
  fetchPrincipalSearch,
  fetchPrincipalNotifications
} from '@/lib/api';

export type PrincipalMenuKey =
  | 'dashboard'
  // 📊 Monitoring
  | 'monitoring-siswa'
  | 'monitoring-guru'
  | 'monitoring-kelas'
  | 'monitoring-akademik'
  | 'monitoring-kbm'
  | 'monitoring-presensi'
  | 'monitoring-nilai'
  | 'monitoring-disiplin'
  | 'monitoring-prestasi'
  | 'monitoring-bk'
  | 'monitoring-ekskul'
  // 📚 Akademik
  | 'akademik-performa'
  | 'akademik-mapel'
  | 'akademik-rapor'
  | 'akademik-kenaikan'
  | 'akademik-kelulusan'
  // 👥 SDM
  | 'sdm-guru'
  | 'sdm-tendik'
  | 'sdm-kehadiran'
  | 'sdm-aktivitas'
  // 🎓 Kesiswaan
  | 'kesiswaan-siswa'
  | 'kesiswaan-kehadiran'
  | 'kesiswaan-prestasi'
  | 'kesiswaan-pelanggaran'
  | 'kesiswaan-bk'
  | 'kesiswaan-ekskul'
  // ✅ Approval
  | 'approval-center'
  // 📅 Kalender
  | 'kalender-agenda'
  // 📢 Komunikasi
  | 'komunikasi-pengumuman'
  | 'komunikasi-broadcast'
  // 📄 Laporan
  | 'laporan-eksekutif'
  // 📈 Analytics
  | 'analytics-kpi'
  | 'analytics-ews'
  | 'analytics-perbandingan'
  | 'analytics-performa-sekolah'
  // 📁 Dokumen
  | 'dokumen-sekolah'
  // 🔍 Global Search
  | 'global-search'
  // 👤 Profil & Audit
  | 'profil-sekolah'
  | 'profil-akun'
  | 'audit-trail'
  | 'bantuan-support';

interface PrincipalHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  externalActiveMenu?: PrincipalMenuKey;
}

export default function PrincipalHubView({
  currentUser,
  onNavigateTab,
  externalActiveMenu
}: PrincipalHubViewProps) {
  const [activeMenu, setActiveMenu] = useState<PrincipalMenuKey>(externalActiveMenu || 'dashboard');
  const [menuSearch, setMenuSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Data states
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any>(null);
  const [teachersData, setTeachersData] = useState<any>(null);
  const [classesData, setClassesData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [subjectsData, setSubjectsData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [learningData, setLearningData] = useState<any>(null);
  const [assessmentsData, setAssessmentsData] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [reportCardsData, setReportCardsData] = useState<any>(null);
  const [approvalsData, setApprovalsData] = useState<any>(null);
  const [promotionData, setPromotionData] = useState<any>(null);
  const [graduationData, setGraduationData] = useState<any>(null);
  const [counselingData, setCounselingData] = useState<any>(null);
  const [disciplineData, setDisciplineData] = useState<any>(null);
  const [achievementsData, setAchievementsData] = useState<any>(null);
  const [ekskulData, setEkskulData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [announcementsData, setAnnouncementsData] = useState<any>(null);
  const [communicationData, setCommunicationData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [ewsData, setEwsData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [auditData, setAuditData] = useState<any>(null);
  const [notificationsData, setNotificationsData] = useState<any>(null);

  // Timeframe for performance profile
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'semester' | 'year'>('today');

  // Interactive UI modals
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | 'revision'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [approvalSuccessMsg, setApprovalSuccessMsg] = useState('');

  // Announcement modal
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ judul: '', konten: '', target: 'Semua Sekolah', pinned: false });

  // Broadcast modal
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [newBroadcast, setNewBroadcast] = useState({ judul: '', pesan: '', target: 'Dewan Guru & Pengajar' });

  // Global search input
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Filter states
  const [studentFilterGrade, setStudentFilterGrade] = useState('ALL');
  const [studentFilterRisk, setStudentFilterRisk] = useState('ALL');
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<any>(null);

  useEffect(() => {
    if (externalActiveMenu) {
      setActiveMenu(externalActiveMenu);
    }
  }, [externalActiveMenu]);

  // Initial data load
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        dash, prof, stud, teach, cls, acad, subj, att, lrn, ass, grd, rep, app,
        prom, grad, cns, disc, ach, eks, cal, ann, comm, rpt, anl, ews, cmp,
        perf, doc, aud, notif
      ] = await Promise.all([
        fetchPrincipalDashboard(),
        fetchPrincipalProfile(),
        fetchPrincipalStudents(),
        fetchPrincipalTeachers(),
        fetchPrincipalClasses(),
        fetchPrincipalAcademic(),
        fetchPrincipalSubjects(),
        fetchPrincipalAttendance(),
        fetchPrincipalLearning(),
        fetchPrincipalAssessments(),
        fetchPrincipalGrades(),
        fetchPrincipalReportCards(),
        fetchPrincipalApprovalCenter(),
        fetchPrincipalClassPromotion(),
        fetchPrincipalGraduation(),
        fetchPrincipalCounseling(),
        fetchPrincipalDiscipline(),
        fetchPrincipalAchievements(),
        fetchPrincipalExtracurriculars(),
        fetchPrincipalCalendar(),
        fetchPrincipalAnnouncements(),
        fetchPrincipalCommunication(),
        fetchPrincipalReports(),
        fetchPrincipalAnalytics(),
        fetchPrincipalEarlyWarning(),
        fetchPrincipalPeriodComparison(),
        fetchPrincipalPerformanceProfile(timeframe),
        fetchPrincipalDocuments(),
        fetchPrincipalAuditTrail(),
        fetchPrincipalNotifications()
      ]);

      if (dash) setDashboardData(dash);
      if (prof) setProfileData(prof);
      if (stud) setStudentsData(stud);
      if (teach) setTeachersData(teach);
      if (cls) setClassesData(cls);
      if (acad) setAcademicData(acad);
      if (subj) {
        setSubjectsData(subj);
        if (subj.subjects && subj.subjects.length > 0) setSelectedSubjectDetail(subj.subjects[0]);
      }
      if (att) setAttendanceData(att);
      if (lrn) setLearningData(lrn);
      if (ass) setAssessmentsData(ass);
      if (grd) setGradesData(grd);
      if (rep) setReportCardsData(rep);
      if (app) setApprovalsData(app);
      if (prom) setPromotionData(prom);
      if (grad) setGraduationData(grad);
      if (cns) setCounselingData(cns);
      if (disc) setDisciplineData(disc);
      if (ach) setAchievementsData(ach);
      if (eks) setEkskulData(eks);
      if (cal) setCalendarData(cal);
      if (ann) setAnnouncementsData(ann);
      if (comm) setCommunicationData(comm);
      if (rpt) setReportsData(rpt);
      if (anl) setAnalyticsData(anl);
      if (ews) setEwsData(ews);
      if (cmp) setComparisonData(cmp);
      if (perf) setPerformanceData(perf);
      if (doc) setDocumentsData(doc);
      if (aud) setAuditData(aud);
      if (notif) setNotificationsData(notif);
    } catch (err: any) {
      toast.error('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = async (tf: 'today' | 'week' | 'month' | 'semester' | 'year') => {
    setTimeframe(tf);
    try {
      const perf = await fetchPrincipalPerformanceProfile(tf);
      if (perf) setPerformanceData(perf);
    } catch (err: any) {
      toast.error('Gagal memuat data performa.');
    }
  };

  const handleGlobalSearch = async (val: string) => {
    setGlobalSearchQuery(val);
    if (val.trim().length > 1) {
      const res = await fetchPrincipalSearch(val);
      if (res && res.results) setSearchResults(res.results);
    } else {
      setSearchResults([]);
    }
  };

  const handleOpenApprovalModal = (item: any, action: 'approve' | 'reject' | 'revision') => {
    setSelectedApproval(item);
    setApprovalAction(action);
    setApprovalNotes('');
    setApprovalModalOpen(true);
  };

  const handleSubmitApproval = async () => {
    if (!selectedApproval) return;
    const res = await processPrincipalApproval(selectedApproval.id, approvalAction, approvalNotes);
    setApprovalSuccessMsg(res.message || 'Persetujuan berhasil diproses');
    setTimeout(() => {
      setApprovalSuccessMsg('');
      setApprovalModalOpen(false);
      // Refresh approval list
      fetchPrincipalApprovalCenter().then((app) => app && setApprovalsData(app));
    }, 1200);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncement.judul) return;
    await storePrincipalAnnouncement(newAnnouncement);
    setAnnouncementModalOpen(false);
    setNewAnnouncement({ judul: '', konten: '', target: 'Semua Sekolah', pinned: false });
    fetchPrincipalAnnouncements().then((ann) => ann && setAnnouncementsData(ann));
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBroadcast.judul) return;
    await sendPrincipalBroadcast(newBroadcast);
    setBroadcastModalOpen(false);
    setNewBroadcast({ judul: '', pesan: '', target: 'Dewan Guru & Pengajar' });
    fetchPrincipalCommunication().then((comm) => comm && setCommunicationData(comm));
  };

  const mapActionTab = (tab: string): PrincipalMenuKey => {
    const map: Record<string, PrincipalMenuKey> = {
      approval: 'approval-center',
      'approval-center': 'approval-center',
      academic: 'akademik-mapel',
      'akademik-mapel': 'akademik-mapel',
      'monitoring-akademik': 'monitoring-akademik',
      'akademik-performa': 'akademik-performa',
      students: 'monitoring-siswa',
      'monitoring-siswa': 'monitoring-siswa',
      'kesiswaan-siswa': 'kesiswaan-siswa',
      teachers: 'monitoring-guru',
      'monitoring-guru': 'monitoring-guru',
      'sdm-guru': 'sdm-guru',
      classes: 'monitoring-kelas',
      'monitoring-kelas': 'monitoring-kelas',
      subjects: 'akademik-mapel',
      documents: 'dokumen-sekolah',
      'dokumen-sekolah': 'dokumen-sekolah',
      achievements: 'monitoring-prestasi',
      'monitoring-prestasi': 'monitoring-prestasi'
    };
    return map[tab] || (tab as PrincipalMenuKey);
  };

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  interface PrincipalMenuItem {
    key: PrincipalMenuKey;
    label: string;
    icon: any;
    badge?: string;
    alert?: boolean;
  }

  interface PrincipalMenuGroup {
    id: string;
    title: string;
    items: PrincipalMenuItem[];
  }

  // Structured menu items according to specification
  const menuCategories: PrincipalMenuGroup[] = [
    {
      id: 'core',
      title: '🏠 DASHBOARD EKSEKUTIF',
      items: [
        { key: 'dashboard' as PrincipalMenuKey, label: 'Dashboard Utama', icon: LayoutDashboard, badge: 'Executive' },
      ]
    },
    {
      id: 'monitoring',
      title: '📊 MONITORING SEKOLAH',
      items: [
        { key: 'monitoring-siswa' as PrincipalMenuKey, label: 'Monitoring Siswa & EWS', icon: GraduationCap },
        { key: 'monitoring-guru' as PrincipalMenuKey, label: 'Monitoring Guru & KBM', icon: Users },
        { key: 'monitoring-kelas' as PrincipalMenuKey, label: 'Monitoring Rombel & Komparasi', icon: Layers },
        { key: 'monitoring-akademik' as PrincipalMenuKey, label: 'Monitoring Akademik', icon: BarChart3 },
        { key: 'monitoring-kbm' as PrincipalMenuKey, label: 'Aktivitas KBM Hari Ini', icon: BookOpen },
        { key: 'monitoring-presensi' as PrincipalMenuKey, label: 'Presensi Siswa & Guru', icon: UserCheck },
        { key: 'monitoring-nilai' as PrincipalMenuKey, label: 'Kelengkapan Nilai Guru', icon: FileSpreadsheet },
        { key: 'monitoring-disiplin' as PrincipalMenuKey, label: 'Disiplin & Tata Tertib', icon: ShieldAlert },
        { key: 'monitoring-prestasi' as PrincipalMenuKey, label: 'Direktori Prestasi', icon: Award },
        { key: 'monitoring-bk' as PrincipalMenuKey, label: 'Layanan BK (Agregat)', icon: HeartRateIcon },
        { key: 'monitoring-ekskul' as PrincipalMenuKey, label: 'Ekstrakurikuler', icon: Compass },
      ]
    },
    {
      id: 'academic',
      title: '📚 AKADEMIK & EVALUASI',
      items: [
        { key: 'akademik-performa' as PrincipalMenuKey, label: 'Performa Nilai & Tren', icon: TrendingUp },
        { key: 'akademik-mapel' as PrincipalMenuKey, label: 'Performa Mata Pelajaran', icon: BookOpen },
        { key: 'akademik-rapor' as PrincipalMenuKey, label: 'Rapor & Evaluasi Sekolah', icon: FileCheck },
        { key: 'akademik-kenaikan' as PrincipalMenuKey, label: 'Kenaikan Kelas', icon: ArrowRightLeft },
        { key: 'akademik-kelulusan' as PrincipalMenuKey, label: 'Kelulusan Siswa', icon: Award },
      ]
    },
    {
      id: 'sdm',
      title: '👥 SDM PENDIDIK & TENDIK',
      items: [
        { key: 'sdm-guru' as PrincipalMenuKey, label: 'Direktori Guru & Beban Ajar', icon: Users },
        { key: 'sdm-tendik' as PrincipalMenuKey, label: 'Tenaga Kependidikan', icon: Building2 },
        { key: 'sdm-kehadiran' as PrincipalMenuKey, label: 'Rekap Kehadiran Guru', icon: UserCheck2 },
        { key: 'sdm-aktivitas' as PrincipalMenuKey, label: 'Jurnal & Administrasi KBM', icon: History },
      ]
    },
    {
      id: 'kesiswaan',
      title: '🎓 KESISWAAN',
      items: [
        { key: 'kesiswaan-siswa' as PrincipalMenuKey, label: 'Database Siswa Terpadu', icon: GraduationCap },
        { key: 'kesiswaan-kehadiran' as PrincipalMenuKey, label: 'Analisis Presensi Siswa', icon: Clock },
        { key: 'kesiswaan-prestasi' as PrincipalMenuKey, label: 'Prestasi Siswa', icon: Award },
        { key: 'kesiswaan-pelanggaran' as PrincipalMenuKey, label: 'Pelanggaran & Pembinaan', icon: ShieldAlert },
        { key: 'kesiswaan-bk' as PrincipalMenuKey, label: 'Konseling & Bimbingan', icon: Shield },
        { key: 'kesiswaan-ekskul' as PrincipalMenuKey, label: 'Aktivitas Ekstrakurikuler', icon: Compass },
      ]
    },
    {
      id: 'approval',
      title: '✅ APPROVAL CENTER',
      items: [
        { key: 'approval-center' as PrincipalMenuKey, label: 'Approval Center Pimpinan', icon: CheckCircle2, badge: 'Penting', alert: true },
      ]
    },
    {
      id: 'calendar',
      title: '📅 AGENDA & KALENDER',
      items: [
        { key: 'kalender-agenda' as PrincipalMenuKey, label: 'Kalender & Agenda Pimpinan', icon: Calendar },
      ]
    },
    {
      id: 'communication',
      title: '📢 KOMUNIKASI RESMI',
      items: [
        { key: 'komunikasi-pengumuman' as PrincipalMenuKey, label: 'Pengumuman Resmi Sekolah', icon: Megaphone },
        { key: 'komunikasi-broadcast' as PrincipalMenuKey, label: 'Broadcast Pimpinan', icon: Radio },
      ]
    },
    {
      id: 'reports',
      title: '📄 LAPORAN EKSEKUTIF',
      items: [
        { key: 'laporan-eksekutif' as PrincipalMenuKey, label: 'Laporan & Export Cetak', icon: Printer },
      ]
    },
    {
      id: 'analytics',
      title: '📈 ANALYTICS & EWS',
      items: [
        { key: 'analytics-kpi' as PrincipalMenuKey, label: 'Executive KPI Dashboard', icon: BarChart3 },
        { key: 'analytics-ews' as PrincipalMenuKey, label: 'Early Warning System (EWS)', icon: AlertOctagon, alert: true },
        { key: 'analytics-perbandingan' as PrincipalMenuKey, label: 'Perbandingan Lintas Periode', icon: ArrowRightLeft },
        { key: 'analytics-performa-sekolah' as PrincipalMenuKey, label: 'Profil Performa Sekolah', icon: Activity },
      ]
    },
    {
      id: 'documents',
      title: '📁 DOKUMEN & AUDIT',
      items: [
        { key: 'dokumen-sekolah' as PrincipalMenuKey, label: 'Dokumen Resmi & SK', icon: FolderArchive },
        { key: 'audit-trail' as PrincipalMenuKey, label: 'Audit Trail Aktivitas', icon: History },
      ]
    },
    {
      id: 'system',
      title: '🔍 PENCARIAN & PROFIL',
      items: [
        { key: 'global-search' as PrincipalMenuKey, label: 'Pencarian Global Sekolah', icon: Search },
        { key: 'profil-sekolah' as PrincipalMenuKey, label: 'Profil Lembaga Sekolah', icon: SchoolIcon },
        { key: 'profil-akun' as PrincipalMenuKey, label: 'Akun Kepala Sekolah', icon: ShieldCheck },
        { key: 'bantuan-support' as PrincipalMenuKey, label: 'Pusat Bantuan & Status', icon: HelpCircle },
      ]
    }
  ];

  function HeartRateIcon(props: any) {
    return <Activity {...props} />;
  }

  // Filtered menu based on internal search
  const filteredCategories = menuCategories.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.label.toLowerCase().includes(menuSearch.toLowerCase()) ||
      group.title.toLowerCase().includes(menuSearch.toLowerCase())
    )
  })).filter((group) => group.items.length > 0);

  return (
    <div className="flex flex-col lg:flex-row gap-5 w-full min-h-[calc(100vh-140px)] animate-in fade-in duration-200">
      {/* =========================================================================
          LEFT EXECUTIVE SIDEBAR (STRICTLY PRINCIPAL FOCUSED, ZERO CRUD CLUTTER)
          ========================================================================= */}
      <aside className="w-full lg:w-72 shrink-0 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden">
        {/* Principal Header Badge */}
        <div className="p-4 border-b border-slate-100 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400 font-bold shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-amber-400/20 text-amber-300 rounded-full border border-amber-400/30">
                  PIMPINAN
                </span>
                <span className="text-[10px] text-slate-300">TA 2026/2027</span>
              </div>
              <h2 className="text-sm font-bold truncate text-white mt-0.5">Kepala Sekolah</h2>
              <p className="text-[11px] text-slate-300 truncate font-mono">Dr. H. Sulaiman, M.Si</p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sistem Terkoneksi
            </span>
            <span className="font-semibold text-white">33 Fitur Eksekutif</span>
          </div>
        </div>

        {/* Quick Menu Search */}
        <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Cari fitur pimpinan..."
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400"
            />
            {menuSearch && (
              <button
                onClick={() => setMenuSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3 custom-scrollbar text-xs">
          {filteredCategories.map((group) => {
            const isCollapsed = collapsedGroups[group.id];
            return (
              <div key={group.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 hover:text-slate-600 uppercase transition-colors"
                >
                  <span>{group.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeMenu === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => setActiveMenu(item.key)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200 font-semibold'
                              : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 ${
                                isActive ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? 'bg-white/20 text-white'
                                  : item.alert
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-indigo-50 text-indigo-700'
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

        {/* Quick Refresh & Help */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
            title="Sinkronisasi seluruh data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Sinkron Data</span>
          </button>
          <button
            onClick={() => setActiveMenu('bantuan-support')}
            className="flex items-center gap-1 hover:text-slate-700"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Bantuan</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN WORKSPACE (EXECUTIVE CONTENT DISPLAY)
          ========================================================================= */}
      <main className="flex-1 min-w-0 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm p-5 lg:p-6 flex flex-col">
        {/* Dynamic Top Bar inside Main Workspace */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Executive Portal</span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold uppercase tracking-wider">
                {activeMenu.replace('-', ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeMenu === 'dashboard' && 'Dashboard Eksekutif Kepala Sekolah'}
              {activeMenu === 'monitoring-siswa' && 'Monitoring & Peringatan Dini Siswa (EWS)'}
              {activeMenu === 'monitoring-guru' && 'Monitoring Kinerja Guru & Beban Mengajar'}
              {activeMenu === 'monitoring-kelas' && 'Monitoring Rombel & Komparasi Antar Kelas'}
              {activeMenu === 'monitoring-akademik' && 'Monitoring Capaian Akademik Sekolah'}
              {activeMenu === 'monitoring-kbm' && 'Aktivitas KBM & Supervisi Pembelajaran'}
              {activeMenu === 'monitoring-presensi' && 'Monitoring Presensi Siswa & Dewan Guru'}
              {activeMenu === 'monitoring-nilai' && 'Kelengkapan Input Nilai & Gradebook Guru'}
              {activeMenu === 'monitoring-disiplin' && 'Monitoring Disiplin & Tata Tertib'}
              {activeMenu === 'monitoring-prestasi' && 'Direktori Prestasi Siswa & Guru'}
              {activeMenu === 'monitoring-bk' && 'Statistik & Monitoring Kasus BK (Agregat)'}
              {activeMenu === 'monitoring-ekskul' && 'Monitoring Kegiatan Ekstrakurikuler'}
              {activeMenu === 'akademik-performa' && 'Analisis Nilai & Tren Akademik'}
              {activeMenu === 'akademik-mapel' && 'Analisis Capaian Mata Pelajaran'}
              {activeMenu === 'akademik-rapor' && 'Rapor Sekolah & Finalisasi E-Rapor'}
              {activeMenu === 'akademik-kenaikan' && 'Kenaikan Kelas Siswa'}
              {activeMenu === 'akademik-kelulusan' && 'Kelulusan Siswa Tingkat Akhir'}
              {activeMenu === 'sdm-guru' && 'Direktori Tenaga Pendidik (Guru)'}
              {activeMenu === 'sdm-tendik' && 'Tenaga Kependidikan (Staff & TU)'}
              {activeMenu === 'sdm-kehadiran' && 'Kehadiran & Absensi Pendidik'}
              {activeMenu === 'sdm-aktivitas' && 'Administrasi & Jurnal Pembelajaran Guru'}
              {activeMenu === 'kesiswaan-siswa' && 'Database Seluruh Peserta Didik'}
              {activeMenu === 'kesiswaan-kehadiran' && 'Rekapitulasi Kehadiran Siswa'}
              {activeMenu === 'kesiswaan-prestasi' && 'Prestasi & Penghargaan Siswa'}
              {activeMenu === 'kesiswaan-pelanggaran' && 'Catatan Pelanggaran & Pembinaan Siswa'}
              {activeMenu === 'kesiswaan-bk' && 'Layanan Bimbingan Konseling Siswa'}
              {activeMenu === 'kesiswaan-ekskul' && 'Pembinaan Bakat & Ekstrakurikuler'}
              {activeMenu === 'approval-center' && 'Pusat Persetujuan / Approval Center'}
              {activeMenu === 'kalender-agenda' && 'Kalender Akademik & Agenda Pimpinan'}
              {activeMenu === 'komunikasi-pengumuman' && 'Pengumuman Resmi Sekolah'}
              {activeMenu === 'komunikasi-broadcast' && 'Broadcast Komunikasi Pimpinan'}
              {activeMenu === 'laporan-eksekutif' && 'Laporan Eksekutif & Ekspor Dokumen'}
              {activeMenu === 'analytics-kpi' && 'Indikator Kinerja Utama (Executive KPI)'}
              {activeMenu === 'analytics-ews' && 'Sistem Peringatan Dini (Early Warning System)'}
              {activeMenu === 'analytics-perbandingan' && 'Analisis Komparasi Lintas Periode'}
              {activeMenu === 'analytics-performa-sekolah' && 'Profil Performa Sekolah Saat Ini'}
              {activeMenu === 'dokumen-sekolah' && 'Dokumen Resmi, SK & Arsip Pimpinan'}
              {activeMenu === 'global-search' && 'Pencarian Global Terpadu'}
              {activeMenu === 'profil-sekolah' && 'Identitas & Profil Kelembagaan Sekolah'}
              {activeMenu === 'profil-akun' && 'Profil Pimpinan & Keamanan Akun'}
              {activeMenu === 'audit-trail' && 'Log Audit & Aktivitas Penting Sistem'}
              {activeMenu === 'bantuan-support' && 'Bantuan & Status Sistem Terpadu'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {activeMenu === 'komunikasi-pengumuman' && (
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Buat Pengumuman Resmi</span>
              </button>
            )}

            {activeMenu === 'komunikasi-broadcast' && (
              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Kirim Pesan Broadcast</span>
              </button>
            )}

            <button
              onClick={() => setActiveMenu('global-search')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Pencarian cepat"
            >
              <Search className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Pencarian</span>
            </button>

            <button
              onClick={() => setActiveMenu('laporan-eksekutif')}
              className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak Laporan</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            MENU 1: 🏠 DASHBOARD EKSEKUTIF (Executive View)
            ========================================================================= */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            {/* Top School Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col">
                <span className="text-[11px] font-semibold text-indigo-600 uppercase">Total Siswa</span>
                <span className="text-2xl font-bold text-slate-900 mt-1">
                  {dashboardData?.summary?.total_siswa || 540}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">18 Rombel Aktif</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col">
                <span className="text-[11px] font-semibold text-emerald-600 uppercase">Dewan Guru</span>
                <span className="text-2xl font-bold text-slate-900 mt-1">
                  {dashboardData?.summary?.total_guru || 45}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">38 Bersertifikasi</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col">
                <span className="text-[11px] font-semibold text-amber-600 uppercase">Tenaga Tendik</span>
                <span className="text-2xl font-bold text-slate-900 mt-1">
                  {dashboardData?.summary?.total_tendik || 14}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">TU, Laboran, BK</span>
              </div>
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex flex-col">
                <span className="text-[11px] font-semibold text-sky-600 uppercase">Rombel Kelas</span>
                <span className="text-2xl font-bold text-slate-900 mt-1">
                  {dashboardData?.summary?.total_kelas || 18}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">X, XI, XII Lengkap</span>
              </div>
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col">
                <span className="text-[11px] font-semibold text-purple-600 uppercase">Mata Pelajaran</span>
                <span className="text-2xl font-bold text-slate-900 mt-1">
                  {dashboardData?.summary?.total_mapel || 22}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">Kurikulum Merdeka</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 flex flex-col">
                <span className="text-[11px] font-semibold text-slate-600 uppercase">Semester</span>
                <span className="text-lg font-bold text-slate-900 mt-1.5 truncate">
                  {dashboardData?.summary?.tahun_ajaran || '2026/2027'}
                </span>
                <span className="text-[10px] text-indigo-600 font-semibold">Semester Ganjil</span>
              </div>
            </div>

            {/* Alert / Attention Center Strip */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Attention Center Pimpinan (Perlu Keputusan)</h3>
                    <p className="text-xs text-slate-500">Isu mendesak dan notifikasi prioritas membutuhkan tindakan atau persetujuan.</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenu('approval-center')}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Buka Approval Center
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {(dashboardData?.alert_center || []).map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-3 bg-white/90 rounded-xl border border-slate-200/80 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          alert.severity === 'critical' ? 'bg-rose-500 animate-ping' : 'bg-amber-500'
                        }`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded">
                            {alert.kategori}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{alert.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{alert.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveMenu(mapActionTab(alert.action_tab))}
                      className="text-[11px] text-indigo-600 font-semibold hover:underline shrink-0"
                    >
                      Tinjau
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Kondisi Hari Ini (Live Today) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Presensi Hari Ini */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      Presensi Siswa Hari Ini
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {dashboardData?.kondisi_hari_ini?.kehadiran_siswa_pct || 95.8}% Hadir
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Siswa Hadir di Kelas</span>
                      <span className="font-bold text-slate-900">
                        {dashboardData?.kondisi_hari_ini?.siswa_hadir || 517} Siswa
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Sakit (Izin Medis)</span>
                      <span className="font-semibold text-amber-600">
                        {dashboardData?.kondisi_hari_ini?.siswa_sakit || 12} Siswa
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Izin Keperluan Keluarga</span>
                      <span className="font-semibold text-sky-600">
                        {dashboardData?.kondisi_hari_ini?.siswa_izin || 8} Siswa
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-600">Tanpa Keterangan (Alfa)</span>
                      <span className="font-bold text-rose-600">
                        {dashboardData?.kondisi_hari_ini?.siswa_alfa || 3} Siswa
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenu('monitoring-presensi')}
                  className="mt-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Lihat Rekap Presensi Detail →
                </button>
              </div>

              {/* Kehadiran Guru Hari Ini */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-indigo-600" />
                      Kehadiran Guru Hari Ini
                    </span>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {dashboardData?.kondisi_hari_ini?.kehadiran_guru_pct || 97.7}%
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Guru Hadir Mengajar</span>
                      <span className="font-bold text-slate-900">
                        {dashboardData?.kondisi_hari_ini?.guru_hadir || 44} / 45 Guru
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-600">Kelas Sedang Berlangsung</span>
                      <span className="font-bold text-emerald-600">
                        {dashboardData?.kondisi_hari_ini?.kelas_berlangsung || 17} Kelas Aktif
                      </span>
                    </div>
                    <div className="py-1">
                      <span className="text-slate-600 text-[11px] block mb-1">Guru Izin / Dinas Luar:</span>
                      {(dashboardData?.kondisi_hari_ini?.guru_izin_detail || []).map((g: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                          <span className="font-semibold text-slate-900">{g.nama}</span> ({g.mapel})
                          <span className="block text-slate-500 text-[10px]">{g.alasan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenu('monitoring-guru')}
                  className="mt-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Supervisi Guru & KBM →
                </button>
              </div>

              {/* Agenda & Ujian Hari Ini */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      Agenda Pimpinan Hari Ini
                    </span>
                    <span className="text-xs text-slate-400">Jumat, 2 Okt 2026</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(dashboardData?.kondisi_hari_ini?.agenda_hari_ini || []).map((ag: any, idx: number) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between text-[10px] text-indigo-600 font-semibold mb-0.5">
                          <span>{ag.waktu}</span>
                          <span className="text-slate-400">{ag.lokasi}</span>
                        </div>
                        <div className="font-semibold text-slate-900 text-xs">{ag.judul}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveMenu('kalender-agenda')}
                  className="mt-3 text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Buka Kalender Lengkap →
                </button>
              </div>
            </div>

            {/* Academic & Teacher Performance Overviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Academic Overview */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Academic Overview Sekolah</h3>
                    <p className="text-xs text-slate-500">Ketercapaian KKM & mutu pembelajaran</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl">
                    Rata-rata: {dashboardData?.academic_overview?.rata_rata_sekolah || 84.6}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Ketuntasan Klasikal Sekolah</span>
                      <span className="text-emerald-600 font-bold">
                        {dashboardData?.academic_overview?.persentase_ketuntasan || 89.4}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${dashboardData?.academic_overview?.persentase_ketuntasan || 89.4}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-700 block mb-2">Distribusi Nilai Siswa:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(dashboardData?.academic_overview?.distribusi_nilai || []).map((dn: any, idx: number) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 block truncate">{dn.kategori}</span>
                          <span className="text-sm font-bold text-slate-900">{dn.persen}%</span>
                          <span className="text-[10px] text-slate-400 ml-1">({dn.siswa} siswa)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-900">Perhatian Akademik:</span>
                      <span className="text-amber-800 ml-1">Fisika Peminatan (Ketuntasan 73.5%)</span>
                    </div>
                    <button
                      onClick={() => setActiveMenu('akademik-mapel')}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Detail Mapel
                    </button>
                  </div>
                </div>
              </div>

              {/* Teacher Administration & KBM Overview */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Supervisi Pendidik (Teacher Overview)</h3>
                    <p className="text-xs text-slate-500">Kelengkapan administrasi & pelaksanaan KBM</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Kinerja: {dashboardData?.teacher_overview?.performa_kbm_sekolah || 'Sangat Baik (A)'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">Kelengkapan Jurnal Mengajar</span>
                      <span className="text-slate-900 font-bold">
                        {dashboardData?.teacher_overview?.kelengkapan_jurnal || 94.2}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${dashboardData?.teacher_overview?.kelengkapan_jurnal || 94.2}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">Ketepatan Input Nilai / Gradebook</span>
                      <span className="text-slate-900 font-bold">
                        {dashboardData?.teacher_overview?.kelengkapan_input_nilai || 88.5}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${dashboardData?.teacher_overview?.kelengkapan_input_nilai || 88.5}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-slate-600">Kelengkapan Presensi Kelas</span>
                      <span className="text-slate-900 font-bold">
                        {dashboardData?.teacher_overview?.kelengkapan_presensi || 97.1}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${dashboardData?.teacher_overview?.kelengkapan_presensi || 97.1}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500">Rerata Beban Mengajar</span>
                      <span className="text-xs font-bold text-slate-900 block mt-0.5">
                        {dashboardData?.teacher_overview?.rata_rata_beban_mengajar || '27.4 Jam/Minggu'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-500">Kehadiran Guru Bulan Ini</span>
                      <span className="text-xs font-bold text-emerald-600 block mt-0.5">
                        {dashboardData?.teacher_overview?.kehadiran_guru_bulan_ini || 98.4}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 2: 📊 MONITORING SISWA & EARLY WARNING SYSTEM (EWS)
            ========================================================================= */}
        {(activeMenu === 'monitoring-siswa' || activeMenu === 'kesiswaan-siswa') && (
          <div className="space-y-5">
            {/* Filter and Overview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Filter Tingkat:</span>
                {['ALL', 'X', 'XI', 'XII'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setStudentFilterGrade(lvl)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                      studentFilterGrade === lvl
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Semua Tingkat' : `Kelas ${lvl}`}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Status Risiko:</span>
                <select
                  value={studentFilterRisk}
                  onChange={(e) => setStudentFilterRisk(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Siswa</option>
                  <option value="High Risk">🔴 High Risk (Kritis)</option>
                  <option value="Medium Risk">🟡 Medium Risk (Peringatan)</option>
                  <option value="Berprestasi">🌟 Berprestasi Unggul</option>
                  <option value="Normal">🟢 Normal</option>
                </select>
              </div>
            </div>

            {/* Risk Indicator Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="font-bold text-rose-800 block text-sm">
                  {studentsData?.risk_summary?.critical_count || 2} Siswa High Risk
                </span>
                <span className="text-slate-600 text-[11px]">
                  Membutuhkan intervensi segera (absensi tinggi & nilai menurun).
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <span className="font-bold text-amber-800 block text-sm">
                  {studentsData?.risk_summary?.warning_count || 4} Siswa Medium Risk
                </span>
                <span className="text-slate-600 text-[11px]">
                  Terdeteksi 1-2 mapel di bawah KKM 75.0 dalam pemantauan.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="font-bold text-emerald-800 block text-sm">
                  {studentsData?.risk_summary?.normal_count || 534} Siswa Berprestasi / Normal
                </span>
                <span className="text-slate-600 text-[11px]">
                  98.8% populasi siswa dalam koridor akademik kondusif.
                </span>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">NISN & Nama Siswa</th>
                    <th className="p-3.5">Kelas</th>
                    <th className="p-3.5">Rerata Nilai</th>
                    <th className="p-3.5">Kehadiran</th>
                    <th className="p-3.5">Tata Tertib</th>
                    <th className="p-3.5">Status EWS</th>
                    <th className="p-3.5 text-center">Aksi Pimpinan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {((studentsData?.students || []) as any[])
                    .filter((s) => studentFilterGrade === 'ALL' || s.tingkat === studentFilterGrade)
                    .filter((s) => studentFilterRisk === 'ALL' || s.risk_status === studentFilterRisk)
                    .map((student) => (
                      <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900">{student.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NISN: {student.nisn}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900">{student.kelas}</td>
                        <td className="p-3.5">
                          <span className={`font-bold ${student.rerata_nilai < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                            {student.rerata_nilai}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`font-semibold ${student.kehadiran_pct < 90 ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {student.kehadiran_pct}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          {student.pelanggaran_poin > 0 ? (
                            <span className="text-rose-600 font-semibold">{student.pelanggaran_poin} Poin</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Tertib (0)</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              student.risk_status === 'High Risk'
                                ? 'bg-rose-100 text-rose-700'
                                : student.risk_status === 'Medium Risk'
                                ? 'bg-amber-100 text-amber-700'
                                : student.risk_status === 'Berprestasi'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {student.risk_status}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedStudent(student)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-[11px] transition-colors"
                          >
                            Tinjau Riwayat
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
            MENU 3: 📊 MONITORING GURU & KBM
            ========================================================================= */}
        {(activeMenu === 'monitoring-guru' || activeMenu === 'sdm-guru') && (
          <div className="space-y-5">
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-slate-500 block">Rata-rata Kehadiran</span>
                <span className="text-xl font-bold text-indigo-900 mt-1 block">
                  {teachersData?.aggregate?.rata_kehadiran_guru || 97.5}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-slate-500 block">Kelengkapan Jurnal KBM</span>
                <span className="text-xl font-bold text-emerald-900 mt-1 block">
                  {teachersData?.aggregate?.rata_kelengkapan_jurnal || 94.0}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-slate-500 block">Ketuntasan Input Nilai</span>
                <span className="text-xl font-bold text-amber-900 mt-1 block">
                  {teachersData?.aggregate?.rata_kelengkapan_nilai || 92.0}%
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100">
                <span className="text-slate-500 block">Guru Tersertifikasi</span>
                <span className="text-xl font-bold text-purple-900 mt-1 block">
                  {teachersData?.aggregate?.total_guru_sertifikasi || 38} / 45 Guru
                </span>
              </div>
            </div>

            {/* Teacher List Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Nama Guru & NIP</th>
                    <th className="p-3.5">Mata Pelajaran</th>
                    <th className="p-3.5">Beban Mengajar</th>
                    <th className="p-3.5">Kehadiran</th>
                    <th className="p-3.5">Jurnal KBM</th>
                    <th className="p-3.5">Input Nilai</th>
                    <th className="p-3.5">Capaian Silabus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {((teachersData?.teachers || []) as any[]).map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{t.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIP: {t.nip}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900">{t.mapel}</span>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{t.kelas_ajar}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900">{t.beban_mengajar}</td>
                      <td className="p-3.5 font-semibold text-emerald-600">{t.kehadiran_pct}%</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{t.jurnal_selesai}</span>
                        <span className="text-slate-400">/{t.jurnal_target} Sesi</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold ${
                            t.input_nilai_pct === 100
                              ? 'text-emerald-600'
                              : t.input_nilai_pct >= 90
                              ? 'text-indigo-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {t.input_nilai_pct}%
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{t.silabus_progress_pct}%</span>
                          <div className="w-16 bg-slate-100 rounded-full h-1.5">
                            <div
                              className="bg-indigo-600 h-1.5 rounded-full"
                              style={{ width: `${t.silabus_progress_pct}%` }}
                            />
                          </div>
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
            MENU 4: 📊 MONITORING KELAS / ROMBEL & CLASS COMPARISON
            ========================================================================= */}
        {activeMenu === 'monitoring-kelas' && (
          <div className="space-y-6">
            {/* Comparison Overview */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider mb-2">
                Class Comparison (Perbandingan Rata-rata Nilai & Ketuntasan Antar Tingkat)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-slate-900 block text-sm">Tingkat Kelas X</span>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Rerata Nilai: 81.4</span>
                    <span>Ketuntasan: 83.0%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kehadiran Rombel: 94.2%</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-slate-900 block text-sm">Tingkat Kelas XI</span>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Rerata Nilai: 84.2</span>
                    <span>Ketuntasan: 88.5%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kehadiran Rombel: 95.1%</div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-indigo-100">
                  <span className="font-bold text-slate-900 block text-sm">Tingkat Kelas XII</span>
                  <div className="flex justify-between text-slate-600 mt-1">
                    <span>Rerata Nilai: 87.8</span>
                    <span>Ketuntasan: 95.8%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kehadiran Rombel: 97.6%</div>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {((classesData?.classes || []) as any[]).map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-slate-900">{cls.nama}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {cls.jurusan}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">Wali Kelas: <span className="font-medium text-slate-800">{cls.wali_kelas}</span></div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Jumlah Siswa</span>
                        <span className="font-bold text-slate-900">{cls.jumlah_siswa} Siswa</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Rata-rata Nilai Rombel</span>
                        <span className="font-bold text-indigo-600">{cls.rerata_nilai}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Persentase Ketuntasan</span>
                        <span className={`font-bold ${cls.ketuntasan_pct < 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {cls.ketuntasan_pct}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Kehadiran Rata-rata</span>
                        <span className="font-semibold text-slate-900">{cls.kehadiran_pct}%</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-600">Siswa Berisiko (EWS)</span>
                        <span className={`font-bold ${cls.siswa_berisiko > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {cls.siswa_berisiko} Siswa
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Prestasi: {cls.prestasi_count} | Pelanggaran: {cls.pelanggaran_count}</span>
                    <button
                      onClick={() => setActiveMenu('akademik-rapor')}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      Buka Rapor
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MONITORING AKADEMIK & ACADEMIC OVERVIEW
            ========================================================================= */}
        {(activeMenu === 'monitoring-akademik' || activeMenu === 'akademik-performa') && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Rata-Rata Nilai</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">
                  {academicData?.academic_performance?.rerata_sekolah ?? 84.6}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Naik +1.7 poin
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ketuntasan Sekolah</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {academicData?.academic_performance?.ketuntasan_sekolah_pct ?? 89.4}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Target RKS: &gt; 85%</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Tertinggi</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {academicData?.academic_performance?.nilai_tertinggi ?? 98.5}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Olimpiade Fisika / MTK</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Nilai Terendah</span>
                <span className="text-2xl font-black text-rose-600 mt-1 block">
                  {academicData?.academic_performance?.nilai_terendah ?? 64.0}
                </span>
                <span className="text-[11px] text-rose-600 font-medium mt-0.5">Klinik Remedial Aktif</span>
              </div>
            </div>

            {/* Distribusi Nilai & Rata-rata per Tingkat */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
                  <span>Distribusi Nilai Siswa (540 Siswa)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold">
                    89.4% Tuntas KKM (75.0)
                  </span>
                </h3>
                <div className="space-y-3 text-xs">
                  {((academicData?.academic_performance?.distribusi || [
                    { rentang: '90 - 100 (A)', jumlah: 189, persentase: 35.0 },
                    { rentang: '80 - 89 (B)', jumlah: 232, persentase: 43.0 },
                    { rentang: '75 - 79 (C)', jumlah: 62, persentase: 11.4 },
                    { rentang: '< 75 (D/Remedial)', jumlah: 57, persentase: 10.6 },
                  ]) as any[]).map((dist: any, idx: number) => {
                    const isBelow = dist.rentang.includes('< 75') || dist.persentase === 10.6;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between font-semibold">
                          <span className={isBelow ? 'text-rose-700' : 'text-slate-700'}>{dist.rentang}</span>
                          <span className="text-slate-900 font-bold">{dist.jumlah} siswa ({dist.persentase}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isBelow ? 'bg-rose-500' : 'bg-indigo-600'}`}
                            style={{ width: `${dist.persentase}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                  Rata-Rata & Ketuntasan per Tingkat Kelas
                </h3>
                <div className="space-y-3.5 text-xs">
                  {((academicData?.academic_performance?.rerata_per_tingkat || [
                    { tingkat: 'Kelas X', rerata: 81.4, ketuntasan: 83.0 },
                    { tingkat: 'Kelas XI', rerata: 84.2, ketuntasan: 88.5 },
                    { tingkat: 'Kelas XII', rerata: 87.8, ketuntasan: 95.8 },
                  ]) as any[]).map((t: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{t.tingkat}</span>
                        <p className="text-[11px] text-slate-500 mt-0.5">Rerata Nilai: <strong className="text-slate-800">{t.rerata}</strong></p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-semibold">KETUNTASAN</span>
                        <span className={`text-base font-bold ${t.ketuntasan < 85 ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {t.ketuntasan}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Perbandingan Semester & Analisis Pertumbuhan */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Tren Akademik: Semester Lalu vs Semester Berjalan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {((academicData?.academic_trend?.perbandingan_semester || []) as any[]).map((p: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <span className="font-bold text-indigo-900 text-sm block mb-2">{p.periode}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>Rata-Rata Nilai: <strong>{p.rerata}</strong></div>
                      <div>Ketuntasan: <strong>{p.ketuntasan}%</strong></div>
                      <div>Kehadiran: <strong>{p.absensi_pct}%</strong></div>
                      <div>Siswa At-Risk: <strong className="text-rose-600">{p.at_risk} Siswa</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MONITORING PRESENSI (SISWA & GURU)
            ========================================================================= */}
        {(activeMenu === 'monitoring-presensi' || activeMenu === 'sdm-kehadiran' || activeMenu === 'kesiswaan-kehadiran') && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Presensi Siswa Hari Ini</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {attendanceData?.presensi_siswa?.hari_ini?.persen_hadir ?? 95.8}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {attendanceData?.presensi_siswa?.hari_ini?.hadir ?? 517} hadir dari 540 siswa
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sakit / Izin / Alfa</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {attendanceData?.presensi_siswa?.hari_ini?.sakit ?? 12}S / {attendanceData?.presensi_siswa?.hari_ini?.izin ?? 8}I / {attendanceData?.presensi_siswa?.hari_ini?.alfa ?? 3}A
                </span>
                <span className="text-[11px] text-amber-600 font-medium mt-0.5">
                  {attendanceData?.presensi_siswa?.hari_ini?.terlambat ?? 6} siswa terlambat
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Presensi Guru Hari Ini</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                  {attendanceData?.presensi_guru?.hari_ini?.persen_hadir ?? 97.7}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {attendanceData?.presensi_guru?.hari_ini?.hadir ?? 44} dari 45 guru hadir
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guru Tidak Hadir</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  {attendanceData?.presensi_guru?.hari_ini?.tidak_hadir ?? 1} Orang
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Dinas Luar (MGMP)</span>
              </div>
            </div>

            {/* Rekap Mingguan Siswa & Analisis Kehadiran */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Rekap Kehadiran Siswa Mingguan
                </h3>
                <div className="space-y-2 text-xs">
                  {((attendanceData?.presensi_siswa?.rekap_mingguan || []) as any[]).map((r: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.hari}</span>
                      <div className="flex items-center gap-4 text-[11px]">
                        <span className="text-slate-500">{r.sakit} Sakit, {r.izin} Izin, {r.alfa} Alfa</span>
                        <span className="font-bold text-emerald-600">{r.hadir_pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Analytics: Perhatian Khusus Presensi
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Kelas Kehadiran Terendah:</span>
                    <div className="space-y-1.5">
                      {((attendanceData?.analytics?.kelas_kehadiran_terendah || []) as any[]).map((c: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-rose-50 border border-rose-100 flex justify-between font-semibold text-rose-900 text-xs">
                          <span>{c.kelas}</span>
                          <span>{c.hadir_pct}% Kehadiran ({c.alfa_total} hari alfa)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Siswa Akumulasi Absensi Tinggi:</span>
                    <div className="space-y-1.5">
                      {((attendanceData?.analytics?.siswa_absensi_tinggi || []) as any[]).map((s: any, idx: number) => (
                        <div key={idx} className="p-2 rounded-lg bg-amber-50 border border-amber-100 flex justify-between text-xs">
                          <span className="font-bold text-amber-950">{s.nama} ({s.kelas})</span>
                          <span className="text-amber-800 font-semibold">{s.alfa} Alfa, {s.izin} Izin, {s.sakit} Sakit</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MONITORING KBM & PROGRESS PEMBELAJARAN
            ========================================================================= */}
        {(activeMenu === 'monitoring-kbm' || activeMenu === 'sdm-aktivitas') && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Jadwal KBM Hari Ini</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">
                  {learningData?.teaching_activity_today?.total_jadwal_hari_ini ?? 34} Sesi
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Semua Rombel Terjadwal</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Sedang Berlangsung</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                  {learningData?.teaching_activity_today?.berlangsung_saat_ini ?? 17} Kelas
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5">Aktif di ruang kelas/lab</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Selesai KBM</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {learningData?.teaching_activity_today?.selesai ?? 12} Sesi
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">{learningData?.teaching_activity_today?.belum_mulai ?? 5} Sesi belum mulai</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Jurnal KBM Terisi</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">
                  {learningData?.teaching_activity_today?.jurnal_mengajar_terisi ?? 28} / 29
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5">96.5% Kepatuhan Jurnal</span>
              </div>
            </div>

            {/* Sesi KBM Real-time Saat Ini */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Sesi Pembelajaran yang Sedang Berlangsung
              </h3>
              <div className="space-y-2.5 text-xs">
                {((learningData?.teaching_activity_today?.sesi_aktif || []) as any[]).map((sesi: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{sesi.guru}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">{sesi.kelas}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({sesi.ruang})</span>
                      </div>
                      <p className="text-slate-600 text-xs mt-1">
                        Mapel: <strong>{sesi.mapel}</strong> — Topik: &ldquo;{sesi.topik}&rdquo;
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 w-fit">
                      ● {sesi.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Teaching Progress Silabus */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Progress Ketercapaian Kurikulum & Materi per Mapel
              </h3>
              <div className="space-y-3 text-xs">
                {((learningData?.teaching_progress || []) as any[]).map((p: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800">{p.mapel}</span>
                      <span className="text-indigo-600 font-bold">
                        {p.terlaksana}/{p.target_pertemuan} Pertemuan ({p.progress_pct}%) — {p.materi_selesai}/{p.materi_total} Materi Tuntas
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${p.progress_pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MONITORING NILAI & GRADEBOOK KELENGKAPAN
            ========================================================================= */}
        {activeMenu === 'monitoring-nilai' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kelengkapan Input Nilai</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">
                  {gradesData?.grade_completeness?.status_keseluruhan ?? '88.5% Lengkap'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Semester Ganjil 2026/2027</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Ketuntasan Sekolah</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {gradesData?.grade_overview?.ketuntasan_pct ?? 89.4}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Standar KKM 75.0</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Tugas / Kuis</span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {assessmentsData?.summary?.total_tugas ?? 84} Tugas / {assessmentsData?.summary?.total_kuis ?? 46} Kuis
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">{assessmentsData?.summary?.total_ujian_cbt ?? 18} Ujian CBT</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pengumpulan Tugas</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {assessmentsData?.summary?.tingkat_pengumpulan_pct ?? 93.8}%
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5">Tepat waktu</span>
              </div>
            </div>

            {/* Guru & Rombel Pending Input Nilai */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Guru & Rombel Belum Melengkapi Input Nilai
              </h3>
              <div className="space-y-2.5 text-xs">
                {((gradesData?.grade_completeness?.guru_belum_lengkap || []) as any[]).map((g: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-amber-950 text-sm">{g.guru}</span>
                      <p className="text-amber-800 text-xs mt-0.5">
                        Mapel: <strong>{g.mapel}</strong> — Rombel: <strong>{g.kelas}</strong>
                      </p>
                      <p className="text-amber-700 text-[11px] mt-0.5 font-medium">{g.status}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-600 uppercase font-bold block">Tenggat Waktu</span>
                      <span className="font-bold text-rose-700">{g.deadline}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MONITORING EKSTRAKURIKULER
            ========================================================================= */}
        {(activeMenu === 'monitoring-ekskul' || activeMenu === 'kesiswaan-ekskul') && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Ekstrakurikuler</span>
                <span className="text-2xl font-black text-indigo-700 mt-1 block">
                  {ekskulData?.total_ekskul ?? 14} Ekskul Aktif
                </span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Sains, Olahraga, Seni & Paskibra</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Partisipasi Siswa</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">
                  {ekskulData?.siswa_terlibat_pct ?? 91.5}%
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5">Melampaui target sekolah</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Keaktifan Latihan</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">96.2%</span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Presensi kehadiran rutin</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {((ekskulData?.ekskul || []) as any[]).map((e: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{e.nama}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Pembina: <strong>{e.pembina}</strong></p>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {e.kehadiran_pct}% Hadir
                    </span>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600">
                    <div>Jumlah Anggota: <strong>{e.anggota} Siswa</strong></div>
                    <div>Aktivitas: {e.aktivitas}</div>
                    <div className="text-indigo-600 font-semibold">Prestasi Terkini: {e.prestasi_terkini}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SDM: TENAGA KEPENDIDIKAN (TENDIK & TATA USAHA)
            ========================================================================= */}
        {activeMenu === 'sdm-tendik' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Tenaga Kependidikan</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block">14 Staf</span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">TU, BK, Lab, IT, Pustaka</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kepala Tata Usaha</span>
                <span className="text-sm font-bold text-indigo-700 mt-1 block">Hendra Pratama, S.AP</span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">NIP: 198205122008011015</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Kehadiran Staf</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">100%</span>
                <span className="text-[11px] text-emerald-600 font-medium mt-0.5">Semua unit beroperasi</span>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">SLA Layanan Administrasi</span>
                <span className="text-2xl font-black text-indigo-600 mt-1 block">98.5%</span>
                <span className="text-[11px] text-slate-500 font-medium mt-0.5">Tepat waktu & tertib</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Struktur & Pembagian Tugas Tenaga Kependidikan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { unit: 'Tata Usaha & Administrasi Persuratan', penanggung_jawab: 'Hendra Pratama, S.AP', staf: '3 Staf', status: 'Optimal' },
                  { unit: 'Laboratorium IPA & Komputer CBT', penanggung_jawab: 'Dewi Lestari, S.Pd & Tim Lab', staf: '3 Pranata Lab', status: 'Optimal' },
                  { unit: 'Perpustakaan Digital Sekolah', penanggung_jawab: 'Dra. Hj. Nurjanah, M.M', staf: '2 Pustakawan', status: 'Optimal' },
                  { unit: 'Layanan Bimbingan Konseling (BK)', penanggung_jawab: 'Nurul Hidayah, S.Psi, M.Pd', staf: '3 Guru BK', status: 'Aktif' },
                  { unit: 'Keamanan, Ketertiban & Satpam', penanggung_jawab: 'Koordinator Keamanan Lingkungan', staf: '2 Petugas', status: '24 Jam' },
                  { unit: 'Teknologi Informasi & Operator Dapodik', penanggung_jawab: 'Ahmad Rifa\'i, S.Kom & Tim IT', staf: '2 Teknisi', status: 'Uptime 99.9%' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{item.unit}</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">Penanggung Jawab: {item.penanggung_jawab} ({item.staf})</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            KALENDER AKADEMIK & AGENDA PIMPINAN
            ========================================================================= */}
        {activeMenu === 'kalender-agenda' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-indigo-950 text-sm">
                  Kalender Akademik: {calendarData?.kalender_akademik?.semester_aktif ?? 'Ganjil 2026/2027'}
                </span>
                <p className="text-indigo-800 mt-0.5">
                  {calendarData?.kalender_akademik?.minggu_efektif ?? 18} Minggu Efektif Pembelajaran | {calendarData?.kalender_akademik?.hari_libur_nasional ?? 4} Hari Libur Nasional
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                {calendarData?.kalender_akademik?.status ?? 'Tervalidasi Resmi'}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Agenda Kegiatan & Agenda Pimpinan Sekolah
              </h3>
              <div className="space-y-3 text-xs">
                {((calendarData?.agenda || []) as any[]).map((ag: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                          {ag.kategori}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">{ag.kegiatan}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1">
                        Lokasi: <strong>{ag.lokasi}</strong>
                      </p>
                    </div>
                    <span className="font-bold text-slate-700 text-xs shrink-0 font-mono">
                      📅 {ag.tanggal}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ANALYTICS: PERBANDINGAN PERIODE LINTAS SEMESTER
            ========================================================================= */}
        {activeMenu === 'analytics-perbandingan' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
                Komparasi Kinerja Sekolah: Semester Lalu vs Semester Berjalan
              </h3>
              <div className="space-y-3 text-xs">
                {((comparisonData?.semesters || []) as any[]).map((c: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 text-sm">{c.metric}</span>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px] mt-1">
                        <span>Lalu: <strong className="text-slate-700">{c.periode_a}</strong></span>
                        <span>→</span>
                        <span>Sekarang: <strong className="text-indigo-600">{c.periode_b}</strong></span>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      {c.tren}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {comparisonData?.class_compare && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Analisis Komparasi Rombel Unggulan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700 mt-2">
                  <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <span className="font-bold text-indigo-900 block mb-1">Rombel A</span>
                    <p>{comparisonData.class_compare.kelas_a}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-bold text-slate-900 block mb-1">Rombel B</span>
                    <p>{comparisonData.class_compare.kelas_b}</p>
                  </div>
                </div>
                <p className="text-slate-600 mt-2 text-[11px] italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  💡 Kesimpulan Pimpinan: {comparisonData.class_compare.analisis}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 5: 📚 AKADEMIK: MONITORING MATA PELAJARAN
            ========================================================================= */}
        {activeMenu === 'akademik-mapel' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-2">Pilih Mata Pelajaran untuk Analisis Mendalam:</span>
              <div className="flex flex-wrap gap-2">
                {((subjectsData?.subjects || []) as any[]).map((subj) => (
                  <button
                    key={subj.id}
                    onClick={() => setSelectedSubjectDetail(subj)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                      selectedSubjectDetail?.id === subj.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {subj.nama}
                  </button>
                ))}
              </div>
            </div>

            {selectedSubjectDetail && (
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 uppercase">
                      {selectedSubjectDetail.kategori}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedSubjectDetail.nama}</h2>
                    <p className="text-xs text-slate-500">
                      Guru Pengampu: {selectedSubjectDetail.guru_pengajar?.join(', ')} | Standar KKM: {selectedSubjectDetail.kkm}.0
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">RERATA MAPEL</span>
                      <span className="text-xl font-bold text-indigo-600">{selectedSubjectDetail.rerata_nilai}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">KETUNTASAN</span>
                      <span className={`text-xl font-bold ${selectedSubjectDetail.ketuntasan_pct < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedSubjectDetail.ketuntasan_pct}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Per Class Breakdown (Seperti spesifikasi: X-A 82%, X-B 76%, XI-A 91%) */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Breakdown Ketuntasan & Rata-rata per Rombel Kelas:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {(selectedSubjectDetail.breakdown_kelas || []).map((b: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                      >
                        <span className="font-bold text-slate-900 text-sm">{b.kelas}</span>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Ketuntasan:</span>
                            <span className={`font-bold ${b.ketuntasan_pct < 75 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {b.ketuntasan_pct}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Rerata Nilai:</span>
                            <span className="font-semibold text-slate-800">{b.rerata}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                  <span className="text-amber-900">
                    Siswa teridentifikasi mengalami kendala pemahaman:{' '}
                    <strong>{selectedSubjectDetail.siswa_kesulitan} siswa</strong>.
                  </span>
                  <button
                    onClick={() => setActiveMenu('monitoring-siswa')}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Tinjau Daftar Siswa
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 6: ✅ PERSATUAN / APPROVAL CENTER (FITUR UTAMA KEPALA SEKOLAH)
            ========================================================================= */}
        {activeMenu === 'approval-center' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-indigo-950 text-sm">Approval Center Resmi Kepala Sekolah</h3>
                <p className="text-indigo-800 mt-0.5">
                  Menampilkan seluruh berkas, rapor, pengajuan kegiatan, dan dokumen resmi yang membutuhkan keputusan pimpinan.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg font-bold">
                  {approvalsData?.pending_count || 4} Menunggu Keputusan
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                  {approvalsData?.approved_count || 1} Telah Disetujui
                </span>
              </div>
            </div>

            {/* Approval Items List */}
            <div className="space-y-3.5">
              {((approvalsData?.approvals || []) as any[]).map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {app.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                        {app.tipe}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.urgensi === 'Tinggi'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        Urgensi: {app.urgensi}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          app.status === 'Disetujui'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Ditolak'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{app.judul}</h3>
                    <p className="text-xs text-slate-600 mt-1">{app.deskripsi}</p>
                    <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap gap-4">
                      <span>Pengaju: <strong className="text-slate-700">{app.pengaju}</strong></span>
                      <span>Tanggal: {app.tanggal}</span>
                      <span>Lampiran: <strong className="text-indigo-600 hover:underline cursor-pointer">{app.lampiran}</strong></span>
                    </div>
                  </div>

                  {/* Actions for pending items */}
                  {app.status === 'Menunggu Keputusan' && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                      <button
                        onClick={() => handleOpenApprovalModal(app, 'revision')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
                      >
                        Kembalikan / Revisi
                      </button>
                      <button
                        onClick={() => handleOpenApprovalModal(app, 'reject')}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold transition-colors"
                      >
                        Tolak Pengajuan
                      </button>
                      <button
                        onClick={() => handleOpenApprovalModal(app, 'approve')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm transition-all"
                      >
                        Setujui (Approve)
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 7: 📚 RAPOR SEKOLAH & FINALISASI E-RAPOR
            ========================================================================= */}
        {activeMenu === 'akademik-rapor' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <h3 className="font-bold text-indigo-950 text-sm">Validasi & Pengesahan Rapor Sekolah</h3>
                <p className="text-indigo-800 mt-0.5">
                  Kepala Sekolah memiliki wewenang sah untuk me-review rapor per rombel, mengesahkan publikasi rapor, serta membuka kembali (reopen) rapor jika ada sanggahan nilai resmi.
                </p>
              </div>
              <button
                onClick={() => handleOpenApprovalModal({ id: 'APP-001', judul: 'Pengesahan E-Rapor Seluruh Rombel' }, 'approve')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
              >
                Approve Seluruh Rapor Siap
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {((reportCardsData?.classes || []) as any[]).map((rc) => (
                <div
                  key={rc.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-base text-slate-900">{rc.nama}</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Rerata: {rc.rerata}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 block mb-2">Wali: {rc.wali_kelas}</span>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-600">Kelengkapan Rapor</span>
                        <span className="font-bold text-slate-900">{rc.lengkap}/{rc.siswa_count} Siswa</span>
                      </div>
                      <div className="py-1">
                        <span className="text-slate-500 text-[11px] block">Status Pengesahan:</span>
                        <span
                          className={`text-xs font-semibold ${
                            rc.status.includes('Disetujui') ? 'text-emerald-600' : 'text-amber-600'
                          }`}
                        >
                          {rc.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => alert(`Review rapor kelas ${rc.nama} ditampilkan.`)}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Tinjau Rapor Kelas
                    </button>
                    {rc.status.includes('Disetujui') ? (
                      <button
                        onClick={() => alert(`Akses rapor kelas ${rc.nama} dibuka kembali untuk perbaikan koreksi dewan guru.`)}
                        className="text-amber-600 font-semibold hover:underline"
                      >
                        Buka Kembali (Reopen)
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenApprovalModal({ id: `RAPOR-${rc.nama}`, judul: `Pengesahan Rapor ${rc.nama}` }, 'approve')}
                        className="px-2.5 py-1 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
                      >
                        ACC Rapor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 8: 📚 KENAIKAN KELAS & KELULUSAN
            ========================================================================= */}
        {(activeMenu === 'akademik-kenaikan' || activeMenu === 'akademik-kelulusan') && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                {activeMenu === 'akademik-kenaikan' ? 'Monitoring & Keputusan Kenaikan Kelas' : 'Monitoring & Keputusan Kelulusan Siswa'}
              </h3>
              <p className="text-slate-600">
                Pimpinan meninjau rekomendasi dewan guru berdasarkan kriteria kelulusan/kenaikan kelas dan menandatangani SK resmi.
              </p>
            </div>

            {activeMenu === 'akademik-kenaikan' ? (
              <div className="space-y-3">
                {((promotionData?.classes || []) as any[]).map((pr) => (
                  <div
                    key={pr.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">Kelas {pr.kelas}</span>
                        <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                          Naik ke Tingkat {pr.tingkat_tujuan}
                        </span>
                      </div>
                      <span className="text-slate-500 mt-0.5 block">Wali Kelas: {pr.wali_kelas}</span>
                      <div className="flex gap-4 mt-1 text-[11px] text-slate-600">
                        <span>Total: <strong>{pr.total_siswa}</strong></span>
                        <span>Layak Naik: <strong className="text-emerald-600">{pr.layak_naik}</strong></span>
                        <span>Bersyarat: <strong className="text-amber-600">{pr.bersyarat}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">{pr.status}</span>
                      <button
                        onClick={() => handleOpenApprovalModal({ id: `PROMO-${pr.kelas}`, judul: `Approval Kenaikan Kelas ${pr.kelas}` }, 'approve')}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                      >
                        ACC Rekomendasi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                    <span className="text-slate-500 block">Total Calon Lulusan</span>
                    <span className="text-2xl font-bold text-indigo-950 mt-1 block">
                      {graduationData?.total_calon_lulusan || 142} Siswa
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <span className="text-slate-500 block">Memenuhi Syarat 100%</span>
                    <span className="text-2xl font-bold text-emerald-900 mt-1 block">
                      {graduationData?.memenuhi_syarat || 141} Siswa
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                    <span className="text-slate-500 block">Perlu Sidang Pleno</span>
                    <span className="text-2xl font-bold text-amber-900 mt-1 block">
                      {graduationData?.perlu_sidang_pleno || 1} Siswa
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-800">Daftar Rombel Calon Lulusan:</span>
                  {(graduationData?.rombel_list || []).map((r: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900">{r.rombel}</span>
                        <span className="text-slate-500 text-[11px] ml-2">({r.calon} Calon Siswa)</span>
                      </div>
                      <span className="font-semibold text-emerald-600">{r.status_kelayakan}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleOpenApprovalModal({ id: 'GRAD-2026', judul: 'Pengesahan SK Kelulusan TA 2026/2027' }, 'approve')}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm text-xs"
                  >
                    Terbitkan SK Kelulusan Resmi
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 9: 📊 MONITORING BK (KONTROL PRIVASI AGREGAT)
            ========================================================================= */}
        {(activeMenu === 'monitoring-bk' || activeMenu === 'kesiswaan-bk') && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Privasi & Etika Bimbingan Konseling (BK)</span>
                <p className="mt-0.5 text-slate-700">
                  {counselingData?.access_notice ||
                    'Catatan konseling privat bersifat konfidensial dan dilindungi kode etik konselor. Kepala Sekolah memantau data secara agregat, tren kategori masalah, dan efektivitas tindak lanjut penyelesaian.'}
                </p>
              </div>
            </div>

            {/* Agregat Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Siswa Terlayani</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">
                  {counselingData?.summary?.total_siswa_terlayani || 48} Siswa
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-slate-500">Kasus Berjalan</span>
                <span className="text-xl font-bold text-amber-700 block mt-1">
                  {counselingData?.summary?.total_kasus_aktif || 6} Kasus
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-slate-500">Kasus Selesai</span>
                <span className="text-xl font-bold text-emerald-700 block mt-1">
                  {counselingData?.summary?.kasus_selesai || 42} Kasus
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-slate-500">Tingkat Penyelesaian</span>
                <span className="text-xl font-bold text-indigo-700 block mt-1">
                  {counselingData?.summary?.persentase_penyelesaian || 87.5}%
                </span>
              </div>
            </div>

            {/* Kategori Kasus Agregat */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">Distribusi Kategori Layanan BK:</h4>
              <div className="space-y-2">
                {(counselingData?.kategori_kasus || []).map((k: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{k.kategori}</span>
                      <span className="text-slate-500 text-[11px] block">{k.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-600 text-sm">{k.jumlah} Kasus</span>
                      <span className="text-[10px] text-slate-400 block">({k.persen}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rekap Penanganan (Masked / Inisial) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block mb-2">Kasus Butuh Perhatian Khusus (Identitas Terproteksi):</span>
              <div className="space-y-2">
                {(counselingData?.siswa_perhatian_khusus || []).map((s: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">Siswa Inisial: {s.inisial}</span>
                      <span className="text-slate-500 text-[11px] ml-2">({s.kelas})</span>
                      <span className="block text-[11px] text-slate-600 mt-0.5">Isu: {s.isu_agregat}</span>
                    </div>
                    <span className="text-indigo-600 font-semibold text-[11px]">{s.status_penanganan}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 10: 📊 MONITORING DISIPLIN & PRESTASI
            ========================================================================= */}
        {(activeMenu === 'monitoring-disiplin' || activeMenu === 'kesiswaan-pelanggaran') && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500">Pelanggaran Bulan Ini</span>
                <span className="text-xl font-bold text-slate-900 block mt-1">
                  {disciplineData?.summary?.total_pelanggaran_bulan_ini || 14} Kasus
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <span className="text-slate-500">Tren vs Bulan Lalu</span>
                <span className="text-xl font-bold text-emerald-700 block mt-1">
                  {disciplineData?.summary?.perubahan_vs_bulan_lalu || '-18.5% (Membaik)'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <span className="text-slate-500">Terselesaikan</span>
                <span className="text-xl font-bold text-indigo-700 block mt-1">
                  {disciplineData?.summary?.kasus_selesai || 12} Kasus
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-slate-500">Dalam Pembinaan</span>
                <span className="text-xl font-bold text-amber-700 block mt-1">
                  {disciplineData?.summary?.kasus_dalam_pembinaan || 2} Kasus
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">Rekap Jenis Pelanggaran & Tindak Lanjut:</h4>
              <div className="space-y-2">
                {(disciplineData?.jenis_pelanggaran || []).map((jp: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">{jp.jenis}</span>
                      <span className="text-slate-500 text-[11px] block">Tindakan: {jp.tindakan}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-rose-600">{jp.jumlah} Kejadian</span>
                      <span className="text-[10px] text-slate-400 block">Kategori {jp.kategori}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeMenu === 'monitoring-prestasi' || activeMenu === 'kesiswaan-prestasi') && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-indigo-950 text-sm block">Direktori Prestasi Sekolah</span>
                <span className="text-indigo-800">Rekap capaian prestasi akademik, sains, seni, dan olahraga tahun ajaran berjalan.</span>
              </div>
              <span className="text-base font-bold text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-100">
                Total: {achievementsData?.summary?.total_tahun_ini || 41} Prestasi
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {((achievementsData?.achievements || []) as any[]).map((ach) => (
                <div key={ach.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Tingkat {ach.tingkat}
                    </span>
                    <span className="text-[10px] text-slate-400">{ach.tanggal}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{ach.nama}</h4>
                  <div className="text-slate-600 text-xs">
                    <div>Penerima: <strong className="text-slate-900">{ach.penerima}</strong></div>
                    <div>Pembimbing: {ach.pembimbing}</div>
                    <div className="text-[11px] text-slate-400 mt-1">Penyelenggara: {ach.penyelenggara}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 11: 📢 PENGUMUMAN & KOMUNIKASI RESMI KEPALA SEKOLAH
            ========================================================================= */}
        {activeMenu === 'komunikasi-pengumuman' && (
          <div className="space-y-5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Daftar maklumat dan pengumuman resmi yang telah diterbitkan Kepala Sekolah:</span>
              <button
                onClick={() => setAnnouncementModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                + Buat Pengumuman Baru
              </button>
            </div>

            <div className="space-y-3">
              {((announcementsData?.announcements || []) as any[]).map((an) => (
                <div key={an.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {an.pinned && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[10px]">
                          PINNED
                        </span>
                      )}
                      <span className="font-bold text-slate-900 text-sm">{an.judul}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{an.tanggal}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{an.konten}</p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                    <span>Target: <strong className="text-slate-800">{an.target}</strong></span>
                    <span>Penulis: {an.penulis}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'komunikasi-broadcast' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-indigo-950 text-sm block">Broadcast Komunikasi Pimpinan</span>
                <span className="text-indigo-800">Kirim instruksi penting ke dewan guru, wali kelas, atau perwakilan wali murid.</span>
              </div>
              <button
                onClick={() => setBroadcastModalOpen(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
              >
                + Kirim Broadcast Baru
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Riwayat Pesan Broadcast Terkirim:</span>
              {((communicationData?.recent_broadcasts || []) as any[]).map((bc) => (
                <div key={bc.id} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{bc.judul}</span>
                    <span className="text-slate-500 text-[11px]">Penerima: {bc.penerima} • Waktu: {bc.tanggal}</span>
                  </div>
                  <span className="text-emerald-600 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                    {bc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 12: 📄 LAPORAN EKSEKUTIF (EXPORT PDF & EXCEL)
            ========================================================================= */}
        {activeMenu === 'laporan-eksekutif' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Pusat Laporan Eksekutif & Dokumen Evaluasi Mutu</h3>
              <p className="text-slate-600">
                Pilih format dokumen resmi untuk kebutuhan rapat dinas, pengawas yayasan/kemendikbud, akreditasi, atau arsip pimpinan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {((reportsData?.reports || []) as any[]).map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between text-xs space-y-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                      {rep.kategori}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1.5">{rep.judul}</h4>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Periode: {rep.periode}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-emerald-600 font-medium text-[11px]">{rep.status}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Cetak</span>
                      </button>
                      <button
                        onClick={() => alert(`Mengunduh ${rep.judul} format PDF...`)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 13: 📈 EXECUTIVE ANALYTICS & EARLY WARNING SYSTEM (EWS)
            ========================================================================= */}
        {activeMenu === 'analytics-kpi' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Indikator Kinerja Akademik (Academic KPI)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {(analyticsData?.academic_kpi || []).map((kpi: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-[11px] block">{kpi.label}</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">
                      {kpi.actual} {kpi.unit}
                    </span>
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                      <span>Target: {kpi.target} {kpi.unit}</span>
                      <span className="text-emerald-600 font-bold">{kpi.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Indikator Kinerja Pendidik & SDM (Teacher KPI)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {(analyticsData?.teacher_kpi || []).map((kpi: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <span className="text-slate-500 text-[11px] block">{kpi.label}</span>
                    <span className="text-xl font-bold text-slate-900 mt-1 block">
                      {kpi.actual} {kpi.unit}
                    </span>
                    <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                      <span>Target: {kpi.target} {kpi.unit}</span>
                      <span className="text-emerald-600 font-bold">{kpi.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'analytics-ews' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm block">Early Warning System (EWS Pimpinan)</span>
                <span>Peringatan cerdas otomatis berdasarkan algoritma risiko akademik, presensi, dan tata tertib.</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded-lg text-[10px]">
                  {ewsData?.summary?.critical_count || 2} Kritis
                </span>
                <span className="px-2.5 py-1 bg-amber-500 text-white font-bold rounded-lg text-[10px]">
                  {ewsData?.summary?.warning_count || 3} Peringatan
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {((ewsData?.items || []) as any[]).map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border bg-white shadow-sm space-y-2 text-xs ${
                    item.level === 'critical'
                      ? 'border-rose-300'
                      : item.level === 'warning'
                      ? 'border-amber-300'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          item.level === 'critical'
                            ? 'bg-rose-600 animate-ping'
                            : item.level === 'warning'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                      />
                      <span className="font-bold text-slate-900 text-sm">{item.judul}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {item.kategori}
                    </span>
                  </div>
                  <div className="text-slate-600 space-y-1">
                    <div>Indikator: <strong className="text-slate-900">{item.indikator}</strong></div>
                    <div>Dampak Risiko: <span className="text-rose-700">{item.dampak}</span></div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700">
                      Rekomendasi Tindakan: <strong>{item.rekomendasi}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 14: 📈 PROFIL PERFORMA SEKOLAH SAAT INI
            ========================================================================= */}
        {activeMenu === 'analytics-performa-sekolah' && (
          <div className="space-y-5">
            {/* Timeframe Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-800">
                &ldquo;Bagaimana Kondisi Sekolah Saya Sekarang?&rdquo;
              </span>
              <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                {(['today', 'week', 'month', 'semester', 'year'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => handleTimeframeChange(tf)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      timeframe === tf
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tf === 'today' && 'Hari Ini'}
                    {tf === 'week' && 'Minggu Ini'}
                    {tf === 'month' && 'Bulan Ini'}
                    {tf === 'semester' && 'Semester Ini'}
                    {tf === 'year' && 'Tahun Ini'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-emerald-50 border border-indigo-100 text-slate-900 font-bold text-sm">
                Status Utama: {performanceData?.status_headline || 'Kondisi Sekolah Kondusif & Stabil'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {Object.entries(performanceData?.summary || {}).map(([key, val]) => (
                  <div key={key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase block tracking-wider">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-slate-900 font-semibold block mt-1">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 15: 📁 DOKUMEN SEKOLAH & AUDIT TRAIL
            ========================================================================= */}
        {activeMenu === 'dokumen-sekolah' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Arsip Dokumen Resmi & Surat Keputusan Pimpinan</h3>
              <p className="text-slate-600">Daftar SK, Surat Tugas, dan KOSP yang telah disahkan dan diarsipkan.</p>
            </div>

            <div className="space-y-3">
              {((documentsData?.documents || []) as any[]).map((doc) => (
                <div key={doc.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                      {doc.nomor}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{doc.judul}</h4>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Kategori: {doc.kategori} • Tanggal: {doc.tanggal}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                      {doc.status}
                    </span>
                    <button
                      onClick={() => alert(`Membuka dokumen ${doc.judul}...`)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg"
                    >
                      Buka Dokumen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeMenu === 'audit-trail' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <h3 className="font-bold text-slate-900 text-sm mb-1">Log Audit & Aktivitas Penting Sistem</h3>
              <p className="text-slate-600">Transparansi perubahan data sensitif (nilai, presensi, rapor, akun) untuk pengawasan pimpinan.</p>
            </div>

            <div className="space-y-2.5">
              {((auditData?.logs || []) as any[]).map((log, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900">{log.aksi}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Oleh: <strong className="text-slate-800">{log.aktor}</strong> • Objek: {log.entitas}
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono text-[10px]">{log.waktu}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 16: 🔍 GLOBAL SEARCH
            ========================================================================= */}
        {activeMenu === 'global-search' && (
          <div className="space-y-5">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Cari siswa, guru, rombel kelas, mapel, atau dokumen..."
                value={globalSearchQuery}
                onChange={(e) => handleGlobalSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {globalSearchQuery && (
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-500">
                  Hasil Pencarian untuk &ldquo;{globalSearchQuery}&rdquo; ({searchResults.length} hasil):
                </span>
                {searchResults.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                    Tidak ditemukan data yang cocok. Coba kata kunci lain.
                  </div>
                ) : (
                  searchResults.map((res, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (res.tab) {
                          setActiveMenu(mapActionTab(res.tab));
                        }
                      }}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            {res.type}
                          </span>
                          <span className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{res.title}</span>
                        </div>
                        <p className="text-slate-500 mt-1">{res.subtitle}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-600 font-semibold">{res.badge}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 17: 👤 PROFIL SEKOLAH & AKUN KEPSEK
            ========================================================================= */}
        {activeMenu === 'profil-sekolah' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{profileData?.profile?.nama_sekolah}</h3>
                  <p className="text-slate-500">NPSN: {profileData?.profile?.npsn} • {profileData?.profile?.bentuk_pendidikan}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs">
                  {profileData?.profile?.akreditasi}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div><span className="text-slate-500">Alamat:</span> <span className="font-medium text-slate-800">{profileData?.profile?.alamat}</span></div>
                  <div><span className="text-slate-500">Kontak:</span> <span className="font-medium text-slate-800">{profileData?.profile?.telepon}</span></div>
                  <div><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800">{profileData?.profile?.email}</span></div>
                  <div><span className="text-slate-500">Kepala Sekolah:</span> <strong className="text-slate-900">{profileData?.profile?.kepala_sekolah}</strong></div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-indigo-900 block mb-1">Visi Sekolah:</span>
                  <p className="text-slate-700 italic leading-relaxed">&ldquo;{profileData?.profile?.visi}&rdquo;</p>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-2">Misi Satuan Pendidikan:</span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {(profileData?.profile?.misi || []).map((m: string, idx: number) => (
                    <li key={idx}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'profil-akun' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm max-w-xl text-xs space-y-4">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  KS
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Dr. H. Sulaiman, M.Si</h3>
                  <p className="text-slate-500">Kepala Sekolah (Principal) • NIP: 197103141995121002</p>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1">
                    Akun Terverifikasi Pimpinan
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email Kedinasan</span>
                  <span className="font-semibold text-slate-800">kepsek@sman1unggul.sch.id</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Status 2-Factor Authentication (2FA)</span>
                  <span className="font-bold text-emerald-600">Aktif (Google Authenticator)</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Sesi Login Terakhir</span>
                  <span className="text-slate-700">Hari ini, 07:12 WIB via Chrome Mac/Win</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => alert('Fitur ubah kata sandi dibuka')}
                  className="px-3.5 py-2 bg-slate-900 text-white rounded-xl font-semibold text-xs"
                >
                  Ubah Kata Sandi
                </button>
              </div>
            </div>
          </div>
        )}

        {activeMenu === 'bantuan-support' && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100">
              <h3 className="font-bold text-indigo-950 text-sm mb-1">Panduan Penggunaan Executive Dashboard Kepala Sekolah</h3>
              <p className="text-indigo-800">
                Sistem dirancang dengan filosofi kepemimpinan berbasis data. Kepala Sekolah dapat memantau seluruh indikator KBM, memberikan pengesahan resmi, dan mengarahkan kebijakan sekolah secara akurat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-sm">Kontak Admin Teknis Sekolah:</span>
              <div className="p-3 rounded-xl bg-slate-50 text-slate-700 space-y-1">
                <div>Admin Utama: <strong>Hendra Pratama, S.Kom</strong></div>
                <div>WhatsApp Helpdesk: <strong>0812-9876-5432</strong></div>
                <div>Status Server & Basis Data: <strong className="text-emerald-600">Online 99.98% (Normal)</strong></div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          MODALS & INTERACTIVE POPUPS
          ========================================================================= */}
      {/* 1. Student Detail Riwayat Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.nama}</h3>
                <p className="text-xs text-slate-500">NISN: {selectedStudent.nisn} • Kelas: {selectedStudent.kelas}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">RERATA NILAI</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.rerata_nilai}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">KEHADIRAN</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedStudent.kehadiran_pct}%</span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Riwayat Tren Akademik:</span>
                <ul className="space-y-1 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {(selectedStudent.riwayat_akademik || []).map((ra: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      <span>{ra}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-slate-800 block mb-1">Riwayat Mutasi & Pendaftaran:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {selectedStudent.riwayat_mutasi || 'Siswa Reguler'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Process Approval Modal */}
      {approvalModalOpen && selectedApproval && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {approvalAction === 'approve' && 'Persetujuan / ACC Dokumen'}
                  {approvalAction === 'reject' && 'Penolakan Pengajuan'}
                  {approvalAction === 'revision' && 'Permintaan Revisi Pengajuan'}
                </h3>
                <p className="text-xs text-slate-500">ID: {selectedApproval.id}</p>
              </div>
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-900 block">{selectedApproval.judul}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">Pengaju: {selectedApproval.pengaju || 'Panitia'}</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Catatan / Instruksi Kepala Sekolah (Opsional):
                </label>
                <textarea
                  rows={3}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Tambahkan catatan resmi keputusan pimpinan..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {approvalSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold text-center border border-emerald-200">
                  {approvalSuccessMsg}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setApprovalModalOpen(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitApproval}
                className={`px-4 py-2 font-bold rounded-xl text-white shadow-sm transition-all ${
                  approvalAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : approvalAction === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Simpan Keputusan Resmi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Terbitkan Pengumuman Resmi</h3>
              <button
                onClick={() => setAnnouncementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Maklumat / Pengumuman:</label>
                <input
                  type="text"
                  required
                  value={newAnnouncement.judul}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, judul: e.target.value })}
                  placeholder="Contoh: Maklumat Pimpinan Terkait PTS..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Isi Pengumuman:</label>
                <textarea
                  rows={4}
                  required
                  value={newAnnouncement.konten}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, konten: e.target.value })}
                  placeholder="Tuliskan arahan resmi kepala sekolah..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Penerima:</label>
                  <select
                    value={newAnnouncement.target}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, target: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Semua Sekolah">Semua Warga Sekolah</option>
                    <option value="Dewan Guru & Tendik">Guru & Tendik Saja</option>
                    <option value="Orang Tua & Wali Murid">Orang Tua Murid Saja</option>
                    <option value="Siswa">Siswa Saja</option>
                  </select>
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={newAnnouncement.pinned}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, pinned: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Sematkan di Atas (Pin)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Publikasikan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Send Broadcast Modal */}
      {broadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Kirim Pesan Broadcast Pimpinan</h3>
              <button
                onClick={() => setBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Judul Broadcast:</label>
                <input
                  type="text"
                  required
                  value={newBroadcast.judul}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, judul: e.target.value })}
                  placeholder="Instruksi singkat pimpinan..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Saluran:</label>
                <select
                  value={newBroadcast.target}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, target: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Dewan Guru & Pengajar">Seluruh Dewan Guru & Pengajar</option>
                  <option value="Wali Kelas Seluruh Tingkat">Wali Kelas Saja</option>
                  <option value="Manajemen Inti & TU">Manajemen, Wakasek & TU</option>
                  <option value="Komite Sekolah & Orang Tua">Komite Sekolah & Wali Murid</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pesan Lengkap:</label>
                <textarea
                  rows={4}
                  required
                  value={newBroadcast.pesan}
                  onChange={(e) => setNewBroadcast({ ...newBroadcast, pesan: e.target.value })}
                  placeholder="Ketik pesan yang akan diterima seketika di portal penerima..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBroadcastModalOpen(false)}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
