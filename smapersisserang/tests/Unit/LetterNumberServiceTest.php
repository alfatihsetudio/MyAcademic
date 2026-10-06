<?php

namespace Tests\Unit;

use App\Models\LetterCounter;
use App\Models\LetterOutgoing;
use App\Models\LetterType;
use App\Models\User;
use App\Services\Letters\LetterNumberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LetterNumberServiceTest extends TestCase
{
    use RefreshDatabase;

    private LetterNumberService $service;
    private LetterType $type;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LetterNumberService::class);
        $this->type = LetterType::factory()->create(['code' => 'TST']);
        $this->user = User::factory()->create();

        $this->actingAs($this->user);
    }

    public function test_generates_first_number_when_counter_does_not_exist(): void
    {
        $number = $this->service->generate($this->type, '2026-07-01');

        $this->assertEquals(1, $number['sequence_number']);
        $this->assertStringContainsString('001', $number['letter_number']);
        $this->assertEquals('2026', $number['year']);
        $this->assertEquals(7, $number['month']);

        $counter = LetterCounter::where('year', 2026)
            ->where('classification_code', '421.3')
            ->first();
        $this->assertNotNull($counter);
        $this->assertEquals(1, $counter->last_number);
    }

    public function test_generates_sequential_numbers_when_counter_exists(): void
    {
        // First issue
        $first = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(1, $first['sequence_number']);

        // Second issue
        $second = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(2, $second['sequence_number']);

        // Third issue
        $third = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(3, $third['sequence_number']);

        // Counter updated
        $counter = LetterCounter::where('year', 2026)
            ->where('classification_code', '421.3')
            ->first();
        $this->assertEquals(3, $counter->last_number);
    }

    public function test_separates_counters_by_year(): void
    {
        $first = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(1, $first['sequence_number']);

        $second = $this->service->generate($this->type, '2027-01-01');
        $this->assertEquals(1, $second['sequence_number']);
    }

    public function test_separates_counters_by_letter_type(): void
    {
        $otherType = LetterType::factory()->create(['code' => 'OTR']);

        $first = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(1, $first['sequence_number']);

        $other = $this->service->generate($otherType, '2026-07-01');
        $this->assertEquals(2, $other['sequence_number']);
    }

    public function test_initially_empty_counter_gets_max_issued_sequence(): void
    {
        LetterOutgoing::create([
            'letter_type_id' => $this->type->id,
            'sequence_number' => 1,
            'status' => 'issued',
            'letter_classification_code' => '421.3',
            'letter_year' => 2026,
            'letter_month' => 7,
            'letter_date' => '2026-07-01',
        ]);

        LetterCounter::where('year', 2026)
            ->where('classification_code', '421.3')
            ->delete();

        $number = $this->service->generate($this->type, '2026-07-01');
        $this->assertEquals(2, $number['sequence_number']);
    }
}
