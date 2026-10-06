@php
$currentYear = \App\Models\AdmissionYear::where('is_current', true)->first();
$counts = \App\Models\StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
    ->selectRaw("status, count(*) as total")
    ->groupBy('status')
    ->pluck('total', 'status');
$quota = $currentYear?->quota ?? 0;
$terisi = $counts->get('diterima', 0);
$sisa = max(0, $quota - $terisi);
$total = array_sum($counts->toArray()) ?: 0;
$menunggu = $counts->get('menunggu_verifikasi', 0) + $counts->get('baru_daftar', 0);
@endphp

<x-admin-layout>
    <div class="space-y-6">
        <div>
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h2a1 1 0 001-1v-7m-6 0h6"></path>
                    </svg>
                </div>
                <div>
                    <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Admin</h2>
                    <p class="text-sm text-gray-500 mt-0.5">SMA Persis Serang Islamic Boarding School</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Pendaftar</p>
                        <p class="text-3xl font-bold text-emerald-700 mt-1">{{ $total }}</p>
                    </div>
                    <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Seluruh pendaftar SPMB</p>
            </div>

            <div class="bg-white rounded-xl border border-green-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Diterima</p>
                        <p class="text-3xl font-bold text-green-700 mt-1">{{ $terisi }}</p>
                    </div>
                    <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Siswa baru diterima</p>
            </div>

            <div class="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Sisa Kuota</p>
                        <p class="text-3xl font-bold text-amber-700 mt-1">{{ $sisa }}</p>
                    </div>
                    <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Dari {{ $quota }} total kuota</p>
            </div>

            <div class="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Status SPMB</p>
                        <p class="text-sm font-semibold mt-2">
                            @if($currentYear)
                                <span class="inline-flex items-center gap-1.5 text-green-700">
                                    <span class="w-2 h-2 rounded-full bg-green-500"></span>
                                    {{ $currentYear->status === 'open' ? 'Dibuka' : ucfirst($currentYear->status) }}
                                </span>
                            @else
                                <span class="inline-flex items-center gap-1.5 text-slate-500">
                                    <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                                    Tidak Aktif
                                </span>
                            @endif
                        </p>
                    </div>
                    <div class="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">{{ $currentYear ? $currentYear->academic_year : '-' }}</p>
            </div>
        </div>

        <div>
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Statistik Kunjungan Website</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div class="bg-white rounded-xl border border-indigo-200 shadow-sm p-4">
                    <p class="text-xs font-medium text-slate-500">Hari Ini</p>
                    <p class="text-2xl font-bold text-indigo-700 mt-1">{{ $visitorToday }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ $visitorTodayUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-blue-200 shadow-sm p-4">
                    <p class="text-xs font-medium text-slate-500">7 Hari</p>
                    <p class="text-2xl font-bold text-blue-700 mt-1">{{ $visitor7Days }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ $visitor7DaysUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-sky-200 shadow-sm p-4">
                    <p class="text-xs font-medium text-slate-500">30 Hari</p>
                    <p class="text-2xl font-bold text-sky-700 mt-1">{{ $visitor30Days }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">{{ $visitor30DaysUnique }} unique</p>
                </div>
                <div class="bg-white rounded-xl border border-violet-200 shadow-sm p-4">
                    <p class="text-xs font-medium text-slate-500">Total Kunjungan</p>
                    <p class="text-2xl font-bold text-violet-700 mt-1">{{ $totalVisits }}</p>
                </div>
                <div class="bg-white rounded-xl border border-purple-200 shadow-sm p-4">
                    <p class="text-xs font-medium text-slate-500">Kunjungan SPMB</p>
                    <p class="text-2xl font-bold text-purple-700 mt-1">{{ $spmbVisits }}</p>
                    <p class="text-xs text-slate-400 mt-0.5">/spmb & /ppdb</p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Menu Cepat</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a href="{{ route('admin.ppdb.dashboard') }}"
                   class="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                    <div class="w-11 h-11 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">Dashboard SPMB</h4>
                        <p class="text-xs text-gray-500 mt-0.5">Ringkasan pendaftaran SPMB</p>
                    </div>
                </a>

                <a href="{{ route('admin.ppdb.applications.index') }}"
                   class="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-emerald-300 hover:shadow-md transition-all group">
                    <div class="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Pendaftar SPMB</h4>
                        <p class="text-xs text-gray-500 mt-0.5">Kelola data pendaftar</p>
                    </div>
                </a>

                <a href="{{ route('ppdb.create') }}"
                   class="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-300 hover:shadow-md transition-all group">
                    <div class="w-11 h-11 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">Form SPMB Publik</h4>
                        <p class="text-xs text-gray-500 mt-0.5">Halaman pendaftaran siswa baru</p>
                    </div>
                </a>

                <a href="{{ url('/') }}"
                   class="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-slate-300 hover:shadow-md transition-all group">
                    <div class="w-11 h-11 bg-slate-50 rounded-lg flex items-center justify-center group-hover:bg-slate-100 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900 group-hover:text-slate-700 transition-colors">Website Publik</h4>
                        <p class="text-xs text-gray-500 mt-0.5">Lihat halaman depan website</p>
                    </div>
                </a>

                <a href="{{ route('public.struktur-organisasi') }}"
                   class="flex items-center gap-4 bg-white rounded-xl border border-gray-200 p-4 hover:border-teal-300 hover:shadow-md transition-all group">
                    <div class="w-11 h-11 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 6h6M9 12h6m-6 6h6M5 6h.01M5 12h.01M5 18h.01M19 6h.01M19 12h.01M19 18h.01"/>
                        </svg>
                    </div>
                    <div>
                        <h4 class="text-sm font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">Struktur Organisasi</h4>
                        <p class="text-xs text-gray-500 mt-0.5">Isi struktur organisasi saat ini masih diedit dari kode di PublicPageController.</p>
                    </div>
                </a>
            </div>
        </div>

        @if($topPages->isNotEmpty())
        <div>
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Halaman Terpopuler</h3>
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-4 py-3 text-left font-semibold text-gray-600">Halaman</th>
                                <th class="px-4 py-3 text-center font-semibold text-gray-600 w-24">Kunjungan</th>
                                <th class="px-4 py-3 text-right font-semibold text-gray-600 w-40">Terakhir Dikunjungi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach($topPages as $page)
                            <tr class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">
                                    <a href="{{ $page->url }}" target="_blank" class="hover:text-emerald-700">{{ $page->path ?: '/' }}</a>
                                </td>
                                <td class="px-4 py-3 text-center text-gray-700">{{ $page->total }}</td>
                                <td class="px-4 py-3 text-right text-gray-400 text-xs whitespace-nowrap">{{ \Carbon\Carbon::parse($page->last_visited)->diffForHumans() }}</td>
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
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Sumber Trafik Teratas</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @foreach($topReferrers as $ref)
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
                    <span class="text-sm text-gray-700 truncate max-w-[80%]">{{ $ref->referrer }}</span>
                    <span class="text-sm font-semibold text-gray-900">{{ $ref->total }}</span>
                </div>
                @endforeach
            </div>
        </div>
        @endif

        @if($deviceStats->isNotEmpty())
        <div>
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Perangkat</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                @foreach($deviceStats as $dev)
                <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center">
                    <p class="text-xl font-bold text-gray-900">{{ $dev->total }}</p>
                    <p class="text-xs text-gray-500 mt-1 capitalize">{{ $dev->device }}</p>
                </div>
                @endforeach
            </div>
        </div>
        @endif
    </div>
</x-admin-layout>
