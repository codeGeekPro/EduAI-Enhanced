@echo off
echo ========================================
echo 🔄 Mise à jour des dépendances
echo ========================================

cd "c:\Users\genie\Documents\Projet Python\eduai\frontend"

echo 📦 Suppression du lockfile obsolète...
if exist "pnpm-lock.yaml" del "pnpm-lock.yaml"

echo 📦 Réinstallation propre des dépendances...
pnpm install --no-frozen-lockfile

echo 🔍 Vérification des versions...
pnpm list --depth=0

echo ✅ Dépendances mises à jour!

echo 🎯 Lancement de la validation...
cd ".."
call validate_final_project.bat

pause
