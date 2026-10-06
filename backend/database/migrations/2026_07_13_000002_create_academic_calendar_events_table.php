<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->restrictOnDelete();
            $table->string('title');
            $table->string('category', 50);
            $table->string('source', 20)->default('sekolah');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_all_day')->default(false);
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('day_status', 20)->default('efektif');
            $table->boolean('is_holiday')->default(false);
            $table->boolean('is_effective_day')->default(true);
            $table->json('targets')->nullable();
            $table->string('location')->nullable();
            $table->string('person_in_charge')->nullable();
            $table->text('internal_notes')->nullable();
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['academic_year_id', 'status', 'start_date'], 'ace_year_status_start_idx');
            $table->index('category');
            $table->index('day_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_calendar_events');
    }
};
