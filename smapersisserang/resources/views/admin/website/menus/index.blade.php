<x-admin-layout>
    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Menu Navigasi</h2>
            <p class="text-gray-500 mt-1">Kelola nama dan urutan menu navigasi publik.</p>
        </div>

        @if(session('success'))
            <div class="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {{ session('success') }}
            </div>
        @endif

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-slate-50 border-b border-slate-200">
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Menu</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Label</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Route / URL</th>
                            <th class="text-center px-4 py-3 font-semibold text-slate-600">Induk</th>
                            <th class="text-center px-4 py-3 font-semibold text-slate-600">Urutan</th>
                            <th class="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                            <th class="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @foreach($menus as $menu)
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-3 font-medium text-gray-900">
                                    @if($menu->parent_key)
                                        <span class="ml-4 text-gray-500">&mdash;</span>
                                    @endif
                                    {{ $menu->menu_key }}
                                </td>
                                <td class="px-4 py-3 text-gray-600">{{ $menu->label }}</td>
                                <td class="px-4 py-3 text-gray-500 max-w-xs truncate">
                                    {{ $menu->route_name ?? $menu->url ?? '-' }}
                                </td>
                                <td class="px-4 py-3 text-center text-gray-500">
                                    {{ $menu->parent_key ?? '-' }}
                                </td>
                                <td class="px-4 py-3 text-center text-gray-500">{{ $menu->sort_order }}</td>
                                <td class="px-4 py-3 text-center">
                                    <form action="{{ route('admin.website.menus.toggle', $menu) }}" method="POST" class="inline">
                                        @csrf
                                        @method('PATCH')
                                        <button type="submit"
                                                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors {{ $menu->is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200' }}">
                                            {{ $menu->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </button>
                                    </form>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <a href="{{ route('admin.website.menus.edit', $menu) }}"
                                       class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-[#0F6B3A] bg-[#EAF6EE] rounded-lg hover:bg-[#D5EDDE] transition-colors">
                                        Edit
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</x-admin-layout>
