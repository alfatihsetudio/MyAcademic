<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LetterAttachmentContent extends Model
{
    protected $fillable = [
        'letter_outgoing_id',
        'content',
    ];

    public function letterOutgoing(): BelongsTo
    {
        return $this->belongsTo(LetterOutgoing::class);
    }
}
