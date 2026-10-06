<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SubjectController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $query = Subject::with(['academicClass', 'guru'])
            ->where('school_id', $schoolId);

        if ($user->isGuru()) {
            $query->where('guru_id', $user->id);
        } elseif ($user->isMurid()) {
            $classIds = $user->classes()->pluck('classes.id')->toArray();
            if ($user->class_id) $classIds[] = $user->class_id;
            $query->whereIn('class_id', array_unique($classIds));
        }

        $subjects = $query->orderBy('nama_mapel')->get();

        return view('subjects.index', compact('subjects'));
    }

    public function create()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $classes = AcademicClass::where('school_id', $schoolId)->orderBy('nama_kelas')->get();
        $gurus = User::where('school_id', $schoolId)->where('role', 'guru')->orderBy('name')->get();

        return view('subjects.create', compact('classes', 'gurus'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $rules = [
            'class_id' => 'required|exists:classes,id',
            'nama_mapel' => 'required|string|max:100',
            'deskripsi' => 'nullable|string',
        ];

        if ($user->isAdmin()) {
            $rules['guru_id'] = 'required|exists:users,id';
        }

        $validated = $request->validate($rules);
        $guruId = $user->isAdmin() ? $validated['guru_id'] : $user->id;

        $class = AcademicClass::find($validated['class_id']);

        Subject::create([
            'school_id' => $schoolId,
            'class_id' => $class->id,
            'nama_mapel' => $validated['nama_mapel'],
            'guru_id' => $guruId,
            'class_level' => $class->level,
            'jurusan' => $class->jurusan,
            'deskripsi' => $validated['deskripsi'] ?? null,
        ]);

        return redirect()->route('subjects.index')->with('success', "Mata pelajaran {$validated['nama_mapel']} berhasil ditambahkan.");
    }

    public function destroy(Subject $subject)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        if ($subject->school_id && $subject->school_id !== $schoolId) {
            abort(403);
        }

        $nama = $subject->nama_mapel;
        $subject->delete();

        return redirect()->route('subjects.index')->with('success', "Mata pelajaran {$nama} berhasil dihapus.");
    }
}
