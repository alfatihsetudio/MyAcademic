@extends('layouts.app')

@section('title', $material->judul)

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">{{ $material->judul }}</h1>
        <p class="page-subtitle">
            Mapel: <strong>{{ $material->subject->nama_mapel ?? '-' }}</strong> | 
            Kelas: <strong>{{ $material->subject->academicClass->nama_kelas ?? '-' }}</strong> |
            Oleh: {{ $material->creator->name ?? 'Pengajar' }} • {{ $material->created_at->format('d M Y, H:i') }}
        </p>
    </div>
    <a href="{{ route('materials.index') }}" class="btn btn-secondary">← Kembali ke Daftar Materi</a>
</div>

<div class="card" style="max-width: 840px;">
    @if($material->konten)
        <div style="line-height: 1.8; font-size: 0.95rem; color: #1e293b; margin-bottom: 2rem; white-space: pre-line;">
            {{ $material->konten }}
        </div>
    @endif

    @if($material->video_link)
        <div style="background: var(--light-gray); border: 1px solid var(--border); border-radius: 8px; padding: 1.25rem; margin-bottom: 1.5rem;">
            <h4 style="font-size: 0.95rem; font-weight: 600; margin-bottom: 0.5rem;">🎥 Video Pembelajaran</h4>
            <p style="font-size: 0.85rem; color: var(--gray); margin-bottom: 0.75rem;">Materi ini menyertakan video pendukung online:</p>
            <a href="{{ $material->video_link }}" target="_blank" class="btn btn-primary btn-sm">
                Tonton Video di Tab Baru ↗
            </a>
        </div>
    @endif

    @if($material->file_path)
        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
                <h4 style="font-size: 0.95rem; font-weight: 600; color: #3730a3; margin-bottom: 0.2rem;">📁 Berkas Lampiran</h4>
                <div style="font-size: 0.8rem; color: #4f46e5;">Dokumen / Modul pendukung</div>
            </div>
            <a href="{{ asset('storage/' . $material->file_path) }}" target="_blank" download class="btn btn-primary btn-sm">
                ⬇ Unduh Berkas
            </a>
        </div>
    @endif
</div>
@endsection
