#!/bin/bash
# 🔧 Script de résolution des conflits de dépendances
# Fix Dependency Conflicts for EduAI Enhanced

echo "🔧 Résolution des conflits de dépendances EduAI Enhanced..."

# Backend dependencies
echo "📦 Installation des dépendances backend..."
cd backend
pip install --upgrade pip
pip install --no-deps fastapi==0.109.2
pip install --no-deps uvicorn[standard]==0.27.1
pip install --no-deps pydantic==2.9.2

# Installer le reste des dépendances
pip install -r requirements.txt --no-deps || true
pip install -r requirements.txt

# AI Services dependencies  
echo "🤖 Installation des dépendances AI services..."
cd ../ai_services
pip install --upgrade pip
pip install --no-deps fastapi==0.109.2
pip install --no-deps uvicorn[standard]==0.27.1
pip install --no-deps pydantic==2.9.2

# Installer le reste des dépendances
pip install -r requirements.txt --no-deps || true
pip install -r requirements.txt

echo "✅ Résolution des conflits terminée !"

# Retour au répertoire racine
cd ..

echo "🧪 Test de l'installation..."
python -c "import fastapi, uvicorn, pydantic; print('✅ Dependencies OK')"

echo "🎉 Prêt pour le déploiement !"
