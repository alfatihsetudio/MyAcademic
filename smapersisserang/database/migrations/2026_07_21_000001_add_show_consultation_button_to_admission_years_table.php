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
            $table->boolean('show_consultation_button')->default(true)->after('promo_image');
        });
    }

    public function down(): void
    {
        Schema::table('admission_years', function (Blueprint $table) {
            $table->dropColumn('show_consultation_button');
        });
    }
};
