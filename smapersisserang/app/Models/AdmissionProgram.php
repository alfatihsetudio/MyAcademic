<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdmissionProgram extends Model
{
    use HasFactory;

    protected $table = 'admission_programs';
    
    protected $fillable = [
        'admission_year_id', 'name', 'type', 'quota',
        'tuition_fee', 'boarding_fee', 'meal_fee', 'registration_fee', 'other_fee',
        'is_free_program', 'status', 'start_date', 'end_date', 'description', 'benefits', 'requirements', 'sort_order'
    ];
    
    protected $casts = [
        'is_free_program' => 'boolean',
        'start_date' => 'date',
        'end_date' => 'date',
    ];
    
    public function admissionYear()
    {
        return $this->belongsTo(AdmissionYear::class);
    }
    
    public function applications()
    {
        return $this->hasMany(StudentApplication::class);
    }
    
    public function isFreeProgram()
    {
        return $this->is_free_program;
    }
    
    public function isAvailable()
    {
        return $this->status === 'open' && $this->applications()->count() < $this->quota;
    }
    
    public function remainingQuota()
    {
        return $this->quota - $this->applications()->count();
    }
}