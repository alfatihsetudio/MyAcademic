<x-admin-layout>
    <div class="max-w-7xl mx-auto">
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Konten Halaman</h2>
            <p class="text-gray-500 mt-1">Kelola judul, subtitle, dan konten halaman publik.</p>
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
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Halaman</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Judul</th>
                            <th class="text-left px-4 py-3 font-semibold text-slate-600">Subtitle</th>
                            <th class="text-center px-4 py-3 font-semibold text-slate-600">Status</th>
                            <th class="text-right px-4 py-3 font-semibold text-slate-600">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        @foreach($pages as $page)
                            <tr class="hover:bg-slate-50 transition-colors">
                                <td class="px-4 py-3 font-medium text-gray-900 capitalize">{{ $page->page_key }}</td>
                                <td class="px-4 py-3 text-gray-600">{{ $page->title ?? '-' }}</td>
                                <td class="px-4 py-3 text-gray-500 max-w-xs truncate">{{ $page->subtitle ?? '-' }}</td>
                                <td class="px-4 py-3 text-center">
                                    @if($page->is_active)
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Aktif</span>
                                    @else
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Nonaktif</span>
                                    @endif
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <a href="{{ route('admin.website.pages.edit', $page) }}"
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
