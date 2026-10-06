<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->boolean('show_basmallah')->default(true);
            $table->boolean('show_closing_dua')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->dropColumn(['show_basmallah', 'show_closing_dua']);
        });
    }
};
