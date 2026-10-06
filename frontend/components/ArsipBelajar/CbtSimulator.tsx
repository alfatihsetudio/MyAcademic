'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  History,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateArsipQuiz, saveArsipQuizResult, fetchArsipQuizHistory } from '@/lib/api';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

interface CbtSimulatorProps {
  noteId?: number | null;
  noteTitle?: string;
}

export default function CbtSimulator({ noteId, noteTitle }: CbtSimulatorProps) {
  // Modes: 'setup' | 'exam' | 'result' | 'history'
  const [mode, setMode] = useState<'setup' | 'exam' | 'result' | 'history'>('setup');

  // Config
  const [difficulty, setDifficulty] = useState<'mudah' | 'sedang' | 'sulit'>('sedang');
  const [count, setCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Exam Running State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [topicSummary, setTopicSummary] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes default
  const timerRef = useRef<any>(null);

  // Exam Result State
  const [examResult, setExamResult] = useState<{
    score: number;
    total: number;
    percentage: number;
    feedback: string;
  } | null>(null);

  // History State
  const [quizHistory, setQuizHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (mode === 'exam' && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, timeRemaining]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetchArsipQuizHistory();
      if (res.success) {
        setQuizHistory(res.history || []);
      }
    } catch (e) {
      toast.error('Gagal memuat riwayat ujian.');
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartExam = async () => {
    setIsGenerating(true);
    try {
      const res = await generateArsipQuiz({
        note_id: noteId || undefined,
        count,
        difficulty,
      });

      if (res.success && res.questions && res.questions.length > 0) {
        setQuestions(res.questions);
        setTopicSummary(res.topicSummary || noteTitle || 'Materi Belajar');
        setCurrentIndex(0);
        setUserAnswers({});
        setTimeRemaining(res.questions.length * 60); // 1 min per question
        setMode('exam');
        toast.success(`Ujian CBT Mandiri (${res.questions.length} soal) dimulai! Semoga sukses.`);
        if (res.ai_warning) {
          toast(res.ai_warning, { icon: 'ℹ️' });
        }
      } else {
        toast.error('Gagal membuat soal latihan CBT.');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memproses simulator ujian.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectAnswer = (option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: option,
    }));
  };

  const checkIsCorrect = (studentAns?: string, correctAns?: string) => {
    if (!studentAns || !correctAns) return false;
    const s = studentAns.trim();
    const c = correctAns.trim();
    if (s.toLowerCase() === c.toLowerCase()) return true;
    const sLetter = s.charAt(0).toUpperCase();
    const cLetter = c.charAt(0).toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(sLetter) && sLetter === cLetter) return true;
    return false;
  };

  const handleFinishExam = async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    let correct = 0;
    questions.forEach((q, idx) => {
      if (checkIsCorrect(userAnswers[idx], q.answer)) {
        correct++;
      }
    });

    const total = questions.length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    try {
      const res = await saveArsipQuizResult({
        note_id: noteId || null,
        title: topicSummary || noteTitle || 'Simulator Ujian Mandiri',
        difficulty,
        questions,
        user_answers: userAnswers,
      });

      setExamResult({
        score: correct,
        total,
        percentage,
        feedback: res.feedback || (percentage >= 75 ? 'Luar biasa! Penguasaan materi sangat baik.' : 'Perlu dipelajari kembali flashcard & mindmap.'),
      });
      setMode('result');
      toast.success('Ujian selesai! Skor Anda telah dicatat.');
    } catch (err) {
      setExamResult({
        score: correct,
        total,
        percentage,
        feedback: percentage >= 75 ? 'Hasil sangat baik!' : 'Tingkatkan pemahaman materi.',
      });
      setMode('result');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // ================= RENDER SCREEN: SETUP =================
  if (mode === 'setup') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Pilar 4: Simulator Kuis & Ujian CBT Mandiri
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Uji kesiapan ujian secara nyata dengan bank soal AI pilihan ganda, timer CBT, dan scoring instan.
            </p>
          </div>

          <button
            onClick={() => {
              loadHistory();
              setMode('history');
            }}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5" /> Riwayat Kuis
          </button>
        </div>

        {/* Setup Card */}
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
              <FileCheck className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Konfigurasi Ujian Mandiri
            </h4>
            <p className="text-xs text-slate-500">
              Topik: <span className="font-semibold text-indigo-600">{noteTitle || 'Seluruh Materi Arsip Belajar'}</span>
            </p>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Tingkat Kesulitan Soal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'mudah', label: 'Mudah', desc: 'Fakta & Definisi', color: 'emerald' },
                { id: 'sedang', label: 'Sedang', desc: 'Konsep & Aplikasi', color: 'indigo' },
                { id: 'sulit', label: 'Sulit', desc: 'Analisis & HOTS', color: 'rose' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id as any)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    difficulty === d.id
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className={`text-xs font-bold ${difficulty === d.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                    {d.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{d.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Jumlah Butir Soal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    count === c
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c} Butir Soal
                </button>
              ))}
            </div>
          </div>

          {/* Start CTA */}
          <button
            onClick={handleStartExam}
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Membuat Paket Soal CBT AI...' : 'Mulai Ujian Mandiri Sekarang'}</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= RENDER SCREEN: EXAM CBT =================
  if (mode === 'exam') {
    const currentQ = questions[currentIndex];
    const answeredCount = Object.keys(userAnswers).length;

    return (
      <div className="space-y-6">
        {/* Top CBT Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{topicSummary}</h4>
              <p className="text-[11px] text-slate-400">
                Terjawab: {answeredCount} dari {questions.length} soal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer Capsule */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin menyelesaikan dan mengumpulkan ujian sekarang?')) {
                  handleFinishExam();
                }
              }}
              className="px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Kumpulkan Ujian
            </button>
          </div>
        </div>

        {/* Question Palette & Exam Card Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area (3 Cols) */}
          <div className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              {/* Question Number Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                  Soal Nomor {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-400">
                  Tingkat: <span className="capitalize font-semibold text-slate-600">{difficulty}</span>
                </span>
              </div>

              {/* Question Statement */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed mb-6">
                {currentQ?.question}
              </h3>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentQ?.options?.map((opt, oIdx) => {
                  const isSelected = userAnswers[currentIndex] === opt;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => selectAnswer(opt)}
                      className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav Controls */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Soal Sebelumnya
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentIndex < questions.length - 1) {
                    setCurrentIndex((prev) => prev + 1);
                  } else {
                    if (confirm('Ini adalah soal terakhir. Apakah Anda siap mengumpulkan ujian?')) {
                      handleFinishExam();
                    }
                  }
                }}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>{currentIndex < questions.length - 1 ? 'Soal Berikutnya' : 'Selesai & Kumpulkan'}</span>
                {currentIndex < questions.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Question Palette Sidebar (1 Col) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Nomor Soal
            </h4>
            <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-3 gap-2">
              {questions.map((_, qIdx) => {
                const isCurrent = qIdx === currentIndex;
                const isAnswered = !!userAnswers[qIdx];
                return (
                  <button
                    key={qIdx}
                    type="button"
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-emerald-100 border border-emerald-300" />
                <span>Sudah Dijawab</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-md bg-slate-100" />
                <span>Belum Dijawab</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER SCREEN: RESULT =================
  if (mode === 'result' && examResult) {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-center">
          {/* Trophy & Score */}
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              Hasil Simulator Ujian Mandiri
            </span>
            <h3 className="text-2xl font-bold text-slate-900 mt-2">
              Skor Anda: {examResult.score} / {examResult.total} ({examResult.percentage}%)
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
              {examResult.feedback}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setMode('setup')}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Uji Lagi
            </button>
            <button
              onClick={() => {
                loadHistory();
                setMode('history');
              }}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" /> Riwayat Kuis
            </button>
          </div>

          {/* Review Answers Accordion/List */}
          <div className="text-left pt-6 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pembahasan Kunci Jawaban
            </h4>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const studentAns = userAnswers[idx];
                const isCorrect = checkIsCorrect(studentAns, q.answer);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border ${
                      isCorrect ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">
                        {idx + 1}. {q.question}
                      </p>
                      {isCorrect ? (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Benar
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 shrink-0">
                          <XCircle className="w-3.5 h-3.5" /> Salah
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-[11px] space-y-1">
                      <p className="text-slate-600">
                        <span className="font-semibold">Jawaban Anda:</span> {studentAns || '(Tidak dijawab)'}
                      </p>
                      <p className="text-emerald-700 font-medium">
                        <span className="font-semibold">Kunci Jawaban:</span> {q.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= RENDER SCREEN: HISTORY =================
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Riwayat Simulator Kuis & CBT
          </h3>
          <p className="text-xs text-slate-500">
            Daftar hasil latihan kuis mandiri yang pernah Anda selesaikan.
          </p>
        </div>
        <button
          onClick={() => setMode('setup')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" /> Mulai Ujian Baru
        </button>
      </div>

      {loadingHistory ? (
        <div className="py-12 text-center text-xs text-slate-400">Memuat riwayat kuis...</div>
      ) : quizHistory.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl bg-slate-50/80 border border-dashed border-slate-200 text-center max-w-md mx-auto space-y-3">
          <History className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">Belum Ada Riwayat Kuis</h4>
          <p className="text-xs text-slate-500">
            Mulai simulator ujian mandiri pertamamu sekarang untuk mengukur tingkat pemahaman materi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizHistory.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {item.difficulty}
                </span>
                <h4 className="text-xs font-bold text-slate-900 mt-1 truncate max-w-[200px]">
                  {item.title || item.note?.title || 'Simulator Ujian'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {new Date(item.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="text-right">
                <span
                  className={`text-lg font-bold ${
                    item.percentage >= 75 ? 'text-emerald-600' : item.percentage >= 60 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {item.percentage}%
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {item.score}/{item.total_questions} Benar
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
