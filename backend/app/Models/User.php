<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'nama',
        'username',
        'nisn',
        'birth_date',
        'mother_name',
        'email',
        'google_id',
        'google_email',
        'whatsapp_number',
        'wa_verify_token',
        'wa_status',
        'lifecycle_status',
        'subscription_type',
        'retention_expires_at',
        'preferred_theme',
        'preferred_language',
        'password',
        'role',
        'school_id',
        'class_id',
        'jenjang',
        'jurusan',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'birth_date' => 'date',
            'retention_expires_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Role checks
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('superadmin') || $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin') || $this->role === 'admin';
    }

    public function isTu(): bool
    {
        return $this->hasRole('tu') || $this->role === 'tu';
    }

    public function isGuru(): bool
    {
        return $this->hasRole('guru') || $this->role === 'guru';
    }

    public function isMurid(): bool
    {
        return $this->hasAnyRole(['murid', 'siswa']) || in_array($this->role, ['murid', 'siswa']);
    }

    public function isOrangTua(): bool
    {
        return $this->hasAnyRole(['parent', 'orang_tua', 'wali']) || in_array($this->role, ['parent', 'orang_tua', 'wali']);
    }

    public function isCalonMurid(): bool
    {
        return $this->lifecycle_status === 'calon_murid';
    }

    public function isAktif(): bool
    {
        return $this->lifecycle_status === 'aktif';
    }

    // Relationships
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function classes()
    {
        return $this->belongsToMany(AcademicClass::class, 'class_user', 'user_id', 'class_id')->withPivot('enrolled_at');
    }

    public function taughtClasses()
    {
        return $this->hasMany(AcademicClass::class, 'guru_id');
    }

    public function taughtSubjects()
    {
        return $this->hasMany(Subject::class, 'guru_id');
    }

    public function submissions()
    {
        return $this->hasMany(Submission::class, 'student_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class, 'student_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function studyGoals()
    {
        return $this->hasMany(StudyGoal::class, 'user_id');
    }

    public function calendarEvents()
    {
        return $this->hasMany(CalendarEvent::class, 'user_id');
    }

    public function arsipStudyNotes()
    {
        return $this->hasMany(ArsipStudyNote::class, 'user_id');
    }

    public function arsipQuizAttempts()
    {
        return $this->hasMany(ArsipQuizAttempt::class, 'user_id');
    }

    public function schoolMemberships()
    {
        return $this->hasMany(SchoolMembership::class, 'user_id')->orderBy('start_date', 'asc');
    }

    public function loginSessions()
    {
        return $this->hasMany(UserLoginSession::class, 'user_id')->orderBy('last_active_at', 'desc');
    }

    public function passkeys()
    {
        return $this->hasMany(UserPasskey::class, 'user_id')->orderBy('created_at', 'desc');
    }

    public function studentIdentity()
    {
        return $this->hasOne(StudentIdentity::class, 'user_id');
    }

    public function studentFamily()
    {
        return $this->hasOne(StudentFamily::class, 'student_id');
    }

    public function studentHistories()
    {
        return $this->hasMany(StudentHistory::class, 'student_id');
    }

    public function studentAchievements()
    {
        return $this->hasMany(StudentAchievement::class, 'student_id');
    }

    public function studentViolations()
    {
        return $this->hasMany(StudentViolation::class, 'student_id');
    }

    public function counselingCases()
    {
        return $this->hasMany(CounselingCase::class, 'student_id');
    }

    public function extracurriculars()
    {
        return $this->belongsToMany(Extracurricular::class, 'extracurricular_members', 'student_id', 'extracurricular_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function reportCards()
    {
        return $this->hasMany(ReportCard::class, 'student_id');
    }

    public function teachingAssignments()
    {
        return $this->hasMany(TeachingAssignment::class, 'teacher_id');
    }

    public function teachingSchedules()
    {
        return $this->hasMany(TeachingSchedule::class, 'guru_id');
    }

    public function teacherAttendances()
    {
        return $this->hasMany(TeacherAttendance::class, 'teacher_id');
    }

    public function teacherHistories()
    {
        return $this->hasMany(TeacherHistory::class, 'teacher_id');
    }
}
