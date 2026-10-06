<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('academic_year', 20)->unique();
            $table->date('start_date');
            $table->date('end_date');
            $table->date('odd_semester_start_date')->nullable();
            $table->date('odd_semester_end_date')->nullable();
            $table->date('even_semester_start_date')->nullable();
            $table->date('even_semester_end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('is_current');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_years');
    }
};
