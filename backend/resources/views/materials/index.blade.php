@extends('layouts.app')

@section('title', 'Materi Pembelajaran')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Materi Pembelajaran</h1>
        <p class="page-subtitle">Modul, catatan, dan materi belajar interaktif</p>
    </div>
    @if(auth()->user()->isAdmin() || auth()->user()->isGuru())
        <a href="{{ route('materials.create') }}" class="btn btn-primary">➕ Kirim Materi Baru</a>
    @endif
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Judul Materi</th>
                    <th>Mata Pelajaran</th>
                    <th>Kelas</th>
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
                                <span style="font-size: 0.75rem; background: #e0e7ff; color: #4338ca; padding: 2px 6px; border-radius: 4px; margin-left: 0.35rem;">File Lampiran</span>
                            @endif
                        </td>
                        <td>{{ $m->subject->nama_mapel ?? '-' }}</td>
                        <td>
                            <span class="user-badge badge-murid">{{ $m->subject->academicClass->nama_kelas ?? '-' }}</span>
                        </td>
                        <td>{{ $m->creator->name ?? '-' }}</td>
                        <td>{{ $m->created_at->format('d M Y') }}</td>
                        <td>
                            <div style="display: flex; gap: 0.35rem;">
                                <a href="{{ route('materials.show', $m->id) }}" class="btn btn-secondary btn-sm">Buka</a>
                                @if(auth()->user()->isAdmin() || (auth()->user()->isGuru() && $m->created_by === auth()->id()))
                                    <form action="{{ route('materials.destroy', $m->id) }}" method="POST" onsubmit="return confirm('Hapus materi ini?');">
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
                            Belum ada materi pembelajaran yang dibagikan.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
