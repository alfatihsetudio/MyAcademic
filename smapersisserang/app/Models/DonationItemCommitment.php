<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonationItemCommitment extends Model
{
    public const STATUSES = [
        'pending' => 'Menunggu Konfirmasi',
        'confirmed' => 'Sudah Dikonfirmasi',
        'pickup' => 'Dalam Penjemputan',
        'waiting_delivery' => 'Menunggu Diantar',
        'cancelled' => 'Batal',
        'received' => 'Sudah Diterima',
    ];

    protected $fillable = [
        'reference_number',
        'received_at',
        'donor_name',
        'donor_phone',
        'item_type',
        'item_name',
        'quantity_estimate',
        'delivery_method',
        'note',
        'raw_whatsapp_message',
        'status',
        'confirmed_at',
        'received_receipt_id',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'confirmed_at' => 'datetime',
        ];
    }

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(DonationItemReceipt::class, 'received_receipt_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function donorNameLabel(): string
    {
        return $this->donor_name ?: 'Hamba Allah';
    }

    public function itemLabel(): string
    {
        return $this->item_name ?: $this->item_type;
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }
}
