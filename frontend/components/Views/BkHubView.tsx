'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  Brain,
  HeartHandshake,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  CalendarPlus,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  FileText,
  FileSpreadsheet,
  FileDown,
  Printer,
  Share2,
  Phone,
  PhoneCall,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  BookOpen,
  Award,
  Compass,
  HelpCircle,
  User as UserIcon,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchBkDashboard,
  fetchBkStudents,
  fetchBkStudentProfile,
  fetchBkCases,
  saveBkCase,
  updateBkCase,
  fetchBkReferrals,
  actionBkReferral,
  fetchBkIndividualSessions,
  saveBkIndividualSession,
  fetchBkGroupSessions,
  fetchBkSchedule,
  fetchBkBookings,
  actionBkBooking,
  fetchBkAssessments,
  fetchBkSelfAssessments,
  fetchBkInterventions,
  fetchBkFollowUps,
  saveBkFollowUp,
  fetchBkStudentProgress,
  fetchBkObservations,
  fetchBkStudentCommunications,
  fetchBkParentCommunications,
  fetchBkHomeroomCoordination,
  fetchBkTeacherCoordination,
  fetchBkStudentSupportPlans,
  fetchBkEarlyWarning,
  verifyBkEarlyWarning,
  fetchBkCareerAndTalents,
  fetchBkPrograms,
  fetchBkBullyingCases,
  fetchBkDisciplineReferrals,
  fetchBkDocumentsAndConsents,
  fetchBkPrivacyAndAudit,
  fetchBkReportsAndAnalytics,
  fetchBkExternalReferrals,
  fetchBkEmergencyCases,
  fetchBkNotifications,
  searchBk,
  fetchBkProfile,
  fetchBkHelp,
} from '@/lib/api';

export type BkMenuKey =
  | 'dashboard'
  // Siswa
  | 'daftar-siswa'
  | 'student-profile'
  | 'student-progress'
  | 'early-warning'
  // Konseling
  | 'cases'
  | 'counseling-sessions'
  | 'konseling-individu'
  | 'konseling-kelompok'
  | 'jadwal-konseling'
  | 'booking'
  // Assessment
  | 'assessment'
  | 'assessment-library'
  | 'hasil-assessment'
  | 'self-assessment'
  // Intervensi
  | 'intervention-plan'
  | 'follow-up'
  | 'student-support-plan'
  // Referral
  | 'referral-masuk'
  | 'referral-keluar'
  | 'referral-history'
  // Orang Tua
  | 'komunikasi-ortu'
  | 'parent-meeting'
  | 'communication-history'
  // Karier
  | 'minat-bakat'
  | 'career-counseling'
  | 'study-planning'
  // Program BK
  | 'program'
  | 'kegiatan'
  | 'evaluasi'
  // Monitoring
  | 'case-monitoring'
  | 'student-risk'
  | 'analytics'
  // Laporan
  | 'case-report'
  | 'counseling-report'
  | 'program-report'
  | 'laporan-agregat'
  // Dokumen
  | 'dokumen-bk'
  | 'case-documents'
  // Fitur Khusus & Privacy
  | 'privacy-model'
  | 'audit-log'
  | 'bullying-case'
  | 'emergency-case'
  | 'discipline-referral'
  | 'notifikasi'
  | 'profil'
  | 'bantuan';

interface BkHubViewProps {
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export default function BkHubView({ currentUser, onNavigateTab }: BkHubViewProps) {
  const [activeMenu, setActiveMenu] = useState<BkMenuKey>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [notificationCount, setNotificationCount] = useState(4);

  // Data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(1);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<string>('overview');

  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({
    student_name: '',
    class: 'XI MIPA 1',
    category: 'Akademik & Regulasi Diri',
    priority: 'Monitoring',
    referral_source: 'Wali Kelas',
    summary: '',
    confidentiality_level: 'Level 1 (Internal BK)',
  });

  const [referrals, setReferrals] = useState<any>({ incoming: [], outgoing: [] });
  const [individualSessions, setIndividualSessions] = useState<any[]>([]);
  const [groupSessions, setGroupSessions] = useState<any[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [assessmentsData, setAssessmentsData] = useState<any>({ library: [], results: [] });
  const [selfAssessments, setSelfAssessments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [followUpsData, setFollowUpsData] = useState<any>({ follow_ups: [], reminders: [] });
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [observations, setObservations] = useState<any[]>([]);
  const [studentComms, setStudentComms] = useState<any[]>([]);
  const [parentComms, setParentComms] = useState<any>({ logs: [], meetings: [] });
  const [homeroomCoord, setHomeroomCoord] = useState<any[]>([]);
  const [teacherCoord, setTeacherCoord] = useState<any[]>([]);
  const [supportPlans, setSupportPlans] = useState<any[]>([]);
  const [earlyWarnings, setEarlyWarnings] = useState<any[]>([]);
  const [careerData, setCareerData] = useState<any>({ career_profiles: [], talents: [] });
  const [programs, setPrograms] = useState<any[]>([]);
  const [bullyingCases, setBullyingCases] = useState<any[]>([]);
  const [disciplineReferrals, setDisciplineReferrals] = useState<any[]>([]);
  const [docsAndConsents, setDocsAndConsents] = useState<any>({ documents: [], consents: [] });
  const [privacyAudit, setPrivacyAudit] = useState<any>({ confidentiality_levels: [], collaboration_matrix: [], audit_logs: [] });
  const [reportsAnalytics, setReportsAnalytics] = useState<any>({ analytics: null, reports_list: [] });
  const [externalReferrals, setExternalReferrals] = useState<any[]>([]);
  const [emergencyCases, setEmergencyCases] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [counselorProfile, setCounselorProfile] = useState<any>(null);
  const [helpData, setHelpData] = useState<any>(null);

  // Modals
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    student_name: 'Ahmad Fauzi',
    date: new Date().toISOString().split('T')[0],
    time: '09:00 - 09:45',
    goal: '',
    summary: '',
    confidentiality_level: 'Level 1 (Internal BK)',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchBkDashboard(),
      fetchBkStudents(),
      fetchBkStudentProfile(1),
      fetchBkCases(),
      fetchBkReferrals(),
      fetchBkIndividualSessions(),
      fetchBkGroupSessions(),
      fetchBkSchedule(),
      fetchBkBookings(),
      fetchBkAssessments(),
      fetchBkSelfAssessments(),
      fetchBkInterventions(),
      fetchBkFollowUps(),
      fetchBkStudentProgress(),
      fetchBkObservations(),
      fetchBkEarlyWarning(),
      fetchBkCareerAndTalents(),
      fetchBkPrograms(),
      fetchBkBullyingCases(),
      fetchBkDisciplineReferrals(),
      fetchBkDocumentsAndConsents(),
      fetchBkPrivacyAndAudit(),
      fetchBkReportsAndAnalytics(),
      fetchBkEmergencyCases(),
      fetchBkNotifications(),
      fetchBkProfile(),
      fetchBkHelp(),
      fetchBkHomeroomCoordination(),
      fetchBkTeacherCoordination(),
      fetchBkStudentSupportPlans(),
      fetchBkParentCommunications(),
      fetchBkStudentCommunications(),
      fetchBkExternalReferrals(),
    ])
      .then(
        ([
          dash,
          stud,
          prof,
          cs,
          ref,
          indSess,
          grpSess,
          sch,
          bkg,
          asm,
          selfAsm,
          intv,
          flw,
          prog,
          obs,
          ew,
          car,
          prg,
          bl,
          disc,
          doc,
          priv,
          rep,
          emg,
          notf,
          pfl,
          hlp,
          hrCoord,
          tcCoord,
          ssp,
          pComm,
          sComm,
          extRef,
        ]) => {
          if (dash?.success) setDashboardData(dash);
          if (stud?.success) setStudents(stud.students || []);
          if (prof?.success) setStudentProfile(prof.profile);
          if (cs?.success) setCases(cs.cases || []);
          if (ref?.success) setReferrals(ref);
          if (indSess?.success) setIndividualSessions(indSess.sessions || []);
          if (grpSess?.success) setGroupSessions(grpSess.groups || []);
          if (sch?.success) setScheduleEvents(sch.events || []);
          if (bkg?.success) setBookings(bkg.bookings || []);
          if (asm?.success) setAssessmentsData(asm);
          if (selfAsm?.success) setSelfAssessments(selfAsm.submissions || []);
          if (intv?.success) setInterventions(intv.interventions || []);
          if (flw?.success) setFollowUpsData(flw);
          if (prog?.success) setStudentProgress(prog.progress || []);
          if (obs?.success) setObservations(obs.observations || []);
          if (ew?.success) setEarlyWarnings(ew.alerts || []);
          if (car?.success) setCareerData(car);
          if (prg?.success) setPrograms(prg.programs || []);
          if (bl?.success) setBullyingCases(bl.cases || []);
          if (disc?.success) setDisciplineReferrals(disc.referrals || []);
          if (doc?.success) setDocsAndConsents(doc);
          if (priv?.success) setPrivacyAudit(priv);
          if (rep?.success) setReportsAnalytics(rep);
          if (emg?.success) setEmergencyCases(emg.emergencies || []);
          if (notf?.success) setNotifications(notf.notifications || []);
          if (pfl?.success) setCounselorProfile(pfl.counselor);
          if (hlp?.success) setHelpData(hlp);
          if (hrCoord?.success) setHomeroomCoord(hrCoord.coordinations || []);
          if (tcCoord?.success) setTeacherCoord(tcCoord.records || []);
          if (ssp?.success) setSupportPlans(ssp.support_plans || []);
          if (pComm?.success) setParentComms(pComm);
          if (sComm?.success) setStudentComms(sComm.communications || []);
          if (extRef?.success) setExternalReferrals(extRef.external_referrals || []);
        }
      )
      .catch((err: any) => {
        console.error('Error fetching BK data:', err);
        toast.error('Gagal memuat data BK. Silakan coba lagi.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle case create
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseForm.student_name || !newCaseForm.summary) return;

    try {
      const res = await saveBkCase(newCaseForm);
      if (res?.success) {
        showToast(res.message || 'Kasus BK berhasil dibuka.');
        setIsNewCaseModalOpen(false);
        setNewCaseForm({
          student_name: '',
          class: 'XI MIPA 1',
          category: 'Akademik & Regulasi Diri',
          priority: 'Monitoring',
          referral_source: 'Wali Kelas',
          summary: '',
          confidentiality_level: 'Level 1 (Internal BK)',
        });
        const fresh = await fetchBkCases();
        if (fresh?.success) setCases(fresh.cases || []);
      }
    } catch {
      showToast('Gagal membuat kasus baru.');
    }
  };

  // Handle session note create
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveBkIndividualSession(newSessionForm);
      if (res?.success) {
        showToast(res.message || 'Catatan sesi tersimpan.');
        setIsNewSessionModalOpen(false);
      }
    } catch {
      showToast('Gagal menyimpan sesi konseling.');
    }
  };

  // Handle referral action
  const handleReferralAction = async (id: string, action: string) => {
    try {
      const res = await actionBkReferral(id, action);
      if (res?.success) {
        showToast(`Referral ${id} berhasil di-${action}`);
        const fresh = await fetchBkReferrals();
        if (fresh?.success) setReferrals(fresh);
      }
    } catch {
      showToast('Gagal memproses referral.');
    }
  };

  // Handle booking action
  const handleBookingAction = async (id: string, action: string) => {
    try {
      const res = await actionBkBooking(id, action);
      if (res?.success) {
        showToast(`Booking ${id} status: ${action}`);
        const fresh = await fetchBkBookings();
        if (fresh?.success) setBookings(fresh.bookings || []);
      }
    } catch {
      showToast('Gagal memproses booking konseling.');
    }
  };

  // Handle EWS verification
  const handleVerifyEws = async (id: string, createCase: boolean) => {
    try {
      const res = await verifyBkEarlyWarning(id, { create_case: createCase });
      if (res?.success) {
        showToast(res.message);
        const fresh = await fetchBkEarlyWarning();
        if (fresh?.success) setEarlyWarnings(fresh.alerts || []);
      }
    } catch {
      showToast('Gagal memverifikasi risiko siswa.');
    }
  };

  // Quick Action Handler
  const handleQuickAction = (actionId: string) => {
    if (actionId === 'create-case') setIsNewCaseModalOpen(true);
    else if (actionId === 'schedule-session') setActiveMenu('jadwal-konseling');
    else if (actionId === 'create-session-note') setIsNewSessionModalOpen(true);
    else if (actionId === 'create-referral') setActiveMenu('referral-keluar');
    else if (actionId === 'add-followup') setActiveMenu('follow-up');
    else if (actionId === 'contact-parent') setActiveMenu('komunikasi-ortu');
    else if (actionId === 'view-students') setActiveMenu('daftar-siswa');
  };

  // Open student profile
  const handleOpenStudent = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setActiveMenu('student-profile');
    try {
      const res = await fetchBkStudentProfile(studentId);
      if (res?.success) {
        setStudentProfile(res.profile);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Render Status Badge helper
  const renderStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('urgent') || s.includes('high attention') || s.includes('tinggi')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
          {status}
        </span>
      );
    }
    if (s.includes('intervention') || s.includes('sedang')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
          {status}
        </span>
      );
    }
    if (s.includes('monitoring') || s.includes('assessment')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          {status}
        </span>
      );
    }
    if (s.includes('resolved') || s.includes('closed') || s.includes('completed') || s.includes('normal')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
        {status}
      </span>
    );
  };

  // Render Confidentiality Level Badge
  const renderConfidentialityBadge = (level: string) => {
    if ((level || '').includes('1')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <Lock className="w-3 h-3 text-rose-600" />
          {level || 'Level 1 — Internal BK'}
        </span>
      );
    }
    if ((level || '').includes('2')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <ShieldAlert className="w-3 h-3 text-amber-600" />
          {level || 'Level 2 — Restricted'}
        </span>
      );
    }
    if ((level || '').includes('3')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Share2 className="w-3 h-3 text-blue-600" />
          {level || 'Level 3 — Coordinated'}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-50 text-slate-700 border border-slate-200">
        <Eye className="w-3 h-3 text-slate-500" />
        {level || 'Level 4 — Administrative'}
      </span>
    );
  };

  // Sidebar Menu Items Definition (Matching exact requirements)
  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { key: 'dashboard', label: 'Dashboard BK', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      title: 'SISWA',
      items: [
        { key: 'daftar-siswa', label: 'Daftar Siswa', icon: Users, badge: students.length },
        { key: 'student-profile', label: 'Student Profile (10 Tabs)', icon: UserIcon, badge: null },
        { key: 'student-progress', label: 'Student Progress', icon: TrendingUp, badge: null },
        { key: 'early-warning', label: 'Early Warning (EWS)', icon: AlertTriangle, badge: earlyWarnings.length },
      ],
    },
    {
      title: 'KONSELING',
      items: [
        { key: 'cases', label: 'Cases (Case Management)', icon: ShieldCheck, badge: cases.length },
        { key: 'counseling-sessions', label: 'Counseling Sessions', icon: Clock, badge: null },
        { key: 'konseling-individu', label: 'Konseling Individu', icon: Brain, badge: individualSessions.length },
        { key: 'konseling-kelompok', label: 'Konseling Kelompok', icon: HeartHandshake, badge: groupSessions.length },
        { key: 'jadwal-konseling', label: 'Jadwal Konseling', icon: Calendar, badge: scheduleEvents.length },
        { key: 'booking', label: 'Booking Konseling', icon: CalendarPlus, badge: bookings.filter((b) => b.status === 'Pending').length },
      ],
    },
    {
      title: 'ASSESSMENT',
      items: [
        { key: 'assessment', label: 'Assessment & Hasil', icon: FileText, badge: null },
        { key: 'assessment-library', label: 'Assessment Library', icon: BookOpen, badge: assessmentsData.library?.length },
        { key: 'hasil-assessment', label: 'Hasil Assessment', icon: Award, badge: null },
        { key: 'self-assessment', label: 'Self-Assessment Siswa', icon: Activity, badge: selfAssessments.length },
      ],
    },
    {
      title: 'INTERVENSI',
      items: [
        { key: 'intervention-plan', label: 'Intervention Plan', icon: Sparkles, badge: interventions.length },
        { key: 'follow-up', label: 'Follow-up Management', icon: Clock, badge: followUpsData.follow_ups?.length },
        { key: 'student-support-plan', label: 'Student Support Plan', icon: Shield, badge: supportPlans.length },
      ],
    },
    {
      title: 'REFERRAL',
      items: [
        { key: 'referral-masuk', label: 'Referral Masuk', icon: ChevronRight, badge: referrals.incoming?.length },
        { key: 'referral-keluar', label: 'Referral Keluar (Eksternal)', icon: ArrowUpRight, badge: referrals.outgoing?.length },
        { key: 'referral-history', label: 'Referral Workflow & History', icon: Clock, badge: null },
      ],
    },
    {
      title: 'ORANG TUA',
      items: [
        { key: 'komunikasi-ortu', label: 'Komunikasi Orang Tua', icon: Phone, badge: null },
        { key: 'parent-meeting', label: 'Parent Meeting', icon: Users, badge: parentComms.meetings?.length },
        { key: 'communication-history', label: 'Riwayat Komunikasi', icon: MessageSquare, badge: null },
      ],
    },
    {
      title: 'KARIER & STUDI',
      items: [
        { key: 'minat-bakat', label: 'Minat & Bakat', icon: Award, badge: null },
        { key: 'career-counseling', label: 'Career Counseling', icon: Compass, badge: null },
        { key: 'study-planning', label: 'Study Planning (Kuliah)', icon: GraduationCap, badge: null },
      ],
    },
    {
      title: 'PROGRAM BK',
      items: [
        { key: 'program', label: 'Program Preventif BK', icon: BookOpen, badge: programs.length },
        { key: 'kegiatan', label: 'Monitoring Kegiatan', icon: Calendar, badge: null },
        { key: 'evaluasi', label: 'Evaluasi Efektivitas', icon: TrendingUp, badge: null },
      ],
    },
    {
      title: 'MONITORING & RISIKO',
      items: [
        { key: 'case-monitoring', label: 'Case Monitoring', icon: Eye, badge: null },
        { key: 'student-risk', label: 'Student Risk Dashboard', icon: AlertOctagon, badge: null },
        { key: 'analytics', label: 'BK Analytics', icon: TrendingUp, badge: null },
      ],
    },
    {
      title: 'LAPORAN',
      items: [
        { key: 'case-report', label: 'Case Report', icon: FileText, badge: null },
        { key: 'counseling-report', label: 'Counseling Report', icon: FileSpreadsheet, badge: null },
        { key: 'program-report', label: 'Program Report', icon: FileText, badge: null },
        { key: 'laporan-agregat', label: 'Laporan Agregat (Kepsek)', icon: Award, badge: null },
      ],
    },
    {
      title: 'DOKUMEN & PRIVACY',
      items: [
        { key: 'dokumen-bk', label: 'Dokumen BK (Private Storage)', icon: Lock, badge: docsAndConsents.documents?.length },
        { key: 'case-documents', label: 'Persetujuan / Consent', icon: FileCheckIcon, badge: docsAndConsents.consents?.length },
        { key: 'privacy-model', label: 'Privacy Model & Matrix', icon: ShieldCheck, badge: null },
        { key: 'audit-log', label: 'Audit Log & Access History', icon: Eye, badge: privacyAudit.audit_logs?.length },
        { key: 'bullying-case', label: 'Bullying / Peer Conflict', icon: ShieldAlert, badge: bullyingCases.length },
        { key: 'emergency-case', label: 'Emergency / Urgent Protocol', icon: AlertOctagon, badge: emergencyCases.length },
        { key: 'discipline-referral', label: 'Discipline Referral', icon: AlertTriangle, badge: disciplineReferrals.length },
      ],
    },
    {
      title: 'AKUN & PANDUAN',
      items: [
        { key: 'notifikasi', label: 'Notification Center', icon: MessageSquare, badge: notifications.filter((n) => n.unread).length },
        { key: 'profil', label: 'Profil & Security 2FA', icon: UserIcon, badge: null },
        { key: 'bantuan', label: 'Help & SOP Panduan BK', icon: HelpCircle, badge: null },
      ],
    },
  ];

  function FileCheckIcon(props: any) {
    return <FileText {...props} />;
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 items-start">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LEFT NAVIGATION SIDEBAR */}
      <aside className="w-full lg:w-72 shrink-0 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm flex flex-col gap-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
        {/* Role Identity Badge */}
        <div className="p-3.5 bg-gradient-to-br from-rose-50 to-indigo-50 rounded-2xl border border-rose-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-wider font-extrabold text-rose-600">
              Role: Konselor BK
            </div>
            <div className="text-xs font-bold text-slate-900 truncate">
              {counselorProfile?.name || 'Nurul Hidayah, S.Psi'}
            </div>
            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
              <Lock className="w-2.5 h-2.5 text-rose-500" />
              <span>Need-to-Know Access Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Categories */}
        <nav className="flex flex-col gap-4 text-xs">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveMenu(item.key as BkMenuKey)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== null && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Privacy Notice Banner */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Prinsip Need-to-Know</span>
          </div>
          Data konseling bersifat rahasia. Akses, perubahan data, dan pembagian ringkasan dicatat dalam audit trail permanen.
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 w-full flex flex-col gap-6">
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Terpadu Bimbingan & Konseling Sekolah</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <span>Layanan Bimbingan & Konseling (BK)</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                46 Fitur Terverifikasi
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Penanganan terstruktur mencakup konseling individu/kelompok, asesmen, EWS deteksi dini, koordinasi wali kelas, kolaborasi orang tua, hingga rekapitulasi pelaporan dengan standar kerahasiaan ketat.
            </p>
          </div>

          {/* Header Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kasus BK</span>
            </button>
            <button
              onClick={() => setIsNewSessionModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Catatan Sesi Baru</span>
            </button>
            <button
              onClick={() => setActiveMenu('audit-log')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              title="Lihat Log Audit Akses Data"
            >
              <Shield className="w-4 h-4 text-slate-500" />
              <span>Audit Log</span>
            </button>
          </div>
        </div>

        {/* 1. DASHBOARD BK */}
        {activeMenu === 'dashboard' && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-150">
            {/* 8 Ringkasan Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Siswa Terdaftar</span>
                <span className="text-2xl font-black text-slate-900">{dashboardData?.summary?.total_students || 480}</span>
                <span className="text-[10px] text-slate-500">Populasi terlayani</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-sm flex flex-col gap-1 bg-gradient-to-br from-rose-50/40 to-white">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Dalam Penanganan BK</span>
                <span className="text-2xl font-black text-rose-700">{dashboardData?.summary?.students_in_handling || 18}</span>
                <span className="text-[10px] text-rose-500">Siswa aktif dibina</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-blue-200 shadow-sm flex flex-col gap-1 bg-gradient-to-br from-blue-50/40 to-white">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Kasus Aktif</span>
                <span className="text-2xl font-black text-blue-700">{dashboardData?.summary?.active_cases || 12}</span>
                <span className="text-[10px] text-blue-500">Kasus belum ditutup</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-emerald-200 shadow-sm flex flex-col gap-1 bg-gradient-to-br from-emerald-50/40 to-white">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Kasus Selesai</span>
                <span className="text-2xl font-black text-emerald-700">{dashboardData?.summary?.resolved_cases || 24}</span>
                <span className="text-[10px] text-emerald-500">Tuntas & stabil</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-indigo-200 shadow-sm flex flex-col gap-1">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Sesi Konseling Hari Ini</span>
                <span className="text-2xl font-black text-indigo-700">{dashboardData?.summary?.today_sessions || 3}</span>
                <span className="text-[10px] text-slate-500">Terjadwal di kalender</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-amber-200 shadow-sm flex flex-col gap-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Referral Masuk</span>
                <span className="text-2xl font-black text-amber-700">{dashboardData?.summary?.incoming_referrals || 5}</span>
                <span className="text-[10px] text-amber-600">Perlu ditinjau</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-rose-200 shadow-sm flex flex-col gap-1">
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Follow-up Jatuh Tempo</span>
                <span className="text-2xl font-black text-rose-700">{dashboardData?.summary?.overdue_followups || 2}</span>
                <span className="text-[10px] text-rose-600">Perlu diverifikasi</span>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-purple-200 shadow-sm flex flex-col gap-1">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Kasus Prioritas</span>
                <span className="text-2xl font-black text-purple-700">{dashboardData?.summary?.priority_cases || 3}</span>
                <span className="text-[10px] text-purple-600">Urgent & High Attention</span>
              </div>
            </div>

            {/* 5 Status Penanganan Administratif (Bukan Diagnosis Psikologis) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Distribusi Status Penanganan Siswa (Administrative Case Status)</h3>
                  <p className="text-xs text-slate-500">Status penanganan administratif, bukan diagnosis psikologis klinis.</p>
                </div>
                <span className="text-[11px] font-bold text-slate-500">
                  Total: {dashboardData?.summary?.total_students || 480} Siswa Terpetakan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">🟢 Normal</span>
                    <span className="text-sm font-black text-emerald-800">
                      {dashboardData?.case_status_distribution?.normal?.count || 418}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700">Kondisi stabil, pemantauan berkala</span>
                </div>
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900">🔵 Monitoring</span>
                    <span className="text-sm font-black text-blue-800">
                      {dashboardData?.case_status_distribution?.monitoring?.count || 34}
                    </span>
                  </div>
                  <span className="text-[10px] text-blue-700">Dalam pantauan berkala BK</span>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900">🟡 Intervention</span>
                    <span className="text-sm font-black text-amber-800">
                      {dashboardData?.case_status_distribution?.intervention?.count || 18}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700">Dalam rencana aksi aktif</span>
                </div>
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-orange-900">🟠 High Attention</span>
                    <span className="text-sm font-black text-orange-800">
                      {dashboardData?.case_status_distribution?.high_attention?.count || 7}
                    </span>
                  </div>
                  <span className="text-[10px] text-orange-700">Perhatian intensif lintas pihak</span>
                </div>
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">🔴 Urgent</span>
                    <span className="text-sm font-black text-rose-800">
                      {dashboardData?.case_status_distribution?.urgent?.count || 3}
                    </span>
                  </div>
                  <span className="text-[10px] text-rose-700">Tindakan segera & protokol darurat</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Actions (Aksi Cepat Konselor)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {[
                  { id: 'create-case', label: 'Buat Kasus', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100' },
                  { id: 'schedule-session', label: 'Jadwalkan Konseling', icon: CalendarPlus, color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' },
                  { id: 'create-session-note', label: 'Catatan Sesi', icon: FileText, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
                  { id: 'create-referral', label: 'Buat Referral', icon: ArrowUpRight, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                  { id: 'add-followup', label: 'Tambah Follow-up', icon: Clock, color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
                  { id: 'contact-parent', label: 'Hubungi Orang Tua', icon: PhoneCall, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' },
                  { id: 'view-students', label: 'Lihat Siswa', icon: Users, color: 'text-slate-600 bg-slate-100 hover:bg-slate-200' },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      onClick={() => handleQuickAction(act.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border border-transparent transition-all cursor-pointer ${act.color}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[11px] font-bold text-center leading-tight">{act.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dua Kolom: Sesi Hari Ini & Referral Masuk */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sesi Konseling Hari Ini */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      <span>Sesi Konseling Hari Ini</span>
                    </h3>
                    <p className="text-xs text-slate-500">Jadwal tatap muka ruang konseling privat</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('jadwal-konseling')}
                    className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Buka Kalender →
                  </button>
                </div>

                <div className="space-y-3">
                  {(dashboardData?.today_counseling_sessions || []).map((sess: any) => (
                    <div
                      key={sess.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition-all flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                          {sess.time}
                        </span>
                        <div className="flex items-center gap-2">
                          {renderConfidentialityBadge(sess.confidentiality)}
                          {renderStatusBadge(sess.status)}
                        </div>
                      </div>
                      <div className="font-bold text-slate-900 text-xs">
                        {sess.student_name} <span className="text-slate-400">({sess.class})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-1">{sess.topic}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>📍 {sess.location}</span>
                        <span>•</span>
                        <span>{sess.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Referral Masuk & Follow-up Perhatian */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Referral Masuk Menunggu Review</span>
                    </h3>
                    <p className="text-xs text-slate-500">Rujukan dari wali kelas & guru mapel</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('referral-masuk')}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Lihat Semua ({referrals.incoming?.length || 0}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {(dashboardData?.incoming_referrals_preview || []).map((ref: any) => (
                    <div
                      key={ref.id}
                      className="p-3.5 rounded-2xl border border-amber-100 bg-amber-50/50 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {ref.student_name} <span className="text-slate-500 text-[11px]">({ref.class})</span>
                        </span>
                        {renderStatusBadge(ref.priority)}
                      </div>
                      <p className="text-xs text-slate-700 leading-snug">{ref.issue}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 text-[10px] text-slate-500">
                        <span>Dari: {ref.source}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleReferralAction(ref.id, 'accept')}
                            className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                          >
                            Terima
                          </button>
                          <button
                            onClick={() => handleReferralAction(ref.id, 'request-info')}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                          >
                            Minta Info
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. DAFTAR SISWA & ACADEMIC SNAPSHOT */}
        {activeMenu === 'daftar-siswa' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Siswa & Academic Snapshot</h2>
                <p className="text-xs text-slate-500">
                  Data dasar dan snapshot akademik kontekstual untuk membantu memahami latar belakang siswa tanpa mengambil alih fungsi guru.
                </p>
              </div>

              {/* Search & Filter */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari siswa / NISN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-3">Kelas & Wali</th>
                    <th className="py-3 px-3">Status Layanan BK</th>
                    <th className="py-3 px-3">Akademik (GPA)</th>
                    <th className="py-3 px-3">Kehadiran</th>
                    <th className="py-3 px-3">Tugas & Disiplin</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students
                    .filter(
                      (s) =>
                        !searchQuery ||
                        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        s.nis.includes(searchQuery) ||
                        s.class.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-all">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{s.name}</div>
                              <div className="text-[10px] text-slate-400">NIS: {s.nis} • NISN: {s.nisn}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{s.class}</div>
                          <div className="text-[10px] text-slate-500">Wali: {s.homeroom_teacher}</div>
                        </td>
                        <td className="py-3 px-3">
                          {renderStatusBadge(s.handling_status)}
                          {s.active_case_count > 0 && (
                            <div className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              {s.active_case_count} Kasus Aktif
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{s.academic_snapshot?.gpa || '-'}</div>
                          <div className="text-[10px] text-slate-400">
                            {s.academic_snapshot?.gpa_trend === 'up' && '📈 Tren Naik'}
                            {s.academic_snapshot?.gpa_trend === 'down_sharp' && '📉 Turun Signifikan'}
                            {s.academic_snapshot?.gpa_trend === 'down_slight' && '📉 Turun Ringan'}
                            {s.academic_snapshot?.gpa_trend === 'stable' && '➡️ Stabil'}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-800">{s.academic_snapshot?.attendance_rate}%</div>
                          <div className="text-[10px] text-slate-500">{s.academic_snapshot?.late_count}x Terlambat</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-700">Tugas tertinggal: <span className="font-bold text-rose-600">{s.academic_snapshot?.missing_tasks}</span></div>
                          <div className="text-[10px] text-slate-500">Poin Tatib: {s.academic_snapshot?.violation_points} | Prestasi: {s.academic_snapshot?.achievements_count}</div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenStudent(s.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold transition-all cursor-pointer"
                          >
                            Buka Profil 360°
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. STUDENT COUNSELING PROFILE (10 TABS) */}
        {activeMenu === 'student-profile' && studentProfile && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            {/* Profile Overview Header Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-black">
                  {studentProfile.name?.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{studentProfile.name}</h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/20 text-white">
                      {studentProfile.class}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    NIS: {studentProfile.nis} • NISN: {studentProfile.nisn} • Wali Kelas: {studentProfile.homeroom_teacher}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                    <span>Orang Tua: {studentProfile.parent?.father} ({studentProfile.parent?.phone})</span>
                    <span>•</span>
                    <span>Alamat: {studentProfile.address}</span>
                  </div>
                </div>
              </div>

              {/* Status Box */}
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-xs flex flex-col gap-1 min-w-[200px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Status Layanan:</span>
                  {renderStatusBadge(studentProfile.service_overview?.handling_status)}
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Konselor PIC:</span>
                  <span className="font-bold text-white">{studentProfile.service_overview?.assigned_counselor}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Sesi Terakhir:</span>
                  <span className="font-bold text-white">{studentProfile.service_overview?.last_session}</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-300">Follow-up:</span>
                  <span className="font-bold text-amber-300">{studentProfile.service_overview?.next_followup}</span>
                </div>
              </div>
            </div>

            {/* 10 TABS Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold">
              {[
                { id: 'overview', label: '1. Overview' },
                { id: 'cases', label: '2. Counseling Cases' },
                { id: 'sessions', label: '3. Sessions' },
                { id: 'assessment', label: '4. Assessment' },
                { id: 'intervention', label: '5. Intervention' },
                { id: 'follow-up', label: '6. Follow-up' },
                { id: 'referral', label: '7. Referral' },
                { id: 'parent-communication', label: '8. Parent Comm' },
                { id: 'progress', label: '9. Progress' },
                { id: 'documents', label: '10. Documents' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    profileTab === tab.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {profileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ringkasan Kasus Terkini</h4>
                  <div className="text-xs font-bold text-rose-700">CASE-2026-0042</div>
                  <p className="text-xs text-slate-600">
                    Penurunan motivasi belajar pasca perubahan siklus tugas mandiri laboratorium & lomba robotik.
                  </p>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Status: <span className="font-bold text-amber-600">Intervention (70% Target Tercapai)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tingkat Kerahasiaan Berkas</h4>
                  <div className="flex items-center gap-2">
                    {renderConfidentialityBadge(studentProfile.service_overview?.confidentiality_level)}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Hanya dapat diakses penuh oleh konselor pembimbing. Ringkasan koordinasi yang dibagikan ke Wali Kelas disaring ketat.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Aksi Cepat Profil</h4>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => setIsNewSessionModalOpen(true)}
                      className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>Jadwalkan Konseling Berikutnya</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setProfileTab('follow-up')}
                      className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 text-left flex items-center justify-between cursor-pointer"
                    >
                      <span>Catat Evaluasi Follow-up</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'cases' && (
              <div className="space-y-4">
                {(studentProfile.cases || []).map((c: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-rose-700 text-xs">{c.case_number}</span>
                      {renderStatusBadge(c.status)}
                    </div>
                    <div className="font-bold text-sm text-slate-900">{c.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{c.summary}</p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-200">
                      <span>Sumber: {c.referral_source}</span>
                      <span>Kategori: {c.category}</span>
                      <span>Dibuka: {c.opened_at}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'sessions' && (
              <div className="space-y-4">
                {(studentProfile.sessions || []).map((s: any) => (
                  <div key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-indigo-700 text-xs">{s.session_number}</span>
                        <span className="text-xs font-semibold text-slate-500">{s.date} ({s.time})</span>
                        <span>•</span>
                        <span className="text-xs font-semibold text-slate-700">{s.type}</span>
                      </div>
                      {renderConfidentialityBadge(s.confidentiality)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Tujuan Sesi:</span>
                        <p className="text-slate-600 mt-0.5">{s.goal}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Observasi:</span>
                        <p className="text-slate-600 mt-0.5">{s.observations}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-bold text-slate-800">Pembahasan & Tindakan:</span>
                        <p className="text-slate-600 mt-0.5">{s.discussion}</p>
                        <p className="text-emerald-700 font-semibold mt-1">Aksi: {s.actions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'assessment' && (
              <div className="space-y-4">
                {(studentProfile.assessments || []).map((asm: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 text-xs">{asm.instrument}</div>
                      <span className="text-xs font-bold text-indigo-700">{asm.date}</span>
                    </div>
                    <div className="text-xs font-bold text-slate-700">Skor / Klasifikasi: {asm.score}</div>
                    <div className="text-xs text-slate-600"><span className="font-bold">Interpretasi Konselor:</span> {asm.interpretation}</div>
                    <div className="text-xs text-emerald-800"><span className="font-bold">Rekomendasi:</span> {asm.recommendation}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'intervention' && (
              <div className="space-y-4">
                {(studentProfile.interventions || []).map((intv: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-900">Target: {intv.target_date}</span>
                      {renderStatusBadge(intv.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-900">Tujuan: {intv.goal}</div>
                    <p className="text-xs text-slate-700">Tindakan: {intv.action}</p>
                    <div className="text-[11px] text-slate-500">PIC: {intv.pic}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'follow-up' && (
              <div className="space-y-4">
                {(studentProfile.follow_ups || []).map((flw: any) => (
                  <div key={flw.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{flw.round} ({flw.date})</span>
                      <span className="text-xs font-bold text-indigo-600">{flw.condition}</span>
                    </div>
                    <p className="text-xs text-slate-600">{flw.notes}</p>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'referral' && (
              <div className="space-y-4">
                {(studentProfile.referrals || []).map((r: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{r.id} ({r.direction})</span>
                      <span className="text-xs text-slate-500">{r.date}</span>
                    </div>
                    <div className="text-xs text-slate-700"><span className="font-bold">Sumber:</span> {r.source}</div>
                    <p className="text-xs text-slate-600">{r.issue}</p>
                    <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                      <span className="font-bold">Feedback Aman untuk Wali Kelas:</span> {r.shared_back_status}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'parent-communication' && (
              <div className="space-y-4">
                {(studentProfile.parent_communications || []).map((p: any, i: number) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{p.date} • {p.channel}</span>
                      <span className="text-xs font-semibold text-slate-500">{p.contact_person}</span>
                    </div>
                    <p className="text-xs text-slate-700">{p.summary}</p>
                    <div className="text-xs text-emerald-700 font-semibold">Follow-up: {p.follow_up}</div>
                  </div>
                ))}
              </div>
            )}

            {profileTab === 'progress' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="font-bold text-xs text-slate-800">Kehadiran (Presensi)</div>
                  <div className="text-xs text-slate-500">Sebelum Intervensi: {studentProfile.progress?.attendance_before}</div>
                  <div className="text-xs font-bold text-emerald-700">Saat Ini: {studentProfile.progress?.attendance_current}</div>
                </div>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="font-bold text-xs text-slate-800">Ketuntasan Tugas & Emosi</div>
                  <div className="text-xs text-slate-700">{studentProfile.progress?.assignment_completion}</div>
                  <div className="text-xs text-slate-700">{studentProfile.progress?.emotional_state}</div>
                </div>
              </div>
            )}

            {profileTab === 'documents' && (
              <div className="space-y-3">
                {(studentProfile.documents || []).map((doc: any) => (
                  <div key={doc.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-rose-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-400">ID: {doc.id} • {doc.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderConfidentialityBadge(doc.confidentiality)}
                      <button
                        onClick={() => showToast(`Mengakses berkas privat ${doc.id} (Tercatat di Audit Log)`)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        Buka Dokumen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. CASE MANAGEMENT */}
        {activeMenu === 'cases' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Case Management (Inti Layanan BK)</h2>
                <p className="text-xs text-slate-500">
                  Seluruh permasalahan dan pendampingan siswa dikelola terstruktur dalam identitas Kasus (Case Number).
                </p>
              </div>
              <button
                onClick={() => setIsNewCaseModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buka Kasus Baru</span>
              </button>
            </div>

            {/* Cases Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3 px-4">No. Kasus</th>
                    <th className="py-3 px-3">Siswa & Kelas</th>
                    <th className="py-3 px-3">Sumber Rujukan</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Prioritas</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Next Follow-up</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="py-3 px-4 font-mono font-bold text-rose-700">{c.case_number}</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.student_name}</div>
                        <div className="text-[10px] text-slate-400">{c.class}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{c.referral_source}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{c.category}</td>
                      <td className="py-3 px-3">{renderStatusBadge(c.priority)}</td>
                      <td className="py-3 px-3">{renderStatusBadge(c.status)}</td>
                      <td className="py-3 px-3 text-slate-600">{c.next_follow_up || 'Selesai'}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStudent(c.student_id)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold cursor-pointer"
                          >
                            Detail
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

        {/* 5 & 6. REFERRAL MANAGEMENT */}
        {(activeMenu === 'referral-masuk' || activeMenu === 'referral-keluar' || activeMenu === 'referral-history') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeMenu === 'referral-masuk' && 'Referral Masuk (Rujukan untuk BK)'}
                  {activeMenu === 'referral-keluar' && 'Referral Keluar (Rujukan ke Pihak Eksternal)'}
                  {activeMenu === 'referral-history' && 'Alur & Riwayat Workflow Referral'}
                </h2>
                <p className="text-xs text-slate-500">
                  Workflow: Referral → Review BK → Assessment → Intervention → Follow-up → Closed.
                </p>
              </div>
            </div>

            {/* Workflow Pipeline Graphic */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold overflow-x-auto gap-3">
              {['1. Referral', '2. Review BK', '3. Assessment', '4. Intervention', '5. Follow-up', '6. Closed'].map(
                (st, idx) => (
                  <div key={idx} className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-700">
                      {st}
                    </span>
                    {idx < 5 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </div>
                )
              )}
            </div>

            {/* List referrals */}
            {activeMenu === 'referral-masuk' && (
              <div className="space-y-4">
                {(referrals.incoming || []).map((ref: any) => (
                  <div key={ref.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-700">{ref.id}</span>
                        <span className="text-xs text-slate-400">• {ref.date}</span>
                        <span className="text-xs font-bold text-indigo-700">Dari: {ref.source_role} ({ref.referrer_name})</span>
                      </div>
                      {renderStatusBadge(ref.priority)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{ref.student_name} ({ref.class})</div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      "{ref.reason}"
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="text-[11px] text-slate-500">
                        Status Terkini: <span className="font-bold text-slate-800">{ref.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReferralAction(ref.id, 'accept')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                        >
                          Terima & Buat Kasus
                        </button>
                        <button
                          onClick={() => handleReferralAction(ref.id, 'request-info')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Minta Info Tambahan
                        </button>
                        <button
                          onClick={() => handleReferralAction(ref.id, 'reject')}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                        >
                          Tolak Berdasarkan Alasan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'referral-keluar' && (
              <div className="space-y-4">
                {(externalReferrals || []).map((ref: any) => (
                  <div key={ref.id} className="p-5 rounded-2xl border border-purple-200 bg-purple-50/30 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-purple-800">{ref.id}</span>
                      {renderConfidentialityBadge(ref.confidentiality)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{ref.student_name} ({ref.class})</div>
                    <div className="text-xs text-slate-700">Tujuan Rujukan: <span className="font-bold">{ref.target_facility}</span></div>
                    <div className="text-xs text-slate-500">Spesialis: {ref.specialist} • Tanggal: {ref.referral_date}</div>
                    <div className="text-xs text-emerald-800 font-semibold">Status: {ref.status} • Jadwal Follow-up: {ref.follow_up_schedule}</div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'referral-history' && (
              <div className="text-xs text-slate-600 space-y-3">
                <p>Riwayat audit seluruh proses rujukan tersimpan otomatis.</p>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2">Pedoman Safe Feedback Rujukan:</div>
                  <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li>Wali kelas hanya menerima notifikasi: "Siswa sedang dalam proses pendampingan BK".</li>
                    <li>Detail sesi konseling, isi curahan hati, atau trauma siswa TIDAK DIIZINKAN dibagikan ke pihak ketiga.</li>
                    <li>Rekomendasi yang dibagikan hanyalah instruksi pembelajaran praktis ramah siswa.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 7 & 8. KONSELING INDIVIDU & KELOMPOK */}
        {(activeMenu === 'konseling-individu' || activeMenu === 'konseling-kelompok' || activeMenu === 'counseling-sessions') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeMenu === 'konseling-individu' && 'Sesi & Catatan Konseling Individu'}
                  {activeMenu === 'konseling-kelompok' && 'Konseling Kelompok (Dinamika Kelompok Sebaya)'}
                  {activeMenu === 'counseling-sessions' && 'Semua Sesi Konseling Terjadwal'}
                </h2>
                <p className="text-xs text-slate-500">
                  Pencatatan tujuan sesi, observasi, pembahasan, komitmen tindakan, serta perlindungan kerahasiaan catatan sensitif.
                </p>
              </div>

              {activeMenu === 'konseling-individu' && (
                <button
                  onClick={() => setIsNewSessionModalOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  + Tulis Catatan Sesi
                </button>
              )}
            </div>

            {/* List individual sessions */}
            {activeMenu === 'konseling-individu' && (
              <div className="space-y-4">
                {individualSessions.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 text-xs">{s.session_code}</span>
                        <span className="text-xs text-slate-500">{s.date} ({s.time})</span>
                        <span className="text-xs text-slate-400">• {s.venue}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderConfidentialityBadge(s.confidentiality_level)}
                        {renderStatusBadge(s.status)}
                      </div>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{s.student_name} ({s.class})</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800">Tujuan Sesi:</span>
                        <p className="text-slate-600 mt-0.5">{s.notes?.goal}</p>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">Observasi Sikap:</span>
                        <p className="text-slate-600 mt-0.5">{s.notes?.observation}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-bold text-slate-800">Ringkasan Pembahasan:</span>
                        <p className="text-slate-600 mt-0.5">{s.notes?.summary}</p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-bold text-emerald-800">Rencana Aksi & Follow-up:</span>
                        <p className="text-emerald-700 font-semibold mt-0.5">{s.notes?.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List group sessions */}
            {activeMenu === 'konseling-kelompok' && (
              <div className="space-y-4">
                {groupSessions.map((grp) => (
                  <div key={grp.id} className="p-5 rounded-2xl border border-blue-200 bg-blue-50/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{grp.group_name}</div>
                      {renderStatusBadge(grp.status)}
                    </div>
                    <p className="text-xs text-slate-700"><span className="font-bold">Topik Bahasan:</span> {grp.topic}</p>
                    <div className="text-xs text-slate-600">
                      Jadwal: {grp.schedule} • Sesi: {grp.sessions_completed}/{grp.total_sessions_planned} Selesai
                    </div>

                    {/* Member pills */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] font-bold text-slate-500 mr-1">Anggota:</span>
                      {grp.members?.map((m: any, idx: number) => (
                        <span key={idx} className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700">
                          {m.name} ({m.class})
                        </span>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 mt-2">
                      <div className="font-bold text-slate-800">Evaluasi Dinamika Kelompok:</div>
                      <p className="mt-0.5">{grp.evaluation}</p>
                      <div className="font-bold text-indigo-700 mt-1">Follow-up: {grp.follow_up}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 9 & 10. JADWAL KONSELING & BOOKING */}
        {(activeMenu === 'jadwal-konseling' || activeMenu === 'booking') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeMenu === 'jadwal-konseling' ? 'Kalender Khusus Jadwal Layanan BK' : 'Permintaan Booking Konseling Mandiri Siswa'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeMenu === 'jadwal-konseling'
                    ? 'Manajemen jadwal sesi individu, kelompok, pertemuan orang tua, koordinasi wali kelas, dan follow-up.'
                    : 'Siswa dapat mengajukan janji temu konseling secara mandiri tanpa harus membuka rincian masalah sensitif di awal.'}
                </p>
              </div>
            </div>

            {activeMenu === 'jadwal-konseling' && (
              <div className="space-y-3">
                {scheduleEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl border border-slate-200 flex items-center justify-between bg-white hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-indigo-700">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{evt.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {evt.date} • {evt.time} • 📍 {evt.venue}
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {evt.category}
                        </span>
                      </div>
                    </div>
                    <div>{renderStatusBadge(evt.status)}</div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'booking' && (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-rose-700">{b.id}</span>
                      {renderStatusBadge(b.status)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{b.student_name} ({b.class})</div>
                    <div className="text-xs text-slate-700">
                      Waktu Diajukan: <span className="font-bold">{b.requested_date} ({b.requested_time})</span>
                    </div>
                    <div className="text-xs text-slate-600">Layanan: {b.service_type}</div>
                    <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Topik Umum: "{b.general_topic}"
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      {b.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleBookingAction(b.id, 'accept')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleBookingAction(b.id, 'reschedule')}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleBookingAction(b.id, 'reject')}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-700 font-bold">Booking telah dikonfirmasi</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 11, 12, 13. ASSESSMENT & LIBRARY */}
        {(activeMenu === 'assessment' || activeMenu === 'assessment-library' || activeMenu === 'hasil-assessment' || activeMenu === 'self-assessment') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'assessment' && 'Asesmen Siswa (Non-Klinis)'}
                {activeMenu === 'assessment-library' && 'Assessment Library (Bank Instrumen & Kuesioner)'}
                {activeMenu === 'hasil-assessment' && 'Hasil & Interpretasi Asesmen'}
                {activeMenu === 'self-assessment' && 'Self-Assessment Mandiri Siswa'}
              </h2>
              <p className="text-xs text-slate-500">
                Catatan penting: Hasil kuesioner digunakan sebagai bahan bimbingan, bukan diagnosis psikologis klinis otomatis.
              </p>
            </div>

            {/* Library list */}
            {(activeMenu === 'assessment' || activeMenu === 'assessment-library') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(assessmentsData.library || []).map((inst: any) => (
                  <div key={inst.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-indigo-700">{inst.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {inst.status}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-900">{inst.title}</div>
                    <div className="text-xs text-slate-600">Kategori: {inst.category} • Versi: {inst.version}</div>
                    <div className="text-xs text-slate-700 font-semibold">Skoring: {inst.scoring}</div>
                    <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                      Panduan: {inst.interpretation_guide}
                    </p>
                    <div className="text-[10px] text-slate-400 mt-1">Total Pengisi: {inst.total_takers} Siswa</div>
                  </div>
                ))}
              </div>
            )}

            {/* Self-Assessment list */}
            {activeMenu === 'self-assessment' && (
              <div className="space-y-4">
                {selfAssessments.map((sub) => (
                  <div key={sub.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{sub.student_name} ({sub.class})</div>
                      <span className="text-xs text-slate-400">{sub.submitted_at}</span>
                    </div>
                    <div className="text-xs font-bold text-indigo-700">{sub.title}</div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      {Object.entries(sub.areas || {}).map(([k, v], idx) => (
                        <div key={idx}>
                          <span className="font-bold text-slate-800">{k}:</span> {v as string}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 14 & 15. INTERVENSI & FOLLOW-UP */}
        {(activeMenu === 'intervention-plan' || activeMenu === 'follow-up' || activeMenu === 'student-support-plan') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeMenu === 'intervention-plan' && 'Intervention Management (Rencana Aksi)'}
                  {activeMenu === 'follow-up' && 'Follow-up Management & Reminders'}
                  {activeMenu === 'student-support-plan' && 'Student Support Plan (Dukungan Berkelanjutan)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Pemantauan komitmen perubahan kondisi siswa secara bertahap dan berkala.
                </p>
              </div>
            </div>

            {/* Reminders Banner for Follow-up */}
            {activeMenu === 'follow-up' && (
              <div className="space-y-2">
                {(followUpsData.reminders || []).map((rem: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 ${
                      rem.type === 'overdue'
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>{rem.message}</span>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'intervention-plan' && (
              <div className="space-y-4">
                {interventions.map((intv) => (
                  <div key={intv.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{intv.student_name} ({intv.class})</div>
                      {renderStatusBadge(intv.status)}
                    </div>
                    <div className="text-xs font-bold text-slate-700">Tujuan Target: {intv.target}</div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <span className="font-bold text-slate-800">Langkah Tindakan:</span>
                      <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                        {intv.actions?.map((act: string, i: number) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>PIC: {intv.pic}</span>
                      <span>Target: {intv.target_date} (Progres: {intv.progress_percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'student-support-plan' && (
              <div className="space-y-4">
                {supportPlans.map((ssp) => (
                  <div key={ssp.id} className="p-5 rounded-2xl border border-indigo-200 bg-indigo-50/20 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-slate-900">{ssp.student_name} ({ssp.class})</div>
                      <span className="text-xs font-bold text-indigo-700">{ssp.progress_status}</span>
                    </div>
                    <p className="text-xs text-slate-700">{ssp.condition_summary}</p>
                    <div className="text-xs font-bold text-slate-800">Tujuan Utama: {ssp.goals}</div>
                    <div className="text-xs text-slate-600">
                      Stakeholders: {ssp.stakeholders_involved?.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 16. PROGRESS SISWA */}
        {activeMenu === 'student-progress' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Progress Siswa (Sebelum, Selama, dan Sesudah)</h2>
              <p className="text-xs text-slate-500">
                Indikator capaian intervensi: Kehadiran, Akademik, Perilaku, Kedisiplinan, Partisipasi, dan Asesmen.
              </p>
            </div>

            {studentProgress.map((prog, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">{prog.student_name}</div>
                  <span className="font-mono text-xs font-bold text-rose-700">{prog.case_number}</span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Indikator</th>
                        <th className="py-2.5 px-3">Sebelum Intervensi</th>
                        <th className="py-2.5 px-3">Selama Intervensi</th>
                        <th className="py-2.5 px-3">Setelah Intervensi</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prog.indicators?.map((ind: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{ind.metric}</td>
                          <td className="py-2.5 px-3 text-rose-600 font-medium">{ind.before}</td>
                          <td className="py-2.5 px-3 text-amber-600 font-medium">{ind.during}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-bold">{ind.after}</td>
                          <td className="py-2.5 px-3">{renderStatusBadge(ind.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
                  Evaluasi Keseluruhan: {prog.overall_evaluation}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 19, 20, 21. KOMUNIKASI ORTU, WALI KELAS & GURU */}
        {(activeMenu === 'komunikasi-ortu' || activeMenu === 'parent-meeting' || activeMenu === 'communication-history') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'komunikasi-ortu' && 'Komunikasi Orang Tua / Wali Murid'}
                {activeMenu === 'parent-meeting' && 'Parent Meeting Terjadwal'}
                {activeMenu === 'communication-history' && 'Riwayat Lengkap Komunikasi Keluarga'}
              </h2>
              <p className="text-xs text-slate-500">
                Dokumentasi kontak, panggilan resmi, hasil mediasi, dan tindak lanjut bersama orang tua.
              </p>
            </div>

            {/* Parent Meetings */}
            <div className="space-y-4">
              {(parentComms.meetings || []).map((m: any) => (
                <div key={m.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">{m.id}</span>
                    {renderStatusBadge(m.status)}
                  </div>
                  <div className="font-bold text-sm text-slate-900">{m.student_name} ({m.class})</div>
                  <div className="text-xs text-slate-600">
                    Jadwal: <span className="font-bold text-slate-900">{m.date} ({m.time})</span> • 📍 {m.venue}
                  </div>
                  <div className="text-xs text-slate-700">Tujuan: {m.objective}</div>
                  <div className="text-xs text-slate-500">Peserta: {m.participants?.join(', ')}</div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                    <span className="font-bold">Kesepakatan:</span> {m.agreement_summary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 23 & 24. EARLY WARNING SYSTEM (EWS) */}
        {activeMenu === 'early-warning' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Early Warning System (EWS)</h2>
                <p className="text-xs text-slate-500">
                  Indikator risiko otomatis (Presensi, Akademik, Tugas, Pelanggaran) membutuhkan verifikasi manusia konselor BK sebelum dibuka sebagai kasus.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {earlyWarnings.map((ew) => (
                <div key={ew.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">{ew.id}</span>
                      <span className="text-sm font-bold text-slate-900">{ew.student_name} ({ew.class})</span>
                    </div>
                    {renderStatusBadge(ew.overall_risk)}
                  </div>

                  {/* Indicator Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {ew.indicators?.map((ind: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-bold text-slate-800">{ind.type}:</span> {ind.detail}
                      </div>
                    ))}
                  </div>

                  {/* Verification Status */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Verifikasi Konselor:</span>{' '}
                      {ew.human_verified ? (
                        <span className="text-emerald-700 font-bold">Terverifikasi ({ew.verified_by})</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Menunggu Verifikasi Manusia</span>
                      )}
                      <p className="text-[11px] text-slate-500 mt-0.5">{ew.verification_notes}</p>
                    </div>

                    {!ew.human_verified && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVerifyEws(ew.id, true)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                        >
                          Verifikasi & Buat Kasus
                        </button>
                        <button
                          onClick={() => handleVerifyEws(ew.id, false)}
                          className="px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Catat Monitoring
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 25 & 26. KARIER & MINAT BAKAT */}
        {(activeMenu === 'minat-bakat' || activeMenu === 'career-counseling' || activeMenu === 'study-planning') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'minat-bakat' && 'Minat & Bakat Siswa'}
                {activeMenu === 'career-counseling' && 'Career Counseling (Holland RIASEC)'}
                {activeMenu === 'study-planning' && 'Study Planning (Perguruan Tinggi & Beasiswa)'}
              </h2>
              <p className="text-xs text-slate-500">
                Pemberian rekomendasi jalur masuk PTN/PTS, profiling bakat, dan pemilihan program studi lanjutan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(careerData.career_profiles || []).map((cp: any) => (
                <div key={cp.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sm text-slate-900">{cp.student_name} ({cp.class})</div>
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {cp.riasec_code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700">Aspirasi: <span className="font-bold text-slate-900">{cp.aspirations}</span></div>
                  <div className="text-xs text-slate-600">
                    Prodi Pilihan: {cp.target_majors?.join(', ')}
                  </div>
                  <div className="text-xs text-slate-600">
                    Kampus Target: {cp.target_campuses?.join(', ')}
                  </div>
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    Rekomendasi BK: {cp.counselor_recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 27, 28, 39. PROGRAM BK */}
        {(activeMenu === 'program' || activeMenu === 'kegiatan' || activeMenu === 'evaluasi') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'program' && 'Program Preventif BK'}
                {activeMenu === 'kegiatan' && 'Monitoring Kegiatan BK'}
                {activeMenu === 'evaluasi' && 'Evaluasi Efektivitas Program'}
              </h2>
              <p className="text-xs text-slate-500">
                Program klasikal preventif untuk membangun iklim sekolah yang aman, inklusif, dan bebas perundungan.
              </p>
            </div>

            <div className="space-y-4">
              {programs.map((p) => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-indigo-700">{p.id}</span>
                    {renderStatusBadge(p.status)}
                  </div>
                  <div className="text-sm font-bold text-slate-900">{p.title}</div>
                  <div className="text-xs text-slate-600">Target: {p.target} • Peserta: {p.participants_count} Siswa</div>
                  <div className="text-xs text-slate-700">Materi: {p.materials}</div>

                  {p.effectiveness && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs flex flex-col gap-1">
                      <div className="font-bold text-indigo-900">Efektivitas (Pre vs Post Intervensi):</div>
                      <div className="text-rose-700 font-medium">Pre: {p.effectiveness.pre_assessment}</div>
                      <div className="text-emerald-700 font-bold">Post: {p.effectiveness.post_assessment}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Skor Kepuasan: ⭐ {p.effectiveness.satisfaction_score} / 5.0</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 29. BULLYING / PEER CONFLICT SPECIAL WORKFLOW */}
        {activeMenu === 'bullying-case' && (
          <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Bullying / Peer Conflict Special Workflow</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Protokol ketat dengan akses data terbatas untuk melindungi pihak pelapor dan terduga korban secara aman.
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                Strictly Confidential
              </span>
            </div>

            {bullyingCases.map((bc) => (
              <div key={bc.id} className="p-5 rounded-2xl border border-rose-200 bg-rose-50/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-800">{bc.id}</span>
                  {renderConfidentialityBadge(bc.confidentiality_level)}
                </div>
                <div className="text-sm font-bold text-slate-900">{bc.incident_type}</div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-rose-100">
                  <span className="font-bold">Kronologi:</span> {bc.chronology}
                </p>
                <div className="text-xs text-slate-800"><span className="font-bold">Asesmen Konselor:</span> {bc.counselor_assessment}</div>
                <div className="text-xs text-emerald-800 font-semibold"><span className="font-bold">Tindakan Mediasi:</span> {bc.action_taken}</div>
                <div className="text-[11px] text-slate-500">Masa Pemantauan: {bc.monitoring_period} • Status: {bc.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* 30. DISCIPLINE REFERRAL */}
        {activeMenu === 'discipline-referral' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Discipline Referral (Pembinaan Kesiswaan)</h2>
              <p className="text-xs text-slate-500">
                Penerimaan rujukan pelanggaran tata tertib dari Tim Kesiswaan/Wali Kelas untuk pembinaan perilaku secara suportif.
              </p>
            </div>

            {disciplineReferrals.map((d) => (
              <div key={d.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700">{d.id} ({d.date})</span>
                  {renderStatusBadge(d.status)}
                </div>
                <div className="text-sm font-bold text-slate-900">{d.student_name} ({d.class})</div>
                <div className="text-xs text-rose-700 font-semibold">Bentuk Pelanggaran: {d.violation_type}</div>
                <div className="text-xs text-slate-600">Perujuk: {d.referred_by} • Bukti: {d.evidence}</div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold">Pendekatan Pembinaan BK:</span> {d.counselor_coaching_approach}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 31 & 32. DOKUMENTASI BK & CONSENT */}
        {(activeMenu === 'dokumen-bk' || activeMenu === 'case-documents') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'dokumen-bk' ? 'Dokumentasi BK (Private Storage)' : 'Consent & Persetujuan Layanan'}
              </h2>
              <p className="text-xs text-slate-500">
                Semua dokumen disimpan di storage terenkripsi privat, tidak dapat diakses melalui tautan publik sembarangan.
              </p>
            </div>

            {activeMenu === 'dokumen-bk' && (
              <div className="space-y-3">
                {(docsAndConsents.documents || []).map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-rose-600" />
                      <div>
                        <div className="font-bold text-xs text-slate-900">{doc.title}</div>
                        <div className="text-[10px] text-slate-500">
                          {doc.category} • {doc.storage} • {doc.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderConfidentialityBadge(doc.confidentiality)}
                      <button
                        onClick={() => showToast(`Mengunduh dokumen aman ${doc.id}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                      >
                        Akses Berkas
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeMenu === 'case-documents' && (
              <div className="space-y-3">
                {(docsAndConsents.consents || []).map((c: any) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900">{c.student_name} - {c.type}</div>
                      <div className="text-[11px] text-slate-500">Pemberi Izin: {c.granter} • Berlaku s.d: {c.valid_until}</div>
                    </div>
                    {renderStatusBadge(c.status)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 34, 35, 36. PRIVACY MODEL & AUDIT LOG */}
        {(activeMenu === 'privacy-model' || activeMenu === 'audit-log') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {activeMenu === 'privacy-model' ? 'Privacy Model & Need-to-Know Access' : 'Consent & Access History (Audit Trail)'}
              </h2>
              <p className="text-xs text-slate-500">
                Sistem BK membedakan peran, cakupan data, dan tingkat kerahasiaan untuk menjaga privasi siswa secara etis.
              </p>
            </div>

            {activeMenu === 'privacy-model' && (
              <div className="space-y-6">
                {/* 4 Levels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(privacyAudit.confidentiality_levels || []).map((lvl: any, i: number) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                      <div className="font-bold text-sm text-slate-900">{lvl.level}</div>
                      <p className="text-xs text-slate-600 leading-relaxed">{lvl.description}</p>
                      <div className="text-[11px] font-bold text-indigo-700 mt-1">Cakupan: {lvl.scope}</div>
                    </div>
                  ))}
                </div>

                {/* Collaboration Matrix */}
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="py-2.5 px-3">Role / Pihak</th>
                        <th className="py-2.5 px-3">Detail Sesi Konseling</th>
                        <th className="py-2.5 px-3">Catatan Rahasia BK</th>
                        <th className="py-2.5 px-3">Rekomendasi Bersama</th>
                        <th className="py-2.5 px-3">Audit Trail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(privacyAudit.collaboration_matrix || []).map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3 font-bold text-slate-800">{m.role}</td>
                          <td className="py-2.5 px-3">{m.detail_sesi}</td>
                          <td className="py-2.5 px-3">{m.catatan_rahasia}</td>
                          <td className="py-2.5 px-3 text-indigo-700 font-semibold">{m.rekomendasi}</td>
                          <td className="py-2.5 px-3 text-emerald-700 font-bold">✅ Logged</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeMenu === 'audit-log' && (
              <div className="space-y-3">
                {(privacyAudit.audit_logs || []).map((log: any) => (
                  <div key={log.id} className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{log.action}</div>
                      <div className="text-[11px] text-slate-500">
                        Oleh: {log.user_name} ({log.role}) • Siswa: {log.target_student} • IP: {log.ip_address}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-slate-400 block">{log.timestamp}</span>
                      {renderConfidentialityBadge(log.confidentiality_level)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 37 & 38. LAPORAN & BK ANALYTICS */}
        {(activeMenu === 'laporan-agregat' || activeMenu === 'case-report' || activeMenu === 'counseling-report' || activeMenu === 'program-report' || activeMenu === 'analytics') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeMenu === 'analytics' ? 'BK Analytics & Trend Monitoring' : 'Laporan Bimbingan & Konseling'}
                </h2>
                <p className="text-xs text-slate-500">
                  Laporan individu untuk konselor dan laporan agregat non-identitas untuk Kepala Sekolah.
                </p>
              </div>
              <button
                onClick={() => showToast('Mencetak / mengekspor laporan dengan watermark perlindungan data')}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Export Laporan</span>
              </button>
            </div>

            {/* Analytics Widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col">
                <span className="text-xs text-slate-500 font-semibold">Siswa Dilayani</span>
                <span className="text-2xl font-black text-slate-900">{reportsAnalytics.analytics?.counseling_total_served || 42}</span>
                <span className="text-[10px] text-slate-400">Semester Berjalan</span>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col">
                <span className="text-xs text-blue-700 font-semibold">Kasus Aktif</span>
                <span className="text-2xl font-black text-blue-800">{reportsAnalytics.analytics?.active_cases || 12}</span>
                <span className="text-[10px] text-blue-600">Dalam pendampingan</span>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col">
                <span className="text-xs text-emerald-700 font-semibold">Kasus Selesai</span>
                <span className="text-2xl font-black text-emerald-800">{reportsAnalytics.analytics?.resolved_cases || 24}</span>
                <span className="text-[10px] text-emerald-600">Tuntas dievaluasi</span>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col">
                <span className="text-xs text-amber-700 font-semibold">Pending Follow-up</span>
                <span className="text-2xl font-black text-amber-800">{reportsAnalytics.analytics?.pending_followups || 8}</span>
                <span className="text-[10px] text-amber-600">Jatuh tempo pekan ini</span>
              </div>
            </div>

            {/* Reports list */}
            <div className="space-y-3">
              {(reportsAnalytics.reports_list || []).map((rep: any) => (
                <div key={rep.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{rep.title}</div>
                    <div className="text-[11px] text-slate-500">{rep.type} • Periode: {rep.period}</div>
                    <div className="text-[10px] text-indigo-700 font-medium mt-0.5">{rep.privacy_note}</div>
                  </div>
                  <button
                    onClick={() => showToast(`Mengunduh ${rep.id}`)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 41. EMERGENCY / URGENT CASE */}
        {activeMenu === 'emergency-case' && (
          <div className="bg-white rounded-3xl p-6 border border-rose-300 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertOctagon className="w-5 h-5 text-rose-600" />
                  <span>Protokol Kasus Darurat (Emergency / Urgent Case)</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Untuk situasi yang membutuhkan respons segera, eskalasi darurat pimpinan, dan kontak langsung keluarga.
                </p>
              </div>
              <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-full">
                SOP Level Darurat
              </span>
            </div>

            {emergencyCases.map((emg) => (
              <div key={emg.id} className="p-5 rounded-2xl border border-rose-300 bg-rose-50/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-700">{emg.case_id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                    {emg.urgency_level}
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-900">{emg.student_name} ({emg.class})</div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-rose-200 font-semibold">
                  Alasan Kedaruratan: {emg.reason}
                </p>
                <div className="text-xs text-slate-800 font-bold">Kontak Darurat: {emg.emergency_contact}</div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Protokol Aksi Terlaksana:</span>
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-slate-600">
                    {emg.action_protocol?.map((pr: string, i: number) => (
                      <li key={i}>{pr}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-emerald-800 font-bold">
                  Status Eskalasi ke Kepala Sekolah: Terkirim ({emg.escalated_at})
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 42. NOTIFIKASI */}
        {activeMenu === 'notifikasi' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Center Konselor BK</h2>
              <p className="text-xs text-slate-500">Notifikasi rujukan baru, janji temu, follow-up jatuh tempo, dan eskalasi.</p>
            </div>

            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                    n.unread ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <MessageSquare className={`w-5 h-5 shrink-0 mt-0.5 ${n.unread ? 'text-rose-600' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 45. PROFIL & KEAMANAN 2FA */}
        {activeMenu === 'profil' && counselorProfile && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profil & Keamanan Akun Konselor BK</h2>
              <p className="text-xs text-slate-500">
                Pengaturan kredensial, autentikasi 2 faktor (2FA), manajemen sesi aktif, dan riwayat login.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="font-bold text-sm text-slate-900">Identitas Konselor</div>
                <div className="text-xs text-slate-700">Nama: <span className="font-bold">{counselorProfile.name}</span></div>
                <div className="text-xs text-slate-700">NIP: {counselorProfile.nip}</div>
                <div className="text-xs text-slate-700">Jabatan: {counselorProfile.title}</div>
                <div className="text-xs text-slate-700">Email Resmi: {counselorProfile.email}</div>
                <div className="text-xs text-slate-700">Ruangan: {counselorProfile.office}</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-3">
                <div className="font-bold text-sm text-slate-900">Keamanan Data Konseling</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">Autentikasi 2-Faktor (2FA):</span>
                  <span className="font-bold text-emerald-700">✅ Aktif</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">Session Timeout:</span>
                  <span className="font-bold text-slate-900">{counselorProfile.security?.session_timeout_minutes} Menit</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700">Sandi Terakhir Diperbarui:</span>
                  <span className="text-slate-600">{counselorProfile.security?.last_password_change}</span>
                </div>
                <button
                  onClick={() => showToast('Seluruh sesi di perangkat lain telah di-logout')}
                  className="mt-2 py-2 px-3 bg-white border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-50 cursor-pointer text-center"
                >
                  Logout dari Semua Perangkat Lain
                </button>
              </div>
            </div>

            {/* Login history */}
            <div className="space-y-2">
              <div className="font-bold text-xs text-slate-800">Riwayat Login Terakhir:</div>
              {counselorProfile.security?.login_history?.map((lg: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{lg.device}</span>
                    <span className="text-slate-500 text-[11px] block">IP: {lg.ip}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{lg.time}</span>
                    <span className="text-xs font-bold text-emerald-700">{lg.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 46. HELP & SOP BK */}
        {activeMenu === 'bantuan' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col gap-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bantuan & Panduan Operasional Konselor BK</h2>
              <p className="text-xs text-slate-500">SOP layanan konseling, panduan etika kerahasiaan, dan FAQ sistem.</p>
            </div>

            {/* SOP Guides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(helpData?.guides || []).map((g: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">{g.category}</span>
                  <div className="font-bold text-xs text-slate-900">{g.title}</div>
                  <button
                    onClick={() => showToast(`Membuka berkas SOP ${g.title}`)}
                    className="text-xs font-bold text-rose-600 hover:underline text-left mt-1 cursor-pointer"
                  >
                    Buka Panduan Lengkap →
                  </button>
                </div>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              <div className="font-bold text-sm text-slate-900">Pertanyaan yang Sering Diajukan (FAQ):</div>
              {(helpData?.faq || []).map((f: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col gap-1.5">
                  <div className="font-bold text-xs text-slate-900">Q: {f.q}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">A: {f.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODAL: Buka Kasus Baru */}
      {isNewCaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Buka Kasus Konseling Baru</span>
              </h3>
              <button
                onClick={() => setIsNewCaseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={newCaseForm.student_name}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, student_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas</label>
                  <input
                    type="text"
                    required
                    value={newCaseForm.class}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, class: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sumber Referral</label>
                  <select
                    value={newCaseForm.referral_source}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, referral_source: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Wali Kelas">Wali Kelas</option>
                    <option value="Guru Mapel">Guru Mapel</option>
                    <option value="Siswa Sendiri">Siswa Sendiri</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Kepala Sekolah">Kepala Sekolah</option>
                    <option value="Monitoring Sistem (EWS)">Monitoring Sistem (EWS)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori Masalah</label>
                  <select
                    value={newCaseForm.category}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Akademik & Regulasi Diri">Akademik & Regulasi Diri</option>
                    <option value="Kedisiplinan & Presensi">Kedisiplinan & Presensi</option>
                    <option value="Sosial & Emosional">Sosial & Emosional</option>
                    <option value="Adaptasi Sekolah Baru">Adaptasi Sekolah Baru</option>
                    <option value="Bullying & Konflik Sebaya">Bullying & Konflik Sebaya</option>
                    <option value="Karier & Masa Depan">Karier & Masa Depan</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas Kasus</label>
                  <select
                    value={newCaseForm.priority}
                    onChange={(e) => setNewCaseForm({ ...newCaseForm, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Normal">🟢 Normal</option>
                    <option value="Monitoring">🔵 Monitoring</option>
                    <option value="Intervention">🟡 Intervention</option>
                    <option value="High Attention">🟠 High Attention</option>
                    <option value="Urgent">🔴 Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Masalah / Latar Belakang</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Deskripsikan latar belakang dan alasan pembukaan kasus..."
                  value={newCaseForm.summary}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tingkat Kerahasiaan Berkas</label>
                <select
                  value={newCaseForm.confidentiality_level}
                  onChange={(e) => setNewCaseForm({ ...newCaseForm, confidentiality_level: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Level 1 (Internal BK)">Level 1 — Internal BK (Sangat Rahasia)</option>
                  <option value="Level 2 (Restricted)">Level 2 — Restricted (Izin Khusus)</option>
                  <option value="Level 3 (Coordinated)">Level 3 — Coordinated (Wali Kelas & Kepsek)</option>
                  <option value="Level 4 (General Administrative)">Level 4 — General Administrative</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
                >
                  Simpan & Buka Kasus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Buat Catatan Sesi */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Catatan Sesi Konseling Individu</span>
              </h3>
              <button
                onClick={() => setIsNewSessionModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Siswa</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.student_name}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, student_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={newSessionForm.date}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Waktu / Durasi</label>
                  <input
                    type="text"
                    required
                    value={newSessionForm.time}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tujuan Sesi</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Evaluasi kepatuhan time blocking dan regulasi cemas"
                  value={newSessionForm.goal}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, goal: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ringkasan Pembahasan & Tindakan</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Catat ringkasan pembicaraan, dinamika emosi, komitmen tindakan siswa..."
                  value={newSessionForm.summary}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, summary: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewSessionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
