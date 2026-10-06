<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_regular_donors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('whatsapp_number', 30)->unique();
            $table->boolean('is_active')->default(true);
            $table->string('source')->default('donasi_pendidikan');
            $table->timestamp('first_donation_at')->nullable();
            $table->timestamp('last_donation_at')->nullable();
            $table->unsignedInteger('total_donations_count')->default(0);
            $table->unsignedBigInteger('total_donations_amount')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_regular_donors');
    }
};
