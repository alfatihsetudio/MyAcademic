<div class="space-y-4">
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Waktu <span class="text-red-500">*</span></label>
        <input type="text" name="time" x-model="scheduleForm.time" required placeholder="contoh: 03.00 atau 04.00 – 04.15" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Kegiatan <span class="text-red-500">*</span></label>
        <input type="text" name="title" x-model="scheduleForm.title" required class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea name="description" x-model="scheduleForm.description" rows="2" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"></textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Warna</label>
            <select name="color" x-model="scheduleForm.color" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                <option value="emerald">Hijau (Emerald)</option>
                <option value="amber">Kuning (Amber)</option>
                <option value="gray">Abu-abu (Gray)</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
            <input type="number" name="sort_order" x-model="scheduleForm.sort_order" min="0" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
        </div>
    </div>
</div>
