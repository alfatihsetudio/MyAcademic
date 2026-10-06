<div class="mb-4 rounded-2xl border border-white/10 bg-white/10 p-3 shadow-lg backdrop-blur sm:mb-6 sm:p-4">
    <div class="grid grid-cols-6 gap-2">
        @foreach($steps as $number => $step)
            @php
                $isActive = $activeStep === $number;
                $isDone = $step['completed'];
                $isReachable = $number <= max((int) ($app->current_step ?: 1), $activeStep) || $isDone;
                $url = $isReachable ? route('spmb.update-data', ['token' => $app->update_token, 'step' => $number]) : '#';
            @endphp
            <a href="{{ $url }}"
               class="rounded-xl border px-2 py-2 text-center transition {{ $isActive ? 'border-amber-300 bg-amber-300 text-emerald-950 shadow' : ($isDone ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-white/20 bg-white/5 text-white/75') }} {{ $isReachable ? 'hover:bg-white/20' : 'pointer-events-none opacity-60' }}">
                <span class="mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold {{ $isActive ? 'bg-emerald-950 text-amber-200' : ($isDone ? 'bg-emerald-700 text-white' : 'bg-white/15 text-current') }}">
                    @if($isDone)
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                    @else
                        {{ $number }}
                    @endif
                </span>
                <span class="mt-1 hidden text-xs font-semibold leading-tight sm:block">{{ $step['title'] }}</span>
                <span class="mt-1 block text-[10px] font-semibold leading-tight sm:hidden">{{ $number }}</span>
            </a>
        @endforeach
    </div>
    <div class="mt-3 text-center text-xs font-medium text-white/80 sm:hidden">
        Langkah {{ $activeStep }}: {{ $steps[$activeStep]['title'] }}
    </div>
</div>
