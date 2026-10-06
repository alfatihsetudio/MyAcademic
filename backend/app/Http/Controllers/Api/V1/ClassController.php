<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index()
    {
        return response()->json(AcademicClass::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $academicClass = AcademicClass::create($request->all());
        return response()->json($academicClass, 201);
    }

    public function show($id)
    {
        $academicClass = AcademicClass::findOrFail($id);
        return response()->json($academicClass);
    }

    public function update(Request $request, $id)
    {
        $academicClass = AcademicClass::findOrFail($id);
        $academicClass->update($request->all());
        return response()->json($academicClass);
    }

    public function destroy($id)
    {
        $academicClass = AcademicClass::findOrFail($id);
        $academicClass->delete();
        return response()->json(null, 204);
    }

    public function enroll(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}