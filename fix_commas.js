const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory() && !fullPath.includes('node_modules')) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            
            // Filter out lines that consist ONLY of a comma and whitespace
            newContent = newContent.split('\n').filter(line => !/^\s*,\s*\r?$/.test(line)).join('\n');
            
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log('Fixed lines in:', fullPath);
            }
        }
    });
}

walkDir(path.join(__dirname, 'frontend/src'));
console.log('Done cleaning up standalone commas.');
