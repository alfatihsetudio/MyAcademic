'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
  ShieldCheck,
  HeartHandshake,
  FileSpreadsheet,
  Home,
  Crown,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  Zap,
  Fingerprint,
} from 'lucide-react';
import { loginWithBiometrics } from '@/lib/webauthn';

interface DemoRole {
  id: string;
  label: string;
  email: string;
  password: string;
  badge: string;
  portalName: string;
  icon: React.ElementType;
  theme: {
    border: string;
    bgHover: string;
    text: string;
    iconBg: string;
    iconText: string;
    tagBg: string;
  };
}

const DEMO_ROLES: DemoRole[] = [
  {
    id: 'murid',
    label: 'Siswa / Murid',
    email: 'murid@gmail.com',
    password: 'admin123',
    badge: '36 Fitur',
    portalName: 'Portal Siswa',
    icon: GraduationCap,
    theme: {
      border: 'hover:border-emerald-400 border-slate-200',
      bgHover: 'hover:bg-emerald-50/60',
      text: 'group-hover:text-emerald-700 text-slate-800',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconText: 'text-emerald-700',
      tagBg: 'bg-emerald-100/80 text-emerald-800',
    },
  },
  {
    id: 'guru',
    label: 'Guru Pengampu',
    email: 'guru@gmail.com',
    password: 'admin123',
    badge: '38 Fitur',
    portalName: 'Portal Guru',
    icon: BookOpen,
    theme: {
      border: 'hover:border-blue-400 border-slate-200',
      bgHover: 'hover:bg-blue-50/60',
      text: 'group-hover:text-blue-700 text-slate-800',
      iconBg: 'bg-blue-100 text-blue-700',
      iconText: 'text-blue-700',
      tagBg: 'bg-blue-100/80 text-blue-800',
    },
  },
  {
    id: 'walikelas',
    label: 'Wali Kelas',
    email: 'walikelas@gmail.com',
    password: 'admin123',
    badge: '42 Fitur',
    portalName: 'Portal Asuhan',
    icon: Users,
    theme: {
      border: 'hover:border-purple-400 border-slate-200',
      bgHover: 'hover:bg-purple-50/60',
      text: 'group-hover:text-purple-700 text-slate-800',
      iconBg: 'bg-purple-100 text-purple-700',
      iconText: 'text-purple-700',
      tagBg: 'bg-purple-100/80 text-purple-800',
    },
  },
  {
    id: 'kepsek',
    label: 'Kepala Sekolah',
    email: 'kepsek@gmail.com',
    password: 'admin123',
    badge: '33 Fitur',
    portalName: 'Portal Eksekutif',
    icon: Award,
    theme: {
      border: 'hover:border-amber-400 border-slate-200',
      bgHover: 'hover:bg-amber-50/60',
      text: 'group-hover:text-amber-700 text-slate-800',
      iconBg: 'bg-amber-100 text-amber-700',
      iconText: 'text-amber-700',
      tagBg: 'bg-amber-100/80 text-amber-800',
    },
  },
  {
    id: 'admin',
    label: 'Admin Sekolah',
    email: 'admin@gmail.com',
    password: 'admin123',
    badge: '49 Fitur',
    portalName: 'Master Suite',
    icon: ShieldCheck,
    theme: {
      border: 'hover:border-indigo-400 border-slate-200',
      bgHover: 'hover:bg-indigo-50/60',
      text: 'group-hover:text-indigo-700 text-slate-800',
      iconBg: 'bg-indigo-100 text-indigo-700',
      iconText: 'text-indigo-700',
      tagBg: 'bg-indigo-100/80 text-indigo-800',
    },
  },
  {
    id: 'parent',
    label: 'Orang Tua / Wali',
    email: 'parent@gmail.com',
    password: 'admin123',
    badge: '36 Fitur',
    portalName: 'Portal Monitoring',
    icon: Home,
    theme: {
      border: 'hover:border-pink-400 border-slate-200',
      bgHover: 'hover:bg-pink-50/60',
      text: 'group-hover:text-pink-700 text-slate-800',
      iconBg: 'bg-pink-100 text-pink-700',
      iconText: 'text-pink-700',
      tagBg: 'bg-pink-100/80 text-pink-800',
    },
  },
  {
    id: 'bk',
    label: 'Konselor BK',
    email: 'bk@gmail.com',
    password: 'admin123',
    badge: '46 Fitur',
    portalName: 'Portal Konseling',
    icon: HeartHandshake,
    theme: {
      border: 'hover:border-teal-400 border-slate-200',
      bgHover: 'hover:bg-teal-50/60',
      text: 'group-hover:text-teal-700 text-slate-800',
      iconBg: 'bg-teal-100 text-teal-700',
      iconText: 'text-teal-700',
      tagBg: 'bg-teal-100/80 text-teal-800',
    },
  },
  {
    id: 'tu',
    label: 'Tata Usaha (TU)',
    email: 'tu@gmail.com',
    password: 'admin123',
    badge: '34 Fitur',
    portalName: 'Administrasi',
    icon: FileSpreadsheet,
    theme: {
      border: 'hover:border-cyan-400 border-slate-200',
      bgHover: 'hover:bg-cyan-50/60',
      text: 'group-hover:text-cyan-700 text-slate-800',
      iconBg: 'bg-cyan-100 text-cyan-700',
      iconText: 'text-cyan-700',
      tagBg: 'bg-cyan-100/80 text-cyan-800',
    },
  },
  {
    id: 'superadmin',
    label: 'Super Admin',
    email: 'superadmin@gmail.com',
    password: 'admin123',
    badge: '82 Fitur',
    portalName: 'Control Tower',
    icon: Crown,
    theme: {
      border: 'hover:border-rose-400 border-slate-200',
      bgHover: 'hover:bg-rose-50/60',
      text: 'group-hover:text-rose-700 text-slate-800',
      iconBg: 'bg-rose-100 text-rose-700',
      iconText: 'text-rose-700',
      tagBg: 'bg-rose-100/80 text-rose-800',
    },
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryNewPwd, setRecoveryNewPwd] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const router = useRouter();

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setError('');
    try {
      const res = await loginWithBiometrics(email);
      if (res.success) {
        toast.success(res.message || 'Login sidik jari berhasil!');
        router.push('/');
      } else {
        setError(res.message || 'Login sidik jari gagal.');
        setBiometricLoading(false);
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal memverifikasi sidik jari.';
      setError(msg);
      setBiometricLoading(false);
    }
  };

  const executeAuth = async (targetEmail: string, targetPassword: string, roleLabel?: string) => {
    setLoading(true);
    setError('');
    if (roleLabel) {
      setActiveRoleLoggingIn(roleLabel);
    }

    try {
      const res = await loginUser(targetEmail, targetPassword);
      if (res.success) {
        router.push('/');
      } else {
        setError(res.message || 'Login gagal.');
        setLoading(false);
        setActiveRoleLoggingIn(null);
      }
    } catch (err: any) {
      const msg = 'Terjadi kendala saat menghubungi server.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
      setActiveRoleLoggingIn(null);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeAuth(email, password);
  };

  const handleRoleQuickLogin = (role: DemoRole) => {
    setEmail(role.email);
    setPassword(role.password);
    executeAuth(role.email, role.password, role.label);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#dde4ed] p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 w-full max-w-5xl overflow-hidden transition-all">
        {/* Top Developer Bar Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-2.5 text-white flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[11px]">
              <Zap className="w-3 h-3 text-amber-300" />
              Dev Environment
            </span>
            <span className="text-blue-100 hidden sm:inline">
              Fitur Cepat Pindah Role Aktif (Otentikasi Normal via API, Tanpa Bypass)
            </span>
          </div>
          <div className="flex items-center gap-1 text-blue-200 text-xs">
            <Lock className="w-3.5 h-3.5 opacity-80" />
            <span>Password Default: <strong className="text-white font-mono">admin123</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Form Login Standar */}
          <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 bg-white">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Login MyAcademic</h1>
                  <p className="text-xs text-slate-500">Sistem Informasi Akademik & Portal Sekolah</p>
                </div>
              </div>

              <div className="my-6 border-t border-slate-100" />

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2 animate-in fade-in">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {activeRoleLoggingIn && (
                <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Mengautentikasi akun <strong>{activeRoleLoggingIn}</strong>...</span>
                </div>
              )}

              <form onSubmit={handleManualLogin} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Username atau Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="username_siswa atau email@sekolah.sch.id"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Kata Sandi (Password)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline cursor-pointer"
                    >
                      Lupa Kata Sandi?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition font-mono"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 bg-blue-600 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-700 active:scale-[0.99] transition shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading && !activeRoleLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sedang Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBiometricLogin}
                  disabled={biometricLoading || loading}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:via-teal-700 hover:to-emerald-800 text-white rounded-xl py-2.5 font-semibold text-sm transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {biometricLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menunggu Scan Sidik Jari...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4 text-emerald-100" />
                      <span>Masuk dengan Sidik Jari / Passkey</span>
                    </>
                  )}
                </button>

                <div className="relative my-2 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Atau Login Alternatif
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    executeAuth('murid@gmail.com', 'admin123', 'Login dengan Google');
                  }}
                  className="w-full border border-slate-200 hover:bg-slate-50 rounded-xl py-2.5 font-semibold text-xs text-slate-700 flex items-center justify-center gap-2.5 transition cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Masuk dengan Google (Akun Tertaut)</span>
                </button>
              </form>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} MyAcademic System • Mode Pengembangan
            </div>
          </div>

          {/* Right Column: Interactive Role Selector (Khusus Masa Dev) */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/70 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-800">Pilih Role untuk Login Otomatis</h2>
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/60">
                  Dev Shortcut
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Klik salah satu tombol peran di bawah. Sistem otomatis mengisikan kredensial dan melakukan proses autentikasi resmi (Sanctum Token) tanpa perlu mengetik manual.
              </p>

              {/* Roles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DEMO_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isCurrentRoleLogging = activeRoleLoggingIn === role.label;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      disabled={loading}
                      onClick={() => handleRoleQuickLogin(role)}
                      className={`group relative text-left p-3 rounded-xl border bg-white shadow-xs transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${role.theme.border} ${role.theme.bgHover} hover:shadow-md hover:-translate-y-0.5`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${role.theme.iconBg}`}>
                          {isCurrentRoleLogging ? (
                            <Loader2 className="w-4 h-4 animate-spin text-current" />
                          ) : (
                            <Icon className="w-4 h-4" />
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${role.theme.tagBg}`}>
                          {role.badge}
                        </span>
                      </div>

                      <div className="font-semibold text-xs text-slate-800 group-hover:text-slate-900 leading-snug">
                        {role.label}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5 group-hover:text-slate-600">
                        {role.email}
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-slate-600">
                        <span>{role.portalName}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note box */}
            <div className="mt-5 p-3 rounded-xl bg-white border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-700">Bukan Bypass Auth:</span> Setiap tombol mengirim request login formal ke backend API (<code className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-800">/api/v1/login</code>) dan menghasilkan Bearer Token Sanctum yang valid serta mengarahkan ke portal dashboard masing-masing.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PEMULIHAN KATA SANDI (FORGOT PASSWORD) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setRecoveryStep('request');
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              ✕
            </button>

            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Pemulihan Kata Sandi Siswa
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Mekanisme recovery resmi MyAcademic sesuai status tautan akun Anda.
            </p>

            {recoveryStep === 'request' ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Masukkan Username atau Email Anda
                  </label>
                  <input
                    type="text"
                    value={recoveryIdentifier}
                    onChange={(e) => setRecoveryIdentifier(e.target.value)}
                    placeholder="Contoh: ahmad_siswa atau siswa@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 space-y-1">
                  <p className="font-bold">⚠️ Perhatian Kebijakan Keamanan:</p>
                  <p>• Jika Anda sudah menautkan email/Google: Kode verifikasi reset akan dikirimkan langsung.</p>
                  <p>• Jika belum menautkan email: Anda harus menghubungi <strong>Admin Sekolah</strong> untuk verifikasi data (NISN, Tanggal Lahir, Nama Ibu).</p>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={recoveryLoading || !recoveryIdentifier}
                    onClick={async () => {
                      setRecoveryLoading(true);
                      try {
                        const res = await (await import('@/lib/api')).requestStudentPasswordRecovery(recoveryIdentifier);
                        if (res.can_self_recover) {
                          toast.success(res.message);
                          if (res.demo_token) setRecoveryCode(res.demo_token);
                          setRecoveryStep('reset');
                        } else {
                          toast.error(res.message, { duration: 6000 });
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Akun tidak ditemukan atau hubungi Admin Sekolah', { duration: 6000 });
                      } finally {
                        setRecoveryLoading(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Memeriksa...' : 'Lanjutkan Verifikasi'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800">
                  Kode verifikasi telah dikirimkan ke email Anda. Masukkan kode dan buat kata sandi baru.
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kode Token Verifikasi</label>
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    placeholder="Contoh: X8A92K"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    value={recoveryNewPwd}
                    onChange={(e) => setRecoveryNewPwd(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep('request')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="button"
                    disabled={recoveryLoading || !recoveryCode || !recoveryNewPwd}
                    onClick={async () => {
                      setRecoveryLoading(true);
                      try {
                        const res = await (await import('@/lib/api')).resetPasswordWithToken({
                          email: recoveryIdentifier,
                          token: recoveryCode,
                          new_password: recoveryNewPwd,
                          new_password_confirmation: recoveryNewPwd,
                        });
                        if (res.success) {
                          toast.success(res.message);
                          setShowForgotModal(false);
                          setRecoveryStep('request');
                        }
                      } catch (err: any) {
                        toast.error(err.response?.data?.message || 'Kode token tidak valid atau sudah kadaluarsa');
                      } finally {
                        setRecoveryLoading(false);
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                  >
                    {recoveryLoading ? 'Menyimpan...' : 'Simpan Sandi Baru'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
