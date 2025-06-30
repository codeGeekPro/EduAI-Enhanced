@echo off
REM Script batch pour executer Codacy CLI via Docker
REM Usage: codacy-analyze.bat [tool] [file]

set TOOL=%1
set FILE=%2
set CURRENT_DIR=%cd%

echo Demarrage de l'analyse Codacy...
echo Repertoire de travail: %CURRENT_DIR%

if "%TOOL%"=="" (
    echo Execution de l'analyse complete...
    docker run --rm -v "%CURRENT_DIR%:/code" -v /var/run/docker.sock:/var/run/docker.sock --privileged codacy/codacy-analysis-cli:latest analyze --directory /code
) else if "%FILE%"=="" (
    echo Execution avec l'outil: %TOOL%
    docker run --rm -v "%CURRENT_DIR%:/code" -v /var/run/docker.sock:/var/run/docker.sock --privileged codacy/codacy-analysis-cli:latest analyze --directory /code --tool %TOOL%
) else (
    echo Execution avec l'outil: %TOOL% sur le fichier: %FILE%
    docker run --rm -v "%CURRENT_DIR%:/code" -v /var/run/docker.sock:/var/run/docker.sock --privileged codacy/codacy-analysis-cli:latest analyze --directory /code --tool %TOOL% --file %FILE%
)

if %ERRORLEVEL% equ 0 (
    echo.
    echo Analyse Codacy terminee avec succes!
) else (
    echo.
    echo Erreur lors de l'analyse Codacy ^(Code: %ERRORLEVEL%^)
    echo.
    echo Verifiez que Docker Desktop est demarre et que vous etes connecte a Internet.
)

pause
