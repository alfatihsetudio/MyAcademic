<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-emerald-50 text-gray-900">
        <div class="flex min-h-screen flex-col items-center justify-center px-4 py-8">
            <div class="w-full max-w-sm">
                <!-- Logo & School Name -->
                <div class="text-center">
                    <a href="{{ url('/') }}" class="inline-block">
                        @php $schoolSetting = \App\Models\SchoolSetting::current(); @endphp
                        @if($schoolSetting?->logo_path)
                            <img src="{{ asset('storage/' . $schoolSetting->logo_path) }}"
                                 alt="{{ $schoolSetting->school_name }}"
                                 class="mx-auto h-20 w-20 rounded-xl border border-emerald-200 bg-white object-contain p-2 shadow-sm">
                        @else
                            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-xl border border-emerald-200 bg-white text-lg font-bold text-emerald-700 shadow-sm">
                                {{ substr($schoolSetting->short_name ?? $schoolSetting->school_name ?? 'SP', 0, 2) }}
                            </div>
                        @endif
                        <h1 class="mt-3 text-xl font-bold text-emerald-900">{{ strtoupper($schoolSetting->school_name ?? 'SMA PERSIS SERANG') }}</h1>
                        <p class="text-xs text-emerald-600">{{ $schoolSetting->tagline ?? 'Islamic Boarding School' }}</p>
                    </a>
                </div>

                <!-- Card -->
                <div class="mt-6 rounded-xl border border-emerald-200 bg-white px-6 py-6 shadow-lg shadow-emerald-950/5">
                    {{ $slot }}
                </div>

                <p class="mt-6 text-center text-xs text-emerald-600/60">
                    &copy; {{ date('Y') }} {{ $schoolSetting->school_name ?? 'SMA PERSIS Serang' }}. All rights reserved.
                    <br>Developed by <span class="font-semibold">Tim IT {{ $schoolSetting->school_name ?? 'SMA PERSIS Serang' }}</span>
                </p>
            </div>
        </div>
    </body>
</html>
