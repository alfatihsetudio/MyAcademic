<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_outgoings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_type_id')->constrained('letter_types')->restrictOnDelete();
            $table->string('letter_number')->nullable()->unique();
            $table->unsignedInteger('sequence_number')->nullable();
            $table->string('subject')->nullable();
            $table->date('letter_date')->nullable();
            $table->unsignedTinyInteger('letter_month')->nullable();
            $table->unsignedSmallInteger('letter_year')->nullable();
            $table->text('opening_paragraph')->nullable();
            $table->longText('body')->nullable();
            $table->text('closing_paragraph')->nullable();
            $table->string('attachment')->nullable();
            $table->text('cc')->nullable();
            $table->string('status')->default('draft');
            $table->boolean('use_letterhead')->default(true);
            $table->string('letterhead_mode')->default('school_setting');
            $table->foreignId('signer_1_id')->nullable()->constrained('letter_signers')->nullOnDelete();
            $table->foreignId('signer_2_id')->nullable()->constrained('letter_signers')->nullOnDelete();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['letter_type_id', 'letter_year']);
            $table->index(['status', 'letter_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_outgoings');
    }
};
