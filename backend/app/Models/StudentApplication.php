<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentApplication extends Model
{
    use HasFactory;

    protected $table = 'student_applications';
    
    protected $fillable = [
        'user_id',
        'registration_number', 'admission_year_id', 'admission_program_id', 'status',
        'student_name', 'nama_panggilan', 'nomor_induk_asal', 'nisn', 'gender',
        'birth_place', 'birth_date', 'agama', 'anak_ke', 'status_anak_dalam_keluarga',
        'previous_school', 'alamat_sekolah_asal', 'address', 'telepon_siswa',
        'diterima_di_kelas', 'tanggal_diterima', 'boarding_ready',
        'quran_reading_ability', 'health_notes', 'motivation', 'foto_3x4',
        'father_name', 'mother_name', 'alamat_ayah', 'alamat_ibu',
        'parent_whatsapp', 'parent_job', 'pekerjaan_ayah', 'pekerjaan_ibu',
        'pendidikan_ayah', 'pendidikan_ibu', 'penghasilan_ayah', 'penghasilan_ibu',
        'nama_ayah_wali', 'nama_ibu_wali', 'alamat_ayah_wali', 'alamat_ibu_wali',
        'telepon_wali', 'pekerjaan_ayah_wali', 'pekerjaan_ibu_wali',
        'pendidikan_ayah_wali', 'pendidikan_ibu_wali',
        'penghasilan_ayah_wali', 'penghasilan_ibu_wali',
        'admin_notes', 'verified_by', 'verified_at', 'submitted_at',
        'follow_up_status', 'follow_up_notes', 'follow_up_at', 'follow_up_by',
        'status_data', 'update_token', 'updated_by_parent_at',
        'current_step', 'student_data_completed_at', 'parent_data_completed_at',
        'guardian_boarding_completed_at', 'documents_completed_at',
        'final_submitted_at', 'is_final_submitted', 'last_saved_at',
    ];
    
    protected $casts = [
        'birth_date' => 'date',
        'tanggal_diterima' => 'date',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'boarding_ready' => 'boolean',
        'follow_up_at' => 'datetime',
        'updated_by_parent_at' => 'datetime',
        'anak_ke' => 'integer',
        'current_step' => 'integer',
        'student_data_completed_at' => 'datetime',
        'parent_data_completed_at' => 'datetime',
        'guardian_boarding_completed_at' => 'datetime',
        'documents_completed_at' => 'datetime',
        'final_submitted_at' => 'datetime',
        'is_final_submitted' => 'boolean',
        'last_saved_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admissionYear()
    {
        return $this->belongsTo(AdmissionYear::class);
    }
    
    public function admissionProgram()
    {
        return $this->belongsTo(AdmissionProgram::class);
    }
    
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
    
    public function statusHistories()
    {
        return $this->hasMany(ApplicationStatusHistory::class);
    }

    public function requirementFiles()
    {
        return $this->hasMany(StudentRequirementFile::class, 'student_application_id');
    }
    
    public function generateRegistrationNumber()
    {
        $year = $this->admission_year->academic_year;
        $prefix = 'SPMB-' . $year . '-';

        $lastNumber = StudentApplication::where('registration_number', 'like', $prefix . '%')
            ->lockForUpdate()
            ->orderByDesc('registration_number')
            ->value('registration_number');

        $nextNumber = 1;
        if ($lastNumber) {
            $nextNumber = (int) substr($lastNumber, -4) + 1;
        }

        do {
            $regNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
            $exists = StudentApplication::where('registration_number', $regNumber)->exists();
            if ($exists) {
                $nextNumber++;
            }
        } while ($exists);

        return $regNumber;
    }
    
    public function isPending()
    {
        return in_array($this->status, ['baru_daftar', 'menunggu_verifikasi', 'data_kurang']);
    }
    
    public function isVerified()
    {
        return $this->status === 'terverifikasi';
    }
    
    public function isAdmitted()
    {
        return $this->status === 'diterima';
    }
    
    public function isActive()
    {
        return $this->status === 'terverifikasi';
    }

    public function followUpBy()
    {
        return $this->belongsTo(User::class, 'follow_up_by');
    }

    public function normalizedParentWhatsapp(): ?string
    {
        if (! $this->parent_whatsapp) {
            return null;
        }

        $phone = preg_replace('/[^0-9]/', '', $this->parent_whatsapp);

        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        return $phone ?: null;
    }

    public function updateDataUrl(): ?string
    {
        if (! $this->update_token) {
            return null;
        }

        return route('spmb.update-data', $this->update_token);
    }
}
