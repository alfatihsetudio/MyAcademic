<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('letter_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('letter_type_id')->constrained('letter_types')->cascadeOnDelete();
            $table->string('title');
            $table->string('subject_template')->nullable();
            $table->text('opening_template')->nullable();
            $table->longText('body_template');
            $table->text('closing_template')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['letter_type_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('letter_templates');
    }
};
