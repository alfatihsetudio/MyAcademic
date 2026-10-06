<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\CalendarEvent;
use App\Models\Material;
use App\Models\StudyGoal;
use App\Models\StudyGoalLog;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SpaceBelajarController extends Controller
{
    public function index()
    {
        return view('space_belajar.index');
    }

    public function progres()
    {
        $user = Auth::user();
        $goals = StudyGoal::with(['logs' => function ($q) {
            $q->orderBy('log_date', 'desc');
        }])
        ->where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

        return view('space_belajar.progres', compact('goals'));
    }

    public function addGoal(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_date' => 'nullable|date',
        ]);

        StudyGoal::create([
            'user_id' => $user->id,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'target_date' => $validated['target_date'] ?: null,
            'status' => 'ongoing',
        ]);

        return back()->with('success', 'Tujuan belajar berhasil ditambahkan.');
    }

    public function addGoalLog(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'goal_id' => 'required|exists:study_goals,id',
            'notes' => 'required|string',
            'log_date' => 'nullable|date',
        ]);

        $goal = StudyGoal::where('id', $validated['goal_id'])
            ->where('user_id', $user->id)
            ->firstOrFail();

        StudyGoalLog::create([
            'goal_id' => $goal->id,
            'log_date' => $validated['log_date'] ?: date('Y-m-d'),
            'notes' => $validated['notes'],
        ]);

        return back()->with('success', 'Catatan progres berhasil dicatat.');
    }

    public function riwayatTugas()
    {
        $user = Auth::user();
        $classIds = $user->classes()->pluck('classes.id')->toArray();
        if ($user->class_id) $classIds[] = $user->class_id;

        $assignments = Assignment::with(['subject', 'academicClass', 'submissions' => function ($q) use ($user) {
            $q->where('student_id', $user->id);
        }])
        ->whereIn('target_class_id', array_unique($classIds))
        ->orderBy('created_at', 'desc')
        ->get();

        return view('space_belajar.riwayat_tugas', compact('assignments'));
    }

    public function riwayatMateri()
    {
        $user = Auth::user();
        $classIds = $user->classes()->pluck('classes.id')->toArray();
        if ($user->class_id) $classIds[] = $user->class_id;

        $materials = Material::with(['subject.academicClass', 'creator'])
            ->whereHas('subject', function ($q) use ($classIds) {
                $q->whereIn('class_id', array_unique($classIds));
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return view('space_belajar.riwayat_materi', compact('materials'));
    }

    public function calendar(Request $request)
    {
        $user = Auth::user();
        $year = (int) $request->query('year', date('Y'));
        if ($year < 2000 || $year > 2100) $year = (int) date('Y');

        $events = CalendarEvent::where('user_id', $user->id)
            ->whereBetween('event_date', ["{$year}-01-01", "{$year}-12-31"])
            ->get()
            ->groupBy(function ($e) {
                return $e->event_date->format('Y-m-d');
            });

        return view('study.calendar', compact('year', 'events'));
    }

    public function dayDetail(Request $request)
    {
        $user = Auth::user();
        $date = $request->query('date', date('Y-m-d'));

        $events = CalendarEvent::where('user_id', $user->id)
            ->where('event_date', $date)
            ->orderBy('created_at', 'asc')
            ->get();

        return view('study.day_detail', compact('date', 'events'));
    }

    public function saveCalendarEvent(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'event_date' => 'required|date',
            'type' => 'required|in:holiday,special,warning',
            'title' => 'required|string|max:255',
            'note' => 'nullable|string',
        ]);

        CalendarEvent::create([
            'user_id' => $user->id,
            'event_date' => $validated['event_date'],
            'type' => $validated['type'],
            'title' => $validated['title'],
            'note' => $validated['note'],
        ]);

        return back()->with('success', 'Jadwal kalender berhasil ditambahkan.');
    }
}
