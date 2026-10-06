<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waqf_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->string('wakif_name')->nullable();
            $table->string('wakif_whatsapp', 30)->nullable();
            $table->unsignedBigInteger('amount');
            $table->unsignedSmallInteger('unique_code')->default(0);
            $table->unsignedBigInteger('total_transfer');
            $table->text('note')->nullable();
            $table->boolean('ikrar_checked')->default(false);
            $table->string('payment_gateway', 50)->default('manual-qris');
            $table->string('status', 30)->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waqf_transactions');
    }
};
