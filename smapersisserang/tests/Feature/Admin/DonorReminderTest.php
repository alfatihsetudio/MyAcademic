<?php

namespace Tests\Feature\Admin;

use App\Models\DonationRegularDonor;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use App\Services\AdminMenuService;
use App\Services\DonorReminderService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DonorReminderTest extends TestCase
{
    use RefreshDatabase;

    public function test_reminder_default_false(): void
    {
        $donor = DonationRegularDonor::create([
            'name' => 'Ahmad',
            'whatsapp_number' => '628123456789',
        ]);

        $this->assertFalse($donor->fresh()->reminder_enabled);
    }

    public function test_disabled_donor_does_not_appear_as_due(): void
    {
        Carbon::setTestNow('2026-08-13 09:00:00');
        $donor = $this->donor([
            'reminder_enabled' => false,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
        ]);

        $due = app(DonorReminderService::class)->dueDonors(10);

        $this->assertFalse($due->contains($donor));
        Carbon::setTestNow();
    }

    public function test_monthly_reminder_due_when_current_month_day_has_passed_and_not_reminded(): void
    {
        Carbon::setTestNow('2026-08-13 09:00:00');
        $donor = $this->donor([
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
            'next_reminder_at' => '2026-08-05 00:00:00',
        ]);

        $this->assertTrue(app(DonorReminderService::class)->dueDonors(10)->contains($donor));
        Carbon::setTestNow();
    }

    public function test_upcoming_reminder_uses_calendar_day(): void
    {
        Carbon::setTestNow('2026-08-13 09:00:00');
        $donor = $this->donor([
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 20,
            'next_reminder_at' => '2026-08-20 00:00:00',
        ]);

        $this->assertTrue(app(DonorReminderService::class)->upcomingDonors(10)->contains($donor));
        Carbon::setTestNow();
    }

    public function test_mark_reminded_records_history_and_moves_next_reminder_to_next_month(): void
    {
        Carbon::setTestNow('2026-08-13 09:00:00');
        $user = $this->userWithPermissions(['donation.reminders.manage']);
        $donor = $this->donor([
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
            'next_reminder_at' => '2026-08-05 00:00:00',
        ]);

        $this->actingAs($user)
            ->post(route('admin.donor-reminders.mark-reminded', $donor), [
                'message_snapshot' => 'Pesan uji',
            ])
            ->assertRedirect();

        $donor->refresh();
        $this->assertSame('2026-08-13 09:00:00', $donor->last_reminded_at->toDateTimeString());
        $this->assertSame('2026-09-05 00:00:00', $donor->next_reminder_at->toDateTimeString());
        $this->assertDatabaseHas('donor_reminder_histories', [
            'donation_regular_donor_id' => $donor->id,
            'reminded_by' => $user->id,
            'message_snapshot' => 'Pesan uji',
        ]);
        Carbon::setTestNow();
    }

    public function test_double_mark_in_same_cycle_does_not_create_duplicate_history(): void
    {
        Carbon::setTestNow('2026-08-13 09:00:00');
        $user = $this->userWithPermissions(['donation.reminders.manage']);
        $donor = $this->donor([
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
            'next_reminder_at' => '2026-08-05 00:00:00',
        ]);

        $this->actingAs($user)->post(route('admin.donor-reminders.mark-reminded', $donor));
        $this->actingAs($user)->post(route('admin.donor-reminders.mark-reminded', $donor));

        $this->assertDatabaseCount('donor_reminder_histories', 1);
        Carbon::setTestNow();
    }

    public function test_new_donation_does_not_break_fixed_monthly_schedule(): void
    {
        $donor = $this->donor([
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
            'last_reminded_at' => '2026-08-05 09:00:00',
            'next_reminder_at' => '2026-09-05 00:00:00',
            'last_donation_at' => '2026-08-20 10:00:00',
        ]);

        $this->assertSame('2026-09-05 00:00:00', $donor->fresh()->next_reminder_at->toDateTimeString());
    }

    public function test_unauthorized_user_cannot_change_reminder(): void
    {
        $this->ensurePermissionExists('donation.reminders.manage');
        $user = User::factory()->create(['role' => 'staf_keuangan']);
        $donor = $this->donor();

        $this->actingAs($user)
            ->patch(route('admin.donor-reminders.update', $donor), [
                'reminder_enabled' => '1',
                'reminder_frequency' => 'monthly',
                'reminder_day' => 5,
            ])
            ->assertForbidden();

        $this->assertFalse($donor->fresh()->reminder_enabled);
    }

    public function test_donation_dashboard_does_not_show_reminder_section(): void
    {
        $this->ensurePermissionExists('donation.reminders.manage');
        $user = $this->userWithPermissions(['donation.balance.view']);
        $this->donor([
            'name' => 'Donatur Reminder',
            'reminder_enabled' => true,
            'reminder_frequency' => DonorReminderService::FREQUENCY_MONTHLY,
            'reminder_day' => 5,
            'next_reminder_at' => now()->subDay(),
        ]);

        $response = $this->actingAs($user)
            ->get(route('admin.donation.dashboard'))
            ->assertOk();

        $response->assertSee('Dashboard Donasi');
        $response->assertDontSee('Pengingat Donasi');
        $response->assertDontSee('Pengingat Donatur');
        $response->assertDontSee('Lihat Semua Pengingat');
        $response->assertDontSee('Donatur Reminder');
    }

    public function test_donor_reminders_page_can_be_opened_by_permitted_user(): void
    {
        $user = $this->userWithPermissions(['donation.reminders.manage']);
        $this->donor(['name' => 'Ahmad Aktif', 'reminder_enabled' => true, 'reminder_frequency' => 'monthly', 'reminder_day' => 5]);
        $this->donor(['name' => 'Hasan Nonaktif', 'reminder_enabled' => false]);

        $this->actingAs($user)
            ->get(route('admin.donor-reminders.index'))
            ->assertOk()
            ->assertSee('Pengingat Donasi')
            ->assertSee('Kelola donatur yang bersedia menerima pengingat donasi melalui WhatsApp.')
            ->assertSee('Pengingat Aktif')
            ->assertSee('WhatsApp')
            ->assertSee('Donasi Terakhir')
            ->assertSee('Jadwal')
            ->assertSee('Tandai Sudah Diingatkan')
            ->assertSee('Aktifkan Pengingat')
            ->assertDontSee('Pengingat Donatur');
    }

    public function test_menu_pengingat_donasi_follows_permission(): void
    {
        $this->ensurePermissionExists('donation.reminders.manage');
        $permitted = $this->userWithPermissions(['donation.reminders.manage']);
        $blocked = $this->userWithPermissions([], 'guru');

        $service = app(AdminMenuService::class);
        $this->assertContains('Pengingat Donasi', $this->sidebarLabels($service->getSidebar($permitted)));

        $service->flushCache();
        $this->assertNotContains('Pengingat Donasi', $this->sidebarLabels($service->getSidebar($blocked)));
    }

    public function test_whatsapp_url_is_created_with_normalized_number_and_message(): void
    {
        $donor = $this->donor([
            'name' => 'Ahmad',
            'whatsapp_number' => '0812-3456-789',
        ]);

        $url = app(DonorReminderService::class)->whatsappUrl($donor, 'Assalamu alaikum');

        $this->assertSame('https://wa.me/628123456789?text=Assalamu+alaikum', $url);
    }

    private function donor(array $overrides = []): DonationRegularDonor
    {
        return DonationRegularDonor::create(array_merge([
            'name' => 'Ahmad',
            'whatsapp_number' => '62812'.random_int(1000000, 9999999),
            'is_active' => true,
            'source' => 'donasi_pendidikan',
            'first_donation_at' => '2026-07-10 10:00:00',
            'last_donation_at' => '2026-07-10 10:00:00',
            'total_donations_count' => 1,
            'total_donations_amount' => 100000,
        ], $overrides));
    }

    private function userWithPermissions(array $permissionNames, string $roleName = 'staf_keuangan'): User
    {
        $role = Role::firstOrCreate([
            'name' => $roleName,
        ], [
            'display_name' => ucfirst(str_replace('_', ' ', $roleName)),
            'guard_name' => 'web',
            'is_active' => true,
        ]);

        $user = User::factory()->create(['role' => $roleName]);
        $user->roles()->attach($role);

        foreach ($permissionNames as $name) {
            $permission = $this->ensurePermissionExists($name);
            $role->permissions()->syncWithoutDetaching([$permission->id]);
        }

        return $user;
    }

    private function ensurePermissionExists(string $name): Permission
    {
        return Permission::firstOrCreate(
            ['name' => $name],
            [
                'module' => 'donation',
                'action' => 'manage',
                'display_name' => $name,
                'group_name' => 'DONASI',
                'is_active' => true,
            ]
        );
    }

    private function sidebarLabels(array $sidebar): array
    {
        $labels = [];

        foreach ($sidebar['sections'] ?? [] as $section) {
            foreach ($section['items'] ?? [] as $item) {
                $labels[] = $item['label'];
            }
        }

        return $labels;
    }
}
