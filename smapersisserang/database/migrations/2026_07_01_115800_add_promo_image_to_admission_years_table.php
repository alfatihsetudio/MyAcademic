<?php

namespace Database\Migrations;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admission_years', function (Blueprint $table) {
            $table->string('promo_image')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('admission_years', function (Blueprint $table) {
            $table->dropColumn('promo_image');
        });
    }
};
