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
  Plus,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Lock,
  Unlock,
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
  HardDrive,
  CreditCard,
  CheckSquare
} from 'lucide-react';
import { User } from '@/lib/types';
import {
  fetchSchoolAdminDashboard,
  fetchSchoolAdminProfile,
  updateSchoolAdminProfile,
  fetchSchoolAdminSettings,
  updateSchoolAdminSettings,
  fetchSchoolAdminUsers,
  createSchoolAdminUser,
  updateSchoolAdminUser,
  deleteSchoolAdminUser,
  assignSchoolAdminRole,
  toggleSchoolAdminUserStatus,
  resetSchoolAdminPassword,
  fetchSchoolAdminStudents,
  fetchSchoolAdminTeachers,
  fetchSchoolAdminParents,
  fetchSchoolAdminClasses,
  createSchoolAdminClass,
  updateSchoolAdminClass,
  deleteSchoolAdminClass,
  fetchSchoolAdminAcademicYears,
  createSchoolAdminAcademicYear,
  updateSchoolAdminAcademicYear,
  deleteSchoolAdminAcademicYear,
  setActiveSchoolAdminAcademicYear,
  fetchSchoolAdminCalendar,
  fetchSchoolAdminSubjects,
  createSchoolAdminSubject,
  updateSchoolAdminSubject,
  deleteSchoolAdminSubject,
  fetchSchoolAdminSchedules,
  fetchSchoolAdminEnrollment,
  fetchSchoolAdminAttendance,
  correctSchoolAdminAttendance,
  fetchSchoolAdminLearningMonitoring,
  fetchSchoolAdminAcademicMonitoring,
  toggleSchoolAdminGradeLock,
  generateSchoolAdminReportCards,
  fetchSchoolAdminStudentAffairs,
  fetchSchoolAdminCommunication,
  createSchoolAdminAnnouncement,
  fetchSchoolAdminDocuments,
  fetchSchoolAdminImportExport,
  executeSchoolAdminSimulatedImport,
  fetchSchoolAdminReports,
  fetchSchoolAdminDataQuality,
  fetchSchoolAdminRoleAndAudit,
  fetchSchoolAdminArchives,
  fetchSchoolAdminSetupWizard,
  fetchSchoolAdminHealthSubscription
} from '@/lib/api';

export type AdminMenuKey =
  | 'dashboard'
  // 🎯 Major Modes (/goal /learn /boost)
  | 'goal'
  | 'learn'
  | 'boost'
  // 🏫 Sekolah
  | 'sekolah-profil'
  | 'sekolah-pengaturan'
  | 'sekolah-kalender'
  | 'sekolah-tahun-ajaran'
  | 'sekolah-semester'
  // 👥 Pengguna
  | 'pengguna-siswa'
  | 'pengguna-guru'
  | 'pengguna-ortu'
  | 'pengguna-staff'
  | 'pengguna-roles'
  // 🏛️ Akademik
  | 'akademik-rombel'
  | 'akademik-mapel'
  | 'akademik-teaching-assignment'
  | 'akademik-enrollment'
  | 'akademik-kenaikan-kelas'
  // 📅 Jadwal
  | 'jadwal-pelajaran'
  | 'jadwal-jam'
  | 'jadwal-ruangan'
  // 🕐 Presensi
  | 'presensi-siswa'
  | 'presensi-guru'
  | 'presensi-rekap'
  | 'presensi-koreksi'
  // 📚 KBM Monitoring
  | 'kbm-pertemuan'
  | 'kbm-jurnal'
  | 'kbm-materi'
  | 'kbm-tugas'
  | 'kbm-ujian'
  // 📊 Akademik Monitoring
  | 'monitoring-nilai'
  | 'monitoring-gradebook'
  | 'monitoring-ketuntasan'
  | 'monitoring-rapor'
  // 🎓 Siswa
  | 'siswa-mutasi'
  | 'siswa-prestasi'
  | 'siswa-pelanggaran'
  | 'siswa-ekskul'
  | 'siswa-alumni'
  // 📢 Komunikasi
  | 'komunikasi-pengumuman'
  | 'komunikasi-notifikasi'
  | 'komunikasi-broadcast'
  // 📄 Dokumen
  | 'dokumen-siswa'
  | 'dokumen-guru'
  | 'dokumen-arsip'
  // 📥 Import / Export
  | 'io-import'
  | 'io-export'
  | 'io-riwayat'
  // 📊 Laporan
  | 'laporan-siswa'
  | 'laporan-guru'
  | 'laporan-presensi'
  | 'laporan-akademik'
  | 'laporan-sekolah'
  // 🔍 Data Quality
  | 'data-quality'
  // 📝 Audit Log
  | 'audit-log'
  // 🔄 Setup Wizard & Sistem
  | 'setup-wizard'
  | 'system-health'
  | 'settings'
  | 'profile';

export interface SchoolAdminHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  externalActiveMenu?: AdminMenuKey;
  onMenuChange?: (menu: AdminMenuKey) => void;
  hideSidebar?: boolean;
  hideHeader?: boolean;
}

export default function SchoolAdminHubView({
  currentUser,
  onNavigateTab,
  externalActiveMenu,
  onMenuChange,
  hideSidebar = false,
  hideHeader = false,
}: SchoolAdminHubViewProps) {
  // Navigation State
  const [internalActiveMenu, setInternalActiveMenu] = useState<AdminMenuKey>('dashboard');
  const activeMenu = externalActiveMenu !== undefined ? externalActiveMenu : internalActiveMenu;
  const setActiveMenu = (menu: AdminMenuKey) => {
    setInternalActiveMenu(menu);
    if (onMenuChange) onMenuChange(menu);
  };
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    sekolah: true,
    pengguna: true,
    akademik: false,
    jadwal: false,
    presensi: false,
    kbm: false,
    monitoring: false,
    siswa: false,
    komunikasi: false,
    dokumen: false,
    io: false,
    laporan: false,
  });

  // Dynamic Data States
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Core Data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [settingsData, setSettingsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [parentsList, setParentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [teachingAssignments, setTeachingAssignments] = useState<any[]>([]);
  const [schedulesList, setSchedulesList] = useState<any[]>([]);
  const [roomsList, setRoomsList] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [kbmData, setKbmData] = useState<any>(null);
  const [monitoringData, setMonitoringData] = useState<any>(null);
  const [studentAffairsData, setStudentAffairsData] = useState<any>(null);
  const [communicationData, setCommunicationData] = useState<any>(null);
  const [documentsData, setDocumentsData] = useState<any[]>([]);
  const [importExportData, setImportExportData] = useState<any>(null);
  const [dataQualityData, setDataQualityData] = useState<any>(null);
  const [roleAndAuditData, setRoleAndAuditData] = useState<any>(null);
  const [wizardData, setWizardData] = useState<any>(null);
  const [healthSubData, setHealthSubData] = useState<any>(null);

  // Modals & Forms
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'guru', password: '' });
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<any>(null);
  const [correctionReason, setCorrectionReason] = useState('');
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  // CRUD Master Data: Academic Years
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [isEditYearModalOpen, setIsEditYearModalOpen] = useState(false);
  const [selectedYearForEdit, setSelectedYearForEdit] = useState<any>(null);
  const [yearForm, setYearForm] = useState({ name: '', semester: 'Ganjil', start_date: '', end_date: '', is_active: false, description: '' });

  // CRUD Master Data: Classes (Rombel)
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [selectedClassForEdit, setSelectedClassForEdit] = useState<any>(null);
  const [classForm, setClassForm] = useState({ nama_kelas: '', level: '10', jurusan: 'Umum', capacity: 36, guru_id: '', academic_year_id: '', deskripsi: '' });

  // CRUD Master Data: Subjects (Mata Pelajaran)
  const [isAddSubjectModalOpen, setIsAddSubjectModalOpen] = useState(false);
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [selectedSubjectForEdit, setSelectedSubjectForEdit] = useState<any>(null);
  const [subjectForm, setSubjectForm] = useState({ nama_mapel: '', code: '', category: 'Wajib', class_level: '10', jurusan: 'Umum', guru_id: '', deskripsi: '' });

  // CRUD User & Role Management
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any>(null);
  const [editUserForm, setEditUserForm] = useState({ name: '', email: '', role: 'guru', lifecycle_status: 'aktif', password: '' });
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<any>(null);
  const [newRoleToAssign, setNewRoleToAssign] = useState('guru');

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Initial Load
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchSchoolAdminDashboard(),
      fetchSchoolAdminProfile(),
      fetchSchoolAdminSettings(),
      fetchSchoolAdminUsers(),
      fetchSchoolAdminStudents(),
      fetchSchoolAdminTeachers(),
      fetchSchoolAdminParents(),
      fetchSchoolAdminClasses(),
      fetchSchoolAdminAcademicYears(),
      fetchSchoolAdminCalendar(),
      fetchSchoolAdminSubjects(),
      fetchSchoolAdminSchedules(),
      fetchSchoolAdminAttendance(),
      fetchSchoolAdminLearningMonitoring(),
      fetchSchoolAdminAcademicMonitoring(),
      fetchSchoolAdminStudentAffairs(),
      fetchSchoolAdminCommunication(),
      fetchSchoolAdminDocuments(),
      fetchSchoolAdminImportExport(),
      fetchSchoolAdminDataQuality(),
      fetchSchoolAdminRoleAndAudit(),
      fetchSchoolAdminSetupWizard(),
      fetchSchoolAdminHealthSubscription(),
    ])
      .then(
        ([
          dash,
          prof,
          sett,
          users,
          stus,
          teas,
          pars,
          clas,
          years,
          cal,
          subs,
          scheds,
          att,
          kbm,
          mon,
          affairs,
          comm,
          docs,
          io,
          dq,
          rolesAudit,
          wiz,
          healthSub,
        ]) => {
          if (dash) setDashboardData(dash);
          if (prof?.profile) setProfileData(prof.profile);
          if (sett?.settings) setSettingsData(sett.settings);
          if (users?.users) setUsersList(users.users);
          if (stus?.students) setStudentsList(stus.students);
          if (teas?.teachers) setTeachersList(teas.teachers);
          if (pars?.parents) setParentsList(pars.parents);
          if (clas?.classes) setClassesList(clas.classes);
          if (years?.years) setAcademicYears(years.years);
          if (cal?.events) setCalendarEvents(cal.events);
          if (subs?.subjects) setSubjectsList(subs.subjects);
          if (subs?.teaching_assignments) setTeachingAssignments(subs.teaching_assignments);
          if (scheds?.schedules) setSchedulesList(scheds.schedules);
          if (scheds?.rooms) setRoomsList(scheds.rooms);
          if (att) setAttendanceData(att);
          if (kbm) setKbmData(kbm);
          if (mon) setMonitoringData(mon);
          if (affairs) setStudentAffairsData(affairs);
          if (comm) setCommunicationData(comm);
          if (docs?.documents) setDocumentsData(docs.documents);
          if (io) setImportExportData(io);
          if (dq) setDataQualityData(dq);
          if (rolesAudit) setRoleAndAuditData(rolesAudit);
          if (wiz) setWizardData(wiz);
          if (healthSub) setHealthSubData(healthSub);
        }
      )
      .catch((err: any) => {
        toast.error('Gagal memuat data. Silakan coba lagi.');
      })
      .finally(() => setLoading(false));
  }, []);

  // Action Handlers
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) return;
    const res = await createSchoolAdminUser(newUserForm);
    if (res?.success) {
      showToast(res.message || 'User berhasil ditambahkan.');
      setUsersList((prev) => [
        {
          id: Date.now(),
          name: newUserForm.name,
          email: newUserForm.email,
          role: newUserForm.role,
          status: 'Aktif',
          class_name: 'Ditetapkan',
          created_at: 'Hari ini',
        },
        ...prev,
      ]);
      setIsAddUserModalOpen(false);
      setNewUserForm({ name: '', email: '', role: 'guru', password: '' });
    }
  };

  const handleResetPassword = async (user: any) => {
    const res = await resetSchoolAdminPassword(user.id);
    showToast(res?.message || `Password untuk ${user.name} berhasil direset.`);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    try {
      const res = await updateSchoolAdminUser(selectedUserForEdit.id, editUserForm);
      if (res?.success) {
        showToast(res.message || 'User berhasil diperbarui.');
        setIsEditUserModalOpen(false);
        setSelectedUserForEdit(null);
        const fresh = await fetchSchoolAdminUsers();
        if (fresh?.users) setUsersList(fresh.users);
      } else {
        toast.error(res?.message || 'Gagal memperbarui user');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus akun user ini?')) return;
    try {
      const res = await deleteSchoolAdminUser(id);
      if (res?.success) {
        showToast(res.message || 'User berhasil dihapus.');
        const fresh = await fetchSchoolAdminUsers();
        if (fresh?.users) setUsersList(fresh.users);
      } else {
        toast.error(res?.message || 'Gagal menghapus user');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForRole) return;
    try {
      const res = await assignSchoolAdminRole(selectedUserForRole.id, newRoleToAssign);
      if (res?.success) {
        showToast(res.message || 'Role user berhasil diperbarui.');
        setIsAssignRoleModalOpen(false);
        setSelectedUserForRole(null);
        const fresh = await fetchSchoolAdminUsers();
        if (fresh?.users) setUsersList(fresh.users);
      } else {
        toast.error(res?.message || 'Gagal mengubah role user');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleToggleStatus = async (user: any) => {
    try {
      const res = await toggleSchoolAdminUserStatus(user.id);
      if (res?.success) {
        showToast(res.message || 'Status user berhasil diubah.');
        const fresh = await fetchSchoolAdminUsers();
        if (fresh?.users) setUsersList(fresh.users);
      } else {
        toast.error(res?.message || 'Gagal mengubah status');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  // Master Data Handlers: Academic Years
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearForm.name) return;
    try {
      const res = await createSchoolAdminAcademicYear(yearForm);
      if (res?.success) {
        showToast(res.message || 'Tahun ajaran berhasil ditambahkan.');
        setIsAddYearModalOpen(false);
        setYearForm({ name: '', semester: 'Ganjil', start_date: '', end_date: '', is_active: false, description: '' });
        const fresh = await fetchSchoolAdminAcademicYears();
        if (fresh?.years) setAcademicYears(fresh.years);
      } else {
        toast.error(res?.message || 'Gagal menambahkan tahun ajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYearForEdit) return;
    try {
      const res = await updateSchoolAdminAcademicYear(selectedYearForEdit.id, yearForm);
      if (res?.success) {
        showToast(res.message || 'Tahun ajaran berhasil diperbarui.');
        setIsEditYearModalOpen(false);
        setSelectedYearForEdit(null);
        const fresh = await fetchSchoolAdminAcademicYears();
        if (fresh?.years) setAcademicYears(fresh.years);
      } else {
        toast.error(res?.message || 'Gagal memperbarui tahun ajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteYear = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tahun ajaran ini?')) return;
    try {
      const res = await deleteSchoolAdminAcademicYear(id);
      if (res?.success) {
        showToast(res.message || 'Tahun ajaran berhasil dihapus.');
        const fresh = await fetchSchoolAdminAcademicYears();
        if (fresh?.years) setAcademicYears(fresh.years);
      } else {
        toast.error(res?.message || 'Gagal menghapus tahun ajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan saat menghapus');
    }
  };

  const handleSetActiveYear = async (id: number) => {
    try {
      const res = await setActiveSchoolAdminAcademicYear(id);
      if (res?.success) {
        showToast(res.message || 'Tahun ajaran berhasil diaktifkan secara global!');
        const fresh = await fetchSchoolAdminAcademicYears();
        if (fresh?.years) setAcademicYears(fresh.years);
      } else {
        toast.error(res?.message || 'Gagal mengaktifkan tahun ajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  // Master Data Handlers: Classes (Rombel)
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.nama_kelas) return;
    try {
      const res = await createSchoolAdminClass(classForm);
      if (res?.success) {
        showToast(res.message || 'Kelas berhasil ditambahkan.');
        setIsAddClassModalOpen(false);
        setClassForm({ nama_kelas: '', level: '10', jurusan: 'Umum', capacity: 36, guru_id: '', academic_year_id: '', deskripsi: '' });
        const fresh = await fetchSchoolAdminClasses();
        if (fresh?.classes) setClassesList(fresh.classes);
      } else {
        toast.error(res?.message || 'Gagal membuat kelas');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForEdit) return;
    try {
      const res = await updateSchoolAdminClass(selectedClassForEdit.id, classForm);
      if (res?.success) {
        showToast(res.message || 'Kelas berhasil diperbarui.');
        setIsEditClassModalOpen(false);
        setSelectedClassForEdit(null);
        const fresh = await fetchSchoolAdminClasses();
        if (fresh?.classes) setClassesList(fresh.classes);
      } else {
        toast.error(res?.message || 'Gagal memperbarui kelas');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kelas ini?')) return;
    try {
      const res = await deleteSchoolAdminClass(id);
      if (res?.success) {
        showToast(res.message || 'Kelas berhasil dihapus.');
        const fresh = await fetchSchoolAdminClasses();
        if (fresh?.classes) setClassesList(fresh.classes);
      } else {
        toast.error(res?.message || 'Gagal menghapus kelas');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  // Master Data Handlers: Subjects (Mata Pelajaran)
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.nama_mapel) return;
    try {
      const res = await createSchoolAdminSubject(subjectForm);
      if (res?.success) {
        showToast(res.message || 'Mata pelajaran berhasil ditambahkan.');
        setIsAddSubjectModalOpen(false);
        setSubjectForm({ nama_mapel: '', code: '', category: 'Wajib', class_level: '10', jurusan: 'Umum', guru_id: '', deskripsi: '' });
        const fresh = await fetchSchoolAdminSubjects();
        if (fresh?.subjects) setSubjectsList(fresh.subjects);
      } else {
        toast.error(res?.message || 'Gagal menambahkan mata pelajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleUpdateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectForEdit) return;
    try {
      const res = await updateSchoolAdminSubject(selectedSubjectForEdit.id, subjectForm);
      if (res?.success) {
        showToast(res.message || 'Mata pelajaran berhasil diperbarui.');
        setIsEditSubjectModalOpen(false);
        setSelectedSubjectForEdit(null);
        const fresh = await fetchSchoolAdminSubjects();
        if (fresh?.subjects) setSubjectsList(fresh.subjects);
      } else {
        toast.error(res?.message || 'Gagal memperbarui mata pelajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) return;
    try {
      const res = await deleteSchoolAdminSubject(id);
      if (res?.success) {
        showToast(res.message || 'Mata pelajaran berhasil dihapus.');
        const fresh = await fetchSchoolAdminSubjects();
        if (fresh?.subjects) setSubjectsList(fresh.subjects);
      } else {
        toast.error(res?.message || 'Gagal menghapus mata pelajaran');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleToggleGradeLock = async (gradebookId: number) => {
    const res = await toggleSchoolAdminGradeLock(gradebookId);
    showToast(res?.message || 'Status penguncian nilai akademik berhasil diubah.');
    setMonitoringData((prev: any) => {
      if (!prev?.gradebooks) return prev;
      return {
        ...prev,
        gradebooks: prev.gradebooks.map((g: any) =>
          g.id === gradebookId ? { ...g, is_locked: !g.is_locked } : g
        ),
      };
    });
  };

  const handleBatchGenerateRapor = async () => {
    const res = await generateSchoolAdminReportCards();
    showToast(res?.message || 'Batch penerbitan e-Rapor 472 siswa berhasil dibuat!');
  };

  const handleCorrectAttendance = async () => {
    if (!selectedCorrection) return;
    const res = await correctSchoolAdminAttendance({
      attendance_id: selectedCorrection.id,
      new_status: selectedCorrection.requested_status,
      correction_reason: correctionReason || selectedCorrection.reason,
    });
    showToast(res?.message || 'Presensi berhasil dikoreksi administratif.');
    setIsCorrectionModalOpen(false);
    // remove from pending
    setAttendanceData((prev: any) => ({
      ...prev,
      pending_corrections: prev?.pending_corrections?.filter((c: any) => c.id !== selectedCorrection.id) || [],
    }));
  };

  const handleSimulateImport = async (category: string) => {
    const res = await executeSchoolAdminSimulatedImport(category);
    showToast(res?.message || `Import data ${category} selesai tanpa error.`);
  };

  return (
    <div className="w-full flex flex-col gap-6 selection:bg-slate-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: School Operational Authority */}
      {!hideHeader && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>PORTAL ADMIN SEKOLAH — PENGELOLA OPERASIONAL & DATA SISTEM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {profileData?.nama_sekolah || 'SMA Negeri Unggulan 1 Jakarta'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              NPSN: <span className="font-mono font-bold text-white">{profileData?.npsn || '20109988'}</span> • Akreditasi:{' '}
              <span className="text-emerald-300 font-bold">{profileData?.akreditasi || 'A (Unggul)'}</span> • Tahun Ajaran:{' '}
              <span className="text-indigo-200 font-bold">2026/2027 (Ganjil)</span>
            </p>
          </div>

          {/* Operational Indicators */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMenu('data-quality')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Data Quality: {dataQualityData?.total_issues || 5} Perlu Aksi</span>
            </button>
            <button
              onClick={() => setActiveMenu('setup-wizard')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Setup Wizard Awal Tahun</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Sidebar Menu + Workspace Content */}
      <div className={hideSidebar ? "w-full" : "grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"}>
        {/* =========================================================================
            SIDEBAR STRUKTUR MENU ADMIN SEKOLAH (FITUR 49 SPESIFIKASI PERSIS)
        ========================================================================= */}
        {!hideSidebar && (
        <aside className="lg:col-span-3 bg-white rounded-3xl p-4 border border-slate-200/80 shadow-sm flex flex-col gap-2 max-h-[88vh] overflow-y-auto sticky top-20 text-xs font-medium">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Navigasi Admin Sekolah</span>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full text-slate-600 font-bold">49 Modul</span>
          </div>

          {/* 1. Dashboard */}
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-left font-bold transition-all cursor-pointer ${
              activeMenu === 'dashboard'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>🏠 Dashboard</span>
          </button>

          {/* 2. Sekolah Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('sekolah')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <SchoolIcon className="w-4 h-4 text-indigo-600" />
                <span>🏫 Sekolah</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.sekolah ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.sekolah && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('sekolah-profil')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'sekolah-profil' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Profil Sekolah
                </button>
                <button
                  onClick={() => setActiveMenu('sekolah-pengaturan')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'sekolah-pengaturan' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pengaturan Sekolah
                </button>
                <button
                  onClick={() => setActiveMenu('sekolah-kalender')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'sekolah-kalender' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Kalender Akademik
                </button>
                <button
                  onClick={() => setActiveMenu('sekolah-tahun-ajaran')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'sekolah-tahun-ajaran' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tahun Ajaran
                </button>
                <button
                  onClick={() => setActiveMenu('sekolah-semester')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'sekolah-semester' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semester
                </button>
              </div>
            )}
          </div>

          {/* 3. Pengguna Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('pengguna')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>👥 Pengguna</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.pengguna ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.pengguna && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('pengguna-siswa')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'pengguna-siswa' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('pengguna-guru')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'pengguna-guru' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Guru
                </button>
                <button
                  onClick={() => setActiveMenu('pengguna-ortu')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'pengguna-ortu' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Orang Tua
                </button>
                <button
                  onClick={() => setActiveMenu('pengguna-staff')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'pengguna-staff' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Staff Sekolah
                </button>
                <button
                  onClick={() => setActiveMenu('pengguna-roles')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'pengguna-roles' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Role & Permission
                </button>
              </div>
            )}
          </div>

          {/* 4. Akademik Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('akademik')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>🏛️ Akademik</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.akademik ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.akademik && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('akademik-rombel')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'akademik-rombel' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Kelas / Rombel
                </button>
                <button
                  onClick={() => setActiveMenu('akademik-mapel')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'akademik-mapel' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mata Pelajaran
                </button>
                <button
                  onClick={() => setActiveMenu('akademik-teaching-assignment')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'akademik-teaching-assignment' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Teaching Assignment
                </button>
                <button
                  onClick={() => setActiveMenu('akademik-enrollment')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'akademik-enrollment' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Student Enrollment
                </button>
                <button
                  onClick={() => setActiveMenu('akademik-kenaikan-kelas')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'akademik-kenaikan-kelas' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Kenaikan Kelas
                </button>
              </div>
            )}
          </div>

          {/* 5. Jadwal Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('jadwal')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>📅 Jadwal</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.jadwal ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.jadwal && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('jadwal-pelajaran')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'jadwal-pelajaran' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Jadwal Pelajaran
                </button>
                <button
                  onClick={() => setActiveMenu('jadwal-jam')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'jadwal-jam' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Jam Pelajaran
                </button>
                <button
                  onClick={() => setActiveMenu('jadwal-ruangan')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'jadwal-ruangan' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ruangan
                </button>
              </div>
            )}
          </div>

          {/* 6. Presensi Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('presensi')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>🕐 Presensi</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.presensi ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.presensi && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('presensi-siswa')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'presensi-siswa' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Presensi Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('presensi-guru')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'presensi-guru' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Presensi Guru
                </button>
                <button
                  onClick={() => setActiveMenu('presensi-rekap')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'presensi-rekap' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rekap Presensi
                </button>
                <button
                  onClick={() => setActiveMenu('presensi-koreksi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'presensi-koreksi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Koreksi Administratif
                </button>
              </div>
            )}
          </div>

          {/* 7. KBM Monitoring Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('kbm')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>📚 KBM Monitoring</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.kbm ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.kbm && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('kbm-pertemuan')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'kbm-pertemuan' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pertemuan KBM
                </button>
                <button
                  onClick={() => setActiveMenu('kbm-jurnal')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'kbm-jurnal' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Jurnal Mengajar Guru
                </button>
                <button
                  onClick={() => setActiveMenu('kbm-materi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'kbm-materi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Materi Pembelajaran
                </button>
                <button
                  onClick={() => setActiveMenu('kbm-tugas')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'kbm-tugas' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Monitoring Tugas
                </button>
                <button
                  onClick={() => setActiveMenu('kbm-ujian')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'kbm-ujian' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ujian & CBT
                </button>
              </div>
            )}
          </div>

          {/* 8. Akademik Monitoring Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('monitoring')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-cyan-600" />
                <span>📊 Akademik Monitoring</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.monitoring ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.monitoring && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('monitoring-nilai')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'monitoring-nilai' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Nilai Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('monitoring-gradebook')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'monitoring-gradebook' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Gradebook Sentral
                </button>
                <button
                  onClick={() => setActiveMenu('monitoring-ketuntasan')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'monitoring-ketuntasan' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ketuntasan Belajar
                </button>
                <button
                  onClick={() => setActiveMenu('monitoring-rapor')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'monitoring-rapor' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Administrasi E-Rapor
                </button>
              </div>
            )}
          </div>

          {/* 9. Siswa Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('siswa')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                <span>🎓 Kesiswaan</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.siswa ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.siswa && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('siswa-mutasi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'siswa-mutasi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Mutasi Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('siswa-prestasi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'siswa-prestasi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Prestasi Sekolah
                </button>
                <button
                  onClick={() => setActiveMenu('siswa-pelanggaran')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'siswa-pelanggaran' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Tata Tertib / Pelanggaran
                </button>
                <button
                  onClick={() => setActiveMenu('siswa-ekskul')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'siswa-ekskul' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Ekstrakurikuler
                </button>
                <button
                  onClick={() => setActiveMenu('siswa-alumni')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'siswa-alumni' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Data Alumni & Kelulusan
                </button>
              </div>
            )}
          </div>

          {/* 10. Komunikasi Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('komunikasi')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-orange-600" />
                <span>📢 Komunikasi</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.komunikasi ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.komunikasi && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('komunikasi-pengumuman')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'komunikasi-pengumuman' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Pengumuman Sekolah
                </button>
                <button
                  onClick={() => setActiveMenu('komunikasi-notifikasi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'komunikasi-notifikasi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Aturan Notifikasi
                </button>
                <button
                  onClick={() => setActiveMenu('komunikasi-broadcast')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'komunikasi-broadcast' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Broadcast Massal
                </button>
              </div>
            )}
          </div>

          {/* 11. Dokumen Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('dokumen')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-blue-500" />
                <span>📄 Dokumen</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.dokumen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.dokumen && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('dokumen-siswa')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'dokumen-siswa' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dokumen Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('dokumen-guru')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'dokumen-guru' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Dokumen Guru
                </button>
                <button
                  onClick={() => setActiveMenu('dokumen-arsip')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'dokumen-arsip' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Arsip Resmi Sekolah
                </button>
              </div>
            )}
          </div>

          {/* 12. Import / Export Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('io')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>📥 Import / Export</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.io ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.io && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('io-import')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'io-import' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Import Excel Terpadu
                </button>
                <button
                  onClick={() => setActiveMenu('io-export')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'io-export' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Export Data Center
                </button>
                <button
                  onClick={() => setActiveMenu('io-riwayat')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'io-riwayat' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Riwayat Import
                </button>
              </div>
            )}
          </div>

          {/* 13. Laporan Group */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('laporan')}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold text-slate-800 hover:bg-slate-50 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-rose-600" />
                <span>📊 Laporan</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  expandedGroups.laporan ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedGroups.laporan && (
              <div className="ml-5 pl-2 border-l border-slate-200 flex flex-col gap-1 mt-1">
                <button
                  onClick={() => setActiveMenu('laporan-siswa')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'laporan-siswa' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Laporan Siswa
                </button>
                <button
                  onClick={() => setActiveMenu('laporan-guru')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'laporan-guru' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Laporan Guru
                </button>
                <button
                  onClick={() => setActiveMenu('laporan-presensi')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'laporan-presensi' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Laporan Presensi
                </button>
                <button
                  onClick={() => setActiveMenu('laporan-akademik')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'laporan-akademik' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Laporan Akademik
                </button>
                <button
                  onClick={() => setActiveMenu('laporan-sekolah')}
                  className={`px-3 py-1.5 rounded-xl text-left transition-all ${
                    activeMenu === 'laporan-sekolah' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Laporan Lengkap Sekolah
                </button>
              </div>
            )}
          </div>

          {/* Standalone Modules */}
          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1">
            <button
              onClick={() => setActiveMenu('data-quality')}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'data-quality' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>🔍 Data Quality</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">5</span>
            </button>

            <button
              onClick={() => setActiveMenu('audit-log')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'audit-log' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>📝 Audit Log</span>
            </button>

            <button
              onClick={() => setActiveMenu('setup-wizard')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'setup-wizard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>🔄 Academic Setup Wizard</span>
            </button>

            <button
              onClick={() => setActiveMenu('system-health')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'system-health' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HardDrive className="w-4 h-4 text-slate-500" />
              <span>🛠️ System Health & Kuota</span>
            </button>

            <button
              onClick={() => setActiveMenu('settings')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'settings' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>⚙️ Settings</span>
            </button>

            <button
              onClick={() => setActiveMenu('profile')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-left font-bold transition-all ${
                activeMenu === 'profile' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>👤 Profil Sekolah</span>
            </button>
          </div>
        </aside>
        )}

        {/* =========================================================================
            DYNAMIC WORKSPACE CONTENT PANE
        ========================================================================= */}
        <main className={hideSidebar ? "w-full flex flex-col gap-6" : "lg:col-span-9 flex flex-col gap-6"}>
          {/* TAB 1: 🏠 DASHBOARD ADMIN SEKOLAH (FITUR 1) */}
          {activeMenu === 'dashboard' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-150">
              {/* STATISTIK UTAMA (7 KPI SEKOLAH) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Total Siswa</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{dashboardData?.stats?.total_siswa || 480}</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">18 Rombel Aktif</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Total Guru</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{dashboardData?.stats?.total_guru || 42}</span>
                  <span className="text-[10px] text-blue-600 font-bold mt-1">100% Bersertifikasi</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Total Staff / TU</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{dashboardData?.stats?.total_staff || 12}</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-1">Administrasi & TU</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Total Kelas</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{dashboardData?.stats?.total_kelas || 18}</span>
                  <span className="text-[10px] text-indigo-600 font-bold mt-1">X, XI, XII</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Mata Pelajaran</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">{dashboardData?.stats?.total_mapel || 24}</span>
                  <span className="text-[10px] text-purple-600 font-bold mt-1">Kurikulum Merdeka</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Tahun Ajaran</span>
                  <span className="text-base font-black text-slate-900 mt-1">{dashboardData?.stats?.tahun_ajaran || '2026/2027'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1">Aktif</span>
                </div>
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col">
                  <span className="text-[11px] font-bold text-slate-400">Semester</span>
                  <span className="text-base font-black text-slate-900 mt-1">{dashboardData?.stats?.semester || 'Ganjil'}</span>
                  <span className="text-[10px] text-amber-600 font-bold mt-1">Tengah Semester</span>
                </div>
              </div>

              {/* KONDISI HARI INI */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-base font-bold text-slate-900">
                      Kondisi Operasional Hari Ini ({dashboardData?.today?.day_name || 'Senin'}, {dashboardData?.today?.date || '02 Okt 2026'})
                    </h2>
                  </div>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
                    KBM Berjalan Lancar
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-semibold block text-[11px]">Siswa Hadir</span>
                    <span className="text-xl font-black text-emerald-600">
                      {dashboardData?.today?.siswa_hadir || 452}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {dashboardData?.today?.siswa_tidak_hadir || 28} tidak hadir (94.2%)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-semibold block text-[11px]">Guru Hadir</span>
                    <span className="text-xl font-black text-indigo-600">
                      {dashboardData?.today?.guru_hadir || 40}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {dashboardData?.today?.guru_tidak_hadir || 2} absen/dinas (95.2%)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-semibold block text-[11px]">Kelas Sedang Berlangsung</span>
                    <span className="text-xl font-black text-purple-600">
                      {dashboardData?.today?.kelas_berlangsung || 15} Rombel
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">dari total 18 kelas</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-semibold block text-[11px]">Jadwal KBM Hari Ini</span>
                    <span className="text-xl font-black text-slate-800">48 Sesi</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Jam Ke 1 s/d Jam Ke 8</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 font-semibold block text-[11px]">Ujian & Event Hari Ini</span>
                    <span className="text-xl font-black text-amber-600">1 CBT / 1 Event</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PTS Sesi Pagi & Upacara</span>
                  </div>
                </div>
              </div>

              {/* SYSTEM ALERTS (DATA YANG MEMERLUKAN PERHATIAN ADMIN) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500" />
                    <div>
                      <h2 className="text-base font-bold text-slate-900">System Alerts & Data Quality</h2>
                      <p className="text-xs text-slate-500">Peringatan otomatis anomali konfigurasi dan kelengkapan data sekolah</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMenu('data-quality')}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Buka Data Quality Center</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(dashboardData?.alerts || []).map((alert: any) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-3 ${
                        alert.type === 'error'
                          ? 'bg-rose-50/50 border-rose-200 text-rose-900'
                          : alert.type === 'warning'
                          ? 'bg-amber-50/50 border-amber-200 text-amber-900'
                          : 'bg-blue-50/50 border-blue-200 text-blue-900'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              alert.type === 'error'
                                ? 'bg-rose-200 text-rose-800'
                                : alert.type === 'warning'
                                ? 'bg-amber-200 text-amber-800'
                                : 'bg-blue-200 text-blue-800'
                            }`}
                          >
                            {alert.category}
                          </span>
                          <span className="font-bold text-xs">{alert.title}</span>
                        </div>
                        <p className="text-xs text-slate-600">{alert.message}</p>
                      </div>

                      <button
                        onClick={() => {
                          if (alert.target_menu === 'schedule-list') setActiveMenu('jadwal-pelajaran');
                          else if (alert.target_menu === 'users-student') setActiveMenu('pengguna-siswa');
                          else if (alert.target_menu === 'academic-classes') setActiveMenu('akademik-rombel');
                          else if (alert.target_menu === 'academic-teaching-assignment') setActiveMenu('akademik-teaching-assignment');
                          else if (alert.target_menu === 'academic-monitoring-grades') setActiveMenu('monitoring-nilai');
                          else if (alert.target_menu === 'attendance-correction') setActiveMenu('presensi-koreksi');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 hover:bg-slate-50 transition-all shrink-0 cursor-pointer shadow-xs"
                      >
                        {alert.action_label}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUICK ACTIONS ADMIN */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Aksi Cepat Admin Sekolah (Quick Actions)</span>
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setActiveMenu('pengguna-siswa');
                      setIsAddUserModalOpen(true);
                      setNewUserForm({ name: '', email: '', role: 'murid', password: '' });
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Tambah Siswa</span>
                      <span className="text-[10px] text-slate-400">Registrasi akun siswa</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMenu('pengguna-guru');
                      setIsAddUserModalOpen(true);
                      setNewUserForm({ name: '', email: '', role: 'guru', password: '' });
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Tambah Guru</span>
                      <span className="text-[10px] text-slate-400">NIP & profil pendidik</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('io-import')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Import Excel</span>
                      <span className="text-[10px] text-slate-400">Siswa, guru, jadwal</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('akademik-rombel')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Buat Kelas</span>
                      <span className="text-[10px] text-slate-400">Rombel & wali kelas</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('akademik-mapel')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Buat Mata Pelajaran</span>
                      <span className="text-[10px] text-slate-400">Kurikulum & KKM</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('jadwal-pelajaran')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Atur Jadwal</span>
                      <span className="text-[10px] text-slate-400">Cek bentrok otomatis</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('sekolah-tahun-ajaran')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Atur Tahun Ajaran</span>
                      <span className="text-[10px] text-slate-400">Semester & Kenaikan</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveMenu('pengguna-siswa')}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 text-left transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">Kelola Pengguna</span>
                      <span className="text-[10px] text-slate-400">Reset password & akses</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 🏫 PROFIL & INFORMASI SEKOLAH + BRANDING (FITUR 2) */}
          {(activeMenu === 'sekolah-profil' || activeMenu === 'profile') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Profil, Identitas & Branding Sekolah</h2>
                  <p className="text-xs text-slate-500">Kelola informasi resmi lembaga, akreditasi, pimpinan sekolah dan format dokumen</p>
                </div>
                <button
                  onClick={() => showToast('Perubahan profil berhasil disimpan!')}
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kolom Kiri: Identitas Utama */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Identitas Lembaga</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Nama Resmi Sekolah</label>
                      <input
                        type="text"
                        defaultValue={profileData?.nama_sekolah || 'SMA Negeri Unggulan 1 Jakarta'}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">NPSN</label>
                        <input
                          type="text"
                          defaultValue={profileData?.npsn || '20109988'}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Jenjang & Status</label>
                        <input
                          type="text"
                          defaultValue={profileData?.jenjang || 'SMA / Negeri'}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Akreditasi</label>
                        <input
                          type="text"
                          defaultValue={profileData?.akreditasi || 'A (Unggul - 97.4)'}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Tahun Berdiri</label>
                        <input
                          type="text"
                          defaultValue={profileData?.tahun_berdiri || '1982'}
                          className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={2}
                        defaultValue={profileData?.alamat || 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan'}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Kecamatan</label>
                        <input type="text" defaultValue={profileData?.kecamatan || 'Kebayoran Baru'} className="w-full p-2 rounded-xl border" />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Kab/Kota</label>
                        <input type="text" defaultValue={profileData?.kabupaten_kota || 'Jakarta Selatan'} className="w-full p-2 rounded-xl border" />
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Kode Pos</label>
                        <input type="text" defaultValue={profileData?.kode_pos || '12150'} className="w-full p-2 rounded-xl border" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Pimpinan & Branding */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b pb-2">Pimpinan & Branding Identitas</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Kepala Sekolah (Definitif)</label>
                      <input
                        type="text"
                        defaultValue={profileData?.kepala_sekolah || 'Dr. H. Sulaiman, M.Si'}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Wakil Kurikulum & Kesiswaan</label>
                      <input
                        type="text"
                        defaultValue={`${profileData?.wakil_kurikulum || 'Dra. Hj. Siti Aminah'} & ${profileData?.wakil_kesiswaan || 'Drs. Bambang Sudiro'}`}
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-slate-500 font-semibold block mb-1">Kop Surat Resmi (Dokumen / Rapor)</label>
                      <textarea
                        rows={3}
                        defaultValue={profileData?.branding?.kop_surat || 'PEMERINTAH PROVINSI DKI JAKARTA\nDINAS PENDIDIKAN\nSMA NEGERI UNGGULAN 1 JAKARTA'}
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[11px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Warna Aksen Sistem</label>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-900 border" />
                          <input type="text" defaultValue="#1e293b" className="w-full p-2 rounded-xl border font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-500 font-semibold block mb-1">Identitas Dokumen</label>
                        <input
                          type="text"
                          defaultValue={profileData?.branding?.identitas_dokumen || 'MyAcademic Certified'}
                          className="w-full p-2 rounded-xl border"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ⚙️ SCHOOL SETTINGS (FITUR 3) */}
          {(activeMenu === 'sekolah-pengaturan' || activeMenu === 'settings') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pengaturan Operasional Sekolah</h2>
                  <p className="text-xs text-slate-500">Konfigurasi waktu belajar, toleransi presensi, bobot nilai, dan format rapor</p>
                </div>
                <button
                  onClick={() => showToast('Pengaturan sekolah berhasil diperbarui!')}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Simpan Pengaturan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* 1. Jam & Hari Belajar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Waktu & Jadwal Sekolah</span>
                  </h3>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Zona Waktu</label>
                    <input type="text" defaultValue="Asia/Jakarta (WIB)" className="w-full p-2 rounded-xl border bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Jam Masuk</label>
                      <input type="text" defaultValue="07:00 WIB" className="w-full p-2 rounded-xl border bg-white font-bold" />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Jam Pulang</label>
                      <input type="text" defaultValue="15:30 WIB" className="w-full p-2 rounded-xl border bg-white font-bold" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Jam Istirahat</label>
                    <input type="text" defaultValue="12:00 - 13:00 WIB" className="w-full p-2 rounded-xl border bg-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Hari Sekolah Aktif</label>
                    <input type="text" defaultValue="Senin - Jumat (5 Hari Kerja)" className="w-full p-2 rounded-xl border bg-white" />
                  </div>
                </div>

                {/* 2. Aturan Presensi */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Aturan Presensi & Keterlambatan</span>
                  </h3>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Toleransi Terlambat (Menit)</label>
                    <input type="number" defaultValue={15} className="w-full p-2 rounded-xl border bg-white font-bold" />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Auto-Lock Presensi Harian</label>
                    <input type="text" defaultValue="08:30 WIB" className="w-full p-2 rounded-xl border bg-white" />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Batas Alfa Sebelum Surat Panggilan</label>
                    <input type="number" defaultValue={3} className="w-full p-2 rounded-xl border bg-white font-bold" />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" defaultChecked id="notif_ortu" className="rounded" />
                    <label htmlFor="notif_ortu" className="text-slate-700 font-semibold">Kirim WhatsApp otomatis ke orang tua saat terlambat</label>
                  </div>
                </div>

                {/* 3. Aturan Nilai & Rapor */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Aturan Nilai, KKM & Rapor</span>
                  </h3>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Standar KKM / KKTP Sekolah</label>
                    <input type="number" defaultValue={75.0} className="w-full p-2 rounded-xl border bg-white font-bold text-emerald-700" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bobot Tugas</label>
                      <input type="text" defaultValue="20%" className="w-full p-2 rounded-xl border bg-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bobot Kuis</label>
                      <input type="text" defaultValue="15%" className="w-full p-2 rounded-xl border bg-white" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bobot PTS</label>
                      <input type="text" defaultValue="30%" className="w-full p-2 rounded-xl border bg-white" />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Bobot PAS</label>
                      <input type="text" defaultValue="35%" className="w-full p-2 rounded-xl border bg-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input type="checkbox" defaultChecked id="ttd_kepsek" className="rounded" />
                    <label htmlFor="ttd_kepsek" className="text-slate-700 font-semibold">Tanda tangan barcode digital Kepala Sekolah pada e-Rapor</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 👥 PENGGUNA (SISWA, GURU, ORTU, STAFF, ROLES) (FITUR 4, 5, 6, 7, 37, 42) */}
          {activeMenu.startsWith('pengguna-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'pengguna-siswa'
                      ? 'Manajemen Siswa (480 Siswa)'
                      : activeMenu === 'pengguna-guru'
                      ? 'Manajemen Dewan Guru (42 Guru)'
                      : activeMenu === 'pengguna-ortu'
                      ? 'Manajemen Akun Orang Tua / Wali (450 Ortu)'
                      : activeMenu === 'pengguna-staff'
                      ? 'Manajemen Staff & Tata Usaha (12 Staff)'
                      : 'Role & Permission Internal Sekolah'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin Sekolah mengelola seluruh akun, aktivasi, reset password, dan status keaktifan warga sekolah.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsAddUserModalOpen(true);
                      const defaultRole =
                        activeMenu === 'pengguna-siswa'
                          ? 'murid'
                          : activeMenu === 'pengguna-guru'
                          ? 'guru'
                          : activeMenu === 'pengguna-ortu'
                          ? 'parent'
                          : 'tu';
                      setNewUserForm({ name: '', email: '', role: defaultRole, password: '' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Akun Baru</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('io-import')}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Import Excel</span>
                  </button>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama, NISN/NIP, email, atau rombel..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 text-xs focus:outline-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select className="px-3 py-2 rounded-2xl border border-slate-200 text-xs font-bold bg-white">
                    <option>Semua Tingkat & Status</option>
                    <option>Aktif</option>
                    <option>Nonaktif</option>
                    <option>Mutasi</option>
                  </select>
                  <button
                    onClick={() => showToast('Data berhasil diekspor ke Excel!')}
                    className="p-2 rounded-2xl border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    title="Export Data"
                  >
                    <Download className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>

              {/* TABEL PENGGUNA SISWA */}
              {activeMenu === 'pengguna-siswa' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Siswa</th>
                        <th className="p-3">NIS / NISN</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Orang Tua / Wali</th>
                        <th className="p-3">Kontak</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(studentsList || []).map((s: any) => (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img src={s.avatar} alt={s.name} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <span className="font-bold text-slate-900 block">{s.name}</span>
                                <span className="text-[10px] text-slate-400">{s.gender}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-700">
                            {s.nis} / <span className="text-slate-400">{s.nisn}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {s.class_name}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-semibold text-slate-800 block">{s.parent_name}</span>
                            <span className="text-[10px] text-slate-400">{s.parent_phone}</span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{s.phone}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'Aktif'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleResetPassword(s)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => showToast(`Edit data siswa: ${s.name}`)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABEL PENGGUNA GURU */}
              {activeMenu === 'pengguna-guru' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Nama Guru</th>
                        <th className="p-3">NIP / NUPTK</th>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Beban Mengajar</th>
                        <th className="p-3">Wali Kelas</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(teachersList || []).map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2.5">
                              <img src={t.avatar} alt={t.name} className="w-7 h-7 rounded-full object-cover" />
                              <div>
                                <span className="font-bold text-slate-900 block">{t.name}</span>
                                <span className="text-[10px] text-slate-400">{t.education}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-700">
                            {t.nip}
                            <span className="block text-[10px] text-slate-400">{t.employment_status}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {t.subjects?.map((sub: string, i: number) => (
                                <span key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 font-bold text-slate-800">{t.teaching_hours} Jam / Minggu</td>
                          <td className="p-3">
                            {t.is_homeroom ? (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {t.homeroom_class}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px]">-</span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {t.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleResetPassword(t)}
                                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                              >
                                Reset Pass
                              </button>
                              <button
                                onClick={() => showToast(`Lihat jadwal mengajar guru: ${t.name}`)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                                title="Lihat Jadwal"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TABEL PENGGUNA ORANG TUA */}
              {activeMenu === 'pengguna-ortu' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Nama Orang Tua</th>
                        <th className="p-3">Kontak / Email</th>
                        <th className="p-3">Hubungan</th>
                        <th className="p-3">Anak Terhubung (Siswa)</th>
                        <th className="p-3">Status Akun</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(parentsList || []).map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{p.name}</td>
                          <td className="p-3">
                            <span className="block text-slate-800 font-mono text-[11px]">{p.phone}</span>
                            <span className="block text-[10px] text-slate-400">{p.email}</span>
                          </td>
                          <td className="p-3 text-slate-700 font-medium">{p.relation}</td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {p.students?.map((child: any) => (
                                <span key={child.id} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold text-[10px] inline-flex items-center gap-1">
                                  <span>{child.name}</span>
                                  <span className="text-slate-400">({child.class_name})</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {p.account_status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleResetPassword(p)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                            >
                              Reset Pass
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ROLES & PERMISSIONS */}
              {activeMenu === 'pengguna-roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(roleAndAuditData?.roles || []).map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {r.user_count} Pengguna
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {r.permissions?.map((p: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                            ✓ {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: 🏛️ AKADEMIK (ROMBEL, MAPEL, TEACHING ASSIGNMENT, ENROLLMENT, KENAIKAN) (FITUR 8, 11, 12, 15, 40) */}
          {activeMenu.startsWith('akademik-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'akademik-rombel'
                      ? 'Manajemen Kelas & Rombel (18 Kelas)'
                      : activeMenu === 'akademik-mapel'
                      ? 'Master Mata Pelajaran & Kurikulum'
                      : activeMenu === 'akademik-teaching-assignment'
                      ? 'Teaching Assignment (Alokasi Guru Mengajar)'
                      : activeMenu === 'akademik-enrollment'
                      ? 'Student Enrollment & Riwayat Angkatan'
                      : 'Kenaikan Kelas & Kelulusan (Tahun Ajaran)'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin menyusun struktur rombel, alokasi guru pengampu ke kelas, dan siklus kenaikan tingkat siswa.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Aksi akademik berhasil diproses!')}
                  className="px-4 py-2 rounded-2xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-all cursor-pointer shadow-md"
                >
                  {activeMenu === 'akademik-kenaikan-kelas' ? 'Proses Kenaikan Kelas Massal' : '+ Tambah Data'}
                </button>
              </div>

              {/* TAMPILAN ROMBEL KELAS */}
              {activeMenu === 'akademik-rombel' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(classesList || []).map((cls: any) => (
                    <div key={cls.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-base text-slate-900">{cls.nama_kelas}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {cls.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Tingkat {cls.level} • Jurusan {cls.jurusan} • {cls.ruangan}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Wali Kelas:</span>
                          <span className="font-bold text-slate-800">{cls.wali_kelas}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Kapasitas:</span>
                          <span className="font-semibold text-slate-700">{cls.total_siswa} / {cls.kapasitas} Siswa</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          onClick={() => showToast(`Kelola anggota siswa kelas ${cls.nama_kelas}`)}
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
                        >
                          Kelola Anggota Siswa
                        </button>
                        <button
                          onClick={() => showToast(`Ganti wali kelas ${cls.nama_kelas}`)}
                          className="text-slate-500 hover:text-slate-900 font-semibold cursor-pointer"
                        >
                          Ganti Wali
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAMPILAN MATA PELAJARAN */}
              {activeMenu === 'akademik-mapel' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Kode</th>
                        <th className="p-3">Nama Mata Pelajaran</th>
                        <th className="p-3">Kelompok / Kurikulum</th>
                        <th className="p-3">Tingkat</th>
                        <th className="p-3">KKM / KKTP</th>
                        <th className="p-3">Guru Pengampu</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(subjectsList || []).map((sub: any) => (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-slate-700">{sub.kode}</td>
                          <td className="p-3 font-bold text-slate-900">{sub.nama}</td>
                          <td className="p-3 text-slate-600">{sub.kelompok}</td>
                          <td className="p-3 font-semibold text-slate-700">{sub.tingkat}</td>
                          <td className="p-3 font-bold text-emerald-700">{sub.kkm}</td>
                          <td className="p-3 font-medium text-slate-800">{sub.guru_pengampu}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => showToast(`Edit mapel ${sub.nama}`)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-[10px] cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAMPILAN TEACHING ASSIGNMENT */}
              {activeMenu === 'akademik-teaching-assignment' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Guru Pengampu</th>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Kelas / Rombel</th>
                        <th className="p-3">Beban Jam</th>
                        <th className="p-3">Tipe Mengajar</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(teachingAssignments || []).map((ta: any) => (
                        <tr key={ta.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{ta.teacher_name}</td>
                          <td className="p-3 font-semibold text-slate-800">{ta.subject_name}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {ta.class_name}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-700">{ta.hours_per_week} Jam / Minggu</td>
                          <td className="p-3">
                            {ta.team_teaching ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                                Team Teaching
                              </span>
                            ) : (
                              <span className="text-slate-500 font-semibold text-[10px]">Guru Tunggal</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => showToast('Penugasan berhasil disesuaikan!')}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-[10px] cursor-pointer"
                            >
                              Ubah
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAMPILAN KENAIKAN KELAS */}
              {activeMenu === 'akademik-kenaikan-kelas' && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Alur Kenaikan Kelas Tahun Ajaran Aktif</h3>
                      <p className="text-xs text-slate-600">
                        Otomatisasi pemindahan siswa dari Kelas X → XI, Kelas XI → XII, dan penetapan status kelulusan Kelas XII.
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                      468 Siswa Memenuhi Syarat
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs">
                      <span className="text-slate-400 block font-semibold">Kandidat Naik Kelas X → XI</span>
                      <span className="text-lg font-black text-slate-900">158 Siswa</span>
                      <span className="text-emerald-600 text-[10px] font-bold block mt-1">✓ Nilai & Presensi Memenuhi</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs">
                      <span className="text-slate-400 block font-semibold">Kandidat Naik Kelas XI → XII</span>
                      <span className="text-lg font-black text-slate-900">154 Siswa</span>
                      <span className="text-emerald-600 text-[10px] font-bold block mt-1">✓ Siap Penempatan Rombel Baru</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs">
                      <span className="text-slate-400 block font-semibold">Calon Lulusan Kelas XII</span>
                      <span className="text-lg font-black text-slate-900">156 Siswa</span>
                      <span className="text-purple-600 text-[10px] font-bold block mt-1">🎓 Menuju Status Alumni</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: 📅 JADWAL & RUANGAN (FITUR 13, 14 - CONFLICT DETECTION ENGINE) */}
          {activeMenu.startsWith('jadwal-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'jadwal-pelajaran'
                      ? 'Jadwal Pelajaran KBM & Deteksi Bentrok'
                      : activeMenu === 'jadwal-jam'
                      ? 'Pengaturan Jam Pelajaran (Struktur Sesi)'
                      : 'Manajemen Ruangan & Sarana Kelas'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Mesin otomatis memeriksa jadwal bentrok guru, kelas, ruangan, dan jam pelajaran sebelum dipublikasikan.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsConflictModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Cek Bentrok Jadwal</span>
                  </button>
                  <button
                    onClick={() => showToast('Jadwal KBM resmi dipublikasikan ke seluruh guru dan siswa!')}
                    className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Publish Jadwal
                  </button>
                </div>
              </div>

              {/* TAMPILAN JADWAL PELAJARAN */}
              {activeMenu === 'jadwal-pelajaran' && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Hari & Jam</th>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Guru</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Ruangan</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(schedulesList || []).map((sch: any) => (
                        <tr
                          key={sch.id}
                          className={`hover:bg-slate-50/60 transition-colors ${
                            sch.has_conflict ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-slate-800">
                            {sch.hari}, {sch.jam}
                          </td>
                          <td className="p-3 font-bold text-slate-900">{sch.mapel}</td>
                          <td className="p-3 text-slate-700">{sch.guru}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {sch.kelas}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-semibold text-slate-800">{sch.ruangan}</td>
                          <td className="p-3">
                            {sch.has_conflict ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Bentrok</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {sch.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => showToast(`Edit jadwal KBM: ${sch.mapel} ${sch.kelas}`)}
                              className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-[10px] cursor-pointer"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* TAMPILAN RUANGAN */}
              {activeMenu === 'jadwal-ruangan' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(roomsList || []).map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-700 text-xs">{r.kode}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'Tersedia' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{r.nama}</h4>
                      <p className="text-xs text-slate-500">
                        {r.gedung} • {r.lantai} • Kapasitas {r.kapasitas} Orang
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[10px] font-semibold">
                        Tipe: {r.jenis}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: 🕐 PRESENSI & KOREKSI ADMINISTRATIF (FITUR 17, 18) */}
          {activeMenu.startsWith('presensi-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'presensi-koreksi'
                      ? 'Pusat Koreksi Administratif Presensi'
                      : 'Monitoring & Rekap Presensi Sekolah'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Admin memiliki otoritas memverifikasi surat sakit, dispensasi lomba, serta mengoreksi kekeliruan sistem presensi.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Rekap presensi berhasil diekspor ke format Excel!')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Rekap Presensi</span>
                </button>
              </div>

              {/* STATISTIK REKAP SISWA & GURU */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Presensi Siswa Bulan Ini</span>
                    <span className="text-emerald-600 font-black text-sm">96.6% Kehadiran</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Hadir</span>
                      <span className="font-bold text-slate-900">452</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Sakit</span>
                      <span className="font-bold text-amber-600">8</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Izin/Disp</span>
                      <span className="font-bold text-blue-600">8</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Alfa</span>
                      <span className="font-bold text-rose-600">0</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Presensi Dewan Guru Bulan Ini</span>
                    <span className="text-indigo-600 font-black text-sm">97.6% Kehadiran</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Hadir</span>
                      <span className="font-bold text-slate-900">40</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Terlambat</span>
                      <span className="font-bold text-amber-600">1</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Sakit</span>
                      <span className="font-bold text-blue-600">1</span>
                    </div>
                    <div className="p-2 rounded-xl bg-white border">
                      <span className="text-slate-400 block text-[10px]">Alfa</span>
                      <span className="font-bold text-emerald-600">0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DAFTAR PERMOHONAN KOREKSI ADMINISTRATIF */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Daftar Permohonan Koreksi Presensi (Memerlukan Otoritas Admin)
                </h3>

                {(attendanceData?.pending_corrections || []).map((cor: any) => (
                  <div key={cor.id} className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{cor.student_name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold">
                          {cor.class_name} • {cor.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Status Awal: <span className="font-bold text-rose-600">{cor.original_status}</span> ➔ Permohonan:{' '}
                        <span className="font-bold text-emerald-600">{cor.requested_status}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Alasan: <span className="italic">"{cor.reason}"</span> (Bukti: <span className="font-mono text-indigo-600">{cor.proof_file}</span>)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedCorrection(cor);
                          setIsCorrectionModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                      >
                        Setujui Koreksi
                      </button>
                      <button
                        onClick={() => showToast('Permohonan koreksi presensi ditolak.')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: 📚 KBM MONITORING (FITUR 19, 20, 21) */}
          {activeMenu.startsWith('kbm-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  {activeMenu === 'kbm-jurnal'
                    ? 'Monitoring Jurnal Mengajar Guru'
                    : activeMenu === 'kbm-tugas'
                    ? 'Monitoring Beban & Deadline Tugas'
                    : activeMenu === 'kbm-ujian'
                    ? 'Monitoring Pelaksanaan Ujian CBT'
                    : 'Pengawasan Proses Pembelajaran (KBM)'}
                </h2>
                <p className="text-xs text-slate-500">
                  Admin memantau keterlaksanaan KBM, materi, tugas, dan ujian tanpa mengambil alih fungsi mengajar guru.
                </p>
              </div>

              {/* OVERVIEW KBM */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Pertemuan Terlaksana</span>
                  <span className="text-2xl font-black text-slate-900 mt-1">44 / 48 Sesi</span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">91.6% Ketercapaian KBM</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Jurnal Mengajar Terisi</span>
                  <span className="text-2xl font-black text-indigo-600 mt-1">42 Jurnal</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">2 guru belum submit</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Materi Terbit</span>
                  <span className="text-2xl font-black text-purple-600 mt-1">156 Modul</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">Diakses seluruh siswa</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Tugas Aktif</span>
                  <span className="text-2xl font-black text-amber-600 mt-1">28 Tugas</span>
                  <span className="text-[10px] text-slate-500 font-bold block mt-1">Avg Submission: 89.4%</span>
                </div>
              </div>

              {/* DAFTAR MONITORING TUGAS */}
              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
                  Daftar Tugas Aktif Seluruh Sekolah
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Judul Tugas</th>
                        <th className="p-3">Mata Pelajaran</th>
                        <th className="p-3">Guru</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Deadline</th>
                        <th className="p-3">Submission Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(kbmData?.assignments_summary || []).map((t: any) => (
                        <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3 font-bold text-slate-900">{t.title}</td>
                          <td className="p-3 text-slate-700">{t.mapel}</td>
                          <td className="p-3 text-slate-600">{t.guru}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[10px]">
                              {t.kelas}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-600">{t.deadline}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-700">{t.submission_rate}%</span>
                              <span className="text-[10px] text-slate-400">({t.total_submissions}/{t.total_students})</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: 📊 AKADEMIK MONITORING & RAPOR (FITUR 22, 23, 24) */}
          {activeMenu.startsWith('monitoring-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'monitoring-rapor'
                      ? 'Administrasi & Cetak Massal E-Rapor'
                      : activeMenu === 'monitoring-ketuntasan'
                      ? 'Analisis Ketuntasan Belajar & KKM'
                      : 'Monitoring Nilai Akademik & Gradebook'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Otoritas administratif penguncian gradebook (Lock/Unlock) dan penerbitan rapor resmi sekolah.
                  </p>
                </div>
                <button
                  onClick={handleBatchGenerateRapor}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate e-Rapor Massal</span>
                </button>
              </div>

              {/* GRADEBOOKS MONITORING & LOCKING */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Rombel Kelas</th>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3">Guru Pengampu</th>
                      <th className="p-3">Rata-Rata Kelas</th>
                      <th className="p-3">Ketuntasan</th>
                      <th className="p-3">Status Gradebook</th>
                      <th className="p-3 text-right">Otoritas Kunci (Lock)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(monitoringData?.gradebooks || []).map((gb: any) => (
                      <tr key={gb.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{gb.kelas}</td>
                        <td className="p-3 font-semibold text-slate-800">{gb.mapel}</td>
                        <td className="p-3 text-slate-600">{gb.guru}</td>
                        <td className="p-3 font-bold text-slate-800">{gb.rata_rata}</td>
                        <td className="p-3 font-bold text-emerald-700">{gb.ketuntasan}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              gb.is_locked ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {gb.is_locked ? 'Terkunci (Final)' : 'Draft Terbuka'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleGradeLock(gb.id)}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              gb.is_locked
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-slate-900 text-white hover:bg-slate-800'
                            }`}
                          >
                            {gb.is_locked ? 'Buka Kunci (Unlock)' : 'Kunci Nilai (Lock)'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: 🎓 KESISWAAN (MUTASI, PRESTASI, PELANGGARAN, EKSKUL, ALUMNI) (FITUR 16, 25, 26, 27, 28, 41) */}
          {activeMenu.startsWith('siswa-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    {activeMenu === 'siswa-mutasi'
                      ? 'Manajemen Mutasi Masuk & Keluar Siswa'
                      : activeMenu === 'siswa-prestasi'
                      ? 'Database Prestasi Siswa & Guru'
                      : activeMenu === 'siswa-pelanggaran'
                      ? 'Tata Tertib, Poin Pelanggaran & Sanksi'
                      : activeMenu === 'siswa-ekskul'
                      ? 'Manajemen Ekstrakurikuler & Pembina'
                      : 'Data Kelulusan & Arsip Alumni'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pengelolaan administrasi kesiswaan resmi di bawah kewenangan tata usaha dan wakil kesiswaan.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Data kesiswaan berhasil diperbarui!')}
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  + Tambah Data
                </button>
              </div>

              {/* PRESTASI */}
              {activeMenu === 'siswa-prestasi' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(studentAffairsData?.achievements || []).map((ach: any) => (
                    <div key={ach.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Tingkat {ach.level}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{ach.date}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ach.title}</h4>
                      <p className="text-xs text-slate-600">Siswa: <span className="font-bold">{ach.student_name}</span></p>
                      <button
                        onClick={() => showToast(`Mengunduh sertifikat ${ach.certificate}`)}
                        className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Unduh Sertifikat Resmi ({ach.certificate})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* PELANGGARAN */}
              {activeMenu === 'siswa-pelanggaran' && (
                <div className="space-y-3">
                  {(studentAffairsData?.violations || []).map((v: any) => (
                    <div key={v.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{v.student_name}</span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                            +{v.points} Poin
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{v.violation}</p>
                        <p className="text-[11px] text-slate-500">Tindakan/Sanksi: {v.sanksi}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                        {v.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* EKSKUL */}
              {activeMenu === 'siswa-ekskul' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(studentAffairsData?.extracurriculars || []).map((ex: any) => (
                    <div key={ex.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                      <h4 className="font-bold text-slate-900 text-sm">{ex.name}</h4>
                      <p className="text-xs text-slate-600">Pembina: {ex.pembina}</p>
                      <p className="text-xs text-slate-500">Anggota: {ex.total_members} Siswa • {ex.schedule}</p>
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        Prestasi: {ex.prestasi}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 11: 📢 KOMUNIKASI (FITUR 29, 30, 43) */}
          {activeMenu.startsWith('komunikasi-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Pusat Komunikasi & Pengumuman Sekolah</h2>
                  <p className="text-xs text-slate-500">Pengiriman informasi massal ke Guru, Siswa, dan Orang Tua melalui portal dan WhatsApp gateway</p>
                </div>
                <button
                  onClick={() => showToast('Fitur buat pengumuman dibuka')}
                  className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-xs"
                >
                  + Buat Pengumuman Baru
                </button>
              </div>

              <div className="space-y-4">
                {(communicationData?.announcements || []).map((ann: any) => (
                  <div key={ann.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {ann.is_pinned && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                            📌 Pinned
                          </span>
                        )}
                        <span className="text-xs font-bold text-slate-900">{ann.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{ann.date}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <span>Target Penerima: <strong className="text-slate-800">{ann.target}</strong></span>
                      <span className="text-emerald-600 font-bold">✓ Terkirim ke 480 Penerima</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 12: 📄 DOKUMEN & ARSIP (FITUR 31) */}
          {activeMenu.startsWith('dokumen-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Arsip Digital & Dokumen Resmi</h2>
                  <p className="text-xs text-slate-500">Penyimpanan tersentralisasi SK Guru, Buku Induk Siswa, dan Dokumen Akreditasi</p>
                </div>
                <button
                  onClick={() => showToast('Pilih dokumen yang ingin diunggah')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Dokumen Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(documentsData || []).map((doc: any) => (
                  <div key={doc.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {doc.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{doc.title}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{doc.file_name} • {doc.size} • {doc.date}</p>
                    </div>
                    <button
                      onClick={() => showToast(`Mengunduh berkas ${doc.file_name}`)}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-indigo-600 hover:bg-slate-100 cursor-pointer shadow-xs"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 13: 📥 IMPORT & EXPORT CENTER (FITUR 32, 33) */}
          {activeMenu.startsWith('io-') && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-black text-slate-900">Excel Import & Export Center</h2>
                <p className="text-xs text-slate-500">
                  Pusat import data siswa, guru, rombel, jadwal dengan validasi format otomatis dan deteksi duplikasi.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* IMPORT */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload & Import Data Terstruktur</span>
                  </h3>

                  <div className="space-y-2">
                    {(importExportData?.templates || []).map((tpl: any) => (
                      <div key={tpl.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-slate-900 block">{tpl.name}</span>
                          <span className="text-[10px] text-slate-400">{tpl.description}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => showToast(`Mengunduh template ${tpl.name}`)}
                            className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600 cursor-pointer"
                            title="Download Template"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSimulateImport(tpl.id)}
                            className="px-2.5 py-1 rounded-xl bg-slate-900 text-white font-bold text-[10px] cursor-pointer"
                          >
                            Import File
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* EXPORT */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <span>Pusat Unduh & Export Data Sekolah</span>
                  </h3>

                  <div className="space-y-2">
                    {(importExportData?.export_modules || []).map((exp: any) => (
                      <div key={exp.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{exp.label}</span>
                        <div className="flex items-center gap-1">
                          {exp.formats?.map((fmt: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => showToast(`Mengekspor ${exp.label} dalam format ${fmt}...`)}
                              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                            >
                              {fmt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 14: 🔍 DATA QUALITY CENTER (FITUR 36 - SANGAT PENTING) */}
          {activeMenu === 'data-quality' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>FITUR 36: DATA QUALITY CENTER — DETEKSI ANOMALI OTOMATIS</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Kesehatan & Integritas Data Sekolah</h2>
                  <p className="text-xs text-slate-500">
                    Sistem mendeteksi hubungan broken relasi antar siswa, guru, rombel, jadwal bentrok, dan kelengkapan profil.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-3 bg-slate-50 border rounded-2xl text-right">
                    <span className="text-[10px] font-bold text-slate-400 block">Health Score</span>
                    <span className="text-2xl font-black text-emerald-600">{dataQualityData?.health_score || 92}%</span>
                  </div>
                </div>
              </div>

              {/* LIST MASALAH DATA */}
              <div className="space-y-3">
                {(dataQualityData?.issues || []).map((issue: any) => (
                  <div
                    key={issue.id}
                    className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      issue.severity === 'critical'
                        ? 'bg-rose-50/50 border-rose-200'
                        : issue.severity === 'warning'
                        ? 'bg-amber-50/50 border-amber-200'
                        : 'bg-blue-50/50 border-blue-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            issue.severity === 'critical'
                              ? 'bg-rose-200 text-rose-800'
                              : issue.severity === 'warning'
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {issue.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-xs">{issue.title}</h4>
                      </div>
                      <p className="text-xs text-slate-700">{issue.description}</p>
                      <p className="text-[11px] text-slate-500">
                        Item Terkait: <span className="font-semibold">{issue.affected_items?.join(', ')}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => showToast(`Tindakan perbaikan dijalankan untuk ${issue.title}!`)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Perbaiki Data Sekarang
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 15: 📝 AUDIT LOG SEKOLAH (FITUR 38) */}
          {activeMenu === 'audit-log' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Audit Log & Jejak Digital Sekolah</h2>
                  <p className="text-xs text-slate-500">
                    Rekam jejak setiap perubahan administratif: koreksi presensi, kunci nilai, import data, dan perubahan akun.
                  </p>
                </div>
                <button
                  onClick={() => showToast('Audit log diekspor ke format CSV.')}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Export Log (CSV)
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {(roleAndAuditData?.audit_logs || []).map((log: any) => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.actor}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-600">{log.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-400 font-mono block">{log.timestamp}</span>
                      <span className="text-[10px] text-slate-400 font-mono">IP: {log.ip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 16: 🔄 ACADEMIC SETUP WIZARD (FITUR 45) */}
          {activeMenu === 'setup-wizard' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>FITUR 45: ACADEMIC SETUP WIZARD AWAL TAHUN AJARAN</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">Alur Sistematis Kesiapan Tahun Ajaran Baru</h2>
                  <p className="text-xs text-slate-500">
                    Panduan 9 langkah komprehensif dari penetapan Tahun Ajaran hingga sistem siap digunakan untuk KBM murni.
                  </p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  Progress Setup: 95% Selesai
                </div>
              </div>

              <div className="space-y-3">
                {(wizardData?.wizard_steps || []).map((st: any) => (
                  <div
                    key={st.step}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                          st.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white animate-pulse'
                        }`}
                      >
                        {st.status === 'completed' ? '✓' : st.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">
                          Langkah {st.step}: {st.name}
                        </h4>
                        <p className="text-[11px] text-slate-500">{st.summary}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        st.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {st.status === 'completed' ? 'Tervalidasi' : 'Sedang Berjalan'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 17: 🛠️ SYSTEM HEALTH & KUOTA SEKOLAH (FITUR 46, 47, 48) */}
          {activeMenu === 'system-health' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6 animate-in fade-in duration-150">
              <div>
                <h2 className="text-xl font-black text-slate-900">System Health, Backup & Lisensi Sekolah</h2>
                <p className="text-xs text-slate-500">
                  Monitoring kesehatan database sekolah, backup mandiri arsip sekolah, serta informasi kuota siswa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                {/* 1. System Health */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>Kesehatan Data Sekolah</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kelengkapan Data:</span>
                      <span className="font-bold text-slate-900">98.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Missing Config:</span>
                      <span className="font-bold text-emerald-700">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Jadwal Bentrok:</span>
                      <span className="font-bold text-amber-700">1 Kasus</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status Setup:</span>
                      <span className="font-bold text-indigo-700">Operasional Aktif</span>
                    </div>
                  </div>
                </div>

                {/* 2. Backup & Recovery */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FolderArchive className="w-4 h-4 text-indigo-600" />
                    <span>Backup & Arsip Data Sekolah</span>
                  </h3>
                  <p className="text-slate-500 text-[11px]">
                    Snapshot mandiri seluruh data master sekolah, siswa, nilai, dan dokumen dalam format aman.
                  </p>
                  <span className="text-slate-400 block text-[10px]">Terakhir: Kemarin, 23:00 WIB (84.2 MB)</span>
                  <button
                    onClick={() => showToast('Permintaan backup data sekolah berhasil diproses!')}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    Request Download Snapshot
                  </button>
                </div>

                {/* 3. Subscription */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>Paket & Kuota Sekolah</span>
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Paket:</span>
                      <span className="font-bold text-slate-900">Enterprise School</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Masa Berlaku:</span>
                      <span className="font-bold text-emerald-700">31 Juli 2027</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Kuota Siswa:</span>
                      <span className="font-bold text-slate-900">480 / 1000 Siswa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cloud Storage:</span>
                      <span className="font-bold text-slate-900">4.2 GB / 50 GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: TAMBAH USER BARU */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Tambah Akun Pengguna Sekolah</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap beserta gelar..."
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Email Sekolah</label>
                <input
                  type="email"
                  required
                  placeholder="nama@sekolah.sch.id"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Role / Peran</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  <option value="guru">Guru Pengajar</option>
                  <option value="murid">Siswa / Murid</option>
                  <option value="parent">Orang Tua / Wali Murid</option>
                  <option value="tu">Staff Tata Usaha (TU)</option>
                  <option value="bk">Konselor BK</option>
                  <option value="walikelas">Wali Kelas</option>
                </select>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Password Sementara</label>
                <input
                  type="text"
                  placeholder="Biarkan kosong untuk default: password123"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white cursor-pointer shadow-md"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KOREKSI ADMINISTRATIF PRESENSI */}
      {isCorrectionModalOpen && selectedCorrection && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Koreksi Administratif Presensi</h3>
              <button onClick={() => setIsCorrectionModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="font-bold text-slate-900 block">{selectedCorrection.student_name}</span>
                <span className="text-slate-500 block">Kelas: {selectedCorrection.class_name} • Tanggal: {selectedCorrection.date}</span>
                <span className="text-slate-500 block">
                  Perubahan: <strong className="text-rose-600">{selectedCorrection.original_status}</strong> ➔{' '}
                  <strong className="text-emerald-600">{selectedCorrection.requested_status}</strong>
                </span>
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Alasan Koreksi Resmi (Tercatat di Audit Log)</label>
                <textarea
                  rows={2}
                  value={correctionReason || selectedCorrection.reason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleCorrectAttendance}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white cursor-pointer shadow-md"
                >
                  Eksekusi Koreksi & Simpan Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETEKSI BENTROK JADWAL */}
      {isConflictModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Hasil Validasi Bentrok Jadwal</span>
              </h3>
              <button onClick={() => setIsConflictModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 space-y-1">
                <span className="font-bold block text-sm">Ditemukan 1 Bentrok Ruangan</span>
                <p>
                  Ruangan <strong>LAB-KOM-1</strong> terpakai bersamaan pada hari <strong>Selasa, 09:15 - 10:45</strong> antara kelas{' '}
                  <strong>XI MIPA 1 (Informatika)</strong> dan <strong>Simulasi CBT Mandiri</strong>.
                </p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
                <span>✓ Bentrok Guru: 0 Bentrok</span>
                <br />
                <span>✓ Bentrok Jam Rombel: 0 Bentrok</span>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConflictModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-white cursor-pointer"
                >
                  Tutup & Resolusi Jadwal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
