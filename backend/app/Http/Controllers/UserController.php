<?php

namespace App\Http\Controllers;

use App\Models\AcademicClass;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        $roleFilter = $request->query('role');

        $query = User::with('classes')
            ->where('school_id', $schoolId);

        if ($roleFilter && in_array($roleFilter, ['admin', 'guru', 'murid'])) {
            if ($roleFilter === 'murid') {
                $query->whereIn('role', ['murid', 'siswa']);
            } else {
                $query->where('role', $roleFilter);
            }
        }

        $users = $query->orderBy('name')->paginate(20);

        return view('users.index', compact('users', 'roleFilter'));
    }

    public function create()
    {
        $schoolId = Auth::user()->school_id ?: 1;
        $classes = AcademicClass::where('school_id', $schoolId)->orderBy('nama_kelas')->get();

        return view('users.create', compact('classes'));
    }

    public function store(Request $request)
    {
        $schoolId = Auth::user()->school_id ?: 1;

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:users,email',
            'role' => 'required|in:guru,murid,admin',
            'class_id' => 'nullable|exists:classes,id',
            'jenjang' => 'nullable|string|max:50',
            'jurusan' => 'nullable|string|max:100',
            'password' => 'nullable|string|min:6',
        ]);

        $plainPassword = $validated['password'] ?: Str::random(8);

        $user = User::create([
            'school_id' => $schoolId,
            'name' => $validated['name'],
            'nama' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($plainPassword),
            'class_id' => $validated['class_id'] ?? null,
            'jenjang' => $validated['jenjang'] ?? null,
            'jurusan' => $validated['jurusan'] ?? null,
        ]);

        if (!empty($validated['class_id']) && $validated['role'] === 'murid') {
            $user->classes()->syncWithoutDetaching([$validated['class_id']]);
        }

        return redirect()->route('users.index')->with('success', "Akun {$user->name} berhasil dibuat. Password: {$plainPassword}");
    }

    public function destroy(User $user)
    {
        $schoolId = Auth::user()->school_id ?: 1;
        if ($user->school_id && $user->school_id !== $schoolId) {
            abort(403);
        }

        if ($user->id === Auth::id()) {
            return back()->withErrors(['msg' => 'Tidak dapat menghapus akun sendiri.']);
        }

        $nama = $user->name;
        $user->delete();

        return redirect()->route('users.index')->with('success', "Pengguna {$nama} berhasil dihapus.");
    }
}
