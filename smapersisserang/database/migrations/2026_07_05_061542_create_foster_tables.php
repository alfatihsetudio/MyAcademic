<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('foster_students', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('gender');
            $table->string('class_name');
            $table->string('origin')->nullable();
            $table->string('photo_path')->nullable();
            $table->text('need_description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_priority')->default(false);
            $table->enum('foster_status', ['available', 'assigned', 'inactive'])->default('available');
            $table->timestamps();
        });

        Schema::create('foster_parent_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('foster_student_id')->nullable()->constrained()->nullOnDelete();
            $table->string('donor_name')->nullable();
            $table->string('donor_phone')->nullable();
            $table->bigInteger('amount');
            $table->string('commitment_duration');
            $table->text('note')->nullable();
            $table->text('qris_payload')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('foster_parent_submissions');
        Schema::dropIfExists('foster_students');
    }
};
