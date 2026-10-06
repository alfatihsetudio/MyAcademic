<?php

use App\Http\Controllers\Admin\GalleryCategoryController;
use App\Http\Controllers\Admin\NavigationMenuController;
use App\Http\Controllers\Admin\PPDBApplicationController;
use App\Http\Controllers\Admin\SchoolImageController;
use App\Http\Controllers\Admin\SchoolFigureController;
use App\Http\Controllers\Admin\SchoolValueController;
use App\Http\Controllers\Admin\FaqController;
use App\Http\Controllers\Admin\WebsitePageController;
use App\Http\Controllers\Admin\WebsiteSettingController;
use App\Http\Controllers\PPDBController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\PublicProgressController;
use App\Models\AdmissionYear;
use App\Models\SchoolImage;
use App\Models\SchoolSetting;
use App\Models\StudentApplication;
use App\Models\WebsitePage;
use App\Models\VisitorLog;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - SPMB (Sistem Penerimaan Murid Baru)
|--------------------------------------------------------------------------
|
| Strictly handles:
| 1. Public Landing Page & Brochure/Informasi SPMB
| 2. Calon Murid Area: Pendaftaran, Unggah Berkas, Cek Status, Pembayaran
| 3. PPDB Admin Area: Verifikasi berkas, scoring, kuota gelombang, export data
|
*/

// --- 1. LANDING PAGE UTAMA SPMB ---
Route::get('/', function () {
    $schoolSetting = null;
    $heroImages = collect();
    $currentAdmissionYear = null;
    $currentAdmissionProgram = null;
    $admissionStats = null;
    $homePage = null;
    $schoolValues = collect();
    $buildingImages = collect();
    $agendaEvents = collect();

    try {
        $schoolSetting = SchoolSetting::current();
        $heroImages = SchoolImage::where('is_active', true)
            ->whereHas('categories', fn($q) => $q->where('slug', 'hero'))
            ->orderBy('sort_order')
            ->latest()
            ->get();
        $currentAdmissionYear = AdmissionYear::where('is_current', true)->first();
        $currentAdmissionProgram = $currentAdmissionYear?->programs()->first();

        if ($currentAdmissionYear) {
            $totalApplicants = StudentApplication::where('admission_year_id', $currentAdmissionYear->id)->count();
            $totalAccepted = StudentApplication::where('admission_year_id', $currentAdmissionYear->id)
                ->where('status', 'diterima')
                ->count();
            $remainingQuota = max(0, $currentAdmissionYear->quota - $totalAccepted);
            $admissionStats = compact('totalApplicants', 'totalAccepted', 'remainingQuota');
        }

        $homePage = WebsitePage::key('home');

        $schoolValues = \App\Models\SchoolValue::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $buildingImages = \App\Models\SchoolImage::where('is_active', true)
            ->whereHas('categories', fn($q) => $q->where('slug', 'fasilitas'))
            ->orderBy('sort_order')
            ->get();
    } catch (\Exception $e) {
        // Fallback safely if db empty
    }

    return view('pages.welcome', compact(
        'schoolSetting', 'heroImages', 'currentAdmissionYear', 'currentAdmissionProgram',
        'admissionStats', 'homePage', 'schoolValues', 'buildingImages', 'agendaEvents'
    ));
})->middleware('track.visitor')->name('home');

// --- 2. DASHBOARD SPMB ---
Route::get('/dashboard', function () {
    $user = auth()->user();

    // 1. If student is already accepted & aktif, redirect them to My Academic portal notice
    if ($user && $user->lifecycle_status === 'aktif' && $user->role === 'murid') {
        return view('ppdb.accepted-portal', [
            'user' => $user,
            'portalUrl' => config('app.myacademic_portal_url', 'http://localhost:3000'),
        ]);
    }

    // 2. If student is still calon murid, show their application status & requirement check
    if ($user && $user->lifecycle_status === 'calon_murid' && $user->role === 'murid') {
        $application = StudentApplication::where('user_id', $user->id)->first();
        if ($application) {
            return redirect()->route('spmb.status.form')->with('auto_reg', $application->registration_number);
        }
        return redirect()->route('spmb.info');
    }

    // 3. Admin / Panitia SPMB Dashboard
    $currentYear = AdmissionYear::where('is_current', true)->first();
    $counts = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
        ->selectRaw("status, count(*) as total")
        ->groupBy('status')
        ->pluck('total', 'status');
    $quota = $currentYear?->quota ?? 0;
    $terisi = $counts->get('diterima', 0);
    $sisa = max(0, $quota - $terisi);
    $total = array_sum($counts->toArray()) ?: 0;
    $menunggu = $counts->get('menunggu_verifikasi', 0) + $counts->get('baru_daftar', 0);

    $now = now();
    $visitorToday = VisitorLog::whereDate('visited_at', $today = $now->toDateString())->count();
    $visitorTodayUnique = VisitorLog::whereDate('visited_at', $today)->distinct('ip_hash')->count('ip_hash');
    $visitor7Days = VisitorLog::where('visited_at', '>=', $now->copy()->subDays(7))->count();
    $visitor7DaysUnique = VisitorLog::where('visited_at', '>=', $now->copy()->subDays(7))->distinct('ip_hash')->count('ip_hash');
    $visitor30Days = VisitorLog::where('visited_at', '>=', $now->copy()->subDays(30))->count();
    $visitor30DaysUnique = VisitorLog::where('visited_at', '>=', $now->copy()->subDays(30))->distinct('ip_hash')->count('ip_hash');
    $totalVisits = VisitorLog::count();
    $spmbVisits = VisitorLog::where(function ($q) {
        $q->where('path', 'like', '%/spmb%')
          ->orWhere('path', 'like', '%/ppdb%');
    })->count();

    $topPages = collect();
    $topReferrers = collect();
    $deviceStats = collect();

    return view('dashboard', compact(
        'currentYear', 'counts', 'quota', 'terisi', 'sisa', 'total', 'menunggu',
        'visitorToday', 'visitorTodayUnique', 'visitor7Days', 'visitor7DaysUnique',
        'visitor30Days', 'visitor30DaysUnique', 'totalVisits', 'spmbVisits',
        'topPages', 'topReferrers', 'deviceStats'
    ));
})->middleware(['auth', 'verified'])->name('dashboard');

// --- 3. PROFILE AUTH ROUTES ---
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

// --- 4. PUBLIC INFORMASI & BROSUR SPMB ---
Route::middleware('track.visitor')->group(function () {
    Route::get('/profil', [PublicPageController::class, 'profile'])->name('public.profile');
    Route::get('/program', [PublicPageController::class, 'program'])->name('public.program');
    Route::get('/galeri', [PublicPageController::class, 'gallery'])->name('public.gallery');
    Route::get('/tokoh-pembina', [PublicPageController::class, 'figures'])->name('public.figures');
    Route::get('/faq', [PublicPageController::class, 'faq'])->name('public.faq');
    Route::get('/struktur-organisasi', [PublicPageController::class, 'strukturOrganisasi'])->name('public.struktur-organisasi');

    // Portal PPDB / SPMB Pendaftaran
    Route::get('/ppdb', [PPDBController::class, 'info'])->name('ppdb.info');
    Route::name('ppdb.')->prefix('ppdb')->group(function () {
        Route::get('/daftar', [PPDBController::class, 'create'])->name('create');
        Route::post('/daftar', [PPDBController::class, 'store'])->name('store');
        Route::get('/sukses/{studentApplication}', [PPDBController::class, 'success'])->name('success');
        Route::get('/cek-status', [PPDBController::class, 'statusForm'])->name('status.form');
        Route::post('/cek-status', [PPDBController::class, 'statusCheck'])->name('status.check');
    });

    Route::get('/spmb', [PPDBController::class, 'info'])->name('spmb.info');
    Route::name('spmb.')->prefix('spmb')->group(function () {
        Route::get('/daftar', [PPDBController::class, 'create'])->name('create');
        Route::post('/daftar', [PPDBController::class, 'store'])->name('store');
        Route::get('/sukses/{studentApplication}', [PPDBController::class, 'success'])->name('success');
        Route::get('/cek-status', [PPDBController::class, 'statusForm'])->name('status.form');
        Route::post('/cek-status', [PPDBController::class, 'statusCheck'])->name('status.check');
        Route::get('/perbarui-data/{token}', [PPDBController::class, 'editData'])->name('update-data');
        Route::post('/perbarui-data/{token}', [PPDBController::class, 'updateData'])->name('update-data.store');
        Route::post('/perbarui-data/{token}/step/{step}', [PPDBController::class, 'saveUpdateDataStep'])
            ->whereNumber('step')
            ->name('update-data.step');
        Route::post('/perbarui-data/{token}/final-submit', [PPDBController::class, 'finalSubmitUpdateData'])
            ->name('update-data.final-submit');
    });

    Route::get('/progress/{token}', [PublicProgressController::class, 'show'])->name('public.progress');
});

// --- 5. ADMIN SPMB AREA ---
Route::middleware('auth')->name('admin.')->prefix('admin')->group(function () {
    Route::get('/ppdb', [PPDBApplicationController::class, 'dashboard'])
        ->middleware('permission:ppdb.dashboard.view,superadmin,admin,staf_tata_usaha,staf_kesiswaan,kepala_sekolah')
        ->name('ppdb.dashboard');

    Route::name('ppdb.applications.')->prefix('ppdb/pendaftar')->group(function () {
        Route::get('/', [PPDBApplicationController::class, 'index'])
            ->middleware('permission:ppdb.applications.view,superadmin,admin,staf_tata_usaha,staf_kesiswaan,kepala_sekolah')
            ->name('index');
        Route::get('/export', [PPDBApplicationController::class, 'export'])
            ->middleware('permission:ppdb.applications.export,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('export');
        Route::get('/export-pdf', [PPDBApplicationController::class, 'exportPdf'])
            ->middleware('permission:ppdb.applications.export,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('export-pdf');
        Route::get('/{studentApplication}', [PPDBApplicationController::class, 'show'])
            ->middleware('permission:ppdb.applications.view,superadmin,admin,staf_tata_usaha,staf_kesiswaan,kepala_sekolah')
            ->name('show');
        Route::get('/{studentApplication}/print', [PPDBApplicationController::class, 'print'])
            ->middleware('permission:ppdb.applications.export,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('print');
        Route::get('/{studentApplication}/requirements/download', [PPDBApplicationController::class, 'downloadRequirements'])
            ->middleware('permission:ppdb.applications.download,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('requirements.download');
        Route::patch('/{studentApplication}/status', [PPDBApplicationController::class, 'updateStatus'])
            ->middleware('permission:ppdb.applications.manage,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('update-status');
        Route::patch('/{studentApplication}/follow-up', [PPDBApplicationController::class, 'updateFollowUp'])
            ->middleware('permission:ppdb.applications.manage,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('update-follow-up');
        Route::patch('/{studentApplication}/mark-data-complete', [PPDBApplicationController::class, 'markDataComplete'])
            ->middleware('permission:ppdb.applications.manage,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('mark-data-complete');
        Route::post('/{studentApplication}/generate-update-link', [PPDBApplicationController::class, 'generateUpdateLink'])
            ->middleware('permission:ppdb.applications.manage,superadmin,admin,staf_tata_usaha,staf_kesiswaan')
            ->name('generate-update-link');
        Route::delete('/{studentApplication}', [PPDBApplicationController::class, 'destroy'])
            ->middleware('permission:ppdb.applications.delete,superadmin,admin')
            ->name('destroy');
    });

    Route::name('ppdb.settings.')->prefix('ppdb/pengaturan')
        ->middleware('permission:ppdb.settings.manage,superadmin,admin')
        ->group(function () {
            Route::get('/', [PPDBApplicationController::class, 'settingsEdit'])->name('edit');
            Route::put('/', [PPDBApplicationController::class, 'settingsUpdate'])->name('update');
        });

    // Landing Page Media & Settings for SPMB
    Route::name('website.settings.')->prefix('website/pengaturan')
        ->middleware('role:superadmin,admin,staf_tata_usaha')
        ->group(function () {
            Route::get('/', [WebsiteSettingController::class, 'edit'])->name('edit');
            Route::put('/', [WebsiteSettingController::class, 'update'])->name('update');
        });

    Route::name('website.media.')->prefix('website/media')
        ->middleware('permission:website.media.manage,superadmin,admin,staf_tata_usaha')
        ->group(function () {
            Route::get('/', [SchoolImageController::class, 'index'])->name('index');
            Route::post('/', [SchoolImageController::class, 'mediaStore'])->name('store');
            Route::patch('/{schoolImage}/toggle', [SchoolImageController::class, 'toggle'])->name('toggle');
            Route::delete('/{schoolImage}', [SchoolImageController::class, 'destroy'])->name('destroy');
        });

    Route::name('website.categories.')->prefix('website/kategori-galeri')
        ->middleware('role:superadmin,admin,staf_tata_usaha')
        ->group(function () {
            Route::get('/', [GalleryCategoryController::class, 'index'])->name('index');
            Route::get('/create', [GalleryCategoryController::class, 'create'])->name('create');
            Route::post('/', [GalleryCategoryController::class, 'store'])->name('store');
            Route::get('/{galleryCategory}/edit', [GalleryCategoryController::class, 'edit'])->name('edit');
            Route::put('/{galleryCategory}', [GalleryCategoryController::class, 'update'])->name('update');
            Route::patch('/{galleryCategory}/toggle', [GalleryCategoryController::class, 'toggle'])->name('toggle');
            Route::delete('/{galleryCategory}', [GalleryCategoryController::class, 'destroy'])->name('destroy');
        });

    Route::name('website.faq.')->prefix('website/faq')
        ->middleware('role:superadmin,admin,staf_tata_usaha')
        ->group(function () {
            Route::get('/', [FaqController::class, 'index'])->name('index');
            Route::get('/create', [FaqController::class, 'create'])->name('create');
            Route::post('/', [FaqController::class, 'store'])->name('store');
            Route::get('/{faq}/edit', [FaqController::class, 'edit'])->name('edit');
            Route::put('/{faq}', [FaqController::class, 'update'])->name('update');
            Route::patch('/{faq}/toggle', [FaqController::class, 'toggle'])->name('toggle');
            Route::delete('/{faq}', [FaqController::class, 'destroy'])->name('destroy');
        });
});
