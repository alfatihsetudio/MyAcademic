@extends('layouts.app')

@section('title', 'Daftar Kelas Saya')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">🏫 Daftar Kelas Saya</h1>
        <p class="page-subtitle">Rombongan belajar dan informasi kelas yang kamu ikuti</p>
    </div>
    <a href="{{ route('murid.dashboard') }}" class="btn btn-secondary">← Kembali ke Dashboard</a>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem;">
    @forelse($classes as $c)
        <div class="card" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <div>
                    <h3 style="font-size: 1.35rem; font-weight: 700; color: var(--dark);">{{ $c->nama_kelas }}</h3>
                    <div style="font-size: 0.85rem; color: var(--gray);">Level {{ $c->level ?: '-' }} • Jurusan {{ $c->jurusan ?: '-' }}</div>
                </div>
                <span class="user-badge badge-guru">{{ $c->students->count() }} Teman Sekelas</span>
            </div>

            <div style="background: var(--light-gray); border-radius: 8px; padding: 1rem; margin-bottom: 1rem; font-size: 0.85rem;">
                <div style="margin-bottom: 0.4rem;">
                    <strong>Wali Kelas:</strong> {{ $c->waliKelas->name ?? '-' }}
                    @if($c->no_telpon_wali)
                        <span style="color: var(--gray);">({{ $c->no_telpon_wali }})</span>
                    @endif
                </div>
                <div style="margin-bottom: 0.4rem;">
                    <strong>Ketua Murid (KM):</strong> {{ $c->nama_km ?: '-' }}
                    @if($c->no_telpon_km)
                        <span style="color: var(--gray);">({{ $c->no_telpon_km }})</span>
                    @endif
                </div>
                @if($c->walimurid)
                    <div><strong>Koordinator Wali:</strong> {{ $c->walimurid }}</div>
                @endif
            </div>

            <div>
                <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--dark);">Daftar Teman Sekelas:</h4>
                <div style="max-height: 180px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; padding: 0.5rem;">
                    <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
                        @foreach($c->students as $s)
                            <li style="display: flex; justify-content: space-between; padding: 2px 4px; {{ $s->id === auth()->id() ? 'background: #eef2ff; font-weight: 600;' : '' }}">
                                <span>{{ $s->name }} {{ $s->id === auth()->id() ? '(Saya)' : '' }}</span>
                                <span style="font-size: 0.75rem; color: var(--gray);">{{ $s->email }}</span>
                            </li>
                        @endforeach
                    </ul>
                </div>
            </div>
        </div>
    @empty
        <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--gray); padding: 3rem;">
            Anda belum dimasukkan ke rombongan belajar kelas manapun. Hubungi administrator sekolah.
        </div>
    @endforelse
</div>
@endsection
