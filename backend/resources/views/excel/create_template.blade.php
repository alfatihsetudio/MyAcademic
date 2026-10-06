@extends('layouts.app')

@section('title', 'Rancang Template Tabel')

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">Rancang Template Tabel Baru</h1>
        <p class="page-subtitle">Tentukan struktur baris, kolom, dan header tabel</p>
    </div>
    <a href="{{ route('excel.templates') }}" class="btn btn-secondary">← Kembali ke Template</a>
</div>

<div class="card">
    <form action="{{ route('excel.store-template') }}" method="POST" id="templateForm">
        @csrf
        <input type="hidden" name="layout_json" id="layout_json">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="name" class="form-label">Nama Template *</label>
                <input type="text" id="name" name="name" class="form-control" placeholder="Contoh: Rekap Nilai Ujian Semester, Buku Induk" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="description" class="form-label">Deskripsi Template</label>
                <input type="text" id="description" name="description" class="form-control" placeholder="Keterangan kegunaan template...">
            </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="addRow()">➕ Tambah Baris</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addCol()">➕ Tambah Kolom</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeRow()">➖ Kurangi Baris</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="removeCol()">➖ Kurangi Kolom</button>
            <span style="font-size: 0.8rem; color: var(--gray); margin-left: auto;">
                Ukuran: <span id="gridSize">10 baris x 6 kolom</span>
            </span>
        </div>

        <!-- Spreadsheet Matrix -->
        <div style="overflow-x: auto; max-height: 480px; border: 1px solid var(--border); border-radius: 8px; margin-bottom: 1.5rem;">
            <table id="spreadsheetTable" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <tbody id="spreadsheetBody"></tbody>
            </table>
        </div>

        <button type="button" class="btn btn-primary" onclick="saveTemplate()">💾 Simpan Template</button>
    </form>
</div>

<script>
    let rows = 10;
    let cols = 6;
    let cells = {};

    function renderTable() {
        const body = document.getElementById('spreadsheetBody');
        body.innerHTML = '';

        for (let r = 0; r < rows; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                const td = document.createElement('td');
                td.style.border = '1px solid #cbd5e1';
                td.style.padding = '0';
                td.style.minWidth = '120px';

                const input = document.createElement('input');
                input.type = 'text';
                input.style.width = '100%';
                input.style.border = 'none';
                input.style.padding = '6px 8px';
                input.style.outline = 'none';
                input.style.fontSize = '0.85rem';

                if (r === 0) {
                    input.style.fontWeight = 'bold';
                    input.style.backgroundColor = '#f1f5f9';
                }

                const key = `${r}_${c}`;
                if (cells[key]) {
                    input.value = cells[key];
                }

                input.addEventListener('change', (e) => {
                    cells[key] = e.target.value;
                });

                td.appendChild(input);
                tr.appendChild(td);
            }
            body.appendChild(tr);
        }
        document.getElementById('gridSize').innerText = `${rows} baris x ${cols} kolom`;
    }

    function addRow() { rows++; renderTable(); }
    function removeRow() { if (rows > 2) { rows--; renderTable(); } }
    function addCol() { cols++; renderTable(); }
    function removeCol() { if (cols > 2) { cols--; renderTable(); } }

    function saveTemplate() {
        const name = document.getElementById('name').value.trim();
        if (!name) {
            alert('Silakan isi nama template terlebih dahulu.');
            return;
        }

        const payload = {
            rows: rows,
            cols: cols,
            cells: cells,
            merges: []
        };

        document.getElementById('layout_json').value = JSON.stringify(payload);
        document.getElementById('templateForm').submit();
    }

    // Default header values
    cells['0_0'] = 'No';
    cells['0_1'] = 'Nama Siswa';
    cells['0_2'] = 'NISN';
    cells['0_3'] = 'Tugas 1';
    cells['0_4'] = 'Tugas 2';
    cells['0_5'] = 'Keterangan';

    renderTable();
</script>
@endsection
