@echo off
echo ========================================
echo    EduAI Enhanced - Demo Rapide
echo ========================================
echo.
echo Demarrage de l'application EduAI...
echo.

cd "C:\Users\genie\Documents\Projet Python\eduai\frontend"

echo [1/3] Installation des dependances...
call pnpm install

echo.
echo [2/3] Construction de l'application...
call pnpm build

echo.
echo [3/3] Lancement du serveur de demonstration...
echo.
echo L'application sera disponible sur :
echo - http://localhost:3000 (local)
echo - http://192.168.1.31:3000 (reseau)
echo.
echo Fonctionnalites disponibles :
echo + Interface en anglais par defaut (pour jury)
echo + Themes clair/sombre fonctionnels
echo + Images generees via API Hugging Face
echo + Installation PWA en un clic
echo + Responsive mobile-first
echo + Animations Framer Motion
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur.
echo.

call pnpm dev --host

pause
