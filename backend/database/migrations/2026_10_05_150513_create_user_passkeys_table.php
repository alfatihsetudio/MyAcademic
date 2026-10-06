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
        Schema::create('user_passkeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('credential_id', 255)->unique();
            $table->string('name', 100)->default('Sidik Jari / Kunci Keamanan');
            $table->text('public_key');
            $table->text('public_key_cose')->nullable();
            $table->integer('algorithm')->default(-7);
            $table->unsignedInteger('sign_count')->default(0);
            $table->string('aaguid', 64)->nullable();
            $table->json('transports')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_passkeys');
    }
};
