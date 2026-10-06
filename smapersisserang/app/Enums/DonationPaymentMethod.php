<?php

namespace App\Enums;

use Illuminate\Support\Collection;

enum DonationPaymentMethod: string
{
    case Cash = 'cash';
    case BankTransfer = 'bank_transfer';
    case Qris = 'qris';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Tunai',
            self::BankTransfer => 'Transfer Bank',
            self::Qris => 'QRIS',
            self::Other => 'Lainnya',
        };
    }

    /**
     * Peta internal value => label tampilan. Sumber tunggal untuk seluruh
     * controller, model, service, validation, view, dan test.
     */
    public static function labels(): array
    {
        return [
            self::Cash->value => self::Cash->label(),
            self::BankTransfer->value => self::BankTransfer->label(),
            self::Qris->value => self::Qris->label(),
            self::Other->value => self::Other->label(),
        ];
    }

    /**
     * Daftar nilai internal yang valid.
     */
    public static function values(): array
    {
        return array_keys(self::labels());
    }

    public static function fromValue(?string $value): ?self
    {
        foreach (self::cases() as $case) {
            if ($case->value === $value) {
                return $case;
            }
        }

        return null;
    }

    public static function labelOf(?string $value): string
    {
        if ($value === null) {
            return 'Belum Ditentukan';
        }

        $case = self::fromValue($value);

        return $case?->label() ?? 'Belum Ditentukan';
    }

    public static function selectOptions(): array
    {
        return [
            '' => '-- Pilih --',
            ...self::labels(),
        ];
    }
}
