@extends('layouts.app')

@section('title', 'Edit Kelas')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Edit Kelas: {{ $class->nama_kelas }}</h1>
        <p class="page-subtitle">Perbarui data rombongan belajar</p>
    </div>
    <a href="{{ route('classes.index') }}" class="btn btn-secondary">← Kembali ke Daftar Kelas</a>
</div>

<div class="card" style="max-width: 680px;">
    <form action="{{ route('classes.update', $class->id) }}" method="POST">
        @csrf
        @method('PUT')
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="jenjang" class="form-label">Jenjang / Level *</label>
                <input type="text" id="jenjang" name="jenjang" class="form-control" value="{{ old('jenjang', $class->level) }}" required>
            </div>
            <div class="form-group">
                <label for="jurusan" class="form-label">Jurusan / Nama Rombel *</label>
                <input type="text" id="jurusan" name="jurusan" class="form-control" value="{{ old('jurusan', $class->jurusan) }}" required>
            </div>
        </div>

        <div class="form-group">
            <label for="guru_id" class="form-label">Guru Wali Kelas *</label>
            <select id="guru_id" name="guru_id" class="form-control" required>
                <option value="">-- Pilih Guru Wali Kelas --</option>
                @foreach($gurus as $g)
                    <option value="{{ $g->id }}" {{ old('guru_id', $class->guru_id) == $g->id ? 'selected' : '' }}>
                        {{ $g->name }} ({{ $g->email }})
                    </option>
                @endforeach
            </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="walimurid" class="form-label">Nama Wali Murid (Koordinator)</label>
                <input type="text" id="walimurid" name="walimurid" class="form-control" value="{{ old('walimurid', $class->walimurid) }}">
            </div>
            <div class="form-group">
                <label for="no_telpon_wali" class="form-label">No. Telepon Wali</label>
                <input type="text" id="no_telpon_wali" name="no_telpon_wali" class="form-control" value="{{ old('no_telpon_wali', $class->no_telpon_wali) }}">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="nama_km" class="form-label">Nama Ketua Murid (KM)</label>
                <input type="text" id="nama_km" name="nama_km" class="form-control" value="{{ old('nama_km', $class->nama_km) }}">
            </div>
            <div class="form-group">
                <label for="no_telpon_km" class="form-label">No. Telepon KM</label>
                <input type="text" id="no_telpon_km" name="no_telpon_km" class="form-control" value="{{ old('no_telpon_km', $class->no_telpon_km) }}">
            </div>
        </div>

        <div class="form-group">
            <label for="deskripsi" class="form-label">Deskripsi / Catatan Tambahan</label>
            <textarea id="deskripsi" name="deskripsi" class="form-control" rows="3">{{ old('deskripsi', $class->deskripsi) }}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Simpan Perubahan</button>
            <a href="{{ route('classes.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
