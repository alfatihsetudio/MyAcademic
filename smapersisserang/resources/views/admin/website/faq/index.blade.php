<x-admin-layout>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">FAQ SPMB</h2>
                <p class="text-sm text-gray-500 mt-1">Kelola pertanyaan yang sering diajukan</p>
            </div>
            <a href="{{ route('admin.website.faq.create') }}"
               class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Tambah FAQ
            </a>
        </div>

        @if(session('success'))
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
        @endif

        @if($faqs->count())
            <div class="space-y-3">
                @foreach($faqs as $faq)
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div class="flex items-start justify-between gap-4">
                            <div class="flex-1 min-w-0">
                                <h3 class="text-sm font-semibold text-gray-900">{{ $faq->question }}</h3>
                                <p class="text-xs text-gray-500 mt-1 line-clamp-2">{{ $faq->answer }}</p>
                                <div class="flex items-center gap-3 mt-2">
                                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{{ $faq->category }}</span>
                                    <span class="text-[10px] font-medium px-1.5 py-0.5 rounded {{ $faq->is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500' }}">
                                        {{ $faq->is_active ? 'Aktif' : 'Nonaktif' }}
                                    </span>
                                    <span class="text-[10px] text-gray-400">Urutan: {{ $faq->sort_order }}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1.5 flex-shrink-0">
                                <a href="{{ route('admin.website.faq.edit', $faq) }}"
                                   class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">Edit</a>
                                <form method="POST" action="{{ route('admin.website.faq.toggle', $faq) }}">
                                    @csrf @method('PATCH')
                                    <button type="submit"
                                            class="px-2.5 py-1.5 text-xs font-medium rounded-lg {{ $faq->is_active ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' }} transition-colors">
                                        {{ $faq->is_active ? 'Nonaktifkan' : 'Aktifkan' }}
                                    </button>
                                </form>
                                <form method="POST" action="{{ route('admin.website.faq.destroy', $faq) }}"
                                      onsubmit="return confirm('Hapus FAQ ini?')">
                                    @csrf @method('DELETE')
                                    <button type="submit"
                                            class="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Hapus</button>
                                </form>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <p class="text-gray-400 font-medium">Belum ada FAQ.</p>
                <a href="{{ route('admin.website.faq.create') }}" class="inline-flex items-center px-4 py-2 mt-4 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Tambah FAQ</a>
            </div>
        @endif
    </div>
</x-admin-layout>