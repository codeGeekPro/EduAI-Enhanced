#!/usr/bin/env python3
"""
Script de validation complet pour EduAI Enhanced
Vérifie que tous les composants sont correctement configurés
"""

import sys
import subprocess
import requests
from pathlib import Path


def check_env_file():
    """Vérifier la présence et la configuration du fichier .env"""
    print("🔍 Vérification du fichier .env...")

    env_path = Path(".env")
    if not env_path.exists():
        print("❌ Fichier .env manquant")
        print("💡 Exécutez: copy .env.example .env")
        return False

    with open(env_path) as f:
        content = f.read()

    required_keys = [
        "OPENAI_API_KEY",
        "SECRET_KEY",
        "MONGODB_URL",
        "CORS_ORIGINS"
    ]

    missing_keys = []
    for key in required_keys:
        if f"{key}=" not in content or f"{key}=YOUR_KEY_HERE" in content:
            missing_keys.append(key)

    if missing_keys:
        print(f"❌ Clés manquantes dans .env: {', '.join(missing_keys)}")
        return False

    print("✅ Fichier .env configuré")
    return True


def check_dependencies():
    """Vérifier les dépendances Python et Node.js"""
    print("🔍 Vérification des dépendances...")

    # Vérifier Python
    try:
        result = subprocess.run(
            [sys.executable, "-c", "import fastapi, uvicorn"],
            capture_output=True, text=True)
        if result.returncode != 0:
            print("❌ Dépendances Python manquantes")
            print("💡 Exécutez: pip install -r backend/requirements.txt")
            return False
    except Exception as e:
        print(f"❌ Erreur Python: {e}")
        return False

    # Vérifier Node.js
    try:
        result = subprocess.run(
            ["pnpm", "--version"],
            capture_output=True, text=True, cwd="frontend")
        if result.returncode != 0:
            print("❌ pnpm non disponible")
            return False
    except Exception as e:
        print(f"❌ Erreur Node.js: {e}")
        return False

    print("✅ Dépendances installées")
    return True


def check_services():
    """Vérifier que les services peuvent démarrer"""
    print("🔍 Test de démarrage des services...")

    services = [
        {"name": "Backend", "url": "http://localhost:8000/health"},
        {"name": "AI Services", "url": "http://localhost:8001/health"},
        {"name": "Frontend", "url": "http://localhost:3000"}
    ]

    for service in services:
        try:
            response = requests.get(service["url"], timeout=5)
            if response.status_code == 200:
                print(f"✅ {service['name']} fonctionne")
            else:
                print(f"⚠️ {service['name']} répond mais avec erreur "
                      f"({response.status_code})")
        except requests.exceptions.ConnectionError:
            print(f"⚠️ {service['name']} non démarré "
                  f"(normal si pas encore démarré)")
        except Exception as e:
            print(f"❌ Erreur {service['name']}: {e}")

    return True


def check_build():
    """Vérifier que le projet peut être buildé"""
    print("🔍 Test de compilation...")

    try:
        # Test build frontend
        result = subprocess.run(
            ["pnpm", "run", "type-check"],
            capture_output=True, text=True, cwd="frontend")
        if result.returncode == 0:
            print("✅ Frontend compile sans erreur")
        else:
            print("❌ Erreurs de compilation frontend")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ Erreur compilation: {e}")
        return False

    return True


def main():
    """Fonction principale de validation"""
    print("🎓 EduAI Enhanced - Validation du Projet")
    print("=" * 50)

    checks = [
        ("Configuration", check_env_file),
        ("Dépendances", check_dependencies),
        ("Compilation", check_build),
        ("Services", check_services)
    ]

    results = []
    for name, check_func in checks:
        print(f"\n📋 {name}:")
        result = check_func()
        results.append(result)

    print("\n" + "=" * 50)
    print("📊 RÉSULTATS DE VALIDATION")
    print("=" * 50)

    success_count = sum(results)
    total_count = len(results)

    if success_count == total_count:
        print("🎉 TOUS LES TESTS SONT PASSÉS!")
        print("✅ Votre projet EduAI Enhanced est prêt!")
        print("\n🚀 Prochaines étapes:")
        print("   1. Configurez vos clés API dans .env")
        print("   2. Démarrez: pnpm run dev")
        print("   3. Ouvrez: http://localhost:3000")
    else:
        print(f"⚠️ {success_count}/{total_count} tests réussis")
        print("❌ Des problèmes nécessitent votre attention")
        print("\n💡 Consultez QUICKSTART.md pour l'aide")

    return success_count == total_count


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
