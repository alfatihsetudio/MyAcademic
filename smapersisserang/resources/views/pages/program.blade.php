@extends('layouts.public')

@section('content')

<section class="relative isolate overflow-hidden bg-gradient-to-br from-[#052E1F] via-[#0A4F2B] to-[#0F6B3A]">
    <div class="absolute inset-0 opacity-[0.06]"
         style="background-image: linear-gradient(135deg, rgba(255,255,255,.5) 1px, transparent 1px); background-size: 42px 42px;"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-emerald-950/20"></div>
    <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950/40 to-transparent"></div>
    <div class="relative z-10 mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 lg:py-20">
        <div class="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur-sm">
            <span class="h-2 w-2 rounded-full bg-amber-300"></span>
            PROGRAM PENDIDIKAN
        </div>
        <h1 class="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {{ $websitePage?->title ?? 'Program Pendidikan' }}
        </h1>
        <div class="mx-auto mt-4 h-1.5 w-32 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"></div>
        <p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white lg:text-xl">
            {{ $websitePage?->subtitle ?? 'Kurikulum dan pembinaan yang memadukan akhlak, keislaman, kemandirian, dan teknologi.' }}
        </p>
    </div>
</section>

@php
    $sectionContent = null;
    if ($websitePage?->content) {
        $decoded = json_decode($websitePage->content, true);
        if (is_array($decoded)) {
            $sectionContent = $decoded;
        }
    }

    $sectionLabel = $sectionContent['section_label'] ?? 'NILAI UTAMA';
    $sectionHeading = $sectionContent['section_heading'] ?? 'Nilai Utama';
    $sectionSubtitle = $sectionContent['section_subtitle'] ?? 'Membentuk karakter dan kompetensi siswa secara holistik';

    $valueIconPaths = [
        'book-open' => 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
        'academic-cap' => 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422A12.083 12.083 0 0118 13.5c0 1.657-2.686 3-6 3s-6-1.343-6-3c0-.985.059-1.963.16-2.922L12 14z',
        'computer-desktop' => 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
        'users' => 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    ];

    $cardStyles = [
        ['bg' => 'bg-white', 'border' => 'border-t-[#0F6B3A]', 'iconBg' => 'bg-[#0F6B3A]', 'iconColor' => 'text-amber-300'],
        ['bg' => 'bg-[#EAF6EE]', 'border' => 'border-t-[#D4A017]', 'iconBg' => 'bg-[#D4A017]', 'iconColor' => 'text-[#052E1F]'],
    ];

    $valuesList = $schoolValues?->isNotEmpty() ? $schoolValues : collect();
@endphp

<section class="relative bg-[#FBF7EF] py-12 lg:py-16">
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: radial-gradient(circle, #052E1F 0.5px, transparent 0.5px); background-size: 36px 36px;"></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-2xl text-center">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">{{ $sectionLabel }}</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] sm:text-4xl">{{ $sectionHeading }}</h2>
            <p class="mt-4 text-lg leading-8 text-emerald-900/70">{{ $sectionSubtitle }}</p>
        </div>

        @if($valuesList->isEmpty())
            <div class="mt-10 rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
                <p class="font-medium text-gray-500">Belum ada nilai utama yang ditampilkan.</p>
            </div>
        @else
        <div class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            @foreach($valuesList as $i => $value)
                @php($style = $cardStyles[$i % 2])
                @php($iconPath = $valueIconPaths[$value->icon] ?? $value->icon)
                <div class="group flex flex-col rounded-2xl border border-amber-100/80 {{ $style['bg'] }} {{ $style['border'] }} border-t-4 shadow-md shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-950/10 p-5">
                    <span class="inline-block self-start rounded-full bg-emerald-950/80 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-amber-300">Nilai {{ str_pad($i + 1, 2, '0', STR_PAD_LEFT) }}</span>
                    <div class="mt-3 flex h-12 w-12 items-center justify-center rounded-2xl {{ $style['iconBg'] }} shadow-lg shadow-emerald-950/10 group-hover:scale-105 transition-transform duration-300">
                        <svg class="h-6 w-6 {{ $style['iconColor'] }}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="{{ $iconPath }}"/>
                        </svg>
                    </div>
                    <h3 class="mt-3 text-base font-bold text-[#052E1F]">{{ $value->title }}</h3>
                    @if($value->description)
                        <p class="mt-1.5 text-sm leading-relaxed text-gray-600">{{ $value->description }}</p>
                    @endif
                </div>
            @endforeach
        </div>
        @endif
    </div>
</section>

<section class="relative py-12 lg:py-16"
         style="background: #F9F6EF;
                background-image: radial-gradient(ellipse at 100% 0%, rgba(167, 201, 168, 0.15) 0%, transparent 60%);">
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
            <p class="text-sm font-bold tracking-[0.18em] uppercase text-[#D4A017]">Kurikulum &amp; Mata Pelajaran</p>
            <h2 class="mt-3 text-3xl font-bold text-gray-900 lg:text-4xl">Kurikulum &amp; Mata Pelajaran</h2>
            <p class="mt-5 text-lg leading-relaxed text-gray-600">
                Perpaduan pelajaran nasional, keislaman, teknologi, dan pembinaan karakter boarding school.
            </p>
            <p class="mt-4 rounded-2xl border border-amber-200 bg-amber-50/50 px-5 py-4 text-sm font-semibold text-emerald-950 shadow-sm">
                Yang membedakan kami: siswa tidak hanya belajar akademik, tetapi juga dibina dalam akhlak, keislaman, kemandirian, dan teknologi.
            </p>
        </div>

        <div class="mt-10 space-y-8">
            @if($subjectsByCategory->flatten(1)->isEmpty())
                <div class="rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
                    <p class="font-medium text-gray-500">Data mata pelajaran belum tersedia.</p>
                </div>
            @else
                @foreach($subjectCategories as $categoryKey => $categoryLabel)
                    @php($categorySubjects = $subjectsByCategory->get($categoryKey, collect()))
                    @continue($categorySubjects->isEmpty())

                    <div class="overflow-hidden rounded-[1.5rem] border border-amber-100 bg-white shadow-sm" data-category="{{ $categoryKey }}">
                    <div class="flex flex-col gap-2 bg-emerald-950 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm font-semibold text-[#D4A017]">{{ $categoryLabel }}</p>
                            <h3 class="mt-1 text-xl font-bold text-white">{{ $categoryLabel }}</h3>
                        </div>
                        <span class="w-fit rounded-full border border-amber-300/40 px-3 py-1 text-xs font-semibold text-amber-200">
                            {{ $categorySubjects->count() }} Mapel
                        </span>
                    </div>
                    <div class="grid gap-px bg-amber-100 md:grid-cols-2 lg:grid-cols-3">
                        @foreach($categorySubjects as $subject)
                            <article class="bg-white p-6 transition-colors hover:bg-amber-50/50">
                                <div class="flex items-start justify-between gap-3">
                                    <h4 class="text-lg font-bold text-gray-900">{{ $subject->name }}</h4>
                                    <span class="inline-flex w-fit shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        {{ $subject->category_label }}
                                    </span>
                                </div>
                                @if($subject->description)
                                    <p class="mt-3 text-sm leading-relaxed text-gray-600">{{ $subject->description }}</p>
                                @endif
                                @if($subject->teachers->isNotEmpty())
                                    <div class="mt-5">
                                        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Guru Pengampu</p>
                                        <div class="mt-2 flex flex-wrap gap-2">
                                            @foreach($subject->teachers as $teacher)
                                                <span class="rounded-full bg-emerald-950 px-3 py-1 text-xs font-semibold text-white">{{ $teacher->name }}</span>
                                            @endforeach
                                        </div>
                                    </div>
                                @endif
                            </article>
                        @endforeach
                    </div>
                </div>
                @endforeach
            @endif
        </div>
    </div>
</section>

<section class="relative bg-[#FBF7EF] py-12 lg:py-16">
    <div class="absolute inset-0 opacity-[0.03]"
         style="background-image: radial-gradient(circle, #052E1F 0.5px, transparent 0.5px); background-size: 32px 32px;"></div>
    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-[2rem] border border-amber-100 bg-white p-8 shadow-md shadow-emerald-950/5 lg:p-12">
            <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div>
                    <h2 class="text-3xl font-bold text-gray-900 lg:text-4xl">Boarding School</h2>
                    <p class="mt-2 text-lg font-semibold text-[#D4A017]">Lingkungan Pendidikan Berasrama</p>
                    <p class="mt-6 text-lg leading-relaxed text-gray-600">
                        {{ $schoolSetting->school_name ?? 'SMA Persis Serang' }} menerapkan sistem boarding school
                        yang mengintegrasikan pendidikan formal, pembinaan karakter, dan pengembangan diri
                        dalam lingkungan asrama yang Islami.
                    </p>
                    <div class="mt-3 space-y-2 text-gray-600">
                        <div class="flex items-start gap-3">
                            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Bimbingan intensif 24 jam oleh pembina asrama</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Program tahsin dan tahfidz Al-Qur&rsquo;an</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Pembiasaan ibadah dan adab Islami sehari-hari</span>
                        </div>
                        <div class="flex items-start gap-3">
                            <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>Fasilitas asrama yang nyaman dan kondusif</span>
                        </div>
                    </div>
                    <div class="mt-8">
                        <a href="{{ route('public.boarding') }}"
                           class="inline-flex items-center rounded-xl bg-[#0F6B3A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#0F6B3A]/20 transition hover:bg-[#0A4F2B]">
                            Lihat Konsep Boarding School
                            <svg class="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                            </svg>
                        </a>
                    </div>
                </div>
                <div class="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-[#EAF6EE] via-white to-white">
                    <div class="p-8 text-center">
                        <div class="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-2xl bg-[#0F6B3A]/10">
                            <svg class="h-12 w-12 text-[#0F6B3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"/>
                            </svg>
                        </div>
                        <p class="font-medium text-gray-400">{{ $schoolSetting->short_name ?? 'SMA Persis Serang' }}</p>
                        <p class="mt-1 text-sm text-gray-300">Islamic Boarding School</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="relative bg-white py-12 lg:py-16">
    <div class="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-gray-900 lg:text-4xl">Siap bergabung bersama {{ $schoolSetting->school_name ?? 'SMA Persis Serang' }}?</h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-gray-500">Daftarkan putra-putri Anda dan jadilah bagian dari generasi berilmu dan beradab.</p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
            <a href="{{ route('spmb.create') }}"
               class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                Daftar SPMB
            </a>
            <a href="{{ route('spmb.status.form') }}"
               class="rounded-xl border-2 border-[#0F6B3A] px-8 py-4 text-sm font-semibold text-[#0F6B3A] transition hover:bg-[#EAF6EE]">
                Cek Status Pendaftaran
            </a>
            @if($currentAdmissionYear?->show_consultation_button ?? true)
            <button type="button" onclick="toggleAiChatPanel()"
               class="rounded-xl border-2 border-[#D4A017] px-8 py-4 text-sm font-semibold text-[#D4A017] transition hover:bg-[#D4A017]/5">
                Konsultasi SPMB
            </button>
            @endif
        </div>
    </div>
</section>

@endsection