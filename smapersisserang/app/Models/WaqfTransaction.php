<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WaqfTransaction extends Model
{
    protected $fillable = [
        'order_id',
        'wakif_name',
        'wakif_whatsapp',
        'amount',
        'admin_fee',
        'unique_code',
        'total_transfer',
        'note',
        'ikrar_checked',
        'payment_gateway',
        'status',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'admin_fee' => 'integer',
            'ikrar_checked' => 'boolean',
            'paid_at' => 'datetime',
        ];
    }

    public function getWakifNameAttribute($value): string
    {
        return $value ?: 'Hamba Allah';
    }

    public function isPaid(): bool
    {
        return in_array($this->status, ['paid', 'settlement', 'capture']);
    }
}
