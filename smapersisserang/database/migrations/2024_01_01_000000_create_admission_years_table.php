<?php

namespace Database\Migrations;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_years', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('academic_year');
            $table->integer('quota');
            $table->enum('status', ['draft', 'open', 'almost_full', 'quota_full', 'closed', 'announcement', 'archived']);
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_current');
            $table->text('description');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_years');
    }
};