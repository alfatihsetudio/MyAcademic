<?php

namespace App\Services;

use App\Enums\DonationPaymentMethod;
use App\Models\DonationAccount;
use Illuminate\Support\Facades\Schema;

/**
 * Sumber tunggal pemetaan payment_method -> donation_account (category=donation).
 *
 * Mapping berbasis kolom donation_accounts.type (bukan nama akun) agar tetap
 * valid meskipun nama akun berubah:
 *
 *   cash          -> akun donation bertipe cash
 *   qris          -> akun donation bertipe qris
 *   bank_transfer -> akun donation bertipe bank_transfer
 *   other / null  -> akun donation bertipe 'other' bila tersedia, selain itu NULL
 *                    (tidak pernah diarahkan ke Tunai).
 *
 * Semua jalur tulis DonationTransaction (storeReceipt, update, updatePaymentMethod)
 * memanggil resolver ini di dalam transaction yang sama dengan penulisan
 * payment_method, sehingga donation_account_id tidak pernah tertinggal.
 */
class DonationAccountResolver
{
    public function resolveDonationAccountId(?string $paymentMethod): ?int
    {
        if (! Schema::hasTable('donation_accounts')) {
            return null;
        }

        if ($paymentMethod === null || $paymentMethod === DonationPaymentMethod::Other->value) {
            return $this->findAccountId(DonationAccount::TYPE_OTHER);
        }

        return $this->findAccountId($paymentMethod);
    }

    private function findAccountId(?string $type): ?int
    {
        $id = DonationAccount::query()
            ->where('category', DonationAccount::CATEGORY_DONATION)
            ->where('type', $type)
            ->orderBy('id')
            ->value('id');

        return $id === null ? null : (int) $id;
    }
}
