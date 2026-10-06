<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('organization_structures', 'photo_path')) {
            return;
        }

        Schema::table('organization_structures', function (Blueprint $table) {
            $table->dropColumn('photo_path');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('organization_structures', 'photo_path')) {
            return;
        }

        Schema::table('organization_structures', function (Blueprint $table) {
            $table->string('photo_path')->nullable()->after('person_id');
        });
    }
};
