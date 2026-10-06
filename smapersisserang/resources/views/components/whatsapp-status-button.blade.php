@props(['application'])

@php
    $rawWhatsapp = $application->parent_whatsapp;
    $cleanWhatsapp = preg_replace('/[^0-9]/', '', $rawWhatsapp ?? '');

    if (str_starts_with($cleanWhatsapp, '0')) {
        $cleanWhatsapp = '62' . substr($cleanWhatsapp, 1);
    }

    $statusUrl = route('ppdb.status.form');

    $message = "Assalamu'alaikum.\n"
        . "Pendaftaran ananda atas nama {$application->student_name} sudah kami terima.\n\n"
        . "Nomor pendaftaran:\n"
        . "{$application->registration_number}\n\n"
        . "Silakan cek status pendaftaran secara berkala melalui:\n"
        . "{$statusUrl}\n\n"
        . "Terima kasih.\n"
        . "Panitia SPMB SMA Persis Serang";

    $waUrl = $cleanWhatsapp ? 'https://wa.me/' . $cleanWhatsapp . '?text=' . urlencode($message) : null;
@endphp

@if($waUrl)
    <a href="{{ $waUrl }}" target="_blank" rel="noopener"
       {{ $attributes->merge(['class' => 'inline-flex items-center justify-center bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors']) }}>
        {{ $slot }}
    </a>
@else
    <span {{ $attributes->merge(['class' => 'inline-flex items-center justify-center bg-gray-100 text-gray-400 cursor-not-allowed']) }}>
        {{ $slot }}
    </span>
@endif
