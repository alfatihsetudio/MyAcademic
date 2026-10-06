const fs = require('fs');
const path = require('path');

const userPhp = path.join(__dirname, 'backend/app/Models/User.php');
let content = fs.readFileSync(userPhp, 'utf8');

content = content.replace(
    /public function isAdmin\(\): bool\s*\{\s*return \$this->role === 'admin';\s*\}/g,
    `public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }`
);
content = content.replace(
    /public function isGuru\(\): bool\s*\{\s*return \$this->role === 'guru';\s*\}/g,
    `public function isGuru(): bool
    {
        return $this->hasRole('guru');
    }`
);
content = content.replace(
    /public function isMurid\(\): bool\s*\{\s*return \$this->role === 'murid' \|\| \$this->role === 'siswa';\s*\}/g,
    `public function isMurid(): bool
    {
        return $this->hasAnyRole(['murid', 'siswa']);
    }`
);
content = content.replace(
    /public function isOrangTua\(\): bool\s*\{\s*return \$this->role === 'parent' \|\| \$this->role === 'orang_tua' \|\| \$this->role === 'wali';\s*\}/g,
    `public function isOrangTua(): bool
    {
        return $this->hasAnyRole(['parent', 'orang_tua', 'wali']);
    }`
);

fs.writeFileSync(userPhp, content);
console.log("Patched User.php");
