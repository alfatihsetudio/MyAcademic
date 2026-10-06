@extends('layouts.app')

@section('title', 'Riwayat Materi Pembelajaran')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Riwayat Materi Pembelajaran</h1>
        <p class="page-subtitle">Akses seluruh modul dan materi yang dibagikan guru ke kelasmu</p>
    </div>
    <a href="{{ route('space-belajar.index') }}" class="btn btn-secondary">← Kembali ke Space Belajar</a>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Materi</th>
                    <th>Mata Pelajaran</th>
                    <th>Pengunggah</th>
                    <th>Tgl Dibagikan</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($materials as $i => $m)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>
                            <strong>{{ $m->judul }}</strong>
                            @if($m->video_link)
                                <span style="font-size: 0.75rem; background: #fee2e2; color: #dc2626; padding: 2px 6px; border-radius: 4px; margin-left: 0.35rem;">Video</span>
                            @endif
                            @if($m->file_path)
                                <span style="font-size: 0.75rem; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; margin-left: 0.35rem;">Berkas</span>
                            @endif
                        </td>
                        <td>{{ $m->subject->nama_mapel ?? '-' }}</td>
                        <td>{{ $m->creator->name ?? '-' }}</td>
                        <td>{{ $m->created_at->format('d M Y') }}</td>
                        <td>
                            <a href="{{ route('materials.show', $m->id) }}" class="btn btn-primary btn-sm">Buka Materi</a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada riwayat materi untuk kelas Anda.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
