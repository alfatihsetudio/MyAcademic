<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolFigure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SchoolFigureController extends Controller
{
    public function index()
    {
        $figures = SchoolFigure::orderBy('sort_order')->latest()->get();

        return view('admin.website.figures.index', compact('figures'));
    }

    public function create()
    {
        return view('admin.website.figures.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo_path'] = $request->file('photo')->store('school/figures', 'public');
        }

        SchoolFigure::create([
            'name' => $validated['name'],
            'role' => $validated['role'] ?? null,
            'description' => $validated['description'] ?? null,
            'photo_path' => $validated['photo_path'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        return redirect()->route('admin.website.figures.index')
            ->with('success', 'Tokoh berhasil ditambahkan.');
    }

    public function edit(SchoolFigure $schoolFigure)
    {
        return view('admin.website.figures.edit', compact('schoolFigure'));
    }

    public function update(Request $request, SchoolFigure $schoolFigure)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'role' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($request->hasFile('photo')) {
            if ($schoolFigure->photo_path) {
                Storage::disk('public')->delete($schoolFigure->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('school/figures', 'public');
        }

        $schoolFigure->update($validated);

        return redirect()->route('admin.website.figures.index')
            ->with('success', 'Tokoh berhasil diperbarui.');
    }

    public function toggle(SchoolFigure $schoolFigure)
    {
        $schoolFigure->update([
            'is_active' => !$schoolFigure->is_active,
        ]);

        return redirect()->route('admin.website.figures.index')
            ->with('success', 'Status tokoh berhasil diubah.');
    }

    public function destroy(SchoolFigure $schoolFigure)
    {
        if ($schoolFigure->photo_path) {
            Storage::disk('public')->delete($schoolFigure->photo_path);
        }

        $schoolFigure->delete();

        return redirect()->route('admin.website.figures.index')
            ->with('success', 'Tokoh berhasil dihapus.');
    }
}