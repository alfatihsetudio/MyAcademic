<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolMembership extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'school_id',
        'school_name',
        'stage',
        'grade_level',
        'nis',
        'status',
        'start_date',
        'end_date',
        'sponsorship_status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function school()
    {
        return $this->belongsTo(School::class);
    }
}
