@echo off
echo ===================================
echo 🚀 TEST RAPIDE DES SERVICES EDUAI
echo ===================================

echo.
echo 1️⃣ Test AI Services (Mode Lite)
echo --------------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "from main_lite import app; print('✅ AI Services Lite - OK')"
if errorlevel 1 (echo ❌ AI Services Lite - ERREUR) else (echo ✅ AI Services Lite - Import OK)

echo.
echo 2️⃣ Test Backend (Mode Lite)
echo ----------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "from main_lite import app; print('✅ Backend Lite - OK')"
if errorlevel 1 (echo ❌ Backend Lite - ERREUR) else (echo ✅ Backend Lite - Import OK)

echo.
echo 3️⃣ Test Frontend (Dépendances)
echo --------------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\frontend"
if exist "node_modules" (echo ✅ Frontend - Dépendances OK) else (echo ❌ Frontend - Dépendances manquantes)

echo.
echo 4️⃣ Nettoyage des ports
echo -----------------------
echo Arrêt des processus existants...
taskkill /F /IM python.exe 2>nul
timeout /t 2 >nul

echo.
echo 5️⃣ Lancement des serveurs de test
echo ----------------------------------
echo Lancement AI Services Lite...
cd "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
start /B python -m uvicorn main_lite:app --host 0.0.0.0 --port 8001

echo Lancement Backend Lite...
cd "c:\Users\genie\Documents\Projet Python\eduai\backend"
start /B python -m uvicorn main_lite:app --host 0.0.0.0 --port 8000

echo Attente du démarrage...
timeout /t 10 >nul

echo.
echo 6️⃣ Test des endpoints
echo ---------------------
curl -s http://localhost:8001/health >nul 2>&1
if errorlevel 1 (echo ❌ AI Services ne répond pas) else (echo ✅ AI Services répond)

curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (echo ❌ Backend ne répond pas) else (echo ✅ Backend répond)

echo.
echo 🎉 TESTS TERMINÉS !
echo ===================
echo 🤖 AI Services: http://localhost:8001/health
echo 🔧 Backend: http://localhost:8000/health
echo.
echo Pour arrêter: taskkill /F /IM python.exe
pause
