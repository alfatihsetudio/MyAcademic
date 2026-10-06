<?php

namespace App\Services;

use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class QrisDynamicService
{
    public function removeCrc(string $payload): string
    {
        $cleaned = trim($payload);
        $result = preg_replace('/6304[A-Fa-f0-9]{4}$/', '', $cleaned);
        return $result !== null ? $result : $cleaned;
    }

    public function removeExistingAmount(string $payload): string
    {
        $result = '';
        $len = strlen($payload);
        $i = 0;

        while ($i + 4 <= $len) {
            $tag = substr($payload, $i, 2);
            $valueLen = (int) substr($payload, $i + 2, 2);
            $segmentLen = 4 + $valueLen;

            if ($tag === '54') {
                $i += $segmentLen;
                continue;
            }

            $result .= substr($payload, $i, $segmentLen);
            $i += $segmentLen;
        }

        return $result;
    }

    public function injectAmount(string $payload, int $amount): string
    {
        $amountString = (string) $amount;
        $tag54 = '54' . str_pad((string) strlen($amountString), 2, '0', STR_PAD_LEFT) . $amountString;

        $payloadWithoutAmount = $this->removeExistingAmount($payload);

        $result = preg_replace('/5802ID/', $tag54 . '5802ID', $payloadWithoutAmount, 1);

        if ($result === null || strpos($result, '5802ID') === false) {
            throw new \RuntimeException('Payload QRIS tidak valid.');
        }

        return $result;
    }

    public function crc16(string $payload): string
    {
        $crc = 0xFFFF;
        $polynomial = 0x1021;

        for ($i = 0; $i < strlen($payload); $i++) {
            $crc ^= (ord($payload[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ $polynomial;
                } else {
                    $crc = ($crc << 1);
                }
                $crc &= 0xFFFF;
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    public function generatePayload(string $basePayload, int $amount): string
    {
        if ($amount < 1) {
            throw new \InvalidArgumentException('Amount must be at least 1.');
        }

        $payloadWithoutCrc = $this->removeCrc($basePayload);
        $payloadWithAmount = $this->injectAmount($payloadWithoutCrc, $amount);
        $crc = $this->crc16($payloadWithAmount . '6304');

        return $payloadWithAmount . '6304' . $crc;
    }

    public function generatePngBinary(string $basePayload, int $amount): string
    {
        $finalPayload = $this->generatePayload($basePayload, $amount);

        $qrCode = new QrCode(
            data: $finalPayload,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::Medium,
            size: 500,
            margin: 2,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(0, 0, 0),
            backgroundColor: new Color(255, 255, 255),
        );

        $writer = new PngWriter();
        $result = $writer->write($qrCode);

        return $result->getString();
    }

    public function generateBase64(string $basePayload, int $amount): string
    {
        $pngBinary = $this->generatePngBinary($basePayload, $amount);

        return 'data:image/png;base64,' . base64_encode($pngBinary);
    }
}
