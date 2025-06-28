#!/bin/bash

# 🎓 EduAI Enhanced - Script de Configuration
# Installation et configuration complète du projet

echo "🎓 Configuration d'EduAI Enhanced..."
echo "🌍 PWA IA Éducative Multilingue & Adaptive"

# Vérification des prérequis
echo "🔍 Vérification des prérequis..."

# Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js non trouvé. Installez Node.js 18+ depuis https://nodejs.org/"
    exit 1
fi

# PNPM
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installation de PNPM..."
    npm install -g pnpm
    echo "✅ PNPM installé"
fi

# Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python non trouvé. Installez Python 3.11+ depuis https://python.org/"
    exit 1
fi

# MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB non trouvé. Installez MongoDB Community Edition"
    echo "   https://docs.mongodb.com/manual/installation/"
fi

# Redis
if ! command -v redis-server &> /dev/null; then
    echo "⚠️  Redis non trouvé. Installez Redis"
    echo "   https://redis.io/download"
fi

echo "✅ Prérequis vérifiés"

# Installation Frontend (PWA) avec PNPM
echo "📱 Installation du Frontend PWA avec PNPM..."
cd frontend
pnpm install
echo "✅ Frontend installé avec PNPM"

# Installation Backend (API)
echo "🔧 Installation du Backend API..."
cd ../backend
python3 -m pip install -r requirements.txt
echo "✅ Backend installé"

# Installation AI Services
echo "🤖 Installation des Services IA..."
cd ../ai-services
python3 -m pip install -r requirements.txt
echo "✅ Services IA installés"

# Configuration des variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."
cd ..

if [ ! -f .env ]; then
    echo "Création du fichier .env..."
    cat > .env << EOL
# 🎓 EduAI Enhanced - Configuration Environnement

# Environnement
ENVIRONMENT=development
DEBUG=true

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Base de données
MONGODB_URL=mongodb://localhost:27017
MONGODB_DB_NAME=eduai_enhanced
REDIS_URL=redis://localhost:6379

# Clés API (À configurer avec vos vraies clés)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here

# Hugging Face
HF_API_KEY=your_hf_api_key_here

# Google Cloud (pour traduction)
GOOGLE_CREDENTIALS_PATH=path/to/google-credentials.json
GOOGLE_PROJECT_ID=your_google_project_id

# Sécurité
SECRET_KEY=your_super_secret_key_change_in_production
EOL
    echo "✅ Fichier .env créé - N'oubliez pas de configurer vos clés API !"
else
    echo "ℹ️  Fichier .env existe déjà"
fi

# Création des dossiers nécessaires
echo "📁 Création des dossiers..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp
mkdir -p data/mongodb
mkdir -p data/redis

echo "✅ Dossiers créés"

# Message de fin
echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo "   1. Configurez vos clés API dans le fichier .env"
echo "   2. Démarrez MongoDB et Redis"
echo "   3. Lancez l'application avec: npm run dev"
echo ""
echo "📚 Documentation :"
echo "   - API Backend: http://localhost:8000/docs"
echo "   - AI Services: http://localhost:8001/ai/docs"
echo "   - Frontend PWA: http://localhost:3000"
echo ""
echo "🌍 Langues supportées : 50+ (Afrique, Amériques, Europe, Asie)"
echo "🚀 Fonctionnalités :"
echo "   ✅ PWA avec mode offline"
echo "   ✅ IA adaptative (GPT-4 + Whisper)"
echo "   ✅ Reconnaissance émotionnelle"
echo "   ✅ Traduction multilingue"
echo "   ✅ Speech-to-Text/Text-to-Speech"
echo ""
echo "Bon hackathon ! 🎓🚀"
