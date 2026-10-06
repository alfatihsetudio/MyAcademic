@php
$statusDataLabels = ['belum_lengkap' => 'Belum Lengkap', 'sudah_lengkap' => 'Sudah Lengkap', 'perlu_perbaikan' => 'Data Kurang'];
$statusDataColors = ['belum_lengkap' => 'bg-yellow-100 text-yellow-800', 'sudah_lengkap' => 'bg-green-100 text-green-800', 'perlu_perbaikan' => 'bg-red-100 text-red-800'];

$statusLabels = [
    'baru_daftar' => 'Baru Daftar',
    'menunggu_verifikasi' => 'Menunggu Verifikasi',
    'data_kurang' => 'Data Kurang',
    'terverifikasi' => 'Terverifikasi',
    'wawancara' => 'Wawancara',
    'lulus' => 'Lulus',
    'cadangan' => 'Cadangan',
    'tidak_lulus' => 'Tidak Lulus',
    'diterima' => 'Diterima',
    'mengundurkan_diri' => 'Mengundurkan Diri',
];

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

$followUpLabels = [
    'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
    'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
    'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
];
$followUpColors = [
    'belum_dihubungi' => 'bg-slate-100 text-slate-700',
    'sudah_dihubungi' => 'bg-blue-100 text-blue-700',
    'perlu_dilengkapi' => 'bg-yellow-100 text-yellow-700',
    'siap_wawancara' => 'bg-green-100 text-green-700',
    'tidak_aktif' => 'bg-red-100 text-red-700',
    'selesai' => 'bg-emerald-100 text-emerald-700',
];
$followUpStatuses = [
    'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
    'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
    'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
];
@endphp

<x-admin-layout>
    @push('styles')
    <style>
        @media print {
            body { background: white !important; }
            .print\:hidden { display: none !important; }
            .print\:block { display: block !important; }
            .print\:bg-white { background-color: white !important; }
            .print\:text-black { color: black !important; }
            .print\:shadow-none { box-shadow: none !important; }
            .print\:border-0 { border: 0 !important; }
            aside, .lg\:pl-64 > div > aside { display: none !important; }
            .lg\:pl-64 { padding-left: 0 !important; }
            .no-print { display: none !important; }
            .print-only { display: block !important; }
            #print-table { display: table !important; }
            .md\:hidden { display: none !important; }
            .hidden\.md\:table { display: table !important; }
            .bg-white { background-color: white !important; }
            .shadow-sm, .shadow { box-shadow: none !important; }
            .border, .border-gray-200, .border-t, .border-b { border-color: #ccc !important; }
            a { text-decoration: none !important; }
            @page { margin: 1.5cm; }
            .print-header { display: flex !important; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
            .print-header h1 { font-size: 18pt; font-weight: bold; margin: 0; }
            .print-header .date { font-size: 10pt; color: #666; }
            table { width: 100%; border-collapse: collapse; font-size: 9pt; }
            th, td { padding: 4px 6px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: 600; }
        }
        .print-only { display: none; }
        @media print {
            .print-only { display: block; }
        }
    </style>
    @endpush

    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Pendaftar SPMB</h2>
                <p class="text-sm text-gray-500 mt-1">Daftar seluruh pendaftar SPMB</p>
            </div>
            <div class="flex flex-wrap items-center gap-2 no-print">
                <a href="{{ route('admin.ppdb.applications.export', request()->query()) }}"
                   class="inline-flex items-center px-3 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Excel
                </a>
                <a href="{{ route('admin.ppdb.applications.export-pdf', request()->query()) }}"
                   class="inline-flex items-center px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    PDF
                </a>
                <button onclick="window.print()"
                        class="inline-flex items-center px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors shadow-sm">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                    </svg>
                    Print
                </button>
                <span class="text-sm text-gray-500">Total: {{ $applications->total() }} pendaftar</span>
            </div>
        </div>

        <div class="print-only print-header">
            <div>
                <h1>Daftar Pendaftar SPMB</h1>
                <p class="date">SMA Persis Serang</p>
            </div>
            <p class="date">{{ now()->format('d/m/Y H:i') }}</p>
        </div>

        <!-- Print-only compact table -->
        <table id="print-table" class="print-only" style="display:none">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nomor</th>
                    <th>Nama Siswa</th>
                    <th>JK</th>
                    <th>WA Orang Tua</th>
                    <th>Program</th>
                    <th>Status</th>
                    <th>Tgl Daftar</th>
                </tr>
            </thead>
            <tbody>
                @foreach($applications as $i => $app)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $app->registration_number }}</td>
                    <td>{{ $app->student_name }}</td>
                    <td>{{ $app->gender === 'laki_laki' ? 'L' : 'P' }}</td>
                    <td>{{ $app->parent_whatsapp }}</td>
                    <td>{{ $app->admissionProgram?->name }}</td>
                    <td>{{ $statusLabels[$app->status] ?? $app->status }}</td>
                    <td>{{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 no-print">
            <div class="p-4 border-b border-gray-200">
                <form method="GET" action="{{ route('admin.ppdb.applications.index') }}" class="flex flex-col sm:flex-row gap-3">
                    <div class="flex-1">
                        <input type="text" name="search" placeholder="Cari nama / no. pendaftaran / WA..."
                               value="{{ request('search') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm">
                    </div>
                    <select name="status" class="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm">
                        <option value="">Semua Status</option>
                        @foreach($statuses as $key => $label)
                            <option value="{{ $key }}" {{ request('status') == $key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                    <select name="admission_year_id" class="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm">
                        <option value="">Semua Tahun</option>
                        @foreach($admissionYears as $year)
                            <option value="{{ $year->id }}" {{ request('admission_year_id') == $year->id ? 'selected' : '' }}>{{ $year->academic_year }}</option>
                        @endforeach
                    </select>
                    <select name="follow_up_status" class="rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm">
                        <option value="">Semua Follow-up</option>
                        @foreach($followUpStatuses as $key => $label)
                            <option value="{{ $key }}" {{ request('follow_up_status') == $key ? 'selected' : '' }}>{{ $label }}</option>
                        @endforeach
                    </select>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                        Filter
                    </button>
                </form>
            </div>

            @if(session('success'))
                <div class="mx-4 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                    {{ session('success') }}
                </div>
            @endif

            @if(session('error'))
                <div class="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                    {{ session('error') }}
                </div>
            @endif

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200 hidden md:table">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Pendaftaran</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JK</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WA Orang Tua</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow-up</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        @forelse($applications as $app)
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm font-mono text-gray-900">{{ $app->registration_number }}</td>
                                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ $app->student_name }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $app->gender === 'laki_laki' ? 'L' : 'P' }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $app->parent_whatsapp }}</td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $app->admissionProgram?->name }}</td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$app->status] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ $statusLabels[$app->status] ?? $app->status }}
                                    </span>
                                </td>
                                <td class="px-4 py-3">
                                    @if($app->follow_up_status)
                                        <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $followUpColors[$app->follow_up_status] ?? 'bg-gray-100 text-gray-800' }}">
                                            {{ $followUpLabels[$app->follow_up_status] ?? $app->follow_up_status }}
                                        </span>
                                    @else
                                        <span class="text-xs text-gray-400">-</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3">
                                    <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusDataColors[$app->status_data] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ $statusDataLabels[$app->status_data] ?? $app->status_data }}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-600">{{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}</td>
                                <td class="px-4 py-3 text-right no-print">
                                    <div class="flex items-center justify-end gap-1.5">
                                        <x-whatsapp-status-button :application="$app" class="px-2.5 py-1.5 text-xs font-medium rounded-lg gap-1">
                                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                            WA
                                        </x-whatsapp-status-button>
                                        <a href="{{ route('admin.ppdb.applications.show', $app) }}" class="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors">
                                            Detail
                                        </a>
                                        <form method="POST" action="{{ route('admin.ppdb.applications.destroy', $app) }}" class="inline" onsubmit="return confirm('Yakin ingin menghapus data pendaftar ini? Data yang dihapus tidak bisa dikembalikan.');">
                                            @csrf @method('DELETE')
                                            <button type="submit" class="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
                                                Hapus
                                            </button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="9" class="px-4 py-12 text-center text-gray-500">
                                    <p class="text-lg font-medium">Belum ada pendaftar</p>
                                    <p class="text-sm mt-1">Belum ada siswa yang mendaftar SPMB.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            <div class="md:hidden divide-y divide-gray-200">
                @forelse($applications as $app)
                    <div class="p-4 space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-mono font-medium text-gray-900">{{ $app->registration_number }}</span>
                            <div class="flex items-center gap-1.5">
                                @if($app->follow_up_status)
                                    <span class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium {{ $followUpColors[$app->follow_up_status] ?? 'bg-gray-100 text-gray-800' }}">
                                        {{ $followUpLabels[$app->follow_up_status] ?? $app->follow_up_status }}
                                    </span>
                                @endif
                                <span class="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium {{ $statusColors[$app->status] ?? 'bg-gray-100 text-gray-800' }}">
                                    {{ $statusLabels[$app->status] ?? $app->status }}
                                </span>
                            </div>
                        </div>
                        <p class="text-base font-semibold text-gray-900">{{ $app->student_name }}</p>
                        <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div>
                                <span class="text-gray-400">JK:</span> {{ $app->gender === 'laki_laki' ? 'Laki-laki' : 'Perempuan' }}
                            </div>
                            <div>
                                <span class="text-gray-400">WA:</span> {{ $app->parent_whatsapp }}
                            </div>
                            <div>
                                <span class="text-gray-400">Program:</span> {{ $app->admissionProgram?->name }}
                            </div>
                            <div>
                                <span class="text-gray-400">Tgl:</span> {{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}
                            </div>
                        </div>
                        <div class="mt-4 flex flex-wrap items-center gap-2 no-print">
                            <x-whatsapp-status-button :application="$app" class="rounded-lg px-3 py-2 text-xs font-medium gap-1.5">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                WA Cek Status
                            </x-whatsapp-status-button>
                            <a href="{{ route('admin.ppdb.applications.show', $app) }}" class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                                Detail
                            </a>
                            <form method="POST" action="{{ route('admin.ppdb.applications.destroy', $app) }}" class="inline" onsubmit="return confirm('Yakin ingin menghapus data pendaftar ini? Data yang dihapus tidak bisa dikembalikan.');">
                                @csrf @method('DELETE')
                                <button type="submit" class="inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors">
                                    Hapus
                                </button>
                            </form>
                        </div>
                    </div>
                @empty
                    <div class="p-12 text-center text-gray-500">
                        <p class="text-lg font-medium">Belum ada pendaftar</p>
                        <p class="text-sm mt-1">Belum ada siswa yang mendaftar SPMB.</p>
                    </div>
                @endforelse
            </div>

            <div class="px-4 py-3 border-t border-gray-200 no-print">
                {{ $applications->links() }}
            </div>
        </div>
    </div>
</x-admin-layout>
