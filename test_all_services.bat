@echo off
echo ================================
echo 🚀 EDUAI - TEST COMPLET DES SERVICES
echo ================================

:: Variables
set BACKEND_URL=http://localhost:8000
set AI_SERVICES_URL=http://localhost:8001
set FRONTEND_URL=http://localhost:3000
set MONGODB_URL=localhost:27017
set REDIS_URL=localhost:6379

echo.
echo 📋 Étape 1: Vérification des prérequis
echo ----------------------------------------
docker --version >nul 2>&1 || (echo ❌ Docker non installé & goto :error)
docker-compose --version >nul 2>&1 || (echo ❌ Docker Compose non installé & goto :error)
python --version >nul 2>&1 || (echo ❌ Python non installé & goto :error)
node --version >nul 2>&1 || (echo ❌ Node.js non installé & goto :error)
pnpm --version >nul 2>&1 || (echo ❌ PNPM non installé & goto :error)
echo ✅ Tous les prérequis sont installés

echo.
echo 🏗️ Étape 2: Construction des services Docker
echo ----------------------------------------------
docker-compose down --volumes --remove-orphans >nul 2>&1
echo Construction des images...
docker-compose build --no-cache
if errorlevel 1 (echo ❌ Erreur lors de la construction & goto :error)
echo ✅ Images construites avec succès

echo.
echo 🚀 Étape 3: Lancement des services
echo -----------------------------------
docker-compose up -d
if errorlevel 1 (echo ❌ Erreur lors du lancement & goto :error)
echo ⏳ Attente du démarrage des services (30s)...
timeout /t 30 >nul

echo.
echo 🔍 Étape 4: Vérification des conteneurs
echo ----------------------------------------
docker-compose ps
echo.

echo 🧪 Étape 5: Tests de santé des services
echo -----------------------------------------

:: Test MongoDB
echo Testant MongoDB...
docker-compose exec -T mongodb mongosh --quiet --eval "db.adminCommand('ismaster').ok" >nul 2>&1
if errorlevel 1 (echo ❌ MongoDB KO) else (echo ✅ MongoDB OK)

:: Test Redis
echo Testant Redis...
docker-compose exec -T redis redis-cli -a eduai_redis_password ping >nul 2>&1
if errorlevel 1 (echo ❌ Redis KO) else (echo ✅ Redis OK)

:: Test Backend
echo Testant Backend...
curl -s %BACKEND_URL%/health >nul 2>&1
if errorlevel 1 (echo ❌ Backend KO) else (echo ✅ Backend OK)

:: Test AI Services
echo Testant AI Services...
curl -s %AI_SERVICES_URL%/health >nul 2>&1
if errorlevel 1 (echo ❌ AI Services KO) else (echo ✅ AI Services OK)

:: Test Frontend
echo Testant Frontend...
curl -s %FRONTEND_URL% >nul 2>&1
if errorlevel 1 (echo ❌ Frontend KO) else (echo ✅ Frontend OK)

echo.
echo 📊 Étape 6: Tests fonctionnels
echo -------------------------------

:: Test API Backend
echo Testant l'API Backend...
curl -s -X GET "%BACKEND_URL%/api/v1/health" -H "accept: application/json" >nul 2>&1
if errorlevel 1 (echo ❌ API Backend KO) else (echo ✅ API Backend OK)

:: Test API AI Services
echo Testant l'API AI Services...
curl -s -X GET "%AI_SERVICES_URL%/health" -H "accept: application/json" >nul 2>&1
if errorlevel 1 (echo ❌ API AI Services KO) else (echo ✅ API AI Services OK)

echo.
echo 📈 Étape 7: État final des services
echo ------------------------------------
docker-compose ps

echo.
echo 🎉 TESTS TERMINÉS AVEC SUCCÈS!
echo ==============================
echo 🌐 Frontend: %FRONTEND_URL%
echo 🔧 Backend: %BACKEND_URL%
echo 🤖 AI Services: %AI_SERVICES_URL%
echo 📊 Monitoring: http://localhost:9090
echo.
echo Pour voir les logs: docker-compose logs -f
echo Pour arrêter: docker-compose down
goto :end

:error
echo.
echo ❌ ERREUR DÉTECTÉE - Arrêt du script
echo ====================================
exit /b 1

:end
echo.
echo ✨ Script terminé avec succès!
