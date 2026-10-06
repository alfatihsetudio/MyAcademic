<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Sinkronkan donation_transactions.donation_account_id dengan payment_method.
 *
 * Latar belakang: donation_account_id hanya pernah ditulis oleh backfill lama
 * yang memetakan payment_method ke akun (dengan fallback NULL/other -> Tunai
 * Donasi). Perubahan payment_method setelah backfill tidak pernah menyinkronkan
 * akun, sehingga muncul transaksi mismatch (mis. qris tercatat di Tunai Donasi).
 *
 * Migration ini self-contained (tanpa service app), deterministik, dan
 * idempotent. Pemetaan ditentukan langsung dari tabel donation_accounts:
 *   - cash          -> akun donation bertipe cash
 *   - qris          -> akun donation bertipe qris
 *   - bank_transfer -> akun donation bertipe bank_transfer
 *   - other / NULL  -> akun bertipe 'other' bila ada, selain itu NULL
 *                      (diperbaiki dari fallback lama yang menaruhnya di Tunai)
 *
 * Hanya kolom donation_account_id yang diubah (updated_at tidak disentuh).
 * Seluruh status (valid maupun pending/cancelled/expired) ikut diperbaiki.
 * Aman: tidak ada fitur klasifikasi manual donation_account_id di aplikasi,
 * satu-satunya penulis kolom ini adalah migration backfill, sehingga nilai yang
 * ada selalu turunan payment_method pada waktu backfill dan bisa dihitung ulang.
 *
 * PREVIEW sebelum menjalankan di production (jumlah baris yang akan berubah):
 *
 *   -- 1) cash/qris/bank_transfer yang akunnya NULL atau tidak cocok
 *   SELECT t.payment_method AS mapping, COUNT(*) AS rows_to_change,
 *          COALESCE(SUM(t.amount),0) AS total_amount
 *   FROM donation_transactions t
 *   WHERE t.payment_method IN ('cash','qris','bank_transfer')
 *     AND NOT EXISTS (
 *       SELECT 1 FROM donation_accounts a
 *       WHERE a.category='donation' AND a.type=t.payment_method
 *         AND a.id=t.donation_account_id
 *     )
 *     AND EXISTS (
 *       SELECT 1 FROM donation_accounts a
 *       WHERE a.category='donation' AND a.type=t.payment_method
 *     )
 *   GROUP BY t.payment_method;
 *
 *   -- 2) NULL/other yang akan dilepas dari akun lama (ke 'other' atau NULL)
 *   SELECT 'null/other' AS mapping, COUNT(*) AS rows_to_change,
 *          COALESCE(SUM(t.amount),0) AS total_amount
 *   FROM donation_transactions t
 *   WHERE (t.payment_method IS NULL OR t.payment_method='other')
 *     AND t.donation_account_id IS NOT NULL
 *     AND NOT EXISTS (
 *       SELECT 1 FROM donation_accounts a
 *       WHERE a.category='donation' AND a.type='other' AND a.id=t.donation_account_id
 *     );
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('donation_accounts')
            || ! Schema::hasTable('donation_transactions')
            || ! Schema::hasColumn('donation_transactions', 'donation_account_id')) {
            return;
        }

        $targets = [
            'cash' => $this->donationAccountIdByType('cash'),
            'qris' => $this->donationAccountIdByType('qris'),
            'bank_transfer' => $this->donationAccountIdByType('bank_transfer'),
        ];

        foreach ($targets as $method => $accountId) {
            if ($accountId === null) {
                continue;
            }

            DB::table('donation_transactions')
                ->where('payment_method', $method)
                ->where(function ($query) use ($accountId) {
                    $query->whereNull('donation_account_id')
                        ->orWhere('donation_account_id', '!=', $accountId);
                })
                ->update(['donation_account_id' => $accountId]);
        }

        $otherAccountId = $this->donationAccountIdByType('other');

        DB::table('donation_transactions')
            ->where(function ($query) {
                $query->whereNull('payment_method')
                    ->orWhere('payment_method', 'other');
            })
            ->where(function ($query) use ($otherAccountId) {
                $query->whereNull('donation_account_id');
                if ($otherAccountId !== null) {
                    $query->orWhere('donation_account_id', '!=', $otherAccountId);
                } else {
                    $query->orWhereNotNull('donation_account_id');
                }
            })
            ->update(['donation_account_id' => $otherAccountId]);
    }

    public function down(): void
    {
        // No-op: data-fix tidak dibalik agar histori klasifikasi tetap utuh.
    }

    private function donationAccountIdByType(string $type): ?int
    {
        $account = DB::table('donation_accounts')
            ->where('category', 'donation')
            ->where('type', $type)
            ->value('id');

        return $account !== null ? (int) $account : null;
    }
};
