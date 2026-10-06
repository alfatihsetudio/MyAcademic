<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LessonScheduleSetting extends Model
{
    protected $fillable = [
        'name',
        'day',
        'start_time',
        'end_time',
        'type',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(LessonSchedule::class, 'lesson_schedule_setting_id');
    }
}
