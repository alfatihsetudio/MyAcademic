<x-admin-layout>
    <div x-data="{
        cardModal: false,
        scheduleModal: false,
        editingCard: null,
        editingSchedule: null,
        cardType: 'why_boarding',
        scheduleType: 'daily',
        cardForm: { title: '', description: '', icon: 'building', color: 'emerald', sort_order: 0 },
        scheduleForm: { time: '', title: '', description: '', color: 'emerald', sort_order: 0 },
        openCardModal(type, card = null) {
            this.cardType = type;
            if (card) {
                this.editingCard = card;
                this.cardForm = { ...card };
            } else {
                this.editingCard = null;
                const maxOrder = document.querySelectorAll(`[data-card-type=\"${type}\"]`).length;
                this.cardForm = { title: '', description: '', icon: 'building', color: 'emerald', sort_order: maxOrder };
            }
            this.cardModal = true;
        },
        openScheduleModal(type, schedule = null) {
            if (typeof type === 'object' || type === null) {
                schedule = type;
                type = schedule ? schedule.schedule_type : 'daily';
            }
            this.scheduleType = type;
            if (schedule) {
                this.editingSchedule = schedule;
                this.scheduleForm = { ...schedule };
            } else {
                this.editingSchedule = null;
                const selector = type === 'holiday' ? '[data-schedule-holiday]' : '[data-schedule-daily]';
                const maxOrder = document.querySelectorAll(selector).length;
                this.scheduleForm = { time: '', title: '', description: '', color: 'emerald', sort_order: maxOrder };
            }
            this.scheduleModal = true;
        }
    }">
        <div class="space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Konten Halaman Boarding</h2>
                    <p class="text-sm text-gray-500 mt-1">Kelola heading, kartu, dan jadwal halaman boarding school</p>
                </div>
                <a href="{{ route('public.boarding') }}" target="_blank"
                   class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Lihat Halaman Boarding
                </a>
            </div>

            @if(session('success'))
                <div class="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
                    {{ session('success') }}
                </div>
            @endif
            @if($errors->any())
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <ul class="list-disc list-inside">
                        @foreach($errors->all() as $error)
                            <li>{{ $error }}</li>
                        @endforeach
                    </ul>
                </div>
            @endif

            {{-- Pengaturan Utama --}}
            <form method="POST" action="{{ route('admin.website.boarding.settings.update') }}" class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                @csrf @method('PUT')
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Pengaturan Utama</h3>
                </div>
                <div class="p-5 space-y-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Label Section</label>
                            <input type="text" name="section_label" value="{{ old('section_label', $settings?->section_label ?? 'PROGRAM ASRAMA') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Heading Section</label>
                            <input type="text" name="section_heading" value="{{ old('section_heading', $settings?->section_heading ?? 'Mengapa Boarding School?') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle Section</label>
                        <textarea name="section_subtitle" rows="2" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('section_subtitle', $settings?->section_subtitle ?? '') }}</textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Heading Alasan Boarding</label>
                            <input type="text" name="why_heading" value="{{ old('why_heading', $settings?->why_heading ?? 'Mengapa Boarding School?') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle Alasan Boarding</label>
                            <input type="text" name="why_subtitle" value="{{ old('why_subtitle', $settings?->why_subtitle ?? '') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Heading Jadwal</label>
                            <input type="text" name="schedule_heading" value="{{ old('schedule_heading', $settings?->schedule_heading ?? 'Rancangan Jadwal Harian') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle Jadwal</label>
                            <input type="text" name="schedule_subtitle" value="{{ old('schedule_subtitle', $settings?->schedule_subtitle ?? '') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Jadwal</label>
                        <textarea name="schedule_note" rows="2" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">{{ old('schedule_note', $settings?->schedule_note ?? 'Jadwal bersifat rancangan dan dapat menyesuaikan kondisi sekolah serta kalender akademik.') }}</textarea>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Heading Fokus Pembinaan</label>
                            <input type="text" name="focus_heading" value="{{ old('focus_heading', $settings?->focus_heading ?? 'Fokus Pembinaan Asrama') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Subtitle Fokus Pembinaan</label>
                            <input type="text" name="focus_subtitle" value="{{ old('focus_subtitle', $settings?->focus_subtitle ?? '') }}" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                        </div>
                    </div>
                </div>
                <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button type="submit" class="px-6 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Simpan Pengaturan</button>
                </div>
            </form>

            {{-- Alasan Memilih Boarding --}}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Alasan Memilih Boarding</h3>
                    <button @click="openCardModal('why_boarding')" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah
                    </button>
                </div>
                @if($whyCards->isEmpty())
                    <div class="p-5 text-center text-gray-400 text-sm">Belum ada kartu. Klik "Tambah" untuk menambahkan.</div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-left">
                                <tr>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Urutan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Judul</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden sm:table-cell">Ikon</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden md:table-cell">Warna</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Status</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($whyCards as $card)
                                <tr data-card-type="why_boarding">
                                    <td class="px-4 py-2.5 text-gray-600">{{ $card->sort_order }}</td>
                                    <td class="px-4 py-2.5">
                                        <div class="font-medium text-gray-900">{{ $card->title }}</div>
                                        <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ $card->description }}</div>
                                    </td>
                                    <td class="px-4 py-2.5 text-gray-600 hidden sm:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">{{ $card->icon }}</span>
                                    </td>
                                    <td class="px-4 py-2.5 hidden md:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {{ $card->color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700' }}">
                                            {{ $card->color }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $card->is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500' }}">
                                            {{ $card->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="flex items-center gap-2">
                                            <button @click="openCardModal('why_boarding', @json($card))" type="button" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                            <form method="POST" action="{{ route('admin.website.boarding.cards.destroy', $card) }}" onsubmit="return confirm('Hapus kartu ini?')" class="inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Fokus Pembinaan --}}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Fokus Pembinaan</h3>
                    <button @click="openCardModal('focus')" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah
                    </button>
                </div>
                @if($focusCards->isEmpty())
                    <div class="p-5 text-center text-gray-400 text-sm">Belum ada kartu. Klik "Tambah" untuk menambahkan.</div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-left">
                                <tr>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Urutan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Judul</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden sm:table-cell">Ikon</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden md:table-cell">Warna</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Status</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($focusCards as $card)
                                <tr data-card-type="focus">
                                    <td class="px-4 py-2.5 text-gray-600">{{ $card->sort_order }}</td>
                                    <td class="px-4 py-2.5">
                                        <div class="font-medium text-gray-900">{{ $card->title }}</div>
                                        <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ $card->description }}</div>
                                    </td>
                                    <td class="px-4 py-2.5 text-gray-600 hidden sm:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">{{ $card->icon }}</span>
                                    </td>
                                    <td class="px-4 py-2.5 hidden md:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {{ $card->color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700' }}">
                                            {{ $card->color }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $card->is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500' }}">
                                            {{ $card->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="flex items-center gap-2">
                                            <button @click="openCardModal('focus', @json($card))" type="button" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                            <form method="POST" action="{{ route('admin.website.boarding.cards.destroy', $card) }}" onsubmit="return confirm('Hapus kartu ini?')" class="inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Jadwal Harian --}}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Jadwal Harian</h3>
                    <button @click="openScheduleModal('daily')" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah
                    </button>
                </div>
                @if($dailySchedules->isEmpty())
                    <div class="p-5 text-center text-gray-400 text-sm">Belum ada jadwal harian. Klik "Tambah" untuk menambahkan.</div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-left">
                                <tr>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Urutan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Waktu</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Kegiatan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden md:table-cell">Warna</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Status</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($dailySchedules as $schedule)
                                <tr data-schedule-daily>
                                    <td class="px-4 py-2.5 text-gray-600">{{ $schedule->sort_order }}</td>
                                    <td class="px-4 py-2.5">
                                        <span class="font-mono font-medium text-gray-900">{{ $schedule->time }}</span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="font-medium text-gray-900">{{ $schedule->title }}</div>
                                        <div class="text-xs text-gray-400 truncate max-w-[250px]">{{ $schedule->description }}</div>
                                    </td>
                                    <td class="px-4 py-2.5 hidden md:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {{ $schedule->color === 'amber' ? 'bg-amber-50 text-amber-700' : ($schedule->color === 'gray' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700') }}">
                                            {{ $schedule->color }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $schedule->is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500' }}">
                                            {{ $schedule->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="flex items-center gap-2">
                                            <button @click="openScheduleModal('daily', @json($schedule))" type="button" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                            <form method="POST" action="{{ route('admin.website.boarding.schedules.destroy', $schedule) }}" onsubmit="return confirm('Hapus jadwal ini?')" class="inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Jadwal Hari Libur --}}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Jadwal Hari Libur</h3>
                    <button @click="openScheduleModal('holiday')" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah
                    </button>
                </div>
                @if($holidaySchedules->isEmpty())
                    <div class="p-5 text-center text-gray-400 text-sm">Belum ada jadwal hari libur. Klik "Tambah" untuk menambahkan.</div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-left">
                                <tr>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Urutan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Waktu</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Kegiatan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden md:table-cell">Warna</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Status</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($holidaySchedules as $schedule)
                                <tr data-schedule-holiday>
                                    <td class="px-4 py-2.5 text-gray-600">{{ $schedule->sort_order }}</td>
                                    <td class="px-4 py-2.5">
                                        <span class="font-mono font-medium text-gray-900">{{ $schedule->time }}</span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="font-medium text-gray-900">{{ $schedule->title }}</div>
                                        <div class="text-xs text-gray-400 truncate max-w-[250px]">{{ $schedule->description }}</div>
                                    </td>
                                    <td class="px-4 py-2.5 hidden md:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {{ $schedule->color === 'amber' ? 'bg-amber-50 text-amber-700' : ($schedule->color === 'gray' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-50 text-emerald-700') }}">
                                            {{ $schedule->color }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $schedule->is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500' }}">
                                            {{ $schedule->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="flex items-center gap-2">
                                            <button @click="openScheduleModal('holiday', @json($schedule))" type="button" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                            <form method="POST" action="{{ route('admin.website.boarding.schedules.destroy', $schedule) }}" onsubmit="return confirm('Hapus jadwal ini?')" class="inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>

            {{-- Informasi Tambahan --}}
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div class="px-5 py-3.5 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
                    <h3 class="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Informasi Tambahan</h3>
                    <button @click="openCardModal('info')" type="button" class="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Tambah
                    </button>
                </div>
                @if($infoCards->isEmpty())
                    <div class="p-5 text-center text-gray-400 text-sm">Belum ada informasi tambahan. Klik "Tambah" untuk menambahkan.</div>
                @else
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead class="bg-gray-50 text-left">
                                <tr>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Urutan</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Judul</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden sm:table-cell">Ikon</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium hidden md:table-cell">Warna</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium">Status</th>
                                    <th class="px-4 py-2.5 text-gray-500 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100">
                                @foreach($infoCards as $card)
                                <tr data-card-type="info">
                                    <td class="px-4 py-2.5 text-gray-600">{{ $card->sort_order }}</td>
                                    <td class="px-4 py-2.5">
                                        <div class="font-medium text-gray-900">{{ $card->title }}</div>
                                        <div class="text-xs text-gray-400 truncate max-w-[200px]">{{ $card->description }}</div>
                                    </td>
                                    <td class="px-4 py-2.5 text-gray-600 hidden sm:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-mono">{{ $card->icon }}</span>
                                    </td>
                                    <td class="px-4 py-2.5 hidden md:table-cell">
                                        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {{ $card->color === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700' }}">
                                            {{ $card->color }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {{ $card->is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500' }}">
                                            {{ $card->is_active ? 'Aktif' : 'Nonaktif' }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-2.5">
                                        <div class="flex items-center gap-2">
                                            <button @click="openCardModal('info', @json($card))" type="button" class="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                                            <form method="POST" action="{{ route('admin.website.boarding.cards.destroy', $card) }}" onsubmit="return confirm('Hapus informasi ini?')" class="inline">
                                                @csrf @method('DELETE')
                                                <button type="submit" class="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif
            </div>
        </div>

        {{-- Modal Kartu --}}
        <div x-show="cardModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4" x-transition>
            <div class="fixed inset-0 bg-black/50" @click="cardModal = false"></div>
            <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" @click.stop>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900" x-text="editingCard ? 'Edit Kartu' : 'Tambah Kartu'"></h3>
                    <button @click="cardModal = false" type="button" class="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                {{-- Create form --}}
                <form x-show="!editingCard" action="{{ route('admin.website.boarding.cards.store') }}" method="POST">
                    @csrf
                    <input type="hidden" name="type" x-model="cardType">
                    @include('admin.website.boarding._card_form_fields')
                    <div class="flex justify-end gap-3 mt-6">
                        <button @click="cardModal = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Tambah</button>
                    </div>
                </form>
                {{-- Edit form --}}
                <form x-show="editingCard" :action="'{{ route('admin.website.boarding.cards.update', 'PLACEHOLDER') }}'.replace('PLACEHOLDER', editingCard.id)" method="POST">
                    @csrf @method('PUT')
                    @include('admin.website.boarding._card_form_fields')
                    <div x-show="editingCard" class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="is_active" x-model.number="cardForm.is_active" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                            <option :value="1">Aktif</option>
                            <option :value="0">Nonaktif</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button @click="cardModal = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>

        {{-- Modal Jadwal --}}
        <div x-show="scheduleModal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4" x-transition>
            <div class="fixed inset-0 bg-black/50" @click="scheduleModal = false"></div>
            <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" @click.stop>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-bold text-gray-900" x-text="editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal'"></h3>
                    <button @click="scheduleModal = false" type="button" class="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                {{-- Create form --}}
                <form x-show="!editingSchedule" action="{{ route('admin.website.boarding.schedules.store') }}" method="POST">
                    @csrf
                    <input type="hidden" name="schedule_type" x-model="scheduleType">
                    @include('admin.website.boarding._schedule_form_fields')
                    <div class="flex justify-end gap-3 mt-6">
                        <button @click="scheduleModal = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Tambah</button>
                    </div>
                </form>
                {{-- Edit form --}}
                <form x-show="editingSchedule" :action="'{{ route('admin.website.boarding.schedules.update', 'PLACEHOLDER') }}'.replace('PLACEHOLDER', editingSchedule.id)" method="POST">
                    @csrf @method('PUT')
                    @include('admin.website.boarding._schedule_form_fields')
                    <div x-show="editingSchedule" class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="is_active" x-model.number="scheduleForm.is_active" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                            <option :value="1">Aktif</option>
                            <option :value="0">Nonaktif</option>
                        </select>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button @click="scheduleModal = false" type="button" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Batal</button>
                        <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">Simpan</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    @push('styles')
    <style>[x-cloak] { display: none !important; }</style>
    @endpush
</x-admin-layout>
