@php
    $requiredDocumentsComplete = true;
    foreach ($requirements as $key => $req) {
        if (($req['required'] ?? false) && !isset($uploadedFiles[$key])) {
            $requiredDocumentsComplete = false;
            break;
        }
    }
    $row = function ($label, $value) {
        return ['label' => $label, 'value' => filled($value) ? $value : '-'];
    };
    $studentRows = [
        $row('Nama Lengkap', $app->student_name),
        $row('NISN', $app->nisn),
        $row('Jenis Kelamin', $app->gender ? ucwords(str_replace('_', ' ', $app->gender)) : null),
        $row('Tempat, Tanggal Lahir', trim(($app->birth_place ?: '-') . ', ' . ($app->birth_date?->format('d/m/Y') ?: '-'))),
        $row('Sekolah Sebelumnya', $app->previous_school),
        $row('Alamat Siswa', $app->address),
    ];
    $parentRows = [
        $row('Nama Ayah', $app->father_name),
        $row('Nama Ibu', $app->mother_name),
        $row('WhatsApp Orang Tua', $app->parent_whatsapp),
        $row('Pekerjaan Ayah', $app->pekerjaan_ayah),
        $row('Pekerjaan Ibu', $app->pekerjaan_ibu),
    ];
    $guardianRows = [
        $row('Nama Ayah Wali', $app->nama_ayah_wali),
        $row('Nama Ibu Wali', $app->nama_ibu_wali),
        $row('Telepon Wali', $app->telepon_wali),
    ];
    $boardingRows = [
        $row('Siap Boarding', is_null($app->boarding_ready) ? '-' : ($app->boarding_ready ? 'Ya' : 'Tidak')),
        $row('Kemampuan Baca Al-Quran', $app->quran_reading_ability ? ucwords(str_replace('_', ' ', $app->quran_reading_ability)) : null),
        $row('Motivasi', $app->motivation),
        $row('Catatan Kesehatan', $app->health_notes),
    ];
@endphp

<div>
    <div class="border-b border-emerald-100 bg-emerald-50 px-5 py-4 sm:px-6">
        <h2 class="text-lg font-bold text-emerald-800">Langkah 6: Review & Kirim Final</h2>
        <p class="mt-1 text-sm text-emerald-700">Periksa kembali data. Setelah dikirim final, data menunggu verifikasi admin.</p>
    </div>

    <div class="space-y-4 p-5 sm:p-6">
        @foreach(['Data Siswa' => $studentRows, 'Data Orang Tua' => $parentRows, 'Data Wali' => $guardianRows, 'Boarding, Al-Quran, Motivasi & Kesehatan' => $boardingRows] as $title => $rows)
            <section class="rounded-xl border border-gray-200 p-4">
                <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-700">{{ $title }}</h3>
                <dl class="mt-3 space-y-2 text-sm">
                    @foreach($rows as $item)
                        <div class="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-4">
                            <dt class="text-gray-500">{{ $item['label'] }}</dt>
                            <dd class="font-medium text-gray-900 sm:col-span-2">{{ $item['value'] }}</dd>
                        </div>
                    @endforeach
                </dl>
            </section>
        @endforeach

        <section class="rounded-xl border border-gray-200 p-4">
            <div class="flex items-center justify-between gap-3">
                <h3 class="text-sm font-bold uppercase tracking-wide text-emerald-700">Status Dokumen</h3>
                <span class="rounded-full px-2 py-1 text-xs font-bold {{ $requiredDocumentsComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' }}">
                    {{ $requiredDocumentsComplete ? 'Lengkap' : 'Belum Lengkap' }}
                </span>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                @foreach($requirements as $key => $req)
                    @php $hasFile = isset($uploadedFiles[$key]); @endphp
                    <div class="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                        <span class="text-gray-700">{{ $req['label'] }}</span>
                        <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold {{ $hasFile ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' }}">
                            {{ $hasFile ? 'Sudah' : 'Belum' }}
                        </span>
                    </div>
                @endforeach
            </div>
        </section>
    </div>

    <form method="POST" action="{{ route('spmb.update-data.final-submit', $app->update_token) }}?step=6">
        @csrf
        <div class="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <a href="{{ route('spmb.update-data', ['token' => $app->update_token, 'step' => 5]) }}" class="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                Kembali
            </a>
            <button type="submit" class="rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-emerald-950 shadow hover:bg-amber-300">
                Kirim Data Final
            </button>
        </div>
    </form>
</div>
