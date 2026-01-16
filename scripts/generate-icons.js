// Script to generate PWA icons
// This script creates simple placeholder icons
// You can replace these with your actual app icons later

const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1E293B"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">WP</text>
</svg>`;
}

// Note: This script creates SVG files
// You'll need to convert them to PNG using an online tool or image editor
// Or install sharp: npm install --save-dev sharp

console.log('Creating SVG icons...');

// Create 192x192 SVG
const svg192 = createSVGIcon(192);
fs.writeFileSync(path.join(__dirname, '../public/icon-192x192.svg'), svg192);
console.log('✓ Created icon-192x192.svg');

// Create 512x512 SVG
const svg512 = createSVGIcon(512);
fs.writeFileSync(path.join(__dirname, '../public/icon-512x512.svg'), svg512);
console.log('✓ Created icon-512x512.svg');

console.log('\nNote: SVG files created. Convert to PNG using:');
console.log('  - Online: https://cloudconvert.com/svg-to-png');
console.log('  - Or install sharp and run: node scripts/convert-svg-to-png.js');

