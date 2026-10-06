<?php

use App\Models\LetterCounter;
use App\Models\LetterOutgoing;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('letter_counters', 'classification_code')) {
            Schema::table('letter_counters', function (Blueprint $table) {
                $table->string('classification_code', 30)->nullable()->after('letter_type_id');
            });
        }

        DB::statement("UPDATE letter_counters SET classification_code = '421.3' WHERE classification_code IS NULL");

        $maxPerCode = LetterOutgoing::query()
            ->where('status', 'issued')
            ->selectRaw('letter_classification_code, letter_year, MAX(sequence_number) as max_seq')
            ->groupBy('letter_classification_code', 'letter_year')
            ->get();

        foreach ($maxPerCode as $row) {
            $existing = LetterCounter::query()
                ->where('classification_code', $row->letter_classification_code)
                ->where('year', $row->letter_year)
                ->orderBy('last_number', 'desc')
                ->get();

            if ($existing->isEmpty()) {
                continue;
            }

            $keeper = $existing->first();
            $keeper->last_number = max((int) $keeper->last_number, (int) $row->max_seq);
            $keeper->save();

            LetterCounter::query()
                ->where('classification_code', $row->letter_classification_code)
                ->where('year', $row->letter_year)
                ->where('id', '!=', $keeper->id)
                ->delete();
        }

        foreach (['letter_counters_letter_type_id_year_unique', 'letter_counters_year_unique'] as $index) {
            try {
                Schema::table('letter_counters', function (Blueprint $table) use ($index) {
                    $table->dropIndex($index);
                });
            } catch (\Throwable) {
            }
        }

        Schema::table('letter_counters', function (Blueprint $table) {
            $table->string('classification_code', 30)->nullable(false)->change();
            $table->unique(['classification_code', 'year'], 'letter_counters_classification_code_year_unique');
        });

        Schema::table('letter_counters', function (Blueprint $table) {
            $table->foreignId('letter_type_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('letter_counters', function (Blueprint $table) {
            $table->dropUnique('letter_counters_classification_code_year_unique');
            $table->unique(['letter_type_id', 'year'], 'letter_counters_letter_type_id_year_unique');
            $table->dropColumn('classification_code');
        });
    }
};
