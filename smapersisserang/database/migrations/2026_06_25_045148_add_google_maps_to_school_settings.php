<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->text('google_maps_embed_url')->nullable();
            $table->string('google_maps_link', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn('google_maps_embed_url');
            $table->dropColumn('google_maps_link');
        });
    }
};
