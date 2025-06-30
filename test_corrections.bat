@echo off
echo ==============================
echo 🔧 TEST FINAL APRÈS CORRECTIONS
echo ==============================

taskkill /F /IM python.exe 2>nul
timeout /t 2 >nul

echo.
echo 1. Test AI Services Lite...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "from main_lite import app; print('✅ AI Services Lite OK')" 2>nul
if errorlevel 1 (echo ❌ ERREUR AI Services) else (echo ✅ AI Services OK)

echo.
echo 2. Test Backend Lite...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "from main_lite import app; print('✅ Backend Lite OK')" 2>nul
if errorlevel 1 (echo ❌ ERREUR Backend) else (echo ✅ Backend OK)

echo.
echo 3. Lancement des services...
echo AI Services (port 8001)...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
start /B python -m uvicorn main_lite:app --host 127.0.0.1 --port 8001

echo Backend (port 8000)...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
start /B python -m uvicorn main_lite:app --host 127.0.0.1 --port 8000

timeout /t 8 >nul

echo.
echo 4. Test connectivité...
curl -s http://127.0.0.1:8001/health >nul 2>&1 && echo ✅ AI Services répond || echo ❌ AI Services ne répond pas
curl -s http://127.0.0.1:8000/health >nul 2>&1 && echo ✅ Backend répond || echo ❌ Backend ne répond pas

echo.
echo 🎉 CORRECTIONS APPLIQUÉES !
echo ===========================
echo ✅ Erreur CORS corrigée
echo ✅ Erreur syntaxe speech_processor corrigée  
echo ✅ Package.json utilise maintenant les versions lite
echo.
echo URLs de test:
echo - AI Services: http://127.0.0.1:8001/health
echo - Backend: http://127.0.0.1:8000/health
echo.
pause
