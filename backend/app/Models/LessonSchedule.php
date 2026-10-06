<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonSchedule extends Model
{
    protected $fillable = [
        'academic_year_id',
        'semester',
        'school_class_id',
        'day',
        'lesson_schedule_setting_id',
        'school_subject_id',
        'teacher_id',
        'room',
        'notes',
    ];

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function lessonScheduleSetting(): BelongsTo
    {
        return $this->belongsTo(LessonScheduleSetting::class);
    }

    public function schoolSubject(): BelongsTo
    {
        return $this->belongsTo(SchoolSubject::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
