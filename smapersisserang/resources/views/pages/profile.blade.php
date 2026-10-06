@extends('layouts.public')

@section('content')

@php
    $pageTitle = $websitePage?->title ?? ($schoolSetting->school_name ?? 'SMA Persis Serang');
    $pageSubtitle = $websitePage?->subtitle ?? $schoolSetting?->tagline ?? 'Islamic Boarding School Berbasis Akhlak dan Teknologi';
    $pageContent = $websitePage?->content ?? $schoolSetting?->about_school ?? '';
    $heroBg = $schoolSetting?->building_image_path ? asset('storage/' . $schoolSetting->building_image_path) : null;
    $displayName = $schoolSetting->school_name ?? 'SMA Persis Serang';

    $schoolValues = \App\Models\SchoolValue::where('is_active', true)
        ->orderBy('sort_order')
        ->get();

    $iconPaths = [
        'book-open' => 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        'academic-cap' => 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 13.5c0 1.657-2.686 3-6 3s-6-1.343-6-3c0-.985.059-1.963.16-2.922L12 14z',
        'computer-desktop' => 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        'users' => 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    ];

    $boardingFeatures = [
        ['title' => 'Pembiasaan Ibadah', 'description' => 'Santri dibiasakan shalat berjamaah, tilawah, dan dzikir harian dalam suasana islami yang kondusif.', 'icon' => 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'],
        ['title' => 'Disiplin Harian', 'description' => 'Jadwal harian terstruktur dari bangun tidur hingga istirahat malam untuk membentuk kedisiplinan.', 'icon' => 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'],
        ['title' => 'Kemandirian Siswa', 'description' => 'Pembinaan life skill dan tanggung jawab pribadi melalui kegiatan boarding sehari-hari.', 'icon' => 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'],
    ];

@endphp

<section class="relative isolate min-h-[600px] overflow-hidden bg-[#052E1F] lg:min-h-[700px]">
    @if($heroBg)
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('{{ $heroBg }}')"></div>
    @else
        <div class="absolute inset-0 bg-gradient-to-br from-[#052E1F] via-[#063f2a] to-[#0F6B3A]"></div>
        <div class="absolute inset-0 opacity-[0.08]"
             style="background-image: linear-gradient(135deg, rgba(255,255,255,.45) 1px, transparent 1px); background-size: 42px 42px;"></div>
    @endif

    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-900/30"></div>
    <div class="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-emerald-950/80 via-emerald-950/35 to-transparent"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex min-h-[600px] flex-col justify-center pb-16 pt-28 lg:min-h-[700px] lg:pb-20 lg:pt-32">
            <div class="max-w-3xl">
                <div class="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur">
                    <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                    PROFIL SEKOLAH
                </div>

                <h1 class="mt-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    Mengenal {{ $displayName }}
                </h1>
                <p class="mt-4 max-w-2xl text-lg font-semibold text-amber-300 sm:text-xl">
                    {{ $pageSubtitle }}
                </p>
                @if($pageContent)
                    <p class="mt-5 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
                        {{ Str::limit(strip_tags($pageContent), 200) }}
                    </p>
                @elseif($schoolSetting?->description)
                    <p class="mt-5 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
                        {{ Str::limit($schoolSetting->description, 200) }}
                    </p>
                @endif

                <div class="mt-9 flex flex-col gap-3 sm:flex-row">
                    <a href="{{ route('public.program') }}"
                       class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-7 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-900/20 transition hover:from-amber-300 hover:to-amber-500">
                        Lihat Program
                        <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                        </svg>
                    </a>
                    @if($currentAdmissionYear?->show_consultation_button ?? true)
                    <button type="button" onclick="toggleAiChatPanel()"
                       class="inline-flex items-center justify-center rounded-xl border border-amber-300/80 px-7 py-4 text-sm font-bold text-white transition hover:bg-white/10">
                        Konsultasi SPMB
                    </button>
                    @endif
                </div>
            </div>
        </div>
    </div>
</section>

<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
                <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">TENTANG SEKOLAH</p>
                <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] lg:text-4xl">Tentang {{ $displayName }}</h2>
                <div class="mt-6 text-lg leading-8 text-gray-600">
                    {{ $schoolSetting?->about_school ?? $pageContent ?? $schoolSetting?->description ?? ($displayName . ' adalah sekolah berasrama yang membina akhlak, keislaman, kemandirian, dan teknologi untuk membentuk generasi berilmu dan beradab.') }}
                </div>

                <div class="mt-8 grid gap-4 sm:grid-cols-3">
                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                        <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0F6B3A] text-amber-300">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9h1m-1 4h1m4-4h1m-1 4h1"/>
                            </svg>
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#052E1F]">Pendidikan Berasrama</p>
                    </div>
                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                        <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0F6B3A] text-amber-300">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                            </svg>
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#052E1F]">Pembinaan Akhlak</p>
                    </div>
                    <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                        <div class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#0F6B3A] text-amber-300">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"/>
                            </svg>
                        </div>
                        <p class="mt-3 text-sm font-bold text-[#052E1F]">Lingkungan Islami</p>
                    </div>
                </div>
            </div>
            <div class="relative">
                @if($buildingImages?->isNotEmpty())
                    @php($images = $buildingImages->map(fn($img) => [
                        'src' => asset('storage/' . $img->image_path),
                        'title' => $img->title ?? '',
                    ])->values())
                    <div id="building-carousel"
                         data-images='{{ json_encode($images) }}'
                         class="relative aspect-[4/3] overflow-hidden rounded-2xl border border-amber-100 shadow-xl shadow-emerald-950/10 bg-[#052E1F]">
                        <div class="relative h-full w-full">
                            @foreach($images as $i => $img)
                                <div class="carousel-slide absolute inset-0 {{ $i === 0 ? 'opacity-100' : 'opacity-0' }} transition-opacity duration-500">
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

                        @if($images->count() > 1)
                            <button onclick="carouselPrev()"
                                    class="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                                </svg>
                            </button>
                            <button onclick="carouselNext()"
                                    class="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-md backdrop-blur-sm transition hover:bg-white hover:scale-105">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>

                            <div id="carousel-dots" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                                @foreach($images as $i => $img)
                                    <button onclick="carouselGoTo({{ $i }})"
                                            class="carousel-dot h-2 rounded-full transition-all duration-300 {{ $i === 0 ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70' }}">
                                    </button>
                                @endforeach
                            </div>
                        @endif
                    </div>
                    <script>
                        (function() {
                            var el = document.getElementById('building-carousel');
                            if (!el) return;
                            var slides = el.querySelectorAll('.carousel-slide');
                            var dots = el.querySelectorAll('.carousel-dot');
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
                                            d.className = 'carousel-dot h-2 rounded-full transition-all duration-300 w-6 bg-white';
                                        } else {
                                            d.className = 'carousel-dot h-2 rounded-full transition-all duration-300 w-2 bg-white/50 hover:bg-white/70';
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

                            window.carouselNext = next;
                            window.carouselPrev = prev;
                            window.carouselGoTo = goTo;

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
    </div>
</section>

@if($schoolValues->isNotEmpty())
<section class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">NILAI UTAMA</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] sm:text-4xl">Nilai-Nilai {{ $displayName }}</h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-900/70">
                Fondasi pendidikan yang membentuk pribadi berkarakter islami dan berdaya saing global.
            </p>
        </div>

        <div class="mt-12 grid overflow-hidden rounded-2xl border border-amber-400/20 bg-emerald-950 text-white shadow-lg shadow-emerald-950/15 sm:grid-cols-2 lg:grid-cols-4">
            @foreach($schoolValues as $value)
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
</section>
@endif

@if($schoolSetting?->vision || $schoolSetting?->mission)
<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">VISI & MISI</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] sm:text-4xl">Visi & Misi {{ $displayName }}</h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-900/70">
                Arah dan langkah strategis dalam mencetak generasi unggul.
            </p>
        </div>

        <div class="mt-12 grid gap-8 md:grid-cols-2">
            @if($schoolSetting->vision)
                <div class="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-md shadow-emerald-950/5">
                    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0F6B3A] text-amber-300 shadow-lg shadow-emerald-950/15">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-[#0F6B3A]">Visi</h3>
                    <p class="mt-4 text-lg leading-relaxed text-gray-700">{{ $schoolSetting->vision }}</p>
                </div>
            @endif
            @if($schoolSetting->mission)
                <div class="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-8 shadow-md shadow-emerald-950/5">
                    <div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#D4A017] text-white shadow-lg shadow-amber-900/15">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-[#D4A017]">Misi</h3>
                    <div class="mt-4 space-y-3">
                        @foreach(explode("\n", $schoolSetting->mission) as $line)
                            @if(trim($line))
                                <div class="flex items-start gap-3">
                                    <span class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#D4A017]/10 text-[#D4A017]">
                                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                                        </svg>
                                    </span>
                                    <span class="text-lg leading-relaxed text-gray-700">{{ $line }}</span>
                                </div>
                            @endif
                        @endforeach
                    </div>
                </div>
            @endif
        </div>
    </div>
</section>
@endif

@if($schoolSetting?->about_boarding)
<section class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">BOARDING SCHOOL</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] sm:text-4xl">Pengalaman Boarding School</h2>
            <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-900/70">
                {{ $schoolSetting->about_boarding }}
            </p>
        </div>

        <div class="mt-12 grid gap-6 sm:grid-cols-3">
            @foreach($boardingFeatures as $feature)
                <div class="group rounded-2xl border border-amber-100 bg-white p-6 shadow-md shadow-emerald-950/5 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg hover:shadow-emerald-950/10">
                    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#052E1F] text-amber-300 shadow-lg shadow-emerald-950/15">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="{{ $feature['icon'] }}"/>
                        </svg>
                    </div>
                    <h3 class="mt-6 text-lg font-bold text-[#052E1F]">{{ $feature['title'] }}</h3>
                    <p class="mt-3 text-sm leading-6 text-gray-600">{{ $feature['description'] }}</p>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif

<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-2">
            @if($schoolSetting?->address || $schoolSetting?->city || $schoolSetting?->province)
            <div class="rounded-2xl border border-amber-100 bg-white p-8 shadow-md shadow-emerald-950/5">
                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6EE]">
                    <svg class="h-6 w-6 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Alamat</h3>
                <p class="mt-3 leading-relaxed text-gray-600">
                    {{ $schoolSetting->address }}<br>
                    {{ $schoolSetting->city }}{{ $schoolSetting->city && $schoolSetting->province ? ', ' : '' }}{{ $schoolSetting->province }}
                </p>
            </div>
            @endif
            @if($schoolSetting?->email || $schoolSetting?->whatsapp_number)
            <div class="rounded-2xl border border-amber-100 bg-white p-8 shadow-md shadow-emerald-950/5">
                <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF6EE]">
                    <svg class="h-6 w-6 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h3 class="text-xl font-semibold text-gray-900">Kontak</h3>
                <div class="mt-3 space-y-2 text-gray-600">
                    @if($schoolSetting->whatsapp_number)
                        <p>WhatsApp: {{ $schoolSetting->whatsapp_number }}</p>
                    @endif
                    @if($schoolSetting->email)
                        <p>Email: {{ $schoolSetting->email }}</p>
                    @endif
                </div>
            </div>
            @endif
        </div>

        @if($schoolSetting?->google_maps_embed_url)
            <div class="mt-10">
                <h3 class="mb-4 text-center text-xl font-semibold text-gray-900">Lokasi</h3>
                <iframe src="{{ $schoolSetting->google_maps_embed_url }}"
                        class="w-full h-72 rounded-3xl border border-emerald-100 shadow-lg"
                        loading="lazy"
                        referrerpolicy="no-referrer-when-downgrade"
                        allowfullscreen>
                </iframe>
                @if($schoolSetting?->google_maps_link)
                    <div class="mt-4 text-center">
                        <a href="{{ $schoolSetting->google_maps_link }}" target="_blank" rel="noopener"
                           class="inline-flex items-center gap-2 rounded-xl bg-[#0F6B3A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F6B3A]/20 transition hover:bg-[#0A4F2B]">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            Buka di Google Maps
                        </a>
                    </div>
                @endif
            </div>
        @elseif($schoolSetting?->google_maps_link)
            <div class="mt-10 text-center">
                <a href="{{ $schoolSetting->google_maps_link }}" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-2 rounded-xl bg-[#0F6B3A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F6B3A]/20 transition hover:bg-[#0A4F2B]">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    Buka di Google Maps
                </a>
            </div>
        @endif
    </div>
</section>

<section class="relative overflow-hidden bg-[#052E1F] py-16 lg:py-20">
    <div class="absolute inset-0 opacity-[0.04]"
         style="background-image: linear-gradient(135deg, rgba(255,255,255,.45) 1px, transparent 1px); background-size: 42px 42px;"></div>
    <div class="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="font-serif text-3xl font-bold text-white sm:text-4xl">Ingin mengenal {{ $displayName }} lebih dekat?</h2>
        <p class="mx-auto mt-4 max-w-2xl text-lg leading-8 text-emerald-100/80">
            Kami siap menyambut putra-putri Anda untuk bergabung dalam lingkungan pendidikan islami yang berasrama, berakhlak, dan berteknologi.
        </p>
        <div class="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            @if($currentAdmissionYear?->show_consultation_button ?? true)
            <button type="button" onclick="toggleAiChatPanel()"
               class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 px-8 py-4 text-sm font-bold text-emerald-950 shadow-lg shadow-amber-900/20 transition hover:from-amber-300 hover:to-amber-500">
                Konsultasi SPMB
            </button>
            @endif
            <a href="{{ route('public.program') }}"
               class="inline-flex items-center justify-center rounded-xl border border-amber-300/80 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10">
                Lihat Program
            </a>
        </div>
    </div>
</section>

@endsection