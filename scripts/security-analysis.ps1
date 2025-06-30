# Script PowerShell pour analyse de sécurité directe
# Alternative à Codacy CLI pour Windows

param(
    [string]$Tool = "all",
    [string]$Directory = "."
)

Write-Host "Analyse de sécurité EduAI Enhanced" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

$ProjectRoot = Get-Location
$Results = @()

# Fonction pour analyser package.json avec npm audit
function Analyze-NpmPackages {
    param([string]$Path)
    
    Write-Host "`nAnalyse des vulnérabilités npm dans: $Path" -ForegroundColor Yellow
    
    if (Test-Path "$Path/package.json") {
        Push-Location $Path
        try {
            $auditResult = npm audit --json 2>$null | ConvertFrom-Json
            if ($auditResult.vulnerabilities) {
                $vulnCount = ($auditResult.vulnerabilities.PSObject.Properties | Measure-Object).Count
                Write-Host "Vulnérabilités trouvées: $vulnCount" -ForegroundColor Red
                
                # Afficher un résumé
                $auditResult.vulnerabilities.PSObject.Properties | ForEach-Object {
                    $vuln = $_.Value
                    Write-Host "- $($_.Name): $($vuln.severity) (via: $($vuln.via -join ', '))" -ForegroundColor Red
                }
                
                return @{
                    Type = "npm"
                    Path = $Path
                    Count = $vulnCount
                    Details = $auditResult.vulnerabilities
                }
            } else {
                Write-Host "Aucune vulnérabilité npm trouvée ✓" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "Erreur lors de l'audit npm: $($_.Exception.Message)" -ForegroundColor Red
        }
        finally {
            Pop-Location
        }
    }
    return $null
}

# Fonction pour analyser requirements.txt avec safety (si disponible)
function Analyze-PythonPackages {
    param([string]$Path)
    
    Write-Host "`nAnalyse des vulnérabilités Python dans: $Path" -ForegroundColor Yellow
    
    if (Test-Path "$Path/requirements.txt") {
        try {
            # Essayer d'utiliser safety si disponible
            $safetyResult = safety check -r "$Path/requirements.txt" --json 2>$null
            if ($safetyResult) {
                $vulns = $safetyResult | ConvertFrom-Json
                if ($vulns.Count -gt 0) {
                    Write-Host "Vulnérabilités Python trouvées: $($vulns.Count)" -ForegroundColor Red
                    $vulns | ForEach-Object {
                        Write-Host "- $($_.package): $($_.vulnerability)" -ForegroundColor Red
                    }
                    return @{
                        Type = "python"
                        Path = $Path
                        Count = $vulns.Count
                        Details = $vulns
                    }
                } else {
                    Write-Host "Aucune vulnérabilité Python trouvée ✓" -ForegroundColor Green
                }
            }
        }
        catch {
            Write-Host "Safety non disponible, analyse manuelle recommandée" -ForegroundColor Yellow
        }
    }
    return $null
}

# Fonction pour analyser les fichiers sensibles
function Analyze-SensitiveFiles {
    Write-Host "`nRecherche de fichiers sensibles..." -ForegroundColor Yellow
    
    $sensitivePatterns = @(
        "*.env*",
        "*.key",
        "*.pem",
        "*.p12",
        "*.pfx",
        "*password*",
        "*secret*",
        "id_rsa*",
        ".aws/credentials"
    )
    
    $foundFiles = @()
    foreach ($pattern in $sensitivePatterns) {
        $files = Get-ChildItem -Path $ProjectRoot -Recurse -Include $pattern -Force 2>$null
        if ($files) {
            $foundFiles += $files
        }
    }
    
    if ($foundFiles.Count -gt 0) {
        Write-Host "Fichiers sensibles trouvés:" -ForegroundColor Red
        $foundFiles | ForEach-Object {
            Write-Host "- $($_.FullName)" -ForegroundColor Red
        }
        return @{
            Type = "sensitive"
            Count = $foundFiles.Count
            Details = $foundFiles
        }
    } else {
        Write-Host "Aucun fichier sensible trouvé ✓" -ForegroundColor Green
    }
    return $null
}

# Exécution des analyses
if ($Tool -eq "all" -or $Tool -eq "npm") {
    # Analyser le frontend
    $npmResult = Analyze-NpmPackages -Path "frontend"
    if ($npmResult) { $Results += $npmResult }
    
    # Analyser mobile si présent
    if (Test-Path "mobile") {
        $mobileResult = Analyze-NpmPackages -Path "mobile"
        if ($mobileResult) { $Results += $mobileResult }
    }
}

if ($Tool -eq "all" -or $Tool -eq "python") {
    # Analyser les services Python
    $pythonDirs = @("backend", "ai-services", "ai_services")
    foreach ($dir in $pythonDirs) {
        if (Test-Path $dir) {
            $pythonResult = Analyze-PythonPackages -Path $dir
            if ($pythonResult) { $Results += $pythonResult }
        }
    }
}

if ($Tool -eq "all" -or $Tool -eq "sensitive") {
    $sensitiveResult = Analyze-SensitiveFiles
    if ($sensitiveResult) { $Results += $sensitiveResult }
}

# Résumé final
Write-Host "`n" -NoNewline
Write-Host "=== RÉSUMÉ DE L'ANALYSE ===" -ForegroundColor Cyan
if ($Results.Count -eq 0) {
    Write-Host "✓ Aucun problème de sécurité détecté!" -ForegroundColor Green
} else {
    Write-Host "⚠ Problèmes détectés:" -ForegroundColor Yellow
    $Results | ForEach-Object {
        Write-Host "- $($_.Type): $($_.Count) problème(s) dans $($_.Path)" -ForegroundColor Yellow
    }
    
    Write-Host "`nRecommandations:" -ForegroundColor Cyan
    Write-Host "- Corrigez les vulnérabilités trouvées" -ForegroundColor White
    Write-Host "- Mettez à jour les dépendances" -ForegroundColor White
    Write-Host "- Ajoutez les fichiers sensibles au .gitignore" -ForegroundColor White
}

Write-Host "`nAnalyse terminée." -ForegroundColor Cyan
