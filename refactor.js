const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const frontendSrc = path.join(process.cwd(), 'frontend', 'src');
let changedFiles = 0;

walk(frontendSrc, (filepath) => {
  if (filepath.endsWith('.jsx') || filepath.endsWith('.js')) {
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    if (content.includes('http://localhost:5000') && !filepath.includes('api.js') && !filepath.includes('FactoryAnalysisDebug')) {
      if (!content.includes('config/api')) {
        let relPath = path.relative(path.dirname(filepath), path.join(frontendSrc, 'config', 'api.js')).replace(/\\/g, '/').replace('.js', '');
        if (!relPath.startsWith('.')) relPath = './' + relPath;
        content = `import API_BASE_URL from '${relPath}';\n` + content;
      }
      
      content = content.replace(/['"]http:\/\/localhost:5000['"]/g, 'API_BASE_URL');
      content = content.replace(/['"]http:\/\/localhost:5000\/([^'"]+)['"]/g, '`${API_BASE_URL}/$1`');
      content = content.replace(/http:\/\/localhost:5000/g, '${API_BASE_URL}');

      if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        changedFiles++;
        console.log('Updated:', filepath);
      }
    }
  }
});
console.log('Total files updated:', changedFiles);
