<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class School extends Model
{
    use HasFactory, HasTenant;

    protected $fillable = [
        'nama_sekolah',
        'alamat',
        'telepon',
        'email',
        'website',
        'logo',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function classes()
    {
        return $this->hasMany(AcademicClass::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }
}

