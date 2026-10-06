@extends('layouts.public')

@section('title', 'Struktur Organisasi - ' . ($schoolSetting->school_name ?? 'SMA Persis Serang'))

@section('content')

@php
    $pageTitle = $websitePage->title ?? 'Struktur Organisasi';
    $schoolName = $schoolSetting->school_name ?? 'SMA Persis Serang';
    $heroBg = $schoolSetting?->building_image_path ? asset('storage/' . $schoolSetting->building_image_path) : null;
    $displayName = $schoolSetting->school_name ?? 'SMA Persis Serang';
    $sectionTitle = $websitePage->subtitle ?? 'Bagan Organisasi ' . $displayName;
    $introText = $websitePage->content ?? 'Struktur organisasi SMA Persis Serang disusun untuk mendukung pengelolaan sekolah berbasis pendidikan, pembinaan akhlak, dan sistem boarding school. Melalui pembagian tugas yang jelas, setiap bidang dapat bekerja secara tertib, terarah, dan bertanggung jawab.';
    $topLevelItems = collect($organisasi)->where('level', 1);
    $secondLevelItems = collect($organisasi)->where('level', 2);
    $kepalaSekolah = collect($organisasi)->firstWhere('key', 'kepala-sekolah') ?? collect($organisasi)->firstWhere('level', 2);
    $unitDiBawahKepalaSekolah = $kepalaSekolah['children'] ?? [];
    $activeLevels = collect($organisasi)->pluck('level')->unique()->count();
    $totalUnits = collect($unitDiBawahKepalaSekolah)->count();
    $totalMembers = collect($unitDiBawahKepalaSekolah)->sum(fn($unit) => count($unit['anggota'] ?? []));
@endphp

<section class="relative isolate min-h-[400px] overflow-hidden bg-[#052E1F] lg:min-h-[500px]">
    @if($heroBg)
        <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('{{ $heroBg }}')"></div>
    @else
        <div class="absolute inset-0 bg-gradient-to-br from-[#052E1F] via-[#063f2a] to-[#0F6B3A]"></div>
        <div class="absolute inset-0 opacity-[0.08]"
             style="background-image: linear-gradient(135deg, rgba(255,255,255,.45) 1px, transparent 1px); background-size: 42px 42px;"></div>
    @endif

    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/75 to-emerald-900/30"></div>
    <div class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-emerald-950/80 via-emerald-950/35 to-transparent"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex min-h-[400px] flex-col justify-center pb-16 pt-28 lg:min-h-[500px] lg:pb-20 lg:pt-32">
            <div class="max-w-3xl">
                <div class="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-emerald-950/60 px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur">
                    <span class="h-2 w-2 rounded-full bg-amber-300"></span>
                    ORGANIGRAM
                </div>

                <h1 class="mt-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {{ $pageTitle }}
                </h1>
                <p class="mt-4 max-w-2xl text-lg font-semibold text-amber-300 sm:text-xl">
                    {{ $displayName }}
                </p>
            </div>
        </div>
    </div>
</section>

<section class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
            <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">STRUKTUR ORGANISASI</p>
            <h2 class="mt-3 font-serif text-3xl font-bold text-[#052E1F] sm:text-4xl">{{ $sectionTitle }}</h2>
            <p class="mt-4 text-lg leading-8 text-emerald-900/70">
                {{ $introText }}
            </p>
        </div>
    </div>
</section>

<section class="bg-white py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        @if(empty($organisasi))
            <div class="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-8 text-center">
                <h3 class="font-serif text-2xl font-bold text-[#052E1F]">Data struktur organisasi belum tersedia.</h3>
                <p class="mt-3 text-sm leading-6 text-emerald-900/70">Silakan lengkapi data struktur organisasi melalui dashboard admin.</p>
            </div>
        @else
        {{-- Level 1: Pembina and Bidang Pendidikan --}}
        <div class="grid gap-6 sm:grid-cols-2">
            @foreach($topLevelItems as $item)
                    <div class="group rounded-2xl border-2 border-[#D4A017]/40 bg-gradient-to-br from-[#052E1F] to-[#0F6B3A] p-6 text-center shadow-lg shadow-emerald-950/15 transition hover:-translate-y-1 hover:shadow-xl">
                        @include('pages.partials.organization-avatar', [
                            'photoUrl' => $item['photo_url'] ?? null,
                            'name' => $item['person_display_name'] ?? $item['jabatan'],
                            'tone' => 'dark',
                        ])
                        <h3 class="text-lg font-bold text-white">{{ $item['jabatan'] }}</h3>
                        @if($item['person_display_name'] ?? null)
                            <p class="mt-1 text-sm font-semibold text-amber-300">{{ $item['person_display_name'] }}</p>
                        @endif
                        @if($item['deskripsi'] ?? null)
                            <p class="mt-2 text-sm leading-relaxed text-emerald-100/80">{{ $item['deskripsi'] }}</p>
                        @endif
                    </div>
            @endforeach
        </div>

        {{-- Vertical connector line --}}
        @if($topLevelItems->isNotEmpty() && $secondLevelItems->isNotEmpty())
            <div class="flex justify-center py-4">
                <div class="h-8 w-0.5 bg-gradient-to-b from-[#D4A017] to-[#0F6B3A]"></div>
            </div>
        @endif

        {{-- Level 2: Kepala Sekolah and Komite Sekolah --}}
        <div class="grid gap-6 sm:grid-cols-2">
            @foreach($secondLevelItems as $item)
                    @php
                        $isKepsek = ($item['card_type'] ?? null) === 'principal' || str_contains($item['jabatan'], 'Kepala SMA');
                    @endphp
                    <div class="{{ $isKepsek ? 'sm:col-span-1' : '' }} rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-6 text-center shadow-lg shadow-emerald-950/10 transition hover:-translate-y-1 hover:shadow-xl {{ $isKepsek ? 'ring-2 ring-[#D4A017]/40' : 'ring-1 ring-amber-200' }}">
                        @if($isKepsek)
                            <div class="mx-auto mb-2 inline-flex items-center gap-1 rounded-full bg-[#D4A017]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#D4A017]">
                                <span class="h-1.5 w-1.5 rounded-full bg-[#D4A017]"></span>
                                Pimpinan Sekolah
                            </div>
                        @endif
                        @include('pages.partials.organization-avatar', [
                            'photoUrl' => $item['photo_url'] ?? null,
                            'name' => $item['person_display_name'] ?? $item['jabatan'],
                        ])
                        <h3 class="text-xl font-bold {{ $isKepsek ? 'text-[#052E1F]' : 'text-gray-800' }}">{{ $item['jabatan'] }}</h3>
                        @if($item['person_display_name'] ?? null)
                            <p class="mt-1 text-sm font-semibold text-[#0F6B3A]">{{ $item['person_display_name'] }}</p>
                        @endif
                        @if($item['deskripsi'] ?? null)
                            <p class="mt-2 text-sm leading-relaxed text-gray-500">{{ $item['deskripsi'] }}</p>
                        @endif
                    </div>
            @endforeach
        </div>

        {{-- Branch connector lines --}}
        @if(count($unitDiBawahKepalaSekolah))
            <div class="relative py-4">
                <div class="mx-auto hidden h-8 w-0.5 bg-gradient-to-b from-[#0F6B3A] to-[#0F6B3A] sm:block"></div>
                <div class="relative hidden sm:block">
                    <div class="absolute left-[12.5%] right-[12.5%] top-0 h-0.5 bg-[#0F6B3A]/30"></div>
                </div>
            </div>
        @endif

        {{-- Level 3: Waka, TU, Asrama, Unit Pendukung --}}
        @if(count($unitDiBawahKepalaSekolah))
            <div class="mt-2 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                @foreach($unitDiBawahKepalaSekolah as $bawah)
                    <div class="group rounded-xl border border-emerald-100 bg-white p-5 shadow-md shadow-emerald-950/5 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
                        @include('pages.partials.organization-avatar', [
                            'photoUrl' => $bawah['photo_url'] ?? null,
                            'name' => $bawah['person_display_name'] ?? $bawah['jabatan'],
                        ])
                        <div class="mb-3 text-center">
                            <h4 class="text-sm font-bold text-[#052E1F] leading-tight">{{ $bawah['jabatan'] }}</h4>
                        </div>
                        @if($bawah['person_display_name'] ?? null)
                            <p class="mb-3 text-sm font-semibold text-[#0F6B3A]">{{ $bawah['person_display_name'] }}</p>
                        @endif
                        @if($bawah['anggota'] ?? null)
                            <ul class="space-y-1.5 border-t border-emerald-50 pt-3">
                                @foreach($bawah['anggota'] as $anggota)
                                    <li class="flex items-center gap-2 text-sm text-gray-600">
                                        <span class="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#D4A017]/60"></span>
                                        {{ $anggota }}
                                    </li>
                                @endforeach
                            </ul>
                        @endif
                    </div>
                @endforeach
            </div>
        @endif
        @endif

    </div>
</section>

<section class="bg-[#FBF7EF] py-16 lg:py-20">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-white to-amber-50/50 p-8 shadow-lg shadow-emerald-950/5 lg:p-12">
            <div class="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <div>
                    <p class="text-sm font-bold uppercase tracking-[0.24em] text-[#D4A017]">TENTANG STRUKTUR</p>
                    <h3 class="mt-3 font-serif text-2xl font-bold text-[#052E1F] lg:text-3xl">Pola Organisasi Sekolah</h3>
                    <div class="mt-4 space-y-4 text-base leading-relaxed text-gray-600">
                        <p>Struktur organisasi SMA Persis Serang menerapkan sistem organisasi lini dan fungsional yang memadukan pendidikan formal, pembinaan akhlak islami, dan manajemen boarding school.</p>
                        <p>Setiap unsur dalam struktur memiliki tugas, wewenang, dan tanggung jawab yang jelas sesuai dengan bidangnya masing-masing, mulai dari pimpinan tertinggi hingga unit pendukung.</p>
                        <p>Dengan struktur ini, seluruh komponen sekolah berjalan sinergis untuk mewujudkan visi dan misi {{ $displayName }}.</p>
                    </div>
                </div>
                <div class="flex flex-col justify-center rounded-xl bg-[#052E1F] p-6 lg:p-8">
                    <div class="flex items-center gap-4">
                        <div class="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[#D4A017]/20 text-amber-300">
                            <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.7" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-semibold text-amber-300">SMA Persis Serang</p>
                            <p class="text-lg font-bold text-white">Islamic Boarding School</p>
                        </div>
                    </div>
                    <div class="mt-6 grid grid-cols-3 gap-4 text-center">
                        <div class="rounded-lg bg-white/10 p-3">
                            <p class="text-2xl font-bold text-amber-300">{{ $activeLevels ?: 0 }}</p>
                            <p class="text-xs text-emerald-100/80">Tingkat<br>Kepengurusan</p>
                        </div>
                        <div class="rounded-lg bg-white/10 p-3">
                            <p class="text-2xl font-bold text-amber-300">{{ $totalUnits }}</p>
                            <p class="text-xs text-emerald-100/80">Unit di Bawah<br>Kepala Sekolah</p>
                        </div>
                        <div class="rounded-lg bg-white/10 p-3">
                            <p class="text-2xl font-bold text-amber-300">{{ $totalMembers }}</p>
                            <p class="text-xs text-emerald-100/80">Personil<br>Terlibat</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

@endsection
