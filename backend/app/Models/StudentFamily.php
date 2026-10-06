<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class StudentFamily extends Model
{
    use HasTenant;
    protected $guarded = [];

    //
}
