<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TabelOfflineScore extends Model
{
    use HasFactory;

    protected $table = 'tabel_offline_scores';

    protected $fillable = [
        'task_id',
        'student_id',
        'score',
        'nilai',
        'note',
        'catatan',
    ];

    protected $casts = [
        'score' => 'float',
        'nilai' => 'float',
    ];

    public function task()
    {
        return $this->belongsTo(TabelOfflineTask::class, 'task_id');
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}
