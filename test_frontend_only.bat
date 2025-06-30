@echo off
echo ============================
echo 📱 TEST FRONTEND UNIQUEMENT
echo ============================

cd "c:\Users\genie\Documents\Projet Python\eduai\frontend"

:: Vérifier les outils
node --version || (echo ❌ Node.js non trouvé & pause & exit /b 1)
pnpm --version || (echo ❌ PNPM non trouvé & pause & exit /b 1)

echo.
echo 1. Vérification des dépendances...
if not exist "node_modules" (
    echo Installation des dépendances...
    pnpm install
    if errorlevel 1 (echo ❌ Erreur installation & pause & exit /b 1)
)

echo.
echo 2. Test de build...
pnpm run build
if errorlevel 1 (echo ❌ Erreur de build & pause & exit /b 1)

echo.
echo 3. Lancement du serveur de développement...
echo Serveur disponible sur: http://localhost:5173
echo.
echo Appuyez sur Ctrl+C pour arrêter
pnpm run dev
