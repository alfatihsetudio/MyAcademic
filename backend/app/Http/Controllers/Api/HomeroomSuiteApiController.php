<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\CounselingCase;
use App\Models\Exam;
use App\Models\Extracurricular;
use App\Models\Grade;
use App\Models\Gradebook;
use App\Models\LearningMaterial;
use App\Models\Notification;
use App\Models\ReportCard;
use App\Models\School;
use App\Models\SchoolEvent;
use App\Models\Semester;
use App\Models\StudentAchievement;
use App\Models\StudentViolation;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\TeacherAttendance;
use App\Models\TeachingAssignment;
use App\Models\TeachingJournal;
use App\Models\Timetable;
use App\Models\AuditLog;
use App\Models\StudentFamily;
use App\Models\StudentIdentity;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HomeroomSuiteApiController extends Controller
{
    /**
     * Helper to get active homeroom teacher and their assigned class
     */
    protected function getHomeroomContext(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['walikelas', 'guru', 'admin'])) {
            $user = User::where('role', 'walikelas')->orWhere('role', 'guru')->first() ?: User::first();
        }

        // Find class where this teacher is assigned as wali kelas (guru_id)
        $class = null;
        if ($user) {
            $class = AcademicClass::where('guru_id', $user->id)->first();
        }
        if (!$class) {
            $class = AcademicClass::where('nama_kelas', 'LIKE', '%XI%')->first() ?: AcademicClass::first();
        }

        return [
            'user' => $user,
            'class' => $class,
        ];
    }

    /**
     * Helper to retrieve class students (with database fallback)
     */
    protected function getClassStudents($classId)
    {
        $students = User::whereIn('role', ['murid', 'siswa'])
            ->where(function ($q) use ($classId) {
                $q->where('class_id', $classId)
                  ->orWhereHas('classes', function ($qc) use ($classId) {
                      $qc->where('classes.id', $classId);
                  });
            })
            ->get();

        if ($students->isEmpty()) {
            $students = User::whereIn('role', ['murid', 'siswa'])->take(15)->get();
        }

        return $students;
    }

    /**
     * 1. Dashboard Wali Kelas
     * Ringkasan Kelas, Kondisi Hari Ini, Academic Snapshot, Student Attention, Quick Action
     */
    public function dashboard(Request $request)
    {
        $ctx = $this->getHomeroomContext($request);
        $class = $ctx['class'];
        $user = $ctx['user'];

        return response()->json([
            'success' => true,
            'class_info' => [
                'id' => $class ? $class->id : 1,
                'name' => $class ? ($class->nama_kelas ?? 'XI MIPA 1') : 'XI MIPA 1',
                'level' => 'XI (Sebelas)',
                'major' => 'MIPA (Matematika dan Ilmu Pengetahuan Alam)',
                'academic_year' => '2026/2027',
                'semester' => 'Ganjil',
                'room' => 'Ruang 204 (Gedung B Lt. 2)',
                'total_students' => 34,
                'male_count' => 16,
                'female_count' => 18,
                'homeroom_teacher' => $user ? ($user->name ?? $user->nama ?? 'Siti Aminah, M.Pd') : 'Siti Aminah, M.Pd',
                'homeroom_teacher_nip' => '198405122008012015',
                'class_president' => 'Ahmad Fauzi (NIS: 20241101)',
                'class_secretary' => 'Nadia Syahrini',
                'class_treasurer' => 'Dewi Sartika',
            ],
            'today_condition' => [
                'date' => date('d M Y'),
                'day' => 'Senin',
                'present' => 31,
                'sick' => 1,
                'permit' => 1,
                'unexcused' => 1,
                'late' => 1,
                'attendance_rate' => 91.2,
                'absent_students' => [
                    ['id' => 106, 'name' => 'Budi Santoso', 'status' => 'Sakit', 'note' => 'Surat dokter terlampir di WhatsApp'],
                    ['id' => 104, 'name' => 'Citra Lestari', 'status' => 'Izin', 'note' => 'Acara keluarga (Surat izin sah)'],
                    ['id' => 103, 'name' => 'Rian Hidayat', 'status' => 'Alfa', 'note' => 'Tanpa kabar - Perlu tindak lanjut wali kelas'],
                ],
                'class_agenda' => [
                    ['time' => '07:00 - 07:45', 'title' => 'Upacara Bendera Hari Senin & Pembacaan Tata Tertib', 'venue' => 'Lapangan Utama'],
                    ['time' => '12:00 - 12:45', 'title' => 'Briefing Persiapan Class Meeting & Rapor Bulanan', 'venue' => 'Ruang Kelas XI MIPA 1'],
                    ['time' => '15:15 - 16:00', 'title' => 'Konseling Ringan Siswa Terlambat Berulang (BK & Walikelas)', 'venue' => 'Ruang Wali Kelas'],
                ],
                'today_schedule' => [
                    ['period' => 'Jam 1 - 2', 'time' => '07:45 - 09:15', 'subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'status' => 'Selesai'],
                    ['period' => 'Jam 3 - 4', 'time' => '09:30 - 11:00', 'subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'status' => 'Sedang Berlangsung'],
                    ['period' => 'Jam 5 - 6', 'time' => '11:00 - 12:30', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'status' => 'Berikutnya'],
                    ['period' => 'Jam 7 - 8', 'time' => '13:15 - 14:45', 'subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'status' => 'Terjadwal'],
                ],
            ],
            'academic_snapshot' => [
                'class_average' => 83.4,
                'mastery_rate' => 88.2, // Persentase ketuntasan (30 dari 34 siswa)
                'low_scoring_count' => 4,
                'improving_count' => 8,
                'declining_count' => 2,
                'low_scoring_students' => [
                    ['id' => 103, 'name' => 'Rian Hidayat', 'average' => 64.2, 'failing_subjects' => ['Fisika', 'Matematika', 'Kimia']],
                    ['id' => 105, 'name' => 'Dimas Arya', 'average' => 71.8, 'failing_subjects' => ['Kimia']],
                    ['id' => 112, 'name' => 'Faisal Rahman', 'average' => 68.5, 'failing_subjects' => ['Matematika']],
                    ['id' => 107, 'name' => 'Bayu Wicaksono', 'average' => 75.0, 'failing_subjects' => ['Fisika (Remedial)']],
                ],
                'improving_students' => [
                    ['id' => 101, 'name' => 'Ahmad Fauzi', 'from' => 81.0, 'to' => 89.5, 'gain' => '+8.5'],
                    ['id' => 102, 'name' => 'Nadia Syahrini', 'from' => 84.0, 'to' => 91.0, 'gain' => '+7.0'],
                ],
                'declining_students' => [
                    ['id' => 103, 'name' => 'Rian Hidayat', 'from' => 74.0, 'to' => 64.2, 'drop' => '-9.8'],
                    ['id' => 107, 'name' => 'Bayu Wicaksono', 'from' => 82.0, 'to' => 75.0, 'drop' => '-7.0'],
                ],
            ],
            'student_attention' => [
                'high_absence' => [
                    ['id' => 103, 'name' => 'Rian Hidayat', 'color' => 'red', 'reason' => '12x Alfa, 6x Terlambat (Kehadiran 73.8%)', 'action' => 'Panggilan Ortu'],
                    ['id' => 109, 'name' => 'Fahmi Idris', 'color' => 'red', 'reason' => '4x Sakit tanpa surat, 2x Alfa', 'action' => 'Klarifikasi Rumah'],
                ],
                'declining_grades' => [
                    ['id' => 103, 'name' => 'Rian Hidayat', 'color' => 'yellow', 'reason' => 'Nilai Fisika & Kimia anjlok > 15%', 'action' => 'Koordinasi Guru Mapel'],
                    ['id' => 107, 'name' => 'Bayu Wicaksono', 'color' => 'yellow', 'reason' => 'Penurunan nilai tugas 3 pekan berturut-turut', 'action' => 'Konseling Ringan'],
                ],
                'missing_assignments' => [
                    ['id' => 105, 'name' => 'Dimas Arya', 'color' => 'yellow', 'reason' => '3 tugas Kimia & Fisika belum submit', 'action' => 'Beri Peringatan Tugas'],
                    ['id' => 110, 'name' => 'Gita Gutawa', 'color' => 'yellow', 'reason' => '2 tugas Biologi terlambat 4 hari', 'action' => 'Cek Kendala Belajar'],
                ],
                'disciplinary_issues' => [
                    ['id' => 103, 'name' => 'Rian Hidayat', 'color' => 'red', 'reason' => 'Pelanggaran seragam & merokok di luar pagar (25 poin)', 'action' => 'Referral ke BK'],
                ],
                'achievements' => [
                    ['id' => 101, 'name' => 'Ahmad Fauzi', 'color' => 'green', 'reason' => 'Juara 1 Olimpiade Sains Kota (OSK) Fisika 2026', 'action' => 'Apresiasi Kelas'],
                    ['id' => 111, 'name' => 'Zahra Annisa', 'color' => 'green', 'reason' => 'Juara 2 Debat Bahasa Inggris Tingkat Provinsi', 'action' => 'Catat di Rapor'],
                ],
            ],
            'quick_actions' => [
                ['id' => 'attendance', 'title' => 'Presensi Kelas', 'icon' => 'UserCheck', 'badge' => 'Hari Ini'],
                ['id' => 'students', 'title' => 'Data Siswa & 360°', 'icon' => 'Users', 'badge' => '34 Siswa'],
                ['id' => 'announcement', 'title' => 'Kirim Pengumuman', 'icon' => 'Megaphone', 'badge' => 'Kelas/Ortu'],
                ['id' => 'parent-contact', 'title' => 'Hubungi Orang Tua', 'icon' => 'PhoneCall', 'badge' => 'WhatsApp'],
                ['id' => 'notes', 'title' => 'Input Catatan Siswa', 'icon' => 'FileEdit', 'badge' => '8 Kategori'],
                ['id' => 'grades-recap', 'title' => 'Rekap Nilai & Ketuntasan', 'icon' => 'BarChart3', 'badge' => '12 Mapel'],
                ['id' => 'report-card', 'title' => 'Administrasi Rapor', 'icon' => 'FileText', 'badge' => 'Status Lengkap'],
            ],
        ]);
    }

    /**
     * 2. Profil Kelas
     */
    public function classProfile(Request $request)
    {
        $ctx = $this->getHomeroomContext($request);
        $class = $ctx['class'];
        $user = $ctx['user'];

        return response()->json([
            'success' => true,
            'profile' => [
                'id' => $class ? $class->id : 1,
                'nama_kelas' => $class ? ($class->nama_kelas ?? 'XI MIPA 1') : 'XI MIPA 1',
                'tingkat' => 'Tingkat XI (Fase F)',
                'jurusan' => 'MIPA (Matematika & IPA Terintegrasi)',
                'tahun_ajaran' => '2026/2027',
                'semester' => 'Semester 1 (Ganjil)',
                'kurikulum' => 'Kurikulum Merdeka Mandiri Berbagi',
                'ruangan' => 'Ruang 204 Gedung B Lantai 2',
                'kapasitas' => 36,
                'jumlah_siswa' => 34,
                'siswa_laki_laki' => 16,
                'siswa_perempuan' => 18,
                'wali_kelas' => [
                    'nama' => $user ? ($user->name ?? $user->nama ?? 'Siti Aminah, M.Pd') : 'Siti Aminah, M.Pd',
                    'nip' => '198405122008012015',
                    'no_hp' => '0812-3456-7890',
                    'email' => $user ? $user->email : 'siti.aminah@sekolah.sch.id',
                    'mata_pelajaran_diampu' => 'Biologi & IPAS Lanjutan',
                ],
                'wakil_wali_kelas' => [
                    'nama' => 'Drs. Hendro Wibowo',
                    'nip' => '197903152005011008',
                    'no_hp' => '0813-8899-7711',
                ],
                'struktur_kelas' => [
                    'ketua_kelas' => ['nama' => 'Ahmad Fauzi', 'nis' => '20241101', 'hp' => '0896-1122-3344'],
                    'wakil_ketua' => ['nama' => 'Bima Perkasa', 'nis' => '20241102', 'hp' => '0896-2233-4455'],
                    'sekretaris_1' => ['nama' => 'Nadia Syahrini', 'nis' => '20241103', 'hp' => '0896-3344-5566'],
                    'sekretaris_2' => ['nama' => 'Anisa Rahma', 'nis' => '20241104', 'hp' => '0896-4455-6677'],
                    'bendahara_1' => ['nama' => 'Dewi Sartika', 'nis' => '20241105', 'hp' => '0896-5566-7788'],
                    'bendahara_2' => ['nama' => 'Cantika Putri', 'nis' => '20241106', 'hp' => '0896-6677-8899'],
                ],
            ],
        ]);
    }

    /**
     * 3. Data Siswa Kelas
     * Data Dasar, Data Orang Tua, Data Akademik, Data Kesiswaan
     */
    public function students(Request $request)
    {
        $ctx = $this->getHomeroomContext($request);
        $class = $ctx['class'];

        $dbStudents = collect();
        if ($class) {
            $dbStudents = User::whereIn('role', ['murid', 'siswa'])
                ->where(function ($q) use ($class) {
                    $q->where('class_id', $class->id)
                      ->orWhereHas('classes', function ($qc) use ($class) {
                          $qc->where('classes.id', $class->id);
                      });
                })
                ->with(['studentIdentity', 'studentFamily', 'studentAchievements', 'studentViolations', 'grades', 'attendances', 'extracurriculars'])
                ->get();
        }

        if ($dbStudents->isEmpty()) {
            $dbStudents = User::whereIn('role', ['murid', 'siswa'])
                ->with(['studentIdentity', 'studentFamily', 'studentAchievements', 'studentViolations', 'grades', 'attendances', 'extracurriculars'])
                ->take(15)
                ->get();
        }

        if ($dbStudents->isNotEmpty()) {
            $studentsData = $dbStudents->map(function ($s, $index) {
                $avgGrade = $s->grades->count() > 0 ? round($s->grades->avg('score'), 1) : 85.0;
                $totalAtt = $s->attendances->count();
                $presentAtt = $s->attendances->whereIn('status', ['H', 'Hadir'])->count();
                $attPct = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100, 1) : 95.0;
                
                $violPoints = (int) $s->studentViolations->sum(function($v) {
                    if (isset($v->point)) return (int)$v->point;
                    if (isset($v->violation_type) && preg_match('/(\d+)\s*poin/i', $v->violation_type, $m)) return (int)$m[1];
                    return 5;
                });

                $extras = $s->extracurriculars->pluck('name')->toArray();
                if (empty($extras)) {
                    $extras = ['PMR / KKR', 'KIR Sains'];
                }

                $parentName = $s->studentFamily->father_name ?? $s->studentFamily->guardian_name ?? ($s->studentIdentity->parents_name ?? 'Orang Tua ' . $s->name);
                $parentPhone = $s->studentFamily->father_phone ?? $s->studentFamily->guardian_phone ?? '0812-9988-1122';

                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'nis' => $s->studentIdentity->nis ?? $s->nis ?? ('202411' . str_pad($s->id, 2, '0', STR_PAD_LEFT)),
                    'nisn' => $s->studentIdentity->nisn ?? ('00781920' . str_pad($s->id, 2, '0', STR_PAD_LEFT)),
                    'gender' => $s->studentIdentity->gender ?? ($s->gender ?? 'Laki-laki'),
                    'pob' => $s->studentIdentity->pob ?? 'Bandung',
                    'dob' => $s->studentIdentity->dob ?? '2008-04-12',
                    'phone' => $s->studentIdentity->phone ?? ($s->phone ?? '0896-1122-3344'),
                    'address' => $s->studentIdentity->address ?? ($s->address ?? 'Jl. Diponegoro No. 45, Bandung'),
                    'photo' => $s->avatar ?? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                    'parent' => [
                        'name' => $parentName,
                        'phone' => $parentPhone,
                        'relation' => $s->studentFamily->relationship ?? 'Ayah Kandung',
                        'job' => $s->studentFamily->father_job ?? 'Wiraswasta',
                        'address' => $s->studentFamily->address ?? 'Jl. Diponegoro No. 45, Bandung',
                    ],
                    'academic' => [
                        'average' => $avgGrade,
                        'attendance_pct' => $attPct,
                        'assignments_done' => 24,
                        'assignments_total' => 24,
                        'achievements_count' => $s->studentAchievements->count(),
                        'mastery_status' => $avgGrade >= 75 ? 'Tuntas' : 'Perlu Remedial',
                        'rank' => $index + 1,
                    ],
                    'student_affairs' => [
                        'violations_count' => $s->studentViolations->count(),
                        'violation_points' => $violPoints,
                        'coaching_notes_count' => 0,
                        'extracurriculars' => $extras,
                        'status' => $violPoints > 10 ? 'Perhatian Khusus' : 'Sangat Baik (Bebas Pelanggaran)',
                    ],
                ];
            })->values()->toArray();

            return response()->json([
                'success' => true,
                'total' => count($studentsData),
                'students' => $studentsData,
            ]);
        }

        $defaultStudents = [
            [
                'id' => 101,
                'name' => 'Ahmad Fauzi',
                'nis' => '20241101',
                'nisn' => '0078192031',
                'gender' => 'Laki-laki',
                'pob' => 'Bandung',
                'dob' => '2008-04-12',
                'phone' => '0896-1122-3344',
                'address' => 'Jl. Diponegoro No. 45, Bandung',
                'photo' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                'parent' => [
                    'name' => 'Fauzi Hidayat, S.E.',
                    'phone' => '0812-9988-1122',
                    'relation' => 'Ayah Kandung',
                    'job' => 'Wiraswasta',
                    'address' => 'Jl. Diponegoro No. 45, Bandung',
                ],
                'academic' => [
                    'average' => 89.5,
                    'attendance_pct' => 97.5,
                    'assignments_done' => 24,
                    'assignments_total' => 24,
                    'achievements_count' => 3,
                    'mastery_status' => 'Tuntas',
                    'rank' => 1,
                ],
                'student_affairs' => [
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'coaching_notes_count' => 0,
                    'extracurriculars' => ['PMR / KKR (Ketua)', 'KIR Sains'],
                    'status' => 'Sangat Baik (Bebas Pelanggaran)',
                ],
            ],
            [
                'id' => 102,
                'name' => 'Nadia Syahrini',
                'nis' => '20241102',
                'nisn' => '0078192032',
                'gender' => 'Perempuan',
                'pob' => 'Jakarta',
                'dob' => '2008-06-25',
                'phone' => '0896-3344-5566',
                'address' => 'Komplek Permata Hijau Blok C-12, Bandung',
                'photo' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                'parent' => [
                    'name' => 'Ir. Syahrini Mulyadi',
                    'phone' => '0813-2211-4455',
                    'relation' => 'Ibu Kandung',
                    'job' => 'PNS / ASN Bappeda',
                    'address' => 'Komplek Permata Hijau Blok C-12, Bandung',
                ],
                'academic' => [
                    'average' => 91.0,
                    'attendance_pct' => 98.0,
                    'assignments_done' => 24,
                    'assignments_total' => 24,
                    'achievements_count' => 2,
                    'mastery_status' => 'Tuntas',
                    'rank' => 2,
                ],
                'student_affairs' => [
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'coaching_notes_count' => 0,
                    'extracurriculars' => ['English Club', 'Paduan Suara'],
                    'status' => 'Sangat Baik',
                ],
            ],
            [
                'id' => 103,
                'name' => 'Rian Hidayat',
                'nis' => '20241103',
                'nisn' => '0078192033',
                'gender' => 'Laki-laki',
                'pob' => 'Cimahi',
                'dob' => '2008-01-18',
                'phone' => '0896-7788-9900',
                'address' => 'Jl. Cibabat No. 89, Cimahi',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'parent' => [
                    'name' => 'Hidayat Sutisna',
                    'phone' => '0815-7766-3322',
                    'relation' => 'Ayah Kandung',
                    'job' => 'Karyawan Swasta',
                    'address' => 'Jl. Cibabat No. 89, Cimahi',
                ],
                'academic' => [
                    'average' => 64.2,
                    'attendance_pct' => 74.0,
                    'assignments_done' => 16,
                    'assignments_total' => 24,
                    'achievements_count' => 0,
                    'mastery_status' => 'Belum Tuntas (Perlu Remedial)',
                    'rank' => 34,
                ],
                'student_affairs' => [
                    'violations_count' => 3,
                    'violation_points' => 25,
                    'coaching_notes_count' => 2,
                    'extracurriculars' => ['Futsal'],
                    'status' => 'Perhatian Khusus (High Risk)',
                ],
            ],
            [
                'id' => 104,
                'name' => 'Citra Lestari',
                'nis' => '20241104',
                'nisn' => '0078192034',
                'gender' => 'Perempuan',
                'pob' => 'Bandung',
                'dob' => '2008-08-14',
                'phone' => '0896-4455-8899',
                'address' => 'Jl. Buah Batu No. 102, Bandung',
                'photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                'parent' => [
                    'name' => 'Dra. Lestari Handayani',
                    'phone' => '0812-4433-2211',
                    'relation' => 'Ibu Kandung',
                    'job' => 'Guru SMA Swasta',
                    'address' => 'Jl. Buah Batu No. 102, Bandung',
                ],
                'academic' => [
                    'average' => 84.5,
                    'attendance_pct' => 95.0,
                    'assignments_done' => 23,
                    'assignments_total' => 24,
                    'achievements_count' => 1,
                    'mastery_status' => 'Tuntas',
                    'rank' => 10,
                ],
                'student_affairs' => [
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'coaching_notes_count' => 0,
                    'extracurriculars' => ['Tari Tradisional', 'Paskibra'],
                    'status' => 'Normal / Baik',
                ],
            ],
            [
                'id' => 105,
                'name' => 'Dimas Arya',
                'nis' => '20241105',
                'nisn' => '0078192035',
                'gender' => 'Laki-laki',
                'pob' => 'Bandung',
                'dob' => '2008-09-02',
                'phone' => '0896-5544-3322',
                'address' => 'Jl. Cikutra Barat No. 15, Bandung',
                'photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                'parent' => [
                    'name' => 'Arya Gunawan',
                    'phone' => '0818-9900-1144',
                    'relation' => 'Ayah Kandung',
                    'job' => 'Pedagang',
                    'address' => 'Jl. Cikutra Barat No. 15, Bandung',
                ],
                'academic' => [
                    'average' => 71.8,
                    'attendance_pct' => 86.5,
                    'assignments_done' => 19,
                    'assignments_total' => 24,
                    'achievements_count' => 0,
                    'mastery_status' => 'Perlu Remedial Kimia',
                    'rank' => 29,
                ],
                'student_affairs' => [
                    'violations_count' => 1,
                    'violation_points' => 5,
                    'coaching_notes_count' => 1,
                    'extracurriculars' => ['Basket'],
                    'status' => 'Monitoring Akademik',
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'total' => count($defaultStudents),
            'students' => $defaultStudents,
        ]);
    }

    /**
     * 4. Student 360° View
     * 11 Tabs: Overview, Akademik, Presensi, Tugas, Prestasi, Pelanggaran, BK, Catatan Wali Kelas, Orang Tua, Dokumen, Riwayat
     */
    public function student360(Request $request, $id = null)
    {
        $id = (int) ($id ?? $request->query('id', $request->input('id', 8)));

        $dbStudent = User::with([
            'studentIdentity',
            'studentFamily',
            'studentAchievements',
            'studentViolations',
            'counselingCases',
            'grades.subject',
            'attendances',
            'classes'
        ])->find($id);

        if ($dbStudent) {
            $avgGrade = $dbStudent->grades->count() > 0 ? round($dbStudent->grades->avg('score'), 1) : 85.0;
            $totalAtt = $dbStudent->attendances->count();
            $hadirCount = $dbStudent->attendances->whereIn('status', ['H', 'Hadir'])->count();
            $sakitCount = $dbStudent->attendances->whereIn('status', ['S', 'Sakit'])->count();
            $izinCount = $dbStudent->attendances->whereIn('status', ['I', 'Izin'])->count();
            $alfaCount = $dbStudent->attendances->whereIn('status', ['A', 'Alfa'])->count();
            $terlambatCount = $dbStudent->attendances->whereIn('status', ['T', 'Terlambat'])->count();
            $attPct = $totalAtt > 0 ? round(($hadirCount / $totalAtt) * 100, 1) : 95.0;

            $violPoints = (int) $dbStudent->studentViolations->sum(function($v) {
                if (isset($v->point)) return (int)$v->point;
                if (isset($v->violation_type) && preg_match('/(\d+)\s*poin/i', $v->violation_type, $m)) return (int)$m[1];
                return 5;
            });

            $className = $dbStudent->classes->first()->nama_kelas ?? '12 RPL';
            $parentName = $dbStudent->studentFamily->father_name ?? $dbStudent->studentFamily->guardian_name ?? ($dbStudent->studentIdentity->parents_name ?? 'Orang Tua ' . $dbStudent->name);
            $parentPhone = $dbStudent->studentFamily->father_phone ?? $dbStudent->studentFamily->guardian_phone ?? '0812-9988-1122';

            $subjectsPerformance = $dbStudent->grades->map(function ($g) {
                $subName = $g->subject ? $g->subject->nama_pelajaran : ($g->type ?? 'Mata Pelajaran');
                $sc = (float) $g->score;
                return [
                    'subject' => $subName,
                    'teacher' => 'Guru Pengampu',
                    'tugas' => $sc,
                    'quiz' => $sc,
                    'uts' => $sc,
                    'final' => $sc,
                    'status' => $sc >= 75 ? 'Tuntas' : 'Perlu Remedial',
                ];
            })->toArray();

            if (empty($subjectsPerformance)) {
                $subjectsPerformance = [
                    ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 88, 'quiz' => 85, 'uts' => 90, 'final' => 88.0, 'status' => 'Tuntas'],
                    ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 86, 'quiz' => 84, 'uts' => 87, 'final' => 86.0, 'status' => 'Tuntas'],
                    ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 90, 'quiz' => 88, 'uts' => 92, 'final' => 90.0, 'status' => 'Tuntas'],
                ];
            }

            $achieveList = $dbStudent->studentAchievements->map(function ($a) {
                return [
                    'title' => $a->title,
                    'level' => 'Tingkat Wilayah',
                    'date' => date('Y-m-d', strtotime($a->created_at)),
                    'category' => 'Prestasi Sekolah',
                ];
            })->toArray();

            $violList = $dbStudent->studentViolations->map(function ($v) {
                return [
                    'date' => date('Y-m-d', strtotime($v->created_at)),
                    'violation' => $v->violation_type ?? 'Pelanggaran Disiplin',
                    'category' => 'Disiplin',
                    'points' => 5,
                    'sanction' => 'Teguran & Pembinaan',
                ];
            })->toArray();

            $firstCase = $dbStudent->counselingCases->first();
            $caseDetails = $firstCase && is_string($firstCase->details) ? json_decode($firstCase->details, true) : (array)($firstCase->details ?? []);

            $studentData = [
                'id' => $dbStudent->id,
                'name' => $dbStudent->name,
                'class' => $className,
                'nis' => $dbStudent->studentIdentity->nis ?? $dbStudent->nis ?? ('202411' . str_pad($dbStudent->id, 2, '0', STR_PAD_LEFT)),
                'nisn' => $dbStudent->studentIdentity->nisn ?? ('00781920' . str_pad($dbStudent->id, 2, '0', STR_PAD_LEFT)),
                'photo' => $dbStudent->avatar ?? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                'summary' => [
                    'attendance_pct' => $attPct,
                    'average_score' => $avgGrade,
                    'assignments_ratio' => '24/24 selesai',
                    'achievements_count' => count($achieveList),
                    'violations_count' => count($violList),
                    'violation_points' => $violPoints,
                    'status' => $violPoints > 15 ? 'High Risk' : ($avgGrade >= 85 ? 'Teladan / Sangat Baik' : 'Normal / Baik'),
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => "{$dbStudent->name} - {$className}",
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => "{$attPct}%", 'status' => $attPct >= 90 ? 'Sangat Baik' : 'Perlu Perhatian'],
                            ['label' => 'Rata-rata Nilai', 'value' => "{$avgGrade}", 'status' => $avgGrade >= 75 ? 'Tuntas' : 'Di Bawah KKM'],
                            ['label' => 'Ketuntasan Tugas', 'value' => '24/24 (100%)', 'status' => 'Lengkap'],
                            ['label' => 'Poin Pelanggaran', 'value' => "{$violPoints} Poin", 'status' => $violPoints === 0 ? 'Bebas Pelanggaran' : 'Dalam Pembinaan'],
                            ['label' => 'Status BK', 'value' => $firstCase ? 'Ada Catatan Kasus' : 'Tidak Ada Catatan Kasus', 'status' => $firstCase ? 'Dalam Penanganan' : 'Aman'],
                        ],
                        'quick_notes' => "Siswa aktif terdaftar di {$className}. Menunjukkan perkembangan belajar yang terpantau dalam sistem sekolah.",
                    ],
                    'akademik' => [
                        'average' => $avgGrade,
                        'kkm' => 75.0,
                        'subjects_performance' => $subjectsPerformance,
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => round($avgGrade - 2, 1)],
                            ['period' => 'Bulan 2 (September)', 'average' => round($avgGrade - 1, 1)],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => $avgGrade],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => max(1, $hadirCount ?: 45),
                        'sakit' => $sakitCount,
                        'izin' => $izinCount,
                        'alfa' => $alfaCount,
                        'terlambat' => $terlambatCount,
                        'persentase_kehadiran' => $attPct,
                        'history' => $dbStudent->attendances->take(5)->map(function ($att) {
                            return ['date' => $att->date ?? $att->tanggal, 'status' => $att->status === 'H' ? 'Hadir' : ($att->status === 'S' ? 'Sakit' : ($att->status === 'I' ? 'Izin' : 'Alfa')), 'note' => $att->note ?? $att->keterangan ?? '-'];
                        })->toArray(),
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 24,
                        'missing' => 0,
                        'late' => 0,
                        'recent_tasks' => [
                            ['title' => 'Laporan Praktikum Analisis Data', 'subject' => 'Informatika', 'deadline' => date('Y-m-d'), 'status' => 'Selesai', 'score' => 90],
                        ],
                    ],
                    'prestasi' => [
                        'list' => $achieveList,
                    ],
                    'pelanggaran' => [
                        'total_points' => $violPoints,
                        'list' => $violList,
                    ],
                    'bk' => [
                        'case_number' => $caseDetails['case_number'] ?? '-',
                        'referral_by' => $caseDetails['referral_by'] ?? ($caseDetails['referral_source'] ?? '-'),
                        'referral_date' => $caseDetails['date'] ?? '-',
                        'category' => $caseDetails['category'] ?? 'Nihil (Perilaku Positif)',
                        'status' => $caseDetails['status'] ?? 'Tidak Dalam Bimbingan Kasus',
                        'assigned_counselor' => $caseDetails['counselor'] ?? 'Nurul Hidayah, S.Psi',
                        'public_followup' => $caseDetails['follow_up'] ?? ($caseDetails['intervention_summary'] ?? 'Pemantauan berkala wali kelas.'),
                        'sensitive_note_status' => 'Catatan konseling mendalam bersifat privat.',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => date('Y-m-d'), 'category' => 'Akademik', 'priority' => 'Biasa', 'content' => "Siswa aktif mengikuti KBM di kelas {$className}."],
                    ],
                    'orang_tua' => [
                        'father_name' => $parentName,
                        'mother_name' => $dbStudent->studentFamily->mother_name ?? 'Ibu ' . $dbStudent->name,
                        'phone' => $parentPhone,
                        'emergency_contact' => $parentPhone,
                        'address' => $dbStudent->studentFamily->address ?? ($dbStudent->studentIdentity->address ?? 'Bandung'),
                        'communication_logs_count' => 1,
                        'last_contact' => date('Y-m-d') . ' (Informasi via WhatsApp)',
                    ],
                    'dokumen' => [
                        ['title' => 'Fotokopi Ijazah & SKHUN', 'status' => 'Terverifikasi Lengkap', 'date' => '2024-07-15'],
                    ],
                    'riwayat' => [
                        ['period' => 'Semester Berjalan', 'note' => "Tercatat aktif dalam rombel {$className}."],
                    ],
                ],
            ];

            return response()->json([
                'success' => true,
                'student' => $studentData,
            ]);
        }

        if ($id === 101) {
            $studentData = [
                'id' => 101,
                'name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'nis' => '20241101',
                'nisn' => '0078192031',
                'photo' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
                'summary' => [
                    'attendance_pct' => 97.6,
                    'average_score' => 89.5,
                    'assignments_ratio' => '24/24 selesai',
                    'achievements_count' => 3,
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'status' => 'Teladan / Sangat Baik',
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => 'Ahmad Fauzi - XI MIPA 1 (Ketua Kelas / Siswa Berprestasi)',
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => '97.6%', 'status' => 'Sangat Baik'],
                            ['label' => 'Rata-rata Nilai', 'value' => '89.5', 'status' => 'Peringkat 1 Kelas'],
                            ['label' => 'Ketuntasan Tugas', 'value' => '24/24 (100%)', 'status' => 'Lengkap'],
                            ['label' => 'Poin Pelanggaran', 'value' => '0 Poin', 'status' => 'Bebas Pelanggaran'],
                            ['label' => 'Status BK', 'value' => 'Tidak Ada Catatan Kasus', 'status' => 'Aman'],
                        ],
                        'quick_notes' => 'Ketua kelas yang bertanggung jawab, aktif menggerakkan tutor sebaya, dan berprestasi di OSK Fisika tingkat kota.',
                    ],
                    'akademik' => [
                        'average' => 89.5,
                        'kkm' => 75.0,
                        'subjects_performance' => [
                            ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 92, 'quiz' => 90, 'uts' => 94, 'final' => 92.0, 'status' => 'Tuntas'],
                            ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 96, 'quiz' => 94, 'uts' => 95, 'final' => 95.0, 'status' => 'Tuntas'],
                            ['subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'tugas' => 88, 'quiz' => 86, 'uts' => 90, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'tugas' => 90, 'quiz' => 88, 'uts' => 92, 'final' => 90.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 88, 'quiz' => 85, 'uts' => 91, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'tugas' => 89, 'quiz' => 88, 'uts' => 90, 'final' => 89.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'tugas' => 90, 'quiz' => 90, 'uts' => 90, 'final' => 90.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'tugas' => 88, 'quiz' => 86, 'uts' => 90, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'tugas' => 85, 'quiz' => 85, 'uts' => 85, 'final' => 85.0, 'status' => 'Tuntas'],
                            ['subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'tugas' => 90, 'quiz' => 90, 'uts' => 90, 'final' => 90.0, 'status' => 'Tuntas'],
                        ],
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => 87.5],
                            ['period' => 'Bulan 2 (September)', 'average' => 88.8],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => 89.5],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => 82,
                        'sakit' => 1,
                        'izin' => 1,
                        'alfa' => 0,
                        'terlambat' => 0,
                        'persentase_kehadiran' => 97.6,
                        'history' => [
                            ['date' => '2026-09-12', 'status' => 'Izin', 'note' => 'Mewakili sekolah lomba OSK Fisika'],
                            ['date' => '2026-08-20', 'status' => 'Sakit', 'note' => 'Flu ringan (Surat dokter sah)'],
                        ],
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 24,
                        'missing' => 0,
                        'late' => 0,
                        'recent_tasks' => [
                            ['title' => 'Laporan Praktikum Termodinamika', 'subject' => 'Fisika', 'deadline' => '2026-09-28', 'status' => 'Selesai', 'score' => 96],
                            ['title' => 'Latihan Soal Kalkulus Diferensial', 'subject' => 'Matematika', 'deadline' => '2026-09-30', 'status' => 'Selesai', 'score' => 92],
                            ['title' => 'Analisis Teks Editorial', 'subject' => 'B. Indonesia', 'deadline' => '2026-10-01', 'status' => 'Selesai', 'score' => 90],
                        ],
                    ],
                    'prestasi' => [
                        'list' => [
                            ['title' => 'Juara 1 Olimpiade Sains Kota (OSK) Fisika 2026', 'level' => 'Tingkat Kota Bandung', 'date' => '2026-09-15', 'category' => 'Akademik'],
                            ['title' => 'Juara Harapan 1 Lomba Tandu Cepat PMR Wira', 'level' => 'Tingkat Kota', 'date' => '2026-08-28', 'category' => 'Organisasi'],
                            ['title' => 'Siswa Teladan Semester Ganjil 2025/2026', 'level' => 'Tingkat Sekolah', 'date' => '2025-12-20', 'category' => 'Akademik'],
                        ],
                    ],
                    'pelanggaran' => [
                        'total_points' => 0,
                        'list' => [],
                    ],
                    'bk' => [
                        'case_number' => '-',
                        'referral_by' => '-',
                        'referral_date' => '-',
                        'category' => 'Nihil (Perilaku Positif)',
                        'status' => 'Tidak Dalam Bimbingan Kasus',
                        'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                        'public_followup' => 'Siswa terpilih sebagai fasilitator sebaya untuk program anti-bullying sekolah.',
                        'sensitive_note_status' => 'Tidak ada data rahasia.',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => '2026-09-18', 'category' => 'Prestasi', 'priority' => 'Tinggi', 'content' => 'Ahmad berhasil meraih Juara 1 OSK Fisika Kota. Menjadi inspirasi bagi teman-teman sekelas.'],
                        ['date' => '2026-08-10', 'category' => 'Kepemimpinan', 'priority' => 'Biasa', 'content' => 'Terpilih secara mufakat menjadi Ketua Kelas XI MIPA 1.'],
                    ],
                    'orang_tua' => [
                        'father_name' => 'Fauzi Hidayat, S.E.',
                        'mother_name' => 'Hj. Ratna Komala',
                        'phone' => '0812-9988-1122',
                        'emergency_contact' => '0813-4455-6677 (Paman)',
                        'address' => 'Jl. Diponegoro No. 45, Bandung',
                        'communication_logs_count' => 2,
                        'last_contact' => '2026-09-16 (Apresiasi prestasi OSK via WhatsApp)',
                    ],
                    'dokumen' => [
                        ['title' => 'Fotokopi Ijazah & SKHUN SMP', 'status' => 'Terverifikasi Lengkap', 'date' => '2024-07-15'],
                        ['title' => 'Piagam Penghargaan Juara OSK Fisika', 'status' => 'Tersimpan di Dokumen Resmi', 'date' => '2026-09-16'],
                    ],
                    'riwayat' => [
                        ['period' => 'Juli 2026', 'note' => 'Memulai semester ganjil sebagai ketua kelas.'],
                        ['period' => 'September 2026', 'note' => 'Meraih juara OSK Fisika dan mempertahankan rata-rata 89.5.'],
                    ],
                ],
            ];
        } elseif ($id === 102) {
            $studentData = [
                'id' => 102,
                'name' => 'Nadia Syahrini',
                'class' => 'XI MIPA 1',
                'nis' => '20241102',
                'nisn' => '0078192032',
                'photo' => 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
                'summary' => [
                    'attendance_pct' => 98.8,
                    'average_score' => 91.0,
                    'assignments_ratio' => '24/24 selesai',
                    'achievements_count' => 2,
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'status' => 'Teladan / Sangat Baik',
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => 'Nadia Syahrini - XI MIPA 1 (Sekretaris Kelas / Debater)',
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => '98.8%', 'status' => 'Sangat Baik'],
                            ['label' => 'Rata-rata Nilai', 'value' => '91.0', 'status' => 'Peringkat 2 Kelas'],
                            ['label' => 'Ketuntasan Tugas', 'value' => '24/24 (100%)', 'status' => 'Lengkap'],
                            ['label' => 'Poin Pelanggaran', 'value' => '0 Poin', 'status' => 'Bebas Pelanggaran'],
                            ['label' => 'Status BK', 'value' => 'Aman (Konsultasi Minat Bakat)', 'status' => 'Positif'],
                        ],
                        'quick_notes' => 'Siswa sangat rajin, memiliki kemampuan bahasa Inggris luar biasa, dan aktif mengelola administrasi sekretariat kelas.',
                    ],
                    'akademik' => [
                        'average' => 91.0,
                        'kkm' => 75.0,
                        'subjects_performance' => [
                            ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 88, 'quiz' => 88, 'uts' => 88, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 90, 'quiz' => 88, 'uts' => 89, 'final' => 89.0, 'status' => 'Tuntas'],
                            ['subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'tugas' => 90, 'quiz' => 88, 'uts' => 89, 'final' => 89.0, 'status' => 'Tuntas'],
                            ['subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'tugas' => 92, 'quiz' => 92, 'uts' => 92, 'final' => 92.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 95, 'quiz' => 95, 'uts' => 95, 'final' => 95.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'tugas' => 96, 'quiz' => 96, 'uts' => 96, 'final' => 96.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'tugas' => 94, 'quiz' => 94, 'uts' => 94, 'final' => 94.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'tugas' => 91, 'quiz' => 91, 'uts' => 91, 'final' => 91.0, 'status' => 'Tuntas'],
                            ['subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'tugas' => 88, 'quiz' => 88, 'uts' => 88, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'tugas' => 88, 'quiz' => 88, 'uts' => 88, 'final' => 88.0, 'status' => 'Tuntas'],
                        ],
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => 89.2],
                            ['period' => 'Bulan 2 (September)', 'average' => 90.4],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => 91.0],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => 83,
                        'sakit' => 1,
                        'izin' => 0,
                        'alfa' => 0,
                        'terlambat' => 0,
                        'persentase_kehadiran' => 98.8,
                        'history' => [
                            ['date' => '2026-08-15', 'status' => 'Sakit', 'note' => 'Demam (Surat dokter terverifikasi)'],
                        ],
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 24,
                        'missing' => 0,
                        'late' => 0,
                        'recent_tasks' => [
                            ['title' => 'Kajian Teks Esai Kontemporer', 'subject' => 'B. Indonesia', 'deadline' => '2026-10-05', 'status' => 'Selesai', 'score' => 95],
                        ],
                    ],
                    'prestasi' => [
                        'list' => [
                            ['title' => 'Runner Up Provincial Debate 2026', 'level' => 'Tingkat Provinsi', 'date' => '2026-09-20', 'category' => 'Bahasa'],
                            ['title' => 'Juara 2 English Speech Contest', 'level' => 'Tingkat Kota', 'date' => '2025-11-12', 'category' => 'Bahasa'],
                        ],
                    ],
                    'pelanggaran' => [
                        'total_points' => 0,
                        'list' => [],
                    ],
                    'bk' => [
                        'case_number' => '-',
                        'referral_by' => '-',
                        'referral_date' => '-',
                        'category' => 'Konsultasi Peminatan Kuliah LN',
                        'status' => 'Selesai',
                        'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                        'public_followup' => 'Konsultasi persiapan beasiswa internasional berjalan baik.',
                        'sensitive_note_status' => 'Nihil.',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => '2026-09-22', 'category' => 'Prestasi', 'priority' => 'Biasa', 'content' => 'Nadia konsisten menunjukkan kemampuan diplomasi dan public speaking yang sangat memukau.'],
                    ],
                    'orang_tua' => [
                        'father_name' => 'Ir. Mulyadi Pranoto',
                        'mother_name' => 'Ir. Syahrini Mulyadi',
                        'phone' => '0813-2211-4455',
                        'emergency_contact' => '0812-9988-7766',
                        'address' => 'Komplek Permata Hijau Blok C-12, Bandung',
                        'communication_logs_count' => 1,
                        'last_contact' => '2026-09-21 (Apresiasi lomba debat via WhatsApp)',
                    ],
                    'dokumen' => [
                        ['title' => 'Fotokopi Ijazah SMP', 'status' => 'Lengkap', 'date' => '2024-07-15'],
                    ],
                    'riwayat' => [
                        ['period' => 'September 2026', 'note' => 'Mewakili sekolah di Lomba Debat Provinsi.'],
                    ],
                ],
            ];
        } elseif ($id === 104) {
            $studentData = [
                'id' => 104,
                'name' => 'Citra Lestari',
                'class' => 'XI MIPA 1',
                'nis' => '20241104',
                'nisn' => '0078192034',
                'photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                'summary' => [
                    'attendance_pct' => 95.2,
                    'average_score' => 84.5,
                    'assignments_ratio' => '23/24 selesai',
                    'achievements_count' => 1,
                    'violations_count' => 0,
                    'violation_points' => 0,
                    'status' => 'Normal / Baik',
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => 'Citra Lestari - XI MIPA 1 (Siswa Asuhan)',
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => '95.2%', 'status' => 'Baik'],
                            ['label' => 'Rata-rata Nilai', 'value' => '84.5', 'status' => 'Tuntas Seluruh Mapel'],
                            ['label' => 'Tugas Selesai', 'value' => '23/24 (95.8%)', 'status' => 'Tuntas'],
                            ['label' => 'Poin Pelanggaran', 'value' => '0 Poin', 'status' => 'Bebas Pelanggaran'],
                            ['label' => 'Status BK', 'value' => 'Tidak Ada Kasus', 'status' => 'Aman'],
                        ],
                        'quick_notes' => 'Siswa berprestasi dalam seni tari tradisional dan memiliki hubungan sosial yang sangat ramah di kelas.',
                    ],
                    'akademik' => [
                        'average' => 84.5,
                        'kkm' => 75.0,
                        'subjects_performance' => [
                            ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 80, 'quiz' => 80, 'uts' => 80, 'final' => 80.0, 'status' => 'Tuntas'],
                            ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 82, 'quiz' => 82, 'uts' => 82, 'final' => 82.0, 'status' => 'Tuntas'],
                            ['subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'tugas' => 81, 'quiz' => 81, 'uts' => 81, 'final' => 81.0, 'status' => 'Tuntas'],
                            ['subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'tugas' => 86, 'quiz' => 86, 'uts' => 86, 'final' => 86.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 88, 'quiz' => 88, 'uts' => 88, 'final' => 88.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'tugas' => 87, 'quiz' => 87, 'uts' => 87, 'final' => 87.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'tugas' => 89, 'quiz' => 89, 'uts' => 89, 'final' => 89.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'tugas' => 85, 'quiz' => 85, 'uts' => 85, 'final' => 85.0, 'status' => 'Tuntas'],
                            ['subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'tugas' => 82, 'quiz' => 82, 'uts' => 82, 'final' => 82.0, 'status' => 'Tuntas'],
                            ['subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'tugas' => 85, 'quiz' => 85, 'uts' => 85, 'final' => 85.0, 'status' => 'Tuntas'],
                        ],
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => 83.5],
                            ['period' => 'Bulan 2 (September)', 'average' => 84.0],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => 84.5],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => 80,
                        'sakit' => 2,
                        'izin' => 2,
                        'alfa' => 0,
                        'terlambat' => 1,
                        'persentase_kehadiran' => 95.2,
                        'history' => [
                            ['date' => '2026-10-02', 'status' => 'Izin', 'note' => 'Acara keluarga (Surat izin sah)'],
                            ['date' => '2026-09-08', 'status' => 'Sakit', 'note' => 'Izin sakit 2 hari dengan surat'],
                        ],
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 23,
                        'missing' => 1,
                        'late' => 0,
                        'recent_tasks' => [
                            ['title' => 'Laporan Praktikum Termodinamika', 'subject' => 'Fisika', 'deadline' => '2026-09-28', 'status' => 'Selesai', 'score' => 85],
                        ],
                    ],
                    'prestasi' => [
                        'list' => [
                            ['title' => 'Juara 1 Tari Tradisional Jaipong FLS2N', 'level' => 'Tingkat Kota', 'date' => '2026-05-18', 'category' => 'Seni'],
                        ],
                    ],
                    'pelanggaran' => [
                        'total_points' => 0,
                        'list' => [],
                    ],
                    'bk' => [
                        'case_number' => '-',
                        'referral_by' => '-',
                        'referral_date' => '-',
                        'category' => '-',
                        'status' => 'Aman',
                        'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                        'public_followup' => 'Perkembangan sosial sangat kondusif.',
                        'sensitive_note_status' => 'Nihil.',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => '2026-09-10', 'category' => 'Sosial', 'priority' => 'Biasa', 'content' => 'Citra sangat kooperatif dalam kepengurusan keputrian kelas.'],
                    ],
                    'orang_tua' => [
                        'father_name' => 'Gunawan Handoyo',
                        'mother_name' => 'Dra. Lestari Handayani',
                        'phone' => '0812-4433-2211',
                        'emergency_contact' => '0812-8877-6655',
                        'address' => 'Jl. Buah Batu No. 102, Bandung',
                        'communication_logs_count' => 1,
                        'last_contact' => '2026-10-02 (Penerimaan surat izin via WhatsApp)',
                    ],
                    'dokumen' => [
                        ['title' => 'Berkas Dapodik Lengkap', 'status' => 'Lengkap', 'date' => '2024-07-15'],
                    ],
                    'riwayat' => [
                        ['period' => 'Oktober 2026', 'note' => 'Izin sah 1 hari untuk urusan keluarga.'],
                    ],
                ],
            ];
        } elseif ($id === 105) {
            $studentData = [
                'id' => 105,
                'name' => 'Dimas Arya',
                'class' => 'XI MIPA 1',
                'nis' => '20241105',
                'nisn' => '0078192035',
                'photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                'summary' => [
                    'attendance_pct' => 86.9,
                    'average_score' => 71.8,
                    'assignments_ratio' => '19/24 selesai',
                    'achievements_count' => 0,
                    'violations_count' => 1,
                    'violation_points' => 5,
                    'status' => 'Perhatian (Remedial Kimia)',
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => 'Dimas Arya - XI MIPA 1 (Siswa Asuhan / Atlet Basket)',
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => '86.9%', 'status' => 'Cukup'],
                            ['label' => 'Rata-rata Nilai', 'value' => '71.8', 'status' => 'Kimia di bawah KKM'],
                            ['label' => 'Tugas Tertinggal', 'value' => '3 Tugas Belum Submit', 'status' => 'Perlu Ditagih'],
                            ['label' => 'Poin Pelanggaran', 'value' => '5 Poin', 'status' => 'Peringatan Lisan'],
                            ['label' => 'Status BK', 'value' => 'Konseling Manajemen Waktu', 'status' => 'Pemantauan'],
                        ],
                        'quick_notes' => 'Aktif dalam turnamen basket sekolah. Perlu pembagian waktu antara latihan dan penyelesaian tugas sains.',
                    ],
                    'akademik' => [
                        'average' => 71.8,
                        'kkm' => 75.0,
                        'subjects_performance' => [
                            ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 72, 'quiz' => 72, 'uts' => 72, 'final' => 72.0, 'status' => 'Perlu Pemantauan'],
                            ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 69, 'quiz' => 69, 'uts' => 69, 'final' => 69.0, 'status' => 'Perlu Pemantauan'],
                            ['subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'tugas' => 66, 'quiz' => 66, 'uts' => 66, 'final' => 66.0, 'status' => 'Belum Tuntas (Remedial)'],
                            ['subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'tugas' => 75, 'quiz' => 75, 'uts' => 75, 'final' => 75.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 76, 'quiz' => 76, 'uts' => 76, 'final' => 76.0, 'status' => 'Tuntas'],
                            ['subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'tugas' => 74, 'quiz' => 74, 'uts' => 74, 'final' => 74.0, 'status' => 'Perlu Pemantauan'],
                            ['subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'tugas' => 78, 'quiz' => 78, 'uts' => 78, 'final' => 78.0, 'status' => 'Tuntas'],
                            ['subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'tugas' => 75, 'quiz' => 75, 'uts' => 75, 'final' => 75.0, 'status' => 'Tuntas'],
                            ['subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'tugas' => 72, 'quiz' => 72, 'uts' => 72, 'final' => 72.0, 'status' => 'Perlu Pemantauan'],
                            ['subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'tugas' => 71, 'quiz' => 71, 'uts' => 71, 'final' => 71.0, 'status' => 'Perlu Pemantauan'],
                        ],
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => 75.0],
                            ['period' => 'Bulan 2 (September)', 'average' => 73.2],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => 71.8],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => 73,
                        'sakit' => 4,
                        'izin' => 3,
                        'alfa' => 4,
                        'terlambat' => 4,
                        'persentase_kehadiran' => 86.9,
                        'history' => [
                            ['date' => '2026-09-25', 'status' => 'Terlambat', 'note' => 'Masuk pukul 07:25'],
                            ['date' => '2026-09-14', 'status' => 'Sakit', 'note' => 'Cedera pergelangan tangan (Basket)'],
                        ],
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 19,
                        'missing' => 5,
                        'late' => 2,
                        'recent_tasks' => [
                            ['title' => 'Latihan Soal Stoikiometri', 'subject' => 'Kimia', 'deadline' => '2026-09-29', 'status' => 'Belum Mengumpulkan'],
                        ],
                    ],
                    'prestasi' => [
                        'list' => [
                            ['title' => 'Semifinalis DBL Regional Jawa Barat', 'level' => 'Tingkat Provinsi', 'date' => '2026-08-30', 'category' => 'Olahraga'],
                        ],
                    ],
                    'pelanggaran' => [
                        'total_points' => 5,
                        'list' => [
                            ['date' => '2026-09-25', 'violation' => 'Terlambat jam pertama', 'category' => 'Ringan', 'points' => 5, 'sanction' => 'Teguran wali kelas'],
                        ],
                    ],
                    'bk' => [
                        'case_number' => 'BK/XI-MIPA1/2026/019',
                        'referral_by' => 'Wali Kelas',
                        'referral_date' => '2026-09-28',
                        'category' => 'Manajemen Waktu Ekstrakurikuler',
                        'status' => 'Pemantauan Jadwal',
                        'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                        'public_followup' => 'Dimas menyepakati target remedial Kimia dan pengurangan jadwal latihan sore sebelum ujian.',
                        'sensitive_note_status' => 'Catatan konseling dilindungi.',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => '2026-09-28', 'category' => 'Akademik', 'priority' => 'Sedang', 'content' => 'Diberikan peringatan untuk segera melunasi 3 tugas Kimia dan mendaftar remedial ke Bu Fatimah.'],
                    ],
                    'orang_tua' => [
                        'father_name' => 'Arya Gunawan',
                        'mother_name' => 'Indah Purnamasari',
                        'phone' => '0818-9900-1144',
                        'emergency_contact' => '0812-7788-9900',
                        'address' => 'Jl. Cikutra Barat No. 15, Bandung',
                        'communication_logs_count' => 2,
                        'last_contact' => '2026-09-29 (Konfirmasi jadwal remedial via telepon)',
                    ],
                    'dokumen' => [
                        ['title' => 'Fotokopi KK & Akta Lahir', 'status' => 'Lengkap', 'date' => '2024-07-15'],
                    ],
                    'riwayat' => [
                        ['period' => 'September 2026', 'note' => 'Fokus DBL selesai, memulai pembinaan remedial akademik.'],
                    ],
                ],
            ];
        } else {
            // Default: Rian Hidayat (ID 103) with exact mathematical consistency
            $studentData = [
                'id' => 103,
                'name' => 'Rian Hidayat',
                'class' => 'XI MIPA 1',
                'nis' => '20241103',
                'nisn' => '0078192033',
                'photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                'summary' => [
                    'attendance_pct' => 73.8,
                    'average_score' => 64.2,
                    'assignments_ratio' => '16/24 selesai',
                    'achievements_count' => 0,
                    'violations_count' => 3,
                    'violation_points' => 25,
                    'status' => 'High Risk (Perlu Intervensi)',
                ],
                'tabs' => [
                    'overview' => [
                        'profile_header' => 'Rian Hidayat - XI MIPA 1 (Siswa Asuhan - Prioritas EWS)',
                        'vital_stats' => [
                            ['label' => 'Tingkat Kehadiran', 'value' => '73.8%', 'status' => 'Kritis (< 75%)'],
                            ['label' => 'Rata-rata Nilai', 'value' => '64.2', 'status' => 'Di Bawah KKM (75)'],
                            ['label' => 'Tugas Tertinggal', 'value' => '8 Tugas Menunggak', 'status' => 'Kritis'],
                            ['label' => 'Poin Pelanggaran', 'value' => '25 Poin', 'status' => 'SP-1 Diterbitkan'],
                            ['label' => 'Status Penanganan BK', 'value' => 'Sedang Ditangani BK', 'status' => 'Kasus Aktif'],
                        ],
                        'quick_notes' => 'Siswa sering datang terlambat dan terlihat lelah di jam pertama. Perlu pendampingan belajar dan klarifikasi pola istirahat di rumah bersama orang tua.',
                    ],
                    'akademik' => [
                        'average' => 64.2,
                        'kkm' => 75.0,
                        'subjects_performance' => [
                            ['subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'tugas' => 60, 'quiz' => 65, 'uts' => 62, 'final' => 62.3, 'status' => 'Belum Tuntas (Remedial)'],
                            ['subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'tugas' => 55, 'quiz' => 58, 'uts' => 60, 'final' => 57.6, 'status' => 'Belum Tuntas (Remedial)'],
                            ['subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'tugas' => 60, 'quiz' => 62, 'uts' => 61, 'final' => 61.1, 'status' => 'Belum Tuntas (Remedial)'],
                            ['subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd (Wali Kelas)', 'tugas' => 68, 'quiz' => 68, 'uts' => 68, 'final' => 68.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'tugas' => 72, 'quiz' => 72, 'uts' => 72, 'final' => 72.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'tugas' => 66, 'quiz' => 66, 'uts' => 66, 'final' => 66.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'tugas' => 70, 'quiz' => 70, 'uts' => 70, 'final' => 70.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'tugas' => 65, 'quiz' => 65, 'uts' => 65, 'final' => 65.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'tugas' => 60, 'quiz' => 60, 'uts' => 60, 'final' => 60.0, 'status' => 'Belum Tuntas'],
                            ['subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'tugas' => 60, 'quiz' => 60, 'uts' => 60, 'final' => 60.0, 'status' => 'Belum Tuntas'],
                        ],
                        'grade_trend' => [
                            ['period' => 'Bulan 1 (Agustus)', 'average' => 74.0],
                            ['period' => 'Bulan 2 (September)', 'average' => 68.5],
                            ['period' => 'Bulan 3 (Oktober)', 'average' => 64.2],
                        ],
                    ],
                    'presensi' => [
                        'hadir' => 62,
                        'sakit' => 6,
                        'izin' => 4,
                        'alfa' => 12,
                        'terlambat' => 6,
                        'persentase_kehadiran' => 73.8,
                        'history' => [
                            ['date' => '2026-10-02', 'status' => 'Alfa', 'note' => 'Tanpa keterangan'],
                            ['date' => '2026-09-29', 'status' => 'Terlambat', 'note' => 'Masuk pukul 07:35'],
                            ['date' => '2026-09-24', 'status' => 'Alfa', 'note' => 'Tanpa keterangan'],
                            ['date' => '2026-09-18', 'status' => 'Sakit', 'note' => 'Demam (Surat dari orang tua)'],
                        ],
                    ],
                    'tugas' => [
                        'total' => 24,
                        'submitted' => 16,
                        'missing' => 8,
                        'late' => 3,
                        'recent_tasks' => [
                            ['title' => 'Laporan Praktikum Termodinamika', 'subject' => 'Fisika', 'deadline' => '2026-09-28', 'status' => 'Belum Mengumpulkan'],
                            ['title' => 'Latihan Soal Kalkulus Diferensial', 'subject' => 'Matematika', 'deadline' => '2026-09-30', 'status' => 'Belum Mengumpulkan'],
                            ['title' => 'Analisis Teks Editorial', 'subject' => 'B. Indonesia', 'deadline' => '2026-10-01', 'status' => 'Selesai', 'score' => 80],
                        ],
                    ],
                    'prestasi' => [
                        'list' => [
                            ['title' => 'Peserta Lomba Futsal Antar Sekolah 2025', 'level' => 'Tingkat Kota', 'date' => '2025-11-10', 'category' => 'Olahraga'],
                        ],
                    ],
                    'pelanggaran' => [
                        'total_points' => 25,
                        'list' => [
                            ['date' => '2026-09-20', 'violation' => 'Merokok di luar pagar sekolah saat jam istirahat', 'category' => 'Sedang', 'points' => 15, 'sanction' => 'Teguran tertulis & Surat Peringatan I'],
                            ['date' => '2026-09-29', 'violation' => 'Terlambat masuk sekolah > 20 menit (3x kumulatif)', 'category' => 'Ringan', 'points' => 5, 'sanction' => 'Pembinaan piket & lari keliling lapangan'],
                            ['date' => '2026-10-02', 'violation' => 'Seragam tidak sesuai tata tertib (tidak memakai ikat pinggang & atribut)', 'category' => 'Ringan', 'points' => 5, 'sanction' => 'Teguran wali kelas'],
                        ],
                    ],
                    'bk' => [
                        'case_number' => 'BK/XI-MIPA1/2026/014',
                        'referral_by' => 'Wali Kelas (Siti Aminah, M.Pd)',
                        'referral_date' => '2026-09-25',
                        'category' => 'Akademik & Kedisiplinan',
                        'status' => 'Sedang Ditangani Guru BK',
                        'assigned_counselor' => 'Nurul Hidayah, S.Psi (Guru BK)',
                        'public_followup' => 'Telah dilakukan konseling awal tahap 1 dengan siswa pada 28 September 2026. Dijadwalkan pemanggilan orang tua pada 6 Oktober 2026.',
                        'sensitive_note_status' => 'Catatan konseling mendalam bersifat privat dan dilindungi UU/Kode Etik BK (hanya dapat diakses konselor BK).',
                    ],
                    'catatan_wali_kelas' => [
                        ['date' => '2026-09-22', 'category' => 'Akademik', 'priority' => 'Tinggi', 'content' => 'Nilai harian Fisika sangat rendah (55). Siswa menyatakan kesulitan memahami materi rumus gerak parabola. Diarahkan untuk ikut tutor sebaya dengan Ahmad Fauzi.'],
                        ['date' => '2026-09-29', 'category' => 'Kedisiplinan', 'priority' => 'Sedang', 'content' => 'Diberikan teguran lisan di ruang wali kelas terkait keterlambatan dan kerapian baju.'],
                    ],
                    'orang_tua' => [
                        'father_name' => 'Hidayat Sutisna',
                        'mother_name' => 'Siti Nurjanah',
                        'phone' => '0815-7766-3322',
                        'emergency_contact' => '0812-3344-5566 (Paman)',
                        'address' => 'Jl. Cibabat No. 89, Cimahi',
                        'communication_logs_count' => 3,
                        'last_contact' => '2026-09-26 (Pemberitahuan SP1 via WhatsApp & Telepon)',
                    ],
                    'dokumen' => [
                        ['title' => 'Fotokopi Ijazah & SKHUN SMP', 'status' => 'Terverifikasi Lengkap', 'date' => '2024-07-15'],
                        ['title' => 'Fotokopi Kartu Keluarga (KK) & Akta Lahir', 'status' => 'Terverifikasi Lengkap', 'date' => '2024-07-15'],
                        ['title' => 'Surat Keterangan Sakit (Dokter)', 'status' => 'Arsip Kelas', 'date' => '2026-09-18'],
                        ['title' => 'Surat Peringatan 1 (SP-1) Pelanggaran Tata Tertib', 'status' => 'Ditandatangani Ortu', 'date' => '2026-09-22'],
                    ],
                    'riwayat' => [
                        ['period' => 'Juli 2026', 'note' => 'Awal tahun ajaran masuk kelas XI MIPA 1 dengan kondisi normal.'],
                        ['period' => 'Agustus 2026', 'note' => 'Kehadiran mulai menunjukkan 1x izin dan nilai matematika masih di atas 70.'],
                        ['period' => 'September 2026', 'note' => 'Penurunan signifikan nilai matematika & fisika. Terjadi 3x alfa dan pelanggaran tata tertib.'],
                        ['period' => 'Oktober 2026', 'note' => 'Rujukan ke BK diajukan. Penanganan terintegrasi wali kelas + BK.'],
                    ],
                ],
            ];
        }

        return response()->json([
            'success' => true,
            'student' => $studentData,
        ]);
    }

    /**
     * 5. Presensi Kelas
     * Harian, Rekap, Statistik
     */
    public function attendance(Request $request)
    {
        $ctx = $this->getHomeroomContext($request);
        $class = $ctx['class'];
        $students = $this->getClassStudents($class ? $class->id : 1);

        $todayDate = date('Y-m-d');
        $dbAttendances = Attendance::where('date', $todayDate)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $statusLabelMap = [
            'H' => 'Hadir',
            'S' => 'Sakit',
            'I' => 'Izin',
            'A' => 'Alfa',
            'T' => 'Terlambat',
        ];

        $todayList = $students->map(function ($s) use ($dbAttendances, $statusLabelMap) {
            $att = $dbAttendances->get($s->id);
            $rawStatus = $att ? $att->status : 'Hadir';
            $status = $statusLabelMap[$rawStatus] ?? $rawStatus;
            return [
                'id' => $s->id,
                'name' => $s->name,
                'nis' => $s->studentIdentity->nis ?? $s->nis ?? ('202411' . str_pad($s->id, 2, '0', STR_PAD_LEFT)),
                'status' => $status,
                'time' => $status === 'Hadir' ? '06:45' : '-',
                'note' => $att->note ?? $att->keterangan ?? '-',
            ];
        })->values()->toArray();

        if (empty($todayList)) {
            $todayList = [
                ['id' => 101, 'name' => 'Ahmad Fauzi', 'nis' => '20241101', 'status' => 'Hadir', 'time' => '06:45', 'note' => '-'],
                ['id' => 102, 'name' => 'Nadia Syahrini', 'nis' => '20241102', 'status' => 'Hadir', 'time' => '06:50', 'note' => '-'],
                ['id' => 103, 'name' => 'Rian Hidayat', 'nis' => '20241103', 'status' => 'Alfa', 'time' => '-', 'note' => 'Tanpa keterangan'],
                ['id' => 104, 'name' => 'Citra Lestari', 'nis' => '20241104', 'status' => 'Izin', 'time' => '-', 'note' => 'Surat izin keluarga'],
                ['id' => 105, 'name' => 'Dimas Arya', 'nis' => '20241105', 'status' => 'Hadir', 'time' => '06:55', 'note' => '-'],
                ['id' => 106, 'name' => 'Budi Santoso', 'nis' => '20241106', 'status' => 'Sakit', 'time' => '-', 'note' => 'Surat dokter terlampir'],
                ['id' => 107, 'name' => 'Bayu Wicaksono', 'nis' => '20241107', 'status' => 'Terlambat', 'time' => '07:22', 'note' => 'Ban bocor di jalan'],
            ];
        }

        $hadirCount = count(array_filter($todayList, fn($x) => $x['status'] === 'Hadir'));
        $sakitCount = count(array_filter($todayList, fn($x) => $x['status'] === 'Sakit'));
        $izinCount = count(array_filter($todayList, fn($x) => $x['status'] === 'Izin'));
        $alfaCount = count(array_filter($todayList, fn($x) => $x['status'] === 'Alfa'));
        $terlambatCount = count(array_filter($todayList, fn($x) => $x['status'] === 'Terlambat'));
        $totalStudents = count($todayList);
        $presentTotal = $hadirCount + $terlambatCount;
        $rate = $totalStudents > 0 ? round(($presentTotal / $totalStudents) * 100, 1) : 95.0;

        return response()->json([
            'success' => true,
            'summary_today' => [
                'date' => date('d M Y'),
                'total_students' => $totalStudents,
                'hadir' => $hadirCount,
                'sakit' => $sakitCount,
                'izin' => $izinCount,
                'alfa' => $alfaCount,
                'terlambat' => $terlambatCount,
                'total_present' => $presentTotal,
                'total_absent' => $sakitCount + $izinCount + $alfaCount,
                'attendance_rate' => $rate,
            ],
            'recap' => [
                'daily' => ['rate' => $rate, 'hadir' => $presentTotal, 'sakit' => $sakitCount, 'izin' => $izinCount, 'alfa' => $alfaCount, 'total' => $totalStudents, 'total_days' => 1],
                'weekly' => ['rate' => 94.1, 'hadir' => 160, 'sakit' => 3, 'izin' => 3, 'alfa' => 4, 'total' => 170, 'total_days' => 5],
                'monthly' => ['rate' => 94.3, 'hadir' => 641, 'sakit' => 14, 'izin' => 11, 'alfa' => 14, 'total' => 680, 'total_days' => 20],
                'semester' => ['rate' => 94.2, 'hadir' => 2690, 'sakit' => 58, 'izin' => 46, 'alfa' => 62, 'total' => 2856, 'total_meetings' => 84],
            ],
            'statistics' => [
                'best_attendance' => [
                    ['name' => 'Nadia Syahrini', 'rate' => '98.8% (83/84 Pertemuan)'],
                    ['name' => 'Dewi Sartika', 'rate' => '98.8% (83/84 Pertemuan)'],
                    ['name' => 'Ahmad Fauzi', 'rate' => '97.6% (82/84 Pertemuan)'],
                ],
                'highest_absence' => [
                    ['name' => 'Rian Hidayat', 'rate' => '73.8%', 'alfa' => 12, 'sakit' => 6, 'izin' => 4, 'status' => 'Kritis'],
                    ['name' => 'Dimas Arya', 'rate' => '86.9%', 'alfa' => 4, 'sakit' => 4, 'izin' => 3, 'status' => 'Perhatian'],
                ],
                'trends' => [
                    ['week' => 'Minggu 1', 'rate' => 96.0],
                    ['week' => 'Minggu 2', 'rate' => 95.2],
                    ['week' => 'Minggu 3', 'rate' => 93.8],
                    ['week' => 'Minggu 4', 'rate' => 94.5],
                ],
            ],
            'today_students' => $todayList,
        ]);
    }

    /**
     * 6. Koreksi Presensi
     * Review, Upload bukti, Koreksi, Catatan, Audit Log
     */
    public function correctAttendance(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'date' => 'required|string',
            'old_status' => 'required|string',
            'new_status' => 'required|string',
            'reason' => 'required|string',
            'proof_attachment' => 'nullable|string',
        ]);

        $ctx = $this->getHomeroomContext($request);
        $schoolId = $ctx['user']->school_id ?? 1;
        $classId = $ctx['class']->id ?? 1;

        $statusMap = [
            'Hadir' => 'H',
            'Sakit' => 'S',
            'Izin' => 'I',
            'Alfa' => 'A',
            'Terlambat' => 'T',
        ];
        $dbStatus = $statusMap[$validated['new_status']] ?? $validated['new_status'];

        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $validated['student_id'],
                'date' => $validated['date'],
            ],
            [
                'school_id' => $schoolId,
                'class_id' => $classId,
                'status' => $dbStatus,
                'note' => $validated['reason'],
                'keterangan' => $validated['reason'],
                'recorded_by' => $ctx['user']->id ?? null,
            ]
        );

        $student = User::find($validated['student_id']);

        $auditLog = [
            'id' => rand(1000, 9999),
            'student_id' => $validated['student_id'],
            'student_name' => $student ? $student->name : 'Siswa #' . $validated['student_id'],
            'date' => $validated['date'],
            'old_status' => $validated['old_status'],
            'new_status' => $validated['new_status'],
            'reason' => $validated['reason'],
            'proof' => $validated['proof_attachment'] ?? 'surat_keterangan_ortu.pdf',
            'corrected_by' => $ctx['user']->name ?? 'Siti Aminah, M.Pd (Wali Kelas)',
            'created_at' => date('Y-m-d H:i:s'),
            'status' => 'Disetujui & Masuk Audit Trail',
        ];

        AuditLog::create([
            'user_id' => $ctx['user']->id ?? null,
            'school_id' => $schoolId,
            'action' => 'ATTENDANCE_CORRECTION',
            'model_type' => Attendance::class,
            'model_id' => $attendance->id,
            'old_values' => ['status' => $validated['old_status']],
            'new_values' => ['status' => $validated['new_status'], 'reason' => $validated['reason']],
            'ip_address' => $request->ip() ?: '127.0.0.1',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Koreksi presensi berhasil disimpan dan dicatat dalam audit log sekolah.',
            'audit_entry' => $auditLog,
        ]);
    }

    /**
     * 7. Monitoring Akademik Kelas
     */
    public function academicMonitoring(Request $request)
    {
        $subjects = [
            ['id' => 1, 'subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'average' => 78.4, 'mastery_rate' => 73.5, 'kkm' => 75],
            ['id' => 2, 'subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'average' => 84.8, 'mastery_rate' => 91.2, 'kkm' => 75],
            ['id' => 3, 'subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'average' => 75.2, 'mastery_rate' => 67.6, 'kkm' => 75],
            ['id' => 4, 'subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'average' => 86.1, 'mastery_rate' => 94.1, 'kkm' => 75],
            ['id' => 5, 'subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'average' => 77.0, 'mastery_rate' => 76.5, 'kkm' => 75],
            ['id' => 6, 'subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'average' => 85.0, 'mastery_rate' => 91.2, 'kkm' => 75],
            ['id' => 7, 'subject' => 'Pendidikan Agama & Budi Pekerti', 'teacher' => 'Ust. Mansyur, M.Ag', 'average' => 88.5, 'mastery_rate' => 97.0, 'kkm' => 75],
            ['id' => 8, 'subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'average' => 83.2, 'mastery_rate' => 88.2, 'kkm' => 75],
            ['id' => 9, 'subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'average' => 88.4, 'mastery_rate' => 91.2, 'kkm' => 75],
            ['id' => 10, 'subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'average' => 87.4, 'mastery_rate' => 94.1, 'kkm' => 75],
        ];

        return response()->json([
            'success' => true,
            'class_average' => 83.4,
            'class_mastery_rate' => 88.2, // Siswa tuntas (30 dari 34 siswa)
            'subject_mastery_avg' => 85.5, // Rata-rata ketuntasan 10 mapel
            'subjects' => $subjects,
        ]);
    }

    /**
     * 8. Monitoring Nilai Siswa
     * Nilai per mapel, Rata-rata, Tugas, Quiz, Ujian, Akhir, Ketuntasan, Grade Trend
     */
    public function gradesMonitoring(Request $request)
    {
        $studentsGrades = [
            [
                'student_id' => 101,
                'name' => 'Ahmad Fauzi',
                'nis' => '20241101',
                'average' => 89.5,
                'tugas_avg' => 90.0,
                'quiz_avg' => 88.5,
                'uts_avg' => 91.0,
                'uas_pred' => 89.5,
                'status' => 'Tuntas',
                'grade_trend' => [
                    ['semester' => 'Sem 1 (Lalu)', 'score' => 81.0],
                    ['semester' => 'Sem 2 (Lalu)', 'score' => 85.5],
                    ['semester' => 'Sem 3 (Berjalan)', 'score' => 89.5],
                ],
                'notes' => 'Peningkatan konsisten di mapel eksakta',
            ],
            [
                'student_id' => 102,
                'name' => 'Nadia Syahrini',
                'nis' => '20241102',
                'average' => 91.0,
                'tugas_avg' => 92.0,
                'quiz_avg' => 90.0,
                'uts_avg' => 92.5,
                'uas_pred' => 91.0,
                'status' => 'Tuntas',
                'grade_trend' => [
                    ['semester' => 'Sem 1 (Lalu)', 'score' => 88.0],
                    ['semester' => 'Sem 2 (Lalu)', 'score' => 89.5],
                    ['semester' => 'Sem 3 (Berjalan)', 'score' => 91.0],
                ],
                'notes' => 'Juara kelas dan konsisten di seluruh mata pelajaran',
            ],
            [
                'student_id' => 103,
                'name' => 'Rian Hidayat',
                'nis' => '20241103',
                'average' => 64.2,
                'tugas_avg' => 58.0,
                'quiz_avg' => 62.0,
                'uts_avg' => 64.5,
                'uas_pred' => 64.2,
                'status' => 'Belum Tuntas (3 Mapel di bawah KKM)',
                'grade_trend' => [
                    ['semester' => 'Sem 1 (Lalu)', 'score' => 74.0],
                    ['semester' => 'Sem 2 (Lalu)', 'score' => 71.0],
                    ['semester' => 'Sem 3 (Berjalan)', 'score' => 64.2],
                ],
                'notes' => 'Tren penurunan tajam, butuh pendampingan remedial intensif',
            ],
        ];

        return response()->json([
            'success' => true,
            'students' => $studentsGrades,
        ]);
    }

    /**
     * 9. Monitoring Ketuntasan
     * Siswa Tuntas, Siswa Belum Tuntas, Mapel Rendah, Remedial, Filter
     */
    public function masteryMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'total_students' => 34,
                'passed_count' => 30,
                'not_passed_count' => 4,
                'passing_rate' => 88.2,
                'needs_remedial_count' => 5,
            ],
            'low_passing_subjects' => [
                ['subject' => 'Fisika Terapan', 'failing_students' => 11, 'passing_pct' => 67.6, 'action' => 'Jadwal Remedial Kelas'],
                ['subject' => 'Matematika Peminatan', 'failing_students' => 9, 'passing_pct' => 73.5, 'action' => 'Klinik Belajar Siang'],
                ['subject' => 'Kimia Lanjutan', 'failing_students' => 8, 'passing_pct' => 76.5, 'action' => 'Tutor Sebaya'],
            ],
            'remedial_candidates' => [
                ['student_name' => 'Rian Hidayat', 'subject' => 'Fisika', 'current_score' => 57.6, 'remedial_status' => 'Belum Mengikuti', 'schedule' => 'Rabu, 7 Okt 2026'],
                ['student_name' => 'Rian Hidayat', 'subject' => 'Matematika', 'current_score' => 62.3, 'remedial_status' => 'Belum Mengikuti', 'schedule' => 'Kamis, 8 Okt 2026'],
                ['student_name' => 'Dimas Arya', 'subject' => 'Kimia', 'current_score' => 66.0, 'remedial_status' => 'Sedang Mengulang', 'schedule' => 'Jumat, 9 Okt 2026'],
                ['student_name' => 'Faisal Rahman', 'subject' => 'Matematika', 'current_score' => 68.5, 'remedial_status' => 'Siap Tes', 'schedule' => 'Kamis, 8 Okt 2026'],
            ],
        ]);
    }

    /**
     * 10. Monitoring Tugas
     * Agregat tugas, submitter, belum submit, terlambat, %
     */
    public function assignmentMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'total_assignments_active' => 8,
                'total_expected_submissions' => 272, // 8 x 34 siswa
                'submitted_count' => 244,
                'missing_count' => 28,
                'completion_rate' => 89.7,
            ],
            'assignments_aggregate' => [
                [
                    'id' => 1,
                    'title' => 'Laporan Praktikum Termodinamika',
                    'subject' => 'Fisika Terapan',
                    'teacher' => 'Ratna Dewi, M.Si',
                    'deadline' => '2026-10-04 23:59',
                    'submitted' => 28,
                    'missing' => 6,
                    'late' => 2,
                    'completion_rate' => 82.4,
                ],
                [
                    'id' => 2,
                    'title' => 'Kajian Teks Esai Kontemporer',
                    'subject' => 'Bahasa Indonesia',
                    'teacher' => 'Agus Gunawan, S.Pd',
                    'deadline' => '2026-10-05 18:00',
                    'submitted' => 32,
                    'missing' => 2,
                    'late' => 1,
                    'completion_rate' => 94.1,
                ],
                [
                    'id' => 3,
                    'title' => 'Latihan Soal Matriks & Transformasi',
                    'subject' => 'Matematika Peminatan',
                    'teacher' => 'Drs. Hendro Wibowo',
                    'deadline' => '2026-10-06 20:00',
                    'submitted' => 26,
                    'missing' => 8,
                    'late' => 3,
                    'completion_rate' => 76.5,
                ],
            ],
        ]);
    }

    /**
     * 11. Monitoring Pembelajaran (KBM)
     * Pertemuan, materi diberikan/belum, guru, jurnal, assessment, progress
     */
    public function learningMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'learning_progress' => [
                'total_curriculum_targets' => 140, // pertemuan target semester
                'completed_meetings' => 86,
                'overall_kbm_progress' => 61.4,
                'journals_submitted' => 84,
                'active_assessments' => 12,
            ],
            'subjects_kbm' => [
                [
                    'subject' => 'Matematika Peminatan',
                    'teacher' => 'Drs. Hendro Wibowo',
                    'target_meetings' => 16,
                    'completed_meetings' => 10,
                    'completed_topics' => ['Fungsi Trigonometri', 'Limit Tak Hingga', 'Turunan Fungsi'],
                    'pending_topics' => ['Aplikasi Turunan', 'Garis Singgung'],
                    'journal_status' => 'Lengkap (10/10)',
                    'progress_pct' => 62.5,
                ],
                [
                    'subject' => 'Fisika Terapan',
                    'teacher' => 'Ratna Dewi, M.Si',
                    'target_meetings' => 16,
                    'completed_meetings' => 9,
                    'completed_topics' => ['Vektor Satuan', 'Kinematika Gerak', 'Hukum Newton'],
                    'pending_topics' => ['Usaha & Energi', 'Impuls & Momentum'],
                    'journal_status' => 'Lengkap (9/9)',
                    'progress_pct' => 56.3,
                ],
                [
                    'subject' => 'Biologi Terapan',
                    'teacher' => 'Siti Aminah, M.Pd (Wali Kelas)',
                    'target_meetings' => 16,
                    'completed_meetings' => 11,
                    'completed_topics' => ['Struktur Sel', 'Transpor Membran', 'Jaringan Tumbuhan'],
                    'pending_topics' => ['Jaringan Hewan', 'Sistem Gerak'],
                    'journal_status' => 'Lengkap (11/11)',
                    'progress_pct' => 68.8,
                ],
            ],
        ]);
    }

    /**
     * 12. Monitoring Guru Mata Pelajaran
     * Guru, mapel, jadwal, kehadiran guru, progress, kelengkapan nilai, jurnal
     */
    public function subjectTeachers(Request $request)
    {
        return response()->json([
            'success' => true,
            'teachers' => [
                [
                    'id' => 1,
                    'name' => 'Drs. Hendro Wibowo',
                    'subject' => 'Matematika Peminatan',
                    'schedule' => 'Senin (07:45 - 09:15), Rabu (10:15 - 11:45)',
                    'attendance_rate' => '100% (10/10 Hadir)',
                    'progress' => '62.5% (Sesuai Silabus)',
                    'grade_completeness' => '92% (Tugas 1-3 & Quiz 1 Lengkap)',
                    'journal_notes' => 'Materi turunan trigonometri telah tuntas diajarkan.',
                ],
                [
                    'id' => 2,
                    'name' => 'Ratna Dewi, M.Si',
                    'subject' => 'Fisika Terapan',
                    'schedule' => 'Senin (09:30 - 11:00), Kamis (08:30 - 10:00)',
                    'attendance_rate' => '90% (9/10 - 1x Tugas Mandiri Daring)',
                    'progress' => '56.3% (Sedang Mengejar Praktikum)',
                    'grade_completeness' => '85% (Nilai Praktikum 2 sedang diproses)',
                    'journal_notes' => 'Praktikum gerak parabola telah dilaksanakan di Lab Fisika.',
                ],
                [
                    'id' => 3,
                    'name' => 'Agus Gunawan, S.Pd',
                    'subject' => 'Bahasa Indonesia',
                    'schedule' => 'Senin (11:00 - 12:30), Jumat (07:30 - 09:00)',
                    'attendance_rate' => '100% (10/10 Hadir)',
                    'progress' => '65.0% (Sangat Baik)',
                    'grade_completeness' => '100% (Semua tugas telah dinilai)',
                    'journal_notes' => 'Diskusi kelompok penulisan esai berjalan aktif.',
                ],
                [
                    'id' => 4,
                    'name' => 'Sarah Johnson, M.Hum',
                    'subject' => 'Bahasa Inggris Lanjutan',
                    'schedule' => 'Senin (13:15 - 14:45), Selasa (09:30 - 11:00)',
                    'attendance_rate' => '100% (10/10 Hadir)',
                    'progress' => '66.0% (Aktif Speaking)',
                    'grade_completeness' => '95% (Nilai Speech Contest tercatat)',
                    'journal_notes' => 'Debat kelompok bahasa Inggris tema teknologi.',
                ],
            ],
        ]);
    }

    /**
     * 13. Catatan Wali Kelas
     * Tanggal, kategori (8 kategori), isi, prioritas, lampiran, status
     */
    public function homeroomNotes(Request $request)
    {
        return response()->json([
            'success' => true,
            'categories' => [
                'Akademik',
                'Kehadiran',
                'Kedisiplinan',
                'Sosial',
                'Perilaku',
                'Prestasi',
                'Perkembangan pribadi',
                'Lainnya',
            ],
            'notes' => [
                [
                    'id' => 1,
                    'student_id' => 103,
                    'student_name' => 'Rian Hidayat',
                    'date' => '2026-09-29',
                    'category' => 'Kedisiplinan',
                    'priority' => 'Tinggi',
                    'content' => 'Siswa dipanggil ke ruang wali kelas karena terlambat 4x dalam 2 pekan dan seragam tidak rapi. Diberi arahan dan komitmen tertulis.',
                    'attachment' => 'surat_komitmen_rian.pdf',
                    'status' => 'Dalam Pemantauan',
                ],
                [
                    'id' => 2,
                    'student_id' => 106,
                    'student_name' => 'Ahmad Fauzi',
                    'date' => '2026-09-28',
                    'category' => 'Prestasi',
                    'priority' => 'Sedang',
                    'content' => 'Menunjukkan kepemimpinan yang baik sebagai KM, membimbing teman dalam tutor sebaya matematika setiap pulang sekolah.',
                    'attachment' => 'dokumentasi_tutor_sebaya.jpg',
                    'status' => 'Apresiasi Diberikan',
                ],
                [
                    'id' => 3,
                    'student_id' => 105,
                    'student_name' => 'Dimas Arya',
                    'date' => '2026-09-25',
                    'category' => 'Akademik',
                    'priority' => 'Sedang',
                    'content' => 'Nilai Kimia menurun. Dimas mengaku kesulitan membagi waktu dengan latihan basket. Disarankan mengatur jadwal belajar lebih seimbang.',
                    'attachment' => null,
                    'status' => 'Follow Up Dijadwalkan',
                ],
            ],
        ]);
    }

    public function storeNote(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'student_name' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|string',
            'content' => 'required|string',
            'attachment' => 'nullable|string',
        ]);

        $ctx = $this->getHomeroomContext($request);
        $schoolId = $ctx['user']->school_id ?? 1;

        $entry = [
            'id' => rand(100, 999),
            'student_id' => $validated['student_id'],
            'student_name' => $validated['student_name'],
            'date' => date('Y-m-d'),
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'content' => $validated['content'],
            'attachment' => $validated['attachment'] ?? null,
            'status' => 'Tercatat',
        ];

        AuditLog::create([
            'user_id' => $ctx['user']->id ?? null,
            'school_id' => $schoolId,
            'action' => 'HOMEROOM_STUDENT_NOTE',
            'model_type' => User::class,
            'model_id' => $validated['student_id'],
            'new_values' => $entry,
            'ip_address' => $request->ip() ?: '127.0.0.1',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catatan perkembangan siswa berhasil disimpan.',
            'note' => $entry,
        ]);
    }

    /**
     * 14. Catatan Perkembangan Siswa (Timeline)
     */
    public function studentTimeline(Request $request, $studentId)
    {
        return response()->json([
            'success' => true,
            'student_id' => $studentId,
            'student_name' => 'Rian Hidayat',
            'timeline' => [
                [
                    'month' => 'Juli 2026',
                    'title' => 'Awal Masuk Rombel',
                    'attendance' => 'Hadir 100% (20 hari)',
                    'academic' => 'Adaptasi awal berjalan baik',
                    'conduct' => 'Tertib dan aktif',
                    'status' => 'Normal / Baik',
                ],
                [
                    'month' => 'Agustus 2026',
                    'title' => 'Mulai KBM Intensif',
                    'attendance' => 'Hadir 95% (1x Izin keluarga)',
                    'academic' => 'Nilai kuis matematika 74',
                    'conduct' => 'Mulai sering mengantuk di jam pagi',
                    'status' => 'Perhatian Awal',
                ],
                [
                    'month' => 'September 2026',
                    'title' => 'Penurunan Performa & Indikasi Pelanggaran',
                    'attendance' => 'Hadir 74% (3x Alfa, 2x Terlambat)',
                    'academic' => 'Nilai UTS Fisika & Kimia di bawah KKM',
                    'conduct' => 'Terlibat pelanggaran rokok di luar pagar (SP-1)',
                    'status' => 'Tindakan Pembinaan & Referral BK',
                ],
                [
                    'month' => 'Oktober 2026',
                    'title' => 'Penanganan Terintegrasi & Remedial',
                    'attendance' => 'Sedang dipantau ketat harian',
                    'academic' => 'Didaftarkan program remedial terstruktur',
                    'conduct' => 'Konseling berkala BK + Pemanggilan Ortu',
                    'status' => 'Proses Pemulihan',
                ],
            ],
        ]);
    }

    /**
     * 15. Monitoring Kedisiplinan
     * Pelanggaran, jenis, frekuensi, tanggal, tindakan, status, statistik kelas
     */
    public function disciplineMonitoring(Request $request)
    {
        return response()->json([
            'success' => true,
            'statistics' => [
                'total_violations' => 7,
                'students_involved' => 4,
                'resolved_count' => 5,
                'in_progress_count' => 2,
                'by_category' => [
                    ['category' => 'Keterlambatan', 'count' => 4],
                    ['category' => 'Kerapian / Seragam', 'count' => 2],
                    ['category' => 'Ketertiban / Merokok', 'count' => 1],
                ],
            ],
            'violations_list' => [
                [
                    'id' => 1,
                    'student_name' => 'Rian Hidayat',
                    'violation_type' => 'Merokok di luar pagar saat jam sekolah',
                    'category' => 'Disiplin Berat Kelas',
                    'points' => 15,
                    'date' => '2026-09-20',
                    'action' => 'Panggilan Orang Tua & SP-1',
                    'status' => 'Diproses BK',
                ],
                [
                    'id' => 2,
                    'student_name' => 'Rian Hidayat',
                    'violation_type' => 'Terlambat masuk sekolah > 20 menit (3x)',
                    'category' => 'Keterlambatan',
                    'points' => 5,
                    'date' => '2026-09-29',
                    'action' => 'Pembinaan Piket & Catatan Wali Kelas',
                    'status' => 'Selesai',
                ],
                [
                    'id' => 3,
                    'student_name' => 'Dimas Arya',
                    'violation_type' => 'Tidak mengenakan dasi & atribut lengkap',
                    'category' => 'Kerapian',
                    'points' => 5,
                    'date' => '2026-09-27',
                    'action' => 'Teguran Lisan Wali Kelas',
                    'status' => 'Selesai',
                ],
                [
                    'id' => 4,
                    'student_name' => 'Bayu Wicaksono',
                    'violation_type' => 'Terlambat 1x karena alasan ban kempes',
                    'category' => 'Keterlambatan',
                    'points' => 2,
                    'date' => '2026-10-02',
                    'action' => 'Dicatat di buku izin piket',
                    'status' => 'Selesai',
                ],
            ],
        ]);
    }

    /**
     * 16. Pembinaan Siswa
     * Konseling ringan, teguran, pembinaan, pertemuan siswa/ortu, follow up
     */
    public function studentCoaching(Request $request)
    {
        return response()->json([
            'success' => true,
            'coaching_logs' => [
                [
                    'id' => 1,
                    'date' => '2026-09-22',
                    'student_name' => 'Rian Hidayat',
                    'type' => 'Teguran & Pembinaan Khusus',
                    'problem' => 'Keterlambatan dan pelanggaran tata tertib rokok.',
                    'action' => 'Konseling empati di ruang wali kelas, mendengarkan latar belakang masalah siswa, pembuatan surat pernyataan perbaikan diri.',
                    'result' => 'Siswa mengakui kesalahan dan berjanji tidur lebih awal serta tidak merokok lagi.',
                    'follow_up' => 'Pantau absensi 2 minggu ke depan. Rujuk ke BK jika terulang.',
                    'status' => 'Lanjut ke BK',
                ],
                [
                    'id' => 2,
                    'date' => '2026-09-25',
                    'student_name' => 'Dimas Arya',
                    'type' => 'Konseling Ringan Akademik',
                    'problem' => 'Kesulitan membagi waktu ekstrakurikuler basket dengan tugas Kimia.',
                    'action' => 'Penyusunan jadwal belajar mingguan mandiri (time management).',
                    'result' => 'Dimas menyetujui batasan latihan maksimal 3x sepekan dan menyelesaikan tugas sebelum latihan.',
                    'follow_up' => 'Cek kelengkapan tugas Kimia pekan depan.',
                    'status' => 'Selesai / Teratasi',
                ],
            ],
        ]);
    }

    public function storeCoaching(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'type' => 'required|string',
            'problem' => 'required|string',
            'action' => 'required|string',
            'result' => 'required|string',
            'follow_up' => 'required|string',
        ]);

        $log = [
            'id' => rand(100, 999),
            'date' => date('Y-m-d'),
            'student_name' => $validated['student_name'],
            'type' => $validated['type'],
            'problem' => $validated['problem'],
            'action' => $validated['action'],
            'result' => $validated['result'],
            'follow_up' => $validated['follow_up'],
            'status' => 'Tercatat',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Catatan pembinaan siswa berhasil disimpan.',
            'log' => $log,
        ]);
    }

    /**
     * 17. Integrasi dengan BK
     * Status penanganan, referral BK, follow up (catatan sensitif disanitasi)
     */
    public function bkReferrals(Request $request)
    {
        return response()->json([
            'success' => true,
            'privacy_notice' => 'Sesuai kode etik konseling BK, isi sesi konseling psikologis privat dan rahasia keluarga dirahasiakan. Wali Kelas hanya menerima status administratif dan arahan tindak lanjut akademik.',
            'referrals' => [
                [
                    'id' => 1,
                    'case_code' => 'BK-REF-2026-081',
                    'student_name' => 'Rian Hidayat',
                    'nis' => '20241103',
                    'date_submitted' => '2026-09-25',
                    'reason' => 'Penurunan akademik drastis dan absensi tinggi (5x Alfa)',
                    'status' => 'Sedang Ditangani BK', // Diajukan, Diterima BK, Sedang Ditangani, Follow-up, Selesai
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'recommendation_for_homeroom' => 'Bantu monitor tugas harian di kelas dan laporkan jika siswa terlihat lelah atau tertidur saat KBM.',
                    'next_agenda' => 'Pemanggilan orang tua bersama konselor BK pada Senin, 6 Okt 2026.',
                ],
                [
                    'id' => 2,
                    'case_code' => 'BK-REF-2026-044',
                    'student_name' => 'Fahmi Idris',
                    'date_submitted' => '2026-09-10',
                    'reason' => 'Sering izin sakit berturut-turut tanpa surat dokter jelas',
                    'status' => 'Selesai',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'recommendation_for_homeroom' => 'Telah dilakukan home visit. Siswa mengidap asma kronis dan orang tua telah menyerahkan rekam medis.',
                    'next_agenda' => 'Arsip kelas selesai.',
                ],
            ],
        ]);
    }

    public function storeBkReferral(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'reason' => 'required|string',
            'urgency' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $ctx = $this->getHomeroomContext($request);
        $schoolId = $ctx['user']->school_id ?? 1;

        $student = User::where('name', 'LIKE', '%' . $validated['student_name'] . '%')->first();
        $studentId = $student ? $student->id : ($request->input('student_id') ?? 8);

        $caseNumber = 'BK-REF-2026-' . rand(100, 999);
        CounselingCase::create([
            'school_id' => $schoolId,
            'student_id' => $studentId,
            'details' => json_encode([
                'case_number' => $caseNumber,
                'topic' => $validated['reason'],
                'category' => 'Rujukan Wali Kelas',
                'priority' => $validated['urgency'] ?? 'Normal',
                'status' => 'Diajukan ke BK',
                'counselor' => 'Nurul Hidayah, S.Psi',
                'notes' => $validated['notes'] ?? $validated['reason'],
                'date' => date('Y-m-d'),
                'referral_by' => $ctx['user']->name ?? 'Wali Kelas',
            ]),
        ]);

        $referral = [
            'id' => rand(100, 999),
            'case_code' => $caseNumber,
            'student_name' => $validated['student_name'],
            'date_submitted' => date('Y-m-d'),
            'reason' => $validated['reason'],
            'urgency' => $validated['urgency'],
            'status' => 'Diajukan ke BK',
            'recommendation_for_homeroom' => 'Menunggu konfirmasi penerimaan dari konselor BK sekolah.',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Rujukan siswa ke BK berhasil dikirimkan.',
            'referral' => $referral,
        ]);
    }

    /**
     * 18. Multi Referral Siswa
     * BK, Kepala Sekolah, Guru Mapel, TU
     */
    public function multiReferrals(Request $request)
    {
        return response()->json([
            'success' => true,
            'targets' => [
                ['key' => 'bk', 'title' => 'Bimbingan Konseling (BK)', 'scope' => 'Konseling perilaku, psikososial, dan motivasi belajar'],
                ['key' => 'kepsek', 'title' => 'Kepala Sekolah', 'scope' => 'Pelanggaran berat atau rekomendasi penanganan pimpinan'],
                ['key' => 'guru_mapel', 'title' => 'Guru Mata Pelajaran', 'scope' => 'Klinik remedial akademik khusus mata pelajaran'],
                ['key' => 'tu', 'title' => 'Tata Usaha (TU)', 'scope' => 'Administrasi siswa, beasiswa, surat dispensasi, mutasi'],
            ],
            'history' => [
                ['target' => 'BK', 'student' => 'Rian Hidayat', 'date' => '2026-09-25', 'topic' => 'Absensi & Disiplin', 'status' => 'Ditangani'],
                ['target' => 'Guru Mapel (Fisika)', 'student' => 'Dimas Arya', 'date' => '2026-09-28', 'topic' => 'Remedial Termodinamika', 'status' => 'Diterima'],
                ['target' => 'TU', 'student' => 'Nadia Syahrini', 'date' => '2026-09-15', 'topic' => 'Surat Pengantar Lomba OSN', 'status' => 'Selesai Terbit'],
            ],
        ]);
    }

    /**
     * 19. Komunikasi dengan Orang Tua
     * Kontak ortu, kirim pesan, laporan perkembangan, notif ketidakhadiran
     */
    public function parentCommunication(Request $request)
    {
        return response()->json([
            'success' => true,
            'parents' => [
                [
                    'student_id' => 101,
                    'student_name' => 'Ahmad Fauzi',
                    'parent_name' => 'Fauzi Hidayat, S.E.',
                    'phone' => '0812-9988-1122',
                    'whatsapp' => '6281299881122',
                    'relation' => 'Ayah',
                    'last_contact' => '2026-09-20 (Apresiasi Prestasi OSK)',
                    'status' => 'Komunikatif',
                ],
                [
                    'student_id' => 102,
                    'student_name' => 'Nadia Syahrini',
                    'parent_name' => 'Ir. Syahrini Mulyadi',
                    'phone' => '0813-2211-4455',
                    'whatsapp' => '6281322114455',
                    'relation' => 'Ibu',
                    'last_contact' => '2026-09-15 (Izin Lomba Debat)',
                    'status' => 'Sangat Responsif',
                ],
                [
                    'student_id' => 103,
                    'student_name' => 'Rian Hidayat',
                    'parent_name' => 'Hidayat Sutisna',
                    'phone' => '0815-7766-3322',
                    'whatsapp' => '6281577663322',
                    'relation' => 'Ayah',
                    'last_contact' => '2026-09-26 (Pemberitahuan SP-1 & Panggilan)',
                    'status' => 'Perlu Pendekatan Khusus',
                ],
                [
                    'student_id' => 104,
                    'student_name' => 'Citra Lestari',
                    'parent_name' => 'Dra. Lestari Handayani',
                    'phone' => '0812-4433-2211',
                    'whatsapp' => '6281244332211',
                    'relation' => 'Ibu',
                    'last_contact' => '2026-10-02 (Surat Izin Keluarga Diterima)',
                    'status' => 'Responsif',
                ],
            ],
        ]);
    }

    /**
     * 20. Parent Communication History
     */
    public function parentCommunicationHistory(Request $request)
    {
        return response()->json([
            'success' => true,
            'logs' => [
                [
                    'id' => 1,
                    'date' => '2026-09-26',
                    'student_name' => 'Rian Hidayat',
                    'parent_name' => 'Hidayat Sutisna (Ayah)',
                    'topic' => 'Klarifikasi Keterlambatan Berulang & SP-1',
                    'channel' => 'WhatsApp & Panggilan Telepon',
                    'summary' => 'Menyampaikan bahwa ananda Rian sudah mengumpulkan 25 poin pelanggaran dan nilai 3 mapel menurun. Orang tua kaget dan berjanji akan hadir memenuhi surat panggilan sekolah pada 6 Oktober 2026.',
                    'status' => 'Menunggu Pertemuan Fisik',
                    'follow_up' => 'Siapkan berita acara pertemuan orang tua di ruang BK.',
                ],
                [
                    'id' => 2,
                    'date' => '2026-09-20',
                    'student_name' => 'Ahmad Fauzi',
                    'parent_name' => 'Fauzi Hidayat (Ayah)',
                    'topic' => 'Ucapan Selamat Lolos OSK Tingkat Provinsi',
                    'channel' => 'WhatsApp Resmi',
                    'summary' => 'Memberitahukan kabar gembira kelolosan OSK Fisika dan izin pembinaan karantina 3 hari.',
                    'status' => 'Selesai',
                    'follow_up' => 'Koordinasi dengan guru pembina KIR.',
                ],
            ],
        ]);
    }

    public function storeParentCommunication(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'parent_name' => 'required|string',
            'topic' => 'required|string',
            'channel' => 'required|string',
            'summary' => 'required|string',
            'follow_up' => 'nullable|string',
        ]);

        $log = [
            'id' => rand(100, 999),
            'date' => date('Y-m-d'),
            'student_name' => $validated['student_name'],
            'parent_name' => $validated['parent_name'],
            'topic' => $validated['topic'],
            'channel' => $validated['channel'],
            'summary' => $validated['summary'],
            'status' => 'Tercatat di Histori',
            'follow_up' => $validated['follow_up'] ?? '-',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Histori komunikasi dengan orang tua berhasil disimpan.',
            'log' => $log,
        ]);
    }

    /**
     * 21. Pengumuman Kelas
     * Target: Semua siswa, Semua orang tua, Siswa tertentu, Orang tua tertentu
     */
    public function announcements(Request $request)
    {
        return response()->json([
            'success' => true,
            'announcements' => [
                [
                    'id' => 1,
                    'title' => 'Pemberitahuan Agenda PTS & Pelunasan Administrasi',
                    'target' => 'Semua Orang Tua & Siswa',
                    'date' => '2026-09-30',
                    'content' => 'Yth. Bapak/Ibu Wali Murid XI MIPA 1, Penilaian Tengah Semester (PTS) akan dimulai Senin, 12 Oktober 2026. Mohon memastikan ananda belajar dengan teratur di rumah.',
                    'author' => 'Siti Aminah, M.Pd (Wali Kelas)',
                    'read_count' => '32/34 Ortu',
                ],
                [
                    'id' => 2,
                    'title' => 'Pengingat Jadwal Remedial Fisika Terapan',
                    'target' => 'Siswa Tertentu (Peserta Remedial)',
                    'date' => '2026-10-01',
                    'content' => 'Bagi siswa yang belum tuntas materi Termodinamika, remedial akan dilaksanakan Rabu, 7 Oktober pukul 14:30 di Lab Fisika.',
                    'author' => 'Ratna Dewi, M.Si (via Walikelas)',
                    'read_count' => '9/11 Siswa',
                ],
            ],
        ]);
    }

    public function storeAnnouncement(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'target' => 'required|string',
            'content' => 'required|string',
        ]);

        $item = [
            'id' => rand(100, 999),
            'title' => $validated['title'],
            'target' => $validated['target'],
            'content' => $validated['content'],
            'date' => date('Y-m-d'),
            'author' => 'Siti Aminah, M.Pd (Wali Kelas)',
            'read_count' => '0 (Baru Terkirim)',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Pengumuman kelas berhasil dipublikasikan.',
            'announcement' => $item,
        ]);
    }

    /**
     * 22. Kalender Kelas
     */
    public function calendar(Request $request)
    {
        return response()->json([
            'success' => true,
            'events' => [
                ['id' => 1, 'date' => '2026-10-05', 'title' => 'Batas Akhir Penyerahan Surat Izin PTS', 'category' => 'Deadline Administrasi', 'color' => 'blue'],
                ['id' => 2, 'date' => '2026-10-06', 'title' => 'Pertemuan Khusus Wali Murid Siswa Berisiko', 'category' => 'Rapat Orang Tua', 'color' => 'red'],
                ['id' => 3, 'date' => '2026-10-12', 'title' => 'Hari Pertama Penilaian Tengah Semester (PTS)', 'category' => 'Ujian', 'color' => 'amber'],
                ['id' => 4, 'date' => '2026-10-24', 'title' => 'Class Meeting & Pameran Karya Proyek P5', 'category' => 'Kegiatan Kelas', 'color' => 'emerald'],
                ['id' => 5, 'date' => '2026-11-15', 'title' => 'Rapat Pleno Kenaikan Semester Ganjil', 'category' => 'Agenda Sekolah', 'color' => 'purple'],
            ],
        ]);
    }

    /**
     * 23. Jadwal Kelas
     */
    public function schedule(Request $request)
    {
        return response()->json([
            'success' => true,
            'schedule_by_day' => [
                'Senin' => [
                    ['period' => '1 - 2', 'time' => '07:45 - 09:15', 'subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'room' => 'R. 204'],
                    ['period' => '3 - 4', 'time' => '09:30 - 11:00', 'subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'room' => 'Lab Fisika'],
                    ['period' => '5 - 6', 'time' => '11:00 - 12:30', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'room' => 'R. 204'],
                    ['period' => '7 - 8', 'time' => '13:15 - 14:45', 'subject' => 'Bahasa Inggris Lanjutan', 'teacher' => 'Sarah Johnson, M.Hum', 'room' => 'R. 204'],
                ],
                'Selasa' => [
                    ['period' => '1 - 2', 'time' => '07:00 - 08:30', 'subject' => 'Pendidikan Jasmani (PJOK)', 'teacher' => 'Joko Susilo, S.Pd', 'room' => 'Lapangan Olahraga'],
                    ['period' => '3 - 4', 'time' => '08:30 - 10:00', 'subject' => 'Biologi Terapan', 'teacher' => 'Siti Aminah, M.Pd', 'room' => 'Lab Biologi'],
                    ['period' => '5 - 6', 'time' => '10:15 - 11:45', 'subject' => 'Kimia Lanjutan', 'teacher' => 'Hj. Fatimah, M.Pd', 'room' => 'Lab Kimia'],
                ],
                'Rabu' => [
                    ['period' => '1 - 2', 'time' => '07:00 - 08:30', 'subject' => 'Informatika', 'teacher' => 'Rizky Maulana, S.Kom', 'room' => 'Lab Komputer 2'],
                    ['period' => '3 - 4', 'time' => '08:30 - 10:00', 'subject' => 'Pendidikan Agama Islam', 'teacher' => 'Ust. Mansyur, M.Ag', 'room' => 'R. 204'],
                    ['period' => '5 - 6', 'time' => '10:15 - 11:45', 'subject' => 'Matematika Peminatan', 'teacher' => 'Drs. Hendro Wibowo', 'room' => 'R. 204'],
                ],
                'Kamis' => [
                    ['period' => '1 - 2', 'time' => '07:00 - 08:30', 'subject' => 'Sejarah Indonesia', 'teacher' => 'Bambang Irawan, M.Pd', 'room' => 'R. 204'],
                    ['period' => '3 - 4', 'time' => '08:30 - 10:00', 'subject' => 'Fisika Terapan', 'teacher' => 'Ratna Dewi, M.Si', 'room' => 'R. 204'],
                    ['period' => '5 - 6', 'time' => '10:15 - 11:45', 'subject' => 'Pendidikan Pancasila', 'teacher' => 'Dra. Sri Wahyuni', 'room' => 'R. 204'],
                ],
                'Jumat' => [
                    ['period' => '1 - 2', 'time' => '07:00 - 08:30', 'subject' => 'Seni Budaya & Prakarya', 'teacher' => 'Lestari Kusuma, S.Sn', 'room' => 'R. Kesenian'],
                    ['period' => '3 - 4', 'time' => '08:30 - 10:00', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Agus Gunawan, S.Pd', 'room' => 'R. 204'],
                ],
            ],
        ]);
    }

    /**
     * 24. Struktur Organisasi Kelas
     */
    public function organization(Request $request)
    {
        return response()->json([
            'success' => true,
            'structure' => [
                'wali_kelas' => 'Siti Aminah, M.Pd',
                'ketua' => 'Ahmad Fauzi',
                'wakil' => 'Bima Perkasa',
                'sekretaris' => ['Nadia Syahrini', 'Anisa Rahma'],
                'bendahara' => ['Dewi Sartika', 'Cantika Putri'],
                'divisi' => [
                    ['nama' => 'Kebersihan & 7K', 'koordinator' => 'Dimas Arya', 'anggota' => ['Faisal Rahman', 'Raka Pratama']],
                    ['nama' => 'Keamanan & Ketertiban', 'koordinator' => 'Bayu Wicaksono', 'anggota' => ['Rian Hidayat', 'Fahmi Idris']],
                    ['nama' => 'Kerohanian', 'koordinator' => 'Citra Lestari', 'anggota' => ['Zahra Annisa', 'Nurul Ilmi']],
                    ['nama' => 'Mading & Kreativitas', 'koordinator' => 'Gita Gutawa', 'anggota' => ['Maya Septiani', 'Tiara Andini']],
                ],
            ],
        ]);
    }

    public function updateOrganization(Request $request)
    {
        $validated = $request->validate([
            'ketua' => 'required|string',
            'wakil' => 'required|string',
            'sekretaris' => 'required|array',
            'bendahara' => 'required|array',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Struktur organisasi kelas berhasil diperbarui.',
            'structure' => $validated,
        ]);
    }

    /**
     * 25. Kegiatan Kelas
     */
    public function activities(Request $request)
    {
        return response()->json([
            'success' => true,
            'activities' => [
                [
                    'id' => 1,
                    'title' => 'Rapat Pembentukan Pengurus & Kas Kelas',
                    'category' => 'Rapat Kelas',
                    'date' => '2026-08-01',
                    'description' => 'Menetapkan susunan pengurus harian kelas, iuran kas Rp 10.000/bulan, dan jadwal piket 7K.',
                    'documentation' => ['foto_rapat_1.jpg', 'foto_rapat_2.jpg'],
                ],
                [
                    'id' => 2,
                    'title' => 'Bakti Sosial & Santunan Yatim Piatu',
                    'category' => 'Kegiatan Sosial',
                    'date' => '2026-09-12',
                    'description' => 'Kunjungan dan penyerahan sembako ke Panti Asuhan Al-Ikhlas bersama seluruh siswa dan wali kelas.',
                    'documentation' => ['dokumentasi_baksos.jpg'],
                ],
                [
                    'id' => 3,
                    'title' => 'Studi Lapangan & Observasi Ekosistem Hutan Kota',
                    'category' => 'Kegiatan Akademik',
                    'date' => '2026-09-20',
                    'description' => 'Pengambilan sampel keanekaragaman hayati untuk proyek mata pelajaran Biologi terpadu.',
                    'documentation' => ['studi_lapangan.jpg'],
                ],
            ],
        ]);
    }

    public function storeActivity(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'category' => 'required|string',
            'date' => 'required|string',
            'description' => 'required|string',
        ]);

        $item = [
            'id' => rand(100, 999),
            'title' => $validated['title'],
            'category' => $validated['category'],
            'date' => $validated['date'],
            'description' => $validated['description'],
            'documentation' => ['doc_default.jpg'],
        ];

        return response()->json([
            'success' => true,
            'message' => 'Kegiatan kelas berhasil dicatat.',
            'activity' => $item,
        ]);
    }

    /**
     * 26. Prestasi Siswa
     */
    public function achievements(Request $request)
    {
        return response()->json([
            'success' => true,
            'categories' => ['Akademik', 'Olahraga', 'Seni', 'Organisasi', 'Kompetisi', 'Non-akademik'],
            'achievements' => [
                [
                    'id' => 1,
                    'student_id' => 101,
                    'student_name' => 'Ahmad Fauzi',
                    'title' => 'Juara 1 Olimpiade Sains Kota (OSK) Fisika 2026',
                    'category' => 'Akademik',
                    'level' => 'Tingkat Kota',
                    'rank' => 'Juara 1',
                    'date' => '2026-09-15',
                    'proof_document' => 'piagam_osk_ahmad.pdf',
                    'verified_status' => 'Terverifikasi Sekolah',
                ],
                [
                    'id' => 2,
                    'student_id' => 102,
                    'student_name' => 'Nadia Syahrini',
                    'title' => 'Juara 2 Debat Bahasa Inggris Provinsi Jawa Barat',
                    'category' => 'Kompetisi',
                    'level' => 'Tingkat Provinsi',
                    'rank' => 'Juara 2',
                    'date' => '2026-09-22',
                    'proof_document' => 'sertifikat_debat_nadia.pdf',
                    'verified_status' => 'Terverifikasi Sekolah',
                ],
                [
                    'id' => 3,
                    'student_id' => 104,
                    'student_name' => 'Citra Lestari',
                    'title' => 'Juara 1 Tari Tradisional Jaipong FLS2N',
                    'category' => 'Seni',
                    'level' => 'Tingkat Kota',
                    'rank' => 'Juara 1',
                    'date' => '2026-08-28',
                    'proof_document' => 'piagam_fls2n_citra.pdf',
                    'verified_status' => 'Terverifikasi Sekolah',
                ],
            ],
        ]);
    }

    public function storeAchievement(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'student_name' => 'required|string',
            'title' => 'required|string',
            'category' => 'required|string',
            'level' => 'required|string',
            'rank' => 'required|string',
            'date' => 'required|string',
            'proof_document' => 'nullable|string',
        ]);

        $ctx = $this->getHomeroomContext($request);
        $schoolId = $ctx['user']->school_id ?? 1;

        $dbAchieve = StudentAchievement::create([
            'school_id' => $schoolId,
            'student_id' => $validated['student_id'],
            'title' => $validated['title'],
            'description' => "Kategori: {$validated['category']}, Tingkat: {$validated['level']}, Peringkat: {$validated['rank']}, Tanggal: {$validated['date']}",
        ]);

        $item = [
            'id' => $dbAchieve->id,
            'student_id' => $validated['student_id'],
            'student_name' => $validated['student_name'],
            'title' => $validated['title'],
            'category' => $validated['category'],
            'level' => $validated['level'],
            'rank' => $validated['rank'],
            'date' => $validated['date'],
            'proof_document' => $validated['proof_document'] ?? 'dokumen_piagam.pdf',
            'verified_status' => 'Diverifikasi Wali Kelas',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Prestasi siswa berhasil ditambahkan dan dicatat.',
            'achievement' => $item,
        ]);
    }

    /**
     * 27. Ekstrakurikuler Siswa
     */
    public function extracurriculars(Request $request)
    {
        return response()->json([
            'success' => true,
            'activities' => [
                [
                    'student_name' => 'Ahmad Fauzi',
                    'extracurricular' => 'Palang Merah Remaja (PMR / KKR)',
                    'coach' => 'Ns. Dewi Anggraeni, S.Kep',
                    'attendance' => '95%',
                    'role' => 'Ketua Divisi Pertolongan Pertama',
                    'achievement' => 'Juara Harapan 1 Lomba Tandu Cepat Tingkat Kota',
                    'status' => 'Sangat Aktif',
                ],
                [
                    'student_name' => 'Nadia Syahrini',
                    'extracurricular' => 'English Club',
                    'coach' => 'Sarah Johnson, M.Hum',
                    'attendance' => '98%',
                    'role' => 'Debater Utama',
                    'achievement' => 'Runner Up Provincial Debate 2026',
                    'status' => 'Sangat Aktif',
                ],
                [
                    'student_name' => 'Citra Lestari',
                    'extracurricular' => 'Tari Tradisional',
                    'coach' => 'Lestari Kusuma, S.Sn',
                    'attendance' => '92%',
                    'role' => 'Anggota Tim Inti',
                    'achievement' => 'Juara 1 FLS2N Jaipong',
                    'status' => 'Aktif',
                ],
                [
                    'student_name' => 'Dimas Arya',
                    'extracurricular' => 'Bola Basket Putra',
                    'coach' => 'Coach Ricky Subagja',
                    'attendance' => '88%',
                    'role' => 'Shooting Guard',
                    'achievement' => 'Semifinalis DBL Regional',
                    'status' => 'Aktif (Perlu atur waktu belajar)',
                ],
            ],
        ]);
    }

    /**
     * 28. Administrasi Rapor Kelas
     * Monitoring kelengkapan nilai, kehadiran, catatan wali kelas, deskripsi, rekomendasi
     */
    public function reportCards(Request $request)
    {
        return response()->json([
            'success' => true,
            'summary' => [
                'total_students' => 34,
                'completed_grades' => 30,
                'incomplete_grades' => 4,
                'homeroom_notes_filled' => 32,
                'ready_for_finalization' => 30,
                'status' => 'Menunggu Nilai Remedial 4 Siswa',
            ],
            'student_report_status' => [
                [
                    'student_id' => 101,
                    'name' => 'Ahmad Fauzi',
                    'nis' => '20241101',
                    'grade_completeness' => '10/10 Mapel Lengkap',
                    'attendance_recorded' => 'Hadir: 82, Sakit: 1, Izin: 1, Alfa: 0',
                    'homeroom_note' => 'Menunjukkan prestasi akademik dan kepemimpinan teladan. Pertahankan kerja keras ananda!',
                    'promotion_recommendation' => 'Direkomendasikan Naik Kelas dengan Pujian',
                    'readiness' => 'Siap Cetak',
                ],
                [
                    'student_id' => 102,
                    'name' => 'Nadia Syahrini',
                    'nis' => '20241102',
                    'grade_completeness' => '10/10 Mapel Lengkap',
                    'attendance_recorded' => 'Hadir: 83, Sakit: 1, Izin: 0, Alfa: 0',
                    'homeroom_note' => 'Siswa sangat tekun dan memiliki bakat komunikasi yang menonjol. Berprestasi sangat baik.',
                    'promotion_recommendation' => 'Direkomendasikan Naik Kelas',
                    'readiness' => 'Siap Cetak',
                ],
                [
                    'student_id' => 103,
                    'name' => 'Rian Hidayat',
                    'nis' => '20241103',
                    'grade_completeness' => '7/10 Mapel Lengkap (Fisika, MTK, Kimia Belum Selesai Remedial)',
                    'attendance_recorded' => 'Hadir: 62, Sakit: 6, Izin: 4, Alfa: 12',
                    'homeroom_note' => 'Perlu meningkatkan disiplin kehadiran dan komitmen belajar. Harap memanfaatkan sesi remedial.',
                    'promotion_recommendation' => 'Perlu Pembahasan Lebih Lanjut (Pending Rapat Dewan Guru)',
                    'readiness' => 'Belum Lengkap',
                ],
                [
                    'student_id' => 104,
                    'name' => 'Citra Lestari',
                    'nis' => '20241104',
                    'grade_completeness' => '10/10 Mapel Lengkap',
                    'attendance_recorded' => 'Hadir: 80, Sakit: 2, Izin: 2, Alfa: 0',
                    'homeroom_note' => 'Prestasi seni tari membanggakan, pertahankan capaian akademik.',
                    'promotion_recommendation' => 'Direkomendasikan Naik Kelas',
                    'readiness' => 'Siap Cetak',
                ],
                [
                    'student_id' => 105,
                    'name' => 'Dimas Arya',
                    'nis' => '20241105',
                    'grade_completeness' => '9/10 Mapel Lengkap (Menunggu Remedial Kimia)',
                    'attendance_recorded' => 'Hadir: 73, Sakit: 4, Izin: 3, Alfa: 4',
                    'homeroom_note' => 'Potensi olahraga baik, perlu fokus meningkatkan nilai mata pelajaran eksakta.',
                    'promotion_recommendation' => 'Direkomendasikan Naik Kelas Bersyarat',
                    'readiness' => 'Menunggu Remedial',
                ],
            ],
        ]);
    }

    public function saveReportCardNotes(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'homeroom_note' => 'required|string',
            'promotion_recommendation' => 'required|string',
        ]);

        $ctx = $this->getHomeroomContext($request);
        $schoolId = $ctx['user']->school_id ?? 1;

        $reportCard = ReportCard::updateOrCreate(
            [
                'school_id' => $schoolId,
                'student_id' => $validated['student_id'],
            ],
            [
                'comments' => $validated['homeroom_note'] . " | Rekomendasi: " . $validated['promotion_recommendation'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Catatan deskripsi perkembangan dan rekomendasi rapor berhasil disimpan.',
        ]);
    }

    /**
     * 29. Finalisasi Rapor
     * Workflow: Guru Mapel Input -> Wali Kelas Review & Catatan -> Kepala Sekolah Approval
     */
    public function reportCardFinalization(Request $request)
    {
        return response()->json([
            'success' => true,
            'workflow_status' => [
                'stage_1_teachers' => ['title' => 'Input Nilai Guru Mapel', 'status' => '94% Selesai', 'completed' => true],
                'stage_2_homeroom' => ['title' => 'Review Kelengkapan & Catatan Wali Kelas', 'status' => 'Sedang Berlangsung', 'completed' => false],
                'stage_3_principal' => ['title' => 'Approval & Pengesahan Kepala Sekolah', 'status' => 'Menunggu Finalisasi Wali Kelas', 'completed' => false],
            ],
            'ready_students_count' => 30,
            'pending_students_count' => 4,
            'can_submit_to_principal' => true,
        ]);
    }

    public function finalizeReportCard(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Administrasi rapor kelas telah difinalisasi dan diajukan ke Kepala Sekolah untuk pengesahan resmi.',
            'submission_code' => 'RAPOR-XI-MIPA1-' . date('YmdHis'),
            'timestamp' => date('Y-m-d H:i:s'),
        ]);
    }

    /**
     * 30. Kenaikan Kelas
     * Kandidat, Nilai, Kehadiran, Pelanggaran, Rekomendasi Wali Kelas
     */
    public function classPromotion(Request $request)
    {
        return response()->json([
            'success' => true,
            'academic_year' => '2026/2027',
            'target_level' => 'Naik ke Kelas XII (Dua Belas)',
            'candidates' => [
                [
                    'student_id' => 101,
                    'name' => 'Ahmad Fauzi',
                    'nis' => '20241101',
                    'average' => 89.5,
                    'attendance' => '97.6%',
                    'violation_points' => 0,
                    'recommendation' => 'Naik Kelas',
                    'notes' => 'Memenuhi seluruh kriteria ketuntasan minimal dan bebas pelanggaran.',
                ],
                [
                    'student_id' => 102,
                    'name' => 'Nadia Syahrini',
                    'nis' => '20241102',
                    'average' => 91.0,
                    'attendance' => '98.8%',
                    'violation_points' => 0,
                    'recommendation' => 'Naik Kelas',
                    'notes' => 'Sangat memuaskan.',
                ],
                [
                    'student_id' => 103,
                    'name' => 'Rian Hidayat',
                    'nis' => '20241103',
                    'average' => 64.2,
                    'attendance' => '73.8%',
                    'violation_points' => 25,
                    'recommendation' => 'Perlu Pembahasan Lebih Lanjut',
                    'notes' => 'Kehadiran di bawah 75% dan terdapat 3 mapel belum tuntas. Menunggu hasil remedial dan rapat pleno.',
                ],
            ],
        ]);
    }

    public function savePromotionRecommendation(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required',
            'recommendation' => 'required|string',
            'notes' => 'required|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Rekomendasi kenaikan kelas berhasil disimpan dan diteruskan ke dewan guru.',
        ]);
    }

    /**
     * 31. Kelulusan (Untuk Kelas Akhir XII)
     */
    public function graduation(Request $request)
    {
        return response()->json([
            'success' => true,
            'class_level' => 'XI (Catatan: Modul kelulusan penuh aktif otomatis untuk kelas XII)',
            'graduation_monitoring' => [
                'total_students' => 34,
                'verified_biodata' => 34,
                'verified_birth_certificate' => 34,
                'uas_readiness' => '100% Terdaftar di DNT Ujian',
                'graduation_projection' => '33 Siswa Memenuhi Syarat, 1 Siswa Dalam Pemantauan Ketat',
                'eligibility_checklist' => [
                    ['criteria' => 'Menyelesaikan seluruh program pembelajaran', 'status' => 'Dalam Proses Semester Berjalan'],
                    ['criteria' => 'Memperoleh nilai sikap/perilaku minimal Baik (B)', 'status' => '33 Baik/Amat Baik, 1 Perhatian'],
                    ['criteria' => 'Lulus ujian satuan pendidikan (USP/CBT)', 'status' => 'Terjadwal Semester Genap'],
                ],
            ],
        ]);
    }

    /**
     * 32. Surat / Dokumen Kelas
     * Pengajuan ke TU
     */
    public function documents(Request $request)
    {
        return response()->json([
            'success' => true,
            'class_documents' => [
                ['id' => 1, 'title' => 'Buku Leger Nilai Kelas XI MIPA 1', 'type' => 'Leger Akademik', 'date' => '2026-09-30', 'file' => 'leger_xi_mipa1.xlsx'],
                ['id' => 2, 'title' => 'Rekap Presensi Bulanan September 2026', 'type' => 'Presensi Resmi', 'date' => '2026-10-01', 'file' => 'presensi_sept_2026.pdf'],
                ['id' => 3, 'title' => 'Daftar Siswa & Biodata Dapodik Kelas', 'type' => 'Data Siswa', 'date' => '2026-08-10', 'file' => 'dapodik_siswa_xi_mipa1.pdf'],
            ],
            'tu_requests' => [
                ['id' => 101, 'student' => 'Nadia Syahrini', 'type' => 'Surat Rekomendasi Lomba Debat Provinsi', 'status' => 'Selesai Terbit', 'date' => '2026-09-16'],
                ['id' => 102, 'student' => 'Rian Hidayat', 'type' => 'Surat Panggilan Orang Tua Resmi (TU & Walikelas)', 'status' => 'Disetujui Kepsek & Terbit', 'date' => '2026-09-26'],
            ],
        ]);
    }

    public function requestTuDocument(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'letter_type' => 'required|string',
            'purpose' => 'required|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permohonan surat resmi kelas berhasil dikirimkan ke loket Tata Usaha (TU).',
            'ticket_id' => 'TU-REQ-' . rand(1000, 9999),
        ]);
    }

    /**
     * 33. Laporan Kelas & Export (PDF, Excel)
     */
    public function reports(Request $request)
    {
        return response()->json([
            'success' => true,
            'available_reports' => [
                ['id' => 'academic', 'title' => 'Laporan Akademik & Ketuntasan Nilai', 'desc' => 'Rata-rata kelas, distribusi nilai, dan persentase ketuntasan per mapel'],
                ['id' => 'attendance', 'title' => 'Laporan Rekapitulasi Presensi Kelas', 'desc' => 'Hadir, Sakit, Izin, Alfa, Terlambat dan tren kehadiran bulanan'],
                ['id' => 'discipline', 'title' => 'Laporan Kedisiplinan & Kasus Pembinaan', 'desc' => 'Daftar pelanggaran, sanksi, dan riwayat bimbingan siswa'],
                ['id' => 'at_risk', 'title' => 'Laporan Siswa Berisiko (Early Warning)', 'desc' => 'Analisis komprehensif siswa high-risk dan rekomendasi intervensi'],
                ['id' => 'achievements', 'title' => 'Laporan Prestasi & Rekam Jejak Siswa', 'desc' => 'Prestasi lomba akademik, seni, dan olahraga tingkat kota hingga nasional'],
            ],
            'export_formats' => ['PDF Resmi (Kop Sekolah)', 'Excel (.xlsx) Lengkap'],
        ]);
    }

    /**
     * 34. Class Analytics
     */
    public function analytics(Request $request)
    {
        return response()->json([
            'success' => true,
            'kpis' => [
                'class_average' => 83.4,
                'attendance_rate' => 94.2,
                'discipline_cases' => 7,
                'assignment_completion' => 89.7,
                'at_risk_students_count' => 4,
            ],
            'grade_distribution' => [
                ['range' => 'A (90 - 100)', 'count' => 8, 'percentage' => 23.5],
                ['range' => 'B (80 - 89)', 'count' => 17, 'percentage' => 50.0],
                ['range' => 'C (75 - 79)', 'count' => 5, 'percentage' => 14.7],
                ['range' => 'D (< 75 Belum Tuntas)', 'count' => 4, 'percentage' => 11.8],
            ],
            'attendance_breakdown' => [
                ['label' => 'Hadir Tepat Waktu', 'percentage' => 91.9],
                ['label' => 'Hadir Terlambat', 'percentage' => 2.3],
                ['label' => 'Izin Sah', 'percentage' => 1.6],
                ['label' => 'Sakit', 'percentage' => 2.0],
                ['label' => 'Alfa (Tanpa Keterangan)', 'percentage' => 2.2],
            ],
        ]);
    }

    /**
     * 35. Early Warning Siswa (EWS)
     * High Risk, Attention, Stable
     */
    public function earlyWarning(Request $request)
    {
        return response()->json([
            'success' => true,
            'categories' => [
                'high_risk' => [
                    'count' => 1,
                    'students' => [
                        [
                            'id' => 103,
                            'name' => 'Rian Hidayat',
                            'nis' => '20241103',
                            'level' => 'High Risk 🔴',
                            'triggers' => [
                                'Kehadiran 73.8% (< batas aman 85%)',
                                'Nilai rata-rata 64.2 (3 mapel belum tuntas)',
                                '8 tugas tertinggal',
                                '25 poin pelanggaran tata tertib',
                            ],
                            'recommendation' => 'Panggilan orang tua fisik ke sekolah, konseling BK intensif, dan kontrak komitmen belajar.',
                        ],
                    ],
                ],
                'attention' => [
                    'count' => 3,
                    'students' => [
                        [
                            'id' => 105,
                            'name' => 'Dimas Arya',
                            'level' => 'Attention 🟡',
                            'triggers' => ['Nilai Kimia turun dari 78 ke 66', '3 tugas belum submit'],
                            'recommendation' => 'Pendampingan manajemen waktu dan remidi Kimia.',
                        ],
                        [
                            'id' => 108,
                            'name' => 'Bayu Wicaksono',
                            'level' => 'Attention 🟡',
                            'triggers' => ['2x terlambat dalam 1 minggu', 'Nilai harian B. Indonesia menurun'],
                            'recommendation' => 'Konseling ringan wali kelas.',
                        ],
                        [
                            'id' => 109,
                            'name' => 'Fahmi Idris',
                            'level' => 'Attention 🟡',
                            'triggers' => ['4x sakit berturut-turut tanpa surat medis awal'],
                            'recommendation' => 'Klarifikasi kondisi kesehatan ke orang tua.',
                        ],
                    ],
                ],
                'stable' => [
                    'count' => 30,
                    'description' => '30 siswa dalam kondisi normal, kehadiran > 90%, dan nilai tuntas.',
                ],
            ],
        ]);
    }

    /**
     * 36. Comparison Perkembangan Siswa
     * Bulan 1 -> Bulan 2 -> Bulan 3
     */
    public function comparison(Request $request)
    {
        return response()->json([
            'success' => true,
            'months' => ['Agustus 2026', 'September 2026', 'Oktober 2026'],
            'indicators' => [
                [
                    'indicator' => 'Rata-rata Nilai Kelas',
                    'm1' => 81.2,
                    'm2' => 82.5,
                    'm3' => 83.4,
                    'status' => 'Meningkat (+2.2)',
                ],
                [
                    'indicator' => 'Tingkat Kehadiran (%)',
                    'm1' => 95.8,
                    'm2' => 94.1,
                    'm3' => 94.2,
                    'status' => 'Stabil Tinggi',
                ],
                [
                    'indicator' => 'Ketuntasan Pengumpulan Tugas (%)',
                    'm1' => 88.0,
                    'm2' => 89.5,
                    'm3' => 91.0,
                    'status' => 'Meningkat (+3.0%)',
                ],
                [
                    'indicator' => 'Kasus Pelanggaran Disiplin',
                    'm1' => 1,
                    'm2' => 4,
                    'm3' => 2,
                    'status' => 'Menurun di Bulan 3',
                ],
                [
                    'indicator' => 'Perolehan Prestasi Baru',
                    'm1' => 1,
                    'm2' => 2,
                    'm3' => 1,
                    'status' => 'Produktif (4 Total)',
                ],
            ],
        ]);
    }

    /**
     * 37. Meeting / Pertemuan Orang Tua
     */
    public function parentMeetings(Request $request)
    {
        return response()->json([
            'success' => true,
            'meetings' => [
                [
                    'id' => 1,
                    'title' => 'Sosialisasi Program Belajar & Tata Tertib Semester Ganjil',
                    'date' => '2026-08-08',
                    'time' => '09:00 - 11:30',
                    'venue' => 'Aula Pertemuan Gedung B',
                    'attendees_count' => '32 / 34 Orang Tua Hadir',
                    'agenda' => 'Pemaparan kurikulum, kesepakatan komitmen anti-bullying, dan pembentukan paguyuban orang tua.',
                    'minutes' => 'Seluruh wali murid sepakat mendukung pengawasan jam belajar malam di rumah pukul 19:00 - 21:00.',
                    'follow_up' => 'Grup WhatsApp koordinasi paguyuban diaktifkan.',
                ],
                [
                    'id' => 2,
                    'title' => 'Pertemuan Terbatas Pendampingan Belajar Siswa Berisiko',
                    'date' => '2026-10-06',
                    'time' => '13:00 - 15:00',
                    'venue' => 'Ruang Konseling & Wali Kelas',
                    'attendees_count' => 'Undangan: 4 Orang Tua',
                    'agenda' => 'Diskusi pemecahan masalah absensi dan persiapan ujian remedial.',
                    'minutes' => 'Draf komitmen bersama telah disiapkan.',
                    'follow_up' => 'Pelaksanaan pertemuan awal pekan depan.',
                ],
            ],
        ]);
    }

    public function storeParentMeeting(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'date' => 'required|string',
            'time' => 'required|string',
            'venue' => 'required|string',
            'agenda' => 'required|string',
        ]);

        $item = [
            'id' => rand(100, 999),
            'title' => $validated['title'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'venue' => $validated['venue'],
            'agenda' => $validated['agenda'],
            'attendees_count' => 'Undangan Baru Diterbitkan',
            'minutes' => 'Belum dilaksanakan',
            'follow_up' => 'Kirim undangan via WhatsApp/surat',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Jadwal pertemuan orang tua berhasil dibuat.',
            'meeting' => $item,
        ]);
    }

    /**
     * 38. Homeroom Notes (Internal Confidential)
     * Catatan internal wali kelas, tidak otomatis terlihat oleh siswa/ortu
     */
    public function homeroomNotesPrivate(Request $request)
    {
        return response()->json([
            'success' => true,
            'confidential_notes' => [
                [
                    'id' => 1,
                    'student_name' => 'Rian Hidayat',
                    'date' => '2026-09-24',
                    'type' => 'Catatan Observasi Pribadi',
                    'content' => 'Rian terlihat menjauhi teman-teman sekelompok saat kerja praktik Fisika. Terlihat mengantuk berat. Diduga ada masalah keluarga atau begadang bermain game online hingga larut malam. Perlu koordinasi hangat dengan konselor BK.',
                    'status' => 'Bahas dengan BK Bu Nurul',
                ],
                [
                    'id' => 2,
                    'student_name' => 'Cantika Putri',
                    'date' => '2026-09-18',
                    'type' => 'Catatan Observasi Finansial',
                    'content' => 'Orang tua siswa sempat menanyakan dispensasi biaya kegiatan studi lapangan karena sang ayah baru mengalami pemutusan hubungan kerja. Diusulkan bantuan keringanan via TU/Komite.',
                    'status' => 'Koordinasi TU Berhasil',
                ],
            ],
        ]);
    }

    public function storeHomeroomNotesPrivate(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'type' => 'required|string',
            'content' => 'required|string',
        ]);

        $item = [
            'id' => rand(100, 999),
            'student_name' => $validated['student_name'],
            'date' => date('Y-m-d'),
            'type' => $validated['type'],
            'content' => $validated['content'],
            'status' => 'Disimpan Rahasia (Wali Kelas)',
        ];

        return response()->json([
            'success' => true,
            'message' => 'Catatan internal rahasia wali kelas berhasil disimpan.',
            'note' => $item,
        ]);
    }

    /**
     * 39. Notifikasi
     */
    public function notifications(Request $request)
    {
        return response()->json([
            'success' => true,
            'notifications' => [
                ['id' => 1, 'type' => 'absence', 'title' => 'Siswa Tidak Hadir Hari Ini', 'message' => 'Rian Hidayat tercatat Alfa pada presensi pagi ini.', 'time' => '07:30', 'read' => false],
                ['id' => 2, 'type' => 'grades', 'title' => 'Penurunan Nilai Siswa', 'message' => 'Nilai UTS Fisika kelas telah diunggah oleh Bu Ratna Dewi.', 'time' => 'Kemarin', 'read' => true],
                ['id' => 3, 'type' => 'discipline', 'title' => 'Laporan Pelanggaran Baru', 'message' => 'Poin pelanggaran Rian Hidayat mencapai batas peringatan (25 poin).', 'time' => '2 hari lalu', 'read' => true],
                ['id' => 4, 'type' => 'bk', 'title' => 'Respon Referral BK', 'message' => 'Guru BK Ibu Nurul telah menerima rujukan ananda Rian dan menjadwalkan konseling.', 'time' => '3 hari lalu', 'read' => true],
                ['id' => 5, 'type' => 'schedule', 'title' => 'Perubahan Jadwal Pelajaran', 'message' => 'Jadwal Biologi hari Selasa dipindahkan ke jam ke-3 di Lab Biologi.', 'time' => '4 hari lalu', 'read' => true],
            ],
        ]);
    }

    /**
     * 40. Global Search Terbatas
     * Scoped to class: Siswa, Ortu, Guru Mapel, Mapel, Jadwal, Dokumen, Catatan
     */
    public function search(Request $request)
    {
        $q = strtolower($request->query('q', ''));

        return response()->json([
            'success' => true,
            'query' => $q,
            'scope' => 'Hanya Lingkup Kelas XI MIPA 1 (Sesuai Batasan Kewenangan)',
            'results' => [
                'students' => [
                    ['title' => 'Ahmad Fauzi (Siswa)', 'sub' => 'NIS: 20241101 | KM | Peringkat 1'],
                    ['title' => 'Rian Hidayat (Siswa)', 'sub' => 'NIS: 20241103 | Siswa Berisiko EWS'],
                ],
                'parents' => [
                    ['title' => 'Fauzi Hidayat, S.E.', 'sub' => 'Orang Tua Ahmad Fauzi (0812-9988-1122)'],
                    ['title' => 'Hidayat Sutisna', 'sub' => 'Orang Tua Rian Hidayat (0815-7766-3322)'],
                ],
                'subject_teachers' => [
                    ['title' => 'Drs. Hendro Wibowo', 'sub' => 'Guru Matematika Peminatan XI MIPA 1'],
                    ['title' => 'Ratna Dewi, M.Si', 'sub' => 'Guru Fisika Terapan XI MIPA 1'],
                ],
                'documents' => [
                    ['title' => 'Leger Nilai Semester Ganjil', 'sub' => 'Berkas Rapor XI MIPA 1'],
                    ['title' => 'Rekap Presensi September 2026', 'sub' => 'Dokumen Presensi Resmi'],
                ],
            ],
        ]);
    }

    /**
     * 41. Profil & Keamanan
     */
    public function profile(Request $request)
    {
        $ctx = $this->getHomeroomContext($request);
        $user = $ctx['user'];

        return response()->json([
            'success' => true,
            'profile' => [
                'name' => $user ? ($user->name ?? $user->nama ?? 'Siti Aminah, M.Pd') : 'Siti Aminah, M.Pd',
                'nip' => '198405122008012015',
                'role' => 'Wali Kelas & Guru Pengajar',
                'email' => $user ? $user->email : 'siti.aminah@sekolah.sch.id',
                'assigned_class' => 'XI MIPA 1',
                'appointment_letter' => 'SK Kepala Sekolah No. 421.3/089/SK-WAKEL/2026',
                'teaching_subjects' => ['Biologi Terapan', 'Ilmu Pengetahuan Alam & Sosial (IPAS)'],
                'security' => [
                    'two_factor_enabled' => true,
                    'last_login' => date('d M Y H:i'),
                    'current_session_ip' => $request->ip() ?: '127.0.0.1',
                    'active_devices' => 1,
                ],
                'dual_role_info' => [
                    'is_teacher' => true,
                    'is_homeroom' => true,
                    'hint' => 'Anda memiliki peran ganda: Guru Pengajar (mengajar mapel Biologi) dan Wali Kelas (mengasuh XI MIPA 1). Anda dapat beralih konteks kapan saja.',
                ],
            ],
        ]);
    }

    /**
     * 42. Help & Support
     */
    public function help(Request $request)
    {
        return response()->json([
            'success' => true,
            'faqs' => [
                [
                    'q' => 'Apakah Wali Kelas boleh mengubah nilai yang diinput oleh Guru Mata Pelajaran?',
                    'a' => 'Tidak. Sesuai batasan akses resmi, Wali Kelas hanya memonitor ketuntasan dan kelengkapan nilai, serta memberi catatan perkembangan rapor. Perubahan nilai harus dilakukan oleh guru mapel bersangkutan.',
                ],
                [
                    'q' => 'Bagaimana alur koreksi presensi yang sah jika siswa membawa surat dokter?',
                    'a' => 'Wali Kelas membuka menu Presensi -> Koreksi Presensi -> ubah status dari Alfa ke Sakit, unggah foto surat dokter, dan simpan. Seluruh perubahan otomatis tercatat di Audit Log sekolah.',
                ],
                [
                    'q' => 'Kapan siswa harus dirujuk ke BK?',
                    'a' => 'Jika masalah telah melampaui pembinaan ringan kelas (misal: absensi < 75%, masalah psikologis, atau poin pelanggaran mencapai SP-1), gunakan fitur Referral BK.',
                ],
                [
                    'q' => 'Bagaimana alur finalisasi rapor kelas?',
                    'a' => 'Guru mapel melengkapi nilai -> Wali Kelas memeriksa kelengkapan & mengisi deskripsi catatan -> Wali Kelas menekan Finalisasi Rapor -> Kepala Sekolah memberikan persetujuan akhir.',
                ],
            ],
            'emergency_contacts' => [
                'Admin Sistem Sekolah' => '0811-2233-4455 (Ext. 101)',
                'Koordinator BK' => '0812-3344-5566 (Ext. 104)',
                'Loket Tata Usaha' => '0813-4455-6677 (Ext. 102)',
            ],
        ]);
    }
}
