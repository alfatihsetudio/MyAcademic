@extends('layouts.app')

@section('title', 'Daftar Tugas')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Tugas & Evaluasi</h1>
        <p class="page-subtitle">Daftar tugas pembelajaran</p>
    </div>
    @if(auth()->user()->isAdmin() || auth()->user()->isGuru())
        <a href="{{ route('assignments.create') }}" class="btn btn-primary">➕ Buat Tugas Baru</a>
    @endif
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Tugas</th>
                    <th>Mata Pelajaran</th>
                    <th>Kelas Target</th>
                    <th>Batas Waktu (Deadline)</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($assignments as $i => $a)
                    @php
                        $isOverdue = $a->deadline && $a->deadline->isPast();
                    @endphp
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            <strong>{{ $a->judul }}</strong>
                            <div style="font-size: 0.75rem; color: var(--gray);">Dibuat: {{ $a->created_at->format('d M Y') }}</div>
                        </td>
                        <td>{{ $a->subject->nama_mapel ?? '-' }}</td>
                        <td>
                            <span class="user-badge badge-murid">{{ $a->academicClass->nama_kelas ?? '-' }}</span>
                        </td>
                        <td>
                            @if($a->deadline)
                                <span style="color: {{ $isOverdue ? '#dc2626' : '#16a34a' }}; font-weight: 600;">
                                    {{ $a->deadline->format('d M Y, H:i') }}
                                </span>
                                @if($isOverdue)
                                    <div style="font-size: 0.7rem; color: #dc2626;">(Lewat Batas)</div>
                                @endif
                            @else
                                <span style="color: var(--gray);">Tanpa Batas Waktu</span>
                            @endif
                        </td>
                        <td>
                            @if(auth()->user()->isMurid())
                                @php
                                    $sub = $a->submissions()->where('student_id', auth()->id())->first();
                                @endphp
                                @if($sub)
                                    <span class="user-badge badge-guru">Terkirim (Nilai: {{ $sub->nilai !== null ? $sub->nilai : 'Belum dinilai' }})</span>
                                @else
                                    <span class="user-badge badge-admin">Belum Mengumpulkan</span>
                                @endif
                            @else
                                <span class="user-badge badge-guru">{{ $a->submissions->count() }} Pengumpulan</span>
                            @endif
                        </td>
                        <td>
                            <div style="display: flex; gap: 0.35rem;">
                                <a href="{{ route('assignments.show', $a->id) }}" class="btn btn-secondary btn-sm">Buka</a>
                                @if(auth()->user()->isAdmin() || (auth()->user()->isGuru() && $a->created_by === auth()->id()))
                                    <form action="{{ route('assignments.destroy', $a->id) }}" method="POST" onsubmit="return confirm('Hapus tugas ini?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                    </form>
                                @endif
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada tugas yang tersedia.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
