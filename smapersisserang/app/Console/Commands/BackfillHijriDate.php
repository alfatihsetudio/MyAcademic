<?php

namespace App\Console\Commands;

use App\Models\LetterOutgoing;
use App\Services\Letters\HijriDateService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;

class BackfillHijriDate extends Command
{
    protected $signature = 'letters:backfill-hijri';
    protected $description = 'Isi hijri_date untuk surat keluar yang belum memiliki data Hijriyah';

    public function handle(HijriDateService $service): int
    {
        $letters = LetterOutgoing::whereNull('hijri_date')
            ->whereNotNull('letter_date')
            ->get();

        if ($letters->isEmpty()) {
            $this->info('Tidak ada surat yang perlu di-backfill.');
            return Command::SUCCESS;
        }

        $bar = $this->output->createProgressBar($letters->count());
        $bar->start();

        foreach ($letters as $letter) {
            try {
                $date = CarbonImmutable::parse($letter->letter_date);
                $letter->hijri_date = $service->convert($date);
                $letter->saveQuietly();
            } catch (\Exception $e) {
                $this->warn("Gagal memproses surat ID {$letter->id}: {$e->getMessage()}");
            }
            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Berhasil memperbarui {$letters->count()} surat.");

        return Command::SUCCESS;
    }
}
