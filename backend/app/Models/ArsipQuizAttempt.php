<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArsipQuizAttempt extends Model
{
    use HasFactory;

    protected $table = 'arsip_quiz_attempts';

    protected $fillable = [
        'user_id',
        'note_id',
        'title',
        'difficulty',
        'score',
        'total_questions',
        'percentage',
        'questions_data',
        'user_answers',
    ];

    protected $casts = [
        'questions_data' => 'array',
        'user_answers' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function note()
    {
        return $this->belongsTo(ArsipStudyNote::class, 'note_id');
    }
}
