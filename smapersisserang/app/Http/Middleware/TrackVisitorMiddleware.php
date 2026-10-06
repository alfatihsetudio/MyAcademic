<?php

namespace App\Http\Middleware;

use App\Models\VisitorLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class TrackVisitorMiddleware
{
    protected array $excludedPrefixes = [
        'admin', 'login', 'register', 'logout', 'password',
        'profile', 'ai-chat', 'progress', 'api', 'settings',
    ];

    protected array $excludedPatterns = [
        '/\.(css|js|png|jpg|jpeg|gif|ico|svg|webp|woff2?|ttf|eot|map)$/i',
        '/^build\//',
        '/^storage\//',
        '/^vendor\//',
        '/^_debugbar/',
        '/^telescope/',
        '/^horizon/',
        '/^up$/',
    ];

    protected array $botKeywords = [
        'bot', 'crawler', 'spider', 'slurp', 'bingpreview',
        'googlebot', 'bingbot', 'yandexbot', 'facebookexternalhit',
        'twitterbot', 'whatsapp', 'telegrambot', 'discordbot',
        'slackbot', 'applebot', 'semrush', 'ahrefsbot',
        'dotbot', 'mj12bot', 'baiduspider',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (!$this->shouldTrack($request)) {
            return $response;
        }

        try {
            $this->logVisit($request);
        } catch (\Exception $e) {
            Log::warning('Visitor log error: ' . $e->getMessage());
        }

        return $response;
    }

    protected function shouldTrack(Request $request): bool
    {
        if (!$request->isMethod('GET')) {
            return false;
        }

        if ($request->ajax() || $request->expectsJson()) {
            return false;
        }

        $path = $request->path();

        if ($path === '/') {
            return true;
        }

        foreach ($this->excludedPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return false;
            }
        }

        foreach ($this->excludedPatterns as $pattern) {
            if (preg_match($pattern, $path)) {
                return false;
            }
        }

        $userAgent = $request->userAgent() ?? '';
        foreach ($this->botKeywords as $keyword) {
            if (stripos($userAgent, $keyword) !== false) {
                return false;
            }
        }

        return true;
    }

    protected function logVisit(Request $request): void
    {
        $ipHash = hash_hmac('sha256', $request->ip() ?? '0.0.0.0', config('app.key'));
        $userAgent = $request->userAgent() ?? '';

        VisitorLog::create([
            'url' => $request->fullUrl(),
            'path' => $request->getPathInfo(),
            'title' => null,
            'referrer' => $request->header('referer'),
            'user_agent' => $userAgent,
            'ip_hash' => $ipHash,
            'device' => $this->detectDevice($userAgent),
            'browser' => $this->detectBrowser($userAgent),
            'visited_at' => now(),
        ]);
    }

    protected function detectDevice(string $userAgent): string
    {
        if (empty($userAgent)) {
            return 'desktop';
        }

        $ua = strtolower($userAgent);

        $botKeywords = ['bot', 'crawler', 'spider', 'slurp', 'googlebot', 'bingbot', 'facebookexternalhit'];
        foreach ($botKeywords as $keyword) {
            if (str_contains($ua, $keyword)) {
                return 'bot';
            }
        }

        if (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $ua)) {
            return 'tablet';
        }

        if (preg_match('/(mobile|iphone|ipod|android.*mobile|blackberry|windows phone|opera mini|iemobile)/i', $ua)) {
            return 'mobile';
        }

        return 'desktop';
    }

    protected function detectBrowser(string $userAgent): ?string
    {
        if (empty($userAgent)) {
            return null;
        }

        $browsers = [
            'Edg/' => 'Edge',
            'OPR/' => 'Opera',
            'Firefox/' => 'Firefox',
            'Chrome/' => 'Chrome',
            'Safari/' => 'Safari',
        ];

        foreach ($browsers as $key => $name) {
            if (str_contains($userAgent, $key)) {
                return $name;
            }
        }

        return null;
    }
}
