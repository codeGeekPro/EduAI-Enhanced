const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configuration des tailles d'icons PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Configuration des splash screens
const splashSizes = [
  { width: 320, height: 568, name: 'iphone-se' },
  { width: 375, height: 667, name: 'iphone-8' },
  { width: 414, height: 736, name: 'iphone-8-plus' },
  { width: 414, height: 896, name: 'iphone-x' }
];

async function generateAssets() {
  console.log('🎨 Génération des assets mobiles...');
  
  const assetsDir = '../assets';
  const sourceIcon = path.join(assetsDir, 'source/icon.svg');
  const sourceSplash = path.join(assetsDir, 'source/splash.svg');
  
  // Créer les dossiers nécessaires
  const dirs = ['icons', 'splash', 'shortcuts'];
  dirs.forEach(dir => {
    const dirPath = path.join(assetsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
  
  // Générer les icons PWA
  console.log('📱 Génération des icons PWA...');
  for (const size of iconSizes) {
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(path.join(assetsDir, 'icons', `icon-${size}x${size}.png`));
      console.log(`✅ Icon ${size}x${size} générée`);
    } catch (error) {
      console.warn(`⚠️  Erreur icon ${size}x${size}:`, error.message);
    }
  }
  
  // Générer les splash screens
  console.log('🌟 Génération des splash screens...');
  for (const splash of splashSizes) {
    try {
      await sharp(sourceSplash)
        .resize(splash.width, splash.height, { fit: 'contain', background: '#1e293b' })
        .png()
        .toFile(path.join(assetsDir, 'splash', `splash-${splash.width}x${splash.height}.png`));
      console.log(`✅ Splash ${splash.name} (${splash.width}x${splash.height}) générée`);
    } catch (error) {
      console.warn(`⚠️  Erreur splash ${splash.name}:`, error.message);
    }
  }
  
  // Générer les shortcuts icons
  console.log('🚀 Génération des shortcuts...');
  const shortcuts = [
    { name: 'course', size: 96 },
    { name: 'review', size: 96 }
  ];
  
  for (const shortcut of shortcuts) {
    try {
      await sharp(sourceIcon)
        .resize(shortcut.size, shortcut.size)
        .png()
        .toFile(path.join(assetsDir, 'shortcuts', `shortcut-${shortcut.name}.png`));
      console.log(`✅ Shortcut ${shortcut.name} générée`);
    } catch (error) {
      console.warn(`⚠️  Erreur shortcut ${shortcut.name}:`, error.message);
    }
  }
  
  console.log('🎉 Génération des assets terminée !');
}

// Créer des fichiers SVG de base si ils n'existent pas
function createSourceFiles() {
  const sourceDir = '../assets/source';
  if (!fs.existsSync(sourceDir)) {
    fs.mkdirSync(sourceDir, { recursive: true });
  }
  
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#3b82f6" rx="20"/>
    <text x="100" y="130" font-family="Arial, sans-serif" font-size="60" font-weight="bold" fill="white" text-anchor="middle">AI</text>
    <circle cx="60" cy="60" r="15" fill="#fbbf24"/>
    <circle cx="140" cy="60" r="15" fill="#fbbf24"/>
    <path d="M100 80 Q120 100 100 120 Q80 100 100 80" fill="#fbbf24"/>
  </svg>`;
  
  const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
    <rect width="400" height="600" fill="#1e293b"/>
    <rect x="150" y="200" width="100" height="100" fill="#3b82f6" rx="10"/>
    <text x="200" y="260" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="white" text-anchor="middle">AI</text>
    <text x="200" y="350" font-family="Arial, sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">EduAI</text>
    <text x="200" y="380" font-family="Arial, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">Intelligence Éducative</text>
  </svg>`;
  
  fs.writeFileSync(path.join(sourceDir, 'icon.svg'), iconSvg);
  fs.writeFileSync(path.join(sourceDir, 'splash.svg'), splashSvg);
  
  console.log('📄 Fichiers SVG source créés');
}

async function main() {
  try {
    createSourceFiles();
    await generateAssets();
  } catch (error) {
    console.error('❌ Erreur lors de la génération des assets:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateAssets };
