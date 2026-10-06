<?php

namespace App\Services\Letters;

use App\Models\LetterCounter;
use App\Models\LetterOutgoing;
use App\Models\LetterType;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class LetterNumberService
{
    public const DEFAULT_SCHOOL_CODE = 'SMA-PERSIS-SRG';

    public function generate(LetterType|int $letterType, CarbonInterface|string|null $date = null, ?string $classificationCode = null, ?string $schoolCode = null): array
    {
        $type = $letterType instanceof LetterType
            ? $letterType
            : LetterType::query()->findOrFail($letterType);

        $letterDate = $date instanceof CarbonInterface
            ? CarbonImmutable::instance($date)
            : CarbonImmutable::parse($date ?? now());

        $code = $classificationCode ?: '421.3';

        return DB::transaction(function () use ($type, $letterDate, $code, $schoolCode) {
            $counter = $this->lockCounter((int) $letterDate->year, $code);
            $counter->last_number = max($counter->last_number, $this->maxIssuedSequence((int) $letterDate->year, $code));
            $counter->last_number++;
            $counter->month = (int) $letterDate->month;
            $counter->updated_by = Auth::id();
            $counter->save();

            $sequence = $counter->last_number;
            $letterNumber = $this->formatNumber($sequence, $type->code, $letterDate, $code, $schoolCode);

            return [
                'sequence_number' => $sequence,
                'letter_number' => $letterNumber,
                'letter_type_id' => $type->id,
                'year' => (int) $letterDate->year,
                'month' => (int) $letterDate->month,
            ];
        });
    }

    public function formatNumber(int $sequence, string $typeCode, CarbonInterface|string|null $date = null, ?string $classificationCode = null, ?string $schoolCode = null): string
    {
        $letterDate = $date instanceof CarbonInterface
            ? CarbonImmutable::instance($date)
            : CarbonImmutable::parse($date ?? now());

        $classificationCode = $classificationCode ?: '421.3';
        $schoolCode = $schoolCode ?: self::DEFAULT_SCHOOL_CODE;

        return sprintf(
            '%s/%s/%s/%s/%s',
            $classificationCode,
            str_pad((string) $sequence, 3, '0', STR_PAD_LEFT),
            $schoolCode,
            $this->romanMonth((int) $letterDate->month),
            $letterDate->year
        );
    }

    public function romanMonth(int $month): string
    {
        return [
            1 => 'I',
            2 => 'II',
            3 => 'III',
            4 => 'IV',
            5 => 'V',
            6 => 'VI',
            7 => 'VII',
            8 => 'VIII',
            9 => 'IX',
            10 => 'X',
            11 => 'XI',
            12 => 'XII',
        ][$month] ?? '';
    }

    private function lockCounter(int $year, string $classificationCode): LetterCounter
    {
        $counter = LetterCounter::query()
            ->where('year', $year)
            ->where('classification_code', $classificationCode)
            ->lockForUpdate()
            ->first();

        if ($counter) {
            return $counter;
        }

        $attributes = [
            'classification_code' => $classificationCode,
            'year' => $year,
            'month' => null,
            'last_number' => $this->maxIssuedSequence($year, $classificationCode),
            'created_by' => Auth::id(),
            'updated_by' => Auth::id(),
        ];

        Log::info('LETTER_COUNTER_LOOKUP', [
            'classification_code' => $classificationCode,
            'year' => $year,
            'existing' => $counter?->toArray(),
            'attributes' => $attributes,
        ]);

        try {
            return LetterCounter::query()->create($attributes);
        } catch (QueryException $e) {
            $sqlState = $e->errorInfo[0] ?? '';
            $driverCode = $e->errorInfo[1] ?? 0;
            $isDuplicateKey = $sqlState === '23000' && (int) $driverCode === 1062;

            Log::error('LETTER_COUNTER_CREATE_FAILED', [
                'classification_code' => $classificationCode,
                'year' => $year,
                'sql_state' => $sqlState,
                'driver_code' => $driverCode,
                'message' => $e->getMessage(),
                'is_duplicate_key' => $isDuplicateKey,
            ]);

            if (!$isDuplicateKey) {
                throw $e;
            }

            $counter = LetterCounter::query()
                ->where('year', $year)
                ->where('classification_code', $classificationCode)
                ->lockForUpdate()
                ->first();

            if (!$counter) {
                throw new \RuntimeException(
                    "LetterCounter duplicate race detected but counter row was not found for classification_code {$classificationCode}, year {$year}."
                );
            }

            return $counter;
        }
    }

    private function maxIssuedSequence(int $year, string $classificationCode): int
    {
        return (int) LetterOutgoing::query()
            ->where('letter_classification_code', $classificationCode)
            ->where('letter_year', $year)
            ->where('status', 'issued')
            ->max('sequence_number');
    }
}
