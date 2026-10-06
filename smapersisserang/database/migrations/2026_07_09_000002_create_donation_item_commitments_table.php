<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('donation_item_commitments', function (Blueprint $table) {
            $table->id();
            $table->string('reference_number')->unique();
            $table->dateTime('received_at');
            $table->string('donor_name')->nullable();
            $table->string('donor_phone')->nullable();
            $table->string('item_type');
            $table->string('item_name')->nullable();
            $table->string('quantity_estimate')->nullable();
            $table->string('delivery_method')->nullable();
            $table->text('note')->nullable();
            $table->text('raw_whatsapp_message')->nullable();
            $table->string('status')->default('pending');
            $table->dateTime('confirmed_at')->nullable();
            $table->foreignId('received_receipt_id')->nullable()->constrained('donation_item_receipts')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('donation_item_commitments');
    }
};
