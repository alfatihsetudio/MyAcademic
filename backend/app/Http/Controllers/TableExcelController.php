<?php

namespace App\Http\Controllers;

use App\Models\TableDocument;
use App\Models\TableTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TableExcelController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $documents = TableDocument::with('template')
            ->where(function ($q) use ($user, $schoolId) {
                if ($user->isAdmin()) {
                    $q->where('school_id', $schoolId);
                } else {
                    $q->where('owner_id', $user->id);
                }
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return view('excel.index', compact('documents'));
    }

    public function listTemplates()
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $templates = TableTemplate::where(function ($q) use ($user, $schoolId) {
            $q->where('school_id', $schoolId)
              ->orWhere('visibility', 'public')
              ->orWhere('owner_id', $user->id);
        })
        ->where('is_active', true)
        ->orderBy('created_at', 'desc')
        ->get();

        return view('excel.list_templates', compact('templates'));
    }

    public function createTemplate()
    {
        return view('excel.create_template');
    }

    public function storeTemplate(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'layout_json' => 'required|string',
        ]);

        TableTemplate::create([
            'school_id' => $schoolId,
            'owner_id' => $user->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'visibility' => 'school',
            'columns_json' => $validated['layout_json'],
            'is_active' => true,
        ]);

        return redirect()->route('excel.templates')->with('success', 'Template tabel berhasil disimpan.');
    }

    public function useTemplate(TableTemplate $template)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $document = TableDocument::create([
            'school_id' => $schoolId,
            'template_id' => $template->id,
            'owner_id' => $user->id,
            'name' => $template->name . ' - ' . date('Y-m-d H:i'),
            'description' => $template->description,
            'data_json' => $template->columns_json,
        ]);

        return redirect()->route('excel.edit-document', $document->id);
    }

    public function editDocument(TableDocument $document)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $document->owner_id !== $user->id) {
            abort(403);
        }

        return view('excel.edit_document', compact('document'));
    }

    public function saveDocument(Request $request, TableDocument $document)
    {
        $user = Auth::user();
        if (!$user->isAdmin() && $document->owner_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'data_json' => 'required|string',
        ]);

        $document->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'data_json' => $validated['data_json'],
        ]);

        if ($request->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Dokumen tabel berhasil disimpan.');
    }
}
