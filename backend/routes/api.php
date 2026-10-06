<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\AcademicYearController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\TimetableController;
use App\Http\Controllers\Api\V1\TeachingSessionController;
use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AssessmentController;
use App\Http\Controllers\Api\V1\ExamController;
use App\Http\Controllers\Api\V1\GradebookController;
use App\Http\Controllers\Api\AcademicApiController;
use App\Http\Controllers\Api\StudentSuiteApiController;
use App\Http\Controllers\Api\TeacherSuiteApiController;
use App\Http\Controllers\Api\SchoolAdminSuiteApiController;
use App\Http\Controllers\Api\PrincipalSuiteApiController;
use App\Http\Controllers\Api\TuSuiteApiController;
use App\Http\Controllers\Api\HomeroomSuiteApiController;
use App\Http\Controllers\Api\BkSuiteApiController;
use App\Http\Controllers\Api\ParentSuiteApiController;
use App\Http\Controllers\Api\SuperAdminSuiteApiController;
use App\Http\Controllers\Api\ArsipBelajarController;
use App\Http\Controllers\Api\StudentSettingsApiController;
use App\Http\Controllers\Api\WebAuthnController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

$registerInteractiveRoutes = function () {
    // Public Auth Routes
    Route::post('/login', [AcademicApiController::class, 'login']);
    Route::post('/auth/login', [AcademicApiController::class, 'login']);
    Route::post('/webauthn/login/options', [WebAuthnController::class, 'loginOptions']);
    Route::post('/webauthn/login/verify', [WebAuthnController::class, 'loginVerify']);

    Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AcademicApiController::class, 'logout']);
    Route::post('/auth/logout', [AcademicApiController::class, 'logout']);
    Route::get('/me', [AcademicApiController::class, 'me']);
    Route::get('/auth/me', [AcademicApiController::class, 'me']);
    Route::post('/profile', [AcademicApiController::class, 'updateProfile']);

    // Biometric Passkeys / WebAuthn
    Route::get('/webauthn/passkeys', [WebAuthnController::class, 'index']);
    Route::post('/webauthn/register/options', [WebAuthnController::class, 'registerOptions']);
    Route::post('/webauthn/register/verify', [WebAuthnController::class, 'registerVerify']);
    Route::delete('/webauthn/passkeys/{id}', [WebAuthnController::class, 'destroy']);

    // Super Admin Master Suite API (Platform Owner Control Center - 82 Sections)
    Route::get('/super-admin/dashboard', [SuperAdminSuiteApiController::class, 'dashboard']);
    Route::get('/super-admin/schools', [SuperAdminSuiteApiController::class, 'schools']);
    Route::get('/super-admin/schools/{id}', [SuperAdminSuiteApiController::class, 'school360']);
    Route::get('/super-admin/registrations', [SuperAdminSuiteApiController::class, 'registrations']);
    Route::post('/super-admin/impersonate', [SuperAdminSuiteApiController::class, 'impersonate']);
    Route::get('/super-admin/subscriptions', [SuperAdminSuiteApiController::class, 'subscriptions']);
    Route::get('/super-admin/feature-flags', [SuperAdminSuiteApiController::class, 'featureFlags']);
    Route::get('/super-admin/system-health', [SuperAdminSuiteApiController::class, 'systemHealth']);
    Route::get('/super-admin/audit-logs', [SuperAdminSuiteApiController::class, 'auditLogs']);
    Route::get('/super-admin/ai-management', [SuperAdminSuiteApiController::class, 'aiManagement']);
    Route::post('/super-admin/emergency-action', [SuperAdminSuiteApiController::class, 'emergencyAction']);
    Route::post('/super-admin/backup-now', [SuperAdminSuiteApiController::class, 'triggerBackup']);
    Route::get('/super-admin/users', [SuperAdminSuiteApiController::class, 'globalUsers']);

    // Student Master Suite API (All 36 Features)
    Route::get('/student/dashboard', [StudentSuiteApiController::class, 'dashboard']);
    Route::get('/student/profile', [StudentSuiteApiController::class, 'profile']);
    Route::post('/student/profile', [StudentSuiteApiController::class, 'updateProfile']);
    Route::post('/student/leave', [StudentSuiteApiController::class, 'submitLeave']);
    Route::post('/student/counseling', [StudentSuiteApiController::class, 'submitCounseling']);
    Route::post('/student/ai-chat', [StudentSuiteApiController::class, 'aiChat']);
    
    // Student Core Learning (Prioritas 1 & 2)
    Route::get('/student/subjects', [StudentSuiteApiController::class, 'subjects']);
    Route::get('/student/schedule', [StudentSuiteApiController::class, 'schedule']);
    Route::get('/student/materials', [StudentSuiteApiController::class, 'materials']);
    Route::get('/student/assignments', [StudentSuiteApiController::class, 'assignments']);
    Route::get('/student/assignments/{id}', [StudentSuiteApiController::class, 'assignmentDetail']);
    Route::post('/student/assignments/{id}/submit', [StudentSuiteApiController::class, 'submitAssignment']);
    Route::get('/student/quizzes', [StudentSuiteApiController::class, 'quizzes']);
    
    // Student Academic (Prioritas 3)
    Route::get('/student/grades', [StudentSuiteApiController::class, 'grades']);
    Route::get('/student/attendance', [StudentSuiteApiController::class, 'attendance']);
    Route::get('/student/report-cards', [StudentSuiteApiController::class, 'reportCards']);

    // Student Services (Prioritas 4 & 5)
    Route::get('/student/announcements', [StudentSuiteApiController::class, 'announcements']);
    Route::get('/student/calendar', [StudentSuiteApiController::class, 'calendar']);
    Route::post('/student/leave', [StudentSuiteApiController::class, 'submitLeave']);
    Route::post('/student/counseling', [StudentSuiteApiController::class, 'submitCounseling']);
    Route::get('/student/discipline', [StudentSuiteApiController::class, 'discipline']);
    Route::get('/student/class-members', [StudentSuiteApiController::class, 'classMembers']);
    Route::get('/student/extracurricular', [StudentSuiteApiController::class, 'extracurricular']);

    // Teacher Master Suite API (All 38 Features)
    Route::get('/teacher/dashboard', [TeacherSuiteApiController::class, 'dashboard']);
    Route::get('/teacher/profile', [TeacherSuiteApiController::class, 'profile']);
    Route::post('/teacher/profile', [TeacherSuiteApiController::class, 'updateProfile']);
    Route::get('/teacher/subjects', [TeacherSuiteApiController::class, 'subjects']);
    Route::get('/teacher/classes', [TeacherSuiteApiController::class, 'classes']);
    Route::get('/teacher/schedule', [TeacherSuiteApiController::class, 'schedule']);
    Route::post('/teacher/sessions/start', [TeacherSuiteApiController::class, 'startSession']);
    Route::post('/teacher/session/start', [TeacherSuiteApiController::class, 'startSession']);
    Route::post('/teacher/sessions/{id}/finish', [TeacherSuiteApiController::class, 'finishSession']);
    Route::post('/teacher/session/{id}/finish', [TeacherSuiteApiController::class, 'finishSession']);
    Route::get('/teacher/journals', [TeacherSuiteApiController::class, 'journals']);
    Route::post('/teacher/journals', [TeacherSuiteApiController::class, 'storeJournal']);
    Route::post('/teacher/journal', [TeacherSuiteApiController::class, 'storeJournal']);
    Route::get('/teacher/attendance', [TeacherSuiteApiController::class, 'attendance']);
    Route::post('/teacher/attendance', [TeacherSuiteApiController::class, 'saveAttendance']);
    Route::get('/teacher/attendance/recap', [TeacherSuiteApiController::class, 'attendanceRecap']);
    Route::get('/teacher/materials', [TeacherSuiteApiController::class, 'materials']);
    Route::post('/teacher/materials', [TeacherSuiteApiController::class, 'storeMaterial']);
    Route::get('/teacher/assignments', [TeacherSuiteApiController::class, 'assignments']);
    Route::post('/teacher/assignments', [TeacherSuiteApiController::class, 'storeAssignment']);
    Route::post('/teacher/submissions/{id}/grade', [TeacherSuiteApiController::class, 'gradeSubmission']);
    Route::get('/teacher/quizzes', [TeacherSuiteApiController::class, 'quizzes']);
    Route::post('/teacher/quizzes', [TeacherSuiteApiController::class, 'storeQuiz']);
    Route::get('/teacher/exams', [TeacherSuiteApiController::class, 'exams']);
    Route::get('/teacher/question-bank', [TeacherSuiteApiController::class, 'questionBank']);
    Route::post('/teacher/question-bank', [TeacherSuiteApiController::class, 'storeQuestion']);
    Route::get('/teacher/assessments', [TeacherSuiteApiController::class, 'assessments']);
    Route::get('/teacher/gradebook', [TeacherSuiteApiController::class, 'gradebook']);
    Route::post('/teacher/gradebook', [TeacherSuiteApiController::class, 'saveGradebook']);
    Route::get('/teacher/grade-analysis', [TeacherSuiteApiController::class, 'gradeAnalysis']);
    Route::get('/teacher/remedial', [TeacherSuiteApiController::class, 'remedial']);
    Route::get('/teacher/student-academic/{id}', [TeacherSuiteApiController::class, 'studentAcademic']);
    Route::get('/teacher/announcements', [TeacherSuiteApiController::class, 'announcements']);
    Route::post('/teacher/announcements', [TeacherSuiteApiController::class, 'storeAnnouncement']);
    Route::get('/teacher/messages', [TeacherSuiteApiController::class, 'messages']);
    Route::post('/teacher/messages', [TeacherSuiteApiController::class, 'sendMessage']);
    Route::delete('/teacher/materials/{id}', [TeacherSuiteApiController::class, 'deleteMaterial']);
    Route::delete('/teacher/assignments/{id}', [TeacherSuiteApiController::class, 'deleteAssignment']);
    Route::post('/teacher/assessments', [TeacherSuiteApiController::class, 'saveAssessments']);
    Route::post('/teacher/security/password', [TeacherSuiteApiController::class, 'updatePassword']);
    Route::get('/teacher/calendar', [TeacherSuiteApiController::class, 'calendar']);
    Route::get('/teacher/notifications', [TeacherSuiteApiController::class, 'notifications']);
    Route::get('/teacher/progress', [TeacherSuiteApiController::class, 'progress']);
    Route::get('/teacher/curriculum', [TeacherSuiteApiController::class, 'curriculum']);
    Route::get('/teacher/teaching-notes', [TeacherSuiteApiController::class, 'teachingNotes']);
    Route::post('/teacher/teaching-notes', [TeacherSuiteApiController::class, 'storeTeachingNote']);
    Route::get('/teacher/class-performance', [TeacherSuiteApiController::class, 'classPerformance']);
    Route::post('/teacher/import-grades', [TeacherSuiteApiController::class, 'importGrades']);
    Route::get('/teacher/export', [TeacherSuiteApiController::class, 'exportData']);
    Route::get('/teacher/reports', [TeacherSuiteApiController::class, 'reports']);
    Route::get('/teacher/files', [TeacherSuiteApiController::class, 'files']);
    Route::get('/teacher/archives', [TeacherSuiteApiController::class, 'archives']);
    Route::post('/teacher/ai-chat', [TeacherSuiteApiController::class, 'aiAssistant']);
    Route::post('/teacher/ai-assistant', [TeacherSuiteApiController::class, 'aiAssistant']);

    // School Admin Master Suite API (All 48 Features + Phase 4A Master Data CRUD)
    Route::middleware('role:admin,superadmin')->group(function () {
        Route::get('/school-admin/dashboard', [SchoolAdminSuiteApiController::class, 'dashboard']);
        Route::get('/school-admin/profile', [SchoolAdminSuiteApiController::class, 'schoolProfile']);
        Route::post('/school-admin/profile', [SchoolAdminSuiteApiController::class, 'updateSchoolProfile']);
        Route::get('/school-admin/settings', [SchoolAdminSuiteApiController::class, 'schoolSettings']);
        Route::post('/school-admin/settings', [SchoolAdminSuiteApiController::class, 'updateSchoolSettings']);

        // User & Role Management
        Route::get('/school-admin/users', [SchoolAdminSuiteApiController::class, 'usersList']);
        Route::post('/school-admin/users', [SchoolAdminSuiteApiController::class, 'storeUser']);
        Route::get('/school-admin/users/{id}', [SchoolAdminSuiteApiController::class, 'showUser']);
        Route::put('/school-admin/users/{id}', [SchoolAdminSuiteApiController::class, 'updateUser']);
        Route::delete('/school-admin/users/{id}', [SchoolAdminSuiteApiController::class, 'destroyUser']);
        Route::post('/school-admin/users/{id}/assign-role', [SchoolAdminSuiteApiController::class, 'assignRole']);
        Route::post('/school-admin/users/{id}/reset-password', [SchoolAdminSuiteApiController::class, 'resetUserPassword']);
        Route::post('/school-admin/users/{id}/toggle-status', [SchoolAdminSuiteApiController::class, 'toggleUserStatus']);

        Route::get('/school-admin/students', [SchoolAdminSuiteApiController::class, 'studentsList']);
        Route::get('/school-admin/teachers', [SchoolAdminSuiteApiController::class, 'teachersList']);
        Route::get('/school-admin/parents', [SchoolAdminSuiteApiController::class, 'parentsList']);

        // Master Data: Classes / Rombel
        Route::get('/school-admin/classes', [SchoolAdminSuiteApiController::class, 'classesList']);
        Route::post('/school-admin/classes', [SchoolAdminSuiteApiController::class, 'storeClass']);
        Route::put('/school-admin/classes/{id}', [SchoolAdminSuiteApiController::class, 'updateClass']);
        Route::delete('/school-admin/classes/{id}', [SchoolAdminSuiteApiController::class, 'destroyClass']);

        // Master Data: Academic Years & Semesters
        Route::get('/school-admin/academic-years', [SchoolAdminSuiteApiController::class, 'academicYearsList']);
        Route::post('/school-admin/academic-years', [SchoolAdminSuiteApiController::class, 'storeAcademicYear']);
        Route::put('/school-admin/academic-years/{id}', [SchoolAdminSuiteApiController::class, 'updateAcademicYear']);
        Route::delete('/school-admin/academic-years/{id}', [SchoolAdminSuiteApiController::class, 'destroyAcademicYear']);
        Route::post('/school-admin/academic-years/{id}/set-active', [SchoolAdminSuiteApiController::class, 'setActiveAcademicYear']);

        Route::get('/school-admin/calendar', [SchoolAdminSuiteApiController::class, 'academicCalendar']);

        // Master Data: Subjects / Mata Pelajaran
        Route::get('/school-admin/subjects', [SchoolAdminSuiteApiController::class, 'subjectsList']);
        Route::post('/school-admin/subjects', [SchoolAdminSuiteApiController::class, 'storeSubject']);
        Route::put('/school-admin/subjects/{id}', [SchoolAdminSuiteApiController::class, 'updateSubject']);
        Route::delete('/school-admin/subjects/{id}', [SchoolAdminSuiteApiController::class, 'destroySubject']);

        Route::get('/school-admin/schedules', [SchoolAdminSuiteApiController::class, 'schedulesList']);
        Route::get('/school-admin/enrollment', [SchoolAdminSuiteApiController::class, 'studentEnrollment']);
        Route::get('/school-admin/attendance', [SchoolAdminSuiteApiController::class, 'attendanceMonitoring']);
        Route::post('/school-admin/attendance/correct', [SchoolAdminSuiteApiController::class, 'correctAttendance']);
        Route::get('/school-admin/learning-monitoring', [SchoolAdminSuiteApiController::class, 'learningMonitoring']);
        Route::get('/school-admin/academic-monitoring', [SchoolAdminSuiteApiController::class, 'academicMonitoring']);
        Route::post('/school-admin/grades/{id}/toggle-lock', [SchoolAdminSuiteApiController::class, 'toggleGradeLock']);
        Route::post('/school-admin/report-cards/generate', [SchoolAdminSuiteApiController::class, 'generateReportCardsBatch']);
        Route::get('/school-admin/student-affairs', [SchoolAdminSuiteApiController::class, 'studentAffairs']);
        Route::get('/school-admin/communication', [SchoolAdminSuiteApiController::class, 'communication']);
        Route::post('/school-admin/announcements', [SchoolAdminSuiteApiController::class, 'storeAnnouncement']);
        Route::get('/school-admin/documents', [SchoolAdminSuiteApiController::class, 'documentsList']);
        Route::get('/school-admin/import-export', [SchoolAdminSuiteApiController::class, 'importExportCenter']);
        Route::post('/school-admin/import/execute', [SchoolAdminSuiteApiController::class, 'executeSimulatedImport']);
        Route::get('/school-admin/reports', [SchoolAdminSuiteApiController::class, 'schoolReports']);
        Route::get('/school-admin/data-quality', [SchoolAdminSuiteApiController::class, 'dataQualityCenter']);
        Route::get('/school-admin/roles-and-audit', [SchoolAdminSuiteApiController::class, 'roleAndAudit']);
        Route::get('/school-admin/archives', [SchoolAdminSuiteApiController::class, 'historicalArchives']);
        Route::get('/school-admin/setup-wizard', [SchoolAdminSuiteApiController::class, 'setupWizard']);
        Route::get('/school-admin/health-subscription', [SchoolAdminSuiteApiController::class, 'systemHealthAndSubscription']);
    });

    // Principal / Kepala Sekolah Master Suite API (All 33 Executive Features)
    Route::get('/principal/dashboard', [PrincipalSuiteApiController::class, 'dashboard']);
    Route::get('/principal/profile', [PrincipalSuiteApiController::class, 'schoolProfile']);
    Route::get('/principal/students', [PrincipalSuiteApiController::class, 'studentMonitoring']);
    Route::get('/principal/teachers', [PrincipalSuiteApiController::class, 'teacherMonitoring']);
    Route::get('/principal/classes', [PrincipalSuiteApiController::class, 'classMonitoring']);
    Route::get('/principal/academic', [PrincipalSuiteApiController::class, 'academicMonitoring']);
    Route::get('/principal/subjects', [PrincipalSuiteApiController::class, 'subjectMonitoring']);
    Route::get('/principal/attendance', [PrincipalSuiteApiController::class, 'attendanceMonitoring']);
    Route::get('/principal/learning-monitoring', [PrincipalSuiteApiController::class, 'learningMonitoring']);
    Route::get('/principal/assessments', [PrincipalSuiteApiController::class, 'assessmentsMonitoring']);
    Route::get('/principal/grades', [PrincipalSuiteApiController::class, 'gradesMonitoring']);
    Route::get('/principal/report-cards', [PrincipalSuiteApiController::class, 'reportCards']);
    Route::get('/principal/approval-center', [PrincipalSuiteApiController::class, 'approvalCenter']);
    Route::post('/principal/approvals/process', [PrincipalSuiteApiController::class, 'processApproval']);
    Route::get('/principal/class-promotion', [PrincipalSuiteApiController::class, 'classPromotion']);
    Route::get('/principal/graduation', [PrincipalSuiteApiController::class, 'graduation']);
    Route::get('/principal/counseling', [PrincipalSuiteApiController::class, 'counselingMonitoring']);
    Route::get('/principal/discipline', [PrincipalSuiteApiController::class, 'disciplineMonitoring']);
    Route::get('/principal/achievements', [PrincipalSuiteApiController::class, 'achievements']);
    Route::get('/principal/extracurriculars', [PrincipalSuiteApiController::class, 'extracurriculars']);
    Route::get('/principal/calendar', [PrincipalSuiteApiController::class, 'calendar']);
    Route::get('/principal/announcements', [PrincipalSuiteApiController::class, 'announcements']);
    Route::post('/principal/announcements', [PrincipalSuiteApiController::class, 'storeAnnouncement']);
    Route::get('/principal/communication', [PrincipalSuiteApiController::class, 'communication']);
    Route::post('/principal/broadcast', [PrincipalSuiteApiController::class, 'sendBroadcast']);
    Route::get('/principal/reports', [PrincipalSuiteApiController::class, 'executiveReports']);
    Route::get('/principal/analytics', [PrincipalSuiteApiController::class, 'executiveAnalytics']);
    Route::get('/principal/early-warning', [PrincipalSuiteApiController::class, 'earlyWarning']);
    Route::get('/principal/period-comparison', [PrincipalSuiteApiController::class, 'periodComparison']);
    Route::get('/principal/performance-profile', [PrincipalSuiteApiController::class, 'performanceProfile']);
    Route::get('/principal/documents', [PrincipalSuiteApiController::class, 'documents']);
    Route::get('/principal/audit-trail', [PrincipalSuiteApiController::class, 'auditTrail']);
    Route::get('/principal/search', [PrincipalSuiteApiController::class, 'globalSearch']);
    Route::get('/principal/notifications', [PrincipalSuiteApiController::class, 'notifications']);

    // Tata Usaha (TU) Administrative Master Suite API (All 34 Features)
    Route::get('/tu/dashboard', [TuSuiteApiController::class, 'dashboard']);
    Route::get('/tu/students', [TuSuiteApiController::class, 'students']);
    Route::get('/tu/staff', [TuSuiteApiController::class, 'staff']);
    Route::get('/tu/letters', [TuSuiteApiController::class, 'letters']);
    Route::post('/tu/letters/generate-number', [TuSuiteApiController::class, 'generateLetterNumber']);
    Route::get('/tu/service-requests', [TuSuiteApiController::class, 'serviceRequests']);
    Route::get('/tu/mutations', [TuSuiteApiController::class, 'mutations']);
    Route::get('/tu/graduation-alumni', [TuSuiteApiController::class, 'graduationAndAlumni']);
    Route::get('/tu/attendance', [TuSuiteApiController::class, 'attendance']);
    Route::get('/tu/leaves', [TuSuiteApiController::class, 'leaves']);
    Route::get('/tu/inventory', [TuSuiteApiController::class, 'inventory']);
    Route::get('/tu/meetings', [TuSuiteApiController::class, 'meetings']);
    Route::get('/tu/data-quality', [TuSuiteApiController::class, 'dataQuality']);
    Route::get('/tu/audit-log', [TuSuiteApiController::class, 'auditLog']);

    // Homeroom / Wali Kelas Master Suite API (All 42 Features)
    Route::get('/homeroom/dashboard', [HomeroomSuiteApiController::class, 'dashboard']);
    Route::get('/homeroom/class-profile', [HomeroomSuiteApiController::class, 'classProfile']);
    Route::get('/homeroom/students', [HomeroomSuiteApiController::class, 'students']);
    Route::get('/homeroom/students/{id}/360', [HomeroomSuiteApiController::class, 'student360']);
    Route::get('/homeroom/attendance', [HomeroomSuiteApiController::class, 'attendance']);
    Route::post('/homeroom/attendance/correct', [HomeroomSuiteApiController::class, 'correctAttendance']);
    Route::get('/homeroom/academic', [HomeroomSuiteApiController::class, 'academicMonitoring']);
    Route::get('/homeroom/grades', [HomeroomSuiteApiController::class, 'gradesMonitoring']);
    Route::get('/homeroom/mastery', [HomeroomSuiteApiController::class, 'masteryMonitoring']);
    Route::get('/homeroom/assignments', [HomeroomSuiteApiController::class, 'assignmentMonitoring']);
    Route::get('/homeroom/learning-monitoring', [HomeroomSuiteApiController::class, 'learningMonitoring']);
    Route::get('/homeroom/subject-teachers', [HomeroomSuiteApiController::class, 'subjectTeachers']);
    Route::get('/homeroom/notes', [HomeroomSuiteApiController::class, 'homeroomNotes']);
    Route::post('/homeroom/notes', [HomeroomSuiteApiController::class, 'storeNote']);
    Route::get('/homeroom/timeline/{studentId}', [HomeroomSuiteApiController::class, 'studentTimeline']);
    Route::get('/homeroom/discipline', [HomeroomSuiteApiController::class, 'disciplineMonitoring']);
    Route::get('/homeroom/coaching', [HomeroomSuiteApiController::class, 'studentCoaching']);
    Route::post('/homeroom/coaching', [HomeroomSuiteApiController::class, 'storeCoaching']);
    Route::get('/homeroom/bk-referrals', [HomeroomSuiteApiController::class, 'bkReferrals']);
    Route::post('/homeroom/bk-referrals', [HomeroomSuiteApiController::class, 'storeBkReferral']);
    Route::get('/homeroom/multi-referrals', [HomeroomSuiteApiController::class, 'multiReferrals']);
    Route::get('/homeroom/parent-communication', [HomeroomSuiteApiController::class, 'parentCommunication']);
    Route::get('/homeroom/parent-communication/history', [HomeroomSuiteApiController::class, 'parentCommunicationHistory']);
    Route::post('/homeroom/parent-communication', [HomeroomSuiteApiController::class, 'storeParentCommunication']);
    Route::get('/homeroom/announcements', [HomeroomSuiteApiController::class, 'announcements']);
    Route::post('/homeroom/announcements', [HomeroomSuiteApiController::class, 'storeAnnouncement']);
    Route::get('/homeroom/calendar', [HomeroomSuiteApiController::class, 'calendar']);
    Route::get('/homeroom/schedule', [HomeroomSuiteApiController::class, 'schedule']);
    Route::get('/homeroom/organization', [HomeroomSuiteApiController::class, 'organization']);
    Route::post('/homeroom/organization', [HomeroomSuiteApiController::class, 'updateOrganization']);
    Route::get('/homeroom/activities', [HomeroomSuiteApiController::class, 'activities']);
    Route::post('/homeroom/activities', [HomeroomSuiteApiController::class, 'storeActivity']);
    Route::get('/homeroom/achievements', [HomeroomSuiteApiController::class, 'achievements']);
    Route::post('/homeroom/achievements', [HomeroomSuiteApiController::class, 'storeAchievement']);
    Route::get('/homeroom/extracurriculars', [HomeroomSuiteApiController::class, 'extracurriculars']);
    Route::get('/homeroom/report-cards', [HomeroomSuiteApiController::class, 'reportCards']);
    Route::post('/homeroom/report-cards/notes', [HomeroomSuiteApiController::class, 'saveReportCardNotes']);
    Route::get('/homeroom/report-cards/finalization', [HomeroomSuiteApiController::class, 'reportCardFinalization']);
    Route::post('/homeroom/report-cards/finalize', [HomeroomSuiteApiController::class, 'finalizeReportCard']);
    Route::get('/homeroom/class-promotion', [HomeroomSuiteApiController::class, 'classPromotion']);
    Route::post('/homeroom/class-promotion/recommend', [HomeroomSuiteApiController::class, 'savePromotionRecommendation']);
    Route::get('/homeroom/graduation', [HomeroomSuiteApiController::class, 'graduation']);
    Route::get('/homeroom/documents', [HomeroomSuiteApiController::class, 'documents']);
    Route::post('/homeroom/documents/request-tu', [HomeroomSuiteApiController::class, 'requestTuDocument']);
    Route::get('/homeroom/reports', [HomeroomSuiteApiController::class, 'reports']);
    Route::get('/homeroom/analytics', [HomeroomSuiteApiController::class, 'analytics']);
    Route::get('/homeroom/early-warning', [HomeroomSuiteApiController::class, 'earlyWarning']);
    Route::get('/homeroom/comparison', [HomeroomSuiteApiController::class, 'comparison']);
    Route::get('/homeroom/parent-meetings', [HomeroomSuiteApiController::class, 'parentMeetings']);
    Route::post('/homeroom/parent-meetings', [HomeroomSuiteApiController::class, 'storeParentMeeting']);
    Route::get('/homeroom/homeroom-notes-private', [HomeroomSuiteApiController::class, 'homeroomNotesPrivate']);
    Route::post('/homeroom/homeroom-notes-private', [HomeroomSuiteApiController::class, 'storeHomeroomNotesPrivate']);
    Route::get('/homeroom/notifications', [HomeroomSuiteApiController::class, 'notifications']);
    Route::get('/homeroom/search', [HomeroomSuiteApiController::class, 'search']);
    Route::get('/homeroom/profile', [HomeroomSuiteApiController::class, 'profile']);
    Route::get('/homeroom/help', [HomeroomSuiteApiController::class, 'help']);

    // ==========================================
    // PORTAL KONSELOR BK (46 FITUR MASTER SUITE)
    // ==========================================
    Route::get('/bk/dashboard', [BkSuiteApiController::class, 'dashboard']);
    Route::get('/bk/students', [BkSuiteApiController::class, 'students']);
    Route::get('/bk/students/{id}/profile', [BkSuiteApiController::class, 'studentProfile']);
    Route::get('/bk/cases', [BkSuiteApiController::class, 'cases']);
    Route::post('/bk/cases', [BkSuiteApiController::class, 'storeCase']);
    Route::put('/bk/cases/{id}', [BkSuiteApiController::class, 'updateCase']);
    Route::get('/bk/referrals', [BkSuiteApiController::class, 'referrals']);
    Route::post('/bk/referrals/{id}/action', [BkSuiteApiController::class, 'actionReferral']);
    Route::get('/bk/sessions/individual', [BkSuiteApiController::class, 'individualSessions']);
    Route::post('/bk/sessions/individual', [BkSuiteApiController::class, 'storeIndividualSession']);
    Route::get('/bk/sessions/group', [BkSuiteApiController::class, 'groupSessions']);
    Route::post('/bk/sessions/group', [BkSuiteApiController::class, 'storeGroupSession']);
    Route::get('/bk/schedule', [BkSuiteApiController::class, 'schedule']);
    Route::get('/bk/bookings', [BkSuiteApiController::class, 'bookings']);
    Route::post('/bk/bookings/{id}/action', [BkSuiteApiController::class, 'actionBooking']);
    Route::get('/bk/assessments', [BkSuiteApiController::class, 'assessments']);
    Route::get('/bk/self-assessments', [BkSuiteApiController::class, 'selfAssessments']);
    Route::get('/bk/interventions', [BkSuiteApiController::class, 'interventions']);
    Route::post('/bk/interventions', [BkSuiteApiController::class, 'storeIntervention']);
    Route::get('/bk/follow-ups', [BkSuiteApiController::class, 'followUps']);
    Route::post('/bk/follow-ups', [BkSuiteApiController::class, 'storeFollowUp']);
    Route::get('/bk/student-progress', [BkSuiteApiController::class, 'studentProgress']);
    Route::get('/bk/observations', [BkSuiteApiController::class, 'observations']);
    Route::post('/bk/observations', [BkSuiteApiController::class, 'storeObservation']);
    Route::get('/bk/communications/students', [BkSuiteApiController::class, 'studentCommunications']);
    Route::get('/bk/communications/parents', [BkSuiteApiController::class, 'parentCommunications']);
    Route::get('/bk/homeroom-coordination', [BkSuiteApiController::class, 'homeroomCoordination']);
    Route::get('/bk/teacher-coordination', [BkSuiteApiController::class, 'teacherCoordination']);
    Route::get('/bk/student-support-plans', [BkSuiteApiController::class, 'studentSupportPlans']);
    Route::get('/bk/early-warning', [BkSuiteApiController::class, 'earlyWarning']);
    Route::post('/bk/early-warning/{id}/verify', [BkSuiteApiController::class, 'verifyEarlyWarning']);
    Route::get('/bk/career-and-talents', [BkSuiteApiController::class, 'careerAndTalents']);
    Route::get('/bk/programs', [BkSuiteApiController::class, 'programs']);
    Route::post('/bk/programs', [BkSuiteApiController::class, 'storeProgram']);
    Route::get('/bk/bullying-cases', [BkSuiteApiController::class, 'bullyingCases']);
    Route::get('/bk/discipline-referrals', [BkSuiteApiController::class, 'disciplineReferrals']);
    Route::get('/bk/documents-and-consents', [BkSuiteApiController::class, 'documentsAndConsents']);
    Route::get('/bk/privacy-and-audit', [BkSuiteApiController::class, 'privacyAndAudit']);
    Route::get('/bk/reports-and-analytics', [BkSuiteApiController::class, 'reportsAndAnalytics']);
    Route::get('/bk/external-referrals', [BkSuiteApiController::class, 'externalReferrals']);
    Route::get('/bk/emergency-cases', [BkSuiteApiController::class, 'emergencyCases']);
    Route::get('/bk/notifications', [BkSuiteApiController::class, 'notifications']);
    Route::get('/bk/search', [BkSuiteApiController::class, 'search']);
    Route::get('/bk/profile', [BkSuiteApiController::class, 'profile']);
    Route::get('/bk/help', [BkSuiteApiController::class, 'help']);

    // ==========================================
    // PORTAL ORANG TUA / WALI MURID (36 FITUR MASTER SUITE)
    // ==========================================
    Route::get('/parent/dashboard', [ParentSuiteApiController::class, 'dashboard']);
    Route::get('/parent/profile', [ParentSuiteApiController::class, 'profile']);
    Route::get('/parent/children', [ParentSuiteApiController::class, 'children']);
    Route::post('/parent/switch-child', [ParentSuiteApiController::class, 'switchChild']);
    Route::get('/parent/schedule', [ParentSuiteApiController::class, 'schedule']);
    Route::get('/parent/attendance', [ParentSuiteApiController::class, 'attendance']);
    Route::get('/parent/leave-requests', [ParentSuiteApiController::class, 'leaveRequests']);
    Route::post('/parent/submit-leave', [ParentSuiteApiController::class, 'submitLeave']);
    Route::get('/parent/academic', [ParentSuiteApiController::class, 'academic']);
    Route::get('/parent/grades', [ParentSuiteApiController::class, 'grades']);
    Route::get('/parent/progress', [ParentSuiteApiController::class, 'progress']);
    Route::get('/parent/assignments', [ParentSuiteApiController::class, 'assignments']);
    Route::get('/parent/exams', [ParentSuiteApiController::class, 'exams']);
    Route::get('/parent/materials', [ParentSuiteApiController::class, 'materials']);
    Route::get('/parent/report-cards', [ParentSuiteApiController::class, 'reportCards']);
    Route::get('/parent/homeroom', [ParentSuiteApiController::class, 'homeroom']);
    Route::get('/parent/communication', [ParentSuiteApiController::class, 'communication']);
    Route::post('/parent/send-message', [ParentSuiteApiController::class, 'sendMessage']);
    Route::get('/parent/counseling', [ParentSuiteApiController::class, 'counseling']);
    Route::get('/parent/development', [ParentSuiteApiController::class, 'development']);
    Route::get('/parent/achievements', [ParentSuiteApiController::class, 'achievements']);
    Route::get('/parent/extracurriculars', [ParentSuiteApiController::class, 'extracurriculars']);
    Route::post('/parent/extracurriculars/register', [ParentSuiteApiController::class, 'registerExtracurricular']);
    Route::get('/parent/calendar', [ParentSuiteApiController::class, 'calendar']);
    Route::get('/parent/announcements', [ParentSuiteApiController::class, 'announcements']);
    Route::get('/parent/notifications', [ParentSuiteApiController::class, 'notifications']);
    Route::get('/parent/administration', [ParentSuiteApiController::class, 'administration']);
    Route::get('/parent/documents', [ParentSuiteApiController::class, 'documents']);
    Route::get('/parent/services', [ParentSuiteApiController::class, 'services']);
    Route::post('/parent/services/request', [ParentSuiteApiController::class, 'submitServiceRequest']);
    Route::get('/parent/parent-meetings', [ParentSuiteApiController::class, 'parentMeetings']);
    Route::post('/parent/parent-meetings/confirm', [ParentSuiteApiController::class, 'confirmMeeting']);
    Route::get('/parent/school-events', [ParentSuiteApiController::class, 'schoolEvents']);
    Route::get('/parent/learning-monitoring', [ParentSuiteApiController::class, 'learningMonitoring']);
    Route::get('/parent/progress-overview', [ParentSuiteApiController::class, 'progressOverview']);
    Route::get('/parent/early-warning', [ParentSuiteApiController::class, 'earlyWarning']);
    Route::get('/parent/reports', [ParentSuiteApiController::class, 'reports']);
    Route::get('/parent/search', [ParentSuiteApiController::class, 'search']);
    Route::get('/parent/notification-preferences', [ParentSuiteApiController::class, 'notificationPreferences']);
    Route::post('/parent/notification-preferences', [ParentSuiteApiController::class, 'updateNotificationPreferences']);
    Route::get('/parent/account-security', [ParentSuiteApiController::class, 'accountSecurity']);
    Route::post('/parent/account/report-relation', [ParentSuiteApiController::class, 'reportRelationIssue']);
    Route::get('/parent/help', [ParentSuiteApiController::class, 'help']);
    Route::post('/parent/ai-chat', [ParentSuiteApiController::class, 'aiAssistant']);

    // Core Dashboard & Journeys
    Route::get('/dashboard', [AcademicApiController::class, 'dashboard']);

    // Academic Interactive Features
    Route::get('/classes', [AcademicApiController::class, 'classes']);
    Route::get('/subjects', [AcademicApiController::class, 'subjects']);
    Route::get('/academic-classes', [AcademicApiController::class, 'classes']);
    Route::get('/academic-subjects', [AcademicApiController::class, 'subjects']);
    Route::get('/assignments', [AcademicApiController::class, 'assignments']);
    Route::post('/assignments/{id}/submit', [AcademicApiController::class, 'submitAssignment']);
    Route::get('/materials', [AcademicApiController::class, 'materials']);
    Route::get('/grades', [AcademicApiController::class, 'grades']);
    Route::get('/attendance', [AcademicApiController::class, 'attendanceHistory']);

    // Space Belajar (Personal Learning)
    Route::get('/space-belajar', [AcademicApiController::class, 'spaceBelajar']);
    Route::get('/space-belajar/explorer', [AcademicApiController::class, 'getExplorer']);
    Route::post('/space-belajar/folder', [AcademicApiController::class, 'createFolder']);
    Route::post('/space-belajar/note', [AcademicApiController::class, 'createNote']);
    Route::delete('/space-belajar/item', [AcademicApiController::class, 'deleteItem']);
    Route::get('/space-belajar/calendar', [AcademicApiController::class, 'getCalendar']);
    Route::post('/space-belajar/calendar/event', [AcademicApiController::class, 'addCalendarEvent']);

    // Arsip Belajar AI (Smart Study Archive Studio - 4 Pillars & Multimodal)
    Route::get('/arsip-belajar/notes', [ArsipBelajarController::class, 'index']);
    Route::post('/arsip-belajar/notes', [ArsipBelajarController::class, 'store']);
    Route::get('/arsip-belajar/notes/{id}', [ArsipBelajarController::class, 'show']);
    Route::put('/arsip-belajar/notes/{id}', [ArsipBelajarController::class, 'update']);
    Route::delete('/arsip-belajar/notes/{id}', [ArsipBelajarController::class, 'destroy']);
    Route::post('/arsip-belajar/notes/{id}/summary', [ArsipBelajarController::class, 'generateSummary']);
    Route::post('/arsip-belajar/notes/{id}/flashcards', [ArsipBelajarController::class, 'generateFlashcards']);
    Route::post('/arsip-belajar/notes/{id}/mindmap', [ArsipBelajarController::class, 'generateMindmap']);
    Route::post('/arsip-belajar/notes/{id}/chat', [ArsipBelajarController::class, 'chatWithNote']);
    Route::post('/arsip-belajar/quiz/generate', [ArsipBelajarController::class, 'generateQuiz']);
    Route::post('/arsip-belajar/quiz/save', [ArsipBelajarController::class, 'saveQuizResult']);
    Route::get('/arsip-belajar/quiz/history', [ArsipBelajarController::class, 'getQuizHistory']);

    // Folders for Arsip Belajar
    Route::post('/arsip-belajar/folders', [ArsipBelajarController::class, 'createFolder']);
    Route::delete('/arsip-belajar/folders/{id}', [ArsipBelajarController::class, 'deleteFolder']);
    Route::put('/arsip-belajar/notes/{id}/folder', [ArsipBelajarController::class, 'moveNoteFolder']);

    // WhatsApp Bot Integration Student Portal
    Route::get('/arsip-belajar/whatsapp/status', [ArsipBelajarController::class, 'getWaStatus']);
    Route::post('/arsip-belajar/whatsapp/link', [ArsipBelajarController::class, 'linkWa']);
    Route::delete('/arsip-belajar/whatsapp/link', [ArsipBelajarController::class, 'unlinkWa']);

    // Student Master Settings & Identity System (One Person One Identity, Sessions, Lifecyle, Export)
    Route::get('/student-identity/basic-profile', [\App\Http\Controllers\StudentIdentityController::class, 'getBasicProfile']);
    Route::post('/student-identity/verify', [\App\Http\Controllers\StudentIdentityController::class, 'verifyAndGetCompleteProfile']);
    Route::post('/student-identity/update-school-data', [\App\Http\Controllers\StudentIdentityController::class, 'updateSchoolData']);
    Route::post('/student-identity/update-personal-data', [\App\Http\Controllers\StudentIdentityController::class, 'updatePersonalData']);

    Route::get('/student/settings/overview', [StudentSettingsApiController::class, 'getOverview']);
    Route::post('/student/settings/update-username', [StudentSettingsApiController::class, 'updateUsername']);
    Route::post('/student/settings/update-password', [StudentSettingsApiController::class, 'updatePassword']);
    Route::post('/student/settings/link-google', [StudentSettingsApiController::class, 'linkGoogle']);
    Route::delete('/student/settings/unlink-google', [StudentSettingsApiController::class, 'unlinkGoogle']);
    Route::post('/student/settings/link-whatsapp', [StudentSettingsApiController::class, 'linkWhatsapp']);
    Route::delete('/student/settings/unlink-whatsapp', [StudentSettingsApiController::class, 'unlinkWhatsapp']);
    Route::post('/student/settings/subscribe-personal', [StudentSettingsApiController::class, 'subscribePersonal']);
    Route::post('/student/settings/preferences', [StudentSettingsApiController::class, 'updatePreferences']);
    Route::post('/student/settings/revoke-session', [StudentSettingsApiController::class, 'revokeSession']);
    Route::get('/student/settings/export-data', [StudentSettingsApiController::class, 'exportData']);

    // Password Recovery for Students (Self-Service with Linked Email or Admin Assisted)
    Route::post('/auth/recovery/request', [StudentSettingsApiController::class, 'requestPasswordRecovery']);
    Route::post('/auth/recovery/reset', [StudentSettingsApiController::class, 'resetPasswordWithToken']);
    Route::post('/school-admin/students/{id}/verify-and-reset-password', [StudentSettingsApiController::class, 'adminVerifyAndResetPassword']);
    });

    // Public / Bot Webhook Route for WhatsApp Bot Daemon
    Route::post('/arsip-belajar/whatsapp/webhook', [ArsipBelajarController::class, 'waWebhook']);
    Route::post('/public/auth/recovery/request', [StudentSettingsApiController::class, 'requestPasswordRecovery']);
    Route::post('/public/auth/recovery/reset', [StudentSettingsApiController::class, 'resetPasswordWithToken']);
};

// Route group V1
Route::prefix('v1')->group(function () use ($registerInteractiveRoutes) {
    // Interactive Endpoints
    $registerInteractiveRoutes();

    // V1 Structured Resources
    Route::apiResource('schools', SchoolController::class, ['as' => 'api']);
    Route::apiResource('academic-years', AcademicYearController::class, ['as' => 'api']);
    Route::apiResource('subjects', SubjectController::class, ['as' => 'api']);
    Route::apiResource('classes', ClassController::class, ['as' => 'api']);
    Route::post('/classes/{id}/enroll', [ClassController::class, 'enroll']);
    Route::apiResource('users', UserController::class);
    Route::get('/users/students', [UserController::class, 'students']);
    Route::get('/users/teachers', [UserController::class, 'teachers']);
    
    Route::apiResource('timetables', TimetableController::class);
    
    Route::get('/teaching-sessions/today', [TeachingSessionController::class, 'today']);
    Route::apiResource('teaching-sessions', TeachingSessionController::class);
    Route::post('/teaching-sessions/{id}/attendance', [AttendanceController::class, 'store']);
    
    Route::apiResource('assessments', AssessmentController::class);
    Route::post('/assessments/{id}/submissions', [AssessmentController::class, 'submit']);
    Route::post('/assessments/{id}/grades', [AssessmentController::class, 'grade']);
    
    // Exams & CBT
    Route::post('/exams', [ExamController::class, 'store']);
    Route::post('/exams/{id}/questions', [ExamController::class, 'addQuestion']);
    Route::post('/exams/{id}/submit', [ExamController::class, 'submitAnswers']);
    
    // Gradebooks
    Route::get('/gradebooks/{id}', [GradebookController::class, 'show']);
    Route::post('/gradebooks/{id}/lock', [GradebookController::class, 'lock']);
    Route::post('/gradebooks/{id}/unlock', [GradebookController::class, 'unlock']);
});

// Fallback legacy without /v1 prefix for direct client requests
$registerInteractiveRoutes();
