<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class StudentHistory extends Model
{
    use HasTenant;

    protected $guarded = [];

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
