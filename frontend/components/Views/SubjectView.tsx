'use client';

import React from 'react';
import { BookOpen, User, Sparkles } from 'lucide-react';

export default function SubjectView() {
  const subjects = [
    { id: 1, name: 'Biologi Sel & Molekuler', code: 'BIO-101', guru: 'Budi Santoso, M.Pd', materials: 8 },
    { id: 2, name: 'Kimia Larutan & Stoikiometri', code: 'KIM-102', guru: 'Siti Aminah, M.Pd', materials: 6 },
    { id: 3, name: 'Matematika Peminatan', code: 'MAT-103', guru: 'Dewi Lestari, S.Pd', materials: 10 },
    { id: 4, name: 'Bahasa Indonesia Ilmiah', code: 'BIN-104', guru: 'Dr. Hendra, S.Pd', materials: 5 },
    { id: 5, name: 'Fisika Kinematika', code: 'FIS-105', guru: 'Budi Santoso, M.Pd', materials: 7 },
    { id: 6, name: 'Bahasa Inggris Akademik', code: 'ENG-106', guru: 'Siti Aminah, M.Pd', materials: 9 },
  ];

  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Mata Pelajaran Kurikulum</h2>
          <p className="text-xs text-slate-500">Mata pelajaran aktif dan pengampu pengajaran</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((s) => (
          <div key={s.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-lg text-slate-700">{s.code}</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Aktif</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{s.guru}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{s.materials} Modul Materi</span>
              <button className="text-xs font-bold text-slate-900 hover:underline cursor-pointer">Buka Materi &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
