const fs = require('fs');
const path = require('path');

const apiPhpPath = path.join(__dirname, 'backend/routes/api.php');
let content = fs.readFileSync(apiPhpPath, 'utf8');

// Replace the definitions to wrap in auth:sanctum
content = content.replace(
    /\$registerInteractiveRoutes = function \(\) \{/g,
    `$registerInteractiveRoutes = function () {
    Route::post('/login', [AcademicApiController::class, 'login']);
    Route::post('/auth/login', [AcademicApiController::class, 'login']);
    
    Route::middleware('auth:sanctum')->group(function () {`
);

// Do not delete login routes
// content = content.replace(...)

content = content.replace(
    /Route::post\('\/space-belajar\/calendar\/event', \[AcademicApiController::class, 'addCalendarEvent'\]\);\n\};\n/g,
    `Route::post('/space-belajar/calendar/event', [AcademicApiController::class, 'addCalendarEvent']);
    });
};
`
);

fs.writeFileSync(apiPhpPath, content);
console.log("Patched api.php");
