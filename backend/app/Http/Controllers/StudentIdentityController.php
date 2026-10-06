<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Cache;
use App\Models\StudentIdentity;

class StudentIdentityController extends Controller
{
    public function getBasicProfile(Request $request)
    {
        $identity = StudentIdentity::where('user_id', $request->user()->id ?? 1)->first();
        if (!$identity) {
            return response()->json(['message' => 'Not found'], 404);
        }
        return response()->json([
            'name' => $identity->name,
            'class' => $identity->class,
        ]);
    }

    public function verifyAndGetCompleteProfile(Request $request)
    {
        $key = 'verify-identity-'.$request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            return response()->json(['message' => 'Too many verification attempts. Please try again later.'], 429);
        }

        $request->validate([
            'nik_or_nisn' => 'required|string',
            'date_of_birth' => 'required|date',
        ]);

        $identity = StudentIdentity::where('user_id', $request->user()->id ?? 1)->first();
        
        if (!$identity) {
            RateLimiter::hit($key, 60);
            return response()->json(['message' => 'Verification failed.'], 403);
        }

        if (($identity->nik === $request->nik_or_nisn || $identity->nisn === $request->nik_or_nisn) && 
            $identity->date_of_birth->format('Y-m-d') === $request->date_of_birth) {
            RateLimiter::clear($key);
            
            // Set cache token that user is verified (valid for 30 minutes)
            $token = bin2hex(random_bytes(32));
            Cache::put('identity_verified_' . ($request->user()->id ?? 1), $token, now()->addMinutes(30));
            
            return response()->json([
                'nik' => $identity->nik,
                'nisn' => $identity->nisn,
                'date_of_birth' => $identity->date_of_birth->format('Y-m-d'),
                'parents_name' => $identity->parents_name,
                'address' => $identity->address,
                'verification_token' => $token,
            ]);
        }

        RateLimiter::hit($key, 60);
        return response()->json(['message' => 'Verification failed.'], 403);
    }

    public function updateSchoolData(Request $request)
    {
        $expectedToken = Cache::get('identity_verified_' . ($request->user()->id ?? 1));
        $providedToken = $request->header('X-Identity-Token') ?? $request->input('verification_token');

        if (!$expectedToken || $expectedToken !== $providedToken) {
            return response()->json(['message' => 'Unauthorized. Please verify identity again.'], 403);
        }

        $request->validate([
            'nik' => 'sometimes|string',
            'nisn' => 'sometimes|string',
            'name' => 'sometimes|string',
            'date_of_birth' => 'sometimes|date',
        ]);

        // "Data Sekolah" (Change Request logic)
        // In a real app, this would create a change request model.
        // For now, we simulate success message of change request submission.
        return response()->json([
            'message' => 'Change request for school data submitted successfully and is pending admin approval.'
        ]);
    }

    public function updatePersonalData(Request $request)
    {
        $expectedToken = Cache::get('identity_verified_' . ($request->user()->id ?? 1));
        $providedToken = $request->header('X-Identity-Token') ?? $request->input('verification_token');

        if (!$expectedToken || $expectedToken !== $providedToken) {
            return response()->json(['message' => 'Unauthorized. Please verify identity again.'], 403);
        }

        $request->validate([
            'address' => 'sometimes|string',
            'parents_name' => 'sometimes|string',
        ]);

        $identity = StudentIdentity::where('user_id', $request->user()->id ?? 1)->first();
        if (!$identity) {
            return response()->json(['message' => 'Not found'], 404);
        }

        if ($request->has('address')) {
            $identity->address = $request->address;
        }
        if ($request->has('parents_name')) {
            $identity->parents_name = $request->parents_name;
        }
        
        $identity->save();

        return response()->json([
            'message' => 'Personal data updated successfully.'
        ]);
    }
}

