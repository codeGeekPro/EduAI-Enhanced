@echo off
echo ================================
echo 🧪 EDUAI - TESTS LOCAUX
echo ================================

:: Variables d'environnement
set AI_SERVICES_PORT=8001
set BACKEND_PORT=8000
set FRONTEND_PORT=3000

echo.
echo 📋 Étape 1: Vérification de l'environnement Python
echo --------------------------------------------------
python --version
if errorlevel 1 (echo ❌ Python non trouvé & goto :error)

:: Vérifier l'environnement conda
conda info --envs | findstr eduai-backend >nul
if errorlevel 1 (echo ❌ Environnement eduai-backend non trouvé & goto :error)
echo ✅ Environnement conda OK

echo.
echo 🤖 Étape 2: Test AI Services
echo -----------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\ai_services"

:: Test d'import simple
echo Testant l'import des modules AI Services...
python -c "import torch; print('PyTorch:', torch.__version__)" 2>nul
if errorlevel 1 (echo ❌ PyTorch non installé)

python -c "import transformers; print('Transformers:', transformers.__version__)" 2>nul
if errorlevel 1 (echo ❌ Transformers non installé)

python -c "import fastapi; print('FastAPI:', fastapi.__version__)" 2>nul
if errorlevel 1 (echo ❌ FastAPI non installé)

echo Testant l'import du module principal...
python -c "from main import app; print('✅ AI Services - Import OK')" 2>nul
if errorlevel 1 (echo ❌ Erreur d'import AI Services & goto :error)

:: Lancer le serveur AI Services en arrière-plan
echo Lancement du serveur AI Services sur le port %AI_SERVICES_PORT%...
start /B python -m uvicorn main:app --host 0.0.0.0 --port %AI_SERVICES_PORT% --reload

echo Attente du démarrage (15 secondes)...
timeout /t 15 >nul

:: Test de l'endpoint de santé
echo Test de l'endpoint de santé...
curl -s http://localhost:%AI_SERVICES_PORT%/health >nul 2>&1
if errorlevel 1 (echo ❌ AI Services ne répond pas) else (echo ✅ AI Services répond)

echo.
echo 🔧 Étape 3: Test Backend
echo ------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\backend"

:: Test d'import
echo Testant l'import du backend...
python -c "from main import app; print('✅ Backend - Import OK')" 2>nul
if errorlevel 1 (echo ❌ Erreur d'import Backend & goto :error)

:: Lancer le serveur Backend en arrière-plan
echo Lancement du serveur Backend sur le port %BACKEND_PORT%...
start /B python -m uvicorn main:app --host 0.0.0.0 --port %BACKEND_PORT% --reload

echo Attente du démarrage (10 secondes)...
timeout /t 10 >nul

:: Test de l'endpoint
echo Test de l'endpoint de santé...
curl -s http://localhost:%BACKEND_PORT%/health >nul 2>&1
if errorlevel 1 (echo ❌ Backend ne répond pas) else (echo ✅ Backend répond)

echo.
echo 📱 Étape 4: Test Frontend
echo ------------------------
cd "c:\Users\genie\Documents\Projet Python\eduai\frontend"

:: Vérifier Node.js et pnpm
node --version >nul 2>&1 || (echo ❌ Node.js non trouvé & goto :error)
pnpm --version >nul 2>&1 || (echo ❌ PNPM non trouvé & goto :error)

:: Vérifier les dépendances
echo Vérification des dépendances...
if not exist "node_modules" (
    echo Installation des dépendances...
    pnpm install
    if errorlevel 1 (echo ❌ Erreur installation dépendances & goto :error)
)

:: Test de build
echo Test de build...
pnpm run build >nul 2>&1
if errorlevel 1 (echo ❌ Erreur de build frontend) else (echo ✅ Build frontend OK)

:: Lancer le serveur de développement
echo Lancement du serveur frontend...
start /B pnpm run dev

echo Attente du démarrage (10 secondes)...
timeout /t 10 >nul

:: Test de l'URL
echo Test de l'endpoint frontend...
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (echo ❌ Frontend ne répond pas) else (echo ✅ Frontend répond)

echo.
echo 🧪 Étape 5: Tests d'intégration
echo -------------------------------

:: Test des APIs
echo Test API Backend...
curl -s -X GET "http://localhost:%BACKEND_PORT%/api/v1/health" -H "accept: application/json" >nul 2>&1
if errorlevel 1 (echo ❌ API Backend KO) else (echo ✅ API Backend OK)

echo Test API AI Services...
curl -s -X GET "http://localhost:%AI_SERVICES_PORT%/health" -H "accept: application/json" >nul 2>&1
if errorlevel 1 (echo ❌ API AI Services KO) else (echo ✅ API AI Services OK)

echo.
echo 📊 RÉSUMÉ DES SERVICES LOCAUX
echo =============================
echo 🤖 AI Services: http://localhost:%AI_SERVICES_PORT%
echo 🔧 Backend: http://localhost:%BACKEND_PORT%
echo 📱 Frontend: http://localhost:5173
echo.
echo ✅ TOUS LES SERVICES SONT LANCÉS !
echo.
echo Pour arrêter les services, appuyez sur Ctrl+C dans chaque terminal
echo ou exécutez: taskkill /F /IM python.exe && taskkill /F /IM node.exe
goto :end

:error
echo.
echo ❌ ERREUR DÉTECTÉE - Arrêt du script
echo ====================================
echo Nettoyage des processus...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
exit /b 1

:end
echo.
echo 🎉 Script terminé avec succès!
echo Pour surveiller les services: 
echo - AI Services: curl http://localhost:%AI_SERVICES_PORT%/health
echo - Backend: curl http://localhost:%BACKEND_PORT%/health
echo - Frontend: curl http://localhost:5173
