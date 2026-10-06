<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'academic_year',
        'start_date',
        'end_date',
        'odd_semester_start_date',
        'odd_semester_end_date',
        'even_semester_start_date',
        'even_semester_end_date',
        'is_current',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'odd_semester_start_date' => 'date',
            'odd_semester_end_date' => 'date',
            'even_semester_start_date' => 'date',
            'even_semester_end_date' => 'date',
            'is_current' => 'boolean',
        ];
    }

    public function events(): HasMany
    {
        return $this->hasMany(AcademicCalendarEvent::class);
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }
}
