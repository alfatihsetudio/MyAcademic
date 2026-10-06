<?php

namespace App\Services;

use App\Models\DonationRegularDonor;
use App\Models\DonorReminderHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class DonorReminderService
{
    public const FREQUENCY_MONTHLY = 'monthly';

    public function nextReminderFor(DonationRegularDonor $donor, ?Carbon $from = null): ?Carbon
    {
        if (! $donor->reminder_enabled || $donor->reminder_frequency !== self::FREQUENCY_MONTHLY || ! $donor->reminder_day) {
            return null;
        }

        $from = ($from ?? now())->copy()->startOfDay();
        $day = (int) $donor->reminder_day;
        $scheduled = $from->copy()->day($day)->startOfDay();

        if ($scheduled->greaterThan($from)) {
            return $scheduled;
        }

        return $scheduled;
    }

    public function nextReminderAfterMarked(DonationRegularDonor $donor, ?Carbon $markedAt = null): ?Carbon
    {
        if (! $donor->reminder_enabled || $donor->reminder_frequency !== self::FREQUENCY_MONTHLY || ! $donor->reminder_day) {
            return null;
        }

        return ($markedAt ?? now())
            ->copy()
            ->startOfMonth()
            ->addMonthNoOverflow()
            ->day((int) $donor->reminder_day)
            ->startOfDay();
    }

    public function dueDonorsQuery(?Carbon $today = null)
    {
        $today = ($today ?? now())->copy()->startOfDay();

        return DonationRegularDonor::query()
            ->where('is_active', true)
            ->where('reminder_enabled', true)
            ->where('reminder_frequency', self::FREQUENCY_MONTHLY)
            ->whereBetween('reminder_day', [1, 28])
            ->where(function ($query) use ($today) {
                $query->whereDate('next_reminder_at', '<=', $today->toDateString())
                    ->orWhere(function ($query) use ($today) {
                        $query->whereNull('next_reminder_at')
                            ->where('reminder_day', '<=', $today->day);
                    });
            })
            ->where(function ($query) use ($today) {
                $query->whereNull('last_reminded_at')
                    ->orWhere('last_reminded_at', '<', $today->copy()->startOfMonth());
            });
    }

    public function dueDonors(int $limit = 5, ?Carbon $today = null): Collection
    {
        if (! Schema::hasTable('donation_regular_donors')) {
            return new Collection;
        }

        return $this->dueDonorsQuery($today)
            ->orderByRaw('COALESCE(next_reminder_at, last_donation_at, created_at) asc')
            ->orderBy('name')
            ->limit($limit)
            ->get();
    }

    public function upcomingDonors(int $limit = 5, ?Carbon $today = null): Collection
    {
        if (! Schema::hasTable('donation_regular_donors')) {
            return new Collection;
        }

        $today = ($today ?? now())->copy()->startOfDay();
        $windowEnd = $today->copy()->addDays(31);

        return DonationRegularDonor::query()
            ->where('is_active', true)
            ->where('reminder_enabled', true)
            ->where('reminder_frequency', self::FREQUENCY_MONTHLY)
            ->whereBetween('reminder_day', [1, 28])
            ->where(function ($query) use ($today, $windowEnd) {
                $query->whereBetween('next_reminder_at', [$today->copy()->addDay(), $windowEnd])
                    ->orWhere(function ($query) use ($today, $windowEnd) {
                        $query->whereNull('next_reminder_at')
                            ->where('reminder_day', '>', $today->day)
                            ->where('reminder_day', '<=', $windowEnd->day);
                    });
            })
            ->orderByRaw('COALESCE(next_reminder_at, created_at) asc')
            ->orderBy('reminder_day')
            ->orderBy('name')
            ->limit($limit)
            ->get();
    }

    public function dueCount(?Carbon $today = null): int
    {
        if (! Schema::hasTable('donation_regular_donors')) {
            return 0;
        }

        return $this->dueDonorsQuery($today)->count();
    }

    public function upcomingCount(?Carbon $today = null): int
    {
        return $this->upcomingDonors(1000, $today)->count();
    }

    public function activeCount(): int
    {
        if (! Schema::hasTable('donation_regular_donors')) {
            return 0;
        }

        return DonationRegularDonor::query()
            ->where('is_active', true)
            ->where('reminder_enabled', true)
            ->where('reminder_frequency', self::FREQUENCY_MONTHLY)
            ->whereBetween('reminder_day', [1, 28])
            ->count();
    }

    public function isDue(DonationRegularDonor $donor, ?Carbon $today = null): bool
    {
        if (! $donor->reminder_enabled || $donor->reminder_frequency !== self::FREQUENCY_MONTHLY || ! $donor->reminder_day) {
            return false;
        }

        $today = ($today ?? now())->copy()->startOfDay();
        $next = $donor->next_reminder_at?->copy()->startOfDay()
            ?? $today->copy()->day((int) $donor->reminder_day)->startOfDay();

        if ($next->greaterThan($today)) {
            return false;
        }

        return ! $donor->last_reminded_at
            || $donor->last_reminded_at->lt($today->copy()->startOfMonth());
    }

    public function scheduleLabel(DonationRegularDonor $donor): string
    {
        if (! $donor->reminder_enabled || ! $donor->reminder_day) {
            return 'Nonaktif';
        }

        return 'Setiap tanggal '.(int) $donor->reminder_day;
    }

    public function defaultMessage(DonationRegularDonor $donor): string
    {
        return "Assalamu'alaikum Bapak/Ibu {$donor->name}.\n\n"
            ."Semoga Allah memberikan kesehatan dan keberkahan.\n\n"
            ."Kami dari SMA Persis Serang ingin mengingatkan kembali kesempatan untuk mendukung program pendidikan SMA Persis Serang melalui donasi/infaq.\n\n"
            .'Jazakumullahu khairan katsiran atas dukungan Bapak/Ibu selama ini.';
    }

    public function whatsappUrl(DonationRegularDonor $donor, ?string $message = null): ?string
    {
        $number = $this->normalizeWhatsappNumber($donor->whatsapp_number);

        if (! $number) {
            return null;
        }

        return 'https://wa.me/'.$number.'?text='.urlencode($message ?? $this->defaultMessage($donor));
    }

    public function normalizeWhatsappNumber(?string $number): ?string
    {
        $clean = preg_replace('/[^0-9]/', '', (string) $number);

        if (! $clean || $clean === '-') {
            return null;
        }

        if (str_starts_with($clean, '0')) {
            return '62'.substr($clean, 1);
        }

        if (str_starts_with($clean, '8')) {
            return '62'.$clean;
        }

        return $clean;
    }

    public function markReminded(DonationRegularDonor $donor, ?User $user = null, ?string $messageSnapshot = null): DonorReminderHistory
    {
        return DB::transaction(function () use ($donor, $user, $messageSnapshot) {
            $lockedDonor = DonationRegularDonor::query()
                ->whereKey($donor->id)
                ->lockForUpdate()
                ->firstOrFail();

            $now = now();
            $cycleStart = $now->copy()->startOfMonth()->day((int) $lockedDonor->reminder_day)->startOfDay();

            $existing = null;
            if ($lockedDonor->last_reminded_at && $lockedDonor->last_reminded_at->greaterThanOrEqualTo($cycleStart)) {
                $existing = $lockedDonor->reminderHistories()
                    ->where('reminded_at', '>=', $cycleStart)
                    ->latest('reminded_at')
                    ->first();
            }

            if ($existing) {
                return $existing;
            }

            $message = $messageSnapshot ?: $this->defaultMessage($lockedDonor);

            $history = DonorReminderHistory::create([
                'donation_regular_donor_id' => $lockedDonor->id,
                'reminded_by' => $user?->id,
                'reminded_at' => $now,
                'message_snapshot' => $message,
            ]);

            $lockedDonor->update([
                'last_reminded_at' => $now,
                'next_reminder_at' => $this->nextReminderAfterMarked($lockedDonor, $now),
            ]);

            return $history;
        });
    }
}
