#!/bin/bash
# Script de build optimisé pour mobile - EduAI
# Génère une version PWA optimisée pour appareils mobiles

echo "=========================================="
echo "    EduAI - Build Mobile PWA"
echo "=========================================="

echo ""
echo "[1/6] Nettoyage des anciens builds..."
rm -rf ../../frontend/dist

echo ""
echo "[2/6] Installation des dépendances frontend..."
cd ../../frontend
npm install

echo ""
echo "[3/6] Build PWA optimisé mobile..."
npm run build:mobile

echo ""
echo "[4/6] Génération des assets mobiles..."
cd ../mobile/scripts
node generate-assets.js

echo ""
echo "[5/6] Validation PWA..."
node validate-pwa.js

echo ""
echo "[6/6] Tests mobile automatisés..."
node test-mobile.js

echo ""
echo "=========================================="
echo "    Build mobile PWA terminé avec succès !"
echo "=========================================="
echo ""
echo "Assets générés dans : frontend/dist/"
echo "Manifest PWA : frontend/dist/manifest.json"
echo "Service Worker : frontend/dist/sw.js"
echo ""
echo "Pour tester :"
echo "1. Servir le dossier dist avec un serveur HTTPS"
echo "2. Ouvrir sur un appareil mobile"
echo "3. Tester l'installation PWA"
echo ""
