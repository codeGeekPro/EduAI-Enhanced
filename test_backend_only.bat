@echo off
echo ===========================
echo 🔧 TEST BACKEND UNIQUEMENT
echo ===========================

cd "c:\Users\genie\Documents\Projet Python\eduai\backend"

echo 1. Test d'import (Mode Lite)...
python -c "from main_lite import app; print('✅ Import OK')"
if errorlevel 1 (echo ❌ Erreur d'import & pause & exit /b 1)

echo.
echo 2. Lancement du serveur...
echo Serveur disponible sur: http://localhost:8000
echo Endpoints disponibles:
echo   - GET  /health
echo   - GET  /api/v1/health
echo.
echo Appuyez sur Ctrl+C pour arrêter
python -m uvicorn main_lite:app --host 0.0.0.0 --port 8000 --reload
