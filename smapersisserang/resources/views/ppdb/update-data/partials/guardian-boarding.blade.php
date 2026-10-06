<form method="POST" action="{{ route('spmb.update-data.step', ['token' => $app->update_token, 'step' => 3]) }}?step=3">
    @csrf
    <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-emerald-800">Langkah 3: Data Wali</h2>
        <p class="mt-1 text-sm text-emerald-700">Data wali boleh dikosongkan jika tidak ada.</p>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            @foreach([
                'nama_ayah_wali' => 'Nama Ayah Wali',
                'nama_ibu_wali' => 'Nama Ibu Wali',
                'telepon_wali' => 'Telepon Wali',
                'pekerjaan_ayah_wali' => 'Pekerjaan Ayah Wali',
                'pekerjaan_ibu_wali' => 'Pekerjaan Ibu Wali',
                'pendidikan_ayah_wali' => 'Pendidikan Ayah Wali',
                'pendidikan_ibu_wali' => 'Pendidikan Ibu Wali',
            ] as $field => $label)
                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">{{ $label }}</label>
                    <input type="text" name="{{ $field }}" value="{{ old($field, $app->{$field}) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                </div>
            @endforeach

            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Ayah Wali</label>
                <textarea name="alamat_ayah_wali" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('alamat_ayah_wali', $app->alamat_ayah_wali) }}</textarea>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Ibu Wali</label>
                <textarea name="alamat_ibu_wali" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('alamat_ibu_wali', $app->alamat_ibu_wali) }}</textarea>
            </div>

            @foreach(['penghasilan_ayah_wali' => 'Penghasilan Ayah Wali', 'penghasilan_ibu_wali' => 'Penghasilan Ibu Wali'] as $field => $label)
                <div>
                    <label class="mb-1 block text-sm font-semibold text-gray-700">{{ $label }}</label>
                    <select name="{{ $field }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
                        <option value="">-- Pilih --</option>
                        @foreach(['< 1 juta' => '< Rp 1.000.000', '1-2 juta' => 'Rp 1.000.000 - Rp 2.000.000', '2-5 juta' => 'Rp 2.000.000 - Rp 5.000.000', '5-10 juta' => 'Rp 5.000.000 - Rp 10.000.000', '> 10 juta' => '> Rp 10.000.000'] as $value => $text)
                            <option value="{{ $value }}" {{ old($field, $app->{$field}) === $value ? 'selected' : '' }}>{{ $text }}</option>
                        @endforeach
                    </select>
                </div>
            @endforeach

        </div>
    </div>

    @include('ppdb.update-data.partials.actions', ['current' => 3])
</form>
