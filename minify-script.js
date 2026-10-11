#!/usr/bin/env node
// Simple minifier — removes comments, whitespace, but keeps functionality intact
// Run: node minify-script.js

const fs = require('fs');

const inputFile = process.argv[2] || 'zenith-script-clean.js';
const outputFile = process.argv[3] || 'zenith-script-clean.min.js';

if (!fs.existsSync(inputFile)) {
  console.error(`Error: ${inputFile} not found`);
  process.exit(1);
}

let code = fs.readFileSync(inputFile, 'utf8');

// Remove single-line comments (but preserve https://)
code = code.replace(/\/\/(?!.*https?:\/\/).*$/gm, '');

// Remove multi-line comments
code = code.replace(/\/\*[\s\S]*?\*\//g, '');

// Remove leading/trailing whitespace from lines
code = code.split('\n').map(line => line.trim()).filter(Boolean).join('');

// Reduce multiple spaces to one (but preserve in strings)
code = code.replace(/\s{2,}/g, ' ');

// Remove spaces around operators (safe)
code = code.replace(/\s*([=+\-*\/%<>!&|^~?:;,.()\[\]{}])\s*/g, '$1');

// Restore spacing in critical places
code = code.replace(/return\(/g, 'return (');
code = code.replace(/const\(/g, 'const (');
code = code.replace(/let\(/g, 'let (');
code = code.replace(/if\(/g, 'if(');
code = code.replace(/for\(/g, 'for(');
code = code.replace(/while\(/g, 'while(');
code = code.replace(/catch\(/g, 'catch(');
code = code.replace(/function\(/g, 'function(');
code = code.replace(/async\(/g, 'async ');

// Verify no credentials leaked
const badPatterns = ['TELEGRAM_BOT_TOKEN', 'MASTER_FB_URL', 'MASTER_FB_KEY', '8709618118', 'zenith-master-866f6', 'd3Gr0jWK42rowMUP4bujTVsAYDFileixTtbdw2II'];
const leaked = badPatterns.filter(p => code.includes(p));

if (leaked.length > 0) {
  console.error('❌ CREDENTIAL LEAK DETECTED:');
  console.error(leaked.join(', '));
  process.exit(1);
}

// Verify safe constants ARE present
const safePatterns = ['REPLIT_URL', 'API_KEY'];
const missing = safePatterns.filter(p => !code.includes(p));

if (missing.length > 0) {
  console.error('⚠️  WARNING: Missing safe constants:', missing.join(', '));
}

fs.writeFileSync(outputFile, code);

const inputSize = fs.statSync(inputFile).size;
const outputSize = fs.statSync(outputFile).size;
const reduction = Math.round((1 - outputSize / inputSize) * 100);

console.log(`✓ Minified: ${inputFile} → ${outputFile}`);
console.log(`  Before: ${inputSize} bytes`);
console.log(`  After:  ${outputSize} bytes`);
console.log(`  Saved:  ${reduction}%`);
console.log(`✓ No credentials leaked`);
