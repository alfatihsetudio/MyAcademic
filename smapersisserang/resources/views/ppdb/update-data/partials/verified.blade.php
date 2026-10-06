<div class="mx-auto max-w-xl rounded-2xl border border-sky-100 bg-white p-5 text-center shadow-lg sm:p-8">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-100 text-sky-700">
        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    </div>

    <h2 class="mt-4 text-2xl font-bold text-slate-900">Data Sudah Diverifikasi</h2>
    <p class="mt-2 text-sm leading-relaxed text-slate-600">
        Data pendaftaran sudah diverifikasi panitia. Form perbarui data tidak dapat diedit kembali.
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
            <dd class="text-right font-semibold text-sky-700">Terverifikasi</dd>
        </div>
        <div class="flex justify-between gap-4">
            <dt class="text-slate-500">Waktu Verifikasi</dt>
            <dd class="text-right font-semibold text-slate-900">{{ $app->verified_at?->format('d/m/Y H:i') ?? '-' }}</dd>
        </div>
    </dl>

    <a href="{{ route('spmb.info') }}" class="mt-5 inline-flex w-full justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 sm:w-auto">
        Kembali ke Halaman SPMB
    </a>
</div>
