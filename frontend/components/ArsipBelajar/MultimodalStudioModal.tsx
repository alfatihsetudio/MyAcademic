'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Mic,
  Square,
  Upload,
  FileText,
  Sparkles,
  Folder,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createArsipNote } from '@/lib/api';

interface MultimodalStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: any[];
  defaultFolderId?: number | null;
  onSuccess: (newNote: any) => void;
}

export default function MultimodalStudioModal({
  isOpen,
  onClose,
  folders,
  defaultFolderId,
  onSuccess,
}: MultimodalStudioModalProps) {
  const [title, setTitle] = useState('');
  const [folderId, setFolderId] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (defaultFolderId) {
        setFolderId(String(defaultFolderId));
      } else {
        setFolderId('');
      }
    }
  }, [isOpen, defaultFolderId]);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<any>(null);

  // Submitting States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusStep, setStatusStep] = useState('');

  // Clean previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [imagePreviews, audioPreviewUrl]);

  if (!isOpen) return null;

  // Handle Image Add
  const handleAddImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

    setImages((prev) => [...prev, ...newFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/mp4' };
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType });
        const ext = recorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([audioBlob], `rekaman-guru-${Date.now()}.${ext}`, {
          type: recorder.mimeType,
        });

        setAudioFile(file);
        setAudioPreviewUrl(URL.createObjectURL(file));
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingSeconds(0);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start(1000);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      toast.error('Izin mikrofon ditolak atau tidak didukung di perangkat ini.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const removeAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl(null);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (images.length === 0 && !audioFile && !noteText.trim()) {
      toast.error('Harap masukkan minimal satu foto papan tulis, rekaman audio, atau catatan teks.');
      return;
    }

    setIsSubmitting(true);
    setStatusStep('Menyiapkan media dan mengunggah ke server...');

    try {
      const formData = new FormData();
      if (title.trim()) formData.append('title', title.trim());
      if (folderId) formData.append('folder_id', folderId);
      if (noteText.trim()) formData.append('note_text', noteText.trim());

      images.forEach((img) => {
        formData.append('images[]', img);
      });

      if (audioFile) {
        formData.append('audio', audioFile);
      }

      setStatusStep('Google Gemini AI sedang mensintesis foto papan tulis & suara guru...');

      const res = await createArsipNote(formData);

      if (res.success) {
        toast.success(res.message || 'Catatan berhasil disintesis dan disimpan!');
        if (res.ai_warning) {
          toast(res.ai_warning, { icon: 'ℹ️' });
        }
        onSuccess(res.note);
        onClose();
      } else {
        toast.error(res.message || 'Gagal menyimpan catatan.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan sistem.';
      toast.error(`Gagal membuat catatan: ${msg}`);
    } finally {
      setIsSubmitting(false);
      setStatusStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 w-full max-w-3xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Arsip Belajar AI Studio</h2>
              <p className="text-xs text-slate-500">
                Sintesis Multimodal: Foto papan tulis + rekaman suara guru + catatan materi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Folder Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Judul Materi / Topik
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Kosongkan jika ingin AI membuatkan judul otomatis..."
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Simpan di Folder
              </label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-700"
              >
                <option value="">(Root / Tanpa Folder)</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Multimodal Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input 1: Foto Papan Tulis / Gambar */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      1. Foto Papan Tulis / Modul
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                    {images.length} Foto
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Unggah coretan rumus, bagan, atau tulisan papan tulis dari guru.
                </p>

                {/* Previews Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-200 shadow-xs">
                        <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Pilih / Ambil Foto</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleAddImages(e.target.files)}
                  />
                </label>
              </div>
            </div>

            {/* Input 2: Rekaman Suara Guru / Audio */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <Mic className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      2. Rekaman Suara Guru
                    </span>
                  </div>
                  {audioFile && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Tersedia
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mb-3">
                  Rekam penjelasan lisan guru atau unggah file suara (MP3/WAV/WebM).
                </p>

                {/* Live Recorder UI */}
                {isRecording && (
                  <div className="p-3 mb-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-bold text-rose-700">
                        Merekam Suara: {formatTimer(recordingSeconds)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs hover:bg-rose-700"
                    >
                      <Square className="w-3 h-3 fill-current" /> Selesai
                    </button>
                  </div>
                )}

                {/* Audio File Player Preview */}
                {!isRecording && audioPreviewUrl && (
                  <div className="p-2 mb-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2 truncate">
                      <audio controls src={audioPreviewUrl} className="h-8 w-44" />
                    </div>
                    <button
                      type="button"
                      onClick={removeAudio}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-md"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {!isRecording && !audioFile && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={startRecording}
                    className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center justify-center gap-1.5 transition-colors text-xs font-semibold"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Mulai Rekam</span>
                  </button>
                  <label className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                    <Upload className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Upload Audio</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAudioFile(file);
                          setAudioPreviewUrl(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Input 3: Teks Catatan Tambahan Siswa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                3. Catatan Teks Siswa (Opsional)
              </label>
              <span className="text-[10px] text-slate-400">
                Poin ketikan dari Anda sendiri untuk digabungkan oleh AI
              </span>
            </div>
            <textarea
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ketik catatan tambahan, pertanyaan penting, atau garis besar yang ingin digabungkan bersama foto & rekaman guru..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm leading-relaxed"
            />
          </div>

          {/* AI Progress Box */}
          {isSubmitting && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-3 animate-in fade-in">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin shrink-0" />
              <div className="text-xs font-semibold text-indigo-900">
                <p>{statusStep}</p>
                <p className="text-[10px] text-indigo-600 mt-0.5">
                  Proses sintesis multimodal menggabungkan tulisan papan tulis dan suara guru menjadi 1 catatan materi terpadu.
                </p>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSubmitting ? 'Mensintesis Materi...' : 'Sintesis dengan AI & Simpan'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
