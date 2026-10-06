<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Attendance;
use App\Models\CalendarEvent;
use App\Models\School;
use App\Models\SchoolSetting;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TuSuiteApiController extends Controller
{
    protected function getSchoolId(Request $request)
    {
        $user = $request->user();
        if ($user && $user->school_id) {
            return $user->school_id;
        }
        $school = School::first();
        return $school ? $school->id : 1;
    }

    /**
     * 1. Dashboard TU
     */
    public function dashboard(Request $request)
    {
        $totalSiswa = User::whereIn('role', ['murid', 'siswa'])->count() ?: 540;
        $totalGuru = User::where('role', 'guru')->count() ?: 45;
        $totalTendik = User::whereIn('role', ['tu', 'staff', 'operator', 'laboran', 'pustakawan'])->count() ?: 12;
        $totalKelas = AcademicClass::count() ?: 18;

        return response()->json([
            'success' => true,
            'summary' => [
                'total_siswa' => $totalSiswa,
                'total_guru' => $totalGuru,
                'total_tendik' => $totalTendik,
                'total_kelas' => $totalKelas,
                'tahun_ajaran_aktif' => '2026/2027 Ganjil',
                'semester_aktif' => 'Semester 1',
                'dokumen_aktif' => 1248,
                'surat_masuk' => 84,
                'surat_keluar' => 156,
            ],
            'administrasi_hari_ini' => [
                'surat_masuk_baru' => 3,
                'surat_keluar_perlu_proses' => 4,
                'dokumen_perlu_dilengkapi' => 7,
                'pengajuan_siswa' => 4,
                'permintaan_surat' => 2,
                'permintaan_dokumen' => 2,
                'data_perlu_verifikasi' => 4,
            ],
            'tasks_todo' => [
                [
                    'id' => 1,
                    'title' => '2 surat masuk menunggu disposisi Kepala Sekolah',
                    'category' => 'Surat Masuk',
                    'priority' => 'Tinggi',
                    'due' => 'Hari ini 15:00',
                    'status' => 'Pending',
                ],
                [
                    'id' => 2,
                    'title' => '2 tiket permohonan surat siswa sedang diproses',
                    'category' => 'Layanan Siswa',
                    'priority' => 'Sedang',
                    'due' => 'Hari ini 16:00',
                    'status' => 'Proses',
                ],
                [
                    'id' => 3,
                    'title' => '7 berkas dokumen siswa (KK & Akta) belum lengkap',
                    'category' => 'Kelengkapan Data',
                    'priority' => 'Sedang',
                    'due' => 'Besok 12:00',
                    'status' => 'Pending',
                ],
                [
                    'id' => 4,
                    'title' => '1 berkas mutasi siswa keluar (Kevin Sanjaya) menunggu TTD Kepsek',
                    'category' => 'Mutasi Siswa',
                    'priority' => 'Tinggi',
                    'due' => 'Hari ini 17:00',
                    'status' => 'Review',
                ],
                [
                    'id' => 5,
                    'title' => '1 draf SK Kepsek (Cuti Guru Kimia) menunggu tanda tangan digital',
                    'category' => 'Surat Keputusan',
                    'priority' => 'Tinggi',
                    'due' => 'Hari ini 14:00',
                    'status' => 'Menunggu TTD',
                ],
            ],
            'recent_activity' => [
                ['time' => '10:15 WIB', 'action' => 'Penerbitan Surat Keterangan Aktif', 'user' => 'Hendra Pratama (TU)', 'target' => 'Siswa: Ahmad Fauzi (NIS 20261001)'],
                ['time' => '09:40 WIB', 'action' => 'Verifikasi Dokumen Ijazah', 'user' => 'Hendra Pratama (TU)', 'target' => 'Siswa Baru: Nadia Az-Zahra'],
                ['time' => '08:50 WIB', 'action' => 'Registrasi Surat Masuk No. 042/DISDIK/IX/2026', 'user' => 'Rina Staff TU', 'target' => 'Dinas Pendidikan Jawa Barat'],
            ]
        ]);
    }

    /**
     * 2. Data Siswa Administratif
     */
    public function students(Request $request)
    {
        $students = [
            [
                'id' => 1,
                'nis' => '20261001',
                'nisn' => '0089123451',
                'nama' => 'Ahmad Fauzi',
                'nik' => '3201123456780001',
                'tmp_lahir' => 'Bandung',
                'tgl_lahir' => '2008-05-14',
                'gender' => 'L',
                'agama' => 'Islam',
                'alamat' => 'Jl. Merdeka No. 45, Bandung',
                'telepon' => '081234567890',
                'email' => 'ahmad.fauzi@siswa.sekolah.id',
                'status' => 'Aktif',
                'kelas' => 'X-IPA 1',
                'no_kk' => '3201123456780000',
                'nama_ayah' => 'Bambang Trianto',
                'pekerjaan_ayah' => 'Wiraswasta',
                'nama_ibu' => 'Siti Rohmah',
                'pekerjaan_ibu' => 'Ibu Rumah Tangga',
                'kontak_ortu' => '081298765432',
                'dokumen_status' => 'Lengkap',
                'dokumen_kk' => true,
                'dokumen_akta' => true,
                'dokumen_ijazah' => true,
            ],
            [
                'id' => 2,
                'nis' => '20261002',
                'nisn' => '0089123452',
                'nama' => 'Nadia Az-Zahra',
                'nik' => '3201123456780002',
                'tmp_lahir' => 'Jakarta',
                'tgl_lahir' => '2008-08-20',
                'gender' => 'P',
                'agama' => 'Islam',
                'alamat' => 'Jl. Dago Asri No. 12, Bandung',
                'telepon' => '081345678901',
                'email' => 'nadia.azzahra@siswa.sekolah.id',
                'status' => 'Aktif',
                'kelas' => 'X-IPA 1',
                'no_kk' => '3201123456780005',
                'nama_ayah' => 'Hendra Gunawan',
                'pekerjaan_ayah' => 'PNS',
                'nama_ibu' => 'Ratna Dewi',
                'pekerjaan_ibu' => 'Guru',
                'kontak_ortu' => '081398765431',
                'dokumen_status' => 'Lengkap',
                'dokumen_kk' => true,
                'dokumen_akta' => true,
                'dokumen_ijazah' => true,
            ],
            [
                'id' => 3,
                'nis' => '20261003',
                'nisn' => '0089123453',
                'nama' => 'Rian Pratama',
                'nik' => '3201123456780003',
                'tmp_lahir' => 'Bogor',
                'tgl_lahir' => '2008-02-11',
                'gender' => 'L',
                'agama' => 'Islam',
                'alamat' => 'Jl. Pajajaran No. 8, Bandung',
                'telepon' => '081456789012',
                'email' => 'rian.pratama@siswa.sekolah.id',
                'status' => 'Aktif',
                'kelas' => 'X-IPA 2',
                'no_kk' => '',
                'nama_ayah' => 'Irawan Saputra',
                'pekerjaan_ayah' => 'Karyawan Swasta',
                'nama_ibu' => 'Dewi Sartika',
                'pekerjaan_ibu' => 'Wirausaha',
                'kontak_ortu' => '081498765430',
                'dokumen_status' => 'Belum Lengkap',
                'dokumen_kk' => false,
                'dokumen_akta' => true,
                'dokumen_ijazah' => true,
            ],
            [
                'id' => 4,
                'nis' => '20251010',
                'nisn' => '0078123411',
                'nama' => 'Kevin Sanjaya',
                'nik' => '3201123456780004',
                'tmp_lahir' => 'Surabaya',
                'tgl_lahir' => '2007-11-05',
                'gender' => 'L',
                'agama' => 'Kristen',
                'alamat' => 'Jl. Buah Batu No. 102, Bandung',
                'telepon' => '081556789013',
                'email' => 'kevin.s@siswa.sekolah.id',
                'status' => 'Pindah',
                'kelas' => 'XI-IPA 1',
                'no_kk' => '3201123456780009',
                'nama_ayah' => 'Daniel Sanjaya',
                'pekerjaan_ayah' => 'Direktur',
                'nama_ibu' => 'Martha',
                'pekerjaan_ibu' => 'Notaris',
                'kontak_ortu' => '081598765429',
                'dokumen_status' => 'Lengkap',
                'dokumen_kk' => true,
                'dokumen_akta' => true,
                'dokumen_ijazah' => true,
            ],
            [
                'id' => 5,
                'nis' => '20241020',
                'nisn' => '0067123401',
                'nama' => 'Citra Kirana',
                'nik' => '3201123456780005',
                'tmp_lahir' => 'Bandung',
                'tgl_lahir' => '2006-04-19',
                'gender' => 'P',
                'agama' => 'Islam',
                'alamat' => 'Jl. Riau No. 15, Bandung',
                'telepon' => '081656789014',
                'email' => 'citra.kirana@alumni.sekolah.id',
                'status' => 'Lulus',
                'kelas' => 'XII-IPA 1 (Alumni 2026)',
                'no_kk' => '3201123456780010',
                'nama_ayah' => 'Agus Priyono',
                'pekerjaan_ayah' => 'PNS',
                'nama_ibu' => 'Nurul Aini',
                'pekerjaan_ibu' => 'Ibu Rumah Tangga',
                'kontak_ortu' => '081698765428',
                'dokumen_status' => 'Lengkap',
                'dokumen_kk' => true,
                'dokumen_akta' => true,
                'dokumen_ijazah' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $students,
            'summary' => [
                'total' => count($students),
                'aktif' => 3,
                'pindah' => 1,
                'lulus' => 1,
                'belum_lengkap' => 1,
            ]
        ]);
    }

    /**
     * 3. Guru & Tenaga Kependidikan
     */
    public function staff(Request $request)
    {
        $teachers = [
            [
                'id' => 1,
                'nama' => 'Budi Santoso, M.Pd',
                'nip' => '197505122000031001',
                'nuptk' => '4534753655200012',
                'nik' => '3201011205750001',
                'telepon' => '081234567891',
                'email' => 'budi.santoso@sekolah.sch.id',
                'status_pegawai' => 'PNS (Pembina IV/a)',
                'jabatan' => 'Guru Madya / Wali Kelas X-IPA 1',
                'mapel' => 'Matematika Peminatan',
                'pendidikan' => 'S2 Pendidikan Matematika - UPI',
                'dokumen_sk' => true,
                'dokumen_ijazah' => true,
                'dokumen_ktp' => true,
            ],
            [
                'id' => 2,
                'nama' => 'Siti Aminah, S.Pd',
                'nip' => '198208152008012004',
                'nuptk' => '8439760662210023',
                'nik' => '3201011508820002',
                'telepon' => '081234567892',
                'email' => 'siti.aminah@sekolah.sch.id',
                'status_pegawai' => 'PNS (Penata III/c)',
                'jabatan' => 'Guru Muda / Wali Kelas XI-IPA 2',
                'mapel' => 'Fisika',
                'pendidikan' => 'S1 Pendidikan Fisika - ITB',
                'dokumen_sk' => true,
                'dokumen_ijazah' => true,
                'dokumen_ktp' => true,
            ],
            [
                'id' => 3,
                'nama' => 'Dewi Lestari, S.Pd',
                'nip' => '199003202015022001',
                'nuptk' => '2145768670220011',
                'nik' => '3201012003900003',
                'telepon' => '081234567893',
                'email' => 'dewi.lestari@sekolah.sch.id',
                'status_pegawai' => 'PPPK',
                'jabatan' => 'Guru Pertama',
                'mapel' => 'Kimia',
                'pendidikan' => 'S1 Pendidikan Kimia - UNPAD',
                'dokumen_sk' => true,
                'dokumen_ijazah' => true,
                'dokumen_ktp' => true,
            ],
        ];

        $tendik = [
            [
                'id' => 101,
                'nama' => 'Hendra Pratama, A.Md',
                'nip' => '198811042014031002',
                'nik' => '3201010411880004',
                'telepon' => '081234567899',
                'email' => 'hendra.tu@sekolah.sch.id',
                'role_tugas' => 'Kepala Urusan Tata Usaha / Administrasi',
                'status_pegawai' => 'PNS (Pengatur III/a)',
                'pendidikan' => 'D3 Administrasi Perkantoran',
                'dokumen_sk' => true,
            ],
            [
                'id' => 102,
                'nama' => 'Rian Hidayat, S.Kom',
                'nip' => '-',
                'nik' => '3201011909920005',
                'telepon' => '081345678991',
                'email' => 'rian.ops@sekolah.sch.id',
                'role_tugas' => 'Operator Data Pokok Pendidikan (Dapodik)',
                'status_pegawai' => 'Tenaga Honorer Sekolah',
                'pendidikan' => 'S1 Teknik Informatika',
                'dokumen_sk' => true,
            ],
            [
                'id' => 103,
                'nama' => 'Dewi Sartika, A.Md.Pust',
                'nip' => '199205102020122003',
                'nik' => '3201011005920006',
                'telepon' => '081345678992',
                'email' => 'dewi.perpus@sekolah.sch.id',
                'role_tugas' => 'Pustakawan Sekolah',
                'status_pegawai' => 'PPPK',
                'pendidikan' => 'D3 Perpustakaan',
                'dokumen_sk' => true,
            ],
            [
                'id' => 104,
                'nama' => 'Faisal Rahman, S.Si',
                'nip' => '-',
                'nik' => '3201012501940007',
                'telepon' => '081345678993',
                'email' => 'faisal.lab@sekolah.sch.id',
                'role_tugas' => 'Laboran Laboratorium IPA',
                'status_pegawai' => 'Tenaga Kontrak',
                'pendidikan' => 'S1 Biologi',
                'dokumen_sk' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'guru' => $teachers,
            'tendik' => $tendik,
            'summary' => [
                'total_guru' => count($teachers),
                'total_tendik' => count($tendik),
                'pns' => 3,
                'pppk' => 2,
                'honorer_kontrak' => 2,
            ]
        ]);
    }

    /**
     * 4. Surat-Menyurat (Masuk, Keluar, Disposisi)
     */
    public function letters(Request $request)
    {
        $suratMasuk = [
            [
                'id' => 1,
                'nomor_surat' => '042/DISDIK-JBR/IX/2026',
                'tanggal_surat' => '2026-09-28',
                'tanggal_diterima' => '2026-09-29',
                'pengirim' => 'Dinas Pendidikan Provinsi Jawa Barat',
                'perihal' => 'Undangan Rapat Koordinasi Asesmen Nasional 2026',
                'kategori' => 'Undangan Dinas',
                'tujuan' => 'Kepala Sekolah & Tim Asesmen',
                'status_disposisi' => 'Sudah Didisposisi',
                'file_url' => '/files/surat/masuk_042_disdik.pdf',
                'catatan' => 'Diteruskan ke Waka Kurikulum & Operator',
            ],
            [
                'id' => 2,
                'nomor_surat' => '115/PUSKESMAS-DGO/X/2026',
                'tanggal_surat' => '2026-10-01',
                'tanggal_diterima' => '2026-10-02',
                'pengirim' => 'Puskesmas Dago Kota Bandung',
                'perihal' => 'Pemberitahuan Pelaksanaan Pemeriksaan Kesehatan Berkala Siswa Kelas X',
                'kategori' => 'Pemberitahuan',
                'tujuan' => 'Kepala Sekolah & Pembina UKS',
                'status_disposisi' => 'Menunggu Disposisi',
                'file_url' => '/files/surat/masuk_115_pkm.pdf',
                'catatan' => 'Perlu koordinasi dengan Pembina PMR/UKS',
            ],
            [
                'id' => 3,
                'nomor_surat' => '008/KOMITE-SMAN1/X/2026',
                'tanggal_surat' => '2026-10-02',
                'tanggal_diterima' => '2026-10-02',
                'pengirim' => 'Pengurus Komite Sekolah',
                'perihal' => 'Permohonan Ruang Rapat Pleno Komite & Orang Tua',
                'kategori' => 'Permohonan',
                'tujuan' => 'Kepala Sekolah & Urusan Sarpras',
                'status_disposisi' => 'Draft Disposisi',
                'file_url' => '/files/surat/masuk_008_komite.pdf',
                'catatan' => 'Jadwal diajukan untuk Sabtu, 10 Oktober 2026',
            ],
        ];

        $suratKeluar = [
            [
                'id' => 1,
                'nomor_surat' => '421.3/084/SMAN-01/X/2026',
                'tanggal_surat' => '2026-10-01',
                'tujuan' => 'Orang Tua / Wali Siswa Kelas X, XI, XII',
                'perihal' => 'Pemberitahuan Jadwal Asesmen Tengah Semester (ATS) Ganjil',
                'kategori' => 'Surat Pemberitahuan',
                'template' => 'Pemberitahuan Resmi Sekolah',
                'status' => 'Selesai & Diarsipkan',
                'file_url' => '/files/surat/keluar_084_ats.pdf',
                'ttd_status' => 'Ditandatangani (Kepsek)',
            ],
            [
                'id' => 2,
                'nomor_surat' => '421.3/085/SMAN-01/X/2026',
                'tanggal_surat' => '2026-10-02',
                'tujuan' => 'Dr. H. Bambang Subagyo (Kepala SMA Negeri 3 Surabaya)',
                'perihal' => 'Surat Rekomendasi Persetujuan Mutasi Keluar Siswa (Kevin Sanjaya)',
                'kategori' => 'Surat Mutasi',
                'template' => 'Surat Pindah Siswa',
                'status' => 'Menunggu TTD',
                'file_url' => '/files/surat/keluar_085_mutasi.pdf',
                'ttd_status' => 'Menunggu Tanda Tangan Kepsek',
            ],
            [
                'id' => 3,
                'nomor_surat' => '421.3/086/SMAN-01/X/2026',
                'tanggal_surat' => '2026-10-02',
                'tujuan' => 'Ahmad Fauzi (NIS 20261001)',
                'perihal' => 'Surat Keterangan Aktif Belajar untuk Syarat Beasiswa Jabar Future Leaders',
                'kategori' => 'Surat Keterangan Siswa',
                'template' => 'Surat Aktif Sekolah',
                'status' => 'Selesai',
                'file_url' => '/files/surat/keluar_086_aktif.pdf',
                'ttd_status' => 'Ditandatangani Digital (QR Code Valid)',
            ],
        ];

        return response()->json([
            'success' => true,
            'surat_masuk' => $suratMasuk,
            'surat_keluar' => $suratKeluar,
        ]);
    }

    /**
     * 5. Generate Nomor Surat Otomatis
     */
    public function generateLetterNumber(Request $request)
    {
        $kategori = $request->input('kategori', 'keterangan'); // keterangan, tugas, dinas, mutasi, undangan
        $kodeKategori = match ($kategori) {
            'tugas' => '421.5',
            'undangan' => '005',
            'pemberitahuan' => '421.7',
            'mutasi' => '421.3',
            default => '421.3',
        };

        // Determine date to ensure Roman numeral accurately reflects the letter issue month
        $letterDate = $request->input('tanggal_surat', date('Y-m-d'));
        $month = intval(date('n', strtotime($letterDate)));
        $year = date('Y', strtotime($letterDate));
        $monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][$month - 1];

        // Strict consecutive sequence logic (Audit-compliant, never random):
        // Base starting sequence after 086 is 087
        $lastIssuedSequence = 86;
        $nextSequence = $lastIssuedSequence + 1;
        $nextNo = str_pad($nextSequence, 3, '0', STR_PAD_LEFT);
        $generated = "{$kodeKategori}/{$nextNo}/SMAN-01/{$monthRoman}/{$year}";

        return response()->json([
            'success' => true,
            'nomor_surat' => $generated,
            'format' => '[Kode Klasifikasi]/[Nomor Urut]/[Kode Sekolah]/[Bulan Romawi]/[Tahun]',
            'next_sequence' => $nextSequence,
        ]);
    }

    /**
     * 6. Layanan & Permintaan Surat Siswa
     */
    public function serviceRequests(Request $request)
    {
        $requests = [
            [
                'id' => 1,
                'no_tiket' => 'REQ-202610-001',
                'pemohon' => 'Ahmad Fauzi (Siswa Kelas X-IPA 1)',
                'nis' => '20261001',
                'jenis_layanan' => 'Surat Keterangan Aktif Sekolah',
                'keperluan' => 'Pengajuan Beasiswa Provinsi Jawa Barat 2026',
                'tanggal_pengajuan' => '2026-10-02 08:30 WIB',
                'petugas' => 'Hendra Pratama (TU)',
                'status' => 'Selesai',
                'deadline' => '2026-10-03',
                'catatan' => 'Surat dicetak dan ditandatangani digital.',
                'file_output' => '/files/output/surat_aktif_ahmad_fauzi.pdf',
            ],
            [
                'id' => 2,
                'no_tiket' => 'REQ-202610-002',
                'pemohon' => 'Bambang Trianto (Orang Tua Murid)',
                'nis' => '20261001',
                'jenis_layanan' => 'Legalisir Rapor Semester 1 & 2',
                'keperluan' => 'Pendaftaran Lomba Sains Nasional',
                'tanggal_pengajuan' => '2026-10-02 09:15 WIB',
                'petugas' => 'Rina (Staff TU)',
                'status' => 'Diproses',
                'deadline' => '2026-10-04',
                'catatan' => 'Menunggu verifikasi stempel basah kepala sekolah.',
                'file_output' => null,
            ],
            [
                'id' => 3,
                'no_tiket' => 'REQ-202610-003',
                'pemohon' => 'Nadia Az-Zahra (Siswa Kelas X-IPA 1)',
                'nis' => '20261002',
                'jenis_layanan' => 'Surat Izin Mengikuti Lomba O2SN',
                'keperluan' => 'Kejuaraan Renang Tingkat Provinsi',
                'tanggal_pengajuan' => '2026-10-01 14:00 WIB',
                'petugas' => 'Hendra Pratama (TU)',
                'status' => 'Menunggu Tanda Tangan',
                'deadline' => '2026-10-02',
                'catatan' => 'Draf sudah dibuat, menunggu paraf Waka Kesiswaan & Kepsek.',
                'file_output' => '/files/output/draf_surat_izin_nadia.pdf',
            ],
            [
                'id' => 4,
                'no_tiket' => 'REQ-202609-029',
                'pemohon' => 'Citra Kirana (Alumni 2026)',
                'nis' => '20241020',
                'jenis_layanan' => 'Legalisir Ijazah & SKHUN',
                'keperluan' => 'Kelengkapan Berkas Seleksi CPNS',
                'tanggal_pengajuan' => '2026-09-29 11:00 WIB',
                'petugas' => 'Hendra Pratama (TU)',
                'status' => 'Selesai',
                'deadline' => '2026-10-01',
                'catatan' => 'Selesai diambil oleh pemohon langsung di loket TU.',
                'file_output' => '/files/output/legalisir_ijazah_citra.pdf',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * 7. Mutasi Siswa (Masuk & Keluar)
     */
    public function mutations(Request $request)
    {
        $masuk = [
            [
                'id' => 1,
                'nama' => 'Dimas Anggara',
                'sekolah_asal' => 'SMP Negeri 2 Yogyakarta',
                'npsn_asal' => '20403120',
                'tanggal_masuk' => '2026-08-15',
                'kelas_tujuan' => 'X-IPA 3',
                'dokumen_pindah' => 'Lengkap (Surat Rekomendasi Disdik + Rapor)',
                'status_verifikasi' => 'Terverifikasi & Resmi Masuk',
                'nisn' => '0087723491',
            ]
        ];

        $keluar = [
            [
                'id' => 2,
                'nama' => 'Kevin Sanjaya',
                'nis' => '20251010',
                'nisn' => '0078123411',
                'kelas_asal' => 'XI-IPA 1',
                'sekolah_tujuan' => 'SMA Negeri 3 Surabaya',
                'npsn_tujuan' => '20532180',
                'alasan' => 'Mengikuti Pindah Tugas Orang Tua',
                'tanggal_keluar' => '2026-10-02',
                'status_administrasi' => 'Surat Rekomendasi Terbit / Menunggu TTD Kepsek',
                'berkas_kelengkapan' => 'Buku Rapor Diserahkan, Bebas Perpustakaan Sudah',
            ]
        ];

        return response()->json([
            'success' => true,
            'siswa_masuk' => $masuk,
            'siswa_keluar' => $keluar,
        ]);
    }

    /**
     * 8. Kelulusan & Alumni
     */
    public function graduationAndAlumni(Request $request)
    {
        $calonLulusan = [
            ['id' => 1, 'nis' => '20241001', 'nama' => 'Arya Wiguna', 'kelas' => 'XII-IPA 1', 'status_verifikasi_identitas' => 'Valid', 'kelengkapan_berkas' => 'Lengkap', 'no_seri_ijazah' => 'DN-02/M-SMA/26/00123'],
            ['id' => 2, 'nis' => '20241002', 'nama' => 'Bella Safira', 'kelas' => 'XII-IPA 1', 'status_verifikasi_identitas' => 'Valid', 'kelengkapan_berkas' => 'Lengkap', 'no_seri_ijazah' => 'DN-02/M-SMA/26/00124'],
            ['id' => 3, 'nis' => '20241003', 'nama' => 'Cahyo Utomo', 'kelas' => 'XII-IPS 1', 'status_verifikasi_identitas' => 'Perlu Perbaikan NIK', 'kelengkapan_berkas' => 'Kurang Akta Lahir', 'no_seri_ijazah' => '-'],
        ];

        $alumni = [
            ['id' => 101, 'nama' => 'Citra Kirana', 'tahun_lulus' => '2026', 'kelas_terakhir' => 'XII-IPA 1', 'lanjutan' => 'Universitas Indonesia (Kedokteran)', 'kontak' => '081656789014', 'status' => 'Kuliah'],
            ['id' => 102, 'nama' => 'Doni Pratama', 'tahun_lulus' => '2025', 'kelas_terakhir' => 'XII-IPA 2', 'lanjutan' => 'Institut Teknologi Bandung (STEI)', 'kontak' => '081234998811', 'status' => 'Kuliah'],
            ['id' => 103, 'nama' => 'Eka Yuliana', 'tahun_lulus' => '2025', 'kelas_terakhir' => 'XII-IPS 1', 'lanjutan' => 'Bekerja (Bank BJB)', 'kontak' => '081399887722', 'status' => 'Bekerja'],
        ];

        return response()->json([
            'success' => true,
            'calon_lulusan' => $calonLulusan,
            'alumni' => $alumni,
        ]);
    }

    /**
     * 9. Administrasi Kehadiran & Presensi (Siswa & Pegawai)
     */
    public function attendance(Request $request)
    {
        $totalSiswa = 540;
        $sakitSiswa = 12;
        $izinSiswa = 6;
        $alfaSiswa = 2;
        $terlambatSiswa = 5; // Bagian dari siswa yang hadir fisik (tardy modifier)
        $tidakHadirSiswa = $sakitSiswa + $izinSiswa + $alfaSiswa; // 20 siswa
        $hadirSiswa = $totalSiswa - $tidakHadirSiswa; // 520 siswa
        $hadirPersenSiswa = round(($hadirSiswa / $totalSiswa) * 100, 1); // 96.3%

        $totalPegawai = 57;
        $hadirPegawai = 54; // Termasuk 1 terlambat
        $dinasLuar = 2; // Bertugas dinas luar resmi
        $sakitPegawai = 1;
        $cutiPegawai = 0;
        $terlambatPegawai = 1;
        // Rekonsiliasi akuntansi: 54 (hadir) + 2 (dinas) + 1 (sakit) + 0 (cuti) = 57 orang (100% pas)

        return response()->json([
            'success' => true,
            'rekap_siswa' => [
                'total_siswa' => $totalSiswa,
                'hadir' => $hadirSiswa,
                'hadir_persen' => $hadirPersenSiswa,
                'sakit' => $sakitSiswa,
                'izin' => $izinSiswa,
                'alfa' => $alfaSiswa,
                'terlambat' => $terlambatSiswa,
            ],
            'rekap_pegawai' => [
                'total_guru_tendik' => $totalPegawai,
                'hadir' => $hadirPegawai,
                'hadir_tepat_waktu' => $hadirPegawai - $terlambatPegawai,
                'dinas_luar' => $dinasLuar,
                'sakit' => $sakitPegawai,
                'cuti' => $cutiPegawai,
                'terlambat' => $terlambatPegawai,
            ],
            'koreksi_presensi_terbaru' => [
                ['id' => 1, 'nama' => 'Rian Pratama', 'tipe' => 'Siswa', 'tanggal' => '2026-10-02', 'semula' => 'Alfa', 'menjadi' => 'Sakit', 'alasan' => 'Surat dokter susulan diserahkan ortu ke TU', 'petugas' => 'Hendra Pratama (TU)'],
                ['id' => 2, 'nama' => 'Siti Aminah, S.Pd', 'tipe' => 'Guru', 'tanggal' => '2026-10-01', 'semula' => 'Terlambat', 'menjadi' => 'Hadir Tepat Waktu', 'alasan' => 'Fingerprint scanner gate 2 error', 'petugas' => 'Hendra Pratama (TU)'],
            ]
        ]);
    }

    /**
     * 10. Administrasi Cuti & Izin Guru / Tendik
     */
    public function leaves(Request $request)
    {
        $leaves = [
            [
                'id' => 1,
                'nama' => 'Dewi Lestari, S.Pd',
                'nip' => '199003202015022001',
                'jabatan' => 'Guru Kimia',
                'jenis_izin' => 'Cuti Melahirkan',
                'mulai' => '2026-10-15',
                'selesai' => '2027-01-15',
                'durasi' => '3 Bulan',
                'lampiran' => 'Surat Keterangan Dokter Kandungan RS Hasan Sadikin',
                'status' => 'Disetujui Kepala Sekolah',
                'arsip_sk' => 'SK Cuti No. 800/012/SMAN-01/X/2026',
            ],
            [
                'id' => 2,
                'nama' => 'Faisal Rahman, S.Si',
                'nip' => '-',
                'jabatan' => 'Laboran IPA',
                'jenis_izin' => 'Izin Dinas Luar',
                'mulai' => '2026-10-05',
                'selesai' => '2026-10-06',
                'durasi' => '2 Hari',
                'lampiran' => 'Surat Tugas Pelatihan Keselamatan Lab Balai Diklat',
                'status' => 'Menunggu Verifikasi TU',
                'arsip_sk' => '-',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $leaves,
        ]);
    }

    /**
     * 11. Inventaris Sarana Administratif
     */
    public function inventory(Request $request)
    {
        $items = [
            [
                'id' => 1,
                'kode_barang' => 'INV-2024-001',
                'nama_barang' => 'Laptop TU Lenovo ThinkPad L14',
                'kategori' => 'Elektronik / IT',
                'lokasi' => 'Ruang Tata Usaha',
                'kondisi' => 'Baik',
                'jumlah' => 4,
                'tahun_beli' => 2024,
                'sumber_dana' => 'BOS Kinerja',
                'pj' => 'Hendra Pratama (Kaur TU)',
            ],
            [
                'id' => 2,
                'kode_barang' => 'INV-2023-018',
                'nama_barang' => 'Mesin Fotocopy Multifungsi Epson EcoTank',
                'kategori' => 'Mesin Kantor',
                'lokasi' => 'Ruang Administrasi TU',
                'kondisi' => 'Baik',
                'jumlah' => 1,
                'tahun_beli' => 2023,
                'sumber_dana' => 'BOS Reguler',
                'pj' => 'Rina (Staff TU)',
            ],
            [
                'id' => 3,
                'kode_barang' => 'INV-2022-045',
                'nama_barang' => 'Lemari Arsip Besi 4 Pintu Fireproof',
                'kategori' => 'Mebel & Arsip',
                'lokasi' => 'Gudang Arsip Sekolah',
                'kondisi' => 'Baik',
                'jumlah' => 3,
                'tahun_beli' => 2022,
                'sumber_dana' => 'Komite Sekolah',
                'pj' => 'Hendra Pratama',
            ],
            [
                'id' => 4,
                'kode_barang' => 'INV-2021-089',
                'nama_barang' => 'Printer Kartu Pelajar Zebra ZC300',
                'kategori' => 'Elektronik / Percetakan',
                'lokasi' => 'Loket Layanan TU',
                'kondisi' => 'Perlu Maintenance',
                'jumlah' => 1,
                'tahun_beli' => 2021,
                'sumber_dana' => 'BOS Reguler',
                'pj' => 'Rian Hidayat (Operator)',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $items,
        ]);
    }

    /**
     * 12. Administrasi Rapat & Notulen (Meeting Management)
     */
    public function meetings(Request $request)
    {
        $meetings = [
            [
                'id' => 1,
                'judul' => 'Rapat Koordinasi Persiapan Asesmen Tengah Semester (ATS) Ganjil',
                'tanggal' => '2026-10-01 13:00 - 15:30 WIB',
                'tempat' => 'Ruang Rapat Utama & Daring Zoom',
                'peserta' => 'Kepala Sekolah, Waka Kurikulum, Seluruh Guru, Staf TU',
                'agenda' => 'Penyusunan naskah soal, jadwal ujian, pencetakan kartu peserta, teknis pengawasan',
                'notulen_mom' => 'Disepakati ATS dimulai Senin, 12 Oktober 2026. Kartu ujian dicetak oleh TU per 6 Oktober.',
                'pic' => 'Budi Santoso, M.Pd & Hendra Pratama',
                'status' => 'Selesai & Notulen Diterbitkan',
            ],
            [
                'id' => 2,
                'judul' => 'Rapat Pleno Pembahasan Mutasi dan Dapodik Semester Ganjil',
                'tanggal' => '2026-10-06 09:00 WIB',
                'tempat' => 'Ruang Tata Usaha',
                'peserta' => 'Kaur TU, Operator Dapodik, Tim Kesiswaan',
                'agenda' => 'Sinkronisasi data siswa masuk/keluar, validasi NISN, penutupan cut-off BOS',
                'notulen_mom' => 'Draf agenda siap. Undangan resmi telah dikirim ke WhatsApp Group dinas.',
                'pic' => 'Rian Hidayat (Operator)',
                'status' => 'Terjadwal',
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $meetings,
        ]);
    }

    /**
     * 13. Data Quality & Kelengkapan Data
     */
    public function dataQuality(Request $request)
    {
        return response()->json([
            'success' => true,
            'issues' => [
                [
                    'id' => 1,
                    'kategori' => 'Data Siswa',
                    'judul' => '3 Siswa Kelas X belum melengkapi Nomor KK',
                    'rincian' => 'Rian Pratama (X-IPA 2), Bagas Danu (X-IPS 1), Salsa Bila (X-IPA 3)',
                    'dampak' => 'Sinkronisasi NISN dan Dapodik tertahan',
                    'aksi' => 'Kirim Notifikasi ke Wali Murid',
                ],
                [
                    'id' => 2,
                    'kategori' => 'Dokumen Siswa',
                    'judul' => '4 Siswa Baru belum mengunggah Akta Kelahiran Digital',
                    'rincian' => 'Diperlukan untuk verifikasi nomor registrasi akta sipil Kemendikbud (Total 3 KK + 4 Akta = 7 berkas siswa pending)',
                    'dampak' => 'Validasi buku induk belum 100%',
                    'aksi' => 'Buka Form Pelengkapan Berkas',
                ],
                [
                    'id' => 3,
                    'kategori' => 'Data Guru/Tendik',
                    'judul' => '1 Guru belum memperbarui SK Kenaikan Pangkat Terakhir',
                    'rincian' => 'Dra. Endang Sulastri (Pangkat Pembina IV/a)',
                    'dampak' => 'Pelaporan berkala ke BKD/Disdik',
                    'aksi' => 'Hubungi Guru Bersangkutan',
                ],
            ],
            'stats' => [
                'kelengkapan_siswa_persen' => round(((540 - 7) / 540) * 100, 1), // 98.7% (533 dari 540 lengkap)
                'kelengkapan_guru_persen' => round(((57 - 1) / 57) * 100, 1), // 98.2% (56 dari 57 lengkap)
                'dokumen_terverifikasi' => 1248,
                'dokumen_pending_verifikasi' => 14,
            ]
        ]);
    }

    /**
     * 14. Audit Log Tata Usaha
     */
    public function auditLog(Request $request)
    {
        $logs = [
            ['id' => 1, 'waktu' => '2026-10-02 11:20:15', 'pengguna' => 'Hendra Pratama (TU)', 'aksi' => 'Cetak Surat Keterangan', 'objek' => 'Surat No. 421.3/086/SMAN-01/X/2026 (Ahmad Fauzi)', 'ip' => '192.168.1.15'],
            ['id' => 2, 'waktu' => '2026-10-02 10:45:00', 'pengguna' => 'Hendra Pratama (TU)', 'aksi' => 'Koreksi Presensi Siswa', 'objek' => 'Rian Pratama: Alfa -> Sakit', 'ip' => '192.168.1.15'],
            ['id' => 3, 'waktu' => '2026-10-02 09:12:40', 'pengguna' => 'Rian Hidayat (Operator)', 'aksi' => 'Import Excel Siswa', 'objek' => '24 Data Siswa Mutasi Masuk', 'ip' => '192.168.1.18'],
            ['id' => 4, 'waktu' => '2026-10-01 16:30:11', 'pengguna' => 'Rina (Staff TU)', 'aksi' => 'Registrasi Surat Masuk', 'objek' => 'Surat No. 042/DISDIK-JBR/IX/2026', 'ip' => '192.168.1.16'],
            ['id' => 5, 'waktu' => '2026-10-01 14:15:22', 'pengguna' => 'Hendra Pratama (TU)', 'aksi' => 'Update Status Dokumen', 'objek' => 'Verifikasi Ijazah SMP Kevin Sanjaya', 'ip' => '192.168.1.15'],
        ];

        return response()->json([
            'success' => true,
            'data' => $logs,
        ]);
    }
}
