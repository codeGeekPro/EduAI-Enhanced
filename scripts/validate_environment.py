#!/usr/bin/env python3
"""
Script de validation de l'environnement EduAI
Vérifie que toutes les dépendances sont correctement installées
"""

import sys
import importlib
import subprocess

def check_package(package_name, import_name=None):
    """Vérifie si un package est installé et importable"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'Unknown')
        print(f"✅ {package_name}: {version}")
        return True
    except ImportError:
        print(f"❌ {package_name}: Not found")
        return False

def main():
    print("🔍 Validation de l'environnement EduAI")
    print("=" * 50)
    
    # Vérification Python
    python_version = sys.version.split()[0]
    print(f"🐍 Python: {python_version}")
    
    if not python_version.startswith(('3.10', '3.11')):
        print("⚠️  Attention: Python 3.10 ou 3.11 recommandé")
    
    print("\n📦 Vérification des packages critiques:")
    
    critical_packages = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('torch', 'torch'),
        ('tensorflow', 'tensorflow'),
        ('transformers', 'transformers'),
        ('opencv-python', 'cv2'),
        ('numpy', 'numpy'),
        ('pandas', 'pandas'),
        ('redis', 'redis'),
        ('pymongo', 'pymongo'),
    ]
    
    failed_packages = []
    
    for package_name, import_name in critical_packages:
        if not check_package(package_name, import_name):
            failed_packages.append(package_name)
    
    print("\n🧪 Test des modules AI:")
    
    # Test des modules AI locaux
    ai_modules = [
        'ai_services.nlp.text_processor',
        'ai_services.emotion.emotion_analyzer',
        'ai_services.speech.speech_processor',
        'ai_services.vision.vision_processor',
    ]
    
    for module in ai_modules:
        try:
            importlib.import_module(module)
            print(f"✅ {module}")
        except ImportError as e:
            print(f"❌ {module}: {e}")
            failed_packages.append(module)
    
    print("\n" + "=" * 50)
    
    if not failed_packages:
        print("🎉 Tous les packages sont correctement installés!")
        print("🚀 Votre environnement EduAI est prêt!")
    else:
        print(f"⚠️  {len(failed_packages)} packages manquants:")
        for package in failed_packages:
            print(f"   - {package}")
        print("\n💡 Installez les packages manquants avec:")
        print("   pip install -r requirements.txt")
    
    return len(failed_packages) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
