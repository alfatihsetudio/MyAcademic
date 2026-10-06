<?php

namespace App\Services\Letters;

use App\Models\SchoolSetting;
use Illuminate\Support\Facades\Storage;

class ArabicPdfTextService
{
    private ?SchoolSetting $schoolSetting;

    public function __construct(?SchoolSetting $schoolSetting = null)
    {
        $this->schoolSetting = $schoolSetting ?? SchoolSetting::current();
    }

    public function renderBasmallah(?string $text): string
    {
        return $this->renderAsStaticImage('basmallah-image', $text);
    }

    public function renderClosingDua(?string $text): string
    {
        return $this->renderAsStaticImage('closing-dua-image', $text);
    }

    private function renderAsStaticImage(string $class = '', ?string $text = null): string
    {
        $src = $this->resolveImageSrc($class);

        if ($src === null) {
            $text = trim((string) $text);
            if ($text === '') {
                return '';
            }

            $fontSize = strpos($class, 'closing-dua') !== false ? 15 : 18;
            $src = app(ArabicTextImageService::class)->toBase64Uri($text, $fontSize);
            if ($src === null) {
                return '';
            }
        }

        $classAttr = $class ? " class=\"{$class}\"" : '';
        $img = "<img{$classAttr} src=\"{$src}\" alt=\"\">";
        return '<table class="arabic-center-table" width="100%"><tr><td align="center">'
            . $img
            . '</td></tr></table>';
    }

    private function resolveImageSrc(string $class): ?string
    {
        $isClosingDua = strpos($class, 'closing-dua') !== false;

        $storagePath = $isClosingDua
            ? $this->schoolSetting?->closing_dua_image_path
            : $this->schoolSetting?->basmallah_image_path;

        if ($storagePath && Storage::disk('public')->exists($storagePath)) {
            $imageData = Storage::disk('public')->get($storagePath);
            if ($imageData !== false) {
                $mime = Storage::disk('public')->mimeType($storagePath) ?: 'image/png';
                return 'data:' . $mime . ';base64,' . base64_encode($imageData);
            }
        }

        $assetPath = $isClosingDua
            ? public_path('images/letters/closing-dua.png')
            : public_path('images/letters/basmallah.png');

        if ($assetPath && file_exists($assetPath)) {
            $imageData = @file_get_contents($assetPath);
            if ($imageData !== false) {
                return 'data:image/png;base64,' . base64_encode($imageData);
            }
        }

        return null;
    }
}
