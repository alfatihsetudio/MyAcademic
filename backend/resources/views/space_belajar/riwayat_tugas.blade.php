@extends('layouts.app')

@section('title', 'Riwayat Tugas Saya')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Riwayat Tugas Saya</h1>
        <p class="page-subtitle">Daftar semua tugas dan nilai yang kamu peroleh</p>
    </div>
    <a href="{{ route('space-belajar.index') }}" class="btn btn-secondary">← Kembali ke Space Belajar</a>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Tugas</th>
                    <th>Mata Pelajaran</th>
                    <th>Status Pengumpulan</th>
                    <th>Nilai</th>
                    <th>Catatan Guru</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($assignments as $i => $a)
                    @php
                        $sub = $a->submissions->first();
                    @endphp
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            <strong>{{ $a->judul }}</strong>
                            <div style="font-size: 0.75rem; color: var(--gray);">Deadline: {{ $a->deadline ? $a->deadline->format('d M Y, H:i') : 'Tanpa Batas' }}</div>
                        </td>
                        <td>{{ $a->subject->nama_mapel ?? '-' }}</td>
                        <td>
                            @if($sub)
                                <span class="user-badge badge-guru">Terkumpul ({{ $sub->submitted_at->format('d M') }})</span>
                            @else
                                <span class="user-badge badge-admin">Belum Dikumpulkan</span>
                            @endif
                        </td>
                        <td>
                            @if($sub && $sub->nilai !== null)
                                <span style="font-size: 1.15rem; font-weight: 700; color: #16a34a;">{{ $sub->nilai }}</span>
                            @else
                                <span style="color: var(--gray); font-size: 0.8rem;">-</span>
                            @endif
                        </td>
                        <td style="font-size: 0.85rem; color: #4b5563;">
                            {{ $sub ? ($sub->feedback ?: '-') : '-' }}
                        </td>
                        <td>
                            <a href="{{ route('assignments.show', $a->id) }}" class="btn btn-secondary btn-sm">Lihat Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada riwayat tugas untuk kelas Anda.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
