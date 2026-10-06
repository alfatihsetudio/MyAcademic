<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->text('description')->nullable()->after('display_name');
            $table->boolean('is_system')->default(false)->after('guard_name');
            $table->boolean('is_active')->default(true)->after('is_system');
            $table->unsignedSmallInteger('sort_order')->default(0)->after('is_active');
        });

        $systemRoles = [
            'superadmin' => ['sort_order' => 1],
            'admin' => ['sort_order' => 2],
            'kepala_sekolah' => ['sort_order' => 3],
            'guru' => ['sort_order' => 4],
            'staf_tata_usaha' => ['sort_order' => 5],
            'staf_keuangan' => ['sort_order' => 6],
            'staf_kesiswaan' => ['sort_order' => 7],
            'staf_sarpras' => ['sort_order' => 8],
        ];

        foreach ($systemRoles as $name => $data) {
            Role::where('name', $name)->update([
                'is_system' => true,
                'is_active' => true,
                'sort_order' => $data['sort_order'],
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table) {
            $table->dropColumn(['description', 'is_system', 'is_active', 'sort_order']);
        });
    }
};
