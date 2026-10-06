'use client';

import React from 'react';
import { Award, CheckCircle, TrendingUp } from 'lucide-react';

export default function GradeView() {
  const grades = [
    { id: 1, subject: 'Biologi Sel & Jaringan', type: 'Tugas Online', score: 92, kkm: 75, date: '2026-09-29', note: 'Hasil analisis mikroskopis sangat detail dan rapi.' },
    { id: 2, subject: 'Kimia Stoikiometri', type: 'Tugas Online', score: 88, kkm: 75, date: '2026-09-25', note: 'Perhitungan mol tepat.' },
    { id: 3, subject: 'Matematika Eksponen', type: 'Ulangan Harian', score: 85, kkm: 75, date: '2026-09-20', note: 'Bagus, pertahankan.' },
    { id: 4, subject: 'Fisika Kinematika', type: 'Tugas Offline', score: 90, kkm: 75, date: '2026-09-18', note: 'Praktikum gerak parabola tuntas.' },
  ];

  const avg = (grades.reduce((a, b) => a + b.score, 0) / grades.length).toFixed(1);

  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Rekapitulasi Nilai Siswa</h2>
          <p className="text-xs text-slate-500">Nilai tugas online, tugas offline, dan asesmen harian</p>
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-xs border border-slate-100">
          <Award className="w-5 h-5 text-amber-500" />
          <div className="text-xs">
            <span className="text-slate-400 font-medium">Rata-rata: </span>
            <strong className="text-slate-900 text-sm font-extrabold">{avg} / 100</strong>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 font-semibold text-[11px]">
              <th className="pb-1 pl-3">Mata Pelajaran</th>
              <th className="pb-1">Jenis Asesmen</th>
              <th className="pb-1">Nilai</th>
              <th className="pb-1">KKM</th>
              <th className="pb-1">Tanggal</th>
              <th className="pb-1 pr-3">Catatan Guru</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.id} className="bg-white rounded-2xl shadow-xs hover:shadow-sm transition-all">
                <td className="py-3 pl-3 rounded-l-2xl font-bold text-slate-800">{g.subject}</td>
                <td className="py-3">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-semibold">
                    {g.type}
                  </span>
                </td>
                <td className="py-3 font-extrabold text-blue-600 text-sm">{g.score}</td>
                <td className="py-3 text-slate-400">{g.kkm}</td>
                <td className="py-3 text-slate-500 font-mono text-[11px]">{g.date}</td>
                <td className="py-3 pr-3 rounded-r-2xl text-slate-600 text-xs italic">{g.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
