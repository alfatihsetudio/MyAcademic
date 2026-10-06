<?php

namespace App\Services\Storage;

use Illuminate\Support\Facades\Storage;

class R2PresignedUrlService
{
    /**
     * Generate a presigned URL for direct upload to R2.
     *
     * @param string $path
     * @param int $expirationMinutes
     * @return string
     */
    public function generateUploadUrl(string $path, int $expirationMinutes = 20): string
    {
        $client = Storage::disk('r2')->getClient();
        $command = $client->getCommand('PutObject', [
            'Bucket' => config('filesystems.disks.r2.bucket'),
            'Key' => $path,
        ]);

        $request = $client->createPresignedRequest($command, "+{$expirationMinutes} minutes");

        return (string) $request->getUri();
    }
}
