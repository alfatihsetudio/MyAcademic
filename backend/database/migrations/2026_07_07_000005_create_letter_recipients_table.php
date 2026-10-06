<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_outgoing_id')->constrained('letter_outgoings')->cascadeOnDelete();
            $table->text('recipient_name');
            $table->string('recipient_institution')->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('recipient_phone')->nullable();
            $table->string('recipient_email')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['letter_outgoing_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_recipients');
    }
};
