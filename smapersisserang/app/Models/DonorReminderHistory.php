<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonorReminderHistory extends Model
{
    protected $fillable = [
        'donation_regular_donor_id',
        'reminded_by',
        'reminded_at',
        'message_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'reminded_at' => 'datetime',
        ];
    }

    public function donor(): BelongsTo
    {
        return $this->belongsTo(DonationRegularDonor::class, 'donation_regular_donor_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reminded_by');
    }
}
