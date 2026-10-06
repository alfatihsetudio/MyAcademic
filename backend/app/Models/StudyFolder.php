<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudyFolder extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent_id',
        'name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function parent()
    {
        return $this->belongsTo(StudyFolder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(StudyFolder::class, 'parent_id');
    }

    public function files()
    {
        return $this->hasMany(StudyFile::class, 'folder_id');
    }

    public function arsipNotes()
    {
        return $this->hasMany(ArsipStudyNote::class, 'folder_id');
    }
}
