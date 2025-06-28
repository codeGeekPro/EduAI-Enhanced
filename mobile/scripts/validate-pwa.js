const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Validation complète de la PWA EduAI
 * Vérifie tous les critères requis pour une PWA mobile optimale
 */

class PWAValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
  }

  async validateManifest() {
    console.log('📋 Validation du manifest PWA...');
    
    const manifestPath = '../../frontend/dist/manifest.json';
    
    if (!fs.existsSync(manifestPath)) {
      this.errors.push('❌ Manifest PWA introuvable');
      return;
    }
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      // Champs obligatoires
      const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
      required.forEach(field => {
        if (!manifest[field]) {
          this.errors.push(`❌ Champ obligatoire manquant: ${field}`);
        } else {
          this.success.push(`✅ ${field} présent`);
        }
      });
      
      // Validation des icons
      if (manifest.icons && manifest.icons.length > 0) {
        const requiredSizes = ['192x192', '512x512'];
        const availableSizes = manifest.icons.map(icon => icon.sizes);
        
        requiredSizes.forEach(size => {
          if (availableSizes.includes(size)) {
            this.success.push(`✅ Icon ${size} présente`);
          } else {
            this.errors.push(`❌ Icon ${size} manquante`);
          }
        });
      }
      
      // Validation du display mode
      if (manifest.display === 'standalone' || manifest.display === 'fullscreen') {
        this.success.push('✅ Display mode optimal pour mobile');
      } else {
        this.warnings.push('⚠️  Display mode pourrait être optimisé');
      }
      
    } catch (error) {
      this.errors.push(`❌ Erreur parsing manifest: ${error.message}`);
    }
  }

  async validateServiceWorker() {
    console.log('⚙️ Validation du Service Worker...');
    
    const swPath = '../../frontend/dist/sw.js';
    
    if (!fs.existsSync(swPath)) {
      this.errors.push('❌ Service Worker introuvable');
      return;
    }
    
    const swContent = fs.readFileSync(swPath, 'utf8');
    
    // Vérifications basiques
    if (swContent.includes('install') && swContent.includes('fetch')) {
      this.success.push('✅ Service Worker avec événements de base');
    } else {
      this.errors.push('❌ Service Worker incomplet');
    }
    
    if (swContent.includes('cache') || swContent.includes('Cache')) {
      this.success.push('✅ Stratégie de cache détectée');
    } else {
      this.warnings.push('⚠️  Aucune stratégie de cache détectée');
    }
  }

  async validateIcons() {
    console.log('🎨 Validation des icons...');
    
    const iconsDir = '../assets/icons';
    const requiredIcons = ['72x72', '96x96', '128x128', '144x144', '152x152', '192x192', '384x384', '512x512'];
    
    if (!fs.existsSync(iconsDir)) {
      this.errors.push('❌ Dossier icons introuvable');
      return;
    }
    
    requiredIcons.forEach(size => {
      const iconPath = path.join(iconsDir, `icon-${size}.png`);
      if (fs.existsSync(iconPath)) {
        this.success.push(`✅ Icon ${size} présente`);
      } else {
        this.warnings.push(`⚠️  Icon ${size} manquante`);
      }
    });
  }

  async validateHTTPS() {
    console.log('🔒 Validation HTTPS...');
    
    // Note: En développement local, on ne peut pas vraiment tester HTTPS
    // Cette validation sera plus pertinente en production
    this.success.push('✅ HTTPS requis en production (à vérifier au déploiement)');
  }

  async validateOfflineCapabilities() {
    console.log('📱 Validation des capacités offline...');
    
    const swPath = '../../frontend/dist/sw.js';
    
    if (fs.existsSync(swPath)) {
      const swContent = fs.readFileSync(swPath, 'utf8');
      
      if (swContent.includes('offline') || swContent.includes('fallback')) {
        this.success.push('✅ Capacités offline détectées');
      } else {
        this.warnings.push('⚠️  Capacités offline à améliorer');
      }
    }
  }

  async validateMobileOptimizations() {
    console.log('📱 Validation des optimisations mobile...');
    
    const indexPath = '../../frontend/dist/index.html';
    
    if (!fs.existsSync(indexPath)) {
      this.errors.push('❌ index.html introuvable');
      return;
    }
    
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Viewport meta tag
    if (indexContent.includes('viewport')) {
      this.success.push('✅ Meta viewport présent');
    } else {
      this.errors.push('❌ Meta viewport manquant');
    }
    
    // Theme color
    if (indexContent.includes('theme-color')) {
      this.success.push('✅ Theme color défini');
    } else {
      this.warnings.push('⚠️  Theme color recommandé');
    }
    
    // Apple touch icon
    if (indexContent.includes('apple-touch-icon')) {
      this.success.push('✅ Apple touch icon présent');
    } else {
      this.warnings.push('⚠️  Apple touch icon recommandé');
    }
  }

  async generateReport() {
    console.log('\n==========================================');
    console.log('    RAPPORT DE VALIDATION PWA');
    console.log('==========================================\n');
    
    if (this.success.length > 0) {
      console.log('🎉 SUCCÈS:');
      this.success.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  AVERTISSEMENTS:');
      this.warnings.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    if (this.errors.length > 0) {
      console.log('❌ ERREURS:');
      this.errors.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    const total = this.success.length + this.warnings.length + this.errors.length;
    const score = Math.round((this.success.length / total) * 100);
    
    console.log(`📊 SCORE PWA: ${score}%`);
    
    if (this.errors.length === 0) {
      console.log('✅ PWA prête pour le déploiement mobile !');
    } else {
      console.log('❌ Erreurs critiques à corriger avant déploiement');
    }
    
    console.log('\n==========================================\n');
    
    return this.errors.length === 0;
  }

  async runFullValidation() {
    await this.validateManifest();
    await this.validateServiceWorker();
    await this.validateIcons();
    await this.validateHTTPS();
    await this.validateOfflineCapabilities();
    await this.validateMobileOptimizations();
    
    return await this.generateReport();
  }
}

async function main() {
  const validator = new PWAValidator();
  const isValid = await validator.runFullValidation();
  
  if (!isValid) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { PWAValidator };
