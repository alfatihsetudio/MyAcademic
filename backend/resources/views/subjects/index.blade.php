@extends('layouts.app')

@section('title', 'Mata Pelajaran')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Mata Pelajaran</h1>
        <p class="page-subtitle">Daftar mata pelajaran yang aktif</p>
    </div>
    @if(auth()->user()->isAdmin() || auth()->user()->isGuru())
        <a href="{{ route('subjects.create') }}" class="btn btn-primary">➕ Tambah Mapel Baru</a>
    @endif
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Mata Pelajaran</th>
                    <th>Kelas</th>
                    <th>Guru Pengajar</th>
                    <th>Deskripsi</th>
                    @if(auth()->user()->isAdmin() || auth()->user()->isGuru())
                        <th>Aksi</th>
                    @endif
                </tr>
            </thead>
            <tbody>
                @forelse($subjects as $i => $s)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td><strong>{{ $s->nama_mapel }}</strong></td>
                        <td>
                            <span class="user-badge badge-guru">{{ $s->academicClass->nama_kelas ?? '-' }}</span>
                        </td>
                        <td>{{ $s->guru->name ?? '-' }}</td>
                        <td style="color: var(--gray); font-size: 0.85rem;">{{ $s->deskripsi ?: '-' }}</td>
                        @if(auth()->user()->isAdmin() || auth()->user()->isGuru())
                            <td>
                                <form action="{{ route('subjects.destroy', $s->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus mata pelajaran ini?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                </form>
                            </td>
                        @endif
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada mata pelajaran yang terdaftar.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
