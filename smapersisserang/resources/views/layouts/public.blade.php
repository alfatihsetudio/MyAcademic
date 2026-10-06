@php
    try {
        $schoolSetting ??= \App\Models\SchoolSetting::current();
    } catch (\Exception $e) {
        $schoolSetting = null;
    }
    $defaultOgImage = $schoolSetting?->meta_image
        ? asset('storage/' . $schoolSetting->meta_image)
        : asset('images/og-sma-persis-serang.jpg');

@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
        <link rel="icon" type="image/png" href="{{ asset('favicon.png') }}">
        <link rel="apple-touch-icon" href="{{ asset('favicon.png') }}">

        <title>@yield('title', ($schoolSetting->school_name ?? 'SMA Persis Serang') . ' - ' . ($title ?? 'Website Sekolah'))</title>

        @hasSection('meta')
            @yield('meta')
        @else
            <meta name="description" content="SMA Persis Serang adalah sekolah Islam berasrama yang memadukan pendidikan formal, pembinaan akhlak dan keislaman, kemandirian, pendidikan kewirausahaan, serta pembelajaran teknologi.">

            <meta property="og:title" content="SMA Persis Serang | Islamic Boarding School">
            <meta property="og:description" content="SMA Persis Serang adalah sekolah Islam berasrama yang memadukan pendidikan formal, pembinaan akhlak dan keislaman, kemandirian, pendidikan kewirausahaan, serta pembelajaran teknologi.">
            <meta property="og:type" content="website">
            <meta property="og:url" content="{{ url('/') }}">
            <meta property="og:image" content="{{ $defaultOgImage }}">
            <meta property="og:image:type" content="image/jpeg">
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">

            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:title" content="SMA Persis Serang | Islamic Boarding School">
            <meta name="twitter:description" content="Berakhlak mulia, berpikir kritis, dan mandiri. Siap menghadapi era teknologi dan AI.">
            <meta name="twitter:image" content="{{ $defaultOgImage }}">
        @endif

        @if(config('services.google_analytics.id'))
            <script async src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google_analytics.id') }}"></script>
            <script>
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '{{ config('services.google_analytics.id') }}');
            </script>
        @endif

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-white text-gray-900">
        @include('layouts.partials.public-header', [
            'variant' => request()->is('/') ? 'transparent' : 'solid',
        ])

        <main class="min-h-screen">
            @yield('content')
        </main>

        @include('layouts.partials.public-footer')
        @if (!request()->routeIs('spmb.update-data*') && !request()->routeIs('donasi-pendidikan') && !request()->routeIs('donasi-pendidikan.form-donatur') && !request()->routeIs('wakaf-uang.*'))
            @if($currentAdmissionYear?->show_consultation_button ?? true)
                <x-ai-chat-widget />
            @endif
        @endif
        @stack('scripts')
    </body>
</html>
