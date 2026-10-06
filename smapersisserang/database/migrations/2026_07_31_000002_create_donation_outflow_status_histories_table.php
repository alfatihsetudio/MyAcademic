<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_outflow_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_outflow_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['donation_outflow_id', 'created_at'], 'outflow_hist_outflow_created_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_outflow_status_histories');
    }
};
