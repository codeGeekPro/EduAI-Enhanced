#!/bin/bash
# Script pour supprimer les fichiers .bat de l'historique Git

echo "🗑️ Suppression des fichiers .bat de l'historique Git..."

# Liste des fichiers .bat à supprimer de l'historique
files_to_remove=(
    "demo_rapide.bat"
    "fix-ci-errors.bat" 
    "fix-lockfile.bat"
    "fix_and_launch.bat"
    "remove-secrets.bat"
    "stop_local_services.bat"
    "test_ai_services_only.bat"
    "test_all_services.bat"
    "test_backend_only.bat"
    "test_corrections.bat"
    "test_frontend_only.bat"
    "test_local_services.bat"
    "test_quick.bat"
    "test_services_final.bat"
    "test_simple.bat"
    "update-and-validate.bat"
    "validate_final_project.bat"
    "validate_project.bat"
)

# Supprimer chaque fichier de l'historique Git
for file in "${files_to_remove[@]}"; do
    echo "Suppression de $file de l'historique Git..."
    git filter-branch --force --index-filter \
        "git rm --cached --ignore-unmatch $file" \
        --prune-empty --tag-name-filter cat -- --all
done

echo "✅ Suppression terminée!"
echo "⚠️ ATTENTION: Vous devrez faire un 'git push --force' pour appliquer les changements sur GitHub"
echo "💡 Commande: git push --force origin main"
