@extends('layouts.public')

@section('content')
<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $title ?? 'Pendaftaran Belum Dibuka' }}</h1>
        <p class="text-gray-600 mb-8">{{ $message ?? 'Maaf, pendaftaran SPMB belum tersedia saat ini.' }}</p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="{{ url('/') }}"
                class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200">
                Kembali ke Beranda
            </a>
            <a href="tel:{{ config('school.whatsapp', '+6281234567890') }}"
                class="px-6 py-3 bg-[#0F6B3A] text-white font-semibold rounded-lg hover:bg-[#0A4F2B] transition-colors duration-200">
                Hubungi Sekolah
            </a>
        </div>
    </div>
</div>
@endsection
