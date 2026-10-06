<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function index()
    {
        return response()->json(Assessment::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $assessment = Assessment::create($request->all());
        return response()->json($assessment, 201);
    }

    public function show($id)
    {
        $assessment = Assessment::findOrFail($id);
        return response()->json($assessment);
    }

    public function update(Request $request, $id)
    {
        $assessment = Assessment::findOrFail($id);
        $assessment->update($request->all());
        return response()->json($assessment);
    }

    public function destroy($id)
    {
        $assessment = Assessment::findOrFail($id);
        $assessment->delete();
        return response()->json(null, 204);
    }

    public function grade(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
    public function submit(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}