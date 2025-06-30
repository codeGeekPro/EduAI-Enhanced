# Script PowerShell pour exécuter Codacy CLI via Docker
# Usage: .\codacy-analyze.ps1 [tool] [file]

param(
    [string]$Tool = "",
    [string]$File = ""
)

$WorkingDir = Get-Location
$DockerArgs = @(
    "run", "--rm", "-it",
    "-v", "${WorkingDir}:/code",
    "-v", "/var/run/docker.sock:/var/run/docker.sock",
    "--privileged",
    "codacy/codacy-analysis-cli:latest",
    "analyze",
    "--directory", "/code"
)

if ($Tool -ne "") {
    $DockerArgs += "--tool", $Tool
}

if ($File -ne "") {
    $DockerArgs += "--file", $File
}

Write-Host "Exécution de Codacy CLI avec Docker..." -ForegroundColor Green
Write-Host "Commande: docker $($DockerArgs -join ' ')" -ForegroundColor Yellow

& docker @DockerArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "Analyse Codacy terminée avec succès!" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de l'analyse Codacy (Code: $LASTEXITCODE)" -ForegroundColor Red
}
