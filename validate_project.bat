@echo off
setlocal enabledelayedexpansion

echo ================================
echo 🎯 VALIDATION FINALE EDUAI
echo ================================

set success=0
set total=0

:: Test 1: AI Services
echo.
echo [1/4] Test AI Services...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\ai_services"
python -c "from main_lite import app; print('✅ AI Services OK')" 2>nul
if !errorlevel! equ 0 (
    echo ✅ AI Services - Import OK
    set /a success+=1
) else (
    echo ❌ AI Services - Import FAILED
)
set /a total+=1

:: Test 2: Backend
echo.
echo [2/4] Test Backend...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\backend"
python -c "from main_lite import app; print('✅ Backend OK')" 2>nul
if !errorlevel! equ 0 (
    echo ✅ Backend - Import OK
    set /a success+=1
) else (
    echo ❌ Backend - Import FAILED
)
set /a total+=1

:: Test 3: Frontend dependencies
echo.
echo [3/4] Test Frontend...
cd /d "c:\Users\genie\Documents\Projet Python\eduai\frontend"
if exist "node_modules" (
    echo ✅ Frontend - Dépendances OK
    set /a success+=1
) else (
    echo ❌ Frontend - Dépendances manquantes
    echo    Exécutez: cd frontend && pnpm install
)
set /a total+=1

:: Test 4: Package.json corrections
echo.
echo [4/4] Test Package.json...
findstr "ai_services" "c:\Users\genie\Documents\Projet Python\eduai\package.json" >nul
if !errorlevel! equ 0 (
    echo ✅ Package.json - Chemins corrigés
    set /a success+=1
) else (
    echo ❌ Package.json - Chemins incorrects
)
set /a total+=1

:: Résultats
echo.
echo ================================
echo 📊 RÉSULTATS
echo ================================
echo Tests réussis: !success!/!total!

if !success! equ !total! (
    echo.
    echo 🎉 TOUS LES TESTS SONT PASSÉS !
    echo ================================
    echo.
    echo 🚀 Prêt pour le lancement:
    echo   1. Services locaux: test_simple.bat
    echo   2. Docker: docker-compose up -d
    echo   3. Frontend seul: cd frontend && pnpm run dev
    echo.
    echo ✨ Votre projet EduAI est prêt !
) else (
    echo.
    echo ⚠️  Il reste quelques problèmes à corriger
    echo Vérifiez les erreurs ci-dessus
)

echo.
pause
