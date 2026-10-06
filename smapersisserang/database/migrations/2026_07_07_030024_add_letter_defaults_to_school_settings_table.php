<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->string('default_letter_classification_code', 30)->nullable()->default('421.3');
            $table->string('default_letter_school_code', 50)->nullable()->default('SMA-PERSIS-SRG');
            $table->boolean('default_letter_show_basmallah')->nullable()->default(true);
            $table->text('default_letter_basmallah_text')->nullable();
            $table->boolean('default_letter_show_closing_dua')->nullable()->default(true);
            $table->text('default_letter_closing_dua_text')->nullable();
            $table->unsignedTinyInteger('default_letter_pdf_font_size')->nullable()->default(11);
        });
    }

    public function down(): void
    {
        Schema::table('school_settings', function (Blueprint $table) {
            $table->dropColumn([
                'default_letter_classification_code',
                'default_letter_school_code',
                'default_letter_show_basmallah',
                'default_letter_basmallah_text',
                'default_letter_show_closing_dua',
                'default_letter_closing_dua_text',
                'default_letter_pdf_font_size',
            ]);
        });
    }
};
