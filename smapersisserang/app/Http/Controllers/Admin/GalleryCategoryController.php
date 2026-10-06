<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GalleryCategoryController extends Controller
{
    public function index()
    {
        $categories = GalleryCategory::orderBy('sort_order')->orderBy('name')->get();

        return view('admin.website.categories.index', compact('categories'));
    }

    public function create()
    {
        return view('admin.website.categories.create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:gallery_categories,slug',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        $data['slug'] = $data['slug'] ? Str::slug($data['slug']) : Str::slug($data['name']);
        $data['sort_order'] = $data['sort_order'] ?? 0;
        $data['is_active'] = true;

        GalleryCategory::create($data);

        return redirect()->route('admin.website.categories.index')
            ->with('success', 'Kategori berhasil ditambahkan.');
    }

    public function edit(GalleryCategory $galleryCategory)
    {
        return view('admin.website.categories.edit', compact('galleryCategory'));
    }

    public function update(Request $request, GalleryCategory $galleryCategory)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:gallery_categories,slug,' . $galleryCategory->id,
            'sort_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $data['slug'] = $data['slug'] ? Str::slug($data['slug']) : Str::slug($data['name']);
        $data['is_active'] = $request->boolean('is_active');

        $galleryCategory->update($data);

        return redirect()->route('admin.website.categories.index')
            ->with('success', 'Kategori berhasil diperbarui.');
    }

    public function toggle(GalleryCategory $galleryCategory)
    {
        $galleryCategory->update([
            'is_active' => !$galleryCategory->is_active,
        ]);

        return redirect()->route('admin.website.categories.index')
            ->with('success', 'Status kategori berhasil diubah.');
    }

    public function destroy(GalleryCategory $galleryCategory)
    {
        if ($galleryCategory->images()->exists()) {
            return redirect()->route('admin.website.categories.index')
                ->with('error', 'Kategori masih digunakan oleh gambar galeri.');
        }

        $galleryCategory->delete();

        return redirect()->route('admin.website.categories.index')
            ->with('success', 'Kategori berhasil dihapus.');
    }
}
