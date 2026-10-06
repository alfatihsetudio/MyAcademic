@extends('layouts.app')

@section('title', 'Buat Tugas Baru')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Buat Tugas Baru</h1>
        <p class="page-subtitle">Berikan penugasan kepada siswa di kelas tertentu</p>
    </div>
    <a href="{{ route('assignments.index') }}" class="btn btn-secondary">← Kembali ke Daftar Tugas</a>
</div>

<div class="card" style="max-width: 720px;">
    <form action="{{ route('assignments.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="subject_id" class="form-label">Mata Pelajaran *</label>
                <select id="subject_id" name="subject_id" class="form-control" required>
                    <option value="">-- Pilih Mapel --</option>
                    @foreach($subjects as $s)
                        <option value="{{ $s->id }}" {{ old('subject_id') == $s->id ? 'selected' : '' }}>
                            {{ $s->nama_mapel }} ({{ $s->academicClass->nama_kelas ?? 'Semua' }})
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="form-group">
                <label for="target_class_id" class="form-label">Kelas Sasaran *</label>
                <select id="target_class_id" name="target_class_id" class="form-control" required>
                    <option value="">-- Pilih Kelas --</option>
                    @foreach($classes as $c)
                        <option value="{{ $c->id }}" {{ old('target_class_id') == $c->id ? 'selected' : '' }}>
                            {{ $c->nama_kelas }} (Level {{ $c->level }})
                        </option>
                    @endforeach
                </select>
            </div>
        </div>

        <div class="form-group">
            <label for="judul" class="form-label">Judul Tugas *</label>
            <input type="text" id="judul" name="judul" class="form-control" placeholder="Contoh: Latihan Nahwu Bab 1, Soal Pilihan Ganda" value="{{ old('judul') }}" required>
        </div>

        <div class="form-group">
            <label for="deskripsi" class="form-label">Petunjuk & Deskripsi Pengerjaan</label>
            <textarea id="deskripsi" name="deskripsi" class="form-control" rows="5" placeholder="Tuliskan petunjuk pengerjaan tugas di sini...">{{ old('deskripsi') }}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="deadline" class="form-label">Batas Waktu (Deadline)</label>
                <input type="datetime-local" id="deadline" name="deadline" class="form-control" value="{{ old('deadline') }}">
            </div>
            <div class="form-group">
                <label for="video_link" class="form-label">Link Video Pendukung (Opsional)</label>
                <input type="url" id="video_link" name="video_link" class="form-control" placeholder="https://youtube.com/..." value="{{ old('video_link') }}">
            </div>
        </div>

        <div class="form-group">
            <label for="file" class="form-label">Lampiran Soal / Dokumen (Opsional, PDF/DOC/Gambar maks 20MB)</label>
            <input type="file" id="file" name="file" class="form-control">
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Publikasikan Tugas</button>
            <a href="{{ route('assignments.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
