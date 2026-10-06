<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DonationRegularDonor extends Model
{
    protected $fillable = [
        'name',
        'whatsapp_number',
        'is_active',
        'source',
        'first_donation_at',
        'last_donation_at',
        'total_donations_count',
        'total_donations_amount',
        'reminder_enabled',
        'reminder_frequency',
        'reminder_day',
        'last_reminded_at',
        'next_reminder_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'first_donation_at' => 'datetime',
            'last_donation_at' => 'datetime',
            'total_donations_count' => 'integer',
            'total_donations_amount' => 'integer',
            'reminder_enabled' => 'boolean',
            'reminder_day' => 'integer',
            'last_reminded_at' => 'datetime',
            'next_reminder_at' => 'datetime',
        ];
    }

    public function reminderHistories(): HasMany
    {
        return $this->hasMany(DonorReminderHistory::class);
    }
}
