'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Copy,
  Sparkles,
  Camera,
  Mic,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { fetchArsipWaStatus, linkArsipWa, unlinkArsipWa } from '@/lib/api';

interface WhatsAppLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WhatsAppLinkModal({
  isOpen,
  onClose,
}: WhatsAppLinkModalProps) {
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'unlinked' | 'pending' | 'verified'>('unlinked');
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetchArsipWaStatus();
      if (res.success) {
        setStatus(res.status || 'unlinked');
        setVerifiedPhone(res.phone || null);
        setToken(res.verify_token || null);
        if (res.phone && !phone) setPhone(res.phone);
      }
    } catch (e) {
      // quiet fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Masukkan nomor WhatsApp Anda.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await linkArsipWa(phone.trim());
      if (res.success) {
        setStatus('pending');
        setToken(res.token);
        setVerifiedPhone(res.phone);
        toast.success('Kode aktivasi berhasil dibuat! Kirim ke bot untuk menyelesaikan.');
      } else {
        toast.error(res.message || 'Gagal membuat kode aktivasi.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Apakah Anda yakin ingin melepas tautan WhatsApp ini?')) return;
    setIsLoading(true);
    try {
      const res = await unlinkArsipWa();
      if (res.success) {
        setStatus('unlinked');
        setToken(null);
        setVerifiedPhone(null);
        setPhone('');
        toast.success('Tautan WhatsApp berhasil dilepas.');
      }
    } catch (e) {
      toast.error('Gagal melepas tautan WhatsApp.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Disalin ke clipboard!');
  };

  const activationMsg = `Aktivasi Akun MyAcademic saya: ${token || 'MYACAD-XXXX'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-xl border border-white/80 w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Integrasi WhatsApp Siswa</h2>
              <p className="text-xs text-slate-500">
                Tautkan nomor WA agar bisa menyimpan catatan & media langsung via chat.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Capsule */}
          <div className="p-4 rounded-2xl border flex items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Status Koneksi WhatsApp
              </p>
              <div className="flex items-center gap-2 mt-1">
                {status === 'verified' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Terverifikasi & Aktif ({verifiedPhone})
                  </span>
                ) : status === 'pending' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                    Menunggu Verifikasi Pesan
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                    Belum Terhubung
                  </span>
                )}
              </div>
            </div>

            {status !== 'unlinked' && (
              <button
                type="button"
                onClick={handleUnlink}
                disabled={isLoading}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Putuskan
              </button>
            )}
          </div>

          {/* Form Link Phone */}
          {status === 'unlinked' && (
            <form onSubmit={handleLink} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Nomor WhatsApp Anda
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
                <p className="text-[11px] text-slate-400">
                  Gunakan nomor WhatsApp aktif yang ada di ponsel Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isLoading ? 'Membuat Token...' : 'Tautkan Nomor WhatsApp'}</span>
              </button>
            </form>
          )}

          {/* Token Box for Pending Verification */}
          {status === 'pending' && token && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 space-y-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Langkah Terakhir: Aktivasi Akun
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Kirim pesan teks aktivasi di bawah ini ke nomor Bot WhatsApp MyAcademic agar nomor Anda terverifikasi secara resmi.
                </p>
              </div>

              <div className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between gap-2 shadow-xs font-mono text-xs text-slate-800">
                <span className="truncate">{activationMsg}</span>
                <button
                  type="button"
                  onClick={() => copyText(activationMsg)}
                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors shrink-0"
                  title="Salin Pesan"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={loadStatus}
                  className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" /> Cek Status Sekarang
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(activationMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Buka WhatsApp</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Feature Highlights / How It Works */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kemudahan Belajar Lewat WhatsApp
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Kirim Foto Papan</h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Cukup potret papan tulis guru, AI otomatis merapikan materi ke Space Belajar.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Kirim Voice Note</h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Kirim rekaman suara penjelasan guru untuk diekstrak menjadi teks catatan materi.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h5 className="text-xs font-bold text-slate-800">Tanya Jawab AI</h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tanyakan apapun ke bot WA dan jawabannya akan diambil dari catatan belajarmu.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
