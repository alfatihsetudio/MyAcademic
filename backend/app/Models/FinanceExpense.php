<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinanceExpense extends Model
{
    protected $fillable = [
        'date',
        'expense_category',
        'amount',
        'paid_to',
        'finance_account_id',
        'payment_method',
        'description',
        'proof_file',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'amount' => 'decimal:2',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function financeAccount(): BelongsTo
    {
        return $this->belongsTo(DonationAccount::class, 'finance_account_id');
    }

    public static function expenseCategories(): array
    {
        return [
            'Makan Santri',
            'Belanja Dapur',
            'Gas / LPG',
            'Air Minum / Galon',
            'Perlengkapan Dapur',
            'Kebersihan Dapur',
            'Perlengkapan Asrama',
            'Kasur / Bantal / Selimut',
            'Lemari / Rak Santri',
            'Elektronik Asrama',
            'Perawatan Asrama',
            'ATK Sekolah',
            'Buku / Modul Pembelajaran',
            'Fotokopi / Print',
            'Administrasi Sekolah',
            'Listrik',
            'Air',
            'Internet / WiFi',
            'Pulsa / Komunikasi',
            'Kebersihan Sekolah',
            'Alat Kebersihan',
            'Perawatan Gedung',
            'Perbaikan Sarpras',
            'Perlengkapan Kelas',
            'Meja / Kursi',
            'Papan Tulis / Spidol',
            'Perlengkapan Guru',
            'Kegiatan Belajar Mengajar',
            'Kegiatan Siswa',
            'Ujian / Asesmen',
            'Rapat / Konsumsi Rapat',
            'Transport',
            'BBM',
            'Kesehatan / P3K',
            'Dokumentasi / Publikasi',
            'Website / Sistem',
            'Honor / Mukafaah',
            'Bantuan Sosial',
            'Biaya Bank / Admin',
            'Pengembalian Dana',
            'Lainnya',
        ];
    }
}
