@extends('layouts.public')

@section('content')

<section class="bg-gradient-to-br from-[#0F6B3A] to-[#0A4F2B]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <h1 class="text-4xl lg:text-5xl font-bold text-white">{{ $websitePage?->title ?? 'Tokoh &amp; Pembina' }}</h1>
        <p class="text-emerald-100/80 text-lg lg:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
            {{ $websitePage?->subtitle ? str_replace('[school_name]', $schoolSetting->school_name ?? 'SMA Persis Serang', $websitePage->subtitle) : 'Orang-orang yang membersamai pembinaan dan pengembangan ' . ($schoolSetting->school_name ?? 'SMA Persis Serang') . '.' }}
        </p>
    </div>
</section>

<section class="py-16 lg:py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        @if($figures->count())
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($figures as $figure)
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all text-center">
                        <div class="aspect-square overflow-hidden bg-gradient-to-br from-[#EAF6EE] to-white">
                            @if($figure->photo_path)
                                <img src="{{ asset('storage/' . $figure->photo_path) }}"
                                     alt="{{ $figure->name }}"
                                     class="w-full h-full object-cover">
                            @else
                                <div class="w-full h-full flex items-center justify-center">
                                    <div class="w-24 h-24 rounded-full bg-[#0F6B3A]/10 flex items-center justify-center">
                                        <span class="text-4xl font-bold text-[#0F6B3A]">{{ substr($figure->name, 0, 1) }}</span>
                                    </div>
                                </div>
                            @endif
                        </div>
                        <div class="p-5">
                            <h3 class="text-lg font-bold text-gray-900">{{ $figure->name }}</h3>
                            @if($figure->role)
                                <p class="text-[#D4A017] font-medium text-sm mt-1">{{ $figure->role }}</p>
                            @endif
                            @if($figure->description)
                                <p class="text-gray-500 text-sm mt-3 leading-relaxed">{{ $figure->description }}</p>
                            @endif
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="text-center py-16">
                <div class="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z"/>
                    </svg>
                </div>
                <p class="text-gray-400 font-medium">Data tokoh dan pembina belum tersedia.</p>
            </div>
        @endif
    </div>
</section>

<section class="py-16 lg:py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900">Ingin mengenal lebih dekat?</h2>
        <p class="text-gray-500 mt-4 text-lg max-w-xl mx-auto">Daftarkan putra-putri Anda dan jadilah bagian dari keluarga besar {{ $schoolSetting->school_name ?? 'SMA Persis Serang' }}.</p>
        <div class="flex flex-wrap justify-center gap-4 mt-8">
            <a href="{{ route('spmb.create') }}"
               class="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                Daftar SPMB
            </a>
            <a href="{{ route('spmb.status.form') }}"
               class="px-8 py-4 border-2 border-[#0F6B3A] text-[#0F6B3A] font-semibold rounded-xl hover:bg-[#EAF6EE] transition-colors">
                Cek Status
            </a>
            @if($currentAdmissionYear?->show_consultation_button ?? true)
            <button type="button" onclick="toggleAiChatPanel()"
               class="px-8 py-4 border-2 border-[#D4A017] text-[#D4A017] font-semibold rounded-xl hover:bg-[#D4A017]/5 transition-colors">
                Konsultasi SPMB
            </button>
            @endif
        </div>
    </div>
</section>

@endsection