'use client';

import React, { useState } from 'react';
import {
  Search,
  Mail,
  Bell,
  GraduationCap,
  ChevronDown,
  LogOut,
  User as UserIcon,
  Sparkles,
  Layers,
  Award,
  Calendar,
  Users,
  Building2,
  Brain,
  Shield,
  ShieldAlert,
  ShieldCheck,
  HeartPulse,
  Menu,
  X,
  Lock
} from 'lucide-react';
import { User } from '@/lib/types';
import { clearToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { isTabAllowed, ROLE_CONFIGS, RoleType } from '@/lib/rbac';
import { useAppPreferences } from '@/context/AppPreferencesContext';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSwitchRole: (role: any) => void;
  onOpenSettings: () => void;
}

export default function Navbar({
  currentUser,
  activeTab,
  setActiveTab,
  onSwitchRole,
  onOpenSettings,
}: NavbarProps) {
  const { t } = useAppPreferences();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const router = useRouter();

  const userRole = (currentUser?.role || 'murid').toLowerCase();
  const currentRoleConfig = ROLE_CONFIGS[userRole as RoleType] || ROLE_CONFIGS.murid;
  const isSuperAdmin = userRole === 'superadmin';
  const isStudent = userRole === 'murid';
  const isTeacher = userRole === 'guru';
  const isWaliKelas = userRole === 'walikelas';
  const isAdmin = userRole === 'admin';
  const isKepsek = userRole === 'kepsek';
  const isTu = userRole === 'tu';
  const isBk = userRole === 'bk';
  const isParent = userRole === 'parent' || userRole === 'orang_tua' || userRole === 'wali';

  const rawPrimaryNavItems = isSuperAdmin
    ? [
        { id: 'super-admin-hub', label: '👑 Super Admin Control Tower (82 Fitur)', special: true },
      ]
    : isAdmin
    ? [
        { id: 'school-admin', label: t('sidebar.admin_portal') || '🏫 Portal Admin Sekolah (49 Fitur)', special: true },
      ]
    : isKepsek
    ? [
        { id: 'principal-hub', label: t('sidebar.principal_dashboard') || '👑 Portal Eksekutif Kepala Sekolah (33 Fitur)', special: true },
      ]
    : isTu
    ? [
        { id: 'tu-hub', label: t('sidebar.tu_hub') || '💼 Portal Tata Usaha (34 Fitur Administrasi)', special: true },
      ]
    : isBk
    ? [
        { id: 'bk-hub', label: '🧠 Portal Konselor BK (46 Fitur)', special: true },
      ]
    : isParent
    ? [
        { id: 'parent', label: t('sidebar.parent_dashboard') || '👨👩👦 Portal Orang Tua (36 Fitur)', special: true },
      ]
    : isWaliKelas
    ? [
        { id: 'walikelas-hub', label: t('sidebar.homeroom_hub') || '🏫 Portal Wali Kelas (42 Fitur Asuhan)', special: true },
        { id: 'teacher-hub', label: t('nav.teacher_portal') || '👨🏫 Beralih ke Ruang Mengajar Guru' },
        { id: 'schedule', label: t('mod.schedule') || 'Jadwal Kelas' },
        { id: 'attendance', label: t('teacher.student_attendance') || 'Presensi Siswa' },
        { id: 'gradebook', label: t('teacher.gradebook') || 'Rapor Kelas' },
      ]
    : isStudent
    ? [
        { id: 'student-hub', label: t('nav.portal') || '🎓 Portal Siswa (36 Fitur)', special: true },
        { id: 'schedule', label: t('mod.schedule') || 'Jadwal & KBM' },
        { id: 'assignments', label: t('mod.assignments') || 'Tugas Mandiri' },
        { id: 'cbt', label: t('mod.quiz') || 'Ujian CBT' },
        { id: 'grades', label: t('mod.grades') || 'Rekap Nilai' },
        { id: 'attendance', label: t('mod.attendance') || 'Presensi Saya' },
      ]
    : isTeacher
    ? [
        { id: 'teacher-hub', label: t('nav.teacher_portal') || '👨🏫 Ruang Mengajar Guru (KBM)', special: true },
        { id: 'walikelas-hub', label: t('nav.homeroom_portal') || '🏫 Portal Wali Kelas (Asuhan)' },
        { id: 'schedule', label: t('mod.schedule') || 'Jadwal & KBM' },
        { id: 'attendance', label: t('teacher.student_attendance') || 'Presensi Siswa' },
        { id: 'gradebook', label: t('teacher.gradebook') || 'Gradebook & Rapor' },
      ]
    : [
        { id: 'catalog', label: t('nav.catalog') || '✨ Katalog 58 Modul', special: true },
        { id: 'journey', label: 'Alur Akademik' },
        { id: 'cbt', label: t('mod.quiz') || 'Ujian CBT' },
        { id: 'gradebook', label: t('teacher.gradebook') || 'Gradebook & Rapor' },
        { id: 'walikelas-bk', label: 'Wali Kelas & BK' },
        { id: 'schedule', label: t('mod.schedule') || 'Jadwal & KBM' },
        { id: 'parent', label: t('sidebar.parent_dashboard') || 'Portal Ortu' },
        { id: 'ai-analytics', label: 'AI & Analitik' },
      ];

  const rawSecondaryNavItems = isSuperAdmin || isAdmin || isStudent || isTeacher || isKepsek || isTu || isBk
    ? []
    : [
        { id: 'classes', label: t('nav.classes') || 'Rombel Kelas' },
        { id: 'subjects', label: 'Mata Pelajaran' },
      ];

  // Filter items based on active role permissions
  const primaryNavItems = rawPrimaryNavItems.filter((item) =>
    isTabAllowed(userRole, item.id)
  );
  const secondaryNavItems = rawSecondaryNavItems.filter((item) =>
    isTabAllowed(userRole, item.id)
  );

  const roles = [
    { id: 'superadmin', label: t('role.superadmin') || '👑 Super Admin (Platform)', icon: ShieldAlert },
    { id: 'murid', label: t('role.murid') || 'Siswa / Murid', icon: GraduationCap },
    { id: 'guru', label: t('role.guru') || 'Guru Pengampu', icon: Users },
    { id: 'walikelas', label: t('role.walikelas') || 'Wali Kelas', icon: UserIcon },
    { id: 'bk', label: t('role.bk') || 'Konselor BK', icon: HeartPulse },
    { id: 'tu', label: t('role.tu') || 'Tata Usaha (TU)', icon: Building2 },
    { id: 'kepsek', label: t('role.kepsek') || 'Kepala Sekolah', icon: Award },
    { id: 'admin', label: t('role.admin') || 'Admin Sekolah', icon: Shield },
    { id: 'parent', label: t('role.parent') || 'Orang Tua / Wali', icon: Users },
  ];

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  const handleRoleSelect = (roleId: string) => {
    onSwitchRole(roleId);
    setShowProfileMenu(false);
    const targetConfig = ROLE_CONFIGS[roleId as RoleType] || ROLE_CONFIGS.murid;
    setActiveTab(targetConfig.defaultTab);
  };

  return (
    <header className="w-full px-4 lg:px-6 py-3.5 flex flex-col gap-2 z-30">
      <div className="w-full flex items-center justify-between">
        {/* Left: Brand Logo & Role Badge */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab(isSuperAdmin ? 'super-admin-hub' : isAdmin ? 'school-admin' : isKepsek ? 'principal-hub' : isTu ? 'tu-hub' : isBk ? 'bk-hub' : isStudent ? 'student-hub' : isTeacher ? 'teacher-hub' : isWaliKelas ? 'walikelas-hub' : isParent ? 'parent' : 'catalog')}
            className="cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-indigo-900 flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 font-sans block leading-none">
                myacademic
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600 block">
                  School OS
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-100 text-indigo-800">
                  {currentRoleConfig.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Role-Filtered Navigation Pills */}
        {isAdmin ? (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Workspace Operasional Admin Sekolah (49 Modul)</span>
          </div>
        ) : isTu ? (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold border border-slate-800">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Portal Administrasi Tata Usaha (34 Fitur TU)</span>
          </div>
        ) : isBk ? (
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold border border-slate-800">
            <Brain className="w-4 h-4 text-rose-400" />
            <span>Portal Konselor BK (46 Fitur Master Suite)</span>
          </div>
        ) : isParent ? (
          <div className="hidden lg:flex items-center gap-2 bg-gradient-to-r from-teal-800 to-emerald-900 text-white px-4 py-1.5 rounded-full shadow-md text-xs font-bold border border-teal-700">
            <Users className="w-4 h-4 text-emerald-300" />
            <span>Portal Pemantauan Orang Tua / Wali Murid (36 Fitur Lengkap)</span>
          </div>
        ) : (
          <nav className="hidden lg:flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
            {primaryNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? item.special
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                        : 'bg-slate-900 text-white shadow-md'
                      : item.special
                      ? 'text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* More Subsystems Dropdown (if role has secondary items) */}
            {secondaryNavItems.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 transition-all cursor-pointer"
                >
                  <span>{t('common.more') || 'Lainnya'}</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {showMoreMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {secondaryNavItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setActiveTab(sub.id);
                          setShowMoreMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          activeTab === sub.id
                            ? 'bg-slate-900 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {/* Right: Quick Action Hub & Multi-Role Persona Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Mobile Nav Toggle */}
          {!isAdmin && (
            <button
              onClick={() => setShowMobileNav(!showMobileNav)}
              className="lg:hidden w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 border border-white shadow-sm cursor-pointer"
            >
              {showMobileNav ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Module Hub Launcher Shortcut - strictly only for roles with catalog permission (e.g. general staff) */}
          {!isStudent && !isAdmin && isTabAllowed(userRole, 'catalog') && (
            <button
              onClick={() => setActiveTab('catalog')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-indigo-700 border border-indigo-100 shadow-xs text-xs font-bold transition-all cursor-pointer hover:shadow-sm"
              title={t('nav.catalog') || 'Buka Katalog Lengkap 58 Modul'}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>{t('nav.catalog') || 'Katalog 58 Modul'}</span>
            </button>
          )}

          {/* Search button */}
          <button
            onClick={() => setActiveTab(isAdmin ? 'school-admin' : isKepsek ? 'principal-hub' : isTu ? 'tu-hub' : isStudent ? 'student-hub' : isTeacher ? 'teacher-hub' : 'catalog')}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 border border-white/90 shadow-sm transition-all cursor-pointer"
            title={t('nav.search_tooltip') || 'Cari Modul & Data'}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification button */}
          <button className="relative w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 border border-white/90 shadow-sm transition-all cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile & Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white/80 hover:bg-white border border-white/90 shadow-sm transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight mr-1">
                <div className="font-semibold text-slate-800 line-clamp-1">{currentUser?.name || 'Ahmad Siswa'}</div>
                <div className="text-[10px] text-indigo-600 uppercase font-bold tracking-wider">{currentRoleConfig.label}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Persona Menu Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2 shadow-xl border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>

                {/* Ganti Persona / Peran Portal (Hanya untuk Admin / Non-Murid) */}
                {!isStudent && (
                  <div className="py-2 border-b border-slate-100">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t('nav.select_role_title') || 'PILIH PERAN PORTAL (9 ROLE)'}
                    </div>
                    <div className="space-y-0.5 max-h-48 overflow-y-auto pr-1">
                      {roles.map((r) => {
                        const Icon = r.icon;
                        const isCurrent = userRole === r.id;
                        return (
                          <button
                            key={r.id}
                            onClick={() => handleRoleSelect(r.id)}
                            className={`w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-xl transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-indigo-50 text-indigo-900 font-bold'
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-slate-400" />
                              <span>{r.label}</span>
                            </div>
                            {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    onClick={() => { onOpenSettings(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    {t('nav.settings') || 'Pengaturan Profil & Akun'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('nav.logout') || 'Keluar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Small Screens) */}
      {showMobileNav && (
        <div className="lg:hidden flex flex-wrap gap-1.5 bg-white/95 p-3 rounded-2xl border border-white shadow-md animate-in slide-in-from-top-2 duration-150">
          {[...primaryNavItems, ...secondaryNavItems].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setShowMobileNav(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
