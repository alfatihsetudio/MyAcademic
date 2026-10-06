<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function settings()
    {
        $user = Auth::user();
        return view('account.settings', compact('user'));
    }

    public function update(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email,' . $user->id,
            'current_password' => 'nullable|string',
            'new_password' => 'nullable|string|min:6|confirmed',
        ]);

        // If changing password, verify current password
        if (!empty($validated['new_password']) || (!empty($validated['current_password']) && !empty($request->input('current_password')))) {
            if (empty($validated['current_password']) || !Hash::check($validated['current_password'], $user->password)) {
                return back()->withErrors(['current_password' => 'Password saat ini tidak sesuai.'])->withInput();
            }
            if (!empty($validated['new_password'])) {
                $user->password = Hash::make($validated['new_password']);
            }
        }

        $user->name = $validated['name'];
        $user->nama = $validated['name'];
        $user->email = $validated['email'];
        $user->save();

        return back()->with('success', 'Pengaturan akun dan password berhasil diperbarui.');
    }
}
