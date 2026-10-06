<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Subject;
use App\Models\TabelOfflineScore;
use App\Models\TabelOfflineTask;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class OfflineAssessmentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $tasks = TabelOfflineTask::with(['academicClass', 'subject'])
            ->where('school_id', $schoolId)
            ->when(!$user->isAdmin(), function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return view('penilaian_offline.index', compact('tasks'));
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id ?: 1;
        $classes = AcademicClass::where('school_id', $schoolId)->orderBy('nama_kelas')->get();
        $subjects = Subject::where('school_id', $schoolId)->orderBy('nama_mapel')->get();

        return view('penilaian_offline.create', compact('classes', 'subjects'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $validated = $request->validate([
            'class_id' => 'required|exists:classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'video_url' => 'nullable|url|max:500',
            'other_url' => 'nullable|url|max:500',
            'photo' => 'nullable|image|max:10240',
        ]);

        $photoName = null;
        if ($request->hasFile('photo')) {
            $photoName = $request->file('photo')->store('offline_tasks', 'public');
        }

        TabelOfflineTask::create([
            'school_id' => $schoolId,
            'owner_id' => $user->id,
            'class_id' => $validated['class_id'],
            'subject_id' => $validated['subject_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'content' => $validated['content'],
            'video_url' => $validated['video_url'],
            'other_url' => $validated['other_url'],
            'photo' => $photoName,
            'tanggal' => now(),
        ]);

        return redirect()->route('offline-assessment.index')->with('success', 'Tugas penilaian offline berhasil dibuat.');
    }

    public function use(TabelOfflineTask $task)
    {
        $task->load(['academicClass.students', 'subject']);
        $students = $task->academicClass ? $task->academicClass->students : collect();

        $scores = TabelOfflineScore::where('task_id', $task->id)->get()->keyBy('student_id');

        return view('penilaian_offline.use', compact('task', 'students', 'scores'));
    }

    public function saveScores(Request $request, TabelOfflineTask $task)
    {
        $validated = $request->validate([
            'score' => 'nullable|array',
            'note' => 'nullable|array',
        ]);

        DB::transaction(function () use ($validated, $task) {
            foreach ($validated['score'] as $studentId => $scoreVal) {
                $score = $scoreVal !== '' && $scoreVal !== null ? (float) $scoreVal : null;
                $note = $validated['note'][$studentId] ?? null;

                if ($score === null && empty($note)) {
                    TabelOfflineScore::where('task_id', $task->id)->where('student_id', $studentId)->delete();
                } else {
                    TabelOfflineScore::updateOrCreate(
                        ['task_id' => $task->id, 'student_id' => $studentId],
                        [
                            'score' => $score,
                            'nilai' => $score,
                            'note' => $note,
                            'catatan' => $note,
                        ]
                    );
                }
            }
        });

        return back()->with('success', 'Nilai offline berhasil disimpan.');
    }

    public function rekap(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $classes = AcademicClass::where('school_id', $schoolId)->get();
        $selectedClassId = (int) $request->query('class_id', 0);
        $from = $request->query('from', date('Y-m-d', strtotime('-30 days')));
        $to = $request->query('to', date('Y-m-d'));

        $students = collect();
        $tasks = collect();
        $scoreMap = [];

        if ($selectedClassId > 0) {
            $class = AcademicClass::with('students')->find($selectedClassId);
            if ($class) {
                $students = $class->students;

                $tasks = TabelOfflineTask::where('school_id', $schoolId)
                    ->where('class_id', $selectedClassId)
                    ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
                    ->orderBy('created_at', 'asc')
                    ->get();

                if ($students->isNotEmpty() && $tasks->isNotEmpty()) {
                    $rawScores = TabelOfflineScore::whereIn('task_id', $tasks->pluck('id'))
                        ->whereIn('student_id', $students->pluck('id'))
                        ->get();

                    foreach ($rawScores as $rs) {
                        $scoreMap[$rs->student_id][$rs->task_id] = $rs->score;
                    }
                }
            }
        }

        return view('penilaian_offline.rekap', compact('classes', 'selectedClassId', 'from', 'to', 'students', 'tasks', 'scoreMap'));
    }
}
