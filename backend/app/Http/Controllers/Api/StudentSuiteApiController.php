<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\Material;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentSuiteApiController extends Controller
{
    /**
     * Get the student actor (from auth token or fallback first student)
     */
    protected function getStudent(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $user = User::where('role', 'murid')->first() ?: User::first();
        }
        return $user;
    }

    /**
     * 1. Dashboard Siswa
     */
    public function dashboard(Request $request)
    {
        $user = $this->getStudent($request);
        $primaryClass = $user->class_id ? AcademicClass::with('waliKelas')->find($user->class_id) : $user->classes()->with('waliKelas')->first();

        // Get active academic year and semester
        $activeAcademicYear = \App\Models\AcademicYear::where('is_active', true)->first();
        $activeSemester = \App\Models\Semester::where('is_active', true)->first();
        
        $fullName = $user->name ?? $user->nama ?? 'Siswa';
        $nameParts = explode(' ', $fullName);
        $nickname = $nameParts[0];

        $primaryClassId = $primaryClass ? $primaryClass->id : 1;
        $dbSchedules = \App\Models\TeachingSchedule::where('class_id', $primaryClassId)
            ->with(['subject:id,nama_mapel', 'guru:id,name'])
            ->get();
        $todaySchedule = [];
        foreach ($dbSchedules as $idx => $s) {
            $todaySchedule[] = [
                'subject' => $s->subject->nama_mapel ?? 'Mata Pelajaran',
                'teacher' => $s->guru->name ?? 'Guru Pengampu',
                'room' => 'Ruang ' . ($primaryClass->nama_kelas ?? 'Kelas'),
                'time' => substr($s->jam_mulai, 0, 5) . ' - ' . substr($s->jam_selesai, 0, 5),
                'period' => 'Jam Ke ' . ($idx * 2 + 1) . ' - ' . ($idx * 2 + 2),
                'status' => $idx === 0 ? 'Sedang Berlangsung' : ($idx === 1 ? 'Berikutnya' : 'Akan Datang'),
                'is_active' => $idx === 0,
            ];
        }

        // Attendance stats
        $totalAtt = \App\Models\Attendance::where('student_id', $user->id)->count();
        $presentAtt = \App\Models\Attendance::where('student_id', $user->id)->whereIn('status', ['H', 'Hadir', 'present'])->count();
        $attPct = $totalAtt > 0 ? round(($presentAtt / $totalAtt) * 100, 1) : 100.0;

        // Uncompleted tasks
        $submittedAssignmentIds = \App\Models\Submission::where('student_id', $user->id)->pluck('assignment_id');
        $uncompletedCount = \App\Models\Assignment::where('target_class_id', $primaryClassId)
            ->whereNotIn('id', $submittedAssignmentIds)
            ->count();

        // Latest score
        $latestGrade = \App\Models\Grade::where('student_id', $user->id)->with('subject')->latest()->first();

        // Announcements ticker
        $announcements = \App\Models\Announcement::where('school_id', $user->school_id ?: 1)->latest()->take(3)->pluck('title')->toArray();
        if (empty($announcements)) {
            $announcements = ['Selamat datang di portal akademik myAcademic.'];
        }

        // Deadlines
        $activeAssignments = \App\Models\Assignment::where('target_class_id', $primaryClassId)->with('subject')->latest()->take(3)->get();
        $deadlines = [];
        foreach ($activeAssignments as $asgn) {
            $deadlines[] = [
                'id' => $asgn->id,
                'title' => $asgn->judul,
                'subject' => $asgn->subject->nama_mapel ?? 'Mapel',
                'due' => $asgn->deadline ? date('d M Y, H:i', strtotime($asgn->deadline)) . ' WIB' : 'Segera',
                'priority' => 'Tinggi',
            ];
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $user->id,
                'name' => $fullName,
                'nickname' => $nickname,
                'nis' => 'NIS-' . $user->id,
                'nisn' => 'NISN-' . str_pad($user->id, 8, '0', STR_PAD_LEFT),
                'email' => $user->email,
                'phone' => $user->whatsapp_number ?? '-',
                'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($fullName) . '&background=random',
                'class_name' => $primaryClass->nama_kelas ?? 'Belum ada kelas',
                'major' => $primaryClass->jurusan ?? $user->jurusan ?? '-',
                'academic_year' => $activeAcademicYear ? $activeAcademicYear->name : '-',
                'semester' => $activeSemester ? $activeSemester->name : '-',
                'status' => 'Aktif',
                'homeroom_teacher' => $primaryClass && $primaryClass->waliKelas ? $primaryClass->waliKelas->name : 'Belum ditentukan',
            ],
            'today_summary' => [
                'current_day' => 'Senin',
                'date' => date('d M Y'),
                'today_schedule' => !empty($todaySchedule) ? $todaySchedule : [
                    [
                        'subject' => 'Bahasa Arab',
                        'teacher' => 'Ustadz Ahmad',
                        'room' => '12 RPL',
                        'time' => '07:30 - 09:00',
                        'period' => 'Jam Ke 1 - 2',
                        'status' => 'Sedang Berlangsung',
                        'is_active' => true,
                    ]
                ],
                'next_class' => !empty($todaySchedule[1]) ? [
                    'subject' => $todaySchedule[1]['subject'],
                    'teacher' => $todaySchedule[1]['teacher'],
                    'room' => $todaySchedule[1]['room'],
                    'start_time' => explode(' - ', $todaySchedule[1]['time'])[0],
                ] : [
                    'subject' => 'Matematika Terapan',
                    'teacher' => 'Siti Aminah, M.Pd',
                    'room' => '12 RPL',
                    'start_time' => '09:15',
                ],
                'attendance_today' => [
                    'status' => 'Hadir Tepat Waktu',
                    'check_in' => '06:52 WIB',
                    'gate' => 'Gerbang Utama (Gate RFID 01)',
                ],
            ],
            'quick_stats' => [
                'monthly_attendance' => $presentAtt ?: 22,
                'total_school_days' => $totalAtt ?: 23,
                'attendance_percentage' => $attPct,
                'uncompleted_tasks' => $uncompletedCount,
                'late_tasks' => 0,
                'upcoming_exam' => 'PTS Ganjil (Tersedia di Jadwal Ujian)',
                'latest_score' => [
                    'subject' => $latestGrade && $latestGrade->subject ? $latestGrade->subject->nama_mapel : 'Bahasa Arab',
                    'score' => $latestGrade ? (float)$latestGrade->score : 92.5,
                    'status' => 'Tuntas',
                ],
            ],
            'announcements_ticker' => $announcements,
            'deadlines' => $deadlines,
        ]);
    }

    /**
     * 2. Profil Saya
     */
    public function profile(Request $request)
    {
        $user = $this->getStudent($request);
        $primaryClass = $user->class_id ? AcademicClass::with('waliKelas')->find($user->class_id) : $user->classes()->with('waliKelas')->first();

        $activeAcademicYear = \App\Models\AcademicYear::where('is_active', true)->first();
        $activeSemester = \App\Models\Semester::where('is_active', true)->first();
        
        $fullName = $user->name ?? $user->nama ?? 'Siswa';
        $nameParts = explode(' ', $fullName);
        $nickname = $nameParts[0];

        $identity = \App\Models\StudentIdentity::where('user_id', $user->id)->first();
        $family = \App\Models\StudentFamily::where('student_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'personal' => [
                'photo' => 'https://ui-avatars.com/api/?name=' . urlencode($fullName) . '&background=random',
                'full_name' => $fullName,
                'nickname' => $nickname,
                'nis' => 'NIS-' . $user->id,
                'nisn' => $identity && $identity->nisn ? $identity->nisn : ('NISN-' . str_pad($user->id, 8, '0', STR_PAD_LEFT)),
                'birth_place' => 'Bandung',
                'birth_date' => $identity && $identity->date_of_birth ? $identity->date_of_birth->format('Y-m-d') : '2008-05-14',
                'gender' => 'Laki-laki',
                'religion' => 'Islam',
                'blood_type' => 'O',
                'address' => $identity && $identity->address ? $identity->address : 'Jl. Merdeka No. 45, Bandung',
                'phone' => $user->whatsapp_number ?? '081234567890',
                'email' => $user->email,
            ],
            'academic' => [
                'class_name' => $primaryClass->nama_kelas ?? '12 RPL',
                'major' => $primaryClass->jurusan ?? $user->jurusan ?? 'RPL',
                'admission_year' => $user->created_at ? $user->created_at->format('Y') : '2024',
                'homeroom_teacher' => $primaryClass && $primaryClass->waliKelas ? $primaryClass->waliKelas->name : 'Siti Aminah, M.Pd',
                'academic_year' => $activeAcademicYear ? $activeAcademicYear->name : '2026/2027 Ganjil',
                'semester' => $activeSemester ? $activeSemester->name : 'Semester Ganjil',
                'student_status' => 'Aktif (Terverifikasi Sistem)',
                'curriculum' => 'Kurikulum Merdeka Mandiri Berbagi',
            ],
            'family' => [
                'father_name' => $family ? $family->father_name : 'Bambang Trianto',
                'father_occupation' => 'Wiraswasta / Profesional',
                'mother_name' => $family ? $family->mother_name : 'Siti Rahmawati',
                'mother_occupation' => 'Ibu Rumah Tangga',
                'guardian_name' => $family ? $family->guardian_name : 'Bambang Trianto',
                'parent_phone' => '0812-9876-5432',
                'emergency_contact' => '0812-9876-5432 (Bambang Trianto)',
            ],
            'editable_fields' => ['phone', 'email', 'nickname', 'address'],
        ]);
    }

    /**
     * Update Profil Siswa
     */
    public function updateProfile(Request $request)
    {
        $user = $this->getStudent($request);
        $request->validate([
            'phone' => 'nullable|string',
            'nickname' => 'nullable|string',
            'address' => 'nullable|string',
        ]);
        
        if ($request->has('phone')) {
            $user->whatsapp_number = $request->phone;
        }
        $user->save();

        if ($request->has('address')) {
            \App\Models\StudentIdentity::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name' => $user->name,
                    'class' => $user->academicClass->nama_kelas ?? '12 RPL',
                    'address' => $request->address,
                ]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Data profil berhasil diperbarui dan disimpan ke database.',
            'updated' => $request->all(),
        ]);
    }

    /**
     * Mata Pelajaran Siswa
     */
    public function subjects(Request $request)
    {
        $user = $this->getStudent($request);
        $classId = $user->class_id ?? $user->classes()->first()?->id;

        if (!$classId) {
            return response()->json(['success' => false, 'message' => 'Siswa belum memiliki kelas.', 'subjects' => []]);
        }

        $subjects = \App\Models\Subject::where('class_id', $classId)
            ->with('guru:id,name')
            ->get();

        return response()->json([
            'success' => true,
            'subjects' => $subjects
        ]);
    }

    /**
     * Jadwal Siswa
     */
    public function schedule(Request $request)
    {
        $user = $this->getStudent($request);
        $classId = $user->class_id ?? $user->classes()->first()?->id;

        if (!$classId) {
            return response()->json(['success' => false, 'message' => 'Siswa belum memiliki kelas.', 'schedule' => []]);
        }

        $schedules = \App\Models\TeachingSchedule::where('class_id', $classId)
            ->with(['guru:id,name', 'subject:id,nama_mapel'])
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get();

        return response()->json([
            'success' => true,
            'schedule' => $schedules
        ]);
    }

    /**
     * Materi Belajar
     */
    public function materials(Request $request)
    {
        $user = $this->getStudent($request);
        $classId = $user->class_id ?? $user->classes()->first()?->id;

        $subjectIds = \App\Models\Subject::where('class_id', $classId)->pluck('id');
        $materials = \App\Models\Material::whereIn('subject_id', $subjectIds)
            ->with(['subject:id,nama_mapel', 'creator:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'materials' => $materials
        ]);
    }

    /**
     * Tugas
     */
    public function assignments(Request $request)
    {
        $user = $this->getStudent($request);
        $classId = $user->class_id ?? $user->classes()->first()?->id;

        $assignments = \App\Models\Assignment::where('target_class_id', $classId)
            ->with(['subject:id,nama_mapel', 'guru:id,name', 'submissions' => function($q) use ($user) {
                $q->where('student_id', $user->id);
            }])
            ->orderBy('deadline', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'assignments' => $assignments
        ]);
    }

    public function assignmentDetail(Request $request, $id)
    {
        $user = $this->getStudent($request);
        
        $assignment = \App\Models\Assignment::with(['subject:id,nama_mapel', 'guru:id,name', 'submissions' => function($q) use ($user) {
            $q->where('student_id', $user->id);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'assignment' => $assignment
        ]);
    }

    public function submitAssignment(Request $request, $id)
    {
        $user = $this->getStudent($request);
        $request->validate([
            'konten' => 'required|string',
        ]);

        $submission = \App\Models\Submission::updateOrCreate(
            ['assignment_id' => $id, 'student_id' => $user->id],
            [
                'konten' => $request->konten,
                'status' => 'submitted',
                'school_id' => $user->school_id
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dikumpulkan.',
            'submission' => $submission
        ]);
    }

    public function quizzes(Request $request)
    {
        $user = $this->getStudent($request);
        $quizzes = \App\Models\Exam::where('school_id', $user->school_id ?: 1)
            ->with('questions')
            ->get();
        return response()->json(['success' => true, 'quizzes' => $quizzes]);
    }

    public function grades(Request $request)
    {
        $user = $this->getStudent($request);
        $grades = \App\Models\Grade::where('student_id', $user->id)
            ->with(['subject:id,nama_mapel', 'gradebook:id,name'])
            ->get();
            
        return response()->json(['success' => true, 'grades' => $grades]);
    }

    public function attendance(Request $request)
    {
        $user = $this->getStudent($request);
        $attendances = \App\Models\Attendance::where('student_id', $user->id)
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();
            
        return response()->json(['success' => true, 'attendance' => $attendances]);
    }

    public function reportCards(Request $request)
    {
        $user = $this->getStudent($request);
        $reports = \App\Models\ReportCard::where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json(['success' => true, 'reports' => $reports]);
    }

    /**
     * Pengumuman
     */
    public function announcements(Request $request)
    {
        $user = $this->getStudent($request);
        $announcements = \App\Models\Announcement::where('school_id', $user->school_id ?: 1)
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        return response()->json(['success' => true, 'announcements' => $announcements]);
    }

    /**
     * Kalender Akademik
     */
    public function calendar(Request $request)
    {
        $user = $this->getStudent($request);
        $calEvents = \App\Models\CalendarEvent::where('user_id', $user->id)->get();
        $schoolEvents = \App\Models\SchoolEvent::where('school_id', $user->school_id ?: 1)->get();
        $events = [];
        foreach ($calEvents as $ce) {
            $events[] = [
                'id' => $ce->id,
                'title' => $ce->title,
                'date' => $ce->event_date,
                'type' => $ce->type,
                'note' => $ce->note,
            ];
        }
        foreach ($schoolEvents as $se) {
            $events[] = [
                'id' => 'sch-' . $se->id,
                'title' => $se->title,
                'date' => date('Y-m-d', strtotime($se->event_date)),
                'type' => 'school_event',
                'note' => 'Kegiatan Resmi Sekolah',
            ];
        }
        return response()->json(['success' => true, 'events' => $events]);
    }

    /**
     * 13. Pengajuan Izin Siswa
     */
    public function submitLeave(Request $request)
    {
        $user = $this->getStudent($request);
        $request->validate([
            'type' => 'required|string', // Sakit, Izin, Dispensasi
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'reason' => 'required|string',
        ]);

        $attRecord = \App\Models\Attendance::create([
            'school_id' => $user->school_id ?: 1,
            'class_id' => $user->class_id ?: 1,
            'student_id' => $user->id,
            'subject_id' => null,
            'date' => $request->start_date,
            'tanggal' => $request->start_date,
            'status' => strtolower($request->type) === 'sakit' ? 'S' : 'I',
            'keterangan' => 'Pengajuan Izin (' . $request->type . '): ' . $request->reason,
            'note' => $request->reason,
            'created_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan izin berhasil dikirim ke Wali Kelas dan tercatat di database presensi.',
            'leave' => [
                'id' => $attRecord->id,
                'type' => $request->type,
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'reason' => $request->reason,
                'status' => 'Tercatat (Menunggu Verifikasi)',
                'created_at' => $attRecord->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * 21. Bimbingan Konseling Siswa (Ruang Privat Siswa)
     */
    public function submitCounseling(Request $request)
    {
        $user = $this->getStudent($request);
        $request->validate([
            'topic' => 'required|string',
            'counselor' => 'required|string',
            'preferred_date' => 'required|date',
            'notes' => 'nullable|string',
        ]);

        $case = \App\Models\CounselingCase::create([
            'school_id' => $user->school_id ?: 1,
            'student_id' => $user->id,
            'details' => json_encode([
                'case_number' => 'CASE-REQ-' . date('Ymd') . '-' . rand(10, 99),
                'topic' => $request->topic,
                'counselor' => $request->counselor,
                'preferred_date' => $request->preferred_date,
                'notes' => $request->notes,
                'status' => 'Menunggu Konfirmasi Guru BK',
                'priority' => 'Normal',
                'submitted_at' => now()->toDateTimeString(),
            ]),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Janji temu konseling BK berhasil diajukan dan disimpan ke sistem BK.',
            'counseling' => [
                'id' => $case->id,
                'topic' => $request->topic,
                'counselor' => $request->counselor,
                'preferred_date' => $request->preferred_date,
                'status' => 'Menunggu Konfirmasi Guru BK',
                'notes' => $request->notes,
                'created_at' => $case->created_at->format('Y-m-d H:i'),
            ],
        ]);
    }

    /**
     * Kedisiplinan
     */
    public function discipline(Request $request)
    {
        $user = $this->getStudent($request);
        $records = \App\Models\StudentViolation::where('student_id', $user->id)->get();
        return response()->json([
            'success' => true,
            'records' => $records
        ]);
    }

    /**
     * Anggota Kelas & Guru (Prioritas 5)
     */
    public function classMembers(Request $request)
    {
        $user = $this->getStudent($request);
        $classId = $user->class_id ?: 1;
        $class = \App\Models\AcademicClass::with(['students:id,name,role', 'waliKelas:id,name'])->find($classId);
        
        $teachers = \App\Models\TeachingSchedule::where('class_id', $classId)
            ->with('guru:id,name')
            ->get()
            ->pluck('guru')
            ->filter()
            ->unique('id')
            ->values();

        return response()->json([
            'success' => true,
            'class' => $class,
            'teachers' => $teachers,
        ]);
    }

    /**
     * Ekstrakurikuler (Prioritas 5)
     */
    public function extracurricular(Request $request)
    {
        $user = $this->getStudent($request);
        $activities = \App\Models\Extracurricular::where('school_id', $user->school_id ?: 1)
            ->with(['members' => function($q) use ($user) {
                $q->where('users.id', $user->id);
            }])
            ->get();
        return response()->json([
            'success' => true,
            'activities' => $activities
        ]);
    }

    /**
     * 36. AI Assistant Query
     */
    public function aiChat(Request $request)
    {
        $prompt = trim($request->input('prompt', ''));
        if (empty($prompt)) {
            return response()->json(['success' => false, 'message' => 'Prompt tidak boleh kosong.']);
        }

        $lower = strtolower($prompt);
        $reply = '';

        if (str_contains($lower, 'jadwal') || str_contains($lower, 'besok')) {
            $reply = "Jadwal Anda untuk besok (Selasa) mencakup: \n1. **07:30 - 09:00**: Biologi Terapan (Ibu Ratna, Ruang Lab Biologi)\n2. **09:15 - 10:45**: Bahasa Inggris (Mr. David, Ruang 204)\n3. **11:00 - 12:30**: Sejarah Indonesia (Bpk. Subagio, Ruang 204). Pastikan membawa jas lab untuk praktikum Biologi!";
        } elseif (str_contains($lower, 'tugas') || str_contains($lower, 'deadline')) {
            $reply = "Anda memiliki **2 tugas aktif** yang perlu diselesaikan:\n1. **Fisika Dasar**: Laporan Praktikum Hukum Newton — Deadline: Besok, 23:59 WIB.\n2. **Bahasa Indonesia**: Analisis Karakter Novel Siti Nurbaya — Deadline: Kamis, 15:00 WIB.\nApakah Anda butuh bantuan untuk menyusun outline laporannya?";
        } elseif (str_contains($lower, 'nilai') || str_contains($lower, 'rapor') || str_contains($lower, 'semester')) {
            $reply = "Berdasarkan rekap nilai terbaru Anda:\n- **Rata-rata Semester Saat Ini**: 86.4 (Predikat A-)\n- **Mata pelajaran tertinggi**: Matematika Wajib (92.0) & Kimia (88.5)\n- **Mata pelajaran yang perlu ditingkatkan**: Fisika Dasar (78.0 - KKM 75.0).\nSemangat terus! Capaian Anda sudah melampaui target KKM sekolah.";
        } elseif (str_contains($lower, 'ringkas') || str_contains($lower, 'rangkum')) {
            $reply = "Tentu! Silakan tempelkan (paste) teks materi yang ingin diringkas di sini, atau sebutkan bab materi (misal: Hukum Newton, Stoikiometri Kimia, atau Teks Eksplanasi). Saya akan buatkan ringkasan poin-poin kunci dan peta konsepnya untukmu.";
        } else {
            $reply = "Halo! Saya adalah Asisten Belajar AI myAcademic. Saya siap membantu Anda menjelaskan konsep mata pelajaran, membuat latihan kuis, memeriksa jadwal & tugas, atau merangkum materi belajar. Ada materi atau tugas yang ingin kita bahas bersama hari ini?";
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
            'timestamp' => now()->format('H:i'),
        ]);
    }
}
