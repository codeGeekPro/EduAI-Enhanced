@echo off
echo 🔧 Correction rapide du lockfile...

cd "c:\Users\genie\Documents\Projet Python\eduai\frontend"

echo Suppression du lockfile obsolète...
if exist "pnpm-lock.yaml" del "pnpm-lock.yaml"

echo Mise à jour avec les nouvelles versions...
pnpm install

echo ✅ Lockfile corrigé!

echo Relancement de la validation...
cd ..
validate_final_project.bat
