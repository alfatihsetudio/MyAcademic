<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Assignment;
use App\Models\Notification;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class AssignmentController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        if ($user->isGuru()) {
            $assignments = Assignment::with(['subject', 'academicClass'])
                ->where('created_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->isMurid()) {
            $classIds = $user->classes()->pluck('classes.id')->toArray();
            if ($user->class_id) $classIds[] = $user->class_id;

            $assignments = Assignment::with(['subject', 'academicClass'])
                ->whereIn('target_class_id', array_unique($classIds))
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            // Admin sees all in school
            $assignments = Assignment::with(['subject', 'academicClass', 'guru'])
                ->where('school_id', $schoolId)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return view('assignments.index', compact('assignments'));
    }

    public function create()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $subjects = Subject::with('academicClass')
            ->where('school_id', $schoolId)
            ->when($user->isGuru(), function ($q) use ($user) {
                $q->where('guru_id', $user->id);
            })
            ->get();

        $classes = AcademicClass::where('school_id', $schoolId)->get();

        return view('assignments.create', compact('subjects', 'classes'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'target_class_id' => 'required|exists:classes,id',
            'judul' => 'required|string|max:200',
            'deskripsi' => 'nullable|string',
            'deadline' => 'nullable|date',
            'session_info' => 'nullable|string|max:500',
            'video_link' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:20480', // 20MB
        ]);

        $fileId = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('assignments', 'public');
            // Store file record
            $fileUpload = \App\Models\FileUpload::create([
                'original_name' => $request->file('file')->getClientOriginalName(),
                'stored_name' => basename($path),
                'file_path' => $path,
                'mime_type' => $request->file('file')->getClientMimeType(),
                'file_size' => $request->file('file')->getSize(),
                'size' => $request->file('file')->getSize(),
                'uploader_id' => $user->id,
            ]);
            $fileId = $fileUpload->id;
        }

        $assignment = Assignment::create([
            'school_id' => $schoolId,
            'subject_id' => $validated['subject_id'],
            'target_class_id' => $validated['target_class_id'],
            'judul' => $validated['judul'],
            'deskripsi' => $validated['deskripsi'],
            'deadline' => $validated['deadline'] ?: null,
            'session_info' => $validated['session_info'] ?? null,
            'video_link' => $validated['video_link'] ?? null,
            'file_id' => $fileId,
            'created_by' => $user->id,
        ]);

        // Notify students in target class
        $students = User::whereHas('classes', function ($q) use ($validated) {
            $q->where('classes.id', $validated['target_class_id']);
        })->get();

        foreach ($students as $student) {
            Notification::create([
                'school_id' => $schoolId,
                'user_id' => $student->id,
                'sender_id' => $user->id,
                'assignment_id' => $assignment->id,
                'title' => 'Tugas Baru: ' . $assignment->judul,
                'message' => 'Guru memberikan tugas baru untuk kelas Anda.',
                'link' => route('assignments.show', $assignment->id),
            ]);
        }

        return redirect()->route('assignments.index')->with('success', 'Tugas berhasil dibuat dan diumumkan ke siswa.');
    }

    public function show(Assignment $assignment)
    {
        $user = Auth::user();
        $assignment->load(['subject', 'academicClass', 'guru', 'submissions.student']);

        $mySubmission = null;
        if ($user->isMurid()) {
            $mySubmission = Submission::where('assignment_id', $assignment->id)
                ->where('student_id', $user->id)
                ->first();
        }

        return view('assignments.show', compact('assignment', 'mySubmission'));
    }

    public function submit(Request $request, Assignment $assignment)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'catatan' => 'nullable|string',
            'link_drive' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:20480',
        ]);

        if (empty($validated['catatan']) && empty($validated['link_drive']) && !$request->hasFile('file')) {
            return back()->withErrors(['msg' => 'Minimal isi catatan, sertakan link Drive, atau upload file tugas.']);
        }

        $fileId = null;
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('submissions', 'public');
            $fileUpload = \App\Models\FileUpload::create([
                'original_name' => $request->file('file')->getClientOriginalName(),
                'stored_name' => basename($path),
                'file_path' => $path,
                'mime_type' => $request->file('file')->getClientMimeType(),
                'file_size' => $request->file('file')->getSize(),
                'size' => $request->file('file')->getSize(),
                'uploader_id' => $user->id,
            ]);
            $fileId = $fileUpload->id;
        }

        Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $user->id],
            [
                'file_id' => $fileId,
                'link_drive' => $validated['link_drive'] ?? null,
                'catatan' => $validated['catatan'] ?? null,
                'submitted_at' => now(),
            ]
        );

        // Notify teacher
        if ($assignment->created_by) {
            Notification::create([
                'school_id' => $user->school_id,
                'user_id' => $assignment->created_by,
                'sender_id' => $user->id,
                'assignment_id' => $assignment->id,
                'title' => 'Pengumpulan Tugas: ' . $assignment->judul,
                'message' => "Siswa {$user->name} telah mengumpulkan tugas.",
                'link' => route('assignments.show', $assignment->id),
            ]);
        }

        return back()->with('success', 'Jawaban tugas Anda berhasil dikirim.');
    }

    public function grade(Request $request, Submission $submission)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'nilai' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
        ]);

        $submission->update([
            'nilai' => $validated['nilai'],
            'feedback' => $validated['feedback'],
            'graded_at' => now(),
            'graded_by' => $user->id,
        ]);

        // Also notify student
        Notification::create([
            'school_id' => $user->school_id,
            'user_id' => $submission->student_id,
            'sender_id' => $user->id,
            'assignment_id' => $submission->assignment_id,
            'title' => 'Nilai Tugas: ' . ($submission->assignment->judul ?? ''),
            'message' => "Tugas Anda telah dinilai. Nilai: {$validated['nilai']}",
            'link' => route('assignments.show', $submission->assignment_id),
        ]);

        return back()->with('success', 'Nilai dan masukan berhasil disimpan.');
    }

    public function destroy(Assignment $assignment)
    {
        $user = Auth::user();
        if ($user->isGuru() && $assignment->created_by !== $user->id) {
            abort(403);
        }

        $judul = $assignment->judul;
        $assignment->delete();

        return redirect()->route('assignments.index')->with('success', "Tugas {$judul} berhasil dihapus.");
    }
}
