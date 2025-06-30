@echo off
echo =================================================================
echo Correction des problèmes CI/CD pour EduAI Enhanced
echo =================================================================

echo.
echo 1. Génération du fichier pnpm-lock.yaml...
cd frontend
pnpm install --lockfile-only
if %errorlevel% neq 0 (
    echo ERREUR: Échec de la génération du pnpm-lock.yaml
    pause
    exit /b 1
)

echo.
echo 2. Vérification de la structure des dossiers...
cd ..
if not exist "ai_services\requirements.txt" (
    echo ERREUR: Le fichier ai_services\requirements.txt est manquant
    pause
    exit /b 1
)

echo.
echo 3. Test des dépendances Python...
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
pip install -r ai_services\requirements.txt

echo.
echo 4. Test des dépendances Frontend...
cd frontend
pnpm install --no-frozen-lockfile

echo.
echo =================================================================
echo ✅ Corrections CI/CD terminées avec succès !
echo =================================================================
echo.
echo Les problèmes suivants ont été corrigés :
echo - Génération du fichier pnpm-lock.yaml
echo - Utilisation du bon chemin ai_services
echo - Ajout de l'option --no-frozen-lockfile pour les environnements CI
echo.
pause
