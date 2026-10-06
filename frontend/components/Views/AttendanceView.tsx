'use client';

import React from 'react';
import { Calendar, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function AttendanceView() {
  const stats = { H: 24, S: 1, I: 1, A: 0 };
  const total = stats.H + stats.S + stats.I + stats.A;
  const rate = Math.round((stats.H / total) * 100);

  const logs = [
    { date: '2026-10-01', status: 'H', desc: 'Hadir Tepat Waktu', recordedBy: 'Budi Santoso, M.Pd' },
    { date: '2026-09-30', status: 'H', desc: 'Hadir Tepat Waktu', recordedBy: 'Siti Aminah, M.Pd' },
    { date: '2026-09-29', status: 'H', desc: 'Hadir Tepat Waktu', recordedBy: 'Dewi Lestari, S.Pd' },
    { date: '2026-09-28', status: 'S', desc: 'Sakit (Surat Dokter Terlampir)', recordedBy: 'Budi Santoso, M.Pd' },
    { date: '2026-09-27', status: 'H', desc: 'Hadir Tepat Waktu', recordedBy: 'Dr. Hendra, S.Pd' },
  ];

  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-7 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Riwayat Presensi & Kehadiran</h2>
          <p className="text-xs text-slate-500">Rekam jejak kehadiran tatap muka harian siswa</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
            Hadir: {stats.H}
          </div>
          <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
            Sakit: {stats.S}
          </div>
          <div className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
            Izin: {stats.I}
          </div>
          <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-2xl text-xs font-bold">
            Alpha: {stats.A}
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {logs.map((log, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                  log.status === 'H'
                    ? 'bg-emerald-100 text-emerald-800'
                    : log.status === 'S'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {log.status}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">{log.desc}</div>
                <div className="text-[10px] text-slate-400">Dicatat oleh: {log.recordedBy}</div>
              </div>
            </div>
            <div className="text-xs font-mono font-semibold text-slate-500">
              {log.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
