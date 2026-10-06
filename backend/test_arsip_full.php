<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\ArsipStudyNote;
use App\Models\ArsipQuizAttempt;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\ArsipBelajarController;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

echo "====================================================\n";
echo "   ARSIP BELAJAR AI FULL VERIFICATION SUITE       \n";
echo "====================================================\n\n";

$passed = 0;
$failed = 0;

function assertTest($description, $condition) {
    global $passed, $failed;
    if ($condition) {
        echo "✅ PASS: {$description}\n";
        $passed++;
    } else {
        echo "❌ FAIL: {$description}\n";
        $failed++;
    }
}

// 1. Database Schema
echo "[Test Group 1: Database Schema]\n";
assertTest("Users table has whatsapp_number", Schema::hasColumn('users', 'whatsapp_number'));
assertTest("Users table has wa_verify_token", Schema::hasColumn('users', 'wa_verify_token'));
assertTest("Users table has wa_status", Schema::hasColumn('users', 'wa_status'));
assertTest("Table arsip_study_notes exists", Schema::hasTable('arsip_study_notes'));
assertTest("Table arsip_quiz_attempts exists", Schema::hasTable('arsip_quiz_attempts'));

// 2. Student User Setup
echo "\n[Test Group 2: Student User Context]\n";
$student = User::whereIn('role', ['murid', 'siswa'])->first();
if (!$student) {
    $student = User::first();
}
assertTest("Student user found: " . ($student ? $student->name : 'None'), $student !== null);

$controller = new ArsipBelajarController();

// 3. WhatsApp Portal: Link & Token Generation
echo "\n[Test Group 3: WhatsApp Linking Portal]\n";
$linkReq = Request::create('/api/arsip-belajar/whatsapp/link', 'POST', [
    'phone_number' => '081234567890',
]);
$linkReq->setUserResolver(fn() => $student);
$linkRes = $controller->linkWa($linkReq);
$linkData = json_decode($linkRes->getContent(), true);

assertTest("linkWa returns success", $linkData['success'] === true);
assertTest("Generated token starts with MYACAD-", str_starts_with($linkData['token'] ?? '', 'MYACAD-'));
assertTest("Phone number normalized to 6281234567890", ($linkData['phone'] ?? '') === '6281234567890');

$token = $linkData['token'];

// 4. WhatsApp Webhook: Token Activation
echo "\n[Test Group 4: WhatsApp Bot Webhook Activation]\n";
$verifyReq = Request::create('/api/arsip-belajar/whatsapp/webhook', 'POST', [
    'action' => 'verify',
    'sender' => '6281234567890',
    'token' => $token,
]);
$verifyRes = $controller->waWebhook($verifyReq);
$verifyData = json_decode($verifyRes->getContent(), true);

assertTest("Webhook verify returns success", ($verifyData['success'] ?? false) === true);

$student->refresh();
assertTest("User status is now verified in DB", $student->wa_status === 'verified');

// 5. WhatsApp Webhook: Inbound Media Note Creation (Base64)
echo "\n[Test Group 5: WhatsApp Inbound Base64 Media Note]\n";
// 1x1 transparent png in base64
$tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
$mediaReq = Request::create('/api/arsip-belajar/whatsapp/webhook', 'POST', [
    'action' => 'create_note',
    'sender' => '6281234567890',
    'title' => 'Catatan Fisika Gelombang',
    'text' => "GELOMBANG ELEKTROMAGNETIK\n\nDEFINISI:\n- Gelombang yang merambat tanpa memerlukan medium.\n- Kecepatan rambat c = 3 x 10^8 m/s.\n\nRUMUS UTAMA:\n- c = lambda * f",
    'media_type' => 'image',
    'media_base64' => $tinyPngBase64,
    'media_mime' => 'image/png',
]);
$mediaRes = $controller->waWebhook($mediaReq);
$mediaData = json_decode($mediaRes->getContent(), true);

assertTest("Webhook create_note with media returns success", ($mediaData['success'] ?? false) === true);
assertTest("Webhook returns saved media_url", !empty($mediaData['media_url']));

$noteId = $mediaData['note_id'] ?? null;
$savedNote = ArsipStudyNote::find($noteId);
assertTest("Note saved in DB with image_urls populated", $savedNote && !empty($savedNote->image_urls));

// 6. WhatsApp Webhook: RAG Chat
echo "\n[Test Group 6: WhatsApp RAG Study Chat]\n";
$chatReq = Request::create('/api/arsip-belajar/whatsapp/webhook', 'POST', [
    'action' => 'rag_chat',
    'sender' => '6281234567890',
    'query' => 'Berapa kecepatan rambat gelombang elektromagnetik?',
]);
$chatRes = $controller->waWebhook($chatReq);
$chatData = json_decode($chatRes->getContent(), true);

assertTest("Webhook rag_chat returns success", ($chatData['success'] ?? false) === true);
assertTest("Webhook rag_chat returns non-empty reply", !empty($chatData['reply']));

// 7. Pillar 1: Executive Summary
echo "\n[Test Group 7: Pilar 1 - Ringkasan Eksekutif]\n";
$summaryReq = Request::create("/api/arsip-belajar/notes/{$noteId}/summary", 'POST');
$summaryReq->setUserResolver(fn() => $student);
$summaryRes = $controller->generateSummary($noteId, $summaryReq);
$summaryData = json_decode($summaryRes->getContent(), true);

assertTest("generateSummary returns success", ($summaryData['success'] ?? false) === true);
assertTest("Summary contains executive content", !empty($summaryData['summary']));

// 8. Pillar 2: Interactive 3D Flashcards
echo "\n[Test Group 8: Pilar 2 - Flashcards 3D Active Recall]\n";
$fcReq = Request::create("/api/arsip-belajar/notes/{$noteId}/flashcards", 'POST');
$fcReq->setUserResolver(fn() => $student);
$fcRes = $controller->generateFlashcards($noteId, $fcReq);
$fcData = json_decode($fcRes->getContent(), true);

assertTest("generateFlashcards returns success", ($fcData['success'] ?? false) === true);
assertTest("Flashcards is array with cards", is_array($fcData['flashcards']) && count($fcData['flashcards']) >= 2);
assertTest("Flashcard item has q and a", isset($fcData['flashcards'][0]['q']) && isset($fcData['flashcards'][0]['a']));

// 9. Pillar 3: Interactive Mind Map
echo "\n[Test Group 9: Pilar 3 - Interactive Visual Mind Map]\n";
$mmReq = Request::create("/api/arsip-belajar/notes/{$noteId}/mindmap", 'POST');
$mmReq->setUserResolver(fn() => $student);
$mmRes = $controller->generateMindmap($noteId, $mmReq);
$mmData = json_decode($mmRes->getContent(), true);

assertTest("generateMindmap returns success", ($mmData['success'] ?? false) === true);
assertTest("Mindmap has root name", !empty($mmData['mindmap']['name']));
assertTest("Mindmap has child nodes", is_array($mmData['mindmap']['children']) && count($mmData['mindmap']['children']) > 0);

// 10. Pillar 4: CBT Exam Simulator Generation & Instant Scoring
echo "\n[Test Group 10: Pilar 4 - CBT Exam Simulator & Instant Scoring]\n";
$quizReq = Request::create("/api/arsip-belajar/quiz/generate", 'POST', [
    'note_id' => $noteId,
    'count' => 3,
    'difficulty' => 'sedang',
]);
$quizReq->setUserResolver(fn() => $student);
$quizRes = $controller->generateQuiz($quizReq);
$quizData = json_decode($quizRes->getContent(), true);

assertTest("generateQuiz returns success", ($quizData['success'] ?? false) === true);
assertTest("Quiz has questions", is_array($quizData['questions']) && count($quizData['questions']) >= 3);

// Test instant scoring with resilient matching
$qList = $quizData['questions'];
$answers = [
    0 => $qList[0]['answer'], // Exact match
    1 => substr($qList[1]['answer'], 0, 1), // Letter match (e.g. 'A')
    2 => 'Jawaban Salah Asal', // Deliberate wrong answer
];

$saveQuizReq = Request::create("/api/arsip-belajar/quiz/save", 'POST', [
    'note_id' => $noteId,
    'title' => 'Simulasi Ujian Gelombang',
    'difficulty' => 'sedang',
    'questions' => $qList,
    'user_answers' => $answers,
]);
$saveQuizReq->setUserResolver(fn() => $student);
$saveQuizRes = $controller->saveQuizResult($saveQuizReq);
$saveQuizData = json_decode($saveQuizRes->getContent(), true);

assertTest("saveQuizResult returns success", ($saveQuizData['success'] ?? false) === true);
assertTest("Resilient scoring recognized 2 correct answers", $saveQuizData['score'] === 2);
assertTest("Score percentage calculated properly (67%)", $saveQuizData['percentage'] === 67);

// 11. CBT History
echo "\n[Test Group 11: CBT History Retrieval]\n";
$histReq = Request::create("/api/arsip-belajar/quiz/history", 'GET');
$histReq->setUserResolver(fn() => $student);
$histRes = $controller->getQuizHistory($histReq);
$histData = json_decode($histRes->getContent(), true);

assertTest("getQuizHistory returns success", ($histData['success'] ?? false) === true);
assertTest("History contains recent attempt", count($histData['history']) > 0);

// 12. Contextual AI Study Chat
echo "\n[Test Group 12: Contextual Grounded Study Chat]\n";
$noteChatReq = Request::create("/api/arsip-belajar/notes/{$noteId}/chat", 'POST', [
    'message' => 'Apa rumus kecepatan rambat?',
    'history' => [],
]);
$noteChatReq->setUserResolver(fn() => $student);
$noteChatRes = $controller->chatWithNote($noteId, $noteChatReq);
$noteChatData = json_decode($noteChatRes->getContent(), true);

assertTest("chatWithNote returns success", ($noteChatData['success'] ?? false) === true);
assertTest("chatWithNote reply is non-empty", !empty($noteChatData['reply']));

// 13. WhatsApp Unlink
echo "\n[Test Group 13: WhatsApp Unlink]\n";
$unlinkReq = Request::create("/api/arsip-belajar/whatsapp/link", 'DELETE');
$unlinkReq->setUserResolver(fn() => $student);
$unlinkRes = $controller->unlinkWa($unlinkReq);
$unlinkData = json_decode($unlinkRes->getContent(), true);

assertTest("unlinkWa returns success", ($unlinkData['success'] ?? false) === true);
$student->refresh();
assertTest("User wa_status reset to unlinked", $student->wa_status === 'unlinked');

echo "\n====================================================\n";
echo "VERIFICATION SUMMARY: {$passed} PASSED, {$failed} FAILED\n";
echo "====================================================\n";

if ($failed > 0) {
    exit(1);
}
exit(0);
