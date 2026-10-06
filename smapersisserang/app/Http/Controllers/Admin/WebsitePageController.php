<?php

namespace App\Http\Controllers\Admin;

use App\Models\WebsitePage;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WebsitePageController extends Controller
{
    public function index()
    {
        $pages = WebsitePage::orderBy('page_key')->get();

        return view('admin.website.pages.index', compact('pages'));
    }

    public function edit(WebsitePage $websitePage)
    {
        return view('admin.website.pages.edit', compact('websitePage'));
    }

    public function update(Request $request, WebsitePage $websitePage)
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'section_label' => 'nullable|string|max:255',
            'section_heading' => 'nullable|string|max:255',
            'section_subtitle' => 'nullable|string|max:255',
            'button_primary_text' => 'nullable|string|max:100',
            'button_primary_url' => 'nullable|string|max:255',
            'button_secondary_text' => 'nullable|string|max:100',
            'button_secondary_url' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $data['is_active'] = $request->boolean('is_active');

        $existingContent = [];
        if ($websitePage->content) {
            $decoded = json_decode($websitePage->content, true);
            if (is_array($decoded)) {
                $existingContent = $decoded;
            }
        }

        $existingContent['section_label'] = $data['section_label'] ?? '';
        $existingContent['section_heading'] = $data['section_heading'] ?? '';
        $existingContent['section_subtitle'] = $data['section_subtitle'] ?? '';

        $data['content'] = json_encode($existingContent, JSON_UNESCAPED_UNICODE);

        unset($data['section_label'], $data['section_heading'], $data['section_subtitle']);

        $websitePage->update($data);

        return redirect()->route('admin.website.pages.index')
            ->with('success', 'Konten halaman berhasil diperbarui.');
    }
}
