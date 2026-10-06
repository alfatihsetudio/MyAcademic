<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClassController extends Controller
{
    public function index()
    {
        $schoolId = Auth::user()->school_id ?: 1;
        $classes = AcademicClass::with(['waliKelas', 'students'])
            ->where('school_id', $schoolId)
            ->orderBy('nama_kelas')
            ->get();

        return view('classes.index', compact('classes'));
    }

    public function myClasses()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $classes = $user->classes()
            ->with(['waliKelas', 'students' => function ($q) {
                $q->orderBy('name');
            }])
            ->where('school_id', $schoolId)
            ->get();

        if ($classes->isEmpty() && $user->class_id) {
            $fallback = AcademicClass::with(['waliKelas', 'students'])->find($user->class_id);
            if ($fallback) {
                $classes = collect([$fallback]);
            }
        }

        return view('classes.my_classes', compact('classes'));
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id ?: 1;
        $gurus = User::where('school_id', $schoolId)->where('role', 'guru')->orderBy('name')->get();

        return view('classes.create', compact('gurus'));
    }

    public function store(Request $request)
    {
        $schoolId = Auth::user()->school_id ?: 1;

        $validated = $request->validate([
            'jenjang' => 'required|string|max:50',
            'jurusan' => 'required|string|max:100',
            'guru_id' => 'required|exists:users,id',
            'walimurid' => 'nullable|string|max:255',
            'no_telpon_wali' => 'nullable|string|max:50',
            'nama_km' => 'nullable|string|max:255',
            'no_telpon_km' => 'nullable|string|max:50',
            'deskripsi' => 'nullable|string',
        ]);

        $namaKelas = trim($validated['jenjang'] . ' ' . $validated['jurusan']);

        AcademicClass::create([
            'school_id' => $schoolId,
            'nama_kelas' => $namaKelas,
            'level' => $validated['jenjang'],
            'jurusan' => $validated['jurusan'],
            'guru_id' => $validated['guru_id'],
            'walimurid' => $validated['walimurid'],
            'no_telpon_wali' => $validated['no_telpon_wali'],
            'nama_km' => $validated['nama_km'],
            'no_telpon_km' => $validated['no_telpon_km'],
            'deskripsi' => $validated['deskripsi'],
        ]);

        return redirect()->route('classes.index')->with('success', "Kelas {$namaKelas} berhasil ditambahkan.");
    }

    public function edit(AcademicClass $class)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        if ($class->school_id && $class->school_id !== $schoolId) {
            abort(403);
        }

        $gurus = User::where('school_id', $schoolId)->where('role', 'guru')->orderBy('name')->get();

        return view('classes.edit', compact('class', 'gurus'));
    }

    public function update(Request $request, AcademicClass $class)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        if ($class->school_id && $class->school_id !== $schoolId) {
            abort(403);
        }

        $validated = $request->validate([
            'jenjang' => 'required|string|max:50',
            'jurusan' => 'required|string|max:100',
            'guru_id' => 'required|exists:users,id',
            'walimurid' => 'nullable|string|max:255',
            'no_telpon_wali' => 'nullable|string|max:50',
            'nama_km' => 'nullable|string|max:255',
            'no_telpon_km' => 'nullable|string|max:50',
            'deskripsi' => 'nullable|string',
        ]);

        $namaKelas = trim($validated['jenjang'] . ' ' . $validated['jurusan']);

        $class->update([
            'nama_kelas' => $namaKelas,
            'level' => $validated['jenjang'],
            'jurusan' => $validated['jurusan'],
            'guru_id' => $validated['guru_id'],
            'walimurid' => $validated['walimurid'],
            'no_telpon_wali' => $validated['no_telpon_wali'],
            'nama_km' => $validated['nama_km'],
            'no_telpon_km' => $validated['no_telpon_km'],
            'deskripsi' => $validated['deskripsi'],
        ]);

        return redirect()->route('classes.index')->with('success', "Kelas {$namaKelas} berhasil diperbarui.");
    }

    public function destroy(AcademicClass $class)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        if ($class->school_id && $class->school_id !== $schoolId) {
            abort(403);
        }

        $nama = $class->nama_kelas;
        $class->delete();

        return redirect()->route('classes.index')->with('success', "Kelas {$nama} berhasil dihapus.");
    }
}
