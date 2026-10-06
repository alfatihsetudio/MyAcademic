<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('waqf_transactions', function (Blueprint $table) {
            $table->integer('admin_fee')->default(0)->after('unique_code');
        });
    }

    public function down(): void
    {
        Schema::table('waqf_transactions', function (Blueprint $table) {
            $table->dropColumn('admin_fee');
        });
    }
};
