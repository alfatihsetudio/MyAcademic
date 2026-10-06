<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->string('letter_classification_code', 30)->nullable()->default('421.3');
            $table->string('letter_school_code', 50)->nullable()->default('SMA-PERSIS-SRG');
        });
    }

    public function down(): void
    {
        Schema::table('letter_outgoings', function (Blueprint $table) {
            $table->dropColumn(['letter_classification_code', 'letter_school_code']);
        });
    }
};
