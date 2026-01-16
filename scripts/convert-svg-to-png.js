// Script to convert SVG icons to PNG using sharp
// Run: npm install --save-dev sharp
// Then: node scripts/convert-svg-to-png.js

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertSVGToPNG() {
  try {
    // Convert 192x192
    const svg192 = fs.readFileSync(path.join(__dirname, '../public/icon-192x192.svg'));
    await sharp(svg192)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icon-192x192.png'));
    console.log('✓ Created icon-192x192.png');

    // Convert 512x512
    const svg512 = fs.readFileSync(path.join(__dirname, '../public/icon-512x512.svg'));
    await sharp(svg512)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icon-512x512.png'));
    console.log('✓ Created icon-512x512.png');

    console.log('\n✓ All icons created successfully!');
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('Error: sharp is not installed.');
      console.log('Install it with: npm install --save-dev sharp');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

convertSVGToPNG();

