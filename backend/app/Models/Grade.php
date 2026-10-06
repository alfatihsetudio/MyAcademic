<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class Grade extends Model
{
    use HasTenant;
    protected $guarded = [];

    public function gradebook()
    {
        return $this->belongsTo(Gradebook::class);
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'related_id');
    }
}
