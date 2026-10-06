<x-admin-layout>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">Pengaturan Website</h2>
                <p class="text-sm text-gray-500 mt-1">Kelola identitas dan konten website sekolah</p>
            </div>
        </div>

        @if(session('success'))
            <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                {{ session('success') }}
            </div>
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
            <div class="px-5 py-3.5 border-b border-gray-100 bg-indigo-50">
                <h3 class="text-sm font-semibold text-indigo-800 uppercase tracking-wider">Dashboard Progress Publik</h3>
            </div>
            <div class="p-5 space-y-4">
                @if(empty($setting->public_dashboard_token))
                    <p class="text-sm text-gray-600">
                        Token belum dibuat. Klik "Generate Token Baru" untuk membuat link dashboard publik.
                    </p>
                    <form method="POST" action="{{ route('admin.website.settings.public-dashboard-token.generate') }}">
                        @csrf
                        <button type="submit"
                            class="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                            Generate Token Baru
                        </button>
                    </form>
                @else
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Link Dashboard Progress Publik
                        </label>
                        <div class="flex gap-2">
                            <input type="text" id="public-progress-url" readonly
                                value="{{ route('public.progress', $setting->public_dashboard_token) }}"
                                class="w-full rounded-lg border-gray-300 bg-gray-50 text-sm font-mono text-gray-700">
                            <button type="button" id="copy-public-progress-url"
                                class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
                                Salin Link
                            </button>
                        </div>
                        <form method="POST" action="{{ route('admin.website.settings.public-dashboard-token.generate') }}" class="mt-4"
                            onsubmit="return confirm('Generate token baru? Link lama tidak bisa digunakan lagi.')">
                            @csrf
                            <button type="submit"
                                class="inline-flex items-center px-4 py-2 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors shadow-sm">
                                Reset Token
                            </button>
                        </form>
                    </div>
                @endif
            </div>
        </div>

        <form method="POST" action="{{ route('admin.website.settings.update') }}" enctype="multipart/form-data" class="space-y-6">
            @csrf
            @method('PUT')

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Identitas Sekolah</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label for="school_name" class="block text-sm font-medium text-gray-700 mb-1">Nama Sekolah <span class="text-red-500">*</span></label>
                        <input type="text" name="school_name" id="school_name" value="{{ old('school_name', $setting->school_name ?? 'SMA Persis Serang') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        @error('school_name')<p class="text-red-500 text-xs mt-1">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="short_name" class="block text-sm font-medium text-gray-700 mb-1">Nama Singkat</label>
                        <input type="text" name="short_name" id="short_name" value="{{ old('short_name', $setting->short_name ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                    </div>
                    <div>
                        <label for="tagline" class="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                        <input type="text" name="tagline" id="tagline" value="{{ old('tagline', $setting->tagline ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                    </div>
                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                        <textarea name="description" id="description" rows="3"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('description', $setting->description ?? '') }}</textarea>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Kontak</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label for="whatsapp_number" class="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                        <input type="text" name="whatsapp_number" id="whatsapp_number" value="{{ old('whatsapp_number', $setting->whatsapp_number ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" placeholder="6281234567890">
                    </div>
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" name="email" id="email" value="{{ old('email', $setting->email ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                    </div>
                    <div>
                        <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                        <textarea name="address" id="address" rows="2"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('address', $setting->address ?? '') }}</textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                            <input type="text" name="city" id="city" value="{{ old('city', $setting->city ?? '') }}"
                                   class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label for="province" class="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <input type="text" name="province" id="province" value="{{ old('province', $setting->province ?? '') }}"
                                   class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Lokasi & Google Maps</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label for="google_maps_embed_url" class="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
                        <textarea name="google_maps_embed_url" id="google_maps_embed_url" rows="2"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                                  placeholder="https://www.google.com/maps/embed?pb=...">{{ old('google_maps_embed_url', $setting->google_maps_embed_url ?? '') }}</textarea>
                        <p class="text-xs text-gray-400 mt-1">Gunakan Embed URL dari Google Maps agar peta bisa tampil di website.</p>
                    </div>
                    <div>
                        <label for="google_maps_link" class="block text-sm font-medium text-gray-700 mb-1">Google Maps Link</label>
                        <input type="text" name="google_maps_link" id="google_maps_link" value="{{ old('google_maps_link', $setting->google_maps_link ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                               placeholder="https://maps.app.goo.gl/...">
                        <p class="text-xs text-gray-400 mt-1">Google Maps Link digunakan untuk tombol Buka di Google Maps.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Sosial Media</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label for="website_url" class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                        <input type="url" name="website_url" id="website_url" value="{{ old('website_url', $setting->website_url ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" placeholder="https://">
                    </div>
                    <div>
                        <label for="instagram_url" class="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <input type="url" name="instagram_url" id="instagram_url" value="{{ old('instagram_url', $setting->instagram_url ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" placeholder="https://instagram.com/...">
                    </div>
                    <div>
                        <label for="facebook_url" class="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                        <input type="url" name="facebook_url" id="facebook_url" value="{{ old('facebook_url', $setting->facebook_url ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" placeholder="https://facebook.com/...">
                    </div>
                    <div>
                        <label for="youtube_url" class="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                        <input type="url" name="youtube_url" id="youtube_url" value="{{ old('youtube_url', $setting->youtube_url ?? '') }}"
                               class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" placeholder="https://youtube.com/...">
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Profil & Boarding School</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div>
                        <label for="vision" class="block text-sm font-medium text-gray-700 mb-1">Visi</label>
                        <textarea name="vision" id="vision" rows="3"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('vision', $setting->vision ?? '') }}</textarea>
                    </div>
                    <div>
                        <label for="mission" class="block text-sm font-medium text-gray-700 mb-1">Misi</label>
                        <textarea name="mission" id="mission" rows="5"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('mission', $setting->mission ?? '') }}</textarea>
                    </div>
                    <div>
                        <label for="about_school" class="block text-sm font-medium text-gray-700 mb-1">Tentang Sekolah</label>
                        <textarea name="about_school" id="about_school" rows="4"
                                  class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('about_school', $setting->about_school ?? '') }}</textarea>
                    </div>
                    <div>
                        <label for="about_boarding" class="block text-sm font-medium text-gray-700 mb-1">Tentang Boarding School</label>
                        <textarea name="about_boarding" id="about_boarding" rows="4"
                                   class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('about_boarding', $setting->about_boarding ?? '') }}</textarea>
                    </div>
                    <div class="border-t border-gray-100 pt-4">
                        <a href="{{ route('admin.website.boarding.index') }}" class="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            Kelola Konten Halaman Boarding
                        </a>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Warna Tema</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label for="primary_color" class="block text-sm font-medium text-gray-700 mb-1">Warna Utama</label>
                            <div class="flex gap-2">
                                <input type="color" name="primary_color" id="primary_color" value="{{ old('primary_color', $setting->primary_color ?? '#0F6B3A') }}"
                                       class="h-10 w-14 rounded border-gray-300 cursor-pointer">
                                <input type="text" name="primary_color_hex" value="{{ old('primary_color', $setting->primary_color ?? '#0F6B3A') }}"
                                       class="flex-1 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm font-mono" readonly>
                            </div>
                        </div>
                        <div>
                            <label for="secondary_color" class="block text-sm font-medium text-gray-700 mb-1">Warna Sekunder</label>
                            <div class="flex gap-2">
                                <input type="color" name="secondary_color" id="secondary_color" value="{{ old('secondary_color', $setting->secondary_color ?? '#D4A017') }}"
                                       class="h-10 w-14 rounded border-gray-300 cursor-pointer">
                                <input type="text" name="secondary_color_hex" value="{{ old('secondary_color', $setting->secondary_color ?? '#D4A017') }}"
                                       class="flex-1 rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm font-mono" readonly>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Logo</h3>
                </div>
                <div class="p-5 space-y-4">
                    @if($setting->logo_path)
                        <div class="mb-4">
                            <p class="text-sm text-gray-500 mb-2">Logo saat ini:</p>
                            <img src="{{ asset('storage/' . $setting->logo_path) }}" alt="Logo Sekolah"
                                 class="max-h-24 rounded-lg border border-gray-200">
                        </div>
                    @endif
                    <div>
                        <label for="logo" class="block text-sm font-medium text-gray-700 mb-1">Upload Logo Baru</label>
                        <input type="file" name="logo" id="logo" accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml,image/webp"
                               class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                        <p class="text-xs text-gray-400 mt-1">Maksimal 2MB. Format: JPG, PNG, GIF, SVG, WebP.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Foto Gedung</h3>
                </div>
                <div class="p-5 space-y-4">
                    @if($setting->building_image_path)
                        <div class="mb-4">
                            <p class="text-sm text-gray-500 mb-2">Foto gedung saat ini:</p>
                            <img src="{{ asset('storage/' . $setting->building_image_path) }}" alt="Foto Gedung"
                                 class="max-h-32 rounded-lg border border-gray-200">
                        </div>
                    @endif
                    <div>
                        <label for="building_image" class="block text-sm font-medium text-gray-700 mb-1">Upload Foto Gedung</label>
                        <input type="file" name="building_image" id="building_image" accept="image/jpeg,image/png,image/jpg,image/webp"
                               class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                        <p class="text-xs text-gray-400 mt-1">Maksimal 2MB. Format: JPG, PNG, WebP.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Gambar Meta Share Website</h3>
                </div>
                <div class="p-5 space-y-4">
                    @if($setting->meta_image)
                        <div class="mb-4">
                            <p class="text-sm text-gray-500 mb-2">Gambar meta saat ini:</p>
                            <img src="{{ asset('storage/' . $setting->meta_image) }}" alt="Meta Image"
                                 class="max-w-xs rounded-xl border border-gray-200 shadow-sm">
                        </div>
                    @endif
                    <div>
                        <label for="meta_image" class="block text-sm font-medium text-gray-700 mb-1">Upload Gambar Meta Share</label>
                        <input type="file" name="meta_image" id="meta_image" accept="image/jpeg,image/png,image/webp"
                               class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                        <p class="text-xs text-gray-400 mt-1">Digunakan untuk preview saat link website dibagikan ke WhatsApp/Facebook. Rekomendasi ukuran 1200x630 px, format JPG/PNG, maksimal 2 MB.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Kop Surat Cetak Data Siswa</h3>
                </div>
                <div class="p-5 space-y-4">
                    @if($setting->letterhead_png)
                        <div class="mb-4">
                            <p class="text-sm text-gray-500 mb-2">Kop surat saat ini:</p>
                            <img src="{{ asset('storage/' . $setting->letterhead_png) }}" alt="Kop Surat"
                                 class="max-h-32 rounded-lg border border-gray-200">
                        </div>
                    @endif
                    <div>
                        <label for="letterhead_png" class="block text-sm font-medium text-gray-700 mb-1">Upload Kop Surat PNG</label>
                        <input type="file" name="letterhead_png" id="letterhead_png" accept="image/png"
                               class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                        <p class="text-xs text-gray-400 mt-1">Format PNG, maksimal 2MB. Gunakan gambar kop surat lengkap (logo + nama sekolah + alamat) selebar area cetak.</p>
                    </div>
                </div>
            </div>

            <div class="flex justify-end">
                <button type="submit"
                        class="px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    Simpan Pengaturan
                </button>
            </div>
        </form>
    </div>

    @push('scripts')
    <script>
    document.getElementById('copy-public-progress-url')?.addEventListener('click', function () {
        const input = document.getElementById('public-progress-url');
        if (!input) return;
        input.select();
        input.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            const btn = this;
            const orig = btn.textContent;
            btn.textContent = 'Tersalin!';
            setTimeout(() => { btn.textContent = orig; }, 1500);
        } catch (e) {
            alert('Tekan Ctrl+C untuk menyalin');
        }
    });
    </script>
    @endpush
</x-admin-layout>