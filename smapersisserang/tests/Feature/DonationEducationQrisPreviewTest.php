<?php

namespace Tests\Feature;

use App\Models\DonationEducationSetting;
use App\Http\Middleware\TrackVisitorMiddleware;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DonationEducationQrisPreviewTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(TrackVisitorMiddleware::class);

        if (!Schema::hasTable('donation_education_settings')) {
            Schema::create('donation_education_settings', function (Blueprint $table) {
                $table->id();
                $table->string('whatsapp_number')->nullable();
                $table->string('donation_qris_image')->nullable();
                $table->text('donation_qris_payload')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    public function test_preview_returns_qris_payment_details_for_preset_amounts(): void
    {
        DonationEducationSetting::create([
            'donation_qris_image' => 'qris/static.png',
            'whatsapp_number' => '6281234567890',
            'is_active' => true,
        ]);

        foreach ([25000, 500000] as $amount) {
            $response = $this->postJson(route('donasi-pendidikan.qris.preview'), [
                'donor_name' => 'Hamba Allah',
                'amount' => (string) $amount,
                'unique_code' => 123,
            ]);

            $adminFee = (int) ceil($amount * 0.006);
            $totalTransfer = $amount + $adminFee + 123;

            $response
                ->assertOk()
                ->assertJson([
                    'success' => true,
                    'static_fallback' => true,
                    'amount_raw' => $totalTransfer,
                    'nominal_raw' => $amount,
                    'admin_fee' => $adminFee,
                    'unique_code' => '123',
                    'unique_code_raw' => 123,
                    'total_transfer_raw' => $totalTransfer,
                ])
                ->assertJsonPath('qris_image', '/storage/qris/static.png');

            $this->assertStringContainsString('Total+Transfer', $response->json('whatsapp_url'));
        }
    }

    public function test_preview_returns_qris_payment_details_for_custom_amount(): void
    {
        DonationEducationSetting::create([
            'donation_qris_image' => 'qris/static.png',
            'whatsapp_number' => '6281234567890',
            'is_active' => true,
        ]);

        $response = $this->postJson(route('donasi-pendidikan.qris.preview'), [
            'amount' => 'lainnya',
            'custom_amount' => '75000',
            'unique_code' => 7,
        ]);

        $response
            ->assertOk()
            ->assertJson([
                'success' => true,
                'amount_formatted' => 'Rp75.000',
                'admin_fee' => 450,
                'admin_fee_formatted' => 'Rp450',
                'unique_code' => '007',
                'total_transfer_raw' => 75457,
                'total_transfer_formatted' => 'Rp75.457',
            ]);
    }

    public function test_donation_money_tab_keeps_qris_preview_in_same_alpine_scope(): void
    {
        $formMarkup = file_get_contents(resource_path('views/pages/form-donatur.blade.php'));

        $this->assertStringContainsString('activeTab: \'uang\'', $formMarkup);
        $this->assertStringNotContainsString('x-data="{ activeTab: \'uang\' }"', $formMarkup);
        $this->assertStringContainsString('previewData.total_transfer_formatted', $formMarkup);
        $this->assertStringContainsString('Download QRIS', $formMarkup);
    }
}
