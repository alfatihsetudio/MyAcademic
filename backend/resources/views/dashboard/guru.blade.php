@extends('layouts.app')

@section('title', 'Dashboard Guru')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Selamat Datang, {{ $user->name }}!</h1>
        <p class="page-subtitle">Portal Pengajar — Kelola pembelajaran, tugas, dan presensi siswa</p>
    </div>
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <a href="{{ route('assignments.create') }}" class="btn btn-primary btn-sm">➕ Buat Tugas</a>
        <a href="{{ route('materials.create') }}" class="btn btn-secondary btn-sm">📖 Kirim Materi</a>
        <a href="{{ route('attendance.take') }}" class="btn btn-secondary btn-sm">📋 Isi Presensi</a>
    </div>
</div>

<!-- Stats -->
<div class="grid-stats">
    <div class="stat-card">
        <div class="stat-label">🏫 Kelas yang Diampu</div>
        <div class="stat-value">{{ $classes->count() }}</div>
        <div class="stat-desc">Rombongan belajar wali/pengampu</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">👨‍🎓 Total Siswa</div>
        <div class="stat-value">{{ $studentCount }}</div>
        <div class="stat-desc">Siswa di kelas yang diampu</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📝 Tugas Dibuat</div>
        <div class="stat-value">{{ $assignmentCount }}</div>
        <div class="stat-desc">Total tugas aktif & lampau</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📖 Total Materi</div>
        <div class="stat-value">{{ $materialCount }}</div>
        <div class="stat-desc">Materi dalam sistem</div>
    </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
    <!-- Classes Taught -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Kelas yang Anda Ampu</h3>
        @if($classes->isEmpty())
            <p style="color: var(--gray); font-size: 0.9rem;">Anda belum ditugaskan mengampu kelas manapun.</p>
        @else
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                @foreach($classes as $c)
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; background: var(--light-gray); border-radius: 8px; border: 1px solid var(--border);">
                        <div>
                            <div style="font-weight: 600; color: var(--dark);">{{ $c->nama_kelas }}</div>
                            <div style="font-size: 0.75rem; color: var(--gray);">Level: {{ $c->level ?: '-' }} | Jurusan: {{ $c->jurusan ?: '-' }}</div>
                        </div>
                        <a href="{{ route('attendance.take') }}?class_id={{ $c->id }}" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">
                            Presensi &rarr;
                        </a>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <!-- Upcoming Assignments -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Tugas Mendatang (Aktif)</h3>
        @if($upcomingAssignments->isEmpty())
            <p style="color: var(--gray); font-size: 0.9rem;">Tidak ada tugas dengan deadline aktif saat ini.</p>
        @else
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Tugas</th>
                            <th>Kelas</th>
                            <th>Deadline</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($upcomingAssignments as $a)
                            <tr>
                                <td><strong>{{ $a->judul }}</strong></td>
                                <td>{{ $a->academicClass->nama_kelas ?? '-' }}</td>
                                <td>
                                    <span style="color: #d97706; font-weight: 500;">
                                        {{ $a->deadline ? $a->deadline->format('d M, H:i') : 'Tanpa Batas' }}
                                    </span>
                                </td>
                                <td>
                                    <a href="{{ route('assignments.show', $a->id) }}" class="btn btn-secondary btn-sm" style="font-size: 0.75rem;">
                                        Lihat
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>
@endsection
