<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserPasskey extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'credential_id',
        'name',
        'public_key',
        'public_key_cose',
        'algorithm',
        'sign_count',
        'aaguid',
        'transports',
        'last_used_at',
    ];

    protected $casts = [
        'transports' => 'array',
        'last_used_at' => 'datetime',
        'algorithm' => 'integer',
        'sign_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
