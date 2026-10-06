<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Traits\HasTenant;

class Attendance extends Model
{
    use HasFactory, HasTenant;

    protected $table = 'attendance';

    protected $fillable = [
        'school_id',
        'class_id',
        'student_id',
        'subject_id',
        'date',
        'tanggal',
        'status',
        'materi',
        'note',
        'keterangan',
        'daily_score',
        'recorded_by',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'daily_score' => 'float',
    ];

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}

