<form method="POST" action="{{ route('spmb.update-data.step', ['token' => $app->update_token, 'step' => 1]) }}?step=1" enctype="multipart/form-data">
    @csrf
    <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-emerald-800">Langkah 1: Data Siswa</h2>
        <p class="mt-1 text-sm text-emerald-700">Lengkapi identitas siswa. Data bisa disimpan bertahap.</p>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Nomor Pendaftaran</label>
            <input type="text" value="{{ $app->registration_number }}" readonly class="w-full rounded-lg border-gray-200 bg-gray-50 text-sm text-gray-600">
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Nama Lengkap <span class="text-red-500">*</span></label>
                <input type="text" name="student_name" value="{{ old('student_name', $app->student_name) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Nama Panggilan</label>
                <input type="text" name="nama_panggilan" value="{{ old('nama_panggilan', $app->nama_panggilan) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Nomor Induk Asal</label>
                <input type="text" name="nomor_induk_asal" value="{{ old('nomor_induk_asal', $app->nomor_induk_asal) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">NISN <span class="text-red-500">*</span></label>
                <input type="text" name="nisn" value="{{ old('nisn', $app->nisn) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Jenis Kelamin <span class="text-red-500">*</span></label>
                <select name="gender" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
                    <option value="">-- Pilih --</option>
                    <option value="laki_laki" {{ old('gender', $app->gender) === 'laki_laki' ? 'selected' : '' }}>Laki-laki</option>
                    <option value="perempuan" {{ old('gender', $app->gender) === 'perempuan' ? 'selected' : '' }}>Perempuan</option>
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Agama</label>
                <select name="agama" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="">-- Pilih --</option>
                    @foreach($agamaOptions as $opt)
                        <option value="{{ $opt }}" {{ old('agama', $app->agama) === $opt ? 'selected' : '' }}>{{ $opt }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Tempat Lahir <span class="text-red-500">*</span></label>
                <input type="text" name="birth_place" value="{{ old('birth_place', $app->birth_place) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Tanggal Lahir <span class="text-red-500">*</span></label>
                <input type="date" name="birth_date" value="{{ old('birth_date', $app->birth_date?->format('Y-m-d')) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Anak Ke</label>
                <input type="number" name="anak_ke" value="{{ old('anak_ke', $app->anak_ke) }}" min="1" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Status Anak dalam Keluarga</label>
                <select name="status_anak_dalam_keluarga" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option value="">-- Pilih --</option>
                    @foreach($statusKeluargaOptions as $opt)
                        <option value="{{ $opt }}" {{ old('status_anak_dalam_keluarga', $app->status_anak_dalam_keluarga) === $opt ? 'selected' : '' }}>{{ ucwords(str_replace('_', ' ', $opt)) }}</option>
                    @endforeach
                </select>
            </div>
        </div>

        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Siswa <span class="text-red-500">*</span></label>
            <textarea name="address" rows="3" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>{{ old('address', $app->address) }}</textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Telepon Siswa</label>
                <input type="text" name="telepon_siswa" value="{{ old('telepon_siswa', $app->telepon_siswa) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Sekolah Sebelumnya <span class="text-red-500">*</span></label>
                <input type="text" name="previous_school" value="{{ old('previous_school', $app->previous_school) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
            </div>
        </div>

        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Sekolah Asal</label>
            <textarea name="alamat_sekolah_asal" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('alamat_sekolah_asal', $app->alamat_sekolah_asal) }}</textarea>
        </div>

        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Foto 3x4</label>
            <input type="file" name="foto_3x4" accept="image/jpeg,image/png" class="w-full text-sm text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100">
            <p class="mt-1 text-xs text-gray-500">Format JPG/PNG, maksimal 8MB.</p>
            @if($app->foto_3x4)
                <img src="{{ asset('storage/' . $app->foto_3x4) }}" alt="Foto 3x4" class="mt-3 max-w-[130px] rounded-lg border border-gray-200">
            @endif
        </div>
    </div>

    @include('ppdb.update-data.partials.actions', ['current' => 1])
</form>
