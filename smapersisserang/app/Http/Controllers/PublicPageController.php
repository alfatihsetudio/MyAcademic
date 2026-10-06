<?php

namespace App\Http\Controllers;

use App\Models\AcademicCalendarEvent;
use App\Models\AcademicYear;
use App\Models\DonationTransaction;
use App\Models\Faq;
use App\Models\DonationEducationSetting;
use App\Models\GalleryCategory;
use App\Models\OrganizationStructure;
use App\Models\SchoolFigure;
use App\Models\SchoolImage;
use App\Models\SchoolSetting;
use App\Models\SchoolSubject;
use App\Models\SchoolValue;
use App\Models\Teacher;
use App\Models\WebsitePage;
use App\Services\QrisDynamicService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;

class PublicPageController extends Controller
{
    public function profile()
    {
        try {
            $schoolSetting = SchoolSetting::current();
            $websitePage = WebsitePage::key('profile');

            $buildingImages = SchoolImage::where('is_active', true)
                ->whereHas('categories', fn($q) => $q->where('slug', 'fasilitas'))
                ->orderBy('sort_order')
                ->get();
        } catch (\Exception $e) {
            $schoolSetting = null;
            $websitePage = null;
            $buildingImages = collect();
        }

        return view('pages.profile', compact('schoolSetting', 'websitePage', 'buildingImages'));
    }

    public function program()
    {
        try {
            $schoolSetting = SchoolSetting::current();
            $websitePage = WebsitePage::key('program');
            $subjectsByCategory = SchoolSubject::with(['teachers' => function ($query) {
                    $query->where('is_active', true)->orderBy('sort_order');
                }])
                ->where('is_active', true)
                ->orderBy('category')
                ->orderBy('sort_order')
                ->get()
                ->groupBy('category');

            $schoolValues = SchoolValue::where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        } catch (\Exception $e) {
            $schoolSetting = null;
            $websitePage = null;
            $subjectsByCategory = collect();
            $schoolValues = collect();
        }

        $subjectCategories = SchoolSubject::CATEGORIES;

        return view('pages.program', compact('schoolSetting', 'websitePage', 'subjectCategories', 'subjectsByCategory', 'schoolValues'));
    }

    public function boarding()
    {
        try {
            $schoolSetting = SchoolSetting::current();
            $websitePage = WebsitePage::key('boarding');
        } catch (\Exception $e) {
            $schoolSetting = null;
            $websitePage = null;
        }

        $content = $this->buildBoardingContent($websitePage);

        return view('pages.boarding', compact('schoolSetting', 'websitePage', 'content'));
    }

    private function buildBoardingContent($websitePage): array
    {
        $defaults = [
            'section_label' => 'PROGRAM ASRAMA',
            'section_heading' => 'Mengapa Boarding School?',
            'section_subtitle' => 'Konsep pendidikan berasrama yang disiapkan untuk membentuk akhlak, kemandirian, ibadah, dan kedisiplinan siswa.',
            'schedule_heading' => 'Rancangan Jadwal Harian',
            'schedule_subtitle' => 'Rancangan pembiasaan harian yang dapat disesuaikan dengan kalender akademik dan kebutuhan pembinaan siswa.',
            'schedule_note' => 'Jadwal bersifat rancangan dan dapat menyesuaikan kondisi sekolah serta kalender akademik.',
            'focus_heading' => 'Fokus Pembinaan Asrama',
            'focus_subtitle' => 'Aspek pembinaan yang disiapkan untuk membentuk karakter Islami, mandiri, dan siap menghadapi masa depan.',
            'why_boarding_cards' => [
                ['title' => 'Pembinaan Akhlak Harian', 'description' => 'Program asrama dirancang untuk membiasakan adab, ibadah, dan akhlak Islami dalam kehidupan sehari-hari.', 'color' => 'emerald', 'icon' => 'building'],
                ['title' => 'Kemandirian dan Disiplin', 'description' => 'Siswa akan dibimbing untuk belajar mandiri, mengatur waktu, menjaga kebersihan, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt'],
                ['title' => 'Lingkungan Belajar Terarah', 'description' => 'Suasana asrama disiapkan agar mendukung belajar, pembinaan karakter, dan pendampingan akademik.', 'color' => 'emerald', 'icon' => 'academic'],
                ['title' => 'Pengawasan & Pendampingan', 'description' => 'Sistem pendampingan dirancang agar perkembangan siswa dapat dipantau secara lebih dekat.', 'color' => 'amber', 'icon' => 'users'],
            ],
            'holiday_schedule' => [],
            'daily_schedule' => [
                ['time' => '03.00', 'title' => 'Subuh & Pembinaan Ibadah', 'description' => 'Pembiasaan shalat Subuh berjamaah, dzikir pagi, dan pembinaan ibadah harian.', 'color' => 'emerald'],
                ['time' => '07.00', 'title' => 'Pembelajaran Sekolah', 'description' => 'Belajar di kelas sesuai kurikulum nasional dengan pendekatan integratif.', 'color' => 'amber'],
                ['time' => '12.00', 'title' => 'Istirahat & Kegiatan Mandiri', 'description' => 'Shalat Dzuhur, istirahat, dan waktu untuk kegiatan mandiri siswa.', 'color' => 'emerald'],
                ['time' => '15.30', 'title' => 'Kajian / Tahsin / Pembinaan', 'description' => 'Kajian Islam, tahsin Al-Qur\'an, dan pembinaan karakter.', 'color' => 'amber'],
                ['time' => '19.00', 'title' => 'Belajar Mandiri / Muhasabah', 'description' => 'Waktu belajar mandiri dan muhasabah malam yang dibimbing oleh pembina asrama.', 'color' => 'emerald'],
                ['time' => '21.00', 'title' => 'Istirahat', 'description' => 'Persiapan tidur dan istirahat malam untuk memulihkan energi.', 'color' => 'gray'],
            ],
            'info_cards' => [],
            'focus_cards' => [
                ['title' => 'Ibadah', 'description' => 'Pembiasaan shalat berjamaah, puasa sunnah, dan amalan ibadah harian.', 'color' => 'emerald', 'icon' => 'building'],
                ['title' => 'Adab', 'description' => 'Pembentukan adab Islami terhadap Allah, sesama, dan lingkungan menjadi perhatian utama.', 'color' => 'amber', 'icon' => 'shield'],
                ['title' => 'Al-Qur\'an', 'description' => 'Program tahsin dan tahfidz Al-Qur\'an akan disesuaikan dengan kemampuan masing-masing siswa.', 'color' => 'emerald', 'icon' => 'academic'],
                ['title' => 'Kemandirian', 'description' => 'Siswa akan dilatih mengurus diri sendiri, mengatur waktu, dan bertanggung jawab.', 'color' => 'amber', 'icon' => 'bolt'],
                ['title' => 'Teknologi', 'description' => 'Literasi digital dan keterampilan teknologi disiapkan sebagai bekal masa depan.', 'color' => 'emerald', 'icon' => 'cog'],
                ['title' => 'Kepemimpinan', 'description' => 'Jiwa kepemimpinan akan dikembangkan melalui organisasi dan kegiatan sosial.', 'color' => 'amber', 'icon' => 'users'],
            ],
        ];

        try {
            $settings = \App\Models\BoardingPageSetting::first();
            $whyCards = \App\Models\BoardingCard::whyBoarding()->where('is_active', true)->get();
            $focusCards = \App\Models\BoardingCard::focus()->where('is_active', true)->get();
            $infoCards = \App\Models\BoardingCard::info()->where('is_active', true)->get();
            $dailySchedules = \App\Models\BoardingSchedule::where('schedule_type', 'daily')->where('is_active', true)->orderBy('sort_order')->get();
            $holidaySchedules = \App\Models\BoardingSchedule::where('schedule_type', 'holiday')->where('is_active', true)->orderBy('sort_order')->get();

            $hasDbData = $settings || $whyCards->isNotEmpty() || $focusCards->isNotEmpty() || $infoCards->isNotEmpty() || $dailySchedules->isNotEmpty() || $holidaySchedules->isNotEmpty();

            if ($hasDbData) {
                $content = $defaults;

                if ($settings) {
                    $content['section_label'] = $settings->section_label ?? $defaults['section_label'];
                    $content['section_heading'] = $settings->section_heading ?? $defaults['section_heading'];
                    $content['section_subtitle'] = $settings->section_subtitle ?? $defaults['section_subtitle'];
                    $content['schedule_heading'] = $settings->schedule_heading ?? $defaults['schedule_heading'];
                    $content['schedule_subtitle'] = $settings->schedule_subtitle ?? $defaults['schedule_subtitle'];
                    $content['schedule_note'] = $settings->schedule_note ?? $defaults['schedule_note'];
                    $content['focus_heading'] = $settings->focus_heading ?? $defaults['focus_heading'];
                    $content['focus_subtitle'] = $settings->focus_subtitle ?? $defaults['focus_subtitle'];
                }

                $content['why_boarding_cards'] = $whyCards->isNotEmpty()
                    ? $whyCards->toArray()
                    : $defaults['why_boarding_cards'];

                $content['focus_cards'] = $focusCards->isNotEmpty()
                    ? $focusCards->toArray()
                    : $defaults['focus_cards'];

                $content['info_cards'] = $infoCards->isNotEmpty()
                    ? $infoCards->toArray()
                    : [];

                $content['daily_schedule'] = $dailySchedules->isNotEmpty()
                    ? $dailySchedules->toArray()
                    : $defaults['daily_schedule'];

                $content['holiday_schedule'] = $holidaySchedules->isNotEmpty()
                    ? $holidaySchedules->toArray()
                    : [];

                return $content;
            }
        } catch (\Exception $e) {
            // Fall through to legacy JSON fallback
        }

        // Legacy fallback: read from website_pages.content
        if ($websitePage?->content) {
            $decoded = json_decode($websitePage->content, true);
            if (is_array($decoded)) {
                $content = array_replace_recursive($defaults, $decoded);
                foreach (['why_boarding_cards', 'daily_schedule', 'focus_cards', 'holiday_schedule'] as $key) {
                    if (array_key_exists($key, $decoded)) {
                        $content[$key] = $decoded[$key];
                    }
                }
                return $content;
            }
        }

        return $defaults;
    }

    public function gallery(Request $request)
    {
        try {
            $schoolSetting = SchoolSetting::current();
            $websitePage = WebsitePage::key('gallery');
            $galleryCategories = GalleryCategory::where('slug', '!=', 'hero')
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        } catch (\Exception $e) {
            $schoolSetting = null;
            $websitePage = null;
            $galleryCategories = collect();
        }

        $category = $request->get('category');

        $query = SchoolImage::where('is_active', true)
            ->whereHas('categories', fn($q) => $q->where('slug', '!=', 'hero'))
            ->orderBy('sort_order')
            ->latest();

        if ($category && $galleryCategories->firstWhere('slug', $category)) {
            $query->whereHas('categories', fn($q) => $q->where('slug', $category));
        }

        $galleryImages = $query->with('categories')->get();

        $categories = $galleryCategories->pluck('name', 'slug');

        return view('pages.gallery', compact('schoolSetting', 'galleryImages', 'categories', 'category', 'websitePage'));
    }

    public function figures()
    {
        try {
            $schoolSetting = SchoolSetting::current();

            $figures = SchoolFigure::where('is_active', true)
                ->orderBy('sort_order')
                ->latest()
                ->get();

            $websitePage = WebsitePage::key('figures');
        } catch (\Exception $e) {
            $schoolSetting = null;
            $figures = collect();
            $websitePage = null;
        }

        return view('pages.figures', compact('schoolSetting', 'figures', 'websitePage'));
    }

    public function faq()
    {
        try {
            $schoolSetting = SchoolSetting::current();

            $faqs = Faq::where('is_active', true)
                ->orderBy('sort_order')
                ->get();
        } catch (\Exception $e) {
            $schoolSetting = null;
            $faqs = collect();
        }

        return view('pages.faq', compact('schoolSetting', 'faqs'));
    }

    /**
     * Menampilkan halaman Struktur Organisasi.
     *
     * Data struktur organisasi diambil dari database melalui model OrganizationStructure
     * dan dapat dikelola melalui menu admin: Website > Struktur Organisasi.
     *
     * -------------------------------------------------------------------
     * CARA MENGEDIT ISI ORGANIGRAM:
     * 1. Buka dashboard admin → menu "Struktur Organisasi" (sidebar kiri)
     * 2. Edit data per level:
     *    - Level 1 (pembina/pimpinan): diposisikan paling atas
     *    - Level 2 (kepala sekolah, komite): diposisikan di tengah
     *    - Level 3 (waka, TU, asrama dll.): ditambahkan sebagai anak dari
     *      struktur level 2 dengan mengisi field "Parent Key"
     * 3. Untuk setiap entri, isi:
     *    - Label: nama jabatan (contoh: "Waka Kurikulum")
     *    - Person Name: nama pejabat yang menjabat (opsional)
     *    - Person ID: pilih dari data Guru yang sudah ada (opsional)
     *    - Description: keterangan tambahan
     *    - Members: daftar anggota (dipisahkan koma atau baris baru)
     *    - Level: 1, 2, atau 3
     *    - Card Type: 'principal' untuk kepala sekolah (diberi aksen khusus)
     *    - Parent Key: diisi untuk menghubungkan level 3 ke level 2
     *      (contoh: parent_key level 3 diisi 'kepala-sekolah')
     * -------------------------------------------------------------------
     */
    private function getOrganisasiData(): array
    {
        $organizationStructures = OrganizationStructure::with('person')
            ->active()
            ->orderBy('level')
            ->orderBy('sort_order')
            ->get();

        $childrenByParent = $organizationStructures
            ->whereNotNull('parent_key')
            ->groupBy('parent_key');

        return $organizationStructures
            ->whereNull('parent_key')
            ->map(function ($structure) use ($childrenByParent) {
                $item = [
                    'key' => $structure->structure_key,
                    'level' => $structure->level,
                    'jabatan' => $structure->label,
                    'person_name' => $structure->person_name,
                    'person_display_name' => $structure->person?->name ?: $structure->person_name,
                    'photo_url' => $this->organizationPhotoUrl($structure),
                    'deskripsi' => $structure->description,
                    'anggota' => $structure->members ?? [],
                    'card_type' => $structure->card_type,
                ];

                $children = $childrenByParent->get($structure->structure_key, collect());
                if ($children->isNotEmpty()) {
                    $item['children'] = $children->map(fn($child) => [
                        'key' => $child->structure_key,
                        'level' => $child->level,
                        'jabatan' => $child->label,
                        'person_name' => $child->person_name,
                        'person_display_name' => $child->person?->name ?: $child->person_name,
                        'photo_url' => $this->organizationPhotoUrl($child),
                        'deskripsi' => $child->description,
                        'anggota' => $child->members ?? [],
                        'card_type' => $child->card_type,
                    ])->values()->all();
                }

                return $item;
            })
            ->values()
            ->all();
    }

    public function strukturOrganisasi()
    {
        try {
            $schoolSetting = SchoolSetting::current();
            $websitePage = WebsitePage::key('struktur-organisasi');
        } catch (\Exception $e) {
            $schoolSetting = null;
            $websitePage = null;
        }

        $organisasi = $this->getOrganisasiData();

        return view('pages.struktur-organisasi', compact('schoolSetting', 'websitePage', 'organisasi'));
    }

    public function donasiPendidikan()
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        return view('pages.donasi-pendidikan', compact('schoolSetting', 'setting'));
    }

    public function infaqUang()
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        return view('pages.infaq-uang', compact('schoolSetting', 'setting'));
    }

    public function infaqBarang()
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        return view('pages.infaq-barang', compact('schoolSetting', 'setting'));
    }

    public function formDonatur()
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        return view('pages.form-donatur', compact('schoolSetting', 'setting'));
    }

    public function submitDonatur(Request $request)
    {
        // Honeypot: jika field website_url terisi, tolak sebagai spam
        if ($request->filled('website_url')) {
            return redirect()->route('donasi-pendidikan.form-donatur')
                ->with('error', 'Terjadi kesalahan. Silakan coba lagi.');
        }

        // Timestamp: tolak jika submit kurang dari 3 detik sejak halaman dibuka
        $formStartedAt = $request->input('form_started_at');
        if ($formStartedAt) {
            $started = strtotime($formStartedAt);
            $elapsed = time() - $started;
            if ($elapsed < 3) {
                return redirect()->route('donasi-pendidikan.form-donatur')
                    ->with('error', 'Terlalu cepat. Silakan isi form dengan benar.');
            }
        }

        $data = $request->validate([
            'name' => 'nullable|string|max:100',
            'whatsapp' => 'nullable|string|max:20',
            'amount' => 'required|string|max:50',
            'custom_amount' => 'nullable|string|max:50',
            'note' => 'nullable|string|max:500',
            'allow_future_donation_contact' => 'nullable|boolean',
        ]);

        $amount = $this->resolveDonationAmount($data['amount'] ?? null, $data['custom_amount'] ?? null);

        if ($amount < 10000) {
            return back()->withErrors(['amount' => 'Minimal donasi Rp10.000'])->withInput();
        }

        // Form publik tidak lagi membuat transaksi. Data resmi dibuat admin setelah verifikasi mutasi.
        return redirect()->route('donasi-pendidikan.form-donatur')
            ->with('success', 'Silakan lanjutkan pembayaran melalui QRIS, lalu konfirmasi via WhatsApp. Data donasi belum disimpan sampai admin melakukan verifikasi.');
    }

    public function previewQrisInline(Request $request, QrisDynamicService $qrisService)
    {
        $data = $request->validate([
            'donor_name' => ['nullable', 'string', 'max:100'],
            'donor_whatsapp' => ['nullable', 'string', 'max:30', 'regex:/^[0-9+\-\s]*$/'],
            'amount' => ['nullable', 'string', 'max:50'],
            'custom_amount' => ['nullable', 'string', 'max:50'],
            'unique_code' => ['nullable', 'integer', 'min:1', 'max:999'],
            'note' => ['nullable', 'string', 'max:500'],
            'allow_future_donation_contact' => ['nullable', 'boolean'],
        ]);

        $amount = $this->resolveDonationAmount($data['amount'] ?? null, $data['custom_amount'] ?? null);

        if ($amount < 1000 || $amount > 50000000) {
            return response()->json([
                'success' => false,
                'message' => 'Pilih nominal donasi minimal Rp1.000 terlebih dahulu.',
            ]);
        }

        $uniqueCode = (int) ($data['unique_code'] ?? random_int(1, 299));
        $uniqueCode = max(1, min(299, $uniqueCode));
        $uniqueCodeFormatted = str_pad((string) $uniqueCode, 3, '0', STR_PAD_LEFT);
        $adminFee = (int) ceil($amount * 0.006);
        $totalTransfer = $amount + $adminFee + $uniqueCode;

        $setting = DonationEducationSetting::activeSetting();

        $qrisImage = null;
        $isDynamic = false;
        $staticFallback = false;

        if ($setting?->donation_qris_payload) {
            try {
                $qrisImage = $qrisService->generateBase64($setting->donation_qris_payload, $totalTransfer);
                $isDynamic = true;
            } catch (\Exception $e) {
                $qrisImage = null;
            }
        }

        if (!$qrisImage && $setting?->donation_qris_image) {
            $qrisImage = \Illuminate\Support\Facades\Storage::url($setting->donation_qris_image);
            $staticFallback = true;
        }

        $waNumber = preg_replace('/[^0-9]/', '', $setting?->whatsapp_number ?: '6289661234569');

        $donorName = trim($data['donor_name'] ?? '') ?: 'Hamba Allah';
        $allowContact = $request->boolean('allow_future_donation_contact');
        $allowContactText = $allowContact ? 'Ya' : 'Tidak';
        $donorWhatsapp = $allowContact ? trim($data['donor_whatsapp'] ?? '') : '';
        $donorWhatsapp = $donorWhatsapp !== '' ? $donorWhatsapp : '-';
        $note = trim($data['note'] ?? '') ?: '-';
        $transferDate = now()->timezone(config('app.timezone'))->format('d/m/Y');

        $confirmMessage = "Assalamu'alaikum Admin SMA Persis Serang.\n\n"
            . "Saya sudah melakukan donasi pendidikan.\n\n"
            . "Nama Donatur: {$donorName}\n"
            . "Bersedia Dihubungi: {$allowContactText}\n"
            . "Nomor WhatsApp: {$donorWhatsapp}\n"
            . "Nominal Donasi: Rp" . number_format($amount, 0, ',', '.') . "\n"
            . "Biaya Admin: Rp" . number_format($adminFee, 0, ',', '.') . "\n"
            . "Kode Unik: {$uniqueCodeFormatted}\n"
            . "Total Transfer: Rp" . number_format($totalTransfer, 0, ',', '.') . "\n"
            . "Tanggal Transfer: {$transferDate}\n"
            . "Catatan: {$note}\n\n"
            . "Mohon dicek dan dibuatkan bukti penerimaan donasi.\n\n"
            . "Terima kasih.";

        $confirmWaUrl = 'https://wa.me/' . $waNumber . '?text=' . urlencode($confirmMessage);

        try {
            $schoolSetting = SchoolSetting::current();
            $merchantName = $schoolSetting?->school_name ? strtoupper($schoolSetting->school_name) . ', CURUG' : 'SMA PERSIS SERANG, CURUG';
            $merchantCity = 'SERANG';
        } catch (\Exception $e) {
            $merchantName = 'SMA PERSIS SERANG, CURUG';
            $merchantCity = 'SERANG';
        }

        $response = [
            'success' => (bool) $qrisImage,
            'qris_image' => $qrisImage,
            'is_dynamic' => $isDynamic,
            'static_fallback' => $staticFallback,
            'amount_formatted' => 'Rp' . number_format($amount, 0, ',', '.'),
            'amount_raw' => $totalTransfer,
            'nominal_raw' => $amount,
            'admin_fee' => $adminFee,
            'admin_fee_formatted' => 'Rp' . number_format($adminFee, 0, ',', '.'),
            'unique_code' => $uniqueCodeFormatted,
            'unique_code_raw' => $uniqueCode,
            'total_transfer_formatted' => 'Rp' . number_format($totalTransfer, 0, ',', '.'),
            'total_transfer_raw' => $totalTransfer,
            'transfer_date' => $transferDate,
            'whatsapp_url' => $confirmWaUrl,
            'merchant_name' => $merchantName,
            'merchant_city' => $merchantCity,
            'summary' => [
                'donor_name' => $donorName,
                'allow_future_donation_contact' => $allowContact,
                'donor_whatsapp' => $donorWhatsapp,
                'note' => $note,
            ],
        ];

        if (!$qrisImage) {
            $response['message'] = 'QRIS belum tersedia. Silakan hubungi admin melalui WhatsApp.';
        } elseif ($staticFallback) {
            $response['message'] = 'Nominal belum otomatis. Silakan masukkan nominal secara manual di aplikasi pembayaran.';
        }

        return response()->json($response);
    }

    private function resolveDonationAmount(?string $amount, ?string $customAmount): int
    {
        if ($amount && $amount !== 'lainnya') {
            return (int) preg_replace('/[^0-9]/', '', $amount);
        }

        if ($amount === 'lainnya' && $customAmount) {
            return (int) preg_replace('/[^0-9]/', '', $customAmount);
        }

        return 0;
    }

    public function payment($order_id)
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        $transaction = DonationTransaction::where('order_id', $order_id)->firstOrFail();

        $waNumber = preg_replace('/[^0-9]/', '', $setting?->whatsapp_number ?: '6289661234569');

        $confirmMessage = "Assalamu'alaikum, saya sudah melakukan donasi untuk SMA Persis Serang.\n\n"
            . "Order ID: {$transaction->order_id}\n"
            . "Nama: " . ($transaction->donor_name ?: 'Hamba Allah') . "\n"
            . "Jenis Dukungan: {$transaction->support_type}\n"
            . "Nominal: Rp" . number_format($transaction->amount, 0, ',', '.') . "\n"
            . "Status: " . ucfirst($transaction->status) . "\n";

        if ($transaction->note) {
            $confirmMessage .= "Catatan: {$transaction->note}\n";
        }

        $confirmMessage .= "\nTerima kasih.";

        $confirmWaUrl = 'https://wa.me/' . $waNumber . '?text=' . urlencode($confirmMessage);

        return view('pages.payment-donasi', compact('schoolSetting', 'setting', 'transaction', 'confirmWaUrl'));
    }

    public function midtransNotification(Request $request)
    {
        $notification = $request->all();

        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');

        $orderId = $notification['order_id'] ?? null;
        $transactionStatus = $notification['transaction_status'] ?? null;
        $fraudStatus = $notification['fraud_status'] ?? null;
        $statusCode = $notification['status_code'] ?? null;
        $grossAmount = $notification['gross_amount'] ?? null;
        $signatureKey = $notification['signature_key'] ?? null;

        if (!$orderId || !$transactionStatus || !$statusCode || !$grossAmount) {
            return response()->json(['message' => 'Invalid notification'], 400);
        }

        $serverKey = config('midtrans.server_key');
        $calculatedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        if ($signatureKey !== $calculatedSignature) {
            return response()->json(['message' => 'Invalid signature'], 403);
        }

        $transaction = DonationTransaction::where('order_id', $orderId)->first();

        if (!$transaction) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $updateData = [
            'raw_notification' => $notification,
            'midtrans_transaction_id' => $notification['transaction_id'] ?? null,
            'midtrans_payment_type' => $notification['payment_type'] ?? null,
            'midtrans_fraud_status' => $fraudStatus,
        ];

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $updateData['status'] = 'paid';
                $updateData['paid_at'] = now();
            }
        } elseif ($transactionStatus === 'settlement') {
            $updateData['status'] = 'paid';
            $updateData['paid_at'] = now();
        } elseif ($transactionStatus === 'pending') {
            $updateData['status'] = 'pending';
        } elseif (in_array($transactionStatus, ['deny', 'expire', 'cancel', 'failure'])) {
            $updateData['status'] = $transactionStatus;
        }

        $transaction->update($updateData);

        return response()->json(['message' => 'OK']);
    }

    public function qris(Request $request, QrisDynamicService $qrisService)
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        $donationData = $request->session()->get('donation_data');

        if (!$donationData) {
            return redirect()->route('donasi-pendidikan.form-donatur')
                ->with('error', 'Silakan isi form donatur terlebih dahulu.');
        }

        $dynamicQrisBase64 = null;
        $dynamicPayload = null;
        $hasQrisPayload = $setting?->donation_qris_payload && (int) $donationData['amount'] >= 1;

        if ($hasQrisPayload) {
            try {
                $dynamicPayload = $qrisService->generatePayload(
                    $setting->donation_qris_payload,
                    (int) $donationData['amount']
                );

                $dynamicQrisBase64 = $qrisService->generateBase64(
                    $setting->donation_qris_payload,
                    (int) $donationData['amount']
                );
            } catch (\Exception $e) {
                $dynamicQrisBase64 = null;
                $dynamicPayload = null;
            }
        }

        $waNumber = preg_replace('/[^0-9]/', '', $setting?->whatsapp_number ?: '6289661234569');

        $confirmMessage = "Assalamu'alaikum, saya sudah melakukan donasi untuk Program Orang Tua Asuh Santri SMA Persis Serang.\n\n"
            . "Nama: {$donationData['donor_name']}\n"
            . "Nomor WA: {$donationData['donor_whatsapp']}\n"
            . "Jenis Dukungan: {$donationData['support_type']}\n"
            . "Nominal: Rp" . number_format($donationData['amount'], 0, ',', '.') . "\n";

        if ($donationData['note'] ?? null) {
            $confirmMessage .= "Catatan: {$donationData['note']}\n";
        }

        $confirmMessage .= "\nSaya lampirkan bukti pembayaran. Terima kasih.";

        $confirmWaUrl = 'https://wa.me/' . $waNumber . '?text=' . urlencode($confirmMessage);

        return view('pages.qris', compact('schoolSetting', 'setting', 'donationData', 'confirmWaUrl', 'dynamicQrisBase64', 'dynamicPayload', 'hasQrisPayload'));
    }

    public function downloadQris(Request $request, QrisDynamicService $qrisService)
    {
        $setting = DonationEducationSetting::activeSetting();

        $amount = (int) $request->query('amount', 0);

        if ($amount < 1000) {
            $donationData = $request->session()->get('donation_data');
            $amount = $donationData ? (int) $donationData['amount'] : 0;
        }

        if ($amount < 1000) {
            return redirect()->route('donasi-pendidikan.form-donatur')
                ->with('error', 'Nominal tidak valid.');
        }

        if ($setting?->donation_qris_payload) {
            try {
                $pngBinary = $qrisService->generatePngBinary($setting->donation_qris_payload, $amount);

                $filename = 'qris-donasi-sma-persis-serang.png';

                return response($pngBinary, 200, [
                    'Content-Type' => 'image/png',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                    'Content-Length' => strlen($pngBinary),
                ]);
            } catch (\Exception $e) {
                if (!$setting?->donation_qris_image) {
                    return redirect()->route('donasi-pendidikan.form-donatur')
                        ->with('error', 'Gagal generate QRIS. Silakan coba lagi.');
                }
            }
        }

        if ($setting?->donation_qris_image) {
            try {
                $pngBinary = $this->optimizedQrisImageBinary($setting->donation_qris_image);

                return response($pngBinary, 200, [
                    'Content-Type' => 'image/png',
                    'Content-Disposition' => 'attachment; filename="qris-donasi-sma-persis-serang.png"',
                    'Content-Length' => strlen($pngBinary),
                ]);
            } catch (\Exception $e) {
                return redirect()->route('donasi-pendidikan.form-donatur')
                    ->with('error', 'Gagal menyiapkan file QRIS. Silakan coba lagi.');
            }
        }

        return redirect()->route('donasi-pendidikan.form-donatur')
            ->with('error', 'QRIS belum tersedia.');
    }

    public function downloadQrisHero()
    {
        $setting = DonationEducationSetting::activeSetting();

        if (!$setting?->donation_qris_image) {
            abort(404, 'QRIS belum tersedia.');
        }

        $resizedPath = 'qris/download/QRIS-Infaq-SMA-Persis-Serang.png';

        if (!Storage::disk('public')->exists($resizedPath)) {
            $sourcePath = $setting->donation_qris_image;

            if (!Storage::disk('public')->exists($sourcePath)) {
                abort(404, 'Gambar QRIS tidak ditemukan.');
            }

            $originalBinary = Storage::disk('public')->get($sourcePath);
            $source = @imagecreatefromstring($originalBinary);

            if (!$source) {
                abort(500, 'Format gambar QRIS tidak valid.');
            }

            $sourceWidth = imagesx($source);
            $sourceHeight = imagesy($source);
            $maxWidth = 1080;

            $scale = $sourceWidth > $maxWidth ? $maxWidth / $sourceWidth : 1;
            $targetWidth = max(1, (int) round($sourceWidth * $scale));
            $targetHeight = max(1, (int) round($sourceHeight * $scale));

            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            imagesavealpha($canvas, true);
            $transparent = imagecolorallocatealpha($canvas, 0, 0, 0, 127);
            imagefill($canvas, 0, 0, $transparent);
            imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);

            ob_start();
            imagepng($canvas, null, 9);
            $binary = (string) ob_get_clean();
            imagedestroy($canvas);
            imagedestroy($source);

            $dir = dirname($resizedPath);
            if (!Storage::disk('public')->exists($dir)) {
                Storage::disk('public')->makeDirectory($dir);
            }

            Storage::disk('public')->put($resizedPath, $binary);
        }

        return Storage::disk('public')->download($resizedPath, 'QRIS-Infaq-SMA-Persis-Serang.png');
    }

    private function optimizedQrisImageBinary(string $path): string
    {
        if (!Storage::disk('public')->exists($path)) {
            throw new \RuntimeException('File QRIS tidak ditemukan.');
        }

        $originalBinary = Storage::disk('public')->get($path);
        $source = imagecreatefromstring($originalBinary);

        if (!$source) {
            throw new \RuntimeException('Format gambar QRIS tidak valid.');
        }

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $targetWidths = [800, 700, 600, 500];
        $lastBinary = null;

        foreach ($targetWidths as $maxWidth) {
            $scale = min(1, $maxWidth / max(1, $sourceWidth));
            $targetWidth = max(1, (int) round($sourceWidth * $scale));
            $targetHeight = max(1, (int) round($sourceHeight * $scale));

            $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
            $white = imagecolorallocate($canvas, 255, 255, 255);
            imagefilledrectangle($canvas, 0, 0, $targetWidth, $targetHeight, $white);
            imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $sourceWidth, $sourceHeight);

            ob_start();
            imagepng($canvas, null, 9);
            $binary = (string) ob_get_clean();
            imagedestroy($canvas);

            $lastBinary = $binary;

            if (strlen($binary) <= 500 * 1024) {
                imagedestroy($source);
                return $binary;
            }
        }

        imagedestroy($source);

        if ($lastBinary === null) {
            throw new \RuntimeException('Gagal mengoptimasi QRIS.');
        }

        return $lastBinary;
    }

    private function organizationPhotoUrl(OrganizationStructure $structure): ?string
    {
        $photoPath = $structure->person?->photo_path;

        return $photoPath ? asset('storage/' . $photoPath) : null;
    }

    public function teachers(Request $request)
    {
        $tab = $request->query('tab', 'guru');

        try {
            $schoolSetting = SchoolSetting::current();

            $heroImages = SchoolImage::where('is_active', true)
                ->whereHas('categories', fn($q) => $q->where('slug', 'guru'))
                ->orderBy('sort_order')
                ->latest()
                ->get();

            if ($heroImages->isEmpty()) {
                $heroImages = SchoolImage::where('is_active', true)
                    ->whereHas('categories', fn($q) => $q->where('slug', 'fasilitas'))
                    ->orderBy('sort_order')
                    ->latest()
                    ->get();
            }

            $headmaster = Teacher::with(['subjects' => function ($query) {
                    $query->where('school_subjects.is_active', true)
                        ->orderBy('school_subjects.sort_order');
                }])
                ->where('is_active', true)
                ->where('position', 'Kepala Sekolah')
                ->orderBy('sort_order')
                ->first();

            if ($headmaster) {
                $headmaster->setAttribute('label', 'KEPALA SEKOLAH');
            }

            $teachers = Teacher::with(['subjects' => function ($query) {
                    $query->where('school_subjects.is_active', true)
                        ->orderBy('school_subjects.sort_order');
                }])
                ->where('is_active', true)
                ->where(function ($q) {
                    $q->whereNull('position')
                        ->orWhere('position', '!=', 'Kepala Sekolah');
                })
                ->orderBy('sort_order')
                ->get();

            $groupedByCategory = collect();
            $orphanTeachers = collect();

            foreach ($teachers as $teacher) {
                $teacher->setAttribute('label', 'GURU PENGAMPU');
                $activeSubjects = $teacher->subjects;

                if ($activeSubjects->isEmpty()) {
                    $orphanTeachers->push($teacher);
                    continue;
                }

                $primarySubject = $activeSubjects->first();
                $category = $primarySubject->category;

                if (!$groupedByCategory->has($category)) {
                    $groupedByCategory->put($category, collect([
                        'category_label' => $primarySubject->category_label,
                        'teachers' => collect(),
                    ]));
                }

                $categoryGroup = $groupedByCategory->get($category);
                $alreadyAdded = $categoryGroup['teachers']->first(fn($t) => $t->id === $teacher->id);
                if (!$alreadyAdded) {
                    $categoryGroup['teachers']->push($teacher);
                }
            }

            $groupedByCategory = $groupedByCategory->sortKeys();

            $websitePage = WebsitePage::key('teachers');
        } catch (\Exception $e) {
            $schoolSetting = null;
            $headmaster = null;
            $groupedByCategory = collect();
            $orphanTeachers = collect();
            $websitePage = null;
            $heroImages = collect();
        }

        $organisasi = null;
        $strukturWebsitePage = null;

        if ($tab === 'struktur') {
            $organisasi = $this->getOrganisasiData();
            try {
                $strukturWebsitePage = WebsitePage::key('struktur-organisasi');
            } catch (\Exception $e) {
                $strukturWebsitePage = null;
            }
        }

        return view('pages.teachers', compact('schoolSetting', 'websitePage', 'headmaster', 'groupedByCategory', 'orphanTeachers', 'heroImages', 'tab', 'organisasi', 'strukturWebsitePage'));
    }

    public function academicCalendar(Request $request)
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $indonesianMonths = [
            1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
            5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
            9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
        ];

        $dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

        $categoryMap = $this->getPublicCalendarCategoryMap();

        $academicYear = AcademicYear::current()->first();

        $selectedMonthDate = null;
        $previousMonthDate = null;
        $nextMonthDate = null;
        $canGoPrevious = false;
        $canGoNext = false;
        $showTodayButton = false;
        $calendarDays = [];
        $dayEvents = collect();
        $categories = collect();
        $monthlySummary = ['total_events' => 0, 'hari_libur' => 0, 'hari_asesmen' => 0, 'hari_berkegiatan' => 0];
        $monthlyRawEvents = collect();
        $upcomingEvents = collect();
        $selectedDayDate = null;
        $mobileEventData = [];

        if ($academicYear) {
            $yearStart = $academicYear->start_date;
            $yearEnd = $academicYear->end_date;
            $today = now();

            $defaultMonth = $today->copy()->startOfMonth();
            if ($defaultMonth->lt($yearStart->copy()->startOfMonth())) {
                $defaultMonth = $yearStart->copy()->startOfMonth();
            } elseif ($defaultMonth->gt($yearEnd->copy()->startOfMonth())) {
                $defaultMonth = $yearEnd->copy()->startOfMonth();
            }

            $selectedMonth = $defaultMonth;
            $monthParam = $request->query('month');

            if ($monthParam && preg_match('/^(\d{4})-(\d{2})$/', $monthParam, $matches)) {
                $y = (int) $matches[1];
                $m = (int) $matches[2];
                $parsed = \Carbon\Carbon::createFromDate($y, $m, 1)->startOfMonth();
                if ($parsed->between($yearStart->copy()->startOfMonth(), $yearEnd->copy()->endOfMonth(), true)) {
                    $selectedMonth = $parsed;
                }
            }

            $selectedMonthDate = $selectedMonth;
            $monthStart = $selectedMonth->copy()->startOfMonth();
            $monthEnd = $selectedMonth->copy()->endOfMonth();

            $previousMonthDate = $selectedMonth->copy()->subMonth()->startOfMonth();
            $nextMonthDate = $selectedMonth->copy()->addMonth()->startOfMonth();
            $canGoPrevious = $previousMonthDate->gte($yearStart->copy()->startOfMonth());
            $canGoNext = $nextMonthDate->lte($yearEnd->copy()->endOfMonth());
            $showTodayButton = $today->between($yearStart, $yearEnd);

            $dbEvents = AcademicCalendarEvent::with('teacher')
                ->where('academic_year_id', $academicYear->id)
                ->where('status', 'published')
                ->where(function ($q) {
                    $q->whereJsonContains('targets', 'publik')
                      ->orWhereJsonContains('targets', 'semua');
                })
                ->where('start_date', '<=', $monthEnd)
                ->where('end_date', '>=', $monthStart)
                ->orderBy('start_date')
                ->orderBy('start_time')
                ->get();

            $mappedEvents = $dbEvents->map(function ($evt) use ($categoryMap) {
                $cat = $categoryMap[$evt->category] ?? $categoryMap['lainnya'];
                return [
                    'id' => $evt->id,
                    'title' => $evt->title,
                    'category' => $evt->category,
                    'category_label' => $cat['label'],
                    'dot_class' => $cat['dot_class'],
                    'bg_class' => $cat['bg_class'],
                    'text_class' => $cat['text_class'],
                    'cell_bg' => $cat['cell_bg'],
                    'start_date' => $evt->start_date->toDateString(),
                    'end_date' => $evt->end_date->toDateString(),
                    'is_holiday' => $evt->is_holiday,
                    'description' => $evt->description,
                    'location' => $evt->location,
                    'start_time' => $evt->start_time ? \Carbon\Carbon::parse($evt->start_time)->format('H.i') : null,
                    'end_time' => $evt->end_time ? \Carbon\Carbon::parse($evt->end_time)->format('H.i') : null,
                ];
            });

            $seenEventIds = collect();
            $uniqueHolidayDates = collect();
            $uniqueAssessmentDates = collect();
            $uniqueActivityDates = collect();

            foreach ($mappedEvents as $evt) {
                $start = \Carbon\Carbon::parse($evt['start_date']);
                $end = \Carbon\Carbon::parse($evt['end_date']);

                if (!$seenEventIds->contains($evt['id'])) {
                    $seenEventIds->push($evt['id']);
                    $dateFormatted = $this->formatCalendarDateRange($evt['start_date'], $evt['end_date'], $indonesianMonths);
                    $monthlyRawEvents->push($evt + ['date_formatted' => $dateFormatted]);
                }

                for ($d = $start->copy(); $d->lte($end); $d->addDay()) {
                    $dateStr = $d->format('Y-m-d');

                    if ($d->month !== $selectedMonth->month || $d->year !== $selectedMonth->year) {
                        continue;
                    }

                    if (!$dayEvents->has($dateStr)) {
                        $dayEvents->put($dateStr, collect());
                    }
                    $dayEvents->get($dateStr)->push($evt);

                    if ($evt['is_holiday']) {
                        $uniqueHolidayDates->push($dateStr);
                    }
                    if (in_array($evt['category'], ['asesmen-ujian', 'tka-asesmen-nasional'])) {
                        $uniqueAssessmentDates->push($dateStr);
                    }
                    $uniqueActivityDates->push($dateStr);
                }
            }

            $daysInMonth = $monthStart->daysInMonth;
            $firstDayOfWeek = $monthStart->dayOfWeek;

            if ($firstDayOfWeek > 0) {
                $prevMonth = $selectedMonth->copy()->subMonth();
                $daysInPrevMonth = $prevMonth->daysInMonth;
                for ($i = $firstDayOfWeek - 1; $i >= 0; $i--) {
                    $dayNum = $daysInPrevMonth - $i;
                    $dateStr = sprintf('%04d-%02d-%02d', $prevMonth->year, $prevMonth->month, $dayNum);
                    $calendarDays[] = [
                        'day' => $dayNum,
                        'date' => $dateStr,
                        'isCurrentMonth' => false,
                        'isToday' => false,
                        'isSunday' => false,
                    ];
                }
            }

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dateObj = \Carbon\Carbon::createFromDate($selectedMonth->year, $selectedMonth->month, $d);
                $dateStr = $dateObj->format('Y-m-d');
                $calendarDays[] = [
                    'day' => $d,
                    'date' => $dateStr,
                    'isCurrentMonth' => true,
                    'isToday' => $dateObj->isToday(),
                    'isSunday' => $dateObj->dayOfWeek === 0,
                ];
            }

            $totalCells = count($calendarDays);
            $remaining = 7 - ($totalCells % 7);
            if ($remaining < 7) {
                $nextMonth = $selectedMonth->copy()->addMonth();
                for ($d = 1; $d <= $remaining; $d++) {
                    $dateStr = sprintf('%04d-%02d-%02d', $nextMonth->year, $nextMonth->month, $d);
                    $calendarDays[] = [
                        'day' => $d,
                        'date' => $dateStr,
                        'isCurrentMonth' => false,
                        'isToday' => false,
                        'isSunday' => false,
                    ];
                }
            }

            $categories = $categoryMap->map(function ($c, $key) use ($dayEvents) {
                $uniqueDates = collect();
                foreach ($dayEvents as $dateStr => $evts) {
                    $hasCat = $evts->first(fn($e) => $e['category'] === $key);
                    if ($hasCat) {
                        $uniqueDates->push($dateStr);
                    }
                }
                return [
                    'key' => $key,
                    'label' => $c['label'],
                    'dot_class' => $c['dot_class'],
                    'bg_class' => $c['bg_class'],
                    'text_class' => $c['text_class'],
                    'cell_bg' => $c['cell_bg'],
                    'count' => $uniqueDates->unique()->count(),
                ];
            })->values();

            $monthlySummary = [
                'total_events' => $monthlyRawEvents->count(),
                'hari_libur' => $uniqueHolidayDates->unique()->count(),
                'hari_asesmen' => $uniqueAssessmentDates->unique()->count(),
                'hari_berkegiatan' => $uniqueActivityDates->unique()->count(),
            ];

            $todayStr = now()->format('Y-m-d');
            $upcomingEvents = $monthlyRawEvents
                ->filter(fn($e) => $e['end_date'] >= $todayStr)
                ->sort(function ($a, $b) use ($todayStr) {
                    $aOngoing = ($a['start_date'] <= $todayStr && $a['end_date'] >= $todayStr) ? 0 : 1;
                    $bOngoing = ($b['start_date'] <= $todayStr && $b['end_date'] >= $todayStr) ? 0 : 1;
                    if ($aOngoing !== $bOngoing) return $aOngoing - $bOngoing;
                    if ($a['start_date'] !== $b['start_date']) return $a['start_date'] <=> $b['start_date'];
                    return ($a['start_time'] ?? '') <=> ($b['start_time'] ?? '');
                })
                ->take(4)
                ->values();

            $todayStr = now()->toDateString();
            $foundToday = false;
            foreach ($calendarDays as $d) {
                if ($d['date'] === $todayStr && $d['isCurrentMonth']) {
                    $foundToday = true;
                    break;
                }
            }
            if ($foundToday) {
                $selectedDayDate = $todayStr;
            } else {
                foreach ($calendarDays as $d) {
                    if ($d['isCurrentMonth'] && $dayEvents->has($d['date'])) {
                        $selectedDayDate = $d['date'];
                        break;
                    }
                }
                if (!$selectedDayDate) {
                    $selectedDayDate = sprintf('%04d-%02d-01', $selectedMonth->year, $selectedMonth->month);
                }
            }

            foreach ($dayEvents as $date => $events) {
                $mobileEventData[$date] = $events->map(function ($e) use ($indonesianMonths) {
                    return [
                        'title' => $e['title'],
                        'category_label' => $e['category_label'],
                        'dot_class' => $e['dot_class'],
                        'bg_class' => $e['bg_class'],
                        'text_class' => $e['text_class'],
                        'start_date' => $e['start_date'],
                        'end_date' => $e['end_date'],
                        'start_time' => $e['start_time'],
                        'end_time' => $e['end_time'],
                        'location' => $e['location'],
                        'description' => $e['description'],
                        'date_formatted' => $this->formatCalendarDateRange($e['start_date'], $e['end_date'], $indonesianMonths),
                    ];
                })->values()->toArray();
            }
        }

        return view('pages.public-academic-calendar', compact(
            'schoolSetting', 'academicYear', 'indonesianMonths', 'dayNames', 'categoryMap',
            'selectedMonthDate', 'previousMonthDate', 'nextMonthDate',
            'canGoPrevious', 'canGoNext', 'showTodayButton',
            'calendarDays', 'dayEvents', 'categories', 'monthlySummary',
            'monthlyRawEvents', 'upcomingEvents', 'selectedDayDate', 'mobileEventData'
        ));
    }

    private function getPublicCalendarCategoryMap(): \Illuminate\Support\Collection
    {
        return collect([
            'awal-masuk' => [
                'label' => 'Awal Masuk Sekolah',
                'dot_class' => 'bg-green-500',
                'bg_class' => 'bg-green-100',
                'text_class' => 'text-green-800',
                'cell_bg' => 'bg-green-100',
            ],
            'libur-nasional' => [
                'label' => 'Libur Nasional / Cuti Bersama',
                'dot_class' => 'bg-red-500',
                'bg_class' => 'bg-red-100',
                'text_class' => 'text-red-800',
                'cell_bg' => 'bg-red-100',
            ],
            'penyerahan-rapor' => [
                'label' => 'Penyerahan Rapor',
                'dot_class' => 'bg-orange-500',
                'bg_class' => 'bg-orange-100',
                'text_class' => 'text-orange-800',
                'cell_bg' => 'bg-orange-100',
            ],
            'libur-ramadan' => [
                'label' => 'Libur Ramadan / Idulfitri',
                'dot_class' => 'bg-amber-500',
                'bg_class' => 'bg-amber-100',
                'text_class' => 'text-amber-800',
                'cell_bg' => 'bg-amber-100',
            ],
            'asesmen-ujian' => [
                'label' => 'Asesmen / Ujian',
                'dot_class' => 'bg-blue-500',
                'bg_class' => 'bg-blue-100',
                'text_class' => 'text-blue-800',
                'cell_bg' => 'bg-blue-100',
            ],
            'libur-semester' => [
                'label' => 'Libur Semester',
                'dot_class' => 'bg-yellow-500',
                'bg_class' => 'bg-yellow-100',
                'text_class' => 'text-yellow-800',
                'cell_bg' => 'bg-yellow-100',
            ],
            'tka-asesmen-nasional' => [
                'label' => 'TKA / Asesmen Nasional',
                'dot_class' => 'bg-purple-500',
                'bg_class' => 'bg-purple-100',
                'text_class' => 'text-purple-800',
                'cell_bg' => 'bg-purple-100',
            ],
            'kegiatan-sekolah' => [
                'label' => 'Kegiatan Sekolah',
                'dot_class' => 'bg-violet-500',
                'bg_class' => 'bg-violet-100',
                'text_class' => 'text-violet-800',
                'cell_bg' => 'bg-violet-100',
            ],
            'kegiatan-pesantren' => [
                'label' => 'Kegiatan Pesantren',
                'dot_class' => 'bg-teal-500',
                'bg_class' => 'bg-teal-100',
                'text_class' => 'text-teal-800',
                'cell_bg' => 'bg-teal-100',
            ],
            'lainnya' => [
                'label' => 'Lainnya',
                'dot_class' => 'bg-slate-500',
                'bg_class' => 'bg-slate-100',
                'text_class' => 'text-slate-800',
                'cell_bg' => 'bg-slate-100',
            ],
        ]);
    }

    private function formatCalendarDateRange(string $startDate, string $endDate, array $indonesianMonths): string
    {
        $start = \Carbon\Carbon::parse($startDate);
        $end = \Carbon\Carbon::parse($endDate);

        if ($start->toDateString() === $end->toDateString()) {
            return $start->format('j') . ' ' . $indonesianMonths[$start->month] . ' ' . $start->format('Y');
        }

        if ($start->month === $end->month && $start->year === $end->year) {
            return $start->format('j') . '–' . $end->format('j') . ' ' . $indonesianMonths[$start->month] . ' ' . $start->format('Y');
        }

        if ($start->year === $end->year) {
            return $start->format('j') . ' ' . $indonesianMonths[$start->month] . '–' . $end->format('j') . ' ' . $indonesianMonths[$end->month] . ' ' . $start->format('Y');
        }

        return $start->format('j') . ' ' . $indonesianMonths[$start->month] . ' ' . $start->format('Y') . '–' . $end->format('j') . ' ' . $indonesianMonths[$end->month] . ' ' . $end->format('Y');
    }

    public function sebarkan()
    {
        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        $setting = DonationEducationSetting::activeSetting();

        $sapaanOptions = [
            'Bapak', 'Ibu', 'Pak Haji', 'Bu Haji',
            'Ustadz', 'Ustadzah', 'Kang', 'Teh', 'Saudara/i',
        ];

        return view('pages.sebarkan', compact('schoolSetting', 'setting', 'sapaanOptions'));
    }

    public function submitSebarkan(Request $request)
    {
        $data = $request->validate([
            'sapaan' => 'required|string|max:50',
            'nama_tujuan' => 'required|string|max:255',
            'nomor_whatsapp' => 'nullable|string|max:30',
        ]);

        $template = \App\Models\DonationShareTemplate::activeTemplate();

        $message = $template?->message_template ?? "Assalamu'alaikum warahmatullahi wabarakatuh, {sapaan} {nama_tujuan}.\n\nSilakan berdonasi melalui link berikut:\n{link_donasi}\n\nJazakumullahu khairan katsiran.";

        $linkDonasi = route('donasi-pendidikan');

        $message = str_replace(
            ['{sapaan}', '{nama_tujuan}', '{link_donasi}'],
            [$data['sapaan'], $data['nama_tujuan'], $linkDonasi],
            $message
        );

        $nomor = $data['nomor_whatsapp'] ?? '';
        $nomor = preg_replace('/[\s\-]+/', '', $nomor);
        $nomor = preg_replace('/^08/', '628', $nomor);
        $nomor = preg_replace('/^\+/', '', $nomor);

        try {
            $schoolSetting = SchoolSetting::current();
        } catch (\Exception $e) {
            $schoolSetting = null;
        }

        return view('pages.sebarkan-preview', compact(
            'message', 'nomor', 'linkDonasi', 'schoolSetting', 'data'
        ));
    }
}
