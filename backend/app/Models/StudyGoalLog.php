<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyGoalLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'goal_id',
        'log_date',
        'notes',
    ];

    protected $casts = [
        'log_date' => 'date',
    ];

    public function goal()
    {
        return $this->belongsTo(StudyGoal::class, 'goal_id');
    }
}
