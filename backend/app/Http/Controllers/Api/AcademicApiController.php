<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\Material;
use App\Models\AcademicClass;
use App\Models\StudyFile;
use App\Models\StudyFolder;
use App\Models\StudyGoal;
use App\Models\StudyGoalLog;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\TabelOfflineScore;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AcademicApiController extends Controller
{
    /**
     * User Login API (Supports Username + Password, Name + Password, Email + Password, & Google)
     */
    public function login(Request $request)
    {
        $inputLogin = $request->input('login') ?: $request->input('username') ?: $request->input('email');
        $password = $request->input('password');

        if (!$inputLogin) {
            return response()->json([
                'success' => false,
                'message' => 'Username atau email wajib diisi.',
            ], 422);
        }

        // Support login by Username, Name, or Email
        $user = User::where(function ($q) use ($inputLogin) {
            $q->where('username', $inputLogin)
              ->orWhere('email', $inputLogin)
              ->orWhere('name', $inputLogin)
              ->orWhere('nama', $inputLogin);
        })->first();

        if (!$user || !$password || !Hash::check($password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial login (username/email atau password) tidak cocok.',
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        // Record or refresh active login session
        try {
            $userAgent = $request->header('User-Agent', 'Desktop Browser');
            $ip = $request->ip() ?: '127.0.0.1';
            
            $platform = 'Desktop';
            if (stripos($userAgent, 'iPhone') !== false) $platform = 'iOS';
            elseif (stripos($userAgent, 'Android') !== false) $platform = 'Android';
            elseif (stripos($userAgent, 'Windows') !== false) $platform = 'Windows';
            elseif (stripos($userAgent, 'Macintosh') !== false) $platform = 'macOS';
            elseif (stripos($userAgent, 'Linux') !== false) $platform = 'Linux';

            $browser = 'Browser';
            if (stripos($userAgent, 'Chrome') !== false) $browser = 'Google Chrome';
            elseif (stripos($userAgent, 'Safari') !== false) $browser = 'Safari';
            elseif (stripos($userAgent, 'Firefox') !== false) $browser = 'Mozilla Firefox';
            elseif (stripos($userAgent, 'Edge') !== false) $browser = 'Microsoft Edge';

            \App\Models\UserLoginSession::where('user_id', $user->id)->update(['is_current' => false]);
            \App\Models\UserLoginSession::create([
                'user_id' => $user->id,
                'session_token' => 'sess_' . bin2hex(random_bytes(16)),
                'device_name' => $platform . ' (' . $browser . ')',
                'platform' => $platform,
                'browser' => $browser,
                'ip_address' => $ip,
                'approx_location' => 'Indonesia',
                'is_current' => true,
                'last_active_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Non-blocking for session tracking
        }

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?? $user->nama,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'school_id' => $user->school_id,
                'class_id' => $user->class_id,
                'lifecycle_status' => $user->lifecycle_status ?? 'active_student',
                'subscription_type' => $user->subscription_type ?? 'school_sponsored',
                'preferred_theme' => $user->preferred_theme ?? 'formal',
                'preferred_language' => $user->preferred_language ?? 'id',
            ],
        ]);
    }

    /**
     * User Logout API
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }

    /**
     * Get Current Authenticated User
     */
    public function me(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $user = User::where('role', 'murid')->first() ?: User::first();
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name ?? $user->nama,
                'username' => $user->username,
                'nisn' => $user->nisn,
                'birth_date' => $user->birth_date ? $user->birth_date->format('Y-m-d') : null,
                'mother_name' => $user->mother_name,
                'email' => $user->email,
                'google_id' => $user->google_id,
                'google_email' => $user->google_email,
                'whatsapp_number' => $user->whatsapp_number,
                'wa_status' => $user->wa_status ?? 'unlinked',
                'role' => $user->role,
                'school_id' => $user->school_id,
                'class_id' => $user->class_id,
                'lifecycle_status' => $user->lifecycle_status ?? 'active_student',
                'subscription_type' => $user->subscription_type ?? 'school_sponsored',
                'retention_expires_at' => $user->retention_expires_at ? $user->retention_expires_at->toIso8601String() : null,
                'preferred_theme' => $user->preferred_theme ?? 'formal',
                'preferred_language' => $user->preferred_language ?? 'id',
                'primary_class' => $user->class_id ? AcademicClass::find($user->class_id) : null,
            ],
        ]);
    }

    /**
     * Academic Dashboard & Journey Overview API
     */
    public function dashboard(Request $request)
    {
        $user = $request->user() ?: User::first();
        if (!$user) {
            $user = new User([
                'id' => 1,
                'name' => 'Ahmad Siswa',
                'role' => 'murid',
                'email' => 'ahmad@myacademic.test',
            ]);
        }
        $role = $user->role ?? 'murid';

        // Primary Class
        $primaryClass = null;
        if ($user->class_id) {
            $primaryClass = AcademicClass::with('waliKelas')->find($user->class_id);
        }
        if (!$primaryClass) {
            $primaryClass = AcademicClass::with('waliKelas')->first();
        }

        // Active upcoming assignments
        $upcomingAssignments = Assignment::with(['subject', 'creator'])
            ->latest('id')
            ->limit(5)
            ->get();

        // Recent Materials
        $recentMaterials = Material::with('subject')
            ->latest('id')
            ->limit(5)
            ->get();

        // Submissions statistics for the user (scoped to class if class_id is set)
        $assignmentQuery = Assignment::query();
        if ($user->class_id) {
            $assignmentQuery->where(function ($q) use ($user) {
                $q->whereNull('target_class_id')->orWhere('target_class_id', $user->class_id);
            });
        }
        $totalAssignmentsCount = $assignmentQuery->count();
        $completedAssignmentsCount = Submission::where('student_id', $user->id)
            ->whereNotNull('submitted_at')
            ->distinct('assignment_id')
            ->count('assignment_id');
        $activeAssignmentsCount = max(0, $totalAssignmentsCount - $completedAssignmentsCount);

        // Attendance stats (H: Hadir, T: Terlambat, D: Dispensasi, I: Izin, S: Sakit, A: Alfa)
        $hadirCount = Attendance::where('student_id', $user->id)->where('status', 'H')->count();
        $terlambatCount = Attendance::where('student_id', $user->id)->where('status', 'T')->count();
        $dispensasiCount = Attendance::where('student_id', $user->id)->where('status', 'D')->count();
        $izinCount = Attendance::where('student_id', $user->id)->where('status', 'I')->count();
        $sakitCount = Attendance::where('student_id', $user->id)->where('status', 'S')->count();
        $alphaCount = Attendance::where('student_id', $user->id)->where('status', 'A')->count();

        // Effective attended days (present at school + official duty)
        $attendedCount = $hadirCount + $terlambatCount + $dispensasiCount;
        $totalPresensi = $attendedCount + $izinCount + $sakitCount + $alphaCount;
        $attendanceRate = $totalPresensi > 0 ? round(($attendedCount / $totalPresensi) * 100, 1) : 100.0;

        // Suggested Knowledge / Study table data (matching the design table)
        $knowledgeItems = $recentMaterials->map(function ($item, $index) {
            return [
                'id' => $item->id,
                'subject' => $item->judul,
                'nama_mapel' => $item->subject->nama_mapel ?? 'Umum',
                'status' => $index % 2 === 0 ? 'Executed' : 'Scheduled',
                'start_date' => $item->created_at->format('Y-m-d H:i'),
                'end_date' => $item->created_at->addDays(7)->format('Y-m-d H:i'),
                'assigned_user' => $item->subject->guru->name ?? 'Dewan Guru',
            ];
        });

        // Team / Member Avatars (matching the top avatar bar in design)
        $members = User::select('id', 'name', 'nama', 'role', 'email')
            ->limit(8)
            ->get()
            ->map(function ($m, $idx) {
                return [
                    'id' => $m->id,
                    'name' => $m->name ?? $m->nama,
                    'role' => $m->role,
                    'badge' => ($idx % 3) + 1,
                    'color' => ['#3b82f6', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'][$idx % 5],
                ];
            });

        // Workflow Journey Stages (matching the 4 pipeline columns in the design)
        $workflowStages = [
            [
                'id' => 'allocation',
                'title' => 'Alokasi & Orientasi',
                'items' => [
                    [
                        'id' => 1,
                        'title' => 'Kelas: ' . ($primaryClass->nama_kelas ?? 'X-IPA 1'),
                        'subtitle' => 'Wali: ' . ($primaryClass->waliKelas->name ?? 'Budi Santoso, S.Pd'),
                        'date' => 'Semester Aktif',
                        'status' => 'completed',
                        'icon' => 'school',
                    ],
                    [
                        'id' => 2,
                        'title' => 'KM & Struktur Kelas',
                        'subtitle' => 'KM: ' . ($primaryClass->nama_km ?? 'Ahmad Siswa'),
                        'date' => 'Terkonfirmasi',
                        'status' => 'completed',
                        'icon' => 'user-check',
                    ],
                ],
            ],
            [
                'id' => 'identification',
                'title' => 'Mata Pelajaran & Materi',
                'items' => [
                    [
                        'id' => 3,
                        'title' => 'Distribusi Modul Belajar',
                        'subtitle' => count($recentMaterials) . ' Materi Terkini',
                        'date' => 'Update Harian',
                        'status' => 'active',
                        'icon' => 'book-open',
                    ],
                    [
                        'id' => 4,
                        'title' => 'Jadwal Tatap Muka & Presensi',
                        'subtitle' => 'Kehadiran: ' . $attendanceRate . '%',
                        'date' => 'Setiap Hari',
                        'status' => 'active',
                        'icon' => 'calendar',
                    ],
                ],
            ],
            [
                'id' => 'resolution',
                'title' => 'Evaluasi & Penilaian',
                'items' => [
                    [
                        'id' => 5,
                        'title' => 'Pemeriksaan Tugas Siswa',
                        'subtitle' => $completedAssignmentsCount . ' Tugas Diserahkan',
                        'date' => 'Mingguan',
                        'status' => 'pending',
                        'icon' => 'check-circle',
                    ],
                    [
                        'id' => 6,
                        'title' => 'Rekap Nilai Online & Offline',
                        'subtitle' => 'Standar KKM 75.0',
                        'date' => 'Tengah Semester',
                        'status' => 'pending',
                        'icon' => 'award',
                    ],
                ],
            ],
            [
                'id' => 'tasks',
                'title' => 'Aksi & Modul Cepat',
                'items' => [
                    ['id' => 't1', 'title' => 'Pengumpulan Tugas', 'active' => true],
                    ['id' => 't2', 'title' => 'Presensi Harian', 'active' => false],
                    ['id' => 't3', 'title' => 'Space Belajar', 'active' => false],
                    ['id' => 't4', 'title' => 'Rekap Nilai', 'active' => false],
                    ['id' => 't5', 'title' => 'Dokumen Nilai', 'active' => false],
                    ['id' => 't6', 'title' => 'Pengaturan Akun', 'active' => false],
                ],
            ],
        ];

        return response()->json([
            'success' => true,
            'primary_class' => $primaryClass,
            'members' => $members,
            'workflow_stages' => $workflowStages,
            'knowledge_items' => $knowledgeItems,
            'stats' => [
                'executed_count' => $completedAssignmentsCount,
                'active_count' => $activeAssignmentsCount,
                'attendance_rate' => $attendanceRate,
                'total_classes' => AcademicClass::count(),
                'total_subjects' => Subject::count(),
                'total_materials' => Material::count(),
                'total_assignments' => Assignment::count(),
            ],
            'upcoming_assignments' => $upcomingAssignments,
            'recent_materials' => $recentMaterials,
        ]);
    }

    /**
     * Classes List API
     */
    public function classes(Request $request)
    {
        $classes = AcademicClass::with(['waliKelas', 'subjects'])->get();
        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    /**
     * Subjects List API
     */
    public function subjects(Request $request)
    {
        $subjects = Subject::with(['guru', 'academicClass'])->get();
        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    /**
     * Assignments List API
     */
    public function assignments(Request $request)
    {
        $user = $request->user();
        $assignments = Assignment::with(['subject', 'creator'])->latest('id')->get();

        $data = $assignments->map(function ($a) use ($user) {
            $mySubmission = Submission::where('assignment_id', $a->id)
                ->where('student_id', $user->id)
                ->first();

            return [
                'id' => $a->id,
                'judul' => $a->judul,
                'deskripsi' => $a->deskripsi,
                'deadline' => $a->deadline ? $a->deadline->format('Y-m-d H:i') : null,
                'subject_name' => $a->subject->nama_mapel ?? '-',
                'creator_name' => $a->creator->name ?? '-',
                'is_submitted' => $mySubmission !== null,
                'submission' => $mySubmission,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Submit Assignment API
     */
    public function submitAssignment(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $user = $request->user();

        $request->validate([
            'link_drive' => 'nullable|url',
            'catatan' => 'nullable|string',
        ]);

        $submission = Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $user->id],
            [
                'link_drive' => $request->link_drive,
                'catatan' => $request->catatan,
                'submitted_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dikirimkan.',
            'data' => $submission,
        ]);
    }

    /**
     * Materials List API
     */
    public function materials(Request $request)
    {
        $materials = Material::with(['subject', 'creator'])->latest('id')->get();
        return response()->json([
            'success' => true,
            'data' => $materials,
        ]);
    }

    /**
     * Rekap Nilai API
     */
    public function grades(Request $request)
    {
        $user = $request->user();

        $onlineSubmissions = Submission::with('assignment.subject')
            ->where('student_id', $user->id)
            ->whereNotNull('nilai')
            ->latest()
            ->get();

        $offlineScores = TabelOfflineScore::with('task.subject')
            ->where('student_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'online_grades' => $onlineSubmissions,
            'offline_grades' => $offlineScores,
        ]);
    }

    /**
     * Attendance History API
     */
    public function attendanceHistory(Request $request)
    {
        $user = $request->user();
        $history = Attendance::with(['academicClass', 'student'])
            ->where('student_id', $user->id)
            ->latest('tanggal')
            ->get();

        $counts = [
            'H' => Attendance::where('student_id', $user->id)->where('status', 'H')->count(),
            'T' => Attendance::where('student_id', $user->id)->where('status', 'T')->count(),
            'D' => Attendance::where('student_id', $user->id)->where('status', 'D')->count(),
            'S' => Attendance::where('student_id', $user->id)->where('status', 'S')->count(),
            'I' => Attendance::where('student_id', $user->id)->where('status', 'I')->count(),
            'A' => Attendance::where('student_id', $user->id)->where('status', 'A')->count(),
        ];

        return response()->json([
            'success' => true,
            'counts' => $counts,
            'history' => $history,
        ]);
    }

    /**
     * Space Belajar API
     */
     public function spaceBelajar(Request $request)
     {
         $user = $request->user();
         $goals = StudyGoal::with('logs')->where('user_id', $user->id)->latest()->get();
         $calendarEvents = CalendarEvent::where('user_id', $user->id)->get();
         $folders = StudyFolder::where('user_id', $user->id)->whereNull('parent_id')->get();
         $files = StudyFile::where('user_id', $user->id)->whereNull('folder_id')->get();

         return response()->json([
             'success' => true,
             'goals' => $goals,
             'calendar_events' => $calendarEvents,
             'folders' => $folders,
             'files' => $files,
         ]);
     }

     /**
      * File Explorer API
      */
     public function getExplorer(Request $request)
     {
         $user = $request->user() ?: User::first();
         if (!$user) {
             return response()->json([
                 'success' => true,
                 'current_folder' => null,
                 'folders' => [],
                 'files' => [],
             ]);
         }
         $parentId = $request->query('parent_id');

         $currentFolder = null;
         if ($parentId) {
             $currentFolder = StudyFolder::where('user_id', $user->id)->find($parentId);
         }

         $folders = StudyFolder::where('user_id', $user->id)
             ->where('parent_id', $parentId ?: null)
             ->get();

         $files = StudyFile::where('user_id', $user->id)
             ->where('folder_id', $parentId ?: null)
             ->get();

         return response()->json([
             'success' => true,
             'current_folder' => $currentFolder,
             'folders' => $folders,
             'files' => $files,
         ]);
     }

     public function createFolder(Request $request)
     {
         $user = $request->user() ?: User::first();
         $request->validate(['name' => 'required|string|max:100']);

         $folder = StudyFolder::create([
             'user_id' => $user->id,
             'parent_id' => $request->parent_id ?: null,
             'name' => $request->name,
         ]);

         return response()->json([
             'success' => true,
             'message' => 'Folder berhasil dibuat.',
             'data' => $folder,
         ]);
     }

     public function createNote(Request $request)
     {
         $user = $request->user();
         $request->validate([
             'title' => 'required|string|max:150',
             'description' => 'nullable|string',
         ]);

         $file = StudyFile::create([
             'user_id' => $user->id,
             'folder_id' => $request->folder_id ?: null,
             'title' => $request->title,
             'original_name' => $request->title . '.txt',
             'stored_name' => 'note_' . time() . '.txt',
             'mime_type' => 'text/plain',
             'size_bytes' => strlen($request->description ?? ''),
             'description' => $request->description,
         ]);

         return response()->json([
             'success' => true,
             'message' => 'Catatan berhasil disimpan.',
             'data' => $file,
         ]);
     }

     public function deleteExplorerItem(Request $request)
     {
         $user = $request->user();
         $type = $request->input('type'); // 'folder' or 'file'
         $id = $request->input('id');

         if ($type === 'folder') {
             StudyFolder::where('user_id', $user->id)->where('id', $id)->delete();
         } else {
             StudyFile::where('user_id', $user->id)->where('id', $id)->delete();
         }

         return response()->json([
             'success' => true,
             'message' => 'Item berhasil dihapus.',
         ]);
     }

     /**
      * Calendar Events API
      */
     public function getCalendar(Request $request)
     {
         $user = $request->user() ?: User::first();
         if (!$user) {
             return response()->json([
                 'success' => true,
                 'year' => (int) $request->query('year', 2026),
                 'events' => [],
             ]);
         }
         $year = $request->query('year', 2026);

         $events = CalendarEvent::where('user_id', $user->id)
             ->whereYear('event_date', $year)
             ->get();

         return response()->json([
             'success' => true,
             'year' => (int) $year,
             'events' => $events,
         ]);
     }

     public function saveCalendarEvent(Request $request)
     {
         $user = $request->user() ?: User::first();
         $request->validate([
             'title' => 'required|string|max:100',
             'event_date' => 'required|date',
             'type' => 'required|string', // Libur, Acara khusus, Peringatan
             'note' => 'nullable|string',
         ]);

         $event = CalendarEvent::create([
             'user_id' => $user->id,
             'title' => $request->title,
             'event_date' => $request->event_date,
             'type' => $request->type,
             'note' => $request->note,
         ]);

         return response()->json([
             'success' => true,
             'message' => 'Jadwal berhasil ditambahkan ke kalender.',
             'data' => $event,
         ]);
     }

    /**
     * Update Account Settings API
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        if (!empty($validated['new_password']) || !empty($validated['current_password'])) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password saat ini tidak sesuai.',
                ], 422);
            }
            $user->password = Hash::make($validated['new_password']);
        }

        $user->name = $validated['name'];
        $user->nama = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil dan akun berhasil diperbarui.',
            'user' => $user,
        ]);
    }
}
