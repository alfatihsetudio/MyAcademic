const fs = require('fs');
const path = require('path');

const usersMig = path.join(__dirname, 'backend/database/migrations/0001_01_01_000000_create_users_table.php');
let uContent = fs.readFileSync(usersMig, 'utf8');

uContent = uContent.replace(/->constrained\('schools'\)->cascadeOnDelete\(\)/g, '');
uContent = uContent.replace(/->constrained\('classes'\)->cascadeOnDelete\(\)/g, '');

fs.writeFileSync(usersMig, uContent);
console.log("Fixed users migration");
