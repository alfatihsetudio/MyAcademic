<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Daftar Pendaftar SPMB</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 9pt;
            color: #333;
            margin: 0;
            padding: 20px 25px;
        }
        .header {
            border-bottom: 3px solid #059669;
            padding-bottom: 12px;
            margin-bottom: 16px;
        }
        .header h1 {
            font-size: 16pt;
            color: #059669;
            margin: 0 0 4px 0;
            font-weight: bold;
        }
        .header .subtitle {
            font-size: 10pt;
            color: #555;
        }
        .header .meta {
            font-size: 8pt;
            color: #777;
            margin-top: 4px;
        }
        .filter-info {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 6px 10px;
            font-size: 8pt;
            color: #166534;
            margin-bottom: 12px;
            border-radius: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        thead th {
            background: #059669;
            color: white;
            font-weight: 600;
            padding: 6px 5px;
            font-size: 7.5pt;
            text-align: left;
            border: 1px solid #047857;
        }
        tbody td {
            padding: 4px 5px;
            border: 1px solid #d1d5db;
            font-size: 7.5pt;
        }
        tbody tr:nth-child(even) {
            background: #f9fafb;
        }
        .text-center { text-align: center; }
        .font-mono { font-family: 'DejaVu Sans Mono', monospace; font-size: 7pt; }
        .status-badge {
            display: inline-block;
            padding: 1px 6px;
            font-size: 7pt;
            border-radius: 3px;
            background: #e5e7eb;
            color: #374151;
        }
        .footer {
            margin-top: 20px;
            font-size: 7pt;
            color: #999;
            text-align: center;
        }
        .page-break {
            page-break-after: always;
        }
        .no-data {
            text-align: center;
            padding: 30px;
            color: #999;
            font-size: 10pt;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Daftar Pendaftar SPMB</h1>
        <div class="subtitle">SMA Persis Serang Islamic Boarding School</div>
        <div class="meta">
            Dicetak: {{ now()->format('d/m/Y H:i') }}
            @if($currentYear)
                | Tahun Ajaran: {{ $currentYear->academic_year }}
            @else
                | Tahun Ajaran: Belum ditentukan
            @endif
            | Total: {{ $applications->count() }} pendaftar
        </div>
    </div>

    @if(count($filterInfo))
        <div class="filter-info">
            Filter aktif: {{ implode(' | ', $filterInfo) }}
        </div>
    @endif

    @if($applications->count())
        <table>
            <thead>
                <tr>
                    <th style="width:3%">No</th>
                    <th style="width:13%">No. Pendaftaran</th>
                    <th style="width:18%">Nama Siswa</th>
                    <th style="width:4%">JK</th>
                    <th style="width:12%">WA Orang Tua</th>
                    <th style="width:15%">Asal Sekolah</th>
                    <th style="width:14%">Program</th>
                    <th style="width:9%">Status</th>
                    <th style="width:9%">Follow-up</th>
                    <th style="width:11%">Tgl Daftar</th>
                </tr>
            </thead>
            <tbody>
                @foreach($applications as $i => $app)
                <tr>
                    <td class="text-center">{{ $i + 1 }}</td>
                    <td class="font-mono">{{ $app->registration_number }}</td>
                    <td>{{ $app->student_name }}</td>
                    <td class="text-center">{{ $app->gender === 'laki_laki' ? 'L' : 'P' }}</td>
                    <td class="font-mono">{{ $app->parent_whatsapp }}</td>
                    <td>{{ $app->previous_school }}</td>
                    <td>{{ $app->admissionProgram?->name ?? '-' }}</td>
                    <td class="text-center">
                        <span class="status-badge">{{ $statusLabels[$app->status] ?? $app->status }}</span>
                    </td>
                    <td class="text-center">
                        @if($app->follow_up_status)
                            {{ $followUpLabels[$app->follow_up_status] ?? $app->follow_up_status }}
                        @else
                            -
                        @endif
                    </td>
                    <td>{{ $app->submitted_at?->format('d/m/Y') ?: $app->created_at->format('d/m/Y') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @else
        <div class="no-data">Tidak ada data pendaftar.</div>
    @endif

    <div class="footer">
        Dokumen ini dicetak dari sistem SPMB SMA Persis Serang &mdash; {{ now()->format('d/m/Y H:i') }}
    </div>
</body>
</html>