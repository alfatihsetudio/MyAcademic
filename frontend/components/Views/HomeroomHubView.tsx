'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  School,
  GraduationCap,
  Clock,
  Users,
  Brain,
  HeartHandshake,
  MessageSquare,
  Megaphone,
  FileSpreadsheet,
  BarChart3,
  User as UserIcon,
  HelpCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  TrendingUp,
  TrendingDown,
  Calendar,
  FileText,
  UserCheck,
  Send,
  Plus,
  RefreshCw,
  Printer,
  FileDown,
  ExternalLink,
  ChevronRight,
  Shield,
  Phone,
  MessageCircle,
  Award,
  Sparkles,
  Lock,
  Eye,
  Check,
  X,
  ChevronDown,
  BookOpen,
  ArrowRightLeft
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchHomeroomDashboard,
  fetchHomeroomClassProfile,
  fetchHomeroomStudents,
  fetchHomeroomStudent360,
  fetchHomeroomAttendance,
  saveHomeroomAttendanceCorrection,
  fetchHomeroomAcademic,
  fetchHomeroomGrades,
  fetchHomeroomMastery,
  fetchHomeroomAssignments,
  fetchHomeroomLearningMonitoring,
  fetchHomeroomSubjectTeachers,
  fetchHomeroomNotes,
  saveHomeroomNote,
  fetchHomeroomDiscipline,
  fetchHomeroomCoaching,
  saveHomeroomCoaching,
  fetchHomeroomBkReferrals,
  saveHomeroomBkReferral,
  fetchHomeroomParentCommunication,
  fetchHomeroomParentHistory,
  saveHomeroomParentHistory,
  fetchHomeroomAnnouncements,
  saveHomeroomAnnouncement,
  fetchHomeroomCalendar,
  fetchHomeroomSchedule,
  fetchHomeroomOrganization,
  updateHomeroomOrganization,
  fetchHomeroomActivities,
  saveHomeroomActivity,
  fetchHomeroomAchievements,
  saveHomeroomAchievement,
  fetchHomeroomExtracurriculars,
  fetchHomeroomReportCards,
  saveHomeroomReportCardNotes,
  finalizeHomeroomReportCard,
  fetchHomeroomClassPromotion,
  saveHomeroomPromotionRecommendation,
  fetchHomeroomGraduation,
  fetchHomeroomDocuments,
  requestTuDocument,
  fetchHomeroomAnalytics,
  fetchHomeroomEarlyWarning,
  fetchHomeroomComparison,
  fetchHomeroomParentMeetings,
  saveHomeroomParentMeeting,
  fetchHomeroomPrivateNotes,
  saveHomeroomPrivateNote,
  fetchHomeroomNotifications,
  searchHomeroomClass,
  fetchHomeroomProfile,
  fetchHomeroomHelp
} from '@/lib/api';

export type HomeroomMenuKey =
  | 'dashboard'
  // 2. Kelas Saya
  | 'overview-kelas'
  | 'data-siswa'
  | 'struktur-organisasi'
  | 'jadwal-kelas'
  | 'kalender-kelas'
  | 'kegiatan-kelas'
  // 3. Akademik
  | 'monitoring-nilai'
  | 'ketuntasan'
  | 'progress-pembelajaran'
  | 'monitoring-tugas'
  | 'monitoring-guru-mapel'
  // 4. Presensi
  | 'presensi-hari-ini'
  | 'rekap-presensi'
  | 'koreksi-presensi'
  | 'siswa-terlambat-berisiko'
  // 5. Kesiswaan
  | 'catatan-siswa'
  | 'prestasi-siswa'
  | 'monitoring-kedisiplinan'
  | 'pembinaan-siswa'
  | 'ekstrakurikuler-siswa'
  // 6. BK
  | 'referral-bk'
  | 'monitoring-penanganan-bk'
  | 'referral-multi-pihak'
  // 7. Orang Tua
  | 'daftar-orang-tua'
  | 'komunikasi-orang-tua'
  | 'riwayat-komunikasi'
  | 'pertemuan-orang-tua'
  // 8. Komunikasi
  | 'pengumuman-kelas'
  | 'notifikasi'
  // 9. Rapor & Laporan
  | 'kelengkapan-nilai-rapor'
  | 'catatan-wali-kelas-rapor'
  | 'finalisasi-rapor'
  | 'kenaikan-kelas'
  | 'kelulusan'
  | 'dokumen-surat-kelas'
  | 'laporan-kelas-export'
  // 10. Analytics
  | 'class-performance'
  | 'comparison-perkembangan'
  | 'early-warning-system'
  // 11. Profil & Keamanan
  | 'homeroom-private-notes'
  | 'profil-keamanan'
  // 12. Bantuan
  | 'bantuan';

interface HomeroomHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  externalActiveMenu?: HomeroomMenuKey;
  onMenuChange?: (menu: HomeroomMenuKey) => void;
}

export default function HomeroomHubView({
  currentUser,
  onNavigateTab,
  externalActiveMenu,
  onMenuChange,
}: HomeroomHubViewProps) {
  // Navigation active tab
  const [activeMenu, setActiveMenuState] = useState<HomeroomMenuKey>(externalActiveMenu || 'dashboard');
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Search in class
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  // Modal Student 360
  const [selectedStudent360Id, setSelectedStudent360Id] = useState<number | null>(null);
  const [student360Data, setStudent360Data] = useState<any>(null);
  const [student360Tab, setStudent360Tab] = useState<string>('overview');

  // Form states
  const [correctionModal, setCorrectionModal] = useState(false);
  const [correctionForm, setCorrectionForm] = useState({
    student_id: 103,
    student_name: 'Rian Hidayat',
    date: '2026-10-02',
    old_status: 'Alfa',
    new_status: 'Izin',
    reason: 'Orang tua mengirim surat izin keluarga sah via WhatsApp',
    proof_attachment: 'surat_izin_rian.jpg',
  });

  const [noteModal, setNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    student_id: 103,
    student_name: 'Rian Hidayat',
    category: 'Kedisiplinan',
    priority: 'Tinggi',
    content: '',
    attachment: '',
  });

  const [bkReferralModal, setBkReferralModal] = useState(false);
  const [bkReferralForm, setBkReferralForm] = useState({
    student_name: 'Rian Hidayat',
    reason: 'Siswa mengalami penurunan nilai 3 mapel dan 5x alfa',
    urgency: 'Tinggi (Perlu Panggilan Ortu Segera)',
    notes: '',
  });

  const [announcementModal, setAnnouncementModal] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    target: 'Semua Siswa & Orang Tua',
    content: '',
  });

  const [parentCommModal, setParentCommModal] = useState(false);
  const [parentCommForm, setParentCommForm] = useState({
    student_name: 'Rian Hidayat',
    parent_name: 'Hidayat Sutisna',
    topic: 'Klarifikasi Absensi dan Remedial',
    channel: 'WhatsApp & Panggilan Suara',
    summary: '',
    follow_up: '',
  });

  const [privateNoteModal, setPrivateNoteModal] = useState(false);
  const [privateNoteForm, setPrivateNoteForm] = useState({
    student_name: 'Rian Hidayat',
    type: 'Observasi Perilaku Kelas',
    content: '',
  });

  const [achievementModal, setAchievementModal] = useState(false);
  const [achievementForm, setAchievementForm] = useState({
    student_id: 101,
    student_name: 'Ahmad Fauzi',
    title: '',
    category: 'Akademik',
    level: 'Tingkat Kota',
    rank: 'Juara 1',
    date: '2026-10-01',
    proof_document: '',
  });

  const [meetingModal, setMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    date: '2026-10-15',
    time: '09:00 - 11:00',
    venue: 'Ruang Kelas XI MIPA 1',
    agenda: '',
  });

  const [tuDocModal, setTuDocModal] = useState(false);
  const [tuDocForm, setTuDocForm] = useState({
    student_name: '',
    letter_type: 'Surat Keterangan Siswa Aktif',
    purpose: '',
  });

  const [filterGender, setFilterGender] = useState<'Semua' | 'Laki-laki' | 'Perempuan'>('Semua');

  // Data states from API
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [academicData, setAcademicData] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [masteryData, setMasteryData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [learningData, setLearningData] = useState<any>(null);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [notesData, setNotesData] = useState<any[]>([]);
  const [disciplineData, setDisciplineData] = useState<any>(null);
  const [coachingData, setCoachingData] = useState<any[]>([]);
  const [bkReferralsData, setBkReferralsData] = useState<any>(null);
  const [parentsData, setParentsData] = useState<any[]>([]);
  const [parentHistoryData, setParentHistoryData] = useState<any[]>([]);
  const [announcementsData, setAnnouncementsData] = useState<any[]>([]);
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [organizationData, setOrganizationData] = useState<any>(null);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [achievementsData, setAchievementsData] = useState<any[]>([]);
  const [extracurricularsData, setExtracurricularsData] = useState<any[]>([]);
  const [reportCardsData, setReportCardsData] = useState<any>(null);
  const [promotionData, setPromotionData] = useState<any[]>([]);
  const [graduationData, setGraduationData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [earlyWarningData, setEarlyWarningData] = useState<any>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [parentMeetingsData, setParentMeetingsData] = useState<any[]>([]);
  const [privateNotesData, setPrivateNotesData] = useState<any[]>([]);
  const [notificationsData, setNotificationsData] = useState<any[]>([]);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [helpData, setHelpData] = useState<any>(null);

  const setActiveMenu = (menu: HomeroomMenuKey) => {
    setActiveMenuState(menu);
    if (onMenuChange) onMenuChange(menu);
  };

  const showToast = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchHomeroomDashboard().then((d) => d && setDashboardData(d)),
      fetchHomeroomClassProfile().then((d) => d && setProfileData(d.profile)),
      fetchHomeroomStudents().then((d) => d && setStudentsData(d.students || [])),
      fetchHomeroomAttendance().then((d) => d && setAttendanceData(d)),
      fetchHomeroomAcademic().then((d) => d && setAcademicData(d)),
      fetchHomeroomGrades().then((d) => d && setGradesData(d.students || [])),
      fetchHomeroomMastery().then((d) => d && setMasteryData(d)),
      fetchHomeroomAssignments().then((d) => d && setAssignmentsData(d)),
      fetchHomeroomLearningMonitoring().then((d) => d && setLearningData(d)),
      fetchHomeroomSubjectTeachers().then((d) => d && setTeachersData(d.teachers || [])),
      fetchHomeroomNotes().then((d) => d && setNotesData(d.notes || [])),
      fetchHomeroomDiscipline().then((d) => d && setDisciplineData(d)),
      fetchHomeroomCoaching().then((d) => d && setCoachingData(d.coaching_logs || [])),
      fetchHomeroomBkReferrals().then((d) => d && setBkReferralsData(d)),
      fetchHomeroomParentCommunication().then((d) => d && setParentsData(d.parents || [])),
      fetchHomeroomParentHistory().then((d) => d && setParentHistoryData(d.logs || [])),
      fetchHomeroomAnnouncements().then((d) => d && setAnnouncementsData(d.announcements || [])),
      fetchHomeroomCalendar().then((d) => d && setCalendarData(d.events || [])),
      fetchHomeroomSchedule().then((d) => d && setScheduleData(d.schedule_by_day || {})),
      fetchHomeroomOrganization().then((d) => d && setOrganizationData(d.structure)),
      fetchHomeroomActivities().then((d) => d && setActivitiesData(d.activities || [])),
      fetchHomeroomAchievements().then((d) => d && setAchievementsData(d.achievements || [])),
      fetchHomeroomExtracurriculars().then((d) => d && setExtracurricularsData(d.activities || [])),
      fetchHomeroomReportCards().then((d) => d && setReportCardsData(d)),
      fetchHomeroomClassPromotion().then((d) => d && setPromotionData(d.candidates || [])),
      fetchHomeroomGraduation().then((d) => d && setGraduationData(d.graduation_monitoring)),
      fetchHomeroomDocuments().then((d) => d && setDocumentsData(d)),
      fetchHomeroomAnalytics().then((d) => d && setAnalyticsData(d)),
      fetchHomeroomEarlyWarning().then((d) => d && setEarlyWarningData(d.categories)),
      fetchHomeroomComparison().then((d) => d && setComparisonData(d)),
      fetchHomeroomParentMeetings().then((d) => d && setParentMeetingsData(d.meetings || [])),
      fetchHomeroomPrivateNotes().then((d) => d && setPrivateNotesData(d.confidential_notes || [])),
      fetchHomeroomNotifications().then((d) => d && setNotificationsData(d.notifications || [])),
      fetchHomeroomProfile().then((d) => d && setUserProfileData(d.profile)),
      fetchHomeroomHelp().then((d) => d && setHelpData(d)),
    ]).catch((err) => {
      console.error('Error fetching Homeroom data:', err);
      toast.error('Gagal memuat data Homeroom. Silakan periksa koneksi atau coba lagi nanti.');
    }).finally(() => setLoading(false));
  }, []);

  // Handle open Student 360
  const handleOpenStudent360 = async (id: number) => {
    setSelectedStudent360Id(id);
    setStudent360Tab('overview');
    try {
      const res = await fetchHomeroomStudent360(id);
      if (res && res.student) {
        setStudent360Data(res.student);
      }
    } catch (err) { toast.error('Gagal memuat data siswa.'); }
  };

  // Perform search
  const handlePerformSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 1) {
      try {
        const res = await searchHomeroomClass(query);
        if (res && res.results) {
          setSearchResults(res.results);
        }
      } catch (err) { toast.error('Gagal melakukan pencarian.'); }
    } else {
      setSearchResults(null);
    }
  };

  // Save attendance correction
  const handleSaveCorrection = async () => {
    try {
      const res = await saveHomeroomAttendanceCorrection(correctionForm);
      if (res && res.success) {
        showToast('Koreksi presensi berhasil disimpan dan dicatat dalam audit log.');
        setCorrectionModal(false);
        fetchHomeroomAttendance().then((d) => d && setAttendanceData(d)).catch(() => {});
        fetchHomeroomDashboard().then((d) => d && setDashboardData(d)).catch(() => {});
      }
    } catch (err) { toast.error('Gagal menyimpan koreksi.'); }
  };

  // Save homeroom note
  const handleSaveNote = async () => {
    try {
      const res = await saveHomeroomNote(noteForm);
      if (res && res.success) {
        showToast('Catatan perkembangan siswa berhasil ditambahkan.');
        setNoteModal(false);
        setNoteForm({ ...noteForm, content: '' });
        fetchHomeroomNotes().then((d) => d && setNotesData(d.notes || [])).catch(() => {});
      }
    } catch (err) { toast.error('Gagal menyimpan catatan.'); }
  };

  // Save BK Referral
  const handleSaveBkReferral = async () => {
    try {
      const res = await saveHomeroomBkReferral(bkReferralForm);
      if (res && res.success) {
        showToast('Rujukan siswa ke BK berhasil diajukan.');
        setBkReferralModal(false);
        fetchHomeroomBkReferrals().then((d) => d && setBkReferralsData(d)).catch(() => {});
      }
    } catch (err) { toast.error('Gagal mengajukan rujukan.'); }
  };

  // Save announcement
  const handleSaveAnnouncement = async () => {
    try {
      const res = await saveHomeroomAnnouncement(announcementForm);
      if (res && res.success) {
        showToast('Pengumuman kelas berhasil dipublikasikan ke siswa & orang tua.');
        setAnnouncementModal(false);
        setAnnouncementForm({ title: '', target: 'Semua Siswa & Orang Tua', content: '' });
        fetchHomeroomAnnouncements().then((d) => d && setAnnouncementsData(d.announcements || [])).catch(() => {});
      }
    } catch (err) { toast.error('Gagal menyimpan pengumuman.'); }
  };

  // Save parent communication log
  const handleSaveParentComm = async () => {
    try {
      const res = await saveHomeroomParentHistory(parentCommForm);
      if (res && res.success) {
        showToast('Histori komunikasi dengan orang tua berhasil disimpan.');
        setParentCommModal(false);
        fetchHomeroomParentHistory().then((d) => d && setParentHistoryData(d.logs || [])).catch(() => {});
      }
    } catch (err) { toast.error('Gagal menyimpan histori komunikasi.'); }
  };

  // Save private internal note
  const handleSavePrivateNote = async () => {
    try {
      const res = await saveHomeroomPrivateNote(privateNoteForm);
      if (res && res.success) {
        showToast('Catatan rahasia observasi wali kelas tersimpan dengan aman.');
        setPrivateNoteModal(false);
        fetchHomeroomPrivateNotes().then((d) => d && setPrivateNotesData(d.confidential_notes || [])).catch(() => {});
      }
    } catch (err) { toast.error('Gagal menyimpan catatan rahasia.'); }
  };

  // Finalize report card
  const handleFinalizeReportCard = async () => {
    try {
      const res = await finalizeHomeroomReportCard();
      if (res && res.success) {
        showToast('Administrasi rapor kelas berhasil difinalisasi dan diajukan ke Kepala Sekolah.');
      }
    } catch (err) { toast.error('Gagal memfinalisasi rapor.'); }
  };

  // Save TU Document Request
  const handleRequestTuDoc = async () => {
    try {
      const res = await requestTuDocument(tuDocForm);
      if (res && res.success) {
        showToast('Permohonan surat resmi kelas berhasil dikirimkan ke loket Tata Usaha (TU).');
        setTuDocModal(false);
        fetchHomeroomDocuments().then((d) => d && setDocumentsData(d)).catch(() => {});
      }
    } catch (err) { toast.error('Gagal mengirim permohonan TU.'); }
  };

  // Sidebar Menu Items matching exactly the user prompt specification
  const sidebarGroups = [
    {
      group: 'DASHBOARD',
      items: [
        { id: 'dashboard', label: 'Dashboard Kelas', icon: LayoutDashboard, badge: 'Utama' },
      ],
    },
    {
      group: 'KELAS SAYA',
      items: [
        { id: 'overview-kelas', label: 'Overview Kelas', icon: School },
        { id: 'data-siswa', label: 'Data Siswa & 360°', icon: Users, badge: '34' },
        { id: 'struktur-organisasi', label: 'Struktur Kelas', icon: Users },
        { id: 'jadwal-kelas', label: 'Jadwal Pelajaran', icon: Calendar },
        { id: 'kalender-kelas', label: 'Kalender Kelas', icon: Calendar },
        { id: 'kegiatan-kelas', label: 'Kegiatan Kelas', icon: Sparkles },
      ],
    },
    {
      group: 'AKADEMIK',
      items: [
        { id: 'monitoring-nilai', label: 'Monitoring Nilai', icon: FileSpreadsheet },
        { id: 'ketuntasan', label: 'Ketuntasan & Remedial', icon: CheckCircle2 },
        { id: 'progress-pembelajaran', label: 'Progress Pembelajaran', icon: BookOpen },
        { id: 'monitoring-tugas', label: 'Monitoring Tugas', icon: FileText },
        { id: 'monitoring-guru-mapel', label: 'Guru Mata Pelajaran', icon: UserIcon },
      ],
    },
    {
      group: 'PRESENSI',
      items: [
        { id: 'presensi-hari-ini', label: 'Presensi Hari Ini', icon: UserCheck, alert: true },
        { id: 'rekap-presensi', label: 'Rekap Presensi', icon: Clock },
        { id: 'koreksi-presensi', label: 'Koreksi Presensi', icon: ArrowRightLeft },
        { id: 'siswa-terlambat-berisiko', label: 'Terlambat & Absensi Tinggi', icon: AlertTriangle },
      ],
    },
    {
      group: 'KESISWAAN',
      items: [
        { id: 'catatan-siswa', label: 'Catatan Siswa', icon: FileText, badge: '8 Kat' },
        { id: 'prestasi-siswa', label: 'Prestasi Siswa', icon: Award },
        { id: 'monitoring-kedisiplinan', label: 'Kedisiplinan & Pelanggaran', icon: AlertOctagon },
        { id: 'pembinaan-siswa', label: 'Pembinaan Siswa', icon: HeartHandshake },
        { id: 'ekstrakurikuler-siswa', label: 'Ekstrakurikuler', icon: Sparkles },
      ],
    },
    {
      group: 'BK (BIMBINGAN KONSELING)',
      items: [
        { id: 'referral-bk', label: 'Referral Siswa ke BK', icon: Brain },
        { id: 'monitoring-penanganan-bk', label: 'Monitoring Kasus BK', icon: Shield },
        { id: 'referral-multi-pihak', label: 'Referral Multi-Pihak', icon: ExternalLink },
      ],
    },
    {
      group: 'ORANG TUA',
      items: [
        { id: 'daftar-orang-tua', label: 'Daftar Orang Tua', icon: Users },
        { id: 'komunikasi-orang-tua', label: 'Komunikasi Langsung', icon: MessageSquare },
        { id: 'riwayat-komunikasi', label: 'Riwayat Komunikasi', icon: Clock },
        { id: 'pertemuan-orang-tua', label: 'Pertemuan / Paguyuban', icon: Calendar },
      ],
    },
    {
      group: 'KOMUNIKASI',
      items: [
        { id: 'pengumuman-kelas', label: 'Pengumuman Kelas', icon: Megaphone },
        { id: 'notifikasi', label: 'Notifikasi Kelas', icon: Sparkles },
      ],
    },
    {
      group: 'RAPOR & LAPORAN',
      items: [
        { id: 'kelengkapan-nilai-rapor', label: 'Kelengkapan Nilai Rapor', icon: FileSpreadsheet },
        { id: 'catatan-wali-kelas-rapor', label: 'Catatan Rapor & Sikap', icon: FileText },
        { id: 'finalisasi-rapor', label: 'Finalisasi Rapor', icon: CheckCircle2, alert: true },
        { id: 'kenaikan-kelas', label: 'Rekomendasi Kenaikan', icon: TrendingUp },
        { id: 'kelulusan', label: 'Monitoring Kelulusan', icon: GraduationCap },
        { id: 'dokumen-surat-kelas', label: 'Surat & Berkas TU', icon: FileText },
        { id: 'laporan-kelas-export', label: 'Laporan & Export Data', icon: Printer },
      ],
    },
    {
      group: 'ANALYTICS',
      items: [
        { id: 'class-performance', label: 'Class Performance', icon: BarChart3 },
        { id: 'comparison-perkembangan', label: 'Comparison Perkembangan', icon: TrendingUp },
        { id: 'early-warning-system', label: 'Early Warning Siswa (EWS)', icon: AlertTriangle, alert: true },
      ],
    },
    {
      group: 'PROFIL & INTERNAL',
      items: [
        { id: 'homeroom-private-notes', label: 'Homeroom Notes (Rahasia)', icon: Lock },
        { id: 'profil-keamanan', label: 'Profil Wali Kelas', icon: UserIcon },
        { id: 'bantuan', label: 'Bantuan & FAQ', icon: HelpCircle },
      ],
    },
  ];

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* 1. TOP DUAL-ROLE CONTEXT BANNER */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white rounded-3xl p-5 md:p-6 shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <School className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Konteks Aktif: Wali Kelas Asuhan
              </span>
              <span className="text-xs font-medium text-slate-400">
                {profileData?.nama_kelas || 'XI MIPA 1'} • TA 2026/2027 Ganjil
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mt-1">
              Portal Wali Kelas (42 Fitur Holistik Kelas Asuhan)
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Guru Pengampu: <span className="font-bold text-white">{profileData?.wali_kelas?.nama || 'Siti Aminah, M.Pd'}</span> — Mengelola presensi, akademik, kesiswaan, integrasi BK, komunikasi orang tua, e-rapor & analitik perkembangan rombel.
            </p>
          </div>
        </div>

        {/* Dual-role Context Switcher Quick Button */}
        <div className="flex items-center gap-2.5 shrink-0 bg-white/5 border border-white/10 p-2 rounded-2xl">
          <button
            onClick={() => onNavigateTab && onNavigateTab('teacher-hub')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
            title="Beralih ke konteks KBM Guru Pengajar mata pelajaran"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
            <span>Beralih ke Ruang Mengajar Guru (KBM)</span>
          </button>
          <button
            onClick={() => setActiveMenu('dashboard')}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Refresh Halaman"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: LEFT ACCORDION SIDEBAR & RIGHT CONTENT PANE */}
      <div className="flex flex-col lg:flex-row gap-5 items-start w-full">
        {/* LEFT NAV PANEL: Comprehensive Accordion Sidebar */}
        <aside className="w-full lg:w-72 bg-white rounded-3xl p-4 border border-slate-100 shadow-xs shrink-0 flex flex-col gap-4">
          {/* Quick Search Scoped to Class */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Cari siswa, ortu, guru mapel..."
              value={searchQuery}
              onChange={(e) => handlePerformSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            />
          </div>

          {/* Search Results Preview Dropdown if query typed */}
          {searchResults && (
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs flex flex-col gap-1.5 animate-in fade-in">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Hasil Pencarian Kelas:</span>
              {searchResults.students?.map((s: any, idx: number) => (
                <div
                  key={idx}
                  onClick={() => {
                    handleOpenStudent360(101);
                    setSearchResults(null);
                  }}
                  className="p-1.5 bg-white rounded-lg border border-slate-100 hover:bg-indigo-50 cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-slate-800">{s.title}</span>
                  <span className="text-[10px] text-indigo-600">360°</span>
                </div>
              ))}
            </div>
          )}

          {/* Sidebar Menu Groupings */}
          <div className="flex flex-col gap-4 max-h-[820px] overflow-y-auto pr-1">
            {sidebarGroups.map((grp, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-0.5">
                  {grp.group}
                </span>
                {grp.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenu(item.id as HomeroomMenuKey)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {(item as any).badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                              isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {(item as any).badge}
                          </span>
                        )}
                        {(item as any).alert && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Role Boundary Summary Footer */}
          <div className="mt-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 flex flex-col gap-1">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Shield className="w-3 h-3 text-indigo-600" />
              Batasan Akses Wali Kelas
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Monitoring KBM & nilai bersifat observasi (tidak mengubah nilai guru mapel). Catatan konseling sensitif BK tetap dirahasiakan.
            </p>
          </div>
        </aside>

        {/* RIGHT MAIN VIEW AREA */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-5">
          {/* ============================================================== */}
          {/* 1. DASHBOARD WALI KELAS                                         */}
          {/* ============================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-150">
              {/* Ringkasan Kelas & Kondisi Hari Ini Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-slate-500">Total Siswa Kelas</span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {dashboardData?.class_info?.total_students || 34} Siswa
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    L: {dashboardData?.class_info?.male_count || 16} | P: {dashboardData?.class_info?.female_count || 18}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    Kehadiran Hari Ini
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-2">
                    {dashboardData?.today_condition?.present || 31} Hadir
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {dashboardData?.today_condition?.attendance_rate || 91.2}% Tingkat Kehadiran
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    Tidak Hadir (S/I/A)
                  </span>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    3 Siswa
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Sakit: 1 | Izin: 1 | Alfa: 1
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-indigo-600 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Rata-rata Nilai Kelas
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-2">
                    {dashboardData?.academic_snapshot?.class_average || 83.4}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-1">
                    Ketuntasan: {dashboardData?.academic_snapshot?.mastery_rate || 88.2}%
                  </div>
                </div>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
                  <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Student Attention
                  </span>
                  <div className="text-2xl font-black text-amber-600 mt-2">
                    4 Siswa
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    1 High Risk | 3 Attention
                  </div>
                </div>
              </div>

              {/* Quick Actions Strip */}
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Aksi Cepat Wali Kelas (Quick Actions)
                  </span>
                  <span className="text-xs text-indigo-600 font-bold">1 Klik Tindakan</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  <button
                    onClick={() => setActiveMenu('presensi-hari-ini')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-800">Presensi Kelas</span>
                    <span className="text-[9px] text-slate-400">Hari Ini</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('data-siswa')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Lihat Siswa</span>
                    <span className="text-[9px] text-slate-400">Profil 360°</span>
                  </button>
                  <button
                    onClick={() => setAnnouncementModal(true)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <Megaphone className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Pengumuman</span>
                    <span className="text-[9px] text-slate-400">Kirim Pesan</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('daftar-orang-tua')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Hubungi Ortu</span>
                    <span className="text-[9px] text-slate-400">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setNoteModal(true)}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-800">Input Catatan</span>
                    <span className="text-[9px] text-slate-400">8 Kategori</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('monitoring-nilai')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-bold text-slate-800">Rekap Nilai</span>
                    <span className="text-[9px] text-slate-400">Gradebook</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('rekap-presensi')}
                    className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 rounded-2xl flex flex-col items-center gap-1.5 text-center cursor-pointer transition-all hover:scale-105"
                  >
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-slate-800">Rekap Absensi</span>
                    <span className="text-[9px] text-slate-400">Bulanan</span>
                  </button>
                </div>
              </div>

              {/* Student Attention Box (🔴 Absensi, 🟡 Nilai turun, 🟡 Tugas, 🔴 Disiplin, 🟢 Prestasi) */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Student Attention Matrix (Perhatian Khusus Wali Kelas)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Deteksi otomatis siswa yang membutuhkan perhatian cepat, pendampingan atau apresiasi.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('early-warning-system')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Buka EWS Lengkap <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* 1. Absensi Tinggi */}
                  <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      🔴 Siswa Absensi Tinggi / Alfa
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {dashboardData?.student_attention?.high_absence?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-rose-600">{s.reason}</span>
                          </div>
                          <button
                            onClick={() => {
                              setParentCommForm({ ...parentCommForm, student_name: s.name });
                              setParentCommModal(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold hover:bg-rose-100 cursor-pointer"
                          >
                            Hubungi
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Nilai Menurun */}
                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      🟡 Siswa dengan Nilai Menurun
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {dashboardData?.student_attention?.declining_grades?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-amber-700">{s.reason}</span>
                          </div>
                          <button
                            onClick={() => handleOpenStudent360(s.id)}
                            className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            Lihat 360°
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Tugas Tertinggal */}
                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      🟡 Siswa dengan Tugas Tertinggal
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {dashboardData?.student_attention?.missing_assignments?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-amber-700">{s.reason}</span>
                          </div>
                          <button
                            onClick={() => setActiveMenu('monitoring-tugas')}
                            className="px-2 py-1 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            Cek Tugas
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Masalah Kedisiplinan */}
                  <div className="p-3.5 bg-rose-50/60 rounded-2xl border border-rose-100 flex flex-col gap-2">
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                      🔴 Siswa Masalah Kedisiplinan
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {dashboardData?.student_attention?.disciplinary_issues?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-rose-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-rose-600">{s.reason}</span>
                          </div>
                          <button
                            onClick={() => {
                              setBkReferralForm({ ...bkReferralForm, student_name: s.name });
                              setBkReferralModal(true);
                            }}
                            className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                          >
                            Rujuk BK
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 5. Siswa Berprestasi */}
                  <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex flex-col gap-2 lg:col-span-2">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      🟢 Siswa Berprestasi & Teladan
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dashboardData?.student_attention?.achievements?.map((s: any, idx: number) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{s.name}</span>
                            <span className="text-[10px] text-emerald-700">{s.reason}</span>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            Apresiasi
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Columns: Today's Class Schedule & Today's Absentee List */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Jadwal Pelajaran Hari Ini */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                      Jadwal Pelajaran Kelas Hari Ini ({dashboardData?.today_condition?.day || 'Senin'})
                    </h3>
                    <span className="text-xs text-slate-400">4 Sesi KBM</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dashboardData?.today_condition?.today_schedule?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                            {item.period}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{item.subject}</span>
                            <span className="text-[10px] text-slate-400">{item.teacher} • {item.time}</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.status === 'Selesai'
                              ? 'bg-slate-200 text-slate-700'
                              : item.status === 'Sedang Berlangsung'
                              ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Siswa Tidak Hadir Hari Ini */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-500" />
                      Siswa Tidak Hadir Hari Ini ({dashboardData?.today_condition?.date})
                    </h3>
                    <button
                      onClick={() => setCorrectionModal(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      Koreksi Presensi
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {dashboardData?.today_condition?.absent_students?.map((s: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{s.name}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${
                                s.status === 'Sakit'
                                  ? 'bg-amber-100 text-amber-800'
                                  : s.status === 'Izin'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">{s.note}</span>
                        </div>
                        <button
                          onClick={() => {
                            setCorrectionForm({
                              ...correctionForm,
                              student_id: s.id,
                              student_name: s.name,
                              old_status: s.status,
                            });
                            setCorrectionModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs"
                        >
                          Koreksi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 2. OVERVIEW KELAS                                              */}
          {/* ============================================================== */}
          {activeMenu === 'overview-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Profil & Administrasi Rombel Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Identitas resmi kelas asuhan dan susunan penanggung jawab.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                  {profileData?.kurikulum || 'Kurikulum Merdeka Mandiri Berbagi'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Nama Kelas & Tingkat</span>
                  <span className="text-base font-black text-slate-900">{profileData?.nama_kelas || 'XI MIPA 1'}</span>
                  <span className="text-xs text-slate-600">{profileData?.tingkat || 'Tingkat XI (Fase F)'}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Jurusan / Peminatan</span>
                  <span className="text-base font-black text-slate-900">{profileData?.jurusan || 'MIPA'}</span>
                  <span className="text-xs text-slate-600">Matematika & Ilmu Pengetahuan Alam</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Tahun Ajaran & Semester</span>
                  <span className="text-base font-black text-slate-900">{profileData?.tahun_ajaran || '2026/2027'}</span>
                  <span className="text-xs text-slate-600">{profileData?.semester || 'Semester 1 (Ganjil)'}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Ruangan Kelas Fisik</span>
                  <span className="text-base font-black text-slate-900">{profileData?.ruangan || 'Ruang 204'}</span>
                  <span className="text-xs text-slate-600">Gedung B Lantai 2 (Kapasitas: {profileData?.kapasitas || 36})</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Wali Kelas Utama</span>
                  <span className="text-base font-black text-slate-900">{profileData?.wali_kelas?.nama || 'Siti Aminah, M.Pd'}</span>
                  <span className="text-xs text-slate-600">NIP: {profileData?.wali_kelas?.nip || '198405122008012015'}</span>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                  <span className="text-[10px] font-black uppercase text-slate-400">Wakil Wali Kelas</span>
                  <span className="text-base font-black text-slate-900">{profileData?.wakil_wali_kelas?.nama || 'Drs. Hendro Wibowo'}</span>
                  <span className="text-xs text-slate-600">NIP: {profileData?.wakil_wali_kelas?.nip || '197903152005011008'}</span>
                </div>
              </div>

              {/* Pengurus Harian Inti */}
              <div className="p-5 bg-indigo-50/50 rounded-3xl border border-indigo-100 flex flex-col gap-3">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-900">
                  Pengurus Harian Kelas
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Ketua Kelas (KM)</span>
                      <span className="text-xs font-bold text-slate-900">{profileData?.struktur_kelas?.ketua_kelas?.nama || 'Ahmad Fauzi'}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">{profileData?.struktur_kelas?.ketua_kelas?.hp || '0896-1122-3344'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sekretaris 1</span>
                      <span className="text-xs font-bold text-slate-900">{profileData?.struktur_kelas?.sekretaris_1?.nama || 'Nadia Syahrini'}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">{profileData?.struktur_kelas?.sekretaris_1?.hp || '0896-3344-5566'}</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Bendahara 1</span>
                      <span className="text-xs font-bold text-slate-900">{profileData?.struktur_kelas?.bendahara_1?.nama || 'Dewi Sartika'}</span>
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">{profileData?.struktur_kelas?.bendahara_1?.hp || '0896-5566-7788'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 3. DATA SISWA KELAS (4 KLUSTER DATA + TOMBOL 360°)             */}
          {/* ============================================================== */}
          {activeMenu === 'data-siswa' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Data Siswa Kelas Asuhan (34 Siswa)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data Dasar, Data Orang Tua, Data Akademik & Data Kesiswaan lengkap. Klik tombol 360° untuk profil holistik per siswa.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Filter Gender:</span>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="Semua">Semua ({studentsData.length})</option>
                    <option value="Laki-laki">Laki-laki ({studentsData.filter((s) => s.gender === 'Laki-laki').length})</option>
                    <option value="Perempuan">Perempuan ({studentsData.filter((s) => s.gender === 'Perempuan').length})</option>
                  </select>
                </div>
              </div>

              {/* Tabel Siswa */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Siswa</th>
                      <th className="py-3 px-3">NIS / NISN</th>
                      <th className="py-3 px-3">Kontak & Alamat</th>
                      <th className="py-3 px-3">Orang Tua / Wali</th>
                      <th className="py-3 px-3 text-center">Rata-rata</th>
                      <th className="py-3 px-3 text-center">Kehadiran</th>
                      <th className="py-3 px-3 text-center">Poin Pelanggaran</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentsData
                      .filter((s) => filterGender === 'Semua' || s.gender === filterGender)
                      .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.photo}
                              alt={s.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{s.name}</span>
                              <span className="text-[10px] text-slate-400">{s.gender}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono text-slate-700 block">{s.nis}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{s.nisn}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-slate-700 block">{s.phone}</span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] block">{s.address}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-bold text-slate-800 block">{s.parent?.name}</span>
                          <span className="text-[10px] text-slate-400">{s.parent?.relation} • {s.parent?.phone}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`font-black ${
                              s.academic?.average < 75 ? 'text-rose-600' : 'text-slate-800'
                            }`}
                          >
                            {s.academic?.average}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.academic?.attendance_pct < 80
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {s.academic?.attendance_pct}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {s.student_affairs?.violation_points > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                              {s.student_affairs?.violation_points} Poin
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">0</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenStudent360(s.id)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            Lihat 360°
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 4. STRUKTUR ORGANISASI KELAS                                    */}
          {/* ============================================================== */}
          {activeMenu === 'struktur-organisasi' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Bagan Struktur Organisasi Kelas XI MIPA 1</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Susunan kepengurusan kelas asuhan tahun pelajaran 2026/2027.</p>
                </div>
                <button
                  onClick={() => showToast('Mode pengeditan struktur organisasi diaktifkan.')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                >
                  Ubah Pengurus
                </button>
              </div>

              {/* Hierarchy Tree Visual */}
              <div className="flex flex-col items-center gap-4 py-4">
                {/* Level 1: Wali Kelas */}
                <div className="p-3.5 px-6 rounded-2xl bg-indigo-900 text-white text-center shadow-md border border-indigo-700">
                  <span className="text-[10px] font-black uppercase text-indigo-300 block">Wali Kelas</span>
                  <span className="text-sm font-black">{organizationData?.wali_kelas || 'Siti Aminah, M.Pd'}</span>
                </div>
                <div className="w-0.5 h-6 bg-slate-200" />

                {/* Level 2: Ketua & Wakil */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 px-5 rounded-2xl bg-slate-900 text-white text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Ketua Kelas</span>
                    <span className="text-xs font-bold">{organizationData?.ketua || 'Ahmad Fauzi'}</span>
                  </div>
                  <div className="p-3 px-5 rounded-2xl bg-slate-800 text-white text-center shadow-sm">
                    <span className="text-[10px] font-black uppercase text-slate-400 block">Wakil Ketua</span>
                    <span className="text-xs font-bold">{organizationData?.wakil || 'Bima Perkasa'}</span>
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-slate-200" />

                {/* Level 3: Sekretaris & Bendahara */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-2xl">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block">Sekretaris 1</span>
                    <span className="text-xs font-bold text-slate-800">Nadia Syahrini</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block">Sekretaris 2</span>
                    <span className="text-xs font-bold text-slate-800">Anisa Rahma</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block">Bendahara 1</span>
                    <span className="text-xs font-bold text-slate-800">Dewi Sartika</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-400 block">Bendahara 2</span>
                    <span className="text-xs font-bold text-slate-800">Cantika Putri</span>
                  </div>
                </div>
              </div>

              {/* Seksi / Divisi */}
              <div className="border-t border-slate-100 pt-5">
                <h3 className="text-sm font-black text-slate-900 mb-3">Koordinator Seksi & Divisi Kelas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {organizationData?.divisi?.map((d: any, idx: number) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-indigo-700">{d.nama}</span>
                      <span className="text-xs font-bold text-slate-900">Koor: {d.koordinator}</span>
                      <span className="text-[10px] text-slate-500">Anggota: {d.anggota?.join(', ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 5. JADWAL KELAS & KALENDER                                     */}
          {/* ============================================================== */}
          {activeMenu === 'jadwal-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Jadwal Pelajaran Kelas XI MIPA 1</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Jadwal resmi KBM per hari, jam pelajaran, dan guru pengajar.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Status: Sinkron dengan Kurikulum
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.keys(scheduleData || {}).map((dayKey) => (
                  <div key={dayKey} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-3">
                    <span className="text-xs font-black uppercase text-indigo-700 tracking-wider">
                      {dayKey}
                    </span>
                    <div className="flex flex-col gap-2">
                      {scheduleData[dayKey]?.map((s: any, sIdx: number) => (
                        <div key={sIdx} className="p-2.5 bg-white rounded-xl border border-slate-100 flex flex-col gap-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{s.subject}</span>
                            <span className="text-[10px] font-mono text-slate-400">{s.period}</span>
                          </div>
                          <span className="text-[10px] text-slate-500">{s.teacher}</span>
                          <span className="text-[9px] text-indigo-600 font-medium">{s.time} • {s.room}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'kalender-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Kalender & Agenda Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Jadwal ujian, batas akhir administrasi rapor, rapat orang tua & kegiatan rombel.</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {calendarData.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[9px] font-bold text-slate-400">TGL</span>
                        <span className="text-sm font-black text-slate-900">{ev.date.split('-')[2]}</span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{ev.title}</span>
                        <span className="text-[10px] text-slate-400">{ev.date}</span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {ev.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 6. KEGIATAN KELAS & DOKUMENTASI                                 */}
          {/* ============================================================== */}
          {activeMenu === 'kegiatan-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Dokumentasi & Kegiatan Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Rapat kelas, class meeting, kegiatan sosial, dan studi lapangan.</p>
                </div>
                <button
                  onClick={() => showToast('Form tambah kegiatan kelas dibuka.')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Kegiatan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activitiesData.map((act) => (
                  <div key={act.id} className="p-4 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                        {act.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{act.date}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{act.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>Dokumentasi: {act.documentation?.length || 1} Foto terlampir</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 7. MONITORING AKADEMIK KELAS & NILAI                           */}
          {/* ============================================================== */}
          {activeMenu === 'monitoring-nilai' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Akademik & Nilai Seluruh Mapel</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wali Kelas memantau performa kelas di semua mata pelajaran tanpa mengubah nilai guru mapel.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">Rata-rata Kelas:</span>
                  <span className="text-sm font-black px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                    {academicData?.class_average || 82.7}
                  </span>
                </div>
              </div>

              {/* Tabel Performa Mata Pelajaran di Kelas */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Mata Pelajaran</th>
                      <th className="py-3 px-3">Guru Pengampu</th>
                      <th className="py-3 px-3 text-center">KKM</th>
                      <th className="py-3 px-3 text-center">Rata-rata Kelas</th>
                      <th className="py-3 px-3 text-center">Persentase Ketuntasan</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {academicData?.subjects?.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{sub.subject}</td>
                        <td className="py-3 px-3 text-slate-600">{sub.teacher}</td>
                        <td className="py-3 px-3 text-center font-mono">{sub.kkm}</td>
                        <td className="py-3 px-3 text-center font-black text-slate-800">{sub.average}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  sub.mastery_rate < 75 ? 'bg-rose-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${sub.mastery_rate}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-700">{sub.mastery_rate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.mastery_rate >= 85
                                ? 'bg-emerald-100 text-emerald-800'
                                : sub.mastery_rate >= 75
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {sub.mastery_rate >= 75 ? 'Tuntas' : 'Perhatian Rendah'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 8. KETUNTASAN & REMEDIAL                                        */}
          {/* ============================================================== */}
          {activeMenu === 'ketuntasan' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Ketuntasan & Jadwal Remedial</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pemantauan siswa tuntas vs belum tuntas dan kandidat remedial.</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  30 Tuntas • 4 Perlu Remedial
                </span>
              </div>

              {/* Mapel Rendah Ketuntasan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {masteryData?.low_passing_subjects?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex flex-col gap-1.5">
                    <span className="text-xs font-black text-rose-800">{item.subject}</span>
                    <span className="text-xs text-slate-700">Siswa Belum Tuntas: <strong className="text-rose-600">{item.failing_students} Siswa</strong></span>
                    <span className="text-[10px] text-slate-500">Ketuntasan: {item.passing_pct}% • Tindakan: {item.action}</span>
                  </div>
                ))}
              </div>

              {/* Tabel Kandidat Remedial */}
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-3">Daftar Siswa Mengikuti Program Remedial</h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                      <tr>
                        <th className="py-3 px-3">Nama Siswa</th>
                        <th className="py-3 px-3">Mata Pelajaran</th>
                        <th className="py-3 px-3 text-center">Nilai Saat Ini</th>
                        <th className="py-3 px-3 text-center">Jadwal Remedial</th>
                        <th className="py-3 px-3 text-center">Status Remedial</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {masteryData?.remedial_candidates?.map((r: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3 font-bold text-slate-900">{r.student_name}</td>
                          <td className="py-3 px-3 text-slate-700">{r.subject}</td>
                          <td className="py-3 px-3 text-center font-bold text-rose-600">{r.current_score}</td>
                          <td className="py-3 px-3 text-center text-slate-600">{r.schedule}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              {r.remedial_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 9. MONITORING PROGRESS PEMBELAJARAN (KBM)                       */}
          {/* ============================================================== */}
          {activeMenu === 'progress-pembelajaran' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Progress Pembelajaran & KBM Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Memastikan jalannya materi, pertemuan, dan jurnal mengajar di kelas.</p>
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
                  Progres Rata-rata: {learningData?.learning_progress?.overall_kbm_progress || 61.4}%
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {learningData?.subjects_kbm?.map((sub: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2.5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <div>
                        <span className="text-sm font-bold text-slate-900">{sub.subject}</span>
                        <span className="text-xs text-slate-500 ml-2">({sub.teacher})</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600">
                        {sub.completed_meetings} / {sub.target_meetings} Pertemuan Selesai ({sub.progress_pct}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${sub.progress_pct}%` }} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-1">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-emerald-700 text-[10px] uppercase block">Materi Telah Diajarkan:</span>
                        <span className="text-slate-700">{sub.completed_topics?.join(', ')}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                        <span className="font-bold text-amber-700 text-[10px] uppercase block">Materi Belum / Berikutnya:</span>
                        <span className="text-slate-700">{sub.pending_topics?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 10. MONITORING TUGAS AGREGAT                                    */}
          {/* ============================================================== */}
          {activeMenu === 'monitoring-tugas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Agregat Tugas Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pantau persentase penyerahan tugas dari seluruh guru mata pelajaran.</p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Completion Rate: {assignmentsData?.summary?.completion_rate || 89.7}%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assignmentsData?.assignments_aggregate?.map((t: any) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md w-fit">
                      {t.subject}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{t.title}</h4>
                    <span className="text-[10px] text-slate-500">Guru: {t.teacher} • Deadline: {t.deadline}</span>

                    <div className="flex items-center justify-between text-xs mt-2 font-bold">
                      <span className="text-emerald-600">Kumpul: {t.submitted}</span>
                      <span className="text-rose-600">Belum: {t.missing}</span>
                      <span className="text-amber-600">Terlambat: {t.late}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 11. MONITORING GURU MATA PELAJARAN                              */}
          {/* ============================================================== */}
          {activeMenu === 'monitoring-guru-mapel' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Guru Mata Pelajaran Kelas XI MIPA 1</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Informasi jadwal, kehadiran guru, silabus, dan kelengkapan nilai (Read-Only).
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teachersData.map((tea) => (
                  <div key={tea.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{tea.name}</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {tea.attendance_rate}
                      </span>
                    </div>
                    <span className="text-xs text-indigo-700 font-bold">{tea.subject}</span>
                    <span className="text-[10px] text-slate-500">Jadwal: {tea.schedule}</span>
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Silabus:</span>
                        <span className="font-bold text-slate-800">{tea.progress}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Kelengkapan Nilai:</span>
                        <span className="font-bold text-slate-800">{tea.grade_completeness}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 12. PRESENSI HARI INI & REKAP                                  */}
          {/* ============================================================== */}
          {activeMenu === 'presensi-hari-ini' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Presensi Harian Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status presensi siswa hari ini ({attendanceData?.summary_today?.date}).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectionModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Koreksi Presensi
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-emerald-800 block">Hadir</span>
                  <span className="text-xl font-black text-emerald-700">{attendanceData?.summary_today?.hadir || 30}</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <span className="text-[10px] text-amber-800 block">Sakit</span>
                  <span className="text-xl font-black text-amber-700">{attendanceData?.summary_today?.sakit || 1}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <span className="text-[10px] text-blue-800 block">Izin</span>
                  <span className="text-xl font-black text-blue-700">{attendanceData?.summary_today?.izin || 1}</span>
                </div>
                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-center">
                  <span className="text-[10px] text-rose-800 block">Alfa</span>
                  <span className="text-xl font-black text-rose-700">{attendanceData?.summary_today?.alfa || 1}</span>
                </div>
                <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-800 block">Terlambat</span>
                  <span className="text-xl font-black text-slate-700">{attendanceData?.summary_today?.terlambat || 1}</span>
                </div>
              </div>

              {/* List Presensi */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-3 text-center">Waktu Masuk</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3">Catatan / Keterangan</th>
                      <th className="py-3 px-3 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceData?.today_students?.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{s.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{s.nis}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{s.time}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'Hadir'
                                ? 'bg-emerald-100 text-emerald-800'
                                : s.status === 'Sakit'
                                ? 'bg-amber-100 text-amber-800'
                                : s.status === 'Izin'
                                ? 'bg-blue-100 text-blue-800'
                                : s.status === 'Terlambat'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{s.note}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setCorrectionForm({
                                ...correctionForm,
                                student_id: s.id,
                                student_name: s.name,
                                old_status: s.status,
                              });
                              setCorrectionModal(true);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            Koreksi
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'rekap-presensi' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Rekapitulasi Presensi Kelas (Harian, Mingguan, Bulanan)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Statistik tren kehadiran dan rekap total semester.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Harian</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">91.2%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Mingguan</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">93.8%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Bulanan (September)</span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">94.5%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Semester Ganjil</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">94.8%</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 13. CATATAN WALI KELAS (8 KATEGORI)                            */}
          {/* ============================================================== */}
          {activeMenu === 'catatan-siswa' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Catatan Perkembangan Siswa Wali Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mencakup 8 Kategori: Akademik, Kehadiran, Kedisiplinan, Sosial, Perilaku, Prestasi, Perkembangan pribadi, Lainnya.
                  </p>
                </div>
                <button
                  onClick={() => setNoteModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Catatan
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {notesData.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{n.student_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                          {n.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                            n.priority === 'Tinggi'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          Prioritas {n.priority}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{n.date}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{n.content}</p>
                    {n.attachment && (
                      <span className="text-[10px] text-indigo-600 font-medium">📎 Lampiran: {n.attachment}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 14. PRESTASI SISWA                                             */}
          {/* ============================================================== */}
          {activeMenu === 'prestasi-siswa' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Prestasi & Rekam Jejak Siswa Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kategori: Akademik, Olahraga, Seni, Organisasi, Kompetisi, Non-akademik.
                  </p>
                </div>
                <button
                  onClick={() => setAchievementModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Prestasi
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {achievementsData.map((a) => (
                  <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {a.category}
                      </span>
                      <span className="text-[10px] text-slate-400">{a.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{a.title}</h4>
                    <span className="text-xs font-black text-emerald-700">{a.rank} ({a.level})</span>
                    <span className="text-[10px] text-slate-500">Siswa: <strong>{a.student_name}</strong></span>
                    <span className="text-[10px] text-indigo-600 mt-1">📄 {a.proof_document}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 15. MONITORING KEDISIPLINAN & PEMBINAAN SISWA                   */}
          {/* ============================================================== */}
          {activeMenu === 'monitoring-kedisiplinan' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Monitoring Kedisiplinan & Pelanggaran Tata Tertib</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Pencatatan pelanggaran, poin, tindakan, dan tindak lanjut wali kelas.</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">Pelanggaran</th>
                      <th className="py-3 px-3 text-center">Poin</th>
                      <th className="py-3 px-3">Tanggal</th>
                      <th className="py-3 px-3">Tindakan / Sanksi</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {disciplineData?.violations_list?.map((v: any) => (
                      <tr key={v.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{v.student_name}</td>
                        <td className="py-3 px-3 text-slate-800">{v.violation_type}</td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600">+{v.points}</td>
                        <td className="py-3 px-3 text-slate-500">{v.date}</td>
                        <td className="py-3 px-3 text-slate-700">{v.action}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.status === 'Selesai'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'pembinaan-siswa' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Log Pembinaan Siswa Asuhan</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Konseling ringan, teguran empati, dan tindak lanjut wali kelas.</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {coachingData.map((c) => (
                  <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{c.student_name} — {c.type}</span>
                      <span className="text-[10px] text-slate-400">{c.date}</span>
                    </div>
                    <span className="text-xs text-slate-700"><strong>Masalah:</strong> {c.problem}</span>
                    <span className="text-xs text-slate-700"><strong>Tindakan:</strong> {c.action}</span>
                    <span className="text-xs text-slate-700"><strong>Hasil:</strong> {c.result}</span>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="text-indigo-600 font-bold">Follow-Up: {c.follow_up}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px]">{c.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 16. INTEGRASI BK & REFERRAL                                     */}
          {/* ============================================================== */}
          {activeMenu === 'referral-bk' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Integrasi & Rujukan Siswa ke BK</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wali Kelas dapat mengajukan rujukan untuk masalah yang memerlukan penanganan konselor profesional.
                  </p>
                </div>
                <button
                  onClick={() => setBkReferralModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Referral Baru
                </button>
              </div>

              {/* Notice Privasi Konseling Sensitif */}
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Shield className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-900 leading-relaxed">
                  {bkReferralsData?.privacy_notice || 'Catatan konseling sensitif/privat keluarga dirahasiakan oleh konselor BK. Wali Kelas menerima status alur dan rekomendasi pendampingan di kelas.'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {bkReferralsData?.referrals?.map((ref: any) => (
                  <div key={ref.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{ref.case_code} — {ref.student_name}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {ref.status}
                      </span>
                    </div>
                    <span className="text-xs text-slate-700"><strong>Alasan Rujukan:</strong> {ref.reason}</span>
                    <span className="text-xs text-slate-700"><strong>Konselor Ditugaskan:</strong> {ref.counselor}</span>
                    <span className="text-xs text-indigo-700 font-bold">Rekomendasi untuk Wali Kelas: {ref.recommendation_for_homeroom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 17. ORANG TUA: DAFTAR, KOMUNIKASI & RIWAYAT                     */}
          {/* ============================================================== */}
          {activeMenu === 'daftar-orang-tua' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Kontak Orang Tua & Wali Murid XI MIPA 1</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Hubungi orang tua secara langsung melalui WhatsApp atau panggilan suara.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parentsData.map((p) => (
                  <div key={p.student_id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{p.parent_name}</span>
                      <span className="text-[10px] text-slate-500">Orang Tua dari: <strong>{p.student_name}</strong></span>
                      <span className="text-[10px] text-slate-400 block mt-1">Kontak Terakhir: {p.last_contact}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${p.whatsapp}?text=Halo%20Bapak/Ibu%20${encodeURIComponent(p.parent_name)},%20saya%20Wali%20Kelas%20XI%20MIPA%201%20mengenai%20ananda%20${encodeURIComponent(p.student_name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'riwayat-komunikasi' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Riwayat Komunikasi dengan Orang Tua (Parent Logs)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Bukti histori percakapan, panggilan telepon, dan tindak lanjut.</p>
                </div>
                <button
                  onClick={() => setParentCommModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Catat Komunikasi
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {parentHistoryData.map((h) => (
                  <div key={h.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{h.student_name} — {h.parent_name}</span>
                      <span className="text-[10px] text-slate-400">{h.date}</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-700">Topik: {h.topic} ({h.channel})</span>
                    <p className="text-xs text-slate-600">{h.summary}</p>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Tindak Lanjut: {h.follow_up}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 18. PENGUMUMAN KELAS & NOTIFIKASI                              */}
          {/* ============================================================== */}
          {activeMenu === 'pengumuman-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengumuman Khusus Kelas XI MIPA 1</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Target: Semua Siswa, Semua Orang Tua, Siswa Tertentu, Orang Tua Tertentu.
                  </p>
                </div>
                <button
                  onClick={() => setAnnouncementModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Buat Pengumuman
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {announcementsData.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{ann.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {ann.target}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">{ann.content}</p>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Dipublikasikan: {ann.author} • {ann.date}</span>
                      <span className="font-bold text-slate-600">Dibaca: {ann.read_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeMenu === 'notifikasi' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-5 animate-in fade-in">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                Pemberitahuan & Notifikasi Otomatis Wali Kelas
              </h2>
              <div className="flex flex-col gap-2.5">
                {notificationsData.map((n) => (
                  <div key={n.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 19. RAPOR KELAS & FINALISASI WORKFLOW                          */}
          {/* ============================================================== */}
          {activeMenu === 'kelengkapan-nilai-rapor' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Kelengkapan Administrasi Rapor Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitoring nilai semua mapel, kehadiran rapor, dan kesiapan cetak.
                  </p>
                </div>
                <button
                  onClick={handleFinalizeReportCard}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Finalisasi & Ajukan ke Kepsek
                </button>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3">NIS</th>
                      <th className="py-3 px-3">Kelengkapan Nilai</th>
                      <th className="py-3 px-3">Catatan Wali Kelas</th>
                      <th className="py-3 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportCardsData?.student_report_status?.map((st: any) => (
                      <tr key={st.student_id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{st.name}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono">{st.nis}</td>
                        <td className="py-3 px-3 text-slate-700">{st.grade_completeness}</td>
                        <td className="py-3 px-3 text-slate-600">{st.homeroom_note}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              st.readiness === 'Siap Cetak'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {st.readiness}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'kenaikan-kelas' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Rekomendasi Kenaikan Kelas (Naik ke Kelas XII)</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Wali Kelas memberikan rekomendasi awal. Keputusan final disahkan melalui rapat pleno Dewan Guru & Kepala Sekolah.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-3">Nama Siswa</th>
                      <th className="py-3 px-3 text-center">Rata-rata</th>
                      <th className="py-3 px-3 text-center">Kehadiran</th>
                      <th className="py-3 px-3 text-center">Pelanggaran</th>
                      <th className="py-3 px-3">Rekomendasi Wali Kelas</th>
                      <th className="py-3 px-3">Pertimbangan / Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {promotionData.map((p) => (
                      <tr key={p.student_id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-bold text-slate-900">{p.name}</td>
                        <td className="py-3 px-3 text-center font-bold">{p.average}</td>
                        <td className="py-3 px-3 text-center">{p.attendance}</td>
                        <td className="py-3 px-3 text-center font-bold text-rose-600">{p.violation_points} Poin</td>
                        <td className="py-3 px-3 font-bold text-indigo-700">{p.recommendation}</td>
                        <td className="py-3 px-3 text-slate-600">{p.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeMenu === 'laporan-kelas-export' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pusat Laporan & Ekspor Berkas Kelas</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Unduh laporan resmi kelas dalam format PDF Kop Sekolah atau Excel (.xlsx).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Laporan Akademik & Leger Nilai</span>
                    <span className="text-[10px] text-slate-500">Rekap nilai seluruh mapel semester ganjil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Simulasi download Laporan Akademik PDF berhasil.')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => showToast('Simulasi download Leger Excel berhasil.')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
                    >
                      Excel
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Laporan Rekapitulasi Presensi</span>
                    <span className="text-[10px] text-slate-500">Hadir, sakit, izin, alfa, terlambat bulanan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Simulasi download Rekap Presensi PDF berhasil.')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer shadow-2xs"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => showToast('Simulasi download Presensi Excel berhasil.')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer shadow-2xs"
                    >
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 20. ANALYTICS & EARLY WARNING SYSTEM                            */}
          {/* ============================================================== */}
          {activeMenu === 'class-performance' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                Class Analytics & Metrik Kinerja Rombel XI MIPA 1
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Rata-rata Nilai</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1 block">83.4</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Tingkat Kehadiran</span>
                  <span className="text-2xl font-black text-emerald-600 mt-1 block">94.2%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Kasus Pelanggaran</span>
                  <span className="text-2xl font-black text-rose-600 mt-1 block">7 Kasus</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="text-xs text-slate-400 block">Tugas Selesai</span>
                  <span className="text-2xl font-black text-teal-600 mt-1 block">91.0%</span>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'early-warning-system' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">Early Warning System (EWS Siswa Berisiko)</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Klasifikasi otomatis siswa 🔴 High Risk, 🟡 Attention, dan 🟢 Stable.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* High Risk */}
                <div className="p-4 bg-rose-50/70 rounded-2xl border border-rose-100 flex flex-col gap-3">
                  <span className="text-xs font-black text-rose-800">
                    🔴 HIGH RISK (Prioritas 1 - Butuh Intervensi Panggilan Ortu & BK)
                  </span>
                  {earlyWarningData?.high_risk?.students?.map((s: any) => (
                    <div key={s.id} className="p-3 bg-white rounded-xl border border-rose-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{s.name} ({s.nis})</span>
                        <button
                          onClick={() => handleOpenStudent360(s.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 cursor-pointer"
                        >
                          Buka Profil 360°
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-600">Pemicu: {s.triggers?.join(' • ')}</span>
                      <span className="text-[10px] text-rose-700 font-bold">Rekomendasi: {s.recommendation}</span>
                    </div>
                  ))}
                </div>

                {/* Attention */}
                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100 flex flex-col gap-3">
                  <span className="text-xs font-black text-amber-800">
                    🟡 ATTENTION (Perhatian Khusus Wali Kelas)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {earlyWarningData?.attention?.students?.map((s: any) => (
                      <div key={s.id} className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col gap-1">
                        <span className="font-bold text-xs text-slate-900">{s.name}</span>
                        <span className="text-[10px] text-amber-700">{s.triggers?.join(', ')}</span>
                        <span className="text-[9px] text-slate-500 mt-1">{s.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stable */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 text-xs text-emerald-900 font-bold">
                  🟢 STABLE (30 Siswa): Dalam kondisi aman, kehadiran &gt; 90%, dan nilai akademik tuntas.
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 21. HOMEROOM PRIVATE NOTES (CONFIDENTIAL)                       */}
          {/* ============================================================== */}
          {activeMenu === 'homeroom-private-notes' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-600" />
                    Catatan Internal Rahasia Wali Kelas (Homeroom Confidential Notes)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Catatan observasi sensitif yang HANYA dapat diakses oleh Wali Kelas (tidak terlihat oleh siswa maupun orang tua).
                  </p>
                </div>
                <button
                  onClick={() => setPrivateNoteModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Catatan Rahasia
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {privateNotesData.map((pn) => (
                  <div key={pn.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">{pn.student_name}</span>
                      <span className="text-[10px] text-slate-400">{pn.date}</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-700">{pn.type}</span>
                    <p className="text-xs text-slate-700 leading-relaxed">{pn.content}</p>
                    <span className="text-[10px] text-slate-500 font-bold mt-1">Status: {pn.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* 22. PROFIL KEAMANAN & BANTUAN                                   */}
          {/* ============================================================== */}
          {activeMenu === 'profil-keamanan' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                Profil Guru Wali Kelas & Konteks Keamanan
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold">Identitas Resmi:</span>
                  <span className="text-sm font-black text-slate-900">{userProfileData?.name || 'Siti Aminah, M.Pd'}</span>
                  <span className="text-xs text-slate-600">NIP: {userProfileData?.nip || '198405122008012015'}</span>
                  <span className="text-xs text-slate-600">Kelas Asuhan: <strong>{userProfileData?.assigned_class || 'XI MIPA 1'}</strong></span>
                  <span className="text-xs text-slate-600">SK Wali Kelas: {userProfileData?.appointment_letter || 'SK Kepala Sekolah No. 421.3/089/SK-WAKEL/2026'}</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                  <span className="text-xs text-slate-400 font-bold">Status Dual-Role Context:</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                    Terdaftar sebagai Guru Pengajar & Wali Kelas
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {userProfileData?.dual_role_info?.hint || 'Anda dapat beralih antara mengajar mata pelajaran Biologi dan mengasuh rombel kelas XI MIPA 1 kapan saja.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'bantuan' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in">
              <h2 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4">
                Panduan SOP & FAQ Wali Kelas
              </h2>
              <div className="flex flex-col gap-3">
                {helpData?.faqs?.map((f: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-900">{f.q}</span>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MODAL: STUDENT 360° VIEW (11 TABS HOLISTIK)                    */}
      {/* ============================================================== */}
      {selectedStudent360Id && student360Data && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 md:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <img
                  src={student360Data.photo}
                  alt={student360Data.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-400"
                />
                <div>
                  <h3 className="text-lg font-black text-white">{student360Data.name}</h3>
                  <span className="text-xs text-slate-300">
                    {student360Data.class} • NIS: {student360Data.nis} • Status: <strong className="text-amber-300">{student360Data.summary?.status}</strong>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent360Id(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 11 Tabs Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto p-2 bg-slate-100 border-b border-slate-200 shrink-0 text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'akademik', label: 'Akademik' },
                { id: 'presensi', label: 'Presensi' },
                { id: 'tugas', label: 'Tugas' },
                { id: 'prestasi', label: 'Prestasi' },
                { id: 'pelanggaran', label: 'Pelanggaran' },
                { id: 'bk', label: 'BK' },
                { id: 'catatan_wali_kelas', label: 'Catatan Wali Kelas' },
                { id: 'orang_tua', label: 'Orang Tua' },
                { id: 'dokumen', label: 'Dokumen' },
                { id: 'riwayat', label: 'Riwayat' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStudent360Tab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-all ${
                    student360Tab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0 text-xs">
              {student360Tab === 'overview' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-slate-400 text-[10px] block">Kehadiran</span>
                      <span className="text-lg font-black text-rose-600">{student360Data.summary?.attendance_pct}%</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-slate-400 text-[10px] block">Rata-rata Nilai</span>
                      <span className="text-lg font-black text-rose-600">{student360Data.summary?.average_score}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-slate-400 text-[10px] block">Tugas Selesai</span>
                      <span className="text-lg font-black text-slate-800">{student360Data.summary?.assignments_ratio}</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <span className="text-slate-400 text-[10px] block">Poin Pelanggaran</span>
                      <span className="text-lg font-black text-rose-600">{student360Data.summary?.violation_points} Poin</span>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-900">
                    <strong className="block text-xs mb-1">Catatan Singkat Siswa:</strong>
                    {student360Data.tabs?.overview?.quick_notes}
                  </div>
                </div>
              )}

              {student360Tab === 'akademik' && (
                <div className="flex flex-col gap-4">
                  <span className="font-bold text-slate-900 text-sm">Nilai Mata Pelajaran:</span>
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 font-bold text-slate-500">
                        <tr>
                          <th className="py-2.5 px-3">Mapel</th>
                          <th className="py-2.5 px-3 text-center">Tugas</th>
                          <th className="py-2.5 px-3 text-center">Quiz</th>
                          <th className="py-2.5 px-3 text-center">UTS</th>
                          <th className="py-2.5 px-3 text-center">Akhir</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {student360Data.tabs?.akademik?.subjects_performance?.map((sub: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-semibold text-slate-800">{sub.subject}</td>
                            <td className="py-2 px-3 text-center">{sub.tugas}</td>
                            <td className="py-2 px-3 text-center">{sub.quiz}</td>
                            <td className="py-2 px-3 text-center">{sub.uts}</td>
                            <td className="py-2 px-3 text-center font-bold text-slate-900">{sub.final}</td>
                            <td className="py-2 px-3 text-center font-bold text-rose-600">{sub.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {student360Tab === 'presensi' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl">Hadir: <strong>{student360Data.tabs?.presensi?.hadir}</strong></div>
                    <div className="p-3 bg-amber-50 rounded-xl">Sakit: <strong>{student360Data.tabs?.presensi?.sakit}</strong></div>
                    <div className="p-3 bg-blue-50 rounded-xl">Izin: <strong>{student360Data.tabs?.presensi?.izin}</strong></div>
                    <div className="p-3 bg-rose-50 rounded-xl">Alfa: <strong>{student360Data.tabs?.presensi?.alfa}</strong></div>
                  </div>
                </div>
              )}

              {student360Tab === 'bk' && (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <span className="font-bold text-indigo-900 block text-xs">Status Rujukan BK:</span>
                    <span className="text-slate-800 mt-1 block">{student360Data.tabs?.bk?.public_followup}</span>
                    <span className="text-[10px] text-slate-500 mt-2 block font-medium">🔒 {student360Data.tabs?.bk?.sensitive_note_status}</span>
                  </div>
                </div>
              )}

              {student360Tab === 'orang_tua' && (
                <div className="flex flex-col gap-3">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block">Ayah: {student360Data.tabs?.orang_tua?.father_name}</span>
                    <span className="text-xs text-slate-600 block mt-1">Telepon: {student360Data.tabs?.orang_tua?.phone}</span>
                    <span className="text-xs text-slate-600 block">Alamat: {student360Data.tabs?.orang_tua?.address}</span>
                  </div>
                </div>
              )}

              {student360Tab === 'riwayat' && (
                <div className="flex flex-col gap-3">
                  {student360Data.tabs?.riwayat?.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-indigo-700 block">{r.period}</span>
                      <p className="text-slate-700 mt-1">{r.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400">Profil Siswa 360° Terintegrasi</span>
              <button
                onClick={() => setSelectedStudent360Id(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: KOREKSI PRESENSI DENGAN AUDIT LOG                       */}
      {/* ============================================================== */}
      {correctionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Form Koreksi Presensi Siswa</h3>
              <button onClick={() => setCorrectionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Siswa:</label>
                <input
                  type="text"
                  readOnly
                  value={correctionForm.student_name}
                  className="w-full p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-slate-700 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Awal:</label>
                  <input
                    type="text"
                    readOnly
                    value={correctionForm.old_status}
                    className="w-full p-2.5 bg-slate-100 rounded-xl border border-slate-200 text-rose-600 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Koreksi Menjadi:</label>
                  <select
                    value={correctionForm.new_status}
                    onChange={(e) => setCorrectionForm({ ...correctionForm, new_status: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                  >
                    <option value="Hadir">Hadir</option>
                    <option value="Sakit">Sakit (Ada Surat Dokter)</option>
                    <option value="Izin">Izin (Ada Surat Izin Sah)</option>
                    <option value="Dispensasi">Dispensasi Tugas Sekolah</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Koreksi (Wajib Masuk Audit Log):</label>
                <textarea
                  rows={3}
                  value={correctionForm.reason}
                  onChange={(e) => setCorrectionForm({ ...correctionForm, reason: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  placeholder="Jelaskan alasan koreksi secara rinci..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCorrectionModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Simpan & Rekam Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: INPUT CATATAN SISWA                                     */}
      {/* ============================================================== */}
      {noteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Tambah Catatan Siswa Wali Kelas</h3>
              <button onClick={() => setNoteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Siswa:</label>
                <select
                  value={noteForm.student_name}
                  onChange={(e) => setNoteForm({ ...noteForm, student_name: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="Ahmad Fauzi">Ahmad Fauzi (20241101)</option>
                  <option value="Nadia Syahrini">Nadia Syahrini (20241102)</option>
                  <option value="Rian Hidayat">Rian Hidayat (20241103)</option>
                  <option value="Citra Lestari">Citra Lestari (20241104)</option>
                  <option value="Dimas Arya">Dimas Arya (20241105)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori (8 Kategori):</label>
                  <select
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="Akademik">Akademik</option>
                    <option value="Kehadiran">Kehadiran</option>
                    <option value="Kedisiplinan">Kedisiplinan</option>
                    <option value="Sosial">Sosial</option>
                    <option value="Perilaku">Perilaku</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Perkembangan pribadi">Perkembangan pribadi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas:</label>
                  <select
                    value={noteForm.priority}
                    onChange={(e) => setNoteForm({ ...noteForm, priority: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Catatan Perkembangan:</label>
                <textarea
                  rows={4}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  placeholder="Tuliskan hasil observasi, wawancara, atau perkembangan siswa..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setNoteModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: REFERRAL KE BK                                          */}
      {/* ============================================================== */}
      {bkReferralModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Rujuk Siswa ke Bimbingan Konseling (BK)</h3>
              <button onClick={() => setBkReferralModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Siswa yang Dirujuk:</label>
                <input
                  type="text"
                  readOnly
                  value={bkReferralForm.student_name}
                  className="w-full p-2.5 bg-slate-100 rounded-xl border border-slate-200 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Urgensi:</label>
                <select
                  value={bkReferralForm.urgency}
                  onChange={(e) => setBkReferralForm({ ...bkReferralForm, urgency: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                >
                  <option value="Tinggi (Perlu Panggilan Ortu Segera)">Tinggi (Perlu Panggilan Ortu Segera)</option>
                  <option value="Sedang (Konseling Penurunan Nilai)">Sedang (Konseling Penurunan Nilai)</option>
                  <option value="Ringan (Konseling Motivasi Belajar)">Ringan (Konseling Motivasi Belajar)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Rujukan:</label>
                <textarea
                  rows={3}
                  value={bkReferralForm.reason}
                  onChange={(e) => setBkReferralForm({ ...bkReferralForm, reason: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  placeholder="Jelaskan kendala siswa..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setBkReferralModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveBkReferral}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Kirim Rujukan ke BK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PENGUMUMAN KELAS                                        */}
      {/* ============================================================== */}
      {announcementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Buat Pengumuman Kelas Baru</h3>
              <button onClick={() => setAnnouncementModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  placeholder="Contoh: Pengingat Ujian PTS & Perlengkapan Belajar"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audiens:</label>
                <select
                  value={announcementForm.target}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, target: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                >
                  <option value="Semua Siswa & Orang Tua">Semua Siswa & Orang Tua</option>
                  <option value="Semua Siswa">Hanya Semua Siswa</option>
                  <option value="Semua Orang Tua">Hanya Semua Orang Tua</option>
                  <option value="Siswa Tertentu (Remedial)">Siswa Tertentu (Remedial)</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Pengumuman:</label>
                <textarea
                  rows={4}
                  value={announcementForm.content}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                  className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-slate-800"
                  placeholder="Tuliskan isi pengumuman kelas..."
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setAnnouncementModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveAnnouncement}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-xs"
              >
                Publikasikan Pengumuman
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
