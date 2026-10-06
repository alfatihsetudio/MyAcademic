@extends('layouts.app')

@section('title', 'Presensi & Nilai Harian')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Presensi & Nilai Harian</h1>
        <p class="page-subtitle">Pencatatan kehadiran dan penilaian harian kelas</p>
    </div>
</div>

<!-- Filter Selection Card -->
<div class="card">
    <form action="{{ route('attendance.take') }}" method="GET" style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
        <div class="form-group" style="margin-bottom: 0; min-width: 250px;">
            <label for="subject_id" class="form-label">Pilih Mata Pelajaran *</label>
            <select id="subject_id" name="subject_id" class="form-control" required>
                <option value="">-- Pilih Mata Pelajaran --</option>
                @foreach($subjects as $s)
                    <option value="{{ $s->id }}" {{ $selectedSubjectId == $s->id ? 'selected' : '' }}>
                        {{ $s->nama_mapel }} — Kelas {{ $s->academicClass->nama_kelas ?? '-' }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group" style="margin-bottom: 0; min-width: 180px;">
            <label for="date" class="form-label">Tanggal Presensi *</label>
            <input type="date" id="date" name="date" class="form-control" value="{{ $selectedDate }}" required>
        </div>

        <button type="submit" class="btn btn-primary" style="height: 42px;">Tampilkan Siswa</button>
    </form>
</div>

@if($selectedSubject)
    <!-- Attendance Table Form -->
    <div class="card">
        <div style="margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.1rem; font-weight: 600;">
                Presensi Kelas {{ $selectedSubject->academicClass->nama_kelas ?? '-' }}
            </h3>
            <p style="font-size: 0.85rem; color: var(--gray);">
                Mapel: <strong>{{ $selectedSubject->nama_mapel }}</strong> | Tanggal: <strong>{{ \Carbon\Carbon::parse($selectedDate)->translatedFormat('l, d F Y') }}</strong>
            </p>
        </div>

        <form action="{{ route('attendance.store') }}" method="POST">
            @csrf
            <input type="hidden" name="subject_id" value="{{ $selectedSubject->id }}">
            <input type="hidden" name="date" value="{{ $selectedDate }}">

            <div class="form-group" style="max-width: 500px; margin-bottom: 1.5rem;">
                <label for="materi" class="form-label">Materi yang Diajarkan Hari Ini</label>
                <input type="text" id="materi" name="materi" class="form-control" placeholder="Contoh: Bab 2 Kaidah Isim Isyarah" value="{{ $existingRecords->first()->materi ?? '' }}">
            </div>

            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nama Siswa</th>
                            <th>Status Kehadiran</th>
                            <th>Catatan Kehadiran</th>
                            <th>Nilai Harian (0-100)</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($students as $i => $stu)
                            @php
                                $rec = $existingRecords->get($stu->id);
                                $currStatus = $rec ? $rec->status : 'H';
                            @endphp
                            <tr>
                                <td>{{ $i + 1 }}</td>
                                <td>
                                    <strong>{{ $stu->name }}</strong>
                                    <div style="font-size: 0.75rem; color: var(--gray);">{{ $stu->email }}</div>
                                </td>
                                <td>
                                    <div style="display: flex; gap: 1rem; align-items: center; font-size: 0.85rem;">
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                                            <input type="radio" name="status[{{ $stu->id }}]" value="H" {{ $currStatus == 'H' ? 'checked' : '' }}> Hadir
                                        </label>
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                                            <input type="radio" name="status[{{ $stu->id }}]" value="S" {{ $currStatus == 'S' ? 'checked' : '' }}> Sakit
                                        </label>
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                                            <input type="radio" name="status[{{ $stu->id }}]" value="I" {{ $currStatus == 'I' ? 'checked' : '' }}> Izin
                                        </label>
                                        <label style="cursor: pointer; display: flex; align-items: center; gap: 0.25rem;">
                                            <input type="radio" name="status[{{ $stu->id }}]" value="A" {{ $currStatus == 'A' ? 'checked' : '' }}> Alpa
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <input type="text" name="note[{{ $stu->id }}]" class="form-control" style="padding: 0.35rem 0.6rem; font-size: 0.8rem;" placeholder="Catatan opsional..." value="{{ $rec->note ?? '' }}">
                                </td>
                                <td>
                                    <input type="number" step="0.01" min="0" max="100" name="nilai[{{ $stu->id }}]" class="form-control" style="width: 90px; padding: 0.35rem 0.6rem; font-size: 0.85rem;" placeholder="0-100" value="{{ $rec->daily_score ?? '' }}">
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" style="text-align: center; color: var(--gray); padding: 1.5rem;">
                                    Belum ada siswa terdaftar di kelas ini.
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if($students->isNotEmpty())
                <div style="margin-top: 1.5rem;">
                    <button type="submit" class="btn btn-primary">💾 Simpan Presensi & Nilai Harian</button>
                </div>
            @endif
        </form>
    </div>
@endif
@endsection
