@extends('layouts.app')

@section('title', 'Rekap Nilai Harian')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Rekap Nilai Tugas Harian</h1>
        <p class="page-subtitle">Statistik nilai dan tugas yang diserahkan per siswa</p>
    </div>
    <a href="{{ route('grades.index') }}" class="btn btn-secondary">← Kembali ke Daftar Nilai</a>
</div>

<!-- Filter Range -->
<div class="card">
    <form action="{{ route('grades.daily-recap') }}" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0;">
            <label for="from" class="form-label">Dari Tanggal</label>
            <input type="date" id="from" name="from" class="form-control" value="{{ $from }}">
        </div>
        <div class="form-group" style="margin-bottom: 0;">
            <label for="to" class="form-label">Sampai Tanggal</label>
            <input type="date" id="to" name="to" class="form-control" value="{{ $to }}">
        </div>
        <button type="submit" class="btn btn-primary" style="height: 42px;">Filter Rekap</button>
    </form>
</div>

<div class="card">
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Siswa</th>
                    <th>Email</th>
                    <th>Jumlah Tugas</th>
                    <th>Total Skor</th>
                    <th>Rata-rata Nilai</th>
                    <th>Pengumpulan Terakhir</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $i => $r)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td><strong>{{ $r->student_name }}</strong></td>
                        <td>{{ $r->student_email }}</td>
                        <td>
                            <span class="user-badge badge-guru">{{ $r->tugas_count }} Tugas</span>
                        </td>
                        <td>{{ number_format($r->total_nilai, 1) }}</td>
                        <td>
                            <span style="font-size: 1.1rem; font-weight: 700; color: #16a34a;">
                                {{ number_format($r->avg_nilai, 2) }}
                            </span>
                        </td>
                        <td style="font-size: 0.8rem; color: var(--gray);">
                            {{ $r->last_submit ? \Carbon\Carbon::parse($r->last_submit)->format('d M Y, H:i') : '-' }}
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Tidak ada data penyerahan tugas pada rentang tanggal tersebut.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
