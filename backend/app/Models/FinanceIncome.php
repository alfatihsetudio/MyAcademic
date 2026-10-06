<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceIncome extends Model
{
    protected $fillable = [
        'donation_outflow_id',
        'donation_transfer_id',
        'finance_account_id',
        'date',
        'income_type',
        'amount',
        'payment_method',
        'source_name',
        'description',
        'proof_file',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'amount' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function donationOutflow(): BelongsTo
    {
        return $this->belongsTo(DonationOutflow::class);
    }

    public function donationTransfer(): BelongsTo
    {
        return $this->belongsTo(DonationTransfer::class);
    }

    /**
     * Akun Keuangan (donation_accounts.category = finance) tempat uang
     * diterima. NULL untuk data lama yang dicatat sebelum konsep akun ini.
     */
    public function financeAccount(): BelongsTo
    {
        return $this->belongsTo(DonationAccount::class, 'finance_account_id');
    }

    public function isFromDonationOutflow(): bool
    {
        return $this->donation_outflow_id !== null;
    }

    public function isFromDonationTransfer(): bool
    {
        return $this->donation_transfer_id !== null;
    }

    public function isIntegrated(): bool
    {
        return $this->isFromDonationOutflow() || $this->isFromDonationTransfer();
    }

    public function isManual(): bool
    {
        return ! $this->isIntegrated();
    }

    public function isInternalTransfer(): bool
    {
        return $this->isIntegrated() || $this->income_type === 'Transfer dari Donasi';
    }

    public function isExternal(): bool
    {
        return ! $this->isInternalTransfer();
    }

    public static function incomeTypes(): array
    {
        return [
            'Bantuan Sekolah',
            'Dana Operasional',
            'Kas Masuk Lain',
            'Pengembalian Belanja',
            'Pemasukan Usaha Sekolah',
            'Transfer dari Donasi',
        ];
    }

    public static function paymentMethods(): array
    {
        return [
            'Tunai',
            'Transfer Bank',
            'QRIS',
            'Lainnya',
        ];
    }
}
