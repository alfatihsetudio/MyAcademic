@extends('layouts.app')

@section('title', 'Dashboard Admin')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Dashboard Administrator</h1>
        <p class="page-subtitle">{{ $school->nama_sekolah ?? 'Sekolah Markaz Lugoh' }} — Panel Kendali Utama</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('classes.create') }}" class="btn btn-primary btn-sm">➕ Tambah Kelas</a>
        <a href="{{ route('users.create') }}" class="btn btn-secondary btn-sm">👤 Tambah Pengguna</a>
    </div>
</div>

<!-- Stats Grid -->
<div class="grid-stats">
    <div class="stat-card">
        <div class="stat-label">👥 Total Guru</div>
        <div class="stat-value">{{ $counts['guru'] }}</div>
        <div class="stat-desc">Guru terdaftar di sekolah ini</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">🎓 Total Siswa</div>
        <div class="stat-value">{{ $counts['siswa'] }}</div>
        <div class="stat-desc">Siswa aktif</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">🏫 Total Kelas</div>
        <div class="stat-value">{{ $counts['classes'] }}</div>
        <div class="stat-desc">Rombongan belajar aktif</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📚 Mata Pelajaran</div>
        <div class="stat-value">{{ $counts['subjects'] }}</div>
        <div class="stat-desc">Mapel terdaftar</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📝 Total Tugas</div>
        <div class="stat-value">{{ $counts['assignments'] }}</div>
        <div class="stat-desc">Tugas yang telah dibuat</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📖 Materi Belajar</div>
        <div class="stat-value">{{ $counts['materials'] }}</div>
        <div class="stat-desc">Materi dibagikan</div>
    </div>
</div>

<!-- Quality Checks -->
@if($quality['guru_no_class'] > 0 || $quality['murid_no_class'] > 0)
<div class="card" style="border-left: 4px solid var(--warning);">
    <h3 style="font-size: 1rem; color: #b45309; margin-bottom: 0.5rem;">⚠️ Perhatian Kualitas Data</h3>
    <ul style="padding-left: 1.25rem; font-size: 0.875rem; color: #4b5563;">
        @if($quality['guru_no_class'] > 0)
            <li>Ada <strong>{{ $quality['guru_no_class'] }} guru</strong> yang belum ditugaskan sebagai wali kelas.</li>
        @endif
        @if($quality['murid_no_class'] > 0)
            <li>Ada <strong>{{ $quality['murid_no_class'] }} siswa</strong> yang belum terdaftar di kelas manapun.</li>
        @endif
    </ul>
</div>
@endif

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
    <!-- Latest Users -->
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.05rem; font-weight: 600;">Pengguna Terbaru</h3>
            <a href="{{ route('users.index') }}" style="font-size: 0.8rem; color: var(--primary); text-decoration: none;">Lihat Semua &rarr;</a>
        </div>
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Role</th>
                        <th>Tgl Terdaftar</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($latestUsers as $u)
                        <tr>
                            <td>
                                <div style="font-weight: 600;">{{ $u->name }}</div>
                                <div style="font-size: 0.75rem; color: var(--gray);">{{ $u->email }}</div>
                            </td>
                            <td>
                                <span class="user-badge badge-{{ $u->role }}">{{ $u->role }}</span>
                            </td>
                            <td>{{ $u->created_at->format('d M Y') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="3" style="text-align: center; color: var(--gray);">Belum ada data pengguna.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Latest Classes -->
    <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h3 style="font-size: 1.05rem; font-weight: 600;">Daftar Kelas</h3>
            <a href="{{ route('classes.index') }}" style="font-size: 0.8rem; color: var(--primary); text-decoration: none;">Lihat Semua &rarr;</a>
        </div>
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nama Kelas</th>
                        <th>Wali Kelas</th>
                        <th>Jurusan</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($latestClasses as $c)
                        <tr>
                            <td><strong>{{ $c->nama_kelas }}</strong></td>
                            <td>{{ $c->waliKelas->name ?? '-' }}</td>
                            <td>{{ $c->jurusan ?: '-' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="3" style="text-align: center; color: var(--gray);">Belum ada data kelas.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
