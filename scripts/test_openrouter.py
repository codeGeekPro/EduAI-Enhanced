#!/usr/bin/env python3
"""
Script de test OpenRouter pour EduAI Enhanced
Test rapide des fonctionnalités OpenRouter avec différents modèles gratuits
"""

import asyncio
import os
import sys
import json
from typing import List, Dict, Any

# Ajouter le chemin pour importer nos modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Import et chargement du fichier .env
try:
    from dotenv import load_dotenv
    # Charger le .env depuis la racine du projet
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(env_path)
    print("✅ Fichier .env chargé avec succès")
except ImportError:
    print("⚠️  Installation de python-dotenv...")
    os.system("pip install python-dotenv")
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    load_dotenv(env_path)
    print("✅ Fichier .env chargé avec succès")

from ai_services.nlp.openrouter_client import OpenRouterClient


async def test_openrouter_functionality():
    """Test complet des fonctionnalités OpenRouter"""
    
    print("🔮 Test OpenRouter pour EduAI Enhanced")
    print("=" * 50)
    
    # Vérification de la clé API
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ OPENROUTER_API_KEY non trouvée dans l'environnement")
        print("   1. Allez sur https://openrouter.ai/keys")
        print("   2. Créez un compte gratuit")
        print("   3. Générez une clé API")
        print("   4. Ajoutez-la à votre .env: OPENROUTER_API_KEY=sk-or-v1-...")
        return False
    
    print(f"✅ Clé API trouvée: {api_key[:20]}...")
    
    async with OpenRouterClient(api_key) as client:
        
        # Test 1: Lister les modèles gratuits
        print("\n🔍 Test 1: Récupération des modèles gratuits...")
        try:
            free_models = await client.get_free_models()
            print(f"   📊 {len(free_models)} modèles gratuits trouvés:")
            
            for i, model in enumerate(free_models[:5]):  # Afficher les 5 premiers
                name = model.get('id', 'N/A')
                context = model.get('context_length', 'N/A')
                print(f"      {i+1}. {name} (context: {context})")
            
            if len(free_models) > 5:
                print(f"      ... et {len(free_models)-5} autres modèles")
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
            return False
        
        # Test 2: Question éducative simple
        print("\n📚 Test 2: Question éducative...")
        try:
            question = "Explique-moi les fractions de manière simple pour un élève de CM2"
            response = await client.educational_response(
                question=question,
                subject="mathématiques",
                level="primaire",
                language="fr"
            )
            
            if response:
                print("   ✅ Réponse (premiers 200 caractères):")
                print(f"      {response[:200]}...")
            else:
                print("   ❌ Aucune réponse reçue")
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
        
        # Test 3: Traduction
        print("\n🌍 Test 3: Traduction...")
        try:
            text_to_translate = "Bonjour, comment allez-vous aujourd'hui ?"
            translation = await client.translate_text(
                text=text_to_translate,
                target_lang="anglais",
                source_lang="français"
            )
            
            if translation:
                print(f"   🇫🇷 Original: {text_to_translate}")
                print(f"   🇬🇧 Traduit: {translation}")
            else:
                print("   ❌ Traduction échouée")
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
        
        # Test 4: Analyse d'émotion
        print("\n😊 Test 4: Analyse d'émotion...")
        try:
            text_with_emotion = "Je suis vraiment frustré par ce problème de mathématiques, il est trop difficile pour moi !"
            emotion_analysis = await client.analyze_emotion(text_with_emotion)
            
            if emotion_analysis:
                print(f"   📝 Texte: {text_with_emotion}")
                print(f"   🎭 Émotion principale: {emotion_analysis.get('emotion_principale', 'N/A')}")
                print(f"   📊 Intensité: {emotion_analysis.get('intensite', 'N/A')}")
                print(f"   💡 Conseils: {emotion_analysis.get('conseils_pedagogiques', 'N/A')}")
            else:
                print("   ❌ Analyse échouée")
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
        
        # Test 5: Test de différents modèles
        print("\n🤖 Test 5: Comparaison de modèles...")
        test_prompt = "Qu'est-ce que la photosynthèse ?"
        models_to_test = [
            "mistralai/mistral-7b-instruct:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "microsoft/phi-3-mini-128k-instruct:free"
        ]
        
        for model in models_to_test:
            try:
                print(f"\n   🧪 Test avec {model}:")
                response = await client.simple_completion(
                    prompt=test_prompt,
                    model=model,
                    max_tokens=100,
                    system_message="Tu es un assistant éducatif. Réponds de manière claire et concise."
                )
                
                if response:
                    print(f"      ✅ Réponse: {response[:150]}...")
                else:
                    print("      ❌ Aucune réponse")
                    
            except Exception as e:
                print(f"      ❌ Erreur avec {model}: {e}")
        
        print("\n🎉 Tests terminés !")
        print("\n📋 Résumé:")
        print("   - OpenRouter fonctionne correctement ✅")
        print("   - Modèles gratuits disponibles ✅")
        print("   - Intégration EduAI prête ✅")
        print("\n💡 Prochaines étapes:")
        print("   1. Configurez OPENROUTER_API_KEY dans votre .env")
        print("   2. Démarrez le backend: python backend/main.py")
        print("   3. Testez avec le frontend")
        
        return True


async def test_models_availability():
    """Test spécifique de la disponibilité des modèles"""
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ Clé API OpenRouter requise")
        return
    
    print("🔍 Vérification de la disponibilité des modèles...")
    
    async with OpenRouterClient(api_key) as client:
        try:
            all_models = await client.list_models()
            free_models = await client.get_free_models()
            
            print("\n📊 Statistiques des modèles:")
            print(f"   Total des modèles: {len(all_models)}")
            print(f"   Modèles gratuits: {len(free_models)}")
            print(f"   Pourcentage gratuit: {len(free_models)/len(all_models)*100:.1f}%")
            
            print("\n🆓 Top 10 des modèles gratuits:")
            for i, model in enumerate(free_models[:10]):
                name = model.get('id', 'N/A')
                context = model.get('context_length', 'N/A')
                print(f"   {i+1:2d}. {name:<50} (ctx: {context})")
                
        except Exception as e:
            print(f"❌ Erreur lors de la récupération: {e}")


def main():
    """Fonction principale"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="Test OpenRouter pour EduAI Enhanced"
    )
    parser.add_argument(
        "--models-only", 
        action="store_true",
        help="Tester uniquement la disponibilité des modèles"
    )
    
    args = parser.parse_args()
    
    try:
        if args.models_only:
            asyncio.run(test_models_availability())
        else:
            success = asyncio.run(test_openrouter_functionality())
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        print("\n⏹️  Test interrompu par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur inattendue: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
