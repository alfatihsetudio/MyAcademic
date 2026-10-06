<?php

namespace App\Services\Letters;

class ArabicTextImageService
{
    private ?string $fontPath;

    public function __construct(?string $fontPath = null)
    {
        $this->fontPath = $fontPath ?: $this->defaultFontPath();
    }

    public function toBase64Uri(string $text, int $fontSize = 18): ?string
    {
        if (!function_exists('imagettfbbox') || !$this->fontPath || !is_file($this->fontPath)) {
            return null;
        }

        $bbox = imagettfbbox($fontSize, 0, $this->fontPath, $text);
        if ($bbox === false) {
            return null;
        }

        $width = (int) (abs($bbox[2] - $bbox[0]) + 20);
        $height = (int) (abs($bbox[7] - $bbox[1]) + 10);

        if ($width < 20) {
            $width = 20;
        }
        if ($height < 10) {
            $height = 10;
        }

        $img = imagecreatetruecolor($width, $height);
        if ($img === false) {
            return null;
        }

        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        $black = imagecolorallocate($img, 0, 0, 0);
        imagefill($img, 0, 0, $transparent);

        $x = 10;
        $y = (int) (abs($bbox[7] - $bbox[1]) + 2);

        imagettftext($img, $fontSize, 0, $x, $y, $black, $this->fontPath, $text);

        ob_start();
        imagepng($img);
        $png = ob_get_clean();
        imagedestroy($img);

        if ($png === false) {
            return null;
        }

        return 'data:image/png;base64,' . base64_encode($png);
    }

    private function defaultFontPath(): ?string
    {
        $paths = [
            __DIR__ . '/../../../vendor/dompdf/dompdf/lib/fonts/DejaVuSans.ttf',
            __DIR__ . '/../../../vendor/dompdf/dompdf/lib/fonts/DejaVuSans-Bold.ttf',
        ];

        foreach ($paths as $path) {
            $realPath = realpath($path);
            if ($realPath && is_file($realPath)) {
                return $realPath;
            }
        }

        return null;
    }
}
