@php
    $school = \App\Models\SchoolSetting::current();
    $app = $studentApplication;
    $genderLabel = $app->gender === 'laki_laki' ? 'Laki-laki' : 'Perempuan';
    $birthDateFormatted = $app->birth_date?->format('d F Y') ?? '';
    $tanggalDiterima = $app->tanggal_diterima?->format('d F Y') ?? '';
    $display = fn ($v) => filled($v) ? $v : '';
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Cetak Data Siswa - {{ $app->student_name }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        @page {
            size: A4 portrait;
            margin: 10mm 12mm;
        }

        body {
            font-family: 'Inter', Arial, Helvetica, sans-serif;
            font-size: 11.5pt;
            line-height: 1.35;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 0;
        }

        .no-print {
            text-align: center;
            padding: 20px 0;
            background: #f3f4f6;
            border-bottom: 1px solid #d1d5db;
        }

        .no-print button,
        .no-print a {
            display: inline-block;
            padding: 10px 24px;
            margin: 0 4px;
            font-size: 14px;
            font-family: sans-serif;
            font-weight: 600;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            text-decoration: none;
            color: #fff;
        }

        .no-print .btn-print { background: #2563eb; }
        .no-print .btn-print:hover { background: #1d4ed8; }
        .no-print .btn-back { background: #6b7280; }
        .no-print .btn-back:hover { background: #4b5563; }

        .page {
            width: 100%;
            max-width: 190mm;
            margin: 0 auto;
            padding: 0;
        }

        .kop {
            text-align: center;
            margin-bottom: 14px;
        }

        .kop-logos {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .kop-logo {
            width: 55px;
            height: 55px;
            flex-shrink: 0;
        }

        .kop-logo img {
            width: 55px;
            height: 55px;
            object-fit: contain;
        }

        .kop-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.3;
        }

        .kop-sub {
            font-size: 10.5pt;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            line-height: 1.3;
        }

        .kop-address {
            font-size: 9.5pt;
            margin: 1px 0 0;
        }

        .kop-line {
            border: none;
            border-top: 2px solid #000;
            margin: 6px 0 3px;
        }

        .kop-line-thin {
            border: none;
            border-top: 1px solid #000;
            margin: 0 0 10px;
        }

        .form-title {
            text-align: center;
            font-size: 12.5pt;
            font-weight: 700;
            text-transform: uppercase;
            text-decoration: underline;
            letter-spacing: 0.2px;
            margin: 10px 0 12px;
        }

        .section {
            margin-top: 12px;
        }

        .section-title {
            font-size: 12.5pt;
            font-weight: 700;
            margin: 0 0 4px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 36px 250px 14px 1fr;
            align-items: baseline;
            min-height: 24px;
        }

        .form-row .num {
            grid-column: 1;
            text-align: left;
        }

        .form-row .label {
            grid-column: 2;
            white-space: nowrap;
            font-weight: 500;
        }

        .form-row.sub .label {
            display: grid;
            grid-template-columns: 28px 1fr;
            column-gap: 4px;
        }

        .form-row .sub-code {
            text-align: left;
        }

        .form-row .sub-text {
            white-space: nowrap;
        }

        .form-row .colon {
            grid-column: 3;
            text-align: center;
        }

        .form-row .value {
            grid-column: 4;
            border-bottom: 1px dotted #777;
            min-height: 18px;
            padding-left: 8px;
            font-weight: 400;
            font-size: 11.5pt;
        }

        .kop-image {
            margin-bottom: 14px;
        }

        .letterhead-img {
            width: 100%;
            height: auto;
            display: block;
        }

        .photo-sign-row {
            display: flex;
            justify-content: space-between;
            margin-top: 28px;
            gap: 40px;
        }

        .photo-box {
            width: 140px;
            flex-shrink: 0;
        }

        .photo-box img {
            width: 120px;
            height: 160px;
            object-fit: cover;
            border: 1px solid #000;
            display: block;
        }

        .photo-placeholder {
            width: 120px;
            height: 160px;
            border: 1px solid #000;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 10pt;
            color: #666;
        }

        .photo-label {
            font-size: 10pt;
            text-align: center;
            margin-top: 4px;
        }

        .signature-area {
            flex: 1;
            text-align: center;
            font-size: 11pt;
        }

        .signature-space {
            height: 64px;
        }

        .signature-line {
            width: 220px;
            margin: 0 auto;
            border-top: 1px solid #222;
        }

        @media print {
            .no-print {
                display: none !important;
            }
            body {
                margin: 0;
                background: #fff;
            }
            .page {
                max-width: none;
            }
        }
    </style>
</head>
<body>

<div class="no-print">
    <button class="btn-print" onclick="window.print()">Cetak</button>
    <a class="btn-back" href="{{ route('admin.ppdb.applications.show', $app) }}">Kembali</a>
</div>

<div class="page">

    {{-- Kop Surat --}}
    @if($school && $school->letterhead_png)
        <div class="kop-image">
            <img src="{{ asset('storage/' . $school->letterhead_png) }}" alt="Kop Surat" class="letterhead-img">
        </div>
    @else
    <div class="kop">
        <div class="kop-logos">
            <div class="kop-logo">
                @if($school && $school->logo_path)
                    <img src="{{ asset('storage/' . $school->logo_path) }}" alt="Logo">
                @else
                    <div style="width:55px;height:55px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:9pt;color:#999">Logo</div>
                @endif
            </div>
            <div>
                <p class="kop-title">Pemerintah Provinsi Banten</p>
                <p class="kop-sub">Dinas Pendidikan dan Kebudayaan</p>
                <p class="kop-title" style="margin-top:1px;">SMA Persis Kota Serang</p>
                <p class="kop-address">Alamat : Lingkungan Andamui Kec. Curug Kota Serang Provinsi Banten</p>
            </div>
            <div class="kop-logo">
                @if($school && $school->logo_path)
                    <img src="{{ asset('storage/' . $school->logo_path) }}" alt="Logo">
                @else
                    <div style="width:55px;height:55px;border:1px solid #ccc;display:flex;align-items:center;justify-content:center;font-size:9pt;color:#999">Logo</div>
                @endif
            </div>
        </div>
        <hr class="kop-line">
        <hr class="kop-line-thin">
    </div>
    @endif

    {{-- Judul --}}
    <div class="form-title">Formulir Data Siswa SPMB</div>

    {{-- I. SISWA --}}
    <div class="section">
        <div class="section-title">I. SISWA</div>

        <div class="form-row">
            <div class="num">1.</div>
            <div class="label">Nama</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Nama Lengkap</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->student_name) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Nama Panggilan</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->nama_panggilan) }}</div>
        </div>

        <div class="form-row">
            <div class="num">2.</div>
            <div class="label">Nomor Induk Asal</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->nomor_induk_asal) }}</div>
        </div>

        <div class="form-row">
            <div class="num">3.</div>
            <div class="label">NISN</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->nisn) }}</div>
        </div>

        <div class="form-row">
            <div class="num">4.</div>
            <div class="label">Tempat Tgl Lahir</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->birth_place) }}{{ $app->birth_place && $birthDateFormatted ? ', ' : '' }}{{ $birthDateFormatted }}</div>
        </div>

        <div class="form-row">
            <div class="num">5.</div>
            <div class="label">Jenis Kelamin</div>
            <div class="colon">:</div>
            <div class="value">{{ $genderLabel }}</div>
        </div>

        <div class="form-row">
            <div class="num">6.</div>
            <div class="label">Agama</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->agama) }}</div>
        </div>

        <div class="form-row">
            <div class="num">7.</div>
            <div class="label">Anak Ke</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->anak_ke) }}</div>
        </div>

        <div class="form-row">
            <div class="num">8.</div>
            <div class="label">Status anak dalam keluarga</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->status_anak_dalam_keluarga) }}</div>
        </div>

        <div class="form-row">
            <div class="num">9.</div>
            <div class="label">Alamat Siswa</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Alamat</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->address) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Telepon/HP</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->telepon_siswa) }}</div>
        </div>

        <div class="form-row">
            <div class="num">10.</div>
            <div class="label">Diterima di Madrasah</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Dikelas</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->diterima_di_kelas) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Pada Tanggal</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($tanggalDiterima) }}</div>
        </div>

        <div class="form-row">
            <div class="num">11.</div>
            <div class="label">Nama SMP/MTs Asal</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Nama Sekolah</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->previous_school) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Alamat Sekolah</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->alamat_sekolah_asal) }}</div>
        </div>
    </div>

    {{-- II. ORANG TUA KANDUNG --}}
    <div class="section">
        <div class="section-title">II. ORANG TUA KANDUNG</div>

        <div class="form-row">
            <div class="num">1.</div>
            <div class="label">Nama lengkap Ayah</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->father_name) }}</div>
        </div>

        <div class="form-row">
            <div class="num">2.</div>
            <div class="label">Nama lengkap Ibu</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->mother_name) }}</div>
        </div>

        <div class="form-row">
            <div class="num">3.</div>
            <div class="label">Alamat Ayah</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->alamat_ayah) }}</div>
        </div>

        <div class="form-row">
            <div class="num">4.</div>
            <div class="label">Alamat Ibu</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->alamat_ibu) }}</div>
        </div>

        <div class="form-row">
            <div class="num">5.</div>
            <div class="label">Telepon/HP</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->parent_whatsapp) }}</div>
        </div>

        <div class="form-row">
            <div class="num">6.</div>
            <div class="label">Pekerjaan Ayah</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pekerjaan_ayah) }}</div>
        </div>

        <div class="form-row">
            <div class="num">7.</div>
            <div class="label">Pekerjaan Ibu</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pekerjaan_ibu) }}</div>
        </div>

        <div class="form-row">
            <div class="num">8.</div>
            <div class="label">Pendidikan Terakhir</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Ayah</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pendidikan_ayah) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Ibu</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pendidikan_ibu) }}</div>
        </div>

        <div class="form-row">
            <div class="num">9.</div>
            <div class="label">Penghasilan perbulan Ayah</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->penghasilan_ayah) }}</div>
        </div>

        <div class="form-row">
            <div class="num">10.</div>
            <div class="label">Penghasilan perbulan Ibu</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->penghasilan_ibu) }}</div>
        </div>
    </div>

    {{-- III. ORANG TUA WALI --}}
    <div class="section">
        <div class="section-title">III. ORANG TUA WALI</div>

        <div class="form-row">
            <div class="num">1.</div>
            <div class="label">Nama Ayah Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->nama_ayah_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">2.</div>
            <div class="label">Nama Ibu Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->nama_ibu_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">3.</div>
            <div class="label">Alamat Ayah Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->alamat_ayah_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">4.</div>
            <div class="label">Alamat Ibu Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->alamat_ibu_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">5.</div>
            <div class="label">Telepon/HP</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->telepon_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">6.</div>
            <div class="label">Pekerjaan Ayah Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pekerjaan_ayah_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">7.</div>
            <div class="label">Pekerjaan Ibu Wali</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pekerjaan_ibu_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">8.</div>
            <div class="label">Pendidikan Terakhir</div>
            <div class="colon">:</div>
            <div class="value"></div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">a.</span>
                <span class="sub-text">Ayah</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pendidikan_ayah_wali) }}</div>
        </div>
        <div class="form-row sub">
            <div class="num"></div>
            <div class="label">
                <span class="sub-code">b.</span>
                <span class="sub-text">Ibu</span>
            </div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->pendidikan_ibu_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">9.</div>
            <div class="label">Penghasilan perbulan Ayah</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->penghasilan_ayah_wali) }}</div>
        </div>

        <div class="form-row">
            <div class="num">10.</div>
            <div class="label">Penghasilan perbulan Ibu</div>
            <div class="colon">:</div>
            <div class="value">{{ $display($app->penghasilan_ibu_wali) }}</div>
        </div>
    </div>

    {{-- Foto & Tanda Tangan --}}
    <div class="photo-sign-row">
        <div class="photo-box">
            @if($app->foto_3x4)
                <img src="{{ asset('storage/' . $app->foto_3x4) }}" alt="Foto 3x4 {{ $app->student_name }}">
            @else
                <div class="photo-placeholder">Foto Terbaru 3X4</div>
            @endif
            <div class="photo-label">Foto 3x4</div>
        </div>

        <div class="signature-box" style="flex:1;text-align:center;font-size:11pt;">
            <div>Serang, .................... 2026</div>
            <div style="margin-top:8px;">Penerimaan Siswa Baru</div>
            <div class="signature-space"></div>
            <div class="signature-line"></div>
        </div>
    </div>

</div>

</body>
</html>
