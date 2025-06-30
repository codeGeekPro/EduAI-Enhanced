@echo off
echo ===============================
echo 🛑 ARRÊT DES SERVICES LOCAUX
echo ===============================

echo Arrêt des processus Python (AI Services + Backend)...
taskkill /F /IM python.exe 2>nul
if errorlevel 1 (echo ⚠️ Aucun processus Python trouvé) else (echo ✅ Processus Python arrêtés)

echo Arrêt des processus Node.js (Frontend)...
taskkill /F /IM node.exe 2>nul
if errorlevel 1 (echo ⚠️ Aucun processus Node.js trouvé) else (echo ✅ Processus Node.js arrêtés)

echo Arrêt des processus Uvicorn...
taskkill /F /IM uvicorn.exe 2>nul
if errorlevel 1 (echo ⚠️ Aucun processus Uvicorn trouvé) else (echo ✅ Processus Uvicorn arrêtés)

echo.
echo Vérification des ports...
netstat -an | findstr ":8000\|:8001\|:5173" >nul
if errorlevel 1 (echo ✅ Tous les ports sont libres) else (echo ⚠️ Certains ports sont encore occupés)

echo.
echo 🎉 Nettoyage terminé !
echo Vous pouvez maintenant relancer les services.
pause
