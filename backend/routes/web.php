<?php

use App\Http\Controllers\AccountController;
use App\Http\Controllers\AssignmentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OfflineAssessmentController;
use App\Http\Controllers\SpaceBelajarController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TableExcelController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

// Guest Landing / Redirect
Route::get('/', function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user->isAdmin()) return redirect()->route('admin.dashboard');
        if ($user->isGuru()) return redirect()->route('guru.dashboard');
        return redirect()->route('murid.dashboard');
    }
    return redirect()->route('login');
});

// Authentication
Route::get('/login', [AuthController::class, 'showLoginForm'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Authenticated Routes
Route::middleware(['auth'])->group(function () {

    // Dashboards
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])->middleware('role:admin')->name('admin.dashboard');
    Route::get('/dashboard/guru', [DashboardController::class, 'guru'])->middleware('role:guru,admin')->name('guru.dashboard');
    Route::get('/dashboard/murid', [DashboardController::class, 'murid'])->middleware('role:murid,siswa,admin')->name('murid.dashboard');

    // Classes (Admin)
    Route::middleware('role:admin')->group(function () {
        Route::resource('classes', ClassController::class);
        Route::resource('users', UserController::class);
    });

    // Subjects (Guru & Admin)
    Route::middleware('role:guru,admin')->group(function () {
        Route::get('/subjects/create', [SubjectController::class, 'create'])->name('subjects.create');
        Route::post('/subjects', [SubjectController::class, 'store'])->name('subjects.store');
        Route::delete('/subjects/{subject}', [SubjectController::class, 'destroy'])->name('subjects.destroy');
    });
    Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects.index');

    // Assignments
    Route::get('/assignments', [AssignmentController::class, 'index'])->name('assignments.index');
    Route::middleware('role:guru,admin')->group(function () {
        Route::get('/assignments/create', [AssignmentController::class, 'create'])->name('assignments.create');
        Route::post('/assignments', [AssignmentController::class, 'store'])->name('assignments.store');
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy'])->name('assignments.destroy');
        Route::post('/submissions/{submission}/grade', [AssignmentController::class, 'grade'])->name('submissions.grade');
    });
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show');
    Route::post('/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->middleware('role:murid,siswa')->name('assignments.submit');

    // Materials
    Route::get('/materials', [MaterialController::class, 'index'])->name('materials.index');
    Route::middleware('role:guru,admin')->group(function () {
        Route::get('/materials/create', [MaterialController::class, 'create'])->name('materials.create');
        Route::post('/materials', [MaterialController::class, 'store'])->name('materials.store');
        Route::delete('/materials/{material}', [MaterialController::class, 'destroy'])->name('materials.destroy');
    });
    Route::get('/materials/{material}', [MaterialController::class, 'show'])->name('materials.show');

    // Attendance (Guru & Admin)
    Route::middleware('role:guru,admin')->group(function () {
        Route::get('/attendance/take', [AttendanceController::class, 'take'])->name('attendance.take');
        Route::post('/attendance/store', [AttendanceController::class, 'store'])->name('attendance.store');
    });

    // Grades
    Route::get('/grades', [GradeController::class, 'index'])->name('grades.index');
    Route::get('/grades/daily-recap', [GradeController::class, 'dailyRecap'])->middleware('role:guru,admin')->name('grades.daily-recap');

    // Penilaian Offline (Guru & Admin)
    Route::middleware('role:guru,admin')->prefix('penilaian-offline')->name('offline-assessment.')->group(function () {
        Route::get('/', [OfflineAssessmentController::class, 'index'])->name('index');
        Route::get('/create', [OfflineAssessmentController::class, 'create'])->name('create');
        Route::post('/store', [OfflineAssessmentController::class, 'store'])->name('store');
        Route::get('/use/{task}', [OfflineAssessmentController::class, 'use'])->name('use');
        Route::post('/save-scores/{task}', [OfflineAssessmentController::class, 'saveScores'])->name('save-scores');
        Route::get('/rekap', [OfflineAssessmentController::class, 'rekap'])->name('rekap');
    });

    // Excel / Table Templates & Documents (Guru & Admin)
    Route::middleware('role:guru,admin')->prefix('excel')->name('excel.')->group(function () {
        Route::get('/', [TableExcelController::class, 'index'])->name('index');
        Route::get('/templates', [TableExcelController::class, 'listTemplates'])->name('templates');
        Route::get('/create-template', [TableExcelController::class, 'createTemplate'])->name('create-template');
        Route::post('/store-template', [TableExcelController::class, 'storeTemplate'])->name('store-template');
        Route::get('/use-template/{template}', [TableExcelController::class, 'useTemplate'])->name('use-template');
        Route::get('/edit-document/{document}', [TableExcelController::class, 'editDocument'])->name('edit-document');
        Route::post('/save-document/{document}', [TableExcelController::class, 'saveDocument'])->name('save-document');
    });

    // Space Belajar (Murid & Admin)
    Route::prefix('space-belajar')->name('space-belajar.')->group(function () {
        Route::get('/', [SpaceBelajarController::class, 'index'])->name('index');
        Route::get('/progres', [SpaceBelajarController::class, 'progres'])->name('progres');
        Route::post('/add-goal', [SpaceBelajarController::class, 'addGoal'])->name('add-goal');
        Route::post('/add-goal-log', [SpaceBelajarController::class, 'addGoalLog'])->name('add-goal-log');
        Route::get('/riwayat-tugas', [SpaceBelajarController::class, 'riwayatTugas'])->name('riwayat-tugas');
        Route::get('/riwayat-materi', [SpaceBelajarController::class, 'riwayatMateri'])->name('riwayat-materi');
        Route::get('/calendar', [SpaceBelajarController::class, 'calendar'])->name('calendar');
        Route::get('/calendar/day', [SpaceBelajarController::class, 'dayDetail'])->name('calendar.day');
        Route::post('/calendar/save', [SpaceBelajarController::class, 'saveCalendarEvent'])->name('calendar.save');
    });

    // Student Portal Menus
    Route::get('/my-classes', [ClassController::class, 'myClasses'])->name('classes.my-classes');
    Route::get('/rekap-nilai', [GradeController::class, 'rekapNilai'])->name('grades.my-rekap');
    Route::get('/riwayat-absensi', [AttendanceController::class, 'myHistory'])->name('attendance.my-history');

    // Account Settings
    Route::get('/account/settings', [AccountController::class, 'settings'])->name('account.settings');
    Route::post('/account/settings', [AccountController::class, 'update'])->name('account.update');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::get('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
});

// Direct Storage Asset Route (fallback if symlink is not present on Windows)
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    if (!file_exists($filePath)) {
        abort(404);
    }
    return response()->file($filePath);
})->where('path', '.*');
