<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SarprasProcurement extends Model
{
    protected $fillable = [
        'title',
        'procurement_date',
        'source_fund',
        'total_cost',
        'vendor_name',
        'receipt_path',
        'status',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'procurement_date' => 'date',
            'total_cost' => 'decimal:2',
        ];
    }
}
