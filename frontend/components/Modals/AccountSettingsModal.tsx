'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Trash2,
  Plus,
  Loader2,
  ShieldCheck,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { updateAccount } from '@/lib/api';
import {
  checkBiometricSupport,
  fetchUserPasskeys,
  registerBiometricPasskey,
  deleteUserPasskey,
  PasskeyItem,
} from '@/lib/webauthn';
import { User } from '@/lib/types';
import { toast } from 'react-hot-toast';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserUpdated?: (updated: User) => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'passkey'>('profile');

  // Profile Form States
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // Biometric / Passkey States
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [passkeysLoading, setPasskeysLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [customKeyName, setCustomKeyName] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [biometricSupport, setBiometricSupport] = useState<{
    supported: boolean;
    platformAuthenticator: boolean;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkBiometricSupport().then(setBiometricSupport);
      loadPasskeys();
    }
  }, [isOpen]);

  const loadPasskeys = async () => {
    setPasskeysLoading(true);
    try {
      const list = await fetchUserPasskeys();
      setPasskeys(list);
    } catch {
      // ignore
    } finally {
      setPasskeysLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    try {
      const res = await registerBiometricPasskey(customKeyName.trim() || undefined);
      if (res.success) {
        toast.success(res.message || 'Sidik jari berhasil didaftarkan!');
        setCustomKeyName('');
        setShowAddInput(false);
        await loadPasskeys();
      } else {
        toast.error(res.message || 'Pendaftaran sidik jari gagal.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan saat registrasi biometrik.');
    } finally {
      setRegistering(false);
    }
  };

  const handleDeletePasskey = async (id: number, name: string) => {
    if (!confirm(`Hapus sidik jari "${name}" dari akun ini?`)) return;

    try {
      const res = await deleteUserPasskey(id);
      if (res.success) {
        toast.success(res.message);
        setPasskeys((prev) => prev.filter((p) => p.id !== id));
      } else {
        toast.error(res.message || 'Gagal menghapus.');
      }
    } catch {
      toast.error('Gagal menghapus sidik jari.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await updateAccount({
        name,
        email,
        current_password: currentPassword || undefined,
        new_password: newPassword || undefined,
        new_password_confirmation: confirmPassword || undefined,
      });

      setLoading(false);

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        if (currentUser && onUserUpdated) {
          onUserUpdated({ ...currentUser, name, email });
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    } catch {
      setLoading(false);
      setStatusMessage({ type: 'error', text: 'Terjadi kesalahan pada server.' });
      toast.error('Gagal memperbarui pengaturan.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Pengaturan Akun & Keamanan
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Kelola profil pengguna, kata sandi, dan autentikasi biometrik sidik jari
        </p>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 mb-5 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`pb-2 text-xs font-semibold transition border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Profil & Kata Sandi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('passkey')}
            className={`pb-2 text-xs font-semibold transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'passkey'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Sidik Jari & Passkey</span>
            {passkeys.length > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {passkeys.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Profil & Password */}
        {activeTab === 'profile' && (
          <div>
            {statusMessage && (
              <div
                className={`p-3 rounded-2xl mb-4 text-xs flex items-center gap-2 ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Ubah Password (Kosongkan jika tidak diubah):
                </span>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Password Saat Ini</label>
                    <input
                      type="password"
                      placeholder="Isi jika mengganti password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Password Baru</label>
                      <input
                        type="password"
                        placeholder="Min. 6 karakter"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-600 mb-0.5">Konfirmasi</label>
                      <input
                        type="password"
                        placeholder="Ulangi baru"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-black text-white flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Sidik Jari & Passkey */}
        {activeTab === 'passkey' && (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-emerald-950 mb-0.5">
                  Login Cepat Tanpa Kata Sandi (Passkey)
                </div>
                <p className="text-emerald-800/80 leading-relaxed">
                  Daftarkan sensor sidik jari perangkat ini (Windows Hello, Touch ID, atau Android Fingerprint) untuk masuk dalam satu sentuhan.
                </p>
              </div>
            </div>

            {/* Browser Support Check */}
            {biometricSupport && !biometricSupport.supported && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Browser ini belum mendukung WebAuthn. Gunakan browser modern (Chrome, Edge, Safari, Firefox).</span>
              </div>
            )}

            {/* List of Registered Passkeys */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Kredensial Sidik Jari Terdaftar
                </span>
                {!showAddInput && (
                  <button
                    type="button"
                    onClick={() => setShowAddInput(true)}
                    className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tambah Baru
                  </button>
                )}
              </div>

              {/* Add Input Prompt */}
              {showAddInput && (
                <div className="mb-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl animate-in fade-in">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Beri Nama Perangkat (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Laptop Kerja, HP Samsung, Touch ID Mac"
                    value={customKeyName}
                    onChange={(e) => setCustomKeyName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-500 outline-none mb-2.5"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddInput(false);
                        setCustomKeyName('');
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleRegisterPasskey}
                      disabled={registering}
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                    >
                      {registering ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sentuh Sensor...</span>
                        </>
                      ) : (
                        <>
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>Sentuh Sensor Sidik Jari</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {passkeysLoading ? (
                <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                  <span>Memuat daftar sidik jari...</span>
                </div>
              ) : passkeys.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                  <Fingerprint className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-medium text-slate-600 mb-1">
                    Belum ada sidik jari yang terdaftar
                  </p>
                  <p className="text-[11px] text-slate-400 mb-3">
                    Daftarkan sensor sidik jari laptop atau HP Anda sekarang untuk pengalaman login instan.
                  </p>
                  {!showAddInput && (
                    <button
                      type="button"
                      onClick={() => setShowAddInput(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Daftarkan Sidik Jari Sekarang
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {passkeys.map((p) => {
                    const isMobile = p.name.toLowerCase().includes('android') || p.name.toLowerCase().includes('apple') || p.name.toLowerCase().includes('iphone');
                    const IconComponent = isMobile ? Smartphone : Laptop;

                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-xl flex items-center justify-between transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <span>{p.name}</span>
                              <span className="text-[10px] font-normal px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                                Aktif
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Didaftarkan: {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {p.last_used_at && (
                                <span> • Digunakan: {new Date(p.last_used_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeletePasskey(p.id, p.name)}
                          title="Hapus sidik jari ini"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Security Assurance */}
            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Privasi Terjamin:</strong> Data sidik jari biologis tersimpan aman di Secure Enclave / TPM perangkat Anda dan tidak pernah dikirim ke server. Server hanya menyimpan kunci verifikasi kriptografi FIDO2/WebAuthn.
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
