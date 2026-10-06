@extends('layouts.public')

@section('content')
<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h1>
        <p class="text-gray-600 mb-8">Data pendaftaran Anda telah diterima.</p>

        <div class="bg-[#EAF6EE] border border-[#0F6B3A]/20 rounded-lg p-6 mb-8">
            <p class="text-sm text-[#0F6B3A] mb-2">Nomor Pendaftaran Anda</p>
            <p class="text-3xl font-bold text-[#0A4F2B] tracking-wider">
                {{ $application->registration_number }}
            </p>
        </div>

        <div class="text-left border border-gray-200 rounded-lg p-6 mb-8 space-y-3">
            <h2 class="font-semibold text-gray-900 mb-3">Data Pendaftar</h2>
            <div class="grid grid-cols-3 gap-2 text-sm">
                <span class="text-gray-500">Nama</span>
                <span class="col-span-2 text-gray-900">: {{ $application->student_name }}</span>

                <span class="text-gray-500">Program</span>
                <span class="col-span-2 text-gray-900">: {{ $application->admissionProgram->name }}</span>

                <span class="text-gray-500">Tahun Ajaran</span>
                <span class="col-span-2 text-gray-900">: {{ $application->admissionYear->academic_year }}</span>

                <span class="text-gray-500">Tanggal Daftar</span>
                <span class="col-span-2 text-gray-900">: {{ $application->submitted_at->format('d/m/Y H:i') }}</span>

                <span class="text-gray-500">Status</span>
                <span class="col-span-2">
                    <span class="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Baru Daftar</span>
                </span>
            </div>
        </div>

        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
            <p class="text-sm text-yellow-800 font-medium mb-1">Informasi Penting:</p>
            <ul class="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Simpan nomor pendaftaran Anda untuk referensi selanjutnya.</li>
                <li>Proses verifikasi data akan dilakukan oleh tim sekolah.</li>
                <li>Kami akan menghubungi Anda melalui WhatsApp untuk informasi selanjutnya.</li>
            </ul>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="{{ route('ppdb.status.form') }}"
                class="px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition-colors duration-200 shadow-sm">
                Cek Status Pendaftaran
            </a>
            <a href="{{ url('/') }}"
                class="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200">
                Kembali ke Beranda
            </a>
        </div>
    </div>
</div>
@endsection
