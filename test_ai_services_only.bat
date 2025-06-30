@echo off
echo ===============================
echo 🤖 TEST AI SERVICES UNIQUEMENT
echo ===============================

cd "c:\Users\genie\Documents\Projet Python\eduai\ai_services"

echo 1. Test d'import...
python -c "from main import app; print('✅ Import OK')"
if errorlevel 1 (echo ❌ Erreur d'import & pause & exit /b 1)

echo.
echo 2. Lancement du serveur...
echo Serveur disponible sur: http://localhost:8001
echo Endpoints disponibles:
echo   - GET  /health
echo   - POST /analyze
echo   - POST /generate
echo.
echo Appuyez sur Ctrl+C pour arrêter
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
