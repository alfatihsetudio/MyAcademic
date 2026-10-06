<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserLoginSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'session_token',
        'device_name',
        'platform',
        'browser',
        'ip_address',
        'approx_location',
        'is_current',
        'last_active_at',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'last_active_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
