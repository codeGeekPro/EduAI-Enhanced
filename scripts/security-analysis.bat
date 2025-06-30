@echo off
REM Script d'analyse de sécurité amélioré pour EduAI Enhanced
REM Usage: security-analysis.bat

echo ==============================================
echo    ANALYSE DE SECURITE - EduAI Enhanced
echo ==============================================
echo.

REM Installation des outils de sécurité Python
echo [1/6] Installation des outils d'analyse de sécurité...
pip install --quiet safety bandit pip-audit semgrep 2>nul || (
    echo ATTENTION: Certains outils d'analyse ne sont pas installés
    echo Tentative d'installation avec --user...
    pip install --user --quiet safety bandit pip-audit 2>nul
)

echo [2/6] Analyse des vulnérabilités avec Safety (Backend)...
cd backend
if exist requirements.txt (
    safety check -r requirements.txt --json > ../security-reports/backend-safety.json 2>nul || (
        echo Analyse Safety pour backend terminée avec avertissements
        safety check -r requirements.txt > ../security-reports/backend-safety.txt 2>nul
    )
) else (
    echo Aucun fichier requirements.txt trouvé dans backend/
)
cd ..

echo [3/6] Analyse des vulnérabilités avec Safety (AI Services)...
cd ai_services
if exist requirements.txt (
    safety check -r requirements.txt --json > ../security-reports/ai-services-safety.json 2>nul || (
        echo Analyse Safety pour ai_services terminée avec avertissements
        safety check -r requirements.txt > ../security-reports/ai-services-safety.txt 2>nul
    )
) else (
    echo Aucun fichier requirements.txt trouvé dans ai_services/
)
cd ..

echo [4/6] Analyse de sécurité du code avec Bandit...
if exist ai_services (
    bandit -r ai_services/ -f json -o security-reports/bandit-ai-services.json 2>nul || (
        bandit -r ai_services/ -o security-reports/bandit-ai-services.txt 2>nul
    )
)
if exist backend (
    bandit -r backend/ -f json -o security-reports/bandit-backend.json 2>nul || (
        bandit -r backend/ -o security-reports/bandit-backend.txt 2>nul
    )
)

echo [5/6] Audit des dépendances pnpm (Frontend)...
cd frontend
if exist package.json (
    pnpm audit --json 2>nul > ../security-reports/frontend-pnpm-audit.json || (
        echo Audit pnpm terminé avec avertissements
        pnpm audit 2>nul > ../security-reports/frontend-pnpm-audit.txt || echo "Audit pnpm non disponible"
    )
)
cd ..

echo [6/6] Recherche de secrets et fichiers sensibles...
findstr /R /S /I "password\|secret\|key\|token\|api.*key" *.py *.js *.ts *.json *.yml *.yaml 2>nul > security-reports/potential-secrets.txt || echo Aucun secret détecté dans les fichiers principaux

echo.
echo ==============================================
echo        RAPPORT D'ANALYSE DE SECURITE
echo ==============================================

if exist security-reports (
    echo Rapports générés dans le dossier security-reports/:
    dir security-reports /B
    echo.
    
    REM Résumé des vulnérabilités critiques
    echo RÉSUMÉ DES VULNÉRABILITÉS CRITIQUES:
    echo --------------------------------------
    
    if exist security-reports\backend-safety.txt (
        echo Backend (Safety):
        findstr /I "CRITICAL\|HIGH" security-reports\backend-safety.txt 2>nul || echo "  Aucune vulnérabilité critique détectée"
    )
    
    if exist security-reports\ai-services-safety.txt (
        echo AI Services (Safety):
        findstr /I "CRITICAL\|HIGH" security-reports\ai-services-safety.txt 2>nul || echo "  Aucune vulnérabilité critique détectée"
    )
    
    if exist security-reports\bandit-ai-services.txt (
        echo Code Python (Bandit):
        findstr /I "HIGH\|MEDIUM" security-reports\bandit-ai-services.txt 2>nul || echo "  Aucun problème de sécurité critique détecté"
    )
    
    if exist security-reports\frontend-pnpm-audit.txt (
        echo Frontend (pnpm audit):
        findstr /I "critical\|high" security-reports\frontend-pnpm-audit.txt 2>nul || echo "  Aucune vulnérabilité critique détectée"
    )
) else (
    echo ERREUR: Impossible de créer le dossier de rapports
)

echo.
echo Analyse de sécurité terminée!
echo Consultez les rapports détaillés dans security-reports/
echo.
pause
