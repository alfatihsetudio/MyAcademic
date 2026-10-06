@php
$statusColors = [
    'baru_daftar' => 'bg-blue-100 text-blue-800',
    'menunggu_verifikasi' => 'bg-yellow-100 text-yellow-800',
    'data_kurang' => 'bg-orange-100 text-orange-800',
    'terverifikasi' => 'bg-green-100 text-green-800',
    'wawancara' => 'bg-purple-100 text-purple-800',
    'lulus' => 'bg-emerald-100 text-emerald-800',
    'cadangan' => 'bg-gray-100 text-gray-800',
    'tidak_lulus' => 'bg-red-100 text-red-800',
    'diterima' => 'bg-indigo-100 text-indigo-800',
    'mengundurkan_diri' => 'bg-pink-100 text-pink-800',
];
@endphp

<x-admin-layout>
    <div class="space-y-6">
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Dashboard SPMB</h2>
            <p class="text-sm text-gray-500 mt-0.5">
                Tahun Ajaran {{ $currentYear?->academic_year ?? 'Belum ditentukan' }}
                @if($currentYear)
                    &middot; {{ $currentYear->name }}
                @endif
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-xl border border-emerald-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Total Pendaftar</p>
                        <p class="text-3xl font-bold text-emerald-700 mt-1">{{ array_sum($countByStatus->toArray()) ?: 0 }}</p>
                    </div>
                    <div class="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Seluruh pendaftar masuk</p>
            </div>

            <div class="bg-white rounded-xl border border-yellow-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Menunggu Verifikasi</p>
                        <p class="text-3xl font-bold text-yellow-700 mt-1">{{ $countByStatus->get('menunggu_verifikasi', 0) + $countByStatus->get('baru_daftar', 0) }}</p>
                    </div>
                    <div class="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Perlu ditindaklanjuti</p>
            </div>

            <div class="bg-white rounded-xl border border-green-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Terverifikasi</p>
                        <p class="text-3xl font-bold text-green-700 mt-1">{{ $countByStatus->get('terverifikasi', 0) }}</p>
                    </div>
                    <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Data sudah lengkap</p>
            </div>

            <div class="bg-white rounded-xl border border-amber-200 shadow-sm p-5">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-sm font-medium text-slate-500">Diterima</p>
                        <p class="text-3xl font-bold text-amber-700 mt-1">{{ $countByStatus->get('diterima', 0) }}</p>
                    </div>
                    <div class="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                </div>
                <p class="text-xs text-slate-400 mt-2">Siswa baru</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                        <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Status Pendaftaran</h3>
                    </div>
                    <div class="p-5">
                        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            @foreach($statuses as $key => $label)
                                @php
                                    $count = $countByStatus->get($key, 0);
                                    $iconColors = [
                                        'baru_daftar' => 'text-blue-600', 'menunggu_verifikasi' => 'text-yellow-600',
                                        'data_kurang' => 'text-orange-600', 'terverifikasi' => 'text-green-600',
                                        'wawancara' => 'text-purple-600', 'lulus' => 'text-emerald-600',
                                        'cadangan' => 'text-gray-600', 'tidak_lulus' => 'text-red-600',
                                        'diterima' => 'text-indigo-600', 'mengundurkan_diri' => 'text-pink-600',
                                    ];
                                    $icon = $iconColors[$key] ?? 'text-gray-600';
                                @endphp
                                <div class="flex flex-col items-center p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                    <span class="text-lg font-bold {{ $icon }}">{{ $count }}</span>
                                    <span class="text-xs text-slate-500 text-center mt-1 leading-tight">{{ $label }}</span>
                                </div>
                            @endforeach
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                        <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Pendaftar Terbaru</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 hidden md:table">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Pendaftaran</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                @forelse($recentApplications as $app)
                                    <tr class="hover:bg-gray-50">
                                        <td class="px-4 py-3 text-sm font-mono text-gray-900">{{ $app->registration_number }}</td>
                                        <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ $app->student_name }}</td>
                                        <td class="px-4 py-3">
                                            <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$app->status] ?? 'bg-gray-100 text-gray-800' }}">
                                                {{ $statuses[$app->status] ?? $app->status }}
                                            </span>
                                        </td>
                                        <td class="px-4 py-3 text-sm text-gray-600">{{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}</td>
                                        <td class="px-4 py-3 text-right">
                                            <a href="{{ route('admin.ppdb.applications.show', $app) }}" class="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                                                Detail
                                            </a>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="5" class="px-4 py-8 text-center text-gray-500">
                                            <p class="text-sm">Belum ada pendaftar.</p>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <div class="md:hidden divide-y divide-gray-200">
                        @forelse($recentApplications as $app)
                            <div class="p-4 space-y-2">
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-mono font-medium text-gray-900">{{ $app->registration_number }}</span>
                                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$app->status] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ $statuses[$app->status] ?? $app->status }}
                                    </span>
                                </div>
                                <p class="text-base font-semibold text-gray-900">{{ $app->student_name }}</p>
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-500">{{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}</span>
                                    <a href="{{ route('admin.ppdb.applications.show', $app) }}" class="inline-flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors">
                                        Detail
                                    </a>
                                </div>
                            </div>
                        @empty
                            <div class="p-8 text-center text-gray-500">
                                <p class="text-sm">Belum ada pendaftar.</p>
                            </div>
                        @endforelse
                    </div>
                </div>
            </div>

            <div class="space-y-6">
                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-gray-100 bg-amber-50">
                        <h3 class="text-sm font-semibold text-amber-800 uppercase tracking-wider">Kuota Penerimaan</h3>
                    </div>
                    <div class="p-5 space-y-4">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Kuota Total</span>
                            <span class="text-2xl font-bold text-gray-900">{{ $quota }}</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-600">Terisi (Diterima)</span>
                            <span class="text-2xl font-bold text-emerald-600">{{ $terisi }}</span>
                        </div>
                        <div class="border-t border-gray-100 pt-4">
                            <div class="flex items-center justify-between">
                                <span class="text-sm font-semibold text-gray-700">Sisa Kuota</span>
                                <span class="text-2xl font-bold {{ $sisa > 0 ? 'text-amber-600' : 'text-red-600' }}">{{ $sisa }}</span>
                            </div>
                        </div>

                        @if($quota > 0)
                            <div class="pt-2">
                                <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    @php $pct = min(100, round(($terisi / $quota) * 100)); @endphp
                                    <div class="h-full rounded-full transition-all duration-500 {{ $pct >= 90 ? 'bg-red-500' : ($pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500') }}"
                                         style="width: {{ $pct }}%">
                                    </div>
                                </div>
                                <p class="text-xs text-gray-500 mt-1.5 text-right">{{ $pct }}% terisi</p>
                            </div>
                        @endif
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                        <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Ringkasan</h3>
                    </div>
                    <div class="p-5 space-y-3">
                        <div class="flex justify-between text-sm py-1">
                            <span class="text-gray-600">Total Pendaftar</span>
                            <span class="font-semibold text-gray-900">{{ array_sum($countByStatus->toArray()) ?: 0 }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Lolos Seleksi</span>
                            <span class="font-semibold text-emerald-600">{{ $countByStatus->get('lulus', 0) }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Cadangan</span>
                            <span class="font-semibold text-amber-600">{{ $countByStatus->get('cadangan', 0) }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Tidak Lulus</span>
                            <span class="font-semibold text-red-600">{{ $countByStatus->get('tidak_lulus', 0) }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Mengundurkan Diri</span>
                            <span class="font-semibold text-pink-600">{{ $countByStatus->get('mengundurkan_diri', 0) }}</span>
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-gray-100 bg-blue-50">
                        <h3 class="text-sm font-semibold text-blue-800 uppercase tracking-wider">Follow-up</h3>
                    </div>
                    <div class="p-5 space-y-3">
                        <div class="flex justify-between text-sm py-1">
                            <span class="text-gray-600">Belum Dihubungi</span>
                            <span class="font-semibold text-slate-600">{{ $followUpSummary['belum_dihubungi'] }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Sudah Dihubungi</span>
                            <span class="font-semibold text-blue-600">{{ $followUpSummary['sudah_dihubungi'] }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Perlu Dilengkapi</span>
                            <span class="font-semibold text-yellow-600">{{ $followUpSummary['perlu_dilengkapi'] }}</span>
                        </div>
                        <div class="flex justify-between text-sm py-1 border-t border-gray-50">
                            <span class="text-gray-600">Siap Wawancara</span>
                            <span class="font-semibold text-green-600">{{ $followUpSummary['siap_wawancara'] }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-admin-layout>
