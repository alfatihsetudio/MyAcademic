<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonationItemReceipt extends Model
{
    protected $fillable = [
        'receipt_number',
        'received_date',
        'donor_name',
        'donor_phone',
        'item_type',
        'item_name',
        'quantity',
        'unit',
        'item_condition',
        'delivery_method',
        'note',
        'user_id',
        'received_by',
        'proof_photo',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'received_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function commitment(): HasOne
    {
        return $this->hasOne(DonationItemCommitment::class, 'received_receipt_id');
    }

    public function donorNameLabel(): string
    {
        return $this->donor_name ?: 'Hamba Allah';
    }

    public function itemLabel(): string
    {
        return $this->item_name ?: $this->item_type;
    }

    public function quantityLabel(): string
    {
        return trim(($this->quantity ?: '-') . ' ' . ($this->unit ?: ''));
    }
}
