<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Semester extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'semesters';

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'name',
        'start_date',
        'end_date',
        'is_active',
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

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }
}
