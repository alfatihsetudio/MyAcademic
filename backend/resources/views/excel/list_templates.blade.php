@extends('layouts.app')

@section('title', 'Template Tabel Kosong')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Pilih Template Tabel Kosong</h1>
        <p class="page-subtitle">Gunakan template yang sudah dirancang untuk membuat dokumen baru</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('excel.index') }}" class="btn btn-secondary">← Kembali ke Dokumen</a>
        <a href="{{ route('excel.create-template') }}" class="btn btn-primary">➕ Buat Template Baru</a>
    </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
    @forelse($templates as $tpl)
        <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h3 style="font-size: 1.1rem; font-weight: 600; color: var(--dark);">{{ $tpl->name }}</h3>
                    <span class="user-badge badge-guru">Template</span>
                </div>
                <p style="font-size: 0.85rem; color: var(--gray); line-height: 1.5; margin-bottom: 1.25rem;">
                    {{ $tpl->description ?: 'Tidak ada deskripsi khusus untuk template ini.' }}
                </p>
            </div>
            
            <a href="{{ route('excel.use-template', $tpl->id) }}" class="btn btn-primary" style="width: 100%;">
                📄 Gunakan Template Ini
            </a>
        </div>
    @empty
        <div class="card" style="grid-column: 1 / -1; text-align: center; color: var(--gray); padding: 3rem;">
            Belum ada template tabel. Klik tombol di atas untuk membuat template pertama Anda.
        </div>
    @endforelse
</div>
@endsection
