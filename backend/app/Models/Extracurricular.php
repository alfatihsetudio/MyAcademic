<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class Extracurricular extends Model
{
    use HasTenant;
    protected $guarded = [];

    public function members()
    {
        return $this->belongsToMany(User::class, 'extracurricular_members', 'extracurricular_id', 'student_id');
    }
}
