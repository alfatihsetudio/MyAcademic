<form method="POST" action="{{ route('spmb.update-data.step', ['token' => $app->update_token, 'step' => 2]) }}?step=2">
    @csrf
    <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-emerald-800">Langkah 2: Data Orang Tua</h2>
        <p class="mt-1 text-sm text-emerald-700">Isi data ayah, ibu, dan kontak orang tua.</p>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Nama Ayah</label>
                <input type="text" name="father_name" value="{{ old('father_name', $app->father_name) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Nama Ibu</label>
                <input type="text" name="mother_name" value="{{ old('mother_name', $app->mother_name) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Ayah</label>
                <textarea name="alamat_ayah" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('alamat_ayah', $app->alamat_ayah) }}</textarea>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Alamat Ibu</label>
                <textarea name="alamat_ibu" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('alamat_ibu', $app->alamat_ibu) }}</textarea>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">No. WhatsApp Orang Tua</label>
                <input type="text" name="parent_whatsapp" value="{{ old('parent_whatsapp', $app->parent_whatsapp) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Pekerjaan Orang Tua lama</label>
                <input type="text" name="parent_job" value="{{ old('parent_job', $app->parent_job) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Pekerjaan Ayah</label>
                <input type="text" name="pekerjaan_ayah" value="{{ old('pekerjaan_ayah', $app->pekerjaan_ayah) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Pekerjaan Ibu</label>
                <input type="text" name="pekerjaan_ibu" value="{{ old('pekerjaan_ibu', $app->pekerjaan_ibu) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Pendidikan Ayah</label>
                <input type="text" name="pendidikan_ayah" value="{{ old('pendidikan_ayah', $app->pendidikan_ayah) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Pendidikan Ibu</label>
                <input type="text" name="pendidikan_ibu" value="{{ old('pendidikan_ibu', $app->pendidikan_ibu) }}" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">
            </div>
            @foreach(['penghasilan_ayah' => 'Penghasilan Ayah', 'penghasilan_ibu' => 'Penghasilan Ibu'] as $field => $label)
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

    @include('ppdb.update-data.partials.actions', ['current' => 2])
</form>
