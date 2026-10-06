<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitor_logs', function (Blueprint $table) {
            $table->id();
            $table->string('url', 500)->nullable();
            $table->string('path', 255);
            $table->string('title', 255)->nullable();
            $table->string('referrer', 500)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->string('ip_hash', 128)->nullable()->index();
            $table->string('device', 20)->nullable();
            $table->string('browser', 50)->nullable();
            $table->timestamp('visited_at')->nullable();
            $table->timestamps();

            $table->index('path');
            $table->index('visited_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visitor_logs');
    }
};
