@props([
    'name' => '',
    'value' => '',
    'label' => '',
    'required' => false,
    'rows' => 10,
    'showTableButtons' => true,
    'autoInit' => true,
])

@php
    $editorId = str_replace(['[', ']'], '_', $name) . '_editor';
    $inputId = str_replace(['[', ']'], '_', $name) . '_input';
    $fallbackId = str_replace(['[', ']'], '_', $name) . '_fallback';
    $htmlValue = old($name, $value);
    $sanitizedValue = \App\Helpers\LetterHtmlSanitizer::sanitize($htmlValue);
@endphp

@once
    @vite('resources/js/ckeditor.js')
    <style>
        .letter-editor-wrapper .ck.ck-editor {
            border: 1px solid #d1d5db;
            border-radius: 0.5rem;
            overflow: hidden;
        }
        .letter-editor-wrapper .ck.ck-toolbar {
            border: none;
            border-bottom: 1px solid #d1d5db;
            background: #f9fafb;
        }
        .letter-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
            min-height: var(--ck-min-height, 220px);
            line-height: 1.55;
            font-size: 14px;
            border: none;
        }
        .letter-editor-wrapper .ck.ck-editor__main > .ck-editor__editable.ck-focused {
            box-shadow: none;
        }
        .letter-editor-wrapper .ck-content ol {
            list-style-type: decimal;
            padding-left: 1.75rem;
            margin: 0.5rem 0;
        }
        .letter-editor-wrapper .ck-content ul {
            list-style-type: disc;
            padding-left: 1.75rem;
            margin: 0.5rem 0;
        }
        .letter-editor-wrapper .ck-content li {
            margin: 0.2rem 0;
            padding-left: 0.2rem;
        }
        .letter-editor-wrapper .ck-content ol ol {
            list-style-type: lower-alpha;
        }
        .letter-editor-wrapper .ck-content ol ol ol {
            list-style-type: lower-roman;
        }
        .letter-editor-wrapper .ck-content ul ul {
            list-style-type: circle;
        }
        .letter-editor-wrapper .ck-content figure.table {
            margin-left: 0 !important;
            margin-right: auto !important;
            text-align: left;
        }
        .letter-editor-wrapper .ck-content figure.table table {
            margin-left: 0 !important;
            margin-right: auto !important;
        }
        .letter-editor-wrapper .ck-content .no-border-table table,
        .letter-editor-wrapper .ck-content table.no-border-table {
            border-collapse: collapse;
        }
        .letter-editor-wrapper .ck-content .no-border-table table td,
        .letter-editor-wrapper .ck-content .no-border-table table th,
        .letter-editor-wrapper .ck-content table.no-border-table td,
        .letter-editor-wrapper .ck-content table.no-border-table th {
            border: none !important;
            padding: 2px 6px;
        }
        .letter-editor-wrapper .letter-editor-fallback {
            display: block;
            width: 100%;
            border-radius: 0.5rem;
            border: 1px solid #d1d5db;
            padding: 0.75rem;
            font-size: 14px;
            line-height: 1.55;
            resize: vertical;
        }
        .letter-editor-wrapper .letter-editor-fallback:focus {
            border-color: #10b981;
            outline: none;
            box-shadow: 0 0 0 1px #10b981;
        }
        .letter-editor-wrapper.is-ready .letter-editor-fallback,
        .letter-editor-wrapper .letter-editor-fallback.hidden,
        .letter-editor-wrapper .letter-ckeditor.hidden {
            display: none;
        }
    </style>
@endonce

@if($label !== '')
    <label for="{{ $editorId }}" class="block text-sm font-semibold text-gray-700">
        {{ $label }}
        @if($required)
            <span class="text-red-500">*</span>
        @endif
    </label>
@endif

<div class="letter-editor-wrapper mt-1.5" style="--ck-min-height: {{ $rows * 24 }}px;">
    <input
        type="hidden"
        name="{{ $name }}"
        id="{{ $inputId }}"
        class="letter-editor-input"
        value="{{ $sanitizedValue }}"
    >
    <div
        id="{{ $editorId }}"
        class="letter-ckeditor hidden"
        data-input-id="{{ $inputId }}"
        data-fallback-id="{{ $fallbackId }}"
        data-initial-value="{{ $sanitizedValue }}"
        data-auto-init="{{ $autoInit ? 'true' : 'false' }}"
        data-placeholder="Ketik isi surat..."
        style="min-height: {{ $rows * 24 }}px;"
    ></div>
    <textarea
        id="{{ $fallbackId }}"
        class="letter-editor-fallback"
        rows="{{ $rows }}"
        placeholder="Ketik isi surat..."
    >{!! $sanitizedValue !!}</textarea>
    @if($showTableButtons)
    <div class="mt-2 flex flex-wrap gap-2">
        <button
            type="button"
            class="rounded-lg border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
            data-letter-insert-borderless-table
        >
            Sisipkan Tabel Tanpa Garis
        </button>
        <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            data-letter-table-border="hide"
        >
            Hilangkan Garis Tabel
        </button>
        <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            data-letter-table-border="show"
        >
            Tampilkan Garis Tabel
        </button>
    </div>
    @endif
</div>
