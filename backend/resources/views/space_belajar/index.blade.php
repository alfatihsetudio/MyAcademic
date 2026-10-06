@extends('layouts.app')

@section('title', 'Space Belajar')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">🚀 Space Belajar Siswa</h1>
        <p class="page-subtitle">Ruang pribadi untuk mengelola perjalanan dan target belajarmu</p>
    </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem;">
    <!-- Riwayat Tugas -->
    <a href="{{ route('space-belajar.riwayat-tugas') }}" class="card" style="text-decoration: none; color: inherit; transition: transform 0.15s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size: 2.25rem; margin-bottom: 0.75rem;">📝</div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--dark); margin-bottom: 0.35rem;">Riwayat Tugas</h3>
        <p style="font-size: 0.85rem; color: var(--gray); line-height: 1.5;">Lihat seluruh penugasan yang pernah diberikan oleh guru, lengkap dengan nilai dan catatan feedback.</p>
    </a>

    <!-- Riwayat Materi -->
    <a href="{{ route('space-belajar.riwayat-materi') }}" class="card" style="text-decoration: none; color: inherit; transition: transform 0.15s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size: 2.25rem; margin-bottom: 0.75rem;">📖</div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--dark); margin-bottom: 0.35rem;">Riwayat Materi</h3>
        <p style="font-size: 0.85rem; color: var(--gray); line-height: 1.5;">Akses kembali seluruh modul, berkas dokumen, dan tautan video pembelajaran yang pernah dibagikan.</p>
    </a>

    <!-- Target & Progres Belajar -->
    <a href="{{ route('space-belajar.progres') }}" class="card" style="text-decoration: none; color: inherit; transition: transform 0.15s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size: 2.25rem; margin-bottom: 0.75rem;">🎯</div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--dark); margin-bottom: 0.35rem;">Target & Progres Belajar</h3>
        <p style="font-size: 0.85rem; color: var(--gray); line-height: 1.5;">Tetapkan target hafalan / pemahaman belajar mandiri dan catat riwayat progres harianmu.</p>
    </a>

    <!-- Kalender Belajar -->
    <a href="{{ route('space-belajar.calendar') }}" class="card" style="text-decoration: none; color: inherit; transition: transform 0.15s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
        <div style="font-size: 2.25rem; margin-bottom: 0.75rem;">📅</div>
        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--dark); margin-bottom: 0.35rem;">Kalender Akademik</h3>
        <p style="font-size: 0.85rem; color: var(--gray); line-height: 1.5;">Lihat tanggal penting, agenda ujian, hari libur, dan jadwal kegiatan belajar tahunan.</p>
    </a>
</div>
@endsection
