@echo off
echo Nettoyage et reinstallation des dependances...
cd /d "C:\Users\genie\Documents\Projet Python\eduai\frontend"

echo Suppression des anciens modules...
if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del pnpm-lock.yaml

echo Reinstallation avec les nouvelles versions...
pnpm install --no-frozen-lockfile

echo Verification des dependances...
pnpm list

echo Installation terminee. Lancement des tests...
pnpm test --run

pause
