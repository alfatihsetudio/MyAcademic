<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SarprasAsset extends Model
{
    protected $fillable = [
        'name',
        'inventory_code',
        'category',
        'quantity',
        'unit',
        'location',
        'condition',
        'procurement_year',
        'source_fund',
        'photo_path',
        'description',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'procurement_year' => 'integer',
        ];
    }

    public function maintenances()
    {
        return $this->hasMany(SarprasMaintenance::class, 'asset_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
