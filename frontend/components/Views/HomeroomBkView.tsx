'use client';

import React, { useState } from 'react';
import {
  HeartHandshake,
  AlertOctagon,
  Trophy,
  AlertTriangle,
  UserCheck,
  Shield,
  Sparkles,
  Search,
  Plus,
  Eye,
  Lock,
} from 'lucide-react';

export default function HomeroomBkView() {
  const [subTab, setSubTab] = useState<'early-warning' | 'bk' | 'violations' | 'achievements'>('early-warning');
  const [counselingUnlocked, setCounselingUnlocked] = useState(false);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur 20, 21, 22, 23 & 39: Wali Kelas, BK & Disiplin Kesiswaan</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Kesiswaan, Bimbingan Konseling & Disiplin</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring deteksi dini siswa berisiko (Early Warning), kasus rahasia BK, poin pelanggaran, dan rekap prestasi.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setSubTab('early-warning')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'early-warning' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Siswa Berisiko (EWS)
          </button>
          <button
            onClick={() => setSubTab('bk')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'bk' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Konseling BK
          </button>
          <button
            onClick={() => setSubTab('violations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'violations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Poin Pelanggaran
          </button>
          <button
            onClick={() => setSubTab('achievements')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'achievements' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Prestasi Siswa
          </button>
        </div>
      </div>

      {/* 1. EARLY WARNING SYSTEM (SISWA BERISIKO) */}
      {subTab === 'early-warning' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: 'Rian Pratama',
              class: '12-IPA 1',
              nisn: '0068192035',
              riskLevel: 'Tinggi (Prioritas 1)',
              riskColor: 'rose',
              factors: [
                'Absensi: 5x Alfa berturut-turut',
                '3 Tugas Fisika & MTK belum dikumpulkan',
                'Rata-rata nilai 62.5 (Di bawah KKM 75)',
              ],
              recommendation: 'Panggil orang tua & rujukan ke guru BK minggu ini.',
            },
            {
              name: 'Bima Aditya',
              class: '12-IPA 2',
              nisn: '0068192040',
              riskLevel: 'Sedang (Perhatian)',
              riskColor: 'amber',
              factors: [
                'Nilai Kimia turun 22% semester ini',
                'Terlambat masuk kelas 4x dalam 2 minggu',
              ],
              recommendation: 'Konseling motivasi belajar oleh wali kelas.',
            },
            {
              name: 'Maya Sartika',
              class: '11-IPA 1',
              nisn: '0068192078',
              riskLevel: 'Sedang (Perhatian)',
              riskColor: 'amber',
              factors: [
                'Sering izin sakit tanpa surat dokter resmi',
                'Tugas proyek kelompok tertunda',
              ],
              recommendation: 'Konfirmasi kesehatan langsung ke orang tua.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    item.riskColor === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.riskLevel}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">{item.nisn}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                <p className="text-xs text-slate-500">{item.class}</p>

                <div className="mt-4 space-y-2 bg-slate-50 p-4 rounded-2xl text-xs">
                  <span className="font-bold text-slate-700 block">Indikator Masalah:</span>
                  {item.factors.map((f, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-3 bg-indigo-50/50 rounded-xl text-[11px] text-indigo-900">
                  <strong>Tindakan:</strong> {item.recommendation}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Auto-Flagged by AI</span>
                <button
                  onClick={() => setSubTab('bk')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Buat Kasus BK &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. BIMBINGAN KONSELING (BK PRIVAT) */}
      {subTab === 'bk' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Buku Kasus Konseling Siswa (Data Rahasia BK)</h3>
                <p className="text-xs text-slate-500">Dilindungi enkripsi data dan pembatasan hak akses konselor.</p>
              </div>
            </div>

            <button
              onClick={() => setCounselingUnlocked(!counselingUnlocked)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer"
            >
              {counselingUnlocked ? <UnlockIcon className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{counselingUnlocked ? 'Kunci Kembali Data' : 'Buka Kunci Akses Konselor'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {[
              {
                student: 'Rian Pratama (12-IPA 1)',
                date: '01 Oktober 2026',
                category: 'Masalah Belajar & Motivasi',
                priority: 'Tinggi',
                status: 'Sesi Terjadwal Besok (08:30 WIB)',
                notes: 'Siswa mengalami penurunan motivasi drastis setelah masalah keluarga. Perlu pendekatan empatik.',
              },
              {
                student: 'Dina Amelia (10-RPL 1)',
                date: '28 September 2026',
                category: 'Penyesuaian Sosial & Teman Sebaya',
                priority: 'Sedang',
                status: 'Selesai (Dalam Pemantauan)',
                notes: 'Telah dilakukan mediasi bersama teman sekelas, kondisi interaksi kelas kini membaik.',
              },
            ].map((c, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{c.student}</span>
                    <span className="text-xs text-slate-500 ml-2">({c.category})</span>
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700">
                    Prioritas {c.priority}
                  </span>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-100">
                  {counselingUnlocked ? (
                    <p className="italic">"{c.notes}"</p>
                  ) : (
                    <p className="text-slate-400 italic flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Catatan ini disembunyikan. Klik 'Buka Kunci Akses Konselor' untuk melihat.</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Waktu: {c.date}</span>
                  <span className="font-semibold text-indigo-600">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. POIN PELANGGARAN SISWA */}
      {subTab === 'violations' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Catatan Kedisiplinan & Poin Pelanggaran</h3>
              <p className="text-xs text-slate-500">Standar tata tertib sekolah: 100 Poin maksimal sebelum SP3.</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Input Pelanggaran</span>
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                <th className="pb-3">Siswa</th>
                <th className="pb-3">Jenis Pelanggaran</th>
                <th className="pb-3 text-center">Poin</th>
                <th className="pb-3">Tanggal</th>
                <th className="pb-3">Tindakan / Sanksi</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'Rian Pratama (12-IPA 1)', violation: 'Bolos Jam Pelajaran ke 5-6', points: 15, date: '29 Sep 2026', action: 'Pembinaan & Pemanggilan Ortu', status: 'SP1' },
                { name: 'Doni Pratama (11-IPA 2)', violation: 'Atribut Seragam Tidak Lengkap', points: 5, date: '30 Sep 2026', action: 'Teguran Lisan & Piket Perpustakaan', status: 'Tuntas' },
                { name: 'Aldo Wijaya (10-IPS 1)', violation: 'Merokok di Luar Pagar Sekolah', points: 25, date: '25 Sep 2026', action: 'Skorsing 2 Hari & Perjanjian', status: 'SP2' },
              ].map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="py-3.5 font-bold text-slate-900">{v.name}</td>
                  <td className="py-3.5 text-slate-700">{v.violation}</td>
                  <td className="py-3.5 text-center font-black text-rose-600">+{v.points}</td>
                  <td className="py-3.5 text-slate-500">{v.date}</td>
                  <td className="py-3.5 text-slate-700">{v.action}</td>
                  <td className="py-3.5 text-right font-bold text-slate-900">{v.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. PRESTASI SISWA */}
      {subTab === 'achievements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Juara 1 Olimpiade Fisika Nasional (OSN)',
              student: 'Nadia Az-Zahra (12-IPA 1)',
              level: 'Tingkat Nasional',
              date: '15 September 2026',
              badgeColor: 'amber',
            },
            {
              title: 'Medali Emas Lomba LKS Software Application',
              student: 'Ahmad Siswa (12-IPA 1)',
              level: 'Tingkat Provinsi',
              date: '20 Agustus 2026',
              badgeColor: 'blue',
            },
            {
              title: 'Juara 2 Debat Bahasa Inggris Tingkat Kota',
              student: 'Aisyah Putri (12-IPA 1)',
              level: 'Tingkat Kota / Kabupaten',
              date: '10 September 2026',
              badgeColor: 'emerald',
            },
          ].map((ach, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Trophy className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {ach.level}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">{ach.title}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{ach.student}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{ach.date}</span>
                <span className="font-bold text-indigo-600 hover:underline cursor-pointer">Lihat Sertifikat &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UnlockIcon(props: any) {
  return <Lock className="rotate-180" {...props} />;
}
