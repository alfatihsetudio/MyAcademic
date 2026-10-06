<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'template_id',
        'owner_id',
        'name',
        'description',
        'data_json',
    ];

    public function template()
    {
        return $this->belongsTo(TableTemplate::class, 'template_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}
