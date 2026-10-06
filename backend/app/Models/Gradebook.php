<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class Gradebook extends Model
{
    use HasTenant;
    protected $guarded = [];

    //
}
