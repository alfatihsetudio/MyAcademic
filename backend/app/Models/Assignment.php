<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'subject_id',
        'target_class_id',
        'judul',
        'deskripsi',
        'file_id',
        'deadline',
        'session_info',
        'video_link',
        'created_by',
    ];

    protected $casts = [
        'deadline' => 'datetime',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'target_class_id');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'assignment_id');
    }
}
