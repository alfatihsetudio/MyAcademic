<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letter_types', function (Blueprint $table) {
            if (! Schema::hasColumn('letter_types', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('letter_types', function (Blueprint $table) {
            if (Schema::hasColumn('letter_types', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
