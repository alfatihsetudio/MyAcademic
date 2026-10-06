<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_regular_donors', function (Blueprint $table) {
            $table->boolean('reminder_enabled')->default(false)->after('total_donations_amount');
            $table->string('reminder_frequency')->nullable()->after('reminder_enabled');
            $table->unsignedTinyInteger('reminder_day')->nullable()->after('reminder_frequency');
            $table->timestamp('last_reminded_at')->nullable()->after('reminder_day');
            $table->timestamp('next_reminder_at')->nullable()->after('last_reminded_at');
        });
    }

    public function down(): void
    {
        Schema::table('donation_regular_donors', function (Blueprint $table) {
            $table->dropColumn([
                'reminder_enabled',
                'reminder_frequency',
                'reminder_day',
                'last_reminded_at',
                'next_reminder_at',
            ]);
        });
    }
};
