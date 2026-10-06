'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  LayoutDashboard,
  Play,
  UserCheck,
  FolderOpen,
  FileText,
  FileSpreadsheet,
  Award,
  Calendar,
  Bot,
  Moon,
  Sun,
  LayoutGrid,
  GraduationCap,
  Upload,
  Database,
  CheckCircle2,
  BarChart3,
  Printer,
  Search,
  Users,
  MessageSquare
} from 'lucide-react';
import { isTabAllowed } from '@/lib/rbac';
import { useAppPreferences } from '@/context/AppPreferencesContext';

interface SidebarProps {
  currentUserRole?: string;
  onQuickAction?: (action: string) => void;
}

export default function Sidebar({ currentUserRole = 'murid', onQuickAction }: SidebarProps) {
  const { theme, setTheme, t } = useAppPreferences();
  const isDarkMode = theme === 'midnight';
  const isStudent = currentUserRole === 'murid';
  const isTeacher = currentUserRole === 'guru';
  const isWaliKelas = currentUserRole === 'walikelas';
  const isAdmin = currentUserRole === 'admin';
  const isKepsek = currentUserRole === 'kepsek';
  const isTu = currentUserRole === 'tu';
  const isParent = currentUserRole === 'parent' || currentUserRole === 'orang_tua' || currentUserRole === 'wali';

  // Dedicated clean toolset for Orang Tua / Wali Murid (36 Fitur)
  const parentTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'parent-dashboard', icon: LayoutDashboard, label: t('sidebar.parent_dashboard') || 'Dashboard Orang Tua (36 Fitur)', targetTab: 'parent' },
    { id: 'parent-children', icon: Users, label: t('sidebar.parent_children') || 'Profil & Multi-Anak', targetTab: 'parent' },
    { id: 'parent-academic', icon: FileSpreadsheet, label: t('sidebar.parent_academic') || 'Akademik & Nilai Terbit', targetTab: 'parent' },
    { id: 'parent-attendance', icon: UserCheck, label: t('sidebar.parent_attendance') || 'Presensi RFID Gerbang & Izin', targetTab: 'parent', alert: true },
    { id: 'parent-assignments', icon: FileText, label: t('sidebar.parent_assignments') || 'Monitoring Tugas Anak', targetTab: 'parent' },
    { id: 'parent-communication', icon: MessageSquare, label: t('sidebar.parent_communication') || 'Komunikasi Wali Kelas & Guru', targetTab: 'parent' },
    { id: 'parent-calendar', icon: Calendar, label: t('sidebar.parent_calendar') || 'Kalender & Pertemuan Ortu', targetTab: 'parent' },
    { id: 'parent-ai', icon: Bot, label: t('sidebar.parent_ai') || 'AI Parent Assistant', targetTab: 'parent' },
  ];

  // Dedicated clean toolset for Wali Kelas (42 Fitur Asuhan)
  const homeroomTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'walikelas-hub', icon: LayoutDashboard, label: t('sidebar.homeroom_hub') || 'Portal Wali Kelas (42 Fitur)', targetTab: 'walikelas-hub' },
    { id: 'homeroom-students', icon: Users, label: t('sidebar.homeroom_students') || 'Data Siswa & 360°', targetTab: 'walikelas-hub' },
    { id: 'homeroom-attendance', icon: UserCheck, label: t('sidebar.homeroom_attendance') || 'Presensi & Koreksi', targetTab: 'walikelas-hub', alert: true },
    { id: 'homeroom-academic', icon: FileSpreadsheet, label: t('sidebar.homeroom_academic') || 'Monitoring Akademik & Nilai', targetTab: 'walikelas-hub' },
    { id: 'homeroom-parents', icon: MessageSquare, label: t('sidebar.homeroom_parents') || 'Komunikasi Orang Tua', targetTab: 'walikelas-hub' },
    { id: 'homeroom-reports', icon: FileText, label: t('sidebar.homeroom_reports') || 'Administrasi Rapor', targetTab: 'walikelas-hub' },
    { id: 'homeroom-analytics', icon: BarChart3, label: t('sidebar.homeroom_analytics') || 'Class Analytics & EWS', targetTab: 'walikelas-hub' },
  ];

  // Dedicated clean toolset for Tata Usaha (TU)
  const tuTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'tu-hub', icon: LayoutDashboard, label: t('sidebar.tu_hub') || 'Portal Tata Usaha (34 Fitur Administrasi)', targetTab: 'tu-hub' },
  ];

  // Dedicated clean toolset for Admin Sekolah (Fitur Operasional Sekolah)
  const adminTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'school-admin', icon: LayoutDashboard, label: t('sidebar.admin_portal') || 'Portal Admin Sekolah (49 Fitur)', targetTab: 'school-admin' },
  ];

  // Dedicated clean toolset for Kepala Sekolah (Pimpinan Eksekutif)
  const principalTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'principal-dashboard', icon: LayoutDashboard, label: t('sidebar.principal_dashboard') || 'Dashboard Eksekutif Kepala Sekolah', targetTab: 'principal-hub' },
    { id: 'principal-approval', icon: CheckCircle2, label: t('sidebar.principal_approval') || 'Approval Center Pimpinan', targetTab: 'principal-hub', alert: true },
    { id: 'principal-monitoring', icon: BarChart3, label: t('sidebar.principal_monitoring') || 'Monitoring Akademik & KBM', targetTab: 'principal-hub' },
    { id: 'principal-reports', icon: Printer, label: t('sidebar.principal_reports') || 'Laporan Eksekutif & Cetak', targetTab: 'principal-hub' },
    { id: 'principal-search', icon: Search, label: t('sidebar.principal_search') || 'Pencarian Global Sekolah', targetTab: 'principal-hub' },
  ];

  // Dedicated clean toolset for Siswa / Murid (Zero foreign tools, zero clutter)
  const studentTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'student', icon: GraduationCap, label: t('nav.portal') || 'Portal Siswa (36 Fitur)', targetTab: 'student-hub' },
    { id: 'calendar', icon: Calendar, label: t('mod.schedule') || 'Jadwal & KBM', targetTab: 'schedule' },
    { id: 'upload', icon: Upload, label: t('mod.assignments') || 'Tugas Mandiri', targetTab: 'assignments' },
    { id: 'exams', icon: Award, label: t('mod.quiz') || 'Ujian CBT', targetTab: 'cbt' },
    { id: 'grades', icon: FileSpreadsheet, label: t('mod.grades') || 'Rekap Nilai', targetTab: 'grades' },
    { id: 'attendance', icon: UserCheck, label: t('mod.attendance') || 'Presensi Saya', targetTab: 'attendance' },
    { id: 'database', icon: Database, label: t('mod.arsip_belajar') || 'Space Belajar', targetTab: 'space-belajar' },
  ];

  // Dedicated clean toolset for Guru Pengajar (Zero foreign tools, zero locks)
  const teacherTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse' },
    { id: 'dashboard', icon: LayoutDashboard, label: t('teacher.dashboard_title') || 'Dashboard Guru' },
    { id: 'teaching-session', icon: Play, label: t('teacher.teaching_session') || 'Sesi Pertemuan KBM', alert: true },
    { id: 'attendance', icon: UserCheck, label: t('teacher.student_attendance') || 'Presensi Siswa' },
    { id: 'materials', icon: FolderOpen, label: t('teacher.learning_materials') || 'Materi Pembelajaran' },
    { id: 'assignments', icon: FileText, label: t('teacher.assignment_submissions') || 'Tugas & Submissions' },
    { id: 'gradebook', icon: FileSpreadsheet, label: t('teacher.gradebook') || 'Gradebook (Buku Nilai)' },
    { id: 'exams', icon: Award, label: t('teacher.cbt_exams') || 'Ujian CBT & Bank Soal' },
    { id: 'schedule', icon: Calendar, label: t('teacher.teaching_schedule') || 'Jadwal Mengajar' },
    { id: 'ai-assistant', icon: Bot, label: t('teacher.ai_assistant') || 'AI Teacher Assistant' },
  ];

  // Toolset for other roles
  const defaultTools = [
    { id: 'collapse', icon: ChevronLeft, label: t('sidebar.collapse') || 'Collapse', targetTab: '' },
    { id: 'grid', icon: LayoutGrid, label: t('sidebar.catalog') || 'Katalog Modul', targetTab: 'catalog' },
    { id: 'calendar', icon: Calendar, label: t('mod.schedule') || 'Jadwal & KBM', targetTab: 'schedule' },
  ].filter((t) => !t.targetTab || isTabAllowed(currentUserRole, t.targetTab));

  const activeTools = isAdmin ? adminTools : isKepsek ? principalTools : isTu ? tuTools : isWaliKelas ? homeroomTools : isStudent ? studentTools : isTeacher ? teacherTools : isParent ? parentTools : defaultTools;

  return (
    <aside className="w-16 flex flex-col items-center justify-between py-4 px-2 select-none">
      {/* Top action icons */}
      <div className="flex flex-col items-center gap-2.5">
        {activeTools.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onQuickAction && onQuickAction(t.id)}
              title={t.label}
              className="relative w-10 h-10 rounded-2xl border shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-center transition-all duration-150 cursor-pointer bg-white/70 hover:bg-white border-white/80 text-slate-500 hover:text-slate-900 hover:scale-105 active:scale-95"
            >
              <Icon className="w-4 h-4 stroke-[1.8]" />
              {(t as any).alert && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom: Theme Mode Switcher */}
      <div className="flex flex-col items-center gap-2 mt-4 bg-white/60 backdrop-blur-sm p-1.5 rounded-2xl border border-white/80">
        <button
          onClick={() => setTheme('midnight')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            theme === 'midnight'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title={t('theme.midnight_name') || 'Mode Midnight (Langit Malam)'}
        >
          <Moon className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTheme('formal')}
          className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
            theme === 'formal'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-700'
          }`}
          title={t('theme.formal_name') || 'Mode Formal (Default Putih & Biru)'}
        >
          <Sun className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
