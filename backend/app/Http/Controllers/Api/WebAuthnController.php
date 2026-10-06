<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPasskey;
use App\Services\WebAuthn\WebAuthnService;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebAuthnController extends Controller
{
    protected WebAuthnService $webAuthnService;

    public function __construct(WebAuthnService $webAuthnService)
    {
        $this->webAuthnService = $webAuthnService;
    }

    /**
     * Get list of registered passkeys for current user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $passkeys = $user->passkeys()->select([
            'id',
            'credential_id',
            'name',
            'algorithm',
            'sign_count',
            'last_used_at',
            'created_at',
        ])->get();

        return response()->json([
            'success' => true,
            'passkeys' => $passkeys,
        ]);
    }

    /**
     * Start passkey registration: returns challenge & options
     */
    public function registerOptions(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $options = $this->webAuthnService->generateRegistrationOptions($user, $request);

            return response()->json($options);
        } catch (Exception $e) {
            Log::error('WebAuthn register options error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyiapkan pendaftaran sidik jari: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Complete passkey registration: verifies credential and saves to database
     */
    public function registerVerify(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $data = $request->all();

            $passkey = $this->webAuthnService->verifyRegistration($user, $data, $request);

            return response()->json([
                'success' => true,
                'message' => 'Sidik jari / Passkey berhasil didaftarkan!',
                'passkey' => [
                    'id' => $passkey->id,
                    'credential_id' => $passkey->credential_id,
                    'name' => $passkey->name,
                    'created_at' => $passkey->created_at,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('WebAuthn register verify error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi pendaftaran biometrik gagal: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Start login: returns assertion options & challenge
     */
    public function loginOptions(Request $request): JsonResponse
    {
        try {
            $identifier = $request->input('identifier') ?: $request->input('email') ?: $request->input('username');
            $options = $this->webAuthnService->generateLoginOptions($identifier, $request);

            return response()->json($options);
        } catch (Exception $e) {
            Log::error('WebAuthn login options error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyiapkan login sidik jari: ' . $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Complete login: verifies signature and generates Sanctum token
     */
    public function loginVerify(Request $request): JsonResponse
    {
        try {
            $data = $request->all();
            $user = $this->webAuthnService->verifyLogin($data, $request);

            // Generate Sanctum token
            $token = $user->createToken('biometric-token')->plainTextToken;

            // Record session
            try {
                $userAgent = $request->header('User-Agent', 'Biometric Browser');
                $ip = $request->ip() ?: '127.0.0.1';

                $user->loginSessions()->create([
                    'session_id' => bin2hex(random_bytes(16)),
                    'device_name' => 'Sidik Jari / Passkey (' . ($request->header('sec-ch-ua-platform') ?: 'Desktop') . ')',
                    'browser' => 'WebAuthn Biometric',
                    'ip_address' => $ip,
                    'user_agent' => $userAgent,
                    'last_active_at' => now(),
                    'is_current' => true,
                ]);
            } catch (\Throwable $e) {
                // Ignore session logging failures
            }

            return response()->json([
                'success' => true,
                'message' => 'Login sidik jari berhasil! Selamat datang kembali.',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name ?: $user->nama,
                    'email' => $user->email,
                    'role' => $user->role,
                    'school_id' => $user->school_id,
                    'class_id' => $user->class_id,
                ],
            ]);
        } catch (Exception $e) {
            Log::error('WebAuthn login verify error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Delete/Revoke a passkey
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $passkey = $user->passkeys()->where('id', $id)->first();

        if (!$passkey) {
            return response()->json([
                'success' => false,
                'message' => 'Data sidik jari tidak ditemukan.',
            ], 404);
        }

        $passkey->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sidik jari berhasil dihapus dari akun.',
        ]);
    }
}
