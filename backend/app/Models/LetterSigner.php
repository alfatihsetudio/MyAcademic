<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LetterSigner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'position',
        'identity_number',
        'signature_path',
        'is_active',
        'sort_order',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function primaryOutgoingLetters(): HasMany
    {
        return $this->hasMany(LetterOutgoing::class, 'signer_1_id');
    }

    public function secondaryOutgoingLetters(): HasMany
    {
        return $this->hasMany(LetterOutgoing::class, 'signer_2_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
