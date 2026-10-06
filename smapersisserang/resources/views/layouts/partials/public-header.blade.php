@php
    $headerVariant = $variant ?? (request()->is('/') ? 'transparent' : 'solid');
    $isTransparentHeader = $headerVariant === 'transparent';
    $desktopHeaderClass = $isTransparentHeader
        ? 'absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-emerald-950/20 backdrop-blur-sm'
        : 'sticky top-0 z-40 border-b border-amber-300/20 bg-emerald-950/95 shadow-lg shadow-emerald-950/10 backdrop-blur';
    $desktopTextClass = 'text-emerald-50 hover:text-amber-300 hover:bg-white/10';
    $desktopActiveClass = 'text-amber-300 bg-white/10';
    $desktopBrandTitleClass = 'text-white';
    $desktopBrandSubtitleClass = 'text-emerald-100';
@endphp

<header x-data="{ mobileMenuOpen: false }"
        x-init="$watch('mobileMenuOpen', val => window.dispatchEvent(new CustomEvent('mobile-menu-toggle', { detail: { open: val } })))"
        class="{{ $desktopHeaderClass }}" data-public-header data-header-variant="{{ $headerVariant }}">
    <div class="hidden h-20 max-w-7xl items-center justify-between px-4 mx-auto lg:flex">
        <a href="{{ url('/') }}" class="flex items-center space-x-3">
            @if($schoolSetting?->logo_path)
                <img src="{{ asset('storage/' . $schoolSetting->logo_path) }}"
                     alt="{{ $schoolSetting->school_name }}"
                     class="h-12 w-12 rounded-xl border border-white/20 bg-white object-contain p-1 shadow-sm">
            @else
                <div class="flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/40 bg-white/10 text-sm font-bold text-amber-300 shadow-sm">
                    {{ substr($schoolSetting->short_name ?? $schoolSetting->school_name ?? 'SMA Persis Serang', 0, 2) }}
                </div>
            @endif
            <div>
                <h1 class="text-lg font-bold leading-tight {{ $desktopBrandTitleClass }}">{{ $schoolSetting->school_name ?? 'SMA Persis Serang' }}</h1>
                <p class="text-xs leading-tight {{ $desktopBrandSubtitleClass }}">{{ $schoolSetting->tagline ?? 'Islamic Boarding School' }}</p>
            </div>
        </a>

        <nav x-data="{ openDropdown: null }"
             @keydown.escape.window="openDropdown = null"
             @click.outside="openDropdown = null"
             class="flex items-center gap-0.5">
            @foreach($publicMenuItems as $menu)
                @php
                    $children = $menu->children()->active()->orderBy('sort_order')->get();
                    $isStruktur = $menu->route_name === 'public.struktur-organisasi';
                    $childUrls = $children->map(fn($c) => $c->url());
                    $hasActiveChild = $childUrls->contains(fn($url) => url()->current() === $url);
                @endphp
                @if(!$isStruktur)
                    @if($children->isNotEmpty())
                        <div class="relative">
                            <button @click="openDropdown = (openDropdown === '{{ $menu->menu_key }}') ? null : '{{ $menu->menu_key }}'"
                                    type="button"
                                    :class="(openDropdown === '{{ $menu->menu_key }}' || {{ $hasActiveChild ? 'true' : 'false' }}) ? '{{ $desktopActiveClass }}' : '{{ $desktopTextClass }}'"
                                    :aria-expanded="openDropdown === '{{ $menu->menu_key }}'"
                                    class="flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors">
                                {{ $menu->label }}
                                <svg class="h-3.5 w-3.5 transition-transform" :class="openDropdown === '{{ $menu->menu_key }}' && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                </svg>
                            </button>
                            <div x-show="openDropdown === '{{ $menu->menu_key }}'"
                                 x-transition:enter="transition ease-out duration-150"
                                 x-transition:enter-start="opacity-0 translate-y-1 scale-95"
                                 x-transition:enter-end="opacity-100 translate-y-0 scale-100"
                                 x-transition:leave="transition ease-in duration-100"
                                 x-transition:leave-start="opacity-100 translate-y-0 scale-100"
                                 x-transition:leave-end="opacity-0 translate-y-1 scale-95"
                                 class="absolute right-0 z-50 mt-3 w-56 origin-top rounded-2xl border border-white/10 bg-emerald-950/90 p-2 shadow-2xl backdrop-blur-xl">
                                <div class="absolute -top-px left-3 right-3 h-0.5 rounded-full bg-amber-400"></div>
                                @foreach($children as $child)
                                    @php $isChildActive = url()->current() === $child->url(); @endphp
                                    <a href="{{ $child->url() }}"
                                       class="flex items-center rounded-xl px-4 py-3 text-sm transition-all duration-200 {{ $isChildActive ? 'bg-amber-400/15 text-amber-300 ring-1 ring-amber-300/20' : 'text-white/80 hover:translate-x-0.5 hover:bg-white/10 hover:text-white' }}">
                                        {{ $child->label }}
                                    </a>
                                @endforeach
                            </div>
                        </div>
                    @else
                        <a href="{{ $menu->url() }}"
                           class="rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors {{ url()->current() === $menu->url() ? $desktopActiveClass : $desktopTextClass }}">
                            {{ $menu->label }}
                        </a>
                    @endif
                @endif
            @endforeach

        </nav>
    </div>

    <div class="bg-emerald-950 text-white lg:hidden">
        <div class="flex items-center justify-between px-4 py-3">
            <button @click="mobileMenuOpen = !mobileMenuOpen"
                    class="rounded-xl border border-white/10 bg-white/10 p-2.5 text-white transition-all duration-200 hover:bg-white/20"
                    :aria-label="mobileMenuOpen ? 'Tutup menu' : 'Buka menu'">
                <svg x-show="!mobileMenuOpen" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
                <svg x-show="mobileMenuOpen" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>

            <a href="{{ url('/') }}" class="flex min-w-0 items-center space-x-2.5">
                @if($schoolSetting?->logo_path)
                    <img src="{{ asset('storage/' . $schoolSetting->logo_path) }}"
                         alt="{{ $schoolSetting->school_name }}"
                         class="h-9 w-9 rounded-lg border border-white/20 bg-white object-contain p-1">
                @else
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-300/40 bg-white/10 text-xs font-bold text-amber-300">
                        {{ substr($schoolSetting->short_name ?? $schoolSetting->school_name ?? 'SMA Persis Serang', 0, 2) }}
                    </div>
                @endif
                <span class="truncate text-base font-bold">{{ $schoolSetting->school_name ?? 'SMA Persis Serang' }}</span>
            </a>

            <a href="{{ route('spmb.create') }}"
               class="rounded-lg bg-amber-400 px-3 py-2 text-xs font-bold text-emerald-950 shadow-sm transition-all duration-200 active:scale-95">
                Daftar
            </a>
        </div>

        <div x-show="mobileMenuOpen"
             x-transition:enter="transition ease-out duration-200"
             x-transition:enter-start="opacity-0 -translate-y-3"
             x-transition:enter-end="opacity-100 translate-y-0"
             x-transition:leave="transition ease-in duration-150"
             x-transition:leave-start="opacity-100 translate-y-0"
             x-transition:leave-end="opacity-0 -translate-y-3"
             class="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-white/10 bg-emerald-950/95 backdrop-blur-md shadow-xl"
             @click.outside="mobileMenuOpen = false">

            <div x-data="{ openDropdown: null }"
                 @keydown.escape.window="openDropdown = null"
                 class="flex flex-col gap-0.5 px-3 pb-2 pt-4">
                @foreach($publicMenuItems as $menu)
                    @php
                        $children = $menu->children()->active()->orderBy('sort_order')->get();
                        $isStruktur = $menu->route_name === 'public.struktur-organisasi';
                        $childUrls = $children->map(fn($c) => $c->url());
                        $hasActiveChild = $childUrls->contains(fn($url) => url()->current() === $url);
                    @endphp
                    @if(!$isStruktur)
                        @if($children->isNotEmpty())
                            <div>
                                <button @click="openDropdown = (openDropdown === '{{ $menu->menu_key }}') ? null : '{{ $menu->menu_key }}'"
                                        type="button"
                                        :class="(openDropdown === '{{ $menu->menu_key }}' || {{ $hasActiveChild ? 'true' : 'false' }}) ? 'bg-white/10 text-amber-300' : 'text-emerald-50 hover:bg-white/5'"
                                        class="flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200">
                                    <span>{{ $menu->label }}</span>
                                    <svg class="h-4 w-4 transition-transform duration-200" :class="openDropdown === '{{ $menu->menu_key }}' && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>
                                <div x-show="openDropdown === '{{ $menu->menu_key }}'"
                                     x-transition:enter="transition ease-out duration-150"
                                     x-transition:enter-start="opacity-0 -translate-y-2"
                                     x-transition:enter-end="opacity-100 translate-y-0"
                                     x-transition:leave="transition ease-in duration-100"
                                     x-transition:leave-start="opacity-100 translate-y-0"
                                     x-transition:leave-end="opacity-0 -translate-y-2"
                                     class="ml-5 mt-1 space-y-0.5">
                                    @foreach($children as $child)
                                        @php $isChildActive = url()->current() === $child->url(); @endphp
                                        <a href="{{ $child->url() }}"
                                           class="flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 {{ $isChildActive ? 'bg-amber-400/10 text-amber-300' : 'text-emerald-200/80 hover:bg-white/5 hover:text-emerald-100' }}">
                                            <span class="h-1.5 w-1.5 shrink-0 rounded-full {{ $isChildActive ? 'bg-amber-400' : 'bg-emerald-500/40' }}"></span>
                                            {{ $child->label }}
                                        </a>
                                    @endforeach
                                </div>
                            </div>
                        @else
                            <a href="{{ $menu->url() }}"
                               class="block rounded-xl px-4 py-3.5 text-base font-semibold transition-all duration-200 {{ url()->current() === $menu->url() ? 'bg-white/10 text-amber-300' : 'text-emerald-50 hover:bg-white/5' }}">
                                {{ $menu->label }}
                            </a>
                        @endif
                    @endif
                @endforeach
            </div>

            <div class="border-t border-white/10 px-4 py-4">
                <a href="{{ route('spmb.create') }}"
                   class="flex items-center justify-center gap-2.5 rounded-xl border border-emerald-400/40 px-4 py-3.5 text-sm font-semibold text-emerald-100 transition-all duration-200 hover:border-emerald-400/60 hover:bg-emerald-950/50 active:scale-[0.98]">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                    Konsultasi SPMB
                </a>
            </div>
        </div>
    </div>
</header>
