<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SchoolSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebsiteSettingController extends Controller
{
    public function edit()
    {
        $setting = SchoolSetting::current();

        if (!$setting) {
            $setting = new SchoolSetting();
        }

        return view('admin.website.settings', compact('setting'));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'school_name' => ['required', 'string', 'max:255'],
            'short_name' => ['nullable', 'string', 'max:100'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'whatsapp_number' => ['nullable', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'instagram_url' => ['nullable', 'url', 'max:255'],
            'facebook_url' => ['nullable', 'url', 'max:255'],
            'youtube_url' => ['nullable', 'url', 'max:255'],
            'vision' => ['nullable', 'string'],
            'mission' => ['nullable', 'string'],
            'about_school' => ['nullable', 'string'],
            'about_boarding' => ['nullable', 'string'],
            'primary_color' => ['nullable', 'string', 'max:20'],
            'secondary_color' => ['nullable', 'string', 'max:20'],
            'logo' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,svg,webp', 'max:2048'],
            'building_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'meta_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
            'google_maps_embed_url' => ['nullable', 'string'],
            'google_maps_link' => ['nullable', 'string', 'max:500'],
            'letterhead_png' => ['nullable', 'image', 'mimes:png', 'max:2048'],
            'public_dashboard_token' => ['nullable', 'string', 'max:100'],
        ]);

        $setting = SchoolSetting::current();

        if (!$setting) {
            $setting = new SchoolSetting();
        }

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('school/logos', 'public');
            $validated['logo_path'] = $path;
        }

        if ($request->hasFile('building_image')) {
            $path = $request->file('building_image')->store('school/buildings', 'public');
            $validated['building_image_path'] = $path;
        }

        if ($request->hasFile('meta_image')) {
            if ($setting->meta_image) {
                Storage::disk('public')->delete($setting->meta_image);
            }
            $validated['meta_image'] = $request->file('meta_image')->store('website/meta', 'public');
        }

        if ($request->hasFile('letterhead_png')) {
            if ($setting->letterhead_png) {
                Storage::disk('public')->delete($setting->letterhead_png);
            }
            $validated['letterhead_png'] = $request->file('letterhead_png')->store('settings/letterhead', 'public');
        }

        $validated['is_active'] = true;

        $setting->fill($validated);
        $setting->save();

        return redirect()->route('admin.website.settings.edit')
            ->with('success', 'Pengaturan website berhasil diperbarui.');
    }

    public function generateToken()
    {
        $setting = SchoolSetting::current();

        if (!$setting) {
            $setting = new SchoolSetting();
            $setting->is_active = true;
        }

        $setting->public_dashboard_token = Str::random(48);
        $setting->save();

        return back()->with('success', 'Token dashboard publik berhasil dibuat.');
    }
}
