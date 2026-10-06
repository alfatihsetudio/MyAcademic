<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if ($user->isGuru()) {
            $grades = Submission::with(['student', 'assignment'])
                ->whereHas('assignment', function ($q) use ($user) {
                    $q->where('created_by', $user->id);
                })
                ->whereNotNull('nilai')
                ->orderBy('graded_at', 'desc')
                ->get();
        } elseif ($user->isMurid()) {
            $grades = Submission::with('assignment')
                ->where('student_id', $user->id)
                ->whereNotNull('nilai')
                ->orderBy('graded_at', 'desc')
                ->get();
        } else {
            $grades = Submission::with(['student', 'assignment'])
                ->whereNotNull('nilai')
                ->orderBy('graded_at', 'desc')
                ->get();
        }

        return view('grades.index', compact('grades'));
    }

    public function dailyRecap(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $from = $request->query('from', date('Y-m-01'));
        $to = $request->query('to', date('Y-m-d'));

        $fromDt = $from . ' 00:00:00';
        $toDt = $to . ' 23:59:59';

        $records = DB::table('submissions as s')
            ->join('assignments as a', 's.assignment_id', '=', 'a.id')
            ->join('subjects as sub', 'a.subject_id', '=', 'sub.id')
            ->join('classes as c', 'a.target_class_id', '=', 'c.id')
            ->join('users as u', 's.student_id', '=', 'u.id')
            ->where('sub.guru_id', $user->id)
            ->where('c.school_id', $schoolId)
            ->whereBetween('s.submitted_at', [$fromDt, $toDt])
            ->select(
                's.student_id',
                'u.name as student_name',
                'u.email as student_email',
                DB::raw('COUNT(*) as tugas_count'),
                DB::raw('SUM(s.nilai) as total_nilai'),
                DB::raw('AVG(s.nilai) as avg_nilai'),
                DB::raw('MIN(s.submitted_at) as first_submit'),
                DB::raw('MAX(s.submitted_at) as last_submit')
            )
            ->groupBy('s.student_id', 'u.name', 'u.email')
            ->orderBy('u.name')
            ->get();

        return view('grades.daily_recap', compact('records', 'from', 'to'));
    }

    public function rekapNilai(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        // Subjects for this student
        $classIds = $user->classes()->pluck('classes.id')->toArray();
        if ($user->class_id) $classIds[] = $user->class_id;
        $classIds = array_unique($classIds);

        $subjects = \App\Models\Subject::with('academicClass')
            ->whereIn('class_id', $classIds)
            ->orderBy('nama_mapel')
            ->get();

        $selectedSubjectId = (int) $request->query('subject_id', 0);
        $from = $request->query('from', date('Y-m-d', strtotime('-60 days')));
        $to = $request->query('to', date('Y-m-d'));
        
        $academicYearId = (int) $request->query('academic_year_id', 0);
        $semesterId = (int) $request->query('semester_id', 0);

        // Online Submissions
        $onlineQuery = Submission::with(['assignment.subject', 'assignment.academicClass'])
            ->where('student_id', $user->id)
            ->whereNotNull('nilai')
            ->whereBetween(DB::raw('DATE(submitted_at)'), [$from, $to]);

        if ($selectedSubjectId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($selectedSubjectId) {
                $q->where('subject_id', $selectedSubjectId);
            });
        }
        if ($academicYearId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }
        if ($semesterId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }
        $onlineSubmissions = $onlineQuery->orderBy('submitted_at', 'desc')->get();

        // Offline Scores
        $offlineQuery = \App\Models\TabelOfflineScore::with(['task.subject', 'task.academicClass'])
            ->where('student_id', $user->id)
            ->whereNotNull('score')
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]);

        if ($selectedSubjectId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($selectedSubjectId) {
                $q->where('subject_id', $selectedSubjectId);
            });
        }
        if ($academicYearId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }
        if ($semesterId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }
        $offlineScores = $offlineQuery->orderBy('created_at', 'desc')->get();

        // Combined Stats with Deduplication
        $allScores = collect();
        $processedTasks = [];

        foreach ($onlineSubmissions as $sub) {
            $processedTasks['online_'.$sub->assignment_id] = true;
            $allScores->push((float) $sub->nilai);
        }
        foreach ($offlineScores as $off) {
            if (!isset($processedTasks['online_'.$off->task_id])) {
                $processedTasks['offline_'.$off->task_id] = true;
                $allScores->push((float) $off->score);
            }
        }

        $stats = [
            'total_items' => $allScores->count(),
            'total_score' => $allScores->sum(),
            'average' => $allScores->count() > 0 ? $allScores->average() : null,
            'highest' => $allScores->max(),
            'lowest' => $allScores->min(),
        ];

        return view('grades.rekap_nilai', compact(
            'subjects',
            'selectedSubjectId',
            'from',
            'to',
            'onlineSubmissions',
            'offlineScores',
            'stats',
            'academicYearId',
            'semesterId'
        ));
    }
}
