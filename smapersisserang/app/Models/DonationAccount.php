<?php

namespace App\Models;

use App\Enums\DonationPaymentMethod;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DonationAccount extends Model
{
    public const CATEGORY_DONATION = 'donation';

    public const CATEGORY_FINANCE = 'finance';

    public const TYPE_CASH = 'cash';

    public const TYPE_QRIS = 'qris';

    public const TYPE_BANK_TRANSFER = 'bank_transfer';

    public const TYPE_OTHER = 'other';

    protected $fillable = [
        'name',
        'category',
        'type',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function scopeDonation(Builder $query): Builder
    {
        return $query->where('category', self::CATEGORY_DONATION);
    }

    public function scopeFinance(Builder $query): Builder
    {
        return $query->where('category', self::CATEGORY_FINANCE);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function isDonation(): bool
    {
        return $this->category === self::CATEGORY_DONATION;
    }

    public function isFinance(): bool
    {
        return $this->category === self::CATEGORY_FINANCE;
    }

    public function outgoingTransfers(): HasMany
    {
        return $this->hasMany(DonationTransfer::class, 'from_account_id');
    }

    public function incomingTransfers(): HasMany
    {
        return $this->hasMany(DonationTransfer::class, 'to_account_id');
    }

    public function getCategoryLabelAttribute(): string
    {
        return $this->category === self::CATEGORY_DONATION ? 'Donasi' : 'Keuangan';
    }

    /**
     * Label metode pembayaran yang sah untuk FinanceIncome saat akun menjadi
     * tujuan Mutasi Dana (akun kategori Keuangan). Berbasis kolom type, bukan
     * nama string. Akun tanpa type fallback ke 'Lainnya'.
     */
    public function financePaymentMethodLabel(): string
    {
        return self::paymentMethodLabelForType($this->type);
    }

    /**
     * Mapping type akun -> label payment_method untuk FinanceIncome.
     * compatibility: cash -> Tunai, bank_transfer -> Transfer Bank,
     * qris -> QRIS, other -> Lainnya; type null -> Lainnya.
     */
    public static function paymentMethodLabelForType(?string $type): string
    {
        $label = DonationPaymentMethod::labelOf($type);

        return $label === 'Belum Ditentukan' ? 'Lainnya' : $label;
    }
}
