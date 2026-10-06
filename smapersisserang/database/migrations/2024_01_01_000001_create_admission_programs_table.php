<?php

namespace Database\Migrations;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 2. admission_programs table  
        Schema::create('admission_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_year_id')->constrained()->onDelete('cascade');
            $table->string('name'); // "Program Gratis Angkatan Pertama"
            $table->enum('type', ['first_batch_free', 'regular_paid', 'scholarship', 'subsidy']);
            $table->integer('quota'); // subset of 36
            $table->decimal('tuition_fee', 10, 2); // 0 for free
            $table->decimal('boarding_fee', 10, 2); // 0 for free
            $table->decimal('meal_fee', 10, 2); // 0 for free
            $table->decimal('registration_fee', 10, 2); // 0 for free
            $table->decimal('other_fee', 10, 2); // 0 for free
            $table->boolean('is_free_program')->default(false);
            $table->enum('status', ['draft', 'open', 'full', 'closed']);
            $table->date('start_date');
            $table->date('end_date');
            $table->text('description');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_programs');
    }
};