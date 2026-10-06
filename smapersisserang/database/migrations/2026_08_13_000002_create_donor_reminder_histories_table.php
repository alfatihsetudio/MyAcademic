<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donor_reminder_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_regular_donor_id')
                ->constrained('donation_regular_donors')
                ->cascadeOnDelete();
            $table->foreignId('reminded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('reminded_at')->nullable();
            $table->text('message_snapshot')->nullable();
            $table->timestamps();

            $table->index(
                ['donation_regular_donor_id', 'reminded_at'],
                'donor_reminder_donor_date_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donor_reminder_histories');
    }
};
