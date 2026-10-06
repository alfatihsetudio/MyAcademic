<x-admin-layout>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Kategori Galeri</h2>
                <p class="text-sm text-gray-500 mt-1">Kelola kategori untuk galeri gambar sekolah</p>
            </div>
            <a href="{{ route('admin.website.categories.create') }}"
               class="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                Tambah Kategori
            </a>
        </div>

        @if(session('success'))
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
        @endif

        @if(session('error'))
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{{ session('error') }}</div>
        @endif

        @if($categories->count())
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="bg-gray-50 border-b border-gray-200">
                                <th class="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
                                <th class="text-left px-4 py-3 font-semibold text-gray-600">Slug</th>
                                <th class="text-center px-4 py-3 font-semibold text-gray-600">Urutan</th>
                                <th class="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                                <th class="text-right px-4 py-3 font-semibold text-gray-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            @foreach($categories as $cat)
                                <tr class="hover:bg-gray-50 transition-colors">
                                    <td class="px-4 py-3 font-medium text-gray-900">{{ $cat->name }}</td>
                                    <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ $cat->slug }}</td>
                                    <td class="px-4 py-3 text-center text-gray-500">{{ $cat->sort_order }}</td>
                                    <td class="px-4 py-3 text-center">
                                        <form action="{{ route('admin.website.categories.toggle', $cat) }}" method="POST" class="inline">
                                            @csrf
                                            @method('PATCH')
                                            <button type="submit"
                                                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors {{ $cat->is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200' }}">
                                                {{ $cat->is_active ? 'Aktif' : 'Nonaktif' }}
                                            </button>
                                        </form>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <div class="flex items-center justify-end gap-2">
                                            <a href="{{ route('admin.website.categories.edit', $cat) }}"
                                               class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#0F6B3A] bg-[#EAF6EE] rounded-lg hover:bg-[#D5EDDE] transition-colors">
                                                Edit
                                            </a>
                                            <form action="{{ route('admin.website.categories.destroy', $cat) }}" method="POST"
                                                  onsubmit="return confirm('Hapus kategori {{ $cat->name }}?')">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit"
                                                        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                                    Hapus
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </div>
        @else
            <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
                <p class="text-gray-500">Belum ada kategori. Tambahkan kategori baru.</p>
            </div>
        @endif
    </div>
</x-admin-layout>
