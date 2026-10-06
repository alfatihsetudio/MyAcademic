<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Attendance;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function take(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $subjects = Subject::with('academicClass')
            ->where('school_id', $schoolId)
            ->when($user->isGuru(), function ($q) use ($user) {
                $q->where('guru_id', $user->id);
            })
            ->get();

        $selectedSubjectId = (int) $request->query('subject_id', 0);
        $selectedDate = $request->query('date', date('Y-m-d'));

        $selectedSubject = null;
        $students = collect();
        $existingRecords = collect();

        if ($selectedSubjectId > 0) {
            $selectedSubject = Subject::with('academicClass.students')->find($selectedSubjectId);
            if ($selectedSubject && $selectedSubject->academicClass) {
                $students = $selectedSubject->academicClass->students;

                $existingRecords = Attendance::where('subject_id', $selectedSubjectId)
                    ->where('date', $selectedDate)
                    ->get()
                    ->keyBy('student_id');
            }
        }

        return view('attendance.take', compact(
            'subjects',
            'selectedSubjectId',
            'selectedDate',
            'selectedSubject',
            'students',
            'existingRecords'
        ));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'date' => 'required|date',
            'materi' => 'nullable|string',
            'status' => 'required|array',
            'note' => 'nullable|array',
            'nilai' => 'nullable|array',
        ]);

        $subject = Subject::findOrFail($validated['subject_id']);
        $classId = $subject->class_id;

        DB::transaction(function () use ($validated, $subject, $classId, $user, $schoolId) {
            foreach ($validated['status'] as $studentId => $status) {
                $note = $validated['note'][$studentId] ?? null;
                $dailyScore = isset($validated['nilai'][$studentId]) && $validated['nilai'][$studentId] !== ''
                    ? (float) $validated['nilai'][$studentId]
                    : null;

                Attendance::updateOrCreate(
                    [
                        'class_id' => $classId,
                        'student_id' => $studentId,
                        'subject_id' => $subject->id,
                        'date' => $validated['date'],
                    ],
                    [
                        'school_id' => $schoolId,
                        'tanggal' => $validated['date'],
                        'materi' => $validated['materi'] ?? null,
                        'status' => strtoupper($status),
                        'note' => $note,
                        'keterangan' => $note,
                        'daily_score' => $dailyScore,
                        'recorded_by' => $user->id,
                        'created_by' => $user->id,
                    ]
                );
            }
        });

        return redirect()->route('attendance.take', [
            'subject_id' => $subject->id,
            'date' => $validated['date'],
        ])->with('success', 'Presensi dan nilai harian berhasil disimpan.');
    }

    public function myHistory(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $from = $request->query('from', date('Y-01-01'));
        $to = $request->query('to', date('Y-12-31'));

        $records = Attendance::with('subject')
            ->where('student_id', $user->id)
            ->where('school_id', $schoolId)
            ->whereBetween('date', [$from, $to])
            ->orderBy('date', 'desc')
            ->get();

        $totals = [
            'H' => $records->where('status', 'H')->count(),
            'S' => $records->where('status', 'S')->count(),
            'I' => $records->where('status', 'I')->count(),
            'A' => $records->where('status', 'A')->count(),
        ];
        $totalDays = $records->count();
        $attendanceRate = $totalDays > 0 ? ($totals['H'] / $totalDays) * 100 : 100;

        return view('attendance.my_history', compact('records', 'from', 'to', 'totals', 'totalDays', 'attendanceRate'));
    }
}
