<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class AcademicClass extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'school_id',
        'academic_year_id',
        'nama_kelas',
        'level',
        'jurusan',
        'capacity',
        'is_active',
        'deskripsi',
        'guru_id',
        'walimurid',
        'no_telpon_wali',
        'nama_km',
        'no_telpon_km',
    ];

    protected $casts = [
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function waliKelas()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function students()
    {
        return $this->hasMany(User::class, 'class_id');
    }

    public function enrolledStudents()
    {
        return $this->belongsToMany(User::class, 'class_user', 'class_id', 'user_id')->withPivot('enrolled_at');
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class, 'class_id');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'target_class_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'class_id');
    }
}
