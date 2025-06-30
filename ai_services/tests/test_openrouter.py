"""
Tests pour le client OpenRouter d'EduAI Enhanced
Tests unitaires et d'intégration pour l'API OpenRouter
"""

import pytest
import asyncio
import os
from unittest.mock import Mock, patch, AsyncMock
import json

# Import des modules à tester
from ai_services.nlp.openrouter_client import (
    OpenRouterClient, 
    OpenRouterResponse, 
    OpenRouterMessage,
    create_openrouter_client
)


class TestOpenRouterClient:
    """Tests pour le client OpenRouter"""
    
    @pytest.fixture
    def mock_api_key(self):
        """Clé API factice pour les tests"""
        return "sk-or-v1-test-key-12345"
    
    @pytest.fixture
    def client(self, mock_api_key):
        """Instance client pour les tests"""
        return OpenRouterClient(api_key=mock_api_key)
    
    @pytest.fixture
    def mock_models_response(self):
        """Réponse factice pour la liste des modèles"""
        return {
            "data": [
                {
                    "id": "mistralai/mistral-7b-instruct:free",
                    "name": "Mistral 7B Instruct (Free)",
                    "pricing": {
                        "prompt": "0",
                        "completion": "0"
                    },
                    "context_length": 8192
                },
                {
                    "id": "meta-llama/llama-3.1-8b-instruct:free",
                    "name": "Llama 3.1 8B Instruct (Free)",
                    "pricing": {
                        "prompt": "0",
                        "completion": "0"
                    },
                    "context_length": 128000
                },
                {
                    "id": "openai/gpt-3.5-turbo",
                    "name": "GPT-3.5 Turbo",
                    "pricing": {
                        "prompt": "0.001",
                        "completion": "0.002"
                    },
                    "context_length": 4096
                }
            ]
        }
    
    @pytest.fixture
    def mock_completion_response(self):
        """Réponse factice pour la complétion"""
        return {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Les fractions représentent des parties d'un tout. Par exemple, 1/2 signifie la moitié de quelque chose."
                    }
                }
            ],
            "usage": {
                "prompt_tokens": 20,
                "completion_tokens": 30,
                "total_tokens": 50
            }
        }
    
    def test_client_initialization(self, mock_api_key):
        """Test de l'initialisation du client"""
        client = OpenRouterClient(api_key=mock_api_key)
        
        assert client.api_key == mock_api_key
        assert client.base_url == "https://openrouter.ai/api/v1"
        assert client.session is None
        assert "mistral-7b" in client.FREE_MODELS
    
    def test_create_client_function(self, mock_api_key):
        """Test de la fonction utilitaire de création"""
        client = create_openrouter_client(mock_api_key)
        
        assert isinstance(client, OpenRouterClient)
        assert client.api_key == mock_api_key
    
    @pytest.mark.asyncio
    async def test_get_session(self, client):
        """Test de la création de session HTTP"""
        session = await client._get_session()
        
        assert session is not None
        assert "Authorization" in session.headers
        assert session.headers["Authorization"] == f"Bearer {client.api_key}"
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    async def test_rate_limiting(self, client):
        """Test du système de limitation de taux"""
        # Simuler beaucoup de requêtes
        for _ in range(65):  # Dépasser la limite
            await client._check_rate_limit()
        
        # Vérifier que le compteur est réinitialisé
        assert client.rate_limit['requests_count'] <= client.rate_limit['requests_per_minute']
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.get')
    async def test_list_models(self, mock_get, client, mock_models_response):
        """Test de la récupération des modèles"""
        # Configuration du mock
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_models_response
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test
        models = await client.list_models()
        
        assert len(models) == 3
        assert models[0]["id"] == "mistralai/mistral-7b-instruct:free"
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.get')
    async def test_get_free_models(self, mock_get, client, mock_models_response):
        """Test de la récupération des modèles gratuits uniquement"""
        # Configuration du mock
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_models_response
        mock_get.return_value.__aenter__.return_value = mock_response
        
        # Test
        free_models = await client.get_free_models()
        
        # Seuls les 2 premiers modèles sont gratuits
        assert len(free_models) == 2
        assert all("free" in model["id"] for model in free_models)
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_chat_completion(self, mock_post, client, mock_completion_response):
        """Test de la complétion de chat"""
        # Configuration du mock
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_completion_response
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        messages = [
            OpenRouterMessage("system", "Tu es un tuteur en mathématiques"),
            OpenRouterMessage("user", "Explique-moi les fractions")
        ]
        
        result = await client.chat_completion(messages)
        
        assert isinstance(result, OpenRouterResponse)
        assert "fractions" in result.text.lower()
        assert result.tokens_used == 50
        assert result.model == "mistralai/mistral-7b-instruct:free"
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_simple_completion(self, mock_post, client, mock_completion_response):
        """Test de la complétion simple"""
        # Configuration du mock
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_completion_response
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        result = await client.simple_completion("Explique-moi les fractions")
        
        assert isinstance(result, str)
        assert "fractions" in result.lower()
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_educational_response(self, mock_post, client, mock_completion_response):
        """Test de la réponse éducative"""
        # Configuration du mock
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_completion_response
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        result = await client.educational_response(
            question="Comment fonctionnent les volcans ?",
            subject="sciences",
            level="collège",
            language="fr"
        )
        
        assert isinstance(result, str)
        assert len(result) > 0
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_translate_text(self, mock_post, client):
        """Test de la traduction"""
        # Mock pour la traduction
        mock_translation_response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "Hello, how are you?"
                    }
                }
            ],
            "usage": {"total_tokens": 10}
        }
        
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_translation_response
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        result = await client.translate_text(
            text="Bonjour, comment allez-vous ?",
            target_lang="anglais",
            source_lang="français"
        )
        
        assert isinstance(result, str)
        assert "hello" in result.lower()
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_analyze_emotion(self, mock_post, client):
        """Test de l'analyse d'émotion"""
        # Mock pour l'analyse d'émotion
        mock_emotion_response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": '{"emotion_principale": "frustration", "intensite": 0.8, "emotions_secondaires": ["colère"], "conseils_pedagogiques": "Proposer une aide supplémentaire"}'
                    }
                }
            ],
            "usage": {"total_tokens": 25}
        }
        
        mock_response = AsyncMock()
        mock_response.status = 200
        mock_response.json.return_value = mock_emotion_response
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        result = await client.analyze_emotion(
            "Je suis vraiment frustré par ces exercices de mathématiques !"
        )
        
        assert isinstance(result, dict)
        assert "emotion_principale" in result
        assert result["emotion_principale"] == "frustration"
        assert result["intensite"] == 0.8
        
        # Nettoyage
        await client.close()
    
    @pytest.mark.asyncio
    async def test_context_manager(self, mock_api_key):
        """Test du context manager"""
        async with OpenRouterClient(api_key=mock_api_key) as client:
            assert client.api_key == mock_api_key
        
        # Le client devrait être fermé automatiquement
        assert client.session is None or client.session.closed
    
    @pytest.mark.asyncio
    @patch('aiohttp.ClientSession.post')
    async def test_error_handling(self, mock_post, client):
        """Test de la gestion d'erreurs"""
        # Simuler une erreur HTTP
        mock_response = AsyncMock()
        mock_response.status = 401
        mock_response.text.return_value = "Unauthorized"
        mock_post.return_value.__aenter__.return_value = mock_response
        
        # Test
        result = await client.simple_completion("Test")
        
        assert result is None
        
        # Nettoyage
        await client.close()


class TestOpenRouterIntegration:
    """Tests d'intégration avec OpenRouter (nécessitent une vraie clé API)"""
    
    @pytest.mark.skipif(
        not os.getenv("OPENROUTER_API_KEY"),
        reason="OPENROUTER_API_KEY non définie"
    )
    @pytest.mark.asyncio
    async def test_real_api_call(self):
        """Test avec la vraie API OpenRouter"""
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key is None:
            pytest.skip("OPENROUTER_API_KEY non définie")
        
        async with OpenRouterClient(api_key=api_key) as client:
            # Test simple
            response = await client.simple_completion(
                prompt="Dis bonjour en français",
                max_tokens=50
            )
            
            assert response is not None
            assert len(response) > 0
            assert "bonjour" in response.lower() or "salut" in response.lower()
    
    @pytest.mark.skipif(
        not os.getenv("OPENROUTER_API_KEY"),
        reason="OPENROUTER_API_KEY non définie"
    )
    @pytest.mark.asyncio
    async def test_real_educational_response(self):
        api_key = os.getenv("OPENROUTER_API_KEY")
        if api_key is None:
            pytest.skip("OPENROUTER_API_KEY non définie")
        
        async with OpenRouterClient(api_key=api_key) as client:
            response = await client.educational_response(
                question="Qu'est-ce qu'une fonction en mathématiques ?",
                subject="mathématiques",
                level="lycée",
                language="fr"
            )
            
            assert response is not None
            assert len(response) > 50  # Réponse substantielle
            assert "fonction" in response.lower()


class TestOpenRouterModels:
    """Tests pour les modèles et structures de données"""
    
    def test_openrouter_response_creation(self):
        """Test de création d'une réponse OpenRouter"""
        response = OpenRouterResponse(
            text="Exemple de réponse",
            model="mistralai/mistral-7b-instruct:free",
            tokens_used=25,
            cost=0.0
        )
        
        assert response.text == "Exemple de réponse"
        assert response.model == "mistralai/mistral-7b-instruct:free"
        assert response.tokens_used == 25
        assert response.cost == 0.0
    
    def test_openrouter_message_creation(self):
        """Test de création d'un message OpenRouter"""
        message = OpenRouterMessage(
            role="user",
            content="Comment ça va ?"
        )
        
        assert message.role == "user"
        assert message.content == "Comment ça va ?"
    
    def test_free_models_list(self):
        """Test de la liste des modèles gratuits"""
        client = OpenRouterClient(api_key="test")
        
        assert "mistral-7b" in client.FREE_MODELS
        assert "llama-3.1-8b" in client.FREE_MODELS
        assert "phi-3-mini" in client.FREE_MODELS
        assert "gemma-7b" in client.FREE_MODELS
        
        # Vérifier que tous sont marqués comme ":free"
        for model_key, model_id in client.FREE_MODELS.items():
            assert ":free" in model_id


# Fonction utilitaire pour exécuter tous les tests
def run_openrouter_tests():
    """Exécuter tous les tests OpenRouter"""
    import subprocess
    import sys
    
    try:
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            __file__, 
            "-v", 
            "--tb=short"
        ], capture_output=True, text=True)
        
        print("📊 RÉSULTATS DES TESTS OPENROUTER")
        print("=" * 50)
        print(result.stdout)
        
        if result.stderr:
            print("\n⚠️ AVERTISSEMENTS/ERREURS:")
            print(result.stderr)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Erreur lors de l'exécution des tests: {e}")
        return False


if __name__ == "__main__":
    # Exécution directe du fichier de test
    success = run_openrouter_tests()
    exit(0 if success else 1)
