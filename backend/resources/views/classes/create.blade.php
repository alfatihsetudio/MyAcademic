@extends('layouts.app')

@section('title', 'Tambah Kelas')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Kelas Baru</h1>
        <p class="page-subtitle">Buat rombongan belajar baru beserta wali kelasnya</p>
    </div>
    <a href="{{ route('classes.index') }}" class="btn btn-secondary">← Kembali ke Daftar Kelas</a>
</div>

<div class="card" style="max-width: 680px;">
    <form action="{{ route('classes.store') }}" method="POST">
        @csrf
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="jenjang" class="form-label">Jenjang / Level *</label>
                <input type="text" id="jenjang" name="jenjang" class="form-control" placeholder="Contoh: 10, 11, 12, VII" value="{{ old('jenjang') }}" required>
            </div>
            <div class="form-group">
                <label for="jurusan" class="form-label">Jurusan / Nama Rombel *</label>
                <input type="text" id="jurusan" name="jurusan" class="form-control" placeholder="Contoh: RPL, IPA 1, Tahfidz" value="{{ old('jurusan') }}" required>
            </div>
        </div>

        <div class="form-group">
            <label for="guru_id" class="form-label">Guru Wali Kelas *</label>
            <select id="guru_id" name="guru_id" class="form-control" required>
                <option value="">-- Pilih Guru Wali Kelas --</option>
                @foreach($gurus as $g)
                    <option value="{{ $g->id }}" {{ old('guru_id') == $g->id ? 'selected' : '' }}>
                        {{ $g->name }} ({{ $g->email }})
                    </option>
                @endforeach
            </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="walimurid" class="form-label">Nama Wali Murid (Koordinator)</label>
                <input type="text" id="walimurid" name="walimurid" class="form-control" value="{{ old('walimurid') }}">
            </div>
            <div class="form-group">
                <label for="no_telpon_wali" class="form-label">No. Telepon Wali</label>
                <input type="text" id="no_telpon_wali" name="no_telpon_wali" class="form-control" value="{{ old('no_telpon_wali') }}">
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
                <label for="nama_km" class="form-label">Nama Ketua Murid (KM)</label>
                <input type="text" id="nama_km" name="nama_km" class="form-control" value="{{ old('nama_km') }}">
            </div>
            <div class="form-group">
                <label for="no_telpon_km" class="form-label">No. Telepon KM</label>
                <input type="text" id="no_telpon_km" name="no_telpon_km" class="form-control" value="{{ old('no_telpon_km') }}">
            </div>
        </div>

        <div class="form-group">
            <label for="deskripsi" class="form-label">Deskripsi / Catatan Tambahan</label>
            <textarea id="deskripsi" name="deskripsi" class="form-control" rows="3">{{ old('deskripsi') }}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Simpan Kelas</button>
            <a href="{{ route('classes.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>
@endsection
