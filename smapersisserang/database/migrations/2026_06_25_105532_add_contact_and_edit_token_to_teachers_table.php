<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->string('phone', 30)->nullable()->after('teacher_quote');
            $table->string('whatsapp_number', 30)->nullable()->after('phone');
            $table->string('public_edit_token', 64)->nullable()->unique()->after('whatsapp_number');
            $table->timestamp('token_generated_at')->nullable()->after('public_edit_token');
        });
    }

    public function down(): void
    {
        Schema::table('teachers', function (Blueprint $table) {
            $table->dropColumn(['phone', 'whatsapp_number', 'public_edit_token', 'token_generated_at']);
        });
    }
};
