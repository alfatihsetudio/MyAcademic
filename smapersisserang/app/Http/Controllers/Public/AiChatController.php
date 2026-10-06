<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\AdmissionYear;
use App\Models\AiFaq;
use App\Models\SchoolSetting;
use App\Services\OpenAIChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AiChatController extends Controller
{
    protected array $greetings = [
        'halo', 'hallo', 'hai', 'hi', 'hey',
        'assalamualaikum', 'assalamu\'alaikum',
        'salam', 'pagi', 'siang', 'sore', 'malam',
        'tes', 'test',
    ];

    protected array $thanks = [
        'terima kasih', 'terimakasih', 'makasih', 'nuhun', 'thanks', 'thankyou',
    ];

    protected array $stopwords = [
        'apa', 'itu', 'siapa', 'dimana', 'kapan', 'mengapa', 'bagaimana',
        'yang', 'ini', 'itu', 'di', 'ke', 'dari', 'dan', 'atau', 'dengan',
        'tidak', 'ada', 'bisa', 'akan', 'sudah', 'belum', 'apakah', 'saya',
        'kami', 'kita', 'anda', 'dia', 'mereka', 'untuk', 'dalam', 'pada',
        'indonesia', 'sma', 'serang', 'apa', 'itu',
    ];

    protected array $suffixPatterns = [
        '/^(.*)nya$/u',
        '/^(.*)kan$/u',
        '/^(.*)kah$/u',
        '/^(.*)lah$/u',
        '/^(.*)ku$/u',
        '/^(.*)mu$/u',
    ];

    public function send(Request $request, OpenAIChatService $chatService)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:500',
        ]);

        $message = trim($validated['message']);

        if (empty($message)) {
            return response()->json([
                'reply' => 'Silakan ketik pertanyaan Anda.',
            ]);
        }

        if ($this->isGreetingOnly($message)) {
            return response()->json([
                'reply' => 'Halo, selamat datang di layanan Chat AI SMA Persis Serang. Silakan tanyakan seputar SPMB, biaya sekolah, asrama, kuota siswa, syarat pendaftaran, atau program sekolah.',
            ]);
        }

        if ($this->isThankYouOnly($message)) {
            return response()->json([
                'reply' => 'Sama-sama. Jika ada pertanyaan lain seputar SPMB SMA Persis Serang, silakan tanyakan kembali.',
            ]);
        }

        $reply = null;

        // 1. Try OpenAI first (with FAQ context)
        if ($chatService->isConfigured()) {
            $context = $this->buildContext();
            $reply = $chatService->chat($message, $context);
        }

        // 2. Fallback: FAQ matching
        if ($reply === null) {
            Log::info('AI Chat fallback to FAQ', ['message' => $message]);
            $reply = $this->searchFaq($message);
        }

        // 3. Last resort
        if ($reply === null) {
            $reply = 'Maaf, saya tidak dapat menemukan jawaban untuk pertanyaan Anda. Silakan coba bertanya dengan kata kunci lain, atau ketik "mau daftar" jika ingin dihubungkan dengan panitia SPMB.';
        }

        return response()->json([
            'reply' => $reply,
        ]);
    }

    protected function isGreetingOnly(string $message): bool
    {
        $normalized = strtolower(trim($message));
        $normalized = preg_replace('/[^a-zA-Z0-9\s]/', '', $normalized);

        return in_array($normalized, $this->greetings, true);
    }

    protected function isThankYouOnly(string $message): bool
    {
        $normalized = strtolower(trim($message));
        $normalized = preg_replace('/[^a-zA-Z0-9\s]/', '', $normalized);

        return in_array($normalized, $this->thanks, true);
    }

    protected function searchFaq(string $message): ?string
    {
        $faqs = AiFaq::active()->orderBy('sort_order')->orderBy('id')->get();

        if ($faqs->isEmpty()) {
            return null;
        }

        $queryTokens = $this->tokenize($message);

        if (empty($queryTokens)) {
            return null;
        }

        $scored = [];
        foreach ($faqs as $faq) {
            $faqTokens = $this->tokenize($faq->question . ' ' . $faq->category);
            $score = $this->calculateScore($queryTokens, $faqTokens, $faq);
            $scored[] = ['faq' => $faq, 'score' => $score];
        }

        usort($scored, fn($a, $b) => 
            $b['score'] <=> $a['score'] ?: 
            strlen($a['faq']->question) <=> strlen($b['faq']->question)
        );

        $best = $scored[0] ?? null;
        if ($best && $best['score'] > 0.3) {
            return $best['faq']->answer;
        }

        return null;
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
            'informasi', 'pendaftaran',
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

    protected function buildContext(): array
    {
        $schoolSetting = SchoolSetting::current();

        $school = [];
        if ($schoolSetting) {
            $school = [
                'school_name' => $schoolSetting->school_name,
                'tagline' => $schoolSetting->tagline,
                'description' => $schoolSetting->description,
                'address' => $schoolSetting->address,
                'city' => $schoolSetting->city,
                'province' => $schoolSetting->province,
                'whatsapp_number' => $schoolSetting->whatsapp_number,
                'email' => $schoolSetting->email,
            ];
        }

        $currentYear = AdmissionYear::where('is_current', true)->first();
        $year = [];
        if ($currentYear) {
            $year = [
                'name' => $currentYear->name,
                'academic_year' => $currentYear->academic_year,
                'quota' => $currentYear->quota,
                'status' => $currentYear->status,
                'start_date' => $currentYear->start_date?->format('d/m/Y'),
                'end_date' => $currentYear->end_date?->format('d/m/Y'),
            ];
        }

        $currentProgram = $currentYear?->programs()->first();
        $program = [];
        if ($currentProgram) {
            $program = [
                'name' => $currentProgram->name,
                'type' => $currentProgram->type,
                'quota' => $currentProgram->quota,
                'description' => $currentProgram->description,
                'benefits' => $currentProgram->benefits,
                'requirements' => $currentProgram->requirements,
                'is_free_program' => $currentProgram->is_free_program,
                'registration_fee' => $currentProgram->registration_fee,
                'tuition_fee' => $currentProgram->tuition_fee,
                'boarding_fee' => $currentProgram->boarding_fee,
                'meal_fee' => $currentProgram->meal_fee,
                'status' => $currentProgram->status,
            ];
        }

        return [
            'school' => $school,
            'admission_year' => $year,
            'admission_program' => $program,
        ];
    }
}
