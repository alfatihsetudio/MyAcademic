<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request, $id)
    {
        $attendance = Attendance::create(array_merge($request->all(), ['teaching_session_id' => $id]));
        return response()->json($attendance, 201);
    }
}