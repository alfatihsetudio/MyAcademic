<div class="mx-auto max-w-xl rounded-2xl border border-emerald-100 bg-white p-5 text-center shadow-lg sm:p-8">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
    </div>

    @if(session('success'))
        <p class="mt-4 text-sm font-bold uppercase tracking-wide text-emerald-700">{{ session('success') }}</p>
    @endif

    <h2 class="mt-2 text-2xl font-bold text-slate-900">Data Berhasil Dikirim</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">
        Terima kasih. Data pendaftaran sudah dikirim dan sedang menunggu verifikasi panitia.
    </p>

    <dl class="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-left text-sm">
        <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Nomor Pendaftaran</dt>
            <dd class="text-right font-semibold text-slate-900">{{ $app->registration_number }}</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Nama Siswa</dt>
            <dd class="text-right font-semibold text-slate-900">{{ $app->student_name }}</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Status</dt>
            <dd class="text-right font-semibold text-emerald-700">Menunggu Verifikasi Panitia</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Waktu Kirim Final</dt>
            <dd class="text-right font-semibold text-slate-900">{{ $app->final_submitted_at?->format('d/m/Y H:i') ?? '-' }}</dd>
        </div>
    </dl>

    <a href="{{ route('spmb.info') }}" class="mt-5 inline-flex w-full justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 sm:w-auto">
        Kembali ke Halaman SPMB
    </a>
</div>
