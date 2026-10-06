<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuRoleOverride extends Model
{
    protected $fillable = [
        'menu_key',
        'roles',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'roles' => 'array',
        ];
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
