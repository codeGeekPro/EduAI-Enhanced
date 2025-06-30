@echo off
echo =====================================
echo 🔧 CORRECTION ET RELANCEMENT SERVICES
echo =====================================

:: Arrêter tous les processus
echo Nettoyage des processus...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM uvicorn.exe 2>nul
taskkill /F /IM node.exe 2>nul

:: Attendre un peu
timeout /t 3 >nul

echo.
echo 1️⃣ Test AI Services (Port 8001)
echo ================================
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "from main_lite import app; print('✅ AI Services Lite - OK')"
if errorlevel 1 (
    echo ❌ AI Services - Erreur d'import
    goto :error
)

echo Lancement AI Services sur port 8001...
start /B "" python -m uvicorn main_lite:app --host 127.0.0.1 --port 8001
timeout /t 5 >nul

echo.
echo 2️⃣ Test Backend (Port 8002 - alternatif)
echo =========================================
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "from main_lite import app; print('✅ Backend Lite - OK')"
if errorlevel 1 (
    echo ❌ Backend - Erreur d'import
    goto :error
)

echo Lancement Backend sur port 8002 (alternatif)...
start /B "" python -m uvicorn main_lite:app --host 127.0.0.1 --port 8002
timeout /t 5 >nul

echo.
echo 3️⃣ Vérification des services
echo ============================
curl -s http://127.0.0.1:8001/health >nul 2>&1
if errorlevel 1 (echo ❌ AI Services ne répond pas) else (echo ✅ AI Services répond sur port 8001)

curl -s http://127.0.0.1:8002/health >nul 2>&1
if errorlevel 1 (echo ❌ Backend ne répond pas) else (echo ✅ Backend répond sur port 8002)

echo.
echo 🎉 SERVICES LANCÉS AVEC SUCCÈS !
echo ================================
echo 🤖 AI Services: http://127.0.0.1:8001/health
echo 🔧 Backend: http://127.0.0.1:8002/health
echo.
echo 📝 Pour tester manuellement:
echo   curl http://127.0.0.1:8001/health
echo   curl http://127.0.0.1:8002/health
echo.
echo 🛑 Pour arrêter: taskkill /F /IM python.exe
goto :end

:error
echo.
echo ❌ ERREUR DÉTECTÉE
echo Vérifiez les logs ci-dessus
pause
exit /b 1

:end
echo.
echo ✅ Tout est prêt ! Les services tournent en arrière-plan.
pause
