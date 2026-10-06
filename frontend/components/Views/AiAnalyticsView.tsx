'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  BarChart3,
  TrendingUp,
  Send,
  Bot,
  User,
  School,
  Award,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function AiAnalyticsView() {
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { role: 'user' | 'assistant'; text: string; time: string }[]
  >([
    {
      role: 'assistant',
      text: 'Halo! Saya School AI Assistant. Anda dapat menanyakan analisis data KBM, ringkasan nilai rapor, rekomendasi penanganan siswa, atau meminta pembuatan butir soal ujian otomatis.',
      time: '18:30',
    },
    {
      role: 'user',
      text: 'Tampilkan siswa kelas 12 yang memiliki absensi di atas 3 hari dan nilai fisika di bawah KKM 75.',
      time: '18:31',
    },
    {
      role: 'assistant',
      text: 'Berdasarkan audit data KBM terpadu, ditemukan 1 siswa:\n• Rian Pratama (12-IPA 1): 5x Alfa, Nilai Fisika saat ini 65.4 (Belum tuntas KKM 75).\nRekomendasi AI: Jadwalkan sesi konseling dengan Guru BK dan berikan modul penugasan remedial bab Termodinamika.',
      time: '18:31',
    },
  ]);

  const handleSendMessage = () => {
    if (!query.trim()) return;

    const newMsg = {
      role: 'user' as const,
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    const currentQuery = query;
    setQuery('');

    setTimeout(() => {
      let reply = 'AI sedang memproses kueri data sekolah Anda...';
      if (currentQuery.toLowerCase().includes('soal')) {
        reply =
          'Berikut adalah butir soal fisika baru berbasis HOTS yang digenerate AI:\n"Sebuah gas ideal mengalami ekspansi isotermal pada suhu 300 K dari volume 2 L menjadi 6 L. Hitunglah usaha yang dilakukan oleh gas jika jumlah mol adalah 2 mol!"\nKunci Jawaban: W = n R T ln(V2/V1) = 2 x 8.314 x 300 x ln(3) ≈ 5.480 Joule.';
      } else if (currentQuery.toLowerCase().includes('rata-rata') || currentQuery.toLowerCase().includes('analisis')) {
        reply =
          'Rata-rata capaian akademik sekolah semester ganjil saat ini adalah 84.2%. Tingkat kelulusan KKM mencapai 92.4%, mengalami kenaikan sebesar 4.1% dibandingkan semester lalu.';
      } else {
        reply = `Jawaban AI untuk "${currentQuery}": Data telah dicocokkan dengan database sekolah. Seluruh sistem akademik berjalan normal dan aman di bawah isolasi Multi-Tenancy.`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fitur 34, 40 & 56: Principal Analytics & School AI Assistant</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">Analitik Akademik & Asisten Cerdas AI</h2>
          <p className="text-xs text-slate-500 mt-1">
            Dasbor strategis Kepala Sekolah, tren capaian kurikulum, dan asisten berbasis bahasa alami (Natural Language Query).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200 text-xs text-slate-600 font-semibold">
            Status Model: <span className="text-emerald-600 font-bold">Online & Ready</span>
          </div>
        </div>
      </div>

      {/* Strategic Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Rata-rata Nilai Sekolah', val: '84.6', sub: '+3.2% dari Semester Genap', color: 'indigo' },
          { label: 'Tingkat Ketuntasan KKM', val: '93.5%', sub: '448 dari 480 Siswa', color: 'emerald' },
          { label: 'Rata-rata Kehadiran Siswa', val: '96.2%', sub: 'Target Disiplin: 95%', color: 'blue' },
          { label: 'Siswa Butuh Perhatian (EWS)', val: '4 Siswa', sub: 'Teridentifikasi Otomatis', color: 'rose' },
        ].map((m, idx) => (
          <div key={idx} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400">{m.label}</span>
            <div className="text-2xl font-black text-slate-900 my-2">{m.val}</div>
            <span className="text-[11px] font-medium text-slate-500">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Split: Left is AI Chat Assistant, Right is Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School AI Assistant */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between h-[520px]">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">School AI Assistant</h3>
                  <p className="text-[10px] text-slate-400">Tanya jawab data sekolah & asisten pembuatan soal</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                AI Engine
              </span>
            </div>

            {/* Chat Messages Log */}
            <div className="space-y-3 overflow-y-auto max-h-[340px] pr-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                    <div className="text-[9px] opacity-60 text-right mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ketik pertanyaan atau perintah (misal: Buatkan 1 butir soal fisika)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-xs border-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
            <button
              onClick={handleSendMessage}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Analytics Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900">Distribusi Capaian Nilai per Mata Pelajaran</h3>
              <span className="text-xs text-slate-400">Semester Ganjil 2026</span>
            </div>

            <div className="space-y-4">
              {[
                { mapel: 'Fisika Terpadu', avg: 86.4, passRate: '94%', kkm: 75, color: 'bg-indigo-600' },
                { mapel: 'Matematika Peminatan', avg: 82.1, passRate: '88%', kkm: 75, color: 'bg-blue-600' },
                { mapel: 'Kimia Dasar', avg: 84.8, passRate: '92%', kkm: 75, color: 'bg-cyan-600' },
                { mapel: 'Biologi Sel', avg: 88.9, passRate: '98%', kkm: 75, color: 'bg-emerald-600' },
                { mapel: 'Bahasa Indonesia', avg: 89.2, passRate: '99%', kkm: 75, color: 'bg-violet-600' },
              ].map((sub, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{sub.mapel}</span>
                    <span className="font-semibold text-slate-500">
                      Rata-rata: <strong>{sub.avg}</strong> • Ketuntasan: <strong>{sub.passRate}</strong>
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${sub.color} rounded-full transition-all`}
                      style={{ width: `${sub.avg}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-900 block mb-1">Catatan Analitik Kepala Sekolah:</span>
            Pencapaian kurikulum semester ganjil berjalan melampaui target indikator kinerja utama. Pemantauan fokus diarahkan ke pendampingan siswa remedial kelas 12 sebelum pelaksanaan Tryout Ujian Sekolah.
          </div>
        </div>
      </div>
    </div>
  );
}
