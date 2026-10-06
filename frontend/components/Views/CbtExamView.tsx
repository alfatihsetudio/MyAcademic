'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  FileQuestion,
  Layers,
  Award,
  Eye,
  Shield,
  HelpCircle,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

import { getStoredUser } from '@/lib/api';

interface Question {
  id: number;
  text: string;
  options: { key: string; text: string }[];
  correctKey: string;
  points: number;
}

export default function CbtExamView() {
  const user = getStoredUser();
  const isTeacher = user?.role === 'guru';
  const [activeTab, setActiveTab] = useState<'schedule' | 'bank' | 'simulator'>('schedule');
  const [examActive, setExamActive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qId: number]: boolean }>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [tabSwitchWarning, setTabSwitchWarning] = useState(0);

  const sampleQuestions: Question[] = [
    {
      id: 1,
      text: 'Sebuah transformator step-down memiliki 800 lilitan primer dan 200 lilitan sekunder. Jika tegangan primer adalah 220 V, berapakah tegangan sekunder yang dihasilkan?',
      options: [
        { key: 'A', text: '55 V' },
        { key: 'B', text: '110 V' },
        { key: 'C', text: '440 V' },
        { key: 'D', text: '880 V' },
      ],
      correctKey: 'A',
      points: 25,
    },
    {
      id: 2,
      text: 'Komponen dalam struktur sel tumbuhan yang bertanggung jawab dalam proses fotosintesis dan memiliki klorofil adalah...',
      options: [
        { key: 'A', text: 'Mitokondria' },
        { key: 'B', text: 'Kloroplas' },
        { key: 'C', text: 'Badan Golgi' },
        { key: 'D', text: 'Retikulum Endoplasma' },
      ],
      correctKey: 'B',
      points: 25,
    },
    {
      id: 3,
      text: 'Manakah dari berikut ini yang merupakan sifat dari algoritma pemrograman yang baik?',
      options: [
        { key: 'A', text: 'Memiliki langkah yang ambigu dan tak berujung' },
        { key: 'B', text: 'Finiteness (berakhir setelah sejumlah langkah terhingga)' },
        { key: 'C', text: 'Hanya bisa dijalankan pada satu arsitektur komputer' },
        { key: 'D', text: 'Tidak memerlukan input dan tidak menghasilkan output' },
      ],
      correctKey: 'B',
      points: 25,
    },
    {
      id: 4,
      text: 'Nilai dari integral tentu ∫(0 hingga 2) (3x² + 2x) dx adalah...',
      options: [
        { key: 'A', text: '10' },
        { key: 'B', text: '12' },
        { key: 'C', text: '14' },
        { key: 'D', text: '16' },
      ],
      correctKey: 'B',
      points: 25,
    },
  ];

  // Timer simulation
  useEffect(() => {
    let timer: any;
    if (examActive && !examSubmitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examActive && !examSubmitted) {
      setExamSubmitted(true);
    }
    return () => clearInterval(timer);
  }, [examActive, examSubmitted, timeLeft]);

  // Tab switch warning simulation (Anti-cheat)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examActive && !examSubmitted) {
        setTabSwitchWarning((prev) => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [examActive, examSubmitted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (key: string) => {
    const qId = sampleQuestions[currentQuestionIndex].id;
    setUserAnswers({ ...userAnswers, [qId]: key });
  };

  const toggleFlag = () => {
    const qId = sampleQuestions[currentQuestionIndex].id;
    setFlaggedQuestions({ ...flaggedQuestions, [qId]: !flaggedQuestions[qId] });
  };

  const calculateScore = () => {
    let score = 0;
    sampleQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctKey) {
        score += q.points;
      }
    });
    return score;
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur 15 & 16: Computer-Based Test (CBT) & Question Bank</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Ujian Berbasis Komputer & Asesmen Digital</h2>
          <p className="text-xs text-slate-500 mt-1">
            Mendukung ulangan harian, UTS, UAS, kuis acak, pengawasan anti-curang, dan koreksi otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveTab('schedule'); setExamActive(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jadwal Ujian
          </button>
          <button
            onClick={() => { setActiveTab('bank'); setExamActive(false); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bank Soal Guru
          </button>
          <button
            onClick={() => { setActiveTab('simulator'); setExamActive(true); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'simulator' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isTeacher ? 'Pratinjau Soal (Guru)' : 'Simulasi CBT Siswa'}
          </button>
        </div>
      </div>

      {/* 1. JADWAL UJIAN TAB */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              title: 'Penilaian Tengah Semester (PTS) Fisika',
              class: '12-IPA 1, 12-IPA 2',
              date: '02 Oktober 2026',
              time: '08:00 - 09:30 WIB',
              duration: '90 Menit',
              token: 'PTS-FSK12',
              status: 'Aktif Hari Ini',
              statusColor: 'emerald',
            },
            {
              title: 'Ulangan Harian Matematika Wajib: Matriks',
              class: '12-IPA 1',
              date: '04 Oktober 2026',
              time: '10:00 - 11:00 WIB',
              duration: '60 Menit',
              token: 'MTK-MTRX',
              status: 'Akan Datang',
              statusColor: 'blue',
            },
            {
              title: 'Simulasi Tryout Ujian Sekolah Berstandar (US)',
              class: 'Semua Kelas 12',
              date: '08 Oktober 2026',
              time: '07:30 - 10:00 WIB',
              duration: '150 Menit',
              token: 'TRYOUT-2026',
              status: 'Draft Guru',
              statusColor: 'amber',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    item.statusColor === 'emerald' ? 'bg-emerald-50 text-emerald-700' :
                    item.statusColor === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Token: <strong className="text-slate-800">{item.token}</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Target: {item.class}</p>

                <div className="mt-4 space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Tanggal:</span>
                    <span className="font-semibold">{item.date}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Waktu:</span>
                    <span className="font-semibold">{item.time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Durasi:</span>
                    <span className="font-semibold">{item.duration}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Anti-cheat Aktif</span>
                <button
                  onClick={() => { setActiveTab('simulator'); setExamActive(true); }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-violet-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isTeacher ? <Eye className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTeacher ? 'Pratinjau Soal' : 'Mulai Ujian'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. BANK SOAL GURU TAB */}
      {activeTab === 'bank' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Pustaka & Bank Soal Kurikulum</h3>
              <p className="text-xs text-slate-500">Kumpulan soal pilihan ganda, essay, dan stimulus berbasis AKM.</p>
            </div>
            <button className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Tambah Butir Soal Baru</span>
            </button>
          </div>

          <div className="space-y-4">
            {sampleQuestions.map((q, idx) => (
              <div key={q.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-800">
                    Soal #{idx + 1} • Pilihan Ganda ({q.points} Poin)
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Kunci: Opsi {q.correctKey}
                  </span>
                </div>
                <p className="text-sm text-slate-800 font-medium leading-relaxed">{q.text}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {q.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={`px-3 py-2 rounded-xl text-xs flex items-center gap-2 border ${
                        opt.key === q.correctKey
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                        {opt.key}
                      </span>
                      <span>{opt.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SIMULATOR CBT SISWA TAB */}
      {activeTab === 'simulator' && (
        <div className="flex flex-col gap-6">
          {/* Status Bar Pengawas & Timer */}
          <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-violet-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Simulasi Ujian CBT Interaktif (Anti-Cheating Shield Active)</h4>
                <p className="text-xs text-slate-400">PTS Fisika Terpadu • Kelas 12 IPA 1</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {tabSwitchWarning > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{tabSwitchWarning}x Peringatan Tab Keluar!</span>
                </div>
              )}

              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 font-mono text-base font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>

          {!examSubmitted ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Soal & Opsi (2 Kolom) */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                      Soal Nomor {currentQuestionIndex + 1} dari {sampleQuestions.length}
                    </span>
                    <button
                      onClick={toggleFlag}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-all cursor-pointer ${
                        flaggedQuestions[sampleQuestions[currentQuestionIndex].id]
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flaggedQuestions[sampleQuestions[currentQuestionIndex].id] ? '★ Ditandai Ragu-Ragu' : '☆ Tandai Ragu'}
                    </button>
                  </div>

                  <p className="text-base font-semibold text-slate-900 leading-relaxed mb-6">
                    {sampleQuestions[currentQuestionIndex].text}
                  </p>

                  {/* Opsi Jawaban */}
                  <div className="space-y-3">
                    {sampleQuestions[currentQuestionIndex].options.map((opt) => {
                      const isSelected = userAnswers[sampleQuestions[currentQuestionIndex].id] === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleSelectOption(opt.key)}
                          className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-violet-50 border-violet-500 text-violet-950 shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <span className="flex-1">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Navigasi Soal Bawah */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Sebelumnya</span>
                  </button>

                  {currentQuestionIndex < sampleQuestions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                      className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-violet-700 text-xs font-bold text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>Selanjutnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setExamSubmitted(true)}
                      className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Check className="w-4 h-4" />
                      <span>Selesaikan Ujian</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Panel Kisi-kisi Nomor Soal (1 Kolom) */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Navigasi Lembar Jawaban</h4>
                  <div className="grid grid-cols-4 gap-2.5">
                    {sampleQuestions.map((q, idx) => {
                      const isAnswered = !!userAnswers[q.id];
                      const isFlagged = !!flaggedQuestions[q.id];
                      const isCurrent = currentQuestionIndex === idx;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-11 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center relative border ${
                            isCurrent
                              ? 'border-violet-600 ring-2 ring-violet-200'
                              : 'border-slate-200'
                          } ${
                            isFlagged
                              ? 'bg-amber-100 text-amber-900'
                              : isAnswered
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{idx + 1}</span>
                          {isAnswered && (
                            <span className="text-[9px] font-mono leading-none opacity-90">{userAnswers[q.id]}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Keterangan Warna */}
                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md bg-violet-600" />
                      <span>Sudah Dijawab ({Object.keys(userAnswers).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-100 border border-amber-300" />
                      <span>Ragu-Ragu ({Object.values(flaggedQuestions).filter(Boolean).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200" />
                      <span>Belum Dijawab ({sampleQuestions.length - Object.keys(userAnswers).length})</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExamSubmitted(true)}
                  className="mt-6 w-full py-3 rounded-2xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
                >
                  Kumpulkan Lembar Ujian
                </button>
              </div>
            </div>
          ) : (
            /* HASIL UJIAN OTOMATIS (AUTO-GRADING ENGINE) */
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center max-w-xl mx-auto flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-black">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Ujian Telah Selesai & Dinilai Otomatis</h3>
              <p className="text-xs text-slate-500">
                Nilai ujian Anda langsung dikalkulasi oleh CBT Auto-grading Engine dan tersimpan ke Gradebook.
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 w-full flex items-center justify-around my-2">
                <div>
                  <div className="text-3xl font-black text-violet-600">{calculateScore()} / 100</div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Nilai Akhir</div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div>
                  <div className="text-3xl font-black text-slate-800">
                    {calculateScore() >= 75 ? (
                      <span className="text-emerald-600">TUNTAS</span>
                    ) : (
                      <span className="text-rose-600">REMEDIAL</span>
                    )}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400 uppercase mt-0.5">Standar KKM 75</div>
                </div>
              </div>

              <button
                onClick={() => {
                  setExamSubmitted(false);
                  setUserAnswers({});
                  setFlaggedQuestions({});
                  setTimeLeft(1800);
                  setActiveTab('schedule');
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Kembali ke Daftar Ujian
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
