@extends('layouts.app')

@section('title', 'Manajemen Pengguna')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Manajemen Pengguna</h1>
        <p class="page-subtitle">Kelola akun Admin, Guru, dan Siswa</p>
    </div>
    <a href="{{ route('users.create') }}" class="btn btn-primary">➕ Tambah Pengguna Baru</a>
</div>

<!-- Filter Roles -->
<div class="card" style="padding: 1rem;">
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <a href="{{ route('users.index') }}" class="btn {{ empty($roleFilter) ? 'btn-primary' : 'btn-secondary' }} btn-sm">Semua Pengguna</a>
        <a href="{{ route('users.index') }}?role=guru" class="btn {{ $roleFilter === 'guru' ? 'btn-primary' : 'btn-secondary' }} btn-sm">Guru</a>
        <a href="{{ route('users.index') }}?role=murid" class="btn {{ $roleFilter === 'murid' ? 'btn-primary' : 'btn-secondary' }} btn-sm">Siswa</a>
        <a href="{{ route('users.index') }}?role=admin" class="btn {{ $roleFilter === 'admin' ? 'btn-primary' : 'btn-secondary' }} btn-sm">Admin</a>
    </div>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Kelas / Jenjang</th>
                    <th>Tgl Terdaftar</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($users as $i => $u)
                    <tr>
                        <td>{{ $users->firstItem() + $i }}</td>
                        <td><strong>{{ $u->name }}</strong></td>
                        <td>{{ $u->email }}</td>
                        <td>
                            <span class="user-badge badge-{{ $u->role }}">{{ $u->role }}</span>
                        </td>
                        <td>
                            @if($u->isMurid())
                                {{ $u->classes->first()->nama_kelas ?? ($u->jenjang ? $u->jenjang . ' ' . $u->jurusan : '-') }}
                            @else
                                -
                            @endif
                        </td>
                        <td style="font-size: 0.8rem; color: var(--gray);">{{ $u->created_at->format('d M Y') }}</td>
                        <td>
                            @if($u->id !== auth()->id())
                                <form action="{{ route('users.destroy', $u->id) }}" method="POST" onsubmit="return confirm('Hapus pengguna ini?');">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger btn-sm">Hapus</button>
                                </form>
                            @else
                                <span style="font-size: 0.75rem; color: var(--gray);">(Akun Saya)</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Tidak ada pengguna ditemukan.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>

    <div style="margin-top: 1rem;">
        {{ $users->links() }}
    </div>
</div>
@endsection
