<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Exam;
use App\Models\Question;
use App\Models\ExamAttempt;
use App\Models\ExamAnswer;
use App\Models\Grade;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class ExamController extends Controller
{
    /**
     * Create a new exam.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school_id' => 'required|exists:schools,id',
            'title' => 'required|string|max:255',
            'gradebook_id' => 'nullable|exists:gradebooks,id'
        ]);

        $exam = Exam::create($validated);

        return response()->json(['message' => 'Exam created successfully', 'exam' => $exam], 201);
    }

    /**
     * Add a question to an exam.
     */
    public function addQuestion(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);

        $validated = $request->validate([
            'question_text' => 'required|string',
            'correct_answer' => 'required|string',
            'points' => 'nullable|numeric|min:0'
        ]);

        $question = $exam->questions()->create([
            'school_id' => $exam->school_id,
            'question_text' => $validated['question_text'],
            'correct_answer' => $validated['correct_answer'],
            'points' => $validated['points'] ?? 1
        ]);

        return response()->json(['message' => 'Question added successfully', 'question' => $question], 201);
    }

    /**
     * Submit answers for an exam and auto-calculate the score.
     */
    public function submitAnswers(Request $request, $id)
    {
        $exam = Exam::findOrFail($id);
        
        $validated = $request->validate([
            'answers' => 'required|array',
            'answers.*.question_id' => 'required|exists:questions,id',
            'answers.*.answer_text' => 'required|string',
        ]);

        $studentId = Auth::id() ?? $request->input('student_id');

        DB::beginTransaction();
        try {
            $attempt = ExamAttempt::create([
                'school_id' => $exam->school_id,
                'exam_id' => $exam->id,
                'student_id' => $studentId,
            ]);

            // Calculate total points across ALL questions in the exam (not just submitted answers)
            $allExamQuestions = $exam->questions;
            $totalPoints = $allExamQuestions->sum('points');
            if ($totalPoints <= 0) {
                // If question points are 0 or unset, each question counts as 1 point
                $totalPoints = max(1, $allExamQuestions->count());
            }

            $earnedPoints = 0;

            foreach ($validated['answers'] as $ans) {
                $question = Question::findOrFail($ans['question_id']);
                $isCorrect = strtolower(trim($question->correct_answer)) === strtolower(trim($ans['answer_text']));
                $qPoints = $question->points > 0 ? $question->points : 1;
                $pointsAwarded = $isCorrect ? $qPoints : 0;
                
                ExamAnswer::create([
                    'school_id' => $exam->school_id,
                    'exam_attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'answer_text' => $ans['answer_text'],
                    'is_correct' => $isCorrect,
                    'points_awarded' => $pointsAwarded
                ]);

                $earnedPoints += $pointsAwarded;
            }

            // Calculate score (0-100 scale)
            $score = $totalPoints > 0 ? ($earnedPoints / $totalPoints) * 100 : 0;

            // Save to grades table if gradebook is set
            $grade = null;
            if ($exam->gradebook_id) {
                $grade = Grade::updateOrCreate(
                    [
                        'school_id' => $exam->school_id,
                        'gradebook_id' => $exam->gradebook_id,
                        'student_id' => $studentId,
                        'type' => 'exam',
                        'related_id' => $exam->id,
                    ],
                    [
                        'score' => $score,
                    ]
                );
            }

            DB::commit();

            return response()->json([
                'message' => 'Exam submitted successfully', 
                'score' => round($score, 2),
                'earned_points' => $earnedPoints,
                'total_points' => $totalPoints,
                'grade' => $grade
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to submit exam', 'details' => $e->getMessage()], 500);
        }
    }
}
