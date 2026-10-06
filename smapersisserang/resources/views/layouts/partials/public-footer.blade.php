<footer class="bg-emerald-950 text-emerald-100">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div class="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div>
                <div class="flex items-center space-x-3">
                    @if($schoolSetting?->logo_path)
                        <img src="{{ asset('storage/' . $schoolSetting->logo_path) }}"
                             alt="{{ $schoolSetting->school_name }}"
                             class="h-12 w-12 rounded-xl border border-amber-300/30 bg-white object-contain p-1">
                    @else
                        <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/30 bg-white/10 text-sm font-bold text-amber-300">
                            {{ substr($schoolSetting->short_name ?? $schoolSetting->school_name ?? config('school.name', 'SMA Persis Serang'), 0, 2) }}
                        </div>
                    @endif
                    <div>
                        <p class="font-bold text-white">{{ $schoolSetting->school_name ?? config('school.name', 'SMA Persis Serang') }}</p>
                        <p class="text-xs text-emerald-100/70">{{ $schoolSetting->tagline ?? 'Islamic Boarding School' }}</p>
                    </div>
                </div>
                @if($schoolSetting?->description)
                    <p class="mt-5 max-w-sm text-sm leading-6 text-emerald-100/70">
                        {{ Str::limit($schoolSetting->description, 150) }}
                    </p>
                @endif
            </div>

            <div>
                <h4 class="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Alamat</h4>
                <div class="space-y-2 text-sm leading-6 text-emerald-100/75">
                    @if($schoolSetting?->address)
                        <p>{{ $schoolSetting->address }}</p>
                    @endif
                    @if($schoolSetting?->city || $schoolSetting?->province)
                        <p>{{ $schoolSetting->city }}{{ $schoolSetting->city && $schoolSetting->province ? ', ' : '' }}{{ $schoolSetting->province }}</p>
                    @endif
                    @unless($schoolSetting?->address || $schoolSetting?->city || $schoolSetting?->province)
                        <p>Serang, Banten</p>
                    @endunless
                    @if($schoolSetting?->google_maps_link)
                        <a href="{{ $schoolSetting->google_maps_link }}" target="_blank" rel="noopener"
                           class="inline-block mt-2 text-amber-300 text-xs hover:text-amber-200 transition-colors">
                            Lihat Lokasi
                        </a>
                    @endif
                </div>
            </div>

            <div>
                <h4 class="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Kontak</h4>
                <div class="space-y-2 text-sm text-emerald-100/75">
                    @if($schoolSetting?->whatsapp_number)
                        <p>WhatsApp: {{ $schoolSetting->whatsapp_number }}</p>
                    @endif
                    @if($schoolSetting?->email)
                        <p>Email: {{ $schoolSetting->email }}</p>
                    @endif
                    @unless($schoolSetting?->whatsapp_number || $schoolSetting?->email)
                        <p>Email: info@smapersisserang.sch.id</p>
                    @endunless
                    <a href="{{ route('spmb.status.form') }}" class="inline-block pt-2 text-amber-300 transition hover:text-amber-200">Cek Status SPMB</a>
                </div>
            </div>

            <div>
                <h4 class="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-amber-300">Menu</h4>

                @if($footerMenuItems->count())
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:justify-end">
                        @foreach($footerMenuItems->take(3) as $menu)
                            <a href="{{ $menu->url() }}"
                               class="whitespace-nowrap text-emerald-100/75 transition hover:text-amber-300">
                                {{ $menu->label }}
                            </a>
                        @endforeach
                    </div>

                    @if($footerMenuItems->count() > 3)
                        <div class="mt-4 space-y-2 text-sm">
                            @foreach($footerMenuItems->slice(3) as $menu)
                                <a href="{{ $menu->url() }}"
                                   class="block text-emerald-100/75 transition hover:text-amber-300">
                                    {{ $menu->label }}
                                </a>
                            @endforeach
                        </div>
                    @endif
                @else
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:justify-end">
                        <a href="{{ route('public.profile') }}" class="whitespace-nowrap text-emerald-100/75 transition hover:text-amber-300">Profil</a>
                        <a href="{{ route('public.teachers') }}" class="whitespace-nowrap text-emerald-100/75 transition hover:text-amber-300">Guru</a>
                    </div>
                @endif
            </div>
        </div>

        <div class="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-emerald-100/60 md:flex-row md:items-center md:justify-between">
            <p>
                &copy; 2026 SMA Persis Serang. All rights reserved.
                <br>Developed by <span class="font-semibold">Tim IT SMA Persis Serang</span>
            </p>
            <div class="flex flex-wrap items-center gap-4 md:flex-nowrap md:justify-end">
                @foreach($footerMenuItems->take(3) as $menu)
                    <a href="{{ $menu->url() }}" class="whitespace-nowrap transition hover:text-amber-300">{{ $menu->label }}</a>
                @endforeach
                <a href="{{ route('login') }}"
                   class="whitespace-nowrap rounded-lg bg-amber-400 px-5 py-2.5 font-semibold text-emerald-950 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-emerald-950">
                    Login
                </a>
            </div>
        </div>
    </div>
</footer>
