<div class="space-y-4">
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Judul <span class="text-red-500">*</span></label>
        <input type="text" name="title" x-model="cardForm.title" required class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
        <textarea name="description" x-model="cardForm.description" rows="3" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm"></textarea>
    </div>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ikon</label>
            <select name="icon" x-model="cardForm.icon" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                <option value="building">Building</option>
                <option value="bolt">Bolt</option>
                <option value="academic">Academic</option>
                <option value="users">Users</option>
                <option value="shield">Shield</option>
                <option value="cog">Cog</option>
            </select>
        </div>
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Warna</label>
            <select name="color" x-model="cardForm.color" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
                <option value="emerald">Hijau (Emerald)</option>
                <option value="amber">Kuning (Amber)</option>
            </select>
        </div>
    </div>
    <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
        <input type="number" name="sort_order" x-model="cardForm.sort_order" min="0" class="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 text-sm">
    </div>
</div>
