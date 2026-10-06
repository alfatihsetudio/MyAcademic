<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50)->unique();
            $table->string('display_name', 100);
            $table->string('guard_name', 30)->default('web');
            $table->timestamps();
        });

        $now = now();
        $roles = [
            ['name' => 'superadmin', 'display_name' => 'Superadmin', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'admin', 'display_name' => 'Admin', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'kepala_sekolah', 'display_name' => 'Kepala Sekolah', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'guru', 'display_name' => 'Guru', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'staf_tata_usaha', 'display_name' => 'Staf Tata Usaha', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'staf_keuangan', 'display_name' => 'Staf Keuangan', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'staf_kesiswaan', 'display_name' => 'Staf Kesiswaan', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
            ['name' => 'staf_sarpras', 'display_name' => 'Staf Sarpras', 'guard_name' => 'web', 'created_at' => $now, 'updated_at' => $now],
        ];

        DB::table('roles')->insert($roles);
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
