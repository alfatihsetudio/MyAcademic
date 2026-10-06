@extends('layouts.app')

@section('title', 'Rekap Nilai Siswa')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">📑 Rekap Nilai Saya</h1>
        <p class="page-subtitle">Rangkuman nilai dari tugas online dan penilaian tatap muka offline</p>
    </div>
    <a href="{{ route('murid.dashboard') }}" class="btn btn-secondary">← Kembali ke Dashboard</a>
</div>

<!-- Filter Selection -->
<div class="card">
    <form action="{{ route('grades.my-rekap') }}" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0; min-width: 220px;">
            <label for="subject_id" class="form-label">Filter Mata Pelajaran</label>
            <select id="subject_id" name="subject_id" class="form-control">
                <option value="0">-- Semua Mata Pelajaran --</option>
                @foreach($subjects as $s)
                    <option value="{{ $s->id }}" {{ $selectedSubjectId == $s->id ? 'selected' : '' }}>
                        {{ $s->nama_mapel }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
            <label for="from" class="form-label">Dari Tanggal</label>
            <input type="date" id="from" name="from" class="form-control" value="{{ $from }}">
        </div>

        <div class="form-group" style="margin-bottom: 0;">
            <label for="to" class="form-label">Sampai Tanggal</label>
            <input type="date" id="to" name="to" class="form-control" value="{{ $to }}">
        </div>

        <button type="submit" class="btn btn-primary" style="height: 42px;">Filter Nilai</button>
    </form>
</div>

<!-- Stats Card -->
<div class="grid-stats">
    <div class="stat-card">
        <div class="stat-label">📊 Rata-Rata Nilai</div>
        <div class="stat-value" style="color: #16a34a;">
            {{ $stats['average'] !== null ? number_format($stats['average'], 2) : '-' }}
        </div>
        <div class="stat-desc">Gabungan online & offline</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">📝 Total Penilaian</div>
        <div class="stat-value">{{ $stats['total_items'] }}</div>
        <div class="stat-desc">Tugas yang sudah dinilai</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">🏆 Nilai Tertinggi</div>
        <div class="stat-value" style="color: #2563eb;">{{ $stats['highest'] ?? '-' }}</div>
        <div class="stat-desc">Skor maksimal diraih</div>
    </div>
    <div class="stat-card">
        <div class="stat-label">⚠️ Nilai Terendah</div>
        <div class="stat-value" style="color: #d97706;">{{ $stats['lowest'] ?? '-' }}</div>
        <div class="stat-desc">Skor minimal diraih</div>
    </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1.5rem;">
    <!-- Online Assignments Table -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem; color: var(--dark);">
            💻 Nilai Tugas Online (Web)
        </h3>

        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tugas</th>
                        <th>Mapel</th>
                        <th>Tgl Kumpul</th>
                        <th>Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($onlineSubmissions as $sub)
                        <tr>
                            <td>
                                <strong>{{ $sub->assignment->judul ?? '-' }}</strong>
                                @if($sub->feedback)
                                    <div style="font-size: 0.75rem; color: #15803d; margin-top: 2px;">Catatan: {{ $sub->feedback }}</div>
                                @endif
                            </td>
                            <td>{{ $sub->assignment->subject->nama_mapel ?? '-' }}</td>
                            <td style="font-size: 0.8rem;">{{ $sub->submitted_at->format('d/m/Y') }}</td>
                            <td>
                                <span style="font-size: 1.15rem; font-weight: 700; color: #16a34a;">{{ $sub->nilai }}</span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--gray); padding: 1.5rem;">
                                Belum ada nilai tugas online.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

    <!-- Offline Assessments Table -->
    <div class="card">
        <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem; color: var(--dark);">
            🏫 Nilai Penilaian Offline (Tatap Muka)
        </h3>

        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Tugas Offline</th>
                        <th>Mapel</th>
                        <th>Tanggal</th>
                        <th>Nilai</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($offlineScores as $off)
                        <tr>
                            <td>
                                <strong>{{ $off->task->title ?? '-' }}</strong>
                                @if($off->note)
                                    <div style="font-size: 0.75rem; color: #475569; margin-top: 2px;">Catatan: {{ $off->note }}</div>
                                @endif
                            </td>
                            <td>{{ $off->task->subject->nama_mapel ?? '-' }}</td>
                            <td style="font-size: 0.8rem;">{{ $off->created_at->format('d/m/Y') }}</td>
                            <td>
                                <span style="font-size: 1.15rem; font-weight: 700; color: #2563eb;">{{ $off->score }}</span>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="4" style="text-align: center; color: var(--gray); padding: 1.5rem;">
                                Belum ada nilai tugas offline.
                            </td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
