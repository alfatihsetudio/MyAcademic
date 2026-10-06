<?php

namespace App\Http\Controllers;

use App\Models\FileUpload;
use App\Models\Material;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MaterialController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        if ($user->isGuru()) {
            $materials = Material::with(['subject.academicClass'])
                ->where('created_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();
        } elseif ($user->isMurid()) {
            $classIds = $user->classes()->pluck('classes.id')->toArray();
            if ($user->class_id) $classIds[] = $user->class_id;

            $materials = Material::with(['subject.academicClass', 'creator'])
                ->whereHas('subject', function ($q) use ($classIds) {
                    $q->whereIn('class_id', array_unique($classIds));
                })
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $materials = Material::with(['subject.academicClass', 'creator'])
                ->where('school_id', $schoolId)
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return view('materials.index', compact('materials'));
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

        return view('materials.create', compact('subjects'));
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'judul' => 'required|string|max:200',
            'konten' => 'nullable|string',
            'video_link' => 'nullable|url|max:500',
            'file' => 'nullable|file|max:30720', // 30MB
        ]);

        if (empty($validated['konten']) && empty($validated['video_link']) && !$request->hasFile('file')) {
            return back()->withErrors(['msg' => 'Minimal harus ada teks konten, file lampiran, atau link video.']);
        }

        $fileId = null;
        $filePath = null;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('materials', 'public');
            $fileUpload = FileUpload::create([
                'original_name' => $request->file('file')->getClientOriginalName(),
                'stored_name' => basename($path),
                'file_path' => $path,
                'mime_type' => $request->file('file')->getClientMimeType(),
                'file_size' => $request->file('file')->getSize(),
                'size' => $request->file('file')->getSize(),
                'uploader_id' => $user->id,
            ]);
            $fileId = $fileUpload->id;
            $filePath = $path;
        }

        Material::create([
            'school_id' => $schoolId,
            'subject_id' => $validated['subject_id'],
            'judul' => $validated['judul'],
            'konten' => $validated['konten'] ?? '',
            'video_link' => $validated['video_link'] ?? null,
            'file_id' => $fileId,
            'file_path' => $filePath,
            'created_by' => $user->id,
        ]);

        return redirect()->route('materials.index')->with('success', 'Materi pembelajaran berhasil dibagikan.');
    }

    public function show(Material $material)
    {
        $material->load(['subject.academicClass', 'creator']);
        return view('materials.show', compact('material'));
    }

    public function destroy(Material $material)
    {
        $user = Auth::user();
        if ($user->isGuru() && $material->created_by !== $user->id) {
            abort(403);
        }

        $judul = $material->judul;
        $material->delete();

        return redirect()->route('materials.index')->with('success', "Materi {$judul} berhasil dihapus.");
    }
}
