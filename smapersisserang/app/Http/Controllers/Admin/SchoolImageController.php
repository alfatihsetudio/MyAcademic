<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryCategory;
use App\Models\SchoolImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SchoolImageController extends Controller
{
    public function index(Request $request)
    {
        $category = $request->get('category');

        $query = SchoolImage::orderBy('sort_order')->latest();

        if ($category) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $category));
        }

        $mediaImages = $query->with('categories')->get();

        $categories = GalleryCategory::where('is_active', true)->orderBy('sort_order')->get();

        return view('admin.website.media.index', compact('mediaImages', 'categories', 'category'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $image = SchoolImage::create([
            'title' => $validated['title'] ?? null,
            'image_path' => $request->file('image')->store('school/hero', 'public'),
            'category' => 'hero',
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        $image->categories()->attach(GalleryCategory::where('slug', 'hero')->value('id'));

        return redirect()->route('admin.website.media.index')
            ->with('success', 'Gambar hero berhasil ditambahkan.');
    }

    public function galleryStore(Request $request)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['exists:gallery_categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $image = SchoolImage::create([
            'title' => $validated['title'] ?? null,
            'image_path' => $request->file('image')->store('school/gallery', 'public'),
            'category' => 'hero',
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        $image->categories()->attach($validated['category_ids']);

        return redirect()->route('admin.website.media.index')
            ->with('success', 'Gambar galeri berhasil ditambahkan.');
    }

    public function mediaStore(Request $request)
    {
        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['exists:gallery_categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);

        $categorySlugs = GalleryCategory::whereIn('id', $validated['category_ids'])->pluck('slug');

        if ($categorySlugs->contains('hero')) {
            $storagePath = 'school/hero';
        } else {
            $storagePath = 'school/gallery';
        }

        $image = SchoolImage::create([
            'title' => $validated['title'] ?? null,
            'image_path' => $request->file('image')->store($storagePath, 'public'),
            'category' => 'hero',
            'sort_order' => $validated['sort_order'] ?? 0,
            'is_active' => true,
        ]);

        $image->categories()->attach($validated['category_ids']);

        return redirect()->route('admin.website.media.index')
            ->with('success', 'Gambar berhasil ditambahkan.');
    }

    public function toggle(SchoolImage $schoolImage)
    {
        $schoolImage->update([
            'is_active' => !$schoolImage->is_active,
        ]);

        return redirect()->route('admin.website.media.index')
            ->with('success', 'Status gambar berhasil diubah.');
    }

    public function destroy(SchoolImage $schoolImage)
    {
        try {
            Storage::disk('public')->delete($schoolImage->image_path);
        } catch (\Exception $e) {
        }

        $schoolImage->delete();

        return redirect()->route('admin.website.media.index')
            ->with('success', 'Gambar berhasil dihapus.');
    }
}
