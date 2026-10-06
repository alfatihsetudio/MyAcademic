<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionYear extends Model
{
    use HasFactory;

    protected $table = 'admission_years';
    
    protected $fillable = [
        'name', 'academic_year', 'quota', 'status', 
        'start_date', 'end_date', 'is_current', 'description', 'promo_image',
        'show_consultation_button'
    ];
    
    protected $casts = [
        'is_current' => 'boolean',
        'show_consultation_button' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
    
    public function programs()
    {
        return $this->hasMany(AdmissionProgram::class);
    }
    
    public function applications()
    {
        return $this->hasMany(StudentApplication::class);
    }
    
    public function isCurrent()
    {
        return $this->is_current;
    }
    
    public function isOpen()
    {
        return $this->status === 'open';
    }
    
    public function isFull()
    {
        return $this->applications()->count() >= $this->quota;
    }
    
    public function isAlmostFull()
    {
        return $this->applications()->count() >= $this->quota * 0.9;
    }
}