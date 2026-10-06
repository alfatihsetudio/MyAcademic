'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Cpu,
  Layers,
  Sparkles,
  LifeBuoy,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  Lock,
  Zap,
  TrendingUp,
  Server,
  Database,
  Radio,
  Clock,
  ChevronRight,
  ChevronDown,
  Filter,
  Plus,
  Sliders,
  DollarSign,
  PieChart,
  HardDrive,
  FileText,
  Activity,
  UserCheck,
  Send,
  Flag,
  Globe,
  BellRing,
  Key,
  ExternalLink,
  ShieldCheck,
  Power,
  ShieldAlert,
  UserX,
  FileSpreadsheet,
  Download,
  Upload,
  Settings,
  HelpCircle,
  MessageSquare,
  BarChart3,
  Calendar,
  SlidersHorizontal,
  Mail,
  Share2,
  Trash2,
  Archive,
  BookOpen,
  ArrowRight,
  Shield
} from 'lucide-react';
import { User } from '@/lib/types';

interface SuperAdminHubViewProps {
  currentUser?: User;
  onNavigateTab?: (tab: string) => void;
  onImpersonateUser?: (role: string, name: string) => void;
}

export type SuperAdminNavSection =
  | 'command-center'
  | 'tenants'
  | 'school-360'
  | 'registrations'
  | 'onboarding'
  | 'users'
  | 'staff'
  | 'roles-permissions'
  | 'academic-templates'
  | 'billing'
  | 'packages'
  | 'invoices'
  | 'revenue-analytics'
  | 'features'
  | 'feature-flags'
  | 'beta-program'
  | 'platform-analytics'
  | 'customer-success'
  | 'system-health'
  | 'infrastructure'
  | 'error-center'
  | 'incidents'
  | 'maintenance-mode'
  | 'security-center'
  | 'audit-logs'
  | 'tenant-isolation'
  | 'data-management'
  | 'backup-restore'
  | 'integrations'
  | 'ai-operations'
  | 'ai-cost'
  | 'announcements'
  | 'email-templates'
  | 'support-desk'
  | 'platform-settings'
  | 'emergency-center';

export default function SuperAdminHubView({
  currentUser,
  onNavigateTab,
  onImpersonateUser,
}: SuperAdminHubViewProps) {
  // Navigation active tab
  const [activeMenu, setActiveMenu] = useState<SuperAdminNavSection>('command-center');
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Collapsible groups for 16-section sidebar (Section 77)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    command: true,
    tenants: true,
    users: false,
    academic: false,
    billing: false,
    features: false,
    analytics: false,
    system: false,
    security: false,
    data: false,
    integrations: false,
    ai: false,
    communication: false,
    support: false,
    settings: false,
  });

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Interactive filters
  const [tenantFilter, setTenantFilter] = useState<'all' | 'active' | 'trial' | 'pending' | 'expired' | 'suspended'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedSchool360, setSelectedSchool360] = useState<any | null>(null);
  const [isImpersonateModalOpen, setIsImpersonateModalOpen] = useState(false);
  const [impersonateTarget, setImpersonateTarget] = useState<any | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyCode, setEmergencyCode] = useState('');
  const [emergencyActionType, setEmergencyActionType] = useState('LOCK_ALL_LOGINS');
  const [emergencyReason, setEmergencyReason] = useState('');
  const [isAddSchoolModalOpen, setIsAddSchoolModalOpen] = useState(false);
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [isCreateIncidentModalOpen, setIsCreateIncidentModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  // New School Form
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    npsn: '',
    jenjang: 'SMA',
    package: 'Pro',
    admin_name: '',
    admin_email: '',
    subdomain: '',
  });

  // New Incident Form
  const [incidentForm, setIncidentForm] = useState({
    title: '',
    severity: 'MAJOR',
    affected_services: 'API & Gateway',
    notes: '',
  });

  // Announcement Form
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    target: 'ALL_SCHOOLS',
    message: '',
    is_urgent: false,
  });

  // Dynamic Dataset: 12 Tenants (8 Aktif, 2 Trial, 1 Expired, 1 Pending = Tepat 12)
  const [tenantsList, setTenantsList] = useState([
    {
      id: 1,
      name: 'SMA Negeri 1 Jakarta',
      npsn: '20107821',
      jenjang: 'SMA',
      status: 'active',
      package: 'Enterprise',
      subdomain: 'sman1jkt.myacademic.id',
      custom_domain: 'portal.sman1jkt.sch.id',
      student_count: 1080,
      teacher_count: 64,
      total_users: 1158,
      storage_used_gb: 74.5,
      storage_limit_gb: 200.0,
      admin_name: 'Dra. Endang Purwanti',
      admin_email: 'admin@sman1jkt.sch.id',
      last_activity: '4 menit lalu',
      data_quality: 98,
      mrr: 7500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 2,
      name: 'SMA Garuda Cendekia',
      npsn: '20109943',
      jenjang: 'SMA',
      status: 'active',
      package: 'Pro',
      subdomain: 'garudacendekia.myacademic.id',
      custom_domain: 'lms.garudacendekia.sch.id',
      student_count: 540,
      teacher_count: 38,
      total_users: 586,
      storage_used_gb: 38.2,
      storage_limit_gb: 150.0,
      admin_name: 'Hendra Pratama, S.Kom',
      admin_email: 'admin@garudacendekia.sch.id',
      last_activity: '2 menit lalu',
      data_quality: 96,
      mrr: 3500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 3,
      name: 'SMP Bintang Nusantara',
      npsn: '20204411',
      jenjang: 'SMP',
      status: 'trial',
      package: 'Trial (14 Hari)',
      subdomain: 'smpbintang.myacademic.id',
      custom_domain: null,
      student_count: 310,
      teacher_count: 24,
      total_users: 339,
      storage_used_gb: 12.4,
      storage_limit_gb: 25.0,
      admin_name: 'Budi Santoso, S.Pd',
      admin_email: 'admin@smpbintang.sch.id',
      last_activity: '15 menit lalu',
      data_quality: 84,
      mrr: 0,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 4,
      name: 'SMK TI Informatika Mandiri',
      npsn: '20503399',
      jenjang: 'SMK',
      status: 'active',
      package: 'Enterprise',
      subdomain: 'smkti-mandiri.myacademic.id',
      custom_domain: 'portal.smkti.sch.id',
      student_count: 920,
      teacher_count: 52,
      total_users: 983,
      storage_used_gb: 92.1,
      storage_limit_gb: 250.0,
      admin_name: 'Rian Hidayat, M.Kom',
      admin_email: 'rian@smkti.sch.id',
      last_activity: '1 menit lalu',
      data_quality: 99,
      mrr: 7500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 5,
      name: 'SD Teladan Bangsa',
      npsn: '20101188',
      jenjang: 'SD',
      status: 'expired',
      package: 'Basic',
      subdomain: 'sdteladan.myacademic.id',
      custom_domain: null,
      student_count: 280,
      teacher_count: 18,
      total_users: 302,
      storage_used_gb: 14.8,
      storage_limit_gb: 50.0,
      admin_name: 'Siti Nurhaliza, S.Pd',
      admin_email: 'siti@sdteladan.sch.id',
      last_activity: '4 hari lalu',
      data_quality: 90,
      mrr: 0,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 6,
      name: 'SMP Insan Gemilang',
      npsn: '20208833',
      jenjang: 'SMP',
      status: 'pending',
      package: 'Pro (Permohonan)',
      subdomain: 'smp-insan.myacademic.id',
      custom_domain: null,
      student_count: 0,
      teacher_count: 0,
      total_users: 1,
      storage_used_gb: 0.1,
      storage_limit_gb: 100.0,
      admin_name: 'Wahyu Saputra, M.Pd',
      admin_email: 'wahyu@insangemilang.sch.id',
      last_activity: '45 menit lalu',
      data_quality: 20,
      mrr: 0,
      isolation_status: 'PENDING_PROVISION',
    },
    {
      id: 7,
      name: 'SMA Taruna Nusantara Perkasa',
      npsn: '20108877',
      jenjang: 'SMA',
      status: 'active',
      package: 'Enterprise',
      subdomain: 'taruna-perkasa.myacademic.id',
      custom_domain: null,
      student_count: 680,
      teacher_count: 45,
      total_users: 735,
      storage_used_gb: 42.5,
      storage_limit_gb: 200.0,
      admin_name: 'Kol. (Purn) Suryadi',
      admin_email: 'admin@tarunaperkasa.sch.id',
      last_activity: '10 menit lalu',
      data_quality: 97,
      mrr: 7500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 8,
      name: 'SMP Al-Azhar Mandiri',
      npsn: '20207766',
      jenjang: 'SMP',
      status: 'active',
      package: 'Pro',
      subdomain: 'alazhar-mandiri.myacademic.id',
      custom_domain: null,
      student_count: 420,
      teacher_count: 30,
      total_users: 456,
      storage_used_gb: 28.1,
      storage_limit_gb: 150.0,
      admin_name: 'Ust. Fauzi Rahman, Lc',
      admin_email: 'fauzi@alazhar-mandiri.sch.id',
      last_activity: '25 menit lalu',
      data_quality: 95,
      mrr: 3500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 9,
      name: 'SD Pelita Harapan Bangsa',
      npsn: '20106655',
      jenjang: 'SD',
      status: 'active',
      package: 'Basic',
      subdomain: 'pelitaharapan.myacademic.id',
      custom_domain: null,
      student_count: 320,
      teacher_count: 22,
      total_users: 347,
      storage_used_gb: 18.3,
      storage_limit_gb: 50.0,
      admin_name: 'Maria Kristina, S.Pd',
      admin_email: 'maria@pelitaharapan.sch.id',
      last_activity: '1 jam lalu',
      data_quality: 92,
      mrr: 1500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 10,
      name: 'SMK Bina Karya Sejahtera',
      npsn: '20504433',
      jenjang: 'SMK',
      status: 'active',
      package: 'Basic',
      subdomain: 'binakarya.myacademic.id',
      custom_domain: null,
      student_count: 340,
      teacher_count: 24,
      total_users: 369,
      storage_used_gb: 22.0,
      storage_limit_gb: 50.0,
      admin_name: 'Agus Setiawan, ST',
      admin_email: 'agus@binakarya.sch.id',
      last_activity: '3 jam lalu',
      data_quality: 91,
      mrr: 1500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 11,
      name: 'SMA Cendrawasih Utama',
      npsn: '20105544',
      jenjang: 'SMA',
      status: 'active',
      package: 'Pro',
      subdomain: 'cendrawasih.myacademic.id',
      custom_domain: null,
      student_count: 490,
      teacher_count: 34,
      total_users: 531,
      storage_used_gb: 31.4,
      storage_limit_gb: 150.0,
      admin_name: 'Hj. Ratna Sari, M.Pd',
      admin_email: 'ratna@cendrawasih.sch.id',
      last_activity: '30 menit lalu',
      data_quality: 94,
      mrr: 3500000,
      isolation_status: 'ISOLATED_OK',
    },
    {
      id: 12,
      name: 'SMP Labschool Unggulan',
      npsn: '20209900',
      jenjang: 'SMP',
      status: 'trial',
      package: 'Trial (14 Hari)',
      subdomain: 'labschool-unggul.myacademic.id',
      custom_domain: null,
      student_count: 290,
      teacher_count: 20,
      total_users: 314,
      storage_used_gb: 8.2,
      storage_limit_gb: 25.0,
      admin_name: 'Prof. Dr. Irwan Siregar',
      admin_email: 'irwan@labschool-unggul.sch.id',
      last_activity: '50 menit lalu',
      data_quality: 88,
      mrr: 0,
      isolation_status: 'ISOLATED_OK',
    },
  ]);

  // Dynamic Dataset: Feature Flags
  const [featureFlags, setFeatureFlags] = useState([
    { key: 'FEATURE_LMS_KBM', name: 'LMS & KBM Interaktif Merdeka', description: 'Ruang belajar mandiri, modul ajar, dan tugas digital', enabled: true, tier: 'Semua Paket', beta: false },
    { key: 'FEATURE_CBT_EXAM', name: 'Ujian Digital CBT Anti-Cheat', description: 'Browser lockdown, pengacakan soal, dan koreksi instan', enabled: true, tier: 'Pro & Enterprise', beta: false },
    { key: 'FEATURE_BK_SUITE', name: 'Bimbingan Konseling (BK) & EWS', description: 'Manajemen kasus rahasia & deteksi dini siswa bermasalah', enabled: true, tier: 'Pro & Enterprise', beta: false },
    { key: 'FEATURE_PARENT_PORTAL', name: 'Portal Orang Tua & Presensi Gerbang', description: 'Monitoring kehadiran RFID gerbang dan buku penghubung', enabled: true, tier: 'Semua Paket', beta: false },
    { key: 'FEATURE_AI_ASSISTANT', name: 'AI Suite (Guru, Siswa & Ortu)', description: 'Asisten cerdas RPP, asisten belajar, dan analitik rapor', enabled: true, tier: 'Pro & Enterprise', beta: false },
    { key: 'FEATURE_BETA_E_RAPOR_DAPODIK', name: 'Auto-Sync Dapodik / e-Rapor Pusat (BETA)', description: 'Integrasi langsung API Kemdikbudristek', enabled: false, tier: 'Enterprise Only', beta: true },
    { key: 'FEATURE_WHITE_LABEL', name: 'White-Label Branding & Custom Domain', description: 'Domain kustom sekolah, logo kustom, dan login terisolasi', enabled: true, tier: 'Enterprise Only', beta: false },
  ]);

  // Dynamic Dataset: Packages
  const [packagesList, setPackagesList] = useState([
    {
      id: 'free',
      name: 'Free Community',
      price_monthly: 0,
      price_annual: 0,
      max_students: 150,
      max_teachers: 15,
      storage_gb: 10,
      cbt: false,
      bk: false,
      parent_portal: true,
      ai_tokens: 100000,
      active_schools: 1,
    },
    {
      id: 'trial',
      name: 'Trial Full Access (14 Hari)',
      price_monthly: 0,
      price_annual: 0,
      max_students: 500,
      max_teachers: 40,
      storage_gb: 25,
      cbt: true,
      bk: true,
      parent_portal: true,
      ai_tokens: 500000,
      active_schools: 2,
    },
    {
      id: 'basic',
      name: 'Basic School Hub',
      price_monthly: 1500000,
      price_annual: 15000000,
      max_students: 350,
      max_teachers: 25,
      storage_gb: 50,
      cbt: false,
      bk: false,
      parent_portal: true,
      ai_tokens: 500000,
      active_schools: 3,
    },
    {
      id: 'pro',
      name: 'Pro School Hub',
      price_monthly: 3500000,
      price_annual: 35000000,
      max_students: 800,
      max_teachers: 60,
      storage_gb: 150,
      cbt: true,
      bk: true,
      parent_portal: true,
      ai_tokens: 2000000,
      active_schools: 4,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom Plan',
      price_monthly: 7500000,
      price_annual: 75000000,
      max_students: 2500,
      max_teachers: 200,
      storage_gb: 500,
      cbt: true,
      bk: true,
      parent_portal: true,
      ai_tokens: 10000000,
      active_schools: 2,
    },
  ]);

  // Dynamic Dataset: Incidents
  const [incidentsList, setIncidentsList] = useState([
    {
      id: 'INC-2026-004',
      title: 'Latensi Tinggi pada Webhook Payment Gateway BCA',
      severity: 'MINOR',
      status: 'MONITORING',
      affected: '2 Sekolah',
      created_at: '2 jam lalu',
      assigned_to: 'Rizky (DevOps)',
    },
  ]);

  // Handlers
  const handleToggleFlag = (key: string) => {
    setFeatureFlags((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
    showToast('Konfigurasi Feature Flag berhasil diperbarui secara instan.');
  };

  const handleSuspendToggle = (schoolId: number) => {
    setTenantsList((prev) =>
      prev.map((t) => {
        if (t.id === schoolId) {
          const nextStatus = t.status === 'suspended' ? 'active' : 'suspended';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    showToast('Status sekolah berhasil dimodifikasi dan dicatat di Immutable Audit Log.');
  };

  const executeImpersonation = () => {
    if (!impersonateReason || impersonateReason.trim().length < 5) {
      alert('Alasan impersonation wajib diisi minimal 5 karakter untuk keperluan audit trail!');
      return;
    }

    const target = impersonateTarget;
    setIsImpersonateModalOpen(false);
    showToast(`Impersonation aktif: Masuk sebagai [${target?.name}] (${target?.role}). Sesi diaudit.`);
    
    if (onImpersonateUser) {
      onImpersonateUser(target?.role || 'admin', target?.name || 'Admin');
    }
  };

  const executeEmergency = () => {
    if (emergencyCode !== 'CONFIRM-EMERGENCY') {
      alert('Kode konfirmasi darurat salah! Ketik: CONFIRM-EMERGENCY');
      return;
    }
    setIsEmergencyModalOpen(false);
    showToast(`Protokol Darurat [${emergencyActionType}] berhasil dijalankan!`);
    setEmergencyCode('');
    setEmergencyReason('');
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchool = {
      id: Date.now(),
      name: newSchoolForm.name,
      npsn: newSchoolForm.npsn,
      jenjang: newSchoolForm.jenjang,
      status: 'active',
      package: newSchoolForm.package,
      subdomain: newSchoolForm.subdomain || `${newSchoolForm.npsn}.myacademic.id`,
      custom_domain: null,
      student_count: 0,
      teacher_count: 0,
      total_users: 1,
      storage_used_gb: 0.1,
      storage_limit_gb: 100.0,
      admin_name: newSchoolForm.admin_name,
      admin_email: newSchoolForm.admin_email,
      last_activity: 'Baru saja dibuat',
      data_quality: 10,
      mrr: newSchoolForm.package === 'Enterprise' ? 7500000 : newSchoolForm.package === 'Pro' ? 3500000 : 1500000,
      isolation_status: 'ISOLATED_OK',
    };
    setTenantsList((prev) => [newSchool, ...prev]);
    setIsAddSchoolModalOpen(false);
    setNewSchoolForm({ name: '', npsn: '', jenjang: 'SMA', package: 'Pro', admin_name: '', admin_email: '', subdomain: '' });
    showToast(`Sekolah ${newSchool.name} berhasil dibuat dan tenant telah diprovisi!`);
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: incidentForm.title,
      severity: incidentForm.severity,
      status: 'INVESTIGATING',
      affected: incidentForm.affected_services,
      created_at: 'Baru saja',
      assigned_to: 'Super Admin Duty',
    };
    setIncidentsList((prev) => [newInc, ...prev]);
    setIsCreateIncidentModalOpen(false);
    setIncidentForm({ title: '', severity: 'MAJOR', affected_services: '', notes: '' });
    showToast(`Insiden ${newInc.id} telah dicatat dan tim siaga dinotifikasi.`);
  };

  const filteredTenants = tenantsList.filter((t) => {
    const matchStatus = tenantFilter === 'all' || t.status === tenantFilter;
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.npsn.includes(searchQuery) ||
      t.admin_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-indigo-500/30 animate-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* APEX HEADER: SUPER ADMIN PLATFORM CONTROL TOWER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 p-6 lg:p-7 text-white shadow-xl border border-indigo-900/40">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-500/20">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Control Tower • Platform Owner
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Cluster Production • 99.98% Uptime
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white mt-1">
                SUPER ADMIN PLATFORM
              </h1>
              <p className="text-xs lg:text-sm text-slate-300 max-w-2xl mt-1">
                Pusat kendali multi-sekolah, manajemen tenant, billing & MRR, kesehatan infrastruktur, feature flags, dan audit trail global.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => showToast('Memulai sinkronisasi cluster multi-tenant & cache reload...')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
            >
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Sync Cluster
            </button>
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 border border-rose-500/40 transition"
            >
              <Power className="w-4 h-4" />
              Emergency Center
            </button>
          </div>
        </div>

        {/* Global Vital Stats Ribbon */}
        <div className="mt-5 pt-5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Total Sekolah</span>
            <span className="text-lg font-bold text-white">{tenantsList.length} Tenant</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Total User Terdaftar</span>
            <span className="text-lg font-bold text-indigo-300">3,540 Pengguna</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Monthly Run Rate (MRR)</span>
            <span className="text-lg font-bold text-emerald-400">Rp 148,5 Jt</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Cloud Multi-Tenant Storage</span>
            <span className="text-lg font-bold text-amber-300">342.8 GB / 1 TB</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Database Health</span>
            <span className="text-lg font-bold text-emerald-400">Optimal (18ms)</span>
          </div>
          <div>
            <span className="text-slate-400 block font-medium">Tenant Data Isolation</span>
            <span className="text-lg font-bold text-sky-400">100% Strict Scoped</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE LAYOUT: SECTION 77 SIDEBAR + MAIN CONTENT PANE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: SECTION 77 SUPER ADMIN SIDEBAR (16 SECTIONS) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-3 sticky top-4 max-h-[85vh] overflow-y-auto">
          {/* Quick Search across all 82 modules */}
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari modul platform..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mt-1">
            Platform Navigation
          </div>

          {/* 1. COMMAND CENTER */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('command')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-600" />
                🏠 Command Center
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.command ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.command && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('command-center')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'command-center' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Dashboard & Stats
                </button>
                <button
                  onClick={() => setActiveMenu('emergency-center')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'emergency-center' ? 'bg-rose-50 text-rose-700 font-bold' : 'text-rose-600 hover:bg-rose-50'}`}
                >
                  🚨 Emergency Control
                </button>
              </div>
            )}
          </div>

          {/* 2. TENANTS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('tenants')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                🏫 Tenants / Sekolah
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.tenants ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.tenants && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('tenants')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'tenants' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Semua Sekolah ({tenantsList.length})
                </button>
                <button
                  onClick={() => setActiveMenu('registrations')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'registrations' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Registrasi & Approval
                </button>
                <button
                  onClick={() => setActiveMenu('onboarding')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'onboarding' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Onboarding Monitor
                </button>
              </div>
            )}
          </div>

          {/* 3. USERS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('users')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                👥 User Management
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.users ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.users && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('users')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'users' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Semua User & Impersonation
                </button>
                <button
                  onClick={() => setActiveMenu('staff')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'staff' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Platform Staff (Internal)
                </button>
                <button
                  onClick={() => setActiveMenu('roles-permissions')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'roles-permissions' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Roles & Permissions
                </button>
              </div>
            )}
          </div>

          {/* 4. PLATFORM ACADEMIC */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('academic')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                🎓 Platform Academic
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.academic ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.academic && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('academic-templates')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'academic-templates' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Academic Templates & Default
                </button>
              </div>
            )}
          </div>

          {/* 5. BILLING */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('billing')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                💳 Billing & Revenue
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.billing ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.billing && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('packages')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'packages' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Paket & Kuota Limit
                </button>
                <button
                  onClick={() => setActiveMenu('invoices')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'invoices' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Invoices & Pembayaran
                </button>
                <button
                  onClick={() => setActiveMenu('revenue-analytics')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'revenue-analytics' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Analitik MRR / ARR
                </button>
              </div>
            )}
          </div>

          {/* 6. FEATURES */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('features')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                🧩 Feature Management
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.features ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.features && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('feature-flags')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'feature-flags' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Feature Flags & Toggles
                </button>
                <button
                  onClick={() => setActiveMenu('beta-program')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'beta-program' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Beta Program
                </button>
              </div>
            )}
          </div>

          {/* 7. SYSTEM & OPS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('system')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4 text-sky-600" />
                🛠️ System & Infrastructure
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.system ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.system && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('system-health')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'system-health' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  System Health Check
                </button>
                <button
                  onClick={() => setActiveMenu('infrastructure')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'infrastructure' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Server & Hardware Monitor
                </button>
                <button
                  onClick={() => setActiveMenu('incidents')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'incidents' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Incidents & Errors
                </button>
                <button
                  onClick={() => setActiveMenu('maintenance-mode')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'maintenance-mode' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Maintenance Mode
                </button>
              </div>
            )}
          </div>

          {/* 8. SECURITY & AUDIT */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('security')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-violet-600" />
                🔐 Security & Audit
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.security ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.security && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('security-center')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'security-center' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Security Center & Firewall
                </button>
                <button
                  onClick={() => setActiveMenu('audit-logs')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'audit-logs' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Global Audit Trail Vault
                </button>
                <button
                  onClick={() => setActiveMenu('tenant-isolation')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'tenant-isolation' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Tenant Isolation Monitor
                </button>
              </div>
            )}
          </div>

          {/* 9. DATA & BACKUP */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('data')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                💾 Data, Storage & Backup
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.data ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.data && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('data-management')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'data-management' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Storage & Data Quality
                </button>
                <button
                  onClick={() => setActiveMenu('backup-restore')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'backup-restore' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Backup & Disaster Recovery
                </button>
              </div>
            )}
          </div>

          {/* 10. AI OPERATIONS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('ai')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                🤖 AI Operations & Cost
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.ai ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.ai && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('ai-operations')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'ai-operations' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  AI Models & Token Limits
                </button>
                <button
                  onClick={() => setActiveMenu('ai-cost')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'ai-cost' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Cost Tracker Per Tenant
                </button>
              </div>
            )}
          </div>

          {/* 11. COMMUNICATION */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('communication')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-rose-500" />
                📢 Communication
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.communication ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.communication && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('announcements')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'announcements' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Platform Announcement
                </button>
              </div>
            )}
          </div>

          {/* 12. SUPPORT */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('support')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4 text-sky-600" />
                🎧 Support Desk & Tickets
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.support ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.support && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('support-desk')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'support-desk' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Helpdesk Tickets (2)
                </button>
              </div>
            )}
          </div>

          {/* 13. SETTINGS */}
          <div className="flex flex-col">
            <button
              onClick={() => toggleGroup('settings')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-slate-600" />
                ⚙️ Platform Settings
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedGroups.settings ? 'rotate-180' : ''}`} />
            </button>
            {expandedGroups.settings && (
              <div className="flex flex-col pl-6 mt-1 space-y-0.5 text-xs">
                <button
                  onClick={() => setActiveMenu('platform-settings')}
                  className={`text-left px-2.5 py-1.5 rounded-lg font-medium transition ${activeMenu === 'platform-settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  Global Configuration
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: ACTIVE SCREEN CONTENT CONTAINER */}
        {/* ======================================================== */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          {/* SCREEN 1: COMMAND CENTER (DASHBOARD & VITAL STATS) */}
          {activeMenu === 'command-center' && (
            <div className="flex flex-col gap-6">
              {/* Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sekolah Aktif</span>
                    <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Building2 className="w-5 h-5" /></span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">{tenantsList.filter(t => t.status === 'active').length} <span className="text-sm font-normal text-slate-500">/ {tenantsList.length} total</span></div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +33.3% pertumbuhan kuartal ini
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">MRR (Pendapatan Bulanan)</span>
                    <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-5 h-5" /></span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">Rp 148.500.000</div>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      ARR: Rp 1,78 Miliar (Churn: 8.3%)
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kesehatan Cluster</span>
                    <span className="p-2 rounded-xl bg-sky-50 text-sky-600"><Activity className="w-5 h-5" /></span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">99.98% <span className="text-xs font-bold text-emerald-600">STABLE</span></div>
                    <div className="text-xs text-slate-500 mt-1">
                      CPU: 28% • RAM: 54% • Latensi: 18ms
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Aktivitas Hari Ini</span>
                    <span className="p-2 rounded-xl bg-amber-50 text-amber-600"><Radio className="w-5 h-5" /></span>
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-black text-slate-900">18,450 <span className="text-xs font-normal text-slate-500">aksi</span></div>
                    <div className="text-xs text-slate-500 mt-1">
                      284k API requests / 0.04% error
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Launch & Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Command Center Quick Actions</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Shortcuts</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={() => setIsAddSchoolModalOpen(true)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Plus className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">+ Tambah Sekolah Baru</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveMenu('registrations')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Flag className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-bold text-slate-900">Review Permohonan Pendaftaran</span>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">1 Pending</span>
                    </button>

                    <button
                      onClick={() => {
                        setImpersonateTarget({ name: 'Hendra Pratama, S.Kom', email: 'admin@garudacendekia.sch.id', role: 'admin' });
                        setIsImpersonateModalOpen(true);
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-violet-50 border border-slate-200 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Eye className="w-4 h-4 text-violet-600" />
                        <span className="text-xs font-bold text-slate-900">Impersonate School Admin</span>
                      </div>
                      <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded">Audit</span>
                    </button>

                    <button
                      onClick={() => {
                        showToast('Trigger backup database ke AWS Glacier berhasil!');
                      }}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Backup Cluster Snapshot Now</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setIsAnnouncementModalOpen(true)}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <BellRing className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-bold text-slate-900">Kirim Broadcast Pengumuman</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* Realtime Event Stream */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-sm font-bold text-slate-900">Platform Realtime Activity Stream</h3>
                    </div>
                    <span className="text-xs text-slate-500">Live Webhook & Event Queue</span>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-100">
                    {[
                      {
                        title: 'Pembayaran Paket Pro Hub Berhasil',
                        school: 'SMA Garuda Cendekia',
                        time: '12 menit lalu',
                        detail: 'Invoice #INV-2026-0901 senilai Rp 24.500.000 lunas via Midtrans Mandiri VA.',
                        badge: 'success',
                      },
                      {
                        title: 'Permintaan Registrasi Sekolah Baru',
                        school: 'SMP Insan Gemilang',
                        time: '45 menit lalu',
                        detail: 'Calon sekolah mendaftar jenjang SMP dengan estimasi 380 siswa. Menunggu verifikasi.',
                        badge: 'warning',
                      },
                      {
                        title: 'Automated Snapshot S3 Glacier Sukses',
                        school: 'Platform Core Database',
                        time: '6 jam lalu',
                        detail: 'Ukuran file 4.2 GB terenkripsi AES-256 tersimpan di region ap-southeast-1.',
                        badge: 'info',
                      },
                      {
                        title: 'Audit: Impersonation Login Tercatat',
                        school: 'SMA Negeri 1 Jakarta',
                        time: '8 jam lalu',
                        detail: 'Super Admin melakukan troubleshooting jadwal KBM untuk akun Dra. Endang Purwanti.',
                        badge: 'audit',
                      },
                      {
                        title: 'Brute Force Attempt Blocked by Edge Firewall',
                        school: 'Platform Edge Security',
                        time: '14 jam lalu',
                        detail: 'IP 185.220.101.4 diisolasi permanen setelah 5 kali gagal autentikasi berturut-turut.',
                        badge: 'danger',
                      },
                    ].map((act, i) => (
                      <div key={i} className="py-3 flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                            act.badge === 'success' ? 'bg-emerald-500 ring-4 ring-emerald-100' :
                            act.badge === 'warning' ? 'bg-amber-500 ring-4 ring-amber-100' :
                            act.badge === 'danger' ? 'bg-rose-500 ring-4 ring-rose-100' :
                            act.badge === 'audit' ? 'bg-violet-500 ring-4 ring-violet-100' :
                            'bg-sky-500 ring-4 ring-sky-100'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">{act.title}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded bg-slate-100 font-semibold text-slate-700">
                                {act.school}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{act.detail}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: SEMUA SEKOLAH / TENANTS */}
          {activeMenu === 'tenants' && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari sekolah, NPSN, atau Admin..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
                    {(['all', 'active', 'trial', 'pending', 'expired', 'suspended'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setTenantFilter(st)}
                        className={`px-3 py-1.5 rounded-lg capitalize transition ${
                          tenantFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {st === 'all' ? 'Semua' : st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => setIsAddSchoolModalOpen(true)}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    + Tambah Sekolah
                  </button>
                </div>
              </div>

              {/* Tenants Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3.5 px-4">Nama Sekolah & NPSN</th>
                        <th className="py-3.5 px-4">Status & Paket</th>
                        <th className="py-3.5 px-4">Pengguna (Siswa/Guru)</th>
                        <th className="py-3.5 px-4">Storage Digunakan</th>
                        <th className="py-3.5 px-4">Admin Utama</th>
                        <th className="py-3.5 px-4">Data Quality</th>
                        <th className="py-3.5 px-4 text-right">Aksi Super Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.map((school) => (
                        <tr key={school.id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{school.name}</div>
                            <div className="text-[11px] text-slate-500">
                              NPSN: {school.npsn} • {school.jenjang} • <span className="text-indigo-600 font-medium">{school.subdomain}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                school.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                                school.status === 'trial' ? 'bg-amber-100 text-amber-800' :
                                school.status === 'pending' ? 'bg-sky-100 text-sky-800' :
                                school.status === 'suspended' ? 'bg-rose-100 text-rose-800' :
                                'bg-slate-100 text-slate-700'
                              }`}>
                                {school.status}
                              </span>
                              <span className="text-[11px] font-semibold text-slate-700">{school.package}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{school.total_users} Akun</div>
                            <div className="text-[10px] text-slate-500">{school.student_count} Siswa • {school.teacher_count} Guru</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{school.storage_used_gb} GB</div>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, Math.round(((school.storage_used_gb || 0) / (school.storage_limit_gb > 0 ? school.storage_limit_gb : 100)) * 100))}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{school.admin_name}</div>
                            <div className="text-[10px] text-slate-500">{school.last_activity}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              school.data_quality >= 95 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              school.data_quality >= 80 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {school.data_quality}% Complete
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedSchool360(school)}
                                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition"
                              >
                                School 360°
                              </button>

                              <button
                                onClick={() => {
                                  setImpersonateTarget({
                                    name: school.admin_name,
                                    email: school.admin_email,
                                    role: 'admin',
                                    school: school.name,
                                  });
                                  setIsImpersonateModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
                                title="Login as School Admin"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleSuspendToggle(school.id)}
                                className={`p-1.5 rounded-lg transition ${
                                  school.status === 'suspended'
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title={school.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                              >
                                <Lock className="w-4 h-4" />
                              </button>
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

          {/* SCREEN 3: REGISTRASI & ONBOARDING */}
          {(activeMenu === 'registrations' || activeMenu === 'onboarding') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Permohonan Registrasi Sekolah Baru</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800">1 Menunggu Review</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">SMP Insan Gemilang</h4>
                      <p className="text-xs text-slate-500">NPSN: 20208833 • Bandung, Jawa Barat</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold uppercase">
                      Paket Pro
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div><span className="font-semibold text-slate-700">Admin Pendaftar:</span> Wahyu Saputra, M.Pd (081299887766)</div>
                    <div><span className="font-semibold text-slate-700">Estimasi Siswa:</span> 380 Siswa • 24 Tenaga Pendidik</div>
                    <div><span className="font-semibold text-slate-700">Subdomain:</span> smp-insan.myacademic.id</div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <button
                      onClick={() => showToast('Registrasi SMP Insan Gemilang berhasil disetujui! Tenant workspace dibuat.')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                    >
                      Approve & Provise Tenant
                    </button>
                    <button
                      onClick={() => showToast('Permintaan pendaftaran ditolak.')}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              </div>

              {/* Onboarding Checklist Monitoring */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Onboarding Health Monitor</h3>
                  <span className="text-xs text-slate-500">SMP Bintang Nusantara (70% Selesai - 7/10 Item)</span>
                </div>

                <p className="text-xs text-slate-500">
                  Super Admin memantau kelengkapan konfigurasi awal sekolah sebelum go-live untuk mencegah kendala teknis KBM.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { name: '1. Profil Sekolah', done: true },
                    { name: '2. Akun Admin Sekolah', done: true },
                    { name: '3. Tahun Ajaran & Semester', done: true },
                    { name: '4. Data Guru & Tendik', done: true },
                    { name: '5. Data Siswa', done: true },
                    { name: '6. Rombel Kelas', done: true },
                    { name: '7. Mata Pelajaran', done: true },
                    { name: '8. Teaching Assignment', done: false },
                    { name: '9. Jadwal KBM', done: false },
                    { name: '10. Akun Orang Tua', done: false },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                      item.done ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}>
                      {item.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Clock className="w-4 h-4 text-slate-400 shrink-0" />}
                      <span className="font-semibold text-[11px]">{item.name}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  <span className="font-bold">Intervensi CS:</span> 3 komponen belum dikonfigurasi. Assigned CSM: <span className="font-bold">Dewi Lestari</span>.
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: USERS & IMPERSONATION */}
          {(activeMenu === 'users' || activeMenu === 'staff' || activeMenu === 'roles-permissions') && (
            <div className="flex flex-col gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Global Users Directory & Impersonation Hub</h3>
                    <p className="text-xs text-slate-500">Mencari seluruh akun lintas sekolah dengan kontrol keamanan terpusat.</p>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">Total Akun Terdaftar: 3,540</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Nama & Email</th>
                        <th className="py-3 px-4">Sekolah Asal</th>
                        <th className="py-3 px-4">Role Global</th>
                        <th className="py-3 px-4">Status & MFA</th>
                        <th className="py-3 px-4 text-right">Aksi Terpantau</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { name: 'Hendra Pratama, S.Kom', email: 'admin@garudacendekia.sch.id', school: 'SMA Garuda Cendekia', role: 'admin', mfa: true },
                        { name: 'Dr. H. Sulaiman, M.Si', email: 'kepsek@garudacendekia.sch.id', school: 'SMA Garuda Cendekia', role: 'kepsek', mfa: true },
                        { name: 'Budi Santoso, M.Pd', email: 'guru@garudacendekia.sch.id', school: 'SMA Garuda Cendekia', role: 'guru', mfa: true },
                        { name: 'Ahmad Siswa', email: 'ahmad@garudacendekia.sch.id', school: 'SMA Garuda Cendekia', role: 'murid', mfa: false },
                        { name: 'Bambang Trianto', email: 'bambang@parent.id', school: 'SMA Garuda Cendekia', role: 'parent', mfa: false },
                      ].map((usr, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{usr.name}</div>
                            <div className="text-[11px] text-slate-500">{usr.email}</div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">{usr.school}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                              {usr.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              <span className="text-xs text-slate-700">Aktif</span>
                              {usr.mfa && <span className="text-[10px] font-bold px-1.5 rounded bg-indigo-100 text-indigo-700">MFA ON</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setImpersonateTarget(usr);
                                setIsImpersonateModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Impersonate User
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: BILLING, PAKET & MRR */}
          {(activeMenu === 'packages' || activeMenu === 'invoices' || activeMenu === 'revenue-analytics' || activeMenu === 'billing') && (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packagesList.map((pkg) => (
                  <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 uppercase">{pkg.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{pkg.active_schools} Sekolah</span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mt-2">{pkg.name}</h4>
                      <div className="text-2xl font-black text-slate-900 mt-1">
                        Rp {pkg.price_monthly.toLocaleString('id-ID')} <span className="text-xs font-normal text-slate-500">/ bulan</span>
                      </div>
                      <div className="mt-4 space-y-2 text-xs text-slate-600">
                        <div>• Maks. {pkg.max_students} Siswa & {pkg.max_teachers} Guru</div>
                        <div>• Cloud Storage: {pkg.storage_gb} GB</div>
                        <div>• CBT: {pkg.cbt ? 'Aktif' : 'Non-Aktif'} • BK: {pkg.bk ? 'Aktif' : 'Non-Aktif'}</div>
                        <div>• AI Limit: {pkg.ai_tokens.toLocaleString('id-ID')} Tokens</div>
                      </div>
                    </div>
                    <button
                      onClick={() => showToast(`Konfigurasi paket ${pkg.name} diperbarui!`)}
                      className="mt-6 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                    >
                      Konfigurasi Limit Paket
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 6: FEATURE FLAGS (SECTION 12 & 65) */}
          {(activeMenu === 'feature-flags' || activeMenu === 'beta-program' || activeMenu === 'features') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Dynamic Feature Flags & Rollout Management</h3>
                  <p className="text-xs text-slate-500">Mengatur aktivasi modul tanpa deploy ulang source code.</p>
                </div>
                <button onClick={() => showToast('Modal Buat Feature Flag Baru dibuka')} className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold">
                  + Feature Flag Baru
                </button>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                {featureFlags.map((flag) => (
                  <div key={flag.key} className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{flag.name}</span>
                        <code className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">{flag.key}</code>
                        {flag.beta && (
                          <span className="px-2 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-extrabold uppercase">
                            Beta Program
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{flag.description} • Cakupan: <span className="font-semibold text-slate-700">{flag.tier}</span></p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${flag.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {flag.enabled ? 'AKTIF (ON)' : 'NON-AKTIF (OFF)'}
                      </span>
                      <button
                        onClick={() => handleToggleFlag(flag.key)}
                        className={`w-12 h-6 rounded-full transition-colors relative p-1 ${flag.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${flag.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 7: SYSTEM HEALTH & INCIDENTS */}
          {(activeMenu === 'system-health' || activeMenu === 'infrastructure' || activeMenu === 'incidents' || activeMenu === 'maintenance-mode') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900">Cluster Services Health Check</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Next.js App Server (Frontend)', status: 'OPERATIONAL', latency: '24ms' },
                    { name: 'Laravel API Engine & Sanctum', status: 'OPERATIONAL', latency: '38ms' },
                    { name: 'MySQL Database Cluster', status: 'OPTIMAL', latency: '18ms' },
                    { name: 'Redis Cache & Session Store', status: 'HEALTHY', latency: '2ms' },
                    { name: 'Background Queue Worker', status: 'ACTIVE', latency: '0 queue lag' },
                    { name: 'S3 Cloud Storage Multi-Bucket', status: 'ONLINE', latency: '657 GB Free' },
                  ].map((svc, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-slate-900">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{svc.latency}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">{svc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Incident Management Center</h3>
                  <button onClick={() => setIsCreateIncidentModalOpen(true)} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold">
                    + Log Incident Baru
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  {incidentsList.map((inc) => (
                    <div key={inc.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold">{inc.id}</span>
                          <span className="font-bold text-slate-900">{inc.title}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">{inc.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Dampak: {inc.affected} • PIC: {inc.assigned_to}</span>
                        <span>{inc.created_at}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 8: SECURITY & AUDIT TRAIL */}
          {(activeMenu === 'security-center' || activeMenu === 'audit-logs' || activeMenu === 'tenant-isolation') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">Immutable Global Audit Trail Vault</h3>
                </div>
                <span className="text-xs text-slate-500">Seluruh Aksi Berisiko Tinggi Diaudit Permanen</span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'AUD-99120',
                    actor: 'superadmin@myacademic.id (Super Admin)',
                    action: 'CHANGE_TENANT_PACKAGE',
                    target: 'SMA Garuda Cendekia',
                    detail: 'Upgrade package dari Basic ke Pro Hub (Limit: 800 Siswa)',
                    time: '25 menit lalu',
                    level: 'MEDIUM',
                  },
                  {
                    id: 'AUD-99119',
                    actor: 'superadmin@myacademic.id (Super Admin)',
                    action: 'IMPERSONATION_LOGIN',
                    target: 'admin@garudacendekia.sch.id',
                    detail: 'Investigasi sinkronisasi KBM jadwal semester ganjil',
                    time: '8 jam lalu',
                    level: 'HIGH',
                  },
                  {
                    id: 'AUD-99118',
                    actor: 'SYSTEM_CRON',
                    action: 'DATABASE_BACKUP_SNAPSHOT',
                    target: 'Global Storage Bucket',
                    detail: 'Snapshot snapshot-20261003.sql.gz (4.2 GB)',
                    time: '12 jam lalu',
                    level: 'LOW',
                  },
                ].map((log) => (
                  <div key={log.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-bold text-slate-700">{log.id}</span>
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="text-slate-500">• Target: <span className="font-semibold text-slate-700">{log.target}</span></span>
                      </div>
                      <p className="text-slate-600 mt-1">{log.detail}</p>
                      <div className="text-[10px] text-slate-400 mt-0.5">Dilakukan oleh: <span className="text-slate-600 font-medium">{log.actor}</span></div>
                    </div>
                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <span className="text-[10px] text-slate-400">{log.time}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.level === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                        log.level === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 9: AI OPERATIONS */}
          {(activeMenu === 'ai-operations' || activeMenu === 'ai-cost') && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-500">Biaya AI Platform Bulan Ini</span>
                  <div className="text-3xl font-black text-slate-900 mt-2">$382.40 <span className="text-xs font-normal text-slate-500">/ budget $1,200</span></div>
                  <div className="text-xs text-slate-500 mt-1">31.9% dari batas pengeluaran bulanan</div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-4">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '31.9%' }} />
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
                  Total Token: <span className="font-bold text-slate-900">48.250.000 tokens</span>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-900">Distribusi Pemakaian AI Per Sekolah</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { school: 'SMA Negeri 1 Jakarta', tokens: '18.4M Token', cost: '$142.10', share: '37%' },
                    { school: 'SMA Garuda Cendekia', tokens: '14.2M Token', cost: '$112.50', share: '29%' },
                    { school: 'SMK TI Informatika Mandiri', tokens: '12.8M Token', cost: '$104.80', share: '27%' },
                    { school: 'SMP Bintang Nusantara (Trial)', tokens: '2.8M Token', cost: '$23.00', share: '7%' },
                  ].map((aiItem, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <span className="font-bold text-slate-900">{aiItem.school}</span>
                        <div className="text-[11px] text-slate-500">{aiItem.tokens}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{aiItem.cost}</span>
                        <div className="text-[10px] text-slate-500">{aiItem.share} total spend</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 10: EMERGENCY CENTER (SECTION 72) */}
          {activeMenu === 'emergency-center' && (
            <div className="bg-white p-6 rounded-2xl border-2 border-rose-500/80 shadow-xl flex flex-col gap-6">
              <div className="flex items-center gap-3 text-rose-600">
                <AlertTriangle className="w-7 h-7" />
                <div>
                  <h3 className="text-lg font-black text-slate-900">EMERGENCY CONTROL CENTER (PANIC ACTION)</h3>
                  <p className="text-xs text-slate-500">Tindakan darurat dengan otorisasi tertinggi platform untuk mengatasi insiden kritis.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <button
                  onClick={() => {
                    setEmergencyActionType('LOCK_ALL_LOGINS');
                    setIsEmergencyModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-left transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-rose-900">Lock Seluruh Login Platform</div>
                    <p className="text-rose-700 mt-1">Memaksa force-logout seluruh sesi pengguna platform aktif saat terjadi serangan siber.</p>
                  </div>
                  <span className="font-bold text-rose-800">Buka Otorisasi Kunci →</span>
                </button>

                <button
                  onClick={() => {
                    setEmergencyActionType('GLOBAL_MAINTENANCE');
                    setIsEmergencyModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-amber-900">Global Maintenance Mode</div>
                    <p className="text-amber-700 mt-1">Mengalihkan seluruh tenant sekolah ke halaman pemeliharaan server darurat.</p>
                  </div>
                  <span className="font-bold text-amber-800">Aktifkan Maintenance →</span>
                </button>

                <button
                  onClick={() => {
                    setEmergencyActionType('DISABLE_API');
                    setIsEmergencyModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">Matikan External API & Webhooks</div>
                    <p className="text-slate-600 mt-1">Memutus integrasi pihak ketiga untuk menghentikan flooding request atau kebocoran data.</p>
                  </div>
                  <span className="font-bold text-slate-800">Putus Integrasi →</span>
                </button>

                <button
                  onClick={() => {
                    setEmergencyActionType('FREEZE_PAYMENTS');
                    setIsEmergencyModalOpen(true);
                  }}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition flex flex-col justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-slate-900">Bekukan Transaksi Gateway</div>
                    <p className="text-slate-600 mt-1">Menunda callback transaksi pembayaran jika gateway terdeteksi anomali.</p>
                  </div>
                  <span className="font-bold text-slate-800">Bekukan Transaksi →</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 11: SUPPORT TICKETS & OTHERS */}
          {(activeMenu === 'support-desk' || activeMenu === 'announcements' || activeMenu === 'academic-templates' || activeMenu === 'platform-settings') && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {activeMenu === 'support-desk' && 'Support Helpdesk Tickets'}
                  {activeMenu === 'announcements' && 'Broadcast Announcement Platform'}
                  {activeMenu === 'academic-templates' && 'Academic Default Templates'}
                  {activeMenu === 'platform-settings' && 'Global Configuration'}
                </h3>
              </div>

              <div className="text-xs text-slate-600 space-y-3">
                <p>Modul terhubung langsung dengan backend service dan siap melayani operasional harian pemilik platform.</p>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span>Status modul: <strong className="text-emerald-600">CONNECTED & HEALTHY</strong></span>
                  <button onClick={() => showToast('Sinkronisasi konfigurasi berhasil!')} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs">
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL: ADD SCHOOL / TENANT (SECTION 3 & 5) */}
      {/* ======================================================== */}
      {isAddSchoolModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">+ Tambah Sekolah / Tenant Baru</h3>
            <form onSubmit={handleCreateSchool} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Sekolah:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SMA Negeri 2 Bandung"
                  value={newSchoolForm.name}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NPSN:</label>
                  <input
                    type="text"
                    required
                    placeholder="8 digit NPSN"
                    value={newSchoolForm.npsn}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, npsn: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenjang:</label>
                  <select
                    value={newSchoolForm.jenjang}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, jenjang: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Paket Langganan:</label>
                  <select
                    value={newSchoolForm.package}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, package: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Basic">Basic School Hub</option>
                    <option value="Pro">Pro School Hub</option>
                    <option value="Enterprise">Enterprise Custom</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subdomain:</label>
                  <input
                    type="text"
                    placeholder="nama.myacademic.id"
                    value={newSchoolForm.subdomain}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, subdomain: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Admin Utama Sekolah:</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap admin"
                  value={newSchoolForm.admin_name}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, admin_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Admin Sekolah:</label>
                <input
                  type="email"
                  required
                  placeholder="admin@sekolah.sch.id"
                  value={newSchoolForm.admin_email}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, admin_email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Buat Sekolah & Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: SCHOOL 360° DRAWER (SECTION 4) */}
      {/* ======================================================== */}
      {selectedSchool360 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-600">
                  TENANT 360° HOLISTIC VIEW
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedSchool360.name}</h3>
                <p className="text-xs text-slate-500">NPSN: {selectedSchool360.npsn} • Subdomain: {selectedSchool360.subdomain}</p>
              </div>
              <button
                onClick={() => setSelectedSchool360(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 block">Subscription & Limits</span>
                <div>Paket: <span className="font-bold text-indigo-600">{selectedSchool360.package}</span></div>
                <div>Status Langganan: <span className="font-bold text-emerald-600 uppercase">{selectedSchool360.status}</span></div>
                <div>Penggunaan Kuota Siswa: <span className="font-bold text-slate-800">{selectedSchool360.student_count} / 800</span></div>
                <div>Cloud Storage: <span className="font-bold text-slate-800">{selectedSchool360.storage_used_gb} GB / {selectedSchool360.storage_limit_gb} GB</span></div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 block">Identitas & Kontak</span>
                <div>Admin Utama: <span className="font-semibold text-slate-800">{selectedSchool360.admin_name}</span></div>
                <div>Email: <span className="font-semibold text-slate-800">{selectedSchool360.admin_email}</span></div>
                <div>Data Quality Score: <span className="font-bold text-emerald-600">{selectedSchool360.data_quality}% Sesuai Standar</span></div>
                <div>Tenant Isolation: <span className="font-bold text-sky-600">{selectedSchool360.isolation_status}</span></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedSchool360(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setImpersonateTarget({
                    name: selectedSchool360.admin_name,
                    email: selectedSchool360.admin_email,
                    role: 'admin',
                    school: selectedSchool360.name,
                  });
                  setSelectedSchool360(null);
                  setIsImpersonateModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Masuk Sebagai Admin Sekolah
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: IMPERSONATION (LOGIN AS USER - SECTION 7) */}
      {/* ======================================================== */}
      {isImpersonateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-indigo-600">
              <Eye className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Impersonation (Login As User)</h3>
            </div>

            <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Peringatan Keamanan & Privasi:</span>
              <p className="mt-1">
                Anda akan masuk ke tampilan akun <strong>{impersonateTarget?.name}</strong> ({impersonateTarget?.role}).
                Seluruh aktivitas akan dicatat secara permanen di Immutable Global Audit Trail demi akuntabilitas.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700">Alasan Akses (Wajib Diisi):</label>
              <textarea
                rows={3}
                placeholder="Contoh: Investigasi kendala sinkronisasi jadwal KBM tiket #TCK-801..."
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsImpersonateModalOpen(false);
                  setImpersonateReason('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={executeImpersonation}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                Mulai Impersonation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: EMERGENCY CONTROL PROTOCOL (SECTION 72) */}
      {/* ======================================================== */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-rose-500">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">EMERGENCY CONTROL PROTOCOL</h3>
            </div>

            <p className="text-xs text-slate-600 mt-2">
              Protokol ini hanya boleh dijalankan saat terjadi insiden kritis atau serangan siber platform.
            </p>

            <div className="mt-4 flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Pilih Tindakan Darurat:</label>
                <select
                  value={emergencyActionType}
                  onChange={(e) => setEmergencyActionType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="LOCK_ALL_LOGINS">Kunci Seluruh Login Platform (Force Logout)</option>
                  <option value="GLOBAL_MAINTENANCE">Aktifkan Global Maintenance Mode</option>
                  <option value="DISABLE_API">Matikan Semua Public API & Webhooks</option>
                  <option value="FREEZE_PAYMENTS">Bekukan Transaksi Payment Gateway</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Alasan Insiden:</label>
                <input
                  type="text"
                  placeholder="Contoh: Terdeteksi upaya akses mencurigakan pada cluster DB"
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Ketik <span className="font-mono text-rose-600 bg-rose-50 px-1 py-0.5 rounded">CONFIRM-EMERGENCY</span> untuk verifikasi:
                </label>
                <input
                  type="text"
                  placeholder="CONFIRM-EMERGENCY"
                  value={emergencyCode}
                  onChange={(e) => setEmergencyCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border-2 border-rose-300 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setIsEmergencyModalOpen(false);
                  setEmergencyCode('');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Batal
              </button>
              <button
                onClick={executeEmergency}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition"
              >
                Eksekusi Tindakan Darurat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BROADCAST ANNOUNCEMENT (SECTION 34) */}
      {/* ======================================================== */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-4">📢 Kirim Pengumuman Platform Global</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              setIsAnnouncementModalOpen(false);
              showToast('Pengumuman global berhasil disiarkan ke seluruh tenant!');
            }} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Judul Pengumuman:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeliharaan Sistem Terjadwal Malam Ini"
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Audiens:</label>
                <select
                  value={announcementForm.target}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, target: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL_SCHOOLS">Semua Sekolah & Pengguna</option>
                  <option value="ADMINS_ONLY">Hanya Admin Sekolah</option>
                  <option value="TEACHERS_ONLY">Hanya Dewan Guru</option>
                  <option value="ENTERPRISE_ONLY">Hanya Sekolah Paket Enterprise</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Isi Pesan:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tulis pesan pengumuman..."
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  Broadcast Pengumuman
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
