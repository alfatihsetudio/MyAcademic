<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
            return redirect()->route('login');
        }

        $user = auth()->user();

        // Admin has access to everything
        if ($user->role === 'admin' || (method_exists($user, 'hasRole') && $user->hasRole('admin'))) {
            return $next($request);
        }

        // Allow 'murid' or 'siswa' to match interchangeably
        if (in_array('murid', $roles, true) || in_array('siswa', $roles, true)) {
            if ($user->role === 'murid' || $user->role === 'siswa') {
                return $next($request);
            }
        }

        if (in_array($user->role, $roles, true) || (method_exists($user, 'hasAnyRole') && $user->hasAnyRole($roles))) {
            return $next($request);
        }

        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json(['message' => 'Anda tidak memiliki hak akses ke resource ini.'], 403);
        }

        abort(403, 'Anda tidak memiliki hak akses ke halaman ini.');
    }
}
