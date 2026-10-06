@extends('layouts.app')

@section('title', 'Tambah Mata Pelajaran')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Mata Pelajaran</h1>
        <p class="page-subtitle">Tetapkan mapel ke kelas dan guru pengajar</p>
    </div>
    <a href="{{ route('subjects.index') }}" class="btn btn-secondary">← Kembali ke Daftar Mapel</a>
</div>

<div class="card" style="max-width: 600px;">
    <form action="{{ route('subjects.store') }}" method="POST">
        @csrf
        
        <div class="form-group">
            <label for="class_id" class="form-label">Pilih Kelas *</label>
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
            <label for="nama_mapel" class="form-label">Nama Mata Pelajaran *</label>
            <input type="text" id="nama_mapel" name="nama_mapel" class="form-control" placeholder="Contoh: Bahasa Arab, Fiqih, Matematika" value="{{ old('nama_mapel') }}" required>
        </div>

        @if(auth()->user()->isAdmin())
            <div class="form-group">
                <label for="guru_id" class="form-label">Guru Pengajar *</label>
                <select id="guru_id" name="guru_id" class="form-control" required>
                    <option value="">-- Pilih Guru Pengajar --</option>
                    @foreach($gurus as $g)
                        <option value="{{ $g->id }}" {{ old('guru_id') == $g->id ? 'selected' : '' }}>
                            {{ $g->name }} ({{ $g->email }})
                        </option>
                    @endforeach
                </select>
            </div>
        @endif

        <div class="form-group">
            <label for="deskripsi" class="form-label">Deskripsi / Silabus Singkat</label>
            <textarea id="deskripsi" name="deskripsi" class="form-control" rows="3">{{ old('deskripsi') }}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Simpan Mata Pelajaran</button>
            <a href="{{ route('subjects.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
