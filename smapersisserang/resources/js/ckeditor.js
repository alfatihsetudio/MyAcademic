import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

class NoBorderTablePlugin {
    constructor(editor) {
        this.editor = editor;
    }

    afterInit() {
        const editor = this.editor;

        editor.model.schema.extend('table', {
            allowAttributes: ['noBorderTable'],
        });

        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'figure',
                classes: 'no-border-table',
            },
            model: {
                key: 'noBorderTable',
                value: true,
            },
        });

        editor.conversion.for('upcast').elementToAttribute({
            view: {
                name: 'table',
                classes: 'no-border-table',
            },
            model: {
                key: 'noBorderTable',
                value: true,
            },
        });

        editor.conversion.for('downcast').add(function (dispatcher) {
            dispatcher.on('attribute:noBorderTable:table', function (event, data, conversionApi) {
                const viewWriter = conversionApi.writer;
                const viewFigure = conversionApi.mapper.toViewElement(data.item);

                if (!viewFigure) {
                    return;
                }

                const viewTable = Array.from(viewFigure.getChildren()).find(function (child) {
                    return child.is('element', 'table');
                });

                if (data.attributeNewValue) {
                    viewWriter.addClass('no-border-table', viewFigure);
                    if (viewTable) {
                        viewWriter.addClass('no-border-table', viewTable);
                    }
                } else {
                    viewWriter.removeClass('no-border-table', viewFigure);
                    if (viewTable) {
                        viewWriter.removeClass('no-border-table', viewTable);
                    }
                }
            });
        });
    }
}

window.createLetterEditor = function (element, config = {}) {
    return ClassicEditor.create(element, {
        extraPlugins: [NoBorderTablePlugin, ColumnWidthPlugin],
        toolbar: {
            items: [
                'undo',
                'redo',
                'bold',
                'italic',
                'numberedList',
                'bulletedList',
                'outdent',
                'indent',
                'insertTable',
            ],
        },
        table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
        },
        language: 'id',
        ...config,
    }).then(function (editor) {
        element.ckeditorInstance = editor;
        return editor;
    });
};

function generateDefaultWidths(colCount) {
    if (colCount === 3) return '16%,20%,64%';
    if (colCount === 2) return '22%,78%';
    if (colCount === 1) return '100%';
    const perCol = Math.floor((100 / colCount) * 10) / 10;
    var widths = Array(colCount).fill(perCol);
    var total = widths.reduce(function (a, b) { return a + b; }, 0);
    widths[colCount - 1] = Math.round((widths[colCount - 1] + 100 - total) * 10) / 10;
    return widths.map(function (w) { return w + '%'; }).join(',');
}

class ColumnWidthPlugin {
    constructor(editor) {
        this.editor = editor;
    }

    init() {
        var editor = this.editor;
        var schema = editor.model.schema;
        var conversion = editor.conversion;

        schema.extend('table', {
            allowAttributes: ['columnWidths', 'tableWidth']
        });

        conversion.for('upcast').add(function (dispatcher) {
            dispatcher.on('element:colgroup', function (evt, data, conversionApi) {
                if (!conversionApi.consumable.test(data.viewItem, { name: true })) return;
                var modelTable = data.modelCursor.findAncestor('table');
                if (!modelTable) return;
                var cols = [];
                for (var _i = 0; _i < data.viewItem.childCount; _i++) {
                    var child = data.viewItem.getChild(_i);
                    if (child.is('element', 'col')) {
                        cols.push(child.getStyle('width') || 'auto');
                    }
                }
                if (cols.length === 0) return;
                if (modelTable.hasAttribute('columnWidths')) return;
                conversionApi.writer.setAttribute('columnWidths', cols.join(','), modelTable);
            }, { priority: 'low' });

            dispatcher.on('element:table', function (evt, data, conversionApi) {
                if (!conversionApi.consumable.test(data.viewItem, { name: true })) return;
                var modelTable = data.modelCursor.findAncestor('table');
                if (!modelTable) return;
                if (modelTable.hasAttribute('tableWidth')) return;
                var width = data.viewItem.getStyle('width');
                if (width && /^\d+(\.\d+)?%$/.test(width)) {
                    conversionApi.writer.setAttribute('tableWidth', width, modelTable);
                }
            }, { priority: 'low' });
        });

        function createColumnWidthsDowncast(includeCellStyles) {
            return function (dispatcher) {
                dispatcher.on('attribute:columnWidths:table', function (evt, data, conversionApi) {
                    if (!conversionApi.consumable.consume(data.item, evt.name)) return;
                    var columnWidths = data.attributeNewValue;
                    if (!columnWidths) return;
                    var viewFigure = conversionApi.mapper.toViewElement(data.item);
                    if (!viewFigure) return;
                    var viewTable = viewFigure.is('element', 'table') ? viewFigure : null;
                    if (!viewTable) {
                        for (var _i2 = 0; _i2 < viewFigure.childCount; _i2++) {
                            var child = viewFigure.getChild(_i2);
                            if (child.is('element', 'table')) {
                                viewTable = child;
                                break;
                            }
                        }
                    }
                    if (!viewTable) return;
                    var writer = conversionApi.writer;
                    var widths = columnWidths.split(',');
                    var existingColgroup = null;
                    for (var _i3 = 0; _i3 < viewTable.childCount; _i3++) {
                        var child = viewTable.getChild(_i3);
                        if (child.is('element', 'colgroup')) {
                            existingColgroup = child;
                            break;
                        }
                    }
                    if (existingColgroup) {
                        writer.remove(existingColgroup);
                    }
                    var colgroup = writer.createContainerElement('colgroup');
                    for (var _i4 = 0; _i4 < widths.length; _i4++) {
                        var w = widths[_i4].trim();
                        var col = writer.createEmptyElement('col');
                        writer.setStyle('width', w, col);
                        writer.insert(writer.createPositionAt(colgroup, 'end'), col);
                    }
                    writer.insert(writer.createPositionAt(viewTable, 0), colgroup);

                    var tableWidth = data.item.getAttribute('tableWidth') || '100%';
                    writer.setStyle('width', tableWidth, viewTable);
                    writer.setStyle('table-layout', 'fixed', viewTable);
                    writer.setStyle('border-collapse', 'collapse', viewTable);

                    if (includeCellStyles) {
                        writer.setAttribute('width', tableWidth, viewTable);
                        for (var _r = 0; _r < viewTable.childCount; _r++) {
                            var section = viewTable.getChild(_r);
                            if (!section.is('element', 'thead') && !section.is('element', 'tbody') && !section.is('element', 'tfoot')) continue;
                            for (var _ri = 0; _ri < section.childCount; _ri++) {
                                var row = section.getChild(_ri);
                                if (!row.is('element', 'tr')) continue;
                                for (var _ci = 0; _ci < widths.length && _ci < row.childCount; _ci++) {
                                    var cell = row.getChild(_ci);
                                    if (!cell.is('element', 'td') && !cell.is('element', 'th')) continue;
                                    var cw = widths[_ci].trim();
                                    writer.setStyle('width', cw, cell);
                                    writer.setStyle('vertical-align', 'top', cell);
                                    writer.setAttribute('width', cw, cell);
                                }
                            }
                        }
                    }
                }, { priority: 'low' });
            };
        }

        conversion.for('dataDowncast').add(createColumnWidthsDowncast(true));
        conversion.for('editingDowncast').add(createColumnWidthsDowncast(false));

        function createTableWidthDowncast(includeAttr) {
            return function (dispatcher) {
                dispatcher.on('attribute:tableWidth:table', function (evt, data, conversionApi) {
                    if (!conversionApi.consumable.consume(data.item, evt.name)) return;
                    var viewFigure = conversionApi.mapper.toViewElement(data.item);
                    if (!viewFigure) return;
                    var viewTable = viewFigure.is('element', 'table') ? viewFigure : null;
                    if (!viewTable) {
                        for (var i = 0; i < viewFigure.childCount; i++) {
                            if (viewFigure.getChild(i).is('element', 'table')) {
                                viewTable = viewFigure.getChild(i);
                                break;
                            }
                        }
                    }
                    if (!viewTable) return;
                    var width = data.attributeNewValue || '100%';
                    conversionApi.writer.setStyle('width', width, viewTable);
                    if (includeAttr) {
                        conversionApi.writer.setAttribute('width', width, viewTable);
                    }
                }, { priority: 'low' });
            };
        }

        conversion.for('editingDowncast').add(createTableWidthDowncast(false));
        conversion.for('dataDowncast').add(createTableWidthDowncast(true));

        var _seenTables = new WeakSet();

        function _applyDefaultWidthsToTable(modelTable, writer) {
            if (_seenTables.has(modelTable) && modelTable.hasAttribute('tableWidth')) return false;
            var firstRow = modelTable.getChild(0);
            if (!firstRow) return false;
            var colCount = firstRow.childCount;
            if (colCount <= 0) return false;
            var changed = false;
            var existingWidths = modelTable.getAttribute('columnWidths');
            var existingCount = existingWidths ? existingWidths.split(',').length : 0;
            if (!existingWidths || existingCount !== colCount) {
                writer.setAttribute('columnWidths', generateDefaultWidths(colCount), modelTable);
                _seenTables.add(modelTable);
                changed = true;
            }
            if (!modelTable.hasAttribute('tableWidth')) {
                writer.setAttribute('tableWidth', '80%', modelTable);
                _seenTables.add(modelTable);
                changed = true;
            }
            return changed;
        }

        editor.model.document.registerPostFixer(function (writer) {
            var changed = false;
            var root = editor.model.document.getRoot();
            for (var _i5 = 0; _i5 < root.childCount; _i5++) {
                var child = root.getChild(_i5);
                if (child.is('element', 'table')) {
                    if (_applyDefaultWidthsToTable(child, writer)) changed = true;
                }
                if (child.is('element', 'paragraph')) {
                    for (var _i6 = 0; _i6 < child.childCount; _i6++) {
                        var sub = child.getChild(_i6);
                        if (sub && sub.is('element', 'table')) {
                            if (_applyDefaultWidthsToTable(sub, writer)) changed = true;
                        }
                    }
                }
            }
            return changed;
        });
    }
}

function getSelectedTable(editor) {
    const selection = editor.model.document.selection;
    const selectedElement = selection.getSelectedElement();

    if (selectedElement?.is('element', 'table')) {
        return selectedElement;
    }

    const firstPosition = selection.getFirstPosition();

    return firstPosition ? firstPosition.findAncestor('table') : null;
}

function syncEditorToInput(editor, input) {
    if (input) {
        input.value = editor.getData();
    }
}

function showFallback(wrapper, editorElement, fallback) {
    wrapper?.classList.remove('is-ready');
    if (editorElement) {
        editorElement.classList.add('hidden');
    }
    if (fallback) {
        fallback.classList.remove('hidden');
    }
}

window.initSingleLetterEditor = function (editorElement) {
    if (editorElement.dataset.ckeditorInitialized === 'true') {
        return;
    }

    const wrapper = editorElement.closest('.letter-editor-wrapper');
    const input = document.getElementById(editorElement.dataset.inputId);
    const fallback = document.getElementById(editorElement.dataset.fallbackId);
    const initialData = editorElement.dataset.initialValue || '';

    editorElement.dataset.ckeditorInitialized = 'true';

    window.createLetterEditor(editorElement, {
        initialData,
        placeholder: editorElement.dataset.placeholder || 'Ketik isi surat...',
    }).then(function (editor) {
        syncEditorToInput(editor, input);
        wrapper?.classList.add('is-ready');
        editorElement.classList.remove('hidden');
        fallback?.classList.add('hidden');

        editor.model.document.on('change:data', function () {
            syncEditorToInput(editor, input);
        });

        setupTableColumnResize(editor, editorElement);
    }).catch(function (error) {
        console.error('CKEditor error:', error);
        editorElement.dataset.ckeditorInitialized = 'false';
        showFallback(wrapper, editorElement, fallback);
    });
};

function applyTableBorderState(editorElement, noBorder) {
    const editor = editorElement?.ckeditorInstance;

    if (!editor) {
        return false;
    }

    let changed = false;

    editor.editing.view.focus();

    editor.model.change(function (writer) {
        const table = getSelectedTable(editor);

        if (!table) {
            return;
        }

        if (noBorder) {
            writer.setAttribute('noBorderTable', true, table);
        } else {
            writer.removeAttribute('noBorderTable', table);
        }

        changed = true;
    });

    return changed;
}

function insertBorderlessTableTemplate(editorElement) {
    const editor = editorElement?.ckeditorInstance;

    if (!editor) {
        return false;
    }

    const html = `
        <figure class="table no-border-table">
            <table class="no-border-table">
                <tbody>
                    <tr>
                        <td style="width:25%;">Hari/Tanggal</td>
                        <td style="width:3%;">:</td>
                        <td>Senin, 6 Juli 2026</td>
                    </tr>
                    <tr>
                        <td>Pukul</td>
                        <td>:</td>
                        <td>09.00 WIB s.d. selesai</td>
                    </tr>
                    <tr>
                        <td>Tempat</td>
                        <td>:</td>
                        <td>Ruang/Aula/Kantor Tata Usaha SMA PERSIS SERANG</td>
                    </tr>
                </tbody>
            </table>
        </figure>
    `;

    editor.editing.view.focus();

    const viewFragment = editor.data.processor.toView(html);
    const modelFragment = editor.data.toModel(viewFragment);

    editor.model.insertContent(modelFragment, editor.model.document.selection);

    return true;
}

function readColumnWidthsFromModel(editor, domTable) {
    try {
        var figure = domTable.closest('figure');
        if (!figure) return null;
        var domConverter = editor.editing.view.domConverter;
        var viewNode = domConverter.mapDomToView ? domConverter.mapDomToView(figure) : domConverter.domToView(figure);
        if (!viewNode) return null;
        var modelTable = editor.editing.mapper.toModelElement(viewNode);
        if (!modelTable) return null;
        return modelTable.getAttribute('columnWidths');
    } catch (e) {
        return null;
    }
}

function updateModelColumnWidths(editor, domTable, widthsStr) {
    try {
        var figure = domTable.closest('figure');
        if (!figure) return;
        var domConverter = editor.editing.view.domConverter;
        var viewNode = domConverter.mapDomToView ? domConverter.mapDomToView(figure) : domConverter.domToView(figure);
        if (!viewNode) return;
        var modelTable = editor.editing.mapper.toModelElement(viewNode);
        if (!modelTable) return;
        editor.model.change(function (writer) {
            writer.setAttribute('columnWidths', widthsStr, modelTable);
        });
    } catch (e) {
        /* silently fail */
    }
}

function readTableWidthFromModel(editor, domTable) {
    try {
        var figure = domTable.closest('figure');
        if (!figure) return null;
        var domConverter = editor.editing.view.domConverter;
        var viewNode = domConverter.mapDomToView ? domConverter.mapDomToView(figure) : domConverter.domToView(figure);
        if (!viewNode) return null;
        var modelTable = editor.editing.mapper.toModelElement(viewNode);
        if (!modelTable) return null;
        return modelTable.getAttribute('tableWidth');
    } catch (e) {
        return null;
    }
}

function updateTableWidth(editor, domTable, widthStr) {
    try {
        var figure = domTable.closest('figure');
        if (!figure) return;
        var domConverter = editor.editing.view.domConverter;
        var viewNode = domConverter.mapDomToView ? domConverter.mapDomToView(figure) : domConverter.domToView(figure);
        if (!viewNode) return;
        var modelTable = editor.editing.mapper.toModelElement(viewNode);
        if (!modelTable) return;
        editor.model.change(function (writer) {
            writer.setAttribute('tableWidth', widthStr, modelTable);
        });
    } catch (e) {
        /* silently fail */
    }
}

function setupTableColumnResize(editor, editorElement) {
    var wrapper = editorElement.closest('.letter-editor-wrapper');
    if (!wrapper) return;
    var hasTableFeature = wrapper.querySelector('[data-letter-insert-borderless-table]') !== null;
    if (!hasTableFeature) return;
    var ckEditor = wrapper.querySelector('.ck-editor');
    var editable = wrapper.querySelector('.ck-editor__editable');
    if (!ckEditor || !editable) return;
    ckEditor.style.position = 'relative';
    var overlay = document.createElement('div');
    overlay.className = 'col-resize-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:100;overflow:visible;';
    ckEditor.appendChild(overlay);
    var styleTag = document.createElement('style');
    styleTag.textContent = '.col-resize-handle { transition: background 0.15s; } .col-resize-handle:hover { background: rgba(16,185,129,0.4) !important; }';
    ckEditor.appendChild(styleTag);

    function positionHandles() {
        if (!editable.isConnected) return;
        var tables = editable.querySelectorAll('table');
        var overlayRect = overlay.getBoundingClientRect();
        if (overlayRect.width === 0) return;
        overlay.innerHTML = '';

        tables.forEach(function (table, ti) {
            var tableRect = table.getBoundingClientRect();
            var rows = table.querySelectorAll('tr');
            if (rows.length === 0) return;
            var colCount = 0;
            for (var ri = 0; ri < Math.min(rows.length, 5); ri++) {
                colCount = Math.max(colCount, rows[ri].children.length);
            }
            if (colCount < 2) return;

            for (var ci = 0; ci < colCount - 1; ci++) {
                var rightEdge = 0;
                for (var ri2 = 0; ri2 < Math.min(rows.length, 5); ri2++) {
                    var cell = rows[ri2].children[ci];
                    if (cell) {
                        var cellRect = cell.getBoundingClientRect();
                        if (cellRect.right > rightEdge) {
                            rightEdge = cellRect.right;
                        }
                    }
                }
                if (rightEdge === 0) continue;

                var handle = document.createElement('div');
                handle.className = 'col-resize-handle';
                handle.dataset.tableIndex = ti;
                handle.dataset.colIndex = ci;
                handle.dataset.handleType = 'column';
                handle.style.cssText = 'position:absolute;left:' + (rightEdge - overlayRect.left - 2) + 'px;top:' + (tableRect.top - overlayRect.top) + 'px;height:' + (tableRect.height) + 'px;width:4px;cursor:col-resize;pointer-events:auto;z-index:10;';
                var indicator = document.createElement('div');
                indicator.style.cssText = 'position:absolute;top:0;bottom:0;left:1px;width:2px;background:rgba(16,185,129,0.35);border-radius:1px;pointer-events:none;';
                handle.appendChild(indicator);
                handle.addEventListener('mousedown', onHandleMouseDown);
                overlay.appendChild(handle);
            }

            var tableRightEdge = tableRect.right;
            var twHandle = document.createElement('div');
            twHandle.className = 'col-resize-handle';
            twHandle.dataset.tableIndex = ti;
            twHandle.dataset.handleType = 'tableWidth';
            twHandle.style.cssText = 'position:absolute;left:' + (tableRightEdge - overlayRect.left - 4) + 'px;top:' + (tableRect.top - overlayRect.top) + 'px;height:' + (tableRect.height) + 'px;width:8px;cursor:ew-resize;pointer-events:auto;z-index:10;';
            var twIndicator = document.createElement('div');
            twIndicator.style.cssText = 'position:absolute;top:0;bottom:0;left:3px;width:2px;background:rgba(59,130,246,0.5);border-radius:1px;pointer-events:none;';
            twHandle.appendChild(twIndicator);
            twHandle.addEventListener('mousedown', onHandleMouseDown);
            overlay.appendChild(twHandle);
        });
    }

    var positionTimer = null;

    function schedulePosition() {
        if (positionTimer) clearTimeout(positionTimer);
        positionTimer = setTimeout(function () {
            positionTimer = null;
            requestAnimationFrame(positionHandles);
        }, 80);
    }

    editor.model.document.on('change', function () { schedulePosition(); });
    editable.addEventListener('scroll', function () { requestAnimationFrame(positionHandles); });

    var dragState = null;

    function onHandleMouseDown(e) {
        e.preventDefault();
        var handle = e.currentTarget;
        var tableIndex = parseInt(handle.dataset.tableIndex);
        var handleType = handle.dataset.handleType || 'column';
        var colIndex = parseInt(handle.dataset.colIndex);
        var tables = editable.querySelectorAll('table');
        var table = tables[tableIndex];
        if (!table) return;

        if (handleType === 'tableWidth') {
            var twStr = readTableWidthFromModel(editor, table);
            var tw = twStr ? parseFloat(twStr) : 80;
            dragState = {
                type: 'tableWidth',
                startX: e.clientX,
                table: table,
                startWidth: tw,
                editorWidth: editable.getBoundingClientRect().width
            };
        } else {
            var firstRow = table.querySelector('tr');
            var actualColCount = firstRow ? firstRow.children.length : 0;
            if (actualColCount < 2) return;

            var widthsStr = readColumnWidthsFromModel(editor, table);
            var widths = null;
            if (widthsStr) {
                widths = widthsStr.split(',').map(function (w) { return parseFloat(w.trim()) || 0; });
            } else {
                var colgroup = table.querySelector('colgroup');
                if (colgroup) {
                    var cols = colgroup.querySelectorAll('col');
                    widths = Array.from(cols).map(function (col) { return parseFloat(col.style.width) || 100 / cols.length; });
                } else {
                    widths = Array(actualColCount).fill(100 / actualColCount);
                }
            }

            if (widths.length !== actualColCount) {
                widths = widths.slice(0, actualColCount);
                while (widths.length < actualColCount) {
                    widths.push(100 / actualColCount);
                }
                var rebalancedTotal = widths.reduce(function (a, b) { return a + b; }, 0);
                if (Math.abs(rebalancedTotal - 100) > 0.1) {
                    widths[widths.length - 1] = Math.round((widths[widths.length - 1] + (100 - rebalancedTotal)) * 10) / 10;
                }
                updateModelColumnWidths(editor, table, widths.map(function (w) { return w + '%'; }).join(','));
            }

            dragState = {
                type: 'column',
                colIndex: colIndex,
                startX: e.clientX,
                table: table,
                widths: widths,
                tableWidth: table.getBoundingClientRect().width
            };
        }

        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onDragEnd);
    }

    function onDrag(e) {
        if (!dragState) return;
        e.preventDefault();

        if (dragState.type === 'tableWidth') {
            var dx = e.clientX - dragState.startX;
            if (dragState.editorWidth <= 0) return;
            var pctChange = (dx / dragState.editorWidth) * 100;
            if (Math.abs(pctChange) < 0.3) return;
            var newWidth = dragState.startWidth + pctChange;
            newWidth = Math.max(30, Math.min(100, Math.round(newWidth * 10) / 10));
            dragState.startX = e.clientX;
            dragState.startWidth = newWidth;
            var widthStr = newWidth + '%';
            updateTableWidth(editor, dragState.table, widthStr);
        } else {
            var dx = e.clientX - dragState.startX;
            var totalWidth = dragState.tableWidth;
            if (totalWidth <= 0) return;

            var dp = (dx / totalWidth) * 100;
            if (Math.abs(dp) < 0.3) return;

            var widths = dragState.widths.slice();
            var ci = dragState.colIndex;

            var newCi = widths[ci] + dp;
            var newCi1 = widths[ci + 1] - dp;
            var minW = 8;

            if (newCi < minW) {
                newCi1 -= (minW - newCi);
                newCi = minW;
            }
            if (newCi1 < minW) {
                newCi -= (minW - newCi1);
                newCi1 = minW;
            }
            var total = widths.reduce(function (a, b) { return a + b; }, 0);
            newCi = Math.round(newCi * 10) / 10;
            newCi1 = Math.round(newCi1 * 10) / 10;
            widths[ci] = newCi;
            widths[ci + 1] = newCi1;
            var newTotal = widths.reduce(function (a, b) { return a + b; }, 0);
            if (Math.abs(newTotal - 100) > 0.05) {
                widths[ci] = Math.round((widths[ci] + (100 - newTotal) * (widths[ci] / newTotal)) * 10) / 10;
                widths[ci + 1] = Math.round((widths[ci + 1] + (100 - newTotal) * (widths[ci + 1] / newTotal)) * 10) / 10;
            }

            dragState.widths = widths;
            dragState.startX = e.clientX;

            var widthsStr = widths.map(function (w) { return w + '%'; }).join(',');
            updateModelColumnWidths(editor, dragState.table, widthsStr);
        }

        requestAnimationFrame(positionHandles);
    }

    function onDragEnd() {
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onDragEnd);
        dragState = null;
    }

    setTimeout(positionHandles, 400);
}

window.initLetterEditors = function () {
    const editorElements = document.querySelectorAll('.letter-ckeditor[data-auto-init="true"]');

    editorElements.forEach(window.initSingleLetterEditor);
};

document.addEventListener('DOMContentLoaded', function () {
    window.initLetterEditors();

    document.querySelectorAll('form').forEach(function (form) {
        form.addEventListener('submit', function () {
            form.querySelectorAll('.letter-editor-wrapper').forEach(function (wrapper) {
                const input = wrapper.querySelector('.letter-editor-input');
                const editorElement = wrapper.querySelector('.letter-ckeditor');
                const fallback = wrapper.querySelector('.letter-editor-fallback');

                if (editorElement?.ckeditorInstance) {
                    input.value = editorElement.ckeditorInstance.getData();
                } else if (fallback && !fallback.classList.contains('hidden')) {
                    input.value = fallback.value;
                }
            });
        });
    });

    document.addEventListener('mousedown', function (event) {
        if (event.target.closest('[data-letter-table-border], [data-letter-insert-borderless-table]')) {
            event.preventDefault();
        }
    });

    document.addEventListener('click', function (event) {
        const insertButton = event.target.closest('[data-letter-insert-borderless-table]');

        if (insertButton) {
            const wrapper = insertButton.closest('.letter-editor-wrapper');
            const editorElement = wrapper?.querySelector('.letter-ckeditor');

            insertBorderlessTableTemplate(editorElement);
            return;
        }

        const button = event.target.closest('[data-letter-table-border]');

        if (!button) {
            return;
        }

        const wrapper = button.closest('.letter-editor-wrapper');
        const editorElement = wrapper?.querySelector('.letter-ckeditor');
        const noBorder = button.dataset.letterTableBorder === 'hide';

        if (!applyTableBorderState(editorElement, noBorder)) {
            button.blur();
        }
    });
});
