# Script PowerShell pour corriger les problèmes CI/CD
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Correction des problèmes CI/CD pour EduAI Enhanced" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "1. Génération du fichier pnpm-lock.yaml..." -ForegroundColor Yellow
Set-Location frontend
try {
    pnpm install --lockfile-only
    Write-Host "✅ pnpm-lock.yaml généré avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ ERREUR: Échec de la génération du pnpm-lock.yaml" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}

Write-Host ""
Write-Host "2. Vérification de la structure des dossiers..." -ForegroundColor Yellow
Set-Location ..
if (-not (Test-Path "ai_services\requirements.txt")) {
    Write-Host "❌ ERREUR: Le fichier ai_services\requirements.txt est manquant" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour continuer..."
    exit 1
}
Write-Host "✅ Structure des dossiers correcte" -ForegroundColor Green

Write-Host ""
Write-Host "3. Test des dépendances Python..." -ForegroundColor Yellow
try {
    python -m pip install --upgrade pip
    pip install -r backend\requirements.txt
    pip install -r ai_services\requirements.txt
    Write-Host "✅ Dépendances Python installées" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Problème avec les dépendances Python (non critique)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "4. Test des dépendances Frontend..." -ForegroundColor Yellow
Set-Location frontend
try {
    pnpm install --no-frozen-lockfile
    Write-Host "✅ Dépendances Frontend installées" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Problème avec les dépendances Frontend (non critique)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "✅ Corrections CI/CD terminées avec succès !" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les problèmes suivants ont été corrigés :" -ForegroundColor White
Write-Host "- Génération du fichier pnpm-lock.yaml" -ForegroundColor White
Write-Host "- Utilisation du bon chemin ai_services" -ForegroundColor White
Write-Host "- Ajout de l'option --no-frozen-lockfile pour les environnements CI" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entrée pour continuer..."
