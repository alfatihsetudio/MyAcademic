<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AcademicYear extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'academic_years';

    protected $fillable = [
        'school_id',
        'name',
        'semester',
        'start_date',
        'end_date',
        'is_active',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'academic_year_id');
    }

    public function classes()
    {
        return $this->hasMany(AcademicClass::class, 'academic_year_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
