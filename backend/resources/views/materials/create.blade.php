@extends('layouts.app')

@section('title', 'Kirim Materi Baru')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Bagikan Materi Pembelajaran</h1>
        <p class="page-subtitle">Unggah materi baru untuk siswa di kelas terkait</p>
    </div>
    <a href="{{ route('materials.index') }}" class="btn btn-secondary">← Kembali ke Daftar Materi</a>
</div>

<div class="card" style="max-width: 720px;">
    <form action="{{ route('materials.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        
        <div class="form-group">
            <label for="subject_id" class="form-label">Mata Pelajaran & Kelas *</label>
            <select id="subject_id" name="subject_id" class="form-control" required>
                <option value="">-- Pilih Mata Pelajaran --</option>
                @foreach($subjects as $s)
                    <option value="{{ $s->id }}" {{ old('subject_id') == $s->id ? 'selected' : '' }}>
                        {{ $s->nama_mapel }} — Kelas {{ $s->academicClass->nama_kelas ?? 'Umum' }}
                    </option>
                @endforeach
            </select>
        </div>

        <div class="form-group">
            <label for="judul" class="form-label">Judul Materi *</label>
            <input type="text" id="judul" name="judul" class="form-control" placeholder="Contoh: Pengantar Ilmu Shorof Bab 1" value="{{ old('judul') }}" required>
        </div>

        <div class="form-group">
            <label for="konten" class="form-label">Isi / Rangkuman Materi Teks</label>
            <textarea id="konten" name="konten" class="form-control" rows="6" placeholder="Tuliskan materi pembelajaran atau ringkasan materi di sini...">{{ old('konten') }}</textarea>
        </div>

        <div class="form-group">
            <label for="video_link" class="form-label">Tautan Video Pembelajaran (YouTube / Google Drive)</label>
            <input type="url" id="video_link" name="video_link" class="form-control" placeholder="https://www.youtube.com/watch?v=..." value="{{ old('video_link') }}">
        </div>

        <div class="form-group">
            <label for="file" class="form-label">Lampiran Berkas / PDF / Slide (Maks 30MB)</label>
            <input type="file" id="file" name="file" class="form-control">
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Bagikan Materi</button>
            <a href="{{ route('materials.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
