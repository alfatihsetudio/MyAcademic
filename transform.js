const fs = require('fs');

function transformFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace colors to match Student theme (indigo -> sky, purple -> blue, amber can stay)
  // We avoid replacing indigo that might be a variable or component by checking word boundaries
  content = content.replace(/\bindigo\b/g, 'sky');
  content = content.replace(/\bpurple\b/g, 'blue');
  // I will not touch teal/emerald as they are accent colors.
  
  // Remove all 'dark:' tailwind classes from TeacherGlassDashboard and TeacherHubView
  // dark:[a-zA-Z0-9\-\/]+
  content = content.replace(/dark:([a-zA-Z0-9\-\/]+)/g, '');

  // Ensure multiple spaces are collapsed inside class strings
  content = content.replace(/className=\"([^\"]+)\"/g, (match, p1) => {
    return 'className=\"' + p1.replace(/\s+/g, ' ').trim() + '\"';
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Processed ' + filePath);
}

transformFile('frontend/components/Views/TeacherGlassDashboard.tsx');
transformFile('frontend/components/Views/TeacherHubView.tsx');
