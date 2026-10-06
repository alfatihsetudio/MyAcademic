<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TableTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'owner_id',
        'name',
        'description',
        'visibility',
        'columns_json',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function documents()
    {
        return $this->hasMany(TableDocument::class, 'template_id');
    }
}
