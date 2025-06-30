#!/usr/bin/env python3
"""
Script de résolution des conflits de dépendances pour EduAI Enhanced
Résout automatiquement les conflits entre pydantic, typer et autres bibliothèques
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, cwd=None):
    """Exécuter une commande et retourner le résultat"""
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd,
            capture_output=True, 
            text=True,
            check=True
        )
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def fix_dependency_conflicts():
    """Résoudre les conflits de dépendances"""
    print("🔧 Résolution des conflits de dépendances pour EduAI Enhanced")
    print("=" * 60)
    
    # Récupérer le répertoire racine du projet
    project_root = Path(__file__).parent.parent
    backend_dir = project_root / "backend"
    ai_services_dir = project_root / "ai_services"
    
    print(f"📁 Répertoire du projet: {project_root}")
    
    # Étape 1: Mise à jour de pip
    print("\n1️⃣ Mise à jour de pip...")
    success, output = run_command("python -m pip install --upgrade pip")
    if success:
        print("   ✅ pip mis à jour")
    else:
        print(f"   ⚠️ Avertissement pip: {output}")
    
    # Étape 2: Installation des dépendances critiques en premier
    print("\n2️⃣ Installation des dépendances critiques...")
    critical_deps = [
        "pydantic==2.9.2",
        "pydantic-core>=2.23.0", 
        "typer>=0.16.0",
        "fastapi>=0.109.0",
        "uvicorn>=0.27.0"
    ]
    
    for dep in critical_deps:
        print(f"   📦 Installation de {dep}...")
        success, output = run_command(f"python -m pip install '{dep}' --upgrade")
        if success:
            print(f"   ✅ {dep} installé")
        else:
            print(f"   ❌ Erreur avec {dep}: {output}")
    
    # Étape 3: Installation backend
    if backend_dir.exists():
        print(f"\n3️⃣ Installation du backend ({backend_dir})...")
        req_file = backend_dir / "requirements.txt"
        if req_file.exists():
            success, output = run_command(
                f"python -m pip install -r requirements.txt --upgrade --force-reinstall",
                cwd=backend_dir
            )
            if success:
                print("   ✅ Backend installé avec succès")
            else:
                print(f"   ❌ Erreur backend: {output}")
        else:
            print(f"   ❌ Fichier requirements.txt non trouvé dans {backend_dir}")
    
    # Étape 4: Installation ai_services
    if ai_services_dir.exists():
        print(f"\n4️⃣ Installation des services IA ({ai_services_dir})...")
        req_file = ai_services_dir / "requirements.txt"
        if req_file.exists():
            success, output = run_command(
                f"python -m pip install -r requirements.txt --upgrade --force-reinstall",
                cwd=ai_services_dir
            )
            if success:
                print("   ✅ Services IA installés avec succès")
            else:
                print(f"   ❌ Erreur services IA: {output}")
        else:
            print(f"   ❌ Fichier requirements.txt non trouvé dans {ai_services_dir}")
    
    # Étape 5: Vérification des conflits
    print("\n5️⃣ Vérification des conflits...")
    success, output = run_command("python -m pip check")
    if success:
        print("   ✅ Aucun conflit détecté")
    else:
        print(f"   ⚠️ Conflits détectés:\n{output}")
        
        # Tentative de résolution automatique
        print("\n🔄 Tentative de résolution automatique...")
        
        # Désinstaller safety temporairement si elle pose problème
        run_command("python -m pip uninstall safety safety-schemas -y")
        
        # Réinstaller avec les bonnes versions
        run_command("python -m pip install 'pydantic>=2.9.0,<3.0.0'")
        run_command("python -m pip install 'typer>=0.16.0'")
        
        # Réinstaller safety avec les nouvelles dépendances
        run_command("python -m pip install safety")
    
    # Étape 6: Résumé final
    print("\n6️⃣ Vérification finale...")
    success, output = run_command("python -c \"import pydantic, typer, fastapi; print('✅ Modules principaux importés avec succès')\"")
    if success:
        print("   ✅ Installation réussie!")
        print("\n🎉 Conflits de dépendances résolus!")
    else:
        print(f"   ❌ Problème d'importation: {output}")
    
    # Afficher les versions installées
    print("\n📊 Versions installées:")
    packages = ["pydantic", "typer", "fastapi", "uvicorn"]
    for package in packages:
        success, output = run_command(f"python -c \"import {package}; print(f'{package}: {{version}}')\" 2>/dev/null || echo '{package}: Non installé'")
        if success:
            print(f"   {output.strip()}")

def create_fixed_requirements():
    """Créer des fichiers requirements.txt sans conflits"""
    project_root = Path(__file__).parent.parent
    
    # Backend requirements fixé
    backend_req = """# 🎓 EduAI Enhanced - Backend API (Version Compatible)
# IA Éducative Multilingue & Adaptive

# Core FastAPI Framework (Versions compatibles)
fastapi>=0.109.2,<0.110.0
uvicorn[standard]>=0.27.1,<0.28.0
pydantic>=2.9.0,<3.0.0
pydantic-settings>=2.1.0,<3.0.0
python-multipart>=0.0.6,<1.0.0
starlette>=0.27.0,<0.28.0

# HTTP Client for APIs
aiohttp>=3.9.0,<4.0.0
httpx>=0.25.0,<1.0.0

# Authentication & Security
python-jose[cryptography]>=3.3.0,<4.0.0
passlib[bcrypt]>=1.7.4,<2.0.0
python-dotenv>=1.0.0,<2.0.0
cryptography>=41.0.0,<42.0.0

# Development Tools (Versions compatibles)
typer>=0.16.0,<1.0.0
rich>=13.7.0,<14.0.0
watchdog>=3.0.0,<4.0.0

# Other dependencies...
"""
    
    backend_file = project_root / "backend" / "requirements-fixed.txt"
    with open(backend_file, 'w', encoding='utf-8') as f:
        f.write(backend_req)
    
    print(f"✅ Fichier requirements-fixed.txt créé: {backend_file}")

if __name__ == "__main__":
    try:
        fix_dependency_conflicts()
        create_fixed_requirements()
    except KeyboardInterrupt:
        print("\n⏹️ Arrêté par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        sys.exit(1)
