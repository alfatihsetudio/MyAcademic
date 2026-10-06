@extends('layouts.app')

@section('title', 'Rekap Penilaian Offline')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Rekap Nilai Offline</h1>
        <p class="page-subtitle">Matriks nilai seluruh tugas offline per kelas</p>
    </div>
    <a href="{{ route('offline-assessment.index') }}" class="btn btn-secondary">← Kembali ke Tugas Offline</a>
</div>

<!-- Filter Class & Date Range -->
<div class="card">
    <form action="{{ route('offline-assessment.rekap') }}" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0; min-width: 220px;">
            <label for="class_id" class="form-label">Pilih Kelas *</label>
            <select id="class_id" name="class_id" class="form-control" required>
                <option value="">-- Pilih Kelas --</option>
                @foreach($classes as $c)
                    <option value="{{ $c->id }}" {{ $selectedClassId == $c->id ? 'selected' : '' }}>
                        {{ $c->nama_kelas }} (Level {{ $c->level }})
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

        <button type="submit" class="btn btn-primary" style="height: 42px;">Tampilkan Rekap</button>
    </form>
</div>

@if($selectedClassId > 0)
    <div class="card">
        @if($students->isEmpty())
            <p style="text-align: center; color: var(--gray); padding: 2rem;">Belum ada siswa di kelas ini.</p>
        @elseif($tasks->isEmpty())
            <p style="text-align: center; color: var(--gray); padding: 2rem;">Tidak ada tugas offline pada rentang tanggal yang dipilih.</p>
        @else
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama Siswa</th>
                            @foreach($tasks as $t)
                                <th style="text-align: center;" title="{{ $t->title }}">
                                    {{ Str::limit($t->title, 15) }}
                                    <div style="font-size: 0.65rem; color: var(--gray); font-weight: normal;">{{ $t->created_at->format('d/m') }}</div>
                                </th>
                            @endforeach
                            <th style="text-align: center;">Rata-rata</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($students as $i => $s)
                            @php
                                $sum = 0;
                                $count = 0;
                            @endphp
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td><strong>{{ $s->name }}</strong></td>
                                @foreach($tasks as $t)
                                    @php
                                        $val = $scoreMap[$s->id][$t->id] ?? null;
                                        if ($val !== null) {
                                            $sum += (float) $val;
                                            $count++;
                                        }
                                    @endphp
                                    <td style="text-align: center;">
                                        @if($val !== null)
                                            <span style="font-weight: 600; color: #16a34a;">{{ $val }}</span>
                                        @else
                                            <span style="color: var(--gray);">-</span>
                                        @endif
                                    </td>
                                @endforeach
                                <td style="text-align: center; font-weight: 700; color: #4f46e5;">
                                    {{ $count > 0 ? number_format($sum / $count, 1) : '-' }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
@endif
@endsection
