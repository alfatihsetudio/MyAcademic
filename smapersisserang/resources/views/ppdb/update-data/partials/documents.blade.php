<form method="POST" action="{{ route('spmb.update-data.step', ['token' => $app->update_token, 'step' => 5]) }}?step=5" enctype="multipart/form-data">
    @csrf
    <div class="border-b border-amber-100 bg-amber-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-amber-800">Langkah 5: Upload Dokumen</h2>
        <p class="mt-1 text-sm text-amber-700">Dokumen bisa diunggah bertahap. File lama tetap tersimpan jika tidak diganti.</p>
    </div>

    <div class="space-y-3 p-5 sm:p-6">
        @foreach($requirements as $key => $req)
            @php
                $uploaded = $uploadedFiles[$key] ?? null;
                $hasFile = filled($uploaded);
            @endphp
            <div class="rounded-xl border p-3 {{ $hasFile ? 'border-emerald-200 bg-emerald-50/40' : 'border-gray-200 bg-white' }}">
                <div class="flex items-start gap-3">
                    <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full {{ $hasFile ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' }}">
                        @if($hasFile)
                            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                        @else
                            <span class="text-xs font-bold">!</span>
                        @endif
                    </div>
                    <div class="min-w-0 flex-1">
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p class="text-sm font-semibold text-gray-800">
                                    {{ $req['label'] }}
                                    @if($req['required'])
                                        <span class="text-red-500">*</span>
                                    @endif
                                </p>
                                @if($hasFile)
                                    <div class="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                        <span class="rounded-full bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Sudah diunggah</span>
                                        <span class="text-gray-500">{{ $uploaded->original_filename }}</span>
                                        @if($uploaded->fileSizeDisplay())
                                            <span class="text-gray-400">{{ $uploaded->fileSizeDisplay() }}</span>
                                        @endif
                                        @if($uploaded->fileUrl())
                                            <a href="{{ $uploaded->fileUrl() }}" target="_blank" class="font-semibold text-emerald-700 underline">Lihat</a>
                                        @endif
                                    </div>
                                @else
                                    <p class="mt-1 text-xs font-medium text-amber-700">Belum diunggah</p>
                                @endif
                            </div>
                            <input type="file" name="{{ $key }}" accept=".pdf,.jpg,.jpeg,.png" class="block w-full text-xs text-gray-500 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100 sm:max-w-xs">
                        </div>
                        @error($key)
                            <p class="mt-1 text-xs text-red-500">{{ $message }}</p>
                        @enderror
                    </div>
                </div>
            </div>
        @endforeach

        <div class="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
            Format file: PDF, JPG, JPEG, PNG. PDF maksimal 2MB. File gambar maksimal 8MB sebelum dikompres.
        </div>
    </div>

    @include('ppdb.update-data.partials.actions', ['current' => 5])
</form>
