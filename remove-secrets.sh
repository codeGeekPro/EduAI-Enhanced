#!/bin/bash

echo "🔒 Suppression des secrets de l'historique Git..."

# Supprimer le fichier .env.demo de tout l'historique Git
git filter-branch --force --index-filter \
    "git rm --cached --ignore-unmatch .env.demo" \
    --prune-empty --tag-name-filter cat -- --all

# Forcer la suppression des refs de sauvegarde
rm -rf .git/refs/original/

# Nettoyer et compacter le repository
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo "✅ Nettoyage terminé. Le fichier .env.demo a été supprimé de l'historique."
echo "⚠️  ATTENTION: Ceci réécrit l'historique Git !"
