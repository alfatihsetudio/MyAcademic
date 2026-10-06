<?php

namespace App\Http\Controllers;

use App\Models\SchoolSetting;
use App\Models\AdmissionYear;
use App\Models\StudentApplication;
use App\Models\VisitorLog;
use Illuminate\Http\Request;

class PublicProgressController extends Controller
{
    public function show(Request $request, string $token)
    {
        $setting = SchoolSetting::current();

        if (!$setting || !$setting->public_dashboard_token || !hash_equals($setting->public_dashboard_token, $token)) {
            abort(404);
        }

        $currentYear = AdmissionYear::where('is_current', true)->first();

        $counts = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
            ->selectRaw("status, count(*) as total")
            ->groupBy('status')
            ->pluck('total', 'status');

        $quota = $currentYear?->quota ?? 0;
        $total = array_sum($counts->toArray()) ?: 0;
        $terisi = $counts->get('diterima', 0);
        $sisa = max(0, $quota - $terisi);
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

        $donasiVisits = VisitorLog::where('path', '/donasi-pendidikan')->count();

        $topPages = VisitorLog::selectRaw('path, url, count(*) as total, max(visited_at) as last_visited')
            ->where('path', 'NOT LIKE', '/progress%')
            ->where('path', 'NOT LIKE', '%dashboard%')
            ->where('path', 'NOT LIKE', '/admin%')
            ->groupBy('path', 'url')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        $topReferrers = VisitorLog::selectRaw('referrer, count(*) as total')
            ->where(function ($q) {
                $q->whereNull('referrer')
                  ->orWhere('referrer', '')
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('referrer')
                          ->where('referrer', '!=', '')
                          ->where('referrer', 'NOT LIKE', '%/progress/%')
                          ->where('referrer', 'NOT LIKE', '%/dashboard%')
                          ->where('referrer', 'NOT LIKE', '%/admin%');
                  });
            })
            ->groupBy('referrer')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(function ($item) {
                if (empty($item->referrer)) {
                    $item->referrer = 'Langsung / WhatsApp';
                }
                return $item;
            });

        $deviceStats = VisitorLog::selectRaw("device, count(*) as total")
            ->whereNotNull('device')
            ->groupBy('device')
            ->orderByDesc('total')
            ->get();

        $baseQuery = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id));

        $totalLakiLaki = (clone $baseQuery)
            ->where(function ($q) {
                $q->whereIn('gender', ['L', 'l', 'laki-laki', 'laki_laki', 'laki laki', 'male']);
            })->count();

        $totalPerempuan = (clone $baseQuery)
            ->where(function ($q) {
                $q->whereIn('gender', ['P', 'p', 'perempuan', 'female']);
            })->count();

        $students = (clone $baseQuery)
            ->latest()
            ->limit(50)
            ->get(['student_name', 'gender', 'previous_school', 'status', 'created_at']);

        $statusLabels = [
            'baru_daftar' => 'Baru Daftar',
            'menunggu_verifikasi' => 'Menunggu',
            'data_kurang' => 'Data Kurang',
            'terverifikasi' => 'Terverifikasi',
            'diterima' => 'Diterima',
            'ditolak' => 'Ditolak',
        ];

        return view('public.progress', compact(
            'currentYear', 'counts', 'quota', 'terisi', 'sisa', 'total', 'menunggu',
            'visitorToday', 'visitorTodayUnique', 'visitor7Days', 'visitor7DaysUnique',
            'visitor30Days', 'visitor30DaysUnique', 'totalVisits', 'spmbVisits',
            'donasiVisits',
            'topPages', 'topReferrers', 'deviceStats',
            'totalLakiLaki', 'totalPerempuan',
            'students', 'statusLabels',
            'now',
        ));
    }
}
