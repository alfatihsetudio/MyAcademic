<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Progress SPMB - SMA Persis Serang</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 min-h-screen font-sans antialiased">
    <div class="max-w-7xl mx-auto px-3 py-4 sm:px-4 sm:py-6 space-y-4 sm:space-y-6">
        <div>
            <h2 class="text-[15px] sm:text-xl md:text-2xl font-bold text-gray-900">Progress SPMB SMA Persis Serang</h2>
            <p class="text-[11px] sm:text-sm text-gray-500 mt-0.5">SMA Persis Serang Islamic Boarding School</p>
            @if($currentYear)
                <p class="text-[10px] sm:text-xs text-gray-400 mt-1">Tahun Ajaran {{ $currentYear->academic_year }} &middot; Diperbarui {{ $now->isoFormat('D MMMM YYYY HH:mm') }} WIB</p>
            @endif
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
            <div class="bg-white rounded-xl border border-emerald-200 shadow-sm p-3 sm:p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[10px] sm:text-sm font-medium text-slate-500">Total Pendaftar</p>
                        <p class="text-xl sm:text-3xl font-bold text-emerald-700 mt-1">{{ $total }}</p>
                    </div>
                    <div class="w-7 h-7 sm:w-10 sm:h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">Seluruh pendaftar SPMB</p>
            </div>

            <div class="bg-white rounded-xl border border-green-200 shadow-sm p-3 sm:p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[10px] sm:text-sm font-medium text-slate-500">Diterima</p>
                        <p class="text-xl sm:text-3xl font-bold text-green-700 mt-1">{{ $terisi }}</p>
                    </div>
                    <div class="w-7 h-7 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">Siswa baru diterima</p>
            </div>

            <div class="bg-white rounded-xl border border-amber-200 shadow-sm p-3 sm:p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[10px] sm:text-sm font-medium text-slate-500">Sisa Kuota</p>
                        <p class="text-xl sm:text-3xl font-bold text-amber-700 mt-1">{{ $sisa }}</p>
                    </div>
                    <div class="w-7 h-7 sm:w-10 sm:h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">Dari {{ $quota }} total kuota</p>
            </div>

            <div class="bg-white rounded-xl border border-yellow-200 shadow-sm p-3 sm:p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-[10px] sm:text-sm font-medium text-slate-500">Status SPMB</p>
                        <p class="text-[11px] sm:text-sm font-semibold mt-1 sm:mt-2">
                            @if($currentYear)
                                <span class="inline-flex items-center gap-1.5 text-green-700">
                                    <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"></span>
                                    {{ $currentYear->status === 'open' ? 'Dibuka' : ucfirst($currentYear->status) }}
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1.5 text-slate-500">
                                    <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-300"></span>
                                    Tidak Aktif
                                </span>
                            @endif
                        </p>
                    </div>
                    <div class="w-7 h-7 sm:w-10 sm:h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">{{ $currentYear ? $currentYear->academic_year : '-' }}</p>
            </div>
        </div>

        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Pendaftar Berdasarkan Jenis Kelamin</h3>
            <div class="grid grid-cols-2 gap-2 sm:gap-3">
                <div class="bg-white rounded-xl border border-blue-200 shadow-sm p-3 sm:p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[10px] sm:text-sm font-medium text-slate-500">Laki-laki</p>
                            <p class="text-xl sm:text-3xl font-bold text-blue-700 mt-1">{{ $totalLakiLaki ?? 0 }}</p>
                        </div>
                        <div class="w-7 h-7 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">Pendaftar laki-laki</p>
                </div>
                <div class="bg-white rounded-xl border border-pink-200 shadow-sm p-3 sm:p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <p class="text-[10px] sm:text-sm font-medium text-slate-500">Perempuan</p>
                            <p class="text-xl sm:text-3xl font-bold text-pink-700 mt-1">{{ $totalPerempuan ?? 0 }}</p>
                        </div>
                        <div class="w-7 h-7 sm:w-10 sm:h-10 bg-pink-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg class="w-3.5 h-3.5 sm:w-5 sm:h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">Pendaftar perempuan</p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Statistik Kunjungan Website</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                <div class="bg-white rounded-xl border border-indigo-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">Hari Ini</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-indigo-700 mt-1">{{ $visitorToday }}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">{{ $visitorTodayUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-blue-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">7 Hari</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-blue-700 mt-1">{{ $visitor7Days }}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">{{ $visitor7DaysUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-sky-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">30 Hari</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-sky-700 mt-1">{{ $visitor30Days }}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">{{ $visitor30DaysUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-violet-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">Total Kunjungan</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-violet-700 mt-1">{{ $totalVisits }}</p>
                </div>
                <div class="bg-white rounded-xl border border-purple-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">Kunjungan SPMB</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-purple-700 mt-1">{{ $spmbVisits }}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">/spmb & /ppdb</p>
                </div>
                <div class="bg-white rounded-xl border border-fuchsia-200 shadow-sm p-3 sm:p-4">
                    <p class="text-[10px] sm:text-xs font-medium text-slate-500">Kunjungan Donasi Pendidikan</p>
                    <p class="text-lg sm:text-xl md:text-2xl font-bold text-fuchsia-700 mt-1">{{ $donasiVisits }}</p>
                    <p class="text-[10px] sm:text-xs text-slate-400 mt-0.5">/donasi-pendidikan</p>
                </div>
            </div>
        </div>

        @if($topPages->isNotEmpty())
        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Halaman Terpopuler</h3>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-left font-semibold text-gray-600">Halaman</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-gray-600 w-16 sm:w-24">Kunjungan</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-right font-semibold text-gray-600 w-28 sm:w-40">Terakhir</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach($topPages as $page)
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-2 py-2 sm:px-4 sm:py-3 font-medium text-gray-900 max-w-[120px] sm:max-w-xs truncate">{{ $page->path ?: '/' }}</td>
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-center text-gray-700">{{ $page->total }}</td>
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-right text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">{{ \Carbon\Carbon::parse($page->last_visited)->diffForHumans() }}</td>
                            </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        @endif

        @if($topReferrers->isNotEmpty())
        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Sumber Trafik Teratas</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                @foreach($topReferrers as $ref)
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 flex items-center justify-between">
                    <span class="text-xs sm:text-sm text-gray-700 truncate max-w-[75%] sm:max-w-[80%]">{{ $ref->referrer }}</span>
                    <span class="text-xs sm:text-sm font-semibold text-gray-900">{{ $ref->total }}</span>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        @if($deviceStats->isNotEmpty())
        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Perangkat Pengunjung</h3>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
                @foreach($deviceStats as $dev)
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4 text-center">
                    <p class="text-base sm:text-lg md:text-xl font-bold text-gray-900">{{ $dev->total }}</p>
                    <p class="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 capitalize">{{ $dev->device }}</p>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        <div>
            <h3 class="text-[11px] sm:text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2 sm:mb-3">Daftar Murid Yang Sudah Mendaftar</h3>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-left font-semibold text-gray-600 w-8 sm:w-12">No</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-left font-semibold text-gray-600">Nama Murid</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-gray-600 w-12 sm:w-24">JK</th>
                                <th class="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-left font-semibold text-gray-600">Asal Sekolah</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-center font-semibold text-gray-600 w-24 sm:w-32">Status</th>
                                <th class="px-2 py-2 sm:px-4 sm:py-3 text-right font-semibold text-gray-600 w-24 sm:w-36">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @forelse($students as $student)
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-gray-500">{{ $loop->iteration }}</td>
                                <td class="px-2 py-2 sm:px-4 sm:py-3 font-medium text-gray-900">{{ $student->student_name }}</td>
                                @php
                                    $_g = strtolower(trim($student->gender ?? ''));
                                    $_labelJk = match (true) {
                                        in_array($_g, ['l', 'laki-laki', 'laki_laki', 'laki laki', 'male']) => 'Laki-laki',
                                        in_array($_g, ['p', 'perempuan', 'female']) => 'Perempuan',
                                        default => '-',
                                    };
                                    $_shortJk = match (true) {
                                        in_array($_g, ['l', 'laki-laki', 'laki_laki', 'laki laki', 'male']) => 'L',
                                        in_array($_g, ['p', 'perempuan', 'female']) => 'P',
                                        default => '-',
                                    };
                                @endphp
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-center text-gray-700">
                                    <span class="sm:hidden">{{ $_shortJk }}</span>
                                    <span class="hidden sm:inline">{{ $_labelJk }}</span>
                                </td>
                                <td class="hidden sm:table-cell px-2 py-2 sm:px-4 sm:py-3 text-gray-700">{{ $student->previous_school ?: '-' }}</td>
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-center">
                                    @php
                                        $status = $student->status;
                                        $label = $statusLabels[$status] ?? ucfirst($status);
                                        $badgeClass = match($status) {
                                            'diterima' => 'bg-green-100 text-green-700',
                                            'terverifikasi' => 'bg-blue-100 text-blue-700',
                                            'menunggu_verifikasi' => 'bg-yellow-100 text-yellow-700',
                                            'baru_daftar' => 'bg-slate-100 text-slate-700',
                                            'data_kurang' => 'bg-orange-100 text-orange-700',
                                            'ditolak' => 'bg-red-100 text-red-700',
                                            default => 'bg-gray-100 text-gray-700',
                                        };
                                    @endphp
                                    <span class="inline-flex items-center px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-medium {{ $badgeClass }}">
                                        {{ $label }}
                                    </span>
                                </td>
                                <td class="px-2 py-2 sm:px-4 sm:py-3 text-right text-gray-400 text-[10px] sm:text-xs whitespace-nowrap">{{ $student->created_at->isoFormat('D MMM YYYY') }}</td>
                            </tr>
                            @empty
                            <tr>
                                <td colspan="6" class="px-2 py-6 sm:px-4 sm:py-8 text-center text-xs sm:text-sm text-gray-400">
                                    Belum ada data murid yang ditampilkan.
                                </td>
                            </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="text-center text-xs text-gray-400 py-4">
            Dashboard Progress Publik SMA Persis Serang
        </div>
    </div>
</body>
</html>
