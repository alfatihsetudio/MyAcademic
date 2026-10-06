<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenantMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = null;

        // 1. From authenticated user
        if ($request->user() && $request->user()->school_id) {
            $tenantId = $request->user()->school_id;
        }

        // 2. From explicit headers
        if (!$tenantId && $request->header('X-Tenant-Id')) {
            $tenantId = (int) $request->header('X-Tenant-Id');
        } elseif (!$tenantId && $request->header('X-School-Id')) {
            $tenantId = (int) $request->header('X-School-Id');
        }

        // 3. Fallback to default school from database
        if (!$tenantId) {
            try {
                $tenantId = Cache::remember('default_tenant_id', 3600, function () {
                    return DB::table('schools')->value('id') ?? 1;
                });
            } catch (\Throwable $e) {
                $tenantId = 1;
            }
        }

        if ($tenantId) {
            app()->instance('current_tenant_id', $tenantId);
        }

        return $next($request);
    }
}
