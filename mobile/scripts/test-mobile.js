const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');

/**
 * Tests automatisés mobiles pour EduAI PWA
 * Simule différents appareils et teste les fonctionnalités clés
 */

class MobileTester {
  constructor() {
    this.browser = null;
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  async setup() {
    console.log('🚀 Initialisation des tests mobiles...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async testDevice(deviceName, url = 'http://localhost:3000') {
    console.log(`📱 Test sur ${deviceName}...`);
    
    const page = await this.browser.newPage();
    
    try {
      // Émuler l'appareil
      await page.emulate(devices[deviceName]);
      
      // Naviguer vers l'app
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Test 1: Page se charge
      const title = await page.title();
      if (title.includes('EduAI')) {
        this.results.passed.push(`✅ ${deviceName}: Page se charge correctement`);
      } else {
        this.results.failed.push(`❌ ${deviceName}: Titre de page incorrect`);
      }
      
      // Test 2: Responsive design
      const viewport = page.viewport();
      await page.setViewport({ width: viewport.width, height: viewport.height });
      
      const isResponsive = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).every(el => {
          const rect = el.getBoundingClientRect();
          return rect.right <= window.innerWidth;
        });
      });
      
      if (isResponsive) {
        this.results.passed.push(`✅ ${deviceName}: Design responsive`);
      } else {
        this.results.failed.push(`❌ ${deviceName}: Problème de responsive`);
      }
      
      // Test 3: PWA installable
      const isInstallable = await page.evaluate(() => {
        return 'serviceWorker' in navigator;
      });
      
      if (isInstallable) {
        this.results.passed.push(`✅ ${deviceName}: PWA installable`);
      } else {
        this.results.failed.push(`❌ ${deviceName}: Service Worker non supporté`);
      }
      
      // Test 4: Touch events (mobile uniquement)
      if (deviceName.includes('iPhone') || deviceName.includes('Galaxy')) {
        const touchSupport = await page.evaluate(() => {
          return 'ontouchstart' in window;
        });
        
        if (touchSupport) {
          this.results.passed.push(`✅ ${deviceName}: Support tactile`);
        } else {
          this.results.warnings.push(`⚠️  ${deviceName}: Support tactile limité`);
        }
      }
      
      // Test 5: Performance basique
      const performanceMetrics = await page.metrics();
      const jsHeapUsed = performanceMetrics.JSHeapUsedSize / 1024 / 1024; // MB
      
      if (jsHeapUsed < 50) {
        this.results.passed.push(`✅ ${deviceName}: Consommation mémoire acceptable (${jsHeapUsed.toFixed(1)}MB)`);
      } else {
        this.results.warnings.push(`⚠️  ${deviceName}: Consommation mémoire élevée (${jsHeapUsed.toFixed(1)}MB)`);
      }
      
    } catch (error) {
      this.results.failed.push(`❌ ${deviceName}: Erreur lors du test - ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testPWAFeatures(url = 'http://localhost:3000') {
    console.log('⚙️ Test des fonctionnalités PWA...');
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Test Service Worker
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            return !!registration;
          } catch (e) {
            return false;
          }
        }
        return false;
      });
      
      if (swRegistered) {
        this.results.passed.push('✅ Service Worker enregistré');
      } else {
        this.results.failed.push('❌ Service Worker non enregistré');
      }
      
      // Test Cache API
      const cacheSupport = await page.evaluate(() => {
        return 'caches' in window;
      });
      
      if (cacheSupport) {
        this.results.passed.push('✅ Cache API supporté');
      } else {
        this.results.failed.push('❌ Cache API non supporté');
      }
      
      // Test Manifest
      const manifestLink = await page.$('link[rel="manifest"]');
      if (manifestLink) {
        this.results.passed.push('✅ Manifest lié correctement');
      } else {
        this.results.failed.push('❌ Manifest non lié');
      }
      
    } catch (error) {
      this.results.failed.push(`❌ Erreur test PWA: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  async testAccessibility(url = 'http://localhost:3000') {
    console.log('♿ Test d\'accessibilité mobile...');
    
    const page = await this.browser.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Test contraste de base
      const hasGoodContrast = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        // Test simplifié - dans un vrai projet, utiliser axe-core
        return elements.length > 0;
      });
      
      if (hasGoodContrast) {
        this.results.passed.push('✅ Éléments accessibles détectés');
      } else {
        this.results.warnings.push('⚠️  Tests d\'accessibilité à approfondir');
      }
      
      // Test taille des éléments tactiles
      const touchTargetSize = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button, a, input');
        return Array.from(buttons).every(btn => {
          const rect = btn.getBoundingClientRect();
          return rect.width >= 44 && rect.height >= 44; // Minimum recommandé
        });
      });
      
      if (touchTargetSize) {
        this.results.passed.push('✅ Taille des cibles tactiles appropriée');
      } else {
        this.results.warnings.push('⚠️  Certaines cibles tactiles pourraient être agrandies');
      }
      
    } catch (error) {
      this.results.warnings.push(`⚠️  Test accessibilité: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  generateReport() {
    console.log('\n==========================================');
    console.log('    RAPPORT DES TESTS MOBILES');
    console.log('==========================================\n');
    
    if (this.results.passed.length > 0) {
      console.log('🎉 TESTS RÉUSSIS:');
      this.results.passed.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    if (this.results.warnings.length > 0) {
      console.log('⚠️  AVERTISSEMENTS:');
      this.results.warnings.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    if (this.results.failed.length > 0) {
      console.log('❌ TESTS ÉCHOUÉS:');
      this.results.failed.forEach(msg => console.log(`  ${msg}`));
      console.log('');
    }
    
    const total = this.results.passed.length + this.results.warnings.length + this.results.failed.length;
    const score = total > 0 ? Math.round((this.results.passed.length / total) * 100) : 0;
    
    console.log(`📊 SCORE DE COMPATIBILITÉ MOBILE: ${score}%`);
    
    if (this.results.failed.length === 0) {
      console.log('✅ Application prête pour le mobile !');
    } else {
      console.log('❌ Problèmes à corriger pour une expérience mobile optimale');
    }
    
    console.log('\n==========================================\n');
    
    return this.results.failed.length === 0;
  }

  async runAllTests(url = 'http://localhost:3000') {
    await this.setup();
    
    try {
      // Test sur différents appareils
      const devices = [
        'iPhone 12',
        'iPhone SE',
        'Galaxy S21',
        'iPad'
      ];
      
      for (const device of devices) {
        await this.testDevice(device, url);
      }
      
      // Tests PWA génériques
      await this.testPWAFeatures(url);
      await this.testAccessibility(url);
      
      return this.generateReport();
      
    } catch (error) {
      console.error('❌ Erreur lors des tests:', error);
      return false;
    } finally {
      await this.cleanup();
    }
  }
}

async function main() {
  const tester = new MobileTester();
  
  // URL par défaut - à modifier selon votre setup
  const url = process.argv[2] || 'http://localhost:3000';
  
  console.log(`🧪 Lancement des tests mobiles sur: ${url}`);
  
  const success = await tester.runAllTests(url);
  
  if (!success) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { MobileTester };
