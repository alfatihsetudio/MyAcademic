<?php

namespace Tests\Feature;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class FosterParentNominalTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('foster_parent_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('student_id')->nullable();
            $table->string('donor_name')->nullable();
            $table->string('donor_phone')->nullable();
            $table->bigInteger('amount');
            $table->string('commitment_duration');
            $table->text('note')->nullable();
            $table->string('status')->default('pending');
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('foster_parent_submissions');

        parent::tearDown();
    }

    public static function presetAmounts(): array
    {
        return [
            [100000],
            [150000],
            [200000],
            [250000],
            [300000],
            [500000],
        ];
    }

    #[DataProvider('presetAmounts')]
    public function test_allowed_preset_is_saved_as_the_actual_amount(int $amount): void
    {
        $response = $this->post(route('orang-tua-asuh.submit'), $this->validPayload([
            'amount' => (string) $amount,
        ]));

        $response->assertRedirect(route('orang-tua-asuh'));
        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('foster_parent_submissions', ['amount' => $amount]);
    }

    public function test_custom_amount_is_required_and_must_be_greater_than_zero(): void
    {
        $this->from(route('orang-tua-asuh'))
            ->post(route('orang-tua-asuh.submit'), $this->validPayload([
                'amount' => 'lainnya',
                'custom_amount' => '',
            ]))
            ->assertRedirect(route('orang-tua-asuh'))
            ->assertSessionHasErrors('custom_amount')
            ->assertSessionHasInput('amount', 'lainnya');

        $this->post(route('orang-tua-asuh.submit'), $this->validPayload([
            'amount' => 'lainnya',
            'custom_amount' => '0',
        ]))->assertSessionHasErrors('custom_amount');
    }

    public function test_custom_amount_is_saved_as_an_integer(): void
    {
        $response = $this->post(route('orang-tua-asuh.submit'), $this->validPayload([
            'amount' => 'lainnya',
            'custom_amount' => '375000',
        ]));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('foster_parent_submissions', ['amount' => 375000]);
    }

    public function test_custom_amount_is_ignored_when_a_preset_is_selected(): void
    {
        $response = $this->post(route('orang-tua-asuh.submit'), $this->validPayload([
            'amount' => '200000',
            'custom_amount' => 'not-a-number',
        ]));

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('foster_parent_submissions', ['amount' => 200000]);
    }

    public function test_unknown_preset_is_rejected(): void
    {
        $this->post(route('orang-tua-asuh.submit'), $this->validPayload([
            'amount' => '750000',
        ]))->assertSessionHasErrors('amount');
    }

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'donor_name' => 'Test Donor',
            'donor_phone' => '081234567890',
            'amount' => '100000',
            'commitment_duration' => '1 bulan',
            'note' => null,
        ], $overrides);
    }
}
