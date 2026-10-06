<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_transaction_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('donation_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->json('old_values');
            $table->json('new_values');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_transaction_histories');
    }
};
