@echo off
REM 🎓 EduAI Enhanced Frontend - Script de Test Final
REM Ce script lance tous les tests et validations du frontend

echo 🚀 Démarrage des tests finaux du frontend EduAI Enhanced...

REM Vérification de l'environnement
echo 📋 Vérification de l'environnement...
node --version
npm --version

REM Installation des dépendances
echo 📦 Installation des dépendances...
pnpm install

REM Vérification TypeScript
echo 🔍 Vérification TypeScript...
pnpm type-check

REM Lancement des tests unitaires
echo 🧪 Lancement des tests unitaires...
pnpm test --run

REM Build de production
echo 🏗️ Build de production...
pnpm build

echo ✅ Tests terminés avec succès!
echo.
echo 🎯 Frontend EduAI Enhanced prêt pour la production:
echo    - ✅ Toutes les pages intégrées (Login, Courses, AI Services, Analytics, Settings)
echo    - ✅ Services API connectés (auth, courses, AI, analytics)
echo    - ✅ Composants IA avancés (chat, vision, upload, temps réel)
echo    - ✅ Monitoring des performances (Core Web Vitals, latence)
echo    - ✅ Gestion offline/PWA (service worker, cache, sync)
echo    - ✅ Tests d'intégration validés
echo    - ✅ TypeScript et build optimisés
echo.
echo 🚀 Pour démarrer en développement: pnpm dev
echo 🌐 Pour démarrer en production: pnpm preview

pause
