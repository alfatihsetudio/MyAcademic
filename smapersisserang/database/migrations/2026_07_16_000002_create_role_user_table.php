<?php

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->primary(['user_id', 'role_id']);
        });

        User::query()
            ->whereNotNull('role')
            ->where('role', '!=', '')
            ->chunkById(100, function ($users) {
                foreach ($users as $user) {
                    $role = Role::firstOrCreate(
                        ['name' => $user->role],
                        ['display_name' => ucfirst($user->role), 'guard_name' => 'web']
                    );
                    DB::table('role_user')->updateOrInsert([
                        'user_id' => $user->id,
                        'role_id' => $role->id,
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('role_user');
    }
};
