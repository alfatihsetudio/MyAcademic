<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_incomings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_type_id')->nullable()->constrained('letter_types')->nullOnDelete();
            $table->string('incoming_number');
            $table->string('sender');
            $table->string('subject');
            $table->date('letter_date')->nullable();
            $table->date('received_date')->nullable();
            $table->string('attachment')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('received');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['received_date', 'status']);
            $table->index('sender');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_incomings');
    }
};
