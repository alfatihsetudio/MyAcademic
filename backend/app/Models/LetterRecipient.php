<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LetterRecipient extends Model
{
    protected $fillable = [
        'letter_outgoing_id',
        'recipient_name',
        'recipient_institution',
        'recipient_address',
        'recipient_phone',
        'recipient_email',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function outgoingLetter(): BelongsTo
    {
        return $this->belongsTo(LetterOutgoing::class, 'letter_outgoing_id');
    }
}
