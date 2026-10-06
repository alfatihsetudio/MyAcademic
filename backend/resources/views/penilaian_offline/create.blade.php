@extends('layouts.app')

@section('title', 'Buat Tugas Offline')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Buat Tugas Offline Baru</h1>
        <p class="page-subtitle">Siapkan lembar penilaian untuk kegiatan tatap muka di kelas</p>
    </div>
    <a href="{{ route('offline-assessment.index') }}" class="btn btn-secondary">← Kembali ke Penilaian Offline</a>
</div>

<div class="card" style="max-width: 680px;">
    <form action="{{ route('offline-assessment.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="class_id" class="form-label">Kelas Sasaran *</label>
                <select id="class_id" name="class_id" class="form-control" required>
                    <option value="">-- Pilih Kelas --</option>
                    @foreach($classes as $c)
                        <option value="{{ $c->id }}" {{ old('class_id') == $c->id ? 'selected' : '' }}>
                            {{ $c->nama_kelas }} (Level {{ $c->level }})
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="form-group">
                <label for="subject_id" class="form-label">Mata Pelajaran *</label>
                <select id="subject_id" name="subject_id" class="form-control" required>
                    <option value="">-- Pilih Mapel --</option>
                    @foreach($subjects as $s)
                        <option value="{{ $s->id }}" {{ old('subject_id') == $s->id ? 'selected' : '' }}>
                            {{ $s->nama_mapel }}
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="title" class="form-label">Judul Tugas / Praktik *</label>
            <input type="text" id="title" name="title" class="form-control" placeholder="Contoh: Setoran Hafalan Surat Al-Mulk, Ujian Lisan" value="{{ old('title') }}" required>
        </div>

        <div class="form-group">
            <label for="description" class="form-label">Deskripsi Singkat</label>
            <textarea id="description" name="description" class="form-control" rows="3" placeholder="Keterangan singkat kegiatan...">{{ old('description') }}</textarea>
        </div>

        <div class="form-group">
            <label for="content" class="form-label">Materi / Rubrik Penilaian Detail</label>
            <textarea id="content" name="content" class="form-control" rows="4" placeholder="Kriteria penilaian (kelancaran, tajwid, adab, dll)...">{{ old('content') }}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="video_url" class="form-label">Tautan Video Terkait (Opsional)</label>
                <input type="url" id="video_url" name="video_url" class="form-control" placeholder="https://..." value="{{ old('video_url') }}">
            </div>
            <div class="form-group">
                <label for="photo" class="form-label">Foto Contoh / Soal (Opsional)</label>
                <input type="file" id="photo" name="photo" class="form-control" accept="image/*">
            </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Simpan Tugas Offline</button>
            <a href="{{ route('offline-assessment.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
