'use client';

import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, Users, Sparkles } from 'lucide-react';
import { ROLE_CONFIGS, RoleType, getAllowedRolesForTab } from '@/lib/rbac';

interface AccessDeniedViewProps {
  currentRole: string;
  attemptedTab: string;
  onGoHome: () => void;
  onSwitchRole?: (role: string) => void;
}

const TAB_NAMES: Record<string, string> = {
  catalog: 'Katalog 58 Modul',
  journey: 'Alur Akademik',
  cbt: 'Ujian CBT & Asesmen Digital',
  gradebook: 'Gradebook Sentral & E-Rapor',
  'walikelas-bk': 'Wali Kelas, BK & Siswa Berisiko',
  schedule: 'Jadwal Pelajaran & Sesi KBM',
  'school-tu': 'Tata Usaha, Sekolah & Multi-Tenancy',
  parent: 'Portal Orang Tua / Wali Murid',
  'ai-analytics': 'AI School Assistant & Analitik Kepsek',
  classes: 'Rombel Kelas',
  subjects: 'Mata Pelajaran',
  assignments: 'Tugas Mandiri',
  grades: 'Rekap Nilai Siswa',
  attendance: 'Presensi Siswa & Guru',
  'space-belajar': 'Space Belajar Mandiri',
};

export default function AccessDeniedView({
  currentRole,
  attemptedTab,
  onGoHome,
  onSwitchRole,
}: AccessDeniedViewProps) {
  const normRole = (currentRole || 'murid').toLowerCase() as RoleType;
  const currentRoleConfig = ROLE_CONFIGS[normRole] || ROLE_CONFIGS.murid;
  const allowedRoles = getAllowedRolesForTab(attemptedTab);
  const tabName = TAB_NAMES[attemptedTab] || attemptedTab;

  return (
    <div className="w-full max-w-3xl mx-auto py-12 px-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white rounded-3xl p-8 border border-rose-100 shadow-xl flex flex-col items-center text-center">
        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold mb-3">
          <Lock className="w-3.5 h-3.5" />
          <span>Akses Terbatas: Role Based Access Control (RBAC)</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
          Peran Anda Tidak Memiliki Hak Akses
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-slate-500 max-w-lg mt-2 leading-relaxed">
          Fitur <strong className="text-slate-800 font-bold">&quot;{tabName}&quot;</strong> diproteksi secara khusus dan tidak tersedia untuk peran{' '}
          <span className="font-bold text-rose-600 underline underline-offset-2">
            {currentRoleConfig.label}
          </span>
          .
        </p>

        {/* Detail Matrix Box */}
        <div className="w-full mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-500">Peran Anda Saat Ini:</span>
            <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs">
              {currentRoleConfig.label}
            </span>
          </div>

          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Peran Yang Diizinkan Mengakses Fitur Ini:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allowedRoles.map((r, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold"
                >
                  ✓ {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Dashboard Utama Anda</span>
          </button>

          {onSwitchRole && allowedRoles.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">atau uji coba sebagai:</span>
              <button
                onClick={() => {
                  // Switch to the first authorized role for easy testing
                  const targetRole = Object.keys(ROLE_CONFIGS).find(
                    (k) => ROLE_CONFIGS[k as RoleType].label === allowedRoles[0]
                  );
                  if (targetRole) onSwitchRole(targetRole);
                }}
                className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
              >
                Ganti ke {allowedRoles[0]} →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
