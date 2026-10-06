<?php

namespace App\Http\Controllers\Admin;

use App\Models\NavigationMenu;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class NavigationMenuController extends Controller
{
    public function index()
    {
        $menus = NavigationMenu::orderBy('sort_order')->orderBy('menu_key')->get();

        return view('admin.website.menus.index', compact('menus'));
    }

    public function edit(NavigationMenu $navigationMenu)
    {
        $parentOptions = NavigationMenu::whereNull('parent_key')
            ->where('menu_key', '!=', $navigationMenu->menu_key)
            ->orderBy('sort_order')
            ->get();

        $selectedRoute = $navigationMenu->route_name;
        if (!$selectedRoute) {
            if ($navigationMenu->url === '/') {
                $selectedRoute = 'home';
            } elseif ($navigationMenu->url === '/#kontak') {
                $selectedRoute = 'contact';
            }
        }

        $linkType = $selectedRoute ? 'route' : 'manual';

        return view('admin.website.menus.edit', compact(
            'navigationMenu', 'parentOptions', 'selectedRoute', 'linkType'
        ));
    }

    public function update(Request $request, NavigationMenu $navigationMenu)
    {
        $data = $request->validate([
            'label' => 'required|string|max:100',
            'parent_key' => 'nullable|string|max:100',
            'sort_order' => 'nullable|integer|min:0',
            'location' => 'required|string|max:100',
            'is_active' => 'nullable|boolean',
            'is_external' => 'nullable|boolean',
            'link_type' => 'nullable|string|in:route,manual',
            'route_name' => 'nullable|string|max:100',
            'url' => 'nullable|string|max:500',
        ]);

        $data['is_active'] = $request->boolean('is_active');
        $data['is_external'] = $request->boolean('is_external');

        $linkType = $request->input('link_type');
        $isExternal = $request->boolean('is_external');

        if ($isExternal) {
            $data['route_name'] = null;
            $data['url'] = $request->input('url');
        } elseif ($linkType === 'route') {
            $routeName = $request->input('route_name');
            if ($routeName === 'home') {
                $data['route_name'] = null;
                $data['url'] = '/';
            } elseif ($routeName === 'contact') {
                $data['route_name'] = null;
                $data['url'] = '/#kontak';
            } else {
                $data['route_name'] = $routeName ?: null;
                if ($routeName) {
                    $data['url'] = null;
                }
            }
        } elseif ($linkType === 'manual') {
            $data['route_name'] = null;
            $data['url'] = $request->input('url');
        }

        $navigationMenu->update($data);

        return redirect()->route('admin.website.menus.index')
            ->with('success', 'Menu navigasi berhasil diperbarui.');
    }

    public function toggle(NavigationMenu $navigationMenu)
    {
        $navigationMenu->update([
            'is_active' => !$navigationMenu->is_active,
        ]);

        return redirect()->route('admin.website.menus.index')
            ->with('success', 'Status menu berhasil diubah.');
    }
}
