@extends('layouts.public')

@section('content')

<section class="bg-gradient-to-br from-[#0F6B3A] to-[#0A4F2B]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <h1 class="text-4xl lg:text-5xl font-bold text-white">{{ $websitePage?->title ?? 'Galeri Sekolah' }}</h1>
        <p class="text-emerald-100/80 text-lg lg:text-xl mt-4 max-w-2xl mx-auto leading-relaxed">
            {{ $websitePage?->subtitle ? str_replace('[school_name]', $schoolSetting->school_name ?? 'SMA Persis Serang', $websitePage->subtitle) : 'Dokumentasi lingkungan, kegiatan, dan pembinaan siswa di ' . ($schoolSetting->school_name ?? 'SMA Persis Serang') . '.' }}
        </p>
    </div>
</section>

<section class="py-16 lg:py-20 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap justify-center gap-2 mb-10">
            <a href="{{ route('public.gallery') }}"
               class="px-5 py-2 text-sm font-medium rounded-full transition-colors {{ !$category ? 'bg-[#0F6B3A] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-[#EAF6EE] hover:text-[#0F6B3A] border border-gray-200' }}">
                Semua
            </a>
            @foreach($categories as $key => $label)
                <a href="{{ route('public.gallery', ['category' => $key]) }}"
                   class="px-5 py-2 text-sm font-medium rounded-full transition-colors {{ $category === $key ? 'bg-[#0F6B3A] text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-[#EAF6EE] hover:text-[#0F6B3A] border border-gray-200' }}">
                    {{ $label }}
                </a>
            @endforeach
        </div>

        @if($galleryImages->count())
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @foreach($galleryImages as $image)
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                        <div class="aspect-[4/3] overflow-hidden">
                            <img src="{{ asset('storage/' . $image->image_path) }}"
                                 alt="{{ $image->title ?? 'Foto Galeri' }}"
                                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                        </div>
                        <div class="p-4">
                            <div class="flex items-center justify-between">
                                @if($image->title)
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ $image->title }}</p>
                                @else
                                    <p class="text-sm font-medium text-gray-900 truncate">Galeri</p>
                                @endif
                                <span class="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#EAF6EE] text-[#0F6B3A] flex-shrink-0 ml-2">
                                    {{ $image->categories->first()?->name ?? 'Galeri' }}
                                </span>
                            </div>
                        </div>
                    </div>
                @endforeach
            </div>
        @else
            <div class="text-center py-16">
                <div class="w-20 h-20 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                    <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>
                    </svg>
                </div>
                <p class="text-gray-400 font-medium">Galeri belum tersedia.</p>
                @if($category)
                    <p class="text-gray-400 text-sm mt-1">Tidak ada gambar untuk kategori ini.</p>
                @endif
            </div>
        @endif
    </div>
</section>

<section class="py-16 lg:py-20 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl lg:text-4xl font-bold text-gray-900">Ikuti perkembangan {{ $schoolSetting->school_name ?? 'SMA Persis Serang' }}</h2>
        <p class="text-gray-500 mt-4 text-lg max-w-xl mx-auto">Daftar sekarang dan jadilah bagian dari keluarga besar kami.</p>
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