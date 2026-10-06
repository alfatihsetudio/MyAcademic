@extends('layouts.app')

@section('title', 'Input Nilai: ' . $task->title)

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Input Nilai: {{ $task->title }}</h1>
        <p class="page-subtitle">
            Kelas: <strong>{{ $task->academicClass->nama_kelas ?? '-' }}</strong> | 
            Mapel: <strong>{{ $task->subject->nama_mapel ?? '-' }}</strong>
        </p>
    </div>
    <a href="{{ route('offline-assessment.index') }}" class="btn btn-secondary">← Kembali ke Tugas Offline</a>
</div>

<div class="card">
    @if($task->description || $task->content)
        <div style="background: var(--light-gray); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; font-size: 0.9rem;">
            @if($task->description)
                <p><strong>Deskripsi:</strong> {{ $task->description }}</p>
            @endif
            @if($task->content)
                <p style="margin-top: 0.5rem; color: var(--gray);"><strong>Rubrik:</strong> {{ $task->content }}</p>
            @endif
        </div>
    @endif

    <form action="{{ route('offline-assessment.save-scores', $task->id) }}" method="POST">
        @csrf
        
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nama Siswa</th>
                        <th>Nilai (0-100)</th>
                        <th>Catatan / Evaluasi Guru</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($students as $i => $s)
                        @php
                            $rec = $scores->get($s->id);
                        @endphp
                        <tr>
                            <td>{{ $i + 1 }}</td>
                            <td>
                                <strong>{{ $s->name }}</strong>
                                <div style="font-size: 0.75rem; color: var(--gray);">{{ $s->email }}</div>
                            </td>
                            <td>
                                <input type="number" step="0.01" min="0" max="100" name="score[{{ $s->id }}]" class="form-control" style="width: 100px; font-size: 1rem; font-weight: 700;" placeholder="0-100" value="{{ $rec->score ?? '' }}">
                            </td>
                            <td>
                                <input type="text" name="note[{{ $s->id }}]" class="form-control" placeholder="Contoh: Lancar, tajwid baik..." value="{{ $rec->note ?? '' }}">
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--gray); padding: 2rem;">
                                Belum ada siswa di kelas ini.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        @if($students->isNotEmpty())
            <div style="margin-top: 1.5rem;">
                <button type="submit" class="btn btn-primary">💾 Simpan Semua Nilai</button>
            </div>
        @endif
    </form>
</div>
@endsection
