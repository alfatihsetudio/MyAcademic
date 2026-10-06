<?php

namespace App\Services;

use App\Models\StudentApplication;
use App\Models\VisitorLog;
use Illuminate\Support\Carbon;
class DashboardStatsService
{
    public function getSpmbStats(): array
    {
        $currentYear = \App\Models\AdmissionYear::where('is_current', true)->first();
        $counts = StudentApplication::when($currentYear, fn($q) => $q->where('admission_year_id', $currentYear->id))
            ->selectRaw("status, count(*) as total")
            ->groupBy('status')
            ->pluck('total', 'status');

        $quota = $currentYear?->quota ?? 0;
        $terisi = $counts->get('diterima', 0);
        $sisa = max(0, $quota - $terisi);

        return [
            'currentYear' => $currentYear,
            'quota' => $quota,
            'terisi' => $terisi,
            'sisa' => $sisa,
            'total' => array_sum($counts->toArray()) ?: 0,
            'menunggu' => $counts->get('menunggu_verifikasi', 0) + $counts->get('baru_daftar', 0),
        ];
    }

    public function getVisitorStats(): array
    {
        $now = now();
        $today = $now->toDateString();

        return [
            'visitorToday' => VisitorLog::whereDate('visited_at', $today)->count(),
            'visitorTodayUnique' => VisitorLog::whereDate('visited_at', $today)->distinct('ip_hash')->count('ip_hash'),
            'visitor7Days' => VisitorLog::where('visited_at', '>=', $now->copy()->subDays(7))->count(),
            'visitor7DaysUnique' => VisitorLog::where('visited_at', '>=', $now->copy()->subDays(7))->distinct('ip_hash')->count('ip_hash'),
            'visitor30Days' => VisitorLog::where('visited_at', '>=', $now->copy()->subDays(30))->count(),
            'visitor30DaysUnique' => VisitorLog::where('visited_at', '>=', $now->copy()->subDays(30))->distinct('ip_hash')->count('ip_hash'),
            'totalVisits' => VisitorLog::count(),
            'spmbVisits' => VisitorLog::where(function ($q) {
                $q->where('path', 'like', '%/spmb%')
                  ->orWhere('path', 'like', '%/ppdb%');
            })->count(),
            'donasiVisits' => VisitorLog::where('path', '/donasi-pendidikan')->count(),
        ];
    }

    public function getPopularPages(int $limit = 10): \Illuminate\Support\Collection
    {
        return VisitorLog::selectRaw('path, url, count(*) as total, max(visited_at) as last_visited')
            ->where('path', 'NOT LIKE', '/progress%')
            ->where('path', 'NOT LIKE', '%dashboard%')
            ->where('path', 'NOT LIKE', '/admin%')
            ->groupBy('path', 'url')
            ->orderByDesc('total')
            ->take($limit)
            ->get();
    }

    public function getTopReferrers(int $limit = 5): \Illuminate\Support\Collection
    {
        return VisitorLog::selectRaw('referrer, count(*) as total')
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
            ->take($limit)
            ->get()
            ->map(function ($item) {
                if (empty($item->referrer)) {
                    $item->referrer = 'Langsung / WhatsApp';
                }
                return $item;
            });
    }

    public function getDeviceStats(): \Illuminate\Support\Collection
    {
        return VisitorLog::selectRaw("device, count(*) as total")
            ->whereNotNull('device')
            ->groupBy('device')
            ->orderByDesc('total')
            ->get();
    }

    public function getAll(): array
    {
        return array_merge(
            $this->getSpmbStats(),
            $this->getVisitorStats(),
            [
                'topPages' => $this->getPopularPages(),
                'topReferrers' => $this->getTopReferrers(),
                'deviceStats' => $this->getDeviceStats(),
            ]
        );
    }
}
