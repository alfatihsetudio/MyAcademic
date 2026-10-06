<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Dashboard Admin SMA PERSIS SERANG</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
    <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        [x-cloak] { display: none !important; }
        .admin-sidebar-menu > a:not(:first-child) {
            margin-left: 0.75rem;
        }

        @media (max-width: 420px) {
            .admin-sidebar-menu > a:not(:first-child) {
                margin-left: 0.5rem;
            }
        }
    </style>
    @stack('styles')
</head>
<body class="font-sans antialiased bg-slate-50">
    <div x-data="{ sidebarOpen: false }">
        <!-- Mobile hamburger -->
        <div class="lg:hidden fixed top-4 right-4 z-50">
            <button @click="sidebarOpen = !sidebarOpen"
                    class="p-2.5 rounded-lg bg-green-700 text-white shadow-lg hover:bg-green-800 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>

        <!-- Mobile overlay -->
        <div x-show="sidebarOpen"
             x-transition:enter="transition-opacity duration-200"
             x-transition:leave="transition-opacity duration-200"
             x-transition:enter-start="opacity-0"
             x-transition:enter-end="opacity-100"
             x-transition:leave-start="opacity-100"
             x-transition:leave-end="opacity-0"
             @click="sidebarOpen = false"
             class="fixed inset-0 bg-black/50 z-30 lg:hidden"></div>

        <!-- Sidebar -->
        <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
               class="fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col h-screen">
            <div class="flex-shrink-0 p-4 border-b border-slate-100">
                @php
                    $adminSetting = \App\Models\SchoolSetting::current();
                @endphp
                <a href="{{ url('/') }}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                    @if($adminSetting?->logo_path)
                        <img src="{{ asset('storage/' . $adminSetting->logo_path) }}"
                             alt="{{ $adminSetting->school_name }}"
                             class="w-9 h-9 rounded-lg object-contain bg-white border border-emerald-100 flex-shrink-0">
                    @else
                        <div class="w-9 h-9 bg-green-700 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-bold text-sm">PS</span>
                        </div>
                    @endif
                    <div class="min-w-0">
                        <h2 class="font-semibold text-gray-900 text-sm truncate">{{ $adminSetting->school_name ?? 'SMA Persis Serang' }}</h2>
                        <p class="text-xs text-slate-500">{{ $adminSetting->tagline ?? 'Islamic Boarding School' }}</p>
                    </div>
                </a>
            </div>

            @php
                $user = auth()->user();
                $menuService = app(\App\Services\AdminMenuService::class);
                $menuConfig = $user ? $menuService->getSidebar($user) : config('admin-menu');
                $routeIs = function ($patterns) {
                    foreach (explode('|', $patterns) as $pattern) {
                        if (request()->routeIs(trim($pattern))) return true;
                    }
                    return false;
                };
                $linkClass = function ($active) {
                    return $active ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900';
                };
                $iconClass = function ($active) {
                    return $active ? 'text-green-600' : 'text-slate-400';
                };
            @endphp
            <nav class="flex-1 overflow-y-auto py-2 px-3">
                <div class="admin-sidebar-menu space-y-0.5">
                    @php $dashActive = $routeIs('dashboard') @endphp
                    <a href="{{ route('dashboard') }}"
                       class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ $linkClass($dashActive) }}">
                        <x-admin-icon name="home" class="w-5 h-5 flex-shrink-0 {{ $iconClass($dashActive) }}" />
                        Dashboard
                    </a>

                    @foreach ($menuConfig['sections'] ?? [] as $section)
                        <div class="pt-3 pb-1">
                            <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $section['label'] }}</p>
                        </div>
                        @foreach ($section['items'] as $item)
                            @if (isset($item['children']))
                                @php
                                    $childActive = $routeIs($item['route_active']);
                                @endphp
                                <div x-data="{ open: {{ $childActive ? 'true' : 'false' }} }">
                                    <button @click="open = !open" type="button"
                                            class="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ $linkClass($childActive) }}">
                                        <x-admin-icon name="{{ $item['icon'] }}" class="w-5 h-5 flex-shrink-0 {{ $iconClass($childActive) }}" />
                                        <span class="flex-1 text-left">{{ $item['label'] }}</span>
                                        <svg class="h-4 w-4 transition-transform" :class="open && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                                        </svg>
                                    </button>
                                    <div x-show="open" class="ml-6 space-y-0.5 mt-0.5">
                                        @foreach ($item['children'] as $child)
                                            @php $childAct = $routeIs($child['route_active']) @endphp
                                            <a href="{{ route($child['route']) }}"
                                               class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors {{ $linkClass($childAct) }}">
                                                <x-admin-icon name="{{ $child['icon'] }}" class="w-4 h-4 flex-shrink-0 {{ $iconClass($childAct) }}" />
                                                {{ $child['label'] }}
                                            </a>
                                        @endforeach
                                    </div>
                                </div>
                            @else
                                @php $itemActive = $routeIs($item['route_active']) @endphp
                                <a href="{{ route($item['route']) }}"
                                   class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ ($item['indent'] ?? false) ? 'ml-6 ' : '' }}{{ $linkClass($itemActive) }}">
                                    <x-admin-icon name="{{ $item['icon'] }}"
                                        class="{{ ($item['indent'] ?? false) ? 'w-4 h-4' : 'w-5 h-5' }} flex-shrink-0 {{ $iconClass($itemActive) }}" />
                                    {{ $item['label'] }}
                                </a>
                            @endif
                        @endforeach
                    @endforeach

                    @if (isset($menuConfig['account']))
                        <div class="pt-3 pb-1">
                            <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{{ $menuConfig['account']['label'] }}</p>
                        </div>
                        @foreach ($menuConfig['account']['items'] as $item)
                            @php $itemActive = $routeIs($item['route_active']) @endphp
                            <a href="{{ route($item['route']) }}"
                               class="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors {{ $linkClass($itemActive) }}">
                                <x-admin-icon name="{{ $item['icon'] }}" class="w-5 h-5 flex-shrink-0 {{ $iconClass($itemActive) }}" />
                                {{ $item['label'] }}
                            </a>
                        @endforeach
                    @endif
                </div>
            </nav>

            <!-- User section pinned to bottom -->
            <div class="flex-shrink-0 p-3 border-t border-slate-100">
                <div class="flex items-center gap-3 px-3 py-2">
                    <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z"></path>
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-900 truncate">{{ Auth::user()->name }}</p>
                        <p class="text-xs text-slate-500 truncate">{{ Auth::user()->email }}</p>
                    </div>
                    <form method="POST" action="{{ route('logout') }}">
                        @csrf
                        <button type="submit" class="p-1.5 text-slate-400 hover:text-red-500 transition-colors" title="Logout">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </aside>

        <!-- Main content -->
        <div class="lg:pl-64 min-h-screen w-full min-w-0">
            <main class="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {{ $slot }}
            </main>
        </div>
    </div>
    @stack('scripts')
</body>
</html>
