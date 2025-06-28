#!/bin/bash

# 🔄 Script de migration de npm vers pnpm pour EduAI Enhanced

echo "🔄 Migration de npm vers pnpm..."

# Fonction pour nettoyer les node_modules et package-lock.json
cleanup_npm() {
    echo "🧹 Nettoyage des fichiers npm..."
    
    # Supprimer node_modules et package-lock.json
    find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
    find . -name "package-lock.json" -delete 2>/dev/null
    find . -name "yarn.lock" -delete 2>/dev/null
    
    echo "✅ Nettoyage terminé"
}

# Fonction pour installer pnpm
install_pnpm() {
    if ! command -v pnpm &> /dev/null; then
        echo "📦 Installation de pnpm..."
        npm install -g pnpm
        echo "✅ pnpm installé"
    else
        echo "✅ pnpm déjà installé"
    fi
}

# Fonction pour configurer le workspace
setup_workspace() {
    echo "🏗️  Configuration du workspace pnpm..."
    
    # Créer pnpm-workspace.yaml s'il n'existe pas
    if [ ! -f "pnpm-workspace.yaml" ]; then
        cat > pnpm-workspace.yaml << EOF
# Configuration de l'espace de travail PNPM pour EduAI Enhanced
packages:
  - 'frontend'
  - 'mobile'
  - 'packages/*'
  
# Exclusions
exclude:
  - '**/node_modules/**'
  - '**/dist/**'
  - '**/build/**'
  - '**/.next/**'
EOF
    fi
    
    # Créer .npmrc s'il n'existe pas
    if [ ! -f ".npmrc" ]; then
        cat > .npmrc << EOF
# Configuration PNPM pour EduAI Enhanced
shared-workspace-lockfile=true
link-workspace-packages=true
prefer-frozen-lockfile=true
auto-install-peers=true
hoist=true
EOF
    fi
    
    echo "✅ Workspace configuré"
}

# Fonction pour installer les dépendances
install_dependencies() {
    echo "📦 Installation des dépendances avec pnpm..."
    
    # Installation des dépendances du workspace
    pnpm install
    
    echo "✅ Dépendances installées"
}

# Fonction pour mettre à jour les scripts
update_scripts() {
    echo "📝 Mise à jour des scripts..."
    
    # Chercher et remplacer npm par pnpm dans les scripts
    find . -name "*.sh" -o -name "*.bat" -o -name "*.md" | xargs sed -i 's/npm install/pnpm install/g' 2>/dev/null
    find . -name "*.sh" -o -name "*.bat" -o -name "*.md" | xargs sed -i 's/npm run/pnpm/g' 2>/dev/null
    find . -name "*.sh" -o -name "*.bat" -o -name "*.md" | xargs sed -i 's/npm start/pnpm start/g' 2>/dev/null
    
    echo "✅ Scripts mis à jour"
}

# Exécution de la migration
main() {
    echo "🎯 Début de la migration npm → pnpm"
    echo "=================================="
    
    cleanup_npm
    install_pnpm
    setup_workspace
    install_dependencies
    update_scripts
    
    echo "=================================="
    echo "🎉 Migration terminée avec succès!"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Vérifiez que tout fonctionne: pnpm dev"
    echo "   2. Committez les changements"
    echo "   3. Informez l'équipe du changement"
    echo ""
    echo "💡 Commandes pnpm utiles:"
    echo "   - pnpm install         # Installer les dépendances"
    echo "   - pnpm dev            # Démarrer le développement"
    echo "   - pnpm build          # Construire le projet"
    echo "   - pnpm test           # Lancer les tests"
}

# Vérification que nous sommes dans le bon répertoire
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Veuillez exécuter ce script depuis la racine du projet EduAI Enhanced"
    exit 1
fi

main
