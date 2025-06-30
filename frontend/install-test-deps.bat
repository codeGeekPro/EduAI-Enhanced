@echo off
echo Installation des dependances de test manquantes...
cd /d "C:\Users\genie\Documents\Projet Python\eduai\frontend"
pnpm add -D jsdom @vitest/ui @testing-library/jest-dom
echo Installation terminee.
pause
