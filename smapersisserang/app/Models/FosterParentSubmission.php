<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FosterParentSubmission extends Model
{
    protected $fillable = [
        'student_id',
        'donor_name',
        'donor_phone',
        'amount',
        'custom_amount',
        'commitment_duration',
        'note',
        'status',
    ];

    public function student()
    {
        return $this->belongsTo(StudentApplication::class, 'student_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'aktif');
    }

    public function getDonorNameAttribute($value): string
    {
        return $value ?: 'Hamba Allah';
    }

    public function getAmountFormattedAttribute(): string
    {
        return $this->amount ? 'Rp' . number_format($this->amount, 0, ',', '.') : 'Belum ditentukan';
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pending' => 'Menunggu',
            'dihubungi' => 'Perlu Dihubungi',
            'aktif' => 'Aktif',
            'batal' => 'Batal',
            default => $this->status,
        };
    }
}
