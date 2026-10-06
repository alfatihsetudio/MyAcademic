'use client';

import React, { useState } from 'react';
import { X, UploadCloud, CheckCircle } from 'lucide-react';
import { submitTask } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId?: number;
  assignmentTitle?: string;
  onSuccess?: () => void;
}

export default function SubmitTaskModal({
  isOpen,
  onClose,
  assignmentId = 1,
  assignmentTitle = 'Praktikum Kimia Stoikiometri',
  onSuccess,
}: SubmitTaskModalProps) {
  const [driveLink, setDriveLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitTask(assignmentId, driveLink, notes);
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1200);
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error('Gagal mengumpulkan tugas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Pengumpulan Tugas
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Tugas: <strong className="text-slate-700">{assignmentTitle}</strong>
        </p>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
            <div className="text-sm font-bold text-slate-800">Tugas Berhasil Diserahkan!</div>
            <div className="text-xs text-slate-500 mt-1">Data Anda tersimpan di sistem.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link File (Google Drive / OneDrive)
              </label>
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/..."
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Pastikan akses link telah diubah menjadi &apos;Anyone with link can view&apos;.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Tambahan untuk Guru (Opsional)
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan catatan pengerjaan jika ada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-black text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                {isSubmitting ? 'Mengirim...' : 'Kirim Tugas'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
