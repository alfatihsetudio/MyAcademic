<?php

namespace App\Models;

use App\Enums\DonationPaymentMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DonationTransaction extends Model
{
    protected $fillable = [
        'donation_account_id',
        'order_id',
        'donor_name',
        'donor_whatsapp',
        'donor_email',
        'support_type',
        'amount',
        'payment_method',
        'note',
        'payment_gateway',
        'snap_token',
        'snap_redirect_url',
        'midtrans_transaction_id',
        'midtrans_payment_type',
        'midtrans_fraud_status',
        'status',
        'paid_at',
        'raw_notification',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'raw_notification' => 'array',
        ];
    }

    public function getDonorNameAttribute($value): string
    {
        return $value ?: 'Hamba Allah';
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return DonationPaymentMethod::labelOf($this->payment_method);
    }

    public function hasPaymentMethod(): bool
    {
        return $this->payment_method !== null;
    }

    public function isPaid(): bool
    {
        return in_array($this->status, ['paid', 'settlement', 'capture']);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(DonationTransactionHistory::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(DonationAccount::class, 'donation_account_id');
    }
}
