<?php

namespace App\Services;

use App\Models\AiFaq;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenAIChatService
{
    protected string $apiKey;
    protected string $model;

    protected array $stopwords = [
        'apa', 'itu', 'siapa', 'dimana', 'kapan', 'mengapa', 'bagaimana',
        'yang', 'ini', 'itu', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan',
        'tidak', 'ada', 'bisa', 'akan', 'sudah', 'belum', 'apakah', 'saya',
        'kami', 'kita', 'anda', 'dia', 'mereka', 'untuk', 'dalam', 'pada',
        'sebagai', 'oleh', 'secara', 'ya', 'indonesia', 'sma',
        'serang', 'sekolah',
    ];

    protected array $suffixPatterns = [
        '/^(.*)nya$/u',
        '/^(.*)kan$/u',
        '/^(.*)kah$/u',
        '/^(.*)lah$/u',
        '/^(.*)ku$/u',
        '/^(.*)mu$/u',
    ];

    public function __construct()
    {
        $this->apiKey = config('services.openai.api_key');
        $this->model = config('services.openai.model', 'gpt-4o-mini');
    }

    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    public function chat(string $message, array $context): ?string
    {
        if (!$this->isConfigured()) {
            return null;
        }

        // 1. Understand user intent
        $intent = $this->understandIntent($message);

        Log::info('AI Chat intent', [
            'message' => $message,
            'intent' => $intent['intent'] ?? null,
            'rewritten_query' => $intent['rewritten_query'] ?? null,
            'needs_whatsapp' => $intent['needs_whatsapp'] ?? null,
            'confidence' => $intent['confidence'] ?? null,
        ]);

        // 2. Handle greeting/thanks directly
        if (in_array($intent['intent'] ?? '', ['greeting', 'thanks'])) {
            $greetingReplies = [
                'greeting' => 'Halo, selamat datang di layanan Chat AI SMA Persis Serang. Silakan tanyakan seputar SPMB, biaya sekolah, asrama, kuota siswa, syarat pendaftaran, atau program sekolah.',
                'thanks' => 'Sama-sama. Jika ada pertanyaan lain seputar SPMB SMA Persis Serang, silakan tanyakan kembali.',
            ];
            return $greetingReplies[$intent['intent']] ?? null;
        }

        // 3. Low confidence → ask clarification
        if (($intent['confidence'] ?? 0) < 0.4) {
            return 'Boleh diperjelas, ingin bertanya tentang biaya, syarat pendaftaran, kuota, asrama, atau program sekolah?';
        }

        // 4. Search FAQ prioritized by intent category
        $faqs = $this->searchFaqByIntent($intent['intent'] ?? '', $message);
        if ($faqs->isEmpty()) {
            $faqs = $this->searchRelevantFaqs($message);
        }

        // 5. Build prompt with intent context
        $systemPrompt = $this->buildSystemPrompt($context, $faqs, $intent);

        $queryText = $intent['rewritten_query'] ?? $message;

        try {
            $response = Http::timeout(30)
                ->withToken($this->apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt],
                        ['role' => 'user', 'content' => $queryText],
                    ],
                    'max_tokens' => 400,
                    'temperature' => 0.8,
                ]);

            if ($response->successful()) {
                return $response->json('choices.0.message.content');
            }

            Log::warning('OpenAI API error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('OpenAI API exception', ['message' => $e->getMessage()]);
            return null;
        }
    }

    public function understandIntent(string $message): array
    {
        $default = [
            'intent' => 'lainnya',
            'rewritten_query' => $message,
            'needs_whatsapp' => false,
            'confidence' => 0.5,
        ];

        $prompt = <<<PROMPT
Kamu bertugas memahami maksud pertanyaan pengunjung website SMA Persis Serang.
Pilih satu intent paling cocok dari daftar:
greeting, thanks, profil, persis, spmb, syarat, biaya, kuota, asrama, program, keunggulan, kontak, daftar, jadwal, lokasi, lainnya.

Tentukan juga:
- rewritten_query: ubah pertanyaan user menjadi pertanyaan lengkap yang jelas
- needs_whatsapp: true jika user meminta nomor WA, ingin daftar, ingin dihubungkan ke panitia, atau informasi butuh konfirmasi terbaru
- confidence: 0 sampai 1

Balas hanya JSON valid (tanpa markdown, tanpa ```).

Contoh:
User: "Berapa harganya?"
Output: {"intent": "biaya", "rewritten_query": "Berapa biaya sekolah dan biaya asrama SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.9}

User: "SPP berapa?"
Output: {"intent": "biaya", "rewritten_query": "Berapa SPP dan biaya sekolah SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.95}

User: "mau daftar"
Output: {"intent": "daftar", "rewritten_query": "Bagaimana cara mendaftar SPMB SMA Persis Serang?", "needs_whatsapp": true, "confidence": 0.95}

User: "nomor wa panitia"
Output: {"intent": "kontak", "rewritten_query": "Nomor WhatsApp panitia SPMB SMA Persis Serang", "needs_whatsapp": true, "confidence": 0.98}

User: "syaratnya apa?"
Output: {"intent": "syarat", "rewritten_query": "Apa saja syarat pendaftaran SPMB SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.9}

User: "ada asrama?"
Output: {"intent": "asrama", "rewritten_query": "Apa saja fasilitas dan program asrama SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.9}

User: "berapa kuotanya?"
Output: {"intent": "kuota", "rewritten_query": "Berapa kuota siswa yang diterima SPMB SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.95}

User: "program unggulannya apa?"
Output: {"intent": "program", "rewritten_query": "Apa saja program unggulan SMA Persis Serang?", "needs_whatsapp": false, "confidence": 0.9}

User: "apa keunggulan sekolah ini?"
Output: {"intent": "keunggulan", "rewritten_query": "Apa keunggulan SMA Persis Serang dibanding sekolah lain?", "needs_whatsapp": false, "confidence": 0.9}

User: "tes"
Output: {"intent": "lainnya", "rewritten_query": "Tes", "needs_whatsapp": false, "confidence": 0.2}
PROMPT;

        try {
            $response = Http::timeout(15)
                ->withToken($this->apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $prompt],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'max_tokens' => 150,
                    'temperature' => 0.3,
                ]);

            if (!$response->successful()) {
                Log::warning('AI intent detection API error', ['status' => $response->status()]);
                return $default;
            }

            $content = trim($response->json('choices.0.message.content'));
            $content = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', $content);
            $parsed = json_decode($content, true);

            if (!is_array($parsed) || empty($parsed['intent'])) {
                Log::warning('AI intent parse failed', ['raw' => $response->json('choices.0.message.content')]);
                return $default;
            }

            return [
                'intent' => $parsed['intent'] ?? 'lainnya',
                'rewritten_query' => $parsed['rewritten_query'] ?? $message,
                'needs_whatsapp' => !empty($parsed['needs_whatsapp']),
                'confidence' => (float) ($parsed['confidence'] ?? 0.5),
            ];
        } catch (\Exception $e) {
            Log::error('AI intent detection exception', ['message' => $e->getMessage()]);
            return $default;
        }
    }

    public function searchFaqByIntent(string $intent, string $originalMessage): \Illuminate\Support\Collection
    {
        // Map intent to FAQ category
        $categoryMap = [
            'profil' => 'Umum',
            'persis' => 'Umum',
            'spmb' => 'SPMB',
            'syarat' => 'SPMB',
            'biaya' => 'Biaya',
            'kuota' => 'SPMB',
            'asrama' => 'Asrama',
            'program' => 'Program',
            'keunggulan' => 'Umum',
            'kontak' => 'Kontak',
            'daftar' => 'SPMB',
            'jadwal' => 'SPMB',
            'lokasi' => 'Umum',
        ];

        $category = $categoryMap[$intent] ?? null;

        if ($category) {
            $faqs = AiFaq::active()
                ->where('category', $category)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->take(5)
                ->get();

            if ($faqs->isNotEmpty()) {
                return $faqs;
            }
        }

        // For "lainnya" intent, try keyword search before AI classification
        if ($intent === 'lainnya') {
            $keywordFaqs = $this->searchRelevantFaqs($originalMessage);
            if ($keywordFaqs->isNotEmpty()) {
                return $keywordFaqs;
            }
        }

        // Fallback to AI-based classification
        return $this->searchRelevantFaqsByAi($originalMessage);
    }

    public function searchRelevantFaqsByAi(string $message, int $limit = 5): \Illuminate\Support\Collection
    {
        $faqs = AiFaq::active()->orderBy('sort_order')->orderBy('id')->get();

        if ($faqs->isEmpty()) {
            return collect();
        }

        // Build a compact numbered list of FAQs for the AI to classify against
        $faqLines = [];
        foreach ($faqs as $i => $faq) {
            $faqLines[] = ($i + 1) . '. [' . $faq->category . '] ' . $faq->question;
        }
        $faqList = implode("\n", $faqLines);

        $classifyPrompt = <<<PROMPT
Kamu adalah asisten klasifikasi pertanyaan untuk SMA Persis Serang.

Berikut daftar FAQ yang tersedia:
{$faqList}

Tugas: pahami MAKSUD pertanyaan user, lalu pilih nomor FAQ yang PALING RELEVAN (maksimal {$limit}).

Aturan:
- Pilih berdasarkan MAKSUD pertanyaan, bukan kata kunci mentah.
- Contoh: "apa keunggulannya", "bedanya apa", "kenapa harus di sini", "apa yang membedakan" → cari FAQ keunggulan/pembeda.
- Contoh: "gratis", "berapa biaya", "free" → cari FAQ biaya.
- Contoh: "gimana cara daftar", "mau daftar", "cara mendaftar" → cari FAQ pendaftaran.
- Contoh: "apa syarat daftar", "syarat pendaftaran" → cari FAQ syarat.
- Contoh: "tes masuk", "tes seleksi" → cari FAQ tes masuk.
- Jangan pilih FAQ yang topiknya berbeda meskipun ada kata yang sama persis.

Balas hanya dengan nomor FAQ dipisah koma. Contoh: 3,7,12
Jika tidak ada yang sesuai, balas: TIDAK ADA
PROMPT;

        try {
            $response = Http::timeout(15)
                ->withToken($this->apiKey)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => $classifyPrompt],
                        ['role' => 'user', 'content' => $message],
                    ],
                    'max_tokens' => 50,
                    'temperature' => 0.3,
                ]);

            if (!$response->successful()) {
                Log::warning('AI FAQ classification API error', [
                    'status' => $response->status(),
                ]);
                return collect();
            }

            $content = trim($response->json('choices.0.message.content'));

            if (strtoupper($content) === 'TIDAK ADA') {
                return collect();
            }

            // Parse comma-separated 1-indexed numbers, map to collection indices
            $indices = [];
            foreach (explode(',', $content) as $part) {
                $num = (int) trim($part);
                if ($num > 0 && $num <= $faqs->count()) {
                    $indices[] = $num - 1;
                }
            }

            $indices = array_slice(array_unique($indices), 0, $limit);

            if (empty($indices)) {
                return collect();
            }

            return collect(array_map(fn($i) => $faqs->get($i), $indices));
        } catch (\Exception $e) {
            Log::error('AI FAQ classification exception', ['message' => $e->getMessage()]);
            return collect();
        }
    }

    public function searchRelevantFaqs(string $message, int $limit = 5)
    {
        $faqs = AiFaq::active()->orderBy('sort_order')->orderBy('id')->get();

        if ($faqs->isEmpty()) {
            return collect();
        }

        $queryTokens = $this->tokenize($message);

        if (empty($queryTokens)) {
            return collect();
        }

        $scored = [];
        foreach ($faqs as $faq) {
            $faqTokens = $this->tokenize($faq->question . ' ' . $faq->category . ' ' . $faq->answer);
            $score = $this->calculateScore($queryTokens, $faqTokens, $faq);
            $scored[] = ['faq' => $faq, 'score' => $score];
        }

        usort($scored, fn($a, $b) => 
            $b['score'] <=> $a['score'] ?: 
            strlen($a['faq']->question) <=> strlen($b['faq']->question)
        );

        $filtered = array_filter($scored, fn($s) => $s['score'] > 0.3);

        return collect(array_slice(array_map(fn($s) => $s['faq'], $filtered), 0, $limit));
    }

    protected function tokenize(string $text): array
    {
        $text = strtolower($text);
        $text = preg_replace('/[^a-z0-9\s]/', ' ', $text);
        $words = preg_split('/\s+/', $text);
        $words = array_filter($words, fn($w) => strlen($w) >= 2);

        $result = [];
        foreach ($words as $word) {
            $normalized = $this->normalize($word);
            if ($normalized !== null) {
                $result[] = $normalized;
            }
        }

        return array_values($result);
    }

    protected function normalize(string $word): ?string
    {
        $word = trim($word);
        if (in_array($word, $this->stopwords, true)) {
            return null;
        }
        foreach ($this->suffixPatterns as $pattern) {
            if (preg_match($pattern, $word, $matches)) {
                $word = $matches[1];
                break;
            }
        }
        if (strlen($word) <= 1) {
            return null;
        }
        return $word;
    }

    protected function calculateScore(array $queryTokens, array $faqTokens, $faq): float
    {
        $queryCount = count($queryTokens);
        if ($queryCount === 0) {
            return 0;
        }

        $exactMatches = 0;
        $stemMatches = 0;

        foreach ($queryTokens as $qToken) {
            $foundExact = false;
            $foundStem = false;
            foreach ($faqTokens as $fToken) {
                if ($qToken === $fToken) {
                    $foundExact = true;
                } elseif (!$foundExact && !$foundStem && strlen($fToken) >= 4 && strlen($qToken) > strlen($fToken) && str_starts_with($qToken, $fToken)) {
                    $foundStem = true;
                }
            }
            if ($foundExact) {
                $exactMatches++;
            } elseif ($foundStem) {
                $stemMatches++;
            }
        }

        $score = ($exactMatches * 2) + ($stemMatches * 1);

        $score /= ($queryCount * 2);

        $faqQuestionTokens = $this->tokenize($faq->question);
        $questionTokenCount = count($faqQuestionTokens);
        if ($questionTokenCount > 0 && $exactMatches > 0) {
            $coverage = $exactMatches / $questionTokenCount;
            $score += $coverage * 0.3;
        }

        $priorityKeywords = [
            'syarat', 'biaya', 'kuota', 'asrama', 'whatsapp', 'wa', 'kontak',
            'daftar', 'gratis', 'free', 'spmb', 'keunggulan', 'program',
            'berkembang', 'informasi', 'daftar', 'pendaftaran',
            'persis', 'persatuan',
        ];

        foreach ($queryTokens as $qToken) {
            if (in_array($qToken, $priorityKeywords, true)) {
                $question = strtolower($faq->question);
                $cleanQuestion = preg_replace('/[^a-z0-9\s]/', ' ', $question);
                $questionWords = preg_split('/\s+/', trim($cleanQuestion));
                foreach ($questionWords as $word) {
                    if ($qToken === $word || str_starts_with($word, $qToken)) {
                        $score += 0.5;
                        break;
                    }
                }
            }
        }

        return $score;
    }

    protected function buildSystemPrompt(array $context, $faqs, array $intent = []): string
    {
        $school = $context['school'] ?? [];
        $year = $context['admission_year'] ?? [];
        $program = $context['admission_program'] ?? [];

        $info = "INFORMASI SEKOLAH:\n";

        if (!empty($school['school_name'])) {
            $info .= "- Nama Sekolah: {$school['school_name']}\n";
        }
        if (!empty($school['tagline'])) {
            $info .= "- Tagline: {$school['tagline']}\n";
        }
        if (!empty($school['description'])) {
            $info .= "- Deskripsi: {$school['description']}\n";
        }
        if (!empty($school['address'])) {
            $info .= "- Alamat: {$school['address']}\n";
        }
        if (!empty($school['city'])) {
            $info .= "- Kota: {$school['city']}\n";
        }
        if (!empty($school['whatsapp_number'])) {
            $info .= "- WhatsApp Panitia: {$school['whatsapp_number']}\n";
        }
        if (!empty($school['email'])) {
            $info .= "- Email: {$school['email']}\n";
        }

        if (!empty($year)) {
            $info .= "\nPENDAFTARAN:\n";
            if (!empty($year['academic_year'])) {
                $info .= "- Tahun Ajaran: {$year['academic_year']}\n";
            }
            if (!empty($year['quota'])) {
                $info .= "- Kuota: {$year['quota']} siswa\n";
            }
            if (!empty($year['start_date'])) {
                $info .= "- Dibuka: {$year['start_date']}\n";
            }
            if (!empty($year['end_date'])) {
                $info .= "- Ditutup: {$year['end_date']}\n";
            }
            if (!empty($year['status'])) {
                $statusLabel = [
                    'draft' => 'Belum dibuka',
                    'open' => 'Dibuka',
                    'almost_full' => 'Hampir penuh',
                    'quota_full' => 'Kuota penuh',
                    'closed' => 'Ditutup',
                    'announcement' => 'Pengumuman',
                ];
                $info .= "- Status: " . ($statusLabel[$year['status']] ?? $year['status']) . "\n";
            }
        }

        if (!empty($program)) {
            $info .= "\nPROGRAM:\n";
            if (!empty($program['name'])) {
                $info .= "- Nama: {$program['name']}\n";
            }
            if (!empty($program['type'])) {
                $typeLabel = [
                    'first_batch_free' => 'Gratis Angkatan Pertama',
                    'regular_paid' => 'Reguler Berbayar',
                    'scholarship' => 'Beasiswa',
                    'subsidy' => 'Subsidi',
                ];
                $info .= "- Tipe: " . ($typeLabel[$program['type']] ?? $program['type']) . "\n";
            }
            if (!empty($program['quota'])) {
                $info .= "- Kuota: {$program['quota']} siswa\n";
            }
            if (!empty($program['description'])) {
                $info .= "- Deskripsi: {$program['description']}\n";
            }
            if (!empty($program['benefits'])) {
                $info .= "- Benefit: {$program['benefits']}\n";
            }
            if (!empty($program['requirements'])) {
                $info .= "- Syarat: {$program['requirements']}\n";
            }
            if (isset($program['is_free_program'])) {
                $info .= "- Program Gratis: " . ($program['is_free_program'] ? 'Ya' : 'Tidak') . "\n";
            }
            if (!empty($program['registration_fee'])) {
                $info .= "- Biaya Pendaftaran: Rp " . number_format($program['registration_fee'], 0, ',', '.') . "\n";
            }
            if (!empty($program['tuition_fee'])) {
                $info .= "- SPP: Rp " . number_format($program['tuition_fee'], 0, ',', '.') . "\n";
            }
            if (!empty($program['boarding_fee'])) {
                $info .= "- Biaya Asrama: Rp " . number_format($program['boarding_fee'], 0, ',', '.') . "\n";
            }
        }

        $info .= "\nLink pendaftaran: " . route('spmb.create');

        $needsWhatsapp = $intent['needs_whatsapp'] ?? false;

        $faqSection = '';
        if ($faqs->isNotEmpty()) {
            $faqSection = "\nKONTEKS FAQ RESMI:\n";
            foreach ($faqs as $j => $faq) {
                $faqSection .= ($j + 1) . ". P: {$faq->question}\n   J: {$faq->answer}\n";
            }
        }

        $waInstruction = $needsWhatsapp
            ? 'User membutuhkan kontak WhatsApp. Tampilkan nomor **089661234569** dan link https://wa.me/6289661234569 jika diminta.'
            : 'Jangan tampilkan nomor atau link WhatsApp. User tidak meminta kontak WhatsApp. Jawab di Chat AI saja.';

        return <<<PROMPT
Kamu adalah asisten Chat AI resmi SMA Persis Serang.
Jawablah seperti admin sekolah yang ramah, sopan, dan membantu.
Gunakan bahasa Indonesia yang natural, tidak terlalu formal, tidak kaku, dan tidak terasa seperti menyalin FAQ.
Jawaban harus singkat, jelas, dan nyaman dibaca di HP.
Mulai jawaban langsung ke inti, tapi tetap ramah.
Jika membuat daftar, gunakan bullet dengan tanda "•".
Jangan gunakan HTML.
Jangan menyebut "berdasarkan FAQ" atau "berdasarkan konteks".

{$waInstruction}

Gunakan jawaban resmi FAQ yang paling relevan.
Jika tidak menemukan FAQ yang cocok, jawab secara umum berdasarkan informasi resmi sekolah dan arahkan ke panitia SPMB.
Jawaban maksimal 2–4 kalimat untuk pertanyaan sederhana. Gunakan bullet hanya jika memang daftar.

Gunakan **tebal** (dua bintang) untuk informasi penting seperti **GRATIS**, **36 siswa**, atau nomor WhatsApp **089661234569** jika muncul.
Jangan mengarang informasi yang belum tersedia.

{$info}
{$faqSection}
PROMPT;
    }
}
