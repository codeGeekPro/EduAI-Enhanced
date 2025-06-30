@echo off
echo Installation propre des dependances...
cd /d "C:\Users\genie\Documents\Projet Python\eduai\frontend"

echo Nettoyage du cache...
pnpm store prune

echo Installation des dependances...
pnpm install --prefer-offline

echo Verification...
pnpm audit

echo Test de build...
pnpm run type-check

echo Lancement des tests...
pnpm test --run

pause
