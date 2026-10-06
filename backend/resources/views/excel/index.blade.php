@extends('layouts.app')

@section('title', 'Dokumen Tabel Guru')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Dokumen "Excel" Guru</h1>
        <p class="page-subtitle">Kelola lembar kerja dan template tabel kustom</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('excel.templates') }}" class="btn btn-secondary">📑 Lihat Template Kosong</a>
        <a href="{{ route('excel.create-template') }}" class="btn btn-primary">➕ Buat Template Baru</a>
    </div>
</div>

<div class="card">
    <h3 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 1rem;">Dokumen yang Sedang Dikerjakan</h3>
    
    <div class="table-responsive">
        <table class="data-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nama Dokumen</th>
                    <th>Template Asal</th>
                    <th>Terakhir Diperbarui</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                @forelse($documents as $i => $d)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td><strong>{{ $d->name }}</strong></td>
                        <td>{{ $d->template->name ?? 'Custom' }}</td>
                        <td>{{ $d->updated_at->format('d M Y, H:i') }}</td>
                        <td>
                            <a href="{{ route('excel.edit-document', $d->id) }}" class="btn btn-primary btn-sm">
                                📝 Buka Lembar Kerja
                            </a>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--gray); padding: 2rem;">
                            Belum ada dokumen yang dibuat. Pilih template dari daftar untuk mulai bekerja.
                        </td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>
@endsection
