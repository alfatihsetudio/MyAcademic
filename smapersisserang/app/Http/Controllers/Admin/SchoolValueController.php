<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolValue;
use Illuminate\Http\Request;

class SchoolValueController extends Controller
{
    public function index()
    {
        $values = SchoolValue::orderBy('sort_order')->get();

        return view('admin.website.values.index', compact('values'));
    }

    public function create()
    {
        return view('admin.website.values.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active'] = true;

        SchoolValue::create($data);

        return redirect()->route('admin.website.values.index')
            ->with('success', 'Nilai utama berhasil ditambahkan.');
    }

    public function edit(SchoolValue $schoolValue)
    {
        return view('admin.website.values.edit', compact('schoolValue'));
    }

    public function update(Request $request, SchoolValue $schoolValue)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active');

        $schoolValue->update($data);

        return redirect()->route('admin.website.values.index')
            ->with('success', 'Nilai utama berhasil diperbarui.');
    }

    public function toggle(SchoolValue $schoolValue)
    {
        $schoolValue->update([
            'is_active' => !$schoolValue->is_active,
        ]);

        return redirect()->route('admin.website.values.index')
            ->with('success', 'Status nilai utama berhasil diubah.');
    }

    public function destroy(SchoolValue $schoolValue)
    {
        $schoolValue->delete();

        return redirect()->route('admin.website.values.index')
            ->with('success', 'Nilai utama berhasil dihapus.');
    }
}
