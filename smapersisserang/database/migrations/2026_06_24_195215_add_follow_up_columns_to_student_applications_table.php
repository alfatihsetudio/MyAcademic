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
        Schema::table('student_applications', function (Blueprint $table) {
            $table->string('follow_up_status')->nullable()->default('belum_dihubungi')->after('verified_by');
            $table->text('follow_up_notes')->nullable()->after('follow_up_status');
            $table->timestamp('follow_up_at')->nullable()->after('follow_up_notes');
            $table->foreignId('follow_up_by')->nullable()->constrained('users')->nullOnDelete()->after('follow_up_at');
        });
    }

    public function down(): void
    {
        Schema::table('student_applications', function (Blueprint $table) {
            $table->dropForeign(['follow_up_by']);
            $table->dropColumn(['follow_up_status', 'follow_up_notes', 'follow_up_at', 'follow_up_by']);
        });
    }
};
