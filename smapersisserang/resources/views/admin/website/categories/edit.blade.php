<x-admin-layout>
    <div class="max-w-3xl mx-auto">
        <div class="mb-6">
            <a href="{{ route('admin.website.categories.index') }}" class="text-sm text-[#0F6B3A] hover:underline">&larr; Kembali</a>
            <h2 class="text-2xl font-bold text-gray-900 mt-2">Edit Kategori: {{ $galleryCategory->name }}</h2>
        </div>

        <form action="{{ route('admin.website.categories.update', $galleryCategory) }}" method="POST" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            @csrf
            @method('PUT')

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nama Kategori <span class="text-red-500">*</span></label>
                <input type="text" name="name" value="{{ old('name', $galleryCategory->name) }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                @error('name') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug (kosongkan untuk otomatis dari nama)</label>
                <input type="text" name="slug" value="{{ old('slug', $galleryCategory->slug) }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A] font-mono">
                @error('slug') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <input type="number" name="sort_order" value="{{ old('sort_order', $galleryCategory->sort_order) }}" min="0"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                @error('sort_order') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="flex items-center gap-2">
                <input type="checkbox" name="is_active" id="is_active" value="1"
                       {{ old('is_active', $galleryCategory->is_active) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-[#0F6B3A] focus:ring-[#0F6B3A]">
                <label for="is_active" class="text-sm font-medium text-gray-700">Aktif</label>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit"
                        class="px-6 py-2.5 bg-[#0F6B3A] text-white font-medium rounded-lg hover:bg-[#0A4F2B] transition-colors">
                    Simpan
                </button>
                <a href="{{ route('admin.website.categories.index') }}"
                   class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Batal
                </a>
            </div>
        </form>
    </div>
</x-admin-layout>
