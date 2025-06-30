@echo off
echo Nettoyage complet et reinstallation conservative...
cd /d "C:\Users\genie\Documents\Projet Python\eduai\frontend"

echo Suppression complete...
if exist node_modules rmdir /s /q node_modules
if exist pnpm-lock.yaml del pnpm-lock.yaml
if exist package-lock.json del package-lock.json

echo Nettoyage du cache pnpm...
pnpm store prune

echo Installation avec resolution forcee...
pnpm install --force --no-frozen-lockfile

echo Verification des dependances...
pnpm list --depth=0

echo Verification TypeScript...
pnpm run type-check

echo Test de build rapide...
pnpm run build

echo Lancement des tests...
pnpm test --run

pause
