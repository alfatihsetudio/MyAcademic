'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import AccountSettingsModal from '@/components/Modals/AccountSettingsModal';
import StudentSettingsModal from '@/components/Modals/StudentSettingsModal';
import SubmitTaskModal from '@/components/Modals/SubmitTaskModal';

import AcademicJourney from '@/components/AcademicJourney';
import KnowledgeTable from '@/components/KnowledgeTable';
import ProgressGauges from '@/components/ProgressGauges';

import ModuleCatalogView from '@/components/Views/ModuleCatalogView';
import CbtExamView from '@/components/Views/CbtExamView';
import GradebookReportView from '@/components/Views/GradebookReportView';
import HomeroomBkView from '@/components/Views/HomeroomBkView';
import TimetableSessionView from '@/components/Views/TimetableSessionView';
import SchoolMasterView from '@/components/Views/SchoolMasterView';
import ParentPortalView from '@/components/Views/ParentPortalView';
import AiAnalyticsView from '@/components/Views/AiAnalyticsView';
import StudentHubView from '@/components/Views/StudentHubView';
import StudentGlassDashboard from '@/components/Views/StudentGlassDashboard';
import TeacherHubView from '@/components/Views/TeacherHubView';
import TeacherGlassDashboard from '@/components/Views/TeacherGlassDashboard';
import SchoolAdminHubView from '@/components/Views/SchoolAdminHubView';
import SchoolAdminGlassDashboard from '@/components/Views/SchoolAdminGlassDashboard';
import SuperAdminHubView from '@/components/Views/SuperAdminHubView';
import PrincipalHubView, { PrincipalMenuKey } from '@/components/Views/PrincipalHubView';
import TuHubView from '@/components/Views/TuHubView';
import TuGlassDashboard from '@/components/Views/TuGlassDashboard';
import HomeroomHubView, { HomeroomMenuKey } from '@/components/Views/HomeroomHubView';
import BkHubView from '@/components/Views/BkHubView';

import ClassView from '@/components/Views/ClassView';
import SubjectView from '@/components/Views/SubjectView';
import AssignmentView from '@/components/Views/AssignmentView';
import GradeView from '@/components/Views/GradeView';
import AttendanceView from '@/components/Views/AttendanceView';
import SpaceBelajarView from '@/components/Views/SpaceBelajarView';
import AccessDeniedView from '@/components/Views/AccessDeniedView';
import { isTabAllowed, ROLE_CONFIGS, RoleType } from '@/lib/rbac';

import { fetchDashboard, DEFAULT_DASHBOARD, DEFAULT_USER, getStoredUser, setStoredUser } from '@/lib/api';
import { DashboardResponse, User } from '@/lib/types';
import { toast } from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUserState] = useState<User>(DEFAULT_USER);
  const [activeTab, setActiveTab] = useState<string>('student-hub');
  const [teacherSubMenu, setTeacherSubMenu] = useState<string>('dashboard');
  const [principalSubMenu, setPrincipalSubMenu] = useState<PrincipalMenuKey>('dashboard');
  const [homeroomSubMenu, setHomeroomSubMenu] = useState<HomeroomMenuKey>('dashboard');
  const [parentSubMenu, setParentSubMenu] = useState<string>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardResponse>(DEFAULT_DASHBOARD);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(1);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('Pengumpulan Tugas Mandiri');

  useEffect(() => {
    setMounted(true);
    const stored = getStoredUser();
    if (stored) {
      setCurrentUserState(stored);
      if (stored.role === 'superadmin') setActiveTab('super-admin-hub');
      else if (stored.role === 'admin') router.push('/admin');
      else if (stored.role === 'kepsek') setActiveTab('principal-hub');
      else if (stored.role === 'tu') router.push('/tu');
      else if (stored.role === 'walikelas') setActiveTab('walikelas-hub');
      else if (stored.role === 'bk') setActiveTab('bk-hub');
      else if (stored.role === 'parent' || stored.role === 'orang_tua') setActiveTab('parent');
      else if (stored.role === 'guru') router.push('/guru');
      else if (stored.role === 'murid') router.push('/siswa');
    }

    let isMounted = true;
    fetchDashboard()
      .then((data) => {
        if (isMounted && data && data.success) {
          setDashboardData(data);
        }
      })
      .catch(() => {
        toast.error('Gagal memuat dashboard. Silakan coba lagi.');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setStoredUser(user);
  };

  const handleSwitchRole = (role: string) => {
    let name = 'Ahmad Siswa';
    if (role === 'superadmin') name = 'Super Admin (Platform Owner)';
    else if (role === 'admin') name = 'Hendra Pratama, S.Kom (Admin Sekolah)';
    else if (role === 'kepsek') name = 'Dr. H. Sulaiman, M.Si (Kepsek)';
    else if (role === 'guru') name = 'Budi Santoso, M.Pd (Guru)';
    else if (role === 'walikelas') name = 'Siti Aminah, M.Pd (Wali Kelas)';
    else if (role === 'bk') name = 'Nurul Hidayah, S.Psi (Konselor BK)';
    else if (role === 'tu') name = 'Hendra Pratama (Staff TU)';
    else if (role === 'parent') name = 'Bambang Trianto (Wali Murid)';

    const updated: User = {
      ...currentUser,
      role,
      name,
    };
    setCurrentUser(updated);

    // Auto-navigate to appropriate default portal for the selected role
    if (role === 'admin') {
      router.push('/admin');
      return;
    } else if (role === 'murid') {
      router.push('/siswa');
      return;
    } else if (role === 'guru') {
      router.push('/guru');
      return;
    } else if (role === 'tu') {
      router.push('/tu');
      return;
    }

    const targetConfig = ROLE_CONFIGS[role as RoleType] || ROLE_CONFIGS.murid;
    setActiveTab(targetConfig.defaultTab);
  };

  useEffect(() => {
    if (currentUser.role === 'superadmin') {
      const allowed = ROLE_CONFIGS.superadmin.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('super-admin-hub');
      }
    } else if (currentUser.role === 'admin') {
      const allowed = ROLE_CONFIGS.admin.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('school-admin');
      }
    } else if (currentUser.role === 'kepsek') {
      const allowed = ROLE_CONFIGS.kepsek.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('principal-hub');
      }
    } else if (currentUser.role === 'murid') {
      const allowed = ROLE_CONFIGS.murid.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('student-hub');
      }
    } else if (currentUser.role === 'guru') {
      const allowed = ROLE_CONFIGS.guru.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('teacher-hub');
      }
    } else if (currentUser.role === 'tu') {
      const allowed = ROLE_CONFIGS.tu.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('tu-hub');
      }
    } else if (currentUser.role === 'walikelas') {
      const allowed = ROLE_CONFIGS.walikelas.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('walikelas-hub');
      }
    } else if (currentUser.role === 'bk') {
      const allowed = ROLE_CONFIGS.bk.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('bk-hub');
      }
    } else if (currentUser.role === 'parent' || currentUser.role === 'orang_tua' || currentUser.role === 'wali') {
      const allowed = ROLE_CONFIGS.parent.allowedTabs;
      if (!allowed.includes(activeTab)) {
        setActiveTab('parent');
      }
    }
  }, [currentUser.role, activeTab]);

  const handleQuickAction = (action: string) => {
    if (currentUser.role === 'admin') {
      setActiveTab('school-admin');
      return;
    }

    if (currentUser.role === 'parent' || currentUser.role === 'orang_tua' || currentUser.role === 'wali') {
      setActiveTab('parent');
      if (action.startsWith('parent-')) {
        setParentSubMenu(action.replace('parent-', ''));
      }
      return;
    }

    if (currentUser.role === 'tu') {
      setActiveTab('tu-hub');
      return;
    }

    if (currentUser.role === 'walikelas') {
      setActiveTab('walikelas-hub');
      if (action === 'homeroom-students') setHomeroomSubMenu('data-siswa');
      else if (action === 'homeroom-attendance') setHomeroomSubMenu('presensi-hari-ini');
      else if (action === 'homeroom-academic') setHomeroomSubMenu('monitoring-nilai');
      else if (action === 'homeroom-parents') setHomeroomSubMenu('daftar-orang-tua');
      else if (action === 'homeroom-reports') setHomeroomSubMenu('kelengkapan-nilai-rapor');
      else if (action === 'homeroom-analytics') setHomeroomSubMenu('class-performance');
      else setHomeroomSubMenu('dashboard');
      return;
    }

    if (currentUser.role === 'kepsek') {
      setActiveTab('principal-hub');
      if (action === 'principal-approval') setPrincipalSubMenu('approval-center');
      else if (action === 'principal-monitoring') setPrincipalSubMenu('monitoring-akademik');
      else if (action === 'principal-reports') setPrincipalSubMenu('laporan-eksekutif');
      else if (action === 'principal-search') setPrincipalSubMenu('global-search');
      else setPrincipalSubMenu('dashboard');
      return;
    }

    if (currentUser.role === 'murid') {
      switch (action) {
        case 'student':
          setActiveTab('student-hub');
          break;
        case 'calendar':
          setActiveTab('schedule');
          break;
        case 'upload':
          setActiveTab('assignments');
          break;
        case 'exams':
          setActiveTab('cbt');
          break;
        case 'grades':
          setActiveTab('grades');
          break;
        case 'attendance':
          setActiveTab('attendance');
          break;
        case 'database':
          setActiveTab('space-belajar');
          break;
        default:
          setActiveTab('student-hub');
          break;
      }
      return;
    }

    if (currentUser.role === 'guru') {
      setActiveTab('teacher-hub');
      if (['dashboard', 'teaching-session', 'attendance', 'materials', 'assignments', 'gradebook', 'exams', 'schedule', 'ai-assistant', 'teaching-journal', 'question-bank'].includes(action)) {
        setTeacherSubMenu(action);
      }
      return;
    }

    switch (action) {
      case 'teacher':
        setActiveTab('teacher-hub');
        break;
      case 'student':
        setActiveTab('student-hub');
        break;
      case 'grid':
        setActiveTab('catalog');
        break;
      case 'database':
        setActiveTab('space-belajar');
        break;
      case 'calendar':
        setActiveTab('schedule');
        break;
      case 'upload':
        setIsSubmitModalOpen(true);
        break;
      case 'plus':
        setActiveTab('assignments');
        break;
      case 'star':
        setActiveTab('gradebook');
        break;
      case 'send':
        setActiveTab('attendance');
        break;
      case 'alert':
        setActiveTab('walikelas-bk');
        break;
      default:
        setActiveTab('catalog');
        break;
    }
  };

  const handleJourneyAction = (actionKey: string) => {
    if (actionKey === 'submit-task') {
      setSelectedTaskId(1);
      setSelectedTaskTitle('Pengumpulan Tugas Mandiri');
      setIsSubmitModalOpen(true);
    } else if (actionKey === 'classes') {
      setActiveTab('classes');
    } else if (actionKey === 'subjects') {
      setActiveTab('subjects');
    } else if (actionKey === 'assignments') {
      setActiveTab('assignments');
    } else if (actionKey === 'grades') {
      setActiveTab('grades');
    } else if (actionKey === 'attendance') {
      setActiveTab('attendance');
    } else if (actionKey === 'space-belajar') {
      setActiveTab('space-belajar');
    } else if (actionKey === 'cbt') {
      setActiveTab('cbt');
    } else if (actionKey === 'gradebook') {
      setActiveTab('gradebook');
    } else if (actionKey === 'catalog') {
      setActiveTab('catalog');
    }
  };

  const isAccessible = isTabAllowed(currentUser.role, activeTab);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#dde4ed]">
        <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-700">Memuat sesi pengguna...</span>
        </div>
      </div>
    );
  }

  // Khusus role Murid / Siswa diarahkan ke tampilan Bento Frosted Glass (Opsi A)
  if (currentUser.role === 'murid') {
    return (
      <StudentGlassDashboard
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
    );
  }

  // Khusus role Guru Pengampu / Pengajar diarahkan ke tampilan Bento Frosted Glass Guru
  if (currentUser.role === 'guru') {
    return (
      <TeacherGlassDashboard
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        defaultFeature={teacherSubMenu}
      />
    );
  }

  // Khusus role Tata Usaha diarahkan ke tampilan Bento Frosted Glass TU
  if (currentUser.role === 'tu') {
    return (
      <TuGlassDashboard
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        defaultFeature={activeTab === 'tu-hub' ? 'dashboard' : activeTab}
      />
    );
  }

  // Khusus role Admin Sekolah diarahkan ke tampilan Bento Frosted Glass Admin Sekolah
  if (currentUser.role === 'admin') {
    return (
      <SchoolAdminGlassDashboard
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        defaultFeature={activeTab === 'school-admin' ? 'dashboard' : activeTab}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#dde4ed] text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* 1. Global Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        onSwitchRole={handleSwitchRole}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Workspace Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto px-4 lg:px-6 pb-12 gap-4 items-start mt-4">
        {/* Sidebar Toolstrip strictly for non-admin, non-superadmin, non-tu, non-walikelas, and non-bk roles (since they have their own comprehensive sidebars) */}
        {currentUser.role !== 'superadmin' && currentUser.role !== 'admin' && currentUser.role !== 'tu' && currentUser.role !== 'walikelas' && currentUser.role !== 'bk' && (
          <Sidebar currentUserRole={currentUser.role} onQuickAction={handleQuickAction} />
        )}

        {/* Dynamic Content Pane */}
        <main className="flex-1 min-w-0 w-full flex flex-col gap-6">
          {currentUser.role === 'superadmin' || activeTab === 'super-admin-hub' ? (
            <div className="animate-in fade-in duration-150">
              <SuperAdminHubView
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onImpersonateUser={(role, name) => handleSwitchRole(role)}
              />
            </div>
          ) : currentUser.role === 'admin' ? (
            <div className="animate-in fade-in duration-150">
              <SchoolAdminGlassDashboard
                currentUser={currentUser}
                onSwitchRole={handleSwitchRole}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                defaultFeature="dashboard"
              />
            </div>
          ) : currentUser.role === 'kepsek' ? (
            <div className="animate-in fade-in duration-150">
              <PrincipalHubView
                currentUser={currentUser}
                externalActiveMenu={principalSubMenu}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          ) : currentUser.role === 'tu' ? (
            <div className="animate-in fade-in duration-150">
              <TuGlassDashboard
                currentUser={currentUser}
                onSwitchRole={handleSwitchRole}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                defaultFeature={activeTab === 'tu-hub' ? 'dashboard' : activeTab}
              />
            </div>
          ) : currentUser.role === 'bk' || activeTab === 'bk-hub' ? (
            <div className="animate-in fade-in duration-150">
              <BkHubView
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          ) : currentUser.role === 'walikelas' || activeTab === 'walikelas-hub' ? (
            <div className="animate-in fade-in duration-150">
              <HomeroomHubView
                currentUser={currentUser}
                externalActiveMenu={homeroomSubMenu}
                onMenuChange={(m) => setHomeroomSubMenu(m)}
                onNavigateTab={(tab) => {
                  if (tab === 'teacher-hub') {
                    handleSwitchRole('guru');
                  } else {
                    setActiveTab(tab);
                  }
                }}
              />
            </div>
          ) : !isAccessible ? (
            <AccessDeniedView
              currentRole={currentUser.role}
              attemptedTab={activeTab}
              onGoHome={() => {
                const defaultTab =
                  ROLE_CONFIGS[currentUser.role.toLowerCase() as RoleType]?.defaultTab || 'student-hub';
                setActiveTab(defaultTab);
              }}
              onSwitchRole={handleSwitchRole}
            />
          ) : (
            <>
              {/* TAB 0: 👑 PORTAL EKSEKUTIF KEPALA SEKOLAH (33 FITUR LENGKAP) */}
              {activeTab === 'principal-hub' && (
                <div className="animate-in fade-in duration-150">
                  <PrincipalHubView
                    currentUser={currentUser}
                    externalActiveMenu={principalSubMenu}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </div>
              )}

              {/* TAB 1: ✨ KATALOG LENGKAP 58 MODUL */}
              {activeTab === 'catalog' && (
                <div className="animate-in fade-in duration-150">
                  <ModuleCatalogView
                    currentUserRole={currentUser.role}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </div>
              )}

              {/* TAB 1.5: 🎓 PORTAL SISWA MASTER (36 FITUR LENGKAP) */}
              {activeTab === 'student-hub' && (
                <div className="animate-in fade-in duration-150">
                  <StudentHubView
                    currentUser={currentUser}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                </div>
              )}

              {/* TAB 1.6: 👨🏫 PORTAL GURU MASTER (38 FITUR LENGKAP) */}
              {activeTab === 'teacher-hub' && (
                <div className="animate-in fade-in duration-150">
                  <TeacherGlassDashboard
                    currentUser={currentUser}
                    onSwitchRole={handleSwitchRole}
                    onOpenSettings={() => setIsSettingsModalOpen(true)}
                    defaultFeature={teacherSubMenu}
                  />
                </div>
              )}

          {/* TAB 2: ALUR AKADEMIK (JOURNEY) */}
          {activeTab === 'journey' && (
            <div className="flex flex-col gap-6 w-full animate-in fade-in duration-150">
              <AcademicJourney
                members={dashboardData.members || []}
                stages={dashboardData.workflow_stages || []}
                onSelectAction={handleJourneyAction}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <KnowledgeTable
                  items={dashboardData.knowledge_items || []}
                  onOpenItem={() => setActiveTab('subjects')}
                />
                <ProgressGauges stats={dashboardData.stats} />
              </div>
            </div>
          )}

          {/* TAB 3: UJIAN CBT & ASESMEN DIGITAL */}
          {activeTab === 'cbt' && (
            <div className="animate-in fade-in duration-150">
              <CbtExamView />
            </div>
          )}

          {/* TAB 4: GRADEBOOK SENTRAL & E-RAPOR */}
          {activeTab === 'gradebook' && (
            <div className="animate-in fade-in duration-150">
              <GradebookReportView />
            </div>
          )}

          {/* TAB 5: WALI KELAS, BK & SISWA BERISIKO (EWS) */}
          {activeTab === 'walikelas-bk' && (
            <div className="animate-in fade-in duration-150">
              <HomeroomBkView />
            </div>
          )}

          {/* TAB 6: JADWAL PELAJARAN & SESI KBM */}
          {activeTab === 'schedule' && (
            <div className="animate-in fade-in duration-150">
              <TimetableSessionView />
            </div>
          )}

          {/* TAB 7: TATA USAHA, SEKOLAH & MULTI-TENANCY */}
          {activeTab === 'school-tu' && (
            <div className="animate-in fade-in duration-150">
              <SchoolMasterView />
            </div>
          )}

          {/* TAB 8: PORTAL ORANG TUA / WALI MURID (36 FITUR MASTER SUITE) */}
          {activeTab === 'parent' && (
            <div className="animate-in fade-in duration-150">
              <ParentPortalView
                externalActiveMenu={parentSubMenu}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            </div>
          )}

          {/* TAB 9: AI SCHOOL ASSISTANT & ANALITIK KEPSEK */}
          {activeTab === 'ai-analytics' && (
            <div className="animate-in fade-in duration-150">
              <AiAnalyticsView />
            </div>
          )}

          {/* SECONDARY TABS: KELAS */}
          {activeTab === 'classes' && (
            <div className="animate-in fade-in duration-150">
              <ClassView />
            </div>
          )}

          {/* SECONDARY TABS: MAPEL */}
          {activeTab === 'subjects' && (
            <div className="animate-in fade-in duration-150">
              <SubjectView />
            </div>
          )}

          {/* SECONDARY TABS: TUGAS */}
          {activeTab === 'assignments' && (
            <div className="animate-in fade-in duration-150">
              <AssignmentView
                onOpenSubmit={(id: number, title: string) => {
                  setSelectedTaskId(id);
                  setSelectedTaskTitle(title);
                  setIsSubmitModalOpen(true);
                }}
              />
            </div>
          )}

          {/* SECONDARY TABS: PENILAIAN */}
          {activeTab === 'grades' && (
            <div className="animate-in fade-in duration-150">
              <GradeView />
            </div>
          )}

          {/* SECONDARY TABS: ABSENSI */}
          {activeTab === 'attendance' && (
            <div className="animate-in fade-in duration-150">
              <AttendanceView />
            </div>
          )}

          {/* SECONDARY TABS: SPACE BELAJAR */}
          {activeTab === 'space-belajar' && (
            <div className="animate-in fade-in duration-150">
              <SpaceBelajarView />
            </div>
          )}
            </>
          )}
        </main>
      </div>

      {/* 3. Global Modals (Student-only submit modal, never shown to admin, teachers or staff) */}
      {currentUser.role === 'murid' && (
        <SubmitTaskModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          assignmentId={selectedTaskId}
          assignmentTitle={selectedTaskTitle}
          onSuccess={() => {
            fetchDashboard().then((d) => d && setDashboardData(d));
          }}
        />
      )}

      {currentUser.role === 'murid' ? (
        <StudentSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(u) => setCurrentUser(u)}
        />
      ) : (
        <AccountSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(u) => setCurrentUser(u)}
        />
      )}
    </div>
  );
}
