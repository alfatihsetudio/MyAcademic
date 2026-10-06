<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('letter_outgoings')
            ->where('attachment', 'ada')
            ->update(['attachment' => '1 berkas']);
    }

    public function down(): void
    {
        DB::table('letter_outgoings')
            ->where('attachment', '1 berkas')
            ->update(['attachment' => 'ada']);
    }
};
