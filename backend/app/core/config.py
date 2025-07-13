"""
🎓 EduAI Enhanced - Configuration Principale
Configuration pour l'API FastAPI avec tous les services IA
"""

import os
from typing import List, Optional
from pydantic import BaseSettings, validator, Field
from functools import lru_cache


class Settings(BaseSettings):
    """Configuration principale de l'application"""
    
    # 🌐 Configuration de base
    app_name: str = "EduAI Enhanced"
    app_version: str = "1.0.0"
    environment: str = Field(default="development", env="ENVIRONMENT")
    debug: bool = Field(default=False, env="DEBUG")
    
    # 🌍 Configuration API
    api_host: str = Field(default="127.0.0.1", env="API_HOST")
    api_port: int = Field(default=8000, env="API_PORT")
    api_prefix: str = "/api"
    
    # 🔒 Sécurité - OBLIGATOIRE via variables d'environnement
    secret_key: str = Field(..., env="SECRET_KEY", min_length=32)
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_days: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")
    
    # 🌐 CORS pour PWA - Configuré selon l'environnement
    cors_origins: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:3001", 
            "http://127.0.0.1:3000"
        ],
        env="CORS_ORIGINS"
    )
    
    trusted_hosts: List[str] = Field(
        default=["localhost", "127.0.0.1"],
        env="TRUSTED_HOSTS"
    )
    
    # 🗄️ Base de données - Sécurisé
    mongodb_url: str = Field(..., env="MONGODB_URL")
    mongodb_db_name: str = Field(default="eduai_enhanced", env="MONGODB_DB_NAME")
    redis_url: str = Field(..., env="REDIS_URL")
    
    # 🤖 Configuration APIs - Toutes obligatoires
    openai_api_key: str = Field(..., env="OPENAI_API_KEY")
    openai_model: str = Field(default="gpt-4", env="OPENAI_MODEL")
    anthropic_api_key: str = Field(..., env="ANTHROPIC_API_KEY")
    elevenlabs_api_key: str = Field(..., env="ELEVENLABS_API_KEY")
    
    @validator('cors_origins', pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
    
    @validator('trusted_hosts', pre=True)
    def parse_trusted_hosts(cls, v):
        """Parse trusted hosts from string or list"""
        if isinstance(v, str):
            return [host.strip() for host in v.split(',')]
        return v
    
    @validator('environment')
    def validate_environment(cls, v):
        """Validate environment value"""
        allowed = ['development', 'staging', 'production']
        if v not in allowed:
            raise ValueError(f'Environment must be one of {allowed}')
        return v
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.environment == "production"
    
    @property
    def database_config(self) -> dict:
        """Database configuration for production optimization"""
        config = {
            "maxPoolSize": 20 if self.is_production else 10,
            "minPoolSize": 5 if self.is_production else 2,
            "maxIdleTimeMS": 30000,
            "serverSelectionTimeoutMS": 5000,
            "retryWrites": True
        }
        return config
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


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
