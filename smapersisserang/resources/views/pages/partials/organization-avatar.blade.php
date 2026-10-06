@php
    $displayName = trim($name ?? '');
    $initial = $displayName !== '' ? \Illuminate\Support\Str::upper(\Illuminate\Support\Str::substr($displayName, 0, 1)) : 'P';
    $isDark = ($tone ?? 'light') === 'dark';
    $placeholderClass = $isDark
        ? 'bg-amber-300/20 text-amber-200 ring-amber-300/40'
        : 'bg-emerald-100 text-[#0F6B3A] ring-emerald-200';
    $imageRingClass = $isDark ? 'ring-amber-300/60' : 'ring-emerald-200';
@endphp

@if($photoUrl ?? null)
    <img src="{{ $photoUrl }}"
         alt="{{ $displayName ?: 'Foto struktur organisasi' }}"
         class="mx-auto mb-3 h-16 w-16 rounded-full object-cover ring-2 {{ $imageRingClass }}">
@else
    <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ring-2 {{ $placeholderClass }}">
        <span class="text-xl font-bold">{{ $initial }}</span>
    </div>
@endif
