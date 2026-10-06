@extends('layouts.public')

@php
    try {
        $schoolSetting ??= \App\Models\SchoolSetting::current();
    } catch (\Exception $e) {
        $schoolSetting = null;
    }

    $homeTitle = 'SMA Persis Serang | Islamic Boarding School';
    $ogTitle = 'SMA Persis Serang — Berakhlak Mulia, Berpikir Kritis, dan Mandiri';
    $homeDescription = 'SMA Persis Serang adalah sekolah Islam berasrama yang memadukan pendidikan formal, pembinaan akhlak dan keislaman, kemandirian, pendidikan kewirausahaan, serta pembelajaran teknologi untuk mempersiapkan siswa menghadapi era kecerdasan artifisial.';
    $twitterDescription = 'Berakhlak mulia, berpikir kritis, dan mandiri. Siap menghadapi era teknologi dan AI.';

    $homeUrl = url('/');
    $homeImage = $schoolSetting?->meta_image
        ? asset('storage/' . $schoolSetting->meta_image)
        : asset('images/og-sma-persis-serang.jpg');
@endphp

@section('title', $homeTitle)

@section('meta')
    <meta name="description" content="{{ $homeDescription }}">

    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $homeUrl }}">
    <meta property="og:title" content="{{ $ogTitle }}">
    <meta property="og:description" content="{{ $homeDescription }}">
    <meta property="og:image" content="{{ $homeImage }}">
    <meta property="og:image:secure_url" content="{{ $homeImage }}">
    <meta property="og:image:type" content="image/jpeg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="SMA Persis Serang - Islamic Boarding School">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $homeTitle }}">
    <meta name="twitter:description" content="{{ $twitterDescription }}">
    <meta name="twitter:image" content="{{ $homeImage }}">
@endsection

@section('content')

@php
    $hasHeroImages = $heroImages && $heroImages->count() > 0;
    $heroImagePayload = $hasHeroImages
        ? $heroImages->map(fn ($img) => ['path' => asset('storage/' . $img->image_path), 'title' => $img->title])->values()
        : collect();
    $firstHeroImage = $hasHeroImages ? asset('storage/' . $heroImages->first()->image_path) : null;
    $displayName = $schoolSetting?->school_name ?? ($homePage?->title ?? 'SMA Persis Serang');
    $displayTagline = $schoolSetting?->tagline ?? ($homePage?->subtitle ?? 'Islamic Boarding School Berbasis Akhlak dan Teknologi');
    $homeContent = $homePage?->content ?? null;
    $heroDescription = $schoolSetting?->description
        ?? $homeContent
        ?? 'Pendidikan berasrama yang mengintegrasikan akhlak, keislaman, kemandirian, dan teknologi untuk membentuk generasi terbaik.';

    if ($currentAdmissionYear) {
        $badgeLabels = [
            'open' => 'SPMB ' . $currentAdmissionYear->academic_year . ' Dibuka',
            'almost_full' => 'Kuota Hampir Penuh',
            'quota_full' => 'Kuota Penuh',
            'closed' => 'Pendaftaran Ditutup',
            'draft' => 'SPMB Belum Dibuka',
            'announcement' => 'Masa Pengumuman',
            'archived' => 'SPMB Tidak Aktif',
        ];
        $badgeLabel = $badgeLabels[$currentAdmissionYear->status] ?? 'SPMB';
    } else {
        $badgeLabel = 'Informasi SPMB belum tersedia';
    }

    $primaryActionRoute = ($currentAdmissionYear && in_array($currentAdmissionYear->status, ['open', 'almost_full']))
        ? route('spmb.create')
        : route('spmb.status.form');
    $primaryActionLabel = ($currentAdmissionYear && in_array($currentAdmissionYear->status, ['open', 'almost_full']))
        ? 'Daftar SPMB'
        : 'Cek Status';
    $contactActionLabel = ($currentAdmissionYear && in_array($currentAdmissionYear->status, ['quota_full', 'closed', 'draft', 'archived']))
        ? 'Hubungi Admin'
        : 'Konsultasi SPMB';

    $values = $schoolValues?->isNotEmpty()
        ? $schoolValues
        : collect([
            (object) ['title' => 'Akhlak', 'description' => 'Berakhlakul karimah dalam sikap dan tindakan.', 'icon' => 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'],
            (object) ['title' => 'Keilmuan', 'description' => 'Berilmu luas, kritis, dan terus bertumbuh.', 'icon' => 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 13.5c0 1.657-2.686 3-6 3s-6-1.343-6-3c0-.985.059-1.963.16-2.922L12 14z'],
            (object) ['title' => 'Teknologi', 'description' => 'Melek teknologi untuk masa depan yang lebih baik.', 'icon' => 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
            (object) ['title' => 'Kepemimpinan', 'description' => 'Mandiri, percaya diri, dan siap memberi manfaat.', 'icon' => 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L3.077 10.1c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'],
        ]);

    $iconPaths = [
        'book-open' => 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        'academic-cap' => 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 13.5c0 1.657-2.686 3-6 3s-6-1.343-6-3c0-.985.059-1.963.16-2.922L12 14z',
        'computer-desktop' => 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        'users' => 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    ];

    $featuredPrograms = [
        ['title' => 'Sistem Berasrama', 'description' => 'Lingkungan belajar dan pembinaan santri yang terjaga selama 24 jam.', 'icon' => 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h1m-1 4h1m4-4h1m-1 4h1'],
        ['title' => 'Kurikulum Terpadu', 'description' => 'Integrasi ilmu umum, diniyah, tahfidz, dan pembiasaan ibadah.', 'icon' => 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'],
        ['title' => 'Pembelajaran Modern', 'description' => 'Ruang belajar adaptif dengan pendekatan digital dan kolaboratif.', 'icon' => 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'],
        ['title' => 'Pembinaan Karakter', 'description' => 'Pendampingan akhlak, kedisiplinan, kemandirian, dan adab harian.', 'icon' => 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'],
        ['title' => 'Prestasi & Kompetisi', 'description' => 'Bimbingan akademik dan non-akademik untuk mengasah potensi terbaik.', 'icon' => 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L22 12l-6.714 2.143L13 21l-2.286-6.857L4 12l6.714-2.143L13 3z'],
    ];
@endphp

<section
    @if($hasHeroImages)
        x-data="{
            active: 0,
            images: {{ $heroImagePayload->toJson() }},
            interval: null,
            start() {
                if (this.images.length < 2) return;
                this.interval = setInterval(() => { this.active = (this.active + 1) % this.images.length; }, 5000);
            },
            currentImage() { return this.images[this.active]?.path; }
        }"
        x-init="start()"
    @endif
    class="relative isolate min-h-[760px] overflow-hidden bg-[#052E1F] lg:min-h-[900px]"
>
    @if($hasHeroImages)
        <div class="absolute inset-0 bg-cover bg-center transition-all duration-1000"
             style="background-image: url('{{ $firstHeroImage }}')"
             :style="`background-image: url('${currentImage()}')`"></div>
    @else
        <div class="absolute inset-0 bg-gradient-to-br from-[#052E1F] via-[#063f2a] to-[#0F6B3A]"></div>
        <div class="absolute inset-0 opacity-[0.08]"
             style="background-image: linear-gradient(135deg, rgba(255,255,255,.45) 1px, transparent 1px); background-size: 42px 42px;"></div>
    @endif

    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-900/30"></div>
    <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-emerald-950/80 via-emerald-950/35 to-transparent"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="pb-16 pt-20 sm:pt-28 lg:pb-20 lg:pt-32">
            <div class="max-w-3xl">
                <div class="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur">
                    <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                    {{ $badgeLabel }}
                </div>

                <p class="mt-6 text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100/80">{{ $schoolSetting?->short_name ?? 'Islamic Boarding School' }}</p>
                <h1 class="mt-3 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
                    {{ $displayName }}
                </h1>
                <p class="mt-4 text-xl font-semibold text-amber-300 sm:text-2xl">
                    {{ $displayTagline }}
                </p>
                <p class="mt-6 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
                    {{ $heroDescription }}
                </p>

                <div class="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <a href="{{ $primaryActionRoute }}"
                       class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-7 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-900/20 transition hover:from-amber-300 hover:to-amber-500">
                        {{ $primaryActionLabel }}
                        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                    </a>
                    @if($currentAdmissionYear?->show_consultation_button ?? true)
                    <button type="button" onclick="toggleAiChatPanel()"
                       class="inline-flex items-center justify-center rounded-xl border border-amber-300/80 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10">
                        {{ $contactActionLabel }}
                    </button>
                    @endif
                    <a href="{{ route('donasi-pendidikan') }}"
                       class="inline-flex items-center justify-center rounded-xl border border-emerald-100/50 bg-emerald-950/50 px-7 py-4 text-sm font-bold text-emerald-50 transition hover:bg-white/10">
                        Donasi Pendidikan
                    </a>
                </div>

                @if($currentAdmissionYear && $currentAdmissionYear->status === 'almost_full')
                    <p class="mt-4 text-sm font-medium text-amber-200">Segera daftar sebelum kuota terpenuhi</p>
                @endif
            </div>

            <div class="mt-16 lg:mt-20">
                <div class="grid overflow-hidden rounded-2xl border border-amber-400/20 bg-emerald-950/75 text-white shadow-lg shadow-emerald-950/15 backdrop-blur-sm sm:grid-cols-2 lg:grid-cols-4">
                    @foreach($values as $value)
                        <div class="px-8 py-8 transition hover:bg-white/5 {{ $loop->last ? '' : 'border-b border-amber-400/20 sm:odd:border-r lg:border-b-0 lg:border-r' }} border-amber-400/25">
                            <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-amber-400/70 text-amber-400">
                                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="{{ $iconPaths[$value->icon] ?? $value->icon }}"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold text-white">{{ $value->title }}</h3>
                            <p class="mt-3 text-sm leading-6 text-emerald-50/80">{{ $value->description }}</p>
                        </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>
</section>

<section class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">Program Unggulan</p>
            <h2 class="mt-3 font-serif text-3xl font-bold leading-tight text-[#052E1F] sm:text-4xl">
                Pendidikan Berasrama, Pembinaan Sepenuh Hati
            </h2>
            <p class="mt-4 text-lg leading-8 text-emerald-900/70">
                Program dirancang untuk membentuk pribadi beradab, berilmu, dan siap hidup mandiri dalam lingkungan yang disiplin dan terarah.
            </p>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            @foreach($featuredPrograms as $program)
                <div class="group rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-md shadow-emerald-950/5 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-emerald-950/10">
                    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#052E1F] text-amber-300 shadow-lg shadow-emerald-950/15">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="{{ $program['icon'] }}"/>
                        </svg>
                    </div>
                    <h3 class="mt-6 text-lg font-bold text-[#052E1F]">{{ $program['title'] }}</h3>
                    <p class="mt-3 text-sm leading-6 text-gray-600">{{ $program['description'] }}</p>
                </div>
            @endforeach
        </div>
    </div>
</section>

@if($agendaEvents->isNotEmpty())
<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between">
            <div class="max-w-3xl">
                <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">Agenda Pendidikan</p>
                <h2 class="mt-3 font-serif text-3xl font-bold leading-tight text-[#052E1F] sm:text-4xl">
                    Kegiatan Terdekat
                </h2>
                <p class="mt-4 text-lg leading-8 text-emerald-900/70">
                    Agenda dan kegiatan sekolah yang akan datang.
                </p>
            </div>
            <a href="{{ route('public.academic-calendar') }}"
               class="hidden shrink-0 items-center gap-1.5 rounded-xl bg-[#0F6B3A] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#0A4F2B] sm:inline-flex">
                Lihat Semua
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            </a>
        </div>

        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            @foreach($agendaEvents as $event)
                <a href="{{ route('public.academic-calendar', ['month' => \Carbon\Carbon::parse($event['start_date'])->format('Y-m')]) }}"
                   class="group relative flex flex-col rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-md shadow-emerald-950/5 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-emerald-950/10">
                    <div class="flex items-center gap-2">
                        <span class="inline-block h-2.5 w-2.5 rounded-full {{ $event['dot_class'] }}"></span>
                        <span class="text-xs font-semibold uppercase tracking-wider {{ $event['text_class'] }}">{{ $event['category_label'] }}</span>
                    </div>
                    <h3 class="mt-4 font-bold text-[#052E1F] group-hover:text-[#0F6B3A]">{{ $event['title'] }}</h3>
                    <div class="mt-auto pt-4">
                        <div class="flex items-center gap-1.5 text-sm text-gray-500">
                            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            <span>{{ $event['date_formatted'] }}</span>
                        </div>
                        @if($event['start_time'])
                            <div class="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span>{{ $event['start_time'] }}@if($event['end_time'])–{{ $event['end_time'] }}@endif</span>
                            </div>
                        @endif
                    </div>
                </a>
            @endforeach
        </div>

        <div class="mt-8 text-center sm:hidden">
            <a href="{{ route('public.academic-calendar') }}"
               class="inline-flex items-center gap-1.5 rounded-xl bg-[#0F6B3A] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#0A4F2B]">
                Lihat Semua
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            </a>
        </div>
    </div>
</section>
@endif

<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <div>
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">Tentang Sekolah</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] lg:text-4xl">Tentang {{ $displayName }}</h2>
            <p class="mt-6 text-lg leading-8 text-gray-600">
                {{ $schoolSetting?->about_school ?? $schoolSetting?->description ?? (($schoolSetting?->school_name ?? 'SMA Persis Serang') . ' adalah sekolah berasrama yang membina akhlak, keislaman, kemandirian, dan teknologi untuk membentuk generasi berilmu dan beradab.') }}
            </p>
            <a href="{{ route('public.profile') }}"
               class="mt-8 inline-flex items-center rounded-xl bg-[#0F6B3A] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-[#0A4F2B]">
                Lihat Profil Lengkap
                <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
            </a>
        </div>
        <div class="relative">
            @if($buildingImages?->isNotEmpty())
                @php($welcomeImages = $buildingImages->map(fn($img) => [
                    'src' => asset('storage/' . $img->image_path),
                    'title' => $img->title ?? '',
                ])->values())
                <div class="welcome-carousel relative aspect-[4/3] overflow-hidden rounded-2xl border border-amber-100 shadow-xl shadow-emerald-950/10 bg-[#052E1F]">
                    <div class="relative h-full w-full">
                        @foreach($welcomeImages as $i => $img)
                            <div class="welcome-slide absolute inset-0 {{ $i === 0 ? 'opacity-100' : 'opacity-0' }} transition-opacity duration-500">
                                <img src="{{ $img['src'] }}"
                                     alt="{{ $img['title'] ?: 'Foto ' . $displayName }}"
                                     class="h-full w-full object-cover">
                                @if($img['title'])
                                    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                        <p class="text-sm font-semibold text-white">{{ $img['title'] }}</p>
                                    </div>
                                @endif
                            </div>
                        @endforeach
                    </div>

                    @if($welcomeImages->count() > 1)
                        <button onclick="welcomeCarouselPrev()"
                                class="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                        </button>
                        <button onclick="welcomeCarouselNext()"
                                class="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>

                        <div class="welcome-dots absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                            @foreach($welcomeImages as $i => $img)
                                <button onclick="welcomeCarouselGoTo({{ $i }})"
                                        class="welcome-dot h-2 rounded-full transition-all duration-300 {{ $i === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70' }}">
                                </button>
                            @endforeach
                        </div>
                    @endif
                </div>
                <script>
                    (function() {
                        var el = document.querySelector('.welcome-carousel');
                        if (!el) return;
                        var slides = el.querySelectorAll('.welcome-slide');
                        var dots = el.querySelectorAll('.welcome-dot');
                        if (!slides.length) return;
                        var current = 0;
                        var total = slides.length;
                        var timer = null;

                        function show(idx) {
                            slides.forEach(function(s, i) {
                                s.classList.toggle('opacity-100', i === idx);
                                s.classList.toggle('opacity-0', i !== idx);
                            });
                            if (dots.length) {
                                dots.forEach(function(d, i) {
                                    if (i === idx) {
                                        d.className = 'welcome-dot h-2 rounded-full transition-all duration-300 w-6 bg-white';
                                    } else {
                                        d.className = 'welcome-dot h-2 rounded-full transition-all duration-300 w-2 bg-white/50 hover:bg-white/70';
                                    }
                                });
                            }
                            current = idx;
                        }

                        function next() {
                            show((current + 1) % total);
                            resetTimer();
                        }

                        function prev() {
                            show((current - 1 + total) % total);
                            resetTimer();
                        }

                        function goTo(idx) {
                            show(idx);
                            resetTimer();
                        }

                        function resetTimer() {
                            if (timer) clearInterval(timer);
                            if (total > 1) {
                                timer = setInterval(next, 4500);
                            }
                        }

                        el.addEventListener('mouseenter', function() {
                            if (timer) clearInterval(timer);
                        });
                        el.addEventListener('mouseleave', function() {
                            resetTimer();
                        });

                        window.welcomeCarouselNext = next;
                        window.welcomeCarouselPrev = prev;
                        window.welcomeCarouselGoTo = goTo;

                        resetTimer();
                    })();
                </script>
            @elseif($schoolSetting?->building_image_path)
                <div class="aspect-[4/3] overflow-hidden rounded-2xl border border-amber-100 shadow-xl shadow-emerald-950/10">
                    <img src="{{ asset('storage/' . $schoolSetting->building_image_path) }}"
                         alt="Foto {{ $displayName }}"
                         class="h-full w-full object-cover">
                </div>
            @else
                <div class="flex aspect-[4/3] items-center justify-center rounded-2xl border border-amber-100 bg-gradient-to-br from-[#052E1F] to-[#0F6B3A] p-8 text-center shadow-xl shadow-emerald-950/10">
                    <div>
                        <p class="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">{{ $schoolSetting?->short_name ?? 'SMA Persis Serang' }}</p>
                        <p class="mt-3 font-serif text-3xl font-bold text-white">{{ $displayName }}</p>
                    </div>
                </div>
            @endif
        </div>
    </div>
</section>

<section id="kontak" class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
                <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">Kontak</p>
                <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] lg:text-4xl">Hubungi Kami</h2>
                <p class="mt-4 text-lg leading-8 text-emerald-900/70">Silakan hubungi kami untuk informasi pendaftaran dan kunjungan sekolah.</p>
            </div>
            <div class="grid gap-5 md:grid-cols-2">
                <div class="rounded-2xl border border-amber-100 bg-white p-6 shadow-md shadow-emerald-950/5">
                    <h3 class="text-lg font-bold text-[#052E1F]">Alamat</h3>
                    <p class="mt-3 leading-relaxed text-gray-600">
                        {{ $schoolSetting?->address ?? 'Jl. Pendidikan No. 10' }}<br>
                        {{ $schoolSetting?->city ?? 'Kota Serang' }}{{ $schoolSetting?->city && $schoolSetting?->province ? ', ' : '' }}{{ $schoolSetting?->province ?? 'Banten' }}<br>
                        Indonesia
                    </p>
                </div>
                <div class="rounded-2xl border border-amber-100 bg-white p-6 shadow-md shadow-emerald-950/5">
                    <h3 class="text-lg font-bold text-[#052E1F]">Hubungi Kami</h3>
                    <div class="mt-3 space-y-2 leading-relaxed text-gray-600">
                        <p>WhatsApp: {{ $schoolSetting?->whatsapp_number ?? '+6281234567890' }}</p>
                        <p>Email: {{ $schoolSetting?->email ?? 'info@smapersisserang.sch.id' }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

@endsection
