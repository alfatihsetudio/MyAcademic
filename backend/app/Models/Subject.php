<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class Subject extends TenantBaseModel
{
    use HasFactory;

    protected $table = 'subjects';

    protected $fillable = [
        'school_id',
        'class_id',
        'nama_mapel',
        'code',
        'category',
        'guru_id',
        'class_level',
        'jurusan',
        'deskripsi',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }

    public function materials()
    {
        return $this->hasMany(Material::class, 'subject_id');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class, 'subject_id');
    }
}
