<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationStatusHistory extends Model
{
    protected $table = 'application_status_histories';
    
    protected $fillable = [
        'student_application_id', 'from_status', 'to_status', 'changed_by', 'notes'
    ];
    
    public function studentApplication()
    {
        return $this->belongsTo(StudentApplication::class);
    }
    
    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
    
    public function isStatusChange()
    {
        return !is_null($this->from_status) && $this->from_status !== $this->to_status;
    }
}