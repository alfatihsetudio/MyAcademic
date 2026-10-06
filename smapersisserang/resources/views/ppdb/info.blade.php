@extends('layouts.public')

@php
    try {
        $schoolSetting ??= \App\Models\SchoolSetting::current();
    } catch (\Exception $e) {
        $schoolSetting = null;
    }

    $spmbTitle = 'SPMB SMA Persis Serang - Gratis Sekolah dan Asrama 3 Tahun';

    $defaultPromo = "Program khusus angkatan pertama SMA Persis Serang.\n\nGratis Uang Pendidikan, Asrama, dan Makan selama 3 tahun untuk 36 siswa angkatan pertama.\n\nRincian Program:\n• Uang Pendidikan Gratis\n• Uang Makan Asrama Gratis\n• Biaya Asrama Gratis\n• Berlaku selama 3 tahun\n• Kuota terbatas hanya untuk 36 siswa angkatan pertama\n\nCatatan:\nSeragam tidak gratis dan menjadi tanggung jawab masing-masing peserta didik.";
    $spmbDescription = $programs->first()?->description ?: $defaultPromo;

    $spmbUrl = request()->fullUrl();
    $spmbImage = $schoolSetting?->meta_image
        ? asset('storage/' . $schoolSetting->meta_image)
        : asset('images/og/default-og.jpg');
@endphp

@section('title', $spmbTitle)

@section('meta')
    <meta name="description" content="{{ $spmbDescription }}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $spmbUrl }}">
    <meta property="og:title" content="{{ $spmbTitle }}">
    <meta property="og:description" content="{{ $spmbDescription }}">
    <meta property="og:image" content="{{ $spmbImage }}">
    <meta property="og:image:secure_url" content="{{ $spmbImage }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Promo SPMB SMA Persis Serang Gratis Sekolah dan Asrama 3 Tahun">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $spmbTitle }}">
    <meta name="twitter:description" content="{{ $spmbDescription }}">
    <meta name="twitter:image" content="{{ $spmbImage }}">
@endsection

@section('content')
@php
    $program = $programs->first();
    $academicYear = $admissionYear?->academic_year ?? '2026/2027';

    $benefits = collect(preg_split('/\r\n|\r|\n/', $program?->benefits ?? ''))
        ->map(fn ($item) => trim($item))
        ->filter()
        ->values();

    $requirements = collect(preg_split('/\r\n|\r|\n/', $program?->requirements ?? ''))
        ->map(fn ($item) => trim($item))
        ->filter()
        ->values();


@endphp

<div class="bg-white">
    <section class="relative isolate overflow-hidden bg-gradient-to-br from-[#052E1F] via-[#0A4F2B] to-[#0F6B3A]">
        <div class="absolute inset-0 opacity-[0.06]"
             style="background-image: linear-gradient(135deg, rgba(255,255,255,.5) 1px, transparent 1px); background-size: 42px 42px;"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-emerald-950/20"></div>
        <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            <div class="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

                <div class="order-1 lg:order-1 flex justify-center">
                    @if(!empty($admissionYear?->promo_image))
                        <img src="{{ asset('storage/' . $admissionYear->promo_image) }}"
                             alt="Promo SPMB SMA Persis Serang"
                             class="w-full max-w-md lg:max-w-lg rounded-3xl shadow-2xl border border-yellow-400/30">
                    @else
                        <img src="{{ asset('images/spmb/promo-gratis-3-tahun.png') }}"
                             alt="Promo Gratis Biaya Sekolah dan Asrama SMA Persis Serang 3 Tahun"
                             class="w-full max-w-md lg:max-w-lg rounded-3xl shadow-2xl border border-yellow-400/30">
                    @endif
                </div>

                <div class="order-2 lg:order-2 text-center lg:text-left">
                    <div class="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur-sm">
                        <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                        SPMB Tahun Ajaran {{ $academicYear }}
                    </div>

                    <h1 class="mx-auto mt-6 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl lg:mx-0">
                        Penerimaan Murid Baru SMA Persis Serang
                    </h1>
                    <div class="mx-auto mt-4 h-1.5 w-32 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 lg:mx-0"></div>
                    <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-emerald-50 sm:text-xl lg:mx-0">
                        Islamic Boarding School berbasis Akhlak dan Teknologi
                    </p>
                    <div class="mx-auto mt-4 max-w-3xl rounded-2xl border border-amber-300/40 bg-white/10 px-5 py-3 text-sm leading-relaxed shadow-lg shadow-emerald-950/10 backdrop-blur sm:text-base lg:mx-0" style="color: #ffffff; text-align: left;">
                        {!! nl2br(e($spmbDescription)) !!}
                    </div>
                    <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                        <a href="{{ route('spmb.create') }}"
                           class="inline-flex w-full items-center justify-center rounded-xl bg-amber-400 px-7 py-3 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 sm:w-auto">
                            Daftar SPMB
                        </a>
                        @if($admissionYear?->show_consultation_button ?? true)
                        <button type="button" onclick="toggleAiChatPanel()"
                           class="inline-flex w-full items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 sm:w-auto">
                            Konsultasi SPMB
                        </button>
                        @endif
                        <a href="{{ route('donasi-pendidikan') }}"
                           class="inline-flex w-full items-center justify-center rounded-xl border border-amber-300/80 bg-emerald-950/30 px-7 py-3 text-sm font-semibold text-amber-200 backdrop-blur transition hover:bg-white/15 sm:w-auto">
                            Donasi Pendidikan
                        </a>
                    </div>
                </div>

            </div>
        </div>
    </section>

    <main class="bg-[#FBF7EF]">
        <section class="py-5 md:py-8">
            <div class="mx-auto max-w-4xl px-4">
                @if($admissionYear && $admissionStats)
                    <div class="grid grid-cols-2 gap-2 md:gap-4">
                        <div class="rounded-2xl border border-emerald-200 bg-white/90 px-2 py-3 text-center shadow-sm md:px-5 md:py-6 lg:py-7">
                            <div class="text-[10px] sm:text-xs md:text-base lg:text-lg font-semibold text-emerald-700 leading-tight">
                                Total Pendaftar
                            </div>
                            <div class="mt-1 md:mt-2 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-emerald-800 leading-none">
                                {{ $admissionStats['totalApplicants'] }}
                            </div>
                        </div>
                        <div class="rounded-2xl border border-emerald-200 bg-white/90 px-2 py-3 text-center shadow-sm md:px-5 md:py-6 lg:py-7">
                            <div class="text-[10px] sm:text-xs md:text-base lg:text-lg font-semibold text-emerald-700 leading-tight">
                                Sisa Kuota
                            </div>
                            <div class="mt-1 md:mt-2 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-emerald-800 leading-none">
                                {{ $admissionStats['remainingQuota'] }}
                            </div>
                        </div>
                    </div>
                @endif
            </div>
        </section>

        <section class="pb-12 lg:pb-16">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                @if($programs->isNotEmpty())
                    <div class="grid items-stretch gap-6 lg:grid-cols-2">
                        <article class="rounded-2xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-md shadow-emerald-950/5 lg:p-8">
                            <h3 class="text-xl md:text-2xl font-bold text-gray-900">Benefit Program</h3>
                            <div class="mt-6 space-y-4 md:space-y-5">
                                @if($benefits->isNotEmpty())
                                    @foreach($benefits as $benefit)
                                        <div class="flex items-start gap-3">
                                            <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#0F6B3A] text-white">
                                                <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </span>
                                            <p class="text-sm md:text-base leading-relaxed text-gray-700">{{ $benefit }}</p>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#0F6B3A] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Gratis biaya pendidikan selama program berjalan.</p>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#0F6B3A] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Gratis fasilitas asrama dalam lingkungan Islamic Boarding School.</p>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#0F6B3A] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Gratis makan untuk mendukung kegiatan belajar dan pembinaan harian.</p>
                                    </div>
                                @endif
                            </div>
                        </article>

                        <aside class="rounded-2xl border border-amber-200 bg-gradient-to-br from-white to-amber-50 p-6 shadow-md shadow-emerald-950/5 lg:p-8">
                            <h3 class="text-xl md:text-2xl font-bold text-gray-900">Syarat Pendaftaran</h3>
                            <div class="mt-6 space-y-4 md:space-y-5">
                                @if($requirements->isNotEmpty())
                                    @foreach($requirements as $requirement)
                                        <div class="flex items-start gap-3">
                                            <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-white">
                                                <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                </svg>
                                            </span>
                                            <p class="text-sm md:text-base leading-relaxed text-gray-700">{{ $requirement }}</p>
                                        </div>
                                    @endforeach
                                @else
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Lulusan SMP/MTs sederajat</p>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Siap mengikuti program boarding/asrama</p>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Mengisi formulir pendaftaran SPMB</p>
                                    </div>
                                    <div class="flex items-start gap-3">
                                        <span class="mt-0.5 flex h-6 w-6 md:h-7 md:w-7 shrink-0 items-center justify-center rounded-full bg-[#D4A017] text-white">
                                            <svg class="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                            </svg>
                                        </span>
                                        <p class="text-sm md:text-base leading-relaxed text-gray-700">Melengkapi data siswa dan orang tua</p>
                                    </div>
                                @endif
                            </div>
                        </aside>
                    </div>
                @else
                    <div class="mt-10 rounded-2xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
                        <p class="font-semibold text-gray-700">Belum ada program SPMB yang tersedia.</p>
                        <p class="mt-2 text-sm text-gray-500">Silakan hubungi panitia SPMB untuk informasi lebih lanjut.</p>
                    </div>
                @endif
            </div>
        </section>

        <section class="bg-white py-12 lg:py-16">
            <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div class="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 text-center shadow-md shadow-emerald-950/5 sm:p-8 lg:p-12">
                    <p class="text-sm font-bold uppercase tracking-[0.2em] text-[#D4A017]">SPMB {{ $academicYear }}</p>
                    <h2 class="mt-3 text-3xl font-bold text-gray-900 lg:text-4xl">Siap Bergabung?</h2>
                    <p class="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-600">
                        @if($admissionYear && in_array($admissionYear->status, ['open', 'almost_full']))
                            Daftarkan putra-putri Anda sekarang dan lengkapi data melalui form SPMB online.
                        @else
                            Hubungi tim SPMB kami untuk informasi jadwal, kuota, dan proses seleksi berikutnya.
                        @endif
                    </p>
                    <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        @if(!$admissionYear || in_array($admissionYear->status, ['open', 'almost_full']))
                            <a href="{{ route('spmb.create') }}"
                               class="inline-flex w-full items-center justify-center rounded-xl bg-[#0F6B3A] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:bg-[#0A4F2B] sm:w-auto">
                                Daftar SPMB
                            </a>
                        @endif
                        <a href="{{ route('spmb.status.form') }}"
                           class="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#0F6B3A] bg-white px-8 py-4 text-sm font-semibold text-[#0F6B3A] transition hover:bg-[#EAF6EE] sm:w-auto">
                            Cek Status
                        </a>
                        @if($admissionYear?->show_consultation_button ?? true)
                        <button type="button" onclick="toggleAiChatPanel()"
                           class="inline-flex w-full items-center justify-center rounded-xl border-2 border-[#D4A017] bg-white px-8 py-4 text-sm font-semibold text-[#D4A017] transition hover:bg-[#D4A017]/5 sm:w-auto">
                            Konsultasi SPMB
                        </button>
                        @endif
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>
@endsection
