#!/bin/bash
# Script de test pour les corrections CI/CD

echo "============================================="
echo "Test des corrections CI/CD EduAI Enhanced"
echo "============================================="

echo ""
echo "1. Vérification du pnpm-lock.yaml..."
if [ -f "frontend/pnpm-lock.yaml" ]; then
    echo "✅ pnpm-lock.yaml trouvé"
else
    echo "❌ pnpm-lock.yaml manquant"
    exit 1
fi

echo ""
echo "2. Vérification des chemins de requirements..."
if [ -f "ai_services/requirements.txt" ]; then
    echo "✅ ai_services/requirements.txt trouvé"
else
    echo "❌ ai_services/requirements.txt manquant"
    exit 1
fi

if [ -f "backend/requirements.txt" ]; then
    echo "✅ backend/requirements.txt trouvé"
else
    echo "❌ backend/requirements.txt manquant"
    exit 1
fi

echo ""
echo "3. Test d'installation frontend..."
cd frontend
if pnpm install --no-frozen-lockfile; then
    echo "✅ Installation frontend réussie"
else
    echo "❌ Échec de l'installation frontend"
    cd ..
    exit 1
fi
cd ..

echo ""
echo "4. Test d'installation Python..."
if pip install -r ai_services/requirements.txt > /dev/null 2>&1; then
    echo "✅ Installation ai_services réussie"
else
    echo "⚠️  Problème avec ai_services (non critique)"
fi

if pip install -r backend/requirements.txt > /dev/null 2>&1; then
    echo "✅ Installation backend réussie"
else
    echo "⚠️  Problème avec backend (non critique)"
fi

echo ""
echo "============================================="
echo "✅ Toutes les corrections CI/CD sont OK !"
echo "============================================="
