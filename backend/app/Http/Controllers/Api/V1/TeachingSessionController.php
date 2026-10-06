<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\TeachingSession;
use Illuminate\Http\Request;

class TeachingSessionController extends Controller
{
    public function index()
    {
        return response()->json(TeachingSession::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $teachingSession = TeachingSession::create($request->all());
        return response()->json($teachingSession, 201);
    }

    public function show($id)
    {
        $teachingSession = TeachingSession::findOrFail($id);
        return response()->json($teachingSession);
    }

    public function update(Request $request, $id)
    {
        $teachingSession = TeachingSession::findOrFail($id);
        $teachingSession->update($request->all());
        return response()->json($teachingSession);
    }

    public function destroy($id)
    {
        $teachingSession = TeachingSession::findOrFail($id);
        $teachingSession->delete();
        return response()->json(null, 204);
    }

    public function today(Request $request)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}