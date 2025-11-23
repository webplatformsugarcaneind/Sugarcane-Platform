#!/usr/bin/env node

/**
 * Automated URL Fixer for Sugarcane Platform
 * 
 * This script automatically replaces hardcoded localhost URLs with environment-based API calls.
 * 
 * Usage: node fix-urls.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const filesToFix = [
    'src/pages/MarketplacePage.jsx',
    'src/pages/MarketplacePageNew.jsx',
    'src/pages/ListingDetailsPage.jsx',
    'src/pages/FarmerPublicProfilePage.jsx',
    'src/pages/FarmerContractRequestPage.jsx',
    'src/pages/FarmerContractsDashboard.jsx',
    'src/pages/HHMContractDashboard.jsx',
    'src/components/MyListingsDashboard.jsx'
];

const apiImport = "import { apiURL } from '../config/api';";
const configureAxiosImport = "import { configureAxios } from '../config/api';";

let totalReplacements = 0;
let filesModified = 0;

console.log('🔧 Starting automated URL fixes...\n');

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);

    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${file}`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;

    // Check if axios is imported
    const hasAxios = content.includes('import axios from');
    const hasFetch = content.includes('fetch(');

    // Count occurrences
    const matches = content.match(/http:\/\/localhost:5000/g);
    if (matches) {
        console.log(`📄 ${file}: ${matches.length} URL(s) to fix`);
    }

    // Add imports if needed (at the top, after existing imports)
    if (hasFetch && !content.includes('apiURL')) {
        // Find the last import statement
        const lastImportMatch = content.match(/import .* from .*;\n/g);
        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            content = content.replace(lastImport, lastImport + apiImport + '\n');
        }
    }

    if (hasAxios && !content.includes('configureAxios')) {
        const lastImportMatch = content.match(/import .* from .*;\n/g);
        if (lastImportMatch) {
            const lastImport = lastImportMatch[lastImportMatch.length - 1];
            content = content.replace(lastImport, lastImport + configureAxiosImport + '\n\nconfigureAxios(axios);\n');
        }
    }

    // Replace axios calls with baseURL
    // Pattern: axios.get('http://localhost:5000/api/...')
    content = content.replace(
        /axios\.(get|post|put|delete|patch)\(['"]http:\/\/localhost:5000(\/api\/[^'"]*)['"]/g,
        (match, method, apiPath) => {
            fileReplacements++;
            return `axios.${method}('${apiPath}'`;
        }
    );

    // Replace fetch calls with apiURL helper
    // Pattern: fetch('http://localhost:5000/api/...')
    content = content.replace(
        /fetch\(['"]http:\/\/localhost:5000(\/api\/[^'"]*)['"]/g,
        (match, apiPath) => {
            fileReplacements++;
            return `fetch(apiURL('${apiPath}')`;
        }
    );

    // Replace in template literals (for axios)
    // Pattern: axios.get(`http://localhost:5000/api/...`)
    content = content.replace(
        /axios\.(get|post|put|delete|patch)\(`http:\/\/localhost:5000(\/api\/[^`]*)`/g,
        (match, method, apiPath) => {
            fileReplacements++;
            return `axios.${method}(\`${apiPath}\``;
        }
    );

    // Replace in template literals (for fetch)
    // Pattern: fetch(`http://localhost:5000/api/...`)
    content = content.replace(
        /fetch\(`http:\/\/localhost:5000(\/api\/[^`]*)`/g,
        (match, apiPath) => {
            fileReplacements++;
            return `fetch(apiURL(\`${apiPath}\`)`;
        }
    );

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`   ✅ Fixed ${fileReplacements} URL(s)`);
        filesModified++;
        totalReplacements += fileReplacements;
    } else {
        console.log(`   ℹ️  No changes needed`);
    }
});

console.log('\n📊 Summary:');
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total replacements: ${totalReplacements}`);
console.log('\n✨ Done! Please review the changes before committing.\n');

if (totalReplacements > 0) {
    console.log('⚠️  IMPORTANT: Test your application thoroughly after these changes!');
    console.log('   Run: npm run dev (in frontend directory)');
    console.log('   Check for any broken API calls or console errors.\n');
}
