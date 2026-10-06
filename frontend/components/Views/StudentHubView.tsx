'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  User as UserIcon,
  Calendar,
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
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
  Send,
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
  ExternalLink,
  Download,
  Eye,
  Filter,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Printer,
  Sparkles,
  Camera,
  QrCode,
  Share2,
  Lock,
  ArrowRight,
  Flame,
  Star,
  RefreshCw,
  Settings,
  Laptop,
  Layers,
  Globe,
  Moon,
  Sun,
  KeyRound,
  Monitor,
  HardDrive,
  Phone,
  Mail,
  MessageCircle,
  AlertCircle,
  FileDown,
  Info,
  Zap,
} from 'lucide-react';
import { User } from '@/lib/types';
import { fetchStudentProfile, updateAccount } from '@/lib/api';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import ArsipBelajarStudio from '@/components/ArsipBelajar/ArsipBelajarStudio';
import StudentSettingsModal from '@/components/Modals/StudentSettingsModal';
import StudentIdentitySecureView from '@/components/Views/StudentIdentitySecureView';
import {
  getCentralSchedule,
  saveCentralSchedule,
  resetCentralSchedule,
  subscribeToScheduleUpdates,
  ScheduleSlot,
  ScheduleLesson,
  SCHEDULE_DAYS
} from '@/lib/scheduleService';

interface StudentHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  initialFeatureId?: string;
}

// 20 CONSOLIDATED MASTER FEATURES DEFINITION
export interface FeatureItem {
  id: string;
  number: number;
  title: string;
  category: 'Utama' | 'KBM & Tugas' | 'Ujian & Nilai' | 'Kesiswaan' | 'Ruang Mandiri' | 'Bantuan & Akun';
  icon: any;
  badge?: string;
  description: string;
}

export const STUDENT_FEATURES: FeatureItem[] = [
  { id: 'dashboard', number: 1, title: 'Dashboard Siswa', category: 'Utama', icon: LayoutDashboard, badge: 'Home', description: 'Ringkasan aktivitas hari ini, jadwal KBM, sapaan siswa, dan statistik kilat' },
  { id: 'profile', number: 2, title: 'Profil & Identitas Diri', category: 'Utama', icon: UserIcon, description: 'Biodata lengkap diri, data akademik Dapodik, NISN, wali kelas, kontak keluarga, dan dokumen siswa' },
  { id: 'schedule', number: 3, title: 'Jadwal Pelajaran & Kalender', category: 'Utama', icon: Calendar, badge: 'Hari Ini', description: 'Jadwal KBM mingguan, ruang kelas, guru pengajar, kalender akademik, agenda PTS/PAS, dan libur' },
  { id: 'announcements', number: 4, title: 'Pengumuman & Notifikasi', category: 'Utama', icon: Bell, badge: 'Warta', description: 'Warta resmi sekolah, surat edaran ujian, notifikasi terpadu tugas baru, dan pengumuman nilai' },
  { id: 'arsip-belajar', number: 5, title: 'Arsip Belajar AI (Studio)', category: 'KBM & Tugas', icon: Sparkles, badge: 'AI Studio', description: 'Studio catatan cerdas foto papan tulis & audio guru, 3D Flashcards, Mind Map, CBT' },
  { id: 'my-subjects', number: 6, title: 'Mata Pelajaran & Silabus', category: 'KBM & Tugas', icon: BookOpen, description: 'Daftar seluruh mata pelajaran aktif, capaian silabus, standar KKM, materi, dan rekap tugas' },
  { id: 'materials', number: 7, title: 'Materi & Modul Pembelajaran', category: 'KBM & Tugas', icon: FileText, description: 'Koleksi modul PDF, slide PPT materi, video pembelajaran terarah, dan referensi bacaan guru' },
  { id: 'assignments', number: 8, title: 'Tugas & Pengumpulan', category: 'KBM & Tugas', icon: Upload, badge: '2 Aktif', description: 'Daftar penugasan mandiri, deadline, workspace upload berkas jawaban, dan riwayat feedback guru' },
  { id: 'my-class', number: 9, title: 'Kelas & Direktori Guru', category: 'KBM & Tugas', icon: Users, description: 'Informasi rombel X-MIPA 1, rekan sekelas, kontak wali kelas, direktori guru pengajar, & konsultasi' },
  { id: 'quiz', number: 10, title: 'Quiz & Ujian CBT Online', category: 'Ujian & Nilai', icon: HelpCircle, badge: 'Siap', description: 'Latihan kuis interaktif berbatas waktu & Computer Based Test resmi (PTS, PAS, US) autosave' },
  { id: 'grades', number: 11, title: 'Nilai, Progress & Rapor', category: 'Ujian & Nilai', icon: FileSpreadsheet, description: 'Rekapitulasi nilai harian, standar KKM 75, radar capaian semester, dan salinan rapor digital' },
  { id: 'attendance', number: 12, title: 'Presensi & Pengajuan Izin', category: 'Kesiswaan', icon: UserCheck, badge: '95.7%', description: 'Riwayat absensi harian gerbang RFID, jam tap, dan layanan formulir pengajuan izin sakit/dispensasi' },
  { id: 'achievements', number: 13, title: 'Prestasi & Ekstrakurikuler', category: 'Kesiswaan', icon: Award, description: 'Portofolio piagam lomba, unggah sertifikat, klub ekskul yang diikuti, jadwal rutin, & pembina' },
  { id: 'counseling-bk', number: 14, title: 'BK Konseling & Kedisiplinan', category: 'Kesiswaan', icon: HeartPulse, badge: 'Privat', description: 'Ruang aman konsultasi bimbingan karir/jurusan, booking jadwal sesi BK, dan catatan tata tertib' },
  { id: 'my-documents', number: 15, title: 'Dokumen, Kartu Pelajar & Event', category: 'Kesiswaan', icon: FolderOpen, badge: 'Digital ID', description: 'Kartu Pelajar digital (QR & Barcode), surat keterangan aktif sekolah, seminar, dan tiket event QR' },
  { id: 'ai-assistant', number: 16, title: 'AI Study Assistant', category: 'Ruang Mandiri', icon: Bot, badge: 'Cerdas', description: 'Asisten belajar cerdas: tanya konsep rumus, ringkasan materi harian, tanya jawab, dan jadwal' },
  { id: 'digital-library', number: 17, title: 'Perpustakaan & Koleksi Favorit', category: 'Ruang Mandiri', icon: Library, description: 'E-Book buku paket Kurikulum Merdeka, modul referensi, video, dan bookmark berkas favorit' },
  { id: 'personal-todos', number: 18, title: 'Catatan & Target Mandiri', category: 'Ruang Mandiri', icon: ListTodo, description: 'Buku catatan belajar digital dengan tag mapel, checklist to-do mandiri, dan pelacak target akademik' },
  { id: 'security-account', number: 19, title: 'Pengaturan Sistem & Keamanan Akun', category: 'Bantuan & Akun', icon: Settings, badge: 'Sistem', description: 'Ganti kata sandi, preferensi KBM, sesi login, 2FA, tema antarmuka & PWA' },
  { id: 'help-support', number: 20, title: 'Pusat Bantuan & FAQ Siswa', category: 'Bantuan & Akun', icon: HelpCircle, badge: 'Helpdesk', description: 'Panduan portal siswa, pencarian FAQ resmi, formulir tiket pengaduan & kontak admin TU' },
  { id: 'goal', number: 21, title: 'Target Akademik & Goals (/goal)', category: 'Ruang Mandiri', icon: Target, badge: 'Target KKM', description: 'Pelacak target nilai KKM, target kehadiran, habit belajar, dan milestones semester' },
  { id: 'learn', number: 22, title: 'Studio Belajar & KBM (/learn)', category: 'KBM & Tugas', icon: BookOpen, badge: 'Studio', description: 'Studio pembelajaran interaktif, catatan digital audio guru & papan tulis, modul KBM' },
  { id: 'boost', number: 23, title: 'Performa & Nilai Booster (/boost)', category: 'Ujian & Nilai', icon: Zap, badge: 'AI Booster', description: 'Booster nilai rapor, diagnostik kelemahan materi, drill soal intensif, & simulator CBT' },
];

export default function StudentHubView({ currentUser, onNavigateTab, initialFeatureId = 'dashboard' }: StudentHubViewProps) {
  const { theme, language, t } = useAppPreferences();
  const [activeFeatureId, setActiveFeatureId] = useState<string>(initialFeatureId);

  useEffect(() => {
    if (initialFeatureId) {
      setActiveFeatureId(initialFeatureId);
    }
  }, [initialFeatureId]);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const [profileData, setProfileData] = useState<any>(null);
  const [subjectsData, setSubjectsData] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any>(null);
  const [materialsData, setMaterialsData] = useState<any>(null);
  const [assignmentsData, setAssignmentsData] = useState<any>(null);
  const [gradesData, setGradesData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [reportCardsData, setReportCardsData] = useState<any>(null);
  const [announcementsData, setAnnouncementsData] = useState<any>(null);
  const [calendarData, setCalendarData] = useState<any>(null);
  const [classMembersData, setClassMembersData] = useState<any>(null);
  
  useEffect(() => {
    if (activeFeatureId === 'profile' && !profileData) {
      fetchStudentProfile().then(data => data && setProfileData(data));
    } else if (activeFeatureId === 'my-subjects' && !subjectsData) {
      import('@/lib/api').then(api => api.fetchStudentSubjects().then(data => data && setSubjectsData(data)));
    } else if (activeFeatureId === 'schedule' && !scheduleData) {
      import('@/lib/api').then(api => api.fetchStudentSchedule().then(data => data && setScheduleData(data)));
    } else if (activeFeatureId === 'materials' && !materialsData) {
      import('@/lib/api').then(api => api.fetchStudentMaterials().then(data => data && setMaterialsData(data)));
    } else if ((activeFeatureId === 'assignments' || activeFeatureId === 'submissions') && !assignmentsData) {
      import('@/lib/api').then(api => api.fetchStudentAssignments().then(data => data && setAssignmentsData(data)));
    } else if (activeFeatureId === 'grades' && !gradesData) {
      import('@/lib/api').then(api => api.fetchStudentGrades().then(data => data && setGradesData(data)));
    } else if (activeFeatureId === 'attendance' && !attendanceData) {
      import('@/lib/api').then(api => api.fetchStudentAttendance().then(data => data && setAttendanceData(data)));
    } else if (activeFeatureId === 'report-cards' && !reportCardsData) {
      import('@/lib/api').then(api => api.fetchStudentReportCards().then(data => data && setReportCardsData(data)));
    } else if (activeFeatureId === 'announcements' && !announcementsData) {
      import('@/lib/api').then(api => api.fetchStudentAnnouncements().then(data => data && setAnnouncementsData(data)));
    } else if (activeFeatureId === 'calendar' && !calendarData) {
      import('@/lib/api').then(api => api.fetchStudentCalendar().then(data => data && setCalendarData(data)));
    } else if ((activeFeatureId === 'my-class' || activeFeatureId === 'my-teachers') && !classMembersData) {
      import('@/lib/api').then(api => api.fetchStudentClassMembers().then(data => data && setClassMembersData(data)));
    }
  }, [activeFeatureId, profileData, subjectsData, scheduleData, materialsData, assignmentsData, gradesData, attendanceData, reportCardsData, announcementsData, calendarData, classMembersData]);

  // Interactive state stores for simulation
  const [leaveType, setLeaveType] = useState('Sakit');
  const [leaveStart, setLeaveStart] = useState('2026-10-05');
  const [leaveEnd, setLeaveEnd] = useState('2026-10-06');
  const [leaveReason, setLeaveReason] = useState('Demam dan flu, disarankan istirahat oleh dokter klinik.');
  const [leaveStatusMsg, setLeaveStatusMsg] = useState('');

  const [counselingTopic, setCounselingTopic] = useState('Perencanaan Karir & Pemilihan Jurusan Kuliah');
  const [counselingDate, setCounselingDate] = useState('2026-10-08');
  const [counselingNotes, setCounselingNotes] = useState('Ingin konsultasi seputar rekomendasi jurusan teknik informatika vs ilmu komputer.');
  const [counselingStatusMsg, setCounselingStatusMsg] = useState('');

  // Personal To-Do interactive state
  const [todos, setTodos] = useState<any[]>([]);
  const [newTodoText, setNewTodoText] = useState('');

  // Personal Notes interactive state
  const [notes, setNotes] = useState<any[]>([]);

  useEffect(() => {
    if (profileData?.user?.id) {
      const storedTodos = localStorage.getItem(`todos_${profileData.user.id}`);
      if (storedTodos) {
        setTodos(JSON.parse(storedTodos));
      } else {
        setTodos([
          { id: 1, text: 'Membaca Bab 3 Gerak Lurus Fisika', category: 'Belajar', done: false, priority: 'Tinggi', deadline: 'Hari Ini' }
        ]);
      }

      const storedNotes = localStorage.getItem(`notes_${profileData.user.id}`);
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes));
      } else {
        setNotes([
          { id: 1, title: 'Rumus Cepat', tag: 'Fisika', date: '01 Okt 2026', content: 'F = m . a' }
        ]);
      }
    }
  }, [profileData]);

  useEffect(() => {
    if (profileData?.user?.id && todos.length > 0) localStorage.setItem(`todos_${profileData.user.id}`, JSON.stringify(todos));
  }, [todos, profileData]);

  useEffect(() => {
    if (profileData?.user?.id && notes.length > 0) localStorage.setItem(`notes_${profileData.user.id}`, JSON.stringify(notes));
  }, [notes, profileData]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState('Umum');

  // Quiz simulator state
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTimer, setQuizTimer] = useState(300); // 5 minutes
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);

  // AI Assistant chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo Ahmad! Saya AI Study Assistant myAcademic. Ada konsep pelajaran yang ingin saya jelaskan, atau butuh bantuan merangkum materi hari ini?',
      time: '07:30',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Settings & Preferences Interactive State (security-account)
  const [settingsTab, setSettingsTab] = useState<'security' | 'profile' | 'appearance' | 'pwa-data'>('security');
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 2FA & Active Sessions
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState('');
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'Windows PC (Chrome 122)', location: 'Jakarta, Indonesia', ip: '180.252.88.14', isCurrent: true, lastActive: 'Aktif Sekarang' },
    { id: 'sess-2', device: 'iPhone 14 (Mobile Safari)', location: 'Bandung, Indonesia', ip: '114.124.21.90', isCurrent: false, lastActive: '2 jam yang lalu' },
    { id: 'sess-3', device: 'iPad Air 5 (myAcademic PWA)', location: 'Bandung, Indonesia', ip: '114.124.21.95', isCurrent: false, lastActive: 'Kemarin, 19:40' },
  ]);

  // Preferences: Notifications & Privacy
  const [notifKbmEmail, setNotifKbmEmail] = useState(true);
  const [notifKbmWa, setNotifKbmWa] = useState(true);
  const [notifTugasWa, setNotifTugasWa] = useState(true);
  const [notifNilaiEmail, setNotifNilaiEmail] = useState(true);
  const [prefPhoneDirectory, setPrefPhoneDirectory] = useState(false);
  const [prefLeaderboardPrivacy, setPrefLeaderboardPrivacy] = useState(true);
  const [prefSavedMsg, setPrefSavedMsg] = useState(false);

  // Preferences: Appearance & Accessibility
  const [displayTheme, setDisplayTheme] = useState<'light' | 'dark' | 'glass'>('glass');
  const [fontSizeKbm, setFontSizeKbm] = useState<'normal' | 'large' | 'compact'>('normal');
  const [appLanguage, setAppLanguage] = useState<'id' | 'en'>('id');
  const [reduceMotion, setReduceMotion] = useState(false);

  // Help & Support Interactive State (help-support)
  const [faqCategory, setFaqCategory] = useState<'semua' | 'akun' | 'kbm' | 'ujian' | 'presensi'>('semua');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Kendala Akun & Login');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketList, setTicketList] = useState([
    { id: 'TKT-8841', subject: 'Kamera Ujian CBT Terdeteksi Hitam di Browser', category: 'Ujian CBT', status: 'Selesai', date: '02 Okt 2026', response: 'Masalah terselesaikan dengan memberikan izin akses kamera di setelan situs Chrome.' },
    { id: 'TKT-9104', subject: 'Kartu Pelajar Digital Barcode tidak terbaca di Perpus', category: 'Kartu Pelajar', status: 'Diproses', date: '04 Okt 2026', response: 'Tim IT perpustakaan sedang memperbarui scanner optik kartu digital.' },
  ]);

  // Schedule state synchronized with central store (Admin, Guru, Siswa)
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [scheduleViewMode, setScheduleViewMode] = useState<'excel' | 'list'>('excel');
  const [scheduleActiveDay, setScheduleActiveDay] = useState<string>('Semua');
  const [scheduleCategoryFilter, setScheduleCategoryFilter] = useState<string>('Semua');
  const [selectedCellCoord, setSelectedCellCoord] = useState<string>('B2');
  const [selectedScheduleLesson, setSelectedScheduleLesson] = useState<{
    coord: string;
    day: string;
    period: string;
    time: string;
    subject: string;
    code: string;
    teacher: string;
    room: string;
    category: string;
    topics?: string;
    status?: string;
  } | null>(null);

  // Admin & Guru Flexible Schedule Management state
  const [isScheduleManageOpen, setIsScheduleManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<'slots' | 'lessons'>('slots');
  const [syncToast, setSyncToast] = useState<string | null>(null);

  // Form: Tambah / Edit Slot Waktu
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotPeriodInput, setSlotPeriodInput] = useState('');
  const [slotStartTimeInput, setSlotStartTimeInput] = useState('07:30');
  const [slotEndTimeInput, setSlotEndTimeInput] = useState('09:00');
  const [slotIsBreakInput, setSlotIsBreakInput] = useState(false);
  const [slotBreakLabelInput, setSlotBreakLabelInput] = useState('');

  // Form: Edit Pelajaran per Sel
  const [selectedEditSlotId, setSelectedEditSlotId] = useState<string>('');
  const [selectedEditDay, setSelectedEditDay] = useState<string>('Senin');
  const [editSubjectInput, setEditSubjectInput] = useState('');
  const [editCodeInput, setEditCodeInput] = useState('');
  const [editTeacherInput, setEditTeacherInput] = useState('');
  const [editRoomInput, setEditRoomInput] = useState('R. 204 Gedung B');
  const [editCategoryInput, setEditCategoryInput] = useState<'MIPA' | 'Bahasa' | 'Informatika' | 'Agama' | 'Sosial' | 'Olahraga' | 'Seni' | 'Umum'>('MIPA');
  const [editTopicsInput, setEditTopicsInput] = useState('');

  const scheduleDays = SCHEDULE_DAYS;
  const dayColMap: Record<string, string> = {
    Senin: 'B',
    Selasa: 'C',
    Rabu: 'D',
    Kamis: 'E',
    Jumat: 'F',
    Sabtu: 'G',
  };

  // Real-time sync subscription with Central School Schedule
  useEffect(() => {
    let baseSlots = getCentralSchedule();
    
    if (scheduleData?.schedule) {
      baseSlots = baseSlots.map(slot => {
        if (slot.isBreak) return slot;
        const newDays: Record<string, any> = { ...slot.days };
        Object.keys(newDays).forEach(k => newDays[k] = null);
        
        scheduleData.schedule.forEach((dbSlot: any) => {
          if (dbSlot.jam_mulai && dbSlot.jam_mulai.substring(0, 5) === slot.startTime) {
            newDays[dbSlot.hari] = {
              subject: dbSlot.subject?.nama_mapel || 'Pelajaran',
              code: 'MAPEL',
              teacher: dbSlot.guru?.name || '-',
              room: 'R. Utama',
              category: 'Umum'
            };
          }
        });
        
        return { ...slot, days: newDays };
      });
      setScheduleSlots(baseSlots);
    } else {
      setScheduleSlots(baseSlots);
    }
    
    const unsubscribe = subscribeToScheduleUpdates((updated) => {
      // If we don't have db override, we can update directly
      if (!scheduleData?.schedule) {
        setScheduleSlots(updated);
      }
    });
    return () => unsubscribe();
  }, [scheduleData]);

  const showSyncNotification = (msg: string) => {
    setSyncToast(msg);
    setTimeout(() => setSyncToast(null), 3500);
  };

  // Auto-populate lesson edit inputs when selected slot or day changes
  useEffect(() => {
    if (!selectedEditSlotId && scheduleSlots.length > 0) {
      const firstRegularSlot = scheduleSlots.find((s) => !s.isBreak) || scheduleSlots[0];
      setSelectedEditSlotId(firstRegularSlot.id);
    }
  }, [scheduleSlots, selectedEditSlotId]);

  useEffect(() => {
    if (!selectedEditSlotId) return;
    const targetSlot = scheduleSlots.find((s) => s.id === selectedEditSlotId);
    if (!targetSlot) return;
    const lesson = targetSlot.days[selectedEditDay];
    if (lesson) {
      setEditSubjectInput(lesson.subject || '');
      setEditCodeInput(lesson.code || '');
      setEditTeacherInput(lesson.teacher || '');
      setEditRoomInput(lesson.room || 'R. 204 Gedung B');
      setEditCategoryInput(lesson.category || 'MIPA');
      setEditTopicsInput(lesson.topics || '');
    } else {
      setEditSubjectInput('');
      setEditCodeInput('');
      setEditTeacherInput('');
      setEditRoomInput('R. 204 Gedung B');
      setEditCategoryInput('MIPA');
      setEditTopicsInput('');
    }
  }, [selectedEditSlotId, selectedEditDay, scheduleSlots]);

  const getCategoryDot = (category?: string) => {
    switch (category) {
      case 'MIPA': return 'bg-sky-600';
      case 'Bahasa': return 'bg-emerald-600';
      case 'Informatika': return 'bg-cyan-600';
      case 'Agama': return 'bg-teal-600';
      case 'Sosial': return 'bg-amber-600';
      case 'Olahraga': return 'bg-rose-500';
      case 'Seni': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  // Handler: Tambah / Update Slot Waktu Fleksibel
  const handleSaveTimeSlot = () => {
    if (!slotPeriodInput || !slotStartTimeInput || !slotEndTimeInput) return;
    const timeFormatted = `${slotStartTimeInput} - ${slotEndTimeInput}`;

    let updated: ScheduleSlot[];
    if (editingSlotId) {
      updated = scheduleSlots.map((s) => {
        if (s.id === editingSlotId) {
          return {
            ...s,
            period: slotPeriodInput,
            time: timeFormatted,
            startTime: slotStartTimeInput,
            endTime: slotEndTimeInput,
            isBreak: slotIsBreakInput,
            breakLabel: slotIsBreakInput ? slotBreakLabelInput || `Istirahat (${timeFormatted} WIB)` : undefined,
          };
        }
        return s;
      });
      showSyncNotification('Waktu sesi berhasil diperbarui & disinkronkan ke pusat.');
    } else {
      const newSlot: ScheduleSlot = {
        id: `slot-${Date.now()}`,
        rowNum: scheduleSlots.length + 1,
        period: slotPeriodInput,
        time: timeFormatted,
        startTime: slotStartTimeInput,
        endTime: slotEndTimeInput,
        isBreak: slotIsBreakInput,
        breakLabel: slotIsBreakInput ? slotBreakLabelInput || `Istirahat (${timeFormatted} WIB)` : undefined,
        days: {}
      };
      updated = [...scheduleSlots, newSlot];
      showSyncNotification('Slot waktu baru berhasil ditambahkan & disinkronkan ke pusat.');
    }

    saveCentralSchedule(updated);
    setEditingSlotId(null);
    setSlotPeriodInput('');
    setSlotStartTimeInput('07:30');
    setSlotEndTimeInput('09:00');
    setSlotIsBreakInput(false);
    setSlotBreakLabelInput('');
  };

  // Handler: Hapus Slot Waktu
  const handleDeleteTimeSlot = (slotId: string) => {
    if (!window.confirm('Yakin ingin menghapus slot waktu ini dari jadwal sekolah?')) return;
    const updated = scheduleSlots.filter((s) => s.id !== slotId);
    saveCentralSchedule(updated);
    showSyncNotification('Slot waktu berhasil dihapus dari jadwal pusat.');
  };

  // Handler: Edit Pelajaran per Sel
  const handleSaveLessonCell = () => {
    if (!selectedEditSlotId || !selectedEditDay) return;

    const updated = scheduleSlots.map((slot) => {
      if (slot.id === selectedEditSlotId) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [selectedEditDay]: editSubjectInput.trim() ? {
              subject: editSubjectInput.trim(),
              code: editCodeInput.trim() || editSubjectInput.trim().substring(0, 3).toUpperCase(),
              teacher: editTeacherInput.trim() || 'Dewan Guru',
              room: editRoomInput.trim() || 'R. 204 Gedung B',
              category: editCategoryInput,
              topics: editTopicsInput.trim() || undefined,
            } : null
          }
        };
      }
      return slot;
    });

    saveCentralSchedule(updated);
    showSyncNotification(`Jadwal ${selectedEditDay} berhasil diperbarui di sistem pusat.`);
  };

  // Handler: Kosongkan Sel
  const handleClearLessonCell = () => {
    if (!selectedEditSlotId || !selectedEditDay) return;

    const updated = scheduleSlots.map((slot) => {
      if (slot.id === selectedEditSlotId) {
        return {
          ...slot,
          days: {
            ...slot.days,
            [selectedEditDay]: null
          }
        };
      }
      return slot;
    });

    saveCentralSchedule(updated);
    setEditSubjectInput('');
    setEditCodeInput('');
    setEditTeacherInput('');
    setEditTopicsInput('');
    showSyncNotification(`Sesi ${selectedEditDay} berhasil dikosongkan.`);
  };

  // Handler: Reset ke jadwal standar
  const handleResetSchedule = () => {
    if (window.confirm('Kembalikan susunan jadwal ke template resmi standar sekolah?')) {
      const def = resetCentralSchedule();
      setScheduleSlots(def);
      showSyncNotification('Jadwal berhasil di-reset ke template resmi sekolah.');
    }
  };

  const handleExportScheduleCSV = () => {
    const headers = ['Waktu / Jam', ...scheduleDays];
    const rows = scheduleSlots.map((slot) => {
      if (slot.isBreak) {
        return [slot.time, slot.breakLabel || 'Istirahat', slot.breakLabel || 'Istirahat', slot.breakLabel || 'Istirahat', slot.breakLabel || 'Istirahat', slot.breakLabel || 'Istirahat', slot.breakLabel || 'Istirahat'];
      }
      return [
        `${slot.period} (${slot.time})`,
        ...scheduleDays.map((d) => {
          const item = slot.days[d];
          return item ? `${item.subject} [${item.code}] - ${item.teacher} (${item.room})` : '-';
        })
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Jadwal_Pelajaran_Siswa_X-MIPA1.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter features
  const filteredFeatures = useMemo(() => {
    return STUDENT_FEATURES.filter((f) => {
      const matchSearch = f.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          f.description.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCat = selectedCategory === 'Semua' || f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchFilter, selectedCategory]);

  const activeFeature = useMemo(() => {
    const raw = STUDENT_FEATURES.find((f) => f.id === activeFeatureId) || STUDENT_FEATURES[0];
    const modKey = `mod.${raw.id.replace(/-/g, '_')}`;
    const descKey = `mod_desc.${raw.id.replace(/-/g, '_')}`;
    const badgeKey = `badge.${raw.id.replace(/-/g, '_')}`;

    const categoryKeyMap: Record<string, string> = {
      'Utama': 'cat.main',
      'KBM & Tugas': 'cat.learning',
      'Ujian & Nilai': 'cat.exams',
      'Kesiswaan': 'cat.student_affairs',
      'Ruang Mandiri': 'cat.independent',
      'Bantuan & Akun': 'cat.support',
    };
    const catKey = categoryKeyMap[raw.category] || '';
    const localizedCategory = catKey && t(catKey) !== catKey ? t(catKey) : raw.category;
    const localizedTitle = t(modKey) !== modKey ? t(modKey) : raw.title;
    const localizedDesc = t(descKey) !== descKey ? t(descKey) : raw.description;
    const localizedBadge = raw.badge && t(badgeKey) !== badgeKey ? t(badgeKey) : raw.badge;

    return {
      ...raw,
      title: localizedTitle,
      category: localizedCategory,
      description: localizedDesc,
      badge: localizedBadge,
    };
  }, [activeFeatureId, t]);

  // Quiz countdown effect
  useEffect(() => {
    let interval: any = null;
    if (quizStarted && !quizSubmitted && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer((prev) => {
          if (prev <= 1) {
            setQuizSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizStarted, quizSubmitted, quizTimer]);

  // Dynamic Subject Grades calculation (KKM 75.0)
  const subjectGrades = useMemo(() => [
    { mapel: 'Informatika & Pemrograman', tugas: 95, kuis: 92, praktik: 98, pts: 91 },
    { mapel: 'Matematika Wajib', tugas: 90, kuis: 92, praktik: 94, pts: 92 },
    { mapel: 'Bahasa Inggris', tugas: 92, kuis: 90, praktik: 94, pts: 90 },
    { mapel: 'Pendidikan Agama Islam', tugas: 90, kuis: 88, praktik: 92, pts: 90 },
    { mapel: 'Bahasa Indonesia', tugas: 90, kuis: 88, praktik: 90, pts: 88 },
    { mapel: 'Kimia Organik', tugas: 88, kuis: 89, praktik: 90, pts: 87 },
    { mapel: 'Biologi Terapan', tugas: 85, kuis: 86, praktik: 88, pts: 82 },
    { mapel: 'Sejarah Indonesia', tugas: 84, kuis: 85, praktik: 86, pts: 82 },
    { mapel: 'Fisika Dasar', tugas: 78, kuis: 76, praktik: 80, pts: 78 },
  ].map((row) => {
    const akhir = Number(((row.tugas + row.kuis + row.praktik + row.pts) / 4).toFixed(1));
    return {
      ...row,
      akhir,
      status: akhir >= 75 ? 'Tuntas' : 'Remedial',
    };
  }), []);

  const semesterAverage = useMemo(() => {
    const total = subjectGrades.reduce((acc, s) => acc + s.akhir, 0);
    return (total / subjectGrades.length).toFixed(1);
  }, [subjectGrades]);

  const handleSendChat = (promptOverride?: string) => {
    const textToSend = promptOverride || chatInput.trim();
    if (!textToSend) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: textToSend, time }]);
    if (!promptOverride) setChatInput('');
    setIsAiTyping(true);

    setTimeout(() => {
      let reply = '';
      const lower = textToSend.toLowerCase();
      if (lower.includes('jadwal') || lower.includes('besok')) {
        reply = 'Jadwal Anda untuk besok (Selasa) meliputi: \n1. **07:30 - 09:00**: Biologi Terapan (Ibu Ratna, Lab Biologi)\n2. **09:15 - 10:45**: Bahasa Inggris (Mr. David, R. 204)\n3. **11:00 - 12:30**: Sejarah Indonesia (Bpk. Subagio, R. 204). Jangan lupa bawa modul Biologi ya!';
      } else if (lower.includes('tugas') || lower.includes('deadline')) {
        reply = 'Ada **2 tugas aktif** yang perlu diperhatikan:\n• **Fisika Dasar**: Laporan Praktikum Hukum Newton (Deadline Besok, 23:59 WIB)\n• **Bahasa Indonesia**: Analisis Novel Siti Nurbaya (Deadline Kamis, 15:00 WIB).\nApakah kamu butuh bantuan menyusun outline laporannya?';
      } else if (lower.includes('nilai') || lower.includes('rapor')) {
        reply = `Rata-rata nilaimu saat ini adalah **${semesterAverage}** (Predikat Sangat Baik / A-). Nilai tertinggimu ada di Informatika & Pemrograman (94.0) disusul Matematika Wajib (92.0), sedangkan nilai yang perlu sedikit ditingkatkan adalah Fisika Dasar (78.0 - KKM 75). Capaianmu sangat bagus!`;
      } else if (lower.includes('newton') || lower.includes('rumus')) {
        reply = '**Hukum Newton:**\n1. **Hukum I (Kelembaman):** $\\Sigma F = 0$, benda diam tetap diam, benda bergerak lurus beraturan tetap bergerak jika tidak ada gaya luar.\n2. **Hukum II:** $\\Sigma F = m \\cdot a$, percepatan sebanding dengan resultan gaya dan berbanding terbalik dengan massa.\n3. **Hukum III:** $F_{aksi} = -F_{reaksi}$.';
      } else {
        reply = `Tentu! Saya telah menganalisis materi terkait "${textToSend}". Inti dari materi ini melibatkan pemahaman konsep dasar, pengaplikasian rumus dalam pemecahan masalah harian, dan latihan evaluasi terstruktur. Ada bagian spesifik yang ingin saya rincikan lebih dalam?`;
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setIsAiTyping(false);
    }, 600);
  };

  const handleToggleTodo = (id: number) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleAddTodo = () => {
    if (!newTodoText.trim()) return;
    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: newTodoText.trim(),
        category: 'Belajar',
        done: false,
        priority: 'Sedang',
        deadline: 'Minggu Ini',
      },
    ]);
    setNewTodoText('');
  };

  const handleAddNote = () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    setNotes([
      {
        id: Date.now(),
        title: newNoteTitle.trim(),
        tag: newNoteTag,
        date: 'Hari Ini',
        content: newNoteContent.trim(),
      },
      ...notes,
    ]);
    setNewNoteTitle('');
    setNewNoteContent('');
  };

  // Special handler: If activeFeatureId is 'security-account', render StudentSettingsModal directly as first-class workspace
  if (activeFeatureId === 'security-account') {
    return (
      <div className="w-full animate-in fade-in duration-200">
        <StudentSettingsModal inline isOpen onClose={() => setActiveFeatureId('dashboard')} currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-200">
      {/* ACTIVE FEATURE DETAIL VIEW WORKSPACE */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.06)] border border-slate-200/90 min-h-[500px]">
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
          {/* ========================================================================= */}
          {/* 1. DASHBOARD SISWA */}
          {/* ========================================================================= */}
          {activeFeatureId === 'dashboard' && (
            <div className="space-y-6">
              {/* Ringkasan Hari Ini & Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-blue-700">
                    <span className="text-xs font-bold uppercase">Kehadiran Bulan Ini</span>
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">95.7%</span>
                    <span className="text-xs text-slate-500 block">22 dari 23 hari KBM</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-700">
                    <span className="text-xs font-bold uppercase">Tugas Belum Selesai</span>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-slate-900">2 Tugas</span>
                    <span className="text-xs text-amber-700 font-medium block">1 Deadline besok</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-sky-700">
                    <span className="text-xs font-semibold uppercase">Ujian Terdekat</span>
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <span className="text-lg font-bold text-slate-900 line-clamp-1">PTS Fisika Dasar</span>
                    <span className="text-xs text-sky-700 font-medium block">3 Hari lagi (12 Okt)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-700">
                    <span className="text-xs font-semibold uppercase">Nilai Terbaru</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-emerald-600">88.5</span>
                    <span className="text-xs text-slate-500 block">Kimia Organik (Tuntas)</span>
                  </div>
                </div>
              </div>

              {/* Jadwal Hari Ini & Presensi Gerbang */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-600" />
                      Jadwal Pelajaran Hari Ini (Senin)
                    </h3>
                    <span className="text-xs font-medium text-slate-500">
                      3 Sesi KBM
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl border-2 border-sky-500 bg-sky-50/40 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-sky-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-bl-lg uppercase tracking-wider">
                        Sedang Berlangsung
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-sky-700">Jam Ke 1 - 2 • 07:30 - 09:00 WIB</span>
                          <h4 className="text-base font-bold text-slate-900 mt-0.5">Matematika Wajib</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Guru: <span className="font-semibold text-slate-900">Drs. Bambang Sudiro, M.Pd</span> • Ruangan: <span className="font-medium">R. 204 Gedung B</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-500">Jam Ke 3 - 4 • 09:15 - 10:45 WIB (Berikutnya)</span>
                          <h4 className="text-base font-semibold text-slate-900 mt-0.5">Bahasa Indonesia</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Guru: <span className="font-semibold text-slate-900">Nurul Hidayati, S.Pd</span> • Ruangan: <span className="font-medium">R. 204 Gedung B</span>
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          Akan Datang
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-all">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-medium text-slate-500">Jam Ke 5 - 6 • 11:00 - 12:30 WIB</span>
                          <h4 className="text-base font-semibold text-slate-900 mt-0.5">Fisika Dasar (Praktikum)</h4>
                          <p className="text-xs text-slate-600 mt-1">
                            Guru: <span className="font-semibold text-slate-900">Ir. Hendra Gunawan, M.T</span> • Ruangan: <span className="font-semibold text-sky-700">Lab Fisika Lt. 1</span>
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                          Akan Datang
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Presensi Hari Ini & Pengumuman Ticker */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80">
                    <span className="text-xs font-semibold uppercase text-emerald-800 tracking-wider">
                      Presensi Hari Ini
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                        H
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">Hadir Tepat Waktu</h4>
                        <p className="text-xs text-slate-600">Scan RFID: 06:52 WIB di Gate 01</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-sky-600" />
                      Informasi & Pengumuman Sekolah
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2.5">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 mt-1.5 shrink-0" />
                        <span>Pelaksanaan PTS Ganjil dijadwalkan mulai 12 Oktober 2026. Persiapkan kartu peserta ujian.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>Pendaftaran Ekstrakurikuler Robotik & PMR diperpanjang sampai akhir pekan ini.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi Cepat Siswa:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
                  <button onClick={() => setActiveFeatureId('schedule')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" /> Jadwal Pelajaran
                  </button>
                  <button onClick={() => setActiveFeatureId('assignments')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-amber-600" /> Tugas Aktif
                  </button>
                  <button onClick={() => setActiveFeatureId('materials')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Materi Pelajaran
                  </button>
                  <button onClick={() => setActiveFeatureId('attendance')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Presensi Saya
                  </button>
                  <button onClick={() => setActiveFeatureId('grades')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600" /> Rekap Nilai
                  </button>
                  <button onClick={() => setActiveFeatureId('announcements')} className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-white hover:bg-sky-50/50 text-xs font-medium text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer">
                    <Bell className="w-3.5 h-3.5 text-rose-600" /> Pengumuman
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. PROFIL SAYA */}
          {/* ========================================================================= */}
          {activeFeatureId === 'profile' && (
            <StudentIdentitySecureView currentUser={currentUser} profileData={profileData} />
          )}

          {/* ========================================================================= */}
          {/* 3. JADWAL PELAJARAN (ENTERPRISE ACADEMIC TIMETABLE MATRIX) */}
          {/* ========================================================================= */}
          {activeFeatureId === 'schedule' && (
            <div className="space-y-5">
              {/* Top Bar: Academic Identity & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 shadow-xs backdrop-blur-xl">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200">
                      Tahun Ajaran 2026/2027 • Ganjil
                    </span>
                    <span className="text-[11px] font-semibold text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-transparent dark:border-sky-500/20">
                      Minggu Efektif Ke-8
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Jadwal Akademik Kelas X-MIPA 1
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Ruang Kelas: <span className="font-semibold text-slate-700 dark:text-slate-200">R. 204 Gedung B</span> • Wali Kelas: <span className="font-semibold text-slate-700 dark:text-slate-200">Dra. Endang Supartini</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center p-1 bg-slate-100 dark:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10">
                    <button
                      onClick={() => setScheduleViewMode('excel')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        scheduleViewMode === 'excel'
                          ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Matriks Mingguan
                    </button>
                    <button
                      onClick={() => setScheduleViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        scheduleViewMode === 'list'
                          ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white shadow-xs font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Agenda Harian
                    </button>
                  </div>

                  <button
                    onClick={() => setIsScheduleManageOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    title="Kelola & Atur Jadwal KBM Terpusat (Admin & Guru)"
                  >
                    <Settings className="w-3.5 h-3.5 text-blue-400 dark:text-white" />
                    Kelola Jadwal (Admin & Guru)
                  </button>
                  <button
                    onClick={handleExportScheduleCSV}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    title="Unduh format spreadsheet (.csv)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    Unduh Excel (.csv)
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                    title="Cetak Jadwal Pelajaran"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    Cetak
                  </button>
                </div>
              </div>

              {/* Toast Notifikasi Sinkronisasi Pusat */}
              {syncToast && (
                <div className="flex items-center justify-between gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{syncToast}</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100/70 dark:bg-emerald-900/60 px-2 py-0.5 rounded">
                    Tersinkronisasi ke Pusat
                  </span>
                </div>
              )}

              {scheduleViewMode === 'excel' ? (
                <div className="space-y-4">
                  {/* Filter & Selector Bar */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs backdrop-blur-xl">
                    {/* Hari Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">Hari:</span>
                      {['Semua', ...scheduleDays].map((day) => {
                        const isToday = day === 'Senin';
                        const isSelected = scheduleActiveDay === day;
                        return (
                          <button
                            key={day}
                            onClick={() => setScheduleActiveDay(day)}
                            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 ${
                              isSelected
                                ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs font-bold'
                                : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {day} {isToday ? '• Hari Ini' : ''}
                          </button>
                        );
                      })}
                    </div>

                    {/* Kategori Mapel */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-[11px]">
                      <span className="font-semibold text-slate-500 dark:text-slate-400 mr-1 shrink-0">Kelompok:</span>
                      {['Semua', 'MIPA', 'Bahasa', 'Informatika', 'Agama', 'Sosial', 'Olahraga', 'Umum'].map((cat) => {
                        const isCatSelected = scheduleCategoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setScheduleCategoryFilter(cat)}
                            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer shrink-0 ${
                              isCatSelected
                                ? 'bg-slate-800 dark:bg-sky-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Main Grid Timetable Table - Clean Professional Excel Layout without Vertical Day Dividers */}
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 shadow-xs overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
                        {/* Table Header Row */}
                        <thead>
                          <tr className="bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                            {/* Column 1: Waktu & Jam (Sticky Left) */}
                            <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-900 border-r border-slate-300 dark:border-white/10 p-3.5 w-44 text-left font-semibold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                <span>WAKTU & SESI</span>
                              </div>
                            </th>

                            {/* Column 2-7: Days - Vertical divider removed between days */}
                            {scheduleDays.map((day) => {
                              const isToday = day === 'Senin';
                              const isDimmed = scheduleActiveDay !== 'Semua' && scheduleActiveDay !== day;

                              return (
                                <th
                                  key={day}
                                  className={`p-3.5 text-center font-semibold text-xs tracking-wider transition-all ${
                                    isToday
                                      ? 'bg-blue-50/50 dark:bg-sky-950/40 text-blue-950 dark:text-sky-300 font-bold border-b-2 border-b-blue-600 dark:border-b-sky-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  } ${isDimmed ? 'opacity-35' : 'opacity-100'}`}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <span className="uppercase">{day}</span>
                                    {isToday && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-600 dark:bg-sky-600 text-white tracking-normal lowercase">
                                        hari ini
                                      </span>
                                    )}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>

                        {/* Table Body */}
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                          {scheduleSlots.map((slot) => {
                            return (
                              <tr
                                key={slot.id || slot.rowNum}
                                className={slot.isBreak ? 'bg-slate-50/80 dark:bg-slate-950/50' : 'bg-white dark:bg-transparent'}
                              >
                                {/* Left Sticky Column: Jam / Waktu */}
                                <td className="sticky left-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-xs border-r border-slate-300 dark:border-white/10 p-3.5 align-middle shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
                                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white tracking-tight">
                                    {slot.time}
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                    {slot.period}
                                  </div>
                                </td>

                                {/* Break Rows - No vertical border between days */}
                                {slot.isBreak ? (
                                  <td
                                    colSpan={scheduleDays.length}
                                    className="p-3 text-center bg-slate-100/70 dark:bg-slate-950/70 text-slate-600 dark:text-slate-400 font-semibold text-xs tracking-wide uppercase"
                                  >
                                    {slot.breakLabel}
                                  </td>
                                ) : (
                                  /* Lesson Cells - No vertical border between days, subtle category dot instead of border-l-2 */
                                  scheduleDays.map((day) => {
                                    const lesson = slot.days[day];
                                    const isDayDimmed = scheduleActiveDay !== 'Semua' && scheduleActiveDay !== day;
                                    const isCatMatch = scheduleCategoryFilter === 'Semua' || (lesson && lesson.category === scheduleCategoryFilter);
                                    const isDimmed = isDayDimmed || !isCatMatch;

                                    if (!lesson) {
                                      return (
                                        <td
                                          key={day}
                                          className={`p-3 text-center align-middle ${
                                            isDimmed ? 'opacity-30' : 'opacity-100'
                                          }`}
                                        >
                                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium italic">
                                            — Selesai KBM —
                                          </span>
                                        </td>
                                      );
                                    }

                                    return (
                                      <td
                                        key={day}
                                        onClick={() => {
                                          setSelectedScheduleLesson({
                                            coord: `${dayColMap[day]}${slot.rowNum}`,
                                            day,
                                            period: slot.period,
                                            time: slot.time,
                                            ...lesson,
                                          });
                                        }}
                                        className={`p-3.5 align-top transition-colors cursor-pointer group bg-white dark:bg-transparent hover:bg-slate-50/80 dark:hover:bg-white/5 ${
                                          isDimmed ? 'opacity-30' : 'opacity-100'
                                        }`}
                                      >
                                        {/* Subject Code, Category Dot & Active Status */}
                                        <div className="flex items-center justify-between gap-1 mb-1.5">
                                          <div className="flex items-center gap-1.5">
                                            <span
                                              className={`w-2 h-2 rounded-full shrink-0 ${getCategoryDot(lesson.category)}`}
                                              title={`Kelompok: ${lesson.category || 'Umum'}`}
                                            />
                                            <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded">
                                              {lesson.code}
                                            </span>
                                          </div>
                                          {lesson.status === 'Sedang Berlangsung' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                              Berlangsung
                                            </span>
                                          )}
                                        </div>

                                        {/* Subject Title */}
                                        <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-sky-400 leading-snug line-clamp-2">
                                          {lesson.subject}
                                        </h4>

                                        {/* Teacher */}
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate mt-1.5">
                                          {lesson.teacher}
                                        </p>

                                        {/* Room */}
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                                          {lesson.room}
                                        </p>
                                      </td>
                                    );
                                  })
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Professional Legend & Table Footnote */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Aksen Kelompok Mapel:</span>
                      <div className="flex flex-wrap items-center gap-3 text-[11px]">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-600" /> MIPA
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" /> Bahasa
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-600" /> Informatika
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-teal-600" /> Agama
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" /> Sosial
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500" /> Olahraga / Seni
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Klik sel jadwal manapun untuk melihat detail silabus & modul pembelajaran.
                    </div>
                  </div>
                </div>
              ) : (
                /* ALTERNATIVE VIEW: AGENDA HARIAN */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {scheduleDays.map((day) => (
                      <button
                        key={day}
                        onClick={() => setScheduleActiveDay(day === 'Semua' ? 'Senin' : day)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          (scheduleActiveDay === 'Semua' ? 'Senin' : scheduleActiveDay) === day
                            ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs font-bold'
                            : 'bg-white dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2.5">
                    {scheduleSlots
                      .filter((slot) => !slot.isBreak)
                      .map((slot, i) => {
                        const targetDay = scheduleActiveDay === 'Semua' ? 'Senin' : scheduleActiveDay;
                        const lesson = slot.days[targetDay];
                        if (!lesson) return null;

                        return (
                          <div
                            key={i}
                            onClick={() => {
                              setSelectedScheduleLesson({
                                coord: `${dayColMap[targetDay]}${slot.rowNum}`,
                                day: targetDay,
                                period: slot.period,
                                time: slot.time,
                                ...lesson,
                              });
                            }}
                            className="p-4 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer hover:shadow-2xs backdrop-blur-xl"
                          >
                            <div className="flex items-start sm:items-center gap-4">
                              <div className="w-28 text-left shrink-0">
                                <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                                  {slot.time}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                                  {slot.period}
                                </span>
                              </div>
                              <div className="border-l border-slate-200 pl-4">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900 text-sm">{lesson.subject}</h4>
                                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                    {lesson.code}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">
                                  Guru: <span className="font-semibold text-slate-900">{lesson.teacher}</span> • Ruang: <span className="font-semibold text-slate-800">{lesson.room}</span>
                                </p>
                              </div>
                            </div>
                            <div>
                              {lesson.status === 'Sedang Berlangsung' ? (
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Sedang Berlangsung
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-slate-500">
                                  Lihat Detail →
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* MODAL POPUP: DETAIL MATA PELAJARAN (MATURE / ENTERPRISE STYLE) */}
              {selectedScheduleLesson && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {selectedScheduleLesson.code}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {selectedScheduleLesson.category}
                          </span>
                          {selectedScheduleLesson.status && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {selectedScheduleLesson.status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">
                          {selectedScheduleLesson.subject}
                        </h3>
                      </div>
                      <button
                        onClick={() => setSelectedScheduleLesson(null)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="py-4 space-y-3.5 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-500 font-medium block">Waktu Pertemuan:</span>
                          <span className="font-bold text-slate-900 mt-1 block">
                            {selectedScheduleLesson.day}, {selectedScheduleLesson.time}
                          </span>
                          <span className="text-[11px] text-slate-500">Alokasi {selectedScheduleLesson.period}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-medium block">Ruang Pembelajaran:</span>
                          <span className="font-bold text-slate-900 mt-1 block">
                            {selectedScheduleLesson.room}
                          </span>
                          <span className="text-[11px] text-slate-500">Kampus Utama</span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 font-medium block">Guru Pengampu:</span>
                        <div className="mt-1.5 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                            <UserIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">
                              {selectedScheduleLesson.teacher}
                            </span>
                            <span className="text-[11px] text-slate-500">Guru Bidang Studi • NIP. 19820412 200801 1 009</span>
                          </div>
                        </div>
                      </div>

                      {selectedScheduleLesson.topics && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-700 font-bold block mb-1">
                            Pokok Bahasan / Silabus Minggu Ini:
                          </span>
                          <p className="text-slate-600 leading-relaxed">
                            {selectedScheduleLesson.topics}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedScheduleLesson(null);
                          setActiveFeatureId('materials');
                        }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                        Buka Modul & Materi
                      </button>
                      <button
                        onClick={() => setSelectedScheduleLesson(null)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL POPUP: KELOLA JADWAL TERPUSAT (ADMIN & GURU PENGELOLA) */}
              {isScheduleManageOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
                    {/* Header Modal */}
                    <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                          <Settings className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">
                              Pengaturan & Fleksibilitas Jadwal KBM Terpusat
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Pusat Aktif
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Role Akses: Admin Kurikulum & Guru Pengelola • Sinkronisasi otomatis ke seluruh portal siswa
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsScheduleManageOpen(false)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-5 pt-3 pb-0 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setManageTab('slots')}
                          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                            manageTab === 'slots'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Atur Jam & Sesi Fleksibel
                        </button>
                        <button
                          onClick={() => setManageTab('lessons')}
                          className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 text-xs font-bold transition-all cursor-pointer ${
                            manageTab === 'lessons'
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          Atur Pelajaran per Hari
                        </button>
                      </div>

                      <button
                        onClick={handleResetSchedule}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[11px] font-semibold text-slate-600 transition-all cursor-pointer"
                        title="Kembalikan struktur jadwal ke template resmi sekolah"
                      >
                        <RefreshCw className="w-3 h-3 text-slate-500" />
                        Reset Template Standar
                      </button>
                    </div>

                    {/* Modal Scrollable Body */}
                    <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                      {/* ============================================================== */}
                      {/* TAB 1: PENGATURAN JAM & SESI WAKTU SANGAT FLEKSIBEL           */}
                      {/* ============================================================== */}
                      {manageTab === 'slots' && (
                        <div className="space-y-6">
                          {/* Alert Fleksibilitas */}
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-3">
                            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block">Keleluasaan Pengaturan Waktu KBM:</span>
                              <p className="text-slate-600 mt-0.5 leading-relaxed">
                                Anda bebas menentukan jam mulai dan selesai untuk setiap sesi KBM (misal: 07:15 - 08:45), menambahkan jam istirahat, sesi apel/literasi, maupun menambah slot jam baru sesuai kebijakan kurikulum sekolah.
                              </p>
                            </div>
                          </div>

                          {/* Form Input Tambah / Edit Slot Jam */}
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3.5">
                            <div className="flex items-center justify-between">
                              <h4 className="font-bold text-xs text-slate-800">
                                {editingSlotId ? 'Ubah Waktu & Detail Slot Jam' : 'Tambah Slot Jam Baru ke Jadwal'}
                              </h4>
                              {editingSlotId && (
                                <button
                                  onClick={() => {
                                    setEditingSlotId(null);
                                    setSlotPeriodInput('');
                                    setSlotStartTimeInput('07:30');
                                    setSlotEndTimeInput('09:00');
                                    setSlotIsBreakInput(false);
                                    setSlotBreakLabelInput('');
                                  }}
                                  className="text-[11px] text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
                                >
                                  Batal Edit
                                </button>
                              )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Label Sesi / Jam Ke-
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Jam 1 - 2, Apel Pagi"
                                  value={slotPeriodInput}
                                  onChange={(e) => setSlotPeriodInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Jam Mulai (WIB)
                                </label>
                                <input
                                  type="time"
                                  value={slotStartTimeInput}
                                  onChange={(e) => setSlotStartTimeInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Jam Selesai (WIB)
                                </label>
                                <input
                                  type="time"
                                  value={slotEndTimeInput}
                                  onChange={(e) => setSlotEndTimeInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-mono"
                                />
                              </div>
                            </div>

                            {/* Pilihan Istirahat / KBM */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={slotIsBreakInput}
                                  onChange={(e) => setSlotIsBreakInput(e.target.checked)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <span className="font-semibold text-xs">
                                  Tandai sebagai Sesi Istirahat / Non-KBM
                                </span>
                              </label>

                              {slotIsBreakInput && (
                                <input
                                  type="text"
                                  placeholder="Keterangan istirahat (contoh: Istirahat Makan Siang & Sholat)"
                                  value={slotBreakLabelInput}
                                  onChange={(e) => setSlotBreakLabelInput(e.target.value)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white sm:w-72"
                                />
                              )}

                              <button
                                onClick={handleSaveTimeSlot}
                                disabled={!slotPeriodInput.trim() || !slotStartTimeInput || !slotEndTimeInput}
                                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs transition-all shadow-xs cursor-pointer ml-auto"
                              >
                                {editingSlotId ? 'Perbarui Slot Jam' : 'Tambah ke Susunan Jadwal'}
                              </button>
                            </div>
                          </div>

                          {/* Daftar Seluruh Slot Jam Saat Ini */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                                Urutan Jam & Sesi Aktif ({scheduleSlots.length} Baris Sesi)
                              </h4>
                              <span className="text-[11px] text-slate-500">
                                Diurutkan sesuai alur KBM harian
                              </span>
                            </div>

                            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                              {scheduleSlots.map((slot, index) => (
                                <div
                                  key={slot.id || index}
                                  className={`p-3.5 flex items-center justify-between gap-4 transition-colors ${
                                    slot.isBreak ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md bg-slate-200/70 text-slate-700 flex items-center justify-center font-mono font-bold text-[11px]">
                                      {index + 1}
                                    </span>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-900 text-xs">
                                          {slot.period}
                                        </span>
                                        {slot.isBreak ? (
                                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                            Istirahat
                                          </span>
                                        ) : (
                                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-blue-50 text-blue-700">
                                            Sesi KBM
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[11px] font-mono text-slate-500">
                                        {slot.time} WIB
                                      </span>
                                      {slot.isBreak && slot.breakLabel && (
                                        <span className="text-[11px] text-slate-500 ml-2 italic">
                                          ({slot.breakLabel})
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingSlotId(slot.id);
                                        setSlotPeriodInput(slot.period);
                                        setSlotStartTimeInput(slot.startTime || slot.time.split(' - ')[0] || '07:30');
                                        setSlotEndTimeInput(slot.endTime || slot.time.split(' - ')[1] || '09:00');
                                        setSlotIsBreakInput(!!slot.isBreak);
                                        setSlotBreakLabelInput(slot.breakLabel || '');
                                      }}
                                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
                                      title="Edit Waktu & Label Sesi"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTimeSlot(slot.id)}
                                      className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition-all cursor-pointer"
                                      title="Hapus Sesi Ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ============================================================== */}
                      {/* TAB 2: PENGATURAN PELAJARAN PER HARI                           */}
                      {/* ============================================================== */}
                      {manageTab === 'lessons' && (
                        <div className="space-y-5">
                          {/* Selector Sesi Jam & Hari */}
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                  1. Pilih Sesi Jam KBM:
                                </label>
                                <select
                                  value={selectedEditSlotId}
                                  onChange={(e) => setSelectedEditSlotId(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium"
                                >
                                  {scheduleSlots.map((slot) => (
                                    <option key={slot.id} value={slot.id}>
                                      {slot.period} ({slot.time}) {slot.isBreak ? '• [Istirahat]' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                                  2. Pilih Hari Pembelajaran:
                                </label>
                                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                  {scheduleDays.map((d) => (
                                    <button
                                      key={d}
                                      onClick={() => setSelectedEditDay(d)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                        selectedEditDay === d
                                          ? 'bg-slate-900 text-white shadow-xs'
                                          : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                      }`}
                                    >
                                      {d}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Mapel Suggester */}
                          <div>
                            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                              Pintasan Cepat Mata Pelajaran:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { name: 'Matematika Wajib', code: 'MTK-10', cat: 'MIPA' as const },
                                { name: 'Fisika Dasar', code: 'FIS-10', cat: 'MIPA' as const },
                                { name: 'Kimia', code: 'KIM-10', cat: 'MIPA' as const },
                                { name: 'Biologi', code: 'BIO-10', cat: 'MIPA' as const },
                                { name: 'Informatika & Coding', code: 'INF-10', cat: 'Informatika' as const },
                                { name: 'Bahasa Indonesia', code: 'BIN-10', cat: 'Bahasa' as const },
                                { name: 'Bahasa Inggris', code: 'ENG-10', cat: 'Bahasa' as const },
                                { name: 'Pendidikan Agama Islam', code: 'PAI-10', cat: 'Agama' as const },
                                { name: 'Sejarah Indonesia', code: 'SEJ-10', cat: 'Sosial' as const },
                                { name: 'PJOK / Olahraga', code: 'PJK-10', cat: 'Olahraga' as const },
                                { name: 'Seni Budaya', code: 'SNB-10', cat: 'Seni' as const },
                              ].map((m) => (
                                <button
                                  key={m.code}
                                  onClick={() => {
                                    setEditSubjectInput(m.name);
                                    setEditCodeInput(m.code);
                                    setEditCategoryInput(m.cat);
                                  }}
                                  className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition-all cursor-pointer"
                                >
                                  + {m.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Form Input Detail Pelajaran */}
                          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Nama Mata Pelajaran
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Matematika Peminatan"
                                  value={editSubjectInput}
                                  onChange={(e) => setEditSubjectInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Kode Mapel
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: MTK-10"
                                  value={editCodeInput}
                                  onChange={(e) => setEditCodeInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Nama Guru Pengampu
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: Drs. Bambang Sudiro, M.Pd"
                                  value={editTeacherInput}
                                  onChange={(e) => setEditTeacherInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Ruangan Kelas / Lab
                                </label>
                                <input
                                  type="text"
                                  placeholder="Contoh: R. 204 Gedung B / Lab Komputer"
                                  value={editRoomInput}
                                  onChange={(e) => setEditRoomInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                />
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Kelompok / Rumpun Mapel
                                </label>
                                <select
                                  value={editCategoryInput}
                                  onChange={(e) => setEditCategoryInput(e.target.value as any)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white font-medium"
                                >
                                  <option value="MIPA">MIPA (Matematika & IPA)</option>
                                  <option value="Bahasa">Bahasa & Sastra</option>
                                  <option value="Informatika">Informatika & Komputer</option>
                                  <option value="Agama">Pendidikan Agama & Budi Pekerti</option>
                                  <option value="Sosial">Ilmu Pengetahuan Sosial & Humaniora</option>
                                  <option value="Olahraga">Pendidikan Jasmani & Olahraga</option>
                                  <option value="Seni">Seni & Prakarya</option>
                                  <option value="Umum">Muatan Umum / Khusus</option>
                                </select>
                              </div>

                              <div className="sm:col-span-2">
                                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                  Pokok Bahasan / Silabus Minggu Ini (Opsional)
                                </label>
                                <textarea
                                  rows={2}
                                  placeholder="Rangkuman topik atau materi yang akan dipelajari siswa pada sesi ini..."
                                  value={editTopicsInput}
                                  onChange={(e) => setEditTopicsInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs resize-none"
                                />
                              </div>
                            </div>

                            {/* Tombol Aksi Simpan / Kosongkan */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                              <button
                                onClick={handleClearLessonCell}
                                className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-all cursor-pointer"
                              >
                                Kosongkan Jadwal di Hari Ini
                              </button>

                              <button
                                onClick={handleSaveLessonCell}
                                disabled={!editSubjectInput.trim()}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <Check className="w-3.5 h-3.5" />
                                Simpan Jadwal ke Pusat
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer Modal */}
                    <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Perubahan tersimpan otomatis di penyimpanan terpusat sekolah.</span>
                      </div>
                      <button
                        onClick={() => setIsScheduleManageOpen(false)}
                        className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-all cursor-pointer"
                      >
                        Selesai & Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. MATA PELAJARAN SAYA */}
          {/* ========================================================================= */}
          {activeFeatureId === 'my-subjects' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectsData?.subjects?.length > 0 ? subjectsData.subjects.map((s: any, idx: number) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {s.jurusan || 'UMUM'}-{s.class_level || 'X'}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          ID: {s.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-base mt-2">{s.nama_mapel}</h4>
                      <p className="text-xs text-slate-500 mt-1">Guru: {s.guru?.name || 'Belum diatur'}</p>
                      <p className="text-xs text-slate-400">{s.deskripsi || 'Tidak ada deskripsi'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Materi & Tugas tersedia</span>
                      <button onClick={() => setActiveFeatureId('materials')} className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer">
                        Buka Mapel <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-3 py-10 text-center text-slate-500">Belum ada mata pelajaran terdaftar untuk kelas Anda.</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. MATERI PEMBELAJARAN */}
          {/* ========================================================================= */}
          {activeFeatureId === 'materials' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['Semua', 'PDF', 'PPT', 'Video', 'DOCX', 'Bookmark'].map((type, i) => {
                    const label = type === 'Semua' ? (t('materials.filter_all') || 'Semua') : (type === 'Bookmark' ? (t('materials.bookmark') || 'Bookmark') : type);
                    return (
                      <button
                        key={type}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          i === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder={t('materials.search_placeholder') || 'Cari judul materi / bab...'}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {materialsData?.materials?.length > 0 ? materialsData.materials.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-2xl border border-slate-200 hover:border-blue-400 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {item.file_id ? 'FILE' : (item.video_link ? 'VID' : 'DOC')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.subject?.nama_mapel || (t('grades.subject') || 'Materi')}
                          </span>
                          <span className="text-xs text-slate-400">• {item.created_at ? new Date(item.created_at).toLocaleDateString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'id-ID') : '-'}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item.judul}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('materials.by') || 'Oleh'} {item.creator?.name || (t('materials.system') || 'Sistem')} • {item.video_link ? (t('materials.video_link') || 'Tautan Video') : (t('materials.document') || 'Dokumen')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer">
                        <Eye className="w-3.5 h-3.5 text-blue-600" /> {t('materials.preview') || 'Preview'}
                      </button>
                      <button className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm">
                        <Download className="w-3.5 h-3.5" /> {t('materials.download') || 'Unduh'}
                      </button>
                      <button className="p-2 rounded-xl border border-slate-200 hover:bg-amber-50 text-slate-400 hover:text-amber-500 cursor-pointer" title={t('materials.save_bookmark') || 'Simpan ke Bookmark'}>
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">{t('materials.empty') || 'Belum ada materi pembelajaran.'}</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. TUGAS & 7. PENGUMPULAN TUGAS */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'assignments' || activeFeatureId === 'submissions') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                    {t('assignments.pending_summary') || '2 Tugas Belum Selesai'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {t('assignments.graded_summary') || '8 Tugas Selesai Dinilai'}
                  </span>
                </div>
                <button
                  onClick={() => setActiveFeatureId('submissions')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> {t('assignments.submit_workspace') || 'Workspace Kumpul Tugas'}
                </button>
              </div>

              {/* Daftar Tugas Card */}
              <div className="space-y-3">
                {assignmentsData?.assignments?.length > 0 ? assignmentsData.assignments.map((assignment: any) => {
                  const submission = assignment.submissions?.[0];
                  const isSubmitted = !!submission;
                  const isGraded = submission?.status === 'graded';
                  const isLate = new Date(assignment.deadline) < new Date() && !isSubmitted;

                  return (
                    <div key={assignment.id} className={`p-5 rounded-2xl border-2 ${isSubmitted ? 'border-emerald-200 bg-emerald-50/30' : (isLate ? 'border-rose-400 bg-rose-50/30' : 'border-amber-400 bg-amber-50/30')} space-y-3`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase ${isLate ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'}`}>
                            Deadline: {new Date(assignment.deadline).toLocaleString(language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : language === 'ar' ? 'ar-SA' : language === 'en' ? 'en-US' : 'id-ID')}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-1.5">
                            {assignment.judul}
                          </h4>
                          <p className="text-xs text-slate-600 mt-1">
                            {t('grades.subject') || 'Mata Pelajaran'}: <span className="font-semibold text-slate-900">{assignment.subject?.nama_mapel}</span> • Guru: {assignment.guru?.name || '-'}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSubmitted ? 'bg-emerald-100 text-emerald-800' : (isLate ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800')}`}>
                          {isSubmitted ? (isGraded ? `${t('assignments.graded') || 'Dinilai'}: ${submission.nilai}/100` : (t('assignments.submitted') || 'Telah Dikumpulkan')) : (isLate ? (t('assignments.late') || 'Terlambat') : (t('assignments.not_submitted') || 'Belum Dikumpulkan'))}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 bg-white/80 p-3 rounded-xl border border-slate-200/60">
                        {assignment.deskripsi || 'Tidak ada instruksi tambahan.'}
                      </p>

                      {!isSubmitted && (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
                          <h5 className="font-bold text-xs text-slate-900">Form Pengumpulan Berkas:</h5>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            const konten = (form.elements.namedItem('konten') as HTMLTextAreaElement).value;
                            if(!konten) return;
                            try {
                              const api = await import('@/lib/api');
                              await api.submitStudentAssignment(assignment.id, konten);
                              alert('Tugas berhasil dikumpulkan!');
                              window.location.reload();
                            } catch (err) {
                              alert('Gagal mengumpulkan tugas.');
                            }
                          }}>
                            <div className="grid grid-cols-1 gap-3 text-xs">
                              <div className="col-span-1">
                                <span className="text-slate-500 block mb-1">Catatan Pengerjaan / Link Berkas:</span>
                                <textarea name="konten" required rows={3} placeholder="Tuliskan jawaban atau link file drive disini..." className="w-full p-2 border rounded-lg text-xs bg-slate-50" />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow cursor-pointer">
                                Kirim Tugas Sekarang
                              </button>
                            </div>
                          </form>
                        </div>
                      )}
                      
                      {isSubmitted && submission.feedback && (
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mt-3 text-xs">
                          <span className="font-bold text-blue-800">Feedback Guru:</span>
                          <p className="text-blue-900 mt-1">{submission.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                }) : (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">Tidak ada tugas saat ini.</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. QUIZ & 9. UJIAN / CBT */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'quiz' || activeFeatureId === 'cbt') && (
            <div className="space-y-6">
              {!quizStarted && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 text-center space-y-4">
                  <Award className="w-12 h-12 text-sky-600 mx-auto" />
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Simulator Kuis & Ujian CBT Siswa
                  </h3>
                  <p className="text-xs text-slate-600 max-w-lg mx-auto">
                    Kuis latihan berbatas waktu dengan sistem autosave jawaban, navigasi butir soal, penandaan ragu-ragu, dan rekap skor otomatis setelah submit.
                  </p>

                  <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-600 font-medium pt-2">
                    <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Jumlah Soal: 5 Soal</span>
                    <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Durasi: 5 Menit</span>
                    <span className="px-3 py-1 bg-white rounded-lg border border-slate-200">Maks Skor: 100</span>
                  </div>

                  <button
                    onClick={() => {
                      setQuizStarted(true);
                      setQuizTimer(300);
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="px-6 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/25 transition-all cursor-pointer"
                  >
                    Mulai Kerjakan Kuis Sekarang
                  </button>
                </div>
              )}

              {quizStarted && !quizSubmitted && (
                <div className="p-6 rounded-2xl border-2 border-sky-500 bg-white space-y-6">
                  {/* Timer & Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-semibold text-sky-700 uppercase">Kuis CBT Fisika: Dinamika Gerak</span>
                      <h4 className="font-bold text-slate-900 text-base">Soal No. 1 dari 5</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-rose-600 animate-pulse" />
                      <span className="font-mono text-base font-bold text-rose-600">
                        {Math.floor(quizTimer / 60)}:{('0' + (quizTimer % 60)).slice(-2)}
                      </span>
                    </div>
                  </div>

                  {/* Soal Content */}
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-slate-800">
                      Sebuah benda bermassa 4 kg berada di atas lantai licin dan ditarik dengan gaya mendatar sebesar 20 N. Berapakah percepatan yang dialami benda tersebut?
                    </p>

                    <div className="space-y-2">
                      {[
                        { key: 'A', text: '2 m/s²' },
                        { key: 'B', text: '5 m/s²' },
                        { key: 'C', text: '10 m/s²' },
                        { key: 'D', text: '80 m/s²' },
                      ].map((opt) => (
                        <label
                          key={opt.key}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                            quizAnswers[1] === opt.key
                              ? 'border-sky-600 bg-sky-50 text-sky-950 font-semibold'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="soal-1"
                            checked={quizAnswers[1] === opt.key}
                            onChange={() => setQuizAnswers({ ...quizAnswers, 1: opt.key })}
                            className="text-sky-600"
                          />
                          <span>{opt.key}. {opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Navigasi & Action */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            num === 1
                              ? 'bg-sky-600 text-white'
                              : quizAnswers[num]
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (flaggedQuestions.includes(1)) {
                            setFlaggedQuestions(flaggedQuestions.filter((q) => q !== 1));
                          } else {
                            setFlaggedQuestions([...flaggedQuestions, 1]);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          flaggedQuestions.includes(1)
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        Tandai Ragu-Ragu
                      </button>
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow transition-all cursor-pointer"
                      >
                        Kirim Jawaban (Submit)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {quizSubmitted && (() => {
                const isCorrect = quizAnswers[1] === 'B';
                const calculatedScore = isCorrect ? 100 : 0;
                const isPassed = calculatedScore >= 75;
                return (
                  <div className={`p-6 rounded-2xl border text-center space-y-4 ${isPassed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                    {isPassed ? (
                      <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    ) : (
                      <AlertTriangle className="w-12 h-12 text-rose-600 mx-auto" />
                    )}
                    <h3 className="text-xl font-bold text-slate-900">Kuis Selesai Dikerjakan!</h3>
                    <p className="text-xs text-slate-600">
                      Jawaban Anda telah tersimpan dan diverifikasi otomatis oleh sistem penilaian CBT.
                    </p>
                    <div className={`text-4xl font-bold ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      Skor: {calculatedScore} <span className="text-xs text-slate-500 font-normal">/ 100 ({isPassed ? 'Tuntas' : 'Belum Tuntas - Perlu Remedial'})</span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Pembahasan: Percepatan $a = F / m = 20 / 4 = 5$ m/s². Jawaban tepat adalah opsi B. {isCorrect ? 'Jawaban Anda tepat (B).' : `Jawaban Anda (${quizAnswers[1] || 'Kosong'}) kurang tepat.`}
                    </p>
                    <button
                      onClick={() => setQuizStarted(false)}
                      className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
                    >
                      Kembali ke Menu Kuis
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 10. NILAI SAYA & 11. PROGRESS AKADEMIK */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'grades' || activeFeatureId === 'progress') && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-sky-600 to-blue-700 text-white shadow-md">
                  <span className="text-xs text-sky-100 uppercase tracking-wider font-medium">Rata-rata Semester</span>
                  <div className="text-3xl font-bold mt-1">{semesterAverage}</div>
                  <span className="text-xs text-sky-100 mt-1 block">Predikat: Sangat Baik (A-)</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Standar KKM / KKTP</span>
                  <div className="text-3xl font-bold text-slate-900 mt-1">75.0</div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">100% Mapel Tuntas KKM</span>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Lintasan Semester</span>
                  <div className="text-xs text-slate-700 font-medium space-y-1 mt-2">
                    <div className="flex justify-between"><span>Semester 1:</span> <span className="font-semibold">78.4</span></div>
                    <div className="flex justify-between"><span>Semester 2:</span> <span className="font-semibold">82.1</span></div>
                    <div className="flex justify-between text-blue-600 font-semibold"><span>Semester 3 (Saat ini):</span> <span>{semesterAverage} ↑</span></div>
                  </div>
                </div>
              </div>

              {/* Tabel Nilai Lengkap per Mapel */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3.5">{t('grades.subject') || 'Mata Pelajaran'}</th>
                      <th className="p-3.5">{t('grades.assignment') || 'Tugas'}</th>
                      <th className="p-3.5">{t('grades.quiz') || 'Kuis'}</th>
                      <th className="p-3.5">{t('grades.practice') || 'Praktik'}</th>
                      <th className="p-3.5">{t('grades.midterm') || 'PTS'}</th>
                      <th className="p-3.5">{t('grades.final') || 'Nilai Akhir'}</th>
                      <th className="p-3.5">{t('grades.status') || 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {gradesData?.grades?.length > 0 ? gradesData.grades.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/60">
                        <td className="p-3.5 font-bold text-slate-900">{row.subject?.nama_mapel}</td>
                        <td className="p-3.5">{row.tugas || '-'}</td>
                        <td className="p-3.5">{row.kuis || '-'}</td>
                        <td className="p-3.5">{row.praktik || '-'}</td>
                        <td className="p-3.5">{row.pts || '-'}</td>
                        <td className="p-3.5 font-bold text-blue-700">{row.nilai_akhir || '-'}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${(row.nilai_akhir >= 75) ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {(row.nilai_akhir >= 75) ? (t('grades.passed') || 'Tuntas') : (t('grades.remedial') || 'Remedial')}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-500">Belum ada data nilai tersedia.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 12. PRESENSI SAYA & 13. PENGAJUAN IZIN */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'attendance' || activeFeatureId === 'leave-request') && (
            <div className="space-y-6">
              {/* Presensi Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-700">Hadir (H)</span>
                  <div className="text-xl font-bold text-emerald-900 mt-1">22 Hari</div>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-blue-700">Izin (I)</span>
                  <div className="text-xl font-bold text-blue-900 mt-1">1 Hari</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-amber-700">Sakit (S)</span>
                  <div className="text-xl font-bold text-amber-900 mt-1">0 Hari</div>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <span className="text-[10px] font-bold uppercase text-rose-700">Alfa (A)</span>
                  <div className="text-xl font-bold text-rose-900 mt-1">0 Hari</div>
                </div>
                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 text-center">
                  <span className="text-[10px] font-semibold uppercase text-orange-700">Terlambat (T)</span>
                  <div className="text-xl font-bold text-orange-900 mt-1">1 Kali</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                  <span className="text-[10px] font-semibold uppercase text-sky-700">Persentase</span>
                  <div className="text-xl font-bold text-sky-900 mt-1">95.7%</div>
                </div>
              </div>

              {/* Form Pengajuan Izin */}
              <div className="p-6 rounded-2xl border border-slate-200 bg-white space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Send className="w-4 h-4 text-blue-600" />
                  Formulir Pengajuan Izin / Sakit / Dispensasi Daring
                </h4>

                {leaveStatusMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                    {leaveStatusMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Tipe Izin:</label>
                    <select
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                    >
                      <option value="Sakit">Sakit (Dengan Surat Dokter)</option>
                      <option value="Izin">Izin Keperluan Keluarga / Mendesak</option>
                      <option value="Dispensasi">Dispensasi Kegiatan Lomba / OSIS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Tanggal Mulai:</label>
                    <input
                      type="date"
                      value={leaveStart}
                      onChange={(e) => setLeaveStart(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Tanggal Selesai:</label>
                    <input
                      type="date"
                      value={leaveEnd}
                      onChange={(e) => setLeaveEnd(e.target.value)}
                      className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-slate-600 block mb-1 font-semibold">Alasan & Rincian Pengajuan:</label>
                    <input
                      type="text"
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      placeholder="Contoh: Demam tinggi, surat dokter terlampir..."
                      className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1 font-semibold">Lampiran Bukti (Foto/PDF):</label>
                    <input type="file" className="w-full text-xs p-1 border rounded-xl bg-slate-50" />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={async () => {
                      try {
                        const api = await import('@/lib/api');
                        const res = await api.submitStudentLeave({
                          type: leaveType,
                          start_date: leaveStart,
                          end_date: leaveEnd,
                          reason: leaveReason
                        });
                        if (res?.success) {
                          setLeaveStatusMsg(res.message);
                          setTimeout(() => setLeaveStatusMsg(''), 5000);
                          setLeaveReason('');
                        }
                      } catch (err) {
                        alert('Gagal mengirim pengajuan izin.');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Kirim Pengajuan Izin
                  </button>
                </div>
              </div>

              {/* Riwayat Pengajuan Izin */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-50 p-3 font-bold text-xs text-slate-700 border-b">
                  Riwayat Pengajuan Izin Semester Ini
                </div>
                <div className="p-3 text-xs divide-y divide-slate-100">
                  <div className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Izin Keperluan Keluarga (1 Hari)</span>
                      <p className="text-slate-500 text-[11px]">28 Sep 2026 • Menghadiri wisuda kakak di Bandung</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Disetujui Wali Kelas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 14. PENGUMUMAN & 15. NOTIFICATION CENTER */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'announcements' || activeFeatureId === 'notifications') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-base">Warta Sekolah & Notifikasi Terpadu</h3>
                </div>
                <button className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">
                  Tandai Semua Dibaca
                </button>
              </div>

              <div className="space-y-3">
                {announcementsData?.announcements?.length > 0 ? announcementsData.announcements.map((n: any, i: number) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all ${
                    n.target_type === 'all' ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {n.target_type === 'all' ? 'Sekolah' : 'Kesiswaan'}
                        </span>
                        {n.target_type === 'all' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600 text-white">
                            Penting
                          </span>
                        )}
                        <span className="text-xs text-slate-400">• {new Date(n.created_at).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-1">{n.title}</h4>
                    <p className="text-xs text-slate-600 mt-1">{n.content}</p>
                  </div>
                )) : (
                  <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">Belum ada pengumuman terbaru.</div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 16. KALENDER SAYA */}
          {/* ========================================================================= */}
          {activeFeatureId === 'calendar' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-sky-600" />
                  <span className="font-bold text-sm text-slate-900">Oktober 2026 (Semester Ganjil)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> KBM</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Deadline Tugas</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Ujian PTS</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Libur</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <h4 className="font-bold text-sm text-slate-900">Agenda Minggu Ini:</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sky-950">Senin, 05 Okt</span>
                        <p className="text-slate-600">Jadwal Praktikum Fisika Lab 1</p>
                      </div>
                      <span className="text-[10px] font-bold text-sky-700">07:30 - 12:30</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-900">Selasa, 06 Okt</span>
                        <p className="text-slate-600">Deadline Pengumpulan Laporan Fisika</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700">23:59 WIB</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-rose-900">Senin, 12 Okt</span>
                        <p className="text-slate-600">Mulai Pelaksanaan Ujian PTS Ganjil</p>
                      </div>
                      <span className="text-[10px] font-bold text-rose-700">1 Pekan</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Tambah Agenda Pribadi Siswa:</h4>
                    <p className="text-xs text-slate-500 mt-1">Catat rencana belajar kelompok atau kegiatan mandiri Anda.</p>
                    <div className="mt-3 space-y-2 text-xs">
                      <input type="text" placeholder="Judul agenda (misal: Belajar kelompok Math)..." className="w-full p-2 border rounded-xl bg-white" />
                      <input type="date" defaultValue="2026-10-09" className="w-full p-2 border rounded-xl bg-white" />
                    </div>
                  </div>
                  <button className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs cursor-pointer">
                    Simpan Agenda ke Kalender
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 17. KELAS SAYA & 18. GURU SAYA */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'my-class' || activeFeatureId === 'my-teachers') && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-sky-800 uppercase">Rombel {classMembersData?.class?.name || 'Kelas'}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">Wali Kelas: {classMembersData?.class?.homeroom_teacher?.name || '-'}</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Anggota: {classMembersData?.class?.students?.length || 0} Siswa
                  </p>
                </div>
                <button
                  onClick={() => setActiveFeatureId('communication')}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow hover:bg-blue-700 shrink-0 cursor-pointer"
                >
                  Kirim Pesan ke Kelas / Guru
                </button>
              </div>

              {/* Teman Sekelas List */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Daftar Rekan Siswa & Guru:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Guru List */}
                  {classMembersData?.teachers?.map((t: any, i: number) => (
                    <div key={`t-${i}`} className="p-3 rounded-xl border border-blue-200 bg-blue-50 flex items-center gap-3 hover:border-blue-300 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-200 flex items-center justify-center text-blue-700 font-bold">
                        {t.name.substring(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{t.name}</h5>
                        <p className="text-[11px] text-blue-600 font-semibold truncate">Guru Mapel</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Siswa List */}
                  {classMembersData?.class?.students?.map((s: any, i: number) => (
                    <div key={`s-${i}`} className="p-3 rounded-xl border border-slate-200 bg-white flex items-center gap-3 hover:border-blue-300 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                        {s.name.substring(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{s.name}</h5>
                        <p className="text-[11px] text-slate-500 truncate">Siswa</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 19. PRESTASI SAYA & 20. EKSTRAKURIKULER */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'achievements' || activeFeatureId === 'extracurricular') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Portofolio Prestasi & Aktivitas Ekstrakurikuler</h3>
                  <p className="text-xs text-slate-500">Catatan keikutsertaan lomba, piagam resmi, dan keaktifan ekskul.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer">
                  <Plus className="w-3.5 h-3.5" /> Upload Sertifikat Baru
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 uppercase">Prestasi Akademik</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Juara 2 Olimpiade Sains Fisika Tingkat Kota</h4>
                  <p className="text-xs text-slate-600">Diselenggarakan oleh Dinas Pendidikan DKI Jakarta • Tahun 2026</p>
                  <div className="flex items-center gap-2 pt-2">
                    <button className="px-3 py-1.5 rounded-lg border text-xs font-semibold hover:bg-slate-50 flex items-center gap-1 cursor-pointer">
                      <Download className="w-3.5 h-3.5 text-blue-600" /> Unduh Sertifikat PDF
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 uppercase">Ekstrakurikuler Terdaftar</span>
                    <Flame className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Klub Robotik & Otomasi</h4>
                  <p className="text-xs text-slate-600">Pembina: Yusuf Ramadhan, S.Kom • Latihan: Setiap Jumat 15:30 WIB di Lab Komputer</p>
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <span className="text-emerald-700 font-semibold">Kehadiran Latihan: 100%</span>
                    <span className="font-bold text-slate-700">Predikat: A (Sangat Baik)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 21. BK / KONSELING & 22. PELANGGARAN / DISIPLIN */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'counseling-bk' || activeFeatureId === 'discipline') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Booking Konseling BK */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{t('bk.private_room_title') || 'Ruang Privat Konseling BK'}</h4>
                      <p className="text-[11px] text-slate-500">{t('bk.private_room_desc') || 'Percakapan dan sesi bimbingan bersifat rahasia dan aman.'}</p>
                    </div>
                  </div>

                  {counselingStatusMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800">
                      {counselingStatusMsg}
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">{t('bk.topic_label') || 'Topik Bimbingan:'}</label>
                      <input
                        type="text"
                        value={counselingTopic}
                        onChange={(e) => setCounselingTopic(e.target.value)}
                        className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">{t('bk.date_label') || 'Pilih Tanggal Sesi:'}</label>
                      <input
                        type="date"
                        value={counselingDate}
                        onChange={(e) => setCounselingDate(e.target.value)}
                        className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1 font-semibold">{t('bk.notes_label') || 'Catatan Awal Siswa:'}</label>
                      <textarea
                        rows={3}
                        value={counselingNotes}
                        onChange={(e) => setCounselingNotes(e.target.value)}
                        className="w-full p-2 border rounded-xl bg-slate-50 font-medium"
                      />
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const api = await import('@/lib/api');
                          const res = await api.submitStudentCounseling({
                            topic: counselingTopic,
                            counselor: 'Nurul Hidayah, S.Psi',
                            preferred_date: counselingDate,
                            notes: counselingNotes
                          });
                          if (res?.success) {
                            setCounselingStatusMsg(res.message);
                            setTimeout(() => setCounselingStatusMsg(''), 5000);
                            setCounselingNotes('');
                          }
                        } catch (err) {
                          alert(t('bk.submit_failed') || 'Gagal mengirim pengajuan konseling.');
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      {t('bk.submit_btn') || 'Ajukan Janji Temu Konseling'}
                    </button>
                  </div>
                </div>

                {/* Transparansi Disiplin */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h4 className="font-bold text-slate-900 text-sm">{t('bk.discipline_title') || 'Catatan Kedisiplinan Siswa'}</h4>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {t('bk.status_very_good') || 'Status: Sangat Baik'}
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-xs text-slate-500 font-semibold uppercase">{t('bk.total_violation_points') || 'Total Poin Pelanggaran'}</span>
                      <div className="text-4xl font-bold text-slate-900 mt-1">
                        0 <span className="text-xs text-slate-400 font-normal">{t('bk.max_points') || '/ 100 Poin Maksimal'}</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-medium mt-1">
                        {t('bk.no_violations') || 'Tidak ada catatan pelanggaran tata tertib tercatat pada semester ini.'}
                      </p>
                    </div>

                    <div className="mt-4 text-xs text-slate-600 space-y-1.5">
                      <p className="font-bold text-slate-800">{t('bk.guidance_standard') || 'Standar Pembinaan:'}</p>
                      <p>{t('bk.rule_good') || '• 0 - 20 Poin: Status Baik / Wajar'}</p>
                      <p>{t('bk.rule_warning') || '• 21 - 50 Poin: Peringatan lisan oleh Wali Kelas'}</p>
                      <p>{t('bk.rule_severe') || '• > 50 Poin: Pemanggilan orang tua & bimbingan intensif'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 23. DOKUMEN SAYA (KARTU PELAJAR DIGITAL) */}
          {/* ========================================================================= */}
          {activeFeatureId === 'my-documents' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Kartu Pelajar Digital & Berkas Resmi</h3>
                  <p className="text-xs text-slate-500">Kartu identitas resmi siswa yang dilengkapi barcode NIS & QR verifikasi sistem.</p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak Kartu Pelajar
                </button>
              </div>

              {/* DIGITAL STUDENT ID CARD (INTERACTIVE) */}
              <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-tr from-slate-900 via-slate-800 to-sky-950 text-white shadow-2xl border border-white/20 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/20 pb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-sky-400" />
                    <div>
                      <h4 className="font-bold text-sm uppercase tracking-wide">KARTU TANDA PELAJAR</h4>
                      <p className="text-[10px] text-sky-200">SMA NEGERI TELADAN JAKARTA</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    AKTIF 2026
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Ahmad"
                    className="w-20 h-24 rounded-xl object-cover ring-2 ring-white/30 shrink-0"
                  />
                  <div className="text-xs space-y-1">
                    <h5 className="font-bold text-sm text-white">AHMAD SISWA TELADAN</h5>
                    <p className="text-sky-200 font-mono">NIS: 20241001</p>
                    <p className="text-sky-200 font-mono">NISN: 0078942189</p>
                    <p className="text-white font-medium">Kelas: X-MIPA 1</p>
                    <p className="text-sky-200">Berlaku: s/d Juni 2027</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
                  <div className="font-mono text-[9px] text-sky-200">
                    <p>||| | |||| | ||| ||||| |||</p>
                    <p>20241001-0078942189</p>
                  </div>
                  <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center text-slate-900" title="QR Code Resmi">
                    <QrCode className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Berkas Akademik Lainnya */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Surat Keterangan Aktif</h5>
                    <span className="text-[10px] text-slate-500">PDF • 120 KB</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer">Unduh</button>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Salinan E-Rapor Semester 2</h5>
                    <span className="text-[10px] text-slate-500">PDF • 1.4 MB</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer">Unduh</button>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Piagam Prestasi Kota</h5>
                    <span className="text-[10px] text-slate-500">PDF • 850 KB</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-xs font-bold cursor-pointer">Unduh</button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 24. EVENT SEKOLAH & 25. KOMUNIKASI CHAT */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'school-events' || activeFeatureId === 'communication') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Event Kegiatan */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    Event & Kegiatan Sekolah
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">Seminar Teknologi</span>
                        <span className="text-xs font-bold text-emerald-700">Terdaftar ✓</span>
                      </div>
                      <h5 className="font-bold text-xs text-slate-900">Workshop AI & Python untuk Generasi Z</h5>
                      <p className="text-[11px] text-slate-500">Sabtu, 17 Okt 2026 • 09:00 WIB di Aula Utama</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">OSIS & Seni</span>
                        <button className="text-xs font-semibold text-sky-700 hover:underline cursor-pointer">Daftar Event</button>
                      </div>
                      <h5 className="font-semibold text-xs text-slate-900">Pentas Seni & Bulan Bahasa 2026</h5>
                      <p className="text-[11px] text-slate-500">28 Okt 2026 • Panggung Terbuka Sekolah</p>
                    </div>
                  </div>
                </div>

                {/* Komunikasi Langsung */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b pb-3">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Komunikasi Terarah Sekolah
                    </h4>
                    <p className="text-xs text-slate-500 mt-2">
                      Pilih penerima pesan untuk konsultasi akademik resmi:
                    </p>
                    <div className="space-y-2 mt-3 text-xs">
                      <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-bold text-slate-900 block">Wali Kelas: Dra. Hj. Siti Aminah</span>
                          <span className="text-slate-500 text-[11px]">Konsultasi kehadiran & catatan rapor</span>
                        </div>
                        <Send className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-bold text-slate-900 block">Guru Fisika: Ir. Hendra Gunawan</span>
                          <span className="text-slate-500 text-[11px]">Tanya seputar laporan praktikum</span>
                        </div>
                        <Send className="w-4 h-4 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 26. SEARCH SUITE, 27. DIGITAL LIBRARY & 28. BOOKMARKS */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'search-suite' || activeFeatureId === 'digital-library' || activeFeatureId === 'bookmarks') && (
            <div className="space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari materi, buku paket digital, tugas, atau nama guru..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-sm text-slate-900">Koleksi E-Book & Sumber Belajar Digital:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { title: 'Buku Siswa: Fisika Kelas X Kurikulum Merdeka (Kemendikbud)', type: 'BSE Resmi', size: '24 MB' },
                    { title: 'Buku Siswa: Matematika Tingkat Lanjut Kelas X', type: 'BSE Resmi', size: '18 MB' },
                    { title: 'Kamus Istilah Kimia & Ensiklopedia Unsur Periodik', type: 'Referensi', size: '12 MB' },
                  ].map((b, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-400 transition-all flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          {b.type}
                        </span>
                        <h5 className="font-bold text-xs text-slate-900 mt-2">{b.title}</h5>
                        <p className="text-[11px] text-slate-400 mt-1">{b.size}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t flex justify-between items-center text-xs">
                        <button className="text-blue-600 font-bold hover:underline cursor-pointer">Buka Buku</button>
                        <Bookmark className="w-3.5 h-3.5 text-slate-400 hover:text-amber-500 cursor-pointer" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 29. PERSONAL NOTES & 30. PERSONAL TO-DO */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'personal-notes' || activeFeatureId === 'personal-todos') && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal To-Do Tracker */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-sky-600" />
                      <h4 className="font-bold text-slate-900 text-sm">Personal Task / To-Do Siswa</h4>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {todos.filter((t) => t.done).length} / {todos.length} Selesai
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTodoText}
                      onChange={(e) => setNewTodoText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
                      placeholder="Tambah to-do pribadi baru..."
                      className="flex-1 p-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/20"
                    />
                    <button
                      onClick={handleAddTodo}
                      className="px-4 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 cursor-pointer shadow-xs"
                    >
                      Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        onClick={() => handleToggleTodo(todo.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs cursor-pointer transition-all ${
                          todo.done ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input type="checkbox" checked={todo.done} readOnly className="rounded text-sky-600" />
                          <span className={todo.done ? 'line-through text-slate-400' : 'font-medium text-slate-800'}>
                            {todo.text}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {todo.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Personal Notes */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <StickyNote className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-slate-900 text-sm">Catatan Belajar Mandiri</h4>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <input
                      type="text"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Judul catatan (misal: Rumus Dinamika)..."
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    />
                    <textarea
                      rows={2}
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Tuliskan intisari materi belajar..."
                      className="w-full p-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                    />
                    <button
                      onClick={handleAddNote}
                      className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs cursor-pointer shadow-xs"
                    >
                      Simpan Catatan
                    </button>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    {notes.map((n) => (
                      <div key={n.id} className="p-3 rounded-xl border border-amber-200/60 bg-amber-50/30 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="font-semibold text-slate-900">{n.title}</span>
                          <span className="text-[10px] font-semibold text-amber-800">{n.tag}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 31. STUDENT PERSONAL ANALYTICS, 32. ACADEMIC GOAL (/goal)                */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* 31. STUDENT PERSONAL ANALYTICS, 32. ACADEMIC GOAL (/goal)                */}
          {/* ========================================================================= */}
          {(activeFeatureId === 'personal-analytics' || activeFeatureId === 'academic-goals' || activeFeatureId === 'goal') && (
            <div className="space-y-6">
              {/* Goal Hero Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-rose-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-400/30">
                        {t('goal.hero_tag')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {t('goal.streak')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{t('goal.hero_title')}</span>
                      <Sparkles className="w-5 h-5 text-rose-300" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      {t('goal.hero_desc')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                    <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center">
                      <span className="text-[10px] text-slate-300 block uppercase">{t('goal.report_target')}</span>
                      <span className="text-xl font-black text-rose-200">92.5</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 Columns: Subject Goals & Personal Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Academic Goal Tracking */}
                <div className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-800/60 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-rose-600" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('goal.semester_title')}</h4>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">{t('goal.kkm_standard')}</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    {[
                      { goal: t('goal.math_target') || 'Target Nilai Matematika Wajib', target: 90.0, currentVal: 92.0, current: '92.0', icon: '📐' },
                      { goal: t('goal.physics_target') || 'Target Nilai Fisika Dasar', target: 85.0, currentVal: 78.0, current: '78.0', icon: '⚡' },
                      { goal: t('goal.chemistry_target') || 'Target Nilai Kimia Organik', target: 85.0, currentVal: 88.5, current: '88.5', icon: '🧪' },
                      { goal: t('goal.attendance_target') || 'Target Kehadiran KBM', target: 98.0, currentVal: 95.7, current: '95.7%', icon: '📅' },
                      { goal: t('goal.assignment_target') || 'Target Penyelesaian Tugas', target: 95.0, currentVal: 96.5, current: '96.5%', icon: '📝' },
                    ].map((g, i) => {
                      const progressPct = Math.min(100, Math.round((g.currentVal / g.target) * 100));
                      const isAchieved = g.currentVal >= g.target;
                      return (
                        <div key={i} className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/10 space-y-2">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{g.icon}</span>
                              <span>{g.goal}</span>
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${isAchieved ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                              {isAchieved ? t('goal.achieved') : `${progressPct}%`}
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isAchieved ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500">
                            <span>{t('goal.target_label')}: {g.target}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{t('goal.actual_label')}: {g.current}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Learning Insights & Milestones */}
                <div className="space-y-5">
                  <div className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-800/60 space-y-4 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
                      <BarChart3 className="w-5 h-5 text-sky-600" />
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('goal.analytics_title')}</h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 block">{t('goal.strength_title')}</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          {t('goal.strength_desc')}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <span className="font-bold text-amber-900 dark:text-amber-300 block">{t('goal.weakness_title')}</span>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">
                          {t('goal.weakness_desc')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Habit Tracker Milestone */}
                  <div className="p-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-800/60 space-y-3 shadow-sm">
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      {t('goal.habit_title')}
                    </h5>
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                      {[
                        t('days.mon') || 'Sen',
                        t('days.tue') || 'Sel',
                        t('days.wed') || 'Rab',
                        t('days.thu') || 'Kam',
                        t('days.fri') || 'Jum',
                        t('days.sat') || 'Sab',
                        t('days.sun') || 'Min'
                      ].map((day, dIdx) => (
                        <div
                          key={day}
                          className={`p-2 rounded-xl border ${dIdx < 5 ? 'bg-emerald-500 text-white border-emerald-600 font-bold' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}
                        >
                          <span className="text-[10px] block">{day}</span>
                          <span className="text-xs">{dIdx < 5 ? '✓' : '-'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 32. STUDIO BELAJAR & KBM (/learn)                                         */}
          {/* ========================================================================= */}
          {activeFeatureId === 'learn' && (
            <div className="space-y-6">
              {/* Learn Hero Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-cyan-950 text-white shadow-xl border border-cyan-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        {t('learn.hero_tag')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/20">
                        {t('learn.active_modules_badge')}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{t('learn.hero_title')}</span>
                      <Sparkles className="w-5 h-5 text-cyan-300" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      {t('learn.hero_desc')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveFeatureId('arsip-belajar')}
                    className="px-5 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
                  >
                    <span>{t('learn.open_archive_btn')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* 4 Interactive Study Quick Hub Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveFeatureId('arsip-belajar')}
                  className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs hover:shadow-md hover:border-cyan-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{t('learn.card1_title')}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{t('learn.card1_desc')}</p>
                </div>

                <div
                  onClick={() => setActiveFeatureId('materials')}
                  className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs hover:shadow-md hover:border-blue-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t('learn.card2_title')}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{t('learn.card2_desc')}</p>
                </div>

                <div
                  onClick={() => setActiveFeatureId('arsip-belajar')}
                  className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs hover:shadow-md hover:border-purple-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('learn.card3_title')}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{t('learn.card3_desc')}</p>
                </div>

                <div
                  onClick={() => setActiveFeatureId('ai-assistant')}
                  className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all cursor-pointer space-y-3 group backdrop-blur-xl"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('learn.card4_title')}</h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{t('learn.card4_desc')}</p>
                </div>
              </div>

              {/* Active Learning Modules Deck */}
              <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      {t('learn.active_modules_title') || 'Modul Pembelajaran KBM Aktif'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('learn.active_modules_desc') || 'Rangkuman kurikulum, materi multimedia, dan evaluasi bab mingguan'}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveFeatureId('materials')}
                    className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                  >
                    <span>{t('learn.view_all_materials') || 'Lihat Semua Materi'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Modul 1 */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300">
                        {t('subj.physics') || 'Fisika'} • {t('common.chapter') || 'Bab'} 4
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">75% {t('common.completed') || 'Selesai'}</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Hukum Gravitasi & Gerak Planet Newton
                    </h5>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-3/4" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Dr. Budi Santoso</span>
                      <button
                        onClick={() => setActiveFeatureId('materials')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {t('common.continue') || 'Lanjutkan'}
                      </button>
                    </div>
                  </div>

                  {/* Modul 2 */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300">
                        {t('subj.math') || 'Matematika'} • {t('common.chapter') || 'Bab'} 5
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">90% {t('common.completed') || 'Selesai'}</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Matriks Invers & Penerapan Sistem Persamaan
                    </h5>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[90%]" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Siti Rahma, M.Pd</span>
                      <button
                        onClick={() => setActiveFeatureId('materials')}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {t('common.continue') || 'Lanjutkan'}
                      </button>
                    </div>
                  </div>

                  {/* Modul 3 */}
                  <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {t('subj.informatics') || 'Informatika'} • {t('common.chapter') || 'Bab'} 3
                      </span>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">45% {t('common.completed') || 'Selesai'}</span>
                    </div>
                    <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                      Algoritma Pencarian & Struktur Data Tree
                    </h5>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Hendra Wijaya, S.Kom</span>
                      <button
                        onClick={() => setActiveFeatureId('materials')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs cursor-pointer transition-colors"
                      >
                        {t('common.continue') || 'Lanjutkan'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 33. PERFORMA BOOSTER & CBT EVALUASI (/boost)                              */}
          {/* ========================================================================= */}
          {activeFeatureId === 'boost' && (
            <div className="space-y-6">
              {/* Boost Hero Banner */}
              <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white shadow-xl border border-amber-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-400/30">
                        {t('boost.hero_tag')}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        {t('boost.potential_badge')}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      <span>{t('boost.hero_title')}</span>
                      <Zap className="w-5 h-5 text-amber-300 animate-bounce" />
                    </h3>
                    <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                      {t('boost.hero_desc')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveFeatureId('quiz')}
                    className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-md flex items-center gap-2 shrink-0 self-start md:self-auto"
                  >
                    <span>{t('boost.start_drill_btn')}</span>
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>

              {/* Diagnostic Weakness Solver Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-5 rounded-3xl border border-amber-300/80 dark:border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/30 backdrop-blur-xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 block">{t('boost.weakness_diagnostic')} 1</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t('boost.diag1_title') || 'Fisika: Hukum Newton & Gaya Bebas'}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('boost.diag1_desc')}
                  </p>
                  <button
                    onClick={() => setActiveFeatureId('arsip-belajar')}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    {t('boost.diag1_btn') || 'Pelajari Rangkuman Fisika'}
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-sky-300/80 dark:border-sky-500/30 bg-sky-50/70 dark:bg-sky-950/30 backdrop-blur-xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-400 block">{t('boost.weakness_diagnostic')} 2</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t('boost.diag2_title') || 'Matematika: Determinan Matriks 3x3'}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('boost.diag2_desc')}
                  </p>
                  <button
                    onClick={() => setActiveFeatureId('quiz')}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    {t('boost.diag2_btn') || 'Drill 5 Soal Matriks'}
                  </button>
                </div>

                <div className="p-5 rounded-3xl border border-emerald-300/80 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 backdrop-blur-xl space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">{t('boost.recommended_practice')}</span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{t('boost.diag3_title') || 'Informatika & Pemrograman'}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {t('boost.diag3_desc')}
                  </p>
                  <button
                    onClick={() => setActiveFeatureId('achievements')}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    {t('boost.diag3_btn') || 'Daftar Sertifikasi / Lomba'}
                  </button>
                </div>
              </div>

              {/* Target Nilai & Score Booster Projection Matrix */}
              <div className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 shadow-xs backdrop-blur-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-500" />
                      {t('boost.matrix_title') || 'Matriks Prediksi Skor Rapor & Simulasi UTBK'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('boost.matrix_desc') || 'Analisis proyeksi peningkatan nilai setelah menyelesaikan paket drill adaptif'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                      {t('boost.target_report') || 'Target Rapor'}: <span className="font-bold">92.5</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('boost.current_avg') || 'Rata-rata Nilai Saat Ini'}</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">87.4</div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> {t('boost.trend_up') || '+2.1 dari semester lalu'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('boost.booster_target') || 'Target Booster Semester'}</span>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">92.5</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('boost.gap_target') || 'Selisih capaian: +5.1 poin'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('boost.cbt_readiness') || 'Kesiapan Tryout CBT'}</span>
                    <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">88%</div>
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold">{t('boost.readiness_level') || 'Taraf Sangat Siap'}</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('boost.recommended_drill') || 'Rekomendasi Drill Hari Ini'}</span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{t('boost.sessions_count') || '3 Sesi'}</div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{t('boost.estimated_time') || 'Estimasi waktu: 30 menit'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => setActiveFeatureId('quiz')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>{t('boost.adaptive_drill_btn') || 'Latihan Soal HOTS Adaptif'}</span>
                  </button>
                  <button
                    onClick={() => setActiveFeatureId('grades')}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-slate-50 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {t('boost.open_grades_btn') || 'Buka Riwayat Nilai Lengkap'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 34. PENGATURAN SISTEM & KEAMANAN AKUN (security-account)                 */}
          {/* ========================================================================= */}

          {/* ========================================================================= */}
          {/* 33. PENGATURAN SISTEM & KEAMANAN AKUN (security-account)                 */}
          {/* ========================================================================= */}
          {activeFeatureId === 'security-account' && (
            <StudentSettingsModal inline isOpen onClose={() => {}} currentUser={currentUser} />
          )}

          {/* ========================================================================= */}
          {/* 34. PUSAT BANTUAN & FAQ SISWA (help-support)                              */}
          {/* ========================================================================= */}
          {activeFeatureId === 'help-support' && (
            <div className="space-y-6">
              {/* Support Hero Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 text-white shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center shrink-0">
                      <HelpCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Pusat Bantuan & Layanan Siswa</h3>
                      <p className="text-xs text-sky-100 mt-0.5">
                        Temukan jawaban cepat untuk pertanyaan seputar login, KBM, ujian CBT, atau buat tiket kendala ke admin TU sekolah.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 border border-white/20 text-white self-start sm:self-auto">
                    Helpdesk Aktif: 07.00 - 16.00 WIB
                  </span>
                </div>

                {/* FAQ Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    placeholder="Ketik kata kunci bantuan (contoh: cara ganti sandi, upload tugas, error kamera ujian)..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-slate-900 text-xs shadow-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>

              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-900">Helpdesk WhatsApp Siswa</h5>
                    <p className="text-[11px] text-slate-500">Respon cepat admin IT untuk kendala login darurat saat jam KBM.</p>
                    <a
                      href="https://wa.me/6281234567890?text=Halo%20Admin%20myAcademic%2C%20saya%20butuh%20bantuan%20teknis"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      Chat WhatsApp Admin →
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-900">Email Tata Usaha (TU)</h5>
                    <p className="text-[11px] text-slate-500">Untuk surat keterangan aktif, mutasi, dan administrasi siswa resmi.</p>
                    <a
                      href="mailto:tatausaha@sekolah.sch.id"
                      className="text-xs font-bold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1 pt-0.5"
                    >
                      tatausaha@sekolah.sch.id →
                    </a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-bold text-xs text-slate-900">Ruang BK & Konseling</h5>
                    <p className="text-[11px] text-slate-500">Konsultasi pribadi bersama guru bimbingan konseling dan karir siswa.</p>
                    <button
                      type="button"
                      onClick={() => setActiveFeatureId('counseling-bk')}
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      Buka Ruang BK Siswa →
                    </button>
                  </div>
                </div>
              </div>

              {/* FAQ & Ticket Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* FAQ Interactive Accordion */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                    <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-sky-600" />
                      Tanya Jawab Populer (FAQ)
                    </h4>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {(['semua', 'akun', 'kbm', 'ujian', 'presensi'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFaqCategory(cat)}
                          className={`px-3 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                            faqCategory === cat
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* FAQ Items */}
                  <div className="space-y-2.5">
                    {[
                      {
                        id: 1,
                        category: 'akun',
                        question: 'Bagaimana cara mengganti kata sandi atau jika saya lupa kata sandi akun?',
                        answer: 'Anda dapat mengganti kata sandi langsung di menu Pengaturan Sistem & Keamanan Akun pada tab "Keamanan & Sandi". Jika Anda lupa kata sandi sama sekali, silakan hubungi Guru Wali Kelas atau Admin IT sekolah dengan membawa bukti Kartu Pelajar untuk reset kredensial.',
                      },
                      {
                        id: 2,
                        category: 'kbm',
                        question: 'Bagaimana alur mengumpulkan tugas mandiri yang berukuran besar?',
                        answer: 'Buka menu "Tugas & Pengumpulan". Untuk berkas di bawah 10 MB, Anda dapat langsung mengunggah file PDF. Untuk berkas besar (video presentasi, slide PPT besar), pastikan Anda mengunggahnya ke Google Drive siswa terlebih dahulu lalu cantumkan tautan Share Drive yang dapat dilihat publik.',
                      },
                      {
                        id: 3,
                        category: 'ujian',
                        question: 'Apa yang harus dilakukan jika layar CBT ujian tiba-tiba freeze atau mati lampu?',
                        answer: 'Jangan panik! Seluruh jawaban ujian tersimpan secara otomatis (autosave) setiap Anda memilih opsi jawaban ke server. Begitu perangkat atau internet kembali normal, silakan login kembali dan buka ujian Anda — durasi tersisa dan jawaban yang sudah dipilih akan tetap aman tersimpan.',
                      },
                      {
                        id: 4,
                        category: 'presensi',
                        question: 'Presensi RFID di gerbang sekolah belum tercatat di portal, bagaimana solusinya?',
                        answer: 'Sinkronisasi mesin RFID gerbang membutuhkan waktu sekitar 5-15 menit saat jam ramai pagi hari. Jika setelah 30 menit status presensi belum berubah, hubungi staf piket atau ajukan konfirmasi kehadiran manual melalui formulir izin di menu "Presensi & Izin".',
                      },
                      {
                        id: 5,
                        category: 'akun',
                        question: 'Bisakah saya memasang portal ini seperti aplikasi HP biasa?',
                        answer: 'Bisa! Portal myAcademic mengusung standar Progressive Web App (PWA). Cukup buka browser Chrome di Android atau Safari di iOS, tekan tombol bagikan/opsi, lalu pilih "Add to Home Screen" (Tambahkan ke Layar Utama).',
                      },
                    ]
                      .filter((item) => {
                        if (faqCategory !== 'semua' && item.category !== faqCategory) return false;
                        if (faqSearchQuery) {
                          const q = faqSearchQuery.toLowerCase();
                          return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
                        }
                        return true;
                      })
                      .map((item) => (
                        <div
                          key={item.id}
                          className="border border-slate-200 rounded-2xl bg-white overflow-hidden transition-all shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                            className="w-full p-4 text-left font-semibold text-xs text-slate-900 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <span>{item.question}</span>
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                                expandedFaqId === item.id ? 'rotate-180 text-sky-600' : ''
                              }`}
                            />
                          </button>
                          {expandedFaqId === item.id && (
                            <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Submit Support Ticket & History */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-4">
                    <div className="border-b border-slate-100 pb-3">
                      <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <Send className="w-4 h-4 text-sky-600" />
                        Kirim Tiket Kendala Baru
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Laporan akan langsung diteruskan ke tim pengelola sistem sekolah.
                      </p>
                    </div>

                    {ticketSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h5 className="font-bold text-xs text-emerald-900">Tiket Berhasil Terkirim!</h5>
                        <p className="text-[11px] text-emerald-800">
                          Tim Helpdesk akan merespons melalui notifikasi portal dan email siswa Anda.
                        </p>
                        <button
                          type="button"
                          onClick={() => setTicketSubmitted(false)}
                          className="mt-2 text-xs font-semibold text-emerald-700 underline cursor-pointer"
                        >
                          Kirim Laporan Lain
                        </button>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!ticketSubject || !ticketMessage) return;
                          const newTicket = {
                            id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                            subject: ticketSubject,
                            category: ticketCategory,
                            status: 'Terkirim',
                            date: 'Hari ini',
                            response: 'Sedang menunggu telaah staf IT sekolah.',
                          };
                          setTicketList([newTicket, ...ticketList]);
                          setTicketSubject('');
                          setTicketMessage('');
                          setTicketSubmitted(true);
                        }}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Kategori Kendala <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                          >
                            <option value="Kendala Akun & Login">Kendala Akun & Login</option>
                            <option value="KBM & Materi Pelajaran">KBM & Materi Pelajaran</option>
                            <option value="Ujian CBT & Jawaban">Ujian CBT & Jawaban</option>
                            <option value="Presensi RFID / Absen">Presensi RFID / Absen</option>
                            <option value="Kartu Pelajar & Dokumen">Kartu Pelajar & Dokumen</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Judul Singkat <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            placeholder="Contoh: Soal CBT nomor 12 tidak muncul gambar"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Deskripsi Rinci Kendala <span className="text-rose-500">*</span>
                          </label>
                          <textarea
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            rows={3}
                            placeholder="Jelaskan kronologi kendala, mapel terkait, atau kode error yang muncul..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-all flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim Tiket Pengaduan
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Ticket History */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <h5 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Riwayat Tiket Anda ({ticketList.length})
                    </h5>

                    <div className="space-y-2.5">
                      {ticketList.map((tkt) => (
                        <div key={tkt.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[11px] text-sky-700">{tkt.id}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tkt.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tkt.status === 'Diproses'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-sky-100 text-sky-800'
                              }`}
                            >
                              {tkt.status}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 text-[11px] line-clamp-1">{tkt.subject}</p>
                          <p className="text-[10px] text-slate-500">{tkt.response}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 36. AI STUDENT ASSISTANT */}
          {/* ========================================================================= */}
          {activeFeatureId === 'ai-assistant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 via-blue-50 to-emerald-50 border border-sky-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">AI Study & Academic Assistant Siswa</h4>
                    <p className="text-xs text-slate-600">Asisten belajar cerdas yang memahami jadwal, materi, dan capaian belajarmu.</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  AI Online
                </span>
              </div>

              {/* Chat Thread Container */}
              <div className="h-80 border border-slate-200 rounded-2xl p-4 overflow-y-auto bg-slate-50/50 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-xl p-3.5 rounded-2xl text-xs whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-sky-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex items-center gap-1.5 text-xs text-sky-600 font-medium p-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> AI sedang menyusun jawaban...
                  </div>
                )}
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-medium shrink-0">Pertanyaan Cepat:</span>
                {[
                  'Besok saya ada pelajaran apa?',
                  'Tugas apa yang deadline minggu ini?',
                  'Bagaimana rekap nilai semester saya?',
                  'Jelaskan rumus Hukum Newton II',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSendChat(chip)}
                    className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium whitespace-nowrap transition-all cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ketik pertanyaan materi, tugas, atau konsep belajar di sini..."
                  className="flex-1 p-3 rounded-2xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={() => handleSendChat()}
                  className="px-5 py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Kirim
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 37. ARSIP BELAJAR AI (STUDIO MULTIMODAL & SECOND BRAIN)                   */}
          {/* ========================================================================= */}
          {activeFeatureId === 'arsip-belajar' && (
            <div className="space-y-6">
              <ArsipBelajarStudio onBackToHub={() => setActiveFeatureId('dashboard')} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
