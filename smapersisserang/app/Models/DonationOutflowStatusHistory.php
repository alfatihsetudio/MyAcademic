<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DonationOutflowStatusHistory extends Model
{
    protected $fillable = [
        'donation_outflow_id',
        'from_status',
        'to_status',
        'reason',
        'changed_by',
    ];

    public function donationOutflow(): BelongsTo
    {
        return $this->belongsTo(DonationOutflow::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
