<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Gradebook;
use App\Models\Grade;

class GradebookController extends Controller
{
    /**
     * Get all grades for a specific gradebook.
     */
    public function show($id)
    {
        $gradebook = Gradebook::findOrFail($id);
        
        $grades = Grade::where('gradebook_id', $gradebook->id)->get();

        return response()->json([
            'gradebook' => $gradebook,
            'grades' => $grades
        ], 200);
    }

    /**
     * Lock grades for a gradebook.
     */
    public function lock(Request $request, $id)
    {
        $gradebook = Gradebook::findOrFail($id);
        
        // Update all grades for this gradebook to be locked
        Grade::where('gradebook_id', $gradebook->id)->update(['is_locked' => true]);

        return response()->json([
            'message' => 'Grades locked successfully for the gradebook.'
        ], 200);
    }

    /**
     * Unlock grades for a gradebook.
     */
    public function unlock(Request $request, $id)
    {
        $gradebook = Gradebook::findOrFail($id);
        
        // Update all grades for this gradebook to be unlocked
        Grade::where('gradebook_id', $gradebook->id)->update(['is_locked' => false]);

        return response()->json([
            'message' => 'Grades unlocked successfully for the gradebook.'
        ], 200);
    }
}
