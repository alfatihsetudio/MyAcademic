@extends('layouts.public')

@php
    $app = $application;
    $activeStep = (int) request('step', $app->current_step ?: 1);
    $activeStep = max(1, min(6, $activeStep));
    $steps = [
        1 => ['title' => 'Data Siswa', 'completed' => filled($app->student_data_completed_at)],
        2 => ['title' => 'Data Orang Tua', 'completed' => filled($app->parent_data_completed_at)],
        3 => ['title' => 'Data Wali', 'completed' => (int) ($app->current_step ?: 1) > 3],
        4 => ['title' => 'Boarding & Kesehatan', 'completed' => filled($app->guardian_boarding_completed_at)],
        5 => ['title' => 'Upload Dokumen', 'completed' => filled($app->documents_completed_at)],
        6 => ['title' => 'Review Final', 'completed' => (bool) $app->is_final_submitted],
    ];
    $needsRevision = $app->status_data === 'perlu_perbaikan' || $app->status === 'data_kurang';
    $isVerified = $app->status === 'terverifikasi';
    $showSubmitted = ! $needsRevision && ! $isVerified && $app->is_final_submitted && $app->status_data === 'sudah_lengkap';
@endphp

@section('title', 'Pembaruan Data Siswa - SPMB SMA Persis Serang')

@section('content')
<div class="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 py-6 sm:py-12">
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="mb-5 text-center sm:mb-8">
            <h1 class="text-2xl font-bold text-white sm:text-3xl">Pembaruan Data Siswa</h1>
            <p class="mt-2 text-sm font-medium text-[#F5D36B] sm:mt-3 md:text-base">Simpan data bertahap agar progres tidak hilang.</p>
            <p class="mt-2 text-xs text-white/90 sm:text-sm">Nomor Pendaftaran: <strong>{{ $app->registration_number }}</strong></p>
        </div>

        @if($isVerified)
            @include('ppdb.update-data.partials.verified')
        @elseif($showSubmitted)
            @include('ppdb.update-data.partials.submitted')
        @else
            @if($needsRevision)
                <div class="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
                    <div class="font-bold">Perlu Perbaikan Data</div>
                    <p class="mt-1">Data Anda perlu dilengkapi kembali. Silakan perbaiki bagian yang kurang, lalu kirim ulang data final.</p>
                    @if($app->admin_notes)
                        <div class="mt-3 rounded-xl bg-white/70 p-3">
                            <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Catatan Admin</div>
                            <p class="mt-1">{{ $app->admin_notes }}</p>
                        </div>
                    @endif
                    @if($app->follow_up_notes)
                        <div class="mt-3 rounded-xl bg-white/70 p-3">
                            <div class="text-xs font-bold uppercase tracking-wide text-amber-700">Catatan Follow-up</div>
                            <p class="mt-1">{{ $app->follow_up_notes }}</p>
                        </div>
                    @endif
                </div>
            @endif

            @include('ppdb.update-data.partials.stepper')

            @if(session('success'))
                <div class="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{{ session('success') }}</div>
            @endif

            @if(session('error'))
                <div class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{{ session('error') }}</div>
            @endif

            @if($errors->any())
                <div class="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p class="font-bold">Ada data yang perlu diperbaiki.</p>
                    <ul class="mt-2 list-disc space-y-1 pl-5">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            <div class="overflow-hidden rounded-2xl bg-white shadow-lg">
                @if($activeStep === 1)
                    @include('ppdb.update-data.partials.student')
                @elseif($activeStep === 2)
                    @include('ppdb.update-data.partials.parents')
                @elseif($activeStep === 3)
                    @include('ppdb.update-data.partials.guardian-boarding')
                @elseif($activeStep === 4)
                    @include('ppdb.update-data.partials.boarding-health')
                @elseif($activeStep === 5)
                    @include('ppdb.update-data.partials.documents')
                @else
                    @include('ppdb.update-data.partials.review')
                @endif
            </div>
        @endif
    </div>
</div>
@endsection
