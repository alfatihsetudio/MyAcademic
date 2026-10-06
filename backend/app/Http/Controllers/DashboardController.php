<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Assignment;
use App\Models\Material;
use App\Models\Notification;
use App\Models\School;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function admin()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;
        $school = School::find($schoolId);

        $counts = [
            'users' => User::where('school_id', $schoolId)->count(),
            'guru' => User::where('school_id', $schoolId)->where('role', 'guru')->count(),
            'siswa' => User::where('school_id', $schoolId)->whereIn('role', ['murid', 'siswa'])->count(),
            'classes' => AcademicClass::where('school_id', $schoolId)->count(),
            'subjects' => Subject::where('school_id', $schoolId)->count(),
            'materials' => Material::where('school_id', $schoolId)->count(),
            'assignments' => Assignment::where('school_id', $schoolId)->count(),
            'notifications' => Notification::where('school_id', $schoolId)->count(),
        ];

        // Guru without class
        $guruWithClass = AcademicClass::where('school_id', $schoolId)
            ->whereNotNull('guru_id')
            ->pluck('guru_id')
            ->unique();
        $guruNoClass = User::where('school_id', $schoolId)
            ->where('role', 'guru')
            ->whereNotIn('id', $guruWithClass)
            ->count();

        // Murid without class
        $muridInPivot = \Illuminate\Support\Facades\DB::table('class_user')
            ->join('classes', 'class_user.class_id', '=', 'classes.id')
            ->where('classes.school_id', $schoolId)
            ->pluck('class_user.user_id')
            ->unique();
        $muridNoClass = User::where('school_id', $schoolId)
            ->whereIn('role', ['murid', 'siswa'])
            ->where(function ($q) {
                $q->whereNull('class_id')->orWhere('class_id', 0);
            })
            ->whereNotIn('id', $muridInPivot)
            ->count();

        $quality = [
            'guru_no_class' => $guruNoClass,
            'murid_no_class' => $muridNoClass,
        ];

        $latestUsers = User::where('school_id', $schoolId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $latestClasses = AcademicClass::with('waliKelas')
            ->where('school_id', $schoolId)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('dashboard.admin', compact('school', 'counts', 'quality', 'latestUsers', 'latestClasses'));
    }

    public function guru()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        // Classes taught by this guru
        $classes = AcademicClass::where('guru_id', $user->id)
            ->where('school_id', $schoolId)
            ->orderBy('nama_kelas')
            ->get();

        $classIds = $classes->pluck('id')->toArray();

        // Students count
        $studentCount = 0;
        if (!empty($classIds)) {
            $studentCount = User::whereHas('classes', function ($q) use ($classIds) {
                $q->whereIn('classes.id', $classIds);
            })->whereIn('role', ['murid', 'siswa'])->count();
        }

        // Assignment count
        $assignmentCount = Assignment::where('created_by', $user->id)
            ->whereHas('academicClass', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })->count();

        // Upcoming assignments
        $upcomingAssignments = Assignment::with('academicClass')
            ->where('created_by', $user->id)
            ->whereHas('academicClass', function ($q) use ($schoolId) {
                $q->where('school_id', $schoolId);
            })
            ->whereNotNull('deadline')
            ->where('deadline', '>=', now())
            ->orderBy('deadline', 'asc')
            ->limit(5)
            ->get();

        $materialCount = Material::count();

        return view('dashboard.guru', compact(
            'user',
            'classes',
            'studentCount',
            'assignmentCount',
            'upcomingAssignments',
            'materialCount'
        ));
    }

    public function murid()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        // Classes murid belongs to
        $classes = $user->classes()->where('school_id', $schoolId)->get();
        if ($classes->isEmpty() && $user->class_id) {
            $fallback = AcademicClass::find($user->class_id);
            if ($fallback) {
                $classes = collect([$fallback]);
            }
        }

        $primaryClass = $classes->first();
        $classIds = $classes->pluck('id')->toArray();

        // Upcoming assignments
        $upcomingAssignments = collect();
        $assignmentCount = 0;
        if (!empty($classIds)) {
            $assignmentCount = Assignment::whereIn('target_class_id', $classIds)->count();

            $upcomingAssignments = Assignment::with(['subject', 'academicClass'])
                ->whereIn('target_class_id', $classIds)
                ->where(function ($q) {
                    $q->whereNull('deadline')->orWhere('deadline', '>=', now());
                })
                ->orderByRaw('deadline IS NULL, deadline ASC')
                ->limit(5)
                ->get();
        }

        // Recent materials
        $recentMaterials = Material::with('subject')
            ->whereHas('subject', function ($q) use ($classIds) {
                $q->whereIn('class_id', $classIds);
            })
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return view('dashboard.murid', compact(
            'user',
            'classes',
            'primaryClass',
            'upcomingAssignments',
            'assignmentCount',
            'recentMaterials'
        ));
    }
}
