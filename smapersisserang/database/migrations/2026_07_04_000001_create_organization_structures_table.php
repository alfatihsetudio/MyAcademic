<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_structures', function (Blueprint $table) {
            $table->id();
            $table->string('structure_key')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->json('members')->nullable();
            $table->string('parent_key')->nullable();
            $table->integer('sort_order')->default(0);
            $table->integer('level')->default(1);
            $table->string('card_type')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_structures');
    }
};
