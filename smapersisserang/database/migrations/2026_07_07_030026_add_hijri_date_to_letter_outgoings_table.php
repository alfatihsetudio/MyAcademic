<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->string('hijri_date')->nullable()->after('letter_date');
        });
    }

    public function down(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->dropColumn('hijri_date');
        });
    }
};
