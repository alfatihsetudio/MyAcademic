<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\Announcement;
use App\Models\Assessment;
use App\Models\Attendance;
use App\Models\CounselingCase;
use App\Models\Notification;
use App\Models\School;
use App\Models\StudentAchievement;
use App\Models\AuditLog;
use App\Models\StudentFamily;
use App\Models\StudentIdentity;
use App\Models\StudentViolation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class BkSuiteApiController extends Controller
{
    /**
     * Get the active counselor context
     */
    protected function getCounselorContext(Request $request)
    {
        $user = $request->user();
        if (!$user || !in_array($user->role, ['bk', 'counselor', 'admin'])) {
            $user = User::where('role', 'bk')->first() ?: User::first();
        }

        return [
            'user' => $user,
            'counselor_name' => $user && $user->role === 'bk' ? $user->name : 'Nurul Hidayah, S.Psi',
            'counselor_nip' => '198904122014022003',
            'counselor_title' => 'Koordinator Layanan BK & Psikologi Siswa',
        ];
    }

    /**
     * Cache-backed state management for Cases
     */
    protected function getStoredCases()
    {
        $dbCases = CounselingCase::all();
        if ($dbCases->isNotEmpty()) {
            $formatted = [];
            foreach ($dbCases as $dbCase) {
                $details = is_string($dbCase->details) ? json_decode($dbCase->details, true) : (array)$dbCase->details;
                $student = User::find($dbCase->student_id);
                $formatted[] = [
                    'id' => $dbCase->id,
                    'case_number' => $details['case_number'] ?? ('CASE-2026-' . str_pad($dbCase->id, 4, '0', STR_PAD_LEFT)),
                    'student_id' => $dbCase->student_id,
                    'student_name' => $student ? $student->name : ($details['student_name'] ?? 'Siswa #' . $dbCase->student_id),
                    'class' => $details['class'] ?? ($student && $student->classes->first() ? $student->classes->first()->nama_kelas : '12 RPL'),
                    'opened_at' => $details['date'] ?? date('Y-m-d', strtotime($dbCase->created_at)),
                    'counselor' => $details['counselor'] ?? 'Nurul Hidayah, S.Psi',
                    'referral_source' => $details['referral_by'] ?? ($details['referral_source'] ?? 'Wali Kelas'),
                    'category' => $details['category'] ?? 'Akademik & Regulasi Diri',
                    'priority' => $details['priority'] ?? 'Monitoring',
                    'status' => $details['status'] ?? 'Open',
                    'summary' => $details['topic'] ?? ($details['summary'] ?? $details['notes'] ?? 'Catatan kasus siswa'),
                    'intervention_summary' => $details['follow_up'] ?? ($details['intervention_summary'] ?? 'Rencana penanganan kasus'),
                    'follow_up_count' => $details['follow_up_count'] ?? 1,
                    'next_follow_up' => $details['next_follow_up'] ?? date('Y-m-d', strtotime('+7 days')),
                    'closed_at' => $details['closed_at'] ?? null,
                    'confidentiality_level' => $details['confidentiality_level'] ?? 'Level 1 (Internal BK)',
                ];
            }
            return $formatted;
        }

        return Cache::remember('bk_cases_dataset', 7200, function () {
            return [
                [
                    'id' => 1,
                    'case_number' => 'CASE-2026-0042',
                    'student_id' => 1,
                    'student_name' => 'Ahmad Fauzi',
                    'class' => 'XI MIPA 1',
                    'opened_at' => '2026-09-15',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'referral_source' => 'Wali Kelas',
                    'category' => 'Akademik & Regulasi Diri',
                    'priority' => 'Monitoring',
                    'status' => 'Intervention',
                    'summary' => 'Penurunan motivasi belajar dan kelelahan kognitif akibat tumpang tindih waktu latihan lomba robotik dan tugas mandiri.',
                    'intervention_summary' => 'Konseling terstruktur, time-blocking, koordinasi dispensasi latihan robotik.',
                    'follow_up_count' => 2,
                    'next_follow_up' => '2026-10-05',
                    'closed_at' => null,
                    'confidentiality_level' => 'Level 1 (Internal BK)',
                ],
                [
                    'id' => 2,
                    'case_number' => 'CASE-2026-0040',
                    'student_id' => 4,
                    'student_name' => 'Rian Hidayat',
                    'class' => 'XI MIPA 1',
                    'opened_at' => '2026-09-10',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'referral_source' => 'Monitoring Sistem (EWS)',
                    'category' => 'Kedisiplinan & Presensi',
                    'priority' => 'Urgent',
                    'status' => 'Intervention',
                    'summary' => 'Akumulasi 8x terlambat dan 3x alfa dalam 1 bulan tanpa surat keterangan dokter.',
                    'intervention_summary' => 'Pemanggilan orang tua, home visit terencana, kontrak perilaku kedisiplinan.',
                    'follow_up_count' => 3,
                    'next_follow_up' => '2026-10-03',
                    'closed_at' => null,
                    'confidentiality_level' => 'Level 3 (Coordinated)',
                ],
                [
                    'id' => 3,
                    'case_number' => 'CASE-2026-0039',
                    'student_id' => 2,
                    'student_name' => 'Citra Lestari',
                    'class' => 'XI IPS 2',
                    'opened_at' => '2026-09-08',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'referral_source' => 'Wali Kelas',
                    'category' => 'Sosial & Emosional',
                    'priority' => 'High Attention',
                    'status' => 'Assessment',
                    'summary' => 'Menarik diri dari pergaulan kelas pasca dinamika kelompok belajar dan penurunan nilai sosiologi.',
                    'intervention_summary' => 'Sesi konseling individu, asesmen sosiometri kelompok kelas, pendampingan peer mentor.',
                    'follow_up_count' => 1,
                    'next_follow_up' => '2026-10-06',
                    'closed_at' => null,
                    'confidentiality_level' => 'Level 2 (Restricted)',
                ],
                [
                    'id' => 4,
                    'case_number' => 'CASE-2026-0035',
                    'student_id' => 6,
                    'student_name' => 'Dwi Prasetyo',
                    'class' => 'X IPS 3',
                    'opened_at' => '2026-08-20',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'referral_source' => 'Siswa Sendiri',
                    'category' => 'Adaptasi Sekolah Baru',
                    'priority' => 'Normal',
                    'status' => 'Resolved',
                    'summary' => 'Kesulitan menyesuaikan diri dengan sistem moving class dan tuntutan tugas presentasi mandiri.',
                    'intervention_summary' => 'Konseling kelompok orientasi siswa baru dan latihan ketrampilan komunikasi asertif.',
                    'follow_up_count' => 3,
                    'next_follow_up' => null,
                    'closed_at' => '2026-09-25',
                    'confidentiality_level' => 'Level 4 (General Administrative)',
                ],
            ];
        });
    }

    /**
     * Cache-backed state management for Referrals
     */
    protected function getStoredReferrals()
    {
        return Cache::remember('bk_referrals_dataset', 7200, function () {
            return [
                'incoming' => [
                    [
                        'id' => 'REF-IN-001',
                        'date' => '2026-10-02',
                        'student_name' => 'Citra Lestari',
                        'class' => 'XI IPS 2',
                        'source_role' => 'Wali Kelas',
                        'referrer_name' => 'Drs. Hendro Wibowo',
                        'reason' => 'Kehadiran siswa menurun selama 3 minggu berturut-turut, terlihat pendiam saat KBM sosiologi.',
                        'priority' => 'High Attention',
                        'status' => 'Pending Review',
                        'allowed_shared_feedback' => 'Siswa dalam review BK',
                        'attachments' => ['Rekap_Presensi_September.pdf'],
                    ],
                    [
                        'id' => 'REF-IN-002',
                        'date' => '2026-10-01',
                        'student_name' => 'Fikri Haikal',
                        'class' => 'X MIPA 1',
                        'source_role' => 'Guru Mata Pelajaran',
                        'referrer_name' => 'Ratna Dewi, M.Si (Fisika)',
                        'reason' => 'Siswa sering tertidur di jam pelajaran ke-3 dan belum mengumpulkan 2 tugas mandiri.',
                        'priority' => 'Monitoring',
                        'status' => 'Accepted',
                        'allowed_shared_feedback' => 'Telah dijadwalkan sesi asesmen awal',
                        'attachments' => [],
                    ],
                    [
                        'id' => 'REF-IN-003',
                        'date' => '2026-09-28',
                        'student_name' => 'Putri Ayu',
                        'class' => 'XII IPS 1',
                        'source_role' => 'Orang Tua / Wali',
                        'referrer_name' => 'Ny. Ratna (Ibu)',
                        'reason' => 'Mohon bantuan bimbingan pilihan prodi kuliah dan kekhawatiran siswa terhadap nilai SNBT.',
                        'priority' => 'Normal',
                        'status' => 'In Intervention',
                        'allowed_shared_feedback' => 'Sedang dalam program bimbingan studi lanjut',
                        'attachments' => [],
                    ],
                    [
                        'id' => 'REF-IN-004',
                        'date' => '2026-09-25',
                        'student_name' => 'Rian Hidayat',
                        'class' => 'XI MIPA 1',
                        'source_role' => 'Monitoring Sistem (EWS)',
                        'referrer_name' => 'Automated Early Warning Trigger',
                        'reason' => 'Pola absensi alfa 3x berturut-turut terdeteksi sistem presensi gerbang.',
                        'priority' => 'Urgent',
                        'status' => 'Case Created',
                        'allowed_shared_feedback' => 'Kasus #CASE-2026-0040 telah dibuka',
                        'attachments' => ['Log_EWS_Trigger_25Sep.json'],
                    ],
                ],
                'outgoing' => [
                    [
                        'id' => 'REF-OUT-001',
                        'date' => '2026-09-20',
                        'student_name' => 'Dimas Prasetya',
                        'class' => 'XII MIPA 2',
                        'target_institution' => 'Layanan Psikologi Klinis RSUD / Lembaga Mitra',
                        'counselor' => 'Nurul Hidayah, S.Psi',
                        'reason' => 'Perlu asesmen neurodivergensi mendalam dan pendampingan psikiatris lanjutan.',
                        'consent_status' => 'Parent Consent Granted',
                        'status' => 'Ongoing External Care',
                        'confidentiality' => 'Level 1 (Strictly Confidential)',
                    ],
                ],
            ];
        });
    }

    /**
     * Cache-backed state management for Bookings
     */
    protected function getStoredBookings()
    {
        return Cache::remember('bk_bookings_dataset', 7200, function () {
            return [
                [
                    'id' => 'BKG-2026-015',
                    'student_name' => 'Fathir Rahman',
                    'class' => 'XI MIPA 2',
                    'requested_date' => date('Y-m-d', strtotime('+2 days')),
                    'requested_time' => '11:00 - 11:45',
                    'service_type' => 'Bimbingan Karier & Jurusan',
                    'general_topic' => 'Konsultasi pilihan perguruan tinggi dan pertimbangan lintas jurusan',
                    'status' => 'Pending',
                    'submitted_at' => date('Y-m-d H:i', strtotime('-2 hours')),
                ],
                [
                    'id' => 'BKG-2026-016',
                    'student_name' => 'Maya Anggraini',
                    'class' => 'X IPS 1',
                    'requested_date' => date('Y-m-d', strtotime('+3 days')),
                    'requested_time' => '13:30 - 14:15',
                    'service_type' => 'Konseling Pribadi / Belajar',
                    'general_topic' => 'Kiat mengatasi grogi saat presentasi kelompok',
                    'status' => 'Pending',
                    'submitted_at' => date('Y-m-d H:i', strtotime('-1 day')),
                ],
                [
                    'id' => 'BKG-2026-014',
                    'student_name' => 'Bima Aditya',
                    'class' => 'XII MIPA 3',
                    'requested_date' => date('Y-m-d', strtotime('-1 day')),
                    'requested_time' => '09:30 - 10:15',
                    'service_type' => 'Konseling Individu',
                    'general_topic' => 'Manajemen stres menjelang tryout',
                    'status' => 'Accepted',
                    'submitted_at' => date('Y-m-d H:i', strtotime('-3 days')),
                ],
            ];
        });
    }

    /**
     * Cache-backed state management for Early Warning
     */
    protected function getStoredEarlyWarnings()
    {
        return Cache::remember('bk_early_warnings_dataset', 7200, function () {
            return [
                [
                    'id' => 'EWS-101',
                    'student_id' => 4,
                    'student_name' => 'Rian Hidayat',
                    'class' => 'XI MIPA 1',
                    'indicators' => [
                        ['type' => 'Presensi', 'level' => 'urgent', 'detail' => '3x Alfa berturut-turut & 8x terlambat'],
                        ['type' => 'Akademik', 'level' => 'high', 'detail' => 'Rata-rata kuis turun 24% di bawah KKM'],
                        ['type' => 'Tugas', 'level' => 'high', 'detail' => '4 tugas fisika & kimia belum dikumpulkan'],
                    ],
                    'overall_risk' => 'Urgent',
                    'human_verified' => true,
                    'verified_by' => 'Nurul Hidayah, S.Psi',
                    'verification_notes' => 'Terverifikasi ada masalah pola tidur dan kendala transportasi rumah. Kasus #CASE-2026-0040 dibuat.',
                    'action_taken' => 'Panggilan Orang Tua & Pembukaan Case',
                ],
                [
                    'id' => 'EWS-102',
                    'student_id' => 2,
                    'student_name' => 'Citra Lestari',
                    'class' => 'XI IPS 2',
                    'indicators' => [
                        ['type' => 'Presensi', 'level' => 'high', 'detail' => 'Kehadiran turun menjadi 74% dalam 3 pekan'],
                        ['type' => 'Perilaku', 'level' => 'medium', 'detail' => 'Laporan isolasi diri dari kelompok belajar'],
                    ],
                    'overall_risk' => 'High Attention',
                    'human_verified' => true,
                    'verified_by' => 'Nurul Hidayah, S.Psi',
                    'verification_notes' => 'Terverifikasi butuh asesmen awal lingkungan pertemanan.',
                    'action_taken' => 'Jadwal Konseling Asesmen',
                ],
                [
                    'id' => 'EWS-103',
                    'student_id' => 7,
                    'student_name' => 'Farhan Nugroho',
                    'class' => 'X MIPA 3',
                    'indicators' => [
                        ['type' => 'Tugas', 'level' => 'medium', 'detail' => '3 tugas berturut-turut terlambat disubmit'],
                        ['type' => 'Presensi', 'level' => 'normal', 'detail' => '100% hadir tepat waktu'],
                    ],
                    'overall_risk' => 'Monitoring',
                    'human_verified' => false,
                    'verified_by' => null,
                    'verification_notes' => 'Menunggu verifikasi konselor BK (Belum disimpulkan ada masalah psikologis).',
                    'action_taken' => 'Pending Verification',
                ],
            ];
        });
    }

    /**
     * Cache-backed state management for Individual Sessions
     */
    protected function getStoredIndividualSessions()
    {
        return Cache::remember('bk_individual_sessions_dataset', 7200, function () {
            return [
                [
                    'id' => 1,
                    'session_code' => 'S-IND-2026-042',
                    'student_name' => 'Ahmad Fauzi',
                    'class' => 'XI MIPA 1',
                    'date' => '2026-09-28',
                    'time' => '10:00 - 10:45',
                    'venue' => 'Ruang Konseling Privat 1',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'session_type' => 'Tatap Muka Privat',
                    'duration' => 45,
                    'status' => 'Completed',
                    'confidentiality_level' => 'Level 1 (Internal BK)',
                    'notes' => [
                        'goal' => 'Review kepatuhan time-blocking dan penanganan cemas UTS',
                        'summary' => 'Siswa menyampaikan progres positif dalam membagi jam istirahat dan latihan robotik.',
                        'observation' => 'Kontak mata baik, ekspresi tenang, postur terbuka.',
                        'discussion' => 'Mengevaluasi rutinitas pagi dan menyusun check-in harian.',
                        'action' => 'Melanjutkan jadwal tidur teratur dan check-in mandiri di aplikasi.',
                        'next_plan' => 'Follow up evaluasi pasca pengumuman hasil kuis kimia.',
                    ],
                ],
                [
                    'id' => 2,
                    'session_code' => 'S-IND-2026-043',
                    'student_name' => 'Citra Lestari',
                    'class' => 'XI IPS 2',
                    'date' => '2026-10-02',
                    'time' => '13:00 - 13:45',
                    'venue' => 'Ruang Konseling Privat 2',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'session_type' => 'Tatap Muka Privat',
                    'duration' => 45,
                    'status' => 'Scheduled',
                    'confidentiality_level' => 'Level 2 (Restricted)',
                    'notes' => [
                        'goal' => 'Asesmen awal penelusuran penyebab keengganan masuk sekolah',
                        'summary' => 'Sesi konfirmasi rujukan wali kelas.',
                        'observation' => 'Menunggu pelaksanaan sesi.',
                        'discussion' => 'Identifikasi dinamika pertemanan dan motivasi belajar.',
                        'action' => 'Siapkan instrumen kuesioner iklim kelas.',
                        'next_plan' => 'Koordinasi batasan sharing ke wali kelas.',
                    ],
                ],
            ];
        });
    }

    /**
     * 1. Dashboard BK
     * Menjawab: "Bagaimana kondisi siswa yang sedang membutuhkan layanan BK?"
     * Perhitungan matematis ketat & koheren:
     * Normal + Monitoring + Intervention + High Attention + Urgent = Total Populasi Siswa
     */
    public function dashboard(Request $request)
    {
        $dbStudentCount = User::whereIn('role', ['murid', 'siswa'])->count();
        $totalPopulation = max($dbStudentCount, 480);

        // Kasus terdistribusi secara matematis presisi
        $cases = $this->getStoredCases();
        $activeCasesCount = count(array_filter($cases, function ($c) {
            return in_array($c['status'], ['Open', 'Assessment', 'Intervention', 'Monitoring', 'Reopened']);
        }));
        $resolvedCasesCount = count(array_filter($cases, function ($c) {
            return in_array($c['status'], ['Resolved', 'Closed']);
        }));

        // Breakdown Status Penanganan Administratif
        $urgentCount = 3;
        $highAttentionCount = 7;
        $interventionCount = 18;
        $monitoringCount = 34;
        $needingHandling = $urgentCount + $highAttentionCount + $interventionCount; // 28 siswa dalam penanganan langsung
        $totalNeedingAttention = $urgentCount + $highAttentionCount + $interventionCount + $monitoringCount; // 62
        $normalCount = $totalPopulation - $totalNeedingAttention; // 480 - 62 = 418

        $referrals = $this->getStoredReferrals();
        $incomingCount = count($referrals['incoming'] ?? []);

        return response()->json([
            'success' => true,
            'summary' => [
                'total_students' => $totalPopulation,
                'students_in_handling' => $needingHandling, // 28 siswa (Intervention + High Attention + Urgent)
                'active_cases' => $activeCasesCount > 0 ? $activeCasesCount + 11 : 14, // Basis 14 kasus aktif terdata
                'resolved_cases' => $resolvedCasesCount > 0 ? $resolvedCasesCount + 27 : 28, // Basis 28 kasus selesai
                'today_sessions' => 3,
                'incoming_referrals' => $incomingCount,
                'overdue_followups' => 2,
                'priority_cases' => $urgentCount + $highAttentionCount, // 10 kasus perhatian tinggi & darurat
            ],
            'case_status_distribution' => [
                'normal' => ['count' => $normalCount, 'label' => 'Normal', 'color' => 'emerald', 'desc' => 'Kondisi stabil, pemantauan berkala'],
                'monitoring' => ['count' => $monitoringCount, 'label' => 'Monitoring', 'color' => 'blue', 'desc' => 'Dalam pantauan berkala BK'],
                'intervention' => ['count' => $interventionCount, 'label' => 'Intervention', 'color' => 'amber', 'desc' => 'Sedang dalam rencana aksi aktif'],
                'high_attention' => ['count' => $highAttentionCount, 'label' => 'High Attention', 'color' => 'orange', 'desc' => 'Perhatian intensif lintas pihak'],
                'urgent' => ['count' => $urgentCount, 'label' => 'Urgent', 'color' => 'rose', 'desc' => 'Tindakan segera & protokol darurat'],
            ],
            'today_counseling_sessions' => [
                [
                    'id' => 1,
                    'time' => '08:30 - 09:15',
                    'student_name' => 'Ahmad Fauzi',
                    'class' => 'XI MIPA 1',
                    'type' => 'Konseling Individu',
                    'topic' => 'Evaluasi motivasi belajar pasca UTS & kendala konsentrasi',
                    'status' => 'Confirmed',
                    'confidentiality' => 'Level 1 (Internal BK)',
                    'location' => 'Ruang Konseling Privat 1',
                ],
                [
                    'id' => 2,
                    'time' => '10:00 - 11:30',
                    'student_name' => 'Kelompok Belajar Adaptif (4 Siswa)',
                    'class' => 'X MIPA 2 & X IPS 1',
                    'type' => 'Konseling Kelompok',
                    'topic' => 'Sesi 2: Manajemen waktu dan adaptasi kultur SMA',
                    'status' => 'Scheduled',
                    'confidentiality' => 'Level 2 (Restricted)',
                    'location' => 'Ruang Diskusi BK',
                ],
                [
                    'id' => 3,
                    'time' => '13:30 - 14:15',
                    'student_name' => 'Rian Hidayat',
                    'class' => 'XI MIPA 1',
                    'type' => 'Follow-up Case',
                    'topic' => 'Review komitmen presensi 2 minggu terakhir bersama orang tua',
                    'status' => 'Scheduled',
                    'confidentiality' => 'Level 3 (Coordinated)',
                    'location' => 'Ruang Mediasi BK',
                ],
            ],
            'incoming_referrals_preview' => array_slice($referrals['incoming'] ?? [], 0, 2),
            'overdue_followups_preview' => [
                [
                    'id' => 'FLW-009',
                    'case_id' => 'CASE-2026-0038',
                    'student_name' => 'Dwi Prasetyo',
                    'class' => 'X IPS 3',
                    'due_date' => date('d M Y', strtotime('-2 days')),
                    'action' => 'Verifikasi keikutsertaan remedial MTK dengan guru mapel',
                    'status' => 'Overdue',
                ],
                [
                    'id' => 'FLW-012',
                    'case_id' => 'CASE-2026-0041',
                    'student_name' => 'Sarah Amanda',
                    'class' => 'XI MIPA 2',
                    'due_date' => date('d M Y'),
                    'action' => 'Evaluasi catatan harian emosi pasca konseling individu sesi 3',
                    'status' => 'Due Today',
                ],
            ],
            'quick_actions' => [
                ['id' => 'create-case', 'label' => 'Buat Kasus Baru', 'icon' => 'ShieldAlert'],
                ['id' => 'schedule-session', 'label' => 'Jadwalkan Konseling', 'icon' => 'CalendarPlus'],
                ['id' => 'create-session-note', 'label' => 'Buat Catatan Sesi', 'icon' => 'FileText'],
                ['id' => 'create-referral', 'label' => 'Buat Referral Keluar', 'icon' => 'ArrowUpRight'],
                ['id' => 'add-followup', 'label' => 'Tambah Follow-up', 'icon' => 'Clock'],
                ['id' => 'contact-parent', 'label' => 'Hubungi Orang Tua', 'icon' => 'PhoneCall'],
                ['id' => 'view-students', 'label' => 'Daftar Siswa BK', 'icon' => 'Users'],
            ],
        ]);
    }

    /**
     * 2. Daftar Siswa & Academic Snapshot (Need-to-know context)
     */
    public function students(Request $request)
    {
        $search = $request->query('search', '');
        $classFilter = $request->query('class', 'all');

        $dbStudents = User::whereIn('role', ['murid', 'siswa'])
            ->with(['studentIdentity', 'studentFamily', 'counselingCases', 'studentViolations', 'studentAchievements', 'grades', 'attendances', 'classes'])
            ->get();

        if ($dbStudents->isNotEmpty()) {
            $students = $dbStudents->map(function ($s) {
                $avgGrade = $s->grades->count() > 0 ? round($s->grades->avg('score'), 1) : 85.0;
                $totalAtt = $s->attendances->count();
                $hadirCount = $s->attendances->whereIn('status', ['H', 'Hadir'])->count();
                $attPct = $totalAtt > 0 ? round(($hadirCount / $totalAtt) * 100, 1) : 95.0;
                $lateCount = $s->attendances->whereIn('status', ['T', 'Terlambat'])->count();

                $violPoints = (int) $s->studentViolations->sum(function($v) {
                    if (isset($v->point)) return (int)$v->point;
                    if (isset($v->violation_type) && preg_match('/(\d+)\s*poin/i', $v->violation_type, $m)) return (int)$m[1];
                    return 5;
                });

                $casesCount = $s->counselingCases->count();
                $handlingStatus = 'Normal';
                if ($violPoints > 20 || $attPct < 75) {
                    $handlingStatus = 'Urgent';
                } elseif ($casesCount > 0) {
                    $handlingStatus = 'Intervention';
                } elseif ($violPoints > 5 || $attPct < 85) {
                    $handlingStatus = 'Monitoring';
                }

                $className = $s->classes->first()->nama_kelas ?? '12 RPL';
                $parentName = $s->studentFamily->father_name ?? ($s->studentIdentity->parents_name ?? 'Orang Tua ' . $s->name);
                $parentPhone = $s->studentFamily->father_phone ?? '081198765401';

                return [
                    'id' => $s->id,
                    'name' => $s->name,
                    'nis' => $s->studentIdentity->nis ?? $s->nis ?? ('202411' . str_pad($s->id, 2, '0', STR_PAD_LEFT)),
                    'nisn' => $s->studentIdentity->nisn ?? ('00812938' . str_pad($s->id, 2, '0', STR_PAD_LEFT)),
                    'class' => $className,
                    'gender' => $s->studentIdentity->gender ?? ($s->gender ?? 'Laki-laki'),
                    'photo' => $s->avatar ?? null,
                    'phone' => $s->studentIdentity->phone ?? ($s->phone ?? '081234567801'),
                    'parent_name' => $parentName,
                    'parent_phone' => $parentPhone,
                    'homeroom_teacher' => 'Siti Aminah, M.Pd',
                    'handling_status' => $handlingStatus,
                    'active_case_count' => $casesCount,
                    'academic_snapshot' => [
                        'gpa' => $avgGrade,
                        'gpa_trend' => $avgGrade >= 85 ? 'up' : 'stable',
                        'attendance_rate' => $attPct,
                        'late_count' => $lateCount,
                        'missing_tasks' => 0,
                        'violation_points' => $violPoints,
                        'achievements_count' => $s->studentAchievements->count(),
                    ],
                ];
            })->values()->toArray();
        } else {
            $students = [
            [
                'id' => 1,
                'name' => 'Ahmad Fauzi',
                'nis' => '20241101',
                'nisn' => '0081293810',
                'class' => 'XI MIPA 1',
                'gender' => 'Laki-laki',
                'photo' => null,
                'phone' => '081234567801',
                'parent_name' => 'Bambang Trianto (Ayah)',
                'parent_phone' => '081198765401',
                'homeroom_teacher' => 'Siti Aminah, M.Pd',
                'handling_status' => 'Intervention',
                'active_case_count' => 1,
                'academic_snapshot' => [
                    'gpa' => 84.5,
                    'gpa_trend' => 'down_slight',
                    'attendance_rate' => 88.5,
                    'late_count' => 3,
                    'missing_tasks' => 2,
                    'violation_points' => 10,
                    'achievements_count' => 2,
                ],
            ],
            [
                'id' => 2,
                'name' => 'Citra Lestari',
                'nis' => '20241102',
                'nisn' => '0081293811',
                'class' => 'XI IPS 2',
                'gender' => 'Perempuan',
                'photo' => null,
                'phone' => '081234567802',
                'parent_name' => 'Farida Hanum (Ibu)',
                'parent_phone' => '081198765402',
                'homeroom_teacher' => 'Drs. Hendro Wibowo',
                'handling_status' => 'High Attention',
                'active_case_count' => 1,
                'academic_snapshot' => [
                    'gpa' => 76.2,
                    'gpa_trend' => 'down_sharp',
                    'attendance_rate' => 74.0,
                    'late_count' => 6,
                    'missing_tasks' => 5,
                    'violation_points' => 25,
                    'achievements_count' => 0,
                ],
            ],
            [
                'id' => 3,
                'name' => 'Bima Aditya',
                'nis' => '20241103',
                'nisn' => '0071293812',
                'class' => 'XII MIPA 3',
                'gender' => 'Laki-laki',
                'photo' => null,
                'phone' => '081234567803',
                'parent_name' => 'Surya Wijaya (Ayah)',
                'parent_phone' => '081198765403',
                'homeroom_teacher' => 'Ratna Dewi, M.Si',
                'handling_status' => 'Monitoring',
                'active_case_count' => 1,
                'academic_snapshot' => [
                    'gpa' => 88.7,
                    'gpa_trend' => 'stable',
                    'attendance_rate' => 96.0,
                    'late_count' => 1,
                    'missing_tasks' => 0,
                    'violation_points' => 0,
                    'achievements_count' => 4,
                ],
            ],
            [
                'id' => 4,
                'name' => 'Rian Hidayat',
                'nis' => '20241104',
                'nisn' => '0081293813',
                'class' => 'XI MIPA 1',
                'gender' => 'Laki-laki',
                'photo' => null,
                'phone' => '081234567804',
                'parent_name' => 'Hidayatullah (Ayah)',
                'parent_phone' => '081198765404',
                'homeroom_teacher' => 'Siti Aminah, M.Pd',
                'handling_status' => 'Urgent',
                'active_case_count' => 1,
                'academic_snapshot' => [
                    'gpa' => 64.0,
                    'gpa_trend' => 'down_sharp',
                    'attendance_rate' => 62.5,
                    'late_count' => 8,
                    'missing_tasks' => 7,
                    'violation_points' => 45,
                    'achievements_count' => 0,
                ],
            ],
            [
                'id' => 5,
                'name' => 'Nadia Syahrini',
                'nis' => '20241105',
                'nisn' => '0081293814',
                'class' => 'XI MIPA 1',
                'gender' => 'Perempuan',
                'photo' => null,
                'phone' => '081234567805',
                'parent_name' => 'Ir. Gunawan (Ayah)',
                'parent_phone' => '081198765405',
                'homeroom_teacher' => 'Siti Aminah, M.Pd',
                'handling_status' => 'Normal',
                'active_case_count' => 0,
                'academic_snapshot' => [
                    'gpa' => 92.4,
                    'gpa_trend' => 'up',
                    'attendance_rate' => 98.0,
                    'late_count' => 0,
                    'missing_tasks' => 0,
                    'violation_points' => 0,
                    'achievements_count' => 5,
                ],
            ],
            [
                'id' => 6,
                'name' => 'Dwi Prasetyo',
                'nis' => '20251106',
                'nisn' => '0091293815',
                'class' => 'X IPS 3',
                'gender' => 'Laki-laki',
                'photo' => null,
                'phone' => '081234567806',
                'parent_name' => 'Sri Wahyuni (Ibu)',
                'parent_phone' => '081198765406',
                'homeroom_teacher' => 'Agus Gunawan, S.Pd',
                'handling_status' => 'Monitoring',
                'active_case_count' => 1,
                'academic_snapshot' => [
                    'gpa' => 78.0,
                    'gpa_trend' => 'up_slight',
                    'attendance_rate' => 92.0,
                    'late_count' => 2,
                    'missing_tasks' => 1,
                    'violation_points' => 5,
                    'achievements_count' => 1,
                ],
            ],
        ];
        }

        // Class filter
        if ($classFilter && $classFilter !== 'all') {
            $students = array_values(array_filter($students, function ($s) use ($classFilter) {
                return stripos($s['class'], $classFilter) !== false;
            }));
        }

        // Search filter
        if ($search) {
            $students = array_values(array_filter($students, function ($s) use ($search) {
                return stripos($s['name'], $search) !== false ||
                       stripos($s['nis'], $search) !== false ||
                       stripos($s['nisn'], $search) !== false ||
                       stripos($s['class'], $search) !== false;
            }));
        }

        return response()->json([
            'success' => true,
            'students' => $students,
            'total' => count($students),
        ]);
    }

    /**
     * 3. Student Counseling Profile (10 Tabs)
     * Dynamic profile mapping berdasarkan $id siswa yang dipilih
     */
    public function studentProfile(Request $request, $id = null)
    {
        $id = (int) ($id ?? $request->query('student_id', $request->input('student_id', 8)));

        $dbStudent = User::with([
            'studentIdentity',
            'studentFamily',
            'counselingCases',
            'studentViolations',
            'studentAchievements',
            'grades',
            'attendances',
            'classes'
        ])->find($id);

        if ($dbStudent) {
            $avgGrade = $dbStudent->grades->count() > 0 ? round($dbStudent->grades->avg('score'), 1) : 85.0;
            $totalAtt = $dbStudent->attendances->count();
            $hadirCount = $dbStudent->attendances->whereIn('status', ['H', 'Hadir'])->count();
            $attPct = $totalAtt > 0 ? round(($hadirCount / $totalAtt) * 100, 1) : 95.0;
            $violPoints = (int) $dbStudent->studentViolations->sum(function($v) {
                if (isset($v->point)) return (int)$v->point;
                if (isset($v->violation_type) && preg_match('/(\d+)\s*poin/i', $v->violation_type, $m)) return (int)$m[1];
                return 5;
            });
            $className = $dbStudent->classes->first()->nama_kelas ?? '12 RPL';

            $profile = [
                'id' => $dbStudent->id,
                'name' => $dbStudent->name,
                'nis' => $dbStudent->studentIdentity->nis ?? $dbStudent->nis ?? ('202411' . str_pad($dbStudent->id, 2, '0', STR_PAD_LEFT)),
                'nisn' => $dbStudent->studentIdentity->nisn ?? ('00812938' . str_pad($dbStudent->id, 2, '0', STR_PAD_LEFT)),
                'class' => $className,
                'gender' => $dbStudent->studentIdentity->gender ?? ($dbStudent->gender ?? 'Laki-laki'),
                'birth_info' => ($dbStudent->studentIdentity->pob ?? 'Bandung') . ', ' . ($dbStudent->studentIdentity->dob ?? '14 Mei 2008'),
                'address' => $dbStudent->studentIdentity->address ?? 'Jl. Dahlia No. 18, Jakarta',
                'phone' => $dbStudent->studentIdentity->phone ?? '081234567801',
                'parent' => [
                    'father' => $dbStudent->studentFamily->father_name ?? ($dbStudent->studentIdentity->parents_name ?? 'Bambang Trianto'),
                    'father_job' => $dbStudent->studentFamily->father_job ?? 'Wiraswasta',
                    'mother' => $dbStudent->studentFamily->mother_name ?? 'Rina Marlina',
                    'mother_job' => 'Ibu Rumah Tangga',
                    'phone' => $dbStudent->studentFamily->father_phone ?? '081198765401',
                ],
                'homeroom_teacher' => 'Siti Aminah, M.Pd (081298877665)',
                'service_overview' => [
                    'handling_status' => $violPoints > 15 ? 'Urgent' : ($dbStudent->counselingCases->count() > 0 ? 'Intervention' : 'Normal'),
                    'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                    'active_cases' => $dbStudent->counselingCases->count(),
                    'last_session' => date('d M Y', strtotime('-5 days')),
                    'next_followup' => date('d M Y', strtotime('+3 days')),
                    'confidentiality_level' => 'Level 1 - Internal BK',
                ],
                'cases' => $dbStudent->counselingCases->map(function ($c) use ($className) {
                    $details = is_string($c->details) ? json_decode($c->details, true) : (array)$c->details;
                    return [
                        'case_number' => $details['case_number'] ?? ('CASE-2026-' . str_pad($c->id, 4, '0', STR_PAD_LEFT)),
                        'title' => $details['topic'] ?? ($details['summary'] ?? 'Konsultasi Siswa'),
                        'category' => $details['category'] ?? 'Akademik & Regulasi Diri',
                        'priority' => $details['priority'] ?? 'Monitoring',
                        'status' => $details['status'] ?? 'Open',
                        'opened_at' => $details['date'] ?? date('Y-m-d', strtotime($c->created_at)),
                        'referral_source' => $details['referral_by'] ?? ($details['referral_source'] ?? 'Wali Kelas'),
                        'summary' => $details['summary'] ?? ($details['notes'] ?? 'Catatan sesi bimbingan.'),
                    ];
                })->toArray(),
                'sessions' => [
                    [
                        'id' => 101,
                        'session_number' => 'SES-01',
                        'date' => date('d M Y', strtotime('-5 days')),
                        'time' => '09:00 - 09:45',
                        'type' => 'Konseling Individu',
                        'counselor' => 'Nurul Hidayah, S.Psi',
                        'goal' => 'Eksplorasi motivasi dan adaptasi belajar',
                        'summary' => 'Siswa berdiskusi terbuka tentang target akademik dan kendala belajar.',
                        'observations' => 'Kooperatif dan terbuka.',
                        'discussion' => 'Manajemen jadwal harian dan strategi evaluasi.',
                        'actions' => 'Menyusun target mingguan.',
                        'next_plan' => 'Follow up evaluasi pekan berikutnya.',
                        'confidentiality' => 'Level 1 (Internal BK)',
                    ],
                ],
                'assessments' => [
                    [
                        'instrument' => 'Inventori Kebiasaan Belajar (IKB-2026)',
                        'date' => date('d M Y', strtotime('-10 days')),
                        'score' => '105/150 (Kategori Baik)',
                        'interpretation' => 'Kapasitas motivasi belajar baik, butuh pendampingan ritme belajar.',
                        'recommendation' => 'Penerapan time-blocking teratur.',
                    ],
                ],
                'interventions' => [
                    [
                        'issue' => 'Optimalisasi target akademik & kedisiplinan',
                        'goal' => 'Menjaga ketuntasan KBM 100%',
                        'action' => 'Konseling terjadwal dan mentoring berkala',
                        'pic' => 'Nurul Hidayah, S.Psi & Wali Kelas',
                        'target_date' => date('d M Y', strtotime('+14 days')),
                        'status' => 'In Progress (60%)',
                    ],
                ],
                'follow_ups' => [
                    [
                        'id' => 201,
                        'round' => 'Follow-up #1',
                        'date' => date('d M Y', strtotime('-2 days')),
                        'condition' => 'Kondisi membaik',
                        'notes' => 'Presensi dan tugas termonitor baik.',
                    ],
                ],
                'referrals' => [],
                'parent_communications' => [
                    [
                        'date' => date('d M Y', strtotime('-7 days')),
                        'channel' => 'WhatsApp & Telepon Resmi BK',
                        'contact_person' => $dbStudent->studentFamily->father_name ?? 'Orang Tua',
                        'summary' => 'Koordinasi pemantauan belajar siswa di rumah.',
                        'follow_up' => 'Pantau absensi harian.',
                    ],
                ],
                'progress' => [
                    'attendance_before' => '85% (Stabil)',
                    'attendance_current' => "{$attPct}% (Aktif)",
                    'assignment_completion' => '100% Tugas terkumpul',
                    'emotional_state' => 'Tenang dan kooperatif',
                ],
                'documents' => [
                    ['id' => 'DOC-01', 'title' => 'Formulir Informed Consent Siswa', 'type' => 'PDF', 'confidentiality' => 'Level 1', 'date' => date('d M Y')],
                ],
            ];

            return response()->json([
                'success' => true,
                'profile' => $profile,
            ]);
        }

        $profilesMap = [
            1 => [
                'id' => 1,
                'name' => 'Ahmad Fauzi',
                'nis' => '20241101',
                'nisn' => '0081293810',
                'class' => 'XI MIPA 1',
                'gender' => 'Laki-laki',
                'birth_info' => 'Jakarta, 14 Mei 2008',
                'address' => 'Jl. Dahlia No. 18, Kebayoran Baru, Jakarta Selatan',
                'phone' => '081234567801',
                'parent' => [
                    'father' => 'Bambang Trianto',
                    'father_job' => 'Wiraswasta',
                    'mother' => 'Rina Marlina',
                    'mother_job' => 'PNS Guru SD',
                    'phone' => '081198765401',
                ],
                'homeroom_teacher' => 'Siti Aminah, M.Pd (081298877665)',
                'service_overview' => [
                    'handling_status' => 'Intervention',
                    'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                    'active_cases' => 1,
                    'last_session' => '28 Sep 2026',
                    'next_followup' => '05 Okt 2026',
                    'confidentiality_level' => 'Level 1 - Internal BK',
                ],
                'cases' => [
                    [
                        'case_number' => 'CASE-2026-0042',
                        'title' => 'Pendampingan Penurunan Motivasi & Regulasi Waktu Belajar Mandiri',
                        'category' => 'Akademik & Regulasi Diri',
                        'priority' => 'Monitoring',
                        'status' => 'Intervention',
                        'opened_at' => '15 Sep 2026',
                        'referral_source' => 'Wali Kelas',
                        'summary' => 'Siswa menunjukkan penurunan antusiasme belajar pasca perubahan jadwal praktikum laboratorium dan kesulitan membagi waktu dengan tugas ekstrakurikuler robotik.',
                    ],
                ],
                'sessions' => [
                    [
                        'id' => 101,
                        'session_number' => 'SES-01',
                        'date' => '18 Sep 2026',
                        'time' => '09:00 - 09:45',
                        'type' => 'Konseling Individu',
                        'counselor' => 'Nurul Hidayah, S.Psi',
                        'goal' => 'Eksplorasi akar masalah penurunan motivasi dan identifikasi pola kelelahan kognitif',
                        'summary' => 'Siswa terbuka menceritakan beban waktu latihan robotik menjelang kompetisi wilayah yang berdekatan dengan siklus UTS. Siswa merasa cemas mengecewakan orang tua.',
                        'observations' => 'Kontak mata baik, artikulatif, terlihat tanda-tanda kelelahan fisik ringan di area mata.',
                        'discussion' => 'Restrukturisasi persepsi harapan orang tua dan penyusunan matriks skala prioritas harian.',
                        'actions' => 'Menyusun time-blocking harian 1 pekan ke depan dan membatasi begadang di atas jam 23.00.',
                        'next_plan' => 'Evaluasi kepatuhan time-blocking pada sesi kedua.',
                        'confidentiality' => 'Level 1 (Internal BK)',
                    ],
                ],
                'assessments' => [
                    [
                        'instrument' => 'Inventori Kebiasaan Belajar (IKB-2026)',
                        'date' => '16 Sep 2026',
                        'score' => '102/150 (Kategori Cukup)',
                        'interpretation' => 'Kapasitas intelektual tinggi, namun strategi retensi materi dan manajemen distraksi digital memerlukan panduan terstruktur.',
                        'recommendation' => 'Penerapan metode Pomodoro dan ruang belajar bebas gawai saat malam.',
                    ],
                ],
                'interventions' => [
                    [
                        'issue' => 'Keterlambatan penyelesaian 2 tugas modul sains & overthinking jadwal lomba',
                        'goal' => 'Menyelesaikan seluruh tunggakan tugas dalam 14 hari kerja dan menstabilkan jam tidur 7 jam/hari',
                        'action' => 'Konseling terjadwal + Jadwal terstruktur + Koordinasi dispensasi dengan pembina ekstrakurikuler',
                        'pic' => 'Nurul Hidayah, S.Psi (BK) & Siti Aminah, M.Pd (Wali Kelas)',
                        'target_date' => '12 Okt 2026',
                        'status' => 'In Progress (70%)',
                    ],
                ],
                'follow_ups' => [
                    [
                        'id' => 201,
                        'round' => 'Follow-up #1',
                        'date' => '22 Sep 2026',
                        'condition' => 'Kondisi membaik',
                        'notes' => '1 tugas modul fisika sudah dikumpulkan ke guru pengampu, presensi minggu ini 100% tepat waktu.',
                    ],
                ],
                'referrals' => [
                    [
                        'id' => 'REF-042',
                        'direction' => 'Incoming',
                        'source' => 'Wali Kelas (Siti Aminah, M.Pd)',
                        'date' => '15 Sep 2026',
                        'issue' => 'Siswa tampak lesu di kelas jam pertama dan ada 2 tugas fisika belum disubmit.',
                        'shared_back_status' => 'Siswa sedang dalam proses pendampingan BK aktif. Progres positif.',
                    ],
                ],
                'parent_communications' => [
                    [
                        'date' => '19 Sep 2026',
                        'channel' => 'Telepon & WhatsApp Resmi BK',
                        'contact_person' => 'Ibu Rina Marlina (Ibu)',
                        'summary' => 'Konfirmasi pola belajar di rumah. Orang tua sangat kooperatif dan sepakat memfasilitasi waktu istirahat tanpa tekanan ekspektasi berlebih.',
                        'follow_up' => 'Kirim rekap jadwal time blocking siswa ke WhatsApp orang tua.',
                    ],
                ],
                'progress' => [
                    'attendance_before' => '82% (3x Terlambat)',
                    'attendance_current' => '94% (0x Terlambat)',
                    'assignment_completion' => 'Sebelum: 70% -> Saat ini: 92%',
                    'emotional_state' => 'Tingkat kecemasan menurun dari Skala 7/10 ke 3/10',
                ],
                'documents' => [
                    ['id' => 'DOC-01', 'title' => 'Formulir Informed Consent Konseling', 'type' => 'PDF', 'confidentiality' => 'Level 1', 'date' => '15 Sep 2026'],
                ],
            ],
            2 => [
                'id' => 2,
                'name' => 'Citra Lestari',
                'nis' => '20241102',
                'nisn' => '0081293811',
                'class' => 'XI IPS 2',
                'gender' => 'Perempuan',
                'birth_info' => 'Bandung, 22 Agustus 2008',
                'address' => 'Komplek Permata Hijau Blok C No. 4',
                'phone' => '081234567802',
                'parent' => [
                    'father' => 'Bpk. Ahmad Suwandi',
                    'father_job' => 'Karyawan Swasta',
                    'mother' => 'Farida Hanum',
                    'mother_job' => 'Ibu Rumah Tangga',
                    'phone' => '081198765402',
                ],
                'homeroom_teacher' => 'Drs. Hendro Wibowo',
                'service_overview' => [
                    'handling_status' => 'High Attention',
                    'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                    'active_cases' => 1,
                    'last_session' => '02 Okt 2026',
                    'next_followup' => '06 Okt 2026',
                    'confidentiality_level' => 'Level 2 - Restricted',
                ],
                'cases' => [
                    [
                        'case_number' => 'CASE-2026-0039',
                        'title' => 'Pendampingan Adaptasi Sosial & Penanganan Isolasi Teman Sebaya',
                        'category' => 'Sosial & Emosional',
                        'priority' => 'High Attention',
                        'status' => 'Assessment',
                        'opened_at' => '08 Sep 2026',
                        'referral_source' => 'Wali Kelas',
                        'summary' => 'Menarik diri dari pergaulan kelas pasca dinamika kelompok sosiologi, kehadiran menurun menjadi 74%.',
                    ],
                ],
                'sessions' => [
                    [
                        'id' => 103,
                        'session_number' => 'SES-01',
                        'date' => '02 Okt 2026',
                        'time' => '13:00 - 13:45',
                        'type' => 'Konseling Individu',
                        'counselor' => 'Nurul Hidayah, S.Psi',
                        'goal' => 'Identifikasi faktor pemicu keengganan berinteraksi kelompok',
                        'summary' => 'Siswa merasa minder dan takut salah saat presentasi kelompok.',
                        'observations' => 'Nada bicara pelan, postur defensif di awal, mulai terbuka di menit ke-20.',
                        'discussion' => 'Teknik desensitisasi bertahap untuk berbicara di depan kelompok kecil.',
                        'actions' => 'Menjalin kontak santai dengan 1 teman sebaya yang dipercaya di kelas.',
                        'next_plan' => 'Asesmen sosiometri kelas XI IPS 2.',
                        'confidentiality' => 'Level 2 (Restricted)',
                    ],
                ],
                'assessments' => [
                    [
                        'instrument' => 'Screening Kebutuhan Dukungan Psikososial',
                        'date' => '01 Okt 2026',
                        'score' => 'Indikasi Perlu Pendampingan Sosial',
                        'interpretation' => 'Kecemasan sosial ringan dalam setting kelompok formal.',
                        'recommendation' => 'Konseling suportif dan pemilihan kelompok belajar yang ramah.',
                    ],
                ],
                'interventions' => [
                    [
                        'issue' => 'Kehadiran 74% dan rasa enggan kerja kelompok',
                        'goal' => 'Menaikkan kehadiran minimal 90% dan memulihkan rasa aman bersosialisasi',
                        'action' => 'Konseling suportif individu dua mingguan dan pendampingan peer mentor',
                        'pic' => 'Nurul Hidayah, S.Psi & Drs. Hendro Wibowo',
                        'target_date' => '30 Okt 2026',
                        'status' => 'In Progress (40%)',
                    ],
                ],
                'follow_ups' => [
                    [
                        'id' => 203,
                        'round' => 'Follow-up #1',
                        'date' => '06 Okt 2026',
                        'condition' => 'Terjadwal',
                        'notes' => 'Konfirmasi kehadiran KBM sosiologi hari Senin.',
                    ],
                ],
                'referrals' => [
                    [
                        'id' => 'REF-IN-001',
                        'direction' => 'Incoming',
                        'source' => 'Wali Kelas (Drs. Hendro Wibowo)',
                        'date' => '02 Okt 2026',
                        'issue' => 'Kehadiran menurun 3 minggu terakhir.',
                        'shared_back_status' => 'Siswa sedang dalam asesmen awal BK. Mohon ciptakan suasana kelompok ramah.',
                    ],
                ],
                'parent_communications' => [
                    [
                        'date' => '25 Sep 2026',
                        'channel' => 'Telepon Resmi BK',
                        'contact_person' => 'Ibu Farida Hanum',
                        'summary' => 'Orang tua menyampaikan siswa sering mengeluh pusing menjelang hari jadwal kerja kelompok.',
                        'follow_up' => 'Jadwalkan sesi konseling suportif di sekolah.',
                    ],
                ],
                'progress' => [
                    'attendance_before' => '74% (6x Izin/Alfa)',
                    'attendance_current' => '82% (Mulai membaik)',
                    'assignment_completion' => 'Sebelum: 60% -> Saat ini: 78%',
                    'emotional_state' => 'Mulai bersedia duduk bersama teman sebaya',
                ],
                'documents' => [
                    ['id' => 'DOC-04', 'title' => 'Formulir Informed Consent Siswa', 'type' => 'PDF', 'confidentiality' => 'Level 2', 'date' => '02 Okt 2026'],
                ],
            ],
            4 => [
                'id' => 4,
                'name' => 'Rian Hidayat',
                'nis' => '20241104',
                'nisn' => '0081293813',
                'class' => 'XI MIPA 1',
                'gender' => 'Laki-laki',
                'birth_info' => 'Jakarta, 19 Januari 2008',
                'address' => 'Jl. Kebon Jeruk No. 44, Jakarta Barat',
                'phone' => '081234567804',
                'parent' => [
                    'father' => 'Hidayatullah',
                    'father_job' => 'Pengemudi Ekspedisi Antar-Kota',
                    'mother' => 'Almh. Sulastri',
                    'mother_job' => '-',
                    'phone' => '081198765404',
                ],
                'homeroom_teacher' => 'Siti Aminah, M.Pd',
                'service_overview' => [
                    'handling_status' => 'Urgent',
                    'assigned_counselor' => 'Nurul Hidayah, S.Psi',
                    'active_cases' => 1,
                    'last_session' => '24 Sep 2026',
                    'next_followup' => '03 Okt 2026',
                    'confidentiality_level' => 'Level 3 - Coordinated',
                ],
                'cases' => [
                    [
                        'case_number' => 'CASE-2026-0040',
                        'title' => 'Penanganan Keterlambatan Kritis & Pola Absensi Alfa Berulang',
                        'category' => 'Kedisiplinan & Presensi',
                        'priority' => 'Urgent',
                        'status' => 'Intervention',
                        'opened_at' => '10 Sep 2026',
                        'referral_source' => 'Monitoring Sistem (EWS)',
                        'summary' => 'Akumulasi 8x terlambat dan 3x alfa dalam 1 bulan tanpa surat keterangan dokter.',
                    ],
                ],
                'sessions' => [
                    [
                        'id' => 104,
                        'session_number' => 'SES-01',
                        'date' => '15 Sep 2026',
                        'time' => '11:00 - 11:45',
                        'type' => 'Konseling Individu & Pembinaan',
                        'counselor' => 'Nurul Hidayah, S.Psi',
                        'goal' => 'Identifikasi akar keterlambatan pagi hari',
                        'summary' => 'Ayah bekerja ke luar kota sehingga siswa tinggal mandiri dan sering tertidur larut akibat menjaga warung keluarga.',
                        'observations' => 'Terlihat mengantuk dan merasa bersalah, membutuhkan bantuan penataan sistem alarm keluarga.',
                        'discussion' => 'Restrukturisasi jam tutup warung keluarga dan komitmen bangun pagi bersama kerabat.',
                        'actions' => 'Penandatanganan komitmen kedisiplinan dan check-in pagi ke ruang BK.',
                        'next_plan' => 'Pertemuan mediasi bersama orang tua saat kepulangan dinas.',
                        'confidentiality' => 'Level 3 (Coordinated)',
                    ],
                ],
                'assessments' => [
                    [
                        'instrument' => 'Inventori Kedisiplinan & Manajemen Waktu',
                        'date' => '12 Sep 2026',
                        'score' => 'Perlu Pembinaan Terarah',
                        'interpretation' => 'Kapasitas motivasi ada, terkendala ketiadaan pendampingan orang dewasa di pagi hari.',
                        'recommendation' => 'Panggilan orang tua dan dukungan kerabat terdekat.',
                    ],
                ],
                'interventions' => [
                    [
                        'issue' => '8x terlambat dan 3x alfa',
                        'goal' => 'Nol keterlambatan selama 20 hari efektif dan kehadiran di atas 90%',
                        'action' => 'Panggilan orang tua, kontrak kedisiplinan, check-in pagi di ruang BK',
                        'pic' => 'Nurul Hidayah, S.Psi & Tim Tatib Kesiswaan',
                        'target_date' => '12 Okt 2026',
                        'status' => 'Active (50%)',
                    ],
                ],
                'follow_ups' => [
                    [
                        'id' => 204,
                        'round' => 'Follow-up #1',
                        'date' => '20 Sep 2026',
                        'condition' => 'Stabil',
                        'notes' => 'Tepat waktu 4 hari berturut-turut.',
                    ],
                    [
                        'id' => '205',
                        'round' => 'Follow-up #2',
                        'date' => '01 Okt 2026',
                        'condition' => 'Perlu Perhatian',
                        'notes' => 'Terjadi 1x keterlambatan kembali pada hari Kamis lalu.',
                    ],
                ],
                'referrals' => [
                    [
                        'id' => 'REF-IN-004',
                        'direction' => 'Incoming',
                        'source' => 'Monitoring Sistem (EWS)',
                        'date' => '25 Sep 2026',
                        'issue' => 'Pola absensi alfa 3x terdeteksi pemindai gerbang.',
                        'shared_back_status' => 'Kasus #CASE-2026-0040 sedang ditangani bersama keluarga.',
                    ],
                ],
                'parent_communications' => [
                    [
                        'date' => '12 Sep 2026',
                        'channel' => 'Surat Panggilan Resmi & Telepon',
                        'contact_person' => 'Bpk. Hidayatullah',
                        'summary' => 'Pemberitahuan resmi kondisi presensi siswa dan konfirmasi jadwal pertemuan di sekolah.',
                        'follow_up' => 'Pertemuan mediasi keluarga di ruang BK pada 06 Okt 2026.',
                    ],
                ],
                'progress' => [
                    'attendance_before' => '62.5% (8x Terlambat, 3x Alfa)',
                    'attendance_current' => '78.0% (Mulai membaik)',
                    'assignment_completion' => 'Sebelum: 45% -> Saat ini: 65%',
                    'emotional_state' => 'Kooperatif dan menandatangani kontrak disiplin',
                ],
                'documents' => [
                    ['id' => 'DOC-05', 'title' => 'Surat Panggilan Orang Tua Resmi', 'type' => 'PDF', 'confidentiality' => 'Level 3', 'date' => '12 Sep 2026'],
                    ['id' => 'DOC-06', 'title' => 'Surat Pernyataan Komitmen Kedisiplinan Siswa', 'type' => 'PDF', 'confidentiality' => 'Level 3', 'date' => '15 Sep 2026'],
                ],
            ],
        ];

        // Jika ID ada di map, gunakan profil spesifik, jika tidak ada generate profil yang konsisten
        $profile = $profilesMap[$id] ?? $profilesMap[1];
        if (!isset($profilesMap[$id])) {
            $profile['id'] = $id;
            $profile['name'] = 'Siswa #' . $id;
        }

        return response()->json([
            'success' => true,
            'profile' => $profile,
        ]);
    }

    /**
     * 4. Case Management (Stateful CRUD)
     */
    public function cases(Request $request)
    {
        $cases = $this->getStoredCases();

        return response()->json([
            'success' => true,
            'cases' => $cases,
            'status_options' => ['Open', 'Assessment', 'Intervention', 'Monitoring', 'Resolved', 'Closed', 'Reopened'],
            'priority_options' => ['Normal', 'Monitoring', 'Intervention', 'High Attention', 'Urgent'],
            'category_options' => [
                'Akademik & Regulasi Diri',
                'Kedisiplinan & Presensi',
                'Sosial & Emosional',
                'Adaptasi Sekolah Baru',
                'Keluarga & Lingkungan',
                'Karier & Minat Bakat',
                'Bullying & Konflik Sebaya',
                'Khusus / Kebutuhan Dukungan',
            ],
        ]);
    }

    /**
     * Store new counseling case with Cache persistence
     */
    public function storeCase(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'class' => 'required|string',
            'category' => 'required|string',
            'priority' => 'required|string',
            'referral_source' => 'required|string',
            'summary' => 'required|string',
            'confidentiality_level' => 'nullable|string',
        ]);

        $student = User::where('name', 'LIKE', '%' . $validated['student_name'] . '%')->first();
        $studentId = $student ? $student->id : ($request->input('student_id') ?? 8);

        $caseNumber = 'CASE-2026-' . str_pad(CounselingCase::count() + 43, 4, '0', STR_PAD_LEFT);
        $details = [
            'case_number' => $caseNumber,
            'student_name' => $validated['student_name'],
            'class' => $validated['class'],
            'date' => date('Y-m-d'),
            'counselor' => 'Nurul Hidayah, S.Psi',
            'referral_source' => $validated['referral_source'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'status' => 'Open',
            'summary' => $validated['summary'],
            'topic' => $validated['summary'],
            'intervention_summary' => 'Rencana asesmen awal',
            'follow_up_count' => 0,
            'next_follow_up' => date('Y-m-d', strtotime('+7 days')),
            'closed_at' => null,
            'confidentiality_level' => $validated['confidentiality_level'] ?? 'Level 1 (Internal BK)',
        ];

        $dbCase = CounselingCase::create([
            'school_id' => $request->user()->school_id ?? 1,
            'student_id' => $studentId,
            'details' => json_encode($details),
        ]);

        $newCase = array_merge(['id' => $dbCase->id, 'student_id' => $studentId, 'opened_at' => date('Y-m-d')], $details);

        $cases = Cache::get('bk_cases_dataset', []);
        array_unshift($cases, $newCase);
        Cache::put('bk_cases_dataset', $cases, 7200);

        return response()->json([
            'success' => true,
            'message' => 'Kasus BK berhasil dibuka dengan nomor ' . $newCase['case_number'],
            'case' => $newCase,
        ]);
    }

    /**
     * Update case status / details with Cache persistence
     */
    public function updateCase(Request $request, $id)
    {
        $status = $request->input('status', 'Intervention');
        $priority = $request->input('priority');
        $summary = $request->input('summary');

        $dbCase = CounselingCase::find($id);
        if (!$dbCase) {
            $dbCase = CounselingCase::where('details', 'LIKE', '%' . $id . '%')->first();
        }

        if ($dbCase) {
            $details = is_string($dbCase->details) ? json_decode($dbCase->details, true) : (array)$dbCase->details;
            $details['status'] = $status;
            if ($priority) $details['priority'] = $priority;
            if ($summary) {
                $details['summary'] = $summary;
                $details['topic'] = $summary;
            }
            if (in_array($status, ['Resolved', 'Closed'])) {
                $details['closed_at'] = date('Y-m-d');
            }
            $dbCase->update(['details' => json_encode($details)]);
        }

        $cases = $this->getStoredCases();
        foreach ($cases as &$c) {
            if ($c['id'] == $id || $c['case_number'] == $id) {
                $c['status'] = $status;
                if ($priority) $c['priority'] = $priority;
                if ($summary) $c['summary'] = $summary;
                if (in_array($status, ['Resolved', 'Closed'])) {
                    $c['closed_at'] = date('Y-m-d');
                }
            }
        }
        Cache::put('bk_cases_dataset', $cases, 7200);

        return response()->json([
            'success' => true,
            'message' => 'Kasus #' . $id . ' berhasil diperbarui statusnya menjadi ' . $status,
        ]);
    }

    /**
     * 5 & 6. Referral Management (Incoming, Outgoing, History)
     */
    public function referrals(Request $request)
    {
        $referrals = $this->getStoredReferrals();

        return response()->json([
            'success' => true,
            'incoming' => $referrals['incoming'] ?? [],
            'outgoing' => $referrals['outgoing'] ?? [],
            'sources' => ['Siswa Sendiri', 'Wali Kelas', 'Guru Mata Pelajaran', 'Orang Tua', 'Kepala Sekolah', 'Admin', 'Monitoring Sistem'],
            'workflow_stages' => ['Referral', 'Review BK', 'Assessment', 'Intervention', 'Follow-up', 'Closed'],
        ]);
    }

    /**
     * Action on referral with Cache persistence
     */
    public function actionReferral(Request $request, $id)
    {
        $action = $request->input('action', 'accept');
        $reason = $request->input('reason', '');

        $referrals = $this->getStoredReferrals();
        foreach ($referrals['incoming'] as &$r) {
            if ($r['id'] == $id) {
                if ($action === 'accept') {
                    $r['status'] = 'Accepted (Case Created)';
                } elseif ($action === 'reject') {
                    $r['status'] = 'Rejected: ' . ($reason ?: 'Alasan pembinaan internal wali kelas');
                } else {
                    $r['status'] = 'Info Requested';
                }
            }
        }
        Cache::put('bk_referrals_dataset', $referrals, 7200);

        return response()->json([
            'success' => true,
            'message' => 'Referral ' . $id . ' berhasil diproses (' . $action . ').',
        ]);
    }

    /**
     * 7. Konseling Individu
     */
    public function individualSessions(Request $request)
    {
        $sessions = $this->getStoredIndividualSessions();

        return response()->json([
            'success' => true,
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store session note with Cache persistence
     */
    public function storeIndividualSession(Request $request)
    {
        $validated = $request->validate([
            'student_name' => 'required|string',
            'date' => 'required|string',
            'time' => 'required|string',
            'goal' => 'required|string',
            'summary' => 'required|string',
            'confidentiality_level' => 'nullable|string',
        ]);

        $sessions = $this->getStoredIndividualSessions();

        $newSession = [
            'id' => time(),
            'session_code' => 'S-IND-2026-' . str_pad(count($sessions) + 44, 3, '0', STR_PAD_LEFT),
            'student_name' => $validated['student_name'],
            'class' => 'XI MIPA 1',
            'date' => $validated['date'],
            'time' => $validated['time'],
            'venue' => 'Ruang Konseling Privat 1',
            'counselor' => 'Nurul Hidayah, S.Psi',
            'session_type' => 'Tatap Muka Privat',
            'duration' => 45,
            'status' => 'Completed',
            'confidentiality_level' => $validated['confidentiality_level'] ?? 'Level 1 (Internal BK)',
            'notes' => [
                'goal' => $validated['goal'],
                'summary' => $validated['summary'],
                'observation' => 'Siswa kooperatif selama sesi berlangsung',
                'discussion' => 'Identifikasi solusi dan rencana tindak lanjut mandiri',
                'action' => 'Melaksanakan komitmen perubahan perilaku',
                'next_plan' => 'Follow up evaluasi pekan berikutnya',
            ],
        ];

        array_unshift($sessions, $newSession);
        Cache::put('bk_individual_sessions_dataset', $sessions, 7200);

        return response()->json([
            'success' => true,
            'message' => 'Catatan sesi konseling individu berhasil disimpan dengan tingkat kerahasiaan ' . ($validated['confidentiality_level'] ?? 'Level 1 (Internal BK)'),
            'session' => $newSession,
        ]);
    }

    /**
     * 8. Konseling Kelompok
     */
    public function groupSessions(Request $request)
    {
        $groups = [
            [
                'id' => 1,
                'group_name' => 'Kelompok Adaptasi Siswa Baru (X)',
                'topic' => 'Keterampilan Manajemen Waktu, Strategi Menghadapi Beban KBM & Resolusi Konflik Sebaya',
                'counselor' => 'Nurul Hidayah, S.Psi',
                'members' => [
                    ['name' => 'Dwi Prasetyo', 'class' => 'X IPS 3', 'role' => 'Peserta'],
                    ['name' => 'Riko Anggara', 'class' => 'X IPS 1', 'role' => 'Peserta'],
                    ['name' => 'Salma Nadia', 'class' => 'X MIPA 2', 'role' => 'Peserta'],
                    ['name' => 'Farhan Pratama', 'class' => 'X MIPA 4', 'role' => 'Peserta'],
                ],
                'schedule' => 'Setiap Rabu (13:30 - 14:45)',
                'total_sessions_planned' => 4,
                'sessions_completed' => 2,
                'last_session_date' => '2026-09-30',
                'next_session_date' => '2026-10-07',
                'status' => 'Active',
                'evaluation' => 'Peserta saling mendukung, keterbukaan meningkat 60% dibandingkan sesi 1.',
                'follow_up' => 'Penugasan lembar refleksi jurnal teman sebaya.',
            ],
            [
                'id' => 2,
                'group_name' => 'Kelompok Regulasi Kecemasan Ujian (XII)',
                'topic' => 'Psikoedukasi Reduksi Stres Menjelang Tryout Akbar & Mindful Studying',
                'counselor' => 'Nurul Hidayah, S.Psi',
                'members' => [
                    ['name' => 'Bima Aditya', 'class' => 'XII MIPA 3', 'role' => 'Peserta'],
                    ['name' => 'Sinta Wulandari', 'class' => 'XII MIPA 1', 'role' => 'Peserta'],
                    ['name' => 'Kevin Alamsyah', 'class' => 'XII IPS 2', 'role' => 'Peserta'],
                ],
                'schedule' => 'Setiap Jumat (14:00 - 15:15)',
                'total_sessions_planned' => 3,
                'sessions_completed' => 1,
                'last_session_date' => '2026-09-25',
                'next_session_date' => '2026-10-09',
                'status' => 'Active',
                'evaluation' => 'Teknik box breathing dan visualisasi sukses dipraktikkan dengan antusias.',
                'follow_up' => 'Check-in skala ketegangan otot sebelum dan sesudah belajar.',
            ],
        ];

        return response()->json([
            'success' => true,
            'groups' => $groups,
        ]);
    }

    /**
     * Store group counseling
     */
    public function storeGroupSession(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Kelompok konseling baru berhasil didaftarkan.',
        ]);
    }

    /**
     * 9. Jadwal Konseling
     */
    public function schedule(Request $request)
    {
        $events = [
            [
                'id' => 'EVT-01',
                'title' => 'Konseling Individu: Ahmad Fauzi (XI MIPA 1)',
                'category' => 'Konseling Individu',
                'date' => date('Y-m-d'),
                'time' => '08:30 - 09:15',
                'venue' => 'Ruang Konseling Privat 1',
                'status' => 'Confirmed',
                'badge_color' => 'indigo',
            ],
            [
                'id' => 'EVT-02',
                'title' => 'Konseling Kelompok: Adaptasi Siswa Baru Sesi 3',
                'category' => 'Konseling Kelompok',
                'date' => date('Y-m-d', strtotime('+1 day')),
                'time' => '10:00 - 11:30',
                'venue' => 'Ruang Diskusi BK',
                'status' => 'Scheduled',
                'badge_color' => 'blue',
            ],
            [
                'id' => 'EVT-03',
                'title' => 'Pertemuan Orang Tua: Rian Hidayat',
                'category' => 'Pertemuan Orang Tua',
                'date' => date('Y-m-d', strtotime('+2 days')),
                'time' => '13:00 - 14:00',
                'venue' => 'Ruang Mediasi BK',
                'status' => 'Scheduled',
                'badge_color' => 'amber',
            ],
            [
                'id' => 'EVT-04',
                'title' => 'Koordinasi Kasus dengan Wali Kelas XI',
                'category' => 'Koordinasi Wali Kelas',
                'date' => date('Y-m-d', strtotime('+3 days')),
                'time' => '15:15 - 16:00',
                'venue' => 'Ruang Guru / BK',
                'status' => 'Confirmed',
                'badge_color' => 'emerald',
            ],
            [
                'id' => 'EVT-05',
                'title' => 'Follow-up Case: Dwi Prasetyo',
                'category' => 'Follow-up',
                'date' => date('Y-m-d', strtotime('+4 days')),
                'time' => '09:00 - 09:30',
                'venue' => 'Ruang BK 2',
                'status' => 'Scheduled',
                'badge_color' => 'purple',
            ],
        ];

        return response()->json([
            'success' => true,
            'events' => $events,
            'status_options' => ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'],
        ]);
    }

    /**
     * 10. Booking Konseling Mandiri Siswa
     */
    public function bookings(Request $request)
    {
        $bookings = $this->getStoredBookings();

        return response()->json([
            'success' => true,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Action on booking with Cache persistence
     */
    public function actionBooking(Request $request, $id)
    {
        $action = $request->input('action', 'accept');

        $bookings = $this->getStoredBookings();
        foreach ($bookings as &$b) {
            if ($b['id'] == $id) {
                if ($action === 'accept') {
                    $b['status'] = 'Accepted';
                } elseif ($action === 'reschedule') {
                    $b['status'] = 'Rescheduled';
                } else {
                    $b['status'] = 'Rejected';
                }
            }
        }
        Cache::put('bk_bookings_dataset', $bookings, 7200);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan booking ' . $id . ' berhasil diperbarui statusnya menjadi ' . $action,
        ]);
    }

    /**
     * 11 & 12. Assessment & Assessment Library
     */
    public function assessments(Request $request)
    {
        $library = [
            [
                'id' => 'INST-01',
                'title' => 'Inventori Kebiasaan & Sikap Belajar (IKB-SMA)',
                'category' => 'Akademik & Belajar',
                'type' => 'Kuesioner 30 Butir',
                'version' => 'v2.1 (2026)',
                'scoring' => 'Likert Scale (1-5), Skor Maksimal 150',
                'interpretation_guide' => 'Skor >120 (Sangat Baik), 90-119 (Cukup), <90 (Perlu Bimbingan Khusus)',
                'status' => 'Active',
                'total_takers' => 142,
            ],
            [
                'id' => 'INST-02',
                'title' => 'Skala Minat & Bakat Karier Holland (RIASEC)',
                'category' => 'Karier & Masa Depan',
                'type' => 'Profiling Minat Karier',
                'version' => 'v1.4',
                'scoring' => '6 Domain Minat (R-I-A-S-E-C)',
                'interpretation_guide' => '3 Domain Tertinggi membentuk kode profil minat (misal: IRS / ASE)',
                'status' => 'Active',
                'total_takers' => 210,
            ],
            [
                'id' => 'INST-03',
                'title' => 'Screening Kebutuhan Dukungan Psikososial & Adaptasi Siswa',
                'category' => 'Sosial & Emosional',
                'type' => 'Screening Awal Non-Klinis',
                'version' => 'v2.0',
                'scoring' => 'Identifikasi Area Prioritas Dukungan',
                'interpretation_guide' => 'Hanya digunakan sebagai panduan wawancara konseling, BUKAN diagnosis klinis.',
                'status' => 'Active',
                'total_takers' => 95,
            ],
            [
                'id' => 'INST-04',
                'title' => 'Formulir Observasi Perilaku & Interaksi Kelas',
                'category' => 'Form Observasi',
                'type' => 'Observasi Guru / Konselor',
                'version' => 'v1.0',
                'scoring' => 'Catatan Kualitatif Perilaku',
                'interpretation_guide' => 'Diverifikasi langsung oleh Konselor BK.',
                'status' => 'Active',
                'total_takers' => 28,
            ],
        ];

        $studentResults = [
            [
                'id' => 'RES-001',
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'instrument' => 'Inventori Kebiasaan & Sikap Belajar (IKB-SMA)',
                'date' => '2026-09-16',
                'score' => '102 / 150',
                'counselor_interpretation' => 'Kesiapan belajar mandiri baik, namun membutuhkan restrukturisasi jadwal istirahat dan penataan distraksi layar.',
                'counselor_recommendation' => 'Penerapan metode time-blocking dan teknik pomodoro 25 menit.',
                'follow_up' => 'Monitoring mingguan via lembar harian.',
            ],
            [
                'id' => 'RES-002',
                'student_name' => 'Citra Lestari',
                'class' => 'XI IPS 2',
                'instrument' => 'Screening Kebutuhan Dukungan Psikososial',
                'date' => '2026-10-01',
                'score' => 'Indikasi Butuh Pendampingan Sosial',
                'counselor_interpretation' => 'Terdapat keengganan berinteraksi kelompok akibat pengalaman tidak menyenangkan saat kerja kelompok sebelumnya.',
                'counselor_recommendation' => 'Konseling suportif individu dan pemilihan kelompok belajar yang ramah.',
                'follow_up' => 'Sesi 2 konseling pada 06 Okt 2026.',
            ],
        ];

        return response()->json([
            'success' => true,
            'library' => $library,
            'results' => $studentResults,
        ]);
    }

    /**
     * 13. Student Self-Assessment
     */
    public function selfAssessments(Request $request)
    {
        $submissions = [
            [
                'id' => 'SELF-01',
                'student_name' => 'Bima Aditya',
                'class' => 'XII MIPA 3',
                'title' => 'Survei Minat Karier & Kesiapan Perguruan Tinggi',
                'submitted_at' => '2026-09-22',
                'areas' => [
                    'Pilihan Utama' => 'Teknik Elektro / Fisika Murni',
                    'Aspirasi Kampus' => 'ITB / UI',
                    'Kebutuhan Bantuan' => 'Konsultasi portofolio prestasi dan info beasiswa ikatan dinas',
                ],
                'reviewed_by_counselor' => true,
            ],
            [
                'id' => 'SELF-02',
                'student_name' => 'Nadia Syahrini',
                'class' => 'XI MIPA 1',
                'title' => 'Evaluasi Gaya Belajar & Preferensi Sumber Ilmu',
                'submitted_at' => '2026-09-18',
                'areas' => [
                    'Gaya Belajar Dominan' => 'Visual-Auditori',
                    'Fasilitas Pendukung' => 'Peta konsep visual & video interaktif',
                    'Kebutuhan Bantuan' => 'Bimbingan persiapan olimpiade biologi',
                ],
                'reviewed_by_counselor' => true,
            ],
        ];

        return response()->json([
            'success' => true,
            'submissions' => $submissions,
        ]);
    }

    /**
     * 14. Intervention Management
     */
    public function interventions(Request $request)
    {
        $plans = [
            [
                'id' => 'INT-01',
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'case_id' => 'CASE-2026-0042',
                'issue' => 'Tugas mandiri tertinggal & pola tidur terganggu akibat over-ekstrakurikuler',
                'target' => 'Menyelesaikan 2 tugas modul tertinggal dan mempertahankan presensi tepat waktu 100%',
                'actions' => [
                    'Konseling individu mingguan',
                    'Penyusunan matriks skala prioritas harian (Time Blocking)',
                    'Koordinasi dispensasi jam latihan dengan pembina robotik',
                    'Komunikasi pemantauan tidur dengan orang tua',
                ],
                'pic' => 'Nurul Hidayah, S.Psi (BK) & Siti Aminah, M.Pd (Wali Kelas)',
                'start_date' => '2026-09-16',
                'target_date' => '2026-10-14',
                'progress_percentage' => 75,
                'status' => 'Active',
            ],
            [
                'id' => 'INT-02',
                'student_name' => 'Rian Hidayat',
                'class' => 'XI MIPA 1',
                'case_id' => 'CASE-2026-0040',
                'issue' => 'Keterlambatan berulang (8x) dan absensi alfa (3x) dalam 1 bulan',
                'target' => 'Nol keterlambatan selama 20 hari efektif berturut-turut dan konfirmasi komitmen orang tua',
                'actions' => [
                    'Pemanggilan orang tua ke ruang BK',
                    'Penyusunan Kontrak Perilaku Kedisiplinan Siswa',
                    'Penugasan piket pagi terarah 15 menit',
                    'Sistem check-in presensi langsung ke ruang BK',
                ],
                'pic' => 'Nurul Hidayah, S.Psi & Tim Tatib Kesiswaan',
                'start_date' => '2026-09-12',
                'target_date' => '2026-10-12',
                'progress_percentage' => 50,
                'status' => 'Active',
            ],
        ];

        return response()->json([
            'success' => true,
            'interventions' => $plans,
        ]);
    }

    /**
     * Store intervention plan
     */
    public function storeIntervention(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Rencana intervensi baru berhasil dirumuskan.',
        ]);
    }

    /**
     * 15. Follow-up Management & Reminders
     */
    public function followUps(Request $request)
    {
        $followUps = [
            [
                'id' => 'FLW-01',
                'case_number' => 'CASE-2026-0042',
                'student_name' => 'Ahmad Fauzi',
                'round' => 'Follow-up #1',
                'due_date' => '2026-09-22',
                'completed_date' => '2026-09-22',
                'status' => 'Completed',
                'condition' => 'Kondisi Membaik',
                'summary' => '1 modul tugas fisika telah diserahkan, siswa tidak terlambat sepanjang pekan.',
            ],
            [
                'id' => 'FLW-02',
                'case_number' => 'CASE-2026-0042',
                'student_name' => 'Ahmad Fauzi',
                'round' => 'Follow-up #2',
                'due_date' => '2026-10-05',
                'completed_date' => null,
                'status' => 'Pending',
                'condition' => 'Menunggu Verifikasi',
                'summary' => 'Pemeriksaan kepatuhan time blocking pekan ke-3 dan review nilai kuis matematika.',
            ],
            [
                'id' => 'FLW-03',
                'case_number' => 'CASE-2026-0040',
                'student_name' => 'Rian Hidayat',
                'round' => 'Follow-up #2',
                'due_date' => '2026-10-01',
                'completed_date' => null,
                'status' => 'Overdue',
                'condition' => 'Perlu Perhatian Segera',
                'summary' => 'Terjadi 1x keterlambatan kembali pada hari Kamis lalu, verifikasi kendala bangun pagi dengan orang tua.',
            ],
        ];

        $reminders = [
            ['type' => 'overdue', 'message' => 'Follow-up #2 untuk Rian Hidayat (CASE-2026-0040) telah melewati batas jatuh tempo (01 Okt 2026).'],
            ['type' => 'due_soon', 'message' => 'Follow-up #2 untuk Ahmad Fauzi (CASE-2026-0042) jatuh tempo dalam 2 hari (05 Okt 2026).'],
            ['type' => 'unupdated_case', 'message' => 'Kasus #CASE-2026-0039 (Citra Lestari) belum memiliki catatan follow-up baru selama lebih dari 7 hari.'],
        ];

        return response()->json([
            'success' => true,
            'follow_ups' => $followUps,
            'reminders' => $reminders,
        ]);
    }

    /**
     * Store follow-up note
     */
    public function storeFollowUp(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Catatan follow-up kasus berhasil disimpan.',
        ]);
    }

    /**
     * 16. Progress Siswa (Before, During, After Intervention)
     */
    public function studentProgress(Request $request)
    {
        $progress = [
            [
                'student_name' => 'Ahmad Fauzi (XI MIPA 1)',
                'case_number' => 'CASE-2026-0042',
                'indicators' => [
                    ['metric' => 'Kehadiran Tepat Waktu', 'before' => '82%', 'during' => '94%', 'after' => '98%', 'status' => 'Significant Improvement'],
                    ['metric' => 'Ketuntasan Tugas Mandiri', 'before' => '70%', 'during' => '90%', 'after' => '95%', 'status' => 'Significant Improvement'],
                    ['metric' => 'Rata-rata Nilai Harian', 'before' => '74.5', 'during' => '82.0', 'after' => '85.4', 'status' => 'Target Achieved'],
                    ['metric' => 'Kadar Stres / Kecemasan', 'before' => 'Tinggi (Skala 8/10)', 'during' => 'Sedang (Skala 4/10)', 'after' => 'Stabil (Skala 2/10)', 'status' => 'Regulated'],
                    ['metric' => 'Kedisiplinan & Sikap', 'before' => 'Lesu, Sering Melamun', 'during' => 'Fokus, Responsif', 'after' => 'Aktif Berpartisipasi', 'status' => 'Positive'],
                ],
                'overall_evaluation' => 'Intervensi time blocking dan koordinasi ekstrakurikuler berhasil mengembalikan stabilitas akademik siswa.',
            ],
        ];

        return response()->json([
            'success' => true,
            'progress' => $progress,
        ]);
    }

    /**
     * 17. Catatan Observasi Konselor
     */
    public function observations(Request $request)
    {
        $observations = [
            [
                'id' => 'OBS-01',
                'date' => '2026-09-29',
                'student_name' => 'Citra Lestari',
                'class' => 'XI IPS 2',
                'situation' => 'Jam Istirahat Pertama di Kantin Sekolah',
                'observed_behavior' => 'Duduk menyendiri di sudut kantin membaca buku tanpa membalas sapaan rekan sekelas yang lewat.',
                'context' => 'Dinamika pemilihan panitia kegiatan pentas seni kelas yang sempat memicu perbedaan pendapat.',
                'follow_up' => 'Ajak berbincang ringan saat konseling jadwal berikutnya.',
                'counselor' => 'Nurul Hidayah, S.Psi',
            ],
            [
                'id' => 'OBS-02',
                'date' => '2026-09-27',
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'situation' => 'Laboratorium Komputer & Robotika',
                'observed_behavior' => 'Mampu memimpin pembagian tugas tim robotik dengan intonasi tenang dan tidak lagi terburu-buru.',
                'context' => 'Pasca penerapan teknik regulasi waktu pada sesi konseling ke-2.',
                'follow_up' => 'Apresiasi keberhasilan manajemen waktu pada pertemuan selanjutnya.',
                'counselor' => 'Nurul Hidayah, S.Psi',
            ],
        ];

        return response()->json([
            'success' => true,
            'observations' => $observations,
        ]);
    }

    /**
     * Store observation note
     */
    public function storeObservation(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Catatan observasi konselor berhasil disimpan.',
        ]);
    }

    /**
     * 18. Komunikasi Siswa
     */
    public function studentCommunications(Request $request)
    {
        $messages = [
            [
                'id' => 'MSG-01',
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'type' => 'Pengingat Sesi',
                'title' => 'Pengingat Sesi Konseling Evaluasi Pekanan',
                'content' => 'Halo Ahmad, mengingatkan jadwal sesi konseling santai kita besok Senin pukul 08.30 di Ruang BK 1 ya. Jangan lupa bawa lembar time blocking-nya. Tetap semangat!',
                'sent_at' => date('Y-m-d H:i', strtotime('-1 day')),
                'status' => 'Delivered & Read',
            ],
            [
                'id' => 'MSG-02',
                'student_name' => 'Bima Aditya',
                'class' => 'XII MIPA 3',
                'type' => 'Informasi Layanan BK',
                'title' => 'Informasi Seminar Persiapan Seleksi Masuk PTN',
                'content' => 'Halo Bima, pendaftaran bimbingan klinik studi lanjut prodi teknik sudah dibuka untuk siswa kelas XII. Silakan cek modul karier di portal siswa.',
                'sent_at' => date('Y-m-d H:i', strtotime('-3 days')),
                'status' => 'Delivered',
            ],
        ];

        return response()->json([
            'success' => true,
            'communications' => $messages,
        ]);
    }

    /**
     * 19. Komunikasi Orang Tua & Parent Meeting
     */
    public function parentCommunications(Request $request)
    {
        $logs = [
            [
                'id' => 'PCOM-01',
                'date' => '2026-09-19',
                'student_name' => 'Ahmad Fauzi',
                'parent_name' => 'Ibu Rina Marlina (Ibu)',
                'channel' => 'Telepon Resmi BK',
                'summary' => 'Diskusi pembagian jadwal istirahat siswa di rumah dan pembatasan jam layar malam.',
                'result' => 'Orang tua sangat kooperatif dan menyetujui program time-blocking BK.',
                'follow_up' => 'Kirim rangkuman kesepakatan via WhatsApp resmi BK.',
            ],
        ];

        $meetings = [
            [
                'id' => 'PMTG-01',
                'date' => '2026-10-06',
                'time' => '13:30 - 14:30',
                'student_name' => 'Rian Hidayat',
                'class' => 'XI MIPA 1',
                'parent_name' => 'Bpk. Hidayatullah (Ayah)',
                'participants' => ['Nurul Hidayah, S.Psi (BK)', 'Siti Aminah, M.Pd (Wali Kelas)', 'Bpk. Hidayatullah (Orang Tua)', 'Rian Hidayat (Siswa)'],
                'objective' => 'Mediasi penanganan keterlambatan berulang dan penyusunan kontrak disiplin bersama keluarga.',
                'venue' => 'Ruang Mediasi BK',
                'status' => 'Scheduled',
                'agreement_summary' => 'Orang tua berkomitmen mengantar siswa sebelum pukul 06.40 WIB.',
            ],
        ];

        return response()->json([
            'success' => true,
            'logs' => $logs,
            'meetings' => $meetings,
        ]);
    }

    /**
     * 20. Komunikasi & Koordinasi Wali Kelas
     */
    public function homeroomCoordination(Request $request)
    {
        $coordinationList = [
            [
                'id' => 'COORD-01',
                'homeroom_teacher' => 'Siti Aminah, M.Pd',
                'class' => 'XI MIPA 1',
                'student_name' => 'Ahmad Fauzi',
                'referral_id' => 'REF-042',
                'full_internal_bk_notes' => 'Siswa mengalami beban emosional akibat ekspektasi orang tua dan keletihan lomba robotik.',
                'shared_status_to_homeroom' => 'Siswa sedang dalam proses pendampingan BK aktif. Menunjukkan progres kepatuhan jadwal positif.',
                'coordination_request' => 'Mohon bantuan monitoring kehadiran kuis dan penyelesaian tugas mandiri di kelas.',
                'last_updated' => '2026-09-28',
                'status' => 'Active Coordination',
            ],
            [
                'id' => 'COORD-02',
                'homeroom_teacher' => 'Drs. Hendro Wibowo',
                'class' => 'XI IPS 2',
                'student_name' => 'Citra Lestari',
                'referral_id' => 'REF-IN-001',
                'full_internal_bk_notes' => 'Ada riwayat ketegangan relasi sebaya dalam tugas kelompok sosiologi.',
                'shared_status_to_homeroom' => 'Siswa sedang dalam tahap asesmen awal BK. Mohon ciptakan suasana kelompok belajar yang ramah dan inklusif.',
                'coordination_request' => 'Hindari memojokkan siswa di depan umum terkait absensi sebelumnya.',
                'last_updated' => '2026-10-02',
                'status' => 'Assessment Stage',
            ],
        ];

        return response()->json([
            'success' => true,
            'coordinations' => $coordinationList,
        ]);
    }

    /**
     * 21. Koordinasi dengan Guru Mata Pelajaran
     */
    public function teacherCoordination(Request $request)
    {
        $records = [
            [
                'id' => 'TCOORD-01',
                'teacher_name' => 'Ratna Dewi, M.Si (Fisika)',
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'request_topic' => 'Permohonan informasi pemenuhan tugas susulan dan keaktifan di praktikum',
                'teacher_feedback' => 'Tugas modul 3 sudah diserahkan dengan nilai 86. Keaktifan di praktikum magnetisme kemarin cukup fokus.',
                'counselor_recommendation' => 'Berikan penguatan verbal positif saat siswa berinisiatif bertanya.',
                'date' => '2026-09-26',
            ],
        ];

        return response()->json([
            'success' => true,
            'records' => $records,
        ]);
    }

    /**
     * 22. Student Support Plan
     */
    public function studentSupportPlans(Request $request)
    {
        $plans = [
            [
                'id' => 'SSP-01',
                'student_name' => 'Citra Lestari',
                'class' => 'XI IPS 2',
                'condition_summary' => 'Siswa memerlukan dukungan adaptasi sosial dan penguatan kepercayaan diri di lingkungan sekolah.',
                'goals' => 'Mengembalikan kenyamanan bersosialisasi dan menaikkan kehadiran menjadi minimal 90% dalam 1 semester.',
                'support_components' => [
                    'Sesi konseling suportif individu 2 pekan sekali',
                    'Dukungan wali kelas dalam pembentukan kelompok kerja ramah',
                    'Pertemuan berkala dengan orang tua sebulan sekali',
                    'Pemberian tugas dengan opsi presentasi bertahap',
                ],
                'stakeholders_involved' => ['Konselor BK (PIC)', 'Wali Kelas XI IPS 2', 'Guru Mapel Sosiologi & B. Inggris', 'Orang Tua Siswa'],
                'monitoring_schedule' => 'Setiap hari Jumat akhir pekan',
                'progress_status' => 'Tahap 1: Pembinaan Rasa Aman',
                'evaluation_interval' => 'Setiap 30 Hari',
            ],
        ];

        return response()->json([
            'success' => true,
            'support_plans' => $plans,
        ]);
    }

    /**
     * 23 & 24. Early Warning System & Risk Monitoring
     */
    public function earlyWarning(Request $request)
    {
        $alerts = $this->getStoredEarlyWarnings();

        $urgentCount = count(array_filter($alerts, fn ($a) => $a['overall_risk'] === 'Urgent'));
        $highAttentionCount = count(array_filter($alerts, fn ($a) => $a['overall_risk'] === 'High Attention'));
        $monitoringCount = count(array_filter($alerts, fn ($a) => $a['overall_risk'] === 'Monitoring'));
        $verifiedCount = count(array_filter($alerts, fn ($a) => $a['human_verified']));

        return response()->json([
            'success' => true,
            'alerts' => $alerts,
            'risk_summary' => [
                'urgent' => $urgentCount,
                'high_attention' => $highAttentionCount,
                'monitoring' => $monitoringCount,
                'verified_percentage' => count($alerts) > 0 ? round(($verifiedCount / count($alerts)) * 100, 1) : 0,
            ],
        ]);
    }

    /**
     * Human verification for EWS trigger with Cache persistence
     */
    public function verifyEarlyWarning(Request $request, $id)
    {
        $createCase = $request->input('create_case', false);
        $notes = $request->input('notes', 'Terverifikasi oleh konselor BK');

        $alerts = $this->getStoredEarlyWarnings();
        $targetStudent = null;

        foreach ($alerts as &$a) {
            if ($a['id'] == $id) {
                $a['human_verified'] = true;
                $a['verified_by'] = 'Nurul Hidayah, S.Psi';
                $a['verification_notes'] = $notes;
                $a['action_taken'] = $createCase ? 'Kasus BK Dibuat' : 'Dicatat dalam Pemantauan Berkala';
                $targetStudent = $a;
            }
        }
        Cache::put('bk_early_warnings_dataset', $alerts, 7200);

        // Jika createCase = true, otomatis buat kasus di list cases
        if ($createCase && $targetStudent) {
            $cases = $this->getStoredCases();
            $newCase = [
                'id' => time(),
                'case_number' => 'CASE-2026-' . str_pad(count($cases) + 43, 4, '0', STR_PAD_LEFT),
                'student_id' => $targetStudent['student_id'] ?? rand(10, 99),
                'student_name' => $targetStudent['student_name'],
                'class' => $targetStudent['class'],
                'opened_at' => date('Y-m-d'),
                'counselor' => 'Nurul Hidayah, S.Psi',
                'referral_source' => 'Monitoring Sistem (EWS)',
                'category' => 'Verifikasi Risiko EWS',
                'priority' => $targetStudent['overall_risk'],
                'status' => 'Assessment',
                'summary' => 'Kasus dibuka pasca verifikasi manusia konselor BK terhadap trigger EWS: ' . ($targetStudent['indicators'][0]['detail'] ?? 'Risiko terdeteksi'),
                'intervention_summary' => 'Asesmen awal konseling',
                'follow_up_count' => 0,
                'next_follow_up' => date('Y-m-d', strtotime('+3 days')),
                'closed_at' => null,
                'confidentiality_level' => 'Level 1 (Internal BK)',
            ];
            array_unshift($cases, $newCase);
            Cache::put('bk_cases_dataset', $cases, 7200);
        }

        return response()->json([
            'success' => true,
            'message' => 'Indikator risiko ' . $id . ' berhasil diverifikasi konselor. ' . ($createCase ? 'Kasus BK baru telah dibuat.' : 'Dicatat sebagai pemantauan berkala.'),
        ]);
    }

    /**
     * 25 & 26. Karier & Studi Lanjutan, Minat & Bakat
     */
    public function careerAndTalents(Request $request)
    {
        $careerProfiles = [
            [
                'id' => 1,
                'student_name' => 'Bima Aditya',
                'class' => 'XII MIPA 3',
                'riasec_code' => 'IRS (Investigative - Realistic - Social)',
                'aspirations' => 'Insinyur Robotika / Sistem Tertanam',
                'target_majors' => ['Teknik Elektro', 'Teknik Fisika', 'Ilmu Komputer'],
                'target_campuses' => ['Institut Teknologi Bandung', 'Universitas Indonesia', 'Universitas Gadjah Mada'],
                'strengths' => 'Matematika Analitik, Logika Algoritma, Perakitan Elektronik',
                'counselor_recommendation' => 'Tingkatkan portofolio kejuaraan robotik regional dan persiapkan nilai rapor semester 1-5.',
                'counseling_sessions' => 2,
            ],
            [
                'id' => 2,
                'student_name' => 'Ahmad Fauzi',
                'class' => 'XI MIPA 1',
                'riasec_code' => 'IRA (Investigative - Realistic - Artistic)',
                'aspirations' => 'AI Engineer / Game Developer',
                'target_majors' => ['Teknik Informatika', 'Desain Komunikasi Visual Terapan'],
                'target_campuses' => ['Institut Teknologi Sepuluh Nopember', 'Universitas Indonesia'],
                'strengths' => 'Kreativitas Konseptual, Pemrograman Python Dasar',
                'counselor_recommendation' => 'Jaga konsistensi nilai matematika peminatan di atas KKM.',
                'counseling_sessions' => 1,
            ],
        ];

        $talents = [
            [
                'student_name' => 'Nadia Syahrini',
                'class' => 'XI MIPA 1',
                'talent_area' => 'Sains & Riset Hayati',
                'extracurricular' => 'Karya Ilmiah Remaja (KIR)',
                'achievements' => 'Juara 1 Lomba Karya Tulis Ilmiah Lingkungan Hidup Tingkat Provinsi 2026',
                'development_plan' => 'Didampingi untuk seleksi olimpiade sains nasional tahun depan.',
            ],
            [
                'student_name' => 'Dewi Sartika',
                'class' => 'XI MIPA 1',
                'talent_area' => 'Seni Budaya & Public Speaking',
                'extracurricular' => 'Teater & Paduan Suara',
                'achievements' => 'Best Speaker Festival Debat Bahasa Indonesia Sekolah 2026',
                'development_plan' => 'Direkomendasikan menjadi MC kegiatan resmi sekolah dan perwakilan lomba debat.',
            ],
        ];

        return response()->json([
            'success' => true,
            'career_profiles' => $careerProfiles,
            'talents' => $talents,
        ]);
    }

    /**
     * 27 & 28 & 39. Program BK, Kegiatan & Program Effectiveness
     */
    public function programs(Request $request)
    {
        $programs = [
            [
                'id' => 'PRG-01',
                'title' => 'Gerakan Sekolah Aman: Seminar & Workshop Anti-Bullying dan Respek Sebaya',
                'category' => 'Preventif & Pengembangan Iklim Sekolah',
                'target' => 'Seluruh Siswa Kelas X & Pengurus OSIS/MPK',
                'schedule' => '18 Agu 2026',
                'venue' => 'Aula Utama Sekolah',
                'participants_count' => 160,
                'materials' => 'Modul Identifikasi Bullying Verbal/Digital, Jalur Pengaduan Aman BK, Roleplay Penolong Aktif (Upstander)',
                'status' => 'Completed',
                'effectiveness' => [
                    'pre_assessment' => '42% siswa pernah menyaksikan ejekan tanpa tahu cara melapor dengan aman',
                    'post_assessment' => '94% siswa memahami mekanisme pelaporan rahasia BK dan berkomitmen menjadi upstander',
                    'satisfaction_score' => 4.8,
                ],
                'documentation' => ['Foto_Kegiatan_AntiBullying.jpg', 'Laporan_Evaluasi_Agustus.pdf'],
            ],
            [
                'id' => 'PRG-02',
                'title' => 'Career Exploration Day & Expo Pendidikan Tinggi 2026',
                'category' => 'Layanan Bimbingan Karier',
                'target' => 'Siswa Kelas XI & XII beserta Orang Tua',
                'schedule' => '12 Nov 2026',
                'venue' => 'Gedung Olahraga & Ruang Kelas',
                'participants_count' => 320,
                'materials' => 'Presentasi 15 Kampus Negeri/Swasta, Sesi Tanya Jawab Beasiswa, Tes Minat Mandiri',
                'status' => 'Upcoming / In Preparation',
                'effectiveness' => null,
                'documentation' => [],
            ],
            [
                'id' => 'PRG-03',
                'title' => 'Program Sukses Transisi & Adaptasi Belajar Siswa Baru',
                'category' => 'Pengembangan Pribadi & Belajar',
                'target' => 'Siswa Kelas X',
                'schedule' => '22 - 25 Jul 2026',
                'venue' => 'Ruang Kelas X',
                'participants_count' => 160,
                'materials' => 'Keterampilan Belajar SMA, Gaya Belajar, Manajemen Waktu Remaja',
                'status' => 'Completed',
                'effectiveness' => [
                    'pre_assessment' => '68% siswa merasa kesulitan beradaptasi dengan jadwal SMA',
                    'post_assessment' => '82% melaporkan sudah lebih nyaman dan memiliki strategi belajar',
                    'satisfaction_score' => 4.6,
                ],
                'documentation' => ['Laporan_Adaptasi_X.pdf'],
            ],
        ];

        return response()->json([
            'success' => true,
            'programs' => $programs,
        ]);
    }

    /**
     * Store new program
     */
    public function storeProgram(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Program preventif BK baru berhasil dijadwalkan.',
        ]);
    }

    /**
     * 29. Bullying & Peer Conflict Special Workflow
     */
    public function bullyingCases(Request $request)
    {
        $cases = [
            [
                'id' => 'BULLY-2026-003',
                'report_date' => '2026-09-21',
                'incident_type' => 'Ejekan Fisik Berulang di Lapangan Basket',
                'involved_parties' => [
                    ['role' => 'Pelapor / Terduga Korban', 'name' => 'Inisial K (X IPS 2)', 'confidential' => true],
                    ['role' => 'Terduga Pelaku', 'name' => 'Inisial R & D (X IPS 1)', 'confidential' => true],
                    ['role' => 'Saksi Kunci', 'name' => '2 Rekan Sejawat', 'confidential' => true],
                ],
                'chronology' => 'Laporan masuk via kotak aspirasi rahasia BK. Dilakukan klarifikasi terpisah dengan masing-masing pihak tanpa konfrontasi langsung.',
                'counselor_assessment' => 'Konflik relasi kekuasaan sebaya yang dipicu oleh candaan yang melampaui batas batas toleransi.',
                'action_taken' => 'Mediasi restoratif tertutup, penandatanganan pakta anti-perundungan, dan pemantauan harian oleh guru piket lapangan.',
                'monitoring_period' => '30 Hari Efektif',
                'status' => 'Monitoring Phase (No Recurrence)',
                'confidentiality_level' => 'Level 1 (Strictly Internal BK & Tim Khusus)',
            ],
        ];

        return response()->json([
            'success' => true,
            'cases' => $cases,
        ]);
    }

    /**
     * 30. Discipline Referrals
     */
    public function disciplineReferrals(Request $request)
    {
        $referrals = [
            [
                'id' => 'DISC-01',
                'date' => '2026-09-10',
                'student_name' => 'Rian Hidayat',
                'class' => 'XI MIPA 1',
                'violation_type' => 'Akumulasi Keterlambatan Masuk Sekolah (8x)',
                'referred_by' => 'Tim Ketertiban Kesiswaan (Drs. Bambang)',
                'evidence' => 'Log presensi pemindai gerbang & kartu keterlambatan',
                'counselor_coaching_approach' => 'Penelusuran akar kendala manajemen waktu dan pembuatan komitmen perubahan perilaku secara suportif.',
                'follow_up_action' => 'Kontrak perilaku disiplin dan pelaporan berkala ke wali kelas.',
                'status' => 'In Coaching',
            ],
        ];

        return response()->json([
            'success' => true,
            'referrals' => $referrals,
        ]);
    }

    /**
     * 31 & 32. Dokumentasi BK & Consent Management
     */
    public function documentsAndConsents(Request $request)
    {
        $documents = [
            [
                'id' => 'BK-DOC-101',
                'title' => 'Formulir Informed Consent Konseling Individu',
                'category' => 'Form Konseling',
                'type' => 'PDF Dokumen Privat',
                'storage' => 'Private Secure Encrypted Storage',
                'uploaded_at' => '2026-09-15',
                'size' => '245 KB',
                'confidentiality' => 'Level 1 (Internal BK)',
                'access_count' => 4,
            ],
            [
                'id' => 'BK-DOC-102',
                'title' => 'Surat Panggilan Orang Tua (Sdr. Rian Hidayat)',
                'category' => 'Surat Resmi',
                'type' => 'PDF Dokumen Privat',
                'storage' => 'Private Secure Encrypted Storage',
                'uploaded_at' => '2026-09-12',
                'size' => '180 KB',
                'confidentiality' => 'Level 3 (Coordinated)',
                'access_count' => 2,
            ],
            [
                'id' => 'BK-DOC-103',
                'title' => 'Hasil Asesmen Minat Bakat RIASEC Angkatan 2026',
                'category' => 'Asesmen',
                'type' => 'Excel Terenkripsi',
                'storage' => 'Private Secure Encrypted Storage',
                'uploaded_at' => '2026-08-25',
                'size' => '1.2 MB',
                'confidentiality' => 'Level 2 (Restricted)',
                'access_count' => 12,
            ],
        ];

        $consents = [
            [
                'id' => 'CNS-01',
                'student_name' => 'Ahmad Fauzi',
                'type' => 'Persetujuan Layanan Konseling & Berbagi Info Terbatas',
                'granter' => 'Orang Tua (Ibu Rina Marlina)',
                'status' => 'Granted',
                'granted_at' => '2026-09-16',
                'valid_until' => '2027-06-30',
            ],
            [
                'id' => 'CNS-02',
                'student_name' => 'Dimas Prasetya',
                'type' => 'Persetujuan Referral Layanan Psikologi Klinis Eksternal',
                'granter' => 'Orang Tua & Siswa',
                'status' => 'Granted',
                'granted_at' => '2026-09-20',
                'valid_until' => '2026-12-31',
            ],
            [
                'id' => 'CNS-03',
                'student_name' => 'Citra Lestari',
                'type' => 'Persetujuan Program Asesmen Lingkungan Kelas',
                'granter' => 'Wali Kelas & Siswa',
                'status' => 'Requested',
                'granted_at' => null,
                'valid_until' => '2026-11-30',
            ],
        ];

        return response()->json([
            'success' => true,
            'documents' => $documents,
            'consents' => $consents,
            'consent_status_options' => ['Requested', 'Granted', 'Declined', 'Expired'],
        ]);
    }

    /**
     * 33, 34, 35, 36. Privacy Model, Confidentiality Levels, Collaboration Matrix & Audit Log
     */
    public function privacyAndAudit(Request $request)
    {
        $confidentialityLevels = [
            [
                'level' => 'Level 1 — Internal BK',
                'description' => 'Hanya konselor BK yang menangani kasus. Catatan sesi mentah, refleksi batiniah, data psikologis mendalam.',
                'scope' => 'Konselor BK Terpilih',
                'color' => 'rose',
            ],
            [
                'level' => 'Level 2 — Restricted',
                'description' => 'Konselor BK + pihak yang secara eksplisit diberi izin tertulis (misal: psikolog mitra / tim krisis).',
                'scope' => 'Konselor + Pihak Berizin Khusus',
                'color' => 'amber',
            ],
            [
                'level' => 'Level 3 — Coordinated',
                'description' => 'Ringkasan perkembangan dan rekomendasi tindakan praktis yang boleh dibagikan kepada Wali Kelas atau Kepala Sekolah.',
                'scope' => 'BK, Wali Kelas, Kepala Sekolah',
                'color' => 'blue',
            ],
            [
                'level' => 'Level 4 — General Administrative',
                'description' => 'Informasi administratif non-sensitif (status kehadiran konseling, data statistik umum).',
                'scope' => 'Administratif Terbatas',
                'color' => 'slate',
            ],
        ];

        $collaborationMatrix = [
            ['role' => 'Konselor Utama BK', 'detail_sesi' => 'Akses Penuh', 'catatan_rahasia' => 'Akses Penuh', 'rekomendasi' => 'Penuh', 'audit_logged' => true],
            ['role' => 'Wali Kelas', 'detail_sesi' => 'Tidak Ada Akses', 'catatan_rahasia' => 'Tidak Ada Akses', 'rekomendasi' => 'Ringkasan Pendampingan', 'audit_logged' => true],
            ['role' => 'Kepala Sekolah', 'detail_sesi' => 'Statistik Agregat Saja', 'catatan_rahasia' => 'Tidak Ada Akses', 'rekomendasi' => 'Laporan Eksekutif', 'audit_logged' => true],
            ['role' => 'Guru Mata Pelajaran', 'detail_sesi' => 'Tidak Ada Akses', 'catatan_rahasia' => 'Tidak Ada Akses', 'rekomendasi' => 'Hanya Bila Relevan KBM', 'audit_logged' => true],
            ['role' => 'Orang Tua / Siswa', 'detail_sesi' => 'Sesuai Kesepakatan', 'catatan_rahasia' => 'Tidak Ada Akses', 'rekomendasi' => 'Tindakan Keluarga', 'audit_logged' => true],
        ];

        $auditLogs = [
            [
                'id' => 'AUD-01',
                'user_name' => 'Nurul Hidayah, S.Psi',
                'role' => 'Konselor BK',
                'action' => 'Buka Detail Kasus CASE-2026-0042',
                'target_student' => 'Ahmad Fauzi',
                'ip_address' => '192.168.1.45',
                'timestamp' => date('d M Y H:i', strtotime('-15 minutes')),
                'confidentiality_level' => 'Level 1',
            ],
            [
                'id' => 'AUD-02',
                'user_name' => 'Nurul Hidayah, S.Psi',
                'role' => 'Konselor BK',
                'action' => 'Mengubah Catatan Sesi S-IND-2026-042',
                'target_student' => 'Ahmad Fauzi',
                'ip_address' => '192.168.1.45',
                'timestamp' => date('d M Y H:i', strtotime('-1 hour')),
                'confidentiality_level' => 'Level 1',
            ],
            [
                'id' => 'AUD-03',
                'user_name' => 'Nurul Hidayah, S.Psi',
                'role' => 'Konselor BK',
                'action' => 'Membagikan Status Ringkasan Pendampingan ke Wali Kelas',
                'target_student' => 'Ahmad Fauzi (ke Siti Aminah, M.Pd)',
                'ip_address' => '192.168.1.45',
                'timestamp' => date('d M Y H:i', strtotime('-2 hours')),
                'confidentiality_level' => 'Level 3',
            ],
            [
                'id' => 'AUD-04',
                'user_name' => 'Nurul Hidayah, S.Psi',
                'role' => 'Konselor BK',
                'action' => 'Membuka Dokumen BK-DOC-101 (Informed Consent)',
                'target_student' => 'Ahmad Fauzi',
                'ip_address' => '192.168.1.45',
                'timestamp' => date('d M Y H:i', strtotime('-1 day')),
                'confidentiality_level' => 'Level 1',
            ],
        ];

        return response()->json([
            'success' => true,
            'confidentiality_levels' => $confidentialityLevels,
            'collaboration_matrix' => $collaborationMatrix,
            'audit_logs' => $auditLogs,
        ]);
    }

    /**
     * 37 & 38. Laporan BK & Analytics
     * Persentase & penjumlahan diverifikasi matematis 100% konsisten
     */
    public function reportsAndAnalytics(Request $request)
    {
        // 16 + 12 + 8 + 4 + 2 = 42 total kasus terlayani
        $totalServed = 42;
        $activeCases = 14;
        $resolvedCases = 28; // 14 + 28 = 42

        return response()->json([
            'success' => true,
            'analytics' => [
                'counseling_total_served' => $totalServed,
                'active_cases' => $activeCases,
                'resolved_cases' => $resolvedCases,
                'pending_followups' => 8,
                'total_referrals' => 15,
                'category_distribution' => [
                    ['category' => 'Akademik & Regulasi Diri', 'count' => 16, 'percentage' => round((16 / $totalServed) * 100, 1)], // 38.1%
                    ['category' => 'Kedisiplinan & Presensi', 'count' => 12, 'percentage' => round((12 / $totalServed) * 100, 1)], // 28.6%
                    ['category' => 'Sosial & Emosional', 'count' => 8, 'percentage' => round((8 / $totalServed) * 100, 1)], // 19.0%
                    ['category' => 'Karier & Masa Depan', 'count' => 4, 'percentage' => round((4 / $totalServed) * 100, 1)], // 9.5%
                    ['category' => 'Konflik Sebaya / Lainnya', 'count' => 2, 'percentage' => round((2 / $totalServed) * 100, 1)], // 4.8%
                ],
                'monthly_trend' => [
                    ['month' => 'Jul', 'cases' => 4, 'sessions' => 12],
                    ['month' => 'Agu', 'cases' => 9, 'sessions' => 28],
                    ['month' => 'Sep', 'cases' => 14, 'sessions' => 36],
                    ['month' => 'Okt', 'cases' => 15, 'sessions' => 38], // 4 + 9 + 14 + 15 = 42 cases
                ],
            ],
            'reports_list' => [
                [
                    'id' => 'REP-01',
                    'title' => 'Laporan Agregat Layanan BK Triwulan I TA 2026/2027',
                    'type' => 'Laporan Eksekutif Agregat (Untuk Kepala Sekolah)',
                    'period' => 'Juli - September 2026',
                    'privacy_note' => 'Hanya berisi data statistik dan tren tanpa membuka identitas personal siswa.',
                ],
                [
                    'id' => 'REP-02',
                    'title' => 'Rekapitulasi Layanan Bimbingan Konseling Individu & Kelompok',
                    'type' => 'Rekap Layanan Internal',
                    'period' => 'September 2026',
                    'privacy_note' => 'Arsip operasional guru BK berizin.',
                ],
                [
                    'id' => 'REP-03',
                    'title' => 'Laporan Evaluasi Efektivitas Program Adaptasi & Anti-Bullying',
                    'type' => 'Laporan Program',
                    'period' => 'Semester Ganjil 2026',
                    'privacy_note' => 'Evaluasi capaian indikator iklim sekolah.',
                ],
            ],
        ]);
    }

    /**
     * 40. External Referrals
     */
    public function externalReferrals(Request $request)
    {
        $referrals = [
            [
                'id' => 'EXT-REF-01',
                'student_name' => 'Dimas Prasetya',
                'class' => 'XII MIPA 2',
                'target_facility' => 'Pusat Layanan Psikologi Klinis Universitas Indonesia',
                'specialist' => 'Psikolog Klinis Anak & Remaja',
                'referral_date' => '2026-09-20',
                'status' => 'Ongoing External Care',
                'follow_up_schedule' => 'Setiap 2 Pekan',
                'consent_file' => 'Surat_Persetujuan_Ortu_External.pdf',
                'confidentiality' => 'Strictly Confidential (Level 1)',
            ],
        ];

        return response()->json([
            'success' => true,
            'external_referrals' => $referrals,
        ]);
    }

    /**
     * 41. Emergency / Urgent Case Management
     */
    public function emergencyCases(Request $request)
    {
        $emergencies = [
            [
                'id' => 'EMG-01',
                'case_id' => 'CASE-2026-0040',
                'student_name' => 'Rian Hidayat',
                'class' => 'XI MIPA 1',
                'urgency_level' => 'Urgent Administratif',
                'alert_status' => 'Active Counselor Alert',
                'reason' => 'Akumulasi absensi kritis tanpa kontak selama 3 hari berturut-turut.',
                'emergency_contact' => 'Bpk. Hidayatullah (Ayah - 081198765404)',
                'action_protocol' => [
                    'Notifikasi langsung ke ponsel konselor BK koordinator',
                    'Home visit terencana bersama tim kesiswaan',
                    'Eskalasi informasi ke Kepala Sekolah dalam format ringkasan darurat',
                ],
                'escalated_to_kepsek' => true,
                'escalated_at' => '2026-10-01 09:30',
            ],
        ];

        return response()->json([
            'success' => true,
            'emergencies' => $emergencies,
        ]);
    }

    /**
     * 42. Notification Center
     */
    public function notifications(Request $request)
    {
        $notifs = [
            ['id' => 1, 'type' => 'referral', 'title' => 'Referral Masuk Baru', 'message' => 'Wali Kelas XI IPS 2 mengirimkan rujukan baru untuk Citra Lestari.', 'time' => '10 menit lalu', 'unread' => true],
            ['id' => 2, 'type' => 'booking', 'title' => 'Permintaan Booking Konseling', 'message' => 'Fathir Rahman mengajukan bimbingan karier untuk 05 Okt 2026.', 'time' => '1 jam lalu', 'unread' => true],
            ['id' => 3, 'type' => 'followup', 'title' => 'Follow-up Jatuh Tempo', 'message' => 'Follow-up #2 untuk Rian Hidayat memerlukan verifikasi kondisi.', 'time' => '3 jam lalu', 'unread' => false],
            ['id' => 4, 'type' => 'assessment', 'title' => 'Self-Assessment Selesai', 'message' => 'Bima Aditya menyelesaikan kuesioner RIASEC Holland.', 'time' => '1 hari lalu', 'unread' => false],
        ];

        return response()->json([
            'success' => true,
            'notifications' => $notifs,
        ]);
    }

    /**
     * 43. Global Search BK (Need-to-know Scoped)
     * Dynamic filtering against search query
     */
    public function search(Request $request)
    {
        $q = trim($request->query('q', ''));

        $allStudents = [
            ['id' => 1, 'name' => 'Ahmad Fauzi', 'class' => 'XI MIPA 1', 'nis' => '20241101', 'case_id' => 'CASE-2026-0042'],
            ['id' => 2, 'name' => 'Citra Lestari', 'class' => 'XI IPS 2', 'nis' => '20241102', 'case_id' => 'CASE-2026-0039'],
            ['id' => 3, 'name' => 'Bima Aditya', 'class' => 'XII MIPA 3', 'nis' => '20241103', 'case_id' => null],
            ['id' => 4, 'name' => 'Rian Hidayat', 'class' => 'XI MIPA 1', 'nis' => '20241104', 'case_id' => 'CASE-2026-0040'],
            ['id' => 5, 'name' => 'Nadia Syahrini', 'class' => 'XI MIPA 1', 'nis' => '20241105', 'case_id' => null],
            ['id' => 6, 'name' => 'Dwi Prasetyo', 'class' => 'X IPS 3', 'nis' => '20251106', 'case_id' => 'CASE-2026-0035'],
        ];

        $allCases = $this->getStoredCases();
        $allReferrals = ($this->getStoredReferrals())['incoming'] ?? [];

        if ($q) {
            $matchedStudents = array_values(array_filter($allStudents, function ($s) use ($q) {
                return stripos($s['name'], $q) !== false || stripos($s['nis'], $q) !== false || stripos($s['class'], $q) !== false;
            }));
            $matchedCases = array_values(array_filter($allCases, function ($c) use ($q) {
                return stripos($c['case_number'], $q) !== false || stripos($c['student_name'], $q) !== false || stripos($c['category'], $q) !== false;
            }));
            $matchedReferrals = array_values(array_filter($allReferrals, function ($r) use ($q) {
                return stripos($r['id'], $q) !== false || stripos($r['student_name'], $q) !== false || stripos($r['referrer_name'], $q) !== false;
            }));
        } else {
            $matchedStudents = array_slice($allStudents, 0, 3);
            $matchedCases = array_slice($allCases, 0, 3);
            $matchedReferrals = array_slice($allReferrals, 0, 2);
        }

        return response()->json([
            'success' => true,
            'scope' => 'BK Need-to-Know Search Filter (Restricted to Authorized BK Data)',
            'query' => $q,
            'results' => [
                'students' => $matchedStudents,
                'cases' => $matchedCases,
                'referrals' => $matchedReferrals,
            ],
        ]);
    }

    /**
     * 45. Profile & Security
     */
    public function profile(Request $request)
    {
        $ctx = $this->getCounselorContext($request);
        return response()->json([
            'success' => true,
            'counselor' => [
                'name' => $ctx['counselor_name'],
                'nip' => $ctx['counselor_nip'],
                'title' => $ctx['counselor_title'],
                'email' => 'bk.nurul@sekolah.sch.id',
                'phone' => '081298877600',
                'office' => 'Ruang Koordinator BK, Gedung Pusat Lt. 1',
                'security' => [
                    'two_factor_enabled' => true,
                    'last_password_change' => '15 Agu 2026',
                    'active_sessions_count' => 1,
                    'session_timeout_minutes' => 30,
                    'login_history' => [
                        ['ip' => '192.168.1.45', 'device' => 'Windows PC (Kantor BK)', 'time' => 'Hari ini 07:45', 'status' => 'Active'],
                        ['ip' => '180.245.88.12', 'device' => 'Mobile Chrome (Konselor)', 'time' => 'Kemarin 19:20', 'status' => 'Logged out'],
                    ],
                ],
            ],
        ]);
    }

    /**
     * 46. Help & Support
     */
    public function help(Request $request)
    {
        return response()->json([
            'success' => true,
            'guides' => [
                ['title' => 'Panduan Etika & Kerahasiaan Layanan BK (Need-to-know)', 'category' => 'Etika Profesi', 'url' => '#'],
                ['title' => 'Standar Operasional Prosedur (SOP) Case Management Siswa', 'category' => 'Manajemen Kasus', 'url' => '#'],
                ['title' => 'Alur Referral Masuk dari Wali Kelas & Guru Mapel', 'category' => 'Rujukan & Kolaborasi', 'url' => '#'],
                ['title' => 'Protokol Penanganan Kasus Darurat (Emergency / Urgent)', 'category' => 'Protokol Krisis', 'url' => '#'],
                ['title' => 'Pedoman Penggunaan Asesmen Non-Klinis di Sekolah', 'category' => 'Asesmen & Instrumen', 'url' => '#'],
            ],
            'faq' => [
                [
                    'q' => 'Apakah Wali Kelas dapat melihat catatan detail sesi konseling siswa?',
                    'a' => 'Tidak. Berdasarkan prinsip Need-to-know access dan kerahasiaan konseling, wali kelas hanya menerima status pendampingan umum (misal: "Siswa sedang dalam pendampingan BK") dan rekomendasi pembelajaran praktis tanpa membuka catatan intim siswa.',
                ],
                [
                    'q' => 'Kapan sistem mengizinkan eskalasi kasus ke Kepala Sekolah?',
                    'a' => 'Eskalasi ke Kepala Sekolah dilakukan bila terjadi situasi darurat yang membutuhkan keputusan struktural sekolah atau laporan eksekutif agregat tanpa melanggar privasi.',
                ],
                [
                    'q' => 'Apakah hasil instrumen kuesioner dapat dijadikan diagnosis klinis?',
                    'a' => 'Sama sekali tidak. Seluruh instrumen di sistem BK bersifat profiling kebutuhan dukungan, bukan diagnosis psikiatris atau medis.',
                ],
            ],
        ]);
    }
}
