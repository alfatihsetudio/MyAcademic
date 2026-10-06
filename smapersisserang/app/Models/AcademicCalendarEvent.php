<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class AcademicCalendarEvent extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'academic_year_id',
        'title',
        'category',
        'source',
        'description',
        'start_date',
        'end_date',
        'is_all_day',
        'start_time',
        'end_time',
        'day_status',
        'is_holiday',
        'is_effective_day',
        'targets',
        'teacher_id',
        'location',
        'person_in_charge',
        'internal_notes',
        'status',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'is_all_day' => 'boolean',
            'is_holiday' => 'boolean',
            'is_effective_day' => 'boolean',
            'targets' => 'array',
        ];
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class)->withDefault();
    }

    public function isSingleDay(): bool
    {
        return $this->start_date && $this->end_date
            && $this->start_date->isSameDay($this->end_date);
    }
}
