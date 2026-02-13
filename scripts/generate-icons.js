const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// SVG del logo VetBuddy (zampa)
const createSvg = (size, radius) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#FF6B6B"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.62}" rx="${size * 0.16}" ry="${size * 0.14}" fill="white"/>
  <ellipse cx="${size * 0.3}" cy="${size * 0.4}" rx="${size * 0.09}" ry="${size * 0.11}" fill="white"/>
  <ellipse cx="${size * 0.5}" cy="${size * 0.3}" rx="${size * 0.09}" ry="${size * 0.11}" fill="white"/>
  <ellipse cx="${size * 0.7}" cy="${size * 0.4}" rx="${size * 0.09}" ry="${size * 0.11}" fill="white"/>
</svg>`;

async function generateIcons() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  // Genera icona 192x192
  const svg192 = createSvg(192, 38);
  await sharp(Buffer.from(svg192))
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Generated icon-192.png');
  
  // Genera icona 512x512
  const svg512 = createSvg(512, 102);
  await sharp(Buffer.from(svg512))
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generated icon-512.png');
  
  // Genera Apple Touch Icon 180x180 (senza bordi arrotondati - iOS li aggiunge)
  const svgApple = `
<svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" fill="#FF6B6B"/>
  <ellipse cx="90" cy="112" rx="29" ry="25" fill="white"/>
  <ellipse cx="54" cy="72" rx="16" ry="20" fill="white"/>
  <ellipse cx="90" cy="54" rx="16" ry="20" fill="white"/>
  <ellipse cx="126" cy="72" rx="16" ry="20" fill="white"/>
</svg>`;
  await sharp(Buffer.from(svgApple))
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');
  
  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
