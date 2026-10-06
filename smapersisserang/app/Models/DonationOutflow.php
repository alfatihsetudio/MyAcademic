<?php

namespace App\Models;

use App\Enums\DonationPaymentMethod;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DonationOutflow extends Model
{
    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'transaction_number',
        'handover_date',
        'donation_source',
        'description',
        'amount',
        'payment_method',
        'handover_method',
        'source_payment_method',
        'destination_account',
        'proof_file',
        'notes',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'handover_date' => 'date:Y-m-d',
            'amount' => 'decimal:2',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector(): BelongsTo
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    public function financeIncome(): HasOne
    {
        return $this->hasOne(FinanceIncome::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(DonationOutflowStatusHistory::class)->orderBy('created_at');
    }

    public function getPaymentMethodLabelAttribute(): string
    {
        return DonationPaymentMethod::labelOf($this->payment_method);
    }

    public function hasPaymentMethod(): bool
    {
        return $this->payment_method !== null;
    }

    /**
     * Kompatibilitas sementara untuk importer/kode lama selama kolom legacy
     * belum dihapus. Alur aplikasi baru tidak lagi memakai atribut ini.
     */
    public function setSourcePaymentMethodAttribute(?string $value): void
    {
        $this->attributes['source_payment_method'] = $value;
        $this->attributes['payment_method'] = $value;
    }
}
