<?php

namespace App\Services\Letters;

class HijriDateService
{
    private const MONTH_NAMES = [
        1 => 'Muharram',
        2 => 'Safar',
        3 => "Rabi'ul Awwal",
        4 => "Rabi'ul Akhir",
        5 => 'Jumadil Awwal',
        6 => 'Jumadil Akhir',
        7 => 'Rajab',
        8 => "Sya'ban",
        9 => 'Ramadhan',
        10 => 'Syawwal',
        11 => "Dzulqa'dah",
        12 => 'Dzulhijjah',
    ];

    private const ISLAMIC_EPOCH = 1948440;

    public function convert(\DateTimeInterface $date): string
    {
        $jd = $this->gregorianToJulian(
            (int) $date->format('Y'),
            (int) $date->format('n'),
            (int) $date->format('j')
        );

        $day = $jd - self::ISLAMIC_EPOCH;
        $hijriYear = (int) floor((30 * $day + 10646) / 10631);
        $monthLengths = $this->islamicMonthLengths($hijriYear);
        $yearStart = $this->islamicYearStart($hijriYear);
        $remaining = $day - $yearStart;

        $hijriMonth = 1;
        while ($hijriMonth <= 12 && $remaining > $monthLengths[$hijriMonth]) {
            $remaining -= $monthLengths[$hijriMonth];
            $hijriMonth++;
        }

        $hijriMonth = min($hijriMonth, 12);
        $hijriDay = (int) ($remaining + 1);

        return $hijriDay . ' ' . self::MONTH_NAMES[$hijriMonth] . ' ' . $hijriYear . ' H';
    }

    private function gregorianToJulian(int $year, int $month, int $day): int
    {
        if ($month <= 2) {
            $year--;
            $month += 12;
        }

        $a = (int) floor($year / 100);
        $b = 2 - $a + (int) floor($a / 4);

        return (int) floor(365.25 * ($year + 4716)) + (int) floor(30.6001 * ($month + 1)) + $day + $b - 1524;
    }

    private function islamicYearStart(int $year): int
    {
        return (int) floor((10631 * $year - 10631) / 30);
    }

    private function islamicMonthLengths(int $year): array
    {
        $isLeap = ($year * 11 + 14) % 30 < 11;
        return [
            1 => 30, 2 => 29, 3 => 30, 4 => 29, 5 => 30, 6 => 29,
            7 => 30, 8 => 29, 9 => 30, 10 => 29, 11 => 30,
            12 => $isLeap ? 30 : 29,
        ];
    }
}
