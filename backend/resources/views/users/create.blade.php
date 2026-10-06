@extends('layouts.app')

@section('title', 'Tambah Pengguna Baru')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Tambah Pengguna Baru</h1>
        <p class="page-subtitle">Daftarkan akun Admin, Guru, atau Murid baru</p>
    </div>
    <a href="{{ route('users.index') }}" class="btn btn-secondary">← Kembali ke Daftar Pengguna</a>
</div>

<div class="card" style="max-width: 600px;">
    <form action="{{ route('users.store') }}" method="POST">
        @csrf
        
        <div class="form-group">
            <label for="name" class="form-label">Nama Lengkap *</label>
            <input type="text" id="name" name="name" class="form-control" placeholder="Contoh: Muhammad Fatih" value="{{ old('name') }}" required>
        </div>

        <div class="form-group">
            <label for="email" class="form-label">Alamat Email *</label>
            <input type="email" id="email" name="email" class="form-control" placeholder="user@gmail.com" value="{{ old('email') }}" required>
        </div>

        <div class="form-group">
            <label for="role" class="form-label">Role Akun *</label>
            <select id="role" name="role" class="form-control" required onchange="toggleStudentFields(this.value)">
                <option value="murid" {{ old('role') === 'murid' ? 'selected' : '' }}>Murid / Siswa</option>
                <option value="guru" {{ old('role') === 'guru' ? 'selected' : '' }}>Guru / Pengajar</option>
                <option value="admin" {{ old('role') === 'admin' ? 'selected' : '' }}>Administrator Sekolah</option>
            </select>
        </div>

        <!-- Student-specific fields -->
        <div id="student-fields">
            <div class="form-group">
                <label for="class_id" class="form-label">Penempatan Kelas (Khusus Siswa)</label>
                <select id="class_id" name="class_id" class="form-control">
                    <option value="">-- Pilih Kelas --</option>
                    @foreach($classes as $c)
                        <option value="{{ $c->id }}" {{ old('class_id') == $c->id ? 'selected' : '' }}>
                            {{ $c->nama_kelas }} (Level {{ $c->level }})
                        </option>
                    @endforeach
                </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="jenjang" class="form-label">Jenjang</label>
                    <input type="text" id="jenjang" name="jenjang" class="form-control" placeholder="10, 11, 12" value="{{ old('jenjang') }}">
                </div>
                <div class="form-group">
                    <label for="jurusan" class="form-label">Jurusan</label>
                    <input type="text" id="jurusan" name="jurusan" class="form-control" placeholder="RPL, IPA, dll" value="{{ old('jurusan') }}">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label for="password" class="form-label">Password (Kosongkan untuk generate acak otomatis)</label>
            <input type="text" id="password" name="password" class="form-control" placeholder="Password acak (opsional)">
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="submit" class="btn btn-primary">Simpan Pengguna</button>
            <a href="{{ route('users.index') }}" class="btn btn-secondary">Batal</a>
        </div>
    </form>
</div>

<script>
    function toggleStudentFields(role) {
        const studentFields = document.getElementById('student-fields');
        if (role === 'murid') {
            studentFields.style.display = 'block';
        } else {
            studentFields.style.display = 'none';
        }
    }
    // init
    toggleStudentFields(document.getElementById('role').value);
</script>
@endsection
