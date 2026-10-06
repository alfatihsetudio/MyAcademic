@extends('layouts.app')

@section('title', 'Target & Progres Belajar')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">🎯 Target & Progres Belajar</h1>
        <p class="page-subtitle">Rencanakan pencapaian belajarmu dan pantau perkembangannya</p>
    </div>
    <a href="{{ route('space-belajar.index') }}" class="btn btn-secondary">← Kembali ke Space Belajar</a>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 1.5rem;">
    <!-- Form Tambah Goal Baru -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Buat Target Baru</h3>
        
        <form action="{{ route('space-belajar.add-goal') }}" method="POST">
            @csrf
            <div class="form-group">
                <label for="title" class="form-label">Nama Target *</label>
                <input type="text" id="title" name="title" class="form-control" placeholder="Contoh: Hafal Juz 30, Kuasai Bab Fi'il" required>
            </div>

            <div class="form-group">
                <label for="description" class="form-label">Keterangan / Rencana</label>
                <textarea id="description" name="description" class="form-control" rows="3" placeholder="Rencana cara mencapainya..."></textarea>
            </div>

            <div class="form-group">
                <label for="target_date" class="form-label">Target Tanggal Selesai</label>
                <input type="date" id="target_date" name="target_date" class="form-control">
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">➕ Pasang Target</button>
        </form>
    </div>

    <!-- Daftar Goals & Catatan Log -->
    <div>
        @forelse($goals as $g)
            <div class="card" style="margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                    <div>
                        <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--dark);">{{ $g->title }}</h3>
                        <p style="font-size: 0.85rem; color: var(--gray); margin-top: 0.2rem;">{{ $g->description }}</p>
                    </div>
                    <span class="user-badge badge-guru">{{ $g->status }}</span>
                </div>

                @if($g->target_date)
                    <div style="font-size: 0.75rem; color: #d97706; margin-bottom: 1rem; font-weight: 600;">
                        Target: {{ $g->target_date->format('d F Y') }}
                    </div>
                @endif

                <!-- Progres History -->
                <div style="background: var(--light-gray); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                    <h4 style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--dark);">Riwayat Progres:</h4>
                    @if($g->logs->isEmpty())
                        <p style="font-size: 0.8rem; color: var(--gray);">Belum ada catatan aktivitas progres untuk target ini.</p>
                    @else
                        <ul style="list-style: none; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem;">
                            @foreach($g->logs as $log)
                                <li style="display: flex; gap: 0.5rem;">
                                    <span style="font-size: 0.75rem; color: var(--gray); min-width: 80px;">{{ $log->log_date->format('d M Y') }}</span>
                                    <span>{{ $log->notes }}</span>
                                </li>
                            @endforeach
                        </ul>
                    @endif
                </div>

                <!-- Form Tambah Log -->
                <form action="{{ route('space-belajar.add-goal-log') }}" method="POST" style="display: flex; gap: 0.5rem;">
                    @csrf
                    <input type="hidden" name="goal_id" value="{{ $g->id }}">
                    <input type="text" name="notes" class="form-control" placeholder="Tulis aktivitas belajarmu hari ini..." required>
                    <button type="submit" class="btn btn-secondary btn-sm" style="white-space: nowrap;">Catat Progres</button>
                </form>
            </div>
        @empty
            <div class="card" style="text-align: center; color: var(--gray); padding: 3rem;">
                Belum ada target belajar. Ayo pasang target pertamamu pada formulir di samping!
            </div>
        @endforelse
    </div>
</div>
@endsection
