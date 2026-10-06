<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VisitorLog extends Model
{
    protected $fillable = [
        'url', 'path', 'title', 'referrer', 'user_agent',
        'ip_hash', 'device', 'browser', 'visited_at',
    ];

    protected $casts = [
        'visited_at' => 'datetime',
    ];
}
