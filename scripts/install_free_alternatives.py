#!/usr/bin/env python3
"""
Configuration des alternatives cloud gratuites pour EduAI Enhanced
(Sans installation locale de LLM)
"""

import os
import subprocess
import sys
import webbrowser

def setup_huggingface():
    """Configuration Hugging Face (Gratuit)"""
    print("� Configuration Hugging Face (API Gratuite)...")
    print("1. Créez un compte gratuit sur: https://huggingface.co/join")
    print("2. Allez sur: https://huggingface.co/settings/tokens")
    print("3. Créez un token avec accès 'Read'")
    print("4. Copiez le token dans votre fichier .env")
    print("   HF_API_KEY=hf_votre_token_ici")
    
    response = input("\n🔗 Ouvrir Hugging Face dans le navigateur ? (y/n): ")
    if response.lower() == 'y':
        webbrowser.open("https://huggingface.co/settings/tokens")

def setup_cohere():
    """Configuration Cohere (Gratuit)"""
    print("\n🚀 Configuration Cohere (API Gratuite)...")
    print("✅ 5M tokens gratuits par mois")
    print("1. Créez un compte sur: https://dashboard.cohere.ai/register")
    print("2. Obtenez votre API key gratuite")
    print("3. Ajoutez dans .env: COHERE_API_KEY=votre_key")
    
    response = input("\n🔗 Ouvrir Cohere dans le navigateur ? (y/n): ")
    if response.lower() == 'y':
        webbrowser.open("https://dashboard.cohere.ai/register")

def setup_replicate():
    """Configuration Replicate (Gratuit)"""
    print("\n� Configuration Replicate (API Gratuite)...")
    print("✅ $10 crédits gratuits par mois")
    print("1. Créez un compte sur: https://replicate.com/signin")
    print("2. Obtenez votre token API")
    print("3. Ajoutez dans .env: REPLICATE_API_TOKEN=votre_token")
    
    response = input("\n🔗 Ouvrir Replicate dans le navigateur ? (y/n): ")
    if response.lower() == 'y':
        webbrowser.open("https://replicate.com/signin")

def setup_google_ai():
    """Configuration Google AI Studio (Gratuit)"""
    print("\n� Configuration Google AI Studio (Gemini - Gratuit)...")
    print("✅ 60 requêtes par minute gratuites")
    print("1. Allez sur: https://makersuite.google.com/app/apikey")
    print("2. Créez une API key gratuite")
    print("3. Ajoutez dans .env: GOOGLE_AI_API_KEY=votre_key")
    
    response = input("\n🔗 Ouvrir Google AI Studio dans le navigateur ? (y/n): ")
    if response.lower() == 'y':
        webbrowser.open("https://makersuite.google.com/app/apikey")

def setup_web_apis():
    """Configuration des APIs Web natives"""
    print("\n🌐 APIs Web natives (Déjà intégrées - 100% Gratuit):")
    print("✅ Web Speech API - Recognition vocale")
    print("✅ Web Speech API - Synthèse vocale") 
    print("✅ IndexedDB - Stockage offline")
    print("✅ Service Workers - Cache offline")
    print("✅ WebRTC - Communication temps réel")

def install_minimal_packages():
    """Installation des packages Python minimaux"""
    print("\n📦 Installation des packages Python essentiels...")
    
    # Packages légers uniquement
    packages = [
        "requests",  # Pour les API calls
        "googletrans==4.0.0rc1",  # Traduction gratuite
        "python-multipart",  # Pour FastAPI
        "httpx",  # Client HTTP async
    ]
    
    for package in packages:
        print(f"Installation de {package}...")
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", package], check=True)
            print(f"✅ {package} installé")
        except subprocess.CalledProcessError:
            print(f"❌ Erreur installation {package}")

def create_demo_config():
    """Créer le fichier .env pour la démo"""
    env_content = """# 🎯 Configuration EduAI Enhanced - Alternatives Gratuites Cloud

# 🤗 Hugging Face (GRATUIT - OBLIGATOIRE)
HF_API_KEY=hf_YOUR_TOKEN_HERE
HF_MODEL_TEXT=microsoft/DialoGPT-medium
HF_MODEL_EMOTION=cardiffnlp/twitter-roberta-base-emotion

# 🚀 Cohere (5M tokens/mois gratuit)
COHERE_API_KEY=YOUR_KEY_HERE
COHERE_MODEL=command-light

# 🔄 Replicate ($10 crédits/mois gratuit)
REPLICATE_API_TOKEN=YOUR_TOKEN_HERE

# 🌟 Google AI Studio (Gemini - 60 req/min gratuit)
GOOGLE_AI_API_KEY=YOUR_KEY_HERE
GOOGLE_AI_MODEL=gemini-pro

# 🌐 APIs Natives (100% Gratuit)
WEB_SPEECH_ENABLED=true
OFFLINE_MODE_ENABLED=true

# 🗄️ Base de données (Local/Gratuit)
MONGODB_URL=mongodb://localhost:27017/eduai_demo
REDIS_URL=redis://localhost:6379

# 🔒 Sécurité
SECRET_KEY=demo-secret-key-change-in-production
ENVIRONMENT=demo
DEBUG=true

# 🌍 Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
DEMO_MODE=true
MOCK_RESPONSES=true
"""
    
    with open(".env.demo", "w", encoding="utf-8") as f:
        f.write(env_content)
    
    print("✅ Fichier .env.demo créé!")

def setup_free_alternatives():
    """Configuration complète des alternatives gratuites cloud"""
    print("🎯 Configuration EduAI Enhanced - Alternatives Cloud Gratuites")
    print("=" * 65)
    print("💡 Aucune installation locale de LLM requise!")
    print()
    
    # Installation packages minimaux
    install_minimal_packages()
    
    # Configuration services gratuits
    setup_huggingface()
    setup_cohere()
    setup_google_ai()
    setup_replicate()
    setup_web_apis()
    
    # Créer config démo
    create_demo_config()
    
    print("\n" + "=" * 65)
    print("🎉 Configuration terminée!")
    print("\n📋 Prochaines étapes:")
    print("1. Configurez au moins Hugging Face (obligatoire)")
    print("2. copy .env.demo .env")
    print("3. Éditez .env avec vos clés API")
    print("4. pnpm run dev")
    print("\n💰 Coût total: 0€/mois (avec limitations gratuites)")
    print("💡 Parfait pour démos et tests!")
    
if __name__ == "__main__":
    setup_free_alternatives()
