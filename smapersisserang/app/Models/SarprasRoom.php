<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SarprasRoom extends Model
{
    protected $fillable = [
        'name',
        'room_type',
        'capacity',
        'person_in_charge',
        'condition',
        'photo_path',
        'needs_note',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
        ];
    }

    public function maintenances()
    {
        return $this->hasMany(SarprasMaintenance::class, 'room_id');
    }
}
