'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  GitFork,
  FileCheck,
  Smartphone,
  Plus,
  Search,
  Folder,
  FolderPlus,
  FolderOpen,
  FolderInput,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Clock,
  Layers,
  FileText,
  Trash2,
  Edit3,
  RefreshCw,
  MessageSquare,
  Play,
  Volume2,
  ExternalLink,
  Tag,
  ArrowRight,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  fetchArsipNotes,
  fetchArsipNote,
  deleteArsipNote,
  generateArsipSummary,
  createArsipFolder,
  deleteArsipFolder,
  moveArsipNoteFolder,
} from '@/lib/api';

import MultimodalStudioModal from './MultimodalStudioModal';
import FlashcardsViewer from './FlashcardsViewer';
import MindMapViewer from './MindMapViewer';
import CbtSimulator from './CbtSimulator';
import NoteChatAssistant from './NoteChatAssistant';
import WhatsAppLinkModal from './WhatsAppLinkModal';

interface ArsipBelajarStudioProps {
  onBackToHub?: () => void;
}

export default function ArsipBelajarStudio({ onBackToHub }: ArsipBelajarStudioProps) {
  // Navigation & Data States
  const [notes, setNotes] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // View Presentation States (Mode 1: 'all-notes', Mode 2: 'folders')
  const [viewMode, setViewMode] = useState<'all-notes' | 'folders'>('all-notes');
  const [sortBy, setSortBy] = useState<string>('date_desc');
  const [activeInsideFolder, setActiveInsideFolder] = useState<any | null>(null);

  // Folder Creation Modal
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Move Note Modal
  const [moveModalState, setMoveModalState] = useState<{ isOpen: boolean; note: any | null }>({
    isOpen: false,
    note: null,
  });
  const [selectedMoveFolderId, setSelectedMoveFolderId] = useState<string>('');
  const [isMovingNote, setIsMovingNote] = useState(false);

  // Selected Note Workspace State
  const [activeNote, setActiveNote] = useState<any | null>(null);
  const [noteTab, setNoteTab] = useState<'content' | 'flashcards' | 'mindmap' | 'quiz' | 'chat'>('content');
  const [contentMode, setContentMode] = useState<'structured' | 'summary'>('structured');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);

  // Direct Mode for Grand CBT
  const [directCbtMode, setDirectCbtMode] = useState(false);

  // Load Notes
  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const targetFolderId = viewMode === 'folders' && activeInsideFolder ? activeInsideFolder.id : selectedFolderId;
      const res = await fetchArsipNotes(
        targetFolderId,
        searchQuery,
        sortBy === 'by_folder' ? 'date_desc' : sortBy
      );
      if (res.success) {
        setNotes(res.notes || []);
        setFolders(res.folders || []);
        if (activeInsideFolder) {
          const fresh = res.folders?.find((f: any) => f.id === activeInsideFolder.id);
          if (fresh) setActiveInsideFolder(fresh);
        }
      }
    } catch (e) {
      toast.error('Gagal memuat arsip catatan belajar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [selectedFolderId, searchQuery, sortBy, viewMode, activeInsideFolder?.id]);

  // Open a specific note
  const openNote = async (id: number) => {
    try {
      const res = await fetchArsipNote(id);
      if (res.success && res.note) {
        setActiveNote(res.note);
        setNoteTab('content');
        setContentMode('structured');
      }
    } catch (e) {
      toast.error('Gagal memuat detail catatan.');
    }
  };

  const handleDeleteNote = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan materi ini?')) {
      try {
        await deleteArsipNote(id);
        toast.success('Catatan berhasil dihapus.');
        if (activeNote?.id === id) {
          setActiveNote(null);
        }
        loadNotes();
      } catch (e) {
        toast.error('Gagal menghapus catatan.');
      }
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      toast.error('Nama folder tidak boleh kosong.');
      return;
    }
    setIsCreatingFolder(true);
    try {
      const res = await createArsipFolder(newFolderName.trim());
      if (res.success) {
        toast.success(res.message || 'Folder berhasil dibuat!');
        setNewFolderName('');
        setIsCreateFolderModalOpen(false);
        loadNotes();
      } else {
        toast.error(res.message || 'Gagal membuat folder.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat folder.');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId: number, folderName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Hapus folder "${folderName}"? Catatan di dalamnya akan tetap tersimpan aman di Tanpa Folder.`)) {
      try {
        const res = await deleteArsipFolder(folderId);
        if (res.success) {
          toast.success(res.message || 'Folder berhasil dihapus.');
          if (activeInsideFolder?.id === folderId) {
            setActiveInsideFolder(null);
          }
          loadNotes();
        }
      } catch (err: any) {
        toast.error('Gagal menghapus folder.');
      }
    }
  };

  const openMoveModal = (note: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setMoveModalState({ isOpen: true, note });
    setSelectedMoveFolderId(note.folder_id ? String(note.folder_id) : '');
  };

  const handleMoveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveModalState.note) return;
    setIsMovingNote(true);
    try {
      const targetFolder = selectedMoveFolderId ? Number(selectedMoveFolderId) : null;
      const res = await moveArsipNoteFolder(moveModalState.note.id, targetFolder);
      if (res.success) {
        toast.success(res.message || 'Catatan berhasil dipindahkan!');
        setMoveModalState({ isOpen: false, note: null });
        loadNotes();
      }
    } catch (err: any) {
      toast.error('Gagal memindahkan folder catatan.');
    } finally {
      setIsMovingNote(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!activeNote) return;
    setIsGeneratingSummary(true);
    try {
      const res = await generateArsipSummary(activeNote.id);
      if (res.success && res.summary) {
        setActiveNote((prev: any) => ({ ...prev, summary: res.summary }));
        setContentMode('summary');
        toast.success('Ringkasan Eksekutif AI berhasil dihasilkan!');
      } else {
        toast.error('Gagal membuat ringkasan.');
      }
    } catch (e) {
      toast.error('Terjadi kesalahan saat memproses ringkasan AI.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Studio Header Bar */}
      <div className="p-6 lg:p-8 rounded-[32px] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => {
                  if (activeNote) {
                    setActiveNote(null);
                  } else if (directCbtMode) {
                    setDirectCbtMode(false);
                  } else if (onBackToHub) {
                    onBackToHub();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{activeNote || directCbtMode ? 'Kembali ke Arsip Studio' : 'Kembali ke Space Belajar'}</span>
              </button>

              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 text-[10px] font-bold tracking-wider uppercase">
                STUDIO AI
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Arsip Belajar AI</span>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Studio cerdas berbasis 4 Pilar Pembelajaran: Sintesis Multimodal (Foto Papan Tulis & Rekaman Guru), Flashcards 3D, Mind Map Hierarkis, Simulator CBT Mandiri, dan WhatsApp Bot.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catatan Baru (Multimodal AI)</span>
            </button>

            <button
              onClick={() => setIsWaModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Tautkan WhatsApp</span>
            </button>

            <button
              onClick={() => {
                setActiveNote(null);
                setDirectCbtMode(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-amber-400" />
              <span>Simulator CBT</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: DIRECT CBT SIMULATOR MODE */}
      {/* ============================================================== */}
      {directCbtMode && (
        <div className="p-6 lg:p-8 rounded-[32px] bg-slate-200/50 backdrop-blur-md border border-white/80 shadow-sm">
          <CbtSimulator />
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: NOTE WORKSPACE VIEW (WHEN A NOTE IS OPENED) */}
      {/* ============================================================== */}
      {activeNote && !directCbtMode && (
        <div className="p-6 lg:p-8 rounded-[32px] bg-slate-200/50 backdrop-blur-md border border-white/80 shadow-sm space-y-6">
          {/* Note Top Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                    {activeNote.tags?.[0] || 'Materi'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(activeNote.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {activeNote.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDeleteNote(activeNote.id)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Hapus Catatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Gallery / Audio Player if attached */}
            {(activeNote.image_urls?.length > 0 || activeNote.audio_url) && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Lampiran Media Multimodal
                </p>

                {/* Images */}
                {activeNote.image_urls?.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    {activeNote.image_urls.map((img: string, i: number) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="relative group rounded-xl overflow-hidden h-20 w-32 shrink-0 border border-slate-200 shadow-xs"
                      >
                        <img src={img} alt="Papan tulis" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded-md">
                          Foto {i + 1}
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Audio */}
                {activeNote.audio_url && (
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <audio controls src={activeNote.audio_url} className="h-8 flex-1 max-w-md" />
                    <span className="text-[11px] text-slate-500 font-medium">Rekaman Suara Guru</span>
                  </div>
                )}
              </div>
            )}

            {/* 5-Pillar Tabs Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 scrollbar-none">
              <button
                onClick={() => setNoteTab('content')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  noteTab === 'content'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. Catatan & Ringkasan</span>
              </button>

              <button
                onClick={() => setNoteTab('flashcards')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  noteTab === 'flashcards'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Brain className="w-3.5 h-3.5" />
                <span>2. Flashcards 3D</span>
                {activeNote.flashcards?.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-white/30 text-[10px]">
                    {activeNote.flashcards.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setNoteTab('mindmap')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  noteTab === 'mindmap'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>3. Mind Map Visual</span>
              </button>

              <button
                onClick={() => setNoteTab('quiz')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  noteTab === 'quiz'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>4. Simulator CBT</span>
              </button>

              <button
                onClick={() => setNoteTab('chat')}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  noteTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>5. Tanya Catatan AI</span>
              </button>
            </div>
          </div>

          {/* TAB 1: CATATAN TERSTRUKTUR & RINGKASAN EKSEKUTIF */}
          {noteTab === 'content' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-xl bg-slate-100 flex items-center gap-1">
                    <button
                      onClick={() => setContentMode('structured')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        contentMode === 'structured'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Catatan Terstruktur
                    </button>
                    <button
                      onClick={() => setContentMode('summary')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        contentMode === 'summary'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ringkasan Eksekutif
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>
                    {isGeneratingSummary
                      ? 'Menghasilkan Ringkasan...'
                      : activeNote.summary
                      ? 'Regenerate Ringkasan AI'
                      : 'Buat Ringkasan Eksekutif AI'}
                  </span>
                </button>
              </div>

              {contentMode === 'structured' ? (
                <div className="prose prose-slate max-w-none">
                  <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/60 font-sans text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {activeNote.transcribed_text}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeNote.summary ? (
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-blue-50/40 border border-indigo-200/80 font-sans text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">
                      {activeNote.summary}
                    </div>
                  ) : (
                    <div className="py-12 text-center max-w-md mx-auto space-y-3">
                      <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800">
                        Belum Ada Ringkasan Eksekutif
                      </h4>
                      <p className="text-xs text-slate-500">
                        Klik tombol &quot;Buat Ringkasan Eksekutif AI&quot; untuk menyarikan konsep dan formula kunci secara tajam.
                      </p>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 cursor-pointer"
                      >
                        Hasilkan Ringkasan Sekarang
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLASHCARDS */}
          {noteTab === 'flashcards' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <FlashcardsViewer
                noteId={activeNote.id}
                initialFlashcards={activeNote.flashcards}
                onUpdated={(newCards) => {
                  setActiveNote((prev: any) => ({ ...prev, flashcards: newCards }));
                }}
              />
            </div>
          )}

          {/* TAB 3: MIND MAP */}
          {noteTab === 'mindmap' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <MindMapViewer
                noteId={activeNote.id}
                initialMindmap={activeNote.mindmap}
                onUpdated={(newMm) => {
                  setActiveNote((prev: any) => ({ ...prev, mindmap: newMm }));
                }}
              />
            </div>
          )}

          {/* TAB 4: CBT SIMULATOR */}
          {noteTab === 'quiz' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
              <CbtSimulator noteId={activeNote.id} noteTitle={activeNote.title} />
            </div>
          )}

          {/* TAB 5: AI CHAT TUTOR */}
          {noteTab === 'chat' && (
            <div>
              <NoteChatAssistant noteId={activeNote.id} noteTitle={activeNote.title} />
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: NOTES EXPLORER / DASHBOARD (DEFAULT VIEW) */}
      {/* ============================================================== */}
      {!activeNote && !directCbtMode && (
        <div className="space-y-6">
          {/* Navigation & Presentation Mode Switcher Toolbar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* 2 Primary Mode Tabs (Semua Catatan vs Direktori Folder) */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 max-w-fit">
                <button
                  onClick={() => {
                    setViewMode('all-notes');
                    setActiveInsideFolder(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    viewMode === 'all-notes'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Semua Catatan</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      viewMode === 'all-notes'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {notes.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setViewMode('folders');
                    setSelectedFolderId(null);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    viewMode === 'folders'
                      ? 'bg-white text-indigo-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  <span>Direktori Folder</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      viewMode === 'folders'
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'bg-slate-200/70 text-slate-600'
                    }`}
                  >
                    {folders.length}
                  </span>
                </button>
              </div>

              {/* Controls: Search, Sorting & Create Folder */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:justify-end">
                {/* Search Input */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      viewMode === 'folders' && activeInsideFolder
                        ? `Cari materi di folder ${activeInsideFolder.name}...`
                        : 'Cari catatan materi, rumus, topik...'
                    }
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-800"
                  />
                </div>

                {/* Sorting Dropdown (Mode: Semua Catatan) */}
                {viewMode === 'all-notes' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="date_desc">📅 Tanggal Pembuatan (Terbaru)</option>
                      <option value="date_asc">📅 Tanggal Pembuatan (Terlama)</option>
                      <option value="by_folder">📁 Kelompokkan Sesuai Folder</option>
                      <option value="title_asc">🔤 Judul Materi (A - Z)</option>
                    </select>
                  </div>
                )}

                {/* Filter Folder Dropdown (Mode: Semua Catatan) */}
                {viewMode === 'all-notes' && sortBy !== 'by_folder' && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Folder className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : null)}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">Semua Folder</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>
                          📁 {f.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Create Folder Button */}
                <button
                  onClick={() => setIsCreateFolderModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  <FolderPlus className="w-4 h-4 text-indigo-600" />
                  <span>+ Folder Baru</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1 CONTENT: SEMUA CATATAN */}
          {/* ========================================================= */}
          {viewMode === 'all-notes' && (
            <div className="p-6 lg:p-8 rounded-[32px] bg-slate-200/50 backdrop-blur-md border border-white/80 shadow-sm space-y-6">
              {isLoading ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                  Memuat arsip belajar...
                </div>
              ) : notes.length === 0 ? (
                <div className="py-16 px-6 rounded-3xl bg-white border border-dashed border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Belum Ada Catatan Arsip</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Unggah foto papan tulis guru, rekaman suara audio, atau ketik materi baru untuk disintesis otomatis oleh AI.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat Catatan Pertama</span>
                  </button>
                </div>
              ) : sortBy === 'by_folder' ? (
                /* Grouped by Folder View */
                <div className="space-y-8">
                  {folders.map((folder) => {
                    const groupNotes = notes.filter((n) => n.folder_id === folder.id);
                    if (groupNotes.length === 0) return null;
                    return (
                      <div key={folder.id} className="space-y-4">
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-300/80">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                              <Folder className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">{folder.name}</h3>
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                              {groupNotes.length} Catatan
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setViewMode('folders');
                              setActiveInsideFolder(folder);
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Buka Folder</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {groupNotes.map((note) => renderNoteCard(note))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Unassigned Notes Group */}
                  {(() => {
                    const unassigned = notes.filter((n) => !n.folder_id);
                    if (unassigned.length === 0) return null;
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-slate-300/80">
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <h3 className="text-base font-bold text-slate-800">Tanpa Folder / Umum</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                            {unassigned.length} Catatan
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                          {unassigned.map((note) => renderNoteCard(note))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Flat Sorted Notes Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {notes.map((note) => renderNoteCard(note))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2 CONTENT: DIREKTORI FOLDER */}
          {/* ========================================================= */}
          {viewMode === 'folders' && (
            <div className="p-6 lg:p-8 rounded-[32px] bg-slate-200/50 backdrop-blur-md border border-white/80 shadow-sm space-y-6">
              {/* TOP LEVEL FOLDERS VIEW (No folder opened) */}
              {!activeInsideFolder ? (
                <div className="space-y-6">
                  {/* Folders Overview Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300/80">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Folder className="w-5 h-5 text-indigo-600" />
                        <span>Daftar Folder Belajar</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Klik folder untuk melihat seluruh catatan di dalamnya secara rapi dan terorganisir.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreateFolderModalOpen(true)}
                      className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Buat Folder Baru</span>
                    </button>
                  </div>

                  {/* Folders Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {/* Action Card: Buat Folder Baru */}
                    <button
                      onClick={() => setIsCreateFolderModalOpen(true)}
                      className="p-6 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 transition-all flex flex-col items-center justify-center text-center min-h-[180px] group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 group-hover:bg-indigo-200 text-indigo-600 flex items-center justify-center mb-3 transition-colors">
                        <FolderPlus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        + Buat Folder Baru
                      </span>
                      <span className="text-[11px] text-slate-500 mt-1">
                        Mata pelajaran atau bab materi baru
                      </span>
                    </button>

                    {/* Existing Folder Cards */}
                    {folders.map((folder) => {
                      const noteCount = folder.arsip_notes_count ?? notes.filter((n) => n.folder_id === folder.id).length;
                      return (
                        <div
                          key={folder.id}
                          onClick={() => setActiveInsideFolder(folder)}
                          className="p-6 rounded-3xl bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[180px] hover:-translate-y-1 cursor-pointer group relative"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                                <Folder className="w-6 h-6" />
                              </div>

                              <button
                                onClick={(e) => handleDeleteFolder(folder.id, folder.name, e)}
                                title="Hapus Folder"
                                className="p-1.5 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {folder.name}
                            </h4>

                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(folder.created_at || Date.now()).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                              {noteCount} Catatan
                            </span>

                            <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                              Buka <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* DRILLED-DOWN INSIDE FOLDER VIEW (TIDAK ACAK-ACAKAN) */
                <div className="space-y-6">
                  {/* Folder Breadcrumb & Action Banner */}
                  <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => setActiveInsideFolder(null)}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Semua Folder</span>
                          </button>
                          <span className="text-slate-300">/</span>
                          <span className="text-xs font-bold text-indigo-600">
                            {activeInsideFolder.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <FolderOpen className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {activeInsideFolder.name}
                            </h3>
                            <p className="text-xs text-slate-500">
                              Menampilkan seluruh catatan khusus di dalam folder ini secara tertib.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Tambah Catatan di Folder Ini</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Inside This Folder */}
                  {(() => {
                    const insideNotes = notes.filter((n) => n.folder_id === activeInsideFolder.id);

                    if (insideNotes.length === 0) {
                      return (
                        <div className="py-16 px-6 rounded-3xl bg-white border border-dashed border-slate-200 text-center max-w-md mx-auto space-y-4 shadow-xs">
                          <div className="w-14 h-14 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                            <FolderOpen className="w-7 h-7" />
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900">
                              Folder &quot;{activeInsideFolder.name}&quot; Masih Kosong
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                              Belum ada catatan materi di folder ini. Tambahkan catatan sekarang untuk menyusun materi secara rapi.
                            </p>
                          </div>
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            <span>+ Buat Catatan Pertama</span>
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {insideNotes.map((note) => renderNoteCard(note))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODALS */}
      {/* ============================================================== */}

      {/* 1. Multimodal Studio Upload Modal */}
      <MultimodalStudioModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        folders={folders}
        defaultFolderId={viewMode === 'folders' && activeInsideFolder ? activeInsideFolder.id : null}
        onSuccess={(newNote) => {
          loadNotes();
          if (newNote?.id) {
            openNote(newNote.id);
          }
        }}
      />

      {/* 2. WhatsApp Link Modal */}
      <WhatsAppLinkModal
        isOpen={isWaModalOpen}
        onClose={() => setIsWaModalOpen(false)}
      />

      {/* 3. Create Folder Modal */}
      {isCreateFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Buat Folder Baru</h3>
              </div>
              <button
                onClick={() => setIsCreateFolderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nama Folder
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Contoh: Matematika Peminatan, Bab 3 Termodinamika..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Folder membantu Anda memisahkan materi per mata pelajaran atau bab topik secara teratur.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Menyimpan...' : 'Simpan Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Move Note to Folder Modal */}
      {moveModalState.isOpen && moveModalState.note && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderInput className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pindahkan Catatan</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {moveModalState.note.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMoveModalState({ isOpen: false, note: null })}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMoveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Folder Tujuan
                </label>
                <select
                  value={selectedMoveFolderId}
                  onChange={(e) => setSelectedMoveFolderId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">(Tanpa Folder / Umum)</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setMoveModalState({ isOpen: false, note: null })}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isMovingNote}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isMovingNote ? 'Memindahkan...' : 'Pindahkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Helper function to render note card
  function renderNoteCard(note: any) {
    const hasFc = note.flashcards?.length > 0;
    const hasMm = !!note.mindmap;
    const folderName = note.folder?.name || folders.find((f) => f.id === note.folder_id)?.name;

    return (
      <div
        key={note.id}
        onClick={() => openNote(note.id)}
        className="p-6 rounded-3xl bg-white hover:bg-slate-50/80 border border-slate-200/90 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between min-h-[220px] hover:-translate-y-1 cursor-pointer group relative"
      >
        <div>
          {/* Top Badges & Actions */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              {folderName ? (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center gap-1">
                  <Folder className="w-3 h-3 text-indigo-500" />
                  <span className="truncate max-w-[120px]">{folderName}</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  Tanpa Folder
                </span>
              )}

              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(note.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
            </div>

            {/* Quick Actions (Move & Delete) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => openMoveModal(note, e)}
                title="Pindahkan ke Folder lain"
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
              >
                <FolderInput className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note.id);
                }}
                title="Hapus Catatan"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
            {note.summary || note.transcribed_text}
          </p>
        </div>

        {/* Bottom Pills (Media & Pillars Available) */}
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium flex-wrap">
            {hasFc && (
              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold">
                🃏 {note.flashcards.length} FC
              </span>
            )}
            {hasMm && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                🌳 MindMap
              </span>
            )}
            {note.image_urls?.length > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                📷 {note.image_urls.length}
              </span>
            )}
            {note.audio_url && (
              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">
                🎙️ Audio
              </span>
            )}
          </div>

          <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
            Buka <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    );
  }
}

