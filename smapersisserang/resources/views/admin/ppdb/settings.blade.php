<x-admin-layout>
    <div class="space-y-6">
        <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Pengaturan SPMB</h2>
            <p class="text-sm text-gray-500 mt-0.5">Kelola tahun ajaran dan program pendaftaran</p>
        </div>

        <div class="p-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm rounded-lg">
            <strong>Informasi:</strong> Tahun Ajaran mengatur periode utama SPMB. Program Pendaftaran mengatur jalur atau program di dalam tahun ajaran tersebut. Beberapa field tampil langsung di halaman publik <strong>/spmb</strong>.
        </div>

        @if(session('success'))
            <div class="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                {{ session('success') }}
            </div>
        @endif

        @if(session('error'))
            <div class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {{ session('error') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                <ul class="list-disc list-inside space-y-1">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

            <form method="POST" action="{{ route('admin.ppdb.settings.update') }}" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Tahun Ajaran</h3>
                </div>
                <div class="p-5 space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Tahun Ajaran</label>
                            <input type="text" name="name" value="{{ old('name', $currentYear?->name ?? '') }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                            <p class="mt-1 text-xs text-gray-400">Label internal. Contoh: Tahun Ajaran 2026/2027.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Tahun Ajaran</label>
                            <input type="text" name="academic_year" value="{{ old('academic_year', $currentYear?->academic_year ?? '') }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required
                                   placeholder="2026/2027">
                            <p class="mt-1 text-xs text-gray-400">Akan tampil sebagai badge, misalnya: SPMB Tahun Ajaran 2026/2027.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Kuota Total SPMB</label>
                            <input type="number" name="quota" value="{{ old('quota', $currentYear?->quota ?? 36) }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required min="1">
                            <p class="mt-1 text-xs text-gray-400">Digunakan untuk menghitung sisa kuota di halaman publik. Jumlah seluruh program.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                            <select name="status"
                                    class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                                @foreach($yearStatuses as $s)
                                    <option value="{{ $s }}" {{ (old('status', $currentYear?->status ?? '') === $s) ? 'selected' : '' }}>
                                        {{ ucfirst(str_replace('_', ' ', $s)) }}
                                    </option>
                                @endforeach
                            </select>
                            <p class="mt-1 text-xs text-gray-400">Status utama SPMB. Menampilkan badge dan tombol CTA di halaman publik. Program tidak bisa diakses jika tidak <strong>open</strong>.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Tanggal Mulai</label>
                            <input type="date" name="start_date" value="{{ old('start_date', $currentYear?->start_date?->format('Y-m-d') ?? '') }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Tanggal Selesai</label>
                            <input type="date" name="end_date" value="{{ old('end_date', $currentYear?->end_date?->format('Y-m-d') ?? '') }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Catatan Internal</label>
                        <textarea name="description" rows="3"
                                  class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('description', $currentYear?->description ?? '') }}</textarea>
                        <p class="mt-1 text-xs text-gray-400">Tidak ditampilkan di halaman publik. Gunakan <strong>Deskripsi Promosi SPMB</strong> pada Program Pendaftaran untuk teks promosi.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Gambar Hero SPMB</label>
                        <input type="file" name="promo_image" accept="image/jpeg,image/png,image/webp"
                               class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100">
                        <p class="mt-1 text-xs text-gray-400">Format: JPG, PNG, WebP. Maksimal 2MB. Tampil di halaman /spmb sebagai gambar utama.</p>
                        @if($currentYear?->promo_image)
                            <div class="mt-3">
                                <img src="{{ asset('storage/' . $currentYear->promo_image) }}"
                                     alt="Preview Promo SPMB"
                                     class="max-w-xs rounded-xl border border-gray-200 shadow-sm">
                            </div>
                        @endif
                    </div>
                    <div>
                        <label class="flex items-center gap-3">
                            <input type="hidden" name="show_consultation_button" value="0">
                            <input type="checkbox" name="show_consultation_button" value="1"
                                    {{ old('show_consultation_button', $currentYear?->show_consultation_button ?? true) ? 'checked' : '' }}
                                   class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
                            <span class="text-sm font-semibold text-gray-700">Tampilkan Tombol Konsultasi SPMB</span>
                        </label>
                        <p class="mt-1 text-xs text-gray-400">Menampilkan tombol "Konsultasi SPMB" di halaman publik /spmb.</p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-amber-50">
                    <h3 class="text-sm font-semibold text-amber-800 uppercase tracking-wider">Program Pendaftaran</h3>
                </div>
                <div class="p-5 space-y-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="sm:col-span-2">
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Nama Program</label>
                            <input type="text" name="program_name" value="{{ old('program_name', $currentProgram?->name ?? '') }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                            <p class="mt-1 text-xs text-gray-400">Tampil di halaman /spmb dan beranda website. Contoh: Program Gratis Angkatan Pertama.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Tipe Program</label>
                            <select name="program_type"
                                    class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                                @foreach($programTypes as $val => $label)
                                    <option value="{{ $val }}" {{ (old('program_type', $currentProgram?->type ?? '') === $val) ? 'selected' : '' }}>
                                        {{ $label }}
                                    </option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Kuota Program Ini</label>
                            <input type="number" name="program_quota" value="{{ old('program_quota', $currentProgram?->quota ?? 36) }}"
                                   class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required min="1">
                            <p class="mt-1 text-xs text-gray-400">Kuota khusus program/jalur ini. Tampil di kartu program.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Status Program</label>
                            <select name="program_status"
                                    class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm" required>
                                @foreach($programStatuses as $s)
                                    <option value="{{ $s }}" {{ (old('program_status', $currentProgram?->status ?? '') === $s) ? 'selected' : '' }}>
                                        {{ ucfirst(str_replace('_', ' ', $s)) }}
                                    </option>
                                @endforeach
                            </select>
                            <p class="mt-1 text-xs text-gray-400">Status khusus program ini. Status utama SPMB tetap mengikuti Tahun Ajaran.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Biaya Pendaftaran</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input type="number" name="registration_fee" value="{{ old('registration_fee', $currentProgram?->registration_fee ?? 0) }}"
                                       class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-10" min="0">
                            </div>
                            <p class="mt-1 text-xs text-gray-400">Tampil di kartu program halaman /spmb.</p>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">SPP / Bulan</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input type="number" name="tuition_fee" value="{{ old('tuition_fee', $currentProgram?->tuition_fee ?? 0) }}"
                                       class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-10" min="0">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Biaya Asrama</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input type="number" name="boarding_fee" value="{{ old('boarding_fee', $currentProgram?->boarding_fee ?? 0) }}"
                                       class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-10" min="0">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Biaya Makan</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input type="number" name="meal_fee" value="{{ old('meal_fee', $currentProgram?->meal_fee ?? 0) }}"
                                       class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-10" min="0">
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-1">Biaya Lainnya</label>
                            <div class="relative">
                                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                                <input type="number" name="other_fee" value="{{ old('other_fee', $currentProgram?->other_fee ?? 0) }}"
                                       class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm pl-10" min="0">
                            </div>
                        </div>
                        <div>
                            <label class="flex items-center gap-3 mt-6">
                                <input type="checkbox" name="is_free_program" value="1"
                                        {{ old('is_free_program', $currentProgram?->is_free_program ?? false) ? 'checked' : '' }}
                                       class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500">
                                <span class="text-sm font-semibold text-gray-700">Program Gratis</span>
                            </label>
                            <p class="mt-1 text-xs text-gray-400">Jika dicentang, program ditandai sebagai program khusus/gratis.</p>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Deskripsi Promosi SPMB</label>
                        <textarea name="program_description" rows="3"
                                  class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('program_description', $currentProgram?->description ?? '') }}</textarea>
                        <p class="mt-1 text-xs text-gray-400">Teks promosi yang tampil di halaman /spmb. Bisa menggunakan beberapa baris.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Benefit Program</label>
                        <textarea name="program_benefits" rows="4"
                                  class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('program_benefits', $currentProgram?->benefits ?? '') }}</textarea>
                        <p class="mt-1 text-xs text-gray-400">Isi satu benefit per baris. Tampil sebagai daftar di halaman /spmb. Contoh: Gratis biaya pendidikan selama program berjalan.</p>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-1">Syarat Pendaftaran</label>
                        <textarea name="program_requirements" rows="4"
                                  class="block w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('program_requirements', $currentProgram?->requirements ?? '') }}</textarea>
                        <p class="mt-1 text-xs text-gray-400">Isi satu syarat per baris. Tampil sebagai daftar di halaman /spmb. Contoh: Lulusan SMP/MTs sederajat.</p>
                    </div>
                </div>
            </div>

            <div class="flex items-center gap-3 mt-6">
                <button type="submit"
                        class="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors shadow-sm">
                    Simpan Pengaturan
                </button>
                <a href="{{ route('admin.ppdb.dashboard') }}"
                   class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                    Batal
                </a>
            </div>
        </form>
    </div>
</x-admin-layout>
