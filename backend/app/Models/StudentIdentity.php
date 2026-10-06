<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentIdentity extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'class',
        'nik',
        'nisn',
        'date_of_birth',
        'parents_name',
        'address'
    ];

    protected $casts = [
        'nik' => 'encrypted',
        'nisn' => 'encrypted',
        'parents_name' => 'encrypted',
        'address' => 'encrypted',
        'date_of_birth' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
