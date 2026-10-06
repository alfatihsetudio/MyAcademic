<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LetterType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function counters(): HasMany
    {
        return $this->hasMany(LetterCounter::class);
    }

    public function outgoingLetters(): HasMany
    {
        return $this->hasMany(LetterOutgoing::class);
    }

    public function incomingLetters(): HasMany
    {
        return $this->hasMany(LetterIncoming::class);
    }

    public function templates(): HasMany
    {
        return $this->hasMany(LetterTemplate::class);
    }
}
