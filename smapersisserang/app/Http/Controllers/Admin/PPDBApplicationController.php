<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentApplication;
use App\Models\ApplicationStatusHistory;
use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\StudentRequirementFile;
use Barryvdh\DomPDF\Facade\Pdf;

class PPDBApplicationController extends Controller
{
    public function dashboard()
    {
        $currentYear = AdmissionYear::where('is_current', true)->first();

        $statuses = [
            'baru_daftar' => 'Baru Daftar',
            'menunggu_verifikasi' => 'Menunggu Verifikasi',
            'data_kurang' => 'Data Kurang',
            'terverifikasi' => 'Terverifikasi',
            'wawancara' => 'Wawancara',
            'lulus' => 'Lulus',
            'cadangan' => 'Cadangan',
            'tidak_lulus' => 'Tidak Lulus',
            'diterima' => 'Diterima',
            'mengundurkan_diri' => 'Mengundurkan Diri',
        ];

        $countByStatus = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
            ->selectRaw("status, count(*) as total")
            ->groupBy('status')
            ->pluck('total', 'status');

        $quota = $currentYear?->quota ?? 0;
        $terisi = $countByStatus->get('diterima', 0);
        $sisa = max(0, $quota - $terisi);

        $recentApplications = StudentApplication::with(['admissionYear', 'admissionProgram'])
            ->when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
            ->orderByDesc('created_at')
            ->take(5)
            ->get();

        $followUpCounts = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
            ->selectRaw("follow_up_status, count(*) as total")
            ->whereNotNull('follow_up_status')
            ->groupBy('follow_up_status')
            ->pluck('total', 'follow_up_status');

        $followUpSummary = [
            'belum_dihubungi' => $followUpCounts->get('belum_dihubungi', 0),
            'sudah_dihubungi' => $followUpCounts->get('sudah_dihubungi', 0),
            'perlu_dilengkapi' => $followUpCounts->get('perlu_dilengkapi', 0),
            'siap_wawancara' => $followUpCounts->get('siap_wawancara', 0),
        ];

        return view('admin.ppdb.dashboard', compact(
            'currentYear',
            'statuses',
            'countByStatus',
            'quota',
            'terisi',
            'sisa',
            'recentApplications',
            'followUpSummary'
        ));
    }

    public function index(Request $request)
    {
        $query = StudentApplication::with(['admissionYear', 'admissionProgram', 'verifier'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('admission_year_id')) {
            $query->where('admission_year_id', $request->admission_year_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('student_name', 'like', "%{$search}%")
                    ->orWhere('parent_whatsapp', 'like', "%{$search}%");
            });
        }

        if ($request->filled('follow_up_status')) {
            $query->where('follow_up_status', $request->follow_up_status);
        }

        $applications = $query->paginate(20)->withQueryString();
        $admissionYears = AdmissionYear::orderByDesc('academic_year')->get();

        $statuses = [
            'baru_daftar' => 'Baru Daftar',
            'menunggu_verifikasi' => 'Menunggu Verifikasi',
            'data_kurang' => 'Data Kurang',
            'terverifikasi' => 'Terverifikasi',
            'wawancara' => 'Wawancara',
            'lulus' => 'Lulus',
            'cadangan' => 'Cadangan',
            'tidak_lulus' => 'Tidak Lulus',
            'diterima' => 'Diterima',
            'mengundurkan_diri' => 'Mengundurkan Diri',
        ];

        $followUpStatuses = [
            'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
            'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
            'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
        ];

        return view('admin.ppdb.applications.index', compact(
            'applications',
            'admissionYears',
            'statuses',
            'followUpStatuses'
        ));
    }

    public function export(Request $request)
    {
        $query = StudentApplication::with(['admissionYear', 'admissionProgram', 'followUpBy'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('admission_year_id')) {
            $query->where('admission_year_id', $request->admission_year_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('student_name', 'like', "%{$search}%")
                    ->orWhere('parent_whatsapp', 'like', "%{$search}%");
            });
        }

        $applications = $query->get();

        $statusLabels = [
            'baru_daftar' => 'Baru Daftar', 'menunggu_verifikasi' => 'Menunggu Verifikasi',
            'data_kurang' => 'Data Kurang', 'terverifikasi' => 'Terverifikasi',
            'wawancara' => 'Wawancara', 'lulus' => 'Lulus',
            'cadangan' => 'Cadangan', 'tidak_lulus' => 'Tidak Lulus',
            'diterima' => 'Diterima', 'mengundurkan_diri' => 'Mengundurkan Diri',
        ];

        $filename = 'pendaftar-ppdb-' . now()->format('Ymd-Hi') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ];

        $followUpLabels = [
            'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
            'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
            'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
        ];

        $callback = function () use ($applications, $statusLabels, $followUpLabels) {
            $handle = fopen('php://output', 'w');

            // BOM for Excel UTF-8 support
            fwrite($handle, "\xEF\xBB\xBF");

            $headerRow = [
                'No', 'Nomor Pendaftaran', 'Nama Siswa', 'Jenis Kelamin',
                'Tempat Lahir', 'Tanggal Lahir', 'Asal Sekolah', 'Alamat',
                'Nama Ayah', 'Nama Ibu', 'WhatsApp Orang Tua', 'Pekerjaan Orang Tua',
                'Siap Asrama', 'Kemampuan Baca Al-Qur\'an', 'Riwayat Kesehatan',
                'Motivasi', 'Tahun Ajaran', 'Program', 'Status', 'Tanggal Daftar',
                'Status Follow-up', 'Catatan Follow-up', 'Tanggal Follow-up', 'Petugas Follow-up',
            ];
            fputcsv($handle, $headerRow);

            foreach ($applications as $i => $app) {
                $row = [
                    $i + 1,
                    $app->registration_number,
                    $app->student_name,
                    $app->gender === 'laki_laki' ? 'Laki-laki' : 'Perempuan',
                    $app->birth_place,
                    $app->birth_date?->format('d/m/Y'),
                    $app->previous_school,
                    $app->address,
                    $app->father_name,
                    $app->mother_name,
                    $app->parent_whatsapp,
                    $app->parent_job ?? '',
                    $app->boarding_ready ? 'Ya' : 'Tidak',
                    $app->quran_reading_ability,
                    $app->health_notes ?? '',
                    $app->motivation,
                    $app->admissionYear?->academic_year ?? '',
                    $app->admissionProgram?->name ?? '',
                    $statusLabels[$app->status] ?? $app->status,
                    $app->submitted_at?->format('d/m/Y H:i') ?? '',
                    $followUpLabels[$app->follow_up_status] ?? $app->follow_up_status ?? '',
                    $app->follow_up_notes ?? '',
                    $app->follow_up_at?->format('d/m/Y H:i') ?? '',
                    $app->followUpBy?->name ?? '',
                ];
                fputcsv($handle, $row);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $query = StudentApplication::with(['admissionYear', 'admissionProgram', 'followUpBy'])
            ->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('admission_year_id')) {
            $query->where('admission_year_id', $request->admission_year_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('registration_number', 'like', "%{$search}%")
                    ->orWhere('student_name', 'like', "%{$search}%")
                    ->orWhere('parent_whatsapp', 'like', "%{$search}%");
            });
        }

        $applications = $query->get();

        $currentYear = AdmissionYear::where('is_current', true)->first();

        $statusLabels = [
            'baru_daftar' => 'Baru Daftar', 'menunggu_verifikasi' => 'Menunggu Verifikasi',
            'data_kurang' => 'Data Kurang', 'terverifikasi' => 'Terverifikasi',
            'wawancara' => 'Wawancara', 'lulus' => 'Lulus',
            'cadangan' => 'Cadangan', 'tidak_lulus' => 'Tidak Lulus',
            'diterima' => 'Diterima', 'mengundurkan_diri' => 'Mengundurkan Diri',
        ];

        $filterInfo = [];
        if ($request->filled('status')) {
            $filterInfo[] = 'Status: ' . ($statusLabels[$request->status] ?? $request->status);
        }
        if ($request->filled('search')) {
            $filterInfo[] = 'Carian: ' . $request->search;
        }

        $followUpLabels = [
            'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
            'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
            'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
        ];

        $pdf = Pdf::loadView('admin.ppdb.applications.pdf', compact(
            'applications', 'currentYear', 'statusLabels', 'filterInfo', 'followUpLabels'
        ));

        $pdf->setPaper('a4', 'landscape');

        return $pdf->download('daftar-pendaftar-ppdb-' . now()->format('Ymd-Hi') . '.pdf');
    }

    public function show(StudentApplication $studentApplication)
    {
        $studentApplication->load(['admissionYear', 'admissionProgram', 'verifier', 'statusHistories.changedBy', 'followUpBy', 'requirementFiles']);

        return view('admin.ppdb.applications.show', compact('studentApplication'));
    }

    public function print(StudentApplication $studentApplication)
    {
        return view('admin.ppdb.applications.print', compact('studentApplication'));
    }

    public function downloadRequirements(StudentApplication $studentApplication)
    {
        $studentApplication->load('requirementFiles');

        if ($studentApplication->requirementFiles->isEmpty()) {
            return back()->with('error', 'Belum ada dokumen persyaratan yang diunggah oleh calon siswa.');
        }

        $zipFileName = 'berkas-spmb-' . Str::slug($studentApplication->student_name) . '-' . $studentApplication->registration_number . '.zip';
        $tempDir = storage_path('app/temp');

        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $zipPath = $tempDir . '/' . $zipFileName;

        if (!class_exists('ZipArchive')) {
            return back()->with('error', 'Fitur ZIP belum aktif di server. Aktifkan PHP ZipArchive terlebih dahulu.');
        }

        $zip = new \ZipArchive();

        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'Gagal membuat file ZIP.');
        }

        $allKeys = array_keys(StudentRequirementFile::$requirements);

        foreach ($allKeys as $index => $key) {
            $file = $studentApplication->requirementFiles->firstWhere('requirement_key', $key);
            if (!$file || !$file->file_path) {
                continue;
            }

            $fullPath = Storage::disk('public')->path($file->file_path);
            if (!file_exists($fullPath)) {
                continue;
            }

            $ext = $file->fileExtension();
            $safeName = StudentRequirementFile::safeDownloadName($key, $index) . '.' . $ext;
            $zip->addFile($fullPath, $safeName);
        }

        $legacyFiles = $studentApplication->requirementFiles->whereIn('requirement_key', array_keys(StudentRequirementFile::$legacyRequirements));
        foreach ($legacyFiles as $file) {
            if (!$file->file_path) continue;
            $fullPath = Storage::disk('public')->path($file->file_path);
            if (!file_exists($fullPath)) continue;
            $ext = $file->fileExtension();
            $zip->addFile($fullPath, '00-' . $file->requirement_key . '.' . $ext);
        }

        $zip->close();

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }

    public function updateStatus(Request $request, StudentApplication $studentApplication)
    {
        $validStatuses = [
            'baru_daftar',
            'menunggu_verifikasi',
            'data_kurang',
            'terverifikasi',
            'wawancara',
            'lulus',
            'cadangan',
            'tidak_lulus',
            'diterima',
            'mengundurkan_diri',
        ];

        $validated = $request->validate([
            'status' => ['required', 'in:' . implode(',', $validStatuses)],
            'notes' => 'nullable|string',
        ]);

        $fromStatus = $studentApplication->status;
        $toStatus = $validated['status'];

        if ($fromStatus === $toStatus) {
            return back()->with('error', 'Status sudah sama, tidak ada perubahan.');
        }

        DB::transaction(function () use ($studentApplication, $fromStatus, $toStatus, $validated) {
            $updateData = ['status' => $toStatus, 'admin_notes' => $validated['notes'] ?? null];

            if ($toStatus === 'terverifikasi' && !$studentApplication->verified_at) {
                $updateData['verified_by'] = auth()->id();
                $updateData['verified_at'] = now();
            }

            if ($toStatus === 'data_kurang') {
                $updateData['is_final_submitted'] = false;
                $updateData['status_data'] = 'perlu_perbaikan';
            }

            $studentApplication->update($updateData);

            ApplicationStatusHistory::create([
                'student_application_id' => $studentApplication->id,
                'from_status' => $fromStatus,
                'to_status' => $toStatus,
                'changed_by' => auth()->id(),
                'notes' => $validated['notes'] ?? null,
            ]);

            if ($toStatus === 'diterima') {
                // Single Source of Truth: ensure student exists in users table with lifecycle_status = 'aktif'
                if ($studentApplication->user_id) {
                    \App\Models\User::where('id', $studentApplication->user_id)->update([
                        'lifecycle_status' => 'aktif',
                        'role' => 'murid',
                    ]);
                }
            } elseif ($toStatus === 'tidak_lulus' || $toStatus === 'mengundurkan_diri') {
                if ($studentApplication->user_id) {
                    \App\Models\User::where('id', $studentApplication->user_id)->update([
                        'lifecycle_status' => 'nonaktif',
                    ]);
                }
            }
        });

        return back()->with('success', 'Status berhasil diperbarui.');
    }

    public function updateFollowUp(Request $request, StudentApplication $studentApplication)
    {
        $validStatuses = ['belum_dihubungi', 'sudah_dihubungi', 'perlu_dilengkapi', 'siap_wawancara', 'tidak_aktif', 'selesai'];

        $validated = $request->validate([
            'follow_up_status' => ['required', 'string', 'in:' . implode(',', $validStatuses)],
            'follow_up_notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $studentApplication->update([
            'follow_up_status' => $validated['follow_up_status'],
            'follow_up_notes' => $validated['follow_up_notes'] ?? null,
            'follow_up_at' => now(),
            'follow_up_by' => auth()->id(),
        ]);

        $labels = [
            'belum_dihubungi' => 'Belum Dihubungi', 'sudah_dihubungi' => 'Sudah Dihubungi',
            'perlu_dilengkapi' => 'Perlu Dilengkapi', 'siap_wawancara' => 'Siap Wawancara',
            'tidak_aktif' => 'Tidak Aktif', 'selesai' => 'Selesai',
        ];

        return back()->with('success', 'Follow-up diperbarui: ' . ($labels[$validated['follow_up_status']] ?? $validated['follow_up_status']));
    }

    public function markDataComplete(Request $request, StudentApplication $studentApplication)
    {
        $validated = $request->validate([
            'status_data' => ['required', 'in:belum_lengkap,sudah_lengkap,perlu_perbaikan'],
        ]);

        $updateData = ['status_data' => $validated['status_data']];
        if ($validated['status_data'] === 'perlu_perbaikan') {
            $updateData['is_final_submitted'] = false;
        }

        $studentApplication->update($updateData);

        $labels = [
            'belum_lengkap' => 'Belum Lengkap',
            'sudah_lengkap' => 'Sudah Lengkap',
            'perlu_perbaikan' => 'Data Kurang',
        ];

        return back()->with('success', 'Status data diubah: ' . ($labels[$validated['status_data']] ?? $validated['status_data']));
    }

    public function destroy(StudentApplication $studentApplication)
    {
        $studentName = $studentApplication->student_name ?? 'Pendaftar';

        $studentApplication->delete();

        return redirect()
            ->route('admin.ppdb.applications.index')
            ->with('success', "Data pendaftar {$studentName} berhasil dihapus.");
    }

    public function generateUpdateLink(StudentApplication $studentApplication)
    {
        if (!$studentApplication->update_token) {
            $studentApplication->update([
                'update_token' => Str::random(64),
                'status_data' => 'belum_lengkap',
            ]);
        }

        $link = route('spmb.update-data', $studentApplication->update_token);

        return back()->with('success', 'Link pembaruan data berhasil dibuat. Silakan salin link berikut:')
            ->with('update_link', $link);
    }

    public function settingsEdit()
    {
        $currentYear = AdmissionYear::where('is_current', true)->with('programs')->first();
        $currentProgram = $currentYear?->programs->first();

        $yearStatuses = ['draft', 'open', 'almost_full', 'quota_full', 'closed', 'announcement', 'archived'];
        $programStatuses = ['draft', 'open', 'full', 'closed'];
        $programTypes = [
            'first_batch_free' => 'Gratis Angkatan Pertama',
            'regular_paid' => 'Reguler Berbayar',
            'scholarship' => 'Beasiswa',
            'subsidy' => 'Subsidi',
        ];

        return view('admin.ppdb.settings', compact(
            'currentYear', 'currentProgram',
            'yearStatuses', 'programStatuses', 'programTypes'
        ));
    }

    public function settingsUpdate(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'academic_year' => 'required|string|max:50',
            'quota' => 'required|integer|min:1',
            'status' => 'required|in:draft,open,almost_full,quota_full,closed,announcement,archived',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'description' => 'nullable|string',
            'promo_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'program_name' => 'required|string|max:255',
            'program_type' => 'required|in:first_batch_free,regular_paid,scholarship,subsidy',
            'program_quota' => 'required|integer|min:1',
            'program_status' => 'required|in:draft,open,full,closed',
            'tuition_fee' => 'required|numeric|min:0',
            'boarding_fee' => 'required|numeric|min:0',
            'meal_fee' => 'required|numeric|min:0',
            'registration_fee' => 'required|numeric|min:0',
            'other_fee' => 'required|numeric|min:0',
            'is_free_program' => 'nullable|boolean',
            'program_description' => 'nullable|string',
            'program_benefits' => 'nullable|string|max:5000',
            'program_requirements' => 'nullable|string|max:5000',
            'show_consultation_button' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($validated, $request) {
            $currentYear = AdmissionYear::where('is_current', true)->first();

            if ($currentYear) {
                $yearData = [
                    'name' => $validated['name'],
                    'academic_year' => $validated['academic_year'],
                    'quota' => $validated['quota'],
                    'status' => $validated['status'],
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'description' => $validated['description'] ?? '',
                    'show_consultation_button' => $request->boolean('show_consultation_button'),
                ];

                if ($request->hasFile('promo_image')) {
                    if ($currentYear->promo_image) {
                        Storage::disk('public')->delete($currentYear->promo_image);
                    }
                    $yearData['promo_image'] = $request->file('promo_image')->store('spmb/promos', 'public');
                }

                $currentYear->update($yearData);

                $program = $currentYear->programs()->first();
                if ($program) {
                    $program->update([
                        'name' => $validated['program_name'],
                        'type' => $validated['program_type'],
                        'quota' => $validated['program_quota'],
                        'status' => $validated['program_status'],
                        'tuition_fee' => $validated['tuition_fee'],
                        'boarding_fee' => $validated['boarding_fee'],
                        'meal_fee' => $validated['meal_fee'],
                        'registration_fee' => $validated['registration_fee'],
                        'other_fee' => $validated['other_fee'],
                        'is_free_program' => $validated['is_free_program'] ?? false,
                        'description' => $validated['program_description'] ?? '',
                        'benefits' => $validated['program_benefits'] ?? '',
                        'requirements' => $validated['program_requirements'] ?? '',
                    ]);
                }
            }
        });

        return redirect()->route('admin.ppdb.settings.edit')
            ->with('success', 'Pengaturan SPMB berhasil diperbarui.');
    }
}
