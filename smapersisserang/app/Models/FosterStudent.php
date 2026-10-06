<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class FosterStudent extends Model
{
    protected $fillable = [
        'name',
        'gender',
        'class_name',
        'origin',
        'photo_path',
        'need_description',
        'is_active',
        'is_priority',
        'foster_status',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path
            ? Storage::url($this->photo_path)
            : null;
    }

    public function getFosterStatusLabelAttribute(): string
    {
        return match ($this->foster_status) {
            'available' => 'Belum Ada Orang Tua Asuh',
            'assigned' => 'Sudah Ada Orang Tua Asuh',
            'inactive' => 'Tidak Aktif',
            default => $this->foster_status,
        };
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('foster_status', 'available');
    }

    public function submissions()
    {
        return $this->hasMany(FosterParentSubmission::class);
    }
}
