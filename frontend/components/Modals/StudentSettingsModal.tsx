'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Shield,
  KeyRound,
  Globe,
  Monitor,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  Laptop,
  Download,
  Calendar,
  Lock,
  MessageSquare,
  Building,
  GraduationCap,
  CreditCard,
  History,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  RefreshCw,
  Sun,
  Moon,
  Info,
  QrCode,
  ShieldCheck,
  Send,
  Zap,
  FolderArchive,
  Fingerprint,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import {
  checkBiometricSupport,
  fetchUserPasskeys,
  registerBiometricPasskey,
  deleteUserPasskey,
  PasskeyItem,
} from '@/lib/webauthn';
import {
  fetchStudentSettingsOverview,
  updateStudentUsername,
  updateStudentPassword,
  linkGoogleAccount,
  unlinkGoogleAccount,
  linkStudentWhatsapp,
  unlinkStudentWhatsapp,
  subscribePersonalBasic,
  revokeDeviceSession,
  requestStudentPasswordRecovery,
} from '@/lib/api';
import { SupportedLanguage, SupportedTheme } from '@/lib/i18n';
import { useAppPreferences } from '@/context/AppPreferencesContext';
import { toast } from 'react-hot-toast';

interface StudentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onUserUpdated?: (updated: any) => void;
  onThemeChanged?: (theme: SupportedTheme) => void;
  onLanguageChanged?: (lang: SupportedLanguage) => void;
  inline?: boolean;
}

export default function StudentSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onThemeChanged,
  onLanguageChanged,
  inline = false,
}: StudentSettingsModalProps) {
  // Global App Preferences Context
  const {
    theme: currentTheme,
    setTheme: setGlobalTheme,
    language: currentLang,
    setLanguage: setGlobalLanguage,
    t,
    dir
  } = useAppPreferences();

  const isMidnight = currentTheme === 'midnight';
  const isGlass = currentTheme === 'glass';

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'identity' | 'security' | 'connections' | 'lifecycle' | 'sessions' | 'export' | 'appearance'
  >('identity');

  // Loading & Data State
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);

  // Form States
  const [usernameInput, setUsernameInput] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // WhatsApp Form State
  const [waPhone, setWaPhone] = useState('');
  const [waLoading, setWaLoading] = useState(false);

  // Google Form State
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  // Biometric / Passkey States
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(false);
  const [registeringPasskey, setRegisteringPasskey] = useState(false);
  const [customKeyName, setCustomKeyName] = useState('');
  const [showAddPasskey, setShowAddPasskey] = useState(false);
  const [biometricSupport, setBiometricSupport] = useState<{
    supported: boolean;
    platformAuthenticator: boolean;
  } | null>(null);

  // Load Overview Data on Open
  useEffect(() => {
    if (isOpen) {
      loadOverview();
      checkBiometricSupport().then(setBiometricSupport);
      loadPasskeys();
    }
  }, [isOpen]);

  const loadPasskeys = async () => {
    setPasskeysLoading(true);
    try {
      const list = await fetchUserPasskeys();
      setPasskeys(list);
    } catch {
      // ignore
    } finally {
      setPasskeysLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setRegisteringPasskey(true);
    try {
      const res = await registerBiometricPasskey(customKeyName.trim() || undefined);
      if (res.success) {
        toast.success(res.message || 'Sidik jari berhasil didaftarkan!');
        setCustomKeyName('');
        setShowAddPasskey(false);
        await loadPasskeys();
      } else {
        toast.error(res.message || 'Pendaftaran sidik jari gagal.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kendala saat registrasi biometrik.');
    } finally {
      setRegisteringPasskey(false);
    }
  };

  const handleDeletePasskey = async (id: number, name: string) => {
    if (!confirm(`Hapus sidik jari "${name}" dari akun ini?`)) return;
    try {
      const res = await deleteUserPasskey(id);
      if (res.success) {
        toast.success(res.message);
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(res.message || 'Gagal menghapus.');
      }
    } catch {
      toast.error('Gagal menghapus sidik jari.');
    }
  };

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await fetchStudentSettingsOverview();
      if (data && data.success) {
        setOverview(data);
        setUsernameInput(data.account?.username || '');
        setWaPhone(data.linked_accounts?.whatsapp?.phone_number || '');
        setGoogleEmail(data.linked_accounts?.google?.email || '');
      }
    } catch {
      toast.error('Gagal memuat pengaturan siswa');
    } finally {
      setLoading(false);
    }
  };

  // Save Username
  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput || usernameInput.length < 3) {
      toast.error('Username minimal 3 karakter');
      return;
    }
    setUsernameLoading(true);
    try {
      const res = await updateStudentUsername(usernameInput);
      if (res.success) {
        toast.success(res.message);
        loadOverview();
        if (onUserUpdated && currentUser) {
          onUserUpdated({ ...currentUser, username: usernameInput });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah username');
    } finally {
      setUsernameLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Kata sandi lama wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await updateStudentPassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      if (res.success) {
        toast.success(res.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah kata sandi');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Link Google
  const handleLinkGoogle = async () => {
    if (!googleEmail || !googleEmail.includes('@')) {
      toast.error('Email Google tidak valid');
      return;
    }
    setGoogleLoading(true);
    try {
      const res = await linkGoogleAccount(googleEmail, 'google_sub_' + Date.now());
      if (res.success) {
        toast.success(res.message);
        loadOverview();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menautkan Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Unlink Google
  const handleUnlinkGoogle = async () => {
    if (confirm('Yakin ingin memutuskan tautan akun Google?')) {
      setGoogleLoading(true);
      try {
        const res = await unlinkGoogleAccount();
        if (res.success) {
          toast.success(res.message);
          loadOverview();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal memutuskan Google');
      } finally {
        setGoogleLoading(false);
      }
    }
  };

  // Link WhatsApp
  const handleLinkWhatsapp = async () => {
    if (!waPhone || waPhone.length < 8) {
      toast.error('Nomor WhatsApp minimal 8 digit');
      return;
    }
    setWaLoading(true);
    try {
      const cleanPhone = waPhone.replace(/\D/g, '');
      const res = await linkStudentWhatsapp(cleanPhone);
      if (res.success) {
        toast.success(res.message);
        loadOverview();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menautkan WhatsApp');
    } finally {
      setWaLoading(false);
    }
  };

  // Unlink WhatsApp
  const handleUnlinkWhatsapp = async () => {
    if (confirm('Yakin ingin memutuskan koneksi WhatsApp AI?')) {
      setWaLoading(true);
      try {
        const res = await unlinkStudentWhatsapp();
        if (res.success) {
          toast.success(res.message);
          loadOverview();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Gagal memutuskan WhatsApp');
      } finally {
        setWaLoading(false);
      }
    }
  };

  // Subscribe Personal Basic
  const handleSubscribePersonal = async () => {
    if (confirm('Aktifkan Personal Basic Subscription seharga $1/bulan untuk mempertahankan akses selamanya?')) {
      try {
        const res = await subscribePersonalBasic();
        if (res.success) {
          toast.success(res.message);
          loadOverview();
        }
      } catch {
        toast.error('Gagal mengaktifkan subscription');
      }
    }
  };

  // Revoke Session
  const handleRevokeSession = async (sessionId?: number, allOthers: boolean = false) => {
    try {
      const res = await revokeDeviceSession(sessionId, allOthers);
      if (res.success) {
        toast.success(res.message);
        loadOverview();
      }
    } catch {
      toast.error('Gagal mencabut sesi perangkat');
    }
  };

  // Change Theme Globally
  const handleSelectTheme = async (theme: SupportedTheme) => {
    await setGlobalTheme(theme);
    if (onThemeChanged) onThemeChanged(theme);
    toast.success(`Tema ${theme.toUpperCase()} aktif secara global`);
  };

  // Change Language Globally
  const handleSelectLanguage = async (lang: SupportedLanguage) => {
    await setGlobalLanguage(lang);
    if (onLanguageChanged) onLanguageChanged(lang);
    toast.success(`Bahasa diubah (${lang.toUpperCase()})`);
  };

  // Trigger Data Export ZIP Download
  const handleDownloadZip = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ma_auth_token') : null;
    const downloadUrl = `http://127.0.0.1:8000/api/v1/student/settings/export-data${token ? `?api_token=${token}` : ''}`;
    window.open(downloadUrl, '_blank');
    toast.success('Mengunduh arsip ZIP seluruh data siswa...');
  };

  if (!isOpen) return null;

  return (
    <div
      dir={dir}
      className={
        inline
          ? 'w-full'
          : 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-3 sm:p-5 lg:p-6 overflow-y-auto animate-in fade-in duration-200'
      }
    >
      <div
        className={`w-full rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 ${
          inline ? 'shadow-sm' : 'max-w-5xl shadow-2xl max-h-[92vh]'
        } ${
          isMidnight
            ? 'bg-[#0a1124]/95 text-white border border-sky-400/20 backdrop-blur-2xl'
            : isGlass
            ? 'bg-white/85 text-slate-900 border border-white/90 backdrop-blur-2xl shadow-[0_30px_70px_rgba(15,23,42,0.12)]'
            : 'bg-white text-slate-900 border border-slate-200 shadow-xl'
        }`}
      >
        {/* ========================================================================= */}
        {/* 1. MASTERPIECE BENTO HEADER                                              */}
        {/* ========================================================================= */}
        <div
          className={`relative px-6 py-5 flex items-center justify-between shrink-0 overflow-hidden border-b transition-colors ${
            isMidnight
              ? 'bg-gradient-to-r from-slate-950 via-[#0a1124] to-indigo-950 text-white border-white/10'
              : isGlass
              ? 'bg-gradient-to-r from-sky-50/90 via-white/90 to-indigo-50/80 text-slate-900 border-white/60 shadow-xs'
              : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white border-sky-500/30 shadow-sm'
          }`}
        >
          {/* Subtle Ambient Light Glows */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border shrink-0 ${
              isGlass ? 'bg-sky-500/10 text-sky-700 border-sky-200/80' : 'bg-white/20 backdrop-blur-md text-white border-white/30'
            }`}>
              <Fingerprint className={`w-6 h-6 ${isGlass ? 'text-sky-600' : 'text-white'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className={`font-bold text-lg tracking-tight ${isGlass ? 'text-slate-900' : 'text-white'}`}>
                  {t('nav.settings')}
                </h3>
                <span className={`px-3 py-0.5 rounded-full text-[11px] font-bold border tracking-wide font-mono flex items-center gap-1.5 shadow-xs ${
                  isGlass
                    ? 'bg-sky-100 text-sky-800 border-sky-200'
                    : 'bg-white/20 text-white border-white/30'
                }`}>
                  <ShieldCheck className={`w-3.5 h-3.5 ${isGlass ? 'text-sky-600' : 'text-sky-200'}`} />
                  {overview?.identity?.myacademic_id || 'ID: MA-2024-X1001'}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isGlass
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-emerald-400/30 text-white border-emerald-300/40'
                }`}>
                  {overview?.lifecycle?.status_label || 'School Sponsored'}
                </span>
              </div>
              <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${isGlass ? 'text-slate-600' : 'text-sky-100'}`}>
                Pusat Identitas Tunggal (1 Orang = 1 MyAcademic Identity), Kredensial, Keamanan, Integrasi WhatsApp AI & Layanan Terpadu.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`relative z-10 w-9 h-9 rounded-2xl flex items-center justify-center transition-all cursor-pointer border shadow-xs group ${
              isGlass
                ? 'bg-slate-200/70 hover:bg-slate-300/80 text-slate-700 border-slate-300/70'
                : 'bg-white/15 hover:bg-white/25 text-white border-white/20'
            }`}
            title="Tutup Pengaturan"
          >
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 2. TAB NAVIGATION PILLS ROW                                              */}
        {/* ========================================================================= */}
        <div
          className={`px-6 py-3 border-b flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none transition-colors ${
            isMidnight
              ? 'bg-slate-900/70 border-white/10'
              : isGlass
              ? 'bg-white/50 border-white/60 backdrop-blur-md'
              : 'bg-slate-50 border-slate-200/90'
          }`}
        >
          {[
            { id: 'identity', label: t('tab.identity_account'), icon: User },
            { id: 'security', label: t('tab.security_recovery'), icon: Shield },
            { id: 'connections', label: t('tab.connections'), icon: Share2 },
            { id: 'lifecycle', label: t('tab.lifecycle'), icon: CreditCard },
            { id: 'sessions', label: t('tab.sessions'), icon: Laptop },
            { id: 'export', label: t('tab.export'), icon: Download },
            { id: 'appearance', label: t('tab.appearance'), icon: Monitor },
          ].map((tabItem) => {
            const Icon = tabItem.icon;
            const isActive = activeTab === tabItem.id;
            return (
              <button
                key={tabItem.id}
                onClick={() => setActiveTab(tabItem.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-500/25 border border-sky-500'
                    : isMidnight
                    ? 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
                    : isGlass
                    ? 'text-slate-600 hover:text-slate-950 hover:bg-white/70 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tabItem.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* 3. MODAL BODY (BENTO GRID WORKSPACE)                                      */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6 scrollbar-thin">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-500">
              <RefreshCw className="w-9 h-9 animate-spin text-sky-600" />
              <p className="text-xs font-semibold tracking-wide">Memuat pengaturan akun siswa...</p>
            </div>
          ) : (
            <>
              {/* =================================================================== */}
              {/* TAB 1: IDENTITAS (1 ORANG 1 IDENTITY) & USERNAME                   */}
              {/* =================================================================== */}
              {activeTab === 'identity' && (
                <div className="space-y-6">
                  {/* Passport Identity Card */}
                  <div
                    className={`relative p-6 rounded-3xl border overflow-hidden shadow-sm transition-all ${
                      isMidnight
                        ? 'bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 text-white border-sky-400/25'
                        : isGlass
                        ? 'bg-gradient-to-br from-sky-50/90 via-white/80 to-indigo-50/80 text-slate-900 border-white/90 backdrop-blur-xl shadow-xs'
                        : 'bg-gradient-to-br from-sky-50 via-blue-50/50 to-indigo-50/60 text-slate-900 border-sky-200'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isMidnight
                                ? 'bg-sky-400/20 text-sky-300 border border-sky-400/30'
                                : 'bg-sky-100 text-sky-800 border border-sky-300'
                            }`}
                          >
                            PASPOR IDENTITAS DIGITAL NASIONAL
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Terverifikasi Dapodik
                          </span>
                        </div>
                        <h4 className="text-xl font-bold tracking-tight flex items-center gap-2">
                          <span>{t('identity.one_person_title')}</span>
                          <Sparkles className="w-5 h-5 text-sky-500" />
                        </h4>
                        <p className={`text-xs max-w-2xl leading-relaxed ${isMidnight ? 'text-slate-300' : 'text-slate-600'}`}>
                          {t('identity.one_person_desc')}
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-2xl border flex items-center gap-3 self-start md:self-auto shrink-0 shadow-sm ${
                          isMidnight
                            ? 'bg-white/10 border-white/15 text-white'
                            : isGlass
                            ? 'bg-white/80 border-white/90 text-slate-900 backdrop-blur-md'
                            : 'bg-white border-sky-200 text-slate-900'
                        }`}
                      >
                        <QrCode className="w-12 h-12 text-sky-600" />
                        <div className="text-left font-mono">
                          <span className="text-[10px] text-slate-400 uppercase block">Kunci Pencocokan</span>
                          <span className="text-xs font-bold text-sky-700">{overview?.identity?.identity_match_key || 'NISN+DOB'}</span>
                          <span className="text-[9px] text-emerald-600 font-sans block mt-0.5">Validasi Permanen</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 4 Read-only Official Credentials Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div
                      className={`p-4 rounded-2xl border shadow-xs ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/70 border-white/80 text-slate-900 backdrop-blur-md'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {t('identity.full_name')}
                      </span>
                      <p className="text-sm font-bold mt-1 truncate">
                        {overview?.identity?.full_name || currentUser?.name}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Data resmi sekolah</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border shadow-xs ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/70 border-white/80 text-slate-900 backdrop-blur-md'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {t('identity.nisn')}
                      </span>
                      <p className="text-sm font-bold text-sky-600 font-mono mt-1">
                        {overview?.identity?.nisn || '0071234567'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Nomor Induk Siswa Nasional</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border shadow-xs ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/70 border-white/80 text-slate-900 backdrop-blur-md'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {t('identity.birth_date')}
                      </span>
                      <p className="text-sm font-bold mt-1">
                        {overview?.identity?.birth_date || '2008-05-14'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Kunci otentikasi Dapodik</span>
                    </div>

                    <div
                      className={`p-4 rounded-2xl border shadow-xs ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/70 border-white/80 text-slate-900 backdrop-blur-md'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {t('identity.mother_name')}
                      </span>
                      <p className="text-sm font-bold mt-1">
                        {overview?.identity?.mother_name || 'Nur Aini'}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">Pemulihan via Admin Sekolah</span>
                    </div>
                  </div>

                  {/* Username Login Utama Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isMidnight
                        ? 'bg-slate-800/60 border-white/10 text-white'
                        : isGlass
                        ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="border-b border-slate-100 dark:border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm flex items-center gap-2">
                          <User className="w-4 h-4 text-sky-600" />
                          {t('account.username_label')}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('account.username_hint')}
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200 self-start sm:self-auto">
                        Username Saat Ini: <b className="font-mono">@{overview?.account?.username || 'ahmad_siswa'}</b>
                      </span>
                    </div>

                    <form onSubmit={handleSaveUsername} className="flex flex-col sm:flex-row gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-3 text-slate-400 text-xs font-mono font-bold">@</span>
                        <input
                          type="text"
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                          placeholder="masukkan_username_baru"
                          className={`w-full pl-9 pr-4 py-2.5 rounded-2xl border text-xs font-mono outline-none focus:ring-2 focus:ring-sky-500/20 ${
                            isMidnight
                              ? 'bg-slate-900 border-white/15 text-white'
                              : isGlass
                              ? 'bg-white/80 border-white/90 text-slate-900 placeholder:text-slate-400 focus:bg-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={usernameLoading}
                        className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-sm shrink-0"
                      >
                        {usernameLoading ? 'Menyimpan...' : t('account.save_username')}
                      </button>
                    </form>
                  </div>

                  {/* Quick Biometric Access Banner in Tab 1 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-300/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <span>Autentikasi Sidik Jari (Passkey)</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {passkeys.length > 0 ? `${passkeys.length} Terdaftar` : 'Bisa Diaktifkan'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Ingin login instan tanpa mengetik sandi? Kelola sensor sidik jari perangkat Anda di tab Security & Recovery.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('security')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span>Buka Tab Keamanan & Sidik Jari →</span>
                    </button>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 2: KEAMANAN & PEMULIHAN SANDI                                  */}
              {/* =================================================================== */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  {/* Biometric & Fingerprint (Passkey) Bento Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isMidnight
                        ? 'bg-slate-800/60 border-white/10 text-white'
                        : isGlass
                        ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="border-b border-slate-100 dark:border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm">
                            Autentikasi Sidik Jari & Biometrik (Passkey)
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Masuk ke akun MyAcademic dalam 1 detik dengan menempelkan sidik jari pada sensor HP/Laptop, Windows Hello, atau Touch ID tanpa mengetik password.
                        </p>
                      </div>
                      {biometricSupport?.supported ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          Sensor / WebAuthn Siap
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 self-start sm:self-auto shrink-0">
                          Gunakan Browser Modern (Chrome/Edge/Safari)
                        </span>
                      )}
                    </div>

                    {/* Add Passkey Action */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-white/10">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Daftarkan Sensor Biometrik Perangkat Ini
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Hubungkan sensor sidik jari perangkat yang sedang Anda pakai agar bisa langsung login.
                        </div>
                      </div>

                      {!showAddPasskey ? (
                        <button
                          type="button"
                          onClick={() => setShowAddPasskey(true)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Daftarkan Sidik Jari Baru</span>
                        </button>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="Nama perangkat (cth: Laptop Kerja / HP Siswa)"
                            value={customKeyName}
                            onChange={(e) => setCustomKeyName(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                          />
                          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setShowAddPasskey(false);
                                setCustomKeyName('');
                              }}
                              className="px-3 py-2 text-xs text-slate-500 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              onClick={handleRegisterPasskey}
                              disabled={registeringPasskey}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {registeringPasskey ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Sentuh Sensor...</span>
                                </>
                              ) : (
                                <>
                                  <Fingerprint className="w-3.5 h-3.5" />
                                  <span>Sentuh Sensor Sekarang</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Registered Passkeys List */}
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                        <span>Daftar Sidik Jari Terdaftar ({passkeys.length})</span>
                      </div>

                      {passkeysLoading ? (
                        <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          <span>Memeriksa sensor terdaftar...</span>
                        </div>
                      ) : passkeys.length === 0 ? (
                        <div className="p-5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-center">
                          <Fingerprint className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Belum ada sidik jari yang terdaftar di akun Anda
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Klik tombol hijau di atas untuk mulai menghubungkan sensor sidik jari perangkat ini.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {passkeys.map((p) => {
                            const isMobile =
                              p.name.toLowerCase().includes('android') ||
                              p.name.toLowerCase().includes('apple') ||
                              p.name.toLowerCase().includes('iphone');
                            const DeviceIcon = isMobile ? Smartphone : Laptop;

                            return (
                              <div
                                key={p.id}
                                className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between transition hover:border-emerald-300"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                    <DeviceIcon className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                      <span>{p.name}</span>
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                                        Aktif
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                      Didaftarkan: {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      {p.last_used_at && (
                                        <span> • Digunakan: {new Date(p.last_used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePasskey(p.id, p.name)}
                                  title="Hapus sidik jari ini"
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Hardware Privacy Assurance */}
                    <div className="p-3 bg-emerald-500/10 border border-emerald-300/50 rounded-2xl flex items-start gap-2.5 text-[11px] text-emerald-900 dark:text-emerald-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Keamanan Biometrik Standar FIDO2:</strong> Data fisik sidik jari Anda diproses langsung di chip keamanan perangkat (TPM / Apple Secure Enclave) dan tidak pernah dikirim ke internet ataupun database server. Server hanya menyimpan kunci verifikasi kriptografi publik yang unik.
                      </span>
                    </div>
                  </div>

                  {/* Change Password Bento Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isMidnight
                        ? 'bg-slate-800/60 border-white/10 text-white'
                        : isGlass
                        ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="border-b border-slate-100 dark:border-white/10 pb-3">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Lock className="w-4 h-4 text-sky-600" />
                        Ganti Kata Sandi (Update Password)
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Amankan akun dengan memperbarui kata sandi secara berkala.
                      </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Kata Sandi Saat Ini / Sandi Default Sekolah
                        </label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                          className={`w-full px-4 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-sky-500/20 ${
                            isMidnight
                              ? 'bg-slate-900 border-white/15 text-white'
                              : isGlass
                              ? 'bg-white/80 border-white/90 text-slate-900 placeholder:text-slate-400 focus:bg-white shadow-xs'
                              : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                          }`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Kata Sandi Baru (Min. 6 Karakter)
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-sky-500/20 ${
                              isMidnight
                                ? 'bg-slate-900 border-white/15 text-white'
                                : isGlass
                                ? 'bg-white/80 border-white/90 text-slate-900 placeholder:text-slate-400 focus:bg-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                            Konfirmasi Kata Sandi Baru
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`w-full px-4 py-2.5 rounded-2xl border text-xs outline-none focus:ring-2 focus:ring-sky-500/20 ${
                              isMidnight
                                ? 'bg-slate-900 border-white/15 text-white'
                                : isGlass
                                ? 'bg-white/80 border-white/90 text-slate-900 placeholder:text-slate-400 focus:bg-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-900 focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="submit"
                          disabled={passwordLoading}
                          className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all cursor-pointer disabled:opacity-50 shadow-sm"
                        >
                          {passwordLoading ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 2 Password Recovery Mechanisms */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Mechanism 1: Self-Service via Linked Email */}
                    <div className="p-6 rounded-3xl border border-emerald-300 bg-emerald-50/70 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {t('recovery.self_available')}
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          {t('recovery.self_hint')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const res = await requestStudentPasswordRecovery(overview?.account?.username || 'ahmad_siswa');
                            if (res.success) {
                              toast.success(res.message);
                            }
                          } catch (e: any) {
                            toast.error(e.response?.data?.message || 'Gagal mengirim kode pemulihan');
                          }
                        }}
                        className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Uji Kirim Link Reset ke Email Siswa
                      </button>
                    </div>

                    {/* Mechanism 2: Admin-Assisted Verification */}
                    <div className="p-6 rounded-3xl border border-amber-300 bg-amber-50/70 space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                          <Shield className="w-4 h-4 text-amber-600" />
                          {t('recovery.admin_assisted_title')}
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          {t('recovery.admin_assisted_desc')}
                        </p>
                      </div>

                      <div className="p-3 rounded-2xl bg-white border border-amber-200 text-[11px] font-mono text-amber-900">
                        Protokol: NISN + Tgl Lahir + Ibu Kandung (Admin Tidak Bisa Melihat Password)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 3: KONEKSI LAYANAN (GOOGLE & WHATSAPP AI)                      */}
              {/* =================================================================== */}
              {activeTab === 'connections' && (
                <div className="space-y-6">
                  {/* Google Account Connection Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isMidnight
                        ? 'bg-slate-800/60 border-white/10 text-white'
                        : isGlass
                        ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                          <Globe className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-bold text-sm">
                              {t('conn.google_title')}
                            </h4>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                                overview?.linked_accounts?.google?.is_linked
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {overview?.linked_accounts?.google?.is_linked ? t('conn.connected') : t('conn.not_connected')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                            {t('conn.google_desc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {overview?.linked_accounts?.google?.is_linked ? (
                      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        isGlass ? 'bg-white/70 border-white/80' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div>
                          <span className="text-xs font-bold block font-mono text-slate-900">
                            {overview?.linked_accounts?.google?.email}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Aktif tertaut untuk login instan & pemulihan mandiri
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleUnlinkGoogle}
                          disabled={googleLoading}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-all"
                        >
                          Putuskan Tautan Google
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <input
                          type="email"
                          value={googleEmail}
                          onChange={(e) => setGoogleEmail(e.target.value)}
                          placeholder="nama.siswa@gmail.com"
                          className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 ${
                            isMidnight
                              ? 'bg-slate-900 border-white/15 text-white'
                              : isGlass
                              ? 'bg-white/80 border-white/90 shadow-xs'
                              : 'border-slate-200 bg-slate-50 focus:bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleLinkGoogle}
                          disabled={googleLoading}
                          className="px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer shrink-0 shadow-sm"
                        >
                          {googleLoading ? 'Menautkan...' : 'Tautkan Akun Google'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* WhatsApp AI Study Assistant Card */}
                  <div
                    className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                      isMidnight
                        ? 'bg-slate-800/60 border-white/10 text-white'
                        : isGlass
                        ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-bold text-sm">
                              {t('conn.whatsapp_title')}
                            </h4>
                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${
                                overview?.linked_accounts?.whatsapp?.is_linked
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {overview?.linked_accounts?.whatsapp?.is_linked ? t('conn.connected') : t('conn.not_connected')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                            {t('conn.whatsapp_desc')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {overview?.linked_accounts?.whatsapp?.is_linked ? (
                      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        isGlass ? 'bg-emerald-50/90 border-emerald-200/90' : 'bg-emerald-50/70 border-emerald-200'
                      }`}>
                        <div>
                          <span className="text-xs font-bold text-emerald-950 block font-mono">
                            +{overview?.linked_accounts?.whatsapp?.phone_number}
                          </span>
                          <span className="text-[10px] text-emerald-700">
                            Aktif terhubung ke Arsip Belajar AI & Tanya Jawab Mata Pelajaran
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleUnlinkWhatsapp}
                          disabled={waLoading}
                          className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-all"
                        >
                          Putuskan WhatsApp
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <input
                          type="tel"
                          value={waPhone}
                          onChange={(e) => setWaPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                          className={`flex-1 px-4 py-2.5 rounded-2xl border text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
                            isMidnight
                              ? 'bg-slate-900 border-white/15 text-white'
                              : isGlass
                              ? 'bg-white/80 border-white/90 shadow-xs'
                              : 'border-slate-200 bg-slate-50 focus:bg-white'
                          }`}
                        />
                        <button
                          type="button"
                          onClick={handleLinkWhatsapp}
                          disabled={waLoading}
                          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shrink-0 shadow-sm"
                        >
                          {waLoading ? 'Menghubungkan...' : 'Hubungkan Nomor WhatsApp'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 4: SEKOLAH, SUBSCRIPTION & LIFECYCLE                           */}
              {/* =================================================================== */}
              {activeTab === 'lifecycle' && (
                <div className="space-y-6">
                  {/* Current Active Sponsorship Hero Card */}
                  <div
                    className={`p-6 rounded-3xl text-white space-y-4 shadow-md border ${
                      isMidnight
                        ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-400/25'
                        : isGlass
                        ? 'bg-gradient-to-r from-sky-600/90 via-blue-600/90 to-indigo-600/90 backdrop-blur-xl border-white/40 shadow-lg'
                        : 'bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 border-sky-400/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sky-200 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4" />
                        Status Sponsorship & Lifecycle Akun
                      </span>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30">
                        {overview?.lifecycle?.status_label || 'School Sponsored (100% Ditanggung)'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pt-1">
                      <div>
                        <h4 className="text-xl font-bold text-white tracking-tight">
                          {overview?.lifecycle?.subscription_type === 'personal_basic'
                            ? 'Personal Basic Subscription ($1 / bulan)'
                            : 'School Sponsored (Sekolah Menanggung Penuh)'}
                        </h4>
                        <p className="text-xs text-sky-100 mt-1">
                          Sekolah Penanggung: <strong className="text-white font-semibold">{overview?.lifecycle?.sponsor_name || 'SMA Negeri 1 Prestasi'}</strong>
                        </p>
                      </div>

                      {overview?.lifecycle?.subscription_type !== 'personal_basic' && (
                        <button
                          type="button"
                          onClick={handleSubscribePersonal}
                          className="px-5 py-2.5 rounded-2xl bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs cursor-pointer transition-all self-start sm:self-auto shadow-md"
                        >
                          Beralih ke Personal Basic ($1/bln)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3 Clear Lifecycle Tier Explanations */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 block">Tier 1</span>
                      <h5 className="font-bold text-xs">
                        {t('lifecycle.school_sponsored')}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {t('lifecycle.school_sponsored_desc')}
                      </p>
                    </div>

                    <div
                      className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">Tier 2</span>
                      <h5 className="font-bold text-xs">
                        {t('lifecycle.personal_basic_title')}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {t('lifecycle.personal_basic_desc')}
                      </p>
                    </div>

                    <div
                      className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
                        isMidnight
                          ? 'bg-slate-800/60 border-white/10 text-white'
                          : isGlass
                          ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)]'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Tier 3</span>
                      <h5 className="font-bold text-xs">
                        {t('lifecycle.retention_title')}
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {t('lifecycle.retention_desc')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 5: SESI LOGIN & PERANGKAT                                      */}
              {/* =================================================================== */}
              {activeTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-white/10 pb-3">
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-sky-600" />
                        {t('sessions.title')} ({overview?.active_sessions?.length || 1})
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Daftar perangkat yang memiliki token aktif ke akun MyAcademic Anda.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeSession(undefined, true)}
                      className="px-4 py-2 rounded-2xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold cursor-pointer transition-all self-start sm:self-auto"
                    >
                      {t('sessions.revoke_all')}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(overview?.active_sessions || [
                      { id: 1, device_name: 'Chrome on Windows 11', is_current: true, browser: 'Chrome 122', approx_location: 'Jakarta, ID', ip_address: '182.253.110.12', last_active_human: 'Baru saja' }
                    ]).map((sess: any) => (
                      <div
                        key={sess.id}
                        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs ${
                          isMidnight
                            ? 'bg-slate-800/60 border-white/10 text-white'
                            : isGlass
                            ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-md'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            sess.is_current ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Laptop className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs">{sess.device_name}</span>
                              {sess.is_current && (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  {t('sessions.current_device')}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {sess.browser} • {sess.approx_location} • IP: {sess.ip_address} • Aktif: <b className="text-slate-700 dark:text-slate-300">{sess.last_active_human}</b>
                            </p>
                          </div>
                        </div>

                        {!sess.is_current && (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id)}
                            className="text-xs text-rose-600 hover:text-rose-800 font-bold hover:underline cursor-pointer self-end sm:self-auto"
                          >
                            {t('sessions.revoke_one')}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 6: EKSPOR DATA SAYA (ZIP ARCHIVE)                               */}
              {/* =================================================================== */}
              {activeTab === 'export' && (
                <div
                  className={`p-7 rounded-3xl border shadow-sm space-y-6 ${
                    isMidnight
                      ? 'bg-slate-800/60 border-white/10 text-white'
                      : isGlass
                      ? 'bg-white/75 border-white/90 text-slate-900 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25">
                      <FolderArchive className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base">
                        {t('export.title')}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
                        {t('export.desc')}
                      </p>
                    </div>
                  </div>

                  <div className={`p-5 rounded-2xl border space-y-3 ${
                    isMidnight
                      ? 'bg-slate-900/60 border-white/10'
                      : isGlass
                      ? 'bg-white/60 border-white/80 backdrop-blur-md'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="font-bold text-xs block">
                      Struktur Konten Berkas ZIP Digital:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isGlass ? 'bg-white/80 border-white/90 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span>📁</span>
                        <span><b>01_Profil_Dapodik:</b> Biodata lengkap diri & NISN</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isGlass ? 'bg-white/80 border-white/90 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span>📁</span>
                        <span><b>02_Riwayat_Pendidikan:</b> Track record jenjang sekolah</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isGlass ? 'bg-white/80 border-white/90 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span>📁</span>
                        <span><b>03_Transkrip_Nilai:</b> Rekapitulasi rapor digital</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                        isGlass ? 'bg-white/80 border-white/90 text-slate-800 shadow-2xs' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        <span>📁</span>
                        <span><b>04_Arsip_Belajar_AI:</b> Catatan audio, papan tulis, mind map</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    className="w-full py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    {t('export.download_btn')}
                  </button>
                </div>
              )}

              {/* =================================================================== */}
              {/* TAB 7: TAMPILAN (3 TEMA) & BAHASA (5 BAHASA DENGAN RTL)             */}
              {/* =================================================================== */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  {/* Theme Selector (Formal, Glass, Midnight) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-sky-600" />
                        {t('theme.title')}
                      </h4>
                      <span className="text-[11px] text-slate-500">Berlaku global ke seluruh dashboard</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* 1. FORMAL (Clean Default Academic - White & Blue) */}
                      <div
                        onClick={() => handleSelectTheme('formal')}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-2.5 relative ${
                          currentTheme === 'formal'
                            ? 'border-sky-600 bg-sky-50 text-slate-900 shadow-md ring-2 ring-sky-500/20'
                            : isMidnight
                            ? 'border-white/10 hover:border-white/20 bg-slate-900/40 text-slate-200'
                            : isGlass
                            ? 'border-white/80 hover:border-white bg-white/60 text-slate-800 backdrop-blur-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">
                            {t('theme.formal_name')}
                          </span>
                          <Building className="w-4 h-4 text-sky-600" />
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {t('theme.formal_desc')}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-700">
                            {currentTheme === 'formal' ? '✓ Aktif Sekarang (Default)' : 'Gunakan Tema'}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-blue-600 border border-white" />
                        </div>
                      </div>

                      {/* 2. GLASS (Modern Translucent Light Glassmorphism) */}
                      <div
                        onClick={() => handleSelectTheme('glass')}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-2.5 relative overflow-hidden ${
                          currentTheme === 'glass'
                            ? 'border-sky-400 bg-white/80 text-slate-900 shadow-xl ring-2 ring-sky-400/30 backdrop-blur-2xl'
                            : isMidnight
                            ? 'border-white/15 hover:border-white/30 bg-white/5 text-slate-200'
                            : 'border-slate-200 hover:border-slate-300 bg-white/70 text-slate-800 backdrop-blur-md'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">
                            {t('theme.glass_name')}
                          </span>
                          <Sparkles className="w-4 h-4 text-sky-500" />
                        </div>
                        <p className={`text-[11px] leading-relaxed ${currentTheme === 'glass' ? 'text-slate-600' : 'text-slate-500'}`}>
                          {t('theme.glass_desc')}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-sky-600">
                            {currentTheme === 'glass' ? '✓ Aktif Sekarang' : 'Gunakan Tema'}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-sky-300 via-indigo-200 to-white border border-sky-300 shadow-xs" />
                        </div>
                      </div>

                      {/* 3. MIDNIGHT (Night Sky Glassmorphism) */}
                      <div
                        onClick={() => handleSelectTheme('midnight')}
                        className={`p-5 rounded-3xl border-2 transition-all cursor-pointer space-y-2.5 relative bg-[#070d18] text-white ${
                          currentTheme === 'midnight'
                            ? 'border-indigo-400 shadow-xl ring-2 ring-indigo-500/30'
                            : 'border-slate-800 hover:border-indigo-600/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">
                            {t('theme.midnight_name')}
                          </span>
                          <Moon className="w-4 h-4 text-indigo-400" />
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {t('theme.midnight_desc')}
                        </p>
                        <div className="pt-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-indigo-300">
                            {currentTheme === 'midnight' ? '✓ Aktif Sekarang' : 'Gunakan Tema'}
                          </span>
                          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 border border-indigo-200 shadow-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Multi-Language Selector (5 Languages with RTL) */}
                  <div className="pt-4 border-t border-slate-100 dark:border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm flex items-center gap-2">
                        <Globe className="w-4 h-4 text-sky-600" />
                        Pilihan Bahasa Antarmuka (5 Bahasa Internasional)
                      </h4>
                      <span className="text-[11px] text-slate-500">Bahasa Arab mendukung full RTL</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-1">
                      {[
                        { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', hint: 'Standar Nasional' },
                        { code: 'en', name: 'English', flag: '🇬🇧', hint: 'International' },
                        { code: 'zh', name: '中文 (简体)', flag: '🇨🇳', hint: 'Chinese' },
                        { code: 'ja', name: '日本語', flag: '🇯🇵', hint: 'Japanese' },
                        { code: 'ar', name: 'العربية (RTL)', flag: '🇸🇦', hint: 'Arabic RTL' },
                      ].map((item) => {
                        const isSel = currentLang === item.code;
                        return (
                          <button
                            key={item.code}
                            type="button"
                            onClick={() => handleSelectLanguage(item.code as SupportedLanguage)}
                            className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                              isSel
                                ? 'bg-sky-50 border-sky-600 text-sky-950 font-bold shadow-xs ring-2 ring-sky-500/20'
                                : isMidnight
                                ? 'border-white/10 text-slate-300 hover:bg-white/5 bg-slate-900/60'
                                : isGlass
                                ? 'border-white/80 text-slate-800 hover:bg-white/80 bg-white/60 backdrop-blur-sm'
                                : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                            }`}
                          >
                            <div className="text-xl">{item.flag}</div>
                            <div className="text-xs font-bold mt-1.5">{item.name}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.hint}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
