@extends('layouts.app')

@section('title', 'Penilaian Offline')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Penilaian Offline</h1>
        <p class="page-subtitle">Buat tugas langsung di kelas dan beri nilai siswa saat tatap muka</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('offline-assessment.create') }}" class="btn btn-primary">➕ Buat Tugas Offline</a>
        <a href="{{ route('offline-assessment.rekap') }}" class="btn btn-secondary">📊 Rekap Nilai</a>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Tugas Offline</th>
                    <th>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Tgl Dibuat</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($tasks as $i => $t)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            <strong>{{ $t->title }}</strong>
                            <div style="font-size: 0.75rem; color: var(--gray);">{{ Str::limit($t->description, 50) }}</div>
                        </td>
                        <td>
                            <span class="user-badge badge-murid">{{ $t->academicClass->nama_kelas ?? '-' }}</span>
                        </td>
                        <td>{{ $t->subject->nama_mapel ?? '-' }}</td>
                        <td>{{ $t->created_at->format('d M Y') }}</td>
                        <td>
                            <a href="{{ route('offline-assessment.use', $t->id) }}" class="btn btn-primary btn-sm">
                                📝 Input Nilai
                            </a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada tugas offline yang dibuat.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
