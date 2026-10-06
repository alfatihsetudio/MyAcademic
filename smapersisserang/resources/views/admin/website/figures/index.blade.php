<x-admin-layout>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Tokoh &amp; Pembina</h2>
                <p class="text-sm text-gray-500 mt-1">Kelola tokoh dan pembina sekolah</p>
            </div>
            <a href="{{ route('admin.website.figures.create') }}"
               class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Tambah Tokoh
            </a>
        </div>

        @if(session('success'))
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                {{ session('success') }}
            </div>
        @endif

        @if($figures->count())
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                @foreach($figures as $figure)
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-4">
                        <div class="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            @if($figure->photo_path)
                                <img src="{{ asset('storage/' . $figure->photo_path) }}" alt="{{ $figure->name }}" class="w-full h-full object-cover">
                            @else
                                <div class="w-full h-full bg-[#0F6B3A]/10 flex items-center justify-center">
                                    <span class="text-[#0F6B3A] font-bold text-lg">{{ substr($figure->name, 0, 1) }}</span>
                                </div>
                            @endif
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-sm font-semibold text-gray-900 truncate">{{ $figure->name }}</h3>
                            <p class="text-xs text-gray-500 truncate">{{ $figure->role ?? '(tanpa jabatan)' }}</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded {{ $figure->is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                                    {{ $figure->is_active ? 'Aktif' : 'Nonaktif' }}
                                </span>
                                <span class="text-[10px] text-gray-400">Urutan: {{ $figure->sort_order }}</span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1.5 flex-shrink-0">
                            <a href="{{ route('admin.website.figures.edit', $figure) }}"
                               class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-center">
                                Edit
                            </a>
                            <form method="POST" action="{{ route('admin.website.figures.toggle', $figure) }}">
                                @csrf
                                @method('PATCH')
                                <button type="submit"
                                        class="px-2.5 py-1.5 text-xs font-medium rounded-lg w-full transition-colors {{ $figure->is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' }}">
                                    {{ $figure->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                                </button>
                            </form>
                            <form method="POST" action="{{ route('admin.website.figures.destroy', $figure) }}"
                                  onsubmit="return confirm('Hapus tokoh ini?')">
                                @csrf
                                @method('DELETE')
                                <button type="submit"
                                        class="px-2.5 py-1.5 text-xs font-medium rounded-lg w-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                    Hapus
                                </button>
                            </form>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <div class="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z"/>
                    </svg>
                </div>
                <p class="text-gray-400 font-medium">Belum ada tokoh atau pembina.</p>
                <p class="text-gray-400 text-sm mt-1">Tambahkan tokoh pertama untuk ditampilkan di halaman publik.</p>
                <a href="{{ route('admin.website.figures.create') }}"
                   class="inline-flex items-center px-4 py-2 mt-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    Tambah Tokoh
                </a>
            </div>
        @endif
    </div>
</x-admin-layout>