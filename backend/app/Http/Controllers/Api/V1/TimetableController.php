<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Timetable;
use Illuminate\Http\Request;

class TimetableController extends Controller
{
    public function index()
    {
        return response()->json(Timetable::all());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([]); // Add validation rules as needed
        $timetable = Timetable::create($request->all());
        return response()->json($timetable, 201);
    }

    public function show($id)
    {
        $timetable = Timetable::findOrFail($id);
        return response()->json($timetable);
    }

    public function update(Request $request, $id)
    {
        $timetable = Timetable::findOrFail($id);
        $timetable->update($request->all());
        return response()->json($timetable);
    }

    public function destroy($id)
    {
        $timetable = Timetable::findOrFail($id);
        $timetable->delete();
        return response()->json(null, 204);
    }
}