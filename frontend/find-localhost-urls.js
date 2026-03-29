// Script to find and list all hardcoded localhost URLs in the frontend
// Run this with: node find-localhost-urls.js

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const srcDir = './src';
const localhostPattern = /http:\/\/localhost:5000/g;

function walkDir(dir, fileList = []) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath, fileList);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

const files = walkDir(srcDir);
let totalCount = 0;

console.log('Files with hardcoded localhost URLs:\n');

files.forEach(file => {
    const content = readFileSync(file, 'utf8');
    const matches = content.match(localhostPattern);

    if (matches) {
        console.log(`${file}: ${matches.length} occurrence(s)`);
        totalCount += matches.length;
    }
});

console.log(`\nTotal hardcoded localhost URLs found: ${totalCount}`);
console.log('\nThese should be replaced with apiURL() helper or axios configured with base URL');
