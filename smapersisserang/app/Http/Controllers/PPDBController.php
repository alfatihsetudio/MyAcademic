<?php

namespace App\Http\Controllers;

use App\Models\AdmissionYear;
use App\Models\AdmissionProgram;
use App\Models\StudentApplication;
use App\Models\ApplicationStatusHistory;
use App\Models\StudentRequirementFile;
use App\Services\FileCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PPDBController extends Controller
{
    private array $statusLabels = [
        'baru_daftar' => 'Pendaftaran Berhasil Diterima',
        'menunggu_verifikasi' => 'Menunggu Verifikasi Panitia',
        'data_kurang' => 'Data Perlu Dilengkapi',
        'terverifikasi' => 'Data Terverifikasi',
        'wawancara' => 'Proses Wawancara',
        'lulus' => 'Lulus Seleksi',
        'cadangan' => 'Masuk Daftar Cadangan',
        'tidak_lulus' => 'Belum Lulus Seleksi',
        'diterima' => 'Diterima sebagai Siswa',
        'mengundurkan_diri' => 'Mengundurkan Diri',
    ];

    private array $statusMessages = [
        'baru_daftar' => 'Pendaftaran sudah diterima. Panitia akan melakukan pengecekan data.',
        'menunggu_verifikasi' => 'Data sedang diperiksa oleh panitia SPMB.',
        'data_kurang' => 'Ada data yang perlu dilengkapi. Silakan hubungi admin SPMB.',
        'terverifikasi' => 'Data pendaftaran sudah diverifikasi.',
        'wawancara' => 'Calon siswa masuk tahap wawancara. Panitia akan menghubungi orang tua.',
        'lulus' => 'Selamat, calon siswa dinyatakan lulus seleksi.',
        'cadangan' => 'Calon siswa masuk daftar cadangan.',
        'tidak_lulus' => 'Mohon maaf, calon siswa belum lulus seleksi.',
        'diterima' => 'Selamat, calon siswa diterima sebagai siswa SMA Persis Serang.',
        'mengundurkan_diri' => 'Status pendaftaran tercatat mengundurkan diri.',
    ];
    public function info()
    {
        $admissionYear = AdmissionYear::where('is_current', true)->first();
        $programs = collect();
        $admissionStats = null;

        if ($admissionYear) {
            $programs = AdmissionProgram::where('admission_year_id', $admissionYear->id)
                ->where('status', 'open')
                ->orderBy('sort_order')
                ->get();

            $totalApplicants = StudentApplication::where('admission_year_id', $admissionYear->id)->count();
            $totalAccepted = StudentApplication::where('admission_year_id', $admissionYear->id)
                ->where('status', 'diterima')
                ->count();
            $remainingQuota = max(0, $admissionYear->quota - $totalAccepted);
            $admissionStats = compact('totalApplicants', 'totalAccepted', 'remainingQuota');
        }

        return view('ppdb.info', compact('admissionYear', 'programs', 'admissionStats'));
    }

    public function create()
    {
        $admissionYear = AdmissionYear::where('is_current', true)->first();

        if (!$admissionYear) {
            return view('ppdb.closed', [
                'title' => 'SPMB Belum Tersedia',
                'message' => 'SPMB belum tersedia saat ini. Silakan hubungi sekolah untuk informasi lebih lanjut.',
            ]);
        }

        $statusMessages = [
            'draft' => 'Pendaftaran SPMB belum dibuka. Silakan kembali lagi nanti.',
            'almost_full' => null,
            'quota_full' => 'Kuota pendaftaran SPMB sudah penuh. Terima kasih atas minat Anda.',
            'closed' => 'Pendaftaran SPMB sudah ditutup. Terima kasih atas partisipasi Anda.',
            'announcement' => 'Pendaftaran SPMB sudah ditutup. Saat ini dalam masa pengumuman.',
            'archived' => 'Pendaftaran SPMB untuk tahun ajaran ini sudah tidak tersedia.',
        ];

        if (isset($statusMessages[$admissionYear->status]) && $statusMessages[$admissionYear->status] !== null) {
            return view('ppdb.closed', [
                'title' => 'Pendaftaran Ditutup',
                'message' => $statusMessages[$admissionYear->status],
            ]);
        }

        $now = now();
        if ($now->lt($admissionYear->start_date) || $now->gt($admissionYear->end_date)) {
            return view('ppdb.closed', [
                'title' => 'Pendaftaran Ditutup',
                'message' => 'Maaf, masa pendaftaran SPMB sudah berakhir atau belum dimulai.',
            ]);
        }

        $program = AdmissionProgram::where('admission_year_id', $admissionYear->id)
            ->where('status', 'open')
            ->orderBy('sort_order')
            ->first();

        if (!$program) {
            return view('ppdb.closed', [
                'title' => 'Program Belum Tersedia',
                'message' => 'Maaf, belum ada program pendaftaran yang tersedia saat ini.',
            ]);
        }

        if ($program->applications()->count() >= $program->quota) {
            return view('ppdb.closed', [
                'title' => 'Kuota Program Penuh',
                'message' => 'Maaf, kuota program pendaftaran sudah penuh.',
            ]);
        }

        return view('ppdb.create', [
            'title' => 'Form Pendaftaran SPMB',
        ]);
    }

    public function store(Request $request)
    {
        $admissionYear = AdmissionYear::where('is_current', true)
            ->whereIn('status', ['open', 'almost_full'])
            ->first();

        if (!$admissionYear) {
            return back()->with('error', 'Maaf, pendaftaran SPMB belum dibuka.');
        }

        $program = AdmissionProgram::where('admission_year_id', $admissionYear->id)
            ->where('status', 'open')
            ->orderBy('sort_order')
            ->first();

        if (!$program) {
            return back()->with('error', 'Maaf, belum ada program pendaftaran yang tersedia.');
        }

        if ($program->applications()->count() >= $program->quota) {
            return back()->with('error', 'Maaf, kuota program pendaftaran sudah penuh.');
        }

        $validated = $request->validate([
            'student_name' => 'required|string|max:255',
            'gender' => 'required|in:laki_laki,perempuan',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'previous_school' => 'required|string|max:255',
            'address' => 'required|string',
            'father_name' => 'required|string|max:255',
            'mother_name' => 'required|string|max:255',
            'parent_whatsapp' => 'required|string|max:20',
            'parent_job' => 'nullable|string|max:255',
            'boarding_ready' => 'required|in:0,1',
            'quran_reading_ability' => 'required|in:belum_bisa,terbata_bata,lancar,baik',
            'health_notes' => 'nullable|string',
            'motivation' => 'required|string',
        ]);

        return DB::transaction(function () use ($validated, $admissionYear, $program) {
            $yearPrefix = explode('/', $admissionYear->academic_year)[0];
            $prefix = 'SPMB-' . $yearPrefix . '-';

            $lastNumber = StudentApplication::where('registration_number', 'like', $prefix . '%')
                ->lockForUpdate()
                ->orderByDesc('registration_number')
                ->value('registration_number');

            $nextNumber = 1;
            if ($lastNumber) {
                $nextNumber = (int) substr($lastNumber, -4) + 1;
            }

            do {
                $regNumber = $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
                $exists = StudentApplication::where('registration_number', $regNumber)->exists();
                if ($exists) {
                    $nextNumber++;
                }
            } while ($exists);

            $application = StudentApplication::create([
                'registration_number' => $regNumber,
                'admission_year_id' => $admissionYear->id,
                'admission_program_id' => $program->id,
                'status' => 'baru_daftar',
                'student_name' => $validated['student_name'],
                'gender' => $validated['gender'],
                'birth_place' => $validated['birth_place'],
                'birth_date' => $validated['birth_date'],
                'previous_school' => $validated['previous_school'],
                'address' => $validated['address'],
                'father_name' => $validated['father_name'],
                'mother_name' => $validated['mother_name'],
                'parent_whatsapp' => $validated['parent_whatsapp'],
                'parent_job' => $validated['parent_job'],
                'boarding_ready' => (bool) $validated['boarding_ready'],
                'quran_reading_ability' => $validated['quran_reading_ability'],
                'health_notes' => $validated['health_notes'],
                'motivation' => $validated['motivation'],
                'submitted_at' => now(),
            ]);

            ApplicationStatusHistory::create([
                'student_application_id' => $application->id,
                'from_status' => null,
                'to_status' => 'baru_daftar',
                'changed_by' => null,
                'notes' => 'Pendaftaran dibuat melalui form SPMB online.',
            ]);

            return redirect()->route('ppdb.success', $application);
        });
    }

    public function success(StudentApplication $studentApplication)
    {
        $studentApplication->load(['admissionYear', 'admissionProgram']);

        return view('ppdb.success', [
            'title' => 'Pendaftaran Berhasil',
            'application' => $studentApplication,
        ]);
    }

    public function editData($token)
    {
        $application = StudentApplication::where('update_token', $token)->first();

        if (!$application) {
            return view('ppdb.closed', [
                'title' => 'Link Tidak Valid',
                'message' => 'Link pembaruan data tidak valid atau sudah kadaluarsa. Silakan hubungi panitia SPMB.',
            ]);
        }

        $application->load(['admissionYear', 'admissionProgram', 'requirementFiles']);

        $agamaOptions = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu'];
        $statusKeluargaOptions = ['anak_kandung', 'anak_tiri', 'anak_angkat'];

        $requirements = StudentRequirementFile::$requirements;
        $uploadedFiles = $application->requirementFiles->keyBy('requirement_key');

        return view('ppdb.update-data', compact(
            'application', 'agamaOptions', 'statusKeluargaOptions', 'requirements', 'uploadedFiles'
        ));
    }

    public function updateData(Request $request, $token)
    {
        $application = StudentApplication::where('update_token', $token)->first();

        if (!$application) {
            return back()->with('error', 'Link pembaruan data tidak valid.');
        }

        $rules = [
            'nama_panggilan' => 'nullable|string|max:100',
            'nomor_induk_asal' => 'nullable|string|max:50',
            'nisn' => ['required', 'string', 'max:20'],
            'student_name' => 'required|string|max:255',
            'gender' => 'required|in:laki_laki,perempuan',
            'birth_place' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'agama' => 'required|string|max:20',
            'anak_ke' => 'nullable|integer|min:1',
            'status_anak_dalam_keluarga' => 'nullable|string|max:50',
            'previous_school' => 'required|string|max:255',
            'alamat_sekolah_asal' => 'nullable|string',
            'address' => 'required|string',
            'telepon_siswa' => 'nullable|string|max:20',
            'boarding_ready' => 'required|in:0,1',
            'quran_reading_ability' => 'required|in:belum_bisa,terbata_bata,lancar,baik',
            'health_notes' => 'nullable|string',
            'motivation' => 'required|string',
            'foto_3x4' => 'nullable|image|mimes:jpg,jpeg,png',

            'father_name' => 'required|string|max:255',
            'mother_name' => 'required|string|max:255',
            'alamat_ayah' => 'nullable|string',
            'alamat_ibu' => 'nullable|string',
            'parent_whatsapp' => 'required|string|max:20',
            'parent_job' => 'nullable|string|max:255',
            'pekerjaan_ayah' => 'nullable|string|max:100',
            'pekerjaan_ibu' => 'nullable|string|max:100',
            'pendidikan_ayah' => 'nullable|string|max:100',
            'pendidikan_ibu' => 'nullable|string|max:100',
            'penghasilan_ayah' => 'nullable|string|max:50',
            'penghasilan_ibu' => 'nullable|string|max:50',

            'nama_ayah_wali' => 'nullable|string|max:255',
            'nama_ibu_wali' => 'nullable|string|max:255',
            'alamat_ayah_wali' => 'nullable|string',
            'alamat_ibu_wali' => 'nullable|string',
            'telepon_wali' => 'nullable|string|max:20',
            'pekerjaan_ayah_wali' => 'nullable|string|max:100',
            'pekerjaan_ibu_wali' => 'nullable|string|max:100',
            'pendidikan_ayah_wali' => 'nullable|string|max:100',
            'pendidikan_ibu_wali' => 'nullable|string|max:100',
            'penghasilan_ayah_wali' => 'nullable|string|max:50',
            'penghasilan_ibu_wali' => 'nullable|string|max:50',
        ];

        $application->load('requirementFiles');
        $existingFiles = $application->requirementFiles->keyBy('requirement_key');

        foreach (StudentRequirementFile::$requirements as $key => $req) {
            $rules[$key] = 'nullable|file|mimes:pdf,jpg,jpeg,png';
        }

        $fileMessages = [
            'nisn.required' => 'NISN wajib diisi.',
        ];
        $fileReqKeys = array_keys(StudentRequirementFile::$requirements);
        $fileReqKeys[] = 'foto_3x4';

        foreach ($fileReqKeys as $key) {
            $fileMessages["$key.required"] = 'Harap unggah file persyaratan ini.';
            $fileMessages["$key.file"] = 'Data yang diunggah harus berupa file.';
            $fileMessages["$key.mimes"] = 'Format file harus PDF, JPG, JPEG, atau PNG.';
        }

        $validated = $request->validate($rules, $fileMessages);

        $sizeErrors = [];
        $allFileFields = array_keys(StudentRequirementFile::$requirements);
        $allFileFields[] = 'foto_3x4';

        foreach ($allFileFields as $key) {
            if (!$request->hasFile($key)) {
                continue;
            }

            $file = $request->file($key);
            $extension = strtolower($file->getClientOriginalExtension());
            $size = $file->getSize();
            $isImage = in_array($extension, ['jpg', 'jpeg', 'png']);
            $isPdf = $extension === 'pdf';

            if (!$isImage && !$isPdf) {
                $sizeErrors[$key] = 'Format file harus PDF, JPG, JPEG, atau PNG.';
            } elseif ($isPdf && $size > 2048 * 1024) {
                $sizeErrors[$key] = 'File PDF maksimal 2MB.';
            } elseif ($isImage && $size > 8192 * 1024) {
                $sizeErrors[$key] = 'File gambar maksimal 8MB sebelum dikompres.';
            }
        }

        if (!empty($sizeErrors)) {
            return back()->withErrors($sizeErrors)->withInput();
        }

        DB::transaction(function () use ($validated, $application, $request) {
            $data = $validated;

            if ($request->hasFile('foto_3x4')) {
                if ($application->foto_3x4) {
                    Storage::disk('public')->delete($application->foto_3x4);
                }
                $data['foto_3x4'] = $request->file('foto_3x4')->store('spmb/foto-siswa', 'public');
            }

            $data['boarding_ready'] = (bool) $validated['boarding_ready'];
            $data['updated_by_parent_at'] = now();

            $application->update($data);
        });

        $compressionService = app(FileCompressionService::class);
        $newlyUploadedKeys = [];

        foreach (StudentRequirementFile::$requirements as $key => $req) {
            if (!$request->hasFile($key)) {
                continue;
            }

            $file = $request->file($key);

            try {
                $result = $compressionService->storeRequirementFile($file, $key);
            } catch (\RuntimeException $e) {
                return back()->with('error', $e->getMessage())->withInput();
            }

            $existingFile = $existingFiles->get($key);
            $newlyUploadedKeys[$key] = true;

            DB::transaction(function () use ($application, $key, $req, $result, $existingFile) {
                if ($existingFile) {
                    $existingFile->deleteFile();
                    $existingFile->update([
                        'file_path' => $result['file_path'],
                        'original_filename' => $result['original_filename'],
                        'mime_type' => $result['mime_type'],
                        'file_size_original' => $result['file_size_original'],
                        'file_size_compressed' => $result['file_size_compressed'],
                        'compression_status' => $result['compression_status'],
                        'uploaded_at' => now(),
                    ]);
                } else {
                    $application->requirementFiles()->create([
                        'requirement_key' => $key,
                        'requirement_label' => $req['label'],
                        'file_path' => $result['file_path'],
                        'original_filename' => $result['original_filename'],
                        'mime_type' => $result['mime_type'],
                        'file_size_original' => $result['file_size_original'],
                        'file_size_compressed' => $result['file_size_compressed'],
                        'compression_status' => $result['compression_status'],
                        'uploaded_at' => now(),
                    ]);
                }
            });
        }

        $allRequiredHaveFiles = true;
        foreach (StudentRequirementFile::$requirements as $key => $req) {
            if (!$req['required']) {
                continue;
            }
            if (!$existingFiles->has($key) && !isset($newlyUploadedKeys[$key])) {
                $allRequiredHaveFiles = false;
                break;
            }
        }

        $application->update([
            'status_data' => $allRequiredHaveFiles ? 'sudah_lengkap' : 'belum_lengkap',
        ]);

        return redirect()->route('spmb.info')->with('success', 'Data berhasil diperbarui. Terima kasih.');
    }

    public function saveUpdateDataStep(Request $request, $token, int $step)
    {
        $application = StudentApplication::where('update_token', $token)->first();

        if (!$application) {
            return back()->with('error', 'Link pembaruan data tidak valid.');
        }

        if ($application->is_final_submitted && ! $this->canReviseFinalSubmittedData($application)) {
            return back()->with('error', 'Data sudah dikirim final dan sedang menunggu verifikasi panitia SPMB.');
        }

        if (!in_array($step, [1, 2, 3, 4, 5], true)) {
            abort(404);
        }

        if ($step === 5) {
            $this->validateUpdateDataFiles($request);
            try {
                $this->storeUpdateDataRequirementFiles($request, $application);
            } catch (\RuntimeException $e) {
                return back()->with('error', $e->getMessage())->withInput();
            }
            $application->update([
                'current_step' => max((int) $application->current_step, 6),
                'documents_completed_at' => now(),
                'last_saved_at' => now(),
            ]);

            if ($request->boolean('next')) {
                return redirect()
                    ->route('spmb.update-data', ['token' => $application->update_token, 'step' => 6])
                    ->with('success', 'Dokumen berhasil disimpan.');
            }

            return back()->with('success', 'Dokumen berhasil disimpan.');
        }

        $validated = $request->validate($this->updateDataStepRules($step));

        DB::transaction(function () use ($request, $application, $validated, $step) {
            if ($step === 1 && $request->hasFile('foto_3x4')) {
                if ($application->foto_3x4) {
                    Storage::disk('public')->delete($application->foto_3x4);
                }
                $validated['foto_3x4'] = $request->file('foto_3x4')->store('spmb/foto-siswa', 'public');
            }

            if (array_key_exists('boarding_ready', $validated)) {
                $validated['boarding_ready'] = (bool) $validated['boarding_ready'];
            }

            $validated['current_step'] = max((int) $application->current_step, min($step + 1, 6));
            $validated['last_saved_at'] = now();

            $completedColumn = match ($step) {
                1 => 'student_data_completed_at',
                2 => 'parent_data_completed_at',
                3 => null,
                4 => 'guardian_boarding_completed_at',
            };
            if ($completedColumn) {
                $validated[$completedColumn] = now();
            }

            $application->update($validated);
        });

        if ($request->boolean('next')) {
            return redirect()
                ->route('spmb.update-data', ['token' => $application->update_token, 'step' => $step + 1])
                ->with('success', 'Data langkah ' . $step . ' berhasil disimpan.');
        }

        return back()->with('success', 'Data langkah ' . $step . ' berhasil disimpan.');
    }

    public function finalSubmitUpdateData(Request $request, $token)
    {
        $application = StudentApplication::where('update_token', $token)
            ->with('requirementFiles')
            ->first();

        if (!$application) {
            return back()->with('error', 'Link pembaruan data tidak valid.');
        }

        if ($application->is_final_submitted && ! $this->canReviseFinalSubmittedData($application)) {
            return back()->with('error', 'Data sudah dikirim final dan sedang menunggu verifikasi panitia SPMB.');
        }

        $errors = $this->finalUpdateDataErrors($application);
        if (!empty($errors)) {
            return back()->withErrors($errors)->withInput();
        }

        DB::transaction(function () use ($application) {
            $fromStatus = $application->status;

            $application->update([
                'is_final_submitted' => true,
                'final_submitted_at' => now(),
                'status' => 'menunggu_verifikasi',
                'status_data' => 'sudah_lengkap',
                'current_step' => 6,
                'last_saved_at' => now(),
            ]);

            if ($fromStatus !== 'menunggu_verifikasi') {
                ApplicationStatusHistory::create([
                    'student_application_id' => $application->id,
                    'from_status' => $fromStatus,
                    'to_status' => 'menunggu_verifikasi',
                    'changed_by' => null,
                    'notes' => 'Data pembaruan dikirim final oleh orang tua/wali.',
                ]);
            }
        });

        return redirect()
            ->route('spmb.update-data', $application->update_token)
            ->with('success', 'Data berhasil diperbarui.');
    }

    private function updateDataStepRules(int $step): array
    {
        return match ($step) {
            1 => [
                'nama_panggilan' => ['nullable', 'string', 'max:100'],
                'nomor_induk_asal' => ['nullable', 'string', 'max:50'],
                'nisn' => ['required', 'string', 'max:20'],
                'student_name' => ['required', 'string', 'max:255'],
                'gender' => ['required', 'in:laki_laki,perempuan'],
                'birth_place' => ['required', 'string', 'max:255'],
                'birth_date' => ['required', 'date'],
                'agama' => ['nullable', 'string', 'max:20'],
                'anak_ke' => ['nullable', 'integer', 'min:1'],
                'status_anak_dalam_keluarga' => ['nullable', 'string', 'max:50'],
                'previous_school' => ['required', 'string', 'max:255'],
                'alamat_sekolah_asal' => ['nullable', 'string'],
                'address' => ['required', 'string'],
                'telepon_siswa' => ['nullable', 'string', 'max:20'],
                'foto_3x4' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:8192'],
            ],
            2 => [
                'father_name' => ['nullable', 'string', 'max:255'],
                'mother_name' => ['nullable', 'string', 'max:255'],
                'alamat_ayah' => ['nullable', 'string'],
                'alamat_ibu' => ['nullable', 'string'],
                'parent_whatsapp' => ['nullable', 'string', 'max:20'],
                'parent_job' => ['nullable', 'string', 'max:255'],
                'pekerjaan_ayah' => ['nullable', 'string', 'max:100'],
                'pekerjaan_ibu' => ['nullable', 'string', 'max:100'],
                'pendidikan_ayah' => ['nullable', 'string', 'max:100'],
                'pendidikan_ibu' => ['nullable', 'string', 'max:100'],
                'penghasilan_ayah' => ['nullable', 'string', 'max:50'],
                'penghasilan_ibu' => ['nullable', 'string', 'max:50'],
            ],
            3 => [
                'nama_ayah_wali' => ['nullable', 'string', 'max:255'],
                'nama_ibu_wali' => ['nullable', 'string', 'max:255'],
                'alamat_ayah_wali' => ['nullable', 'string'],
                'alamat_ibu_wali' => ['nullable', 'string'],
                'telepon_wali' => ['nullable', 'string', 'max:20'],
                'pekerjaan_ayah_wali' => ['nullable', 'string', 'max:100'],
                'pekerjaan_ibu_wali' => ['nullable', 'string', 'max:100'],
                'pendidikan_ayah_wali' => ['nullable', 'string', 'max:100'],
                'pendidikan_ibu_wali' => ['nullable', 'string', 'max:100'],
                'penghasilan_ayah_wali' => ['nullable', 'string', 'max:50'],
                'penghasilan_ibu_wali' => ['nullable', 'string', 'max:50'],
            ],
            4 => [
                'boarding_ready' => ['required', 'in:0,1'],
                'quran_reading_ability' => ['required', 'in:belum_bisa,terbata_bata,lancar,baik'],
                'health_notes' => ['nullable', 'string'],
                'motivation' => ['required', 'string'],
            ],
            default => [],
        };
    }

    private function canReviseFinalSubmittedData(StudentApplication $application): bool
    {
        return $application->status_data === 'perlu_perbaikan'
            || $application->status === 'data_kurang';
    }

    private function validateUpdateDataFiles(Request $request): void
    {
        $rules = [];
        foreach (StudentRequirementFile::$requirements as $key => $req) {
            $rules[$key] = ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png'];
        }

        $request->validate($rules);

        $sizeErrors = [];
        foreach (array_keys(StudentRequirementFile::$requirements) as $key) {
            if (!$request->hasFile($key)) {
                continue;
            }

            $file = $request->file($key);
            $extension = strtolower($file->getClientOriginalExtension());
            $size = $file->getSize();
            $isImage = in_array($extension, ['jpg', 'jpeg', 'png'], true);
            $isPdf = $extension === 'pdf';

            if (!$isImage && !$isPdf) {
                $sizeErrors[$key] = 'Format file harus PDF, JPG, JPEG, atau PNG.';
            } elseif ($isPdf && $size > 2048 * 1024) {
                $sizeErrors[$key] = 'File PDF maksimal 2MB.';
            } elseif ($isImage && $size > 8192 * 1024) {
                $sizeErrors[$key] = 'File gambar maksimal 8MB sebelum dikompres.';
            }
        }

        if (!empty($sizeErrors)) {
            throw \Illuminate\Validation\ValidationException::withMessages($sizeErrors);
        }
    }

    private function storeUpdateDataRequirementFiles(Request $request, StudentApplication $application): void
    {
        $application->load('requirementFiles');
        $existingFiles = $application->requirementFiles->keyBy('requirement_key');
        $compressionService = app(FileCompressionService::class);

        foreach (StudentRequirementFile::$requirements as $key => $req) {
            if (!$request->hasFile($key)) {
                continue;
            }

            $result = $compressionService->storeRequirementFile($request->file($key), $key);
            $existingFile = $existingFiles->get($key);

            DB::transaction(function () use ($application, $key, $req, $result, $existingFile) {
                if ($existingFile) {
                    $existingFile->deleteFile();
                    $existingFile->update([
                        'file_path' => $result['file_path'],
                        'original_filename' => $result['original_filename'],
                        'mime_type' => $result['mime_type'],
                        'file_size_original' => $result['file_size_original'],
                        'file_size_compressed' => $result['file_size_compressed'],
                        'compression_status' => $result['compression_status'],
                        'uploaded_at' => now(),
                    ]);
                    return;
                }

                $application->requirementFiles()->create([
                    'requirement_key' => $key,
                    'requirement_label' => $req['label'],
                    'file_path' => $result['file_path'],
                    'original_filename' => $result['original_filename'],
                    'mime_type' => $result['mime_type'],
                    'file_size_original' => $result['file_size_original'],
                    'file_size_compressed' => $result['file_size_compressed'],
                    'compression_status' => $result['compression_status'],
                    'uploaded_at' => now(),
                ]);
            });
        }
    }

    private function finalUpdateDataErrors(StudentApplication $application): array
    {
        $requiredFields = [
            'student_name' => 'Nama lengkap wajib diisi.',
            'nisn' => 'NISN wajib diisi.',
            'gender' => 'Jenis kelamin wajib dipilih.',
            'agama' => 'Agama wajib dipilih.',
            'birth_place' => 'Tempat lahir wajib diisi.',
            'birth_date' => 'Tanggal lahir wajib diisi.',
            'previous_school' => 'Sekolah sebelumnya wajib diisi.',
            'address' => 'Alamat siswa wajib diisi.',
            'father_name' => 'Nama ayah wajib diisi.',
            'mother_name' => 'Nama ibu wajib diisi.',
            'parent_whatsapp' => 'Nomor WhatsApp orang tua wajib diisi.',
            'boarding_ready' => 'Kesiapan boarding wajib dipilih.',
            'quran_reading_ability' => 'Kemampuan baca Al-Quran wajib dipilih.',
            'motivation' => 'Motivasi wajib diisi.',
        ];

        $errors = [];
        foreach ($requiredFields as $field => $message) {
            if (blank($application->{$field}) && $application->{$field} !== false) {
                $errors[$field] = $message;
            }
        }

        $uploadedFiles = $application->requirementFiles->keyBy('requirement_key');
        foreach (StudentRequirementFile::$requirements as $key => $req) {
            if (($req['required'] ?? false) && !$uploadedFiles->has($key)) {
                $errors[$key] = $req['label'] . ' wajib diunggah.';
            }
        }

        return $errors;
    }

    public function statusForm()
    {
        return view('ppdb.status-form', [
            'title' => 'Cek Status Pendaftaran',
        ]);
    }

    public function statusCheck(Request $request)
    {
        $validated = $request->validate([
            'registration_number' => 'nullable|string|max:50',
            'parent_whatsapp' => 'nullable|string|max:50',
        ]);

        $regNumber = $validated['registration_number'] ?? null;
        $waNumber = $validated['parent_whatsapp'] ?? null;

        if (blank($regNumber) && blank($waNumber)) {
            return back()
                ->withErrors(['search' => 'Harap isi nomor pendaftaran atau nomor WhatsApp orang tua.'])
                ->withInput();
        }

        $query = StudentApplication::query();

        if (!blank($regNumber)) {
            $query->where('registration_number', $regNumber);
        } else {
            $normalized = preg_replace('/[\s\+\-]/', '', $waNumber);
            $query->where('parent_whatsapp', 'LIKE', '%' . $normalized);
        }

        $application = $query->with(['admissionYear', 'admissionProgram'])->first();

        if (!$application) {
            return back()
                ->withErrors(['search' => 'Data pendaftaran tidak ditemukan. Pastikan nomor pendaftaran atau WhatsApp yang dimasukkan benar.'])
                ->withInput();
        }

        return view('ppdb.status-form', [
            'title' => 'Hasil Cek Status Pendaftaran',
            'application' => $application,
            'statusLabel' => $this->statusLabels[$application->status] ?? $application->status,
            'statusMessage' => $this->statusMessages[$application->status] ?? '',
        ]);
    }
}
