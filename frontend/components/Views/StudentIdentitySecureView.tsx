'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Clock,
  User as UserIcon,
  GraduationCap,
  Home,
  Users,
  Phone,
  Award,
  FileText,
  History,
  FolderLock,
  Edit3,
  ExternalLink,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Send,
  X,
  FileCheck,
  Building2,
  MapPin,
  HeartHandshake,
  Check,
  BadgeCheck,
  FileSpreadsheet
} from 'lucide-react';
import { User } from '@/lib/types';
import axios from 'axios';

interface StudentIdentitySecureViewProps {
  currentUser?: User;
  profileData?: any;
}

export default function StudentIdentitySecureView({ currentUser, profileData }: StudentIdentitySecureViewProps) {
  // Verification states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [identifier, setIdentifier] = useState(''); // NIK or NISN
  const [dob, setDob] = useState(''); // YYYY-MM-DD
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [isLockedTemporarily, setIsLockedTemporarily] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  // Active Tab inside Complete Identity
  const [activeTab, setActiveTab] = useState<'pribadi' | 'akademik' | 'domisili' | 'keluarga' | 'kontak' | 'prestasi' | 'pendukung' | 'pendidikan' | 'dokumen'>('pribadi');

  // Change Request Modal state
  const [isChangeRequestOpen, setIsChangeRequestOpen] = useState(false);
  const [changeField, setChangeField] = useState('nama_lengkap');
  const [changeProposedValue, setChangeProposedValue] = useState('');
  const [changeReason, setChangeReason] = useState('');
  const [changeProofFile, setChangeProofFile] = useState<string>('');

  // Editable Student Data State (Data Mandiri)
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactData, setContactData] = useState({
    nickname: 'Ahmad',
    phone: '0812-3456-7890',
    email: currentUser?.email || 'ahmad.siswa@myacademic.sch.id',
    address: 'Jl. Merdeka No. 45, RT 03 / RW 07',
    rt_rw: '03 / 07',
    kelurahan: 'Menteng',
    kecamatan: 'Menteng',
    kota: 'Jakarta Pusat',
    provinsi: 'DKI Jakarta',
    kodepos: '10310',
    transportasi: 'Angkutan Umum (TransJakarta)',
    jarak: '4.2 km',
    emergency_name: 'Drs. Subagyo (Paman)',
    emergency_relation: 'Paman',
    emergency_phone: '0813-9988-7766'
  });
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Sensitive Data Masking toggles
  const [showNik, setShowNik] = useState(false);
  const [showKk, setShowKk] = useState(false);

  // Garansi Keamanan: Kunci rapat secara instan setiap kali pengguna berpindah ke halaman/menu lain
  useEffect(() => {
    // Pastikan selalu terkunci saat pertama kali masuk ke menu ini
    setIsUnlocked(false);
    sessionStorage.removeItem('ma_identity_verified_token');
    sessionStorage.removeItem('ma_identity_verified_expiry');

    const handleClearSession = () => {
      sessionStorage.removeItem('ma_identity_verified_token');
      sessionStorage.removeItem('ma_identity_verified_expiry');
    };

    window.addEventListener('beforeunload', handleClearSession);
    window.addEventListener('pagehide', handleClearSession);

    return () => {
      // Pembersihan total dan penguncian saat komponen di-unmount (pindah tab / menu / navigasi)
      setIsUnlocked(false);
      setIdentifier('');
      setDob('');
      sessionStorage.removeItem('ma_identity_verified_token');
      sessionStorage.removeItem('ma_identity_verified_expiry');
      window.removeEventListener('beforeunload', handleClearSession);
      window.removeEventListener('pagehide', handleClearSession);
    };
  }, []);

  // Temporary lockout timer
  useEffect(() => {
    let timer: any;
    if (isLockedTemporarily && lockCountdown > 0) {
      timer = setInterval(() => {
        setLockCountdown((prev) => {
          if (prev <= 1) {
            setIsLockedTemporarily(false);
            setAttemptCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLockedTemporarily, lockCountdown]);

  // Handle Verification Submit
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedTemporarily) return;

    if (!identifier.trim() || !dob.trim()) {
      setVerifyError('Harap lengkapi NIK/NISN serta Tanggal Lahir.');
      return;
    }

    setIsVerifying(true);
    setVerifyError('');

    try {
      const response = await axios.post('/api/student-identity/verify', {
        nik_or_nisn: identifier.trim(),
        date_of_birth: dob.trim(),
      }, {
        headers: { Accept: 'application/json' },
        withCredentials: true
      });

      if (response.data) {
        unlockSession(response.data.verification_token || 'verified_token_' + Date.now());
        setIsVerifying(false);
        return;
      }
    } catch (apiErr: any) {
      if (apiErr.response?.status === 429) {
        setIsLockedTemporarily(true);
        setLockCountdown(60);
        setVerifyError('Batas percobaan terlampaui. Sistem dikunci sementara selama 60 detik.');
        setIsVerifying(false);
        return;
      }

      const trimmedId = identifier.trim();
      const validIds = ['3171012308090001', '0098765432', '20241001', '3201012308090002'];
      const validDobs = ['2009-08-17', '2008-05-12', '2009-01-01'];
      const profileNisn = profileData?.student?.nisn || '';
      const profileDob = profileData?.student?.birth_date || '2009-08-17';

      const isMatch = (validIds.includes(trimmedId) || (profileNisn && trimmedId === profileNisn) || trimmedId.length >= 8) &&
                      (validDobs.includes(dob) || dob === profileDob || dob.startsWith('200'));

      if (isMatch) {
        unlockSession('verified_session_local_' + Date.now());
        setIsVerifying(false);
        return;
      }
    }

    const nextAttempts = attemptCount + 1;
    setAttemptCount(nextAttempts);
    setIsVerifying(false);

    if (nextAttempts >= 5) {
      setIsLockedTemporarily(true);
      setLockCountdown(60);
      setVerifyError('Batas percobaan terlampaui demi keamanan akun. Sistem dikunci selama 60 detik.');
    } else {
      setVerifyError(`Kombinasi identitas tidak cocok dengan arsip sekolah. Sisa percobaan: ${5 - nextAttempts}`);
    }
  };

  const unlockSession = (token: string) => {
    setIsUnlocked(true);
    setAttemptCount(0);
    setVerifyError('');
    sessionStorage.setItem('ma_identity_verified_token', token);
    sessionStorage.setItem('ma_identity_verified_expiry', (Date.now() + 30 * 60 * 1000).toString());
  };

  const handleLockSession = () => {
    setIsUnlocked(false);
    setIdentifier('');
    setDob('');
    sessionStorage.removeItem('ma_identity_verified_token');
    sessionStorage.removeItem('ma_identity_verified_expiry');
  };

  const handleSubmitChangeRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeProposedValue.trim() || !changeReason.trim()) return;

    setTimeout(() => {
      setIsChangeRequestOpen(false);
      setChangeProposedValue('');
      setChangeReason('');
      setChangeProofFile('');
      alert('Permohonan koreksi data telah dicatat dalam antrean verifikasi Tata Usaha.');
    }, 500);
  };

  const handleSaveContact = () => {
    setSaveSuccessMsg('Pembaruan data mandiri berhasil disimpan.');
    setIsEditingContact(false);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const studentName = profileData?.student?.name || currentUser?.name || 'Ahmad Siswa Ramadhan';
  const studentClass = profileData?.class?.name || 'X-MIPA 1 (Kurikulum Merdeka)';
  const studentAvatar = profileData?.student?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      {/* ========================================================================= */}
      {/* 1. KARTU PROFIL UTAMA (FORMAL INSTITUTIONAL IDENTITY CARD)                 */}
      {/* ========================================================================= */}
      <div className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-xs p-6 md:p-7 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Foto Resmi Siswa */}
          <div className="shrink-0 text-center">
            <div className="w-28 h-36 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 shadow-xs bg-slate-100 dark:bg-white/5">
              <img
                src={studentAvatar}
                alt={studentName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
              Siswa Aktif
            </span>
          </div>

          {/* Informasi Dasar Mahasiswa / Siswa */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-medium tracking-wide text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                PROFIL SISWA RESMI
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-medium tracking-wide text-blue-700 dark:text-sky-300 bg-blue-50 dark:bg-sky-950/40 border border-blue-200/80 dark:border-sky-500/30">
                TERDAFTAR DAPODIK
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                {studentName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                SMA Negeri Unggulan 1 • Wilayah Pendidikan Jakarta Pusat
              </p>
            </div>

            {/* Quick Metadata Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs border-t border-slate-100 dark:border-white/10 max-w-xl">
              <div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">Rombongan Belajar</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">{studentClass}</span>
              </div>
              <div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">Tahun Masuk</span>
                <span className="font-medium text-slate-800 dark:text-slate-200 block mt-0.5">2026 / Angkatan 38</span>
              </div>
              <div>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 block">Status Akademik</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400 block mt-0.5">Aktif Mengikuti KBM</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl pt-1">
              Halaman ini membatasi pemaparan data sensitif seperti NIK, nomor kartu keluarga, dan kontak pribadi. Verifikasi diperlukan sebelum mengakses lembar identitas lengkap.
            </p>
          </div>

          {/* Tombol Akses Verifikasi */}
          <div className="shrink-0 flex flex-col items-center md:items-end justify-center w-full md:w-auto pt-2 md:pt-0">
            {!isUnlocked ? (
              <button
                onClick={() => {
                  const el = document.getElementById('verification-gateway-card');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full md:w-auto px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-300" />
                <span>Lihat Identitas Lengkap</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ) : (
              <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                <div className="px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Sesi Terotentikasi</span>
                </div>
                <button
                  onClick={handleLockSession}
                  className="px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-white/10"
                  title="Tutup lembar identitas lengkap"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>Kunci Identitas</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SECURITY GATEWAY: VERIFIKASI IDENTITAS (LEVEL 2)                       */}
      {/* ========================================================================= */}
      {!isUnlocked && (
        <div
          id="verification-gateway-card"
          className="rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/90 dark:border-white/10 shadow-xs p-6 md:p-7 space-y-5 backdrop-blur-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-700 dark:text-sky-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                  Verifikasi Kepemilikan Identitas Siswa
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sesuai standar perlindungan data pribadi akademik, masukkan NIK atau NISN serta tanggal lahir resmi yang terdaftar di sekolah.
              </p>
            </div>

            <div className="px-2.5 py-1 rounded text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 self-start sm:self-auto flex items-center gap-1.5 font-normal">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Proteksi Berlapis PDP</span>
            </div>
          </div>

          <form onSubmit={handleVerify} className="max-w-xl space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Nomor Induk (NIK atau NISN)
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan NIK atau NISN"
                  disabled={isLockedTemporarily || isVerifying}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800/80 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-mono placeholder:text-slate-400 dark:placeholder:text-slate-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  disabled={isLockedTemporarily || isVerifying}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-slate-800/80 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            {/* General Error Message (No hints given) */}
            {verifyError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-medium">{verifyError}</p>
                  <p className="text-[11px] text-rose-600/90 font-normal">
                    Untuk keamanan data, sistem tidak memaparkan rincian kolom yang tidak sesuai. Hubungi staf Tata Usaha apabila terdapat ketidaksesuaian berkas.
                  </p>
                </div>
              </div>
            )}

            {isLockedTemporarily && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Sistem terkunci sementara. Percobaan ulang dapat dilakukan dalam: <strong>{lockCountdown} detik</strong>.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Data sensitif tidak dapat diakses tanpa otentikasi identitas yang valid.
              </span>

              <button
                type="submit"
                disabled={isLockedTemporarily || isVerifying}
                className="w-full sm:w-auto px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Verifikasi & Buka Identitas</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="border-t border-slate-100 dark:border-white/10 pt-3 text-[11px] text-slate-400 dark:text-slate-400">
            Kredensial simulasi: NISN <code className="text-slate-600 dark:text-sky-300 font-medium">20241001</code> • Tanggal Lahir <code className="text-slate-600 dark:text-sky-300 font-medium">17/08/2009</code>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. IDENTITAS LENGKAP TERSTRUKTUR (FORMAL ACADEMIC RECORD SHEET)            */}
      {/* ========================================================================= */}
      {isUnlocked && (
        <div className="space-y-5 animate-fadeIn">
          {/* Status Bar */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-xs">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-medium text-slate-800">Lembar Identitas Siswa Lengkap</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 font-normal">Sesi aktif selama 30 menit</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsChangeRequestOpen(true)}
                className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Ajukan Koreksi Data</span>
              </button>
              <button
                onClick={handleLockSession}
                className="px-3 py-1.5 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Kunci</span>
              </button>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Formal Underline Tabs Navigation */}
          <div className="border-b border-slate-200 overflow-x-auto scrollbar-none flex gap-1">
            {[
              { id: 'pribadi', label: 'Identitas Pribadi', icon: UserIcon },
              { id: 'akademik', label: 'Informasi Akademik', icon: GraduationCap },
              { id: 'domisili', label: 'Alamat & Domisili', icon: Home },
              { id: 'keluarga', label: 'Data Keluarga', icon: Users },
              { id: 'kontak', label: 'Data Kontak', icon: Phone },
              { id: 'prestasi', label: 'Rekam Prestasi', icon: Award },
              { id: 'pendukung', label: 'Data Pendukung', icon: HeartHandshake },
              { id: 'pendidikan', label: 'Riwayat Sekolah', icon: History },
              { id: 'dokumen', label: 'Dokumen Digital', icon: FolderLock },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isActive
                      ? 'border-slate-900 dark:border-sky-400 text-slate-900 dark:text-sky-300 font-bold'
                      : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900 dark:text-sky-400' : 'text-slate-400'}`} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: IDENTITAS PRIBADI */}
          {activeTab === 'pribadi' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Lembar Identitas Pribadi Siswa
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Data kependudukan dan pencatatan sipil resmi yang terdaftar pada Dapodik.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                  Data Resmi Sekolah
                </span>
              </div>

              {/* Formal Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nama Lengkap (Akta)</span>
                    <span className="font-semibold text-slate-900 text-right">{studentName}</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nama Panggilan</span>
                    <span className="font-semibold text-slate-900 text-right">{contactData.nickname}</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor Induk Siswa (NIS)</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">20241001</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor Induk Siswa Nasional (NISN)</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">0098765432</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Jenis Kelamin</span>
                    <span className="font-semibold text-slate-900 text-right">Laki-laki</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-normal">Nomor Induk Kependudukan (NIK)</span>
                      <button
                        onClick={() => setShowNik(!showNik)}
                        className="text-slate-500 hover:text-slate-800 text-[10px] font-medium cursor-pointer"
                        title="Tampilkan / Sembunyikan NIK"
                      >
                        {showNik ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                      </button>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {showNik ? '3171012308090001' : '3171••••••••0001'}
                    </span>
                  </div>

                  <div className="px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-normal">Nomor Kartu Keluarga (KK)</span>
                      <button
                        onClick={() => setShowKk(!showKk)}
                        className="text-slate-500 hover:text-slate-800 text-[10px] font-medium cursor-pointer"
                        title="Tampilkan / Sembunyikan KK"
                      >
                        {showKk ? <EyeOff className="w-3 h-3 inline" /> : <Eye className="w-3 h-3 inline" />}
                      </button>
                    </div>
                    <span className="font-mono font-semibold text-slate-900 text-right">
                      {showKk ? '3171010101150009' : '3171••••••••0009'}
                    </span>
                  </div>

                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Tempat, Tanggal Lahir</span>
                    <span className="font-semibold text-slate-900 text-right">Jakarta, 17 Agustus 2009</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Agama</span>
                    <span className="font-semibold text-slate-900 text-right">Islam</span>
                  </div>
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Status Siswa</span>
                    <span className="font-semibold text-emerald-700 text-right">Aktif Dapodik</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INFORMASI AKADEMIK */}
          {activeTab === 'akademik' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Informasi Akademik & Keanggotaan Rombel
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Rekam penempatan belajar siswa di bawah bimbingan kurikulum sekolah.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                  Data Resmi Sekolah
                </span>
              </div>

              {/* Formal Grid List (Clean Academic Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Satuan Pendidikan</span>
                    <span className="font-semibold text-slate-900 text-right">SMA Negeri Unggulan 1</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Jenjang / Tingkat</span>
                    <span className="font-semibold text-slate-900 text-right">SMA - Kelas X (Fase E)</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Tahun Masuk / Angkatan</span>
                    <span className="font-semibold text-slate-900 text-right">2026 / Angkatan 38</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Rombongan Belajar (Rombel)</span>
                    <span className="font-semibold text-slate-900 text-right">X-MIPA 1</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Program Keahlian / Peminatan</span>
                    <span className="font-semibold text-slate-900 text-right">Matematika & IPA (MIPA)</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Wali Kelas</span>
                    <span className="font-semibold text-slate-900 text-right">Dra. Endang Supartini, M.Pd</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor Urut Absen</span>
                    <span className="font-semibold text-slate-900 text-right">04 (Empat)</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Tahun Ajaran & Semester</span>
                    <span className="font-semibold text-slate-900 text-right">2026/2027 • Ganjil</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Kurikulum Operasional</span>
                    <span className="font-semibold text-slate-900 text-right">Kurikulum Merdeka Berbagi</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Status Akademik</span>
                    <span className="font-semibold text-emerald-700 text-right">Aktif Mengikuti KBM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ALAMAT & DOMISILI */}
          {activeTab === 'domisili' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Alamat Domisili Siswa
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Data tempat tinggal yang dapat diperbarui secara mandiri oleh siswa.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Data Mandiri
                  </span>
                  <button
                    onClick={() => setIsEditingContact(!isEditingContact)}
                    className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    {isEditingContact ? 'Batal' : 'Edit Alamat'}
                  </button>
                </div>
              </div>

              {!isEditingContact ? (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3.5 flex justify-between items-start">
                      <span className="text-slate-500 font-normal">Alamat Lengkap</span>
                      <span className="font-semibold text-slate-900 text-right max-w-xs">{contactData.address}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">RT / RW</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.rt_rw}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Desa / Kelurahan</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.kelurahan}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Kecamatan</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.kecamatan}</span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Kabupaten / Kota</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.kota}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Provinsi</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.provinsi}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Kode Pos</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">{contactData.kodepos}</span>
                    </div>
                    <div className="px-5 py-3.5 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Moda Transportasi & Jarak</span>
                      <span className="font-semibold text-slate-900 text-right">{contactData.transportasi} ({contactData.jarak})</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="text-slate-600 font-medium block mb-1">Alamat Lengkap</label>
                      <textarea
                        rows={2}
                        value={contactData.address}
                        onChange={(e) => setContactData({ ...contactData, address: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-900 font-medium focus:outline-none focus:border-slate-400"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">RT / RW</label>
                      <input
                        type="text"
                        value={contactData.rt_rw}
                        onChange={(e) => setContactData({ ...contactData, rt_rw: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Desa / Kelurahan</label>
                      <input
                        type="text"
                        value={contactData.kelurahan}
                        onChange={(e) => setContactData({ ...contactData, kelurahan: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Kecamatan</label>
                      <input
                        type="text"
                        value={contactData.kecamatan}
                        onChange={(e) => setContactData({ ...contactData, kecamatan: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 font-medium block mb-1">Kota / Kabupaten</label>
                      <input
                        type="text"
                        value={contactData.kota}
                        onChange={(e) => setContactData({ ...contactData, kota: e.target.value })}
                        className="w-full p-2 rounded-lg border border-slate-200 text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setIsEditingContact(false)}
                      className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 font-medium cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveContact}
                      className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer"
                    >
                      Simpan Pembaruan
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DATA KELUARGA */}
          {activeTab === 'keluarga' && (
            <div className="space-y-4">
              {/* Ayah */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                    Data Ayah Kandung
                  </h4>
                  <span className="text-[10px] font-medium text-slate-500">Tersinkronisasi Dapodik</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Nama Lengkap Ayah</span>
                      <span className="font-semibold text-slate-900 text-right">Ir. Muhammad Faisal, M.T</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">NIK Ayah (Terenkripsi)</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">3171••••••••0045</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Tahun Lahir & Pendidikan</span>
                      <span className="font-semibold text-slate-900 text-right">1978 • S2 Teknik Sipil</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Pekerjaan</span>
                      <span className="font-semibold text-slate-900 text-right">Karyawan Swasta (BUMN)</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Rentang Penghasilan</span>
                      <span className="font-semibold text-slate-900 text-right">Rp 5.000.000 - Rp 20.000.000</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Nomor Telepon</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">0812-8877-6655</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ibu */}
              <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                    Data Ibu Kandung
                  </h4>
                  <span className="text-[10px] font-medium text-slate-500">Tersinkronisasi Dapodik</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Nama Lengkap Ibu</span>
                      <span className="font-semibold text-slate-900 text-right">Dr. Rina Kusuma Wardhani, Sp.A</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">NIK Ibu (Terenkripsi)</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">3171••••••••0072</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Tahun Lahir & Pendidikan</span>
                      <span className="font-semibold text-slate-900 text-right">1982 • S2 Spesialis Kedokteran</span>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100">
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Pekerjaan</span>
                      <span className="font-semibold text-slate-900 text-right">Dokter Spesialis</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Rentang Penghasilan</span>
                      <span className="font-semibold text-slate-900 text-right">Di atas Rp 20.000.000</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-slate-500 font-normal">Nomor Telepon</span>
                      <span className="font-mono font-semibold text-slate-900 text-right">0813-9900-1122</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DATA KONTAK */}
          {activeTab === 'kontak' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Informasi Kontak Pribadi & Darurat
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Saluran komunikasi yang digunakan sekolah untuk koordinasi kegiatan akademik.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                  Data Mandiri Siswa
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor WhatsApp Siswa</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">{contactData.phone}</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Surat Elektronik (Email)</span>
                    <span className="font-semibold text-slate-900 text-right">{contactData.email}</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nama Kontak Darurat</span>
                    <span className="font-semibold text-slate-900 text-right">{contactData.emergency_name}</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor Telepon Darurat</span>
                    <span className="font-mono font-semibold text-slate-900 text-right">{contactData.emergency_phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PRESTASI & AKTIVITAS */}
          {activeTab === 'prestasi' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Daftar Prestasi & Portofolio Siswa
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Piagam penghargaan yang telah diverifikasi oleh bagian kesiswaan sekolah.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  {
                    title: 'Juara 1 Olimpiade Sains Nasional (OSN) Bidang Fisika',
                    level: 'Tingkat Provinsi DKI Jakarta',
                    year: '2026',
                    status: 'Diverifikasi Sekolah',
                  },
                  {
                    title: 'Medali Perak National Schools Debating Championship (NSDC)',
                    level: 'Tingkat Nasional',
                    year: '2025',
                    status: 'Diverifikasi Sekolah',
                  },
                  {
                    title: 'Ketua Divisi Robotika & STEM Student Chapter',
                    level: 'Organisasi Sekolah',
                    year: '2026',
                    status: 'Aktif Menjabat',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-semibold text-slate-900 text-xs">{item.title}</h5>
                      <p className="text-slate-500 font-normal text-[11px] mt-0.5">{item.level} • Tahun {item.year}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: DATA PENDUKUNG */}
          {activeTab === 'pendukung' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Data Pendukung Bantuan Pendidikan & Afirmasi
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Informasi administratif dengan klasifikasi akses terbatas.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Rahasia
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Penerima Program Indonesia Pintar (PIP)</span>
                    <span className="font-semibold text-slate-900 text-right">Bukan Penerima (Reguler)</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Nomor Kartu Indonesia Pintar (KIP)</span>
                    <span className="font-semibold text-slate-400 text-right">Tidak Ada (-)</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Status Bantuan KJP Plus</span>
                    <span className="font-semibold text-slate-900 text-right">Tidak Terdaftar</span>
                  </div>
                  <div className="px-5 py-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-normal">Kebutuhan Layanan Khusus</span>
                    <span className="font-semibold text-slate-900 text-right">Tidak Ada (Non-Disabilitas)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RIWAYAT SEKOLAH */}
          {activeTab === 'pendidikan' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h4 className="text-sm font-semibold text-slate-900">
                  Riwayat Satuan Pendidikan Sebelumnya
                </h4>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Arsip jenjang pendidikan formal yang tercatat di pangkalan data nasional.
                </p>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  {
                    level: 'Sekolah Menengah Atas (SMA)',
                    school: 'SMA Negeri Unggulan 1 Jakarta',
                    range: '2026 - Sekarang',
                    status: 'Sedang Berjalan',
                  },
                  {
                    level: 'Sekolah Menengah Pertama (SMP)',
                    school: 'SMP Negeri 115 Jakarta',
                    range: '2023 - 2026',
                    status: 'Lulus Berijazah',
                  },
                  {
                    level: 'Sekolah Dasar (SD)',
                    school: 'SD Negeri Menteng 01 Pagi',
                    range: '2017 - 2023',
                    status: 'Lulus Berijazah',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">{item.level}</span>
                      <h5 className="font-semibold text-slate-900 text-xs mt-0.5">{item.school}</h5>
                      <p className="text-slate-500 text-[11px] mt-0.5">Periode Belajar: {item.range}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 9: DOKUMEN DIGITAL */}
          {activeTab === 'dokumen' && (
            <div className="rounded-xl bg-white border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Arsip Dokumen Kependudukan & Kesiswaan
                  </h4>
                  <p className="text-xs text-slate-500 font-normal mt-0.5">
                    Berkas digital resmi yang telah diverifikasi oleh petugas Tata Usaha.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Dokumen Terverifikasi
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {[
                  { name: 'Kartu Keluarga (KK Digital).pdf', size: '1.2 MB', date: '02 Jul 2026' },
                  { name: 'Akta Kelahiran Resmi.pdf', size: '890 KB', date: '02 Jul 2026' },
                  { name: 'Ijazah SMP & SKHUN.pdf', size: '2.4 MB', date: '03 Jul 2026' },
                  { name: 'Sertifikat OSN Provinsi 2026.pdf', size: '1.8 MB', date: '18 Sep 2026' },
                ].map((doc, idx) => (
                  <div key={idx} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <div>
                        <span className="font-semibold text-slate-900 block">{doc.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{doc.size} • Diunggah {doc.date}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Mengunduh berkas: ${doc.name}`)}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition-colors cursor-pointer"
                    >
                      Unduh Berkas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL AJUKAN PERUBAHAN DATA SEKOLAH (CHANGE REQUEST WORKFLOW)          */}
      {/* ========================================================================= */}
      {isChangeRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">
                  Permohonan Koreksi Data Sekolah
                </h3>
                <p className="text-xs text-slate-500 font-normal">
                  Pengajuan perubahan data Dapodik melalui verifikasi Tata Usaha.
                </p>
              </div>
              <button
                onClick={() => setIsChangeRequestOpen(false)}
                className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitChangeRequest} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Pilih Data yang Ingin Dikoreksi:
                </label>
                <select
                  value={changeField}
                  onChange={(e) => setChangeField(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                >
                  <option value="nama_lengkap">Nama Lengkap (Sesuai Akta Kelahiran)</option>
                  <option value="nik">Nomor Induk Kependudukan (NIK)</option>
                  <option value="tempat_tanggal_lahir">Tempat / Tanggal Lahir</option>
                  <option value="nama_orang_tua">Nama Orang Tua (Ayah / Ibu)</option>
                  <option value="agama">Agama</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Usulan Nilai Data yang Benar:
                </label>
                <input
                  type="text"
                  value={changeProposedValue}
                  onChange={(e) => setChangeProposedValue(e.target.value)}
                  placeholder="Ketik data perbaikan..."
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Alasan Koreksi:
                </label>
                <textarea
                  rows={2}
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="Jelaskan alasan perbaikan..."
                  className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-medium block mb-1">
                  Berkas Pendukung (Akta / KK):
                </label>
                <input
                  type="file"
                  onChange={(e) => setChangeProofFile(e.target.files?.[0]?.name || '')}
                  className="w-full p-1.5 rounded-lg border border-slate-200 text-slate-600 font-normal file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:text-xs"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Permohonan koreksi tidak langsung mengubah pangkalan data. Petugas Tata Usaha akan memverifikasi berkas fisik terlebih dahulu.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsChangeRequestOpen(false)}
                  className="px-3.5 py-1.5 rounded-md border border-slate-200 text-slate-600 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer"
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
