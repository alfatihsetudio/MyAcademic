<x-admin-layout>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Media Website</h2>
                <p class="text-sm text-gray-500 mt-1">Kelola gambar hero slider, fasilitas, kegiatan, kelas, santri, kajian, dan teknologi.</p>
            </div>
        </div>

        @if(session('success'))
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">{{ session('success') }}</div>
        @endif

        @if($errors->any())
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <ul class="list-disc list-inside">
                    @foreach($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Tambah Gambar Baru</h3>
            </div>
            <div class="p-5">
                <form method="POST" action="{{ route('admin.website.media.store') }}" enctype="multipart/form-data">
                    @csrf
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Judul (opsional)</label>
                            <input type="text" name="title" id="title" value="{{ old('title') }}"
                                   class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Kategori <span class="text-red-500">*</span></label>
                            <div class="flex flex-wrap gap-3">
                                @foreach($categories as $cat)
                                    <label class="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                                        <input type="checkbox" name="category_ids[]" value="{{ $cat->id }}"
                                               {{ in_array($cat->id, old('category_ids', [])) ? 'checked' : '' }}
                                               class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
                                        {{ $cat->name }}
                                    </label>
                                @endforeach
                            </div>
                            @error('category_ids')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                        </div>
                        <div>
                            <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-1">Urutan (opsional)</label>
                            <input type="number" name="sort_order" id="sort_order" value="{{ old('sort_order', 0) }}" min="0"
                                   class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label for="image" class="block text-sm font-medium text-gray-700 mb-1">Gambar <span class="text-red-500">*</span></label>
                            <input type="file" name="image" id="image" accept="image/jpeg,image/png,image/jpg,image/webp" required
                                   class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                            @error('image')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                            <p class="text-xs text-gray-400 mt-1">Maks 2MB. JPG, PNG, WebP.</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <button type="submit"
                                class="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                            Tambah Gambar
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex flex-wrap items-center justify-between gap-2">
                <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Daftar Gambar</h3>
                <div class="flex flex-wrap gap-1.5">
                    <a href="{{ route('admin.website.media.index') }}"
                       class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors {{ !$category ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">
                        Semua
                    </a>
                    @foreach($categories as $cat)
                        <a href="{{ route('admin.website.media.index', ['category' => $cat->slug]) }}"
                           class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors {{ $category === $cat->slug ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200' }}">
                            {{ $cat->name }}
                        </a>
                    @endforeach
                </div>
            </div>
            <div class="p-5">
                @if($mediaImages->count())
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        @foreach($mediaImages as $image)
                            <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <div class="aspect-[4/3] bg-gray-100 overflow-hidden">
                                    <img src="{{ asset('storage/' . $image->image_path) }}"
                                         alt="{{ $image->title ?? 'Gambar' }}"
                                         class="w-full h-full object-cover">
                                </div>
                                <div class="p-3">
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ $image->title ?? '(tanpa judul)' }}</p>
                                    <div class="flex items-center gap-2 mt-1.5">
                                        @foreach($image->categories as $imgCat)
                                            <span class="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-emerald-100 text-emerald-700">{{ $imgCat->name }}</span>
                                        @endforeach
                                        <span class="text-[10px] text-gray-400">Urutan: {{ $image->sort_order }}</span>
                                    </div>
                                    <div class="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                                        <form method="POST" action="{{ route('admin.website.media.toggle', $image) }}">
                                            @csrf @method('PATCH')
                                            <button type="submit"
                                                    class="px-2.5 py-1 text-xs font-medium rounded-lg transition-colors {{ $image->is_active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200' }}">
                                                {{ $image->is_active ? 'Aktif' : 'Nonaktif' }}
                                            </button>
                                        </form>
                                        <form method="POST" action="{{ route('admin.website.media.destroy', $image) }}"
                                              onsubmit="return confirm('Hapus gambar ini?')">
                                            @csrf @method('DELETE')
                                            <button type="submit"
                                                    class="px-2.5 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Hapus</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                @else
                    <p class="text-sm text-gray-400 text-center py-8">Belum ada gambar. Tambahkan gambar pertama melalui form di atas.</p>
                @endif
            </div>
        </div>
    </div>
</x-admin-layout>