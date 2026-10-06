@extends('layouts.public')

@section('content')
<div class="min-h-screen bg-gradient-to-b from-emerald-50/50 to-white py-12 sm:py-16">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-8 sm:mb-10">
            <div class="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg class="w-7 h-7 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Cek Status Pendaftaran</h1>
            <p class="text-gray-500 mt-2 text-sm sm:text-base">
                Masukkan nomor pendaftaran atau nomor WhatsApp orang tua untuk mengecek status pendaftaran.
            </p>
        </div>

        @isset($application)
            <div class="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden mb-8">
                <div class="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-white/80 text-xs font-medium uppercase tracking-wider">Status Pendaftaran</p>
                            <p class="text-white font-semibold text-lg">{{ $application->student_name }}</p>
                        </div>
                    </div>
                </div>

                <div class="p-6 space-y-5">
                    <div class="flex flex-col items-center text-center border-b border-gray-100 pb-5">
                        <p class="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Nomor Pendaftaran</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 font-mono tracking-wider">{{ $application->registration_number }}</p>
                    </div>

                    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
                        <p class="text-sm font-semibold text-emerald-800 uppercase tracking-wider mb-1">Status</p>
                        <p class="text-xl font-bold text-emerald-700">{{ $statusLabel }}</p>
                    </div>

                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                        <svg class="w-5 h-5 text-amber-600 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p class="text-sm text-amber-800">{{ $statusMessage }}</p>
                    </div>

                    @if($application->status === 'diterima')
                        <div class="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-5 text-center shadow-md">
                            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-lg font-bold">Selamat! Anda Telah Resmi Diterima</h3>
                            <p class="text-xs text-emerald-100 mt-1 max-w-md mx-auto">
                                Akun siswa aktif Anda telah dibuat di database sekolah. Silakan masuk ke Portal Akademik Utama (My Academic) untuk mengakses kelas, jadwal, dan administrasi siswa.
                            </p>
                            <div class="mt-4">
                                <a href="http://localhost:3000/login" target="_blank"
                                   class="inline-flex items-center gap-2 bg-white text-emerald-800 px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-emerald-50 transition-all">
                                    <span>Masuk ke Portal My Academic</span>
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    @endif

                    <div class="grid grid-cols-2 gap-4 pt-2">
                        <div class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs text-gray-400 uppercase tracking-wider font-medium">Program</p>
                            <p class="text-sm font-semibold text-gray-900 mt-1">{{ $application->admissionProgram->name }}</p>
                        </div>
                        <div class="bg-gray-50 rounded-xl p-4">
                            <p class="text-xs text-gray-400 uppercase tracking-wider font-medium">Tahun Ajaran</p>
                            <p class="text-sm font-semibold text-gray-900 mt-1">{{ $application->admissionYear->academic_year }}</p>
                        </div>
                    </div>

                    <div class="bg-gray-50 rounded-xl p-4">
                        <p class="text-xs text-gray-400 uppercase tracking-wider font-medium">Tanggal Daftar</p>
                        <p class="text-sm font-semibold text-gray-900 mt-1">{{ $application->submitted_at->format('d/m/Y H:i') }}</p>
                    </div>
                </div>

                <div class="px-6 pb-6">
                    <a href="{{ route('ppdb.status.form') }}"
                       class="block w-full py-3 text-center text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors">
                        Cek Status Lain
                    </a>
                </div>
            </div>
        @else
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <form method="POST" action="{{ route('ppdb.status.check') }}" class="space-y-6">
                    @csrf

                    @if($errors->has('search'))
                        <div class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-sm text-red-700">{{ $errors->first('search') }}</p>
                        </div>
                    @endif

                    <div>
                        <label for="registration_number" class="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nomor Pendaftaran
                        </label>
                        <input type="text"
                               id="registration_number"
                               name="registration_number"
                               value="{{ old('registration_number') }}"
                               placeholder="Contoh: SPMB-2026-0001"
                               class="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors @error('registration_number') border-red-300 @enderror">
                        @error('registration_number')
                            <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="relative">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-gray-200"></div>
                        </div>
                        <div class="relative flex justify-center">
                            <span class="bg-white px-3 text-xs text-gray-400 font-medium">ATAU</span>
                        </div>
                    </div>

                    <div>
                        <label for="parent_whatsapp" class="block text-sm font-semibold text-gray-700 mb-1.5">
                            Nomor WhatsApp Orang Tua
                        </label>
                        <input type="text"
                               id="parent_whatsapp"
                               name="parent_whatsapp"
                               value="{{ old('parent_whatsapp') }}"
                               placeholder="Contoh: 081234567890"
                               class="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors @error('parent_whatsapp') border-red-300 @enderror">
                        @error('parent_whatsapp')
                            <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
                        @enderror
                    </div>

                    <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                        <div class="flex items-start gap-3">
                            <svg class="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p class="text-xs text-emerald-700 leading-relaxed">
                                Isi salah satu kolom di atas. Jika mengisi keduanya, pencarian akan menggunakan nomor pendaftaran.
                            </p>
                        </div>
                    </div>

                    <button type="submit"
                            class="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm sm:text-base">
                        Cek Status Sekarang
                    </button>
                </form>
            </div>
        @endisset
    </div>
</div>
@endsection
