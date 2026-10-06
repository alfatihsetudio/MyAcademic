<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\School;
use Illuminate\Http\Request;

class SchoolController extends Controller
{
    public function index()
    {
        return response()->json(School::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $school = School::create($request->all());
        return response()->json($school, 201);
    }

    public function show($id)
    {
        $school = School::findOrFail($id);
        return response()->json($school);
    }

    public function update(Request $request, $id)
    {
        $school = School::findOrFail($id);
        $school->update($request->all());
        return response()->json($school);
    }

    public function destroy($id)
    {
        $school = School::findOrFail($id);
        $school->delete();
        return response()->json(null, 204);
    }
}