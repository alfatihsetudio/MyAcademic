'use client';

import React from 'react';
import {
  Check,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Plus,
  Upload,
  User as UserIcon,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MemberAvatar, WorkflowStage } from '@/lib/types';

interface AcademicJourneyProps {
  members: MemberAvatar[];
  stages: WorkflowStage[];
  onSelectAction: (actionKey: string) => void;
}

export default function AcademicJourney({
  members,
  stages,
  onSelectAction,
}: AcademicJourneyProps) {
  // Preset demo avatars if empty
  const avatarList = members.length > 0 ? members : [
    { id: 1, name: 'Budi Santoso', role: 'Wali Kelas', badge: 2, color: '#3b82f6' },
    { id: 2, name: 'Siti Aminah', role: 'Guru', badge: 3, color: '#ec4899' },
    { id: 3, name: 'Ahmad Siswa', role: 'KM', badge: 2, color: '#10b981' },
    { id: 4, name: 'Nadia Az-Zahra', role: 'Siswa', badge: 1, color: '#f59e0b' },
    { id: 5, name: 'Farhan Maulana', role: 'Siswa', badge: 1, color: '#8b5cf6' },
    { id: 6, name: 'Aisyah Putri', role: 'Siswa', badge: 1, color: '#06b6d4' },
    { id: 7, name: 'Dewi Lestari', role: 'Guru', badge: 4, color: '#6366f1' },
  ];

  return (
    <section className="w-full">
      {/* Top Main Heading & Member Avatars Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
            Academic Journeys
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Peta alur kurikulum, penugasan berjalan, dan siklus pembelajaran terpadu
          </p>
        </div>

        {/* Member Avatars Row with Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {avatarList.map((m, idx) => (
            <div key={m.id || idx} className="flex flex-col items-center group cursor-pointer">
              <div
                className="w-9 h-9 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-110"
                style={{ backgroundColor: m.color || '#3b82f6' }}
                title={`${m.name} (${m.role})`}
              >
                {m.name.charAt(0)}
              </div>
              <span
                className="text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full -mt-2 shadow-xs"
                style={{ backgroundColor: m.color || '#3b82f6' }}
              >
                {m.badge}
              </span>
            </div>
          ))}

          {/* Plus Add Button */}
          <button className="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all hover:scale-105 ml-1 cursor-pointer">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Big Workflow Canvas Container (Neumorphic Card) */}
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)] relative">
        {/* Container Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Alur Pembelajaran & Evaluasi
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
              <Sparkles className="w-3 h-3 text-emerald-600" /> Aktif
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
              <Plus className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all cursor-pointer">
              <CalendarIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Pipeline Stages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch relative">
          {/* ================= STAGE 1: Alokasi & Orientasi ================= */}
          <div className="flex flex-col">
            <div className="flex-1 bg-white rounded-3xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-around gap-4 min-h-[300px]">
              {/* Item 1 */}
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold ring-2 ring-blue-50">
                    BK
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">Alokasi Kelas X-IPA 1</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Wali: Budi Santoso, M.Pd</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="h-[1px] bg-slate-100 w-full" />

              {/* Item 2 */}
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold ring-2 ring-emerald-50">
                    KM
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 leading-tight">Struktur Pengurus & KM</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">KM: Ahmad Siswa (Aktif)</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-xs font-semibold text-slate-600">
              Alokasi & Orientasi
            </div>
          </div>

          {/* ================= STAGE 2: Materi & Penugasan ================= */}
          <div className="flex flex-col">
            <div className="flex-1 bg-white rounded-3xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between gap-1.5 min-h-[300px]">
              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                    SA
                  </div>
                  <span className="text-xs font-medium text-slate-800">Distribusi Modul Belajar</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <CalendarIcon className="w-3 h-3" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">
                    DL
                  </div>
                  <span className="text-xs font-medium text-slate-800">Tugas Praktikum Biologi</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <CalendarIcon className="w-3 h-3" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                    KM
                  </div>
                  <span className="text-xs font-medium text-slate-800">Latihan Mandiri Kimia</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <CalendarIcon className="w-3 h-3" />
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[10px] font-bold">
                    RP
                  </div>
                  <span className="text-xs font-medium text-slate-800">Verifikasi Presensi</span>
                </div>
                <MoreHorizontal className="w-3 h-3 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">
                    NA
                  </div>
                  <span className="text-xs font-medium text-slate-800">Pemberitahuan Ujian</span>
                </div>
                <MoreHorizontal className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            <div className="text-center mt-3 text-xs font-semibold text-slate-600">
              Materi & Penugasan
            </div>
          </div>

          {/* ================= STAGE 3: Pemeriksaan & Evaluasi ================= */}
          <div className="flex flex-col">
            <div className="flex-1 bg-white rounded-3xl p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col justify-between gap-1.5 min-h-[300px]">
              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                  <span className="text-xs font-medium text-slate-800">Cek Submisi Masuk</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                  <span className="text-xs font-medium text-slate-800">Koreksi Jawaban Esai</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                    BS
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 leading-tight">Estimasi Penilaian</div>
                    <div className="text-[10px] text-slate-500">Maks. 2x24 Jam</div>
                  </div>
                </div>
                <MoreHorizontal className="w-3 h-3 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                    SA
                  </div>
                  <span className="text-xs font-medium text-slate-800">Catatan Feedback Guru</span>
                </div>
                <MoreHorizontal className="w-3 h-3 text-slate-400" />
              </div>

              <div className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    +
                  </div>
                  <span className="text-xs font-medium text-slate-800">Publikasi Nilai Akhir</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-3 text-xs font-semibold text-slate-600">
              Evaluasi & Feedback
            </div>
          </div>

          {/* ================= STAGE 4: Aksi & Modul Cepat (Pill Grid) ================= */}
          <div className="flex flex-col relative">
            {/* Curved Connector Indicator from Stage 3 to top-left black card */}
            <div className="hidden lg:block absolute -left-5 top-12 z-20 pointer-events-none">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M0 12C10 12 14 12 22 12" stroke="#0f172a" strokeWidth="2" strokeDasharray="3 3" />
                <polygon points="20,9 24,12 20,15" fill="#0f172a" />
              </svg>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-2.5 min-h-[300px]">
              {/* Tile 1 (Selected Black Pill in design) */}
              <button
                onClick={() => onSelectAction('submit-task')}
                className="p-3 rounded-2xl bg-slate-900 text-white shadow-lg hover:bg-black transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-bold leading-tight">Pengumpulan</div>
                <div className="text-[11px] font-bold leading-tight opacity-90">Tugas Siswa</div>
                <span className="mt-2 text-[9px] text-slate-300 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" /> Buka Form &rarr;
                </span>
              </button>

              {/* Tile 2: Presensi Harian */}
              <button
                onClick={() => onSelectAction('attendance')}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 leading-tight">Presensi</div>
                <div className="text-[11px] text-slate-500 leading-tight">Harian</div>
              </button>

              {/* Tile 3: Space Belajar */}
              <button
                onClick={() => onSelectAction('space-belajar')}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 leading-tight">Space</div>
                <div className="text-[11px] text-slate-500 leading-tight">Belajar</div>
              </button>

              {/* Tile 4: Rekap Nilai */}
              <button
                onClick={() => onSelectAction('grades')}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 leading-tight">Rekap</div>
                <div className="text-[11px] text-slate-500 leading-tight">Nilai</div>
              </button>

              {/* Tile 5: Dokumen Nilai */}
              <button
                onClick={() => onSelectAction('excel')}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 leading-tight">Dokumen</div>
                <div className="text-[11px] text-slate-500 leading-tight">Nilai Excel</div>
              </button>

              {/* Tile 6: Pengaturan Akun */}
              <button
                onClick={() => onSelectAction('settings')}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-sm transition-all flex flex-col justify-center text-left hover:scale-[1.02] cursor-pointer"
              >
                <div className="text-xs font-semibold text-slate-800 leading-tight">Pengaturan</div>
                <div className="text-[11px] text-slate-500 leading-tight">Akun Profil</div>
              </button>
            </div>

            <div className="text-center mt-3 text-xs font-semibold text-slate-600">
              Modul & Aksi Cepat
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
