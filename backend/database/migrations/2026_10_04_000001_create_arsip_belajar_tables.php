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
        // 1. Add WhatsApp Integration columns to users table if not exists
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'whatsapp_number')) {
                $table->string('whatsapp_number', 30)->nullable()->index()->after('email');
            }
            if (!Schema::hasColumn('users', 'wa_verify_token')) {
                $table->string('wa_verify_token', 50)->nullable()->index()->after('whatsapp_number');
            }
            if (!Schema::hasColumn('users', 'wa_status')) {
                $table->string('wa_status', 20)->default('unlinked')->after('wa_verify_token');
            }
        });

        // 2. Arsip Belajar Study Notes
        Schema::create('arsip_study_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('folder_id')->nullable()->index();
            $table->string('title', 255);
            $table->longText('transcribed_text');
            $table->longText('summary')->nullable();
            $table->json('flashcards')->nullable();
            $table->json('mindmap')->nullable();
            $table->json('tags')->nullable();
            $table->json('image_urls')->nullable();
            $table->string('audio_url', 500)->nullable();
            $table->timestamps();
        });

        // 3. Arsip Belajar Quiz Attempts / CBT Simulator Results
        Schema::create('arsip_quiz_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedBigInteger('note_id')->nullable()->index();
            $table->string('title', 255)->nullable();
            $table->string('difficulty', 30)->default('sedang');
            $table->integer('score')->default(0);
            $table->integer('total_questions')->default(0);
            $table->integer('percentage')->default(0);
            $table->json('questions_data')->nullable();
            $table->json('user_answers')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('arsip_quiz_attempts');
        Schema::dropIfExists('arsip_study_notes');

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'wa_status')) {
                $table->dropColumn('wa_status');
            }
            if (Schema::hasColumn('users', 'wa_verify_token')) {
                $table->dropColumn('wa_verify_token');
            }
            if (Schema::hasColumn('users', 'whatsapp_number')) {
                $table->dropColumn('whatsapp_number');
            }
        });
    }
};
