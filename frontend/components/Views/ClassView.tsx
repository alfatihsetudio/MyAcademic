'use client';

import React from 'react';
import { School, Users, UserCheck, BookOpen } from 'lucide-react';

export default function ClassView() {
  const classes = [
    { id: 1, name: 'X-IPA 1', level: '10', major: 'IPA', wali: 'Budi Santoso, M.Pd', km: 'Ahmad Siswa', count: 32 },
    { id: 2, name: 'X-IPA 2', level: '10', major: 'IPA', wali: 'Siti Aminah, M.Pd', km: 'Rian Pratama', count: 30 },
    { id: 3, name: 'XI-IPA 1', level: '11', major: 'IPA', wali: 'Dewi Lestari, S.Pd', km: 'Nadia Az-Zahra', count: 31 },
    { id: 4, name: 'XII-IPA 1', level: '12', major: 'IPA', wali: 'Dr. Hendra, S.Pd', km: 'Farhan Maulana', count: 28 },
  ];

  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Daftar Kelas Akademik</h2>
          <p className="text-xs text-slate-500">Struktur rombongan belajar dan penanggung jawab kelas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map((c) => (
          <div key={c.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <School className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                Tingkat {c.level} • {c.major}
              </span>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">Wali: {c.wali}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>KM: {c.km}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>{c.count} Siswa Terdaftar</span>
              <button className="text-xs font-bold text-slate-900 hover:underline cursor-pointer">Detail &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
