@extends('layouts.public')

@php
    $schoolName = $schoolSetting->school_name ?? 'SMA Persis Serang';
@endphp

@section('title', 'Preview Pesan - ' . $schoolName)

@section('content')

<section class="relative isolate min-h-[170px] overflow-hidden bg-gradient-to-br from-[#052E1F] via-[#0A4F2B] to-[#0F6B3A] sm:min-h-[300px] lg:min-h-[400px]">
    <div class="absolute inset-0 opacity-[0.06]"
         style="background-image: linear-gradient(135deg, rgba(255,255,255,.5) 1px, transparent 1px); background-size: 42px 42px;"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-transparent to-emerald-950/20"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-emerald-950/60 to-emerald-900/40"></div>
    <div class="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-emerald-950/80 via-emerald-950/35 to-transparent"></div>

    <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex min-h-[170px] flex-col justify-center pb-7 pt-20 sm:min-h-[300px] sm:pb-12 sm:pt-28 lg:min-h-[400px] lg:pb-16 lg:pt-32">
            <div class="max-w-3xl">
                <div class="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-emerald-950/60 px-3 py-1.5 text-[11px] font-semibold text-amber-300 shadow-lg shadow-emerald-950/20 backdrop-blur sm:gap-2 sm:px-4 sm:py-2 sm:text-sm">
                    <span class="h-1.5 w-1.5 rounded-full bg-amber-300 sm:h-2 sm:w-2"></span>
                    PREVIEW PESAN
                </div>
                <h1 class="mt-4 text-2xl font-extrabold leading-tight text-white sm:mt-6 sm:text-4xl lg:text-5xl">
                    Pesan untuk <br class="hidden sm:inline">{{ $data['sapaan'] }} {{ $data['nama_tujuan'] }}
                </h1>
                <p class="mt-2 max-w-2xl text-[13px] leading-relaxed text-emerald-100/80 sm:mt-4 sm:text-base lg:text-lg">
                    Periksa pesan di bawah, lalu salin atau kirim langsung ke WhatsApp.
                </p>
            </div>
        </div>
    </div>
</section>

<section class="bg-gradient-to-b from-emerald-50/50 to-white py-10 sm:py-16 lg:py-20">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-lg shadow-emerald-900/5 sm:p-8 lg:p-10">
            <h2 class="text-lg font-bold text-gray-900 sm:text-xl">Pesan WhatsApp</h2>
            <p class="mt-1 text-sm text-gray-500">Pesan ini akan dikirim ke <strong>{{ $data['sapaan'] }} {{ $data['nama_tujuan'] }}</strong>.</p>

            <div class="mt-4">
                <textarea id="message-text" rows="14" readonly
                          class="block w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 shadow-sm">{{ $message }}</textarea>
            </div>

            <div class="mt-6 flex flex-col gap-3">
                <button type="button" id="btn-copy-message"
                        class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                        onclick="copyMessage()">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                    </svg>
                    <span id="btn-copy-text">Salin Pesan</span>
                </button>

                <a href="https://wa.me/{{ $nomor }}?text={{ urlencode($message) }}"
                   target="_blank" rel="noopener"
                   class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                    </svg>
                    Buka WhatsApp
                </a>

                <div class="relative">
                    <button type="button" id="btn-copy-link"
                            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            onclick="copyLink()">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                        </svg>
                        <span id="btn-copy-link-text">Salin Link Donasi</span>
                    </button>
                </div>

                <input type="text" id="donation-link" value="{{ $linkDonasi }}" readonly class="sr-only">
            </div>

            <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-800">
                <strong>Tip:</strong> Agar gambar preview link donasi muncul di WhatsApp, tempel pesan secara manual setelah chat terbuka.
                Jika preview tidak muncul, kirim link <code class="bg-amber-100 px-1 rounded">{{ $linkDonasi }}</code> di baris terakhir secara terpisah.
            </div>
        </div>

        <div class="mt-6 text-center">
            <a href="{{ route('donasi-pendidikan.sebarkan') }}"
               class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                Buat ulang pesan
            </a>
            <span class="mx-2 text-gray-300">|</span>
            <a href="{{ route('donasi-pendidikan') }}"
               class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                Kembali ke halaman donasi
            </a>
        </div>
    </div>
</section>

@endsection

@push('scripts')
<script>
function copyMessage() {
    const textarea = document.getElementById('message-text');
    const btnText = document.getElementById('btn-copy-text');
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(textarea.value).then(() => {
        btnText.textContent = 'Tersalin!';
        setTimeout(() => { btnText.textContent = 'Salin Pesan'; }, 2500);
    }).catch(() => {
        document.execCommand('copy');
        btnText.textContent = 'Tersalin!';
        setTimeout(() => { btnText.textContent = 'Salin Pesan'; }, 2500);
    });
}

function copyLink() {
    const input = document.getElementById('donation-link');
    const btnText = document.getElementById('btn-copy-link-text');
    navigator.clipboard.writeText(input.value).then(() => {
        btnText.textContent = 'Link Tersalin!';
        setTimeout(() => { btnText.textContent = 'Salin Link Donasi'; }, 2500);
    }).catch(() => {
        input.select();
        input.setSelectionRange(0, 99999);
        document.execCommand('copy');
        btnText.textContent = 'Link Tersalin!';
        setTimeout(() => { btnText.textContent = 'Salin Link Donasi'; }, 2500);
    });
}
</script>
@endpush