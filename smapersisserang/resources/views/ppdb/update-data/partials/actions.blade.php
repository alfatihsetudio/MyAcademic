<div class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div>
        @if($current > 1)
            <a href="{{ route('spmb.update-data', ['token' => $app->update_token, 'step' => $current - 1]) }}" class="inline-flex w-full justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto">
                Kembali
            </a>
        @else
            <a href="{{ route('spmb.info') }}" class="inline-flex w-full justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:w-auto">
                Kembali
            </a>
        @endif
    </div>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="submit" class="rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50">
            Simpan
        </button>
        <button type="submit" name="next" value="1" class="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow hover:bg-amber-300">
            Simpan & Lanjutkan
        </button>
    </div>
</div>
