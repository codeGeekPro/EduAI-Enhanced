"""
🎓 EduAI Enhanced - Configuration Principale
Configuration pour l'API FastAPI avec tous les services IA
"""

import os
from typing import List, Optional
from pydantic import validator
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configuration principale de l'application"""
    
    # 🌐 Configuration de base
    app_name: str = "EduAI Enhanced"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True
    
    # 🌍 Configuration API
    api_host: str = "127.0.0.1"  # Bind local par défaut pour la sécurité
    api_port: int = 8000
    api_prefix: str = "/api"
    
    # 🔒 Sécurité
    secret_key: str = "eduai-enhanced-super-secret-key-change-in-production"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7
    
    # 🌐 CORS pour PWA
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "https://eduai-enhanced.com",
        "https://app.eduai-enhanced.com"
    ]
    
    trusted_hosts: List[str] = ["localhost", "127.0.0.1", "eduai-enhanced.com"]
    
    # 🗄️ Base de données
    mongodb_url: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "eduai_enhanced"
    redis_url: str = "redis://localhost:6379"
    
    # 🤖 Configuration OpenAI
    openai_api_key: Optional[str] = None
    openai_model: str = "gpt-4"
    openai_whisper_model: str = "whisper-1"
    openai_max_tokens: int = 2000
    openai_temperature: float = 0.7
    
    # 🎭 Configuration Anthropic (Claude)
    anthropic_api_key: Optional[str] = None
    
    # 🗣️ Configuration ElevenLabs (TTS)
    elevenlabs_api_key: Optional[str] = None
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"  # Rachel (anglais)
    
    # 🔍 Configuration Pinecone (Vector DB)
    pinecone_api_key: Optional[str] = None
    pinecone_environment: str = "us-west1-gcp"
    pinecone_index_name: str = "eduai-enhanced"
    
    # 🤗 Configuration Hugging Face
    hf_api_key: Optional[str] = None
    hf_model_cache_dir: str = "./models/cache"
    
    # 🔀 Configuration OpenRouter
    openrouter_api_key: Optional[str] = None
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    openrouter_model: str = "mistralai/mistral-7b-instruct:free"
    
    # 🌐 Configuration Google Cloud (Translation)
    google_credentials_path: Optional[str] = None
    google_project_id: Optional[str] = None
    
    # 📊 Configuration Analytics
    enable_analytics: bool = True
    analytics_db: str = "analytics"
    
    # 📱 Configuration PWA
    pwa_cache_duration: int = 3600  # 1 heure
    offline_support: bool = True
    
    # 🚀 Configuration Performance
    max_request_size: int = 50 * 1024 * 1024  # 50MB
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # 60 secondes
    
    # 📁 Chemins
    static_files_dir: str = "app/static"
    upload_dir: str = "uploads"
    temp_dir: str = "temp"
    
    # 🎵 Configuration Audio
    max_audio_duration: int = 300  # 5 minutes max
    supported_audio_formats: List[str] = ["wav", "mp3", "m4a", "ogg"]
    
    # 🖼️ Configuration Images
    max_image_size: int = 10 * 1024 * 1024  # 10MB
    supported_image_formats: List[str] = ["jpg", "jpeg", "png", "webp"]
    
    # 📚 Configuration éducative
    supported_subjects: List[str] = [
        "mathematics", "science", "history", "literature", 
        "geography", "physics", "chemistry", "biology"
    ]
    
    # 🌍 Configuration multilingue (50+ langues)
    supported_languages: List[str] = [
        # Langues principales
        "en", "fr", "es", "pt", "de", "it", "ru", "zh", "ja", "ko",
        # Langues africaines (priorité)
        "wo", "sw", "ha", "yo", "ig", "zu", "xh", "af", "am", "tw",
        # Langues des minorités
        "nv", "chr", "lkt", "iu", "qu", "gn", "hy", "ka", "eu", "cy"
    ]
    
    default_language: str = "fr"
    
    @validator("cors_origins", pre=True)
    def assemble_cors_origins(cls, v) -> List[str]:
        if v is None or v == "" or v == "[]":
            # Valeur par défaut si vide
            return [
                "http://localhost:3000",
                "http://localhost:3001", 
                "http://127.0.0.1:3000"
            ]
        if isinstance(v, str) and not v.startswith("["):
            # Format: "url1,url2,url3"
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        elif isinstance(v, str) and v.startswith("[") and len(v.strip()) > 2:
            # Essayer de parser le JSON seulement si ce n'est pas vide
            try:
                import json
                return json.loads(v)
            except json.JSONDecodeError:
                # Si le parsing échoue, traiter comme une string simple
                return [v]
        return [str(v)] if v else [
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3000"
        ]
    
    @validator("openai_api_key", "anthropic_api_key", "elevenlabs_api_key", "pinecone_api_key", "openrouter_api_key")
    def validate_api_keys(cls, v):
        if not v:
            print(f"⚠️  Clé API manquante - certaines fonctionnalités seront limitées")
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


class DevelopmentSettings(Settings):
    """Configuration pour l'environnement de développement"""
    environment: str = "development"
    debug: bool = True
    
    # Base de données locale
    mongodb_url: str = "mongodb://localhost:27017"
    redis_url: str = "redis://localhost:6379"


class ProductionSettings(Settings):
    """Configuration pour l'environnement de production"""
    environment: str = "production" 
    debug: bool = False
    
    # Sécurité renforcée
    cors_origins: List[str] = [
        "https://eduai-enhanced.com",
        "https://app.eduai-enhanced.com"
    ]
    
    # Performance optimisée
    rate_limit_requests: int = 1000
    pwa_cache_duration: int = 86400  # 24 heures


class TestingSettings(Settings):
    """Configuration pour les tests"""
    environment: str = "testing"
    debug: bool = True
    
    # Base de données de test
    mongodb_db_name: str = "eduai_enhanced_test"
    
    # Désactiver les services externes pour les tests
    enable_analytics: bool = False


@lru_cache()
def get_settings() -> Settings:
    """
    Obtenir les paramètres de configuration selon l'environnement
    Utilise un cache pour éviter de relire les variables à chaque appel
    """
    environment = os.getenv("ENVIRONMENT", "development").lower()
    
    if environment == "production":
        return ProductionSettings()
    elif environment == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()


# Instance globale des paramètres
settings = get_settings()

# Configuration des modèles IA selon l'environnement
AI_MODELS_CONFIG = {
    "development": {
        "text_generation": "gpt-3.5-turbo",
        "openrouter_model": "mistralai/mistral-7b-instruct:free",
        "speech_to_text": "whisper-1",
        "text_to_speech": "elevenlabs",
        "emotion_detection": "cardiffnlp/twitter-roberta-base-emotion",
        "translation": "Helsinki-NLP/opus-mt-{src}-{tgt}"
    },
    "production": {
        "text_generation": "gpt-4",
        "openrouter_model": "meta-llama/llama-3.1-8b-instruct:free",
        "speech_to_text": "whisper-1", 
        "text_to_speech": "elevenlabs",
        "emotion_detection": "j-hartmann/emotion-english-distilroberta-base",
        "translation": "facebook/mbart-large-50-many-to-many-mmt"
    }
}

# Configuration des langues par région
LANGUAGE_REGIONS = {
    "africa": ["wo", "sw", "ha", "yo", "ig", "zu", "xh", "af", "am", "tw"],
    "americas": ["en", "es", "pt", "fr", "nv", "chr", "lkt", "iu", "qu", "gn"],
    "europe": ["en", "fr", "de", "it", "es", "pt", "ru", "hy", "ka", "eu", "cy"],
    "asia": ["zh", "ja", "ko", "hi", "ar", "th", "vi", "id", "ms"]
}

# Messages système pour les différentes langues
SYSTEM_MESSAGES = {
    "fr": "Tu es un tuteur IA bienveillant et patient, spécialisé dans l'éducation adaptative.",
    "en": "You are a kind and patient AI tutor, specialized in adaptive education.",
    "es": "Eres un tutor de IA amable y paciente, especializado en educación adaptativa.",
    "wo": "Dangay jàng ci kaaw ak si ànd, ak yàgg ci jàngale yu am solo.",  # Wolof
    "sw": "Wewe ni mwalimu wa AI mwema na mvumilivu, unayejua elimu inayobadilika.",  # Swahili
}

print(f"🎓 Configuration EduAI Enhanced chargée:")
print(f"   Environment: {settings.environment}")
print(f"   Debug: {settings.debug}")
print(f"   API: {settings.api_host}:{settings.api_port}")
print(f"   Langues supportées: {len(settings.supported_languages)}")
print(f"   PWA: {'✅ Activé' if settings.offline_support else '❌ Désactivé'}")
