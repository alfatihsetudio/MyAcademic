<?php
// Script to generate basic CRUD controllers
$controllers = [
    'SchoolController' => 'School',
    'AcademicYearController' => 'AcademicYear',
    'SubjectController' => 'Subject',
    'ClassController' => 'AcademicClass',
    'UserController' => 'User',
    'TimetableController' => 'Timetable',
    'TeachingSessionController' => 'TeachingSession',
    'AssessmentController' => 'Assessment',
];

foreach ($controllers as $controller => $model) {
    $path = "c:/laragon/www/myacademic/backend/app/Http/Controllers/Api/V1/$controller.php";
    $modelVar = '$' . lcfirst($model);
    $content = <<<PHP
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\\$model;
use Illuminate\Http\Request;

class $controller extends Controller
{
    public function index()
    {
        return response()->json($model::all());
    }

    public function store(Request \$request)
    {
        \$validated = \$request->validate([]); // Add validation rules as needed
        $modelVar = $model::create(\$request->all());
        return response()->json($modelVar, 201);
    }

    public function show(\$id)
    {
        $modelVar = $model::findOrFail(\$id);
        return response()->json($modelVar);
    }

    public function update(Request \$request, \$id)
    {
        $modelVar = $model::findOrFail(\$id);
        {$modelVar}->update(\$request->all());
        return response()->json($modelVar);
    }

    public function destroy(\$id)
    {
        $modelVar = $model::findOrFail(\$id);
        {$modelVar}->delete();
        return response()->json(null, 204);
    }
}
PHP;
    file_put_contents($path, $content);
}

// Special controllers with extra methods
$authContent = <<<'PHP'
<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json(['token' => $token, 'user' => $user]);
        }
        return response()->json(['message' => 'Invalid credentials'], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
PHP;
file_put_contents("c:/laragon/www/myacademic/backend/app/Http/Controllers/Api/V1/AuthController.php", $authContent);

$attendanceContent = <<<'PHP'
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
PHP;
file_put_contents("c:/laragon/www/myacademic/backend/app/Http/Controllers/Api/V1/AttendanceController.php", $attendanceContent);
