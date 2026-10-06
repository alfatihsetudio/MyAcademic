'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Users,
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Clock,
  UserCheck,
  FileSpreadsheet,
  Award,
  Bell,
  MessageCircle,
  Sparkles,
  BookOpen,
  FolderOpen,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Send,
  Download,
  Printer,
  Search,
  Settings,
  HelpCircle,
  ShieldCheck,
  Bot,
  Activity,
  HeartPulse,
  Eye,
  Plus,
  Paperclip,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck,
  Building2,
  PhoneCall,
  Mail,
  User,
  AlertCircle
} from 'lucide-react';
import {
  fetchParentDashboard,
  fetchParentProfile,
  fetchParentChildren,
  switchParentChild,
  fetchParentSchedule,
  fetchParentAttendance,
  fetchParentLeaveRequests,
  submitParentLeave,
  fetchParentAcademic,
  fetchParentGrades,
  fetchParentProgress,
  fetchParentAssignments,
  fetchParentExams,
  fetchParentMaterials,
  fetchParentReportCards,
  fetchParentHomeroom,
  fetchParentCommunication,
  sendParentMessage,
  fetchParentCounseling,
  fetchParentDevelopment,
  fetchParentAchievements,
  fetchParentExtracurriculars,
  registerParentExtracurricular,
  fetchParentCalendar,
  fetchParentAnnouncements,
  fetchParentNotifications,
  fetchParentAdministration,
  fetchParentDocuments,
  fetchParentServices,
  submitParentServiceRequest,
  fetchParentMeetings,
  confirmParentMeeting,
  fetchParentSchoolEvents,
  fetchParentLearningMonitoring,
  fetchParentProgressOverview,
  fetchParentEarlyWarning,
  fetchParentReports,
  searchParent,
  fetchParentNotificationPreferences,
  updateParentNotificationPreferences,
  fetchParentAccountSecurity,
  reportParentRelationIssue,
  fetchParentHelp,
  chatParentAi,
} from '@/lib/api';

export type ParentMenuKey =
  | 'dashboard'
  | 'anak-saya'
  | 'akademik'
  | 'pembelajaran'
  | 'presensi'
  | 'komunikasi'
  | 'kesiswaan'
  | 'kalender-kegiatan'
  | 'informasi'
  | 'dokumen-layanan'
  | 'akun'
  | 'bantuan'
  | 'ai-assistant';

interface ParentPortalViewProps {
  externalActiveMenu?: string;
  onNavigateTab?: (tab: string) => void;
}

export default function ParentPortalView({ externalActiveMenu, onNavigateTab }: ParentPortalViewProps) {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState<ParentMenuKey>('dashboard');
  const [activeChildId, setActiveChildId] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Main Data States
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [childrenList, setChildrenList] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [leaveRequestsData, setLeaveRequestsData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [progressData, setProgressData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [examsData, setExamsData] = useState<any>(null);
  const [materialsData, setMaterialsData] = useState<any>(null);
  const [reportCardsData, setReportCardsData] = useState<any>(null);
  const [homeroomData, setHomeroomData] = useState<any>(null);
  const [communicationData, setCommunicationData] = useState<any>(null);
  const [counselingData, setCounselingData] = useState<any>(null);
  const [developmentData, setDevelopmentData] = useState<any>(null);
  const [achievementsData, setAchievementsData] = useState<any>(null);
  const [extracurricularsData, setExtracurricularsData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [announcementsData, setAnnouncementsData] = useState<any>(null);
  const [notificationsData, setNotificationsData] = useState<any>(null);
  const [administrationData, setAdministrationData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any>(null);
  const [meetingsData, setMeetingsData] = useState<any>(null);
  const [eventsData, setEventsData] = useState<any>(null);
  const [learningMonitoringData, setLearningMonitoringData] = useState<any>(null);
  const [progressOverviewData, setProgressOverviewData] = useState<any>(null);
  const [earlyWarningData, setEarlyWarningData] = useState<any>(null);
  const [reportsData, setReportsData] = useState<any>(null);
  const [preferencesData, setPreferencesData] = useState<any>(null);
  const [accountData, setAccountData] = useState<any>(null);
  const [helpData, setHelpData] = useState<any>(null);

  // Form & Interaction States
  const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: 'Sakit',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    notes: '',
  });

  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [serviceForm, setServiceForm] = useState({
    service_type: 'Surat Keterangan Siswa Aktif (Untuk Beasiswa / Tunjangan Ortu)',
    purpose: '',
  });

  const [activeChatChannel, setActiveChatChannel] = useState<string>('homeroom');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  // AI Assistant States
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Halo Bapak/Ibu! Saya AI Asisten Pemantauan Orang Tua. Anda dapat menanyakan kehadiran ananda hari ini, tugas yang belum dikumpulkan, rekap nilai terbaru, atau jadwal PTS.',
    },
  ]);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Notification Toast / Alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync external active menu if passed from sidebar
  useEffect(() => {
    if (externalActiveMenu) {
      if (['dashboard', 'anak-saya', 'akademik', 'pembelajaran', 'presensi', 'komunikasi', 'kesiswaan', 'kalender-kegiatan', 'informasi', 'dokumen-layanan', 'akun', 'bantuan', 'ai-assistant'].includes(externalActiveMenu)) {
        setActiveMenu(externalActiveMenu as ParentMenuKey);
      } else if (externalActiveMenu === 'children') {
        setActiveMenu('anak-saya');
      } else if (externalActiveMenu === 'academic') {
        setActiveMenu('akademik');
      } else if (externalActiveMenu === 'attendance') {
        setActiveMenu('presensi');
      } else if (externalActiveMenu === 'assignments') {
        setActiveMenu('pembelajaran');
      } else if (externalActiveMenu === 'communication') {
        setActiveMenu('komunikasi');
      } else if (externalActiveMenu === 'calendar') {
        setActiveMenu('kalender-kegiatan');
      } else if (externalActiveMenu === 'ai') {
        setActiveMenu('ai-assistant');
      }
    }
  }, [externalActiveMenu]);

  // Load Initial Data when active child changes
  const loadData = async (childId: number) => {
    setIsLoading(true);
    try {
      const [
        dash,
        prof,
        kids,
        sched,
        att,
        leaves,
        acad,
        grd,
        prg,
        asgn,
        exm,
        mat,
        rc,
        hm,
        comm,
        counsel,
        dev,
        ach,
        ekskul,
        cal,
        ann,
        notif,
        adm,
        doc,
        srv,
        meet,
        evts,
        learnMon,
        pOverview,
        eWarning,
        reps,
        prefs,
        acc,
        hlp,
      ] = await Promise.all([
        fetchParentDashboard(childId),
        fetchParentProfile(childId),
        fetchParentChildren(),
        fetchParentSchedule(childId),
        fetchParentAttendance(childId),
        fetchParentLeaveRequests(childId),
        fetchParentAcademic(childId),
        fetchParentGrades(childId),
        fetchParentProgress(childId),
        fetchParentAssignments(childId),
        fetchParentExams(childId),
        fetchParentMaterials(childId),
        fetchParentReportCards(childId),
        fetchParentHomeroom(childId),
        fetchParentCommunication(childId),
        fetchParentCounseling(childId),
        fetchParentDevelopment(childId),
        fetchParentAchievements(childId),
        fetchParentExtracurriculars(childId),
        fetchParentCalendar(),
        fetchParentAnnouncements(),
        fetchParentNotifications(),
        fetchParentAdministration(childId),
        fetchParentDocuments(childId),
        fetchParentServices(childId),
        fetchParentMeetings(),
        fetchParentSchoolEvents(),
        fetchParentLearningMonitoring(childId),
        fetchParentProgressOverview(childId),
        fetchParentEarlyWarning(childId),
        fetchParentReports(childId),
        fetchParentNotificationPreferences(),
        fetchParentAccountSecurity(),
        fetchParentHelp(),
      ]);

      if (dash) setDashboardData(dash);
      if (prof) setProfileData(prof.profile);
      if (kids) setChildrenList(kids.children || []);
      if (sched) setScheduleData(sched);
      if (att) setAttendanceData(att);
      if (leaves) setLeaveRequestsData(leaves.requests || []);
      if (acad) setAcademicData(acad);
      if (grd) setGradesData(grd);
      if (prg) setProgressData(prg);
      if (asgn) setAssignmentsData(asgn.assignments || []);
      if (exm) setExamsData(exm);
      if (mat) setMaterialsData(mat.materials || []);
      if (rc) setReportCardsData(rc);
      if (hm) setHomeroomData(hm);
      if (comm) {
        setCommunicationData(comm);
        setChatMessages(comm.active_chat_history || []);
      }
      if (counsel) setCounselingData(counsel);
      if (dev) setDevelopmentData(dev);
      if (ach) setAchievementsData(ach.achievements || []);
      if (ekskul) setExtracurricularsData(ekskul);
      if (cal) setCalendarData(cal);
      if (ann) setAnnouncementsData(ann.announcements || []);
      if (notif) setNotificationsData(notif);
      if (adm) setAdministrationData(adm);
      if (doc) setDocumentsData(doc.documents || []);
      if (srv) setServicesData(srv);
      if (meet) setMeetingsData(meet.meetings || []);
      if (evts) setEventsData(evts.events || []);
      if (learnMon) setLearningMonitoringData(learnMon);
      if (pOverview) setProgressOverviewData(pOverview);
      if (eWarning) setEarlyWarningData(eWarning);
      if (reps) setReportsData(reps.available_reports || []);
      if (prefs) setPreferencesData(prefs.preferences);
      if (acc) setAccountData(acc);
      if (hlp) setHelpData(hlp);
    } catch (err: any) {
      console.error('Error loading parent data:', err);
      toast.error('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeChildId);
  }, [activeChildId]);

  // Handle Switch Child
  const handleSwitchChild = async (childId: number) => {
    setActiveChildId(childId);
    await switchParentChild(childId);
    showToast(`Beralih ke profil ananda ${childId === 1 ? 'Ahmad Fauzi' : childId === 2 ? 'Aisyah Putri' : 'Fajar Pratama'}`);
  };

  // Handle Submit Leave Request
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      alert('Mohon isi alasan permohonan izin.');
      return;
    }
    if (new Date(leaveForm.end_date) < new Date(leaveForm.start_date)) {
      alert('Tanggal selesai tidak boleh lebih awal dari tanggal mulai permohonan izin.');
      return;
    }
    const res = await submitParentLeave({
      child_id: activeChildId,
      leave_type: leaveForm.leave_type,
      start_date: leaveForm.start_date,
      end_date: leaveForm.end_date,
      reason: leaveForm.reason,
      notes: leaveForm.notes,
    });
    if (res && res.success) {
      showToast('Permohonan izin berhasil diajukan ke Wali Kelas.');
      setShowLeaveModal(false);
      setLeaveForm({
        leave_type: 'Sakit',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        reason: '',
        notes: '',
      });
      // refresh leave requests
      const leaves = await fetchParentLeaveRequests(activeChildId);
      if (leaves) setLeaveRequestsData(leaves.requests || []);
    }
  };

  // Handle Submit Service Request
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.purpose.trim()) {
      alert('Mohon isi keperluan permohonan layanan.');
      return;
    }
    const res = await submitParentServiceRequest({
      child_id: activeChildId,
      service_type: serviceForm.service_type,
      purpose: serviceForm.purpose,
    });
    if (res && res.success) {
      showToast('Permohonan layanan administrasi berhasil diajukan ke Tata Usaha.');
      setShowServiceModal(false);
      setServiceForm({
        service_type: 'Surat Keterangan Siswa Aktif (Untuk Beasiswa / Tunjangan Ortu)',
        purpose: '',
      });
      const srv = await fetchParentServices(activeChildId);
      if (srv) setServicesData(srv);
    }
  };

  // Handle Send Chat
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    const newMsg = {
      sender: 'parent',
      text: text,
      time: 'Baru saja',
      read: false,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    const res = await sendParentMessage(activeChatChannel, text);
    if (res && res.success) {
      showToast('Pesan resmi terkirim ke sekolah.');
    }
  };

  // Handle AI Chat
  const handleAiChat = async (customPrompt?: string) => {
    const q = customPrompt || aiPrompt.trim();
    if (!q) return;
    setAiPrompt('');
    setAiChatHistory((prev) => [...prev, { sender: 'user', text: q }]);
    setAiLoading(true);

    try {
      const res = await chatParentAi(q, activeChildId);
      if (res && res.reply) {
        setAiChatHistory((prev) => [...prev, { sender: 'ai', text: res.reply }]);
      }
    } catch {
      setAiChatHistory((prev) => [
        ...prev,
        { sender: 'ai', text: 'Maaf, terjadi gangguan koneksi ke sistem server sekolah. Silakan coba kembali.' },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Confirm Meeting RSVP
  const handleConfirmMeeting = async (meetingId: number, status: string) => {
    const res = await confirmParentMeeting(meetingId, status);
    if (res && res.success) {
      showToast(`Konfirmasi kehadiran berhasil disimpan: ${status}`);
      const meet = await fetchParentMeetings();
      if (meet) setMeetingsData(meet.meetings || []);
    }
  };

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const res = await searchParent(searchQuery.trim(), activeChildId);
    if (res && res.results) {
      setSearchResults(res.results);
    }
  };

  const currentChild = dashboardData?.active_child || {
    name: 'Ahmad Fauzi',
    nickname: 'Ahmad',
    class_name: 'XI MIPA 1',
    level: 'SMA / Fase F',
    academic_year: '2026/2027',
    semester: 'Ganjil (Semester 1)',
    homeroom_teacher: 'Siti Aminah, M.Pd',
    status: 'Aktif',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    attendance_summary: { hadir: 46, izin: 1, sakit: 1, alfa: 0, percentage: 97.9, status_today: 'Hadir di Kelas' },
    academic_summary: { average_score: 88.4, predikat: 'A (Amat Baik)', ranking: '2 dari 34 siswa', completed_subjects: 12, pending_tasks: 1 },
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { key: 'anak-saya', label: 'Anak Saya', icon: Users, badge: childrenList.length ? `${childrenList.length} Anak` : '3' },
    { key: 'akademik', label: 'Akademik', icon: FileSpreadsheet, badge: 'Rapor' },
    { key: 'pembelajaran', label: 'Pembelajaran', icon: BookOpen, badge: currentChild?.academic_summary?.pending_tasks ? '1 Tugas' : null },
    { key: 'presensi', label: 'Presensi', icon: UserCheck, badge: 'Real-time' },
    { key: 'komunikasi', label: 'Komunikasi', icon: MessageCircle, badge: 'Resmi' },
    { key: 'kesiswaan', label: 'Kesiswaan', icon: Award, badge: null },
    { key: 'kalender-kegiatan', label: 'Kalender & Kegiatan', icon: Calendar, badge: 'PTS' },
    { key: 'informasi', label: 'Informasi', icon: Bell, badge: '2 Baru' },
    { key: 'dokumen-layanan', label: 'Dokumen & Layanan', icon: FolderOpen, badge: null },
    { key: 'akun', label: 'Akun & Keamanan', icon: ShieldCheck, badge: null },
    { key: 'bantuan', label: 'Bantuan & FAQ', icon: HelpCircle, badge: null },
    { key: 'ai-assistant', label: 'AI Parent Assistant', icon: Bot, badge: 'Smart' },
  ];

  return (
    <div className="w-full flex flex-col gap-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/40 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Multi-Child Switcher & Status Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentChild.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={currentChild.name}
              className="w-14 h-14 rounded-2xl object-cover ring-4 ring-emerald-50 border border-emerald-200"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white ring-1 ring-emerald-300" title="Status Aktif" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
                Anak Terpilih
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                {currentChild.class_name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                {currentChild.academic_year || '2026/2027'} - {currentChild.semester || 'Semester Ganjil'}
              </span>
            </div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
              <span>{currentChild.name}</span>
              <span className="text-xs font-normal text-slate-400">({currentChild.nis ? `NIS: ${currentChild.nis}` : 'NIS: 20241101'})</span>
            </h1>
            <p className="text-xs text-slate-500">
              Wali Kelas: <strong className="text-slate-800">{currentChild.homeroom_teacher}</strong> • Status: <strong className="text-emerald-600">{currentChild.status}</strong>
            </p>
          </div>
        </div>

        {/* Multi-Child Selector Control */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200/80 shadow-xs">
            <Users className="w-4 h-4 text-indigo-600 ml-1" />
            <span className="text-xs font-bold text-slate-600">Pilih Profil Anak:</span>
            <select
              value={activeChildId}
              onChange={(e) => handleSwitchChild(Number(e.target.value))}
              className="text-xs font-bold bg-white text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer focus:outline-indigo-500"
            >
              <option value={1}>Ahmad Fauzi (XI MIPA 1 — SMA)</option>
              <option value={2}>Aisyah Putri Trianto (VIII B — SMP)</option>
              <option value={3}>Fajar Pratama Trianto (V A — SD)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveMenu('ai-assistant')}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>AI Parent Assistant</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS / SIDEBAR TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200/80 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveMenu(item.key as ParentMenuKey)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[9px] px-1.5 py-0.2 rounded-md ${
                  isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: DASHBOARD ORANG TUA */}
      {/* ========================================================================= */}
      {activeMenu === 'dashboard' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Real-time Alerts Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(dashboardData?.alerts || [
              {
                id: 1,
                type: 'info',
                badge: 'Presensi Real-Time',
                title: 'Presensi Hari Ini',
                message: currentChild.attendance_summary?.status_today || 'Hadir di Kelas (06:48 WIB)',
              },
              {
                id: 2,
                type: 'warning',
                badge: 'Tugas Mandiri',
                title: 'Tugas Mendekati Tenggat',
                message: `${currentChild.academic_summary?.pending_tasks || 1} tugas menunggu dikumpulkan.`,
              },
              {
                id: 3,
                type: 'success',
                badge: 'Akademik',
                title: 'Nilai Baru Diumumkan',
                message: `Nilai Penilaian Harian ${currentChild.nickname || currentChild.name} telah dipublikasikan guru.`,
              },
              {
                id: 4,
                type: 'primary',
                badge: 'Undangan Rapat',
                title: 'Undangan Rapat Wali Murid',
                message: 'Sabtu, 10 Okt 2026 di Auditorium Utama.',
              },
            ]).map((al: any, idx: number) => {
              const isWarning = al.type === 'warning';
              const isSuccess = al.type === 'success';
              const isPrimary = al.type === 'primary';
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl p-4 flex items-start gap-3 ${
                    isWarning
                      ? 'bg-amber-50/80 border-amber-200'
                      : isSuccess
                      ? 'bg-indigo-50/80 border-indigo-200'
                      : isPrimary
                      ? 'bg-purple-50/80 border-purple-200'
                      : 'bg-emerald-50/80 border-emerald-200'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shrink-0 ${
                      isWarning
                        ? 'bg-amber-500'
                        : isSuccess
                        ? 'bg-indigo-500'
                        : isPrimary
                        ? 'bg-purple-500'
                        : 'bg-emerald-500'
                    }`}
                  >
                    {isWarning ? (
                      <Clock className="w-4 h-4" />
                    ) : isSuccess ? (
                      <FileSpreadsheet className="w-4 h-4" />
                    ) : isPrimary ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-black uppercase ${
                        isWarning
                          ? 'text-amber-800'
                          : isSuccess
                          ? 'text-indigo-800'
                          : isPrimary
                          ? 'text-purple-800'
                          : 'text-emerald-800'
                      }`}
                    >
                      {al.badge || al.title}
                    </span>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{al.title}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        isWarning
                          ? 'text-amber-700'
                          : isSuccess
                          ? 'text-indigo-700'
                          : isPrimary
                          ? 'text-purple-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {al.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Presensi Bulan Ini */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-0.5 bg-emerald-50 rounded-md">
                    Kehadiran Semester
                  </span>
                  <span className="text-slate-400 font-mono">48 Hari</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {currentChild?.attendance_summary?.percentage || 97.9}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Hadir: <strong>{currentChild?.attendance_summary?.hadir || 46}</strong> | Izin: <strong>{currentChild?.attendance_summary?.izin || 1}</strong> | Sakit: <strong>{currentChild?.attendance_summary?.sakit || 1}</strong> | Alfa: <strong>0</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-bold">Kondisi Sangat Prima</span>
                <button
                  onClick={() => setActiveMenu('presensi')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Detail & Izin →
                </button>
              </div>
            </div>

            {/* Rata-Rata Akademik */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 px-2 py-0.5 bg-indigo-50 rounded-md">
                    Nilai Rata-Rata
                  </span>
                  <span className="text-slate-400 font-mono">KKM: 75</span>
                </div>
                <div className="text-3xl font-black text-indigo-600">
                  {currentChild?.academic_summary?.average_score || 88.4}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Predikat: <strong>{currentChild?.academic_summary?.predikat || 'A (Amat Baik)'}</strong>
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{currentChild?.academic_summary?.ranking || 'Peringkat 2'}</span>
                <button
                  onClick={() => setActiveMenu('akademik')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Lihat Nilai →
                </button>
              </div>
            </div>

            {/* Status Tugas Anak */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 px-2 py-0.5 bg-amber-50 rounded-md">
                    Tugas & Laporan
                  </span>
                  <span className="text-slate-400 font-mono">18 Tugas</span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  {currentChild?.academic_summary?.pending_tasks || 1} <span className="text-xs font-normal text-slate-400">Belum Kumpul</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  17 Selesai Dinilai • 0 Terlambat
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-amber-600 font-bold">1 Mendekati Tenggat</span>
                <button
                  onClick={() => setActiveMenu('pembelajaran')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Cek Tugas →
                </button>
              </div>
            </div>

            {/* Wali Kelas & Konsultasi */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 px-2 py-0.5 bg-slate-100 rounded-md">
                    Wali Kelas
                  </span>
                  <span className="text-slate-400 font-mono">R. 204</span>
                </div>
                <div className="text-base font-bold text-slate-900 truncate">
                  {currentChild.homeroom_teacher}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Konsultasi: Senin-Kamis 14:00 - 15:30 WIB
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-500">0812-3456-7890</span>
                <button
                  onClick={() => setActiveMenu('komunikasi')}
                  className="px-3 py-1 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Kirim Pesan
                </button>
              </div>
            </div>
          </div>

          {/* Agenda Hari Ini & Pengumuman Sekolah */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jadwal Hari Ini */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Jadwal Belajar Hari Ini</h3>
                </div>
                <button
                  onClick={() => setActiveMenu('akademik')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Lihat Mingguan →
                </button>
              </div>

              <div className="space-y-3">
                {(dashboardData?.today_agenda || scheduleData?.today || [
                  { time: '07:00 - 08:30 WIB', subject: 'Matematika', teacher: currentChild.homeroom_teacher, room: 'Kelas', status: 'Selesai' },
                ]).map((item: any, idx: number) => {
                  const isFinished = item.status === 'Selesai';
                  const isOngoing = item.status === 'Sedang Berlangsung';
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{item.subject}</span>
                          {item.room && <span className="text-[10px] text-slate-500 font-mono">({item.room})</span>}
                        </div>
                        <span className="text-[11px] text-slate-500">{item.teacher} • {item.time}</span>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isFinished
                          ? 'bg-emerald-100 text-emerald-800'
                          : isOngoing
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pengumuman Sekolah Resmi */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="text-base font-bold text-slate-900">Pengumuman Resmi Sekolah</h3>
                </div>
                <button
                  onClick={() => setActiveMenu('informasi')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Semua Pengumuman →
                </button>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Undangan Rapat Koordinasi Orang Tua / Wali Murid Kelas XI',
                    date: '02 Okt 2026',
                    summary: 'Pemaparan evaluasi tengah semester dan pengarahan pemilihan jurusan SNBP/SNBT 2027.',
                    badge: 'Rapat Ortu',
                  },
                  {
                    title: 'Surat Edaran Protokol Kesehatan Menghadapi Cuaca Ekstrem',
                    date: '29 Sep 2026',
                    summary: 'Dihimbau siswa membawa tumbler mandiri dan payung/jas hujan saat musim hujan.',
                    badge: 'Kesehatan',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{item.date}</span>
                    </div>
                    <p className="text-xs text-slate-600">{item.summary}</p>
                    <div className="mt-1">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: ANAK SAYA (PROFIL & MULTI-ANAK SWITCHER) */}
      {/* ========================================================================= */}
      {activeMenu === 'anak-saya' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900 mb-1">Daftar Anak Yang Terhubung dengan Akun Anda</h2>
            <p className="text-xs text-slate-500 mb-4">
              Satu akun wali murid terhubung dengan seluruh putra-putri yang bersekolah di platform. Klik untuk langsung memantau.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(childrenList.length > 0 ? childrenList : [
                { id: 1, name: 'Ahmad Fauzi', class_name: 'XI MIPA 1', level: 'SMA Teladan Bangsa', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', academic_summary: { average_score: 89.1 }, attendance_summary: { percentage: 97.9 } },
                { id: 2, name: 'Aisyah Putri Trianto', class_name: 'VIII B', level: 'SMP Teladan Bangsa', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', academic_summary: { average_score: 91.2 }, attendance_summary: { percentage: 97.9 } },
                { id: 3, name: 'Fajar Pratama Trianto', class_name: 'V A', level: 'SD Teladan Bangsa', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', academic_summary: { average_score: 86.8 }, attendance_summary: { percentage: 95.8 } },
              ]).map((k: any) => (
                <div
                  key={k.id}
                  onClick={() => handleSwitchChild(k.id)}
                  className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    activeChildId === k.id
                      ? 'border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-500 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={k.avatar} alt={k.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{k.name}</h4>
                      <p className="text-xs text-indigo-700 font-bold">{k.class_name || k.class} • {k.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60">
                    <span>Rata-Rata: <strong>{k.academic_summary?.average_score || k.gpa || 88.4}</strong></span>
                    <span>Presensi: <strong>{k.attendance_summary?.percentage ? `${k.attendance_summary.percentage}%` : (k.att || '97.9%')}</strong></span>
                    {activeChildId === k.id ? (
                      <span className="text-[10px] font-extrabold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 hover:text-indigo-600">Pilih</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Profil Anak Aktif */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5">
            <h3 className="text-base font-black text-slate-900">Biodata Lengkap Ananda ({currentChild.name})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Nama Lengkap Siswa</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{currentChild.name}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">NIS / NISN</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{currentChild.nis || '20241101'} / {currentChild.nisn || '0078942189'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Rombel & Kelas</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{currentChild.class_name} (Fase F)</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Tahun Ajaran / Semester</span>
                <span className="text-slate-900 font-bold mt-0.5 block">2026/2027 • Ganjil</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Wali Kelas Penanggung Jawab</span>
                <span className="text-slate-900 font-bold mt-0.5 block">{currentChild.homeroom_teacher}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Status Kesiswaan</span>
                <span className="text-emerald-600 font-bold mt-0.5 block">Siswa Aktif Terdaftar Dapodik</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: AKADEMIK (NILAI, MAPEL, RAPOR & GRAFIK) */}
      {/* ========================================================================= */}
      {activeMenu === 'akademik' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Header Akademik */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Perkembangan Akademik & Nilai Terpublikasi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai yang ditampilkan telah disahkan guru pengampu. Orang tua memiliki hak akses baca (read-only).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
                Rata-rata: {academicData?.overall_gpa || currentChild?.academic_summary?.average_score || 88.4} (Predikat {currentChild?.academic_summary?.predikat || 'A'})
              </span>
            </div>
          </div>

          {/* Tabel Nilai Per Mata Pelajaran */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 mb-4">Nilai Berjalan Semester Ganjil 2026/2027</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                    <th className="pb-3">Mata Pelajaran</th>
                    <th className="pb-3 text-center">KKM/KKTP</th>
                    <th className="pb-3 text-center">Tugas (30%)</th>
                    <th className="pb-3 text-center">Kuis (20%)</th>
                    <th className="pb-3 text-center">Ujian (50%)</th>
                    <th className="pb-3 text-center">Nilai Akhir</th>
                    <th className="pb-3 text-center">Grade</th>
                    <th className="pb-3 text-right">Ketuntasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(academicData?.subjects || [
                    { name: 'Matematika Peminatan', kkm: 75, assignment: 90, quiz: 88, exam: 92, final_score: 90.5, grade: 'A', status: 'Tuntas' },
                    { name: 'Fisika Terapan', kkm: 75, assignment: 86, quiz: 84, exam: 87, final_score: 86.0, grade: 'A', status: 'Tuntas' },
                  ]).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{row.name || row.mapel}</td>
                      <td className="py-3 text-center font-mono text-slate-500">{row.kkm}</td>
                      <td className="py-3 text-center font-mono">{row.assignment ?? row.tugas}</td>
                      <td className="py-3 text-center font-mono">{row.quiz ?? row.kuis}</td>
                      <td className="py-3 text-center font-mono">{row.exam ?? row.ujian}</td>
                      <td className="py-3 text-center font-mono font-bold text-indigo-600">{row.final_score ?? row.akhir}</td>
                      <td className="py-3 text-center font-bold">{row.grade}</td>
                      <td className="py-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rapor Digital & Download */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase">
                Rapor Digital Terverifikasi
              </span>
              <h3 className="text-base font-black text-slate-900 mt-1">Pratinjau Rapor Sisipan Tengah Semester (PTS)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Catatan Wali Kelas: <em>"{reportCardsData?.active_report?.homeroom_notes || `${currentChild.name} menunjukkan kemandirian belajar yang sangat mengesankan dan aktif membimbing rekan-rekannya.`}"</em>
              </p>
            </div>
            <button
              onClick={() => showToast('Mengunduh Berkas Rapor Resmi (PDF)...')}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Rapor PDF</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: PEMBELAJARAN (MATERI, TUGAS, UJIAN) */}
      {/* ========================================================================= */}
      {activeMenu === 'pembelajaran' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Header */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Monitoring Pembelajaran Anak</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pantau progres tugas mandiri, bahan ajar yang diberikan guru, dan agenda kuis/PTS mendatang.
              </p>
            </div>
          </div>

          {/* List Tugas Anak */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900">Daftar Tugas & Status Pengumpulan</h3>
            <div className="space-y-3">
              {(assignmentsData && assignmentsData.length > 0 ? assignmentsData : [
                {
                  subject: 'Tugas Mandiri',
                  title: 'Penugasan Terprogram',
                  teacher: currentChild.homeroom_teacher,
                  deadline_human: 'Besok, 23:59 WIB',
                  status: 'Belum Dikerjakan',
                  feedback: 'Menunggu pengumpulan dari siswa.',
                },
              ]).map((task: any, i: number) => {
                const isPending = task.status === 'Belum Dikerjakan' || task.status === 'Belum';
                return (
                  <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {task.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Guru: {task.teacher} • Batas Waktu: <strong>{task.deadline_human || task.deadline}</strong>
                      </p>
                      {task.feedback && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-white p-2 rounded-xl border border-slate-100 inline-block">
                          💬 Umpan Balik Guru: <em>{task.feedback}</em>
                        </p>
                      )}
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                      isPending ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {task.status} {task.score ? `(${task.score}/100)` : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agenda Ujian & Kuis Mendatang */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900">Agenda Ujian & Penilaian Tengah Semester (PTS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(examsData?.upcoming || scheduleData?.upcoming_exams || [
                { name: 'PTS Terjadwal', subject: 'Semua Mapel', date: '14 Okt 2026', time: '07:30 - 09:30', room: 'Lab CBT' },
              ]).map((ex: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 px-2 py-0.5 bg-rose-50 rounded-md w-fit">
                    Ujian Terjadwal
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{ex.name}</h4>
                  <span className="text-[11px] text-slate-500">{ex.date} • {ex.time}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{ex.room || 'CBT Lab'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: PRESENSI & PERMOHONAN IZIN */}
      {/* ========================================================================= */}
      {activeMenu === 'presensi' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          {/* Header Presensi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Presensi & Pengajuan Izin Ketidakhadiran</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Data presensi RFID gerbang sekolah tercatat otomatis secara real-time.
              </p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Izin / Sakit</span>
            </button>
          </div>

          {/* Status Gerbang Hari Ini */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Real-Time RFID Gate</span>
                <h3 className="text-base font-black text-slate-900 mt-0.5">Anak Hadir Tepat Waktu (06:48 WIB)</h3>
                <p className="text-xs text-slate-500">Scanner Gerbang Utara #02 • Jam belajar hingga 15:00 WIB</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Terverifikasi Otomatis
            </span>
          </div>

          {/* Riwayat Pengajuan Izin Sebelumnya */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900">Riwayat Pengajuan Izin Sebelumnya</h3>
            <div className="space-y-3">
              {(leaveRequestsData || [
                {
                  id: 101,
                  leave_type: 'Sakit',
                  start_date: '2026-09-25',
                  end_date: '2026-09-25',
                  reason: 'Demam tinggi dan flu, istirahat disarankan dokter klinik.',
                  status: 'Disetujui',
                  processed_by: 'Siti Aminah, M.Pd (Wali Kelas)',
                  attachment_name: 'Surat_Dokter_Klinik_Medika.pdf',
                },
                {
                  id: 102,
                  leave_type: 'Izin Keluarga',
                  start_date: '2026-09-22',
                  end_date: '2026-09-22',
                  reason: 'Menghadiri acara pernikahan keluarga di luar kota.',
                  status: 'Disetujui',
                  processed_by: 'Siti Aminah, M.Pd (Wali Kelas)',
                  attachment_name: 'Surat_Izin_OrangTua.pdf',
                },
              ]).map((req: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">Jenis: {req.leave_type}</span>
                      <span className="text-[10px] text-slate-400">({req.start_date} s/d {req.end_date})</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">Alasan: {req.reason}</p>
                    {req.attachment_name && (
                      <span className="text-[10px] text-indigo-600 font-medium flex items-center gap-1 mt-1">
                        <Paperclip className="w-3 h-3" />
                        <span>{req.attachment_name}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {req.status}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1">{req.processed_by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: KOMUNIKASI RESMI DENGAN SEKOLAH */}
      {/* ========================================================================= */}
      {activeMenu === 'komunikasi' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Kanal Komunikasi Resmi Sekolah</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kirim pesan langsung ke Wali Kelas, Guru Mata Pelajaran, Konselor BK, atau Layanan Tata Usaha.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar Channels */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Pilih Jalur Komunikasi</h3>
              {[
                { id: 'homeroom', name: `Wali Kelas (${currentChild.homeroom_teacher})`, desc: 'Konsultasi kelas & izin' },
                { id: 'bk', name: 'Konselor BK (Nurul Hidayah, S.Psi)', desc: 'Konsultasi penjurusan & karir' },
                { id: 'tu', name: 'Layanan Tata Usaha (TU)', desc: 'Administrasi surat & berkas' },
                { id: 'teacher-math', name: 'Guru Matematika (Drs. Bambang)', desc: 'Diskusi persiapan olimpiade' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveChatChannel(c.id)}
                  className={`p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    activeChatChannel === c.id
                      ? 'bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.desc}</p>
                </button>
              ))}
            </div>

            {/* Chat Box */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-[450px]">
              {/* Header Chat */}
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Percakapan Resmi Sekolah</h4>
                  <span className="text-[10px] text-emerald-600 font-medium">● Jalur Terenkripsi & Resmi</span>
                </div>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-2 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'parent' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3.5 rounded-2xl text-xs ${
                        msg.sender === 'parent'
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ketik pesan resmi untuk pihak sekolah..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: KESISWAAN (PRESTASI, EKSTRAKURIKULER, PERKEMBANGAN & KEDISIPLINAN) */}
      {/* ========================================================================= */}
      {activeMenu === 'kesiswaan' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900">Kesiswaan, Prestasi & Ekstrakurikuler</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau rekam jejak keikutsertaan ekskul, catatan prestasi akademik/non-akademik, dan pembinaan karakter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prestasi Anak */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-black text-slate-900">Arsip Prestasi Terverifikasi</h3>
              <div className="space-y-3">
                {(achievementsData && achievementsData.length > 0 ? achievementsData : profileData?.achievements || [
                  { title: 'Juara 2 OSN Tingkat Kota Bidang Matematika', year: '2026', level: 'Tingkat Kota', badge: 'Perak' },
                ]).map((ach: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                      <span className="text-[11px] text-slate-400">{ach.level || ach.category || 'Tingkat Sekolah'} • Tahun {ach.year || '2026'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      {ach.badge || 'Prestasi'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ekstrakurikuler yang Diikuti */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-black text-slate-900">Ekstrakurikuler Aktif</h3>
              <div className="space-y-3">
                {(extracurricularsData?.enrolled || profileData?.extracurriculars || [
                  { name: 'Karya Ilmiah Remaja (KIR)', coach: 'Dra. Hj. Siti Aminah, M.Pd', schedule: 'Rabu 15:30 WIB', attendance_rate: '100%' },
                ]).map((ek: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{ek.name}</h4>
                      <span className="text-[11px] text-slate-400">Pembina: {ek.coach} • {ek.schedule || ek.role || 'Reguler'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      Kehadiran: {ek.attendance_rate || ek.att || 'Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: KALENDER & KEGIATAN (PARENT MEETING & EVENT) */}
      {/* ========================================================================= */}
      {activeMenu === 'kalender-kegiatan' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900">Kalender Akademik, Rapat Orang Tua & Event Sekolah</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Jadwal agenda resmi, kegiatan kesiswaan, dan konfirmasi kehadiran pertemuan wali murid (RSVP).
            </p>
          </div>

          {/* Rapat Orang Tua (Parent Meeting) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="text-base font-black text-slate-900">Undangan Pertemuan Orang Tua (Parent Meeting)</h3>
            <div className="space-y-4">
              {(meetingsData || [
                {
                  id: 1,
                  title: 'Rapat Evaluasi Tengah Semester & Sosialisasi SNBP/SNBT 2027',
                  date: 'Sabtu, 10 Oktober 2026',
                  time: '09:00 - 11:30 WIB',
                  location: 'Auditorium Utama & Hybrid Zoom',
                  agenda: 'Pemaparan target kelulusan PTN, pembagian rapor sisipan, dan bimbingan karir.',
                  rsvp_status: 'Hadir',
                  can_rsvp: true,
                },
              ]).map((m: any, idx: number) => (
                <div key={idx} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      Pertemuan Resmi
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">{m.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{m.date} • {m.time} • {m.location}</p>
                    <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-xl border border-slate-100">
                      Agenda: {m.agenda}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-bold text-slate-500">Konfirmasi Kehadiran:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleConfirmMeeting(m.id, 'Hadir')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        ✓ Hadir
                      </button>
                      <button
                        onClick={() => handleConfirmMeeting(m.id, 'Tidak Hadir')}
                        className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                      >
                        Tidak Hadir
                      </button>
                      <button
                        onClick={() => handleConfirmMeeting(m.id, 'Diwakilkan')}
                        className="px-3 py-1.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 text-xs font-bold transition-all cursor-pointer"
                      >
                        Diwakilkan
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB: INFORMASI & NOTIFIKASI */}
      {/* ========================================================================= */}
      {activeMenu === 'informasi' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900">Notification Center Khusus Orang Tua</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh riwayat pemberitahuan otomatis seputar presensi gerbang, nilai baru, tugas, dan undangan sekolah.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-3">
            {(notificationsData?.notifications || [
              { title: 'Presensi Gerbang RFID', body: `${currentChild.name} telah hadir dan memindai kartu di Gerbang Utama.`, date: 'Hari ini', type: 'attendance' },
              { title: 'Nilai Baru Terbit', body: `Guru telah mempublikasikan nilai tugas evaluasi pembelajaran ${currentChild.nickname}.`, date: 'Kemarin', type: 'grade' },
              { title: 'Undangan Rapat Orang Tua', body: 'Undangan pertemuan wali murid telah dikirimkan untuk Sabtu, 10 Okt 2026.', date: '01 Okt 2026', type: 'meeting' },
            ]).map((n: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{n.body || n.content}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.date || n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. TAB: DOKUMEN & LAYANAN ADMINISTRASI */}
      {/* ========================================================================= */}
      {activeMenu === 'dokumen-layanan' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Digital Locker Dokumen Anak & Layanan Sekolah</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Akses dokumen resmi digital (rapor, surat izin, piagam) dan ajukan permohonan surat keterangan ke TU.
              </p>
            </div>
            <button
              onClick={() => setShowServiceModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Permohonan Surat</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Digital Locker Dokumen */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-black text-slate-900">Dokumen Digital Anak</h3>
              <div className="space-y-3">
                {(documentsData && documentsData.length > 0 ? documentsData : [
                  { title: `Rapor Semester 2 - ${currentChild.nickname}`, size: '2.1 MB', date: '25 Jun 2026' },
                  { title: `Rapor Semester 1 - ${currentChild.nickname}`, size: '1.9 MB', date: '20 Des 2025' },
                  { title: 'Surat Keterangan Siswa Aktif Terakhir', size: '420 KB', date: '18 Sep 2026' },
                ]).map((doc: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{doc.title || doc.name}</h4>
                        <span className="text-[10px] text-slate-400">{doc.size} • Terbit: {doc.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Mengunduh file: ${doc.title || doc.name}`)}
                      className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-indigo-600 border border-slate-200 cursor-pointer"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Berkas Administrasi */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
              <h3 className="text-base font-black text-slate-900">Kelengkapan Administrasi Siswa</h3>
              <div className="space-y-2.5">
                {(administrationData?.documents_check || [
                  { document: 'Akta Kelahiran', status: 'Lengkap & Terverifikasi' },
                  { document: 'Kartu Keluarga (KK)', status: 'Lengkap & Terverifikasi' },
                  { document: 'Ijazah Jenjang Sebelumnya', status: 'Lengkap & Terverifikasi' },
                  { document: 'Data Nomor Induk Siswa Nasional (NISN)', status: 'Validasi Kemdikbud OK' },
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.document || item.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      ✓ {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. TAB: AKUN & KEAMANAN */}
      {/* ========================================================================= */}
      {activeMenu === 'akun' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900">Akun Wali Murid & Pengaturan Relasi</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola informasi kontak wali murid, keamanan kata sandi, dan status hubungan orang tua-anak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4 text-xs">
              <h3 className="text-base font-black text-slate-900">Profil Wali Murid</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Nama Wali Murid</span>
                  <input
                    type="text"
                    defaultValue="Bambang Trianto"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Nomor WhatsApp Resmi</span>
                  <input
                    type="text"
                    defaultValue="0812-8888-9999"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 mt-1"
                  />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Email Notifikasi</span>
                  <input
                    type="email"
                    defaultValue="bambang.trianto@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 mt-1"
                  />
                </div>
                <button
                  onClick={() => showToast('Perubahan data kontak berhasil disimpan.')}
                  className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-all cursor-pointer w-fit"
                >
                  Simpan Kontak
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Relasi Siswa Terhubung</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Akun Anda saat ini terhubung resmi dengan 3 siswa di sistem sekolah. Jika terdapat ketidaksesuaian relasi siswa, silakan lapor ke Admin Sekolah.
                </p>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <span>Ahmad Fauzi (XI MIPA 1)</span>
                    <span className="font-bold text-emerald-600">Anak Kandung</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <span>Aisyah Putri Trianto (VIII B)</span>
                    <span className="font-bold text-emerald-600">Anak Kandung</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                    <span>Fajar Pratama Trianto (V A)</span>
                    <span className="font-bold text-emerald-600">Anak Kandung</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  const msg = prompt('Jelaskan ketidaksesuaian data anak/relasi yang Anda temukan:');
                  if (msg) {
                    reportParentRelationIssue(activeChildId, msg);
                    showToast('Laporan relasi telah diteruskan ke Admin Sekolah.');
                  }
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 p-2.5 rounded-xl border border-rose-200 transition-all cursor-pointer text-center"
              >
                ⚠️ Laporkan Masalah Hubungan Orang Tua - Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. TAB: BANTUAN & FAQ */}
      {/* ========================================================================= */}
      {activeMenu === 'bantuan' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
            <h2 className="text-lg font-black text-slate-900">Pusat Bantuan & Panduan Wali Murid</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pertanyaan umum seputar fitur pemantauan, presensi gerbang, dan nomor kontak bantuan sekolah.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
            {[
              {
                q: 'Bagaimana cara beralih antar profil anak jika saya memiliki lebih dari 1 anak di sekolah?',
                a: 'Gunakan dropdown selector "Pilih Profil Anak" yang terdapat di pojok atas dashboard. Seluruh jadwal, absensi, tugas, dan nilai otomatis menyesuaikan anak yang dipilih.',
              },
              {
                q: 'Kapan presensi gerbang anak tercatat di sistem?',
                a: 'Presensi RFID gate tercatat secara real-time langsung ke sistem saat anak melakukan tap kartu di gerbang sekolah (biasanya antara pukul 06:15 - 06:55 WIB).',
              },
              {
                q: 'Apakah saya bisa mengajukan izin sakit tanpa surat dokter?',
                a: 'Untuk izin sakit 1 hari diperbolehkan menggunakan surat izin tertulis dari orang tua. Untuk sakit lebih dari 2 hari berturut-turut, wajib menyertakan lampiran surat dokter.',
              },
              {
                q: 'Apakah nilai yang tertera di portal orang tua sudah nilai akhir rapor?',
                a: 'Nilai yang muncul di portal adalah gabungan nilai harian yang telah dipublikasikan guru. Nilai rapor resmi akan difinalisasi pada akhir semester setelah sidang pleno guru.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 13. TAB: AI PARENT ASSISTANT */}
      {/* ========================================================================= */}
      {activeMenu === 'ai-assistant' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1.5">
                <Bot className="w-3.5 h-3.5" />
                <span>AI Parent Assistant • Smart School Companion</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">Asisten Pintar Pemantauan Orang Tua</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tanyakan langsung informasi presensi, rincian tugas, capaian nilai, atau agenda ujian ananda <strong>{currentChild.name}</strong> secara faktual.
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Konteks: {currentChild.name} ({currentChild.class_name})
            </span>
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Pertanyaan Cepat:</span>
            {[
              'Apakah anak saya sudah hadir di sekolah hari ini?',
              'Tugas apa saja yang mendekati deadline?',
              'Bagaimana capaian nilai ananda semester ini?',
              'Kapan jadwal ujian PTS dimulai?',
              'Siapa wali kelas anak saya dan jam konsultasinya?',
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAiChat(p)}
                className="px-3 py-1.5 rounded-full bg-white hover:bg-indigo-50 border border-slate-200 text-xs font-medium text-slate-700 hover:text-indigo-700 transition-all cursor-pointer shadow-2xs"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Container */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-[520px]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {aiChatHistory.map((chat, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.sender === 'ai' && (
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                      chat.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                        : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{chat.text}</p>
                  </div>
                  {chat.sender === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                  <span>AI sedang menganalisis data sekolah...</span>
                </div>
              )}
            </div>

            {/* Input Chat */}
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                placeholder="Tanyakan seputar perkembangan, nilai, presensi, atau jadwal ananda..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-indigo-500"
              />
              <button
                onClick={() => handleAiChat()}
                disabled={aiLoading}
                className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Tanya AI</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PENGAJUAN IZIN KETIDAKHADIRAN */}
      {/* ========================================================================= */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Form Pengajuan Izin Siswa</h3>
              </div>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitLeave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  disabled
                  value={`${currentChild.name} (${currentChild.class_name})`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Izin</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                >
                  <option value="Sakit">Sakit</option>
                  <option value="Izin Keluarga">Izin Keluarga</option>
                  <option value="Dispensasi Lomba / Kegiatan Luar">Dispensasi Lomba / Kegiatan Luar</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    min={leaveForm.start_date}
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Izin</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="Jelaskan alasan ketidakhadiran secara singkat dan jelas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Lampiran Dokumen / Surat Dokter (Opsional)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 text-slate-500">
                  <Paperclip className="w-4 h-4 mx-auto mb-1 text-slate-400" />
                  <span className="text-[11px]">Pilih file dokumen PDF / Foto (Maksimal 5MB)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-md"
                >
                  Kirim Pengajuan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: PERMOHONAN LAYANAN ADMINISTRASI */}
      {/* ========================================================================= */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Permohonan Layanan Administrasi</h3>
              </div>
              <button
                onClick={() => setShowServiceModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitService} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  disabled
                  value={`${currentChild.name} (${currentChild.class_name})`}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-500 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Jenis Layanan Surat</label>
                <select
                  value={serviceForm.service_type}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800"
                >
                  <option value="Surat Keterangan Siswa Aktif (Untuk Beasiswa / Tunjangan Ortu)">Surat Keterangan Siswa Aktif (Untuk Beasiswa / Tunjangan Ortu)</option>
                  <option value="Legalisir Ijazah & Rapor Digital">Legalisir Ijazah & Rapor Digital</option>
                  <option value="Permohonan Pertemuan Khusus dengan Kepala Sekolah / Wali Kelas">Permohonan Pertemuan Khusus dengan Kepala Sekolah / Wali Kelas</option>
                  <option value="Pengajuan Pembaruan Kontak / Alamat Domisili Siswa">Pengajuan Pembaruan Kontak / Alamat Domisili Siswa</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Keperluan Pengajuan</label>
                <textarea
                  rows={3}
                  value={serviceForm.purpose}
                  onChange={(e) => setServiceForm({ ...serviceForm, purpose: e.target.value })}
                  placeholder="Contoh: Untuk persyaratan pengajuan tunjangan anak PNS di kantor BKN..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer shadow-md"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
