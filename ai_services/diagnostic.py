"""
Script de diagnostic pour les dépendances EduAI
"""

import sys
import importlib

def check_module(module_name, package_name=None):
    """Vérifier si un module peut être importé"""
    try:
        importlib.import_module(module_name)
        print(f"✅ {module_name} - OK")
        return True
    except ImportError as e:
        pkg_name = package_name or module_name
        print(f"❌ {module_name} - MANQUANT")
        print(f"   Installer avec: pip install {pkg_name}")
        return False

def main():
    print("=" * 50)
    print("🔍 DIAGNOSTIC DES DÉPENDANCES EDUAI")
    print("=" * 50)
    
    # Modules de base
    print("\n📦 Modules de base:")
    check_module("torch")
    check_module("numpy")
    check_module("scipy")
    
    # AI/ML
    print("\n🤖 Modules IA/ML:")
    check_module("transformers")
    check_module("openai")
    check_module("anthropic")
    
    # Vision
    print("\n👁️ Modules Vision:")
    check_module("cv2", "opencv-python")
    check_module("mediapipe")
    check_module("easyocr")
    check_module("ultralytics")
    check_module("PIL", "pillow")
    
    # Audio
    print("\n🔊 Modules Audio:")
    check_module("librosa")
    check_module("soundfile")
    check_module("speech_recognition")
    check_module("pydub")
    
    # API
    print("\n🔗 Modules API:")
    check_module("fastapi")
    check_module("uvicorn")
    check_module("aiohttp")
    
    print("\n=" * 50)
    print("✨ Diagnostic terminé !")
    print("=" * 50)

if __name__ == "__main__":
    main()
