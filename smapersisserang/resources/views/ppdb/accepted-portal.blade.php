<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Selamat Anda Diterima - SMA Persis Serang</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden text-center p-8 sm:p-10">
        <div class="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>

        <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-3">
            Status: Santri / Murid Aktif
        </span>

        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-3">
            Selamat, {{ auth()->user()->name }}!
        </h1>
        <p class="text-slate-600 mb-6 leading-relaxed">
            Anda telah resmi dinyatakan <strong>Diterima</strong> sebagai santri SMA Persis Serang. Seluruh proses pembelajaran, presensi, jadwal pelajaran, dan administrasi akademik kini dikelola melalui platform <strong>My Academic</strong>.
        </p>

        <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 text-left">
            <h2 class="text-sm font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informasi Akses Portal My Academic:
            </h2>
            <ul class="text-xs text-emerald-800 space-y-1.5 list-disc list-inside">
                <li>Gunakan email terdaftar: <span class="font-mono font-semibold">{{ auth()->user()->email }}</span></li>
                <li>Gunakan kata sandi yang sama dengan akun SPMB Anda.</li>
                <li>Akses modul LMS, materi, tugas, dan kartu santri digital di portal utama.</li>
            </ul>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="{{ config('app.myacademic_portal_url', 'http://localhost:3000') }}"
               class="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-200 transition-all text-sm">
                <span>Buka Portal My Academic</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </a>
            <form method="POST" action="{{ route('logout') }}" class="inline">
                @csrf
                <button type="submit" class="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition">
                    Keluar / Logout
                </button>
            </form>
        </div>
    </div>
</body>
</html>
