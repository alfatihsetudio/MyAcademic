'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { generateArsipFlashcards } from '@/lib/api';

interface Flashcard {
  q: string;
  a: string;
}

interface FlashcardsViewerProps {
  noteId: number;
  initialFlashcards: Flashcard[] | null;
  onUpdated?: (flashcards: Flashcard[]) => void;
}

export default function FlashcardsViewer({
  noteId,
  initialFlashcards,
  onUpdated,
}: FlashcardsViewerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(initialFlashcards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active recall status per card: 'mastered' | 'review' | null
  const [cardStatus, setCardStatus] = useState<Record<number, 'mastered' | 'review'>>({});

  const currentCard = flashcards[currentIndex];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateArsipFlashcards(noteId);
      if (res.success && res.flashcards) {
        setFlashcards(res.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
        setCardStatus({});
        if (onUpdated) onUpdated(res.flashcards);
        toast.success(`Berhasil membuat ${res.flashcards.length} kartu hafalan AI!`);
        if (res.ai_warning) {
          toast(res.ai_warning, { icon: 'ℹ️' });
        }
      } else {
        toast.error('Gagal membuat flashcards.');
      }
    } catch (err: any) {
      toast.error('Terjadi kesalahan saat memproses flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 120);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((prev) => prev - 1), 120);
    }
  };

  const markCard = (status: 'mastered' | 'review') => {
    setCardStatus((prev) => ({ ...prev, [currentIndex]: status }));
    if (currentIndex < flashcards.length - 1) {
      setTimeout(() => handleNext(), 200);
    } else {
      toast.success('Sesi review flashcard selesai! 🎉');
    }
  };

  const masteredCount = Object.values(cardStatus).filter((s) => s === 'mastered').length;
  const reviewCount = Object.values(cardStatus).filter((s) => s === 'review').length;
  const progressPercent = flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Pilar 2: Flashcards 3D Interaktif (Active Recall)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Metode uji ingatan berulang otomatis untuk memindahkan materi ke memori jangka panjang.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Membuat Flashcards...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{flashcards.length > 0 ? 'Regenerate Flashcards' : 'Hasilkan Flashcards AI'}</span>
            </>
          )}
        </button>
      </div>

      {/* Empty State */}
      {flashcards.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl bg-slate-50/80 border border-dashed border-slate-200 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Belum ada Flashcards</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Klik tombol di bawah agar AI otomatis membedah poin-poin penting dari catatan ini menjadi kartu tanya-jawab interaktif.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Sedang Memproses...' : 'Buat Flashcards dengan AI'}</span>
          </button>
        </div>
      ) : (
        <div className="max-w-xl mx-auto space-y-5">
          {/* Progress & Stats Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 px-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="font-bold text-slate-700">
                Kartu {currentIndex + 1} / {flashcards.length}
              </span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {masteredCount} Paham
              </span>
              <span className="text-rose-500 font-semibold flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {reviewCount} Ulangi
              </span>
            </div>
            <div className="text-slate-400 font-mono text-[11px]">{progressPercent}% Kuasai</div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 w-full h-[280px] sm:h-[320px] cursor-pointer select-none group"
          >
            <div
              className={`relative w-full h-full transform-style-3d transition-transform duration-500 rounded-3xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT (Pertanyaan) */}
              <div className="absolute inset-0 backface-hidden rounded-3xl p-7 bg-gradient-to-br from-white to-amber-50/40 border border-amber-200/80 shadow-lg shadow-amber-500/5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold tracking-wide uppercase">
                    Pertanyaan
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                    Klik untuk melihat jawaban
                  </span>
                </div>

                <div className="my-auto text-center px-4">
                  <p className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
                    {currentCard?.q}
                  </p>
                </div>

                <div className="text-center text-[11px] text-amber-600/80 font-medium">
                  Ketuk kartu atau tekan tombol Balik Kartu
                </div>
              </div>

              {/* BACK (Jawaban) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-7 bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-500/30 shadow-xl flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold tracking-wide uppercase border border-emerald-500/30">
                    Kunci Jawaban
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    Klik untuk balik lagi
                  </span>
                </div>

                <div className="my-auto text-center px-4">
                  <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                    {currentCard?.a}
                  </p>
                </div>

                <div className="text-center text-[11px] text-indigo-300/80">
                  Evaluasi hafalan Anda di bawah ini
                </div>
              </div>
            </div>
          </div>

          {/* Active Recall Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => markCard('review')}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-rose-500" />
              <span>Perlu Diulang</span>
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Balik Kartu</span>
            </button>

            <button
              onClick={() => markCard('mastered')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Sudah Paham</span>
            </button>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Sebelumnya
            </button>

            <div className="flex gap-1.5 overflow-x-auto max-w-[200px] py-1">
              {flashcards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentIndex(i);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-6 bg-amber-500'
                      : cardStatus[i] === 'mastered'
                      ? 'bg-emerald-400'
                      : cardStatus[i] === 'review'
                      ? 'bg-rose-400'
                      : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === flashcards.length - 1}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 disabled:opacity-30 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Berikutnya <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
