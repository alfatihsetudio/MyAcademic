<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class Exam extends Model
{
    use HasTenant;
    protected $guarded = [];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}
