<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donation_transfers', function (Blueprint $table) {
            $table->date('transfer_date')->nullable()->after('transfer_number');
            $table->foreignId('rejected_by')->nullable()->after('approved_at')->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable()->after('rejected_by');
            $table->text('rejection_reason')->nullable()->after('rejected_at');
        });
    }

    public function down(): void
    {
        Schema::table('donation_transfers', function (Blueprint $table) {
            $table->dropForeign(['rejected_by']);
            $table->dropColumn(['transfer_date', 'rejected_by', 'rejected_at', 'rejection_reason']);
        });
    }
};
