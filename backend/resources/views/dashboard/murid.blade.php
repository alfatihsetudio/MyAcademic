@extends('layouts.app')

@section('title', 'Dashboard Murid')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Halo, {{ $user->name }}!</h1>
        <p class="page-subtitle">Ruang Siswa — Pantau tugas, materi pembelajaran, dan jadwal belajarmu</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('space-belajar.index') }}" class="btn btn-primary btn-sm">🚀 Buka Space Belajar</a>
    </div>
</div>

<!-- Primary Class Info Card -->
<div class="card" style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; border: none;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
            <div style="font-size: 0.85rem; opacity: 0.9; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Kelas Terdaftar</div>
            <div style="font-size: 1.75rem; font-weight: 700; margin: 0.25rem 0;">{{ $primaryClass->nama_kelas ?? 'Belum ada kelas' }}</div>
            <div style="font-size: 0.875rem; opacity: 0.9;">
                Wali Kelas: {{ $primaryClass->waliKelas->name ?? '-' }} | KM: {{ $primaryClass->nama_km ?? '-' }}
            </div>
        </div>
        <div>
            <span style="background: rgba(255,255,255,0.2); padding: 0.4rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 600;">
                Tahun Ajaran Aktif
            </span>
        </div>
    </div>
</div>

<style>
    .quick-tile {
        display: flex;
        gap: 12px;
        padding: 12px 14px;
        border-radius: 10px;
        border: 1px solid var(--border);
        background: #f8fafc;
        text-decoration: none;
        color: inherit;
        transition: all 0.2s;
        align-items: center;
    }
    .quick-tile:hover {
        background: var(--primary-light);
        border-color: #c7d2fe;
        transform: translateY(-2px);
    }
    .quick-icon {
        font-size: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: white;
        border-radius: 8px;
        border: 1px solid var(--border);
        flex-shrink: 0;
    }
    .quick-title {
        font-weight: 600;
        font-size: 0.92rem;
        color: var(--dark);
    }
    .quick-desc {
        font-size: 0.78rem;
        color: var(--gray);
        margin-top: 2px;
    }
    .menu-section-header {
        font-weight: 700;
        font-size: 0.82rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--gray);
        margin: 14px 0 6px 4px;
    }
    .menu-section-header:first-of-type {
        margin-top: 0;
    }
</style>

<div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 1.5rem; align-items: start;">
    <!-- Left Column: Upcoming Assignments & Recent Materials -->
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        <!-- Upcoming Assignments -->
        <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.05rem; font-weight: 600;">Tugas yang Harus Dikerjakan</h3>
                <a href="{{ route('assignments.index') }}" style="font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 600;">Semua Tugas &rarr;</a>
            </div>

            @if($upcomingAssignments->isEmpty())
                <p style="color: var(--gray); font-size: 0.9rem; padding: 1rem 0;">Bagus! Tidak ada tugas yang tertunda saat ini. 🎉</p>
            @else
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    @foreach($upcomingAssignments as $a)
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--light-gray); border-radius: 8px; border: 1px solid var(--border);">
                            <div>
                                <div style="font-weight: 600; color: var(--dark);">{{ $a->judul }}</div>
                                <div style="font-size: 0.75rem; color: var(--gray);">
                                    Mapel: {{ $a->subject->nama_mapel ?? '-' }} | Deadline: 
                                    <strong style="color: #dc2626;">{{ $a->deadline ? $a->deadline->format('d M, H:i') : 'Tanpa Batas' }}</strong>
                                </div>
                            </div>
                            <a href="{{ route('assignments.show', $a->id) }}" class="btn btn-primary btn-sm" style="font-size: 0.75rem;">
                                Kerjakan &rarr;
                            </a>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>

        <!-- Recent Materials -->
        <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.05rem; font-weight: 600;">Materi Pembelajaran Baru</h3>
                <a href="{{ route('materials.index') }}" style="font-size: 0.8rem; color: var(--primary); text-decoration: none; font-weight: 600;">Semua Materi &rarr;</a>
            </div>

            @if($recentMaterials->isEmpty())
                <p style="color: var(--gray); font-size: 0.9rem; padding: 1rem 0;">Belum ada materi pembelajaran yang dibagikan.</p>
            @else
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    @foreach($recentMaterials as $m)
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--light-gray); border-radius: 8px; border: 1px solid var(--border);">
                            <div>
                                <div style="font-weight: 600; color: var(--dark);">{{ $m->judul }}</div>
                                <div style="font-size: 0.75rem; color: var(--gray);">
                                    Mapel: {{ $m->subject->nama_mapel ?? '-' }} • {{ $m->created_at->diffForHumans() }}
                                </div>
                            </div>
                            <a href="{{ route('materials.show', $m->id) }}" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">
                                Buka
                            </a>
                        </div>
                    @endforeach
                </div>
            @endif
        </div>
    </div>

    <!-- Right Column: Aksi Cepat / Menu Navigasi Siswa -->
    <div class="card" style="margin-bottom: 0;">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 0.25rem;">Aksi Cepat</h3>
        <p style="font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem;">Pilih menu di bawah ini untuk mengakses langsung layanan akademik Anda.</p>

        <div style="display: flex; flex-direction: column; gap: 8px;">
            <!-- Kelas & Mapel -->
            <div class="menu-section-header">Kelas & Mapel</div>

            <a href="{{ route('classes.my-classes') }}" class="quick-tile">
                <div class="quick-icon">🏫</div>
                <div>
                    <div class="quick-title">Daftar Kelas</div>
                    <div class="quick-desc">Lihat semua kelas yang Anda ikuti.</div>
                </div>
            </a>

            <a href="{{ route('subjects.index') }}" class="quick-tile">
                <div class="quick-icon">📖</div>
                <div>
                    <div class="quick-title">Daftar Mapel</div>
                    <div class="quick-desc">Lihat seluruh mata pelajaran kamu.</div>
                </div>
            </a>

            <!-- Penilaian -->
            <div class="menu-section-header">Penilaian</div>

            <a href="{{ route('grades.my-rekap') }}" class="quick-tile">
                <div class="quick-icon">📑</div>
                <div>
                    <div class="quick-title">Rekap Nilai</div>
                    <div class="quick-desc">Nilai tugas dan nilai offline.</div>
                </div>
            </a>

            <!-- Absensi -->
            <div class="menu-section-header">Absensi</div>

            <a href="{{ route('attendance.my-history') }}" class="quick-tile">
                <div class="quick-icon">🕒</div>
                <div>
                    <div class="quick-title">Riwayat Absensi</div>
                    <div class="quick-desc">Lihat kehadiran kamu.</div>
                </div>
            </a>

            <!-- Akun -->
            <div class="menu-section-header">Akun</div>

            <a href="{{ route('account.settings') }}" class="quick-tile">
                <div class="quick-icon">⚙️</div>
                <div>
                    <div class="quick-title">Pengaturan Akun</div>
                    <div class="quick-desc">Ganti password atau atur profil.</div>
                </div>
            </a>

            <!-- Belajar & Catatan Pribadi -->
            <div class="menu-section-header">Belajar & Catatan Pribadi</div>

            <a href="{{ route('space-belajar.index') }}" class="quick-tile">
                <div class="quick-icon">🚀</div>
                <div>
                    <div class="quick-title">Space Belajar</div>
                    <div class="quick-desc">Ruang belajar mandiri dan progres target.</div>
                </div>
            </a>

            <a href="{{ route('space-belajar.calendar') }}" class="quick-tile">
                <div class="quick-icon">📅</div>
                <div>
                    <div class="quick-title">Kalender Belajar</div>
                    <div class="quick-desc">Jadwal dan agenda kegiatan belajar.</div>
                </div>
            </a>
        </div>
    </div>
</div>
@endsection
