'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Lock,
  Unlock,
  CheckCircle2,
  Sparkles,
  Sliders,
  Award,
  ChevronDown,
  Filter,
  UserCheck,
} from 'lucide-react';

interface StudentGrade {
  id: number;
  nisn: string;
  name: string;
  tugas: number;
  kuis: number;
  uts: number;
  uas: number;
  finalScore: number;
  predikat: string;
  isTuntas: boolean;
}

export default function GradebookReportView() {
  const [selectedClass, setSelectedClass] = useState('12-IPA 1');
  const [selectedSubject, setSelectedSubject] = useState('Fisika Terpadu');
  const [kkmScore, setKkmScore] = useState(75);
  const [isLocked, setIsLocked] = useState(false);
  const [showRaporModal, setShowRaporModal] = useState(false);
  const [selectedStudentForRapor, setSelectedStudentForRapor] = useState<StudentGrade | null>(null);

  const rawGrades = [
    { id: 1, nisn: '0068192031', name: 'Ahmad Siswa', tugas: 88, kuis: 90, uts: 85, uas: 89 },
    { id: 2, nisn: '0068192032', name: 'Nadia Az-Zahra', tugas: 92, kuis: 94, uts: 90, uas: 95 },
    { id: 3, nisn: '0068192033', name: 'Farhan Maulana', tugas: 78, kuis: 80, uts: 74, uas: 79 },
    { id: 4, nisn: '0068192034', name: 'Aisyah Putri', tugas: 85, kuis: 78, uts: 82, uas: 84 },
    { id: 5, nisn: '0068192035', name: 'Rian Pratama', tugas: 65, kuis: 70, uts: 60, uas: 68 },
  ];

  // Exact mathematical calculation: Tugas 30% + Kuis 20% + UTS 25% + UAS 25% = 100%
  const initialGrades: StudentGrade[] = rawGrades.map((st) => {
    const finalScore = +(
      st.tugas * 0.30 +
      st.kuis * 0.20 +
      st.uts * 0.25 +
      st.uas * 0.25
    ).toFixed(1);
    const isTuntas = finalScore >= kkmScore;
    const predikat = finalScore >= 85 ? 'A' : finalScore >= 75 ? 'B' : finalScore >= 60 ? 'C' : 'D';
    return { ...st, finalScore, predikat, isTuntas };
  });

  const handleOpenRapor = (st: StudentGrade) => {
    setSelectedStudentForRapor(st);
    setShowRaporModal(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur 17, 18 & 19: Central Gradebook & E-Rapor Digital</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Buku Nilai Sentral & Penerbitan Rapor</h2>
          <p className="text-xs text-slate-500 mt-1">
            Penggabungan bobot otomatis (Tugas 30%, Kuis 20%, UTS 25%, UAS 25%), KKM/KKTP, dan cetak rapor resmi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLocked(!isLocked)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isLocked
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{isLocked ? 'Nilai Dikunci (Locked)' : 'Kunci Nilai Guru'}</span>
          </button>

          <button
            onClick={() => handleOpenRapor(initialGrades[0])}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Preview Cetak E-Rapor</span>
          </button>
        </div>
      </div>

      {/* Filter and Weights Bar */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-bold bg-slate-100 px-3.5 py-2 rounded-xl border-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option>12-IPA 1</option>
            <option>12-IPA 2</option>
            <option>11-IPA 1</option>
            <option>10-RPL 1</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-100 px-3.5 py-2 rounded-xl border-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
          >
            <option>Fisika Terpadu</option>
            <option>Matematika Wajib</option>
            <option>Kimia Dasar</option>
            <option>Biologi Sel</option>
          </select>
        </div>

        {/* Weights indicator */}
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl">
          <span>Bobot: Tugas 30% • Kuis 20% • UTS 25% • UAS 25%</span>
          <span className="h-4 w-px bg-slate-200" />
          <span className="text-indigo-600 font-bold">KKM: {kkmScore}</span>
        </div>
      </div>

      {/* Gradebook Master Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-3">Siswa</th>
                <th className="pb-3 text-center">Tugas (30%)</th>
                <th className="pb-3 text-center">Kuis (20%)</th>
                <th className="pb-3 text-center">UTS (25%)</th>
                <th className="pb-3 text-center">UAS (25%)</th>
                <th className="pb-3 text-center">Nilai Akhir</th>
                <th className="pb-3 text-center">Predikat</th>
                <th className="pb-3 text-center">Status KKM</th>
                <th className="pb-3 text-right pr-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {initialGrades.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 pl-3">
                    <div className="font-bold text-slate-900">{st.name}</div>
                    <div className="text-[11px] font-mono text-slate-400">NISN: {st.nisn}</div>
                  </td>
                  <td className="py-3.5 text-center font-semibold text-slate-700">{st.tugas}</td>
                  <td className="py-3.5 text-center font-semibold text-slate-700">{st.kuis}</td>
                  <td className="py-3.5 text-center font-semibold text-slate-700">{st.uts}</td>
                  <td className="py-3.5 text-center font-semibold text-slate-700">{st.uas}</td>
                  <td className="py-3.5 text-center font-black text-slate-900 text-sm">
                    {st.finalScore}
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-800 font-extrabold inline-flex items-center justify-center">
                      {st.predikat}
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        st.isTuntas
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {st.isTuntas ? 'Tuntas' : 'Belum Tuntas'}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-3">
                    <button
                      onClick={() => handleOpenRapor(st)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-900 hover:text-white font-bold text-[11px] text-slate-700 transition-all cursor-pointer"
                    >
                      Rapor &rarr;
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREVIEW CETAK RAPOR DIGITAL */}
      {showRaporModal && selectedStudentForRapor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-slate-100 flex flex-col justify-between">
            {/* Kop Sekolah Rapor */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                    SMA
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase text-slate-900">
                      SMA NEGERI UNGGULAN TELADAN
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      NPSN: 20109988 • Terakreditasi A • Jl. Pendidikan No. 45 Jakarta
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full">
                    RAPOR SEMESTER GANJIL
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1">T.A 2026/2027</p>
                </div>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl mb-6">
                <div>
                  <span className="text-slate-400">Nama Siswa:</span>
                  <div className="font-bold text-slate-900">{selectedStudentForRapor.name}</div>
                </div>
                <div>
                  <span className="text-slate-400">NISN / Kelas:</span>
                  <div className="font-bold text-slate-900">
                    {selectedStudentForRapor.nisn} / {selectedClass}
                  </div>
                </div>
              </div>

              {/* Tabel Capaian Nilai Rapor */}
              <table className="w-full text-xs text-left mb-6 border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="p-3">Mata Pelajaran</th>
                    <th className="p-3 text-center">KKM</th>
                    <th className="p-3 text-center">Nilai Akhir</th>
                    <th className="p-3 text-center">Predikat</th>
                    <th className="p-3">Capaian Kompetensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold">{selectedSubject}</td>
                    <td className="p-3 text-center">{kkmScore}</td>
                    <td className="p-3 text-center font-black">{selectedStudentForRapor.finalScore}</td>
                    <td className="p-3 text-center font-bold">{selectedStudentForRapor.predikat}</td>
                    <td className="p-3 text-[11px] text-slate-600">
                      Menunjukkan penguasaan sangat baik dalam konsep termodinamika dan mekanika kuantum.
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Kehadiran & Catatan Wali Kelas */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-800">Rekapitulasi Kehadiran:</span>
                  <div className="mt-2 text-[11px] space-y-1 text-slate-600">
                    <div>Hadir: 98 Hari (98%)</div>
                    <div>Sakit: 1 Hari</div>
                    <div>Izin: 1 Hari</div>
                    <div>Tanpa Keterangan: 0 Hari</div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <span className="font-bold text-slate-800">Catatan Wali Kelas:</span>
                  <p className="mt-2 text-[11px] text-slate-600 italic">
                    "Pertahankan motivasi belajar yang konsisten dan aktif memimpin kegiatan kelas."
                  </p>
                </div>
              </div>

              {/* Tanda Tangan */}
              <div className="flex justify-between items-center text-center text-xs pt-4 border-t border-slate-100">
                <div>
                  <p className="text-slate-400">Orang Tua / Wali</p>
                  <div className="h-12" />
                  <p className="font-bold text-slate-800">( .............................. )</p>
                </div>
                <div>
                  <p className="text-slate-400">Wali Kelas</p>
                  <div className="h-12" />
                  <p className="font-bold text-slate-800">Budi Santoso, M.Pd</p>
                </div>
                <div>
                  <p className="text-slate-400">Kepala Sekolah</p>
                  <div className="h-12" />
                  <p className="font-bold text-slate-800">Dr. H. Sulaiman, M.Si</p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRaporModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={() => alert('Dokumen Rapor sedang diunduh dalam format PDF resmi...')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
