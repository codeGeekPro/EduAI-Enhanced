#!/usr/bin/env python3
"""
Test script pour vérifier que la correction de l'import BaseSettings fonctionne
"""

import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.core.config import Settings
    settings = Settings()
    print("✅ SUCCESS: Import BaseSettings depuis pydantic-settings réussi!")
    print(f"✅ Configuration chargée: {settings.app_name} v{settings.app_version}")
    print(f"✅ Environnement: {settings.environment}")
    print(f"✅ Port API: {settings.api_port}")
except ImportError as e:
    print(f"❌ ERREUR D'IMPORT: {e}")
    sys.exit(1)
except Exception as e:
    print(f"❌ ERREUR: {e}")
    sys.exit(1)

print("\n🎉 Test réussi! Le backend peut maintenant démarrer correctement.")
