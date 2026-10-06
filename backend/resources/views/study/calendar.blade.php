@extends('layouts.app')

@section('title', 'Kalender Belajar Tahun ' . $year)

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Kalender Tahun {{ $year }}</h1>
        <p class="page-subtitle">Pantau agenda belajar dan hari libur sekolah</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('space-belajar.calendar') }}?year={{ $year - 1 }}" class="btn btn-secondary btn-sm">&larr; {{ $year - 1 }}</a>
        <a href="{{ route('space-belajar.calendar') }}?year={{ date('Y') }}" class="btn btn-secondary btn-sm">Tahun Ini</a>
        <a href="{{ route('space-belajar.calendar') }}?year={{ $year + 1 }}" class="btn btn-secondary btn-sm">{{ $year + 1 }} &rarr;</a>
    </div>
</div>

<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;">
    @php
        $monthNames = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember'
        ];
    @endphp

    @for($m = 1; $m <= 12; $m++)
        @php
            $firstDay = \Carbon\Carbon::create($year, $m, 1);
            $daysInMonth = $firstDay->daysInMonth;
            $startDayOfWeek = $firstDay->dayOfWeekIso; // 1 (Mon) - 7 (Sun)
        @endphp
        <div class="card" style="padding: 1rem; margin-bottom: 0;">
            <h3 style="font-size: 1rem; font-weight: 700; text-align: center; margin-bottom: 0.75rem; color: var(--dark);">
                {{ $monthNames[$m] }}
            </h3>
            
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 0.7rem; font-weight: 600; color: var(--gray); margin-bottom: 0.5rem;">
                <div>Sn</div><div>Sl</div><div>Rb</div><div>Km</div><div>Jm</div><div>Sb</div><div>Mg</div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 0.8rem;">
                @for($blank = 1; $blank < $startDayOfWeek; $blank++)
                    <div style="padding: 6px 0;"></div>
                @endfor

                @for($d = 1; $d <= $daysInMonth; $d++)
                    @php
                        $dateStr = sprintf('%04d-%02d-%02d', $year, $m, $d);
                        $hasEvents = isset($events[$dateStr]);
                        $isToday = $dateStr === date('Y-m-d');
                    @endphp
                    <a href="{{ route('space-belajar.calendar.day') }}?date={{ $dateStr }}" style="
                        padding: 6px 0; 
                        text-decoration: none; 
                        display: block; 
                        border-radius: 4px; 
                        color: {{ $isToday ? '#ffffff' : 'inherit' }};
                        background-color: {{ $isToday ? 'var(--primary)' : ($hasEvents ? '#fef3c7' : 'transparent') }};
                        font-weight: {{ $hasEvents || $isToday ? '700' : 'normal' }};
                        transition: background 0.15s;
                    " onmouseover="this.style.backgroundColor='#e2e8f0'" onmouseout="this.style.backgroundColor='{{ $isToday ? 'var(--primary)' : ($hasEvents ? '#fef3c7' : 'transparent') }}'">
                        {{ $d }}
                    </a>
                @endfor
            </div>
        </div>
    @endfor
</div>
@endsection
