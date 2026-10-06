<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sarpras_assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('inventory_code')->nullable()->unique();
            $table->string('category');
            $table->integer('quantity')->default(1);
            $table->string('unit')->nullable();
            $table->string('location')->nullable();
            $table->enum('condition', ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'])->default('baik');
            $table->year('procurement_year')->nullable();
            $table->string('source_fund')->nullable();
            $table->string('photo_path')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sarpras_assets');
    }
};
