<?php

namespace Database\Migrations;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 4. application_status_histories table
        Schema::create('application_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_application_id')->constrained()->onDelete('cascade');
            $table->string('from_status')->nullable();
            $table->string('to_status'); // REQUIRED
            $table->foreignId('changed_by')->nullable()->constrained('users');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_histories');
    }
};