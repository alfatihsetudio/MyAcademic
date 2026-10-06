@extends('layouts.app')

@section('title', 'Riwayat Absensi Saya')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">🕒 Riwayat Absensi Saya</h1>
        <p class="page-subtitle">Rekam jejak kehadiran harian dan catatan kedisiplinan</p>
    </div>
    <a href="{{ route('murid.dashboard') }}" class="btn btn-secondary">← Kembali ke Dashboard</a>
</div>

<!-- Filter Date Range -->
<div class="card">
    <form action="{{ route('attendance.my-history') }}" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0;">
            <label for="from" class="form-label">Dari Tanggal</label>
            <input type="date" id="from" name="from" class="form-control" value="{{ $from }}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label for="to" class="form-label">Sampai Tanggal</label>
            <input type="date" id="to" name="to" class="form-control" value="{{ $to }}">
        </div>
        <button type="submit" class="btn btn-primary" style="height: 42px;">Filter Absensi</button>
    </form>
</div>

<!-- Stats Card -->
<div class="grid-stats">
    <div class="stat-card">
        <div class="stat-label">✅ Hadir (H)</div>
        <div class="stat-value" style="color: #16a34a;">{{ $totals['H'] }} Hari</div>
        <div class="stat-desc">Tingkat Kehadiran: {{ number_format($attendanceRate, 1) }}%</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">🤒 Sakit (S)</div>
        <div class="stat-value" style="color: #2563eb;">{{ $totals['S'] }} Hari</div>
        <div class="stat-desc">Izin karena sakit</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📄 Izin (I)</div>
        <div class="stat-value" style="color: #d97706;">{{ $totals['I'] }} Hari</div>
        <div class="stat-desc">Izin keperluan keluarga/lainnya</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">❌ Alpa (A)</div>
        <div class="stat-value" style="color: #dc2626;">{{ $totals['A'] }} Hari</div>
        <div class="stat-desc">Tanpa keterangan</div>
    </div>
</div>

<div class="card">
    <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Log Rincian Presensi</h3>
    
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Tanggal</th>
                    <th>Mata Pelajaran</th>
                    <th>Materi Pembelajaran</th>
                    <th>Status</th>
                    <th>Catatan Guru</th>
                    <th>Nilai Harian</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $i => $rec)
                    @php
                        $badgeClass = match($rec->status) {
                            'H' => 'badge-guru',
                            'S' => 'badge-murid',
                            'I' => 'badge-admin',
                            'A' => 'badge-admin',
                            default => ''
                        };
                        $statusLabel = match($rec->status) {
                            'H' => 'Hadir',
                            'S' => 'Sakit',
                            'I' => 'Izin',
                            'A' => 'Alpa',
                            default => $rec->status
                        };
                    @endphp
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td><strong>{{ $rec->date->format('d M Y') }}</strong></td>
                        <td>{{ $rec->subject->nama_mapel ?? '-' }}</td>
                        <td>{{ $rec->materi ?: '-' }}</td>
                        <td>
                            <span class="user-badge {{ $badgeClass }}">{{ $statusLabel }}</span>
                        </td>
                        <td style="font-size: 0.85rem; color: var(--gray);">{{ $rec->note ?: '-' }}</td>
                        <td>
                            @if($rec->daily_score !== null)
                                <span style="font-weight: 700; color: #16a34a;">{{ $rec->daily_score }}</span>
                            @else
                                <span style="color: var(--gray); font-size: 0.8rem;">-</span>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada riwayat absensi pada rentang tanggal tersebut.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
