const fs = require('fs');
const path = require('path');

const gcFile = path.join(__dirname, 'backend/app/Http/Controllers/GradeController.php');
let content = fs.readFileSync(gcFile, 'utf8');

// Replace rekapNilai logic
const newRekapNilai = `
    public function rekapNilai(Request $request)
    {
        $user = Auth::user();
        $schoolId = $user->school_id ?: 1;

        $classIds = $user->classes()->pluck('classes.id')->toArray();
        if ($user->class_id) $classIds[] = $user->class_id;
        $classIds = array_unique($classIds);

        $subjects = \\App\\Models\\Subject::with('academicClass')
            ->whereIn('class_id', $classIds)
            ->orderBy('nama_mapel')
            ->get();

        $selectedSubjectId = (int) $request->query('subject_id', 0);
        $from = $request->query('from', date('Y-m-d', strtotime('-60 days')));
        $to = $request->query('to', date('Y-m-d'));
        
        $academicYearId = (int) $request->query('academic_year_id', 0);
        $semesterId = (int) $request->query('semester_id', 0);

        // Online Submissions
        $onlineQuery = Submission::with(['assignment.subject', 'assignment.academicClass'])
            ->where('student_id', $user->id)
            ->whereNotNull('nilai')
            ->whereBetween(DB::raw('DATE(submitted_at)'), [$from, $to]);

        if ($selectedSubjectId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($selectedSubjectId) {
                $q->where('subject_id', $selectedSubjectId);
            });
        }
        if ($academicYearId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }
        if ($semesterId > 0) {
            $onlineQuery->whereHas('assignment', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }
        $onlineSubmissions = $onlineQuery->orderBy('submitted_at', 'desc')->get();

        // Offline Scores
        $offlineQuery = \\App\\Models\\TabelOfflineScore::with(['task.subject', 'task.academicClass'])
            ->where('student_id', $user->id)
            ->whereNotNull('score')
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to]);

        if ($selectedSubjectId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($selectedSubjectId) {
                $q->where('subject_id', $selectedSubjectId);
            });
        }
        if ($academicYearId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($academicYearId) {
                $q->where('academic_year_id', $academicYearId);
            });
        }
        if ($semesterId > 0) {
            $offlineQuery->whereHas('task', function ($q) use ($semesterId) {
                $q->where('semester_id', $semesterId);
            });
        }
        $offlineScores = $offlineQuery->orderBy('created_at', 'desc')->get();

        // Combined Stats with Deduplication
        $allScores = collect();
        $processedTasks = [];

        foreach ($onlineSubmissions as $sub) {
            $processedTasks['online_'.$sub->assignment_id] = true;
            $allScores->push((float) $sub->nilai);
        }
        foreach ($offlineScores as $off) {
            // Check if online submission already exists for this task (if assignment_id matches task_id)
            // Or just deduplicate based on task_id if they overlap
            if (!isset($processedTasks['online_'.$off->task_id])) {
                $processedTasks['offline_'.$off->task_id] = true;
                $allScores->push((float) $off->score);
            }
        }

        $stats = [
            'total_items' => $allScores->count(),
            'total_score' => $allScores->sum(),
            'average' => $allScores->count() > 0 ? $allScores->average() : null,
            'highest' => $allScores->max(),
            'lowest' => $allScores->min(),
        ];

        return view('grades.rekap_nilai', compact(
            'subjects',
            'selectedSubjectId',
            'from',
            'to',
            'onlineSubmissions',
            'offlineScores',
            'stats',
            'academicYearId',
            'semesterId'
        ));
    }`;

// Replace the function body
content = content.replace(/public function rekapNilai\(Request \$request\)[\s\S]+?\}\s+$/m, newRekapNilai + '\n}\n');

fs.writeFileSync(gcFile, content);
console.log("Patched GradeController.php");
