<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StudentRequirementFile extends Model
{
    protected $fillable = [
        'student_application_id',
        'requirement_key',
        'requirement_label',
        'file_path',
        'original_filename',
        'mime_type',
        'file_size_original',
        'file_size_compressed',
        'compression_status',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
        'file_size_original' => 'integer',
        'file_size_compressed' => 'integer',
    ];

    public function studentApplication()
    {
        return $this->belongsTo(StudentApplication::class);
    }

    public function fileUrl(): ?string
    {
        if (!$this->file_path) {
            return null;
        }
        return asset('storage/' . $this->file_path);
    }

    public function fileSizeDisplay(): ?string
    {
        $size = $this->file_size_compressed ?? $this->file_size_original;
        if (!$size) {
            return null;
        }
        if ($size < 1024) {
            return $size . ' B';
        }
        $kb = round($size / 1024, 1);
        if ($kb < 1024) {
            return $kb . ' KB';
        }
        return round($kb / 1024, 1) . ' MB';
    }

    public function deleteFile(): bool
    {
        if ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            Storage::disk('public')->delete($this->file_path);
        }
        return true;
    }

    public function isImage(): bool
    {
        return in_array($this->mime_type, ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    }

    public function isPdf(): bool
    {
        return $this->mime_type === 'application/pdf';
    }

    public function fileExtension(): string
    {
        $ext = pathinfo($this->file_path, PATHINFO_EXTENSION);
        return $ext ?: 'bin';
    }

    public static function safeDownloadName(string $key, int $index): string
    {
        $names = [
            'diploma_or_active_letter' => 'scan-ijazah-skl-surat-keterangan-aktif-kelas-9',
            'birth_certificate' => 'scan-akta-kelahiran',
            'family_card' => 'scan-kartu-keluarga',
            'nisn_screenshot' => 'screenshot-nisn',
            'report_score_semester_1' => 'nilai-rapor-semester-1',
            'report_score_semester_2' => 'nilai-rapor-semester-2',
            'report_score_semester_3' => 'nilai-rapor-semester-3',
            'report_score_semester_4' => 'nilai-rapor-semester-4',
            'report_score_semester_5' => 'nilai-rapor-semester-5',
            'red_background_photo' => 'pas-foto-berwarna-3x4-latar-merah',
            'additional_affirmation_document' => 'dokumen-tambahan-kip-pkh-sktm',
        ];

        $slug = $names[$key] ?? Str::slug(str_replace('_', ' ', $key));
        return sprintf('%02d-%s', $index + 1, $slug);
    }

    public static array $requirements = [
        'diploma_or_active_letter' => [
            'label' => 'Scan Ijazah / SKL / Surat Keterangan Aktif Kelas 9',
            'required' => true,
        ],
        'birth_certificate' => [
            'label' => 'Scan Akta Kelahiran',
            'required' => true,
        ],
        'family_card' => [
            'label' => 'Scan Kartu Keluarga',
            'required' => true,
        ],
        'nisn_screenshot' => [
            'label' => 'Screenshot NISN',
            'required' => true,
        ],
        'report_score_semester_1' => [
            'label' => 'Nilai Rapor Semester 1',
            'required' => true,
        ],
        'report_score_semester_2' => [
            'label' => 'Nilai Rapor Semester 2',
            'required' => true,
        ],
        'report_score_semester_3' => [
            'label' => 'Nilai Rapor Semester 3',
            'required' => true,
        ],
        'report_score_semester_4' => [
            'label' => 'Nilai Rapor Semester 4',
            'required' => true,
        ],
        'report_score_semester_5' => [
            'label' => 'Nilai Rapor Semester 5',
            'required' => true,
        ],
        'red_background_photo' => [
            'label' => 'Pas Foto Berwarna 3×4 (Latar Merah)',
            'required' => true,
        ],
        'additional_affirmation_document' => [
            'label' => 'Dokumen Tambahan: KIP, PKH, atau SKTM',
            'required' => false,
        ],
    ];

    public static array $legacyRequirements = [
        'report_score_semester_1_5' => [
            'label' => 'Nilai Rapor Semester 1–5 (data lama)',
        ],
    ];
}
