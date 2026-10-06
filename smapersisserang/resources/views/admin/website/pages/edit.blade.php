@php
    $sectionContent = null;
    if ($websitePage->content) {
        $decoded = json_decode($websitePage->content, true);
        if (is_array($decoded)) {
            $sectionContent = $decoded;
        }
    }
    $oldSectionLabel = old('section_label', $sectionContent['section_label'] ?? '');
    $oldSectionHeading = old('section_heading', $sectionContent['section_heading'] ?? '');
    $oldSectionSubtitle = old('section_subtitle', $sectionContent['section_subtitle'] ?? '');
@endphp

<x-admin-layout>
    <div class="max-w-3xl mx-auto">
        <div class="mb-6">
            <a href="{{ route('admin.website.pages.index') }}" class="text-sm text-[#0F6B3A] hover:underline">&larr; Kembali</a>
            <h2 class="text-2xl font-bold text-gray-900 mt-2">Edit Konten: {{ ucfirst($websitePage->page_key) }}</h2>
        </div>

        @if(session('success'))
            <div class="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {{ session('success') }}
            </div>
        @endif

        <form action="{{ route('admin.website.pages.update', $websitePage) }}" method="POST" class="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
            @csrf
            @method('PUT')

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                <input type="text" name="title" value="{{ old('title', $websitePage->title) }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                @error('title') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <input type="text" name="subtitle" value="{{ old('subtitle', $websitePage->subtitle) }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                @error('subtitle') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <hr class="border-gray-200">

            <p class="text-sm font-semibold text-gray-700">Konten Section Nilai Utama</p>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Label Section</label>
                <input type="text" name="section_label" value="{{ $oldSectionLabel }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]"
                       placeholder="contoh: NILAI UTAMA">
                <p class="text-xs text-gray-400 mt-1">Teks badge di atas judul section</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Judul Section</label>
                <input type="text" name="section_heading" value="{{ $oldSectionHeading }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]"
                       placeholder="contoh: Nilai Utama">
                <p class="text-xs text-gray-400 mt-1">Judul utama section</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle Section</label>
                <input type="text" name="section_subtitle" value="{{ $oldSectionSubtitle }}"
                       class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]"
                       placeholder="contoh: Membentuk karakter dan kompetensi siswa secara holistik">
                <p class="text-xs text-gray-400 mt-1">Deskripsi di bawah judul section</p>
            </div>

            <hr class="border-gray-200">

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Konten (JSON)</label>
                <textarea name="content" rows="3"
                          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">{{ old('content', $websitePage->content) }}</textarea>
                <p class="text-xs text-gray-400 mt-1">Konten JSON tambahan jika diperlukan. Data section label/judul/subtitle sudah diisi lewat form di atas.</p>
                @error('content') <p class="text-red-500 text-xs mt-1">{{ $message }}</p> @enderror
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teks Tombol Utama</label>
                    <input type="text" name="button_primary_text" value="{{ old('button_primary_text', $websitePage->button_primary_text) }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL Tombol Utama</label>
                    <input type="text" name="button_primary_url" value="{{ old('button_primary_url', $websitePage->button_primary_url) }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Teks Tombol Sekunder</label>
                    <input type="text" name="button_secondary_text" value="{{ old('button_secondary_text', $websitePage->button_secondary_text) }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">URL Tombol Sekunder</label>
                    <input type="text" name="button_secondary_url" value="{{ old('button_secondary_url', $websitePage->button_secondary_url) }}"
                           class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                <textarea name="meta_description" rows="3"
                          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-[#0F6B3A] focus:border-[#0F6B3A]">{{ old('meta_description', $websitePage->meta_description) }}</textarea>
            </div>

            <div class="flex items-center gap-2">
                <input type="checkbox" name="is_active" id="is_active" value="1"
                       {{ old('is_active', $websitePage->is_active) ? 'checked' : '' }}
                       class="rounded border-gray-300 text-[#0F6B3A] focus:ring-[#0F6B3A]">
                <label for="is_active" class="text-sm font-medium text-gray-700">Aktif</label>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <button type="submit"
                        class="px-6 py-2.5 bg-[#0F6B3A] text-white font-medium rounded-lg hover:bg-[#0A4F2B] transition-colors">
                    Simpan
                </button>
                <a href="{{ route('admin.website.pages.index') }}"
                   class="px-6 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Batal
                </a>
            </div>
        </form>
    </div>
</x-admin-layout>
