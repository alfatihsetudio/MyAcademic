<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Teacher extends Model
{
    protected $fillable = [
        'name',
        'subject',
        'position',
        'description',
        'photo_path',
        'teacher_quote',
        'phone',
        'whatsapp_number',
        'public_edit_token',
        'token_generated_at',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'token_generated_at' => 'datetime',
    ];

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(SchoolSubject::class, 'teacher_subject')->withTimestamps();
    }

    public function generatePublicEditToken(): string
    {
        $token = Str::random(64);
        $this->update([
            'public_edit_token' => $token,
            'token_generated_at' => now(),
        ]);
        return $token;
    }
}
