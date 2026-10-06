<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarpras_needs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category')->nullable();
            $table->integer('quantity_needed')->nullable();
            $table->string('unit')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->enum('priority', ['mendesak', 'penting', 'sedang', 'rendah'])->default('sedang');
            $table->enum('status', ['diajukan', 'disetujui', 'proses_pengadaan', 'terpenuhi', 'ditunda'])->default('diajukan');
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarpras_needs');
    }
};
