@echo off
REM 🎓 EduAI Enhanced - Windows Setup Script
REM Complete project installation and configuration

echo 🎓 Setting up EduAI Enhanced...
echo 🌍 Multilingual ^& Adaptive AI Education PWA

REM Vérification des prérequis
echo 🔍 Vérification des prérequis...

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js non trouvé. Installez Node.js 18+ depuis https://nodejs.org/
    pause
    exit /b 1
)

where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installation de PNPM...
    call npm install -g pnpm
    if %errorlevel% neq 0 (
        echo ❌ Erreur installation PNPM
        pause
        exit /b 1
    )
    echo ✅ PNPM installé
)

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Python non trouvé. Installez Python 3.11+ depuis https://python.org/
    pause
    exit /b 1
)

echo ✅ Prérequis vérifiés

REM Installation Frontend (PWA) avec PNPM
echo 📱 Installation du Frontend PWA avec PNPM...
cd frontend
call pnpm install
if %errorlevel% neq 0 (
    echo ❌ Erreur installation frontend
    pause
    exit /b 1
)
echo ✅ Frontend installé avec PNPM

REM Installation Backend (API)
echo 🔧 Installation du Backend API...
cd ..\backend
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Erreur installation backend
    pause
    exit /b 1
)
echo ✅ Backend installé

REM Installation AI Services
echo 🤖 Installation des Services IA...
cd ..\ai-services
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo ❌ Erreur installation services IA
    pause
    exit /b 1
)
echo ✅ Services IA installés

REM Configuration des variables d'environnement
echo ⚙️ Configuration des variables d'environnement...
cd ..

if not exist .env (
    echo Création du fichier .env...
    (
        echo # 🎓 EduAI Enhanced - Configuration Environnement
        echo.
        echo # Environnement
        echo ENVIRONMENT=development
        echo DEBUG=true
        echo.
        echo # API Configuration
        echo API_HOST=0.0.0.0
        echo API_PORT=8000
        echo.
        echo # Base de données
        echo MONGODB_URL=mongodb://localhost:27017
        echo MONGODB_DB_NAME=eduai_enhanced
        echo REDIS_URL=redis://localhost:6379
        echo.
        echo # Clés API ^(À configurer avec vos vraies clés^)
        echo OPENAI_API_KEY=your_openai_api_key_here
        echo ANTHROPIC_API_KEY=your_anthropic_api_key_here
        echo ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
        echo PINECONE_API_KEY=your_pinecone_api_key_here
        echo.
        echo # Hugging Face
        echo HF_API_KEY=your_hf_api_key_here
        echo.
        echo # Google Cloud ^(pour traduction^)
        echo GOOGLE_CREDENTIALS_PATH=path/to/google-credentials.json
        echo GOOGLE_PROJECT_ID=your_google_project_id
        echo.
        echo # Sécurité
        echo SECRET_KEY=your_super_secret_key_change_in_production
    ) > .env
    echo ✅ Fichier .env créé - N'oubliez pas de configurer vos clés API !
) else (
    echo ℹ️ Fichier .env existe déjà
)

REM Création des dossiers nécessaires
echo 📁 Création des dossiers...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist temp mkdir temp
if not exist data\mongodb mkdir data\mongodb
if not exist data\redis mkdir data\redis

echo ✅ Dossiers créés

REM Message de fin
echo.
echo 🎉 Configuration terminée !
echo.
echo 📋 Next steps:
echo    1. Configure your API keys in the .env file
echo    2. Start MongoDB and Redis
echo    3. Launch the application with: pnpm run dev
echo.
echo 📚 Documentation:
echo    - API Backend: http://localhost:8000/docs
echo    - AI Services: http://localhost:8001/ai/docs
echo    - Frontend PWA: http://localhost:3000
echo.
echo 🌍 Supported languages: 50+ ^(Africa, Americas, Europe, Asia^)
echo 🚀 Features:
echo    ✅ PWA with offline mode
echo    ✅ Adaptive AI ^(GPT-4 + Whisper^)
echo    ✅ Emotion recognition
echo    ✅ Multilingual translation
echo    ✅ Speech-to-Text/Text-to-Speech
echo.
echo Happy hackathon! 🎓🚀

pause
