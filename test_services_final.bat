@echo off
echo ====================================
echo 🚀 EDUAI - TEST RAPIDE FINAL
echo ====================================

:: Nettoyage préventif
taskkill /F /IM python.exe 2>nul
timeout /t 2 >nul

echo.
echo 1️⃣ Test AI Services (Mode Lite)
echo --------------------------------
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "from main_lite import app; print('✅ AI Services Lite OK')" 2>nul
if errorlevel 1 (echo ❌ AI Services Lite - ERREUR) else (echo ✅ AI Services Lite - OK)

echo.
echo 2️⃣ Test Backend (Mode Lite)
echo ----------------------------
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "from main_lite import app; print('✅ Backend Lite OK')" 2>nul
if errorlevel 1 (echo ❌ Backend Lite - ERREUR) else (echo ✅ Backend Lite - OK)

echo.
echo 3️⃣ Lancement des serveurs
echo --------------------------
echo Démarrage AI Services sur port 8001...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
start /B "" python -m uvicorn main_lite:app --host 0.0.0.0 --port 8001

echo Démarrage Backend sur port 8000...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
start /B "" python -m uvicorn main_lite:app --host 0.0.0.0 --port 8000

echo Attente du démarrage (10 secondes)...
timeout /t 10 >nul

echo.
echo 4️⃣ Test des endpoints
echo ---------------------
curl -s http://localhost:8001/health >nul 2>&1
if errorlevel 1 (echo ❌ AI Services ne répond pas) else (echo ✅ AI Services répond sur http://localhost:8001)

curl -s http://localhost:8000/health >nul 2>&1
if errorlevel 1 (echo ❌ Backend ne répond pas) else (echo ✅ Backend répond sur http://localhost:8000)

echo.
echo 🎉 RÉSULTATS FINAUX
echo ===================
echo 🌐 URLs de test:
echo   - AI Services: http://localhost:8001/health
echo   - Backend: http://localhost:8000/health
echo   - Frontend: http://localhost:3000 (à démarrer séparément)
echo.
echo 📝 Commandes utiles:
echo   - Voir les logs: docker-compose logs -f
echo   - Arrêter: taskkill /F /IM python.exe
echo   - Frontend: cd frontend && pnpm run dev
echo.
pause
