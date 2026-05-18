const fs = require('fs');
const path = require('path');

const frontendDir = path.join('c:', 'Users', 'madrid', 'Desktop', 'TCGTemple', 'frontend', 'app');

function getFiles(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, filesList);
    } else if (name.endsWith('.tsx')) {
      filesList.push(name);
    }
  }
  return filesList;
}

const filesToCheck = getFiles(frontendDir);

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, 'utf8');
  
  let newContent = content.replace(/'http:\/\/localhost:3000\/api(.*?)'/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}$1`");
  newContent = newContent.replace(/`http:\/\/localhost:3000\/api(.*?)`/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}$1`");
  newContent = newContent.replace(/"http:\/\/localhost:3000\/api(.*?)"/g, "`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}$1`");

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
