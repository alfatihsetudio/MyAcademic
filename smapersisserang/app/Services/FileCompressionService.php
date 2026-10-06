<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class FileCompressionService
{
    private string $storageDisk = 'public';
    private string $storagePath = 'spmb-requirements';

    private int $maxImageWidth = 1600;
    private int $maxImageHeight = 1600;
    private int $imageQuality = 78;

    private int $photoMaxWidth = 1200;
    private int $photoMaxHeight = 1200;
    private int $photoQuality = 85;

    public function storeRequirementFile(UploadedFile $file, string $requirementKey): array
    {
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $originalSize = $file->getSize();
        $extension = strtolower($file->getClientOriginalExtension());

        $filename = $requirementKey . '_' . time() . '_' . uniqid();

        $isImage = in_array($extension, ['jpg', 'jpeg', 'png']);
        $isPdf = $extension === 'pdf';

        if (!$isImage && !$isPdf) {
            throw new \RuntimeException('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
        }

        $compressionStatus = null;
        $compressedSize = null;

        if ($isImage) {
            $imageResult = $this->compressImage($file, $filename, $requirementKey);
            $filePath = $imageResult['path'];
            $compressionStatus = $imageResult['status'];
            $compressedSize = $imageResult['size'];
        } else {
            $filePath = $file->storeAs($this->storagePath, $filename . '.pdf', $this->storageDisk);
            if (!$filePath) {
                throw new \RuntimeException('Gagal menyimpan file.');
            }
            $compressionStatus = 'skipped_pdf';
            $compressedSize = $originalSize;
        }

        return [
            'file_path' => $filePath,
            'original_filename' => $originalName,
            'mime_type' => $mimeType,
            'file_size_original' => $originalSize,
            'file_size_compressed' => $compressedSize,
            'compression_status' => $compressionStatus,
        ];
    }

    private function compressImage(UploadedFile $file, string $filename, string $requirementKey): array
    {
        $isPhoto = $requirementKey === 'red_background_photo';
        $maxW = $isPhoto ? $this->photoMaxWidth : $this->maxImageWidth;
        $maxH = $isPhoto ? $this->photoMaxHeight : $this->maxImageHeight;
        $quality = $isPhoto ? $this->photoQuality : $this->imageQuality;

        try {
            $srcPath = $file->getRealPath();
            if (!$srcPath) {
                throw new \RuntimeException('Cannot read uploaded file');
            }

            $imageInfo = @getimagesize($srcPath);
            if (!$imageInfo) {
                throw new \RuntimeException('Invalid image file');
            }

            [$origW, $origH] = $imageInfo;
            $srcImage = $this->createImageFromFile($srcPath, $imageInfo[2]);
            if (!$srcImage) {
                throw new \RuntimeException('Cannot decode image');
            }

            if ($origW <= $maxW && $origH <= $maxH && $file->getSize() < 500 * 1024) {
                $targetPath = $this->storagePath . '/' . $filename . '.jpg';
                $fullPath = Storage::disk($this->storageDisk)->path($targetPath);
                $dir = dirname($fullPath);
                if (!is_dir($dir)) {
                    mkdir($dir, 0755, true);
                }
                imagejpeg($srcImage, $fullPath, $quality);
                imagedestroy($srcImage);
                $compressedSize = filesize($fullPath);

                return [
                    'path' => $targetPath,
                    'status' => 'skipped_small_file',
                    'size' => $compressedSize,
                ];
            }

            $ratio = min($maxW / $origW, $maxH / $origH, 1);
            $newW = (int) round($origW * $ratio);
            $newH = (int) round($origH * $ratio);

            $dstImage = imagecreatetruecolor($newW, $newH);
            if (!$dstImage) {
                throw new \RuntimeException('Cannot create destination image');
            }

            imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
            imagedestroy($srcImage);

            $targetPath = $this->storagePath . '/' . $filename . '.jpg';
            $fullPath = Storage::disk($this->storageDisk)->path($targetPath);
            $dir = dirname($fullPath);
            if (!is_dir($dir)) {
                mkdir($dir, 0755, true);
            }
            imagejpeg($dstImage, $fullPath, $quality);
            imagedestroy($dstImage);

            $compressedSize = filesize($fullPath);

            $status = 'compressed';
            if ($compressedSize >= $file->getSize()) {
                $status = 'skipped_small_file';
            }

            return [
                'path' => $targetPath,
                'status' => $status,
                'size' => $compressedSize,
            ];
        } catch (\Exception $e) {
            Log::warning('Image compression failed: ' . $e->getMessage());

            $fallbackPath = $file->storeAs($this->storagePath, $filename . '.' . $file->getClientOriginalExtension(), $this->storageDisk);
            if (!$fallbackPath) {
                throw new \RuntimeException('Gagal menyimpan file.');
            }

            return [
                'path' => $fallbackPath,
                'status' => 'failed_saved_original',
                'size' => $file->getSize(),
            ];
        }
    }

    private function createImageFromFile(string $path, int $type)
    {
        return match ($type) {
            IMAGETYPE_JPEG => @imagecreatefromjpeg($path),
            IMAGETYPE_PNG => @imagecreatefrompng($path),
            IMAGETYPE_GIF => @imagecreatefromgif($path),
            IMAGETYPE_WEBP => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
            default => null,
        };
    }
}
