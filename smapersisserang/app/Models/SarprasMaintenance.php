<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SarprasMaintenance extends Model
{
    protected $fillable = [
        'asset_id',
        'room_id',
        'title',
        'damage_description',
        'reported_by',
        'reported_at',
        'estimated_cost',
        'actual_cost',
        'status',
        'photo_path',
        'follow_up_note',
    ];

    protected function casts(): array
    {
        return [
            'reported_at' => 'date',
            'estimated_cost' => 'decimal:2',
            'actual_cost' => 'decimal:2',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(SarprasAsset::class, 'asset_id');
    }

    public function room()
    {
        return $this->belongsTo(SarprasRoom::class, 'room_id');
    }
}
