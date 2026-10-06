@extends('layouts.app')

@section('title', 'Agenda Tanggal ' . \Carbon\Carbon::parse($date)->translatedFormat('d F Y'))

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">{{ \Carbon\Carbon::parse($date)->translatedFormat('l, d F Y') }}</h1>
        <p class="page-subtitle">Agenda & kegiatan belajar pada hari ini</p>
    </div>
    <a href="{{ route('space-belajar.calendar') }}?year={{ \Carbon\Carbon::parse($date)->year }}" class="btn btn-secondary">← Kembali ke Kalender</a>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); gap: 1.5rem;">
    <!-- Events List -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Daftar Kegiatan</h3>
        
        @if($events->isEmpty())
            <p style="color: var(--gray); font-size: 0.9rem; padding: 2rem 0; text-align: center;">
                Belum ada jadwal khusus atau peringatan pada tanggal ini.
            </p>
        @else
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                @foreach($events as $e)
                    <div style="padding: 0.75rem 1rem; border-radius: 8px; border-left: 4px solid {{ $e->type === 'holiday' ? '#ef4444' : ($e->type === 'warning' ? '#f59e0b' : '#3b82f6') }}; background: var(--light-gray);">
                        <div style="font-weight: 600; color: var(--dark);">{{ $e->title }}</div>
                        @if($e->note)
                            <div style="font-size: 0.85rem; color: var(--gray); margin-top: 0.25rem;">{{ $e->note }}</div>
                        @endif
                        <span class="user-badge" style="margin-top: 0.4rem; display: inline-block;">{{ $e->type }}</span>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <!-- Form Tambah Event -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Tambah Kegiatan Baru</h3>
        
        <form action="{{ route('space-belajar.calendar.save') }}" method="POST">
            @csrf
            <input type="hidden" name="event_date" value="{{ $date }}">

            <div class="form-group">
                <label for="title" class="form-label">Judul Agenda / Catatan *</label>
                <input type="text" id="title" name="title" class="form-control" placeholder="Contoh: Try Out Akbar, Libur Awal Ramadhan" required>
            </div>

            <div class="form-group">
                <label for="type" class="form-label">Jenis Agenda *</label>
                <select id="type" name="type" class="form-control" required>
                    <option value="special">Agenda Khusus / Ujian</option>
                    <option value="holiday">Hari Libur</option>
                    <option value="warning">Penting / Deadline</option>
                </select>
            </div>

            <div class="form-group">
                <label for="note" class="form-label">Catatan Tambahan</label>
                <textarea id="note" name="note" class="form-control" rows="3" placeholder="Keterangan singkat..."></textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">➕ Simpan ke Kalender</button>
        </form>
    </div>
</div>
@endsection
