'use client';

import React from 'react';
import { Calendar, CheckCircle2, Clock, UploadCloud, AlertCircle } from 'lucide-react';

interface AssignmentViewProps {
  onOpenSubmit: (id: number, title: string) => void;
}

export default function AssignmentView({ onOpenSubmit }: AssignmentViewProps) {
  const assignments = [
    {
      id: 1,
      title: 'Praktikum Kimia: Titrasi Asam Basa',
      subject: 'Kimia',
      deadline: '2026-10-05 23:59',
      status: 'pending',
      guru: 'Siti Aminah, M.Pd',
      desc: 'Buat laporan hasil observasi kelompok lengkap dengan tabel data dan kesimpulan.',
    },
    {
      id: 2,
      title: 'Analisis Jaringan Sel Tumbuhan',
      subject: 'Biologi',
      deadline: '2026-10-06 18:00',
      status: 'submitted',
      guru: 'Budi Santoso, M.Pd',
      desc: 'Gambar dan jelaskan perbedaan struktur mikroskopis penampang batang dikotil dan monokotil.',
    },
    {
      id: 3,
      title: 'Latihan 10 Soal Logaritma Kompleks',
      subject: 'Matematika',
      deadline: '2026-10-08 12:00',
      status: 'pending',
      guru: 'Dewi Lestari, S.Pd',
      desc: 'Kerjakan pada buku latihan dan unggah foto/PDF hasil pengerjaan.',
    },
  ];

  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Daftar Tugas & Evaluasi</h2>
          <p className="text-xs text-slate-500">Tugas aktif, tenggat pengumpulan, dan status penyerahan</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {assignments.map((a) => {
          const isDone = a.status === 'submitted';
          return (
            <div
              key={a.id}
              className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    {a.subject}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isDone ? 'Sudah Dikumpulkan' : 'Belum Dikumpulkan'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-1">{a.desc}</p>

                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Deadline: {a.deadline}
                  </span>
                  <span>Guru: {a.guru}</span>
                </div>
              </div>

              <div>
                {isDone ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Tuntas
                  </button>
                ) : (
                  <button
                    onClick={() => onOpenSubmit(a.id, a.title)}
                    className="px-5 py-2.5 rounded-2xl text-xs font-semibold bg-slate-900 hover:bg-black text-white flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" /> Kumpulkan Tugas
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
