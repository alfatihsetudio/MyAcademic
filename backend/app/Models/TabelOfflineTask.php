<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TabelOfflineTask extends Model
{
    use HasFactory;

    protected $table = 'tabel_offline_tasks';

    protected $fillable = [
        'school_id',
        'owner_id',
        'class_id',
        'subject_id',
        'title',
        'nama_tugas',
        'description',
        'content',
        'photo',
        'video_url',
        'other_url',
        'tanggal',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subject_id');
    }

    public function scores()
    {
        return $this->hasMany(TabelOfflineScore::class, 'task_id');
    }
}
