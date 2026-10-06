'use client';

import React, { useState } from 'react';
import {
  Building2,
  Users,
  ShieldCheck,
  FileSpreadsheet,
  History,
  Sparkles,
  Upload,
  Download,
  KeyRound,
  Check,
  ChevronDown,
} from 'lucide-react';

export default function SchoolMasterView() {
  const [activeTab, setActiveTab] = useState<'profile' | 'roles' | 'excel' | 'audit'>('profile');
  const [currentTenant, setCurrentTenant] = useState('SMA Negeri Unggulan 1 (Tenant ID: 1)');

  const rolesList = [
    { name: 'Super Admin', desc: 'Pemilik platform multi-sekolah dengan akses tingkat sistem', usersCount: 2 },
    { name: 'Principal / Kepala Sekolah', desc: 'Akses dasbor strategis, analitik capaian, dan approval rapor', usersCount: 1 },
    { name: 'School Admin / Operator', desc: 'Pengelolaan master data akademik, jadwal, dan import Excel', usersCount: 3 },
    { name: 'Teacher / Guru', desc: 'Pengelolaan KBM, materi, tugas, CBT, dan pengisian nilai', usersCount: 42 },
    { name: 'Homeroom / Wali Kelas', desc: 'Monitoring rombel, catatan pembinaan, dan penerbitan rapor', usersCount: 14 },
    { name: 'BK / Konselor', desc: 'Pengelolaan kasus bimbingan konseling privat & deteksi dini', usersCount: 4 },
    { name: 'TU / Tata Usaha', desc: 'Administrasi siswa, arsip surat resmi, dan mutasi', usersCount: 5 },
    { name: 'Student / Siswa', desc: 'Akses pembelajaran, pengumpulan tugas, kuis CBT, dan nilai', usersCount: 480 },
    { name: 'Parent / Orang Tua', desc: 'Pemantauan presensi harian, nilai anak, dan pengumuman', usersCount: 450 },
  ];

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur 1, 2, 32, 45 & 51: Tata Usaha, Multi-Tenancy & Audit Log</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Manajemen Sekolah, Hak Akses & Tata Usaha</h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi identitas NPSN, isolasi tenant antar-sekolah, manajemen 9 role pengguna, dan audit jejak digital.
          </p>
        </div>

        {/* Tenant Switcher simulation */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl">
          <Building2 className="w-4 h-4 text-slate-500 ml-1" />
          <select
            value={currentTenant}
            onChange={(e) => setCurrentTenant(e.target.value)}
            className="text-xs font-bold bg-white text-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 cursor-pointer shadow-xs"
          >
            <option>SMA Negeri Unggulan 1 (Tenant ID: 1)</option>
            <option>SMK Teknologi Nusantara (Tenant ID: 2)</option>
            <option>SMP Bintang Kejora (Tenant ID: 3)</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white/80 p-2 rounded-2xl border border-white shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Profil Sekolah & NPSN
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'roles' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Manajemen 9 Role & Permission
        </button>
        <button
          onClick={() => setActiveTab('excel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'excel' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pusat Import & Export Excel
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'audit' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Audit Log Aktivitas Sistem
        </button>
      </div>

      {/* 1. PROFIL SEKOLAH */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Identitas & Akreditasi Lembaga</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  readOnly
                  value="SMA Negeri Unggulan Teladan Jakarta"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">NPSN</label>
                  <input
                    type="text"
                    readOnly
                    value="20109988"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status Akreditasi</label>
                  <input
                    type="text"
                    readOnly
                    value="A (Unggul - Nilai 96)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-emerald-700"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Kepala Sekolah</label>
                <input
                  type="text"
                  readOnly
                  value="Dr. H. Sulaiman, M.Si (NIP: 197405121998031002)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900">Pengaturan Sistem & Branding</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tahun Ajaran & Semester Aktif</label>
                <input
                  type="text"
                  readOnly
                  value="2026/2027 • Semester Ganjil"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-indigo-700"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Zona Waktu Sekolah</label>
                <input
                  type="text"
                  readOnly
                  value="Asia/Jakarta (WIB • UTC+7)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Status Multi-Tenancy Scope</label>
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold">
                  ✓ Database Global Scoping Aktif: Seluruh query otomatis terisolasi dengan school_id = 1.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ROLE & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rolesList.map((r, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Spatie RBAC
                  </span>
                  <span className="text-xs font-bold text-indigo-600">{r.usersCount} Akun</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span>Hak Akses Penuh</span>
                <button className="font-bold text-slate-900 hover:underline cursor-pointer">Edit Matrix &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. EXCEL IMPORT / EXPORT */}
      {activeTab === 'excel' && (
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Import Data Massal Excel (.xlsx / .csv)</h4>
            <p className="text-xs text-slate-500 max-w-sm">
              Mendukung import otomatis data Siswa, Guru, Mata Pelajaran, Rombel, dan Penugasan Mengajar.
            </p>
            <div className="flex gap-2 mt-2">
              <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                Unduh Template Excel
              </button>
              <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">
                Pilih Berkas Excel
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 flex flex-col justify-between gap-4">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Download className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Ekspor Laporan Master Sekolah</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Unduh rekapitulasi data lengkap sekolah dalam format Excel terstruktur untuk laporan Dapodik & Dinas Pendidikan.
              </p>
            </div>

            <div className="space-y-2">
              {['Ekspor Data Induk Siswa Aktif', 'Ekspor Daftar Guru & GTK', 'Ekspor Buku Nilai & Ledger Rapor'].map((item, i) => (
                <button
                  key={i}
                  className="w-full px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between cursor-pointer"
                >
                  <span>{item}</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catatan Jejak Digital (System Audit Trail)</h3>
              <p className="text-xs text-slate-500">Merekam setiap pembaruan nilai, presensi, login, dan modifikasi data penting.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Real-time Logging Aktif
            </span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">User Pelaksana</th>
                <th className="pb-3">Aksi</th>
                <th className="pb-3">Entitas</th>
                <th className="pb-3">Detail Perubahan</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 text-right">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { user: 'Budi Santoso, M.Pd (Guru)', action: 'UPDATE_GRADE', entity: 'Tabel Nilai #45', detail: 'Mengubah nilai UTS Ahmad Siswa (82 -> 85)', ip: '192.168.1.104', time: '01 Okt 2026, 14:10' },
                { user: 'Administrator (Admin)', action: 'TIMETABLE_GENERATE', entity: 'Jadwal 12-IPA 1', detail: 'Menyimpan jadwal semester ganjil', ip: '127.0.0.1', time: '01 Okt 2026, 13:45' },
                { user: 'Ustadz Ahmad (Guru)', action: 'ATTENDANCE_CORRECT', entity: 'Presensi 12-IPA 1', detail: 'Mengoreksi status Rian Pratama (A -> S)', ip: '192.168.1.112', time: '01 Okt 2026, 11:20' },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3 font-bold text-slate-900">{log.user}</td>
                  <td className="py-3 font-mono text-[10px] text-indigo-700 font-bold">{log.action}</td>
                  <td className="py-3 text-slate-600">{log.entity}</td>
                  <td className="py-3 text-slate-800">{log.detail}</td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">{log.ip}</td>
                  <td className="py-3 text-right text-slate-500">{log.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
