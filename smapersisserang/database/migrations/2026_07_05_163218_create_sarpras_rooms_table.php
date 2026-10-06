<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarpras_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('room_type');
            $table->integer('capacity')->nullable();
            $table->string('person_in_charge')->nullable();
            $table->enum('condition', ['baik', 'rusak_ringan', 'rusak_berat', 'perlu_perbaikan'])->default('baik');
            $table->string('photo_path')->nullable();
            $table->text('needs_note')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarpras_rooms');
    }
};
