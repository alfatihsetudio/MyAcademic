@extends('layouts.app')

@section('title', 'Daftar Kelas')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Manajemen Kelas</h1>
        <p class="page-subtitle">Daftar seluruh rombongan belajar sekolah</p>
    </div>
    <a href="{{ route('classes.create') }}" class="btn btn-primary">➕ Tambah Kelas Baru</a>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Kelas</th>
                    <th>Level / Jenjang</th>
                    <th>Jurusan</th>
                    <th>Wali Kelas</th>
                    <th>Kontak Wali / KM</th>
                    <th>Siswa</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($classes as $i => $c)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td><strong>{{ $c->nama_kelas }}</strong></td>
                        <td>{{ $c->level ?: '-' }}</td>
                        <td>{{ $c->jurusan ?: '-' }}</td>
                        <td>{{ $c->waliKelas->name ?? '-' }}</td>
                        <td style="font-size: 0.8rem;">
                            <div>Wali: {{ $c->walimurid ?: '-' }} ({{ $c->no_telpon_wali ?: '-' }})</div>
                            <div>KM: {{ $c->nama_km ?: '-' }} ({{ $c->no_telpon_km ?: '-' }})</div>
                        </td>
                        <td>
                            <span class="user-badge badge-murid">{{ $c->students->count() }} Siswa</span>
                        </td>
                        <td>
                            <div style="display: flex; gap: 0.35rem;">
                                <a href="{{ route('classes.edit', $c->id) }}" class="btn btn-secondary btn-sm">Edit</a>
                                <form action="{{ route('classes.destroy', $c->id) }}" method="POST" onsubmit="return confirm('Yakin ingin menghapus kelas ini?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="8" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada kelas yang dibuat. Silakan tambahkan kelas baru.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
