<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('letter_outgoings')
            ->whereNotNull('attachment')
            ->where('attachment', '!=', '')
            ->update(['attachment' => 'ada']);
    }

    public function down(): void
    {
        // Cannot restore original values
    }
};
