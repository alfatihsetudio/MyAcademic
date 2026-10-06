<?php

$files = [
    'AssessmentController' => <<<'PHP'
    public function grade(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
    public function submit(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
PHP,
    'ClassController' => <<<'PHP'
    public function enroll(Request $request, $id)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
PHP,
    'TeachingSessionController' => <<<'PHP'
    public function today(Request $request)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
PHP,
    'UserController' => <<<'PHP'
    public function students(Request $request)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
    public function teachers(Request $request)
    {
        return response()->json(['message' => 'Not implemented yet'], 501);
    }
}
PHP
];

foreach ($files as $controller => $newMethods) {
    $path = "c:/laragon/www/myacademic/backend/app/Http/Controllers/Api/V1/$controller.php";
    if (file_exists($path)) {
        $content = file_get_contents($path);
        // Replace the last closing brace with the new methods
        $content = preg_replace('/}\s*$/', "\n" . $newMethods, $content);
        file_put_contents($path, $content);
    }
}
