<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('letter_attachment_contents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_outgoing_id')->constrained()->cascadeOnDelete();
            $table->longText('content');
            $table->timestamps();

            $table->unique('letter_outgoing_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('letter_attachment_contents');
    }
};
