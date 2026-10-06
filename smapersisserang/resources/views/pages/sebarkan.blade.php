@extends('layouts.public')

@php
    $schoolName = $schoolSetting->school_name ?? 'SMA Persis Serang';
    $donasiUrl = route('donasi-pendidikan');
    $rawMessage = trim($setting?->share_message ?? '');
    if ($rawMessage === '') {
        $rawMessage = 'Mari dukung pendidikan dan kebutuhan makan santri SMA Persis Serang.';
    }
    if (!str_contains($rawMessage, $donasiUrl)) {
        $rawMessage .= "\n\n$donasiUrl";
    }
    $defaultMessage = $rawMessage;
@endphp

@section('title', 'Sebar Kebaikan - ' . $schoolName)

@section('content')

<section class="bg-gradient-to-br from-[#052E1F] via-[#0A4F2B] to-[#0F6B3A]">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col justify-center py-12 sm:py-16 lg:py-20">
            <div class="max-w-3xl">
                <h1 class="text-2xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
                    Sebarkan Kebaikan
                </h1>
                <p class="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-100/80 sm:mt-3 sm:text-base lg:text-lg">
                    Sesuaikan pesan, lalu bagikan melalui WhatsApp.
                </p>
            </div>
        </div>
    </div>
</section>

<section class="bg-gradient-to-b from-emerald-50/50 to-white py-8 sm:py-12 lg:py-16">
    <div class="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-2xl border border-emerald-200/80 bg-white p-6 shadow-lg shadow-emerald-900/5 sm:p-8 lg:p-10">
            <div x-data="sebarKebaikan()">
                <h2 class="text-lg font-bold text-gray-900 sm:text-xl">Pesan yang Akan Disebar</h2>

                <div class="mt-4">
                    <textarea x-model="message" rows="10"
                              class="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"></textarea>
                </div>

                <div class="mt-6 flex flex-col gap-3">
                    <a :href="whatsappUrl" target="_blank" rel="noopener"
                       class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-green-900/20 transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500/40">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                        </svg>
                        Buat Pesan WhatsApp
                    </a>

                    <button @click="copyMessage()"
                            class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-6 py-3.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                        </svg>
                        <span x-text="copied ? 'Tersalin!' : 'Salin Pesan'"></span>
                    </button>
                </div>
            </div>
        </div>

        <div class="mt-6 text-center">
            <a href="{{ route('donasi-pendidikan') }}"
               class="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Kembali ke halaman donasi
            </a>
        </div>
    </div>
</section>

@push('scripts')
<script>
    function sebarKebaikan() {
        return {
            message: @json($defaultMessage),
            copied: false,
            get whatsappUrl() {
                return 'https://wa.me/?text=' + encodeURIComponent(this.message);
            },
            copyMessage() {
                const self = this;
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(this.message).then(() => {
                        self.copied = true;
                        setTimeout(() => self.copied = false, 2000);
                    }).catch(() => self.fallbackCopy());
                } else {
                    this.fallbackCopy();
                }
            },
            fallbackCopy() {
                const ta = document.createElement('textarea');
                ta.value = this.message;
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                try { document.execCommand('copy'); } catch (e) {}
                document.body.removeChild(ta);
                this.copied = true;
                setTimeout(() => this.copied = false, 2000);
            }
        };
    }
</script>
@endpush

@endsection
