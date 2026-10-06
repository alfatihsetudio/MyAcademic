<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarpras_maintenances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->nullable()->constrained('sarpras_assets')->nullOnDelete();
            $table->foreignId('room_id')->nullable()->constrained('sarpras_rooms')->nullOnDelete();
            $table->string('title');
            $table->text('damage_description');
            $table->string('reported_by')->nullable();
            $table->date('reported_at')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->enum('status', ['dilaporkan', 'dicek', 'proses_perbaikan', 'selesai', 'tidak_bisa_diperbaiki'])->default('dilaporkan');
            $table->string('photo_path')->nullable();
            $table->text('follow_up_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarpras_maintenances');
    }
};
