@extends('layouts.app')

@section('title', 'Daftar Nilai')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Daftar Nilai Siswa</h1>
        <p class="page-subtitle">Rekap penilaian tugas yang telah dikoreksi</p>
    </div>
    @if(auth()->user()->isGuru() || auth()->user()->isAdmin())
        <a href="{{ route('grades.daily-recap') }}" class="btn btn-secondary">📊 Rekap Nilai Harian</a>
    @endif
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Tugas</th>
                    @if(!auth()->user()->isMurid())
                        <th>Nama Siswa</th>
                    @endif
                    <th>Nilai</th>
                    <th>Feedback / Catatan Guru</th>
                    <th>Tgl Dinilai</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($grades as $i => $g)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            <strong>{{ $g->assignment->judul ?? '-' }}</strong>
                            <div style="font-size: 0.75rem; color: var(--gray);">{{ $g->assignment->subject->nama_mapel ?? '' }}</div>
                        </td>
                        @if(!auth()->user()->isMurid())
                            <td>
                                <div>{{ $g->student->name ?? '-' }}</div>
                                <div style="font-size: 0.75rem; color: var(--gray);">{{ $g->student->email ?? '' }}</div>
                            </td>
                        @endif
                        <td>
                            <span style="font-size: 1.15rem; font-weight: 700; color: #16a34a;">{{ $g->nilai }}</span>
                        </td>
                        <td>{{ $g->feedback ?: '-' }}</td>
                        <td>{{ $g->graded_at ? $g->graded_at->format('d M Y') : '-' }}</td>
                        <td>
                            <a href="{{ route('assignments.show', $g->assignment_id) }}" class="btn btn-secondary btn-sm">Detail</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada rekaman nilai tugas.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
