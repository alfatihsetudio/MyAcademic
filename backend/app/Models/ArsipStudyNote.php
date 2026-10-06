<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArsipStudyNote extends Model
{
    use HasFactory;

    protected $table = 'arsip_study_notes';

    protected $fillable = [
        'user_id',
        'folder_id',
        'title',
        'transcribed_text',
        'summary',
        'flashcards',
        'mindmap',
        'tags',
        'image_urls',
        'audio_url',
    ];

    protected $casts = [
        'flashcards' => 'array',
        'mindmap' => 'array',
        'tags' => 'array',
        'image_urls' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function quizAttempts()
    {
        return $this->hasMany(ArsipQuizAttempt::class, 'note_id');
    }

    public function folder()
    {
        return $this->belongsTo(StudyFolder::class, 'folder_id');
    }
}
