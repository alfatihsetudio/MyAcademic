const fs = require('fs');
const path = require('path');

const apiPath = path.join(__dirname, 'frontend/lib/api.ts');
let content = fs.readFileSync(apiPath, 'utf8');

// Regex to replace simple try-catch blocks returning pseudo-success or null
// We'll replace them with throwing the error so the UI can catch it.
// Actually, it's safer to just modify the catch block to throw the error.

content = content.replace(/catch\s*(?:\([^)]+\))?\s*\{[^}]+\}/g, (match) => {
    // Keep it simple: replace the body of catch with `throw error;`
    if (match.includes('loginUser') || match.includes('return DEFAULT_DASHBOARD')) {
        return match; // maybe keep some specific ones? 
    }
    return `catch (error) { throw error; }`;
});

fs.writeFileSync(apiPath, content);
console.log("Patched api.ts");
