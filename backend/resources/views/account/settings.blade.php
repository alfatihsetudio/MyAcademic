@extends('layouts.app')

@section('title', 'Pengaturan Akun')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">⚙️ Pengaturan Akun</h1>
        <p class="page-subtitle">Perbarui profil, alamat email, atau kata sandi Anda</p>
    </div>
</div>

<div class="card" style="max-width: 620px;">
    <form action="{{ route('account.update') }}" method="POST">
        @csrf
        
        <div class="form-group">
            <label for="name" class="form-label">Nama Lengkap *</label>
            <input type="text" id="name" name="name" class="form-control" value="{{ old('name', $user->name) }}" required>
        </div>

        <div class="form-group">
            <label for="email" class="form-label">Alamat Email *</label>
            <input type="email" id="email" name="email" class="form-control" value="{{ old('email', $user->email) }}" required>
        </div>

        <div style="margin: 1.5rem 0 1rem; border-top: 1px dashed var(--border); padding-top: 1.25rem;">
            <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.25rem;">Ganti Password (Opsional)</h3>
            <p style="font-size: 0.8rem; color: var(--gray); margin-bottom: 1rem;">Biarkan kosong jika tidak ingin mengubah kata sandi.</p>

            <div class="form-group">
                <label for="new_password" class="form-label">Password Baru</label>
                <input type="password" id="new_password" name="new_password" class="form-control" placeholder="Minimal 6 karakter">
            </div>

            <div class="form-group">
                <label for="new_password_confirmation" class="form-label">Konfirmasi Password Baru</label>
                <input type="password" id="new_password_confirmation" name="new_password_confirmation" class="form-control" placeholder="Ulangi password baru">
            </div>
        </div>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem;">
            <label for="current_password" class="form-label" style="color: #991b1b;">
                Konfirmasi Password Saat Ini *
            </label>
            <p style="font-size: 0.75rem; color: #b91c1c; margin-bottom: 0.5rem;">
                Masukkan password Anda saat ini untuk mengonfirmasi perubahan data.
            </p>
            <input type="password" id="current_password" name="current_password" class="form-control" placeholder="Password saat ini" required>
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%;">
            💾 Simpan Perubahan Akun
        </button>
    </form>
</div>
@endsection
