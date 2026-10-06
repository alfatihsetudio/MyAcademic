<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarpras_procurements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->date('procurement_date')->nullable();
            $table->string('source_fund')->nullable();
            $table->decimal('total_cost', 15, 2)->nullable();
            $table->string('vendor_name')->nullable();
            $table->string('receipt_path')->nullable();
            $table->enum('status', ['rencana', 'proses', 'selesai', 'dibatalkan'])->default('rencana');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarpras_procurements');
    }
};
