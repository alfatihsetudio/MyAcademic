'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  BookOpen,
  Folder,
  TrendingUp,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FolderPlus,
  FilePlus,
  Move,
  Download,
  Camera,
  Upload,
  X,
  CheckCircle2,
  Clock,
  Laptop,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  fetchExplorer,
  createFolderApi,
  createNoteApi,
  deleteExplorerItemApi,
  fetchCalendarApi,
  addCalendarEventApi,
} from '@/lib/api';
import ArsipBelajarStudio from '@/components/ArsipBelajar/ArsipBelajarStudio';

type SpaceSubView = 'hub' | 'arsip-belajar' | 'explorer' | 'calendar' | 'tasks' | 'materials' | 'progress';

export default function SpaceBelajarView() {
  const [currentView, setCurrentView] = useState<SpaceSubView>('hub');

  // ================= FILE EXPLORER STATE =================
  const [explorerData, setExplorerData] = useState<{ folders: any[]; files: any[] }>({
    folders: [],
    files: [],
  });
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [currentFolderName, setCurrentFolderName] = useState<string>('Root');
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // ================= CALENDAR STATE =================
  const [calendarYear, setCalendarYear] = useState<number>(2026);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<{ dateStr: string; day: number; monthName: string } | null>(null);
  const [newScheduleTitle, setNewScheduleTitle] = useState('');
  const [newScheduleType, setNewScheduleType] = useState('Acara khusus');

  // Load explorer data
  const loadExplorer = async (folderId: number | null = null) => {
    try {
      const data = await fetchExplorer(folderId);
      setExplorerData({ folders: data.folders || [], files: data.files || [] });
    } catch (error: any) {
      toast.error('Gagal memuat File Explorer.');
    }
  };

  // Load calendar data
  const loadCalendar = async (year: number) => {
    try {
      const data = await fetchCalendarApi(year);
      setCalendarEvents(data.events || []);
    } catch (error: any) {
      toast.error('Gagal memuat Kalender.');
    }
  };

  useEffect(() => {
    if (currentView === 'explorer') {
      loadExplorer(currentFolderId);
    } else if (currentView === 'calendar') {
      loadCalendar(calendarYear);
    }
  }, [currentView, currentFolderId, calendarYear]);

  // Handle folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createFolderApi(newFolderName, currentFolderId);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      loadExplorer(currentFolderId);
      toast.success('Folder berhasil dibuat.');
    } catch (err: any) {
      toast.error('Gagal membuat folder.');
    }
  };

  // Handle note creation
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    try {
      await createNoteApi(noteTitle, noteContent, currentFolderId);
      setNoteTitle('');
      setNoteContent('');
      setIsNewNoteOpen(false);
      loadExplorer(currentFolderId);
      toast.success('Catatan berhasil dibuat.');
    } catch (err: any) {
      toast.error('Gagal membuat catatan.');
    }
  };

  // Handle delete item
  const handleDeleteItem = async (type: 'folder' | 'file', id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus item ini?')) {
      try {
        await deleteExplorerItemApi(type, id);
        loadExplorer(currentFolderId);
        toast.success('Item berhasil dihapus.');
      } catch (err: any) {
        toast.error('Gagal menghapus item.');
      }
    }
  };

  // Handle add calendar event
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !newScheduleTitle.trim()) return;
    try {
      await addCalendarEventApi({
        title: newScheduleTitle,
        event_date: selectedDay.dateStr,
        type: newScheduleType,
        note: 'Ditambahkan via kalender belajar',
      });
      setNewScheduleTitle('');
      loadCalendar(calendarYear);
      toast.success('Jadwal berhasil ditambahkan.');
    } catch (err: any) {
      toast.error('Gagal menambahkan jadwal.');
    }
  };

  // Month names
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  // ================= VIEW 1: HUB OVERVIEW (Matching Screenshot 1) =================
  if (currentView === 'hub') {
    return (
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
              Space Belajar
            </h1>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">
              Ruang khusus untuk menyimpan dan memantau perjalanan belajar kamu.
            </p>
          </div>

          <button
            onClick={() => setCurrentView('arsip-belajar')}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>Buka Arsip Belajar AI Studio</span>
          </button>
        </div>

        {/* Featured Hero Banner: Arsip Belajar AI */}
        <div
          onClick={() => setCurrentView('arsip-belajar')}
          className="mb-8 p-6 lg:p-7 rounded-[28px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden border border-indigo-500/20"
        >
          <div className="absolute -right-8 -top-8 w-60 h-60 rounded-full bg-indigo-500/20 blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-60 h-60 rounded-full bg-blue-500/15 blur-3xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-xs">
                  ✨ FITUR UTAMA BARU
                </span>
                <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 font-bold text-[10px] tracking-wide uppercase border border-white/10">
                  4 PILAR PEMBELAJARAN
                </span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>Arsip Belajar AI (Smart Study Archive Studio)</span>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  Sintesis cerdas multimodal foto papan tulis & rekaman suara guru menjadi catatan terstruktur + ringkasan eksekutif, Flashcards 3D, Mind Map hierarkis visual, Simulator Ujian CBT Mandiri, dan WhatsApp Bot.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  '📸 Foto Papan Tulis',
                  '🎙️ Suara Guru',
                  '📑 Ringkasan Eksekutif',
                  '🃏 Flashcards 3D',
                  '🌳 Mind Map Visual',
                  '📝 Simulator CBT',
                  '💬 Bot WhatsApp',
                ].map((pill, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-xl bg-white/10 text-white/90 text-[11px] font-semibold border border-white/10"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-all">
                <span>Masuk ke Studio AI</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>

        {/* 5 Main Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Tile 1: Riwayat Tugas */}
          <button
            onClick={() => setCurrentView('tasks')}
            className="p-6 rounded-3xl bg-white/95 hover:bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[170px] hover:-translate-y-1 cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Tugas</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lihat semua tugas yang pernah diberikan guru, lengkap dengan status dan nilai.
              </p>
            </div>
          </button>

          {/* Tile 2: Riwayat Materi */}
          <button
            onClick={() => setCurrentView('materials')}
            className="p-6 rounded-3xl bg-white/95 hover:bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[170px] hover:-translate-y-1 cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Riwayat Materi</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Kumpulan semua materi pelajaran yang pernah dibagikan guru.
              </p>
            </div>
          </button>

          {/* Tile 3: File Explorer */}
          <button
            onClick={() => {
              setCurrentFolderId(null);
              setCurrentFolderName('Root');
              setCurrentView('explorer');
            }}
            className="p-6 rounded-3xl bg-white/95 hover:bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[170px] hover:-translate-y-1 cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Folder className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">File Explorer</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Buat folder sendiri, simpan file belajar, dan cari materi dengan cepat.
              </p>
            </div>
          </button>

          {/* Tile 4: Progres Belajar */}
          <button
            onClick={() => setCurrentView('progress')}
            className="p-6 rounded-3xl bg-white/95 hover:bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[170px] hover:-translate-y-1 cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Progres Belajar</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tentukan tujuan belajarmu dan catat progres yang sudah kamu capai.
              </p>
            </div>
          </button>

          {/* Tile 5: Kalender Belajar */}
          <button
            onClick={() => setCurrentView('calendar')}
            className="p-6 rounded-3xl bg-white/95 hover:bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[170px] hover:-translate-y-1 cursor-pointer group"
          >
            <div>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Kalender Belajar</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Lihat jadwal dan rencana belajar kamu dalam satu kalender yang mudah dipahami.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ================= VIEW 0: ARSIP BELAJAR AI (STUDIO 4 PILAR & WA) =================
  if (currentView === 'arsip-belajar') {
    return <ArsipBelajarStudio onBackToHub={() => setCurrentView('hub')} />;
  }

  // ================= VIEW 2: FILE EXPLORER (Matching Screenshot 2) =================
  if (currentView === 'explorer') {
    return (
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)] relative pb-28">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-[11px] text-slate-400 font-medium">File Explorer</div>
              <div className="text-sm font-extrabold text-slate-900">Murid Markaz</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('hub')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              &larr; Kembali ke ruang belajar
            </button>
            <span className="text-[11px] text-slate-400">Penyimpanan belajar pribadi</span>
          </div>
        </div>

        {/* Location Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 px-1">
          <span className="font-semibold text-slate-400">Lokasi:</span>
          <button
            onClick={() => {
              setCurrentFolderId(null);
              setCurrentFolderName('Root');
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            This PC
          </button>
          <span className="text-slate-400">&rsaquo;</span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-500 text-white font-semibold">
            {currentFolderName}
          </span>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 p-3 rounded-2xl border border-slate-100 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewFolderOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" /> + Folder baru
            </button>
            <button
              onClick={() => setIsNewNoteOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5" /> + Catatan
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{explorerData.folders.length} folder &middot; {explorerData.files.length} file</span>
            <button className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1">
              <Trash2 className="w-3 h-3" /> Hapus
            </button>
            <button className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1">
              <Move className="w-3 h-3" /> Pindahkan
            </button>
            <button className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1">
              <Download className="w-3 h-3" /> Download folder
            </button>
          </div>
        </div>

        {/* File & Folder Canvas */}
        <div className="bg-white rounded-3xl p-6 min-h-[340px] shadow-xs border border-slate-100">
          {explorerData.folders.length === 0 && explorerData.files.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
              Belum ada folder atau file di lokasi ini. Gunakan tombol di bawah (dynamic island) untuk menambah folder, mengunggah foto, atau membuat catatan.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Folders */}
              {explorerData.folders.map((f) => (
                <div
                  key={f.id}
                  onDoubleClick={() => {
                    setCurrentFolderId(f.id);
                    setCurrentFolderName(f.name);
                  }}
                  className="p-3.5 rounded-2xl bg-amber-50/50 hover:bg-amber-100/60 border border-amber-200/60 flex flex-col items-center text-center cursor-pointer group transition-all"
                >
                  <Folder className="w-10 h-10 text-amber-500 fill-amber-400 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 truncate w-full">{f.name}</span>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem('folder', f.id); }}
                      className="p-1 rounded-md text-rose-500 hover:bg-white"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Files */}
              {explorerData.files.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl bg-blue-50/50 hover:bg-blue-100/60 border border-blue-200/60 flex flex-col items-center text-center cursor-pointer group transition-all"
                >
                  <FileText className="w-10 h-10 text-blue-500 mb-2 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-bold text-slate-800 truncate w-full">{file.title}</span>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{file.description || 'Catatan teks'}</p>
                  <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteItem('file', file.id); }}
                      className="p-1 rounded-md text-rose-500 hover:bg-white"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Island Floating Dock (Screenshot 2) */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-2.5 rounded-full shadow-2xl border border-slate-700/60 flex items-center gap-3 backdrop-blur-xl animate-in slide-in-from-bottom-4">
          <span className="text-xs font-medium text-slate-400">Aksi cepat:</span>
          <button
            onClick={() => setIsNewFolderOpen(true)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-amber-400 transition-transform hover:scale-110 cursor-pointer"
            title="Folder Baru"
          >
            <Folder className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Fitur kamera / foto pembelajaran aktif.')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-transform hover:scale-110 cursor-pointer"
            title="Unggah Foto"
          >
            <Camera className="w-4 h-4" />
          </button>
          <button
            onClick={() => alert('Pilih berkas dari perangkat Anda untuk diunggah.')}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-blue-400 transition-transform hover:scale-110 cursor-pointer"
            title="Unggah Berkas"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsNewNoteOpen(true)}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-rose-400 transition-transform hover:scale-110 cursor-pointer"
            title="Catatan Baru"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Modal: New Folder */}
        {isNewFolderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Buat Folder Baru</h3>
              <form onSubmit={handleCreateFolder}>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Nama folder (misal: Tugas Biologi)"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none mb-4"
                />
                <div className="flex justify-end gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-black"
                  >
                    Buat Folder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: New Note */}
        {isNewNoteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Tulis Catatan Pelajaran Baru</h3>
              <form onSubmit={handleCreateNote} className="space-y-3">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Judul Catatan..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <textarea
                  rows={4}
                  placeholder="Tuliskan materi atau ringkasan belajar..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                />
                <div className="flex justify-end gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsNewNoteOpen(false)}
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-black"
                  >
                    Simpan Catatan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 3: KALENDER BELAJAR 1 TAHUN (Matching Screenshot 3) =================
  if (currentView === 'calendar') {
    return (
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Kalender Tahun {calendarYear}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Tampilan 1 tahun penuh. Setiap tanggal bisa diklik untuk membuka halaman detail dan mengatur jadwal di hari tersebut.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('hub')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer mr-2"
            >
              &larr; Kembali ke dashboard
            </button>
            <button
              onClick={() => setCalendarYear(calendarYear - 1)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              &larr; {calendarYear - 1}
            </button>
            <button
              onClick={() => setCalendarYear(2026)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-black transition-all cursor-pointer"
            >
              Tahun ini
            </button>
            <button
              onClick={() => setCalendarYear(calendarYear + 1)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer"
            >
              {calendarYear + 1} &rarr;
            </button>
          </div>
        </div>

        {/* Legend Box (Matching Screenshot 3) */}
        <div className="bg-white/80 rounded-2xl p-3.5 border border-slate-100 mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600">
          <span className="font-bold text-slate-700">Penjelasan tanda:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Dot hijau = Ada jadwal tipe &ldquo;Libur&rdquo;</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Dot kuning = Ada jadwal tipe &ldquo;Acara khusus&rdquo;</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Dot merah = Ada jadwal tipe &ldquo;Peringatan&rdquo;</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-600 inline-block" />
            <span>Lingkaran berbingkai ungu = Hari ini</span>
          </div>
        </div>

        {/* 12 Months Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {monthNames.map((mName, mIdx) => {
            // Days in month calculation
            const firstDay = new Date(calendarYear, mIdx, 1);
            // In Indonesian calendar: Monday is 0, Sunday is 6
            const startingDay = (firstDay.getDay() + 6) % 7;
            const daysInMonth = new Date(calendarYear, mIdx + 1, 0).getDate();

            // Check events in this month
            const monthPrefix = `${calendarYear}-${String(mIdx + 1).padStart(2, '0')}`;
            const monthEvents = calendarEvents.filter((ev) => ev.event_date?.startsWith(monthPrefix));

            return (
              <div
                key={mName}
                className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-extrabold text-slate-900">{mName}</h3>
                  <span className="text-[11px] font-mono text-slate-400">{calendarYear}</span>
                </div>

                {/* Day Header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500 pb-1 border-b border-slate-100">
                  <span>Sen</span>
                  <span>Sel</span>
                  <span>Rab</span>
                  <span>Kam</span>
                  <span>Jum</span>
                  <span>Sab</span>
                  <span className="text-rose-600 bg-rose-50/70 rounded-t-md">Min</span>
                </div>

                {/* Month Days Grid */}
                <div className="grid grid-cols-7 text-center text-xs gap-y-1 pt-1.5">
                  {/* Empty cells before month starts */}
                  {Array.from({ length: startingDay }).map((_, i) => (
                    <span key={`empty-${i}`} className="p-1" />
                  ))}

                  {/* Days */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const dateStr = `${monthPrefix}-${String(dayNum).padStart(2, '0')}`;
                    const dayEvents = monthEvents.filter((ev) => ev.event_date === dateStr);
                    const isSunday = (startingDay + i) % 7 === 6;

                    // Check if today
                    const now = new Date();
                    const isToday =
                      calendarYear === now.getFullYear() &&
                      mIdx === now.getMonth() &&
                      dayNum === now.getDate();

                    const hasLibur = dayEvents.some((e) => e.type === 'Libur');
                    const hasKhusus = dayEvents.some((e) => e.type === 'Acara khusus');
                    const hasPeringatan = dayEvents.some((e) => e.type === 'Peringatan');

                    return (
                      <button
                        key={`day-${dayNum}`}
                        onClick={() => setSelectedDay({ dateStr, day: dayNum, monthName: mName })}
                        className={`relative p-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer hover:bg-slate-100 ${
                          isSunday ? 'bg-rose-50/40 text-rose-600 font-semibold' : 'text-slate-800'
                        } ${isToday ? 'ring-2 ring-purple-600 font-bold' : ''}`}
                      >
                        <span className="text-xs">{dayNum}</span>

                        {/* Event Dots */}
                        <div className="flex items-center gap-0.5 mt-0.5 h-1">
                          {hasLibur && <span className="w-1 h-1 rounded-full bg-emerald-500" />}
                          {hasKhusus && <span className="w-1 h-1 rounded-full bg-amber-400" />}
                          {hasPeringatan && <span className="w-1 h-1 rounded-full bg-rose-500" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Day Schedule Planner */}
        {selectedDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Agenda: {selectedDay.day} {selectedDay.monthName} {calendarYear}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedDay.dateStr}</p>
                </div>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Existing events on that day */}
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                {calendarEvents.filter((ev) => ev.event_date === selectedDay.dateStr).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Belum ada agenda pada tanggal ini.</p>
                ) : (
                  calendarEvents
                    .filter((ev) => ev.event_date === selectedDay.dateStr)
                    .map((ev) => (
                      <div key={ev.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{ev.title}</div>
                          <div className="text-[10px] text-slate-500">{ev.note || ev.type}</div>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ev.type === 'Libur'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ev.type === 'Acara khusus'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ev.type}
                        </span>
                      </div>
                    ))
                )}
              </div>

              {/* Form add event */}
              <form onSubmit={handleAddEvent} className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tambah Jadwal Baru</label>
                  <input
                    type="text"
                    required
                    placeholder="Judul agenda / jadwal..."
                    value={newScheduleTitle}
                    onChange={(e) => setNewScheduleTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Agenda</label>
                  <select
                    value={newScheduleType}
                    onChange={(e) => setNewScheduleType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="Libur">Libur (Dot Hijau)</option>
                    <option value="Acara khusus">Acara khusus (Dot Kuning)</option>
                    <option value="Peringatan">Peringatan (Dot Merah)</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-black"
                  >
                    Simpan Agenda
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ================= VIEW 4: RIWAYAT TUGAS =================
  if (currentView === 'tasks') {
    return (
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Riwayat Tugas Pembelajaran</h2>
            <p className="text-xs text-slate-500">Semua tugas yang pernah diberikan guru, lengkap dengan status submisi dan nilai.</p>
          </div>
          <button
            onClick={() => setCurrentView('hub')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            &larr; Kembali ke ruang belajar
          </button>
        </div>

        <div className="space-y-3">
          {[
            { id: 1, title: 'Praktikum Kimia: Stoikiometri Larutan', subject: 'Kimia', status: 'Selesai', score: 88, date: '2026-09-28' },
            { id: 2, title: 'Analisis Struktur Sel Tumbuhan', subject: 'Biologi', status: 'Selesai', score: 92, date: '2026-09-25' },
            { id: 3, title: 'Latihan 10 Soal Logaritma', subject: 'Matematika', status: 'Dalam Pengerjaan', score: '-', date: '2026-10-02' },
          ].map((item) => (
            <div key={item.id} className="bg-white rounded-2xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">{item.subject}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                <span className="text-[11px] text-slate-400">Tenggat: {item.date}</span>
              </div>
              <div className="text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.status}
                </span>
                <div className="text-sm font-extrabold text-blue-600 mt-1">
                  Nilai: {item.score}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= VIEW 5: RIWAYAT MATERI =================
  if (currentView === 'materials') {
    return (
      <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Riwayat Materi Pembelajaran</h2>
            <p className="text-xs text-slate-500">Kumpulan seluruh modul materi pelajaran yang dibagikan guru.</p>
          </div>
          <button
            onClick={() => setCurrentView('hub')}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            &larr; Kembali ke ruang belajar
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 1, title: 'Modul Biologi: Sel dan Jaringan', subject: 'Biologi', author: 'Budi Santoso, M.Pd' },
            { id: 2, title: 'Slide Kimia: Konsep Mol Larutan', subject: 'Kimia', author: 'Siti Aminah, M.Pd' },
            { id: 3, title: 'Panduan Matematika: Eksponen dan Logaritma', subject: 'Matematika', author: 'Dewi Lestari, S.Pd' },
            { id: 4, title: 'Buku Teks: Teks Eksplanasi & Prosedur', subject: 'B. Indonesia', author: 'Dr. Hendra, S.Pd' },
          ].map((mat) => (
            <div key={mat.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
              <div>
                <BookOpen className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">{mat.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1">Mapel: {mat.subject} &bull; Oleh: {mat.author}</p>
              </div>
              <button className="mt-4 text-xs font-bold text-emerald-600 hover:underline cursor-pointer">
                Buka Materi &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= VIEW 6: PROGRES BELAJAR =================
  return (
    <div className="w-full bg-slate-200/50 backdrop-blur-md rounded-[32px] p-6 lg:p-8 border border-white/80 shadow-[0_12px_36px_rgba(100,116,139,0.08)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Progres Belajar Mandiri</h2>
          <p className="text-xs text-slate-500">Tentukan tujuan belajarmu dan pantau progres yang dicapai.</p>
        </div>
        <button
          onClick={() => setCurrentView('hub')}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 transition-all cursor-pointer"
        >
          &larr; Kembali ke ruang belajar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 1, title: 'Kuasai Rumus Stoikiometri Mol', target: '2026-10-10', progress: 70 },
          { id: 2, title: 'Hafal 20 Istilah Sel Biologi', target: '2026-10-05', progress: 100 },
          { id: 3, title: 'Latihan Soal Matematika Grafik', target: '2026-10-15', progress: 40 },
        ].map((g) => (
          <div key={g.id} className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{g.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {g.progress}%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Target selesai: {g.target}</p>
            </div>
            <div className="mt-4 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${g.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
