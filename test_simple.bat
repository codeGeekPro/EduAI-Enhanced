@echo off
echo ===========================
echo 🚀 TEST SIMPLE ET RAPIDE
echo ===========================

:: Nettoyage
taskkill /F /IM python.exe 2>nul

echo.
echo 1. Test AI Services...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "print('Test AI Services...'); from main_lite import app; print('✅ OK')"

echo.
echo 2. Test Backend...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "print('Test Backend...'); from main_lite import app; print('✅ OK')"

echo.
echo 3. Lancement rapide AI Services (port 8001)...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
start /B python -m uvicorn main_lite:app --host 127.0.0.1 --port 8001

echo 4. Lancement rapide Backend (port 8003)...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
start /B python -m uvicorn main_lite:app --host 127.0.0.1 --port 8003

echo.
echo Attente de 8 secondes...
timeout /t 8

echo.
echo 5. Tests de connectivité...
curl -s http://127.0.0.1:8001/health && echo ✅ AI Services OK || echo ❌ AI Services KO
curl -s http://127.0.0.1:8003/health && echo ✅ Backend OK || echo ❌ Backend KO

echo.
echo ✨ TERMINÉ !
echo AI Services: http://127.0.0.1:8001
echo Backend: http://127.0.0.1:8003
pause
