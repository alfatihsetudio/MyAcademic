<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use Illuminate\Http\Request;

class AcademicYearController extends Controller
{
    public function index()
    {
        return response()->json(AcademicYear::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $academicYear = AcademicYear::create($request->all());
        return response()->json($academicYear, 201);
    }

    public function show($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        return response()->json($academicYear);
    }

    public function update(Request $request, $id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->update($request->all());
        return response()->json($academicYear);
    }

    public function destroy($id)
    {
        $academicYear = AcademicYear::findOrFail($id);
        $academicYear->delete();
        return response()->json(null, 204);
    }
}