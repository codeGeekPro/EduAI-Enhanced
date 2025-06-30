@echo off
REM 🔧 Script de résolution des conflits de dépendances
REM Résout les conflits entre pydantic, typer et safety

echo 🔧 Résolution des conflits de dépendances EduAI Enhanced
echo ============================================================

REM Vérification Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python non trouvé
    pause
    exit /b 1
)

echo ✅ Python trouvé

REM Mise à jour pip
echo 📦 Mise à jour de pip...
python -m pip install --upgrade pip
if %errorlevel% neq 0 (
    echo ⚠️ Avertissement lors de la mise à jour de pip
)

REM Installation des dépendances critiques en priorité
echo 🎯 Installation des dépendances critiques...
python -m pip install "pydantic>=2.9.0,<3.0.0" --upgrade
python -m pip install "typer>=0.16.0,<1.0.0" --upgrade  
python -m pip install "fastapi>=0.109.0,<0.110.0" --upgrade
python -m pip install "uvicorn>=0.27.0,<0.28.0" --upgrade

echo ✅ Dépendances critiques installées

REM Résolution via script Python
echo 🐍 Lancement du script de résolution automatique...
python scripts\fix_dependencies.py

REM Vérification finale
echo 🔍 Vérification des conflits...
python -m pip check
if %errorlevel% equ 0 (
    echo ✅ Aucun conflit détecté !
) else (
    echo ⚠️ Des conflits peuvent persister
    echo 💡 Essayez: python -m pip install --force-reinstall [package]
)

echo.
echo 🎉 Résolution terminée !
echo.
echo 📋 Prochaines étapes:
echo    1. Testez le backend: python backend/main.py  
echo    2. Testez les services IA: python ai_services/main.py
echo    3. Lancez le frontend: cd frontend ^&^& pnpm dev
echo.

pause
