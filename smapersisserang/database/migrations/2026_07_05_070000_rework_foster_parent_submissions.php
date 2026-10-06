<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->renameColumn('foster_student_id', 'student_id');
        });

        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->dropColumn(['qris_payload', 'payment_status']);
        });

        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->bigInteger('amount')->nullable()->change();
            $table->string('commitment_duration')->nullable()->change();
            $table->string('custom_amount')->nullable()->after('amount');
            $table->string('status', 50)->default('pending')->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->dropColumn(['status', 'custom_amount']);
        });

        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->bigInteger('amount')->nullable(false)->change();
            $table->string('commitment_duration')->nullable(false)->change();
        });

        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->text('qris_payload')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'cancelled'])->default('pending');
        });

        Schema::table('foster_parent_submissions', function (Blueprint $table) {
            $table->renameColumn('student_id', 'foster_student_id');
        });
    }
};
