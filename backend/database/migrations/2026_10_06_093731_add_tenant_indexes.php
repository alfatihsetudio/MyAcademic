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
        Schema::table('users', function (Blueprint $table) {
            $table->index(['school_id', 'email'], 'idx_school_email');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'idx_school_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->index(['school_id', 'status'], 'idx_school_transaction_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_school_email');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('idx_school_status');
        });

        Schema::table('finance_transactions', function (Blueprint $table) {
            $table->dropIndex('idx_school_transaction_status');
        });
    }
};
