<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArsipQuizAttempt;
use App\Models\ArsipStudyNote;
use App\Models\StudyFolder;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ArsipBelajarController extends Controller
{
    /**
     * Get the student user
     */
    protected function getStudent(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            $user = User::whereIn('role', ['murid', 'siswa'])->first() ?: User::first();
        }
        return $user;
    }

    /**
     * Helper to call Google Gemini API
     */
    protected function callGemini(array $contents, ?string $systemInstruction = null, ?array $generationConfig = null)
    {
        $apiKey = env('GEMINI_API_KEY') ?: config('services.gemini.key');
        if (!$apiKey) {
            return [
                'success' => false,
                'error' => 'GEMINI_API_KEY belum dikonfigurasi di file .env backend.',
            ];
        }

        $models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];
        $lastError = 'Gagal menghubungi Gemini API';

        foreach ($models as $model) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
            
            $payload = [
                'contents' => $contents,
            ];

            if ($systemInstruction) {
                $payload['systemInstruction'] = [
                    'parts' => [['text' => $systemInstruction]],
                ];
            }

            if ($generationConfig) {
                $payload['generationConfig'] = $generationConfig;
            }

            try {
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                ])->timeout(60)->post($url, $payload);

                if ($response->successful()) {
                    $json = $response->json();
                    $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? '';
                    return [
                        'success' => true,
                        'text' => trim($text),
                        'model' => $model,
                    ];
                }

                $errBody = $response->json();
                $lastError = $errBody['error']['message'] ?? "HTTP {$response->status()} dari model {$model}";
                Log::warning("Gemini call failed with {$model}: " . $lastError);
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
                Log::warning("Gemini exception with {$model}: " . $lastError);
            }
        }

        return [
            'success' => false,
            'error' => $lastError,
        ];
    }

    /**
     * Helper to clean JSON markdown wrappers
     */
    protected function cleanJsonString(string $raw): string
    {
        $cleaned = trim($raw);
        if (preg_match('/```(?:json)?\s*([\s\S]*?)\s*```/i', $cleaned, $matches)) {
            $cleaned = trim($matches[1]);
        }
        if (preg_match('/(\[[\s\S]*\]|\{[\s\S]*\})/s', $cleaned, $matches)) {
            return trim($matches[1]);
        }
        return $cleaned;
    }

    // ==========================================
    // 1. NOTES CRUD & MULTIMODAL SYNTHESIS
    // ==========================================

    /**
     * List all study archive notes for student
     */
    public function index(Request $request)
    {
        $user = $this->getStudent($request);
        $query = ArsipStudyNote::with('folder')->where('user_id', $user->id);

        if ($request->filled('folder_id')) {
            $query->where('folder_id', $request->folder_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('transcribed_text', 'like', "%{$search}%");
            });
        }

        // Sorting options
        $sortBy = $request->get('sort_by', 'date_desc');
        if ($sortBy === 'date_asc') {
            $query->orderBy('created_at', 'asc');
        } elseif ($sortBy === 'title_asc') {
            $query->orderBy('title', 'asc');
        } elseif ($sortBy === 'title_desc') {
            $query->orderBy('title', 'desc');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $notes = $query->get();

        // Get folders for organization with notes count
        $folders = StudyFolder::where('user_id', $user->id)
            ->withCount('arsipNotes')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'notes' => $notes,
            'folders' => $folders,
        ]);
    }

    /**
     * Create a new folder for study notes
     */
    public function createFolder(Request $request)
    {
        $user = $this->getStudent($request);
        $request->validate([
            'name' => 'required|string|max:100',
        ]);

        $folder = StudyFolder::create([
            'user_id' => $user->id,
            'name' => trim($request->name),
        ]);

        return response()->json([
            'success' => true,
            'folder' => $folder,
            'message' => 'Folder berhasil dibuat',
        ]);
    }

    /**
     * Delete a folder
     */
    public function deleteFolder($id, Request $request)
    {
        $user = $this->getStudent($request);
        $folder = StudyFolder::where('user_id', $user->id)->findOrFail($id);

        // Unlink notes
        ArsipStudyNote::where('folder_id', $folder->id)->update(['folder_id' => null]);
        $folder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Folder berhasil dihapus',
        ]);
    }

    /**
     * Update note folder
     */
    public function moveNoteFolder(Request $request, $id)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);
        
        $folderId = $request->folder_id ? (int)$request->folder_id : null;
        if ($folderId) {
            $folderExists = StudyFolder::where('user_id', $user->id)->where('id', $folderId)->exists();
            if (!$folderExists) {
                return response()->json(['success' => false, 'error' => 'Folder tidak ditemukan'], 404);
            }
        }

        $note->folder_id = $folderId;
        $note->save();

        return response()->json([
            'success' => true,
            'note' => $note->load('folder'),
            'message' => 'Folder catatan berhasil diperbarui',
        ]);
    }

    /**
     * Show single study note
     */
    public function show($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        return response()->json([
            'success' => true,
            'note' => $note,
        ]);
    }

    /**
     * Multimodal Store & Synthesis (Photo + Audio + Text Notes)
     */
    public function store(Request $request)
    {
        $user = $this->getStudent($request);

        $request->validate([
            'title' => 'nullable|string|max:200',
            'folder_id' => 'nullable|integer',
            'note_text' => 'nullable|string',
            'images.*' => 'nullable|image|max:15360', // 15MB each
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,m4a,webm,aac|max:30720', // 30MB
            'merge_strategy' => 'nullable|string|in:gabung,pisah',
        ]);

        $imageUrls = [];
        $geminiParts = [];

        // Save and encode Images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('arsip_belajar/images', 'public');
                $url = Storage::url($path);
                $imageUrls[] = asset($url);

                $mimeType = $file->getMimeType() ?: 'image/jpeg';
                $base64 = base64_encode(file_get_contents($file->getRealPath()));
                $geminiParts[] = [
                    'inlineData' => [
                        'mimeType' => $mimeType,
                        'data' => $base64,
                    ],
                ];
            }
        }

        // Save and encode Audio
        $audioUrl = null;
        if ($request->hasFile('audio')) {
            $audioFile = $request->file('audio');
            $path = $audioFile->store('arsip_belajar/audio', 'public');
            $audioUrl = asset(Storage::url($path));

            $mimeType = $audioFile->getMimeType() ?: 'audio/mp3';
            if (str_contains($mimeType, 'webm')) {
                $mimeType = 'audio/webm';
            } elseif (str_contains($mimeType, 'ogg')) {
                $mimeType = 'audio/ogg';
            } elseif (str_contains($mimeType, 'wav')) {
                $mimeType = 'audio/wav';
            } elseif (str_contains($mimeType, 'mp4') || str_contains($mimeType, 'm4a') || str_starts_with($mimeType, 'video/')) {
                $mimeType = 'audio/mp4';
            }
            $base64 = base64_encode(file_get_contents($audioFile->getRealPath()));
            $geminiParts[] = [
                'inlineData' => [
                    'mimeType' => $mimeType,
                    'data' => $base64,
                ],
            ];
        }

        $noteText = $request->input('note_text', '');
        $userTitle = $request->input('title');
        $folderId = $request->input('folder_id');
        $mergeStrategy = $request->input('merge_strategy', 'gabung');

        // Check if no inputs at all
        if (empty($geminiParts) && empty($noteText)) {
            return response()->json([
                'success' => false,
                'message' => 'Harap sediakan minimal satu media (foto papan tulis / audio guru) atau catatan teks.',
            ], 422);
        }

        // Prepare Prompt for Gemini Multimodal Synthesis
        $prompt = "Anda adalah asisten sintesis catatan edukasi ahli untuk siswa sekolah/kuliah.\n";
        $prompt .= "TUGAS UTAMA: Analisis semua media yang dilampirkan (foto coretan papan tulis, rekaman audio suara guru/dosen, serta catatan teks dari siswa) dan gabungkan menjadi SATU CATATAN MATERI TERSTRUKTUR yang komprehensif, rapi, dan mudah dipelajari kembali.\n\n";
        $prompt .= "ATURAN FORMAT & STRUKTUR:\n";
        $prompt .= "1. Tulis dalam BAHASA ASLI media tersebut (Bahasa Indonesia jika Indonesia, Inggris jika Inggris).\n";
        $prompt .= "2. Format dalam teks biasa (PLAIN TEXT) yang rapi. Hindari simbol markdown berat (JANGAN gunakan #, ##, ###, **, *, _, atau tabel markdown markdown).\n";
        $prompt .= "3. Gunakan HURUF BESAR (UPPERCASE) di baris tersendiri untuk setiap Topik Utama atau Sub-judul.\n";
        $prompt .= "4. Gunakan tanda strip (- teks) untuk daftar poin penting dan contoh.\n";
        $prompt .= "5. Tuliskan rumus, definisi, istilah kunci, dan alur konsep tanpa ada yang terlewat.\n";
        if (!empty($noteText)) {
            $prompt .= "\nCATATAN TEKS TAMBAHAN DARI SISWA:\n\"\"\"\n{$noteText}\n\"\"\"\n";
        }
        $prompt .= "\nDi baris paling pertama, berikan judul materi singkat (1-4 kata) dengan format persis:\nJUDUL: [Judul Materi]\nLalu baris berikutnya isi catatan terstruktur.";

        $geminiParts[] = ['text' => $prompt];

        // Call Gemini
        $geminiResult = $this->callGemini([
            ['parts' => $geminiParts],
        ]);

        $structuredText = '';
        $finalTitle = $userTitle ?: 'Catatan Materi Baru';

        if ($geminiResult['success']) {
            $rawText = $geminiResult['text'];
            if (preg_match('/^JUDUL:\s*(.*)/im', $rawText, $matches)) {
                if (empty($userTitle)) {
                    $finalTitle = trim($matches[1]);
                }
                $structuredText = trim(preg_replace('/^JUDUL:\s*.*\n*/i', '', $rawText));
            } else {
                $structuredText = $rawText;
            }
        } else {
            // Fallback synthesiser if API key not provided or offline
            $structuredText = "RINGKASAN MATERI DAN CATATAN BELAJAR\n\n";
            $structuredText .= "TOPIK UTAMA:\n";
            $structuredText .= "- Materi telah diarsipkan ke dalam Space Belajar Anda.\n";
            if (!empty($noteText)) {
                $structuredText .= "\nCATATAN KETIKAN SISWA:\n" . $noteText . "\n";
            }
            if (!empty($imageUrls)) {
                $structuredText .= "\nLAMPIRAN FOTO PAPAN TULIS:\n- Terdapat " . count($imageUrls) . " foto papan tulis yang telah tersimpan rapi.\n";
            }
            if ($audioUrl) {
                $structuredText .= "\nREKAMAN SUARA GURU:\n- Audio rekaman penjelasan guru tersimpan dan siap diputar kembali.\n";
            }
            $structuredText .= "\n(Catatan: Untuk mengaktifkan sintesis AI otomatis mendalam dari foto & suara guru secara langsung, pastikan GEMINI_API_KEY telah diisi di sistem).";
        }

        // Auto-generate tags
        $tags = ['materi', 'catatan-belajar'];
        if (preg_match_all('/([A-Z]{3,})/u', $structuredText, $upperMatches)) {
            $found = array_unique(array_slice($upperMatches[1], 0, 3));
            foreach ($found as $t) {
                $tags[] = strtolower($t);
            }
        }
        $tags = array_values(array_unique($tags));

        // Create Note in DB
        $note = ArsipStudyNote::create([
            'user_id' => $user->id,
            'folder_id' => $folderId ?: null,
            'title' => $finalTitle,
            'transcribed_text' => $structuredText,
            'summary' => null, // will be generated on demand or auto
            'flashcards' => null,
            'mindmap' => null,
            'tags' => $tags,
            'image_urls' => !empty($imageUrls) ? $imageUrls : null,
            'audio_url' => $audioUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil disintesis dan disimpan ke Arsip Belajar!',
            'note' => $note,
            'ai_status' => $geminiResult['success'] ? 'connected' : 'fallback',
            'ai_warning' => $geminiResult['success'] ? null : ($geminiResult['error'] ?? null),
        ]);
    }

    /**
     * Update study note
     */
    public function update($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'title' => 'sometimes|required|string|max:200',
            'transcribed_text' => 'sometimes|required|string',
            'summary' => 'nullable|string',
            'folder_id' => 'nullable|integer',
        ]);

        $note->update($request->only(['title', 'transcribed_text', 'summary', 'folder_id']));

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil diperbarui.',
            'note' => $note,
        ]);
    }

    /**
     * Delete study note
     */
    public function destroy($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);
        $note->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catatan berhasil dihapus.',
        ]);
    }

    // ==========================================
    // 2. PILAR 1: RINGKASAN EKSEKUTIF (SUMMARY)
    // ==========================================

    public function generateSummary($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        if (empty(trim($note->transcribed_text))) {
            return response()->json(['success' => false, 'error' => 'Isi catatan kosong.'], 400);
        }

        $prompt = "Anda adalah perancang kurikulum dan edukasi tingkat tinggi.\n";
        $prompt .= "TUGAS: Analisis materi catatan berikut dan buatkan RINGKASAN EKSEKUTIF (Executive Summary) yang sangat tajam, fokus pada esensi pemahaman konsep inti, hukum/rumus penting, serta kesimpulan praktis yang harus diingat siswa.\n\n";
        $prompt .= "ATURAN FORMAT:\n";
        $prompt .= "- Gunakan bahasa Indonesia yang lugas dan mengalir.\n";
        $prompt .= "- Tulis dalam PLAIN TEXT tanpa simbol markdown (*, **, #, _, tabel).\n";
        $prompt .= "- Gunakan HURUF KAPITAL untuk sub-judul (contoh: INTI PEMBAHASAN, FORMULA KUNCI, KESIMPULAN).\n";
        $prompt .= "- Gunakan tanda strip (- ) untuk poin-poin penting.\n\n";
        $prompt .= "MATERI CATATAN:\n" . $note->transcribed_text;

        $res = $this->callGemini([
            ['parts' => [['text' => $prompt]]],
        ]);

        if ($res['success']) {
            $summary = $res['text'];
        } else {
            // Realistic heuristic summary fallback
            $lines = array_filter(explode("\n", $note->transcribed_text));
            $summary = "RINGKASAN EKSEKUTIF:\n\nINTI PEMBAHASAN:\n- " . ($note->title ?: 'Materi Belajar') . " mencakup konsep-konsep kunci yang perlu dipahami secara mendalam.\n";
            $summary .= "\nPOIN KUNCI:\n";
            $count = 0;
            foreach ($lines as $line) {
                $trimmed = trim($line, " -\t\r\n");
                if (strlen($trimmed) > 15 && $count < 4) {
                    $summary .= "- " . $trimmed . "\n";
                    $count++;
                }
            }
            $summary .= "\nKESIMPULAN:\n- Kuasai definisi dan penerapan latihan soal terkait untuk persiapan evaluasi mendatang.";
        }

        $note->update(['summary' => $summary]);

        return response()->json([
            'success' => true,
            'summary' => $summary,
            'ai_warning' => $res['success'] ? null : ($res['error'] ?? null),
        ]);
    }

    // ==========================================
    // 3. PILAR 2: FLASHCARDS INTERAKTIF
    // ==========================================

    public function generateFlashcards($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        if (empty(trim($note->transcribed_text))) {
            return response()->json(['success' => false, 'error' => 'Isi catatan kosong.'], 400);
        }

        $prompt = "Anda adalah asisten edukasi ahli active recall.\n";
        $prompt .= "Berdasarkan materi catatan di bawah ini, buatlah 5 sampai 8 kartu flashcard (kartu tanya-jawab bolak-balik) yang sangat efektif untuk melatih hafalan dan pemahaman siswa.\n\n";
        $prompt .= "Format output WAJIB HANYA berupa JSON string array objek murni tanpa pembungkus markdown (tidak ada ```json):\n";
        $prompt .= "[\n  {\"q\": \"Pertanyaan konsep 1?\", \"a\": \"Jawaban ringkas dan padat 1\"},\n  {\"q\": \"Pertanyaan rumus 2?\", \"a\": \"Jawaban ringkas dan padat 2\"}\n]\n\n";
        $prompt .= "MATERI CATATAN:\n" . $note->transcribed_text;

        $res = $this->callGemini([
            ['parts' => [['text' => $prompt]]],
        ]);

        $flashcards = [];
        if ($res['success']) {
            $cleaned = $this->cleanJsonString($res['text']);
            $decoded = json_decode($cleaned, true);
            if (is_array($decoded)) {
                $flashcards = $decoded;
            }
        }

        // Fallback flashcards if Gemini not connected or parsing failed
        if (empty($flashcards)) {
            $flashcards = [
                ['q' => "Apa topik utama yang dibahas dalam {$note->title}?", 'a' => "Materi ini membahas fondasi penting mengenai " . Str::limit($note->transcribed_text, 80)],
                ['q' => "Mengapa konsep ini penting untuk dipahami?", 'a' => "Konsep ini merupakan pilar esensial dalam mata pelajaran untuk menyelesaikan persoalan analitis."],
                ['q' => "Sebutkan poin penting pertama dari catatan ini!", 'a' => "Poin penting mencakup pemahaman konsep dasar, terminologi, dan penerapannya."],
                ['q' => "Bagaimana cara menguji pemahaman terhadap topik ini?", 'a' => "Dengan berlatih soal CBT Mandiri dan mengulang flashcard secara berkala."],
            ];
        }

        $note->update(['flashcards' => $flashcards]);

        return response()->json([
            'success' => true,
            'flashcards' => $flashcards,
            'ai_warning' => $res['success'] ? null : ($res['error'] ?? null),
        ]);
    }

    // ==========================================
    // 4. PILAR 3: INTERACTIVE MIND MAP
    // ==========================================

    public function generateMindmap($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        if (empty(trim($note->transcribed_text))) {
            return response()->json(['success' => false, 'error' => 'Isi catatan kosong.'], 400);
        }

        $prompt = "Anda adalah desainer kurikulum edukasi visual.\n";
        $prompt .= "Ubah catatan materi pelajaran di bawah ini menjadi struktur Peta Pikiran (Mind Map) pohon konsep hierarkis logis untuk membantu siswa memvisualisasikan keterkaitan materi.\n\n";
        $prompt .= "Format output WAJIB HANYA berupa JSON objek murni tanpa markdown (tidak ada ```json):\n";
        $prompt .= "{\n  \"name\": \"Topik Utama\",\n  \"children\": [\n    {\n      \"name\": \"Konsep Penting 1\",\n      \"children\": [\n        {\"name\": \"Detail 1.1\"},\n        {\"name\": \"Detail 1.2\"}\n      ]\n    },\n    {\n      \"name\": \"Konsep Penting 2\",\n      \"children\": [\n        {\"name\": \"Detail 2.1\"}\n      ]\n    }\n  ]\n}\n\n";
        $prompt .= "ATURAN:\n- Kedalaman hierarki maksimal 3 tingkat (Root -> Anak -> Cucu).\n- Setiap nama node singkat (maksimal 4-6 kata).\n\n";
        $prompt .= "MATERI CATATAN:\n" . $note->transcribed_text;

        $res = $this->callGemini([
            ['parts' => [['text' => $prompt]]],
        ]);

        $mindmap = null;
        if ($res['success']) {
            $cleaned = $this->cleanJsonString($res['text']);
            $decoded = json_decode($cleaned, true);
            if (is_array($decoded) && isset($decoded['name'])) {
                $mindmap = $decoded;
            }
        }

        // Fallback mind map if offline/error
        if (!$mindmap) {
            $mindmap = [
                'name' => $note->title ?: 'Konsep Materi',
                'children' => [
                    [
                        'name' => 'Dasar & Definisi',
                        'children' => [
                            ['name' => 'Pengertian Utama'],
                            ['name' => 'Ruang Lingkup'],
                        ],
                    ],
                    [
                        'name' => 'Prinsip & Formula',
                        'children' => [
                            ['name' => 'Hukum Dasar'],
                            ['name' => 'Contoh Kasus'],
                        ],
                    ],
                    [
                        'name' => 'Aplikasi & Evaluasi',
                        'children' => [
                            ['name' => 'Studi Kasus Nyata'],
                            ['name' => 'Latihan Soal Ujian'],
                        ],
                    ],
                ],
            ];
        }

        $note->update(['mindmap' => $mindmap]);

        return response()->json([
            'success' => true,
            'mindmap' => $mindmap,
            'ai_warning' => $res['success'] ? null : ($res['error'] ?? null),
        ]);
    }

    // ==========================================
    // 5. PILAR 4: SIMULATOR KUIS / UJIAN CBT MANDIRI
    // ==========================================

    public function generateQuiz(Request $request)
    {
        $user = $this->getStudent($request);

        $request->validate([
            'note_id' => 'nullable|integer',
            'note_ids' => 'nullable|array',
            'count' => 'nullable|integer|min:3|max:15',
            'difficulty' => 'nullable|string|in:mudah,sedang,sulit',
        ]);

        $count = $request->input('count', 5);
        $difficulty = $request->input('difficulty', 'sedang');
        $noteId = $request->input('note_id');
        $noteIds = $request->input('note_ids');

        $notesQuery = ArsipStudyNote::where('user_id', $user->id);
        if ($noteId) {
            $notesQuery->where('id', $noteId);
        } elseif (!empty($noteIds)) {
            $notesQuery->whereIn('id', $noteIds);
        } else {
            // Default: pick the latest note
            $notesQuery->orderBy('created_at', 'desc')->limit(1);
        }

        $notes = $notesQuery->get();
        if ($notes->isEmpty()) {
            return response()->json(['success' => false, 'error' => 'Catatan tidak ditemukan untuk membuat kuis.'], 404);
        }

        $combinedText = $notes->map(fn($n) => "JUDUL: {$n->title}\n" . $n->transcribed_text)->join("\n\n---\n\n");
        $topicSummary = $notes->first()->title;

        $diffDesc = match ($difficulty) {
            'mudah' => 'Tingkat Mudah (definisi langsung, fakta dasar, ingatan cepat)',
            'sulit' => 'Tingkat Sulit (analisis mendalam, studi kasus kompleks, pemecahan masalah bertingkat)',
            default => 'Tingkat Sedang (pemahaman konsep, relasi sebab-akibat, aplikasi rumus)',
        };

        $prompt = "Anda adalah pembuat soal ujian CBT (Computer Based Test) akademis.\n";
        $prompt .= "Buatkan persis {$count} butir soal pilihan ganda berdasarkan materi catatan di bawah ini.\n";
        $prompt .= "Tingkat Kesulitan: {$diffDesc}.\n\n";
        $prompt .= "Format output WAJIB HANYA berupa JSON string murni tanpa pembungkus markdown:\n";
        $prompt .= "{\n";
        $prompt .= "  \"topicSummary\": \"{$topicSummary}\",\n";
        $prompt .= "  \"questions\": [\n";
        $prompt .= "    {\n";
        $prompt .= "      \"question\": \"Teks pertanyaan yang jelas dan tidak ambigu?\",\n";
        $prompt .= "      \"options\": [\"A. Pilihan satu\", \"B. Pilihan dua\", \"C. Pilihan tiga\", \"D. Pilihan empat\"],\n";
        $prompt .= "      \"answer\": \"A. Pilihan satu\"\n";
        $prompt .= "    }\n";
        $prompt .= "  ]\n";
        $prompt .= "}\n\n";
        $prompt .= "ATURAN WAJIB:\n";
        $prompt .= "- Setiap pertanyaan HARUS memiliki persis 4 opsi pilihan berlabel A, B, C, D.\n";
        $prompt .= "- Kolom 'answer' HARUS sama persis dengan salah satu opsi (termasuk label A/B/C/D).\n";
        $prompt .= "- Soal harus relevan dengan materi yang disediakan.\n\n";
        $prompt .= "MATERI KUIS:\n" . $combinedText;

        $res = $this->callGemini([
            ['parts' => [['text' => $prompt]]],
        ]);

        $quizData = null;
        if ($res['success']) {
            $cleaned = $this->cleanJsonString($res['text']);
            $decoded = json_decode($cleaned, true);
            if (is_array($decoded) && isset($decoded['questions']) && is_array($decoded['questions'])) {
                $quizData = $decoded;
            }
        }

        // Heuristic fallback questions if offline or Gemini not configured
        if (!$quizData) {
            $quizData = [
                'topicSummary' => $topicSummary,
                'questions' => [
                    [
                        'question' => "Berdasarkan materi {$topicSummary}, apa konsep paling mendasar yang perlu dipahami terlebih dahulu?",
                        'options' => [
                            'A. Teori dan definisi dasar materi',
                            'B. Penghafalan rumus tanpa pemahaman',
                            'C. Menghindari evaluasi pemahaman',
                            'D. Melewati bab awal ke bab lanjut',
                        ],
                        'answer' => 'A. Teori dan definisi dasar materi',
                    ],
                    [
                        'question' => "Manakah di bawah ini metode terbaik untuk mempertahankan pemahaman jangka panjang?",
                        'options' => [
                            'A. Belajar sistem kebut semalam',
                            'B. Active recall menggunakan Flashcard & Kuis Mandiri',
                            'C. Hanya membaca sekilas tanpa catatan',
                            'D. Menghafal urutan jawaban',
                        ],
                        'answer' => 'B. Active recall menggunakan Flashcard & Kuis Mandiri',
                    ],
                    [
                        'question' => "Bagaimana hubungan antara konsep utama materi dengan aplikasinya dalam ujian?",
                        'options' => [
                            'A. Tidak memiliki korelasi',
                            'B. Konsep utama mendasari variasi soal terapan',
                            'C. Hanya diuji pada soal hafalan',
                            'D. Seluruh soal bertolak belakang dengan materi',
                        ],
                        'answer' => 'B. Konsep utama mendasari variasi soal terapan',
                    ],
                ],
            ];
        }

        return response()->json([
            'success' => true,
            'topicSummary' => $quizData['topicSummary'] ?? $topicSummary,
            'questions' => $quizData['questions'],
            'difficulty' => $difficulty,
            'note_id' => $noteId,
            'ai_warning' => $res['success'] ? null : ($res['error'] ?? null),
        ]);
    }

    /**
     * Submit and record CBT Quiz Simulator result
     */
    public function saveQuizResult(Request $request)
    {
        $user = $this->getStudent($request);

        $request->validate([
            'note_id' => 'nullable|integer',
            'title' => 'nullable|string',
            'difficulty' => 'nullable|string',
            'questions' => 'required|array',
            'user_answers' => 'required|array',
        ]);

        $questions = $request->questions;
        $userAnswers = $request->user_answers;
        $total = count($questions);
        $correct = 0;

        foreach ($questions as $idx => $q) {
            $studentAns = trim((string)($userAnswers[$idx] ?? ''));
            $correctAnswer = trim((string)(is_array($q) ? ($q['answer'] ?? '') : ($q->answer ?? '')));
            $isMatch = false;
            if (!empty($studentAns) && !empty($correctAnswer)) {
                if (strcasecmp($studentAns, $correctAnswer) === 0) {
                    $isMatch = true;
                } else {
                    $studentLetter = strtoupper(substr($studentAns, 0, 1));
                    $correctLetter = strtoupper(substr($correctAnswer, 0, 1));
                    if (in_array($studentLetter, ['A', 'B', 'C', 'D']) && $studentLetter === $correctLetter) {
                        $isMatch = true;
                    }
                }
            }
            if ($isMatch) {
                $correct++;
            }
        }

        $percentage = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

        $attempt = ArsipQuizAttempt::create([
            'user_id' => $user->id,
            'note_id' => $request->note_id ?: null,
            'title' => $request->title ?: 'Simulator Ujian Mandiri',
            'difficulty' => $request->difficulty ?: 'sedang',
            'score' => $correct,
            'total_questions' => $total,
            'percentage' => $percentage,
            'questions_data' => $questions,
            'user_answers' => $userAnswers,
        ]);

        $feedback = match (true) {
            $percentage >= 90 => 'Luar biasa! Pemahaman Anda terhadap materi ini sudah sempurna (A+).',
            $percentage >= 75 => 'Sangat bagus! Anda menguasai sebagian besar materi dengan baik.',
            $percentage >= 60 => 'Cukup baik! Disarankan mereview flashcard untuk memperdalam poin yang keliru.',
            default => 'Perlu pengulangan. Manfaatkan fitur Tanya Catatan AI dan peta pikiran untuk memperkuat konsep dasar.',
        };

        return response()->json([
            'success' => true,
            'attempt' => $attempt,
            'score' => $correct,
            'total' => $total,
            'percentage' => $percentage,
            'feedback' => $feedback,
        ]);
    }

    /**
     * Get Student's CBT Simulator History
     */
    public function getQuizHistory(Request $request)
    {
        $user = $this->getStudent($request);
        $history = ArsipQuizAttempt::where('user_id', $user->id)
            ->with('note:id,title')
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'history' => $history,
        ]);
    }

    // ==========================================
    // 6. CONTEXTUAL AI STUDY CHAT (GROUNDED RAG)
    // ==========================================

    public function chatWithNote($id, Request $request)
    {
        $user = $this->getStudent($request);
        $note = ArsipStudyNote::where('user_id', $user->id)->findOrFail($id);

        $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);

        $message = $request->input('message');
        $history = $request->input('history', []);

        $historyFormatted = '';
        foreach ($history as $h) {
            $role = ($h['role'] ?? 'user') === 'user' ? 'Siswa' : 'Asisten AI';
            $content = $h['content'] ?? '';
            $historyFormatted .= "{$role}: {$content}\n";
        }

        $prompt = "Anda adalah asisten tutor belajar pribadi yang ramah, cerdas, dan interaktif.\n";
        $prompt .= "TUGAS UTAMA: Jawab pertanyaan siswa HANYA berdasarkan konteks materi catatan berikut ini. Berikan penjelasan yang mudah dipahami anak sekolah/kuliah, beri contoh analogi jika relevan, dan dukung mereka untuk memahami konsepnya.\n\n";
        $prompt .= "ATURAN:\n";
        $prompt .= "- Jawab dalam bahasa Indonesia yang santun dan mengalir.\n";
        $prompt .= "- Jawab dalam plain text yang rapi (hindari simbol markdown berlebihan seperti #, **, tabel).\n";
        $prompt .= "- Jika pertanyaan di luar konteks catatan ini, ingatkan siswa dengan ramah bahwa sesi chat ini khusus untuk mendiskusikan materi '{$note->title}'.\n\n";
        $prompt .= "KONTEKS CATATAN:\n";
        $prompt .= "Judul: {$note->title}\n";
        $prompt .= "Isi Catatan:\n{$note->transcribed_text}\n\n";
        if (!empty($historyFormatted)) {
            $prompt .= "RIWAYAT PERCAKAPAN SEBELUMNYA:\n{$historyFormatted}\n\n";
        }
        $prompt .= "PERTANYAAN SISWA SAAT INI:\n{$message}";

        $res = $this->callGemini([
            ['parts' => [['text' => $prompt]]],
        ]);

        if ($res['success']) {
            $reply = $res['text'];
        } else {
            // Intelligent contextual fallback
            $reply = "Berdasarkan materi \"{$note->title}\", inti pembahasan yang relevan dengan pertanyaan Anda adalah memahami konsep-konsep kunci yang telah dicatat di atas. Silakan pelajari bagian poin utama dan coba simulasikan melalui latihan kuis CBT mandiri.";
        }

        return response()->json([
            'success' => true,
            'reply' => $reply,
            'ai_warning' => $res['success'] ? null : ($res['error'] ?? null),
        ]);
    }

    // ==========================================
    // 7. INTEGRASI WHATSAPP BOT PORTAL
    // ==========================================

    /**
     * Get WhatsApp link status for current student
     */
    public function getWaStatus(Request $request)
    {
        $user = $this->getStudent($request);

        return response()->json([
            'success' => true,
            'status' => $user->wa_status ?: 'unlinked',
            'phone' => $user->whatsapp_number,
            'verify_token' => $user->wa_verify_token,
            'bot_instructions' => [
                'format' => "Aktivasi Akun MyAcademic saya: " . ($user->wa_verify_token ?: 'MYACAD-XXXX'),
                'guide' => "Kirimkan kode token di atas ke bot WhatsApp MyAcademic untuk menghubungkan akun Anda.",
            ],
        ]);
    }

    /**
     * Generate activation token and link phone number
     */
    public function linkWa(Request $request)
    {
        $user = $this->getStudent($request);

        $request->validate([
            'phone_number' => 'required|string|min:8|max:20',
        ]);

        // Normalize phone number (e.g. 0812... -> 62812...)
        $phone = preg_replace('/[^0-9]/', '', $request->phone_number);
        if (str_starts_with($phone, '0')) {
            $phone = '62' . substr($phone, 1);
        }

        // Check if phone number already verified by another user
        $existing = User::where('whatsapp_number', $phone)
            ->where('id', '!=', $user->id)
            ->where('wa_status', 'verified')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor WhatsApp ini telah digunakan oleh akun lain.',
            ], 422);
        }

        // Generate unique token
        $token = 'MYACAD-' . strtoupper(Str::random(5));

        $user->update([
            'whatsapp_number' => $phone,
            'wa_verify_token' => $token,
            'wa_status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kode aktivasi WhatsApp berhasil dibuat!',
            'token' => $token,
            'phone' => $phone,
            'status' => 'pending',
        ]);
    }

    /**
     * Unlink WhatsApp account
     */
    public function unlinkWa(Request $request)
    {
        $user = $this->getStudent($request);

        $user->update([
            'whatsapp_number' => null,
            'wa_verify_token' => null,
            'wa_status' => 'unlinked',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tautan akun WhatsApp berhasil dilepas.',
        ]);
    }

    /**
     * Webhook / API receiver for WhatsApp Bot (Baileys service)
     * Handles verification, inbound media notes, and RAG Q&A
     */
    public function waWebhook(Request $request)
    {
        $action = $request->input('action'); // 'verify', 'create_note', 'rag_chat'
        $sender = $request->input('sender'); // e.g. 628123456789
        $senderNormalized = preg_replace('/[^0-9]/', '', $sender ?? '');

        if ($action === 'verify') {
            $token = trim($request->input('token', ''));
            $user = User::where('wa_verify_token', $token)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token aktivasi tidak ditemukan atau sudah kadaluarsa.',
                ], 404);
            }

            $user->update([
                'whatsapp_number' => $senderNormalized ?: $user->whatsapp_number,
                'wa_verify_token' => null,
                'wa_status' => 'verified',
            ]);

            return response()->json([
                'success' => true,
                'message' => "Selamat, {$user->name}! Akun MyAcademic Anda berhasil terhubung dengan WhatsApp.",
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ]);
        }

        // Check verified user (support both 62 and 0 prefix formats)
        $altSender = str_starts_with($senderNormalized, '62')
            ? ('0' . substr($senderNormalized, 2))
            : (str_starts_with($senderNormalized, '0') ? ('62' . substr($senderNormalized, 1)) : $senderNormalized);

        $user = User::where(function ($q) use ($senderNormalized, $altSender) {
                $q->where('whatsapp_number', $senderNormalized)
                  ->orWhere('whatsapp_number', $altSender);
            })
            ->where('wa_status', 'verified')
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'status' => 'unregistered',
                'message' => 'Nomor Anda belum terdaftar atau belum diverifikasi di MyAcademic. Silakan tautkan nomor di menu Space Belajar -> Arsip Belajar AI.',
            ], 403);
        }

        if ($action === 'create_note') {
            $title = $request->input('title', 'Catatan WhatsApp');
            $text = $request->input('text', '');
            $mediaUrl = $request->input('media_url');
            $mediaType = $request->input('media_type', 'image'); // image or audio

            // Save binary media from base64 if provided by bot daemon
            if ($request->filled('media_base64')) {
                $binary = base64_decode($request->input('media_base64'));
                $mime = $request->input('media_mime', ($mediaType === 'image' ? 'image/jpeg' : 'audio/mp3'));
                $ext = match(true) {
                    str_contains($mime, 'jpeg') || str_contains($mime, 'jpg') => 'jpg',
                    str_contains($mime, 'png') => 'png',
                    str_contains($mime, 'webp') => 'webp',
                    str_contains($mime, 'ogg') => 'ogg',
                    str_contains($mime, 'mp3') || str_contains($mime, 'mpeg') => 'mp3',
                    str_contains($mime, 'm4a') || str_contains($mime, 'mp4') => 'm4a',
                    str_contains($mime, 'webm') => 'webm',
                    default => ($mediaType === 'image' ? 'jpg' : 'mp3')
                };
                $subDir = $mediaType === 'image' ? 'images' : 'audio';
                $filename = 'wa_' . time() . '_' . Str::random(8) . '.' . $ext;
                $filePath = "arsip_belajar/{$subDir}/{$filename}";
                Storage::disk('public')->put($filePath, $binary);
                $mediaUrl = asset(Storage::url($filePath));

                // If text is not provided or just placeholder, attempt Gemini synthesis via backend
                if (empty(trim($text)) || str_starts_with($text, 'Materi dari lampiran')) {
                    $geminiPrompt = "Analisis lampiran {$mediaType} WhatsApp ini secara mendalam. Ekstrak materi pelajaran dan strukturkan menjadi catatan rapi untuk siswa.\nJUDUL: [Judul Singkat]\nLalu isi catatan terstruktur.";
                    $geminiRes = $this->callGemini([[
                        'parts' => [
                            ['inlineData' => ['mimeType' => $mime, 'data' => $request->input('media_base64')]],
                            ['text' => $geminiPrompt]
                        ]
                    ]]);
                    if ($geminiRes['success']) {
                        $rawText = $geminiRes['text'];
                        if (preg_match('/^JUDUL:\s*(.*)/im', $rawText, $m)) {
                            $title = trim($m[1]);
                            $text = trim(preg_replace('/^JUDUL:\s*.*\n*/i', '', $rawText));
                        } else {
                            $text = $rawText;
                        }
                    }
                }
            }

            $imageUrls = ($mediaType === 'image' && $mediaUrl) ? [$mediaUrl] : null;
            $audioUrl = ($mediaType === 'audio' && $mediaUrl) ? $mediaUrl : null;

            $note = ArsipStudyNote::create([
                'user_id' => $user->id,
                'title' => $title,
                'transcribed_text' => $text ?: "Catatan dari lampiran {$mediaType} WhatsApp.",
                'image_urls' => $imageUrls,
                'audio_url' => $audioUrl,
                'tags' => ['whatsapp', 'auto-saved'],
            ]);

            return response()->json([
                'success' => true,
                'message' => "Catatan \"{$title}\" berhasil disimpan ke Space Belajar Anda!",
                'note_id' => $note->id,
                'media_url' => $mediaUrl,
            ]);
        }

        if ($action === 'rag_chat') {
            $query = trim($request->input('query', ''));
            $notes = ArsipStudyNote::where('user_id', $user->id)->orderBy('created_at', 'desc')->limit(6)->get();

            $context = $notes->map(fn($n) => "Judul: {$n->title}\nIsi:\n{$n->transcribed_text}")->join("\n\n---\n\n");

            $prompt = "Kamu adalah asisten AI MyAcademic di WhatsApp. Jawab pertanyaan siswa HANYA berdasarkan catatan materi belajar mereka di bawah ini.\n";
            $prompt .= "ATURAN WAJIB:\n";
            $prompt .= "- Gaya chat WhatsApp: santun, singkat, jelas, tanpa markdown tebal (# atau **).\n";
            $prompt .= "- Gunakan tanda bintang tunggal *tebal* untuk penekanan penting.\n";
            $prompt .= "- Gunakan strip (-) untuk poin.\n\n";
            $prompt .= "KONTEKS CATATAN:\n{$context}\n\n";
            $prompt .= "PERTANYAAN SISWA:\n{$query}";

            $res = $this->callGemini([
                ['parts' => [['text' => $prompt]]],
            ]);

            if ($res['success']) {
                $reply = $res['text'];
            } else {
                // Intelligent fallback matching against student's existing notes
                $matchedNote = null;
                $queryWords = array_filter(explode(' ', strtolower($query)), fn($w) => strlen($w) > 3);
                foreach ($notes as $n) {
                    $haystack = strtolower($n->title . ' ' . $n->transcribed_text);
                    foreach ($queryWords as $word) {
                        if (str_contains($haystack, $word)) {
                            $matchedNote = $n;
                            break 2;
                        }
                    }
                }

                if ($matchedNote) {
                    $reply = "📌 *Terkait materi {$matchedNote->title}:*\n" . Str::limit($matchedNote->transcribed_text, 220) . "\n\n_Buka portal MyAcademic untuk mengakses Flashcard 3D & Kuis CBT materi ini._";
                } elseif ($notes->isNotEmpty()) {
                    $reply = "Halo! Catatan materi terbaru Anda mencakup: *" . $notes->first()->title . "*. Silakan ajukan pertanyaan spesifik tentang materi tersebut atau buka Space Belajar di MyAcademic.";
                } else {
                    $reply = "Belum ada catatan materi di akun Anda. Kirimkan foto catatan papan tulis atau suara rekaman guru ke chat ini untuk memulai!";
                }
            }

            return response()->json([
                'success' => true,
                'reply' => $reply,
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Aksi tidak dikenali.'], 400);
    }
}
