"""
Client OpenRouter pour EduAI Enhanced
Intégration avec l'API OpenRouter pour accéder à de multiples modèles gratuits
"""

import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Union, Sequence
from dataclasses import dataclass
import aiohttp
import time

logger = logging.getLogger(__name__)


@dataclass
class OpenRouterResponse:
    """Structure de réponse d'OpenRouter"""
    text: str
    model: str
    tokens_used: int
    cost: float = 0.0
    
    
@dataclass 
class OpenRouterMessage:
    """Message au format OpenRouter/OpenAI"""
    role: str  # "system", "user", "assistant"
    content: str


class OpenRouterClient:
    """
    Client pour l'API OpenRouter
    Prend en charge les modèles gratuits et payants
    """
    
    FREE_MODELS = {
        "mistral-7b": "mistralai/mistral-7b-instruct:free",
        "llama-3.1-8b": "meta-llama/llama-3.1-8b-instruct:free", 
        "phi-3-mini": "microsoft/phi-3-mini-128k-instruct:free",
        "gemma-7b": "google/gemma-7b-it:free",
        "qwen-7b": "qwen/qwen-2-7b-instruct:free"
    }
    
    def __init__(self, api_key: str, base_url: str = "https://openrouter.ai/api/v1"):
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.session: Optional[aiohttp.ClientSession] = None
        self.rate_limit = {
            'requests_per_minute': 60,  # Limite par défaut
            'requests_count': 0,
            'window_start': time.time()
        }
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Obtenir la session HTTP réutilisable"""
        if self.session is None or self.session.closed:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://eduai-enhanced.com",  # Requis par OpenRouter
                "X-Title": "EduAI Enhanced"  # Nom de l'app
            }
            
            timeout = aiohttp.ClientTimeout(total=30)
            self.session = aiohttp.ClientSession(
                headers=headers,
                timeout=timeout
            )
        
        return self.session
    
    async def _check_rate_limit(self):
        """Vérifier et respecter les limites de taux"""
        current_time = time.time()
        
        # Reset du compteur si nouvelle fenêtre
        if current_time - self.rate_limit['window_start'] >= 60:
            self.rate_limit['requests_count'] = 0
            self.rate_limit['window_start'] = current_time
        
        # Attendre si limite atteinte
        if self.rate_limit['requests_count'] >= self.rate_limit['requests_per_minute']:
            wait_time = 60 - (current_time - self.rate_limit['window_start'])
            if wait_time > 0:
                logger.info(f"Limite de taux atteinte, attente de {wait_time:.1f}s")
                await asyncio.sleep(wait_time)
                self.rate_limit['requests_count'] = 0
                self.rate_limit['window_start'] = time.time()
        
        self.rate_limit['requests_count'] += 1
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """Lister tous les modèles disponibles"""
        try:
            await self._check_rate_limit()
            session = await self._get_session()
            
            async with session.get(f"{self.base_url}/models") as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get('data', [])
                else:
                    error_text = await response.text()
                    logger.error(f"Erreur lors de la récupération des modèles: {error_text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Erreur de connexion OpenRouter: {e}")
            return []
    
    async def get_free_models(self) -> List[Dict[str, Any]]:
        """Obtenir uniquement les modèles gratuits"""
        all_models = await self.list_models()
        free_models = []
        
        for model in all_models:
            # Vérifier si le modèle est gratuit
            pricing = model.get('pricing', {})
            prompt_cost = pricing.get('prompt', '0')
            completion_cost = pricing.get('completion', '0')
            
            if prompt_cost == '0' and completion_cost == '0':
                free_models.append(model)
        
        return free_models
    
    async def chat_completion(
        self,
        messages: Sequence[Union[OpenRouterMessage, Dict[str, str]]],
        model: str = "mistralai/mistral-7b-instruct:free",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Optional[OpenRouterResponse]:
        """
        Complétion de chat avec OpenRouter
        
        Args:
            messages: Liste des messages de conversation
            model: Modèle à utiliser
            max_tokens: Nombre maximum de tokens
            temperature: Créativité (0.0 à 1.0)
        """
        try:
            await self._check_rate_limit()
            session = await self._get_session()
            
            # Conversion des messages au format correct
            formatted_messages = []
            for msg in messages:
                if isinstance(msg, OpenRouterMessage):
                    formatted_messages.append({
                        "role": msg.role,
                        "content": msg.content
                    })
                elif isinstance(msg, dict):
                    formatted_messages.append(msg)
                else:
                    logger.warning(f"Format de message non reconnu: {type(msg)}")
                    continue
            
            # Payload pour l'API
            payload = {
                "model": model,
                "messages": formatted_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
                **kwargs
            }
            
            async with session.post(
                f"{self.base_url}/chat/completions",
                json=payload
            ) as response:
                
                if response.status == 200:
                    data = await response.json()
                    
                    # Extraction de la réponse
                    choice = data.get('choices', [{}])[0]
                    message = choice.get('message', {})
                    content = message.get('content', '')
                    
                    # Métadonnées d'utilisation
                    usage = data.get('usage', {})
                    tokens_used = usage.get('total_tokens', 0)
                    
                    return OpenRouterResponse(
                        text=content,
                        model=model,
                        tokens_used=tokens_used,
                        cost=0.0  # Gratuit pour les modèles free
                    )
                    
                else:
                    error_text = await response.text()
                    logger.error(f"Erreur OpenRouter ({response.status}): {error_text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Erreur lors de la complétion chat: {e}")
            return None
    
    async def simple_completion(
        self,
        prompt: str,
        model: str = "mistralai/mistral-7b-instruct:free",
        max_tokens: int = 500,
        system_message: str = "Tu es un assistant IA éducatif bienveillant."
    ) -> Optional[str]:
        """
        Complétion simple avec un prompt
        
        Args:
            prompt: Texte d'entrée
            model: Modèle à utiliser
            max_tokens: Nombre maximum de tokens
            system_message: Message système
        """
        messages = [
            OpenRouterMessage("system", system_message),
            OpenRouterMessage("user", prompt)
        ]
        
        response = await self.chat_completion(
            messages=messages,
            model=model,
            max_tokens=max_tokens
        )
        
        return response.text if response else None
    
    async def educational_response(
        self,
        question: str,
        subject: str = "général",
        level: str = "collège",
        language: str = "fr",
        model: str = "mistralai/mistral-7b-instruct:free"
    ) -> Optional[str]:
        """
        Réponse éducative adaptée
        
        Args:
            question: Question de l'étudiant
            subject: Matière (mathématiques, sciences, etc.)
            level: Niveau scolaire
            language: Langue de réponse
            model: Modèle à utiliser
        """
        system_messages = {
            "fr": f"Tu es un tuteur IA spécialisé en {subject} pour le niveau {level}. "
                  f"Réponds de manière pédagogique, claire et bienveillante en français.",
            "en": f"You are an AI tutor specialized in {subject} for {level} level. "
                  f"Answer pedagogically, clearly and kindly in English.",
            "es": f"Eres un tutor IA especializado en {subject} para el nivel {level}. "
                  f"Responde de manera pedagógica, clara y amable en español."
        }
        
        system_message = system_messages.get(language, system_messages["fr"])
        
        return await self.simple_completion(
            prompt=question,
            model=model,
            system_message=system_message,
            max_tokens=800
        )
    
    async def translate_text(
        self,
        text: str,
        target_lang: str,
        source_lang: str = "auto",
        model: str = "mistralai/mistral-7b-instruct:free"
    ) -> Optional[str]:
        """
        Traduction de texte
        
        Args:
            text: Texte à traduire
            target_lang: Langue cible
            source_lang: Langue source (auto-détection si "auto")
            model: Modèle à utiliser
        """
        if source_lang == "auto":
            system_message = f"Traduis le texte suivant en {target_lang}. Détecte automatiquement la langue source."
        else:
            system_message = f"Traduis le texte suivant de {source_lang} vers {target_lang}."
        
        system_message += " Réponds uniquement avec la traduction, sans commentaires."
        
        return await self.simple_completion(
            prompt=text,
            model=model,
            system_message=system_message,
            max_tokens=len(text.split()) * 2  # Approximation pour la longueur
        )
    
    async def analyze_emotion(
        self,
        text: str,
        model: str = "mistralai/mistral-7b-instruct:free"
    ) -> Optional[Dict[str, Any]]:
        """
        Analyse des émotions dans un texte
        
        Args:
            text: Texte à analyser
            model: Modèle à utiliser
        """
        system_message = """Analyse les émotions dans le texte suivant.
        Réponds avec un JSON contenant:
        - emotion_principale: l'émotion dominante
        - intensite: score de 0 à 1
        - emotions_secondaires: liste des autres émotions détectées
        - conseils_pedagogiques: suggestions pour l'enseignant
        
        Émotions possibles: joie, tristesse, colère, peur, surprise, dégoût, confiance, anticipation."""
        
        response = await self.simple_completion(
            prompt=text,
            model=model,
            system_message=system_message,
            max_tokens=300
        )
        
        if response:
            try:
                # Extraire le JSON de la réponse
                start = response.find('{')
                end = response.rfind('}') + 1
                if start != -1 and end != 0:
                    json_str = response[start:end]
                    return json.loads(json_str)
            except json.JSONDecodeError:
                logger.warning("Impossible de parser la réponse JSON pour l'analyse émotionnelle")
        
        # Réponse de fallback
        return {
            "emotion_principale": "neutre",
            "intensite": 0.5,
            "emotions_secondaires": [],
            "conseils_pedagogiques": "Continuez l'interaction normalement."
        }
    
    async def close(self):
        """Fermer la session HTTP"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def __aenter__(self):
        """Support du context manager"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Nettoyage automatique"""
        await self.close()


# Fonction utilitaire pour créer un client
def create_openrouter_client(api_key: str, base_url: str = "https://openrouter.ai/api/v1") -> OpenRouterClient:
    """Créer une instance du client OpenRouter"""
    return OpenRouterClient(api_key=api_key, base_url=base_url)


# Tests et exemples d'utilisation
async def test_openrouter_client():
    """Fonction de test pour le client OpenRouter"""
    import os
    
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ OPENROUTER_API_KEY non trouvée dans les variables d'environnement")
        return
    
    async with OpenRouterClient(api_key) as client:
        print("🔍 Test du client OpenRouter...")
        
        # Test 1: Lister les modèles
        print("\n1. Récupération des modèles gratuits...")
        free_models = await client.get_free_models()
        print(f"   Modèles gratuits trouvés: {len(free_models)}")
        for model in free_models[:3]:  # Afficher les 3 premiers
            print(f"   - {model.get('id', 'N/A')}")
        
        # Test 2: Complétion simple
        print("\n2. Test de complétion simple...")
        response = await client.simple_completion(
            prompt="Explique-moi les fractions en mathématiques de manière simple.",
            model="mistralai/mistral-7b-instruct:free"
        )
        if response:
            print(f"   Réponse: {response[:100]}...")
        
        # Test 3: Réponse éducative
        print("\n3. Test de réponse éducative...")
        edu_response = await client.educational_response(
            question="Comment fonctionnent les volcans ?",
            subject="sciences",
            level="collège"
        )
        if edu_response:
            print(f"   Réponse éducative: {edu_response[:100]}...")
        
        # Test 4: Analyse d'émotion
        print("\n4. Test d'analyse émotionnelle...")
        emotion_analysis = await client.analyze_emotion(
            "Je suis vraiment frustré par ces exercices de mathématiques, ils sont trop difficiles !"
        )
        if emotion_analysis:
            print(f"   Émotion détectée: {emotion_analysis.get('emotion_principale', 'N/A')}")
        
        print("\n✅ Tests terminés !")


if __name__ == "__main__":
    asyncio.run(test_openrouter_client())
