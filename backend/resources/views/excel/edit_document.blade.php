@extends('layouts.app')

@section('title', 'Edit Dokumen: ' . $document->name)

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">{{ $document->name }}</h1>
        <p class="page-subtitle">Terakhir disimpan: {{ $document->updated_at->format('d M Y, H:i') }}</p>
    </div>
    <div style="display: flex; gap: 0.5rem;">
        <a href="{{ route('excel.index') }}" class="btn btn-secondary">← Kembali ke Dokumen</a>
        <button type="button" class="btn btn-primary" onclick="saveDocument()">💾 Simpan Dokumen</button>
    </div>
</div>

<div class="card">
    <form action="{{ route('excel.save-document', $document->id) }}" method="POST" id="docForm">
        @csrf
        <input type="hidden" name="data_json" id="data_json">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
            <div class="form-group" style="margin-bottom: 0;">
                <label for="name" class="form-label">Nama Dokumen</label>
                <input type="text" id="name" name="name" class="form-control" value="{{ old('name', $document->name) }}" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <label for="description" class="form-label">Deskripsi</label>
                <input type="text" id="description" name="description" class="form-control" value="{{ old('description', $document->description) }}">
            </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 1rem;">
            <button type="button" class="btn btn-secondary btn-sm" onclick="addRow()">➕ Tambah Baris</button>
            <button type="button" class="btn btn-secondary btn-sm" onclick="addCol()">➕ Tambah Kolom</button>
            <span id="saveStatus" style="font-size: 0.8rem; color: var(--gray); margin-left: auto;"></span>
        </div>

        <!-- Spreadsheet Matrix -->
        <div style="overflow-x: auto; max-height: 520px; border: 1px solid var(--border); border-radius: 8px;">
            <table id="spreadsheetTable" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
                <tbody id="spreadsheetBody"></tbody>
            </table>
        </div>
    </form>
</div>

<script>
    const rawData = {!! $document->data_json ?: '{"rows":12,"cols":6,"cells":{}}' !!};
    let rows = rawData.rows || 12;
    let cols = rawData.cols || 6;
    let cells = rawData.cells || {};

    function renderTable() {
        const body = document.getElementById('spreadsheetBody');
        body.innerHTML = '';

        for (let r = 0; r < rows; r++) {
            const tr = document.createElement('tr');
            for (let c = 0; c < cols; c++) {
                const td = document.createElement('td');
                td.style.border = '1px solid #cbd5e1';
                td.style.padding = '0';
                td.style.minWidth = '110px';

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

                input.addEventListener('input', (e) => {
                    cells[key] = e.target.value;
                });

                td.appendChild(input);
                tr.appendChild(td);
            }
            body.appendChild(tr);
        }
    }

    function addRow() { rows++; renderTable(); }
    function addCol() { cols++; renderTable(); }

    function saveDocument() {
        const payload = {
            rows: rows,
            cols: cols,
            cells: cells,
            merges: []
        };

        document.getElementById('data_json').value = JSON.stringify(payload);
        document.getElementById('docForm').submit();
    }

    renderTable();
</script>
@endsection
