<form method="POST" action="{{ route('spmb.update-data.step', ['token' => $app->update_token, 'step' => 4]) }}?step=4">
    @csrf
    <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-emerald-800">Langkah 4: Boarding, Al-Quran, Motivasi & Kesehatan</h2>
        <p class="mt-1 text-sm text-emerald-700">Mohon lengkapi bagian ini karena berkaitan dengan kesiapan santri mengikuti pendidikan berasrama.</p>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Siap Boarding <span class="text-red-500">*</span></label>
                <select name="boarding_ready" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
                    <option value="">-- Pilih --</option>
                    <option value="1" {{ old('boarding_ready', $app->boarding_ready) === true || old('boarding_ready', $app->boarding_ready) === 1 || old('boarding_ready', $app->boarding_ready) === '1' ? 'selected' : '' }}>Ya, Siap</option>
                    <option value="0" {{ old('boarding_ready', $app->boarding_ready) === false || old('boarding_ready', $app->boarding_ready) === 0 || old('boarding_ready', $app->boarding_ready) === '0' ? 'selected' : '' }}>Tidak</option>
                </select>
            </div>
            <div>
                <label class="mb-1 block text-sm font-semibold text-gray-700">Kemampuan Baca Al-Quran <span class="text-red-500">*</span></label>
                <select name="quran_reading_ability" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>
                    <option value="">-- Pilih --</option>
                    <option value="belum_bisa" {{ old('quran_reading_ability', $app->quran_reading_ability) === 'belum_bisa' ? 'selected' : '' }}>Belum Bisa</option>
                    <option value="terbata_bata" {{ old('quran_reading_ability', $app->quran_reading_ability) === 'terbata_bata' ? 'selected' : '' }}>Terbata-bata</option>
                    <option value="lancar" {{ old('quran_reading_ability', $app->quran_reading_ability) === 'lancar' ? 'selected' : '' }}>Lancar</option>
                    <option value="baik" {{ old('quran_reading_ability', $app->quran_reading_ability) === 'baik' ? 'selected' : '' }}>Baik</option>
                </select>
            </div>
        </div>

        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Motivasi <span class="text-red-500">*</span></label>
            <textarea name="motivation" rows="3" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500" required>{{ old('motivation', $app->motivation) }}</textarea>
        </div>
        <div>
            <label class="mb-1 block text-sm font-semibold text-gray-700">Catatan Kesehatan</label>
            <textarea name="health_notes" rows="2" class="w-full rounded-lg border-gray-300 text-sm focus:border-emerald-500 focus:ring-emerald-500">{{ old('health_notes', $app->health_notes) }}</textarea>
        </div>
    </div>

    @include('ppdb.update-data.partials.actions', ['current' => 4])
</form>
