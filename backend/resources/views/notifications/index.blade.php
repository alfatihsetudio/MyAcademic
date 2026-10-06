@extends('layouts.app')

@section('title', 'Pemberitahuan & Notifikasi')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Pemberitahuan</h1>
        <p class="page-subtitle">Pembaruan tugas, materi baru, dan catatan nilai</p>
    </div>
</div>

<div class="card" style="max-width: 800px;">
    @forelse($notifications as $n)
        <div style="padding: 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; background-color: {{ $n->is_read ? 'transparent' : '#f0fdf4' }};">
            <div>
                <div style="font-weight: 600; color: var(--dark); font-size: 0.95rem;">
                    @if(!$n->is_read)
                        <span style="display: inline-block; width: 8px; height: 8px; background-color: var(--primary); border-radius: 9999px; margin-right: 0.25rem;"></span>
                    @endif
                    {{ $n->title }}
                </div>
                <p style="font-size: 0.85rem; color: #475569; margin: 0.35rem 0;">{{ $n->message }}</p>
                <div style="font-size: 0.75rem; color: var(--gray);">
                    {{ $n->created_at->diffForHumans() }}
                </div>
            </div>
            <div>
                @if($n->link)
                    <a href="{{ route('notifications.read', $n->id) }}" class="btn btn-secondary btn-sm" style="font-size: 0.8rem; white-space: nowrap;">
                        Buka &rarr;
                    </a>
                @elseif(!$n->is_read)
                    <a href="{{ route('notifications.read', $n->id) }}" class="btn btn-secondary btn-sm" style="font-size: 0.8rem;">
                        Tandai Dibaca
                    </a>
                @endif
            </div>
        </div>
    @empty
        <div style="text-align: center; color: var(--gray); padding: 3rem;">
            Tidak ada notifikasi baru saat ini.
        </div>
    @endforelse
</div>
@endsection
